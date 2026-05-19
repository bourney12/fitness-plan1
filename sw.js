const CACHE_NAME = "rebourne-shell-v11";
const FEATURE_SCRIPT = '<script src="/assets/feature-upgrades.js?v=4"></script><script src="/assets/progress-analytics.js?v=1"></script><script src="/assets/readiness-habits.js?v=1"></script>';
const THEME_HEAD = '<link rel="stylesheet" href="/assets/rebourne-premium-theme.css?v=3">';
const PROGRESS_SCRIPT = '<script src="/assets/progress-analytics.js?v=1"></script>';
const READINESS_SCRIPT = '<script src="/assets/readiness-habits.js?v=1"></script>';
const STATIC_ASSETS = [
  "/assets/rebourne-logo-transparent.png?v=11",
  "/assets/icons/icon.svg?v=11",
  "/manifest.webmanifest?v=11",
  "/assets/rebourne-premium-theme.css?v=3",
  "/assets/feature-upgrades.js?v=4",
  "/assets/progress-analytics.js?v=1",
  "/assets/readiness-habits.js?v=1"
];

function withFeatureUpgrades(html) {
  if (!html.includes("rebourne-premium-theme.css")) html = html.replace("</head>", THEME_HEAD + "</head>");
  if (html.includes("/assets/readiness-habits.js")) return html;
  if (html.includes("/assets/progress-analytics.js")) return html.replace("</body>", READINESS_SCRIPT + "</body>");
  if (html.includes("/assets/feature-upgrades.js")) return html.replace("</body>", PROGRESS_SCRIPT + READINESS_SCRIPT + "</body>");
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
