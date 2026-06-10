const CACHE_NAME = "fina-pwa-v26-shell-modulos";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./js/app-data.js",
  "./js/app-utils.js",
  "./js/app-storage.js",
  "./js/market-data.js",
  "./js/app-cards.js",
  "./js/app-investments.js",
  "./js/app-portfolio.js",
  "./js/app-education.js",
  "./js/app-backup.js",
  "./js/app-finance.js",
  "./js/app-dashboard.js",
  "./js/app-forms.js",
  "./js/app-navigation.js",
  "./js/app-auth.js",
  "./js/app-events.js",
  "./js/app-pwa.js",
  "./js/app-boot.js",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
