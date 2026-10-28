// Les Fioles du Marais hors ligne.
// En ligne : on prend toujours la version la plus récente du site (et on la garde en cache).
// Hors ligne (ou réseau trop lent) : on sert la copie en cache.
// FILES = fichiers préchargés à la première visite ; tout fichier ouvert en ligne est de toute façon gardé.
const VERSION = 'fioles-1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'manifest-en.webmanifest',
  'icons/icon-192.svg',
  'couverture.svg',
  'commun/ks-back.js',
  'js/main.js',
  'js/canvas.js',
  'js/input.js',
  'js/i18n.js',
  'js/lang/fr.js',
  'js/lang/en.js',
  'js/save.js',
  'js/hasard.js',
  'js/ingredients.js',
  'js/marais.js',
  'js/lumiere.js',
  'js/dessin.js',
  'js/barque.js',
  'js/pave.js',
  'js/cueillette.js',
  'js/titre.js',
  'js/bilan.js',
];
const TIMEOUT = 4000;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.all(
      FILES.map((f) => c.add(new Request(f, { cache: 'reload' })).catch(() => {}))
    )).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fioles-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromCache(req) {
  return caches.open(VERSION).then((c) => c.match(req, { ignoreSearch: true })
    .then((r) => r || (req.mode === 'navigate' ? c.match('index.html') : undefined)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  e.respondWith(new Promise((resolve) => {
    let done = false;
    const fallback = () => fromCache(req).then((r) => {
      if (!done && r) { done = true; resolve(r); }
      return r;
    });
    const timer = setTimeout(fallback, TIMEOUT);
    fetch(req).then((res) => {
      clearTimeout(timer);
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        const key = new URL(req.url);
        key.search = '';
        caches.open(VERSION).then((c) => c.put(key.href, copy));
      }
      if (!done) { done = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      fallback().then((r) => {
        if (!done) { done = true; resolve(r || new Response('', { status: 504, statusText: 'hors ligne' })); }
      });
    });
  }));
});
