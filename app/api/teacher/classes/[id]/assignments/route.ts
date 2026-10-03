import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { lessonById } from "@/lib/mini-lessons";

type Params = { params: Promise<{ id: string }> };
const Assign = z.object({ lessonId: z.string().max(80), dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional() });
export async function POST(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const input = Assign.safeParse(await request.json().catch(() => null));
  if (!input.success || !lessonById(input.data.lessonId)) return NextResponse.json({ error: "Choose a lesson to assign." }, { status: 400 });
  await ctx.store.upsertAssignment(cls.id, input.data.lessonId, input.data.dueDate ?? null);
  return NextResponse.json({ ok: true }, { status: 201 });
}
export async function DELETE(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const lessonId = new URL(request.url).searchParams.get("lessonId") ?? "";
  await ctx.store.deleteAssignment(cls.id, lessonId);
  return NextResponse.json({ ok: true });
}
