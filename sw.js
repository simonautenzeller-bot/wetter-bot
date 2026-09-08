// Wetter Straubing — Service Worker
// WICHTIG: CACHE-Version bei jedem Release hochzählen, synchron mit APP_VERSION in index.html
const CACHE = "wetter-bot-v13";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon192.png",
  "./icon512.png",
  "./appletouchicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Netzwerk zuerst für Live-Daten (API-Aufrufe laufen eh direkt gegen externe Hosts,
// hier geht es nur um die eigenen App-Dateien), Cache als Fallback fürs Offline-Öffnen.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // externe API-Calls unangetastet lassen

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
