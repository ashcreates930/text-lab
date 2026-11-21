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
import { chestFor, type Chest, type KitId } from "../engagement.ts";
import { questionSetting, type QuestionTime } from "../expedition.ts";
import { SQUAD_LOCK_POINTS, recorderOf, sharedLockOpen, type SquadLock } from "./squad-escape.ts";
import { clockRuns, escapeBudgetMs, roomClockOf, ADD_MS, type RoomClock } from "../room-clock.ts";
import { CLUE_COST, clueCost, type ClueTier } from "../clues.ts";
import type { Interview, RoomPuzzle, WorldPack } from "../world-schema.ts";
import { chamberSpan, codeResultOf, paintingResult, recoveryOpens, sceneResult, type ChamberPick, type RoomPuzzleAt } from "../escape-room.ts";
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
// chamber: the whole room (0) or one chamber (lib/escape-room.ts), so a class can play a room one chamber per period.
export type ExpSettings = { expeditionId: string; grade?: Grade; gradeBand: GradeBand; questions: boolean; highlighter: boolean; autoAdvance: boolean; chamber?: ChamberPick;
  // The room clock (lib/room-clock.ts): off unless the host turns it on.
  clock?: RoomClock;
  // The class's question time (set from the class when the game starts; standard otherwise).
  questionTime?: QuestionTime };
export const LIVE_BEATS = ["brief", "scene", "vote", "testify", "read", "process", "ask", "race", "reveal", "lightning", "puzzle", "board", "burst", "countdown", "liar", "verdict"] as const;
// A puzzle lock gets generous time (times each player's extra time); the board moves on early once everyone is done.
export const PUZZLE_SECONDS = 150;
export type LiveBeat = (typeof LIVE_BEATS)[number];
export type LiveRaceRound = { type: "race"; settings: ExpSettings; step: number; beat: LiveBeat; beatStartedAt: string; squadsOn: boolean; pinned?: string | null; pausedAt?: string | null;
  // holdBefore: a chunk (step) the teacher asked to pause before, from the content-note heads-up.
  holdBefore?: number | null;
  // interview.at: escape rooms with witnesses in the room, the lock (1-based) where each witness is met; null for the
  // Interview at the door. witness: who testifies now in a room (the door Interview uses step).
  interview?: { liar: number; witnesses: number; at?: number[] | null } | null; witness?: number | null;
  // The puzzle lock open now (lib/escape-room.ts), during the "puzzle" beat.
  puzzle?: string | null;
  // The escape timer's time used so far in this game (ms), added up as each beat inside the room ends; minutes the
  // teacher added (5 at a time); and whether the class saw it run out (the time-out moment shows once).
  clockUsedMs?: number; clockExtraMs?: number;
  // Each chamber the class has escaped (the inner door, then the exit): whether the board clock still had time left,
  // the time used then, and how many players or squads opened every lock and got the escape bonus.
  // escapers: players (or squads) who opened every lock; winners: those paid a bonus (one first try or more); squads:
  // each escaping squad's first tries, for the board.
  escaped?: { chamber: 1 | 2; step: number; inTime: boolean; usedMs: number; escapers?: number; winners: number; squads?: { name: string; firstTries: number }[] }[] };
