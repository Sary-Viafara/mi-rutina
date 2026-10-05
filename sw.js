/* ── Service Worker · Mi Rutina · Sary ── */
const CACHE  = 'mi-rutina-v2'; // Cambiamos la versión a v2 para forzar la actualización del caché
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        fetch(e.request)
          .then(r => { if (r && r.status === 200) caches.open(CACHE).then(c => c.put(e.request, r)); })
          .catch(() => {});
        return cached;
      }
      return fetch(e.request).then(r => {
        if (!r || r.status !== 200 || r.type === 'opaque') return r;
        caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

