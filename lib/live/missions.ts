// Story missions in a live class: the teacher assigns one mission to everyone, or lets each squad choose. A squad's
// pieces are the mission lines any member proved in the live Story Mode rounds (their scored proof lines). The payoff
// stays with each student's own verdict. Rules: lib/missions.ts.
import type { WorldPack } from "../world-schema.ts";
import { missionFor, pieceForLine } from "../missions.ts";
import type { LiveResponse } from "./engine.ts";

const latest = (responses: LiveResponse[], kind: LiveResponse["kind"], squadId?: string | null) =>
  responses.filter((r) => r.kind === kind && (squadId === undefined || r.squadId === squadId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1);
// The teacher's setting: one mission for everyone, or squads choose (neither: no live mission).
export function liveMissionSetting(responses: LiveResponse[]) {
  const r = latest(responses, "mission");
  return { missionId: (r?.payload.missionId as string | null | undefined) ?? null, squadsChoose: r?.payload.squadsChoose === true };
}
// The mission a squad (or a player without a squad) is working on.
export function liveMissionFor(world: WorldPack, responses: LiveResponse[], squadId: string | null) {
  const set = liveMissionSetting(responses);
  if (set.missionId) return missionFor(world, set.missionId);
  if (set.squadsChoose && squadId) return missionFor(world, latest(responses, "mission_pick", squadId)?.payload.missionId as string | undefined);
  return undefined;
}
// Pieces a group proved in the live Story Mode rounds.
export function liveMissionPieces(world: WorldPack, responses: LiveResponse[], squadId: string | null, playerIds: string[]) {
  const m = liveMissionFor(world, responses, squadId);
  if (!m) return null;
  const found = new Set<string>();
  for (const r of responses) {
    if (r.kind !== "story" || !r.playerId || !playerIds.includes(r.playerId)) continue;
    for (const line of ((r.payload.record as { proof?: string[] } | undefined)?.proof ?? [])) { const p = pieceForLine(m, line); if (p) found.add(p.id); }
  }
  return { id: m.id, title: m.title, problem: m.problem, found: found.size, total: m.pieces.length };
}
// Checks the teacher's setting and a squad's pick.
export function missionSetting(world: WorldPack, a: { missionId?: unknown; squadsChoose?: unknown }): { payload: Record<string, unknown> } | string {
  if (!world.missions?.length) return "This story has no missions yet.";
  if (a.squadsChoose === true) return { payload: { missionId: null, squadsChoose: true } };
  if (a.missionId === null) return { payload: { missionId: null, squadsChoose: false } };
  if (!missionFor(world, String(a.missionId ?? ""))) return "Pick one of the story's missions.";
  return { payload: { missionId: String(a.missionId), squadsChoose: false } };
}
export function missionPick(world: WorldPack, responses: LiveResponse[], squadId: string | null, missionId: unknown): { payload: Record<string, unknown> } | string {
  if (!liveMissionSetting(responses).squadsChoose) return "Your teacher picks the mission.";
  if (!squadId) return "Join a squad first.";
  if (!missionFor(world, String(missionId ?? ""))) return "Pick one of the story's missions.";
  return { payload: { missionId: String(missionId) } };
}