export const interviewOf = (world: WorldPack, round: Pick<LiveRaceRound, "settings" | "interview">): Interview | null => (round.interview ? world.expeditions?.find((e) => e.id === round.settings.expeditionId)?.interview ?? null : null);
// The escape timer for a live game (lib/room-clock.ts): 35 minutes for each chamber the game plays (both, for the whole
// room), times 1.5 for More time, plus any minutes the teacher added; the time used; and since when it is running (null
// while the teacher has paused, or outside the room). Null when the teacher turned it off.
export function liveClock(round: LiveRaceRound, chunks: number, puzzles: RoomPuzzleAt[]) {
  void puzzles;
  const clock = round.settings.clock ?? "escape"; if (clock === "off") return null;
  const chambers = (round.settings.chamber ?? 0) === 0 && chunks > 1 ? 2 : 1;
  return { budgetMs: escapeBudgetMs(clock, round.settings.questionTime) * chambers + (round.clockExtraMs ?? 0), usedMs: (round.clockUsedMs ?? 0) + (round.pausedAt ? clockAdd(round, Date.now()) : 0), runningSince: clockRuns(round.beat) && !round.pausedAt ? round.beatStartedAt : null };
}
export const CLOCK_ADD_MS = ADD_MS;
// The time to add when a beat ends: the beat's running length if the clock runs on it, up to the pause when the teacher
// paused (so a pause holds the clock where it was, and moving on while paused keeps the time already used).
export const clockAdd = (round: LiveRaceRound, now: number) => (clockRuns(round.beat) ? Math.max(0, Math.min((round.pausedAt ? Date.parse(round.pausedAt) : now) - Date.parse(round.beatStartedAt), 36e5)) : 0);
export const isBeat = (b: unknown): b is LiveBeat => (LIVE_BEATS as readonly string[]).includes(String(b));

export function parseExpSettings(x: unknown, world: WorldPack, grade = 7): ExpSettings | null {
  const o = (x ?? {}) as Record<string, unknown>;
  const id = typeof o.expeditionId === "string" && world.expeditions?.some((e) => e.id === o.expeditionId) ? o.expeditionId : world.expeditions?.[0]?.id;
  if (!id) return null;
  const g = gradeOf([6, 7, 8, 9, 10].includes(Number(o.grade)) ? o.grade : o.gradeBand === "9-10" ? 9 : grade);
  const ch = Number(o.chamber), chamber: ChamberPick = ch === 1 || ch === 2 ? ch : 0;
  return { expeditionId: id, grade: g, gradeBand: bandOf(g), questions: o.questions !== false, highlighter: o.highlighter === true, autoAdvance: o.autoAdvance !== false, chamber, clock: roomClockOf(o.clock) };
}
export const liveArc = (world: WorldPack, round: Pick<LiveRaceRound, "settings">): Arc | null => { const e = world.expeditions?.find((x) => x.id === round.settings.expeditionId); return e ? arcOf(world, e) : null; };
export const liveRaceChunks = (world: WorldPack, passages: SourcePassage[], round: Pick<LiveRaceRound, "settings">) => expeditionChunks(world, passages, round.settings.expeditionId);
const rows = (responses: LiveResponse[], roundIndex: number, kind: string, step?: number) => responses.filter((r) => r.roundIndex === roundIndex && r.kind === kind && (step === undefined || r.payload.step === step));
// "Your question" comes on every third chunk, when the teacher has it on.
export const asksHere = (round: Pick<LiveRaceRound, "settings">, step: number) => round.settings.questions && step % 3 === 2;

