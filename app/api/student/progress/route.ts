import { NextResponse } from "next/server";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { MAX_PROGRESS_BYTES, StudentProgressSchema } from "@/lib/classroom/progress";

// A class student's own reading progress, identified by their signed class token (x-class-token).
export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  return NextResponse.json({ progress: await ctx.store.getProgress(ctx.student.id) });
}

export async function PUT(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const raw = await request.text();
  if (raw.length > MAX_PROGRESS_BYTES) return NextResponse.json({ error: "Progress is too large to save." }, { status: 413 });
  let body: unknown; try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Progress could not be read." }, { status: 400 }); }
  const parsed = StudentProgressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Progress could not be saved." }, { status: 400 });
  // Progress only ever belongs to the class's own story.
  const cls = await ctx.store.getClassById(ctx.student.session_id);
  if (!cls || cls.world_id !== parsed.data.worldId) return NextResponse.json({ error: "That story is not your class's story." }, { status: 400 });
  await ctx.store.saveProgress(ctx.student.id, parsed.data);
  return NextResponse.json({ ok: true });
}
