// Storybook reader helpers shared by the browser, API routes, and scripts.
// A world's `storybook` lists pages in reading order; each page is a contiguous paragraph range of source.md.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { textKey } from "./bilingual.ts";

export type Storybook = NonNullable<WorldPack["storybook"]>;
export type StoryPage = Storybook["pages"][number];
export type Clue = WorldPack["scenes"][number]["artifacts"][number];

// Same sentence boundaries as the case flow, so a proof line means the same thing everywhere, except that titles
// (Mr., Mrs., Dr., St.) and initials (D. K.) never end a sentence, and a closing _ (emphasis) stays with its sentence.
const HOLD = "․";
export function splitSentences(text: string) {
  const held = text.replace(/\b(Mrs|Mr|Messrs|Dr|St|Mt)\./gi, `$1${HOLD}`).replace(/\b([A-Z])\.(?=\s+[A-Z]\.)/g, `$1${HOLD}`);
  return (held.match(/[^.!?]+[.!?]+["”’)_]*\s*|[^.!?]+$/g) ?? [held]).map((s) => s.replaceAll(HOLD, ".").trim()).filter(Boolean);
}
// Plays mark spoken emphasis with _underscores_; plain() removes the marks for keys, cards, and quote checks.
export const plain = (text: string) => text.replace(/_([^_]+)_/g, "$1");
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

// Pages are built from "units": one source paragraph each, with its speaker for plays. A unit's items are the
// tappable pieces: sentences, and for plays also stage directions (italic). full is the text cards and restatements key on.
export type Piece = { text: string; full: string; stage?: boolean };
export type Unit = { id: string; speaker?: string; verse?: boolean; items: Piece[] };
export const isSpeakerLine = (text: string) => { const t = text.trim(); return t.length < 30 && /^[A-Z][A-Z .']+$/.test(t); };
// Splits a line of a play into stage directions and spoken sentences. Stage directions are bracketed italics
// ([_like this._], sometimes with the closing bracket missing in this edition) or a long unbracketed italic passage
// such as the opening SCENE description. A short unbracketed italic (_know_) is spoken emphasis and stays in its sentence.
export function scriptPieces(text: string): Piece[] {
  const flat = text.replace(/\s*\n\s*/g, " ").trim();
  const out: Piece[] = [];
  const isStage = (seg: string) => seg.startsWith("[_") || (/^_[^_]+_$/.test(seg) && seg.split(/\s+/).length >= 6);
  let speech = "";
  const flush = () => { for (const s of splitSentences(speech)) out.push({ text: s, full: plain(s) }); speech = ""; };
  for (const seg of flat.split(/(\[_[^_]+_\]?|_[^_]+_)/)) {
    if (!seg) continue;
    if (!isStage(seg)) { speech += seg; continue; }
    flush();
    const clean = seg.replace(/^\[?_|_\]?$/g, "").trim();
    out.push({ text: seg.startsWith("[_") ? `[${clean}]` : clean, full: clean, stage: true });
  }
  flush();
  return out;
}
export function pageUnits(passages: SourcePassage[], page: StoryPage, format: "prose" | "script" = "prose"): Unit[] {
  const out: Unit[] = []; let speaker: string | undefined;
  for (const p of pagePassages(passages, page)) {
    if (format === "script" && isSpeakerLine(p.text)) { speaker = p.text.trim(); continue; }
    // Verse (a poem quoted in prose) is a paragraph whose later lines are all indented; it keeps its line breaks.
    const lines = p.text.split("\n"), verse = format === "prose" && lines.length > 1 && lines.slice(1).every((l) => /^\s{2,}\S/.test(l));
    const prose = (t: string) => ({ text: verse ? t.split("\n").map((l) => l.trim()).join("\n") : t, full: t });
    out.push({ id: p.id, speaker, ...(verse ? { verse } : {}), items: format === "script" ? scriptPieces(p.text) : splitSentences(p.text).map(prose) });
    speaker = undefined;
  }
  return out;
}
// The first lines a reader meets on page 1 (shelf Peek), skipping all-caps headings (SCENE:, FOUND AMONG THE
// PAPERS...) and cutting a long opening, such as a play's first stage direction, to about 55 words.
export function openingLines(world: WorldPack, passages: SourcePassage[]) {
  const page = world.storybook?.pages[0];
  const heading = (t: string) => !/[a-z]/.test(t) && (t.trim().endsWith(":") || t.trim().split(/\s+/).length > 1);
  const lines = page ? pageUnits(passages, page, world.storybook?.format).flatMap((u) => u.items.map((i) => i.full)).filter((t) => !heading(t))
    : splitSentences(passages.find((p) => !/^(author|edition)\b/i.test(p.text))?.text ?? "");
  const words: string[] = [];
  for (const line of lines) { if (words.length >= 35) break; words.push(...line.replace(/\s+/g, " ").split(" ")); }
  return words.length > 60 ? words.slice(0, 55).join(" ") + "…" : words.join(" ");
}
// How each page is named to students: story pages are numbered; a bridge summary sits between two of them.
export function storyPageNames(pages: StoryPage[]) {
  let n = 0;
  return pages.map((p) => (p.bridge ? `the summary between pages ${n} and ${n + 1}` : `page ${++n}`));
}
export const unitText = (units: Unit[]) => units.flatMap((u) => u.items.map((i) => i.text)).join(" ");