// The next beat after this one; after the countdown, the next chunk (or the end).
// The chunks this game plays: the whole room, or one chamber.
export const liveSpan = (round: Pick<LiveRaceRound, "settings">, chunks: number) => chamberSpan(chunks, round.settings.chamber ?? 0);
// The first beat of a game: the Interview's first vote; for chamber 2 (the class already questioned the witnesses), the
// witnesses' statements again as a recap, with no vote; without an Interview, the first chunk of the span.
// Who testifies now: in a room, round.witness; at the door, the step.
export const witnessOf = (round: Pick<LiveRaceRound, "step" | "witness">) => round.witness ?? round.step;
// Witnesses in the room, before the reading at step s: chamber 2 first replays those met in chamber 1 (no vote, no new
// claim), then whoever is met at this lock, in lineup order.
export function roomWitnesses(at: number[] | null | undefined, s: number, span: { from: number }, recap: boolean) {
  if (!at) return [];
  const replay = recap && s === span.from ? at.flatMap((a, k) => (a <= span.from ? [k] : [])) : [];
  return [...replay, ...at.flatMap((a, k) => (a === s + 1 ? [k] : []))];
}
// Has witness k been met by now (step s; testifying: who is speaking, else null)? Earlier locks' witnesses, and this
// lock's once its testimony is over; while one of this lock's witnesses speaks, those before them in lineup order too.
export function roomMet(at: number[], s: number, testifying: number | null, k: number) {
  if (at[k] < s + 1) return true; if (at[k] !== s + 1) return false;
  return testifying == null ? true : at[testifying] === s + 1 && k <= testifying;
}
const toRead = (at: number[] | null | undefined, s: number, span: { from: number }, recap: boolean) => {
  if (!at) return { step: s, beat: "read" as const };
  const list = roomWitnesses(at, s, span, recap); return list.length ? { step: s, beat: "testify" as const, witness: list[0] } : { step: s, beat: "read" as const, witness: null };
};
export function firstBeat(settings: ExpSettings, chunks: number, interview: boolean, at: number[] | null = null): { step: number; beat: LiveBeat; witness?: number | null } {
  if (!interview || at) { const span = chamberSpan(chunks, settings.chamber ?? 0); return toRead(interview ? at : null, span.from, span, settings.chamber === 2); }
  return { step: 0, beat: settings.chamber === 2 ? "testify" : "vote" };
}
export function nextBeat(round: LiveRaceRound, chunks: RaceChunk[], arc: Arc | null = null, puzzles: RoomPuzzleAt[] = []): { step: number; beat: LiveBeat; puzzle?: string | null; witness?: number | null } | "end" {
  const b = round.beat, s = round.step, span = liveSpan(round, chunks.length), recap = round.settings.chamber === 2, at = round.interview?.at ?? null;
  if (b === "testify" && at) { const list = roomWitnesses(at, s, span, recap), n = list[list.indexOf(round.witness ?? -1) + 1];
    return n != null ? { step: s, beat: "testify", witness: n } : { step: s, beat: "read", witness: null }; }
  // Puzzle locks: one placed after this chunk comes after its reveal (and lightning beat); the inner door's code lock
  // after the checkpoint and the burst.
  const checkpointAt = isCheckpoint(s, chunks.length), placed = puzzles.find((p) => p.after === s && !p.innerDoor), inner = puzzles.find((p) => p.after === s && p.innerDoor);
  const afterLock = () => (placed ? { step: s, beat: "puzzle" as const, puzzle: placed.id } : { step: s, beat: (checkpointAt ? "board" : "countdown") as LiveBeat });
  const afterCheckpoint = () => (inner ? { step: s, beat: "puzzle" as const, puzzle: inner.id } : { step: s, beat: "countdown" as const });
  if (b === "puzzle") return puzzles.find((p) => p.id === round.puzzle)?.innerDoor ? { step: s, beat: "countdown" } : { step: s, beat: checkpointAt ? "board" : "countdown" };
  if (b === "vote") return { step: s, beat: "testify" };
  if (b === "testify") return s + 1 < (round.interview?.witnesses ?? 0) ? { step: s + 1, beat: recap ? "testify" : "vote" } : { step: span.from, beat: "read" };
  // The briefing on the board comes before the room starts; Start the clock opens the room's scene, and the scene moves on
  // to the room's first beat (a witness met at the first lock, or its reading), so no witness comes before the room.
  if (b === "brief") return { step: span.from, beat: "scene" };
  if (b === "scene") return firstBeat(round.settings, chunks.length, !!round.interview, at);
  if (b === "liar") return { step: s, beat: "verdict" };
  if (b === "verdict") return "end";
  // The Gist check about every third chunk (lib/formats.ts gistAt); otherwise straight on.
  if (b === "read") return { step: s, beat: gistAt(s) ? "process" : asksHere(round, s) ? "ask" : "race" };
  if (b === "process") return { step: s, beat: asksHere(round, s) ? "ask" : "race" };
  if (b === "ask") return { step: s, beat: "race" };
  if (b === "race") return { step: s, beat: "reveal" };
  // After the reveal: a lightning beat where one is placed, then the checkpoint (board and burst) after level 1.
  const checkpoint = isCheckpoint(s, chunks.length);
  if (b === "reveal") return arc?.lightning.some((l) => l.after === s) ? { step: s, beat: "lightning" } : afterLock();
  if (b === "lightning") return afterLock();
  if (b === "board") return checkpoint && arc?.burstAfter === s ? { step: s, beat: "burst" } : checkpoint ? afterCheckpoint() : { step: s, beat: "countdown" };
  if (b === "burst") return afterCheckpoint();
  // Chamber 1 ends at the inner door; the exit door (Name the Liar) closes the room.
  if (s + 1 <= span.to) return toRead(at, s + 1, span, recap);
  return round.settings.chamber === 1 ? "end" : round.interview ? { step: s, beat: "liar" } : "end";
}
// How long a beat runs for one player (milliseconds), or null for reading (no timer). The question's clock for Catch
// the Lie starts after the testimony.
export function beatMs(round: LiveRaceRound, chunk: RaceChunk | undefined, setting?: string | null) {
  const b = round.beat;
  if (b === "vote") return limitMs(VOTE_SECONDS, setting);
  if (b === "liar") return limitMs(LIAR_SECONDS, setting);
  if (b === "testify" || b === "verdict" || b === "brief" || b === "scene") return null;
  if (b === "read" || !chunk) return null;
  if (b === "process") return limitMs(GIST_SECONDS, setting);
  if (b === "ask") return limitMs(TYPED_SECONDS, setting);
  if (b === "lightning") return limitMs(LIGHTNING_SECONDS, setting);
  if (b === "puzzle") return limitMs(PUZZLE_SECONDS, setting);
  if (b === "burst") return limitMs(BURST_SECONDS, setting);
  if (b === "race") return limitMs(TYPE_INFO[chunk.chunk.question.type].seconds, questionSetting(setting, round.settings.questionTime)) + (chunk.chunk.question.type === "catch_lie" ? TESTIMONY_MS : 0);
  return Math.round(SCREEN_MS[b === "reveal" ? "result" : (b as "board" | "countdown")] * timeScale(setting));
}

