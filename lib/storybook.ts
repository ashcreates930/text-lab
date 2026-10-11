// Storybook reader helpers shared by the browser, API routes, and scripts.
// A world's `storybook` lists pages in reading order; each page is a contiguous paragraph range of source.md.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { textKey } from "./bilingual.ts";

export type Storybook = NonNullable<WorldPack["storybook"]>;
export type StoryPage = Storybook["pages"][number];
export type Clue = WorldPack["scenes"][number]["artifacts"][number];

// Same sentence boundaries as the case flow, so a proof line means the same thing everywhere.
export function splitSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}
export const sentenceKey = (sentence: string) => textKey(sentence);

export function pagePassages(passages: SourcePassage[], page: StoryPage) {
  const a = passages.findIndex((p) => p.id === page.start), b = passages.findIndex((p) => p.id === page.end);
  return a < 0 || b < a ? [] : passages.slice(a, b + 1);
}

// Index of the page that contains a paragraph id, or -1.
export function pageOfParagraph(pages: StoryPage[], id: string) {
  const n = Number(id.slice(1));
  return pages.findIndex((p) => Number(p.start.slice(1)) <= n && n <= Number(p.end.slice(1)));
}

// A clue belongs to the page holding the last paragraph it cites, so every line it needs has been read.
export function cluesByPage(world: WorldPack): { clue: Clue; scene: WorldPack["scenes"][number] }[][] {
  const pages = world.storybook?.pages ?? [];
  const out = pages.map(() => [] as { clue: Clue; scene: WorldPack["scenes"][number] }[]);
  for (const scene of world.scenes) for (const clue of scene.artifacts) {
    const idx = Math.max(...clue.source_anchor.map((id) => pageOfParagraph(pages, id)));
    if (idx >= 0) out[idx].push({ clue, scene });
  }
  return out;
}

// Forgiving quote matching: ignores case, punctuation, curly vs. straight quotes, dashes, and extra spaces,
// and accepts any run of words from the text (part of a sentence is fine).
export function normalizeQuote(text: string) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'").replace(/[“”«»]/g, '"')
    .replace(/'(?=[a-z])/g, "") // keep contractions together: "it's" -> "its"
    .replace(/[^a-z0-9]+/g, " ").trim();
}
export function quoteInText(quote: string, text: string, minWords = 3) {
  const q = normalizeQuote(quote);
  if (q.split(" ").filter(Boolean).length < minWords) return false;
  return ` ${normalizeQuote(text)} `.includes(` ${q} `);
}
