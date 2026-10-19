import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";

type Params = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const [students, assignments, analysis, world] = await Promise.all([ctx.store.listStudents(cls.id), ctx.store.listAssignments(cls.id), ctx.store.getActiveAnalysis(cls.id), readWorld(cls.world_id)]);
  const [completions, studentTimes] = await Promise.all([ctx.store.listCompletions(students.map((s) => s.id)), ctx.store.getStudentTimes(cls.id).catch(() => ({}))]);
  return NextResponse.json({
    class: cls, students, studentTimes, assignments, completions, activeAnalysisId: analysis?.id ?? null,
    world: world ? { id: world.id, title: world.title, teacherPreviewRequired: world.teacher_preview_required === true, scenes: world.scenes.map((s) => ({ id: s.id, clues: s.artifacts.length })), roles: world.roles.map((r) => ({ id: r.id, name: r.name })) } : null,
  });
}

// previewEnabled: the story's content-note preview; rolesOn / anglesOn: students in the story (roles and "What's your angle?").
// leaderboard / storyModeOn: Story Mode's class leaderboard and whether scenes use it; studentTime: one student's extra time.
const Patch = z.object({ previewEnabled: z.boolean().optional(), rolesOn: z.boolean().optional(), anglesOn: z.boolean().optional(), leaderboard: z.enum(["individual", "squad", "off"]).optional(), storyModeOn: z.boolean().optional(), studentTime: z.object({ studentId: z.string().uuid(), setting: z.enum(["1", "1.5", "2", "untimed"]) }).optional() }).refine((x) => Object.values(x).some((v) => v !== undefined));
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const input = Patch.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid change." }, { status: 400 });
  if (input.data.previewEnabled !== undefined) await ctx.store.setPreviewEnabled(cls.id, input.data.previewEnabled);
  if (input.data.rolesOn !== undefined || input.data.anglesOn !== undefined) {
    try { await ctx.store.setPersonalSettings(cls.id, { rolesOn: input.data.rolesOn, anglesOn: input.data.anglesOn }); }
    catch { return NextResponse.json({ error: "Run the 202610190003 migration to turn roles and angles on or off." }, { status: 503 }); }
  }
  try {
    if (input.data.leaderboard !== undefined || input.data.storyModeOn !== undefined) await ctx.store.setStorySettings(cls.id, { leaderboard: input.data.leaderboard, storyModeOn: input.data.storyModeOn });
    if (input.data.studentTime) {
      const students = await ctx.store.listStudents(cls.id);
      if (!students.some((s) => s.id === input.data.studentTime!.studentId)) return NextResponse.json({ error: "Student not found." }, { status: 404 });
      await ctx.store.setStudentTime(input.data.studentTime.studentId, input.data.studentTime.setting);
    }
  } catch { return NextResponse.json({ error: "Run the 202610200001 migration to change Story Mode settings." }, { status: 503 }); }
  return NextResponse.json({ ok: true });
}
