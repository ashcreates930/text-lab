// Server side of live class mode: tokens, loading a session, the host's and players' views, and every action. All
// writes come through here, so role gating, moderation and the judge cap are enforced in one place.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { WorldPack } from "../world-schema.ts";
import { readPassages, readWorld } from "../classroom/worlds.ts";
import { NOT_EVIDENCE, matchEvidence } from "../evidence-check.ts";
import type { SourcePassage } from "../source-passages.ts";
import { answerStep, answeredStep, freezeAction, freezeView, liveStoryBoard, myStepRecord, playerState, publicStory, readingAction, squadReading, stepKind, type LiveStoryRound } from "./story.ts";
import { screenMessage } from "../safety.ts";
import { studentBoard, type RoundInput, type TimeSetting } from "../story-mode.ts";
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
    storyAnswered: round?.type === "story" ? answeredStep(st.responses, st.session.roundIndex, round.step) : 0,
    // Who's here: class students can be marked absent for the session's day (left out of squad averages).
    roster: st.players.map((p) => ({ id: p.id, nickname: p.nickname, canMark: !!p.studentId && !!st.session.classId, absent: (st.absent ?? []).includes(p.id) })),
    storyBoard: round?.type === "story" ? (() => { const b = liveStoryBoard(st.responses, st.session.roundIndex, st.players, st.squads, round.squadsOn, st.absent); return { kind: b.kind, top: b.rows.slice(0, 5).map((r, k) => ({ rank: k + 1, name: r.name, score: r.score })), players: b.rows.length }; })() : null,
    lieScenes: st.world.scenes.filter((s) => s.lie).map((s, i) => ({ sceneId: s.id, label: `Scene ${st.world.scenes.indexOf(s) + 1}: ${s.lie!.topic}` , index: i })),
  };
}

// What the Witness stand phone shows: the testifying character and their line during Spot the Lie, and when the host
// last asked it to play.
function storyWitness(st: LiveState, round: LiveStoryRound) {
  const scene = storyScene(st, round), kind = stepKind(round.step);
  const speak = scene && round.showing === "round" && st.session.status === "round" ? (kind === "confront" ? { id: scene.story_mode!.confront.character_id, line: scene.story_mode!.confront.line } : kind === "lie" && scene.lie ? { id: scene.lie.character_id, line: scene.lie.testimony } : null) : null;
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
    return { reading, freeze, answered: !!myStepRecord(st.responses, i, round.step, me.id), last: round.showing === "board" || st.session.status !== "round" ? myStepRecord(st.responses, i, round.step, me.id) : null, total: state.total, pouch: state.pouch, board: view, boardKind: board.kind };
  })() : null;
  return {
    session: sessionInfo(st), round: publicRound(st), purpose: round ? squadPurpose(round.type) : "", story,
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
  | { action: "pause" } | { action: "resume" } | { action: "end" } | { action: "witness.play" } | { action: "player.absent"; playerId: string; absent: boolean }
  | { action: "override"; key: "sound"; squadId: string; value: boolean } | { action: "override"; key: "objection"; value: boolean };

export async function hostAct(store: LiveStore, st: LiveState, a: HostAction): Promise<string | null> {
  const s = st.session, round = currentRound(st);
  if (s.status === "ended") return "This live round has ended.";
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
    case "round.reveal": if (s.status !== "round") return "No round to reveal."; await store.updateSession(s.id, { status: "reveal" }); return null;
    case "pause": await store.updateSession(s.id, { paused: true }); return null;
    case "resume": await store.updateSession(s.id, { paused: false }); return null;
    case "end": await store.updateSession(s.id, { status: "ended", paused: false }); return null;
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
  if (s.status !== "round") return "Wait for the next round.";
  if (s.paused) return "The round is paused.";
  const me = st.players.find((p) => p.id === playerId);
  if (!me) return "Please join again.";
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
    const r = answerStep(st.world, st.passages ?? [], scene, round, st.responses, i, playerId, act.payload.input as RoundInput, Date.now(), deps.timeSetting ?? "1", me.squadId);
    if (typeof r === "string") return r;
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

