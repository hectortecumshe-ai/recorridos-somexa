// Guarda la guía en el teléfono para usarla sin internet.
const CACHE = "somexa-2026-ruta-1-d1a2bbfa01";
const RECURSOS = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "recorrido-somexa-2026.html", "vendor/logo_somexa_original.jpg", "vendor/OrbitControls.js", "vendor/three.min.js", "vendor/fuentes/Archivo-latin-79dc5e.woff2", "vendor/fuentes/Archivo-latin-ext-20ba07.woff2", "vendor/fuentes/BricolageGrotesque-latin-a97232.woff2", "vendor/fuentes/BricolageGrotesque-latin-ext-a4fe79.woff2", "vendor/fuentes/fuentes.css"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(RECURSOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("somexa-2026-ruta-1-") && k !== CACHE)
    .map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Primero la red (para recibir actualizaciones); sin señal, lo guardado.
  e.respondWith(fetch(e.request).then((r) => {
    const copia = r.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copia));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })
    .then((r) => r || (e.request.mode === "navigate" ? caches.match("index.html") : undefined))));
});
