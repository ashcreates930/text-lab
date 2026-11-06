// Proof Race expeditions as a live round (rules: lib/expedition.ts). The host board drives the timing and every phone
// follows it: read (no timer; moves on at 90% ready when on), Gist check (20 seconds), "Your question" on every third
// chunk when on (60 seconds), the question (timed by its type; Catch the Lie's clock starts after the testimony), the
// result (3 seconds), then a lightning beat where one is placed (10 seconds), and after level 1 the checkpoint: the
// leaderboard (5 seconds) and the 60-second burst (squads pool their finds); then a countdown (3 seconds). The full
// leaderboard waits for the checkpoint and the podium (lib/pacing.ts). The teacher can hold any screen (Pause).
// Extended time stretches every timer and screen. Every answer is a row: race_ready, race_gist, race_question
// (screened; a flagged one is kept for the teacher only) and race_tap (the one-shot answer, scored on the server from
// the beat's start against the student's own extended time). Points, the reveal, the board, the podium and the class
// stats come from the rows.
// An expedition with an Interview opens with it: for each witness the class votes on a question card (vote, 20
// seconds), then the witness answers on the board (testify; the host moves on). One witness lies, picked per game. The
// finale is Name the Liar: every phone locks in the liar and the line privately (liar, 90 seconds), and nothing is
// shown until the board reveals the liar with the class breakdown (verdict). Rows: interview_vote and liar_lock.
import type { Interview, WorldPack } from "../world-schema.ts";
import { LIAR_SECONDS, VOTE_SECONDS, cardWinner, liarCheck, type LiarAnswer } from "../interview.ts";
import type { SourcePassage } from "../source-passages.ts";
import type { LivePlayer, LiveResponse, LiveSquad } from "./engine.ts";
import { GIST_SECONDS, SCREEN_MS, TESTIMONY_MS, TYPED_SECONDS, TYPE_INFO, chunkTokens, expeditionChunks, gistPoints, limitMs, proofShown, scoreAnswer, timeScale, type Answer, type RaceChunk } from "../expedition.ts";
import { podium, raceBoard, readiness, squadTotals } from "../proof-race.ts";
import { BURST_POINTS, BURST_SECONDS, LIGHTNING_POINTS, LIGHTNING_SECONDS, arcOf, isCheckpoint, multiplierAt, streakBonus, versionFor, type Arc, type Version } from "../pacing.ts";
import { askedQuestion, bankPick, gistAt } from "../formats.ts";
import { bandOf, type GradeBand, gradeOf, type Grade } from "../best-standards.ts";
import { screenBoardText } from "../safety.ts";

// grade: the class grade (6 to 10) that picks each benchmark's code; gradeBand follows from it.
export type ExpSettings = { expeditionId: string; grade?: Grade; gradeBand: GradeBand; questions: boolean; highlighter: boolean; autoAdvance: boolean };
export const LIVE_BEATS = ["vote", "testify", "read", "process", "ask", "race", "reveal", "lightning", "board", "burst", "countdown", "liar", "verdict"] as const;
export type LiveBeat = (typeof LIVE_BEATS)[number];
export type LiveRaceRound = { type: "race"; settings: ExpSettings; step: number; beat: LiveBeat; beatStartedAt: string; squadsOn: boolean; pinned?: string | null; pausedAt?: string | null; interview?: { liar: number; witnesses: number } | null };
export const interviewOf = (world: WorldPack, round: Pick<LiveRaceRound, "settings" | "interview">): Interview | null => (round.interview ? world.expeditions?.find((e) => e.id === round.settings.expeditionId)?.interview ?? null : null);
export const isBeat = (b: unknown): b is LiveBeat => (LIVE_BEATS as readonly string[]).includes(String(b));

