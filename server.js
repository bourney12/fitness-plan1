const http = require("http");
const https = require("https");
const fs   = require("fs");
const path = require("path");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT    = process.env.PORT || 3000;

console.log("Server starting...");
console.log("API_KEY present:", !!API_KEY);
console.log("API_KEY length:", API_KEY ? API_KEY.length : 0);

function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end(filename + " not found"); return; }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

function proxyToAnthropic(body, res) {
  if (!API_KEY) {
    console.error("ERROR: ANTHROPIC_API_KEY is not set!");
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Server configuration error: API key not set" } }));
    return;
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
    console.log("Proxying request, model:", parsedBody.model, "max_tokens:", parsedBody.max_tokens);
  } catch(e) {
    console.error("Invalid JSON body:", e.message);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Invalid JSON" } }));
    return;
  }

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
  };

  const req = https.request(options, (upstream) => {
    let data = "";
    upstream.on("data", chunk => { data += chunk; });
    upstream.on("end", () => {
      console.log("Anthropic status:", upstream.statusCode, "response preview:", data.slice(0, 200));
      res.writeHead(upstream.statusCode, { "Content-Type": "application/json" });
      res.end(data);
    });
  });

  req.on("error", (err) => {
    console.error("HTTPS request error:", err.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Proxy error: " + err.message } }));
  });

  req.write(body);
  req.end();
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    return serveFile(res, "fitness-plan-app.html", "text/html");
  }

  if (req.method === "GET" && req.url === "/coach") {
    return serveFile(res, "coach.html", "text/html");
  }

  if (req.method === "POST" && req.url === "/api/message") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => proxyToAnthropic(body, res));
    return;
  }

  console.log("404 for:", req.method, req.url);
  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("ReBourne server running on port " + PORT);
});
