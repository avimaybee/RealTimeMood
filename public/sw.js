// This is a basic service worker for Progressive Web App functionality.
// Its presence is sufficient to make the app installable.

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept fetch requests.
  // It allows the browser to handle them, which is the safest default
  // for a Next.js application to avoid caching complexities.
  return;
});
