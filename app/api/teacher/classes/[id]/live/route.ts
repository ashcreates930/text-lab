import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";
import { advanceState, buildPlan, firstPhase, type LiveState } from "@/lib/classroom/plan";
import { screenMessage } from "@/lib/safety";

type Params = { params: Promise<{ id: string }> };
async function load(request: Request, params: Params["params"]) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return { fail: NextResponse.json({ error: ctx.error }, { status: ctx.status }) };
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return { fail: NextResponse.json({ error: "Class not found." }, { status: 404 }) };
  return { ctx, cls };
}

// Current live analysis with every response for the current step. Nicknames are included for the teacher's own view;
// the projected view hides them. Responses that trip the safety screen are marked for private review.
export async function GET(request: Request, { params }: Params) {
  const r = await load(request, params); if (r.fail) return r.fail;
  const analysis = await r.ctx.store.getActiveAnalysis(r.cls.id);
  if (!analysis) return NextResponse.json({ analysis: null });
  const [students, responses] = await Promise.all([r.ctx.store.listStudents(r.cls.id), r.ctx.store.listResponses(analysis.id)]);
  const names = new Map(students.map((s) => [s.id, s.nickname]));
  const current = responses.filter((x) => x.step === analysis.step).map((x) => ({ id: x.id, kind: x.kind, text: x.response_text, nickname: names.get(x.student_id) ?? "Student", flagged: screenMessage(x.response_text).action === "support" }));
  return NextResponse.json({ analysis: { id: analysis.id, plan: analysis.plan, step: analysis.step, phase: analysis.phase, chatStartedAt: analysis.chat_started_at, status: analysis.status }, studentCount: students.length, responses: current, serverNow: new Date().toISOString() });
}

const Start = z.object({ sceneId: z.string(), roleId: z.string(), stages: z.array(z.enum(["notice", "interpret", "craft"])).min(1), chatAfterEachClue: z.boolean(), chatSeconds: z.number().int().min(30).max(300) });
export async function POST(request: Request, { params }: Params) {
  const r = await load(request, params); if (r.fail) return r.fail;
  const input = Start.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose a scene and at least one question type." }, { status: 400 });
  const world = await readWorld(r.cls.world_id);
  if (!world) return NextResponse.json({ error: "This class story is unavailable." }, { status: 404 });
  const plan = buildPlan(world, { ...input.data, grade: r.cls.grade });
  if (!plan.steps.length) return NextResponse.json({ error: "That scene has no clues to analyze." }, { status: 400 });
  const first: LiveState = { step: 0, phase: firstPhase(plan.steps[0]), chatStartedAt: null, status: "active" };
  const analysis = await r.ctx.store.createAnalysis(r.cls.id, plan, first);
  return NextResponse.json({ id: analysis.id }, { status: 201 });
}

const Move = z.object({ action: z.enum(["reveal", "next", "back", "start_timer", "takeaway", "end"]) });
export async function PATCH(request: Request, { params }: Params) {
  const r = await load(request, params); if (r.fail) return r.fail;
  const input = Move.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid step." }, { status: 400 });
  const analysis = await r.ctx.store.getActiveAnalysis(r.cls.id);
  if (!analysis) return NextResponse.json({ error: "No live analysis is running." }, { status: 404 });
  const next = advanceState(analysis.plan, { step: analysis.step, phase: analysis.phase, chatStartedAt: analysis.chat_started_at, status: analysis.status }, input.data.action);
  await r.ctx.store.updateAnalysis(analysis.id, next);
  return NextResponse.json({ ok: true, state: next });
}
