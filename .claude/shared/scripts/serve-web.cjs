// (executor) Static SPA server for a built web export — Node built-ins only, zero deps.
// The deterministic way to serve a *production* web build for ui-shot.mjs: a static export
// renders the same bytes every time, unlike a framework dev server (HMR, lazy chunks, cache
// quirks) that makes the after-screenshot flaky. Pair it with ui-shot.mjs for UI render proof.
//
// Usage: node .claude/shared/scripts/serve-web.cjs <dist-dir> [port]
//   <dist-dir>  the built export to serve (e.g. apps/web/dist) — set per project
//   [port]      default 5173
// SPA fallback: any path that isn't a real file serves index.html (client-side routing).
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || 5173);
const types = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

http
  .createServer((req, res) => {
    const p = decodeURIComponent(req.url.split('?')[0]);
    let f = path.join(root, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, 'index.html');
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  })
  .listen(port, () => console.log(`web on http://localhost:${port} (root ${root})`));
