export type SourcePassage = { id: string; text: string };

export function parseSourcePassages(markdown: string): SourcePassage[] {
  return markdown
    .replace(/^#.*(?:\r?\n|$)/gm, "")
    .split(/\r?\n\s*\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({ id: `p${String(index + 1).padStart(3, "0")}`, text }));
}

export function paragraphNumber(id: string) {
  const number = Number(id.replace(/^p/, ""));
  return Number.isFinite(number) ? number : 0;
}

// Splits a story into `count` reading portions of roughly equal length, breaking only between paragraphs.
export function splitIntoPortions(passages: SourcePassage[], count: number): SourcePassage[][] {
  const words = passages.map((p) => p.text.split(/\s+/).filter(Boolean).length);
  const total = words.reduce((a, b) => a + b, 0);
  const n = Math.max(1, Math.min(count, passages.length));
  const portions: SourcePassage[][] = [];
  let current: SourcePassage[] = [], running = 0;
  passages.forEach((p, i) => {
    current.push(p);
    running += words[i];
    const target = (total * (portions.length + 1)) / n;
    const remainingSlots = n - portions.length - 1;
    const left = passages.length - i - 1;
    if (remainingSlots > 0 && left >= remainingSlots && (running >= target || left === remainingSlots)) { portions.push(current); current = []; }
  });
  if (current.length) portions.push(current);
  return portions;
}
