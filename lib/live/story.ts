// Story Mode as a live round: the host screen runs the same four rounds for everyone at once (a shared countdown, the
// projected passage, the character's question and testimony), with a top-5 leaderboard reveal between rounds that shows
// the lines that prove it. Phones only show the controls. Each try is scored with the solo rules (lib/story-mode.ts):
// a miss is "Not yet" with a hint, and students retry until the round's timer ends (no student ever holds up the
// round). Squads rank by their members' average when the teacher turns squads on; in squads, each member's round 1
// question matches their chunk of the reading.
import type { WorldPack } from "../world-schema.ts";
import type { SourcePassage } from "../source-passages.ts";
import { GRACE_SECONDS, ROUNDS, SECONDS, applyRound, attemptRound, boardName, callQ, inferQ, lieOf, newAttempt, newRun, pickRound, pulseChoice, rankRows, readQ, type Attempt, type Picks, type RoundInput, type RoundKind, type RoundRecord, type RunState, type Scene, type TimeSetting } from "../story-mode.ts";
import { pickQuestion } from "../fair-play.ts";
import { matchEvidence } from "../evidence-check.ts";
import { squadMembersCounted, type LivePlayer, type LiveResponse } from "./engine.ts";
import { evidenceSentences, lineWords } from "../lies.ts";
import { FREEZE_MS, canFreeze, earnsFreeze, frozenMs } from "../freeze.ts";
import { REACTION_MAX, REACTION_STEMS, SQUAD_JOBS, squadChunks, squadJobs, voteWinner, type ReactionStem, type SquadJob } from "../clue-game.ts";

// freezesOn: the host turned Freezes on (squads only; off by default).
export type LiveStoryRound = { type: "story"; sceneId: string; step: number; showing: "round" | "board"; stepStartedAt: string; squadsOn: boolean; freezesOn?: boolean };
// Seconds per step, shared by everyone; retries happen inside the step's time.
export const LIVE_STORY_SECONDS: Record<RoundKind, number> = { read: SECONDS.read, confront: SECONDS.confront, lie: SECONDS.lie, call: SECONDS.call };
// The questions the whole class shares (what the board shows), picked once per live session.
export const livePicks = (scene: Scene, seed = ""): Picks => pickRound(scene, { seed });
// A player's questions: the shared ones, except round 1 in squads, where each member's question has its answers in
// the member's own chunk of the reading.
export function playerPicks(world: WorldPack, passages: SourcePassage[], scene: Scene, seed: string, chunk: string[] | null): Picks {
  const shared = livePicks(scene, seed);
  if (!chunk?.length) return shared;
  const pid = (line: string) => matchEvidence(world, passages, line, { clueIds: scene.artifacts.map((a) => a.id) })?.pid ?? "";
  return { ...shared, read: pickQuestion(scene.story_mode!.read.bank, { seed: `${seed}:read`, chunk, answerPids: (q) => q.answers.map(pid) }).id };
}
// The player's try in progress this step: the latest "Not yet" or step, from their saved tries.
type TryRow = LiveResponse & { payload: { step: number; attempt: Attempt; notYet?: { tryNo: number; hint: string; locked: string[] } | null; next?: { name: "phrase" | "prove" | "explain"; choices: string[] | null; line: string | null } | null } };
export function tryState(responses: LiveResponse[], roundIndex: number, step: number, playerId: string) {
  const row = responses.filter((r) => r.roundIndex === roundIndex && r.kind === "story_try" && r.playerId === playerId && r.payload.step === step).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1) as TryRow | undefined;
  return row ? row.payload : null;
}
export const stepKind = (step: number) => ROUNDS[step];

