/* دروب — Service worker: يجعل التطبيق يعمل دون اتصال، ويحفظ مربعات الخريطة التي شاهدتها. */
const VERSION = 'duroob-v2.0.0';
const SHELL_CACHE = `${VERSION}-shell`;
const TILE_CACHE = 'duroob-tiles';        // kept across versions so saved maps survive updates
const MAX_TILES = 3000;                    // ≈ 60–90 MB worst case

const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css', './js/core.js', './js/app.js',
  './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css',
  './vendor/leaflet/images/marker-icon.png', './vendor/leaflet/images/marker-shadow.png',
  './fonts/readex-pro-arabic-400-normal.woff2', './fonts/readex-pro-arabic-600-normal.woff2', './fonts/readex-pro-arabic-700-normal.woff2',
  './fonts/readex-pro-latin-400-normal.woff2', './fonts/readex-pro-latin-600-normal.woff2', './fonts/readex-pro-latin-700-normal.woff2',
  './fonts/reem-kufi-arabic-700-normal.woff2', './fonts/reem-kufi-latin-700-normal.woff2',
  './icons/favicon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.endsWith('-shell') && k !== SHELL_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isTile(url) {
  return url.hostname === 'tile.openstreetmap.org' || url.hostname === 'server.arcgisonline.com';
}

async function trimTiles() {
  const cache = await caches.open(TILE_CACHE);
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) {
    await Promise.all(keys.slice(0, keys.length - MAX_TILES).map((k) => cache.delete(k)));
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Map tiles: cache-first so previously viewed areas work in the desert without signal.
  if (isTile(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') {
          cache.put(req, res.clone());
          trimTiles();
        }
        return res;
      } catch (e) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // App files: serve from cache immediately, refresh in the background.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const hit = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (hit) { event.waitUntil(network); return hit; }
      const res = await network;
      return res || (req.mode === 'navigate' ? cache.match('./index.html') : new Response('', { status: 504 }));
    })());
  }
});
