/* Posto – service worker. Plik generowany przez scripts/generate-sw.mjs, nie edytuj out/sw.js ręcznie. */
/* eslint-disable */
const VERSION = __VERSION__;
const BASE = __BASE__;
const PRECACHE = __PRECACHE__;
const CACHE = 'posto-' + VERSION;
const MATCH = { ignoreSearch: true, ignoreVary: true };

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // cache: 'reload' – omijamy cache HTTP, żeby nie zapisać starej wersji pliku
      await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith('posto-') && key !== CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

/** /posto-pwa/history → /posto-pwa/history/ (trailingSlash: true) */
function navigationKey(url) {
  let path = url.pathname;
  if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) path += '/';
  return path;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !(url.pathname + '/').startsWith(BASE + '/')) return;

  if (request.mode === 'navigate') {
    // Powłoka aplikacji z precache – działa bez sieci; nowa wersja przychodzi z aktualizacją SW.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(navigationKey(url), MATCH);
        if (cached) return cached;
        try {
          return await fetch(request);
        } catch {
          return (
            (await cache.match(BASE + '/404.html', MATCH)) || (await cache.match(BASE + '/', MATCH)) || Response.error()
          );
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request, MATCH);
      if (cached) return cached;
      return fetch(request);
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || BASE + '/';
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    })(),
  );
});
