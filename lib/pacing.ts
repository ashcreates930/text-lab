// Pacing and rhythm (world-map phase 2). Pure rules, used by the solo race, the live race and validate:worlds.
// - Levels: each expedition is two levels of about 5 chunks, with a checkpoint (the full leaderboard) between them.
// - The arc: warm-up questions first; the twist mid-expedition (a witness interrupts with a new claim, answered as Catch
//   the Lie); a boss question at a landmark worth double points; a 60-second burst after the checkpoint (live: squads
//   pool their finds; solo: a timed bonus challenge); then the Name the Liar finale.
// - Lightning beats: 10-second recall questions (one tap on the sentence that answers) between deeper questions.
// - Surprises, sparingly: one double-points stop in level 1, and a streak bonus after three first-try answers in a row.
// - Adaptive challenge: easier and harder versions of a question; every student starts on the standard version, steps
//   up after two first-try answers in a row and down after two misses in a row.
import type { Expedition, ExpQuestion, QuestionType, WorldPack } from "./world-schema.ts";
import { shuffledOrder } from "./expedition.ts";

// ---------- Levels and the checkpoint ----------
// Level 1 is the first half (rounded up), level 2 the rest.
export function levelsOf(chunks: number) {
  const split = Math.ceil(chunks / 2);
  return [{ level: 1, from: 0, to: split - 1 }, { level: 2, from: split, to: chunks - 1 }].filter((l) => l.to >= l.from);
}
export const levelOf = (step: number, chunks: number) => (step < Math.ceil(chunks / 2) ? 1 : 2);
// The checkpoint follows level 1's last chunk; the finale follows the last chunk.
export const isCheckpoint = (step: number, chunks: number) => chunks > 1 && step === Math.ceil(chunks / 2) - 1;

// ---------- The arc ----------
// Warm-up types: find the line, a word in context, a word's shade of meaning, whose eyes (all close to the text).
export const WARMUP_TYPES: QuestionType[] = ["find_it", "word_detective", "shades", "whose_eyes"];
export const DOUBLE = 2, BURST_SECONDS = 60, LIGHTNING_SECONDS = 10, LIGHTNING_POINTS = 300, BURST_POINTS = 200;
export type Arc = { warmup: number[]; twist: number | null; boss: number | null; double: number | null; burstAfter: number | null; lightning: { after: number; item: Lightning }[] };
export type Lightning = NonNullable<Expedition["lightning"]>[number];
// One expedition's arc: the twist is its Catch the Lie, the boss the map's boss stop (or, without a map, the last
// deeper question of level 2), the surprise double a seeded stop in level 1 that isn't a warm-up or the twist, the
// burst straight after the checkpoint, and its lightning beats where they are placed.
export function arcOf(world: WorldPack, exp: Expedition): Arc {
  const n = exp.chunks.length, levels = levelsOf(n), region = world.world_map?.regions.find((r) => r.expedition === exp.id);
  const twistAt = exp.chunks.findIndex((c) => c.question.type === "catch_lie");
  const mapBoss = region?.stops.find((s) => s.landmark === "boss");
  const boss = mapBoss ? mapBoss.chunk - 1 : n > 2 ? n - 2 : null;
  const warmup = [0, 1].filter((k) => k < n && k !== twistAt && k !== boss);
  const l1 = levels[0], candidates = Array.from({ length: l1.to - l1.from + 1 }, (_, i) => l1.from + i).filter((k) => !warmup.includes(k) && k !== twistAt && k !== boss);
  const double = candidates.length ? candidates[shuffledOrder(candidates.length, `${world.id}|${exp.id}|double`)[0]] : null;
  return { warmup, twist: twistAt >= 0 ? twistAt : null, boss, double, burstAfter: n > 1 ? levels[0].to : null, lightning: (exp.lightning ?? []).map((item) => ({ after: item.after - 1, item })) };
}
// The point multiplier for a chunk: double at the boss and at the surprise stop (never both, so never more than double).
export const multiplierAt = (arc: Arc, step: number) => (step === arc.boss || step === arc.double ? DOUBLE : 1);
// What a chunk is in the arc, for its banner.
export function beatKind(arc: Arc, step: number): "warmup" | "twist" | "boss" | "double" | null {
  if (step === arc.boss) return "boss";
  if (step === arc.twist) return "twist";
  if (step === arc.double) return "double";
  return arc.warmup.includes(step) ? "warmup" : null;
}