// ---------- One player's chunk ----------
// points include the double (mult) and the streak bonus; version: the question version this player saw.
// The tier a phone is on: the easier version opens with the hint (tier 1) for free.
export const liveClueTier = (asked: number, free: boolean) => Math.max(asked, free ? 1 : 0) as ClueTier;
export type LiveTap = { plain?: boolean; clue?: ClueTier; step: number; answer: Answer; correct: boolean; answerRight: boolean; proofRight: boolean; late: boolean; points: number; elapsedMs: number; version?: Version; bank?: number; mult?: number; bonus?: number; verdict?: { strength: string; note: string; next: string } };
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
    // The clue tier this player asked for on this lock (lib/clues.ts).
    clue: Math.max(0, ...mine("race_clue").map((r) => Number(r.payload.tier) || 0)) as ClueTier,
    lightning: (mine("race_lightning")[0]?.payload as { correct: boolean; points: number } | undefined) ?? null,
    // The lock opened after a miss with the shown proof (0 points; lib/escape-room.ts).
    opened: !!tap?.correct || mine("race_recover").length > 0,
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
// puzzle: the puzzle lock open now, with its lines as text (code dials are checked against them).
// ---------- The chest (lib/engagement.ts), decided by the server ----------
// After a first-try proof only. The kit pieces this player has already found in this game are left out. opened: the
// chest for this lock has been opened (its reward saved as a race_chest response).
export function liveChest(responses: LiveResponse[], roundIndex: number, playerId: string, step: number, provedFirstTry: boolean) {
  const mineAll = responses.filter((r) => r.kind === "race_chest" && r.playerId === playerId);
  const opened = mineAll.find((r) => r.roundIndex === roundIndex && Number(r.payload.step) === step) ?? null;
  if (opened) return { chest: { coins: Number(opened.payload.coins) || 0, piece: (opened.payload.piece as KitId | null) ?? null } as Chest, opened: true };
  const owned = mineAll.map((r) => r.payload.piece).filter((p): p is string => typeof p === "string");
  const chest = chestFor(`${playerId}|${roundIndex}|${step}`, provedFirstTry, owned);
  return chest ? { chest, opened: false } : null;
}
export const chestCoinsOf = (responses: LiveResponse[], playerId: string) => responses.filter((r) => r.kind === "race_chest" && r.playerId === playerId).reduce((a, r) => a + (Number(r.payload.coins) || 0), 0);

