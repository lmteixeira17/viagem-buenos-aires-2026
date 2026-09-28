'use strict';
const CACHE_NAME = 'buenos-aires-offline-v1';
// ponytail: cache only the guide and parking pass; email attachments and external maps stay in their apps. A private document vault would require separate, device-local storage.
const PAGE_URLS = ['./', './index.html', './estacionamento.html'].map(path => new URL(path, self.registration.scope).href);
async function cacheTripPages() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PAGE_URLS.map(url => new Request(url, { cache: 'reload' })));
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await cacheTripPages();
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('buenos-aires-offline-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'PREPARE_OFFLINE') return;
  event.waitUntil(cacheTripPages().then(
    () => event.ports[0]?.postMessage({ ok: true }),
    () => event.ports[0]?.postMessage({ ok: false })
  ));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      return await fetch(request);
    } catch {
      return await cache.match(request, { ignoreSearch: true }) || Response.error();
    }
  })());
});
