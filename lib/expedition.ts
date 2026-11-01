// Expeditions: Proof Race as the one way to play. The story is read in chunks of whole sentences (about 60 to 120 words),
// ten chunks to an expedition. Each chunk: read (no timer), Gist check (20 seconds), then one question of a type tagged
// to Florida B.E.S.T. benchmarks (lib/best-standards.ts). One shot per question: a wrong or timed-out answer scores 0,
// shows the proof, and goes to the Refresher. Points come only from proof: a two-step question needs the right answer
// AND the right proof. Pure functions; the screens are app/expedition-race.tsx and the live board.
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences } from "./lies.ts";
import type { ExpChunk, ExpQuestion, Expedition, QuestionType, WorldPack } from "./world-schema.ts";
import type { BenchmarkFamily } from "./best-standards.ts";

export const POINTS = { correct: 700, speedMax: 300, gist: 100 } as const;
export const DISCOVERY_COINS = 3;
// Question types: their name on screen, steps, timer (seconds) and the benchmarks they practice.
export const TYPE_INFO: Record<QuestionType, { name: string; steps: 1 | 2; seconds: number; standards: BenchmarkFamily[]; skill: string }> = {
  word_detective: { name: "Word Detective", steps: 2, seconds: 45, standards: ["V.1.3", "K12.EE.1.1"], skill: "Word Detective" },
  shades: { name: "Shades of Meaning", steps: 2, seconds: 45, standards: ["V.1.3", "R.3.1"], skill: "Shades of Meaning" },
  between_lines: { name: "Read Between the Lines", steps: 2, seconds: 45, standards: ["K12.EE.3.1", "K12.EE.1.1"], skill: "Inference Investigator" },
  whose_eyes: { name: "Whose Eyes?", steps: 2, seconds: 45, standards: ["R.1.3", "K12.EE.1.1"], skill: "POV Tracker" },
  figure_it_out: { name: "Figure It Out", steps: 2, seconds: 45, standards: ["R.3.1"], skill: "Figurative Language Finder" },
  character_clue: { name: "Character Clue", steps: 2, seconds: 45, standards: ["R.1.1", "K12.EE.1.1"], skill: "Character Clue" },
  theme_thread: { name: "Theme Thread", steps: 2, seconds: 90, standards: ["R.1.2", "K12.EE.1.1"], skill: "Theme Thread" },
  gist: { name: "Gist Check", steps: 1, seconds: 20, standards: ["R.3.2"], skill: "Gist Getter" },
  find_it: { name: "Find It", steps: 1, seconds: 30, standards: ["K12.EE.1.1"], skill: "Line Finder" },
  catch_lie: { name: "Catch the Lie", steps: 1, seconds: 45, standards: ["K12.EE.1.1"], skill: "Lie Catcher" },
  make_call: { name: "Make the Call", steps: 2, seconds: 90, standards: ["K12.EE.1.1", "K12.EE.3.1"], skill: "Case Closer" },
};
export const GIST_SECONDS = 20, TYPED_SECONDS = 60;
// Catch the Lie: the testimony plays for about this long before its timer starts.
export const TESTIMONY_MS = 3200;
// After an answer: the result moment, then the leaderboard, then a countdown to the next chunk (milliseconds).
export const SCREEN_MS = { result: 3000, board: 5000, countdown: 3000 } as const;

// Extended time: "1", "1.5", "2" or "untimed" (3x). Every timer and every automatic screen is multiplied.
export const timeScale = (setting: string | null | undefined) => (setting === "untimed" ? 3 : Number(setting) > 0 ? Number(setting) : 1);
export const limitMs = (seconds: number, setting?: string | null) => Math.round(seconds * 1000 * timeScale(setting));
export const screenMs = (screen: keyof typeof SCREEN_MS, setting?: string | null) => Math.round(SCREEN_MS[screen] * timeScale(setting));
export const questionSeconds = (q: Pick<ExpQuestion, "type">) => TYPE_INFO[q.type].seconds;

