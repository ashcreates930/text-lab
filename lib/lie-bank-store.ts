// Storage for planted lies (Plant a Lie): Supabase table planted_lies on the server, a memory store for local
// development and tests (CLASSROOM_DEV_STORE=memory).
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "./supabase.ts";
import { memoryModeEnabled } from "./classroom/store.ts";
import type { PlantedLie, PlantedLieStatus } from "./planted-lies.ts";

export interface LieBankStore {
  add(lie: Omit<PlantedLie, "id" | "createdAt" | "reviewedAt">): Promise<PlantedLie>;
  get(id: string): Promise<PlantedLie | null>;
  listForClass(classId: string): Promise<PlantedLie[]>;
  listForStudent(studentId: string): Promise<PlantedLie[]>;
  setStatus(id: string, status: PlantedLieStatus): Promise<void>;
}

const g = globalThis as unknown as { __ittLies?: PlantedLie[] };
export function memoryLieBankStore(rows: PlantedLie[] = (g.__ittLies ??= [])): LieBankStore {
  const newest = (a: PlantedLie, b: PlantedLie) => b.createdAt.localeCompare(a.createdAt);
  return {
    async add(l) { const row = { ...l, id: crypto.randomUUID(), createdAt: new Date().toISOString(), reviewedAt: null }; rows.push(row); return row; },
    async get(id) { return rows.find((r) => r.id === id) ?? null; },
    async listForClass(classId) { return rows.filter((r) => r.classId === classId).sort(newest); },
    async listForStudent(studentId) { return rows.filter((r) => r.studentId === studentId).sort(newest); },
    async setStatus(id, status) { const r = rows.find((x) => x.id === id); if (r) { r.status = status; r.reviewedAt = new Date().toISOString(); } },
  };
}

type Row = { id: string; class_id: string; student_id: string; world_id: string; scene_id: string; clue_id: string; character_id: string; sentence: string; truth_paragraph: string; truth_line: string; status: PlantedLieStatus; created_at: string; reviewed_at: string | null };
const fromRow = (r: Row): PlantedLie => ({ id: r.id, classId: r.class_id, studentId: r.student_id, worldId: r.world_id, sceneId: r.scene_id, clueId: r.clue_id, characterId: r.character_id, sentence: r.sentence, truthParagraph: r.truth_paragraph, truthLine: r.truth_line, status: r.status, createdAt: r.created_at, reviewedAt: r.reviewed_at });
function supabaseLieBankStore(db: SupabaseClient): LieBankStore {
  const must = <T,>(res: { data: T | null; error: { message: string } | null }) => { if (res.error) throw new Error(res.error.message); return res.data as T; };
  return {
    async add(l) {
      return fromRow(must(await db.from("planted_lies").insert({ class_id: l.classId, student_id: l.studentId, world_id: l.worldId, scene_id: l.sceneId, clue_id: l.clueId, character_id: l.characterId, sentence: l.sentence, truth_paragraph: l.truthParagraph, truth_line: l.truthLine, status: l.status }).select("*").single()) as Row);
    },
    async get(id) { const r = must(await db.from("planted_lies").select("*").eq("id", id).maybeSingle()) as Row | null; return r ? fromRow(r) : null; },
    async listForClass(classId) { return (must(await db.from("planted_lies").select("*").eq("class_id", classId).order("created_at", { ascending: false }).limit(300)) as Row[]).map(fromRow); },
    async listForStudent(studentId) { return (must(await db.from("planted_lies").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(50)) as Row[]).map(fromRow); },
    async setStatus(id, status) { must(await db.from("planted_lies").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id)); },
  };
}

export function getLieBankStore(): LieBankStore | null {
  const db = getServiceSupabase();
  if (db) return supabaseLieBankStore(db);
  return memoryModeEnabled() ? memoryLieBankStore() : null;
}
