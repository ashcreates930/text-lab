// Proof Race: chunked reading with a fast reward loop. A game is a list of chunks; each chunk is the paragraph (or 2 to 4
// sentences of it) one authored sprint question is about, and runs in beats:
//   read (no timer; the host advances when the room is ready, or at 90% ready if auto-advance is on),
//   process (15 seconds: "Gist", pick the best summary, or every third chunk "Your question"),
//   race (tap the line in the chunk that answers the sprint question; tapping only),
//   reveal (the line and the share who found it), board (the leaderboard).
// Points come only from proof: a right line is 700 plus a speed bonus up to 300 (measured against the student's own
// time, so extended time is never a disadvantage); a near miss shows its hint and allows one retry for 350, no bonus;
// a wrong line or no answer is 0. The best gist is 100. Pure rules, shared by the solo game, the live server, the
// screens and the tests.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";

export type ChunkSize = "paragraph" | "sentences";
export type RaceSettings = { chunkSize: ChunkSize; chunks: 6 | 9 | 12; gist: boolean; questions: boolean; seconds: 20 | 30 | 45; autoAdvance: boolean };
export const DEFAULT_RACE: RaceSettings = { chunkSize: "paragraph", chunks: 12, gist: true, questions: true, seconds: 20, autoAdvance: false };
export const RACE_CHOICES = { chunkSize: ["paragraph", "sentences"], chunks: [6, 9, 12], seconds: [20, 30, 45] } as const;
export const PROCESS_SECONDS = 15;
export const RACE_POINTS = { correct: 700, speedMax: 300, retry: 350, gist: 100 } as const;
export const AUTO_READY = 0.9;
export const BEATS = ["read", "process", "race", "reveal", "board"] as const;
export type Beat = (typeof BEATS)[number];

export type RaceChunk = {
  index: number; sprintId: string; sceneId: string;
  passages: SourcePassage[];
  process: "gist" | "question" | null;
  gist: { options: string[]; best: number } | null;
  question: string; answers: string[]; nearMisses: { line: string; hint: string }[];
  // The same passage as the chunk before (paragraph size): no new reading or summary, straight on.
  samePassage: boolean;
};
const same = (a: string, b: string) => lineWords(a) === lineWords(b);

export function parseRaceSettings(x: unknown): RaceSettings {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  const pick = <T>(v: unknown, list: readonly T[], d: T) => (list.includes(v as T) ? (v as T) : d);
  return {
    chunkSize: pick(o.chunkSize, RACE_CHOICES.chunkSize, DEFAULT_RACE.chunkSize),
    chunks: pick(o.chunks, RACE_CHOICES.chunks, DEFAULT_RACE.chunks),
    gist: o.gist === undefined ? DEFAULT_RACE.gist : o.gist === true,
    questions: o.questions === undefined ? DEFAULT_RACE.questions : o.questions === true,
    seconds: pick(o.seconds, RACE_CHOICES.seconds, DEFAULT_RACE.seconds),
    autoAdvance: o.autoAdvance === true,
  };
}

// The world's sprints in story order, and whether it can host a Proof Race.
export const worldSprints = (world: WorldPack) => world.scenes.flatMap((scene) => (scene.sprints ?? []).map((s) => ({ scene, s })));
export const hasProofRace = (world: WorldPack) => worldSprints(world).length >= 6;

// The game's chunks: N sprints spread evenly through the authored ones, each with its passage cut to the setting.
export function raceChunks(world: WorldPack, passages: SourcePassage[], settings: RaceSettings): RaceChunk[] {
  const all = worldSprints(world), n = Math.min(settings.chunks, all.length);
  const chosen = Array.from({ length: n }, (_, k) => all[Math.floor((k * all.length) / n)]);
  let prevKey = "";
  return chosen.map(({ scene, s }, index) => {
    const short = settings.chunkSize === "sentences" && s.short ? s.short : null;
    const answerPid = s.paragraphs.find((pid) => passages.some((p) => p.id === pid && evidenceSentences(p.text).some((l) => s.answers.some((a) => same(a, l))))) ?? s.paragraphs[0];
    const list = short
      ? (() => { const p = passages.find((x) => x.id === short.paragraph)!; return [{ ...p, text: evidenceSentences(p.text).slice(short.from - 1, short.to).join(" ") }]; })()
      : passages.filter((p) => p.id === answerPid || (s.paragraphs.includes(p.id) && s.near_misses.some((nm) => evidenceSentences(p.text).some((l) => same(l, nm.line)))));
    const key = list.map((p) => `${p.id}:${p.text.length}`).join("|"), samePassage = key === prevKey;
    prevKey = key;
    const lines = list.flatMap((p) => evidenceSentences(p.text));
    const process: RaceChunk["process"] = samePassage ? null : settings.questions && index % 3 === 2 ? "question" : settings.gist && s.gist ? "gist" : null;
    return {
      index, sprintId: s.id, sceneId: scene.id, passages: list, process,
      gist: s.gist ? { options: s.gist.options.map((o) => o.text), best: s.gist.options.findIndex((o) => o.best) } : null,
      question: s.question, answers: s.answers, nearMisses: s.near_misses.filter((nm) => lines.some((l) => same(l, nm.line))), samePassage,
    };
  });
}