// ---------- Chunks ----------
export type ChunkLine = { pid: string; index: number; text: string };
export type RaceChunk = { index: number; id: string; lines: ChunkLine[]; passages: { id: string; text: string }[]; words: number; chunk: ExpChunk; total: number };
const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
export function expeditionChunks(world: WorldPack, passages: SourcePassage[], expeditionId: string): RaceChunk[] {
  const exp = world.expeditions?.find((e) => e.id === expeditionId); if (!exp) return [];
  return exp.chunks.map((c, index) => {
    const lines: ChunkLine[] = c.segments.flatMap((sg) => { const p = passages.find((x) => x.id === sg.p); const ss = p ? evidenceSentences(p.text) : []; return ss.slice(sg.from, sg.to + 1).map((text, k) => ({ pid: sg.p, index: sg.from + k, text })); });
    const byP = new Map<string, string[]>(); for (const l of lines) byP.set(l.pid, [...(byP.get(l.pid) ?? []), l.text]);
    return { index, id: c.id, lines, passages: [...byP].map(([id, ls]) => ({ id, text: ls.join(" ") })), words: lines.reduce((a, l) => a + wordCount(l.text), 0), chunk: c, total: exp.chunks.length };
  });
}
export const hasExpeditions = (world: WorldPack) => (world.expeditions?.length ?? 0) > 0;
// The passages of several chunks (Make the Call's pinboard, the Refresher), with a paragraph split across chunks joined
// back into one, so each paragraph appears once.
export function joinedPassages(chunks: RaceChunk[]) {
  const out: { id: string; text: string }[] = [];
  for (const c of chunks) for (const p of c.passages) { const last = out.at(-1); if (last && last.id === p.id) last.text = `${last.text} ${p.text}`; else out.push({ ...p }); }
  return out;
}

// ---------- Words: tokens and phrase ranges (for word proof, discoveries and the highlighter) ----------
export const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' -]+/g, " ").replace(/\s+/g, " ").trim();
export type Token = { i: number; line: number; text: string; key: string };
export function chunkTokens(lines: { text: string }[]): Token[] {
  const out: Token[] = [];
  lines.forEach((l, line) => { for (const w of l.text.split(/\s+/).filter(Boolean)) out.push({ i: out.length, line, text: w, key: norm(w) }); });
  return out;
}
// The token range [start, end] where a phrase sits in the chunk, or null.
export function phraseRange(tokens: Token[], phrase: string): [number, number] | null {
  const want = norm(phrase).split(" ").filter(Boolean); if (!want.length) return null;
  for (let s = 0; s + want.length <= tokens.length; s++) if (want.every((w, k) => tokens[s + k].key === w)) return [s, s + want.length - 1];
  return null;
}
// Word proof: the selection covers one accepted phrase completely, with at most 4 extra words.
export function wordsProve(tokens: Token[], selected: number[], accepted: string[]) {
  const sel = new Set(selected);
  return accepted.some((p) => { const r = phraseRange(tokens, p); if (!r) return false; for (let k = r[0]; k <= r[1]; k++) if (!sel.has(k)) return false; return sel.size - (r[1] - r[0] + 1) <= 4; });
}
// A tap on the chunk's hidden discovery (a figurative phrase or a rich word).
export function isDiscovery(tokens: Token[], chunk: { discovery: { phrase: string } }, tokenIndex: number) {
  const r = phraseRange(tokens, chunk.discovery.phrase); return !!r && tokenIndex >= r[0] && tokenIndex <= r[1];
}

