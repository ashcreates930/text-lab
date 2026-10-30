// Server side of live class mode: tokens, loading a session, the host's and players' views, and every action. All
// writes come through here, so role gating, moderation and the judge cap are enforced in one place.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { WorldPack } from "../world-schema.ts";
import { readPassages, readWorld } from "../classroom/worlds.ts";
import { NOT_EVIDENCE, matchEvidence } from "../evidence-check.ts";
import type { SourcePassage } from "../source-passages.ts";
import { liveMissionPieces, liveMissionSetting, missionPick, missionSetting } from "./missions.ts";
import { answerStep, answeredStep, freezeAction, freezeView, liveStoryBoard, livePicks, myStepRecord, playerPicks, playerState, publicStory, readingAction, squadReading, stepKind, tryState, type LiveStoryRound } from "./story.ts";
import { screenMessage } from "../safety.ts";
import { liveRaceBoard, liveRaceChunks, nextBeat, playerChunk, raceAnswer, raceAnswered, raceDone, raceFinish, raceQuestions, raceReadiness, raceReveal, raceTotals, type LiveRaceRound } from "./race.ts";
import { hasProofRace, parseRaceSettings, raceLimitMs } from "../proof-race.ts";
import { checkWriting, yourTurnChoices, type YourTurnEntry } from "../your-turn.ts";
import { evidenceSentences, lineWords } from "../lies.ts";
import { AngleSchema } from "../student-role.ts";
import { inferQ, lieOf as storyLie, readQ, studentBoard, type RoundInput, type TimeSetting } from "../story-mode.ts";
import { absentDay, getClassroomStore, memoryModeEnabled } from "../classroom/store.ts";
import { screenArgument, judgeWithRubric } from "../verdict-server.ts";
import { getLieBankStore } from "../lie-bank-store.ts";
import { asLie, type PlantedLie } from "../planted-lies.ts";
import {
  DEMO_ROOM, OBJECTION_SECONDS, ROLE_INFO, buildSquads, mayAct, objectionResult, roundLie, rolesFor, rolesOf, roundTakesSquadAnswers, scoreLieRound,
  scoreVerdictRound, sessionScores, squadName, squadProgress, squadPurpose, strongestByTheory, tallyVotes,
  type LivePlayer, type LiveResponse, type ResponseKind, type Role, type Round, type RoundType,
} from "./engine.ts";
import type { LiveStore, StoredSession } from "./store.ts";

// ---------- Tokens ----------
function secret() {
  const value = process.env.CLASS_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || (memoryModeEnabled() ? "local-dev-only-secret" : "");
  if (!value) throw new Error("No live token secret configured.");
  return value;
}
const sign = (value: string) => createHmac("sha256", `itt-live:${secret()}`).update(value).digest("base64url");
const safeEqual = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export const newHostToken = () => randomBytes(24).toString("base64url");
export const hashHostToken = (t: string) => createHash("sha256").update(t).digest("hex");
export const isHost = (s: StoredSession, token: string | null | undefined) => !!token && safeEqual(hashHostToken(token), s.hostHash);
export const playerToken = (sessionId: string, playerId: string) => `${playerId}.${sign(`${sessionId}:${playerId}`)}`;
export function playerFromToken(sessionId: string, token: string | null | undefined) {
  const [playerId, sig] = (token ?? "").split(".");
  return playerId && sig && safeEqual(sig, sign(`${sessionId}:${playerId}`)) ? playerId : null;
}
// The Witness stand phone (Hologram mode) gets a link signed for this session; it can only watch, never act.
export const witnessToken = (sessionId: string) => sign(`${sessionId}:witness`);
export const isWitness = (sessionId: string, token: string | null | undefined) => !!token && safeEqual(token, witnessToken(sessionId));
const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const newJoinCode = () => Array.from(randomBytes(6), (b) => CODE_LETTERS[b % CODE_LETTERS.length]).join("");

// ---------- Realtime ping ----------
// Tells every open screen of a session to refetch. The ping carries no data; screens also poll as a fallback.
export async function broadcast(sessionId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ topic: `live:${sessionId}`, event: "changed", payload: { at: Date.now() } }] }) });
  } catch { /* screens poll anyway */ }
}

// ---------- Loading ----------
// bank: the class's approved planted lies for this story (class sessions only).
// absent: player ids whose students were marked absent on the session's day (left out of Story Mode squad averages).
export type LiveState = { session: StoredSession; world: WorldPack; squads: Awaited<ReturnType<LiveStore["listSquads"]>>; players: LivePlayer[]; responses: LiveResponse[]; bank?: PlantedLie[]; passages?: SourcePassage[]; absent?: string[] };
export async function loadState(store: LiveStore, sessionId: string): Promise<LiveState | null> {
  const session = await store.getSession(sessionId);
  if (!session) return null;
  const world = await readWorld(session.worldId);
  if (!world) return null;
  const [squads, players, responses, bank, passages, absentStudents] = await Promise.all([store.listSquads(sessionId), store.listPlayers(sessionId), store.listResponses(sessionId), loadBank(session), readPassages(session.worldId), loadAbsent(session)]);
  const away = new Set(absentStudents);
  return { session, world, squads, players, responses, bank, passages, absent: players.filter((p) => p.studentId && away.has(p.studentId)).map((p) => p.id) };
}
// What a player sees once the host starts Your Turn: first "Unlock your challenge" (ask: the two interest questions),
// then their two activities and what they've already saved. A player who skipped gets the cold case file.
function yourTurnView(st: LiveState, playerId: string) {
  if (!st.responses.some((r) => r.kind === "your_turn_start") || !st.world.your_turn) return null;
  const answered = st.responses.filter((r) => r.kind === "your_turn_angle" && r.playerId === playerId).at(-1);
  if (!answered) return { ask: true, choices: [] as string[], done: [] as string[] };
  const angle = AngleSchema.safeParse(answered.payload);
  return { ask: false, choices: yourTurnChoices(st.world, angle.success ? angle.data : null), done: st.responses.filter((r) => r.kind === "your_turn" && r.playerId === playerId).map((r) => String(r.payload.title ?? "")) };
}
// Students marked absent on the day the session was held (New York date), so an old session's totals don't change
// with later marks. None before the absent migration runs, or for a session without a class.
async function loadAbsent(session: StoredSession) {
  const classes = session.classId ? getClassroomStore() : null;
  if (!classes || !session.classId) return [];
  return classes.getAbsentOn(session.classId, absentDay(new Date(session.createdAt))).catch(() => []);
}
async function loadBank(session: StoredSession) {
  const lies = session.classId ? getLieBankStore() : null;
  if (!lies || !session.classId) return [];
  return (await lies.listForClass(session.classId).catch(() => [])).filter((l) => l.status === "approved" && l.worldId === session.worldId);
}
export const expired = (s: StoredSession, now = Date.now()) => new Date(s.expiresAt).getTime() < now;
const members = (st: LiveState, squadId: string) => st.players.filter((p) => p.squadId === squadId).map((p) => p.id);
const currentRound = (st: LiveState): Round | undefined => st.session.rounds[st.session.roundIndex];
const HIDDEN = "Hidden for the teacher to review.";

