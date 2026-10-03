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

const Patch = z.object({ previewEnabled: z.boolean() });
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const input = Patch.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid change." }, { status: 400 });
  await ctx.store.setPreviewEnabled(cls.id, input.data.previewEnabled);
  return NextResponse.json({ ok: true });
}
