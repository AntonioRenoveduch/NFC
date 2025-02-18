const CACHE_NAME = 'area-profesional-cache-v1';  // Nombre del cache
const urlsToCache = [
    '/',
    '/index.html',  // Tu página principal
    '/manifest.json', // Manifesto
    '/icons/icon-192x192.png',  // Icono de la app
    '/icons/icon-512x512.png',  // Icono grande
    '/style.css', // Estilos CSS (si tienes)
    '/script.js'  // Scripts JavaScript (si tienes)
];

// Instalar el Service Worker y cachear archivos
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    // Pre-caché de los recursos
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar el Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        // Eliminar caches antiguos
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Responder a las peticiones de red usando cache
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si la respuesta está en el cache, devolverla
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no está en el cache, hacer la petición de red
                return fetch(event.request).then((response) => {
                    // Si la respuesta no es válida, devolverla tal cual
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Cachear las respuestas de la red
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});