// ---------- Views ----------
const lieOf = (st: LiveState, round: Round | undefined) => roundLie(st.world, round);
const writerOf = (round: Round | undefined) => (round?.type === "lie" ? round.planted?.writerSquadId ?? null : null);
// Objection!: what the reveal means for the two squads involved (everyone else only voted).
function objectionMine(reveal: { type: string; sustained?: boolean; scores?: { squadId: string; points: number }[] }, squadId: string) {
  if (reveal.type !== "objection" || !reveal.scores) return null;
  const i = reveal.scores.findIndex((x) => x.squadId === squadId);
  if (i < 0) return null;
  const detail = i === 0 ? (reveal.sustained ? "Your counter beat their evidence" : "Their evidence held") : reveal.sustained ? "Their counter beat your evidence" : "Your evidence held";
  return { points: reveal.scores[i].points, detail };
}
function revealFor(st: LiveState) {
  const round = currentRound(st), i = st.session.roundIndex;
  if (!round) return null;
  if (round.type === "story") { const b = liveStoryBoard(st.responses, i, st.players, st.squads, round.squadsOn, st.absent); return { type: "story" as const, kind: b.kind, top: b.rows.slice(0, 5).map((r, k) => ({ rank: k + 1, name: r.name, score: r.score })), players: b.rows.length }; }
  if (round.type === "lie") {
    const lie = lieOf(st, round)!;
    return { type: "lie" as const, truthLine: lie.truth_line, explanation: lie.explanation, falseClaim: lie.false_claim,
      squads: scoreLieRound(lie, st.squads, st.responses, i, writerOf(round)).map((r) => ({ ...r, explanation: r.explanation && st.responses.some((x) => x.roundIndex === i && x.squadId === r.squadId && x.kind === "explain" && x.flagged) ? HIDDEN : r.explanation })) };
  }
  if (round.type === "verdict") {
    const scores = scoreVerdictRound(st.squads, st.responses, i);
    return { type: "verdict" as const, votes: tallyVotes(st.world, st.responses, i), squads: scores, strongest: Object.fromEntries(strongestByTheory(scores)) };
  }
  if (round.type === "race") return null;
  return { type: "objection" as const, ...objectionResult(round, st.responses, i) };
}
function squadSummary(st: LiveState, squadId: string) {
  const round = currentRound(st), ids = members(st, squadId), roles = rolesFor(ids, Math.max(0, st.session.roundIndex));
  const progress = squadProgress(round, st.responses, squadId, st.session.roundIndex);
  return { ids, roles, progress };
}
const storyScene = (st: LiveState, round: LiveStoryRound) => st.world.scenes.find((s) => s.id === round.sceneId && s.story_mode);
const publicRound = (st: LiveState) => {
  const round = currentRound(st);
  if (!round) return null;
  if (round.type === "story") { const scene = storyScene(st, round); return scene ? publicStory(st.world, st.passages ?? [], scene, round) : null; }
  if (round.type === "race") return publicRace(st, round);
  if (round.type === "lie") {
    const lie = lieOf(st, round)!, scene = st.world.scenes.find((s) => s.id === round.sceneId)!, clue = scene.artifacts.find((a) => a.id === lie.clue_id)!;
    const who = st.world.characters.find((c) => c.id === lie.character_id)!;
    // Never send a planted lie's snapshot (it holds the answer); only whether a classmate wrote it.
    return { type: round.type, sceneId: round.sceneId, planted: !!round.planted, testimony: lie.testimony, characterId: who.id, character: who.name, portrait: who.portrait ?? null, clueName: clue.name, evidence: clue.source_anchor, topic: lie.topic };
  }
  if (round.type === "verdict") return { ...round, question: st.world.verdict?.question ?? "", theories: st.world.verdict?.theories ?? [] };
  // In the vote stage everyone sees the counter they are judging (a flagged sentence stays hidden).
  const o = round.stage === "vote" ? objectionResult(round, st.responses, st.session.roundIndex) : null;
  return { ...round, defendSquad: st.squads.find((s) => s.id === round.defendSquadId)?.name ?? "", objectSquad: st.squads.find((s) => s.id === round.objectSquadId)?.name ?? "", counter: o?.countered ? { line: o.counterLine, text: o.counterText } : null };
};
// Proof Race for everyone: the beat, the chunk, the question once the race opens, and after it the reveal and board.
function publicRace(st: LiveState, round: LiveRaceRound) {
  const chunks = liveRaceChunks(st.world, st.passages ?? [], round), c = chunks[round.step], i = st.session.roundIndex;
  if (!c) return null;
  const after = round.beat === "reveal" || round.beat === "board" || st.session.status === "ended";
  const pinned = round.pinned ? st.responses.find((r) => r.id === round.pinned && !r.flagged) : undefined;
  return {
    type: "race" as const, step: round.step, total: chunks.length, beat: round.beat, beatStartedAt: round.beatStartedAt, squadsOn: round.squadsOn,
    seconds: round.settings.seconds, processSeconds: 15, chunkSize: round.settings.chunkSize,
    chunk: { passages: c.passages.map((p) => ({ id: p.id, text: p.text })), sceneId: c.sceneId, process: c.process, gist: c.gist ? c.gist.options : null, samePassage: c.samePassage },
    question: round.beat === "race" || after ? c.question : null,
    reveal: after ? raceReveal(c, st.responses, i, st.players) : null,
    board: round.beat === "board" || st.session.status === "ended" ? (() => { const b = liveRaceBoard(st.responses, i, st.players, st.squads, round.squadsOn, round.step); return { kind: b.kind, top: b.rows.slice(0, 5) }; })() : null,
    finish: st.session.status === "ended" ? (() => { const f = raceFinish(chunks, st.responses, i, st.players, st.squads, round.squadsOn); return { ...f, podium: f.podium.map((r) => ({ ...r, portrait: f.kind === "player" ? avatarOf(st, r.id)?.portrait ?? null : null })) }; })() : null,
    pinned: pinned ? String(pinned.payload.text) : null,
  };
}
// Lobby: each player's avatar (a story character's portrait).
const avatarOf = (st: LiveState, playerId: string) => { const r = [...st.responses].reverse().find((x) => x.kind === "avatar" && x.playerId === playerId); const c = r ? st.world.characters.find((ch) => ch.id === r.payload.characterId) : undefined; return c ? { id: c.id, name: c.name, portrait: c.portrait ?? null } : null; };
const avatarChoices = (st: LiveState) => st.world.characters.filter((c) => c.portrait).map((c) => ({ id: c.id, name: c.name, portrait: c.portrait! }));
const sessionInfo = (st: LiveState) => ({ id: st.session.id, code: st.session.code, status: st.session.status, paused: st.session.paused, roundIndex: st.session.roundIndex, roundCount: st.session.rounds.length, roundStartedAt: st.session.roundStartedAt, worldId: st.session.worldId, title: st.world.title, demo: st.session.demo, expiresAt: st.session.expiresAt, hasVerdict: !!st.world.verdict });

