/**
 * Minimalny parser Markdown dla dokumentów prawnych (nagłówki, akapity, listy).
 * Znaczniki: `<!-- highlight -->` przed `##` wyróżnia sekcję kartą,
 * `<!-- note -->` przed akapitem oznacza notatkę „do uzupełnienia”.
 */

export type LegalBlock = { type: 'p'; text: string; note?: boolean } | { type: 'ol' | 'ul'; items: string[] };

export type LegalSection = { heading: string; highlight: boolean; blocks: LegalBlock[] };

export type LegalDocument = { title: string; meta: string; sections: LegalSection[] };

export function parseLegalMarkdown(source: string): LegalDocument {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const sections: LegalSection[] = [];
  let title = '';
  let meta = '';
  let current: LegalSection | null = null;
  let paragraph: string[] = [];
  let list: { type: 'ol' | 'ul'; items: string[] } | null = null;
  let pendingHighlight = false;
  let pendingNote = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ');
    paragraph = [];
    if (!current) {
      if (!meta) meta = text;
      return;
    }
    current.blocks.push(pendingNote ? { type: 'p', text, note: true } : { type: 'p', text });
    pendingNote = false;
  };
  const flushList = () => {
    if (list && current) current.blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '<!-- highlight -->') {
      pendingHighlight = true;
      continue;
    }
    if (line === '<!-- note -->') {
      flushParagraph();
      flushList();
      pendingNote = true;
      continue;
    }
    if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      current = { heading: line.slice(3).trim(), highlight: pendingHighlight, blocks: [] };
      pendingHighlight = false;
      sections.push(current);
      continue;
    }
    const ordered = /^\d+\.\s+(.*)$/.exec(line);
    const unordered = /^[-*]\s+(.*)$/.exec(line);
    if (ordered || unordered) {
      flushParagraph();
      const type = ordered ? 'ol' : 'ul';
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ordered ?? unordered)![1]);
      continue;
    }
    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return { title, meta, sections };
}
