import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";

export async function GET(request: Request) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const classes = await ctx.store.listClasses(ctx.teacherId);
  const withCounts = await Promise.all(classes.map(async (c) => ({ ...c, studentCount: (await ctx.store.listStudents(c.id)).length, worldTitle: (await readWorld(c.world_id))?.title ?? c.world_id })));
  return NextResponse.json({ email: ctx.email, classes: withCounts });
}

const Create = z.object({ name: z.string().trim().min(1).max(80), worldId: z.string().regex(/^[a-z0-9-]+$/), grade: z.number().int().min(6).max(12) });
export async function POST(request: Request) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const input = Create.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Give the class a name, a story, and a grade." }, { status: 400 });
  const world = await readWorld(input.data.worldId);
  if (!world || world.status === "coming_soon") return NextResponse.json({ error: "That story is not available yet." }, { status: 400 });
  const created = await ctx.store.createClass(ctx.teacherId, input.data);
  return NextResponse.json({ class: created }, { status: 201 });
}
