// Server side of Story Mode: starting a run, scoring each round (the client only sends what the student did and how
// long it took), power-ups, the leaderboards and the class pulse. Every rule is in lib/story-mode.ts.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { nicknameChoices } from "./live/engine.ts";
import {
  GRACE_SECONDS, ROUNDS, SECONDS, TIME_SETTINGS, applyRound, boardName, buy, classPulse, newRun, phaseSeconds, pulseChoice, pulseOptions, rankRows, scoreRound, studentBoard,
  type PowerUp, type RoundInput, type RoundKind, type RunState, type Scene, type TimeSetting,
} from "./story-mode.ts";
import { storyDay, type StoryRun, type StoryStore } from "./story-store.ts";

export type LeaderboardMode = "individual" | "squad" | "off";
export type Identity =
  | { scope: "class"; classId: string; worldId: string; studentId: string; nickname: string; timeSetting: TimeSetting; leaderboard: LeaderboardMode }
  | { scope: "demo"; sandboxId: string };
export const MAX_RESTARTS = 20;

// The longer of two time settings (untimed is the longest).
export const longerTime = (a: TimeSetting, b: TimeSetting) => (TIME_SETTINGS.indexOf(a) >= TIME_SETTINGS.indexOf(b) ? a : b);
// A demo visitor's detective nickname: generated from their sandbox, never typed, unique on today's board.
function demoNickname(sandboxId: string, taken: string[]) {
  let seed = 0;
  for (const ch of sandboxId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  return nicknameChoices(seed, taken, 1)[0] ?? `Detective ${sandboxId.slice(0, 4)}`;
}

// startAt: open at a later round (demo visitors only, from the home page's "Catch the lie"). Earlier rounds are skipped
// and score nothing; a cleared run starts over first.
export async function startRun(store: StoryStore, world: WorldPack, scene: Scene, who: Identity, restart = false, startAt?: RoundKind): Promise<StoryRun | string> {
  const run = await openRun(store, world, scene, who, restart);
  if (typeof run === "string" || !startAt || who.scope !== "demo") return run;
  return skipTo(store, world, scene, who, run, ROUNDS.indexOf(startAt));
}
async function skipTo(store: StoryStore, world: WorldPack, scene: Scene, who: Identity, run: StoryRun, index: number): Promise<StoryRun | string> {
  if (index <= 0) return run;
  let from = run;
  if (run.finished) { const again = await openRun(store, world, scene, who, true); if (typeof again === "string") return again; from = again; }
  if (from.state.round >= index) return from;
  const state: RunState = { ...from.state, round: index, skipped: index - from.state.round + (from.state.skipped ?? 0) };
  await store.saveRun(from.id, { state });
  return { ...from, state };
}
async function openRun(store: StoryStore, world: WorldPack, scene: Scene, who: Identity, restart: boolean): Promise<StoryRun | string> {
  if (!scene.story_mode) return "This scene has no Story Mode.";
  const day = storyDay();
  const key = who.scope === "class"
    ? { scope: "class" as const, classId: who.classId, studentId: who.studentId, playerKey: who.studentId, worldId: world.id, sceneId: scene.id, day }
    : { scope: "demo" as const, classId: null, studentId: null, playerKey: who.sandboxId, worldId: world.id, sceneId: scene.id, day };
  const found = await store.findRun(key);
  const timeSetting = who.scope === "class" ? who.timeSetting : "1";
  if (found && !restart) return found;
  if (found) {
    const restarts = (found.state.restarts ?? 0) + 1;
    if (restarts > MAX_RESTARTS) return "You've started this scene over many times today. Come back tomorrow for a fresh run.";
    await store.clearRounds(found.id);
    const state = { ...newRun(), restarts };
    await store.saveRun(found.id, { state, total: 0, finished: false, timeSetting });
    return { ...found, state, total: 0, finished: false, timeSetting };
  }
  const nickname = who.scope === "class" ? who.nickname : demoNickname(who.sandboxId, (await store.listRuns({ scope: "demo", worldId: world.id, sceneId: scene.id, day })).map((r) => r.nickname));
  // Two starts at once (a double tap, or two tabs): the database keeps one run per player, so the second insert fails
  // and we return the run that won.
  try { return await store.createRun({ ...key, nickname, state: newRun(), total: 0, bestTotal: 0, bestStreak: 0, finished: false, timeSetting }); }
  catch (e) { const winner = await store.findRun(key); if (winner) return winner; throw e; }
}

export type RoundBody = { round: number; input: RoundInput; elapsedMs: number; grace: boolean; relaxed: boolean };
const BASE_SECONDS: Record<RoundInput["kind"], number> = { read: SECONDS.read, confront: SECONDS.proof, lie: SECONDS.lie, call: SECONDS.call };
// Scores one round. The client says what the student did and how long it took; the server applies every rule.
export async function playRound(store: StoryStore, world: WorldPack, passages: SourcePassage[], scene: Scene, run: StoryRun, body: RoundBody) {
  const s = run.state;
  if (run.finished || s.round >= ROUNDS.length) return { error: "This scene is already cleared. Start over to play again." } as const;
  if (body.round !== s.round + 1 || body.input.kind !== ROUNDS[s.round]) return { error: "That round is already scored." } as const;
  // Time: the teacher's extra time, or Relaxed (2x) if the student turned it on, whichever is longer.
  const setting = longerTime(run.timeSetting, body.relaxed ? "2" : "1");
  const limit = phaseSeconds(BASE_SECONDS[body.input.kind], setting);
  const elapsedMs = Math.max(0, Math.min(Number(body.elapsedMs) || 0, 60 * 60 * 1000));
  // Late by more than a moment means the grace period, whatever the client says; untimed never has one.
  const grace = limit === null ? false : !!body.grace || elapsedMs > (limit + 1) * 1000;
  if (limit !== null && elapsedMs > (limit + GRACE_SECONDS + 5) * 1000) body = { ...body, input: emptyInput(body.input.kind) };
  const input = sanitize(body.input);
  const score = scoreRound(world, passages, scene, input, { elapsedMs, grace }, setting, s.pouch);
  const action = input.kind === "confront" ? scene.story_mode!.confront.actions.find((a) => a.id === input.actionId) : undefined;
  const next: RunState = applyRound(s, score, {
    ...(input.kind === "read" ? { pouch: score.proof } : {}),
    ...(action ? { trust: { characterId: scene.story_mode!.confront.character_id, delta: action.trust } } : {}),
  });
  const record = next.rounds[next.rounds.length - 1];
  const finished = next.round >= ROUNDS.length;
  await store.addRound({ ...record, choice: pulseChoice(score), runId: run.id, explanation: input.kind === "lie" ? input.explanation.slice(0, 400) : "", grace, elapsedMs });
  const bestTotal = Math.max(run.bestTotal, next.total);
  await store.saveRun(run.id, { state: next, total: next.total, bestTotal, bestStreak: Math.max(run.bestStreak, next.bestStreak), finished });
  const updated: StoryRun = { ...run, state: next, total: next.total, bestTotal, bestStreak: Math.max(run.bestStreak, next.bestStreak), finished };
  return { run: updated, record, reaction: action ? { line: action.reaction, trust: action.trust } : null } as const;
}
function emptyInput(kind: RoundInput["kind"]): RoundInput {
  return kind === "read" ? { kind, pouch: [] } : kind === "confront" ? { kind, actionId: "", proof: "" } : kind === "lie" ? { kind, line: "", explanation: "" } : { kind, theoryId: "", pins: [] };
}
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const strs = (v: unknown, n: number) => (Array.isArray(v) ? v.slice(0, n).map((x) => str(x, 1500)) : []);
function sanitize(i: RoundInput): RoundInput {
  if (i.kind === "read") return { kind: "read", pouch: strs(i.pouch, 3) };
  if (i.kind === "confront") return { kind: "confront", actionId: str(i.actionId, 80), proof: str(i.proof, 1500) };
  if (i.kind === "lie") return { kind: "lie", line: str(i.line, 1500), explanation: str(i.explanation, 400) };
  return { kind: "call", theoryId: str(i.theoryId, 80), pins: strs(i.pins, 2) };
}

export async function buyPowerUp(store: StoryStore, run: StoryRun, p: PowerUp) {
  if (run.finished) return "This scene is already cleared.";
  if (run.state.round === 0) return "Power-ups open after the first round.";
  const next = buy(run.state, p);
  if (typeof next === "string") return next;
  await store.saveRun(run.id, { state: next });
  return { ...run, state: next };
}

// The board this player's scope shares: their class (by student or by squad), or today's demo visitors.
// squads: student id -> squad name (the class's latest live round), for the squad leaderboard; absent: student ids the
// teacher marked absent today.
export async function boardFor(store: StoryStore, run: StoryRun, mode: LeaderboardMode, previousRank: number | null, squads?: Map<string, string>, absent: string[] = []) {
  if (mode === "off") return null;
  const runs = await store.listRuns(run.scope === "class" ? { scope: "class", classId: run.classId, worldId: run.worldId, sceneId: run.sceneId } : { scope: "demo", worldId: run.worldId, sceneId: run.sceneId, day: run.day });
  const score = (r: StoryRun) => Math.max(r.bestTotal, r.total);
  if (mode === "squad" && run.scope === "class" && squads) {
    // Squads rank by their members' average, so a squad of 3 isn't behind a squad of 4. Every member counts (0 if they
    // haven't played); members marked absent today are left out unless they played.
    const rows = squadAverages(squads, new Map(runs.filter((r) => r.studentId).map((r) => [r.studentId!, score(r)])), absent);
    const mine = run.studentId ? squads.get(run.studentId) ?? null : null;
    return { kind: "squad" as const, ...studentBoard(rows, mine, previousRank) };
  }
  const rows = runs.map((r) => ({ id: r.playerKey, name: r.scope === "class" ? boardName(r.nickname) : r.nickname, score: score(r) }));
  return { kind: "individual" as const, ...studentBoard(rows, run.playerKey, previousRank) };
}
export function squadAverages(squads: Map<string, string>, scores: Map<string, number>, absent: string[] = []) {
  const away = new Set(absent), by = new Map<string, number[]>();
  for (const [studentId, sq] of squads) {
    const played = scores.has(studentId);
    if (away.has(studentId) && !played) continue;
    by.set(sq, [...(by.get(sq) ?? []), scores.get(studentId) ?? 0]);
  }
  return [...by.entries()].map(([name, xs]) => ({ id: name, name, score: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) }));
}
// The teacher's full board (Evidence view and CSV): every student, ranked, with each round.
export async function teacherBoard(store: StoryStore, classId: string, world: WorldPack, scene: Scene) {
  const runs = rankRows((await store.listRuns({ scope: "class", classId, worldId: world.id, sceneId: scene.id })).map((r) => ({ ...r, id: r.id, name: r.nickname, score: Math.max(r.bestTotal, r.total) })));
  const rounds = await store.listRounds(runs.map((r) => r.id));
  return runs.map((r, i) => ({ rank: i + 1, studentId: r.studentId, nickname: r.nickname, score: r.score, bestStreak: r.bestStreak, finished: r.finished, timeSetting: r.timeSetting, rounds: rounds.filter((x) => x.runId === r.id).sort((a, b) => a.round - b.round).map((x) => ({ round: x.round, kind: x.kind, points: x.points, valid: x.valid, choice: x.choice, proof: x.proof, explanation: x.explanation, grace: x.grace })) }));
}
// How this player's class (or today's demo visitors) split on the round, with the strongest line on each side.
export async function pulseFor(store: StoryStore, run: StoryRun, scene: Scene, round: number) {
  const kind = ROUNDS[round - 1];
  if (!kind) return [];
  const runs = await store.listRuns(run.scope === "class" ? { scope: "class", classId: run.classId, worldId: run.worldId, sceneId: run.sceneId } : { scope: "demo", worldId: run.worldId, sceneId: run.sceneId, day: run.day });
  const rows = (await store.listRounds(runs.map((r) => r.id))).filter((r) => r.round === round).map((r) => ({ choice: r.choice, valid: r.valid, proof: r.proof }));
  return classPulse(rows, pulseOptions(scene, kind));
}
export const publicRun = (r: StoryRun) => ({ id: r.id, topic: boardTopic(r), nickname: r.scope === "class" ? boardName(r.nickname) : r.nickname, state: r.state, total: r.total, bestTotal: r.bestTotal, finished: r.finished, timeSetting: r.timeSetting, scope: r.scope });

// Live updates for a board: a Realtime ping on story:<class or demo>:<world>:<scene>; screens refetch (and poll).
export const boardTopic = (r: Pick<StoryRun, "scope" | "classId" | "worldId" | "sceneId">) => `story:${r.scope === "class" ? r.classId : "demo"}:${r.worldId}:${r.sceneId}`;
export async function broadcastBoard(topic: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try { await fetch(`${url}/realtime/v1/api/broadcast`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ topic, event: "changed", payload: { at: Date.now() } }] }) }); } catch { /* boards poll anyway */ }
}