export function hostView(st: LiveState) {
  const round = currentRound(st);
  const squads = st.squads.map((s) => {
    const { ids, roles, progress } = squadSummary(st, s.id);
    return { id: s.id, name: s.name, members: ids.map((pid) => ({ id: pid, nickname: st.players.find((p) => p.id === pid)!.nickname, roles: rolesOf(roles, pid) })), submitted: !!progress.submitted, waitingFor: progress.waitingFor };
  });
  const answering = squads.filter((s) => s.members.length);
  // Squads answering right now: in Objection! only the objecting squad writes a counter.
  const answeringNow = !roundTakesSquadAnswers(round) ? [] : round?.type === "objection" ? answering.filter((s) => s.id === round.objectSquadId) : answering.filter((s) => s.id !== writerOf(round));
  const flagged = st.responses.filter((r) => r.flagged && r.roundIndex === st.session.roundIndex).length;
  return {
    session: sessionInfo(st), round: publicRound(st), purpose: round ? squadPurpose(round.type) : "",
    // The lobby board: names and avatars as they join; Proof Race readiness, answers and student questions.
    lobby: st.players.map((p) => ({ id: p.id, nickname: p.nickname, avatar: avatarOf(st, p.id), extraTime: ([...st.responses].reverse().find((r) => r.kind === "player_time" && r.payload.playerId === p.id)?.payload.setting as string | undefined) ?? null })),
    proofRace: hasProofRace(st.world),
    race: round?.type === "race" ? { ready: raceReadiness(round, st.responses, st.session.roundIndex, st.players), answered: raceAnswered(round, st.responses, st.session.roundIndex, st.players), done: raceDone(round, st.responses, st.session.roundIndex, st.players), questions: raceQuestions(st.responses, st.session.roundIndex, round.step), pinned: round.pinned ?? null } : null,
    squads, unassigned: st.players.filter((p) => !p.squadId).map((p) => ({ id: p.id, nickname: p.nickname })),
    counters: { players: st.players.length, squadsJoined: answering.length, squadsAnswering: answeringNow.length, squadsSubmitted: answeringNow.filter((s) => s.submitted).length,
      votes: round?.type === "verdict" || round?.type === "objection" ? new Set(st.responses.filter((r) => r.roundIndex === st.session.roundIndex && (r.kind === "vote" || r.kind === "counter_vote")).map((r) => r.playerId)).size : 0 },
    votes: round?.type === "verdict" ? tallyVotes(st.world, st.responses, st.session.roundIndex) : null,
    reveal: st.session.status === "reveal" ? revealFor(st) : null,
    scores: sessionScores(st.world, st.session, st.squads, st.responses, st.players, st.absent),
    flagged,
    canObjection: hasVerdictPins(st) && st.squads.filter((s) => members(st, s.id).length).length >= 2,
    witnessToken: witnessToken(st.session.id),
    lieBank: (st.bank ?? []).map((l) => ({ id: l.id, label: `${st.world.characters.find((c) => c.id === l.characterId)?.name ?? "A character"}: ${l.sentence}` })),
    writerSquadId: writerOf(round),
    // Story Mode: the scenes that have it, how many players answered this step, and the top 5 at the reveal.
    storyScenes: st.world.scenes.map((sc, k) => ({ sceneId: sc.id, label: `Scene ${k + 1}`, on: !!sc.story_mode })).filter((x) => x.on),
    // Your Turn: started for everyone, and how many have saved theirs.
    yourTurn: st.world.your_turn ? { started: st.responses.some((r) => r.kind === "your_turn_start"), saved: new Set(st.responses.filter((r) => r.kind === "your_turn").map((r) => r.playerId)).size } : null,
    storyAnswered: round?.type === "story" ? answeredStep(st.responses, st.session.roundIndex, round.step) : 0,
    // Who's here: class students can be marked absent for the session's day (left out of squad averages).
    roster: st.players.map((p) => ({ id: p.id, nickname: p.nickname, canMark: !!p.studentId && !!st.session.classId, absent: (st.absent ?? []).includes(p.id) })),
    storyBoard: round?.type === "story" ? (() => { const b = liveStoryBoard(st.responses, st.session.roundIndex, st.players, st.squads, round.squadsOn, st.absent); return { kind: b.kind, top: b.rows.slice(0, 5).map((r, k) => ({ rank: k + 1, name: r.name, score: r.score })), players: b.rows.length }; })() : null,
    // Story missions: the options, the current setting, and each squad's mission and pieces.
    missions: st.world.missions?.length ? { options: st.world.missions.map((m) => ({ id: m.id, title: m.title })), ...liveMissionSetting(st.responses), squads: st.squads.map((q) => ({ name: q.name, mission: liveMissionPieces(st.world, st.responses, q.id, st.players.filter((p) => p.squadId === q.id).map((p) => p.id)) })) } : null,
    lieScenes: st.world.scenes.filter((s) => s.lie).map((s, i) => ({ sceneId: s.id, label: `Scene ${st.world.scenes.indexOf(s) + 1}: ${s.lie!.topic}` , index: i })),
  };
}

