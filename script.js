let studentsData = {
    '802': [],
    '804': []
};

let currentClass = '802';
let currentNumber = 1;

// 加载CSV文件
async function loadCSV(className) {
    const response = await fetch(`${className}.csv`);
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

// 初始化数字键盘
function initNumberKeyboard() {
    const display = document.getElementById('numberDisplay');
    const keyboard = document.getElementById('numberKeyboard');
    
    display.addEventListener('click', () => {
        keyboard.classList.add('active');
        // 点击其他地方关闭键盘
        document.addEventListener('click', function closeKeyboard(e) {
            if (!keyboard.contains(e.target) && e.target !== display) {
                keyboard.classList.remove('active');
                document.removeEventListener('click', closeKeyboard);
            }
        });
    });

    keyboard.addEventListener('click', (e) => {
        if (e.target.classList.contains('key')) {
            if (e.target.classList.contains('delete')) {
                currentNumber = Math.floor(currentNumber / 10);
                // if (currentNumber === 0) currentNumber = 1;
            } else if (e.target.classList.contains('confirm')) {
                keyboard.classList.remove('active');
            } else {
                const num = e.target.textContent;
                if ((currentNumber === 1 && num !== '0') || currentNumber.toString().length < 2) {
                    if (currentNumber === 1) {
                        currentNumber = parseInt(`${currentNumber}${num}`);
                    } else {
                        currentNumber = parseInt(`${currentNumber}${num}`);
                    }
                } else {
                    return;
                }
            }
            display.textContent = currentNumber;
        }
    });
}

// 初始化班级切换
function initClassButtons() {
    const buttons = document.querySelectorAll('.class-toggle .class-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentClass = btn.dataset.class;
            // 清空结果区域
            document.getElementById('result').innerHTML = '';
        });
    });
}

// 抽取名字
function drawNames() {
    const resultDiv = document.getElementById('result');
    
    const students = studentsData[currentClass];
    
    if (!students || students.length === 0) {
        resultDiv.innerHTML = '没有找到学生数据';
        return;
    }
    
    if (currentNumber > students.length) {
        alert(`${currentClass}班只有${students.length}名学生`);
        return;
    }
    
    const selectedNames = weightedRandom(students, currentNumber);
    resultDiv.innerHTML = '';
    
    // 依次显示每个名字，带延迟效果
    selectedNames.forEach((name, index) => {
        const nameSpan = document.createElement('div');
        nameSpan.className = 'name-item';
        nameSpan.style.animationDelay = `${index * 0.15}s`;
        nameSpan.textContent = name;
        // 随机分配1-8的颜色
        const colorIndex = Math.floor(Math.random() * 8) + 1;
        nameSpan.setAttribute('data-color', colorIndex);
        resultDiv.appendChild(nameSpan);
    });
}

// 页面加载时初始化数据
window.onload = async () => {
    await initializeData();
    initNumberKeyboard();
    initClassButtons();
};

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