type StoryRow = LiveResponse & { payload: { step: number; record: RoundRecord } };
const storyRows = (responses: LiveResponse[], roundIndex: number) => responses.filter((r) => r.roundIndex === roundIndex && r.kind === "story") as StoryRow[];
// A player's run so far in this live round, rebuilt from their answers.
export function playerState(responses: LiveResponse[], roundIndex: number, playerId: string): RunState {
  const mine = storyRows(responses, roundIndex).filter((r) => r.playerId === playerId).sort((a, b) => a.payload.step - b.payload.step);
  let s = newRun();
  for (const r of mine) s = { ...s, round: s.round + 1, total: s.total + r.payload.record.points, streak: r.payload.record.streak, bestStreak: Math.max(s.bestStreak, r.payload.record.streak), rounds: [...s.rounds, r.payload.record], pouch: r.payload.step === 0 ? r.payload.record.proof : s.pouch, coins: s.coins + r.payload.record.coinsEarned };
  return s;
}
// One try at the current step. setting: the player's own time (the teacher's extra time). squadId: the player's
// squad; while another squad's Freeze holds it, lock-in waits, and the frozen time doesn't count. picks: the player's
// questions. A miss or a step comes back as a try to save; the last step comes back as the scored record.
export function answerStep(world: WorldPack, passages: SourcePassage[], scene: Scene, round: LiveStoryRound, responses: LiveResponse[], roundIndex: number, playerId: string, input: RoundInput, nowMs: number, setting: TimeSetting, squadId: string | null = null, o: { picks: Picks; seed: string } = { picks: livePicks(scene, ""), seed: "" }): { record: RoundRecord } | { tryRow: TryRow["payload"] } | string {
  if (round.showing !== "round") return "Eyes on the board.";
  const held = squadId ? squadFrozenUntil(responses, roundIndex, round.step, squadId) : 0;
  if (held > nowMs) return `Your squad's lock-in is frozen for ${Math.ceil((held - nowMs) / 1000)} more seconds. Keep reading.`;
  const kind = stepKind(round.step);
  if (!kind || input.kind !== kind) return "That isn't this round.";
  const state = playerState(responses, roundIndex, playerId);
  if (state.round > round.step) return "You've already answered this round.";
  // A player who missed earlier steps joins in where the class is.
  const base = { ...state, round: round.step };
  const limit = LIVE_STORY_SECONDS[kind] * (setting === "untimed" ? Infinity : Number(setting));
  const started = new Date(round.stepStartedAt).getTime();
  // The timer pauses while the squad is frozen, so a freeze never costs reading time.
  const paused = squadId ? frozenMs(freezeStarts(responses, roundIndex, round.step, squadId), started, nowMs) : 0;
  const elapsedMs = Math.max(0, nowMs - started - paused);
  if (elapsedMs > (limit + GRACE_SECONDS) * 1000) return "Time's up for this round.";
  const grace = elapsedMs > limit * 1000;
  const prior = tryState(responses, roundIndex, round.step, playerId);
  // Live: no limit on tries; the timer ends the round and the board reveals the answer.
  const r = attemptRound(world, passages, scene, o.picks, prior?.attempt ?? newAttempt(), input, { maxTries: Infinity, seed: `${o.seed}:${playerId}`, pouch: state.pouch });
  if (r.status === "invalid") return r.message;
  if (r.status === "notYet") return { tryRow: { step: round.step, attempt: r.attempt, notYet: { tryNo: r.tryNo, hint: r.hint, locked: r.attempt.locked.map((l) => l.line) }, next: null } };
  if (r.status === "next") return { tryRow: { step: round.step, attempt: r.attempt, notYet: null, next: { name: r.step, choices: r.choices ?? null, line: r.attempt.line ?? null } } };
  const score = { ...r.score, grace, base: grace ? Math.round(r.score.base / 2) : r.score.base };
  const next = applyRound(base, score, kind === "read" ? { pouch: score.proof } : {});
  return { record: { ...next.rounds[next.rounds.length - 1], choice: pulseChoice(score) } };
}
// The lines that prove the step, for the board's reveal after the timer: never shown while students are answering.
export function revealLines(scene: Scene, step: number, picks: Picks) {
  const kind = stepKind(step);
  if (kind === "read") return readQ(scene, picks).answers.slice(0, 3);
  if (kind === "confront") return [inferQ(scene, picks).answers[0].line];
  if (kind === "lie") return [lieOf(scene, picks).truth_line];
  return callQ(scene, picks).theories.flatMap((t) => t.supports.slice(0, 2));
}

// The board: top 5 individually (first name and last initial for class students), or squads by members' average.
// Squads: every member counts (0 if silent) except members marked absent; the same rule as storySquadScores.
export function liveStoryBoard(responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squads: { id: string; name: string }[], squadsOn: boolean, absent: string[] = []) {
  const rows0 = storyRows(responses, roundIndex);
  const totals = new Map<string, number>();
  for (const r of rows0) if (r.playerId) totals.set(r.playerId, (totals.get(r.playerId) ?? 0) + r.payload.record.points);
  if (squadsOn) {
    const rows = squads.map((s) => {
      const counted = squadMembersCounted(s.id, players, absent, rows0);
      const sum = rows0.filter((r) => r.squadId === s.id).reduce((n, r) => n + r.payload.record.points, 0);
      return { id: s.id, name: s.name, score: counted.size ? Math.round(sum / counted.size) : 0, members: counted.size };
    }).filter((r) => r.members > 0).map(({ members: _m, ...r }) => r);
    return { kind: "squad" as const, rows: rankRows(rows) };
  }
  const rows = players.map((p) => ({ id: p.id, name: p.studentId ? boardName(p.nickname) : p.nickname, score: totals.get(p.id) ?? 0 }));
  return { kind: "individual" as const, rows: rankRows(rows) };
}
export const answeredStep = (responses: LiveResponse[], roundIndex: number, step: number) => new Set(storyRows(responses, roundIndex).filter((r) => r.payload.step === step).map((r) => r.playerId)).size;
export const myStepRecord = (responses: LiveResponse[], roundIndex: number, step: number, playerId: string) => storyRows(responses, roundIndex).find((r) => r.payload.step === step && r.playerId === playerId)?.payload.record ?? null;

