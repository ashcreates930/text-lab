// Storage for Story Mode runs and scored rounds: Supabase tables story_runs and story_round_scores on the server, a
// memory store for local development and tests (CLASSROOM_DEV_STORE=memory).
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "./supabase.ts";
import { memoryModeEnabled } from "./classroom/store.ts";
import type { RoundRecord, RunState, TimeSetting } from "./story-mode.ts";

export type StoryRun = {
  id: string; scope: "class" | "demo"; classId: string | null; studentId: string | null; playerKey: string; nickname: string;
  worldId: string; sceneId: string; day: string; state: RunState; total: number; bestTotal: number; bestStreak: number; finished: boolean;
  timeSetting: TimeSetting; createdAt: string; updatedAt: string;
};
export type StoryRound = RoundRecord & { id: string; runId: string; explanation: string; grace: boolean; elapsedMs: number; createdAt: string };
export type RunKey = { scope: "class" | "demo"; classId: string | null; studentId: string | null; playerKey: string; worldId: string; sceneId: string; day: string };
export type RunFilter = { scope: "class" | "demo"; classId?: string | null; worldId: string; sceneId: string; day?: string };

export interface StoryStore {
  findRun(key: RunKey): Promise<StoryRun | null>;
  getRun(id: string): Promise<StoryRun | null>;
  createRun(run: Omit<StoryRun, "id" | "createdAt" | "updatedAt">): Promise<StoryRun>;
  saveRun(id: string, patch: Partial<Pick<StoryRun, "state" | "total" | "bestTotal" | "bestStreak" | "finished" | "timeSetting">>): Promise<void>;
  listRuns(filter: RunFilter): Promise<StoryRun[]>;
  addRound(round: Omit<StoryRound, "id" | "createdAt">): Promise<void>;
  listRounds(runIds: string[]): Promise<StoryRound[]>;
  // Clears a run's rounds when the player starts the scene over.
  clearRounds(runId: string): Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);
export const storyDay = today;

const g = globalThis as unknown as { __ittStory?: { runs: StoryRun[]; rounds: StoryRound[] } };
export function memoryStoryStore(mem = (g.__ittStory ??= { runs: [], rounds: [] })): StoryStore {
  const now = () => new Date().toISOString();
  const matches = (r: StoryRun, f: RunFilter) => r.scope === f.scope && r.worldId === f.worldId && r.sceneId === f.sceneId && (f.classId === undefined || r.classId === f.classId) && (!f.day || r.day === f.day);
  return {
    async findRun(k) { return mem.runs.find((r) => r.scope === k.scope && r.playerKey === k.playerKey && r.worldId === k.worldId && r.sceneId === k.sceneId && (k.scope === "class" ? r.classId === k.classId : r.day === k.day)) ?? null; },
    async getRun(id) { return mem.runs.find((r) => r.id === id) ?? null; },
    // One run per player per scene (and day, for demo visitors): a second start returns the first run.
    async createRun(run) { const same = mem.runs.find((r) => r.scope === run.scope && r.playerKey === run.playerKey && r.worldId === run.worldId && r.sceneId === run.sceneId && (run.scope === "class" ? r.classId === run.classId : r.day === run.day)); if (same) return same; const row = { ...run, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() }; mem.runs.push(row); return row; },
    async saveRun(id, patch) { const r = mem.runs.find((x) => x.id === id); if (r) Object.assign(r, patch, { updatedAt: now() }); },
    async listRuns(f) { return mem.runs.filter((r) => matches(r, f)); },
    async addRound(round) { mem.rounds.push({ ...round, id: crypto.randomUUID(), createdAt: now() }); },
    async listRounds(ids) { const set = new Set(ids); return mem.rounds.filter((r) => set.has(r.runId)); },
    async clearRounds(runId) { mem.rounds = mem.rounds.filter((r) => r.runId !== runId); },
  };
}

