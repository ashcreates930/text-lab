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
  // Your Turn entries can also be saved on the server (after a live session), so keep any this device hasn't seen.
  const before = await ctx.store.getProgress(ctx.student.id).catch(() => null);
  const keyOf = (e: { activity: string; at: string }) => `${e.activity}|${e.at}`;
  const seen = new Set((parsed.data.yourTurn ?? []).map(keyOf));
  const extra = (before?.yourTurn ?? []).filter((e) => !seen.has(keyOf(e)));
  const merged = extra.length ? { ...parsed.data, yourTurn: [...extra, ...(parsed.data.yourTurn ?? [])].sort((a, b) => a.at.localeCompare(b.at)).slice(-30) } : parsed.data;
  await ctx.store.saveProgress(ctx.student.id, merged);
  return NextResponse.json({ ok: true });
}
