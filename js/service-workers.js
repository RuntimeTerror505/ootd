const CACHE_NAME = `ootd v1`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(["/", "javascript/api_requests.js", "javascript/api_links.js", "javascript/camera.js", "javascript/feed.js", "javascript/leaderboard.js", "/styles/style.css", "/styles/reset.css", "/fonts/fonts.css", "/javascript/api.js"]);
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));

      self.skipWaiting();
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Get the resource from the cache.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);

          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // The network failed.
        }
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// service-worker.js
self.addEventListener('push', function (event) {
  const options = {
    body: event.data.text(),
    icon: '../assets/majestic.png'
  };

  event.waitUntil(
    self.registration.showNotification('Заголовок сповіщення', options)
  );
});