type RunRow = { id: string; scope: "class" | "demo"; class_id: string | null; student_id: string | null; player_key: string; nickname: string; world_id: string; scene_id: string; day: string; state: RunState; total: number; best_total: number; best_streak: number; finished: boolean; time_setting: TimeSetting; created_at: string; updated_at: string };
const fromRun = (r: RunRow): StoryRun => ({ id: r.id, scope: r.scope, classId: r.class_id, studentId: r.student_id, playerKey: r.player_key, nickname: r.nickname, worldId: r.world_id, sceneId: r.scene_id, day: r.day, state: r.state, total: r.total, bestTotal: r.best_total, bestStreak: r.best_streak, finished: r.finished, timeSetting: r.time_setting, createdAt: r.created_at, updatedAt: r.updated_at });
type RoundRow = { id: string; run_id: string; round: number; kind: RoundRecord["kind"]; choice: string; proof: string[]; explanation: string; valid: boolean; base: number; speed: number; multiplier: number; doubled: boolean; grace: boolean; points: number; elapsed_ms: number; created_at: string };
function supabaseStoryStore(db: SupabaseClient): StoryStore {
  const must = <T,>(res: { data: T | null; error: { message: string } | null }) => { if (res.error) throw new Error(res.error.message); return res.data as T; };
  return {
    async findRun(k) {
      let q = db.from("story_runs").select("*").eq("scope", k.scope).eq("player_key", k.playerKey).eq("world_id", k.worldId).eq("scene_id", k.sceneId);
      q = k.scope === "class" ? q.eq("class_id", k.classId!) : q.eq("day", k.day);
      const r = must(await q.maybeSingle()) as RunRow | null; return r ? fromRun(r) : null;
    },
    async getRun(id) { const r = must(await db.from("story_runs").select("*").eq("id", id).maybeSingle()) as RunRow | null; return r ? fromRun(r) : null; },
    async createRun(run) {
      return fromRun(must(await db.from("story_runs").insert({ scope: run.scope, class_id: run.classId, student_id: run.studentId, player_key: run.playerKey, nickname: run.nickname, world_id: run.worldId, scene_id: run.sceneId, day: run.day, state: run.state, total: run.total, best_total: run.bestTotal, best_streak: run.bestStreak, finished: run.finished, time_setting: run.timeSetting }).select("*").single()) as RunRow);
    },
    async saveRun(id, p) {
      must(await db.from("story_runs").update({ ...(p.state ? { state: p.state } : {}), ...(p.total !== undefined ? { total: p.total } : {}), ...(p.bestTotal !== undefined ? { best_total: p.bestTotal } : {}), ...(p.bestStreak !== undefined ? { best_streak: p.bestStreak } : {}), ...(p.finished !== undefined ? { finished: p.finished } : {}), ...(p.timeSetting ? { time_setting: p.timeSetting } : {}), updated_at: new Date().toISOString() }).eq("id", id));
    },
    async listRuns(f) {
      let q = db.from("story_runs").select("*").eq("scope", f.scope).eq("world_id", f.worldId).eq("scene_id", f.sceneId);
      if (f.classId !== undefined) q = f.classId === null ? q.is("class_id", null) : q.eq("class_id", f.classId);
      if (f.day) q = q.eq("day", f.day);
      return (must(await q.order("best_total", { ascending: false }).limit(1000)) as RunRow[]).map(fromRun);
    },
    async addRound(r) {
      must(await db.from("story_round_scores").insert({ run_id: r.runId, round: r.round, kind: r.kind, choice: r.choice, proof: r.proof, explanation: r.explanation, valid: r.valid, base: r.base, speed: r.speed, multiplier: r.multiplier, doubled: r.doubled, grace: r.grace, points: r.points, elapsed_ms: r.elapsedMs }));
    },
    async listRounds(ids) {
      if (!ids.length) return [];
      const rows = must(await db.from("story_round_scores").select("*").in("run_id", ids).order("round")) as RoundRow[];
      return rows.map((r) => ({ id: r.id, runId: r.run_id, round: r.round, kind: r.kind, choice: r.choice, proof: r.proof, explanation: r.explanation, valid: r.valid, base: r.base, speed: r.speed, multiplier: Number(r.multiplier), doubled: r.doubled, grace: r.grace, points: r.points, elapsedMs: r.elapsed_ms, coinsEarned: 0, detail: "", streak: 0, createdAt: r.created_at }));
    },
    async clearRounds(runId) { must(await db.from("story_round_scores").delete().eq("run_id", runId)); },
  };
}

export function getStoryStore(): StoryStore | null {
  const db = getServiceSupabase();
  if (db) return supabaseStoryStore(db);
  return memoryModeEnabled() ? memoryStoryStore() : null;
}