export function raceAnswer(round: LiveRaceRound, chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, playerId: string, kind: string, payload: Record<string, unknown>, now: number, timeSetting: string, iv: Interview | null = null, arc: Arc | null = null, squadIds: string[] = [playerId], puzzle: RoomPuzzle | null = null, puzzleLines: string[] = [], roomNumber = 1): { payload: Record<string, unknown>; flagged: boolean } | string {
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
  // A puzzle lock: one try per player, scored here from what they tapped (never from the phone's own verdict).
  if (kind === "race_puzzle") {
    const p = puzzle;
    if (round.beat !== "puzzle" || !p || p.id !== round.puzzle) return "The puzzle isn't open.";
    if (rows(responses, roundIndex, "race_puzzle", round.step).some((r) => r.playerId === playerId && r.payload.id === p.id)) return "You've already locked in this puzzle.";
    const a = (payload.answer ?? {}) as Record<string, unknown>, ref = (x: unknown) => { const o = x as { p?: unknown; s?: unknown } | null; return o && typeof o.p === "string" && Number.isInteger(o.s) ? { p: o.p, s: o.s as number } : null; };
    const refs = (x: unknown) => Object.fromEntries(Object.entries(x && typeof x === "object" ? (x as Record<string, unknown>) : {}).slice(0, 8).map(([k, v]) => [String(k).slice(0, 40), ref(v)]));
    let firstTry: boolean[], points: number;
    if (p.type === "code") { const r = codeResultOf(p, puzzleLines, Array.isArray(a.taps) ? a.taps.map((t) => (Number.isInteger(t) ? (t as number) : null)) : []); firstTry = r.right; points = r.points; }
    else if (p.type === "painting") { const r = paintingResult(p, Array.isArray(a.marks) ? a.marks.map(String).slice(0, 6) : [], refs(a.proofs)); if (typeof r === "string") return r; firstTry = p.details.filter((d) => d.wrong).map((d) => { const k = (a.marks as string[]).indexOf(d.id); return k >= 0 && r.caught[k]; }); points = r.points; }
    else { const r = sceneResult(p, refs(a.matches)); firstTry = r.right; points = r.points; }
    return { payload: { step: round.step, id: p.id, type: p.type, firstTry, points }, flagged: false };
  }
  // After a miss: open the lock with the answer shown. Any time until the next chunk starts; it scores nothing.
  // Opening the chest: the reward is the server's own (liveChest), never the phone's.
  if (kind === "race_chest") {
    if (!["reveal", "lightning", "board", "burst", "countdown"].includes(round.beat)) return "There's no chest to open now.";
    const c = liveChest(responses, roundIndex, playerId, round.step, !!me.correct);
    if (!c) return "There's no chest for this lock.";
    if (c.opened) return "This chest is already open.";
    return { payload: { step: round.step, coins: c.chest.coins, piece: c.chest.piece }, flagged: false };
  }
  if (kind === "race_recover") {
    if (!["reveal", "lightning", "board", "burst", "countdown"].includes(round.beat)) return "This lock isn't waiting to be opened.";
    if (me.opened) return "This lock is already open.";
    const asked = playerAsked(chunks, responses, roundIndex, playerId, round.step)!, a = (payload.answer ?? {}) as Record<string, unknown>;
    const answer: Answer = { choice: Number.isInteger(a.choice) ? (a.choice as number) : null, lines: Array.isArray(a.lines) ? a.lines.map(String).slice(0, 2) : [],
      words: Array.isArray(a.words) ? a.words.filter((w) => Number.isInteger(w)).map(Number).slice(0, 60) : [], picks: Array.isArray(a.picks) ? a.picks.filter((p) => Number.isInteger(p)).map(Number).slice(0, 5) : [],
      placed: a.placed && typeof a.placed === "object" ? Object.fromEntries(Object.entries(a.placed as Record<string, unknown>).slice(0, 8).map(([k, v]) => [String(k).slice(0, 40), typeof v === "string" ? v.slice(0, 40) : null])) : {} };
    if (!recoveryOpens(asked.question, chunkTokens(chunk.lines), answer)) return "Not that one yet. Use the answer shown.";
    return { payload: { step: round.step, opened: true, points: 0 }, flagged: false };
  }
  // Squad escapes (lib/live/squad-escape.ts): the Recorder locks in one member's committed answer as the squad's,
  // once everyone in the squad has committed, once per lock.
  if (kind === "squad_lock") {
    if (!round.squadsOn || squadIds.length < 2) return "Shared lock-ins are for squads.";
    if (round.beat !== "race") return "The question isn't open.";
    if (recorderOf(squadIds, roomNumber) !== playerId) return "Your squad's Recorder locks in the answer.";
    if (squadLockOf(responses, roundIndex, round.step, squadIds)) return "Your squad has already locked in this one.";
    const committed = new Set(squadIds.filter((m) => playerChunk(responses, roundIndex, round.step, m).done));
    if (!sharedLockOpen(squadIds, committed)) return "Wait until everyone in your squad has committed.";
    const from = String(payload.from ?? ""); if (!committed.has(from)) return "Pick one of your squad's answers.";
    const tap = playerChunk(responses, roundIndex, round.step, from).tap!;
    const lock: SquadLock = { step: round.step, from, answer: tap.answer, correct: !!tap.correct, points: tap.correct ? SQUAD_LOCK_POINTS : 0, lines: tap.answer.lines ?? [] };
    return { payload: lock as unknown as Record<string, unknown>, flagged: false };
  }
  // Request a clue: the next tier, while the question is open and before the one shot. Points only, never time.
  if (kind === "race_clue") {
    if (round.beat !== "race") return "The question isn't open.";
    if (me.done) return "You've already answered this one.";
    const asked = playerAsked(chunks, responses, roundIndex, playerId, round.step)!, now = liveClueTier(me.clue, !!(asked.question as { showHint?: boolean }).showHint);
    if (now >= 3) return "That's every clue for this lock.";
    return { payload: { step: round.step, tier: now + 1 }, flagged: false };
  }
  if (kind === "race_tap") {
    if (round.beat !== "race") return "The question isn't open.";
    if (me.done) return "You've already answered this one.";
    // This player's version of the question (lib/pacing.ts).
    const asked = playerAsked(chunks, responses, roundIndex, playerId, round.step)!, q = asked.question, limit = limitMs(TYPE_INFO[q.type].seconds, questionSetting(timeSetting, round.settings.questionTime));
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
    // Clues cost points off this lock (the easier version's hint is free).
    const free = !!(q as { showHint?: boolean }).showHint, tier = liveClueTier(me.clue, free), cost = clueCost(tier) - (free && tier >= 1 ? CLUE_COST[1] : 0);
    const tap: LiveTap = { plain: payload.plain === true, step: round.step, answer, correct, answerRight: r.answer, proofRight: r.proof, late, clue: tier, points: late ? 0 : (r.points > 0 ? Math.max(0, r.points * mult - cost) : 0) + bonus, elapsedMs: elapsed, version: asked.version, bank: asked.bank, mult, bonus, ...(payload.__verdict ? { verdict: payload.__verdict as { strength: string; note: string; next: string } } : {}) };
    return { payload: tap as unknown as Record<string, unknown>, flagged: false };
  }
  return "That isn't a Proof Race answer.";
}

