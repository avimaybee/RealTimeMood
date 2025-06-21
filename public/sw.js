
const CACHE_NAME = 'realtime-mood-cache-v1';
const urlsToCache = [
  '/',
  '/globals.css',
  '/history',
  '/thoughts'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache initial assets:', err);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If we get a valid response, we put it in the cache.
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(err => {
        // This will be triggered if the network is unavailable.
        console.warn('Fetch failed; returning offline page instead.', err);
        return cachedResponse; // Return cached response if network fails
      });

      // Return the cached response immediately if it's available, 
      // and update the cache in the background.
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
