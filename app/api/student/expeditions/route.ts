// A class student's Proof Race expeditions: GET returns their attempts and the class's assigned expeditions (for the
// map); POST saves an attempt (when the race ends, and again when Case Notes close). Rules: lib/expedition-progress.ts.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";
import { toAttempt } from "@/lib/expedition-progress";

const text = (n: number) => z.string().max(n);
const Note = z.object({
  chunk: z.number().int().min(1).max(200), type: text(60), question: text(600), answer: text(1200), proof: text(4000), rightFirstTry: z.boolean(), fixed: z.boolean().nullable(),
  gistPick: text(600).nullable(), gistRight: z.boolean(), typedQuestion: text(300).nullable(), unknownWords: z.array(text(40)).max(40), correctProof: text(4000), standards: z.array(text(20)).max(6), note: text(2000),
  version: z.enum(["easier", "standard", "harder"]).optional(),
});
const Said = z.object({ character: text(80), name: text(80), short: text(40), text: text(600), lied: z.boolean(), gesture: z.enum(["laughing", "head-shake"]).nullable(), card: text(300).nullable() });
const Interview = z.object({ said: z.array(Said).max(6), liar: text(80), lieText: text(600), lieLines: z.array(text(4000)).max(4), pick: text(80).nullable(), line: text(4000).nullable(), named: z.boolean(), solved: z.boolean(), fixed: z.boolean().nullable(), points: z.number().int().min(0).max(10000) });
const Attempt = z.object({
  attemptId: z.string().regex(/^[A-Za-z0-9-]{8,80}$/), worldId: text(80), expeditionId: text(80), startedAt: z.string().datetime(), finishedAt: z.string().datetime().nullable(), complete: z.boolean(),
  score: z.number().int().min(0).max(100000), notes: z.array(Note).max(60), interview: Interview.nullable(),
  award: z.object({ stars: z.number().int().min(0).max(20), of: z.number().int().min(0).max(20), badge: text(60).nullable() }).nullable(),
  // An unfinished room's resume point (lib/escape-room.ts parseResume checks it again on load); null once finished.
  // Puzzle locks: each one's first-try result (lib/escape-room.ts).
  puzzles: z.array(z.object({ id: text(80), type: z.enum(["code", "painting", "scene"]), firstTry: z.array(z.boolean()).max(8), points: z.number().int().min(0).max(5000) })).max(12).optional(),
  resume: z.unknown().optional().nullable().refine((x) => x == null || JSON.stringify(x).length <= 200000, "Resume point too large"),
});


export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const [rows, assigned] = await Promise.all([ctx.store.listExpeditionResults([ctx.student.id]), ctx.store.listExpeditionAssignments(ctx.student.session_id)]);
  return NextResponse.json({ attempts: rows.map(toAttempt), assigned: assigned.map((a) => ({ expeditionId: a.expedition_id, due: a.due_date })) });
}

export async function POST(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const input = Attempt.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid expedition result." }, { status: 400 });
  const a = input.data, cls = await ctx.store.getClassById(ctx.student.session_id);
  // Only the class's own story, and only an expedition it has.
  const world = cls && cls.world_id === a.worldId ? await readWorld(a.worldId).catch(() => null) : null;
  if (!world?.expeditions?.some((e) => e.id === a.expeditionId)) return NextResponse.json({ error: "That expedition isn't in your class's story." }, { status: 400 });
  await ctx.store.upsertExpeditionResult({
    student_id: ctx.student.id, world_id: a.worldId, expedition_id: a.expeditionId, attempt_id: a.attemptId, complete: a.complete, score: a.score,
    first_try: a.notes.filter((n) => n.rightFirstTry).length, total: a.notes.length, solved_case: a.interview ? a.interview.solved : null,
    record: { score: a.score, notes: a.notes, interview: a.interview, award: a.award, puzzles: a.puzzles ?? [], resume: a.finishedAt ? null : a.resume ?? null }, started_at: a.startedAt, finished_at: a.finishedAt,
  });
  return NextResponse.json({ ok: true });
}
