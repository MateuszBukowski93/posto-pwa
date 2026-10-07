// Generuje out/sw.js z listą wszystkich plików statycznego eksportu do precache.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
const SKIP = [/^sw\.js$/, /\.map$/, /(^|\/)\.nojekyll$/, /(^|\/)\.DS_Store$/];

function walk(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walk(path.join(dir, entry.name), rel) : [rel];
  });
}

function toUrl(rel) {
  let urlPath = rel;
  if (urlPath === 'index.html') urlPath = '';
  else if (urlPath.endsWith('/index.html')) urlPath = urlPath.slice(0, -'index.html'.length);
  return encodeURI(`${BASE}/${urlPath}`);
}

if (!fs.existsSync(OUT)) {
  console.error('Brak katalogu out/ – uruchom najpierw `next build`.');
  process.exit(1);
}

const files = walk(OUT)
  .filter((rel) => !SKIP.some((re) => re.test(rel)))
  .sort();
let bytes = 0;
const entries = files.map((rel) => {
  const content = fs.readFileSync(path.join(OUT, rel));
  bytes += content.length;
  return { url: toUrl(rel), hash: createHash('sha256').update(content).digest('hex').slice(0, 16) };
});
const version = createHash('sha256')
  .update(entries.map((e) => `${e.url}:${e.hash}`).join('|'))
  .digest('hex')
  .slice(0, 12);

const template = fs.readFileSync(path.resolve('scripts/sw-template.js'), 'utf8');
const sw = template
  .replace('__VERSION__', JSON.stringify(version))
  .replace('__BASE__', JSON.stringify(BASE))
  .replace('__PRECACHE__', JSON.stringify(entries.map((e) => e.url)));
fs.writeFileSync(path.join(OUT, 'sw.js'), sw);
console.log(
  `sw.js: ${entries.length} plików w precache (${Math.round(bytes / 1024)} KB), wersja ${version}, base "${BASE || '/'}"`,
);