// ---------- Totals, board, reveal, podium, stats ----------
// Each player's points through a step (inclusive): Gist check and question points.
export function raceTotals(responses: LiveResponse[], roundIndex: number, players: LivePlayer[], through: number) {
  const t = new Map(players.map((p) => [p.id, 0]));
  for (const r of responses) if (r.roundIndex === roundIndex && (r.kind === "race_gist" || r.kind === "race_tap" || r.kind === "race_lightning" || r.kind === "race_burst" || r.kind === "liar_lock" || r.kind === "race_puzzle" || r.kind === "race_escape") && r.playerId && Number(r.payload.step) <= through) t.set(r.playerId, (t.get(r.playerId) ?? 0) + Number(r.payload.points ?? 0));
  return t;
}
// The board after a step: players (or squads, by average, when squads are on) with their move since the step before.
export function liveRaceBoard(responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: LiveSquad[], squadsOn: boolean, step: number) {
  const before = raceTotals(responses, roundIndex, players, step - 1), after = raceTotals(responses, roundIndex, players, step);
  if (squadsOn && squads.length) {
    const of = new Map(players.map((p) => [p.id, p.squadId]));
    const names = new Map(squads.map((s) => [s.id, s.name]));
    // Squad escapes: each shared lock-in that proved its lock adds to the squad's row.
    const plus = (t: Map<string, number>, upto: number) => { for (const s of squads) { const ids = players.filter((p) => p.squadId === s.id).map((p) => p.id); let add = 0; for (let k = 0; k <= upto; k++) add += squadLockOf(responses, roundIndex, k, ids)?.points ?? 0; add += squadEscapePoints(responses, roundIndex, ids, upto); if (add) t.set(s.id, (t.get(s.id) ?? 0) + add); } return t; };
    return { kind: "squad" as const, rows: raceBoard(plus(squadTotals(before, of), step - 1), plus(squadTotals(after, of), step), names) };
  }
  return { kind: "player" as const, rows: raceBoard(before, after, new Map(players.map((p) => [p.id, p.nickname]))) };
}
// The reveal: the proof (lines, or words with their token positions) and the share of players who found it.
export function raceReveal(chunk: RaceChunk, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  const found = players.filter((p) => playerChunk(responses, roundIndex, chunk.index, p.id).correct).length;
  // stillFinding: students who missed and haven't yet opened their lock with the proof; until it's 0 the board lights
  // only the paragraph, so the projector never hands over the line while they work through their hint steps.
  const stillFinding = players.filter((p) => !playerChunk(responses, roundIndex, chunk.index, p.id).opened).length;
  return { ...proofShown(chunk.chunk.question, chunkTokens(chunk.lines)), why: chunk.chunk.question.why, found, stillFinding, players: players.length, pct: players.length ? Math.round((found / players.length) * 100) : 0 };
}
// Class stats: the share who proved each chunk, and the 3 hardest.
export function chunkStatsOf(chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  const out = chunks.map((c) => { const found = players.filter((p) => playerChunk(responses, roundIndex, c.index, p.id).correct).length; return { index: c.index, question: c.chunk.question.prompt, type: TYPE_INFO[c.chunk.question.type].name, pct: players.length ? Math.round((found / players.length) * 100) : 0 }; });
  return { rows: out, hardest: [...out].sort((a, b) => a.pct - b.pct || a.index - b.index).slice(0, 3) };
}
// span: the chunks this game played (one chamber, or the whole room); the class stats cover only those.
export function raceFinish(chunks: RaceChunk[], responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: LiveSquad[], squadsOn: boolean, span = { from: 0, to: chunks.length - 1 }) {
  const board = liveRaceBoard(responses, roundIndex, players, squads, squadsOn, span.to);
  return { kind: board.kind, podium: podium(board.rows), stats: chunkStatsOf(chunks.slice(span.from, span.to + 1), responses, roundIndex, players) };
}
export const raceReadiness = (round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) =>
  readiness(rows(responses, roundIndex, "race_ready", round.step).map((r) => r.playerId!).filter(Boolean), players.map((p) => p.id), round.settings.autoAdvance);
