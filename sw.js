// 每日练习 — Service Worker
// 策略:app shell 用 cache-first;离线时直接走缓存,在线时后台更新。
// CACHE_VERSION 与 index.html 的 APP_VERSION 保持一致;发版时一起更新。
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `daily-practice-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './data/pinyin-data.js',
  './data/pinyin-words.js',
  './data/en-words.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
