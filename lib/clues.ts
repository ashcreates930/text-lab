// Escape rooms, phase 4: Request a clue. Three tiers per lock, each one asked for on purpose and each costing points
// only (never time). Tier 1 is the question's hint; tier 2 narrows the proof to two neighboring sentences; tier 3 names
// the proof sentence and crosses out wrong choices. The student still answers and proves it themselves.
// Mastery: a lock proved with no clue or tier 1 counts as proved; tier 2 or 3 counts as not yet (never worse than a miss).
// Pure rules shared by the solo room, the live phones, the Evidence view and mastery.
import type { ExpQuestion } from "./world-schema.ts";
import { proofLineIndexes, type Token } from "./expedition.ts";

export type ClueTier = 0 | 1 | 2 | 3;
// What each tier costs, in points off this lock (cumulative: tier 3 costs 100 + 150 + 200).
export const CLUE_COST: Record<1 | 2 | 3, number> = { 1: 100, 2: 150, 3: 200 };
export const clueCost = (tier: ClueTier) => ([1, 2, 3] as const).filter((t) => t <= tier).reduce((s, t) => s + CLUE_COST[t], 0);
export const afterClues = (points: number, tier: ClueTier) => (points > 0 ? Math.max(0, points - clueCost(tier)) : 0);
// Mastery counts a proved lock only with no clue or tier 1.
export const cluesAllowMastery = (tier: ClueTier | null | undefined) => (tier ?? 0) <= 1;
export const isTier = (n: unknown): n is ClueTier => n === 0 || n === 1 || n === 2 || n === 3;

export type Clue = { tier: 1 | 2 | 3; label: string; text: string; lines: number[]; strike: number[] };
// The three clues for a question in this chunk (tokens: the chunk's words). lines: sentence indexes (0-based) to outline
// in the passage; strike: wrong choices (original indexes) to cross out. A question with no proof sentence (a written
// seal, Make the Call across the room) gets tier 2 and 3 as pointers back to the hint, so every lock has three tiers.
export function cluesFor(q: Pick<ExpQuestion, "hint" | "proof" | "choices" | "type"> & Partial<ExpQuestion>, tokens: Token[], seed = 0): Clue[] {
  const proof = proofLineIndexes(q as ExpQuestion, tokens), lines = tokens.length ? Math.max(...tokens.map((t) => t.line)) + 1 : 0;
  const first = proof[0];
  // Tier 2: a window of two sentences holding the proof (the proof first or second, by the seed so it isn't a tell).
  const pair = first == null ? [] : first === 0 ? [0, 1] : first >= lines - 1 ? [lines - 2, lines - 1] : seed % 2 ? [first, first + 1] : [first - 1, first];
  const window = pair.filter((n) => n >= 0 && n < lines);
  const wrong = (q.choices ?? []).flatMap((c, i) => (c.best ? [] : [i]));
  const strike = wrong.length > 1 ? wrong.slice(0, wrong.length - 1) : [];
  // A sentence named by how it starts (the passage has no sentence numbers on screen).
  const n = (k: number) => { const w = tokens.filter((t) => t.line === k).map((t) => t.text.trim()).filter(Boolean).slice(0, 5).join(" ").replace(/[,;:]+$/, ""); return `the sentence that starts “${w}…”`; };
  return [
    { tier: 1, label: "Where to look", text: q.hint, lines: [], strike: [] },
    { tier: 2, label: "Narrow it down", text: window.length ? (window.length === 2 ? `The proof is one of two sentences: ${n(window[0])}, or ${n(window[1])}.` : `The proof is ${n(window[0])}.`) : "Reread the passage with the hint in mind; the answer is in your own words.", lines: window, strike: [] },
    { tier: 3, label: "Show me where", text: first != null ? `The proof is ${n(first)}.${strike.length ? ` ${strike.length === 1 ? "One wrong answer is" : `${strike.length} wrong answers are`} crossed out.` : ""}` : `${strike.length ? "Wrong answers are crossed out. " : ""}Use the hint and the passage to write it yourself.`, lines: first != null ? [first] : [], strike },
  ];
}
// The clues a student has opened (tier 0 to 3), in order.
export const opened = (clues: Clue[], tier: ClueTier) => clues.filter((c) => c.tier <= tier);
