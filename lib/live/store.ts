// Live round data access. Production uses Supabase (service role, server routes only; tables in
// supabase/migrations/202610190001_live_rounds.sql). Local development without Supabase uses server memory, the same
// switch as the classroom store (CLASSROOM_DEV_STORE=memory).
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "../supabase.ts";
import { memoryModeEnabled } from "../classroom/store.ts";
import type { LivePlayer, LiveResponse, LiveSession, LiveSquad, Round, SessionStatus } from "./engine.ts";

export type StoredSession = LiveSession & { teacherId: string | null; hostHash: string };
export type SessionPatch = Partial<{ status: SessionStatus; paused: boolean; roundIndex: number; rounds: Round[]; roundStartedAt: string | null }>;

export interface LiveStore {
  createSession(s: Omit<StoredSession, "id" | "createdAt">): Promise<StoredSession>;
  getSession(id: string): Promise<StoredSession | null>;
  findByCode(code: string): Promise<StoredSession | null>;
  updateSession(id: string, patch: SessionPatch): Promise<void>;
  listForClasses(classIds: string[]): Promise<StoredSession[]>;
  listSquads(sessionId: string): Promise<LiveSquad[]>;
  replaceSquads(sessionId: string, names: string[]): Promise<LiveSquad[]>;
  listPlayers(sessionId: string): Promise<LivePlayer[]>;
  addPlayer(sessionId: string, p: { nickname: string; studentId: string | null }): Promise<LivePlayer | "taken">;
  setSquads(sessionId: string, assignments: { playerId: string; squadId: string | null }[]): Promise<void>;
  listResponses(sessionId: string): Promise<LiveResponse[]>;
  addResponse(sessionId: string, r: Omit<LiveResponse, "id" | "createdAt">): Promise<LiveResponse>;
}

// ---------- Memory (local development and tests) ----------
type Mem = { sessions: StoredSession[]; squads: (LiveSquad & { sessionId: string })[]; players: (LivePlayer & { sessionId: string })[]; responses: (LiveResponse & { sessionId: string })[] };
const g = globalThis as unknown as { __ittLive?: Mem };
let clock = 0;
// Strictly increasing timestamps, so actions in the same millisecond keep their order.
const stamp = () => { const t = Math.max(Date.now(), clock + 1); clock = t; return new Date(t).toISOString(); };
export function memoryLiveStore(mem: Mem = (g.__ittLive ??= { sessions: [], squads: [], players: [], responses: [] })): LiveStore {
  const id = () => crypto.randomUUID();
  const strip = <T extends { sessionId: string }>({ sessionId: _s, ...rest }: T) => rest;
  return {
    async createSession(s) { const row = { ...s, id: id(), createdAt: stamp() }; mem.sessions.push(row); return row; },
    async getSession(sid) { return mem.sessions.find((s) => s.id === sid) ?? null; },
    async findByCode(code) { return mem.sessions.find((s) => s.code === code.toUpperCase()) ?? null; },
    async updateSession(sid, patch) { const s = mem.sessions.find((x) => x.id === sid); if (s) Object.assign(s, patch); },
    async listForClasses(ids) { return mem.sessions.filter((s) => s.classId && ids.includes(s.classId)); },
    async listSquads(sid) { return mem.squads.filter((s) => s.sessionId === sid).map(strip).sort((a, b) => a.position - b.position); },
    async replaceSquads(sid, names) {
      mem.squads = mem.squads.filter((s) => s.sessionId !== sid);
      for (const p of mem.players) if (p.sessionId === sid) p.squadId = null;
      const rows = names.map((name, position) => ({ id: id(), name, position, sessionId: sid }));
      mem.squads.push(...rows); return rows.map(strip);
    },
    async listPlayers(sid) { return mem.players.filter((p) => p.sessionId === sid).map(strip); },
    async addPlayer(sid, p) {
      if (mem.players.some((x) => x.sessionId === sid && x.nickname === p.nickname)) return "taken";
      const row = { id: id(), nickname: p.nickname, studentId: p.studentId, squadId: null, joinedAt: stamp(), sessionId: sid };
      mem.players.push(row); return strip(row);
    },
    async setSquads(sid, list) { for (const a of list) { const p = mem.players.find((x) => x.sessionId === sid && x.id === a.playerId); if (p) p.squadId = a.squadId; } },
    async listResponses(sid) { return mem.responses.filter((r) => r.sessionId === sid).map(strip); },
    async addResponse(sid, r) { const row = { ...r, id: id(), createdAt: stamp(), sessionId: sid }; mem.responses.push(row); return strip(row); },
  };
}

