// Classroom data access. Production uses Supabase (service role, server routes only). For local development without
// Supabase, CLASSROOM_DEV_STORE=memory keeps everything in server memory so the full flow can be tried on one machine.
import { randomInt } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "../supabase.ts";
import type { LivePlan, LiveState } from "./plan.ts";

export type ClassRow = { id: string; teacher_id: string; name: string | null; class_code: string; world_id: string; grade: number; status: string; preview_enabled: boolean; created_at: string };
export type StudentRow = { id: string; session_id: string; nickname: string; created_at: string };
export type AssignmentRow = { id: string; session_id: string; lesson_id: string; due_date: string | null; created_at: string };
export type CompletionRow = { student_id: string; lesson_id: string; first_try_correct: number; total: number; finished_at: string };
export type AnalysisRow = { id: string; session_id: string; plan: LivePlan; step: number; phase: LiveState["phase"]; chat_started_at: string | null; status: LiveState["status"]; created_at: string; updated_at: string };
export type ResponseRow = { id: string; analysis_id: string; student_id: string; step: number; kind: "answer" | "takeaway"; response_text: string; created_at: string };

export interface ClassroomStore {
  ensureTeacher(authUserId: string, displayName: string): Promise<{ id: string }>;
  listClasses(teacherId: string): Promise<ClassRow[]>;
  createClass(teacherId: string, input: { name: string; worldId: string; grade: number }): Promise<ClassRow>;
  getClass(teacherId: string, classId: string): Promise<ClassRow | null>;
  setPreviewEnabled(classId: string, enabled: boolean): Promise<void>;
  findActiveClassByCode(code: string): Promise<ClassRow | null>;
  getClassById(classId: string): Promise<ClassRow | null>;
  listStudents(classId: string): Promise<StudentRow[]>;
  getStudent(studentId: string): Promise<StudentRow | null>;
  createStudent(classId: string, nickname: string, resumeHash: string): Promise<StudentRow | "taken">;
  findStudentByResume(classId: string, nickname: string, resumeHash: string): Promise<StudentRow | null>;
  listAssignments(classId: string): Promise<AssignmentRow[]>;
  upsertAssignment(classId: string, lessonId: string, dueDate: string | null): Promise<void>;
  deleteAssignment(classId: string, lessonId: string): Promise<void>;
  listCompletions(studentIds: string[]): Promise<CompletionRow[]>;
  upsertCompletion(row: CompletionRow): Promise<void>;
  getActiveAnalysis(classId: string): Promise<AnalysisRow | null>;
  createAnalysis(classId: string, plan: LivePlan, first: LiveState): Promise<AnalysisRow>;
  updateAnalysis(id: string, state: LiveState): Promise<AnalysisRow | null>;
  listResponses(analysisId: string): Promise<ResponseRow[]>;
  upsertResponse(row: Omit<ResponseRow, "id" | "created_at">): Promise<void>;
}

const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function newClassCode() {
  return Array.from({ length: 6 }, () => CODE_LETTERS[randomInt(CODE_LETTERS.length)]).join("");
}