// What the Witness stand phone shows: the testifying character and their line during Spot the Lie, and when the host
// last asked it to play.
function storyWitness(st: LiveState, round: LiveStoryRound) {
  const scene = storyScene(st, round), kind = stepKind(round.step);
  const picks = scene ? livePicks(scene) : null, lie = scene && picks ? storyLie(scene, picks) : null;
  const speak = scene && picks && round.showing === "round" && st.session.status === "round" ? (kind === "confront" ? { id: scene.story_mode!.infer.character_id, line: inferQ(scene, picks).question } : kind === "lie" && lie ? { id: lie.character_id, line: lie.testimony } : null) : null;
  const who = speak ? st.world.characters.find((c) => c.id === speak.id) : undefined;
  return { story: who && speak ? { character: { id: who.id, name: who.name, portrait: who.portrait, hologram: who.hologram }, line: speak.line } : null };
}
export function witnessView(st: LiveState) {
  const round = currentRound(st), lie = lieOf(st, round);
  const who = lie ? st.world.characters.find((c) => c.id === lie.character_id) : undefined;
  const cue = [...st.responses].reverse().find((r) => r.roundIndex === st.session.roundIndex && r.kind === "witness");
  return {
    session: { id: st.session.id, title: st.world.title, worldId: st.session.worldId, status: st.session.status },
    // Story Mode: the character who confronts the student (round 2) or testifies (round 3) takes the stand.
    ...(round?.type === "story" ? storyWitness(st, round) : {}),
    witness: st.session.status === "round" && lie && who ? { character: { id: who.id, name: who.name, portrait: who.portrait, hologram: who.hologram }, line: lie.testimony } : null,
    playKey: cue ? `${st.session.roundIndex}:${cue.id}` : null,
  };
}

