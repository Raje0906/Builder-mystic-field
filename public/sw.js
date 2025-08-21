const CACHE_NAME = "laptop-store-crm-v2";
const urlsToCache = [
  "/",
  "/manifest.json",
  // Add more static assets as needed
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-API requests
  if (request.method !== 'GET' || !url.pathname.startsWith('/api/')) {
    return; // Let the browser handle the request normally
  }

  event.respondWith(
    (async () => {
      // Try to fetch from network first
      try {
        const networkResponse = await fetch(request);
        
        // Only cache successful responses (status 200-299)
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.log('[Service Worker] Network request failed, trying cache', error);
        // If network fails, try to get from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache, return a proper error response
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 408,
          statusText: 'Network request failed',
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })()
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
