// Jednoduchý offline cache pre GitHub Pages (root: /nemecky-jazyk/)
const CACHE_NAME = "nj-pwa-v2";
const BASE = "/nemecky-jazyk/";

const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "icon-192.png",
  BASE + "icon-512.png"
  // (Apple-touch ikona je voliteľná pre cache)
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Network-first pre HTML, cache-first pre ostatné
  if (req.mode === "navigate" || (req.destination === "document")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match(BASE)))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