export function playerView(st: LiveState, playerId: string) {
  const me = st.players.find((p) => p.id === playerId)!;
  const round = currentRound(st), i = st.session.roundIndex;
  const squad = me.squadId ? st.squads.find((s) => s.id === me.squadId) ?? null : null;
  const summary = squad ? squadSummary(st, squad.id) : null;
  const myRoles = summary ? rolesOf(summary.roles, me.id) : [];
  const p = summary?.progress;
  const text = (r: LiveResponse | undefined, key: string) => (r ? (r.flagged ? HIDDEN : String(r.payload[key] ?? "")) : "");
  const myVote = [...st.responses].reverse().find((r) => r.roundIndex === i && r.playerId === me.id && r.kind === "vote")?.payload.theoryId ?? null;
  const myCounterVote = [...st.responses].reverse().find((r) => r.roundIndex === i && r.playerId === me.id && r.kind === "counter_vote")?.payload.sustain ?? null;
  // Only the squad whose turn it is answers an objection; everyone votes on it.
  const plantedByMySquad = !!squad && writerOf(round) === squad.id;
  const answering = !!squad && roundTakesSquadAnswers(round) && !plantedByMySquad && (round?.type !== "objection" || round.objectSquadId === squad.id);
  const reveal = st.session.status === "reveal" ? revealFor(st) : null;
  // Story Mode: this player's own answers, points and place (the top 5 and their own rank, never the full list).
  const story = round?.type === "story" ? (() => {
    const state = playerState(st.responses, i, me.id), board = liveStoryBoard(st.responses, i, st.players, st.squads, round.squadsOn, st.absent);
    const view = studentBoard(board.rows, board.kind === "squad" ? me.squadId : me.id);
    const scene = storyScene(st, round);
    const reading = scene && me.squadId && round.showing === "round" ? squadReading(scene, round, st.responses, i, st.players, me.squadId, me.id, st.absent) : null;
    const freeze = round.showing === "round" ? freezeView(round, st.responses, i, st.squads, st.players, me.id, Date.now()) : null;
    // This player's own round 1 question (in squads it matches their chunk) and their try in progress this step.
    const picks = scene ? playerPicks(st.world, st.passages ?? [], scene, "", reading?.myChunk ?? null) : null;
    const tried = round.showing === "round" ? tryState(st.responses, i, round.step, me.id) : null;
    return { reading, freeze, focus: scene && picks ? readQ(scene, picks).focus : null, try: tried ? { notYet: tried.notYet ?? null, next: tried.next ?? null, locked: tried.attempt.locked.map((l) => l.line) } : null, answered: !!myStepRecord(st.responses, i, round.step, me.id), last: round.showing === "board" || st.session.status !== "round" ? myStepRecord(st.responses, i, round.step, me.id) : null, total: state.total, pouch: state.pouch, board: view, boardKind: board.kind };
  })() : null;
  return {
    session: sessionInfo(st), round: publicRound(st), purpose: round ? squadPurpose(round.type) : "", story, yourTurn: yourTurnView(st, me.id),
    avatar: avatarOf(st, me.id), avatars: avatarChoices(st),
    // Proof Race: this player's chunk (ready, summary, question, taps), their points, place and points gained.
    race: round?.type === "race" ? (() => {
      const mine = playerChunk(st.responses, i, round.step, me.id), board = liveRaceBoard(st.responses, i, st.players, st.squads, round.squadsOn, round.step);
      const meRow = board.rows.find((r) => r.id === (board.kind === "squad" ? me.squadId : me.id)) ?? null;
      const setting = ([...st.responses].reverse().find((r) => r.kind === "player_time" && r.payload.playerId === me.id)?.payload.setting as string | undefined) ?? "1";
      return { mine, total: raceTotals(st.responses, i, st.players, round.step).get(me.id) ?? 0, place: meRow ? { rank: meRow.rank, of: board.rows.length, move: meRow.move, gained: meRow.gained } : null, limitMs: raceLimitMs(round.settings.seconds, setting), extraTime: setting !== "1" };
    })() : null,
    // Story missions: this squad's mission and pieces, or the choice when squads pick.
    mission: (() => { const set = liveMissionSetting(st.responses); if (!st.world.missions?.length || (!set.missionId && !set.squadsChoose)) return null; const ids = me.squadId ? st.players.filter((p) => p.squadId === me.squadId).map((p) => p.id) : [me.id]; return { current: liveMissionPieces(st.world, st.responses, me.squadId, ids), choose: set.squadsChoose && !!me.squadId ? st.world.missions.map((m) => ({ id: m.id, title: m.title, problem: m.problem })) : null }; })(),
    me: { id: me.id, nickname: me.nickname },
    squad: squad && summary ? { id: squad.id, name: squad.name, members: summary.ids.map((pid) => ({ id: pid, nickname: st.players.find((x) => x.id === pid)!.nickname, roles: rolesOf(summary.roles, pid) })) } : null,
    myRoles, roleInfo: ROLE_INFO, answering, plantedByMySquad,
    progress: p ? { pin: p.pin ? String(p.pin.payload.quote) : "", explanation: text(p.explain, "text"), pins: (p.pins?.payload.pins ?? []) as { clueId?: string; quote: string }[], argument: text(p.argument, "text"), skeptic: p.skeptic?.kind ?? null, approved: p.approved, submitted: !!p.submitted, canSubmit: p.canSubmit, waitingFor: p.waitingFor, objectionNote: p.skeptic?.kind === "object" ? String(p.skeptic.payload.note ?? "") : "" } : null,
    myVote, myCounterVote,
    squadTheory: squad && round?.type === "verdict" ? squadMajority(st, squad.id) : null,
    reveal: reveal && squad ? { ...reveal, mine: "squads" in reveal ? (reveal.squads as { squadId: string }[]).find((x) => x.squadId === squad.id) ?? null : objectionMine(reveal, squad.id) } : reveal,
    score: squad ? sessionScores(st.world, st.session, st.squads, st.responses, st.players, st.absent).find((s) => s.squadId === squad.id)?.points ?? 0 : 0,
  };
}
function squadMajority(st: LiveState, squadId: string) {
  const ids = new Set(members(st, squadId)), i = st.session.roundIndex, latest = new Map<string, string>();
  for (const r of st.responses) if (r.roundIndex === i && r.kind === "vote" && r.playerId && ids.has(r.playerId)) latest.set(r.playerId, String(r.payload.theoryId));
  const counts = new Map<string, number>();
  for (const v of latest.values()) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
function hasVerdictPins(st: LiveState) {
  return st.session.rounds.some((r, i) => r.type === "verdict" && st.squads.some((s) => squadProgress(r, st.responses, s.id, i).submitted));
}

// ---------- Host actions ----------
export type HostAction =
  | { action: "squads.auto" } | { action: "squads.move"; playerId: string; squadId: string | null }
  | { action: "round.start"; type: RoundType; sceneId?: string; plantedId?: string; squads?: boolean; freezes?: boolean } | { action: "round.stage" } | { action: "round.reveal" }
  | { action: "pause" } | { action: "resume" } | { action: "end" } | { action: "witness.play" } | { action: "player.absent"; playerId: string; absent: boolean } | { action: "yourturn.start" }
  | { action: "override"; key: "sound"; squadId: string; value: boolean } | { action: "override"; key: "objection"; value: boolean }
  | { action: "mission.set"; missionId?: string | null; squadsChoose?: boolean }
  | { action: "race.next" } | { action: "race.pin"; questionId: string | null } | { action: "player.time"; playerId: string; setting: TimeSetting };

export async function hostAct(store: LiveStore, st: LiveState, a: HostAction): Promise<string | null> {
  const s = st.session, round = currentRound(st);
  // Your Turn can start after the game, even once the session has ended.
  if (s.status === "ended" && a.action !== "yourturn.start") return "This live round has ended.";
  switch (a.action) {
    case "squads.auto": {
      const groups = buildSquads(st.players.map((p) => p.id));
      const squads = await store.replaceSquads(s.id, groups.map((_, i) => squadName(i)));
      await store.setSquads(s.id, groups.flatMap((ids, i) => ids.map((playerId) => ({ playerId, squadId: squads[i].id }))));
      return null;
    }
    case "squads.move": {
      if (a.squadId && !st.squads.some((x) => x.id === a.squadId)) return "That squad no longer exists.";
      await store.setSquads(s.id, [{ playerId: a.playerId, squadId: a.squadId }]);
      return null;
    }
    case "round.start": {
      if (s.status === "round") return "Reveal this round before starting the next.";
      // Proof Race needs no squads (squads on pools their points by average).
      if (a.type === "race") {
        if (!hasProofRace(st.world)) return "This story has no Proof Race chunks yet.";
        const settings = parseRaceSettings((a as { settings?: unknown }).settings);
        const first = liveRaceChunks(st.world, st.passages ?? [], { type: "race", settings, step: 0, beat: "read", beatStartedAt: "", squadsOn: false });
        const race: LiveRaceRound = { type: "race", settings, step: 0, beat: first[0]?.samePassage ? "race" : "read", beatStartedAt: new Date().toISOString(), squadsOn: a.squads === true && st.squads.length > 0, pinned: null };
        await store.updateSession(s.id, { rounds: [...s.rounds, race], roundIndex: s.rounds.length, status: "round", paused: false, roundStartedAt: new Date().toISOString() });
        return null;
      }
      if (!st.squads.length) return "Build squads first.";
      let next: Round;
      if (a.type === "lie" && a.plantedId) {
        // A classmate's approved lie: snapshot it, and the squad its writer is in sits this round out.
        const p = (st.bank ?? []).find((l) => l.id === a.plantedId);
        if (!p) return "That lie isn't in your class's Lie bank.";
        const writer = p.studentId ? st.players.find((x) => x.studentId === p.studentId) : undefined;
        next = { type: "lie", sceneId: p.sceneId, planted: { id: p.id, lie: asLie(p, st.world), writerSquadId: writer?.squadId ?? null } };
      } else if (a.type === "lie") {
        const used = new Set(s.rounds.filter((r) => r.type === "lie").map((r) => (r as { sceneId: string }).sceneId));
        const scene = st.world.scenes.find((x) => x.id === a.sceneId && x.lie) ?? st.world.scenes.find((x) => x.lie && !used.has(x.id)) ?? st.world.scenes.find((x) => x.lie);
        if (!scene) return "This story has no Spot the Lie testimony.";
        next = { type: "lie", sceneId: scene.id };
      } else if (a.type === "story") {
        const scene = st.world.scenes.find((x) => x.id === a.sceneId && x.story_mode) ?? st.world.scenes.find((x) => x.story_mode);
        if (!scene) return "This story has no Story Mode yet.";
        next = { type: "story", sceneId: scene.id, step: 0, showing: "round", stepStartedAt: new Date().toISOString(), squadsOn: a.squads === true, freezesOn: a.squads === true && a.freezes === true };
      } else if (a.type === "verdict") {
        if (!st.world.verdict) return "This story has no verdict question.";
        next = { type: "verdict", stage: "vote" };
      } else {
        const pairing = objectionPairing(st);
        if (!pairing) return "Play a Verdict Vote first, with at least two squads.";
        next = { type: "objection", stage: "counter", ...pairing, endsAt: new Date(Date.now() + (OBJECTION_SECONDS + 1) * 1000).toISOString() };
      }
      await store.updateSession(s.id, { rounds: [...s.rounds, next], roundIndex: s.rounds.length, status: "round", paused: false, roundStartedAt: new Date().toISOString() });
      return null;
    }
    case "round.stage": {
      if (round?.type === "verdict" && round.stage === "vote") return set(store, st, { ...round, stage: "argue" });
      if (round?.type === "objection" && round.stage === "counter") return set(store, st, { ...round, stage: "vote" });
      // Story Mode: a round, then its leaderboard reveal, then the next round. After round 4's board, Reveal finishes.
      if (round?.type === "story" && round.showing === "round") return set(store, st, { ...round, showing: "board" });
      if (round?.type === "story" && round.step < 3) return set(store, st, { ...round, step: round.step + 1, showing: "round", stepStartedAt: new Date().toISOString() });
      return "This round has no next step.";
    }
    // Proof Race: the next beat (read, summary or question, race, reveal, board), then the next chunk; the end is the podium.
    case "race.next": {
      if (round?.type !== "race" || s.status !== "round") return "No Proof Race is running.";
      const n = nextBeat(round, liveRaceChunks(st.world, st.passages ?? [], round));
      if (n === "end") { await store.updateSession(s.id, { status: "ended", paused: false }); return null; }
      return set(store, st, { ...round, step: n.step, beat: n.beat, beatStartedAt: new Date().toISOString(), pinned: n.step === round.step ? round.pinned ?? null : null });
    }
    case "race.pin": {
      if (round?.type !== "race") return "No Proof Race is running.";
      if (a.questionId && !st.responses.some((r) => r.id === a.questionId && r.kind === "race_question" && !r.flagged)) return "That question can't be pinned.";
      return set(store, st, { ...round, pinned: a.questionId });
    }
    case "player.time": {
      if (!st.players.some((p) => p.id === a.playerId) || !["1", "1.5", "2", "untimed"].includes(a.setting)) return "Pick a player and a time.";
      await store.addResponse(s.id, { roundIndex: s.roundIndex, squadId: null, playerId: null, role: "host", kind: "player_time", payload: { playerId: a.playerId, setting: a.setting }, flagged: false });
      return null;
    }
    case "round.reveal": if (s.status !== "round") return "No round to reveal."; await store.updateSession(s.id, { status: "reveal" }); return null;
    case "pause": await store.updateSession(s.id, { paused: true }); return null;
    case "resume": await store.updateSession(s.id, { paused: false }); return null;
    case "end": await store.updateSession(s.id, { status: "ended", paused: false }); return null;
    // Story missions: one mission for everyone, squads choose, or off (missionId null).
    case "mission.set": {
      const r = missionSetting(st.world, a);
      if (typeof r === "string") return r;
      await store.addResponse(s.id, { roundIndex: s.roundIndex, squadId: null, playerId: null, role: "host", kind: "mission", payload: r.payload, flagged: false });
      return null;
    }
    case "yourturn.start": {
      if (!st.world.your_turn) return "This story has no Your Turn activities yet.";
      if (st.responses.some((r) => r.kind === "your_turn_start")) return null;
      await store.addResponse(s.id, { roundIndex: s.roundIndex, squadId: null, playerId: null, role: "host", kind: "your_turn_start", payload: {}, flagged: false });
      return null;
    }
    case "player.absent": {
      const p = st.players.find((x) => x.id === a.playerId);
      const classes = getClassroomStore();
      if (!p?.studentId || !s.classId || !classes) return "Only students in your class can be marked absent.";
      const roster = await classes.listStudents(s.classId);
      if (!roster.some((x) => x.id === p.studentId)) return "Only students in your class can be marked absent.";
      try { await classes.setStudentAbsent(p.studentId, a.absent === true, absentDay(new Date(s.createdAt))); } catch { return "Marking absent needs the latest database update. Ask your admin to run the absent migration."; }
      return null;
    }
    case "witness.play": {
      const storySpeaks = round?.type === "story" && round.showing === "round" && (stepKind(round.step) === "confront" || stepKind(round.step) === "lie");
      if (s.status !== "round" || (round?.type !== "lie" && !storySpeaks)) return "The Witness stand plays during Spot the Lie.";
      await store.addResponse(s.id, { roundIndex: s.roundIndex, squadId: null, playerId: null, role: "host", kind: "witness", payload: {}, flagged: false });
      return null;
    }
    case "override": {
      await store.addResponse(s.id, { roundIndex: s.roundIndex, squadId: a.key === "sound" ? a.squadId : null, playerId: null, role: "host", kind: "override", payload: { key: a.key, value: a.value }, flagged: false });
      return null;
    }
  }
}
async function set(store: LiveStore, st: LiveState, round: Round) {
  const rounds = [...st.session.rounds]; rounds[st.session.roundIndex] = round;
  await store.updateSession(st.session.id, { rounds });
  return null;
}
// Objection!: the squad with the strongest argument defends its first pinned line; a squad that argued for a different
// theory (or any other squad) objects.
function objectionPairing(st: LiveState) {
  const idx = [...st.session.rounds.keys()].reverse().find((i) => st.session.rounds[i].type === "verdict");
  if (idx === undefined) return null;
  const scores = scoreVerdictRound(st.squads, st.responses, idx).filter((x) => x.pins.length);
  const defend = [...scores].sort((a, b) => b.points - a.points)[0];
  if (!defend) return null;
  const others = st.squads.filter((s) => s.id !== defend.squadId && members(st, s.id).length);
  const rival = others.find((s) => scores.find((x) => x.squadId === s.id)?.theoryId !== defend.theoryId) ?? others[0];
  if (!rival) return null;
  return { defendSquadId: defend.squadId, objectSquadId: rival.id, pin: defend.pins[0] };
}

// ---------- Player actions ----------
export type PlayerAction = { kind: ResponseKind; payload: Record<string, unknown> };
const textKinds: ResponseKind[] = ["explain", "argument"];
// Returns an error for the player, or null. judge: runs the existing verdict judge (capped per session by the caller).
// timeSetting: the player's own Story Mode time (a class student's extra time).
export async function playerAct(store: LiveStore, st: LiveState, playerId: string, act: PlayerAction, deps: { judgeAllowed: () => Promise<boolean>; timeSetting?: TimeSetting }): Promise<string | null> {
  const s = st.session, round = currentRound(st), i = s.roundIndex;
  const me = st.players.find((p) => p.id === playerId);
  if (!me) return "Please join again.";
  // Your Turn works whatever the round is doing, once the host has started it.
  if (act.kind === "your_turn_angle") return saveYourTurnAngle(store, st, me, act.payload);
  if (act.kind === "your_turn") return saveYourTurn(store, st, me, act.payload);
  if (act.kind === "avatar") {
    const id = String(act.payload.characterId ?? "");
    if (!avatarChoices(st).some((c) => c.id === id)) return "Pick one of the characters.";
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: "avatar", payload: { characterId: id }, flagged: false });
    return null;
  }
  if (s.status !== "round") return "Wait for the next round.";
  if (act.kind === "race_ready" || act.kind === "race_gist" || act.kind === "race_question" || act.kind === "race_tap") {
    if (round?.type !== "race") return "This isn't a Proof Race.";
    if (s.paused) return "The round is paused.";
    const r = raceAnswer(round, liveRaceChunks(st.world, st.passages ?? [], round), st.responses, i, playerId, act.kind, act.payload, Date.now(), deps.timeSetting ?? "1");
    if (typeof r === "string") return r;
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: act.kind, payload: r.payload, flagged: r.flagged });
    return null;
  }
  if (s.paused) return "The round is paused.";
  if (act.kind === "mission_pick") {
    const r = missionPick(st.world, st.responses, me?.squadId ?? null, act.payload.missionId);
    if (typeof r === "string") return r;
    await store.addResponse(s.id, { roundIndex: i, squadId: me?.squadId ?? null, playerId, role: null, kind: "mission_pick", payload: r.payload, flagged: false });
    return null;
  }
  if (act.kind === "vote") {
    if (!(round?.type === "verdict" && round.stage === "vote")) return "Voting is closed.";
    const theoryId = String(act.payload.theoryId ?? "");
    if (!st.world.verdict?.theories.some((t) => t.id === theoryId)) return "Pick one of the theories.";
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: "vote", payload: { theoryId }, flagged: false });
    return null;
  }
  if (act.kind === "story") {
    if (round?.type !== "story") return "This isn't a Story Mode round.";
    const scene = storyScene(st, round);
    if (!scene) return "This scene has no Story Mode.";
    const chunk = me.squadId ? squadReading(scene, round, st.responses, i, st.players, me.squadId, me.id, st.absent)?.myChunk ?? null : null;
    const r = answerStep(st.world, st.passages ?? [], scene, round, st.responses, i, playerId, act.payload.input as RoundInput, Date.now(), deps.timeSetting ?? "1", me.squadId, { picks: playerPicks(st.world, st.passages ?? [], scene, "", chunk), seed: s.id });
    if (typeof r === "string") return r;
    // A miss or a step is saved as a try (the phone shows "Not yet" or the next step); the last step is the answer.
    if ("tryRow" in r) { await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: "story_try", payload: r.tryRow, flagged: false }); return null; }
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: "story", payload: { step: round.step, record: r.record, ...(act.payload.input && (act.payload.input as RoundInput).kind === "lie" ? { explanation: String((act.payload.input as { explanation?: string }).explanation ?? "").slice(0, 400) } : {}) }, flagged: false });
    return null;
  }
  // Freeze: hold another squad's lock-in for 5 seconds (host toggle, squads only).
  if (act.kind === "story_freeze") {
    if (round?.type !== "story") return "This isn't a Story Mode round.";
    const r = freezeAction(round, st.responses, i, st.squads, st.players, playerId, act.payload.targetSquadId, Date.now());
    if (typeof r === "string") return r;
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: "story_freeze", payload: r.payload, flagged: false });
    return null;
  }
  // Reading together: pins, reactions and votes in a live Story Mode squad (round 1, squads on).
  if (act.kind === "story_pin" || act.kind === "story_react" || act.kind === "story_vote") {
    if (round?.type !== "story" || !round.squadsOn || round.showing !== "round") return "Reading together works in Story Mode rounds with squads.";
    if (!me.squadId) return "Join a squad first.";
    const scene = storyScene(st, round);
    if (!scene) return "This scene has no Story Mode.";
    const r = readingAction(scene, st.passages ?? [], act.kind, act.payload, round.step);
    if (typeof r === "string") return r;
    // Reactions go through the same safety filter as character questions; a flagged one is kept for the teacher only.
    const flagged = act.kind === "story_react" && screenMessage(String(r.payload.body)).action !== "allow";
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: act.kind, payload: r.payload, flagged });
    return flagged ? "That reaction is saved for your teacher to see. Try different words for your squad." : null;
  }
  if (act.kind === "counter_vote") {
    if (!(round?.type === "objection" && round.stage === "vote")) return "Voting is closed.";
    await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role: null, kind: "counter_vote", payload: { sustain: act.payload.sustain === true }, flagged: false });
    return null;
  }
  if (!me.squadId) return "Wait for your teacher to put you in a squad.";
  if (round?.type === "objection" && round.objectSquadId !== me.squadId) return "The other squad is answering this objection.";
  if (writerOf(round) === me.squadId) return "Your squad planted this lie. Watch who catches it.";
  if (round?.type === "objection" && Date.now() > new Date(round.endsAt).getTime() + 3000) return "Time's up for this objection.";
  const roles = rolesFor(members(st, me.squadId), Math.max(0, i));
  const progress = squadProgress(round, st.responses, me.squadId, i);
  if (!mayAct(round, roles, playerId, act.kind, progress)) return "That's another role's job right now.";
  const role = (Object.entries(roles ?? {}).find(([r, pid]) => pid === playerId && roleFor(act.kind) === r)?.[0] ?? null) as Role | null;
  let payload: Record<string, unknown> = {}, flagged = false;
  // Every pinned line must be a real evidence line from the world file; we store the world file's own text.
  const passages = st.passages ?? await readPassages(st.world.id);
  if (act.kind === "pin") {
    // Spot the Lie: a line from the testimony's clue. Objection!: a line from any clue's evidence.
    const lie = lieOf(st, round);
    const pid = typeof act.payload.pid === "string" && act.payload.pid ? act.payload.pid : undefined;
    const clueId = typeof act.payload.clueId === "string" && act.payload.clueId ? act.payload.clueId : undefined;
    const line = matchEvidence(st.world, passages, act.payload.quote, lie ? { clueId: lie.clue_id, pid } : { clueId, pid });
    if (!line) return NOT_EVIDENCE;
    payload = { quote: line.text, pid: line.pid, clueId: line.clueId };
  } else if (act.kind === "pins") {
    const raw = Array.isArray(act.payload.pins) ? (act.payload.pins as { clueId?: unknown; quote?: unknown; pid?: unknown }[]) : [];
    if (raw.length !== 3) return "Pin exactly 3 pieces of evidence.";
    const pins = raw.map((x) => matchEvidence(st.world, passages, x.quote, { clueId: typeof x.clueId === "string" && x.clueId ? x.clueId : undefined, pid: typeof x.pid === "string" && x.pid ? x.pid : undefined }));
    if (pins.some((p) => !p)) return NOT_EVIDENCE;
    if (new Set(pins.map((p) => p!.text)).size !== 3) return "Pin 3 different lines.";
    payload = { pins: pins.map((p) => ({ clueId: p!.clueId, quote: p!.text, pid: p!.pid })) };
  } else if (textKinds.includes(act.kind)) {
    const text = String(act.payload.text ?? "").trim().slice(0, act.kind === "argument" ? 1200 : 400);
    if (text.split(/\s+/).length < 3) return "Write a full sentence.";
    // Every typed explanation is screened before it can reach the host screen; anything flagged goes to the teacher only.
    flagged = (await screenArgument(text)) !== "ok";
    payload = { text };
  } else if (act.kind === "object") payload = { note: String(act.payload.note ?? "").slice(0, 200) };
  else if (act.kind === "submit") payload = round?.type === "verdict" ? { theoryId: String(act.payload.theoryId ?? squadMajority(st, me.squadId) ?? "") } : {};
  const saved = await store.addResponse(s.id, { roundIndex: i, squadId: me.squadId, playerId, role, kind: act.kind, payload, flagged });
  if (act.kind === "submit" && round?.type === "verdict") await judgeSquad(store, st, me.squadId, saved, deps);
  return null;
}
const roleFor = (kind: ResponseKind): Role | null => kind === "pin" || kind === "pins" ? "keeper" : kind === "explain" || kind === "argument" ? "reporter" : kind === "approve" || kind === "object" ? "skeptic" : kind === "submit" ? "lead" : null;

