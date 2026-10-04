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

export type ReadingRange = { start: string; end: string };

// Reading portions for a world. When every scene lists its own reading ranges, each scene gets exactly that reading
// (so a case that opens at the end of a story can start with "the morning after" and then go back). Otherwise the
// story is split into equal portions, one per scene.
export function readingPortions(passages: SourcePassage[], scenes: { reading?: ReadingRange[] }[]): SourcePassage[][] {
  if (scenes.length && scenes.every((s) => s.reading?.length)) {
    const index = new Map(passages.map((p, i) => [p.id, i]));
    const portions = scenes.map((s) => s.reading!.flatMap((r) => {
      const a = index.get(r.start), b = index.get(r.end);
      return a === undefined || b === undefined || b < a ? [] : passages.slice(a, b + 1);
    }));
    if (portions.every((p) => p.length)) return portions;
  }
  return splitIntoPortions(passages, Math.max(2, scenes.length));
}

// "¶ 68 to 70, then ¶ 1 to 20" for a portion that may jump within the story.
export function describePortion(list: SourcePassage[]): string {
  const parts: string[] = [];
  let start = list[0], prev = list[0];
  for (const p of list.slice(1).concat([undefined as unknown as SourcePassage])) {
    if (p && paragraphNumber(p.id) === paragraphNumber(prev.id) + 1) { prev = p; continue; }
    parts.push(start === prev ? `¶ ${paragraphNumber(start.id)}` : `¶ ${paragraphNumber(start.id)} to ${paragraphNumber(prev.id)}`);
    if (p) { start = p; prev = p; }
  }
  return parts.join(", then ");
}