// Who has answered this beat (the host can move on once most have; it waits only on extra time someone still uses).
export function raceDone(round: LiveRaceRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[]) {
  return players.filter((p) => {
    if (round.beat === "vote") return playerVote(responses, roundIndex, round.step, p.id) !== null;
    if (round.beat === "liar" || round.beat === "verdict") return !!playerLiar(responses, roundIndex, p.id);
    if (round.beat === "puzzle") return rows(responses, roundIndex, "race_puzzle", round.step).some((r) => r.playerId === p.id && r.payload.id === round.puzzle);
    const c = playerChunk(responses, roundIndex, round.step, p.id);
    // Squad escapes: a member is done with a lock once their squad has made its shared lock-in.
    if (round.beat === "race" && round.squadsOn && p.squadId) { const ids = players.filter((x) => x.squadId === p.squadId).map((x) => x.id); if (ids.length > 1) return c.done && !!squadLockOf(responses, roundIndex, round.step, ids); }
    return round.beat === "process" ? c.gist !== null : round.beat === "ask" ? c.asked : round.beat === "lightning" ? !!c.lightning : c.done;
  }).map((p) => p.id);
}
// A squad's shared lock-in at a lock (any member's row: only the Recorder can make one).
export const squadLockOf = (responses: LiveResponse[], roundIndex: number, step: number, ids: string[]) =>
  (rows(responses, roundIndex, "squad_lock", step).find((r) => r.playerId && ids.includes(r.playerId))?.payload as SquadLock | undefined) ?? null;
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

