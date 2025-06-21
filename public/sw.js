const CACHE_NAME = "laptop-store-crm-v1";
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  // Skip the service worker entirely for API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  // For all other requests, try the cache first, then network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
