// Guarda los mapas de SOMEXA en el teléfono para usarlos sin internet.
const CACHE = "mapas-somexa-1647e529d9";
const RECURSOS = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(RECURSOS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("mapas-somexa-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
const guardada = (req) => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : undefined));
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (/icono-\d+\.png$/.test(url.pathname)) { e.respondWith(guardada(req).then((r) => r || fetch(req))); return; }
  e.respondWith(new Promise((listo) => {
    let hecho = false;
    const dar = (r) => { if (!hecho && r) { hecho = true; listo(r); } };
    const espera = setTimeout(() => guardada(req).then(dar), 3000);
    fetch(req).then((n) => { clearTimeout(espera); if (n && n.ok) { const c = n.clone(); caches.open(CACHE).then((k) => k.put(req, c)); } dar(n); })
      .catch(() => { clearTimeout(espera); guardada(req).then((r) => { if (!hecho) { hecho = true; listo(r || Response.error()); } }); });
  }));
});