// ---------- Answers and scoring ----------
export type Answer = { choice?: number | null; choice2?: number | null; lines?: string[]; words?: number[]; theory?: string | null };
const best = (opts: { best?: boolean }[] | undefined) => (opts ?? []).findIndex((o) => !!o.best);
const sameLine = (a: string, b: string) => norm(a) === norm(b);
export const speedBonus = (elapsedMs: number, limit: number) => (limit > 0 ? Math.round(POINTS.speedMax * Math.max(0, Math.min(1, 1 - elapsedMs / limit))) : 0);
// Each step's verdict (answer, proof) and the points. Time ran out: 0, whatever was picked.
export function scoreAnswer(q: ExpQuestion, a: Answer, tokens: Token[], elapsedMs: number, limit: number) {
  const late = elapsedMs > limit;
  const proofLinesOk = () => { const want = q.proof?.lines ?? []; const got = a.lines ?? []; return got.length > 0 && got.every((g) => want.some((w) => sameLine(w, g))); };
  const proofOk = () => (q.proof?.words?.length ? wordsProve(tokens, a.words ?? [], q.proof.words) : proofLinesOk());
  let answer = true, proof = true;
  switch (q.type) {
    case "find_it": case "catch_lie": answer = proofLinesOk(); proof = answer; break;
    case "gist": answer = a.choice === best(q.choices); proof = answer; break;
    case "figure_it_out": answer = a.choice === best(q.choices); proof = a.choice2 === best(q.choices2?.options); break;
    case "make_call": {
      const t = q.theories?.find((x) => x.id === a.theory); const got = [...new Set((a.lines ?? []).map(norm))];
      answer = !!t; proof = !!t && got.length === 2 && got.every((g) => t.lines.some((l) => norm(l) === g)); break;
    }
    default: answer = a.choice === best(q.choices); proof = answer && proofOk();
  }
  const correct = !late && answer && proof;
  return { correct, answer, proof, late, points: correct ? (q.type === "gist" ? POINTS.gist : POINTS.correct + speedBonus(elapsedMs, limit)) : 0 };
}
export const gistPoints = (chunk: Pick<ExpChunk, "gist">, choice: number | null) => (choice !== null && chunk.gist.options[choice]?.best ? POINTS.gist : 0);

// The word or phrase a question is about, as token positions (highlighted in the passage from the start).
export function focusTokens(tokens: Token[], focus: string | null | undefined) {
  const r = focus ? phraseRange(tokens, focus) : null; return r ? Array.from({ length: r[1] - r[0] + 1 }, (_, k) => r[0] + k) : [];
}
// The proof as token positions in this chunk: its words, or every word of its proof lines. Lit up after the answer only.
export function proofTokens(q: ExpQuestion, tokens: Token[], lines: { text: string }[]) {
  const words = proofShown(q, tokens).words; if (words.length) return words;
  const want = new Set((q.proof?.lines ?? []).map(norm)), idx = new Set(lines.map((l, i) => (want.has(norm(l.text)) ? i : -1)).filter((i) => i >= 0));
  return tokens.filter((t) => idx.has(t.line)).map((t) => t.i);
}
// What the result screen shows as the proof: the lines, or the words (with their line).
export function proofShown(q: ExpQuestion, tokens: Token[]) {
  if (q.type === "make_call") return { lines: q.theories?.flatMap((t) => t.lines).slice(0, 2) ?? [], words: [] as number[] };
  // The first accepted phrase is the proof shown; the others are alternatives a student could also have tapped.
  const first = (q.proof?.words ?? []).map((p) => phraseRange(tokens, p)).find(Boolean);
  const words = first ? Array.from({ length: first[1] - first[0] + 1 }, (_, k) => first[0] + k) : [];
  return { lines: q.proof?.lines ?? [], words };
}
// Key words to highlight in the question itself (never in the passage).
export function keywordParts(prompt: string, keywords: string[]) {
  const parts: { text: string; key: boolean }[] = []; let rest = prompt;
  while (rest) {
    let at = -1, len = 0; for (const k of keywords) { const i = rest.toLowerCase().indexOf(k.toLowerCase()); if (i >= 0 && (at < 0 || i < at)) { at = i; len = k.length; } }
    if (at < 0) { parts.push({ text: rest, key: false }); break; }
    if (at > 0) parts.push({ text: rest.slice(0, at), key: false }); parts.push({ text: rest.slice(at, at + len), key: true }); rest = rest.slice(at + len);
  }
  return parts;
}

// ---------- The expedition's mix ----------
export const typeMix = (exp: Expedition) => new Set(exp.chunks.map((c) => c.question.type));
export const MIN_TYPES = 5;

// The Lantern Ghost (solo rival): right most of the time, at a steady pace; seeded so a replay plays the same.
export function ghostPlay(seed: string, chunk: number, limit: number) {
  let h = 2166136261; for (const ch of `${seed}:${chunk}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const r = ((h >>> 0) % 1000) / 1000, right = r < 0.68, at = limit * (0.35 + 0.4 * r);
  return { right, points: right ? POINTS.correct + speedBonus(at, limit) : 0, gist: r < 0.8 ? POINTS.gist : 0 };
}