// ---------- The race ----------
// The student's time for the race: the setting, scaled by their extra time ("untimed" races at 3 times, never cut off).
export const raceLimitMs = (seconds: number, timeSetting: string | null | undefined) => seconds * 1000 * (timeSetting === "untimed" ? 3 : Number(timeSetting) > 0 ? Number(timeSetting) : 1);
export type TapResult = { result: "right" | "retryRight" | "wrong"; points: number } | { result: "near"; hint: string; points: 0 };
// One tap. attempt: 1 for the first tap, 2 for the retry a near miss allows.
export function raceTap(chunk: Pick<RaceChunk, "answers" | "nearMisses">, line: string, attempt: 1 | 2, elapsedMs: number, limitMs: number): TapResult {
  const right = chunk.answers.some((a) => same(a, line));
  if (attempt === 2) return right ? { result: "retryRight", points: RACE_POINTS.retry } : { result: "wrong", points: 0 };
  if (right) return { result: "right", points: RACE_POINTS.correct + speedBonus(elapsedMs, limitMs) };
  const near = chunk.nearMisses.find((n) => same(n.line, line));
  return near ? { result: "near", hint: near.hint, points: 0 } : { result: "wrong", points: 0 };
}
export const speedBonus = (elapsedMs: number, limitMs: number) => (limitMs > 0 ? Math.round(RACE_POINTS.speedMax * Math.max(0, Math.min(1, 1 - elapsedMs / limitMs))) : 0);
export const gistPoints = (chunk: Pick<RaceChunk, "gist">, choice: number) => (chunk.gist && choice === chunk.gist.best ? RACE_POINTS.gist : 0);

// ---------- Readiness ----------
export function readiness(readyIds: Iterable<string>, playerIds: string[], auto: boolean) {
  const set = new Set(readyIds), ready = playerIds.filter((id) => set.has(id)).length, total = playerIds.length;
  return { ready, total, advance: auto && total > 0 && ready / total >= AUTO_READY };
}

// ---------- Leaderboard, podium, class stats ----------
export type BoardRow = { id: string; name: string; points: number; gained: number; rank: number; prevRank: number | null; move: number };
// Ranks after this chunk, with each one's change from before it ("up 2"). Ties share the higher rank, by name.
export function raceBoard(before: Map<string, number>, after: Map<string, number>, names: Map<string, string>): BoardRow[] {
  const ranks = (m: Map<string, number>) => { const sorted = [...names.keys()].sort((a, b) => (m.get(b) ?? 0) - (m.get(a) ?? 0) || (names.get(a) ?? "").localeCompare(names.get(b) ?? "")); const r = new Map<string, number>(); sorted.forEach((id, k) => { const prev = sorted[k - 1]; r.set(id, prev !== undefined && (m.get(prev) ?? 0) === (m.get(id) ?? 0) ? r.get(prev)! : k + 1); }); return { sorted, r }; };
  const was = ranks(before), now = ranks(after);
  const hadPoints = [...before.values()].some((v) => v > 0);
  return now.sorted.map((id) => { const rank = now.r.get(id)!, prevRank = hadPoints ? was.r.get(id) ?? null : null; return { id, name: names.get(id) ?? "", points: after.get(id) ?? 0, gained: (after.get(id) ?? 0) - (before.get(id) ?? 0), rank, prevRank, move: prevRank === null ? 0 : prevRank - rank }; });
}
export const podium = (rows: BoardRow[]) => rows.filter((r) => r.points > 0).slice(0, 3);
// Squads rank by their members' average, so a squad of 3 isn't behind a squad of 4.
export function squadTotals(totals: Map<string, number>, squadOf: Map<string, string | null>) {
  const by = new Map<string, number[]>();
  for (const [pid, sq] of squadOf) if (sq) by.set(sq, [...(by.get(sq) ?? []), totals.get(pid) ?? 0]);
  return new Map([...by].map(([sq, xs]) => [sq, Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)]));
}
// The share of players who proved each chunk (right first try or on the retry), and the 3 hardest chunks.
export function chunkStats(chunks: Pick<RaceChunk, "index" | "question">[], results: { chunk: number; playerId: string; correct: boolean }[], players: number) {
  const rows = chunks.map((c) => { const found = new Set(results.filter((r) => r.chunk === c.index && r.correct).map((r) => r.playerId)).size; return { index: c.index, question: c.question, pct: players ? Math.round((found / players) * 100) : 0 }; });
  return { rows, hardest: [...rows].sort((a, b) => a.pct - b.pct || a.index - b.index).slice(0, 3) };
}

// ---------- The solo rival (demo) ----------
// The Lantern Ghost's authored timing: right about 4 times in 5, at 35% to 75% of the race time, fixed per chunk.
export function rivalPlay(seed: string, chunk: number, limitMs: number) {
  let h = 0;
  for (const ch of `${seed}:${chunk}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const correct = h % 5 !== 0, ms = Math.round(limitMs * (0.35 + ((h >>> 3) % 41) / 100));
  return { correct, ms, points: correct ? RACE_POINTS.correct + speedBonus(ms, limitMs) : 0, gist: h % 4 !== 0 ? RACE_POINTS.gist : 0 };
}
