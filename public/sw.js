/**
 * DigiKaveri Service Worker (PWA Offline Engine)
 * Version: digikaveri-v9
 * 
 * Strategy:
 * - HTML / Navigations: Network-First with Offline Cache Fallback
 * - Same-Origin Assets (CSS, JS, Images, Fonts): Stale-While-Revalidate / Cache-First
 * - External APIs (Supabase, Nominatim, OSRM, Web3Forms): Direct Network Bypass
 */

const CACHE_NAME = 'digikaveri-v9';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/etayhteys.html',
  '/tietosuoja.html',
  '/kayttoehdot.html',
  '/404.html',
  '/en/',
  '/en/index.html',
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

// Install: pre-cache assets with resilient Promise.allSettled
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Pre-cache skipped asset:', url, err.message);
          })
        )
      );
    })
  );
});

// Activate: clean up outdated legacy caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: intercept same-origin requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass non-http(s) schemes (e.g. chrome-extension://, moz-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Bypass connectivity check pings
  if (url.searchParams.has('_ping')) return;

  // Bypass all external APIs (Supabase, Web3Forms, OpenStreetMap, Google Analytics)
  if (url.origin !== self.location.origin) return;

  // Bypass local development and Vite internal module requests
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.pathname.startsWith('/@') || url.pathname.includes('node_modules')) return;

  // 1. Navigation / Document requests: Network-First with Offline Fallback
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // 1. Try matching exact requested page in cache
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;

          // 2. Fallback to English or Finnish homepages if offline
          if (url.pathname.startsWith('/en')) {
            const enFallback = await caches.match('/en/index.html') || await caches.match('/en/');
            if (enFallback) return enFallback;
          }

          const fiFallback = await caches.match('/index.html') || await caches.match('/');
          if (fiFallback) return fiFallback;

          return caches.match('/404.html');
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Images, Fonts): Cache-First with Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to update cache (Stale-While-Revalidate pattern)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Graceful offline fallback
          return caches.match(event.request);
        });
    })
  );
});
