const http = require("http");
const fs   = require("fs");
const path = require("path");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT    = process.env.PORT || 5173;
const MAX_BODY_BYTES = 1024 * 1024;

const PWA_HEAD = `
<meta name="description" content="Personalised fitness, nutrition and progress planning.">
<meta name="theme-color" content="#05080F">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="ReBourne">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/assets/icons/icon.svg">
<link rel="icon" type="image/svg+xml" href="/assets/icons/icon.svg">
`;

const PWA_SCRIPT = `
<script>
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){
  window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});
}
</script>
`;

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#05080F"/><defs><linearGradient id="g" x1="90" y1="70" x2="420" y2="440" gradientUnits="userSpaceOnUse"><stop stop-color="#7E98BC"/><stop offset="0.48" stop-color="#3A5F96"/><stop offset="1" stop-color="#162A46"/></linearGradient></defs><path fill="url(#g)" d="M138 112h205c63 0 105 38 105 96 0 47-27 82-73 95l92 137h-88l-82-126h-34v126h-87V162h-38v-50Zm125 64v80h77c29 0 47-15 47-40 0-24-18-40-47-40h-77ZM138 112l113 126h-32L110 112h28Z"/><text x="256" y="482" fill="#F0F4FF" font-family="Arial, sans-serif" font-size="36" letter-spacing="14" text-anchor="middle">REBOURNE</text></svg>`;

function injectPwa(html) {
  let output = html;
  if (!output.includes("manifest.webmanifest")) output = output.replace("</head>", PWA_HEAD + "</head>");
  if (!output.includes("serviceWorker.register")) output = output.replace("</body>", PWA_SCRIPT + "</body>");
  return output;
}

function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(filename + " not found");
      return;
    }
    let body = content;
    if (filename === "fitness-plan-app.html") body = Buffer.from(injectPwa(content.toString("utf8")));
    const type = contentType.startsWith("image/") || contentType === "application/octet-stream"
      ? contentType
      : contentType + "; charset=utf-8";
    res.writeHead(200, {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
    });
    res.end(body);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function serveAsset(res, assetPath) {
  const cleanPath = path.normalize(assetPath).replace(/^(\.\.[\/\\])+/, "");
  if (cleanPath === "assets/icons/icon.svg") {
    res.writeHead(200, { "Content-Type": "image/svg+xml; charset=utf-8" });
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
  };
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Asset not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
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

  if (req.method === "GET" && (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html" || reqUrl.pathname === "/fitness-plan-app.html")) {
    return serveFile(res, "fitness-plan-app.html", "text/html");
  }

  if (req.method === "GET" && reqUrl.pathname === "/coach") {
    return serveFile(res, "coach.html", "text/html");
  }

  if (req.method === "GET" && reqUrl.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
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

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
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