export function parseExpSettings(x: unknown, world: WorldPack, grade = 7): ExpSettings | null {
  const o = (x ?? {}) as Record<string, unknown>;
  const id = typeof o.expeditionId === "string" && world.expeditions?.some((e) => e.id === o.expeditionId) ? o.expeditionId : world.expeditions?.[0]?.id;
  if (!id) return null;
  const g = gradeOf([6, 7, 8, 9, 10].includes(Number(o.grade)) ? o.grade : o.gradeBand === "9-10" ? 9 : grade);
  return { expeditionId: id, grade: g, gradeBand: bandOf(g), questions: o.questions !== false, highlighter: o.highlighter === true, autoAdvance: o.autoAdvance !== false };
}
export const liveArc = (world: WorldPack, round: Pick<LiveRaceRound, "settings">): Arc | null => { const e = world.expeditions?.find((x) => x.id === round.settings.expeditionId); return e ? arcOf(world, e) : null; };
export const liveRaceChunks = (world: WorldPack, passages: SourcePassage[], round: Pick<LiveRaceRound, "settings">) => expeditionChunks(world, passages, round.settings.expeditionId);
const rows = (responses: LiveResponse[], roundIndex: number, kind: string, step?: number) => responses.filter((r) => r.roundIndex === roundIndex && r.kind === kind && (step === undefined || r.payload.step === step));
// "Your question" comes on every third chunk, when the teacher has it on.
export const asksHere = (round: Pick<LiveRaceRound, "settings">, step: number) => round.settings.questions && step % 3 === 2;

// The next beat after this one; after the countdown, the next chunk (or the end).
export function nextBeat(round: LiveRaceRound, chunks: RaceChunk[], arc: Arc | null = null): { step: number; beat: LiveBeat } | "end" {
  const b = round.beat, s = round.step;
  if (b === "vote") return { step: s, beat: "testify" };
  if (b === "testify") return s + 1 < (round.interview?.witnesses ?? 0) ? { step: s + 1, beat: "vote" } : { step: 0, beat: "read" };
  if (b === "liar") return { step: s, beat: "verdict" };
  if (b === "verdict") return "end";
  // The Gist check about every third chunk (lib/formats.ts gistAt); otherwise straight on.
  if (b === "read") return { step: s, beat: gistAt(s) ? "process" : asksHere(round, s) ? "ask" : "race" };
  if (b === "process") return { step: s, beat: asksHere(round, s) ? "ask" : "race" };
  if (b === "ask") return { step: s, beat: "race" };
  if (b === "race") return { step: s, beat: "reveal" };
  // After the reveal: a lightning beat where one is placed, then the checkpoint (board and burst) after level 1.
  const checkpoint = isCheckpoint(s, chunks.length);
  if (b === "reveal") return arc?.lightning.some((l) => l.after === s) ? { step: s, beat: "lightning" } : { step: s, beat: checkpoint ? "board" : "countdown" };
  if (b === "lightning") return { step: s, beat: checkpoint ? "board" : "countdown" };
  if (b === "board") return { step: s, beat: checkpoint && arc?.burstAfter === s ? "burst" : "countdown" };
  if (b === "burst") return { step: s, beat: "countdown" };
  return s + 1 < chunks.length ? { step: s + 1, beat: "read" } : round.interview ? { step: s, beat: "liar" } : "end";
}
// How long a beat runs for one player (milliseconds), or null for reading (no timer). The question's clock for Catch
// the Lie starts after the testimony.
export function beatMs(round: LiveRaceRound, chunk: RaceChunk | undefined, setting?: string | null) {
  const b = round.beat;
  if (b === "vote") return limitMs(VOTE_SECONDS, setting);
  if (b === "liar") return limitMs(LIAR_SECONDS, setting);
  if (b === "testify" || b === "verdict") return null;
  if (b === "read" || !chunk) return null;
  if (b === "process") return limitMs(GIST_SECONDS, setting);
  if (b === "ask") return limitMs(TYPED_SECONDS, setting);
  if (b === "lightning") return limitMs(LIGHTNING_SECONDS, setting);
  if (b === "burst") return limitMs(BURST_SECONDS, setting);
  if (b === "race") return limitMs(TYPE_INFO[chunk.chunk.question.type].seconds, setting) + (chunk.chunk.question.type === "catch_lie" ? TESTIMONY_MS : 0);
  return Math.round(SCREEN_MS[b === "reveal" ? "result" : (b as "board" | "countdown")] * timeScale(setting));
}