// ---------- The escape bonus (lib/room-clock.ts escapeBonusOf) ----------
// A live chamber is escaped when the class leaves its door: the inner door's puzzle lock for chamber 1, the end of the
// game after the exit (Name the Liar) for chamber 2. It is escaped in time when the board clock still has time left
// then. A player escapes it by opening every lock in it (proved, or opened after a miss with the proof); with squads on,
// a squad escapes by making its shared lock-in on every lock. Each escaper in time gets +100 for each of those locks
// proved on the first try (a squad: each shared lock-in that proved its lock), once per chamber. Never with the timer off.
export function escapeCheck(round: LiveRaceRound, chunks: number, now: number) {
  const c = liveClock(round, chunks, []); if (!c) return null;
  const usedMs = (round.clockUsedMs ?? 0) + clockAdd(round, now);
  return { usedMs, inTime: usedMs < c.budgetMs };
}
export function escapeWinners(round: LiveRaceRound, chunks: number, chamber: 1 | 2, responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: LiveSquad[]) {
  const span = chamberSpan(chunks, chamber), steps = Array.from({ length: span.to - span.from + 1 }, (_, i) => span.from + i);
  if (round.squadsOn && squads.length) return { kind: "squad" as const, step: span.to, ids: squads.map((s) => ({ squad: s.id, name: s.name, members: players.filter((p) => p.squadId === s.id).map((p) => p.id) }))
    .filter((s) => s.members.length && steps.every((k) => squadLockOf(responses, roundIndex, k, s.members)))
    .map((s) => ({ ...s, firstTries: steps.filter((k) => squadLockOf(responses, roundIndex, k, s.members)?.correct).length })) };
  return { kind: "player" as const, step: span.to, ids: players.filter((p) => steps.every((k) => playerChunk(responses, roundIndex, k, p.id).opened))
    .map((p) => ({ id: p.id, firstTries: steps.filter((k) => playerChunk(responses, roundIndex, k, p.id).correct).length })) };
}
// The squad escape bonus rows (squad_escape) a squad's members hold, through a step.
export const squadEscapePoints = (responses: LiveResponse[], roundIndex: number, ids: string[], upto: number) =>
  responses.filter((r) => r.roundIndex === roundIndex && r.kind === "squad_escape" && r.playerId && ids.includes(r.playerId) && Number(r.payload.step) <= upto).reduce((n, r) => n + Number(r.payload.points ?? 0), 0);
