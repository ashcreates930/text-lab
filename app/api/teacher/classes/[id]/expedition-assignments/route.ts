// A teacher assigns one of the class story's Proof Race expeditions (with an optional due date), or removes it.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";

type Params = { params: Promise<{ id: string }> };
const Assign = z.object({ expeditionId: z.string().max(80), dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional() });
export async function POST(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const input = Assign.safeParse(await request.json().catch(() => null));
  const world = await readWorld(cls.world_id).catch(() => null);
  if (!input.success || !world?.expeditions?.some((e) => e.id === input.data.expeditionId)) return NextResponse.json({ error: "Choose an expedition to assign." }, { status: 400 });
  await ctx.store.upsertExpeditionAssignment(cls.id, input.data.expeditionId, input.data.dueDate ?? null);
  return NextResponse.json({ ok: true }, { status: 201 });
}
export async function DELETE(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  await ctx.store.deleteExpeditionAssignment(cls.id, new URL(request.url).searchParams.get("expeditionId") ?? "");
  return NextResponse.json({ ok: true });
}
