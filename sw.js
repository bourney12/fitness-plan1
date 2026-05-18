const CACHE_NAME = "rebourne-shell-v5";
const FEATURE_SCRIPT = '<script src="/assets/feature-upgrades.js?v=2"></script>';
const STATIC_ASSETS = [
  "/assets/icons/icon.svg?v=8",
  "/manifest.webmanifest?v=8",
  "/assets/feature-upgrades.js?v=2"
];

function withFeatureUpgrades(html) {
  if (html.includes("/assets/feature-upgrades.js")) return html;
  return html.replace("</body>", FEATURE_SCRIPT + "</body>");
}

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => response.text().then(html => new Response(withFeatureUpgrades(html), {
          status: response.status,
          statusText: response.statusText,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        })))
        .catch(() => caches.match("/fitness-plan-app.html").then(cached => cached || Response.error()))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
