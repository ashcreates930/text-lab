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
  const completions = await ctx.store.listCompletions(students.map((s) => s.id));
  return NextResponse.json({
    class: cls, students, assignments, completions, activeAnalysisId: analysis?.id ?? null,
    world: world ? { id: world.id, title: world.title, teacherPreviewRequired: world.teacher_preview_required === true, scenes: world.scenes.map((s) => ({ id: s.id, clues: s.artifacts.length })), roles: world.roles.map((r) => ({ id: r.id, name: r.name })) } : null,
  });
}

// previewEnabled: the story's content-note preview; rolesOn / anglesOn: students in the story (roles and "What's your angle?").
const Patch = z.object({ previewEnabled: z.boolean().optional(), rolesOn: z.boolean().optional(), anglesOn: z.boolean().optional() }).refine((x) => Object.values(x).some((v) => v !== undefined));
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
  return NextResponse.json({ ok: true });
}
