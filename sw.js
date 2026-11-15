// medbasha - Service Worker BusTalk_v 2.9.42
const CACHE_NAME = 'bustalk-v2-9-42-b';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-152.png',
  './icon-192.png',
  './icon-512.png'
];

// 1. INSTALACIÓN: Guarda los archivos base en caché y fuerza la activación inmediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Elimina cualquier caché de versiones anteriores para evitar conflictos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPTOR DE RED: Sirve archivos locales rápido y deja pasar libre el tráfico de Firebase
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // No cachear peticiones en tiempo real de Firebase ni APIs externas
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
