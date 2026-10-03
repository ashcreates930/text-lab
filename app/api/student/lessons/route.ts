import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { lessonById } from "@/lib/mini-lessons";

const Done = z.object({ lessonId: z.string().max(80), firstTryCorrect: z.number().int().min(0).max(20), total: z.number().int().min(0).max(20) });
export async function POST(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const input = Done.safeParse(await request.json().catch(() => null));
  if (!input.success || !lessonById(input.data.lessonId)) return NextResponse.json({ error: "Invalid lesson." }, { status: 400 });
  await ctx.store.upsertCompletion({ student_id: ctx.student.id, lesson_id: input.data.lessonId, first_try_correct: input.data.firstTryCorrect, total: input.data.total, finished_at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
