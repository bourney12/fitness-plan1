const http = require("http");
const fs   = require("fs");
const path = require("path");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT    = process.env.PORT || 5173;
const MAX_BODY_BYTES = 1024 * 1024;
const DEPLOY_VERSION = process.env.RENDER_GIT_COMMIT || "local";

const PWA_HEAD = `
<meta name="description" content="Personalised fitness, nutrition and progress planning.">
<meta name="theme-color" content="#05080F">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="ReBourne">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="/manifest.webmanifest?v=12">
<link rel="apple-touch-icon" href="/assets/icons/icon.svg?v=12">
<link rel="icon" type="image/svg+xml" href="/assets/icons/icon.svg?v=12">
`;

const PWA_SCRIPT = `
<script>
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('/sw.js?v=12').then(function(reg){ return reg.update(); }).catch(function(){});
  });
}
</script>
`;

const FEATURE_SCRIPT = `
<script src="/assets/feature-upgrades.js?v=4"></script>
<script src="/assets/progress-analytics.js?v=1"></script>
<script src="/assets/readiness-habits-v2.js?v=12"></script>
`;

const THEME_HEAD = `
<link rel="stylesheet" href="/assets/rebourne-premium-theme.css?v=3">
`;

const RESET_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Refreshing ReBourne</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#05080F;color:#F0F4FF;font-family:Arial,sans-serif;text-align:center}p{color:#8EA6C8}</style>
</head><body><main><h1>Refreshing ReBourne</h1><p>Clearing the old app shell...</p></main>
<script>
(async function(){
  try{
    if('serviceWorker' in navigator){
      var regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(function(reg){return reg.unregister();}));
    }
    if(window.caches){
      var keys=await caches.keys();
      await Promise.all(keys.map(function(key){return caches.delete(key);}));
    }
  }catch(e){}
  location.replace('/?v=12&fresh=1');
})();
</script></body></html>`;

const FRONT_PREVIEW_SCRIPT = `
<script>
window.__REB_FRONT_PREVIEW = true;
(function(){
  function forceFront(){
    try{
      step = -2;
      allWeeks = [];
      calc = null;
      loading = false;
      apiErr = null;
      generatingWeek = 0;
      if (typeof render === 'function') render();
    }catch(e){}
  }
  forceFront();
  setTimeout(forceFront, 80);
  setTimeout(forceFront, 300);
})();
</script>
`;

const R_PATH = "M138 112h205c63 0 105 38 105 96 0 47-27 82-73 95l92 137h-88l-82-126h-34v126h-87V162h-38v-50Zm125 64v80h77c29 0 47-15 47-40 0-24-18-40-47-40h-77ZM138 112l113 126h-32L110 112h28Z";

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#05080F"/><defs><linearGradient id="g" x1="90" y1="70" x2="420" y2="440" gradientUnits="userSpaceOnUse"><stop stop-color="#7E98BC"/><stop offset="0.48" stop-color="#3A5F96"/><stop offset="1" stop-color="#162A46"/></linearGradient></defs><path fill="url(#g)" d="${R_PATH}"/><text x="256" y="482" fill="#F0F4FF" font-family="Arial, sans-serif" font-size="36" letter-spacing="14" text-anchor="middle">REBOURNE</text></svg>`;

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 560" role="img" aria-label="ReBourne"><defs><linearGradient id="rb" x1="280" y1="70" x2="690" y2="420" gradientUnits="userSpaceOnUse"><stop stop-color="#86A2CF"/><stop offset="0.46" stop-color="#456AA3"/><stop offset="1" stop-color="#162A46"/></linearGradient><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#3A5F96" flood-opacity=".22"/></filter></defs><g filter="url(#soft)"><g transform="translate(260 58) scale(.88)"><path fill="url(#rb)" d="${R_PATH}"/></g><text x="490" y="414" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="76" font-weight="300" letter-spacing="44" fill="#EEF4FF">REBOURNE</text><g fill="#86A2CF"><rect x="108" y="484" width="142" height="3" rx="1.5"/><rect x="730" y="484" width="142" height="3" rx="1.5"/></g><text x="490" y="496" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="23" font-weight="600" letter-spacing="20" fill="#F5F7FF">REINVENT YOUR POTENTIAL</text></g></svg>`;