// What everyone sees for the current step: the shared questions, and (only at the board, after the timer) the lines
// that prove it. seed: the live session, so the board and phones agree.
export function publicStory(world: WorldPack, passages: SourcePassage[], scene: Scene, round: LiveStoryRound, seed = "") {
  const c = scene.story_mode!, kind = stepKind(round.step), picks = livePicks(scene, seed);
  const who = (id: string) => { const ch = world.characters.find((x) => x.id === id); return ch ? { id: ch.id, name: ch.name, portrait: ch.portrait ?? null } : null; };
  const lie = lieOf(scene, picks), clue = scene.artifacts.find((a) => a.id === lie.clue_id), q = callQ(scene, picks);
  return {
    type: "story" as const, sceneId: scene.id, step: round.step, kind, showing: round.showing, stepStartedAt: round.stepStartedAt, seconds: kind ? LIVE_STORY_SECONDS[kind] : 0, squadsOn: round.squadsOn,
    intro: c.intro, image: scene.background_image,
    read: kind === "read" ? { prompt: c.read.prompt, focus: readQ(scene, picks).focus, chunks: c.read.chunks.map((id) => ({ id, text: passages.find((p) => p.id === id)?.text ?? "" })) } : null,
    confront: kind === "confront" ? { speaker: who(c.infer.character_id), line: inferQ(scene, picks).question, chunks: c.read.chunks } : null,
    lie: kind === "lie" ? { speaker: who(lie.character_id), testimony: lie.testimony, evidence: clue?.source_anchor ?? [], clueId: lie.clue_id } : null,
    call: kind === "call" ? { question: q.question, theories: q.theories.map((t) => ({ id: t.id, name: t.name, description: t.description })) } : null,
    reveal: round.showing === "board" ? revealLines(scene, round.step, picks) : null,
  };
}