async function judgeSquad(store: LiveStore, st: LiveState, squadId: string, submit: LiveResponse, deps: { judgeAllowed: () => Promise<boolean> }) {
  const i = st.session.roundIndex, all = [...st.responses, submit];
  const p = squadProgress({ type: "verdict", stage: "argue" }, all, squadId, i);
  const theory = st.world.verdict?.theories.find((t) => t.id === submit.payload.theoryId) ?? st.world.verdict?.theories[0];
  let feedback = null;
  if (theory && p.argument && !p.argument.flagged && (await deps.judgeAllowed().catch(() => false))) {
    const clues = new Map(st.world.scenes.flatMap((x) => x.artifacts).map((a) => [a.id, a.name]));
    const pins = (p.pins?.payload.pins ?? []) as { clueId?: string; quote: string }[];
    feedback = await judgeWithRubric({ world: st.world, theory, argument: String(p.argument.payload.text), pinned: pins.map((x) => ({ clueName: clues.get(x.clueId ?? "") ?? "Evidence", quote: x.quote })) }).catch(() => null);
  }
  await store.addResponse(st.session.id, { roundIndex: i, squadId, playerId: null, role: "system", kind: "judged", payload: { feedback }, flagged: false });
}

// ---------- Joining ----------
export async function join(store: LiveStore, session: StoredSession, input: { nickname: string; studentId: string | null }) {
  if (session.status === "ended" || expired(session)) return { error: "This live round has ended." } as const;
  const players = await store.listPlayers(session.id);
  // A class student who joins again (another tab, a reload) is the same player.
  if (input.studentId) { const mine = players.find((p) => p.studentId === input.studentId); if (mine) return { player: mine } as const; }
  if (session.demo && players.length >= DEMO_ROOM.maxPlayers) return { error: "This demo room is full." } as const;
  const p = await store.addPlayer(session.id, input);
  if (p === "taken") return { error: "That detective name was just taken. Pick another." } as const;
  return { player: p } as const;
}


