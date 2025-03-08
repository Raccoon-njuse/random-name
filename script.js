let studentsData = {
    '802': [],
    '804': []
};

// 加载CSV文件
async function loadCSV(className) {
    const response = await fetch(`./${className}.csv`);
    const csvText = await response.text();
    return new Promise(resolve => {
        Papa.parse(csvText, {
            complete: (results) => {
                const students = results.data
                    .filter(row => row.length >= 3) // 确保行有足够的列
                    .map(row => ({
                        name: row[0],
                        number: parseInt(row[1]),
                        weight: parseFloat(row[2])
                    }));
                resolve(students);
            }
        });
    });
}

// 初始化加载两个班级的数据
async function initializeData() {
    try {
        studentsData['802'] = await loadCSV('802');
        studentsData['804'] = await loadCSV('804');
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载学生数据失败，请确保CSV文件存在且格式正确');
    }
}

// 权重随机抽取
function weightedRandom(students, count) {
    const selected = new Set();
    const result = [];
    
    // 计算权重总和
    const totalWeight = students.reduce((sum, student) => sum + student.weight, 0);
    
    while (result.length < count && result.length < students.length) {
        let random = Math.random() * totalWeight;
        let sum = 0;
        
        for (let student of students) {
            sum += student.weight;
            if (random <= sum && !selected.has(student.name)) {
                result.push(student.name);
                selected.add(student.name);
                break;
            }
        }
    }
    
    return result;
}

// 抽取名字
function drawNames() {
    const classSelect = document.getElementById('classSelect');
    const count = parseInt(document.getElementById('count').value);
    const resultDiv = document.getElementById('result');
    
    const selectedClass = classSelect.value;
    const students = studentsData[selectedClass];
    
    if (!students || students.length === 0) {
        resultDiv.innerHTML = '没有找到学生数据';
        return;
    }
    
    if (count > students.length) {
        alert(`${selectedClass}班只有${students.length}名学生`);
        return;
    }
    
    const selectedNames = weightedRandom(students, count);
    resultDiv.innerHTML = selectedNames.join('、');
}

// 页面加载时初始化数据
window.onload = initializeData;

// 注册 Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}