/* Atlas des Trésors de France — service worker
 * Stratégie : cache-first sur le shell applicatif, réseau pour le reste.
 * Le service worker n'est actif que via http(s)/localhost (pas en file://). */
const CACHE = "atlas-v2";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./assets/css/styles.css",
  "./assets/icons/icon.svg",
  "./assets/js/core.js", "./assets/js/store.js", "./assets/js/app.js",
  "./assets/js/views/villages.js", "./assets/js/views/others.js", "./assets/js/views/unesco.js",
  "./data/villages.js", "./data/regions.js", "./data/roadtrips.js",
  "./data/gastronomie.js", "./data/panoramas.js", "./data/chateaux.js", "./data/photos.js", "./data/officiel.js", "./data/vpf.js", "./data/unesco.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((res) => {
      const copy = res.clone();
      if (res.ok && request.url.startsWith(self.location.origin)) {
        caches.open(CACHE).then((c) => c.put(request, copy));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
