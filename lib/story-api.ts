// Shared by the Story Mode API routes: who is playing (a class student by their class token, or a demo visitor by their
// sandbox id and demo access cookie), loading the story, checking a run belongs to the caller, and the class squads.
import type { NextRequest } from "next/server";
import { isFailure, studentFromRequest } from "./classroom/auth.ts";
import { storySettings } from "./classroom/store.ts";
import { readPassages, readWorld } from "./classroom/worlds.ts";
import { DEMO_ACCESS_COOKIE, verifyDemoAccessToken } from "./demo-access.ts";
import { getClassroomStore, memoryModeEnabled } from "./classroom/store.ts";
import { getLiveStore } from "./live/store.ts";
import type { Identity } from "./story-server.ts";
import type { StoryRun } from "./story-store.ts";
import type { TimeSetting } from "./story-mode.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function storyIdentity(request: NextRequest, sandboxId: unknown): Promise<Identity | { error: string; status: number }> {
  if (request.headers.get("x-class-token")) {
    const ctx = await studentFromRequest(request);
    if (isFailure(ctx)) return { error: ctx.error, status: ctx.status };
    const cls = await ctx.store.getClassById(ctx.student.session_id);
    if (!cls) return { error: "Your class is no longer available.", status: 404 };
    const times = await ctx.store.getStudentTimes(cls.id).catch(() => ({} as Record<string, TimeSetting>));
    return { scope: "class", classId: cls.id, worldId: cls.world_id, studentId: ctx.student.id, nickname: ctx.student.nickname, timeSetting: times[ctx.student.id] ?? "1", leaderboard: storySettings(cls).leaderboard };
  }
  if (typeof sandboxId !== "string" || !UUID.test(sandboxId)) return { error: "Start the demo again.", status: 400 };
  // Demo runs write to the database, so they need the demo access code, like the rest of the demo.
  if (!memoryModeEnabled() && !(await verifyDemoAccessToken(request.cookies.get(DEMO_ACCESS_COOKIE)?.value))) return { error: "Enter your demo access code to continue.", status: 401 };
  return { scope: "demo", sandboxId };
}
export const isIdentityError = (x: unknown): x is { error: string; status: number } => typeof x === "object" && x !== null && "error" in x && "status" in x;

export async function loadStory(worldId: unknown, sceneId: unknown) {
  if (typeof worldId !== "string" || typeof sceneId !== "string") return null;
  const world = await readWorld(worldId);
  const scene = world?.scenes.find((s) => s.id === sceneId);
  if (!world || !scene?.story_mode) return null;
  return { world, scene, passages: await readPassages(world.id) };
}

export const ownsRun = (who: Identity, run: StoryRun) => (who.scope === "class" ? run.scope === "class" && run.studentId === who.studentId && run.classId === who.classId : run.scope === "demo" && run.playerKey === who.sandboxId);

// Students the teacher marked absent today (none before the absent migration runs).
export async function absentToday(classId: string) {
  return (await getClassroomStore()?.getAbsentToday(classId).catch(() => [] as string[])) ?? [];
}
// The class's squads, from its most recent live round: student id -> squad name.
export async function classSquads(classId: string) {
  const live = getLiveStore();
  if (!live) return new Map<string, string>();
  const sessions = (await live.listForClasses([classId]).catch(() => [])).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const s of sessions) {
    const [players, squads] = await Promise.all([live.listPlayers(s.id), live.listSquads(s.id)]);
    const name = new Map(squads.map((q) => [q.id, q.name]));
    const map = new Map(players.filter((p) => p.studentId && p.squadId && name.has(p.squadId)).map((p) => [p.studentId!, name.get(p.squadId!)!]));
    if (map.size) return map;
  }
  return new Map<string, string>();
}
