// Prosty serwer statyczny dla out/ z obsługą ścieżki bazowej (jak GitHub Pages). Używany przez E2E.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const PORT = Number(process.env.PORT || 4173);
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
const ROOT = path.resolve('out');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function send(res, status, file, headers = {}) {
  const ext = path.extname(file);
  res.writeHead(status, { 'Content-Type': TYPES[ext] || 'application/octet-stream', ...headers });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (BASE) {
      if (pathname === BASE) {
        res.writeHead(301, { Location: `${BASE}/` });
        return res.end();
      }
      if (!pathname.startsWith(`${BASE}/`)) return send(res, 404, path.join(ROOT, '404.html'));
      pathname = pathname.slice(BASE.length);
    }
    let file = path.join(ROOT, pathname);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end();
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${BASE}${pathname}/${url.search}` });
        return res.end();
      }
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      if (fs.existsSync(`${file}.html`)) file = `${file}.html`;
      else return send(res, 404, path.join(ROOT, '404.html'));
    }
    const immutable = pathname.startsWith('/_next/static/');
    send(res, 200, file, { 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' });
  })
  .listen(PORT, () => console.log(`Posto: http://localhost:${PORT}${BASE}/`));
