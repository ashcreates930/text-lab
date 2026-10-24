// Story Mode as a live round: the host screen runs the same four rounds for everyone at once (a shared countdown, the
// projected passage, confrontation and testimony), with a top-5 leaderboard reveal between rounds. Phones only show the
// controls. Each player's answers are scored with the solo rules (lib/story-mode.ts); squads rank by their members'
// average when the teacher turns squads on.
import type { WorldPack } from "../world-schema.ts";
import type { SourcePassage } from "../source-passages.ts";
import { GRACE_SECONDS, ROUNDS, SECONDS, applyRound, boardName, newRun, pulseChoice, rankRows, scoreRound, speedBonus, type RoundInput, type RoundKind, type RoundRecord, type RunState, type Scene, type TimeSetting } from "../story-mode.ts";
import { squadMembersCounted, type LivePlayer, type LiveResponse } from "./engine.ts";

export type LiveStoryRound = { type: "story"; sceneId: string; step: number; showing: "round" | "board"; stepStartedAt: string; squadsOn: boolean };
// Seconds per step, shared by everyone. Round 2's choice and proof run as one 90-second step live.
export const LIVE_STORY_SECONDS: Record<RoundKind, number> = { read: SECONDS.read, confront: SECONDS.choice + SECONDS.proof, lie: SECONDS.lie, call: SECONDS.call };
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
// Scores one player's answer for the current step. setting: the player's own time (the teacher's extra time).
export function answerStep(world: WorldPack, passages: SourcePassage[], scene: Scene, round: LiveStoryRound, responses: LiveResponse[], roundIndex: number, playerId: string, input: RoundInput, nowMs: number, setting: TimeSetting): { record: RoundRecord } | string {
  if (round.showing !== "round") return "Eyes on the board.";
  const kind = stepKind(round.step);
  if (!kind || input.kind !== kind) return "That isn't this round.";
  const state = playerState(responses, roundIndex, playerId);
  if (state.round > round.step) return "You've already answered this round.";
  // A player who missed earlier steps joins in where the class is.
  const base = { ...state, round: round.step };
  const limit = LIVE_STORY_SECONDS[kind] * (setting === "untimed" ? Infinity : Number(setting));
  const elapsedMs = Math.max(0, nowMs - new Date(round.stepStartedAt).getTime());
  if (elapsedMs > (limit + GRACE_SECONDS) * 1000) return "Time's up for this round.";
  const grace = elapsedMs > limit * 1000;
  const score = scoreRound(world, passages, scene, input, { elapsedMs, grace }, setting, state.pouch);
  // Speed is measured against the step's shared length (scaled by the player's own extra time).
  const speed = score.speed ? speedBonus(elapsedMs, LIVE_STORY_SECONDS[kind], setting) : 0;
  const next = applyRound(base, { ...score, speed }, kind === "read" ? { pouch: score.proof } : {});
  return { record: { ...next.rounds[next.rounds.length - 1], choice: pulseChoice(score) } };
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

// What everyone sees for the current step (no answers: the authored "supports" mapping and the lie's truth line stay on
// the server).
export function publicStory(world: WorldPack, passages: SourcePassage[], scene: Scene, round: LiveStoryRound) {
  const c = scene.story_mode!, kind = stepKind(round.step);
  const who = (id: string) => { const ch = world.characters.find((x) => x.id === id); return ch ? { id: ch.id, name: ch.name, portrait: ch.portrait ?? null } : null; };
  const lie = scene.lie, clue = lie ? scene.artifacts.find((a) => a.id === lie.clue_id) : undefined;
  return {
    type: "story" as const, sceneId: scene.id, step: round.step, kind, showing: round.showing, stepStartedAt: round.stepStartedAt, seconds: kind ? LIVE_STORY_SECONDS[kind] : 0, squadsOn: round.squadsOn,
    intro: c.intro, image: scene.background_image,
    read: kind === "read" ? { prompt: c.read.prompt, focus: c.read.focus, chunks: c.read.chunks.map((id) => ({ id, text: passages.find((p) => p.id === id)?.text ?? "" })) } : null,
    confront: kind === "confront" ? { speaker: who(c.confront.character_id), line: c.confront.line, actions: c.confront.actions.map((a) => ({ id: a.id, label: a.label })), chunks: c.read.chunks } : null,
    lie: kind === "lie" && lie ? { speaker: who(lie.character_id), testimony: lie.testimony, evidence: clue?.source_anchor ?? [], clueId: lie.clue_id } : null,
    call: kind === "call" ? { question: c.call.question, theories: c.call.theories.map((t) => ({ id: t.id, name: t.name, description: t.description })) } : null,
  };
}