function injectPwa(html) {
  let output = html;
  if (!output.includes("manifest.webmanifest")) output = output.replace("</head>", PWA_HEAD + "</head>");
  if (!output.includes("rebourne-premium-theme.css")) output = output.replace("</head>", THEME_HEAD + "</head>");
  output = output
    .replace(/<link rel="manifest" href="[^"]+">/g, '<link rel="manifest" href="/manifest.webmanifest?v=12">')
    .replace(/<link rel="apple-touch-icon" href="[^"]+">/g, '<link rel="apple-touch-icon" href="/assets/icons/icon.svg?v=12">')
    .replace(/<link rel="icon"[^>]+href="[^"]+">/g, '<link rel="icon" type="image/svg+xml" href="/assets/icons/icon.svg?v=12">')
    .replace(/navigator\.serviceWorker\.register\(['"](?:\.\/)?sw\.js(?:\?v=\d+)?['"]\)/g, "navigator.serviceWorker.register('/sw.js?v=12')")
    .replace(/navigator\.serviceWorker\.register\(['"]\/sw\.js(?:\?v=\d+)?['"]\)/g, "navigator.serviceWorker.register('/sw.js?v=12')")
    .replace(/assets\/rebourne-logo-transparent\.png(?:\?v=\d+)?/g, 'assets/rebourne-logo-transparent.png?v=12')
    .replace(/assets\/rebourne-logo\.png(?:\?v=\d+)?/g, 'assets/rebourne-logo.png?v=12');
  if (!output.includes("serviceWorker.register")) output = output.replace("</body>", PWA_SCRIPT + "</body>");
  if (!output.includes("/assets/feature-upgrades.js")) output = output.replace("</body>", FEATURE_SCRIPT + "</body>");
  return output;
}

function applyFrontendPolish(html) {
  let output = html;
  const splashTimeline = [
    "'<div class=\"splash-timeline\">'",
    "'<div class=\"splash-timeline-item\"><span class=\"timeline-dot\"></span><strong>Training</strong><em>Strength, running and hybrid sessions.</em></div>'",
    "'<div class=\"splash-timeline-line\" aria-hidden=\"true\"></div>'",
    "'<div class=\"splash-timeline-item\"><span class=\"timeline-dot\"></span><strong>Nutrition</strong><em>Calories, macros, meals and shopping.</em></div>'",
    "'<div class=\"splash-timeline-line\" aria-hidden=\"true\"></div>'",
    "'<div class=\"splash-timeline-item\"><span class=\"timeline-dot\"></span><strong>Progress</strong><em>Readiness, overload and analytics.</em></div>'",
    "'</div>'",
  ].join(",\n          ");

  output = output
    .replace("{k:'Profile',t:'Who are we building around?'", "{k:'Profile',t:'Who are we building this around?'")
    .replace(/\s+\+'<p>'\+meta\.d\+'<\/p>'\r?\n\s+\+guidedProgress/g, "\n      +guidedProgress")
    .replace(
      /'<div class="splash-signal-row">',\s*'<div class="splash-signal"><span>[^<]*<\/span><strong>Training<\/strong><em>Strength, running and hybrid sessions\.<\/em><\/div>',\s*'<div class="splash-signal"><span>[^<]*<\/span><strong>Nutrition<\/strong><em>Calories, macros, meals and shopping\.<\/em><\/div>',\s*'<div class="splash-signal"><span>[^<]*<\/span><strong>Progress<\/strong><em>Readiness, overload and analytics\.<\/em><\/div>',\s*'<\/div>'/g,
      splashTimeline
    )
    .replace(
      "+'<div class=\"assessment-side-content\">'\n          +'<div><div class=\"assessment-side-title\">Why this matters</div><p>'+meta.d+'</p></div>'\n          +'<div class=\"confidence-cue\">'+meta.cue+'</div>'\n          +'<div class=\"assessment-side-mini\"><strong>'+Math.max(1,step+1)+'/5</strong><span>Structured inputs before plan generation</span></div>'\n        +'</div>'",
      "+'<div class=\"assessment-insight-grid\">'\n          +'<div class=\"assessment-insight-card insight-main\"><span>Context</span><strong>Why this matters</strong><p>'+meta.d+'</p></div>'\n          +'<div class=\"assessment-insight-card\"><span>Engine logic</span><p>'+meta.cue+'</p></div>'\n          +'<div class=\"assessment-insight-card insight-progress\"><span>Progress</span><strong>'+Math.max(1,step+1)+'/5</strong><p>Structured inputs before plan generation</p></div>'\n        +'</div>'"
    );
  return output;
}

function hardenDownloadHtmlStrings(html) {
  return html
    .replace("+'</head><body><div class=\"page\">'", "+'</he'+'ad><bo'+'dy><div class=\"page\">'")
    .replace("+'</body></html>';", "+'</bo'+'dy></ht'+'ml>'; ");
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  };
}

function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...noStoreHeaders() });
      res.end(filename + " not found");
      return;
    }
    let body = content;
    if (filename === "fitness-plan-app.html") {
      body = Buffer.from(injectPwa(applyFrontendPolish(hardenDownloadHtmlStrings(content.toString("utf8")))));
    }
    const type = contentType.startsWith("image/") || contentType === "application/octet-stream"
      ? contentType
      : contentType + "; charset=utf-8";
    const headers = {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
    };
    if (filename === "fitness-plan-app.html" || filename === "sw.js" || filename === "manifest.webmanifest") {
      Object.assign(headers, noStoreHeaders());
    }
    res.writeHead(200, headers);
    res.end(body);
  });
}

