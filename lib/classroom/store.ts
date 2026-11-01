// Classroom data access. Production uses Supabase (service role, server routes only). For local development without
// Supabase, CLASSROOM_DEV_STORE=memory keeps everything in server memory so the full flow can be tried on one machine.
import { randomInt } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "../supabase.ts";
import type { LivePlan, LiveState } from "./plan.ts";
import type { StudentProgress } from "./progress.ts";

export type ClassRow = { id: string; teacher_id: string; name: string | null; class_code: string; world_id: string; grade: number; status: string; preview_enabled: boolean; created_at: string; roles_enabled?: boolean; angles_enabled?: boolean; leaderboard_mode?: "individual" | "squad" | "off"; story_mode_on?: boolean };
// Story Mode settings: the class leaderboard (individual unless the teacher picks squads or off) and whether scenes with
// Story Mode use it (otherwise the Case file clue board). Older rows, before the migration, have neither.
export const storySettings = (c: Pick<ClassRow, "leaderboard_mode" | "story_mode_on">) => ({ leaderboard: c.leaderboard_mode ?? "individual", storyModeOn: c.story_mode_on !== false });
export type TimeSettingValue = "1" | "1.5" | "2" | "untimed";
// Student roles and angles are on unless the teacher turned them off (older rows, before the migration, have neither).
export const personalSettings = (c: Pick<ClassRow, "roles_enabled" | "angles_enabled">) => ({ rolesOn: c.roles_enabled !== false, anglesOn: c.angles_enabled !== false });
export type StudentRow = { id: string; session_id: string; nickname: string; created_at: string };
export type AssignmentRow = { id: string; session_id: string; lesson_id: string; due_date: string | null; created_at: string };
export type CompletionRow = { student_id: string; lesson_id: string; first_try_correct: number; total: number; finished_at: string };
// Proof Race expeditions (supabase/migrations/202610310001_expeditions.sql): one row per attempt; record holds the
// Case Notes, the Interview and the award (lib/expedition-progress.ts).
export type ExpeditionResultRow = { student_id: string; world_id: string; expedition_id: string; attempt_id: string; complete: boolean; score: number; first_try: number; total: number; solved_case: boolean | null; record: Record<string, unknown>; started_at: string; finished_at: string | null; updated_at?: string };
export type ExpeditionAssignmentRow = { id: string; session_id: string; expedition_id: string; due_date: string | null; created_at: string };
export type AnalysisRow = { id: string; session_id: string; plan: LivePlan; step: number; phase: LiveState["phase"]; chat_started_at: string | null; status: LiveState["status"]; created_at: string; updated_at: string };
export type ResponseRow = { id: string; analysis_id: string; student_id: string; step: number; kind: "answer" | "takeaway"; response_text: string; created_at: string };

