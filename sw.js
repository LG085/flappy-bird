// Service worker: deixa o jogo funcionar offline e se atualizar sozinho.
// - Página (index.html): busca primeiro na internet, então a versão nova já vale na primeira abertura.
//   Sem internet (ou se a rede demorar), usa a cópia salva.
// - Demais arquivos (ícones, manifesto): responde do cache e atualiza em segundo plano.
const CACHE = 'flappy-bird-v3';
const NETWORK_TIMEOUT_MS = 4000;
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  // Salva cada arquivo separadamente: se um faltar no servidor, os outros continuam salvos.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((url) => c.add(new Request(url, { cache: 'no-cache' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function saveCopy(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

function networkFirst(req) {
  return new Promise((resolve) => {
    let settled = false;
    const fallback = () => caches.match(req, { ignoreSearch: true })
      .then((cached) => cached || caches.match('index.html'));

    const timer = setTimeout(() => {
      fallback().then((cached) => { if (cached && !settled) { settled = true; resolve(cached); } });
    }, NETWORK_TIMEOUT_MS);

    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        clearTimeout(timer);
        saveCopy(req, res);
        if (!settled) { settled = true; resolve(res); }
      })
      .catch(() => {
        clearTimeout(timer);
        fallback().then((cached) => { if (!settled) { settled = true; resolve(cached || Response.error()); } });
      });
  });
}

function cacheFirst(req) {
  return caches.match(req, { ignoreSearch: true }).then((cached) => {
    const network = fetch(req).then((res) => saveCopy(req, res)).catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  e.respondWith(isPage ? networkFirst(req) : cacheFirst(req));
});
