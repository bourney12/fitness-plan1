const http = require("http");
const fs   = require("fs");
const path = require("path");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT    = process.env.PORT || 5173;
const MAX_BODY_BYTES = 1024 * 1024;

function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(filename + " not found");
      return;
    }
    const type = contentType.startsWith("image/") || contentType === "application/octet-stream"
      ? contentType
      : contentType + "; charset=utf-8";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function serveAsset(res, assetPath) {
  const cleanPath = path.normalize(assetPath).replace(/^(\.\.[\/\\])+/, "");
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

  if (req.method === "GET" && (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html")) {
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
