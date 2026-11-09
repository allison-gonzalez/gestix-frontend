// Service worker de Gestix: deja abrir la interfaz sin internet después de una primera visita.
// Solo guarda archivos propios de la app. Las llamadas a la API van siempre a la red.

// Nombre de la caché. Al cambiarlo en una versión nueva, la anterior se borra en "activate".
const CACHE = 'gestix-shell-v7';

// App Shell mínimo: HTML principal, manifiesto y logotipo (íconos).
const BASE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

// INSTALL: abre la caché y pre-cachea el App Shell.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(BASE);

    // Los archivos JS y CSS de la app tienen nombre con hash (/assets/index-abc123.js),
    // así que se leen del index.html para guardarlos desde la primera visita.
    try {
      const res = await fetch('/index.html', { cache: 'no-store' });
      const html = await res.text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
      await cache.addAll(assets);
    } catch (err) {
      // sin red durante la instalación: se completa en las siguientes visitas
    }
    await self.skipWaiting();
  })());
});

// ACTIVATE: borra las cachés de versiones anteriores y toma el control de las páginas abiertas.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

// SYNC (Background Sync): el navegador lo dispara al recuperar la conexión, aunque la
// pestaña haya estado en segundo plano. Los tickets pendientes están en localStorage, al que
// el service worker no tiene acceso, así que avisa a las páginas abiertas para que los envíen.
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tickets') {
    event.waitUntil((async () => {
      const paginas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      paginas.forEach((pagina) => pagina.postMessage({ tipo: 'sync-tickets' }));
    })());
  }
});

// FETCH: intercepta las peticiones y aplica una estrategia según su tipo.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API, sockets y otros sitios: siempre red

  // Network First: al navegar, primero la red. Sin internet se entrega la app guardada (SPA).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html', { ignoreVary: true }))
    );
    return;
  }

  // Cache First: archivos estáticos, primero lo guardado y se actualiza en segundo plano.
  // ignoreVary evita fallos cuando el servidor responde con "Vary: Origin" y la petición trae otro Origin.
  event.respondWith(
    caches.match(req, { ignoreVary: true }).then((cached) => {
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
