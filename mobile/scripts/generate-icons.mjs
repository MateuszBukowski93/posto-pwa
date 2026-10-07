// Generuje ikony aplikacji z tego samego projektu co PWA (pierścień z łukiem ~72%).
// Uruchom: npm run icons  (wynik jest commitowany)
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BG = '#F2F4F1';
const BG_DARK = '#0E1311';
const TRACK = '#E3E8E4';
const ACCENT = '#E8673A';

/** Pierścień w układzie 1024×1024; `scale` – średnica względem płótna. */
function ringSvg({ scale = 1, bg = BG, track = TRACK, accent = ACCENT, stroke = 52 }) {
  const radius = 150 * scale;
  const width = stroke * scale;
  const c = 2 * Math.PI * radius;
  const rect = bg ? `<rect width="512" height="512" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${rect}
  <circle cx="256" cy="256" r="${radius}" fill="none" stroke="${track}" stroke-width="${width}"/>
  <circle cx="256" cy="256" r="${radius}" fill="none" stroke="${accent}" stroke-width="${width}" stroke-linecap="round"
    stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * 0.28).toFixed(2)}" transform="rotate(-90 256 256)"/>
</svg>
`;
}

async function png(svg, size, file) {
  await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
}

const out = path.resolve('assets/images');
fs.mkdirSync(out, { recursive: true });

// iOS: pełne tło bez przezroczystości (system sam zaokrągla rogi)
await png(ringSvg({}), 1024, path.join(out, 'icon.png'));
// Android adaptive: pierścień w bezpiecznej strefie (66%), tło z koloru w app.json
await png(ringSvg({ scale: 0.72, bg: null }), 1024, path.join(out, 'android-icon-foreground.png'));
await png(
  ringSvg({ scale: 0.72, bg: null, track: 'rgba(0,0,0,0.35)', accent: '#000000' }),
  1024,
  path.join(out, 'android-icon-monochrome.png'),
);
// splash: sam pierścień na tle z app.json (jasne i ciemne)
await png(ringSvg({ bg: null }), 512, path.join(out, 'splash-icon.png'));
await png(ringSvg({ bg: null, track: '#232C28', accent: '#F0784C' }), 512, path.join(out, 'splash-icon-dark.png'));
// powiadomienia Androida: tylko kanał alfa (biały)
await png(
  ringSvg({ bg: null, track: 'rgba(255,255,255,0.45)', accent: '#FFFFFF', stroke: 64 }),
  96,
  path.join(out, 'notification-icon.png'),
);
console.log(`Ikony wygenerowane w assets/images (tło ${BG}, ciemne ${BG_DARK})`);
