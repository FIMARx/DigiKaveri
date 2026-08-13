const CACHE_NAME = 'digikaveri-v7';
const ASSETS = [
  '/',
  '/etayhteys.html',
  '/tietosuoja.html',
  '/kayttoehdot.html',
  '/404.html',
  '/en/',
  '/en/remote-support.html',
  '/en/privacy-policy.html',
  '/en/terms-of-service.html',
  '/en/404.html',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
  '/images/logo.webp'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: purging old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // CRITICAL FIX: Only handle same-origin requests in Service Worker!
  // Cross-origin requests (e.g. analytics, APIs, map routing) must NOT be routed through
  // sw.js fetch(), which triggers strict connect-src CSP violations and breaks CORS/opaque loads.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation / HTML requests: Network first, fallback to cache for offline support
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets (same origin): Cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Graceful fallback if offline or network error
          return caches.match(e.request);
        });
    })
  );
});
