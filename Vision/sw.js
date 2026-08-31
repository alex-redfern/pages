/* EVS Vision 2035 · IBC deck — offline shell cache.
   Bump CACHE when you publish new content, or the tablet keeps serving the old deck. */
var CACHE = 'evs-vision2035-ibc-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') { return; }
  var url = new URL(e.request.url);

  /* Same-origin: cache first, so the deck opens with no signal at all. */
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        return hit || fetch(e.request).then(function (resp) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          return resp;
        }).catch(function () {
          return caches.match('./index.html');
        })
      })
    );
    return;
  }

  /* Cross-origin (the web font): network, and simply do without it offline.
     The page falls back to the system UI font, which on iPad is San Francisco. */
  e.respondWith(fetch(e.request).catch(function () { return new Response('', { status: 504 }); }));
});
