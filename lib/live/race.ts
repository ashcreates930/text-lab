// Proof Race as a live round: the host board and every phone move through the same chunks and beats together
// (lib/proof-race.ts). The host advances the beats (reading waits for the room; auto-advance at 90% ready when on).
// Every answer is a row: race_ready, race_gist, race_question (screened like character questions; a flagged one is kept
// for the teacher only), race_tap. Points, the reveal, the board, the podium and the class stats are worked out from
// the rows. A tap's time is measured on the server from the beat's start, against the student's own extended time.
import type { WorldPack } from "../world-schema.ts";
import type { SourcePassage } from "../source-passages.ts";
import type { LivePlayer, LiveResponse, LiveSquad } from "./engine.ts";
import { BEATS, PROCESS_SECONDS, chunkStats, gistPoints, podium, raceBoard, raceChunks, raceLimitMs, raceTap, readiness, squadTotals, type Beat, type RaceChunk, type RaceSettings } from "../proof-race.ts";
import { screenBoardText } from "../safety.ts";
import { lineWords } from "../lies.ts";

export type LiveRaceRound = { type: "race"; settings: RaceSettings; step: number; beat: Beat; beatStartedAt: string; squadsOn: boolean; pinned?: string | null };
export const liveRaceChunks = (world: WorldPack, passages: SourcePassage[], round: LiveRaceRound) => raceChunks(world, passages, round.settings);
const rows = (responses: LiveResponse[], roundIndex: number, kind: string, step?: number) => responses.filter((r) => r.roundIndex === roundIndex && r.kind === kind && (step === undefined || r.payload.step === step));

// The next beat after this one. Reading goes to the summary or question (if the chunk has one), then the race.
export function nextBeat(round: LiveRaceRound, chunks: RaceChunk[]): { step: number; beat: Beat } | "end" {
  const c = chunks[round.step];
  if (round.beat === "read") return { step: round.step, beat: c?.process ? "process" : "race" };
  if (round.beat === "process") return { step: round.step, beat: "race" };
  if (round.beat === "race") return { step: round.step, beat: "reveal" };
  if (round.beat === "reveal") return { step: round.step, beat: "board" };
  return round.step + 1 < chunks.length ? { step: round.step + 1, beat: chunks[round.step + 1].samePassage ? "race" : "read" } : "end";
}

// ---------- One player's chunk ----------
export function playerChunk(responses: LiveResponse[], roundIndex: number, step: number, playerId: string) {
  const mine = (kind: string) => rows(responses, roundIndex, kind, step).filter((r) => r.playerId === playerId);
  const taps = mine("race_tap").map((r) => r.payload as { line: string; attempt: 1 | 2; result: string; points: number; hint?: string });
  const last = taps.at(-1);
  return {
    ready: mine("race_ready").length > 0,
    gist: (mine("race_gist")[0]?.payload.choice as number | undefined) ?? null,
    asked: mine("race_question").length > 0,
    taps,
    near: last?.result === "near" ? last.hint ?? null : null,
    done: !!last && last.result !== "near",
    correct: taps.some((t) => t.result === "right" || t.result === "retryRight"),
  };
}

// ---------- Answers ----------
// What a player sent this beat, checked and scored, or why it can't count.
export function raceAnswer(round: LiveRaceRound, chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, playerId: string, kind: string, payload: Record<string, unknown>, now: number, timeSetting: string): { payload: Record<string, unknown>; flagged: boolean } | string {
  const chunk = chunks[round.step], me = playerChunk(responses, roundIndex, round.step, playerId);
  if (!chunk) return "The race is over.";
  const since = now - Date.parse(round.beatStartedAt);
  if (kind === "race_ready") {
    if (round.beat !== "read") return "Reading time is over.";
    return me.ready ? "You're already ready." : { payload: { step: round.step }, flagged: false };
  }
  if (kind === "race_gist") {
    if (round.beat !== "process" || chunk.process !== "gist") return "The summary check is closed.";
    if (me.gist !== null) return "You already picked a summary.";
    const choice = Number(payload.choice);
    if (!chunk.gist || !Number.isInteger(choice) || choice < 0 || choice >= chunk.gist.options.length) return "Pick one of the summaries.";
    return { payload: { step: round.step, choice, points: gistPoints(chunk, choice) }, flagged: false };
  }
  if (kind === "race_question") {
    if (round.beat !== "process" || chunk.process !== "question") return "The question time is closed.";
    if (me.asked) return "You already asked your question.";
    const text = String(payload.text ?? "").trim().replace(/\s+/g, " ").slice(0, 200);
    if (text.length < 3) return "Type your question first.";
    const s = screenBoardText(text);
    // A blocked question never reaches the board; it's kept, flagged, for the teacher.
    return { payload: { step: round.step, text }, flagged: s.action !== "allow" };
  }
  if (kind === "race_tap") {
    if (round.beat !== "race") return "The race isn't open.";
    if (me.done) return "You've already answered this one.";
    const limit = raceLimitMs(round.settings.seconds, timeSetting);
    if (timeSetting !== "untimed" && since > limit + 1500) return "Time's up for this one.";
    const line = String(payload.line ?? "");
    if (!chunk.passages.some((p) => lineWords(p.text).includes(lineWords(line))) || !line.trim()) return "Tap a line in the chunk.";
    const attempt: 1 | 2 = me.near ? 2 : 1;
    const r = raceTap(chunk, line, attempt, Math.max(0, since), limit);
    return { payload: { step: round.step, line, attempt, elapsedMs: Math.max(0, since), ...r }, flagged: false };
  }
  return "That isn't a Proof Race answer.";
}

