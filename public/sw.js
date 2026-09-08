// Service Worker para PWA com actualização contínua e sem bloqueio de cache
const CACHE_NAME = 'flight-panel-v16';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Rotas de API e pacotes Next.js (_next) são sempre obtidos em tempo real directamente da rede
  if (event.request.url.includes('/api/') || event.request.url.includes('/_next/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Navegação de páginas (HTML): Network-First para garantir que o utilizador recebe o código mais recente
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .then((response) => response || caches.match('/painel'))
    );
    return;
  }

  // Demais recursos estáticos (ícones, manifest, áudios): Cache com fallback de rede
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