// ---------- Reading together (every round, with squads on) ----------
// Each present member gets a job (Reader, Fact-checker, Connector, in join order) and a different chunk of the reading.
// A kept line is a pin that lights up on teammates' phones with the pinner's name; teammates react with a sentence stem
// and a short ending (screened like character questions; flagged ones reach only the teacher); the squad votes on its
// best proof line before locking in. Ties: most reactions, then the Fact-checker's vote (clue-game voteWinner).
const rowsOf = (responses: LiveResponse[], roundIndex: number, squadId: string, kind: LiveResponse["kind"], step: number) => responses.filter((r) => r.roundIndex === roundIndex && r.squadId === squadId && r.kind === kind && r.payload.step === step).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
// The paragraphs a round reads from: the testimony's clue in round 3, the scene's reading in the others.
export function roundParagraphs(scene: Scene, step: number, seed = "") {
  const lie = lieOf(scene, livePicks(scene, seed)), lieClue = scene.artifacts.find((a) => a.id === lie.clue_id);
  return stepKind(step) === "lie" && lieClue ? lieClue.source_anchor : scene.story_mode!.read.chunks;
}
// Every round, with squads on. Jobs move round by round (so everyone tries each one); chunks split the round's reading.
export function squadReading(scene: Scene, round: LiveStoryRound, responses: LiveResponse[], roundIndex: number, players: LivePlayer[], squadId: string, meId: string, absent: string[] = []) {
  if (!round.squadsOn) return null;
  const step = round.step;
  const away = new Set(absent);
  const all = players.filter((p) => p.squadId === squadId).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  const present = all.filter((p) => !away.has(p.id));
  const order = present.map((p) => p.id), shift = order.length ? step % order.length : 0;
  const jobs = squadJobs([...order.slice(shift), ...order.slice(0, shift)]);
  const chunks = squadChunks(roundParagraphs(scene, step), present.length);
  const chunkOf = new Map(present.map((p, i) => [p.id, chunks[i] ?? []] as const));
  const name = (id: string | null) => players.find((p) => p.id === id)?.nickname ?? "A teammate";
  // Pins: the latest pin or unpin per player and line.
  const pinState = new Map<string, { line: string; by: string; byId: string; at: string }>();
  for (const r of rowsOf(responses, roundIndex, squadId, "story_pin", step)) { const line = String(r.payload.line ?? ""), k = `${r.playerId}|${lineWords(line)}`; if (r.payload.remove) pinState.delete(k); else pinState.set(k, { line, by: name(r.playerId), byId: r.playerId ?? "", at: r.createdAt }); }
  const pins = [...pinState.values()];
  const reactions = rowsOf(responses, roundIndex, squadId, "story_react", step).filter((r) => !r.flagged || r.playerId === meId).map((r) => ({ line: String(r.payload.line ?? ""), by: name(r.playerId), stem: String(r.payload.stemText ?? ""), body: String(r.payload.body ?? ""), flagged: r.flagged }));
  const latestVote = new Map<string, string>();
  for (const r of rowsOf(responses, roundIndex, squadId, "story_vote", step)) if (r.playerId) latestVote.set(r.playerId, String(r.payload.line ?? ""));
  const votes = [...latestVote.entries()].map(([voter, line]) => ({ voter, line }));
  const unique = pins.filter((p, i) => pins.findIndex((q) => lineWords(q.line) === lineWords(p.line)) === i);
  const reactCount = (line: string) => reactions.filter((x) => !x.flagged && lineWords(x.line) === lineWords(line)).length;
  const factChecker = present.find((p) => jobs.get(p.id) === "fact-checker")?.id ?? null;
  const answered = new Set(responses.filter((r) => r.roundIndex === roundIndex && r.kind === "story" && r.payload.step === step).map((r) => r.playerId));
  const busy = new Set([...pins.map((p) => p.byId), ...votes.map((v) => v.voter), ...rowsOf(responses, roundIndex, squadId, "story_react", step).map((r) => r.playerId ?? "")]);
  return {
    myJob: jobs.get(meId) ?? null, myChunk: chunkOf.get(meId) ?? [],
    members: all.map((p) => ({ id: p.id, name: p.nickname, me: p.id === meId, job: jobs.get(p.id) ?? null, part: chunkOf.get(p.id) ?? [], status: away.has(p.id) ? ("absent" as const) : answered.has(p.id) ? ("ready" as const) : busy.has(p.id) ? ("answering" as const) : ("ready" as const) })),
    pins: pins.map(({ line, by, byId }) => ({ line, by, mine: byId === meId })),
    reactions: reactions.map(({ line, by, stem, body }) => ({ line, by, stem, body })),
    votes: unique.map((p) => ({ line: p.line, votes: votes.filter((v) => lineWords(v.line) === lineWords(p.line)).length, reactions: reactCount(p.line) })),
    myVote: latestVote.get(meId) ?? null,
    winner: voteWinner(unique.map((p) => ({ line: p.line, reactions: reactCount(p.line) })), votes, factChecker),
    everyoneVoted: present.length > 0 && present.every((p) => latestVote.has(p.id)),
  };
}
// Checks one reading-together action and returns what to store, or an error. The line must be one of the reading's
// lines; a reaction's ending is at most 80 characters.
export function readingAction(scene: Scene, passages: SourcePassage[], kind: "story_pin" | "story_react" | "story_vote", payload: Record<string, unknown>, step = 0): { payload: Record<string, unknown> } | string {
  const lines = roundParagraphs(scene, step).flatMap((id) => evidenceSentences(passages.find((p) => p.id === id)?.text ?? ""));
  const line = lines.find((l) => lineWords(l) === lineWords(String(payload.line ?? "")));
  if (!line) return "Pick a line from the reading.";
  if (kind === "story_pin") return { payload: { step, line, ...(payload.remove === true ? { remove: true } : {}) } };
  if (kind === "story_vote") return { payload: { step, line } };
  const stem = String(payload.stem ?? "") as ReactionStem;
  if (!(stem in REACTION_STEMS)) return "Pick a sentence starter.";
  const body = String(payload.body ?? "").trim().replace(/\s+/g, " ");
  if (!body) return "Finish the sentence.";
  if (body.length > REACTION_MAX) return `Keep it to ${REACTION_MAX} characters.`;
  return { payload: { step, line, stem, stemText: REACTION_STEMS[stem], body } };
}
export const JOB_TEXT: Record<SquadJob, { name: string; does: string }> = SQUAD_JOBS;