function serveFrontPreview(res) {
  const filePath = path.join(__dirname, "fitness-plan-app.html");
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...noStoreHeaders() });
      res.end("fitness-plan-app.html not found");
      return;
    }
    let html = injectPwa(applyFrontendPolish(hardenDownloadHtmlStrings(content.toString("utf8"))));
    html = html.replace("</body>", FRONT_PREVIEW_SCRIPT + "</body>");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...noStoreHeaders(),
    });
    res.end(html);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...noStoreHeaders() });
  res.end(JSON.stringify(payload));
}

function serveAsset(res, assetPath) {
  const cleanPath = path.normalize(assetPath).replace(/^(\.\.[\/\\])+/, "");
  if (cleanPath === "assets/icons/icon.svg") {
    res.writeHead(200, { "Content-Type": "image/svg+xml; charset=utf-8", "X-Content-Type-Options": "nosniff", ...noStoreHeaders() });
    res.end(ICON_SVG);
    return;
  }
  const filePath = path.join(__dirname, cleanPath);
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".js": "application/javascript",
    ".css": "text/css",
  };
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...noStoreHeaders() });
      res.end("Asset not found");
      return;
    }
    const cacheHeaders = ext === ".js" || ext === ".css" ? noStoreHeaders() : {};
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream", "X-Content-Type-Options": "nosniff", ...cacheHeaders });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-api-key");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html" || reqUrl.pathname === "/fitness-plan-app.html" || reqUrl.pathname === "/app")) {
    return serveFile(res, "fitness-plan-app.html", "text/html");
  }

  if (req.method === "GET" && reqUrl.pathname === "/demo") {
    reqUrl.searchParams.set("demo", "1");
    res.writeHead(302, { Location: `/${reqUrl.search}` });
    res.end();
    return;
  }

  if (req.method === "GET" && reqUrl.pathname === "/front-preview") {
    return serveFrontPreview(res);
  }

  if (req.method === "GET" && reqUrl.pathname === "/reset-app") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", ...noStoreHeaders() });
    res.end(RESET_HTML);
    return;
  }

  if (req.method === "GET" && reqUrl.pathname === "/coach") {
    return serveFile(res, "coach.html", "text/html");
  }

  if (req.method === "GET" && reqUrl.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && reqUrl.pathname === "/version") {
    return sendJson(res, 200, { ok: true, version: DEPLOY_VERSION });
  }

  if (req.method === "GET" && reqUrl.pathname === "/manifest.webmanifest") {
    return serveFile(res, "manifest.webmanifest", "application/manifest+json");
  }

  if (req.method === "GET" && reqUrl.pathname === "/sw.js") {
    return serveFile(res, "sw.js", "application/javascript");
  }

  if (req.method === "GET" && reqUrl.pathname.startsWith("/assets/")) {
    return serveAsset(res, reqUrl.pathname.slice(1));
  }

  if (req.method === "POST" && reqUrl.pathname === "/api/message") {
    const requestApiKey = req.headers["x-client-api-key"] || API_KEY;
    if (!requestApiKey) {
      return sendJson(res, 500, {
        error: { message: "Server is missing ANTHROPIC_API_KEY. Add it before generating plans." },
      });
    }

    let body = "";
    let bodyBytes = 0;
    let tooLarge = false;
    req.on("data", chunk => {
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_BODY_BYTES) {
        tooLarge = true;
        sendJson(res, 413, { error: { message: "Request body is too large." } });
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", async () => {
      if (tooLarge) return;
      try {
        JSON.parse(body);
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": requestApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: body,
        });
        const data = await upstream.json().catch(() => ({
          error: { message: "Anthropic returned a non-JSON response." },
        }));
        sendJson(res, upstream.status, data);
      } catch (err) {
        const isBadJson = err instanceof SyntaxError;
        sendJson(res, isBadJson ? 400 : 500, { error: { message: err.message } });
      }
    });
    req.on("error", () => {
      if (!res.headersSent) sendJson(res, 413, { error: { message: "Request body is too large." } });
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...noStoreHeaders() });
  res.end("Not found");
});

function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    if (server.listening) {
      resolve(server);
      return;
    }
    server.once("error", reject);
    server.listen(port, () => {
      server.removeListener("error", reject);
      console.log("ReBourne server running on port " + port);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { server, startServer, PORT };
