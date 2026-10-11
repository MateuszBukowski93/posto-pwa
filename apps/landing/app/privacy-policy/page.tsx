import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

/**
 * Polityka prywatności pod stałym adresem /privacy-policy/ (podany w Google Play).
 * Jedno źródło treści: apps/pwa/content/legal/pl/privacy.md – czytane przy buildzie.
 */

export const metadata: Metadata = { title: 'Polityka prywatności – Posto' };

/** Placeholdery jak w apps/pwa/lib/config.ts – uzupełnij przed publikacją. */
const placeholders: Record<string, string> = {
  companyName: 'DeveloArt Mateusz Bukowski',
  address: 'ul. Raduńska 40A/3, 80-021 Gdańsk',
  nip: '5833271688',
  email: '[E-MAIL]',
  effectiveDate: '[DATA]',
  analyticsTool: '[NAZWA NARZĘDZIA, np. Vercel Web Analytics]',
  hostingProvider: '[NAZWA HOSTINGU, np. Vercel Inc.]',
  retentionPeriod: '[OKRES]',
};

type Block = { type: 'h1' | 'h2' | 'p'; text: string } | { type: 'ol' | 'ul'; items: string[] };

function loadBlocks(): Block[] {
  const file = path.join(process.cwd(), '..', 'pwa', 'content', 'legal', 'pl', 'privacy.md');
  const source = fs
    .readFileSync(file, 'utf8')
    .replace(/\{\{(\w+)\}\}/g, (match, key: string) => placeholders[key] ?? match);

  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };

  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('<!--')) {
      flush();
      continue;
    }
    const heading = /^(#{1,2})\s+(.*)$/.exec(line);
    const item = /^(?:(\d+\.)|[-*])\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: heading[1] === '#' ? 'h1' : 'h2', text: heading[2] });
    } else if (item) {
      flush();
      const type = item[1] ? 'ol' : 'ul';
      const last = blocks.at(-1);
      if (last && last.type === type) last.items.push(item[2]);
      else blocks.push({ type, items: [item[2]] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

export default function PrivacyPolicyPage() {
  return (
    <main className="wrap legal">
      <p>
        <a href="../">← Posto</a>
      </p>
      {loadBlocks().map((block, i) => {
        switch (block.type) {
          case 'h1':
            return <h1 key={i}>{block.text}</h1>;
          case 'h2':
            return <h2 key={i}>{block.text}</h2>;
          case 'p':
            return <p key={i}>{block.text}</p>;
          case 'ol':
          case 'ul': {
            const List = block.type;
            return (
              <List key={i}>
                {block.items.map((text, j) => (
                  <li key={j}>{text}</li>
                ))}
              </List>
            );
          }
        }
      })}
    </main>
  );
}
