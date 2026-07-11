const CACHE_NAME = 'varshamitra-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        // Fallback offline handler for Emergency API route
        if (e.request.url.includes('/api/emergency')) {
          return new Response(
            JSON.stringify({
              nationalEmergency: '112',
              ambulance: '108',
              districtDisasterControl: '1077',
              ndma: '1078',
              waterWaterlogging: '1916',
              electricity: '1912',
              police: '100',
              fire: '101'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
      });
    })
  );
});