function supabaseStore(db: SupabaseClient): ClassroomStore {
  const must = <T,>(result: { data: T | null; error: { message: string } | null }) => { if (result.error) throw new Error(result.error.message); return result.data as T; };
  return {
    async ensureTeacher(authUserId, displayName) {
      const found = must(await db.from("teachers").select("id").eq("auth_user_id", authUserId).maybeSingle()) as { id: string } | null;
      if (found) return found;
      return must(await db.from("teachers").insert({ auth_user_id: authUserId, display_name: displayName }).select("id").single()) as { id: string };
    },
    async listClasses(teacherId) { return must(await db.from("sessions").select("*").eq("teacher_id", teacherId).order("created_at", { ascending: false })) as ClassRow[]; },
    async createClass(teacherId, input) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await db.from("sessions").insert({ teacher_id: teacherId, name: input.name, world_id: input.worldId, grade: input.grade, class_code: newClassCode() }).select("*").single();
        if (!error) return data as ClassRow;
        if (error.code !== "23505") throw new Error(error.message);
      }
      throw new Error("Could not create a unique class code.");
    },
    async getClass(teacherId, classId) { return must(await db.from("sessions").select("*").eq("id", classId).eq("teacher_id", teacherId).maybeSingle()) as ClassRow | null; },
    async setPreviewEnabled(classId, enabled) { must(await db.from("sessions").update({ preview_enabled: enabled }).eq("id", classId)); },
    async findActiveClassByCode(code) { return must(await db.from("sessions").select("*").eq("class_code", code.toUpperCase()).eq("status", "active").maybeSingle()) as ClassRow | null; },
    async getClassById(classId) { return must(await db.from("sessions").select("*").eq("id", classId).maybeSingle()) as ClassRow | null; },
    async listStudents(classId) { return must(await db.from("students").select("id,session_id,nickname,created_at").eq("session_id", classId).order("nickname")) as StudentRow[]; },
    async getStudent(studentId) { return must(await db.from("students").select("id,session_id,nickname,created_at").eq("id", studentId).maybeSingle()) as StudentRow | null; },
    async createStudent(classId, nickname, resumeHash) {
      const { data, error } = await db.from("students").insert({ session_id: classId, nickname, resume_phrase_hash: resumeHash }).select("id,session_id,nickname,created_at").single();
      if (error?.code === "23505") return "taken";
      if (error) throw new Error(error.message);
      return data as StudentRow;
    },
    async findStudentByResume(classId, nickname, resumeHash) { return must(await db.from("students").select("id,session_id,nickname,created_at").eq("session_id", classId).eq("nickname", nickname).eq("resume_phrase_hash", resumeHash).maybeSingle()) as StudentRow | null; },
    async listAssignments(classId) { return must(await db.from("lesson_assignments").select("*").eq("session_id", classId).order("created_at")) as AssignmentRow[]; },
    async upsertAssignment(classId, lessonId, dueDate) { must(await db.from("lesson_assignments").upsert({ session_id: classId, lesson_id: lessonId, due_date: dueDate }, { onConflict: "session_id,lesson_id" })); },
    async deleteAssignment(classId, lessonId) { must(await db.from("lesson_assignments").delete().eq("session_id", classId).eq("lesson_id", lessonId)); },
    async listCompletions(studentIds) { if (!studentIds.length) return []; return must(await db.from("lesson_completions").select("student_id,lesson_id,first_try_correct,total,finished_at").in("student_id", studentIds)) as CompletionRow[]; },
    async upsertCompletion(row) { must(await db.from("lesson_completions").upsert(row, { onConflict: "student_id,lesson_id" })); },
    async getActiveAnalysis(classId) { return must(await db.from("live_analyses").select("*").eq("session_id", classId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()) as AnalysisRow | null; },
    async createAnalysis(classId, plan, first) {
      must(await db.from("live_analyses").update({ status: "ended", updated_at: new Date().toISOString() }).eq("session_id", classId).eq("status", "active"));
      return must(await db.from("live_analyses").insert({ session_id: classId, plan, step: first.step, phase: first.phase, chat_started_at: first.chatStartedAt, status: first.status }).select("*").single()) as AnalysisRow;
    },
    async updateAnalysis(id, state) { return must(await db.from("live_analyses").update({ step: state.step, phase: state.phase, chat_started_at: state.chatStartedAt, status: state.status, updated_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle()) as AnalysisRow | null; },
    async listResponses(analysisId) { return must(await db.from("live_responses").select("*").eq("analysis_id", analysisId).order("created_at")) as ResponseRow[]; },
    async upsertResponse(row) { must(await db.from("live_responses").upsert(row, { onConflict: "analysis_id,student_id,step,kind" })); },
  };
}

type Memory = { teachers: { id: string; auth: string }[]; classes: ClassRow[]; students: (StudentRow & { hash: string })[]; assignments: AssignmentRow[]; completions: CompletionRow[]; analyses: AnalysisRow[]; responses: ResponseRow[] };
const g = globalThis as unknown as { __ittMemory?: Memory };
function memoryStore(): ClassroomStore {
  const m = (g.__ittMemory ??= { teachers: [], classes: [], students: [], assignments: [], completions: [], analyses: [], responses: [] });
  const id = () => crypto.randomUUID(), now = () => new Date().toISOString();
  const strip = ({ hash: _hash, ...s }: StudentRow & { hash: string }): StudentRow => s;
  return {
    async ensureTeacher(auth) { let t = m.teachers.find((x) => x.auth === auth); if (!t) { t = { id: id(), auth }; m.teachers.push(t); } return { id: t.id }; },
    async listClasses(teacherId) { return m.classes.filter((c) => c.teacher_id === teacherId).reverse(); },
    async createClass(teacherId, input) { const row: ClassRow = { id: id(), teacher_id: teacherId, name: input.name, class_code: newClassCode(), world_id: input.worldId, grade: input.grade, status: "active", preview_enabled: false, created_at: now() }; m.classes.push(row); return row; },
    async getClass(teacherId, classId) { return m.classes.find((c) => c.id === classId && c.teacher_id === teacherId) ?? null; },
    async setPreviewEnabled(classId, enabled) { const c = m.classes.find((x) => x.id === classId); if (c) c.preview_enabled = enabled; },
    async findActiveClassByCode(code) { return m.classes.find((c) => c.class_code === code.toUpperCase() && c.status === "active") ?? null; },
    async getClassById(classId) { return m.classes.find((c) => c.id === classId) ?? null; },
    async listStudents(classId) { return m.students.filter((s) => s.session_id === classId).map(strip).sort((a, b) => a.nickname.localeCompare(b.nickname)); },
    async getStudent(studentId) { const s = m.students.find((x) => x.id === studentId); return s ? strip(s) : null; },
    async createStudent(classId, nickname, hash) { if (m.students.some((s) => s.session_id === classId && s.nickname === nickname)) return "taken"; const s = { id: id(), session_id: classId, nickname, created_at: now(), hash }; m.students.push(s); return strip(s); },
    async findStudentByResume(classId, nickname, hash) { const s = m.students.find((x) => x.session_id === classId && x.nickname === nickname && x.hash === hash); return s ? strip(s) : null; },
    async listAssignments(classId) { return m.assignments.filter((a) => a.session_id === classId); },
    async upsertAssignment(classId, lessonId, dueDate) { const a = m.assignments.find((x) => x.session_id === classId && x.lesson_id === lessonId); if (a) a.due_date = dueDate; else m.assignments.push({ id: id(), session_id: classId, lesson_id: lessonId, due_date: dueDate, created_at: now() }); },
    async deleteAssignment(classId, lessonId) { m.assignments = m.assignments.filter((a) => !(a.session_id === classId && a.lesson_id === lessonId)); },
    async listCompletions(studentIds) { return m.completions.filter((c) => studentIds.includes(c.student_id)); },
    async upsertCompletion(row) { m.completions = m.completions.filter((c) => !(c.student_id === row.student_id && c.lesson_id === row.lesson_id)); m.completions.push(row); },
    async getActiveAnalysis(classId) { return [...m.analyses].reverse().find((a) => a.session_id === classId && a.status === "active") ?? null; },
    async createAnalysis(classId, plan, first) { m.analyses.filter((a) => a.session_id === classId).forEach((a) => (a.status = "ended")); const row: AnalysisRow = { id: id(), session_id: classId, plan, step: first.step, phase: first.phase, chat_started_at: first.chatStartedAt, status: first.status, created_at: now(), updated_at: now() }; m.analyses.push(row); return row; },
    async updateAnalysis(aid, state) { const a = m.analyses.find((x) => x.id === aid); if (!a) return null; Object.assign(a, { step: state.step, phase: state.phase, chat_started_at: state.chatStartedAt, status: state.status, updated_at: now() }); return a; },
    async listResponses(analysisId) { return m.responses.filter((r) => r.analysis_id === analysisId); },
    async upsertResponse(row) { m.responses = m.responses.filter((r) => !(r.analysis_id === row.analysis_id && r.student_id === row.student_id && r.step === row.step && r.kind === row.kind)); m.responses.push({ ...row, id: id(), created_at: now() }); },
  };
}

export function memoryModeEnabled() {
  return process.env.CLASSROOM_DEV_STORE === "memory" && process.env.NODE_ENV !== "production" && !process.env.VERCEL;
}
export function getClassroomStore(): ClassroomStore | null {
  const db = getServiceSupabase();
  if (db) return supabaseStore(db);
  return memoryModeEnabled() ? memoryStore() : null;
}
