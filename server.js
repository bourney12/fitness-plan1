const http = require("http");
const fs   = require("fs");
const path = require("path");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT    = process.env.PORT || 3000;

function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end(filename + " not found"); return; }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Main app
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    return serveFile(res, "fitness-plan-app.html", "text/html");
  }

  // Coach dashboard
  if (req.method === "GET" && req.url === "/coach") {
    return serveFile(res, "coach.html", "text/html");
  }

  // Anthropic API proxy
  if (req.method === "POST" && req.url === "/api/message") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: body,
        });
        const data = await upstream.json();
        res.writeHead(upstream.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: err.message } }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("ReBourne server running on port " + PORT);
});
