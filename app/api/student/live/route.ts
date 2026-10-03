import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { expectedResponse, secondsLeft, talkStarters } from "@/lib/classroom/plan";

// What a student's device shows during a live class analysis. Other students' answers are never sent to students.
export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const analysis = await ctx.store.getActiveAnalysis(ctx.student.session_id);
  if (!analysis) return NextResponse.json({ active: false });
  const plan = analysis.plan, step = plan.steps[analysis.step];
  const state = { step: analysis.step, phase: analysis.phase, chatStartedAt: analysis.chat_started_at, status: analysis.status };
  const mine = (await ctx.store.listResponses(analysis.id)).filter((r) => r.student_id === ctx.student.id && r.step === analysis.step);
  return NextResponse.json({
    active: true, analysisId: analysis.id, worldTitle: plan.worldTitle, sceneTitle: plan.sceneTitle, roleName: plan.roleName,
    stepNumber: analysis.step + 1, stepCount: plan.steps.length, phase: analysis.phase, step,
    expecting: expectedResponse(plan, state), secondsLeft: secondsLeft(step, analysis.chat_started_at), starters: talkStarters,
    myAnswer: mine.find((r) => r.kind === "answer")?.response_text ?? null, myTakeaway: mine.find((r) => r.kind === "takeaway")?.response_text ?? null,
  });
}

const Answer = z.object({ analysisId: z.string(), stepNumber: z.number().int().min(1), kind: z.enum(["answer", "takeaway"]), text: z.string().trim().min(1).max(1200) });
export async function POST(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const input = Answer.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Type an answer first." }, { status: 400 });
  const analysis = await ctx.store.getActiveAnalysis(ctx.student.session_id);
  if (!analysis || analysis.id !== input.data.analysisId || analysis.step !== input.data.stepNumber - 1) return NextResponse.json({ error: "Your teacher has moved on. Look up for the next question." }, { status: 409 });
  const expecting = expectedResponse(analysis.plan, { step: analysis.step, phase: analysis.phase, chatStartedAt: analysis.chat_started_at, status: analysis.status });
  if (expecting !== input.data.kind) return NextResponse.json({ error: "Answers are closed for this question." }, { status: 409 });
  await ctx.store.upsertResponse({ analysis_id: analysis.id, student_id: ctx.student.id, step: analysis.step, kind: input.data.kind, response_text: input.data.text });
  return NextResponse.json({ ok: true });
}
