import { NextResponse } from "next/server";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";
import { personalSettings, storySettings } from "@/lib/classroom/store";

// A student's class home: assigned lessons with their own completion, and whether a live analysis is running.
export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClassById(ctx.student.session_id);
  if (!cls) return NextResponse.json({ error: "Your class is no longer available." }, { status: 404 });
  const [assignments, completions, analysis, world, roster] = await Promise.all([ctx.store.listAssignments(cls.id), ctx.store.listCompletions([ctx.student.id]), ctx.store.getActiveAnalysis(cls.id), readWorld(cls.world_id), ctx.store.listStudents(cls.id).catch(() => [])]);
  // seat: the student's place in the class roster, so neighbors get different clue questions (lib/fair-play.ts).
  const seat = roster.findIndex((s) => s.id === ctx.student.id);
  return NextResponse.json({ ...personalSettings(cls), storyModeOn: storySettings(cls).storyModeOn, seat: seat >= 0 ? seat : null, nickname: ctx.student.nickname, className: cls.name, worldTitle: world?.title ?? "", grade: cls.grade, assignments: assignments.map((a) => ({ lessonId: a.lesson_id, dueDate: a.due_date, done: completions.find((c) => c.lesson_id === a.lesson_id) ?? null })), liveActive: !!analysis });
}