// ---------- One player's chunk ----------
// points include the double (mult) and the streak bonus; version: the question version this player saw.
export type LiveTap = { step: number; answer: Answer; correct: boolean; answerRight: boolean; proofRight: boolean; late: boolean; points: number; elapsedMs: number; version?: Version; bank?: number; mult?: number; bonus?: number; verdict?: { strength: string; note: string; next: string } };
export function playerChunk(responses: LiveResponse[], roundIndex: number, step: number, playerId: string) {
  const mine = (kind: string) => rows(responses, roundIndex, kind, step).filter((r) => r.playerId === playerId);
  const tap = mine("race_tap")[0]?.payload as LiveTap | undefined;
  const asked = mine("race_question")[0];
  return {
    ready: mine("race_ready").length > 0,
    gist: (mine("race_gist")[0]?.payload.choice as number | undefined) ?? null,
    gistRight: mine("race_gist")[0] ? Number(mine("race_gist")[0].payload.points ?? 0) > 0 : null,
    asked: !!asked, question: asked ? String(asked.payload.text) : null,
    unknown: mine("race_unknown").flatMap((r) => (r.payload.words as string[] | undefined) ?? []),
    tap: tap ?? null, done: !!tap, correct: !!tap?.correct, points: tap?.points ?? 0,
    lightning: (mine("race_lightning")[0]?.payload as { correct: boolean; points: number } | undefined) ?? null,
  };
}
// The question version for a player at a step: from their results on every earlier step (lib/pacing.ts).
export function playerVersion(responses: LiveResponse[], roundIndex: number, step: number, playerId: string): Version {
  return versionFor(Array.from({ length: step }, (_, k) => playerChunk(responses, roundIndex, k, playerId).correct));
}
// The question a player is asked at a step: their pick from the chunk's bank (seeded by the player) at their version.
export function playerAsked(chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, playerId: string, step: number) {
  const c = chunks[step]; if (!c) return null;
  const version = playerVersion(responses, roundIndex, step, playerId), bank = bankPick(c.chunk, playerId);
  return { question: askedQuestion(c.chunk, { bank, version }), bank, version };
}
// The burst: which level 1 chunks' discoveries a player (or their squad) has found.
export function burstFound(responses: LiveResponse[], roundIndex: number, ids: string[]) {
  return [...new Set(rows(responses, roundIndex, "race_burst").filter((r) => r.playerId && ids.includes(r.playerId)).map((r) => Number(r.payload.chunk)))].sort((a, b) => a - b);
}