// ---------- Your Turn (after the game, started by the host) ----------
// Checks a player's finished activity (one of their two, 2 or 3 sentences citing an exact line, screened), keeps it
// for the session, and saves it with a class student's progress for the Evidence view.
// "Unlock your challenge" on a phone: only the two interest answers are kept (empty when skipped), once per player.
async function saveYourTurnAngle(store: LiveStore, st: LiveState, me: LivePlayer, payload: Record<string, unknown>): Promise<string | null> {
  const view = yourTurnView(st, me.id);
  if (!view) return "Your teacher hasn't started Your Turn yet.";
  if (!view.ask) return null;
  const a = AngleSchema.safeParse({ ...(payload.firedUpBy ? { firedUpBy: payload.firedUpBy } : {}), ...(payload.lane ? { lane: payload.lane } : {}) });
  if (!a.success) return "Pick one of the choices, or Skip.";
  await store.addResponse(st.session.id, { roundIndex: st.session.roundIndex, squadId: me.squadId, playerId: me.id, role: null, kind: "your_turn_angle", payload: a.data as Record<string, unknown>, flagged: false });
  return null;
}
async function saveYourTurn(store: LiveStore, st: LiveState, me: LivePlayer, payload: Record<string, unknown>): Promise<string | null> {
  const view = yourTurnView(st, me.id);
  if (!view) return "Your teacher hasn't started Your Turn yet.";
  if (view.ask) return "Unlock your challenge first.";
  const activity = String(payload.activity ?? "");
  if (!view.choices.includes(activity)) return "Pick one of your two activities.";
  const passages = st.passages ?? [];
  const w = checkWriting(passages, String(payload.writing ?? ""), Array.isArray(payload.cited) ? payload.cited.map(String) : []);
  if (!w.ok) return w.error;
  const lines = passages.flatMap((p) => evidenceSentences(p.text));
  const results = (Array.isArray(payload.results) ? payload.results : []).slice(0, 12).map((r) => r as { label?: unknown; line?: unknown; ok?: unknown }).map((r) => ({ label: String(r.label ?? "").slice(0, 200), line: lines.find((l) => lineWords(l) === lineWords(String(r.line ?? ""))) ?? "", ok: r.ok === true })).filter((r) => r.line);
  const entry: YourTurnEntry = { activity, title: st.world.your_turn!.activities[activity].title, results, writing: String(payload.writing).trim().replace(/\s+/g, " ").slice(0, 900), cited: w.cited, at: new Date().toISOString() };
  await store.addResponse(st.session.id, { roundIndex: st.session.roundIndex, squadId: me.squadId, playerId: me.id, role: null, kind: "your_turn", payload: entry as unknown as Record<string, unknown>, flagged: false });
  const classes = me.studentId ? getClassroomStore() : null;
  if (classes && me.studentId) {
    const p = await classes.getProgress(me.studentId).catch(() => null);
    const base = p && p.worldId === st.world.id ? p : { v: 1 as const, worldId: st.world.id, scene: 0, submitted: false, readerProgress: {}, artifactAnswers: {}, savedTextEvidence: [], storyFrames: {}, updatedAt: entry.at };
    await classes.saveProgress(me.studentId, { ...base, yourTurn: [...(base.yourTurn ?? []), entry].slice(-30), updatedAt: entry.at }).catch(() => {});
  }
  return null;
}
