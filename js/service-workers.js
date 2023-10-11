const CACHE_NAME = `ootd v15`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(["/", "javascript/api_requests.js", "javascript/cookies.js", "javascript/initialization.js", "javascript/camera.js", "javascript/categories.js", "javascript/feed.js", "javascript/leaderboard.js", "/javascript/videos.js", "/styles/style.css", "/styles/reset.css", "/fonts/fonts.css", "/javascript/api.js"]);
      // Remove outdated caches (if any).
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));

      // Activate the new service worker immediately.
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


// self.addEventListener('push', function (event) {
//   console.log(event);
//   const options = {
//     body: event.data.text(),
//     icon: './assets/mahestic.png',
//   };

//   event.waitUntil(
//     self.registration.showNotification('Notification', options)
//   );
// });