export interface ClassroomStore {
  ensureTeacher(authUserId: string, displayName: string): Promise<{ id: string }>;
  listClasses(teacherId: string): Promise<ClassRow[]>;
  createClass(teacherId: string, input: { name: string; worldId: string; grade: number }): Promise<ClassRow>;
  getClass(teacherId: string, classId: string): Promise<ClassRow | null>;
  setPreviewEnabled(classId: string, enabled: boolean): Promise<void>;
  setPersonalSettings(classId: string, settings: { rolesOn?: boolean; anglesOn?: boolean }): Promise<void>;
  setStorySettings(classId: string, settings: { leaderboard?: "individual" | "squad" | "off"; storyModeOn?: boolean }): Promise<void>;
  // Extra time per student for Story Mode (1.5x, 2x or untimed). Students without a setting have normal time.
  setStudentTime(studentId: string, setting: TimeSettingValue): Promise<void>;
  getStudentTimes(classId: string): Promise<Record<string, TimeSettingValue>>;
  // Absences, one per student per day (America/New_York date), marked from the live host screen or the class page.
  // Absent students are left out of squad averages; everyone else in a squad counts, with 0 if they didn't answer.
  // Past days keep their absences, so recalculated session totals stay the same.
  setStudentAbsent(studentId: string, absent: boolean, day?: string): Promise<void>;
  getAbsentOn(classId: string, day: string): Promise<string[]>;
  findActiveClassByCode(code: string): Promise<ClassRow | null>;
  getClassById(classId: string): Promise<ClassRow | null>;
  listStudents(classId: string): Promise<StudentRow[]>;
  getStudent(studentId: string): Promise<StudentRow | null>;
  createStudent(classId: string, nickname: string, resumeHash: string): Promise<StudentRow | "taken">;
  findStudentByResume(classId: string, nickname: string, resumeHash: string): Promise<StudentRow | null>;
  // Reading progress lives in students.progress (see progress.ts); null when the student has not read yet.
  getProgress(studentId: string): Promise<StudentProgress | null>;
  saveProgress(studentId: string, progress: StudentProgress): Promise<void>;
  listAssignments(classId: string): Promise<AssignmentRow[]>;
  upsertAssignment(classId: string, lessonId: string, dueDate: string | null): Promise<void>;
  deleteAssignment(classId: string, lessonId: string): Promise<void>;
  listCompletions(studentIds: string[]): Promise<CompletionRow[]>;
  upsertCompletion(row: CompletionRow): Promise<void>;
  listExpeditionResults(studentIds: string[]): Promise<ExpeditionResultRow[]>;
  upsertExpeditionResult(row: ExpeditionResultRow): Promise<void>;
  listExpeditionAssignments(classId: string): Promise<ExpeditionAssignmentRow[]>;
  upsertExpeditionAssignment(classId: string, expeditionId: string, dueDate: string | null): Promise<void>;
  deleteExpeditionAssignment(classId: string, expeditionId: string): Promise<void>;
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
    async setStorySettings(classId, s) { must(await db.from("sessions").update({ ...(s.leaderboard ? { leaderboard_mode: s.leaderboard } : {}), ...(s.storyModeOn !== undefined ? { story_mode_on: s.storyModeOn } : {}) }).eq("id", classId)); },
    async setStudentTime(studentId, setting) { must(await db.from("students").update({ time_setting: setting }).eq("id", studentId)); },
    async setStudentAbsent(studentId, absent, day = absentDay()) {
      if (absent) must(await db.from("student_absences").upsert({ student_id: studentId, day }, { onConflict: "student_id,day", ignoreDuplicates: true }));
      else must(await db.from("student_absences").delete().eq("student_id", studentId).eq("day", day));
    },
    async getAbsentOn(classId, day) {
      const ids = (must(await db.from("students").select("id").eq("session_id", classId)) as { id: string }[]).map((r) => r.id);
      if (!ids.length) return [];
      return (must(await db.from("student_absences").select("student_id").eq("day", day).in("student_id", ids)) as { student_id: string }[]).map((r) => r.student_id);
    },
    async getStudentTimes(classId) { const res = await db.from("students").select("id,time_setting").eq("session_id", classId); if (res.error) return {}; return Object.fromEntries((res.data as { id: string; time_setting: TimeSettingValue }[]).map((r) => [r.id, r.time_setting])); },
    async setPersonalSettings(classId, s) { must(await db.from("sessions").update({ ...(s.rolesOn !== undefined ? { roles_enabled: s.rolesOn } : {}), ...(s.anglesOn !== undefined ? { angles_enabled: s.anglesOn } : {}) }).eq("id", classId)); },
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
    async getProgress(studentId) { const row = must(await db.from("students").select("progress").eq("id", studentId).maybeSingle()) as { progress: Record<string, unknown> | null } | null; const p = row?.progress; return p && typeof p === "object" && (p as { v?: number }).v === 1 ? (p as StudentProgress) : null; },
    async saveProgress(studentId, progress) { must(await db.from("students").update({ progress }).eq("id", studentId)); },
    async listAssignments(classId) { return must(await db.from("lesson_assignments").select("*").eq("session_id", classId).order("created_at")) as AssignmentRow[]; },
    async upsertAssignment(classId, lessonId, dueDate) { must(await db.from("lesson_assignments").upsert({ session_id: classId, lesson_id: lessonId, due_date: dueDate }, { onConflict: "session_id,lesson_id" })); },
    async deleteAssignment(classId, lessonId) { must(await db.from("lesson_assignments").delete().eq("session_id", classId).eq("lesson_id", lessonId)); },
    async listCompletions(studentIds) { if (!studentIds.length) return []; return must(await db.from("lesson_completions").select("student_id,lesson_id,first_try_correct,total,finished_at").in("student_id", studentIds)) as CompletionRow[]; },
    async upsertCompletion(row) { must(await db.from("lesson_completions").upsert(row, { onConflict: "student_id,lesson_id" })); },
    async listExpeditionResults(studentIds) { if (!studentIds.length) return []; return must(await db.from("expedition_results").select("student_id,world_id,expedition_id,attempt_id,complete,score,first_try,total,solved_case,record,started_at,finished_at,updated_at").in("student_id", studentIds).order("started_at")) as ExpeditionResultRow[]; },
    async upsertExpeditionResult(row) { must(await db.from("expedition_results").upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "student_id,expedition_id,attempt_id" })); },
    async listExpeditionAssignments(classId) { return must(await db.from("expedition_assignments").select("*").eq("session_id", classId).order("created_at")) as ExpeditionAssignmentRow[]; },
    async upsertExpeditionAssignment(classId, expeditionId, dueDate) { must(await db.from("expedition_assignments").upsert({ session_id: classId, expedition_id: expeditionId, due_date: dueDate }, { onConflict: "session_id,expedition_id" })); },
    async deleteExpeditionAssignment(classId, expeditionId) { must(await db.from("expedition_assignments").delete().eq("session_id", classId).eq("expedition_id", expeditionId)); },
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

