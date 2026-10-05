const CACHE_NAME = 'frosty-loot-deck-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './assets/pwa-icon-192.png',
  './assets/pwa-icon-512.png',
  './assets/fh-one-coin-1361.png',
  './assets/fh-two-coins-1374.png',
  './assets/fh-three-coins-1379.png',
  './assets/fh-lumber-1401.png',
  './assets/fh-metal-1409.png',
  './assets/fh-hide-1393.png',
  './assets/fh-arrowvine-1381.png',
  './assets/fh-axenut-1383.png',
  './assets/fh-corpsecap-1385.png',
  './assets/fh-flamefruit-1387.png',
  './assets/fh-rockroot-1389.png',
  './assets/fh-snowthistle-1391.png',
  './assets/fh-random-item-1417.png',
  './assets/icons/money.svg',
  './assets/icons/lumber.svg',
  './assets/icons/metal.svg',
  './assets/icons/hide.svg',
  './assets/icons/arrowvine.svg',
  './assets/icons/axenut.svg',
  './assets/icons/corpsecap.svg',
  './assets/icons/flamefruit.svg',
  './assets/icons/rockroot.svg',
  './assets/icons/snowthistle.svg',
  './assets/icons/random_item.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return Response.error();
        });
    })
  );
});
