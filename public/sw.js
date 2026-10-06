// Service worker de Gestix: deja abrir la interfaz sin internet despuÃ©s de una primera visita.
// Solo guarda archivos propios de la app. Las llamadas a la API van siempre a la red.

const CACHE = 'gestix-shell-v4';
const BASE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(BASE);

    // Los archivos de la app tienen nombre con hash (/assets/index-abc123.js),
    // asÃ­ que se leen del index.html para guardarlos desde la primera visita.
    try {
      const res = await fetch('/index.html', { cache: 'no-store' });
      const html = await res.text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
      await cache.addAll(assets);
    } catch (err) {
      // sin red durante la instalaciÃ³n: se completa en las siguientes visitas
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API, sockets y otros sitios: siempre red

  // Al navegar: primero la red; sin internet se entrega la app guardada (SPA).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Archivos estÃ¡ticos: primero lo guardado, y se actualiza en segundo plano.
  event.respondWith(
    caches.match(req).then((cached) => {
      const red = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || red;
    })
  );
});