// ---------- Surprises: the streak bonus ----------
// A bonus the moment a first-try streak reaches 3 (and again at 6): sparing, so it stays a surprise.
export const STREAK_BONUS = 150;
export const streakBonus = (streakBefore: number, streakAfter: number) => ((streakAfter === 3 || streakAfter === 6) && streakAfter > streakBefore ? STREAK_BONUS : 0);

// ---------- Adaptive challenge ----------
export type Version = "easier" | "standard" | "harder";
const LADDER: Version[] = ["easier", "standard", "harder"];
// The version for the next question, from this student's results so far in order (true: right on the first try).
// Start standard; two first-try answers in a row step up one; two misses in a row step down one. After a step the
// count starts again.
export function versionFor(results: boolean[]): Version {
  let at = 1, run = 0, last: boolean | null = null;
  for (const r of results) {
    run = r === last ? run + 1 : 1; last = r;
    if (run === 2) { at = Math.max(0, Math.min(2, at + (r ? 1 : -1))); run = 0; last = null; }
  }
  return LADDER[at];
}
// The question a student sees at that version (the standard one when the chunk has no such version).
export function questionAt(q: ExpQuestion & { versions?: Partial<Record<"easier" | "harder", ExpQuestion>> }, v: Version): { question: ExpQuestion; version: Version } {
  const alt = v === "standard" ? null : q.versions?.[v];
  return alt ? { question: { ...alt, standards: alt.standards?.length ? alt.standards : q.standards }, version: v } : { question: q, version: "standard" };
}

// ---------- Validation (validate:worlds) ----------
// For expeditions built to the arc (not listed in expedition_rules.arc_pending): a warm-up type first, the twist in
// the middle (not in the first two chunks or the last), the boss in level 2, two lightning beats, each asked after the
// chunk it recalls and never straight after it, one in each level, and the same question type never twice in a row
// where the arc is concerned (the twist and boss are not next to each other).
export function arcProblems(world: WorldPack): string[] {
  const out: string[] = [], pending = new Set(world.expedition_rules?.arc_pending ?? []);
  for (const e of world.expeditions ?? []) {
    if (pending.has(e.id)) continue;
    const at = (m: string) => out.push(`arc: ${e.id}: ${m}`), n = e.chunks.length, a = arcOf(world, e);
    if (!WARMUP_TYPES.includes(e.chunks[0].question.type)) at(`chunk 1 is ${e.chunks[0].question.type}, not a warm-up type`);
    if (a.twist === null) at("no twist (Catch the Lie)"); else if (a.twist < 2 || a.twist > n - 2) at(`the twist is chunk ${a.twist + 1}, not mid-expedition`);
    if (a.boss === null) at("no boss question"); else if (levelOf(a.boss, n) !== 2) at(`the boss is chunk ${a.boss + 1}, not in level 2`);
    if (a.twist !== null && a.boss !== null && Math.abs(a.twist - a.boss) < 2) at("the twist and the boss are back to back");
    if (a.lightning.length !== 2) at(`${a.lightning.length} lightning beats (2 expected)`);
    if (new Set(a.lightning.map((l) => levelOf(l.after, n))).size !== a.lightning.length) at("lightning beats should be one in each level");
    for (const l of a.lightning) {
      const src = l.item.chunk - 1;
      if (l.after < 0 || l.after >= n - 1) at(`lightning "${l.item.id}" is placed after chunk ${l.after + 1}`);
      if (src > l.after - 1) at(`lightning "${l.item.id}" recalls chunk ${src + 1} too soon (asked after chunk ${l.after + 1})`);
      if (l.after === a.boss || l.after === a.twist) at(`lightning "${l.item.id}" follows the ${l.after === a.boss ? "boss" : "twist"}; it goes between deeper questions`);
    }
  }
  for (const id of pending) if (!(world.expeditions ?? []).some((e) => e.id === id)) out.push(`arc: arc_pending lists ${id}, which isn't an expedition`);
  return out;
}