// ---------- Freezes (squad vs squad, host toggle) ----------
const freezeRows = (responses: LiveResponse[], roundIndex: number) => responses.filter((r) => r.roundIndex === roundIndex && r.kind === "story_freeze").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
// When freezes on this squad started, this step.
export const freezeStarts = (responses: LiveResponse[], roundIndex: number, step: number, squadId: string) => freezeRows(responses, roundIndex).filter((r) => r.payload.step === step && r.payload.targetSquadId === squadId).map((r) => new Date(r.createdAt).getTime());
export const squadFrozenUntil = (responses: LiveResponse[], roundIndex: number, step: number, squadId: string) => Math.max(0, ...freezeStarts(responses, roundIndex, step, squadId).map((t) => t + FREEZE_MS));
// Whether a player holds a Freeze: earned when their streak of correct proofs reaches 3, 6, 9…, spent when used.
export function holdsFreeze(responses: LiveResponse[], roundIndex: number, playerId: string) {
  const events = [
    ...storyRows(responses, roundIndex).filter((r) => r.playerId === playerId).map((r) => ({ at: r.createdAt, earn: r.payload.record.valid ? r.payload.record.streak : 0 })),
    ...freezeRows(responses, roundIndex).filter((r) => r.playerId === playerId).map((r) => ({ at: r.createdAt, earn: -1 })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  let holding = false;
  for (const e of events) { if (e.earn === -1) holding = false; else if (earnsFreeze(e.earn, holding)) holding = true; }
  return holding;
}
// What a player sees about freezes this step: whether they hold one, which squads they could freeze (and why not),
// and whether their own squad is frozen right now.
export function freezeView(round: LiveStoryRound, responses: LiveResponse[], roundIndex: number, squads: { id: string; name: string }[], players: LivePlayer[], meId: string, nowMs: number) {
  const me = players.find((p) => p.id === meId);
  if (!round.freezesOn || !round.squadsOn || !me?.squadId) return null;
  const rows = freezeRows(responses, roundIndex);
  const mine = rows.filter((r) => r.playerId === meId);
  const last = mine.at(-1);
  const holding = holdsFreeze(responses, roundIndex, meId);
  const usedThisRound = mine.some((r) => r.payload.step === round.step);
  const targets = squads.filter((q) => q.id !== me.squadId && players.some((p) => p.squadId === q.id)).map((q) => {
    const check = canFreeze({ holding, usedThisRound, target: q.id, teammate: false, shielded: rows.some((r) => r.payload.step === round.step && r.payload.targetSquadId === q.id), last: last ? { target: String(last.payload.targetSquadId), round: Number(last.payload.step) } : null, round: round.step });
    return { squadId: q.id, name: q.name, ok: check.ok, reason: check.ok ? "" : check.reason };
  });
  const until = squadFrozenUntil(responses, roundIndex, round.step, me.squadId);
  const by = rows.filter((r) => r.payload.step === round.step && r.payload.targetSquadId === me.squadId).at(-1);
  const byName = by ? squads.find((q) => q.id === by.squadId)?.name ?? "Another squad" : "";
  return {
    holding, usedThisRound, targets,
    frozen: until > nowMs ? { until: new Date(until).toISOString(), by: byName } : null,
    shielded: !!by,
    pausedMs: frozenMs(freezeStarts(responses, roundIndex, round.step, me.squadId), new Date(round.stepStartedAt).getTime(), nowMs),
  };
}
// Checks a freeze: the host turned freezes on, squads are on, the player holds one, and the target is fair game.
export function freezeAction(round: LiveStoryRound, responses: LiveResponse[], roundIndex: number, squads: { id: string; name: string }[], players: LivePlayer[], meId: string, targetSquadId: unknown, nowMs: number): { payload: Record<string, unknown> } | string {
  if (!round.freezesOn || !round.squadsOn) return "Freezes are off for this round.";
  if (round.showing !== "round") return "Wait for the round to start.";
  const v = freezeView(round, responses, roundIndex, squads, players, meId, nowMs);
  const me = players.find((p) => p.id === meId);
  if (!v || !me) return "Join a squad first.";
  if (targetSquadId === me.squadId) return "Never your own team.";
  const t = v.targets.find((x) => x.squadId === targetSquadId);
  if (!t) return "Pick another squad.";
  if (!t.ok) return t.reason;
  return { payload: { step: round.step, targetSquadId: t.squadId, targetName: t.name } };
}
