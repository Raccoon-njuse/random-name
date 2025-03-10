const CACHE_NAME = 'point-name-v1';
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './802.csv',
  './804.csv',
  './icon.png',
  './icon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});