// ---------- Totals, board, reveal, podium, stats ----------
// Each player's points through a step (inclusive): gist and race points.
export function raceTotals(responses: LiveResponse[], roundIndex: number, players: LivePlayer[], through: number) {
  const t = new Map(players.map((p) => [p.id, 0]));
  for (const r of responses) if (r.roundIndex === roundIndex && (r.kind === "race_gist" || r.kind === "race_tap") && r.playerId && Number(r.payload.step) <= through) t.set(r.playerId, (t.get(r.playerId) ?? 0) + Number(r.payload.points ?? 0));
  return t;
}
// The board after a step: players (or squads, by average, when squads are on) with their move since the step before.
export function liveRaceBoard(responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: LiveSquad[], squadsOn: boolean, step: number) {
  const before = raceTotals(responses, roundIndex, players, step - 1), after = raceTotals(responses, roundIndex, players, step);
  if (squadsOn && squads.length) {
    const of = new Map(players.map((p) => [p.id, p.squadId]));
    const names = new Map(squads.map((s) => [s.id, s.name]));
    return { kind: "squad" as const, rows: raceBoard(squadTotals(before, of), squadTotals(after, of), names) };
  }
  return { kind: "player" as const, rows: raceBoard(before, after, new Map(players.map((p) => [p.id, p.nickname]))) };
}
// The reveal: the line that proves it, and the share of players who found it.
export function raceReveal(chunk: RaceChunk, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  const found = players.filter((p) => playerChunk(responses, roundIndex, chunk.index, p.id).correct).length;
  return { line: chunk.answers[0], found, players: players.length, pct: players.length ? Math.round((found / players.length) * 100) : 0 };
}
export function raceFinish(chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: LiveSquad[], squadsOn: boolean) {
  const board = liveRaceBoard(responses, roundIndex, players, squads, squadsOn, chunks.length - 1);
  const results = players.flatMap((p) => chunks.map((c) => ({ chunk: c.index, playerId: p.id, correct: playerChunk(responses, roundIndex, c.index, p.id).correct })));
  return { kind: board.kind, podium: podium(board.rows), stats: chunkStats(chunks, results, players.length) };
}
export const raceReadiness = (round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) =>
  readiness(rows(responses, roundIndex, "race_ready", round.step).map((r) => r.playerId!).filter(Boolean), players.map((p) => p.id), round.settings.autoAdvance);
// How many have answered this beat (for the host).
export function raceAnswered(round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  return raceDone(round, responses, roundIndex, players).length;
}
// Who has answered this beat (the host waits only on extra time that someone is still using).
export function raceDone(round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  return players.filter((p) => { const c = playerChunk(responses, roundIndex, round.step, p.id); return round.beat === "process" ? c.gist !== null || c.asked : c.done; }).map((p) => p.id);
}
// "Your question": up to 3 questions for the board, never a flagged one and never a name; the teacher can pin one.
export function raceQuestions(responses: LiveResponse[], roundIndex: number, step: number) {
  return rows(responses, roundIndex, "race_question", step).filter((r) => !r.flagged).map((r) => ({ id: r.id, text: String(r.payload.text) }));
}
export const BEAT_SECONDS = { process: PROCESS_SECONDS } as const;
export const isBeat = (b: unknown): b is Beat => (BEATS as readonly string[]).includes(String(b));
