// Generuje ikony PWA z jednego projektu SVG (pierścień z łukiem ~72% jak na ekranie powitalnym).
// Uruchom: npm run icons  (wynik jest commitowany, CI go nie potrzebuje)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BG = '#F2F4F1';
const TRACK = '#E3E8E4';
const ACCENT = '#E8673A';

function ringSvg({ rounded, stroke = 52, radius = 150, track = TRACK, accent = ACCENT, bg = BG }) {
  const c = 2 * Math.PI * radius;
  const rect = bg ? `<rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${rect}
  <circle cx="256" cy="256" r="${radius}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
  <circle cx="256" cy="256" r="${radius}" fill="none" stroke="${accent}" stroke-width="${stroke}" stroke-linecap="round"
    stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * 0.28).toFixed(2)}" transform="rotate(-90 256 256)"/>
</svg>
`;
}

async function png(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  return fs.readFileSync(file);
}

/** ICO z osadzonymi PNG (wspierane przez wszystkie współczesne przeglądarki). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const pub = path.resolve('public/icons');
const app = path.resolve('app');
const tmp = path.resolve('.icons-tmp');
fs.mkdirSync(pub, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

const anySvg = ringSvg({ rounded: true });
const fullSvg = ringSvg({ rounded: false });
const faviconSvg = ringSvg({ rounded: true, stroke: 76, radius: 140 });

fs.writeFileSync(path.join(pub, 'icon.svg'), anySvg);
fs.writeFileSync(path.join(app, 'icon.svg'), faviconSvg);
await png(anySvg, 192, path.join(pub, 'icon-192.png'));
await png(anySvg, 512, path.join(pub, 'icon-512.png'));
// maskable: pełne tło, pierścień mieści się w bezpiecznej strefie (promień 40%)
await png(fullSvg, 512, path.join(pub, 'icon-maskable-512.png'));
// apple-touch-icon: bez przezroczystości, iOS sam zaokrągla rogi
await png(fullSvg, 180, path.join(app, 'apple-icon.png'));
// badge powiadomień Androida: tylko kanał alfa
await png(
  ringSvg({ rounded: false, bg: null, track: 'rgba(255,255,255,0.45)', accent: '#FFFFFF', stroke: 64 }),
  72,
  path.join(pub, 'badge-72.png'),
);

const favicons = [];
for (const size of [16, 32, 48]) {
  favicons.push({ size, data: await png(faviconSvg, size, path.join(tmp, `f${size}.png`)) });
}
fs.writeFileSync(path.join(app, 'favicon.ico'), ico(favicons));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('Ikony wygenerowane: public/icons/*, app/icon.svg, app/apple-icon.png, app/favicon.ico');