// ---------- Supabase ----------
type SessionDb = { id: string; code: string; teacher_id: string | null; class_id: string | null; demo: boolean; world_id: string; status: SessionStatus; paused: boolean; round_index: number; rounds: Round[]; round_started_at: string | null; host_hash: string; created_at: string; expires_at: string };
const fromDb = (r: SessionDb): StoredSession => ({ id: r.id, code: r.code, teacherId: r.teacher_id, classId: r.class_id, demo: r.demo, worldId: r.world_id, status: r.status, paused: r.paused, roundIndex: r.round_index, rounds: r.rounds ?? [], roundStartedAt: r.round_started_at, hostHash: r.host_hash, createdAt: r.created_at, expiresAt: r.expires_at });
function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}
function supabaseLiveStore(db: SupabaseClient): LiveStore {
  return {
    async createSession(s) {
      return fromDb(must(await db.from("live_sessions").insert({ code: s.code, teacher_id: s.teacherId, class_id: s.classId, demo: s.demo, world_id: s.worldId, status: s.status, paused: s.paused, round_index: s.roundIndex, rounds: s.rounds, round_started_at: s.roundStartedAt, host_hash: s.hostHash, expires_at: s.expiresAt }).select("*").single()));
    },
    async getSession(id) { const { data } = await db.from("live_sessions").select("*").eq("id", id).maybeSingle(); return data ? fromDb(data as SessionDb) : null; },
    async findByCode(code) { const { data } = await db.from("live_sessions").select("*").eq("code", code.toUpperCase()).maybeSingle(); return data ? fromDb(data as SessionDb) : null; },
    async updateSession(id, p) {
      must(await db.from("live_sessions").update({ ...(p.status !== undefined ? { status: p.status } : {}), ...(p.paused !== undefined ? { paused: p.paused } : {}), ...(p.roundIndex !== undefined ? { round_index: p.roundIndex } : {}), ...(p.rounds !== undefined ? { rounds: p.rounds } : {}), ...(p.roundStartedAt !== undefined ? { round_started_at: p.roundStartedAt } : {}) }).eq("id", id));
    },
    async listForClasses(ids) { if (!ids.length) return []; return (must(await db.from("live_sessions").select("*").in("class_id", ids).order("created_at", { ascending: false }).limit(200)) as SessionDb[]).map(fromDb); },
    async listSquads(sid) { return (must(await db.from("live_squads").select("id,name,position").eq("session_id", sid).order("position")) as LiveSquad[]); },
    async replaceSquads(sid, names) {
      must(await db.from("live_players").update({ squad_id: null }).eq("session_id", sid));
      must(await db.from("live_squads").delete().eq("session_id", sid));
      if (!names.length) return [];
      return must(await db.from("live_squads").insert(names.map((name, position) => ({ session_id: sid, name, position }))).select("id,name,position")) as LiveSquad[];
    },
    async listPlayers(sid) {
      const rows = must(await db.from("live_players").select("id,nickname,squad_id,student_id,joined_at").eq("session_id", sid).order("joined_at")) as { id: string; nickname: string; squad_id: string | null; student_id: string | null; joined_at: string }[];
      return rows.map((r) => ({ id: r.id, nickname: r.nickname, squadId: r.squad_id, studentId: r.student_id, joinedAt: r.joined_at }));
    },
    async addPlayer(sid, p) {
      const { data, error } = await db.from("live_players").insert({ session_id: sid, nickname: p.nickname, student_id: p.studentId }).select("id,nickname,squad_id,student_id,joined_at").single();
      if (error) { if (error.code === "23505") return "taken"; throw new Error(error.message); }
      return { id: data.id, nickname: data.nickname, squadId: data.squad_id, studentId: data.student_id, joinedAt: data.joined_at };
    },
    async setSquads(sid, list) { for (const a of list) must(await db.from("live_players").update({ squad_id: a.squadId }).eq("session_id", sid).eq("id", a.playerId)); },
    async listResponses(sid) {
      const rows = must(await db.from("live_round_responses").select("*").eq("session_id", sid).order("created_at")) as { id: string; round_index: number; squad_id: string | null; player_id: string | null; role: LiveResponse["role"]; kind: LiveResponse["kind"]; payload: Record<string, unknown>; flagged: boolean; created_at: string }[];
      return rows.map((r) => ({ id: r.id, roundIndex: r.round_index, squadId: r.squad_id, playerId: r.player_id, role: r.role, kind: r.kind, payload: r.payload, flagged: r.flagged, createdAt: r.created_at }));
    },
    async addResponse(sid, r) {
      const d = must(await db.from("live_round_responses").insert({ session_id: sid, round_index: r.roundIndex, squad_id: r.squadId, player_id: r.playerId, role: r.role, kind: r.kind, payload: r.payload, flagged: r.flagged }).select("id,created_at").single()) as { id: string; created_at: string };
      return { ...r, id: d.id, createdAt: d.created_at };
    },
  };
}

export function getLiveStore(): LiveStore | null {
  const db = getServiceSupabase();
  if (db) return supabaseLiveStore(db);
  return memoryModeEnabled() ? memoryLiveStore() : null;
}
