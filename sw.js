const CACHE_NAME = 'av-pro-rt2025-v1';
const urlsToCache = ['./','./index.html','./manifest.json','https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.map(key => key!== CACHE_NAME && caches.delete(key))))));
