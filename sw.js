/* Pagine Marroni — service worker.
   Guscio in cache-first, mappe e API in network-first. */
const CACHE = 'pagine-marroni-1.0';  // cambia questo numero a ogni nuova versione dell'app
const GUSCIO = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png',
  './locandina.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(GUSCIO.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.tipo === 'salta') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // tessere della mappa: rete, con cache di riserva
  if (/tile|basemaps|nominatim/.test(url.hostname)) {
    e.respondWith(
      fetch(req).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // manifest e icone: sempre dalla rete quando c'è, altrimenti il telefono
  // continua a mostrare nome e logo di una versione precedente
  if (/manifest\.json|icon-|favicon|apple-touch|locandina/.test(url.pathname)) {
    e.respondWith(
      fetch(req).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // la pagina: prima la rete, così un nuovo deploy si vede subito; la cache è la riserva offline
  if (req.mode === 'navigate' || (req.destination === 'document')) {
    e.respondWith(
      fetch(req).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copia));
        return r;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok && url.origin === location.origin) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});
