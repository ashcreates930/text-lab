// Engagement (classroom testing, 2026-11-19): reading is the gameplay. Pure rules shared by the solo room, the live
// phones, the teacher view and the validator.
//  - After a miss the answer is never shown at once: first a pointer into the text, then the paragraph lit, and only
//    after that the line outlined (so a struggling reader is never stranded). Only the first try scores.
//  - A lantern that first-try proofs brighten and misses dim (atmosphere only; it never blocks anything).
//  - A chance chest after a first-try proof (never after a miss): bonus coins or a piece for the student's kit.
//  - Depth of Knowledge for every question, the story's essential question, plain words and vocabulary.
import type { ExpQuestion, WorldPack } from "./world-schema";
import type { SourcePassage } from "./source-passages";
import { lockKind } from "./escape-room.ts";
import { lineAt } from "./escape-room.ts";

// Depth of Knowledge: lib/dok.ts (kept apart so case notes can use it without the room rules).
export {DOK_BY_TYPE,DOK_NAMES,dokOf,dokFromNote} from "./dok.ts";
import {dokOf} from "./dok.ts";

// ---------- After a miss: back into the text ----------
// level 0: a pointer to the paragraph by its topic; 1: that paragraph lit; 2: the proof line outlined (and, for a
// choice, the answer shown). Each wrong tap while opening the lock moves up one level.
export const HINT_STEPS = 3;
export function topicOf(world: Pick<WorldPack, "engagement">, pid: string | null | undefined) {
  return pid ? world.engagement?.passage_topics?.[pid] ?? null : null;
}
export function pointerText(world: Pick<WorldPack, "engagement">, pid: string | null | undefined, paraNumber: number | null) {
  const t = topicOf(world, pid);
  return t ? `It's in the paragraph about ${t}. Find the line.` : paraNumber ? `It's in paragraph ${paraNumber}. Find the line.` : "It's in this chunk. Read it again and find the line.";
}
export function hintStep(level: number): "pointer" | "paragraph" | "line" {
  return level <= 0 ? "pointer" : level === 1 ? "paragraph" : "line";
}

// ---------- The lantern ----------
// Starts at 3 of 5. A first-try proof brightens it a step, a miss dims it a step; it never goes out (min 1).
export const LANTERN_MAX = 5;
export function lanternLevel(results: (boolean | null | undefined)[], start = 3) {
  let n = start;
  for (const r of results) { if (r === true) n = Math.min(LANTERN_MAX, n + 1); else if (r === false) n = Math.max(1, n - 1); }
  return n;
}

// ---------- The chest ----------
// After a first-try proof only: about half the time a chest appears. It holds bonus coins, or (about one chest in
// four, while any are left) a piece for the student's kit. Seeded, so a replay can't reroll it.
export const KIT = [
  { id: "candle", name: "Tallow candle" }, { id: "horseshoe", name: "Lucky horseshoe" }, { id: "whistle", name: "Tin whistle" },
  { id: "almanac", name: "Farmer's almanac" }, { id: "watch", name: "Pocket watch" }, { id: "spectacles", name: "Wire spectacles" },
  { id: "inkpot", name: "Pewter inkpot" }, { id: "feather", name: "Goose-feather quill" },
] as const;
export type KitId = (typeof KIT)[number]["id"];
export type Chest = { coins: number; piece: null } | { coins: 0; piece: KitId };
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
export function chestFor(seed: string, provedFirstTry: boolean, owned: string[]): Chest | null {
  if (!provedFirstTry) return null;
  if (hash(`${seed}|chest`) >= 0.5) return null;
  const left = KIT.filter((k) => !owned.includes(k.id));
  if (left.length && hash(`${seed}|kind`) < 0.25) return { coins: 0, piece: left[Math.floor(hash(`${seed}|piece`) * left.length)].id };
  return { coins: 5 + Math.floor(hash(`${seed}|coins`) * 3) * 5, piece: null };
}

// ---------- Question before the reading ----------
// Locks that work as a hook (two-key, choose two, theme thread) show the question first, then the passage.
export function questionFirst(q: Pick<ExpQuestion, "type" | "format" | "choices2" | "theories" | "proof" | "clues">) {
  const k = lockKind(q);
  return k === "two_key" || k === "multi_dial" || q.type === "theme_thread";
}

// ---------- Validator ----------
const noted = (world: WorldPack) => new Set(world.storybook?.ai_exclude ?? []);
export function engagementProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [], at = world.id, skip = noted(world), e = world.engagement;
  for (const room of world.rooms ?? []) for (const v of room.vocab ?? []) {
    const line = lineAt(passages, v.line);
    if (!line) out.push(`${at}/${room.expedition} vocab "${v.word}": line ${v.line.p}:${v.line.s} not found`);
    else if (!new RegExp(`\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(line)) out.push(`${at}/${room.expedition} vocab "${v.word}" isn't in its line`);
    if (skip.has(v.line.p)) out.push(`${at}/${room.expedition} vocab "${v.word}" comes from a content-noted paragraph`);
  }
  if (e) {
    for (const p of Object.keys(e.passage_topics ?? {})) if (skip.has(p)) out.push(`${at}: a paragraph topic points into content-noted ${p}`);
    for (const p of Object.keys(e.plain_words ?? {})) if (skip.has(p)) out.push(`${at}: plain words for content-noted ${p}`);
    // Every paragraph that holds a proof has a topic, so the pointer after a miss names it.
    for (const exp of world.expeditions ?? []) for (const c of exp.chunks) for (const seg of c.segments) if (!skip.has(seg.p) && !e.passage_topics?.[seg.p]) { out.push(`${at}/${exp.id}: paragraph ${seg.p} has no topic`); break; }
  }
  // Every question has a DOK level.
  for (const exp of world.expeditions ?? []) for (const c of exp.chunks) for (const q of [c.question, ...(c.bank ?? [])]) if (!dokOf(q)) out.push(`${at}/${exp.id}/${c.id}: no DOK level`);
  return [...new Set(out)];
}

// The paragraph that holds the proof: its id, every sentence of it in the chunk (line indexes), and its number.
export function proofParagraph(lines: { pid: string }[], shownLines: number[]) {
  const pid = shownLines.length ? lines[shownLines[0]]?.pid ?? null : null;
  const paraLines = pid ? lines.flatMap((l, i) => (l.pid === pid ? [i] : [])) : [];
  return { pid, paraLines, paraNumber: pid ? Number(pid.slice(1)) : null };
}
