
const CACHE_NAME_STATIC = 'static-v2'; // Increment version to force update
const CACHE_NAME_DYNAMIC = 'dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/about',
  '/history',
  '/calendar',
  '/thoughts',
  '/rules',
];

// --- Caching Logic ---

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      console.log('[SW] Precaching App Shell...');
      // Use addAll to cache core app routes. Non-critical assets will be cached on demand.
      return cache.addAll(STATIC_ASSETS).catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME_STATIC && key !== CACHE_NAME_DYNAMIC) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Don't cache non-GET requests or Firestore traffic (it has its own offline handling)
  if (request.method !== 'GET' || request.url.includes('firestore.googleapis.com')) {
    return;
  }

  // Strategy: Cache-first for most assets.
  // This is fast and good for offline.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return from cache if found
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from network
      return fetch(request).then((networkResponse) => {
        // Clone the response because it's a stream and can only be consumed once.
        const responseToCache = networkResponse.clone();
        
        // Cache the new response for future use.
        caches.open(CACHE_NAME_DYNAMIC).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return networkResponse;
      }).catch(err => {
        // If network fails and it's a navigation request, serve the offline page.
        if (request.mode === 'navigate') {
            return caches.match('/');
        }
      });
    })
  );
});


// --- Push Notification Logic ---

self.addEventListener('push', event => {
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (e) {
    console.error('Push event error:', e);
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