// ---------- Answers ----------
// What a player sent this beat, checked and scored, or why it can't count. One shot: one answer per question.
// squadIds: the player's squad (the burst counts a find once per squad), or just the player.
export function raceAnswer(round: LiveRaceRound, chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, playerId: string, kind: string, payload: Record<string, unknown>, now: number, timeSetting: string, iv: Interview | null = null, arc: Arc | null = null, squadIds: string[] = [playerId]): { payload: Record<string, unknown>; flagged: boolean } | string {
  const chunk = chunks[round.step], me = playerChunk(responses, roundIndex, round.step, playerId);
  if (!chunk) return "The race is over.";
  const since = Math.max(0, now - Date.parse(round.beatStartedAt));
  // The Interview: one vote per witness, for one of the two cards.
  if (kind === "interview_vote") {
    if (round.beat !== "vote") return "Voting is closed.";
    if (playerVote(responses, roundIndex, round.step, playerId) !== null) return "You already voted.";
    const card = Number(payload.card);
    return card === 0 || card === 1 ? { payload: { step: round.step, card }, flagged: false } : "Pick one of the two questions.";
  }
  // Name the Liar: one try, checked here and kept private until the reveal; past the time it counts for 0.
  if (kind === "liar_lock") {
    if (round.beat !== "liar" || !iv || !round.interview) return "Name the Liar isn't open.";
    if (playerLiar(responses, roundIndex, playerId)) return "You've already locked in.";
    const a: LiarAnswer = { liar: typeof payload.liar === "string" ? payload.liar : null, line: typeof payload.line === "string" ? payload.line.slice(0, 2000) : null };
    if (!a.liar || !iv.witnesses.some((w) => w.character === a.liar)) return "Pick a witness.";
    if (!a.line) return "Tap the line that proves it.";
    const late = since > limitMs(LIAR_SECONDS, timeSetting) + 1500, r = liarCheck(iv, round.interview.liar, a);
    return { payload: { step: chunks.length - 1, liar: a.liar, line: a.line, named: r.named, solved: r.solved && !late, late, points: late ? 0 : r.points }, flagged: false };
  }
  if (kind === "race_ready") {
    if (round.beat !== "read") return "Reading time is over.";
    return me.ready ? "You're already ready." : { payload: { step: round.step }, flagged: false };
  }
  if (kind === "race_unknown") {
    if (!round.settings.highlighter) return "The highlighter is off.";
    if (round.beat !== "read") return "Mark words while you read.";
    const words = (Array.isArray(payload.words) ? payload.words : []).map((w) => String(w).replace(/[^\p{L}'-]/gu, "").slice(0, 30)).filter(Boolean).slice(0, 20);
    return words.length ? { payload: { step: round.step, words }, flagged: false } : "Tap the words you don't know first.";
  }
  if (kind === "race_gist") {
    if (round.beat !== "process") return "The Gist check is closed.";
    if (me.gist !== null) return "You already picked a summary.";
    const choice = Number(payload.choice);
    if (!Number.isInteger(choice) || choice < 0 || choice >= chunk.chunk.gist.options.length) return "Pick one of the summaries.";
    return { payload: { step: round.step, choice, points: gistPoints(chunk.chunk, choice) }, flagged: false };
  }
  if (kind === "race_question") {
    if (round.beat !== "ask") return "The question time is closed.";
    if (me.asked) return "You already asked your question.";
    const text = String(payload.text ?? "").trim().replace(/\s+/g, " ").slice(0, 200);
    if (text.length < 3) return "Type your question first.";
    const s = screenBoardText(text);
    // A blocked question never reaches the board; it's kept, flagged, for the teacher.
    return { payload: { step: round.step, text }, flagged: s.action !== "allow" };
  }
  // A lightning beat: one tap on the sentence that answers, in 10 seconds (plus the student's extra time).
  if (kind === "race_lightning") {
    const l = arc?.lightning.find((x) => x.after === round.step);
    if (round.beat !== "lightning" || !l) return "The lightning beat isn't open.";
    if (me.lightning) return "You've already answered this one.";
    const key = (t: string) => t.replace(/\s+/g, " ").trim(), line = String(payload.line ?? "");
    const late = since > limitMs(LIGHTNING_SECONDS, timeSetting) + 1500, correct = !late && l.item.answer.some((a) => key(a) === key(line));
    return { payload: { step: round.step, line: line.slice(0, 2000), correct, late, points: correct ? LIGHTNING_POINTS : 0 }, flagged: false };
  }
  // The burst: a level 1 chunk's discovery, once per squad (or player), for points to whoever found it.
  if (kind === "race_burst") {
    if (round.beat !== "burst" || arc?.burstAfter !== round.step) return "The burst isn't open.";
    const c = Number(payload.chunk);
    if (!Number.isInteger(c) || c < 0 || c > round.step) return "Pick a chunk from this level.";
    if (since > limitMs(BURST_SECONDS, timeSetting) + 1500) return "Time's up.";
    if (burstFound(responses, roundIndex, squadIds).includes(c)) return "Your squad already found that one.";
    return { payload: { step: round.step, chunk: c, points: BURST_POINTS }, flagged: false };
  }
  if (kind === "race_tap") {
    if (round.beat !== "race") return "The question isn't open.";
    if (me.done) return "You've already answered this one.";
    // This player's version of the question (lib/pacing.ts).
    const asked = playerAsked(chunks, responses, roundIndex, playerId, round.step)!, q = asked.question, limit = limitMs(TYPE_INFO[q.type].seconds, timeSetting);
    const elapsed = Math.max(0, since - (q.type === "catch_lie" ? TESTIMONY_MS : 0));
    const a = (payload.answer ?? {}) as Record<string, unknown>;
    const answer: Answer = {
      choice: Number.isInteger(a.choice) ? (a.choice as number) : null, choice2: Number.isInteger(a.choice2) ? (a.choice2 as number) : null,
      lines: Array.isArray(a.lines) ? a.lines.map(String).slice(0, 2) : [], words: Array.isArray(a.words) ? a.words.filter((w) => Number.isInteger(w)).map(Number).slice(0, 60) : [],
      theory: typeof a.theory === "string" ? a.theory : null,
      picks: Array.isArray(a.picks) ? a.picks.filter((p) => Number.isInteger(p)).map(Number).slice(0, 5) : [],
      placed: a.placed && typeof a.placed === "object" ? Object.fromEntries(Object.entries(a.placed as Record<string, unknown>).slice(0, 8).map(([k, v]) => [String(k).slice(0, 40), typeof v === "string" ? v.slice(0, 40) : null])) : {},
      text: typeof a.text === "string" ? a.text.replace(/\s+/g, " ").trim().slice(0, 240) : undefined,
      // A written answer's strength comes only from the server's judge (the act route), never from the phone.
      judged: payload.__judged === "Strong" || payload.__judged === "Solid" || payload.__judged === "Needs more evidence" ? payload.__judged : null,
    };
    // A small grace for the network; past it the answer still counts as the one shot, for 0.
    const r = scoreAnswer(q, answer, chunkTokens(chunk.lines), elapsed, limit + 1500);
    const late = elapsed > limit + 1500;
    // The boss and the surprise stop double the question's points; a streak of 3 (and 6) adds a bonus.
    const correct = r.correct && !late, mult = arc ? multiplierAt(arc, round.step) : 1;
    let before = 0; for (let k = round.step - 1; k >= 0 && playerChunk(responses, roundIndex, k, playerId).correct; k--) before++;
    const bonus = streakBonus(before, correct ? before + 1 : 0);
    const tap: LiveTap = { step: round.step, answer, correct, answerRight: r.answer, proofRight: r.proof, late, points: late ? 0 : r.points * mult + bonus, elapsedMs: elapsed, version: asked.version, bank: asked.bank, mult, bonus, ...(payload.__verdict ? { verdict: payload.__verdict as { strength: string; note: string; next: string } } : {}) };
    return { payload: tap as unknown as Record<string, unknown>, flagged: false };
  }
  return "That isn't a Proof Race answer.";
}

// ---------- Totals, board, reveal, podium, stats ----------
// Each player's points through a step (inclusive): Gist check and question points.
export function raceTotals(responses: LiveResponse[], roundIndex: number, players: LivePlayer[], through: number) {
  const t = new Map(players.map((p) => [p.id, 0]));
  for (const r of responses) if (r.roundIndex === roundIndex && (r.kind === "race_gist" || r.kind === "race_tap" || r.kind === "race_lightning" || r.kind === "race_burst" || r.kind === "liar_lock") && r.playerId && Number(r.payload.step) <= through) t.set(r.playerId, (t.get(r.playerId) ?? 0) + Number(r.payload.points ?? 0));
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
// The reveal: the proof (lines, or words with their token positions) and the share of players who found it.
export function raceReveal(chunk: RaceChunk, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  const found = players.filter((p) => playerChunk(responses, roundIndex, chunk.index, p.id).correct).length;
  return { ...proofShown(chunk.chunk.question, chunkTokens(chunk.lines)), why: chunk.chunk.question.why, found, players: players.length, pct: players.length ? Math.round((found / players.length) * 100) : 0 };
}
// Class stats: the share who proved each chunk, and the 3 hardest.
export function chunkStatsOf(chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  const out = chunks.map((c) => { const found = players.filter((p) => playerChunk(responses, roundIndex, c.index, p.id).correct).length; return { index: c.index, question: c.chunk.question.prompt, type: TYPE_INFO[c.chunk.question.type].name, pct: players.length ? Math.round((found / players.length) * 100) : 0 }; });
  return { rows: out, hardest: [...out].sort((a, b) => a.pct - b.pct || a.index - b.index).slice(0, 3) };
}
export function raceFinish(chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: LiveSquad[], squadsOn: boolean) {
  const board = liveRaceBoard(responses, roundIndex, players, squads, squadsOn, chunks.length - 1);
  return { kind: board.kind, podium: podium(board.rows), stats: chunkStatsOf(chunks, responses, roundIndex, players) };
}
export const raceReadiness = (round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) =>
  readiness(rows(responses, roundIndex, "race_ready", round.step).map((r) => r.playerId!).filter(Boolean), players.map((p) => p.id), round.settings.autoAdvance);
// Who has answered this beat (the host can move on once most have; it waits only on extra time someone still uses).
export function raceDone(round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  return players.filter((p) => {
    if (round.beat === "vote") return playerVote(responses, roundIndex, round.step, p.id) !== null;
    if (round.beat === "liar" || round.beat === "verdict") return !!playerLiar(responses, roundIndex, p.id);
    const c = playerChunk(responses, roundIndex, round.step, p.id); return round.beat === "process" ? c.gist !== null : round.beat === "ask" ? c.asked : round.beat === "lightning" ? !!c.lightning : c.done;
  }).map((p) => p.id);
}
export const raceAnswered = (round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) => raceDone(round, responses, roundIndex, players).length;
// "Your question": up to 3 questions for the board, never a flagged one and never a name; the teacher can pin one.
export function raceQuestions(responses: LiveResponse[], roundIndex: number, step: number) {
  return rows(responses, roundIndex, "race_question", step).filter((r) => !r.flagged).map((r) => ({ id: r.id, text: String(r.payload.text) }));
}

// ---------- The Interview and Name the Liar ----------
export type LiarLock = { step: number; liar: string; line: string; named: boolean; solved: boolean; late: boolean; points: number };
export const playerVote = (responses: LiveResponse[], roundIndex: number, step: number, playerId: string) => {
  const r = rows(responses, roundIndex, "interview_vote", step).find((x) => x.playerId === playerId); return r ? Number(r.payload.card) : null;
};
export const playerLiar = (responses: LiveResponse[], roundIndex: number, playerId: string) => (rows(responses, roundIndex, "liar_lock").find((x) => x.playerId === playerId)?.payload as LiarLock | undefined) ?? null;
// The class's votes for each witness so far, and the card each witness answered (the most votes; a tie takes the first).
export function liveCards(responses: LiveResponse[], roundIndex: number, witnesses: number) {
  const votes = Array.from({ length: witnesses }, (_, k) => { const v = rows(responses, roundIndex, "interview_vote", k).map((r) => Number(r.payload.card)); return [v.filter((x) => x === 0).length, v.filter((x) => x === 1).length]; });
  return { votes, cards: votes.map((v) => cardWinner([...Array(v[0]).fill(0), ...Array(v[1]).fill(1)])) };
}
// Every player's answer at the reveal (no lock counts as naming no one).
export const liarAnswers = (responses: LiveResponse[], roundIndex: number, players: LivePlayer[]): LiarAnswer[] =>
  players.map((p) => { const l = playerLiar(responses, roundIndex, p.id); return { liar: l?.liar ?? null, line: l?.line ?? null }; });
