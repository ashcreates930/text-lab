// Who is calling a classroom route. Teachers prove identity with their Supabase magic-link session; students carry a
// signed class token issued when they join with a class code (no student email, password, or device ID).
import { createHmac, timingSafeEqual } from "node:crypto";
import { getServiceSupabase } from "../supabase.ts";
import { getClassroomStore, memoryModeEnabled, type ClassroomStore, type StudentRow } from "./store.ts";

function secret() {
  const value = process.env.CLASS_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || (memoryModeEnabled() ? "local-dev-only-secret" : "");
  if (!value) throw new Error("No class token secret configured.");
  return value;
}
const sign = (studentId: string) => createHmac("sha256", `itt-class-token:${secret()}`).update(studentId).digest("base64url");

export function createStudentToken(studentId: string) {
  return `${studentId}.${sign(studentId)}`;
}
export function verifyStudentToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const [studentId, signature] = token.split(".");
  if (!studentId || !signature) return null;
  try {
    const expected = Buffer.from(sign(studentId)), given = Buffer.from(signature);
    return expected.length === given.length && timingSafeEqual(expected, given) ? studentId : null;
  } catch { return null; }
}

export type TeacherContext = { store: ClassroomStore; teacherId: string; email: string };
export type AuthFailure = { error: string; status: number };

// Optional allowlist: TEACHER_EMAILS="a@school.org,b@school.org" or TEACHER_EMAIL_DOMAINS="school.org". Unset means any signed-in email.
function teacherAllowed(email: string) {
  const emails = (process.env.TEACHER_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const domains = (process.env.TEACHER_EMAIL_DOMAINS || "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (!emails.length && !domains.length) return true;
  const lower = email.toLowerCase();
  return emails.includes(lower) || domains.some((d) => lower.endsWith(`@${d}`));
}

export async function teacherFromRequest(request: Request): Promise<TeacherContext | AuthFailure> {
  const store = getClassroomStore();
  if (!store) return { error: "Classes are not set up on this server yet.", status: 503 };
  if (memoryModeEnabled()) {
    const devEmail = request.headers.get("x-dev-teacher");
    if (devEmail) { const t = await store.ensureTeacher(`dev:${devEmail}`, devEmail); return { store, teacherId: t.id, email: devEmail }; }
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const db = getServiceSupabase();
  if (!token || !db) return { error: "Please sign in as a teacher.", status: 401 };
  const { data, error } = await db.auth.getUser(token);
  const user = data?.user;
  if (error || !user?.email) return { error: "Your sign-in has expired. Please sign in again.", status: 401 };
  if (!teacherAllowed(user.email)) return { error: "This email is not set up for a teacher account yet.", status: 403 };
  const teacher = await store.ensureTeacher(user.id, user.email);
  return { store, teacherId: teacher.id, email: user.email };
}

export type StudentContext = { store: ClassroomStore; student: StudentRow };
export async function studentFromRequest(request: Request): Promise<StudentContext | AuthFailure> {
  const store = getClassroomStore();
  if (!store) return { error: "Classes are not set up on this server yet.", status: 503 };
  const studentId = verifyStudentToken(request.headers.get("x-class-token"));
  if (!studentId) return { error: "Please join your class again with your class code.", status: 401 };
  const student = await store.getStudent(studentId);
  if (!student) return { error: "Please join your class again with your class code.", status: 401 };
  return { store, student };
}

export function isFailure(x: unknown): x is AuthFailure {
  return typeof x === "object" && x !== null && "error" in x && "status" in x;
}
