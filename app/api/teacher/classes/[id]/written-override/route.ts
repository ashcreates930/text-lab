// A teacher overrides the score on a student's written answer (Strong, Solid or Needs more evidence). The override is
// saved on that Case Note (teacherVerdict) and replaces the judge's verdict for first-try counts and mastery levels
// (lib/case-notes.ts provedFirstTry). Sending null clears it.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { provedFirstTry, type CaseNote } from "@/lib/case-notes";

type Params = { params: Promise<{ id: string }> };
const Input = z.object({ studentId: z.string().max(80), attemptId: z.string().max(80), chunk: z.number().int().min(1).max(40), verdict: z.enum(["Strong", "Solid", "Needs more evidence"]).nullable() });
export async function POST(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose a written answer and a verdict." }, { status: 400 });
  const { studentId, attemptId, chunk, verdict } = input.data;
  if (!(await ctx.store.listStudents(cls.id)).some((s) => s.id === studentId)) return NextResponse.json({ error: "That student is not in this class." }, { status: 404 });
  const row = (await ctx.store.listExpeditionResults([studentId])).find((r) => r.attempt_id === attemptId && r.world_id === cls.world_id);
  if (!row) return NextResponse.json({ error: "That attempt was not found." }, { status: 404 });
  const record = row.record as { notes?: CaseNote[] };
  const note = record.notes?.find((n) => n.chunk === chunk);
  if (!note || note.format !== "written") return NextResponse.json({ error: "Only a written answer can be overridden." }, { status: 400 });
  note.teacherVerdict = verdict;
  const notes = record.notes ?? [];
  await ctx.store.upsertExpeditionResult({ ...row, record: { ...record, notes } as typeof row.record, first_try: notes.filter(provedFirstTry).length });
  return NextResponse.json({ ok: true, proved: provedFirstTry(note) });
}
