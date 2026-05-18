const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "mobile-www");
const assetsOut = path.join(outDir, "assets");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(assetsOut, { recursive: true });

let html = fs.readFileSync(path.join(root, "fitness-plan-app.html"), "utf8");
html = html.replace(/<script>[\s\S]*?<\/script>/, match => match);
html = html.replace(/<title>.*?<\/title>/, "<title>ReBourne</title>");

fs.writeFileSync(path.join(outDir, "index.html"), html);
fs.cpSync(path.join(root, "assets"), assetsOut, { recursive: true });
fs.copyFileSync(path.join(root, "manifest.webmanifest"), path.join(outDir, "manifest.webmanifest"));
fs.copyFileSync(path.join(root, "sw.js"), path.join(outDir, "sw.js"));

console.log("Prepared mobile bundle in mobile-www");