type Memory = { teachers: { id: string; auth: string }[]; classes: ClassRow[]; students: (StudentRow & { hash: string })[]; progress?: Record<string, StudentProgress>; assignments: AssignmentRow[]; completions: CompletionRow[]; analyses: AnalysisRow[]; responses: ResponseRow[]; expeditionResults?: ExpeditionResultRow[]; expeditionAssignments?: ExpeditionAssignmentRow[] };
const g = globalThis as unknown as { __ittMemory?: Memory; __ittAbsences?: { studentId: string; day: string }[] };
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
    async setStorySettings(classId, s) { const c = m.classes.find((x) => x.id === classId); if (!c) return; if (s.leaderboard) c.leaderboard_mode = s.leaderboard; if (s.storyModeOn !== undefined) c.story_mode_on = s.storyModeOn; },
    async setStudentTime(studentId, setting) { const s = m.students.find((x) => x.id === studentId) as (typeof m.students)[number] & { time_setting?: TimeSettingValue } | undefined; if (s) s.time_setting = setting; },
    async setStudentAbsent(studentId, absent, day = absentDay()) { const a = (g.__ittAbsences ??= []).filter((x) => !(x.studentId === studentId && x.day === day)); if (absent) a.push({ studentId, day }); g.__ittAbsences = a; },
    async getAbsentOn(classId, day) { const mine = new Set(m.students.filter((s) => s.session_id === classId).map((s) => s.id)); return (g.__ittAbsences ?? []).filter((x) => x.day === day && mine.has(x.studentId)).map((x) => x.studentId); },
    async getStudentTimes(classId) { return Object.fromEntries((m.students as ((typeof m.students)[number] & { time_setting?: TimeSettingValue })[]).filter((s) => s.session_id === classId && s.time_setting).map((s) => [s.id, s.time_setting!])); },
    async setPersonalSettings(classId, s) { const c = m.classes.find((x) => x.id === classId); if (!c) return; if (s.rolesOn !== undefined) c.roles_enabled = s.rolesOn; if (s.anglesOn !== undefined) c.angles_enabled = s.anglesOn; },
    async findActiveClassByCode(code) { return m.classes.find((c) => c.class_code === code.toUpperCase() && c.status === "active") ?? null; },
    async getClassById(classId) { return m.classes.find((c) => c.id === classId) ?? null; },
    async listStudents(classId) { return m.students.filter((s) => s.session_id === classId).map(strip).sort((a, b) => a.nickname.localeCompare(b.nickname)); },
    async getStudent(studentId) { const s = m.students.find((x) => x.id === studentId); return s ? strip(s) : null; },
    async createStudent(classId, nickname, hash) { if (m.students.some((s) => s.session_id === classId && s.nickname === nickname)) return "taken"; const s = { id: id(), session_id: classId, nickname, created_at: now(), hash }; m.students.push(s); return strip(s); },
    async findStudentByResume(classId, nickname, hash) { const s = m.students.find((x) => x.session_id === classId && x.nickname === nickname && x.hash === hash); return s ? strip(s) : null; },
    async getProgress(studentId) { return m.progress?.[studentId] ?? null; },
    async saveProgress(studentId, progress) { (m.progress ??= {})[studentId] = progress; },
    async listAssignments(classId) { return m.assignments.filter((a) => a.session_id === classId); },
    async upsertAssignment(classId, lessonId, dueDate) { const a = m.assignments.find((x) => x.session_id === classId && x.lesson_id === lessonId); if (a) a.due_date = dueDate; else m.assignments.push({ id: id(), session_id: classId, lesson_id: lessonId, due_date: dueDate, created_at: now() }); },
    async deleteAssignment(classId, lessonId) { m.assignments = m.assignments.filter((a) => !(a.session_id === classId && a.lesson_id === lessonId)); },
    async listCompletions(studentIds) { return m.completions.filter((c) => studentIds.includes(c.student_id)); },
    async upsertCompletion(row) { m.completions = m.completions.filter((c) => !(c.student_id === row.student_id && c.lesson_id === row.lesson_id)); m.completions.push(row); },
    async listExpeditionResults(studentIds) { return (m.expeditionResults ?? []).filter((r) => studentIds.includes(r.student_id)); },
    async upsertExpeditionResult(row) { const list = (m.expeditionResults ??= []); const k = list.findIndex((r) => r.student_id === row.student_id && r.expedition_id === row.expedition_id && r.attempt_id === row.attempt_id); const next = { ...row, updated_at: now() }; if (k >= 0) list[k] = next; else list.push(next); },
    async listExpeditionAssignments(classId) { return (m.expeditionAssignments ?? []).filter((a) => a.session_id === classId); },
    async upsertExpeditionAssignment(classId, expeditionId, dueDate) { const list = (m.expeditionAssignments ??= []); const a = list.find((x) => x.session_id === classId && x.expedition_id === expeditionId); if (a) a.due_date = dueDate; else list.push({ id: id(), session_id: classId, expedition_id: expeditionId, due_date: dueDate, created_at: now() }); },
    async deleteExpeditionAssignment(classId, expeditionId) { m.expeditionAssignments = (m.expeditionAssignments ?? []).filter((a) => !(a.session_id === classId && a.expedition_id === expeditionId)); },
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

// The school day an absence belongs to: the date in America/New_York (YYYY-MM-DD).
export const absentDay = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
