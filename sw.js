const CACHE = 'find-a-book-v31';
const ASSETS = ['./', './index.html', './style.css?v=28', './app.js?v=28', './manifest.webmanifest', './icon.png', './assets/xuan-paper.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => { if (event.request.method === 'GET' && new URL(event.request.url).origin === location.origin) event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request))); });
