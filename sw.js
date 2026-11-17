/* Service worker : rend l'appli utilisable hors ligne.
   Stratégie « réseau d'abord » : en ligne, on récupère toujours la dernière version
   (tes nouvelles questions apparaissent tout de suite) ; hors ligne, on sert la copie en cache. */
const CACHE = "prepa-cfd-v3";
const FILES = [
  "./",
  "index.html",
  "questions.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    // no-cache : on revalide auprès de GitHub à chaque ouverture (sinon le cache HTTP garde l'ancienne version ~10 min)
    fetch(e.request, sameOrigin ? { cache: "no-cache" } : undefined)
      .then(res => {
        if (res.ok && sameOrigin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
