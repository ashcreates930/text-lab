import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";
import { getLieBankStore } from "@/lib/lie-bank-store";

// The class's planted lies for the teacher: waiting for review (flagged ones marked), the approved Lie bank, and
// rejected ones. Approve or reject one with POST { id, action }. A teacher only sees their own classes.
type Params = { params: Promise<{ id: string }> };
const Action = z.object({ id: z.string().uuid(), action: z.enum(["approve", "reject"]) });

async function load(request: Request, params: Params["params"]) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return { failure: NextResponse.json({ error: ctx.error }, { status: ctx.status }) };
  const cls = await ctx.store.getClass(ctx.teacherId, (await params).id);
  if (!cls) return { failure: NextResponse.json({ error: "Class not found." }, { status: 404 }) };
  const store = getLieBankStore();
  if (!store) return { failure: NextResponse.json({ lies: [] }) };
  return { ctx, cls, store };
}

export async function GET(request: Request, { params }: Params) {
  const r = await load(request, params);
  if ("failure" in r) return r.failure;
  const [lies, students, world] = await Promise.all([r.store.listForClass(r.cls.id).catch(() => []), r.ctx.store.listStudents(r.cls.id), readWorld(r.cls.world_id)]);
  const name = new Map(students.map((s) => [s.id, s.nickname]));
  return NextResponse.json({ lies: lies.map((l) => {
    const scene = world?.scenes.find((s) => s.id === l.sceneId);
    return { id: l.id, student: name.get(l.studentId) ?? "A student", character: world?.characters.find((c) => c.id === l.characterId)?.name ?? l.characterId, clue: scene?.artifacts.find((a) => a.id === l.clueId)?.name ?? l.clueId, sentence: l.sentence, truthLine: l.truthLine, status: l.status, createdAt: l.createdAt };
  }) });
}

export async function POST(request: Request, { params }: Params) {
  const r = await load(request, params);
  if ("failure" in r) return r.failure;
  const input = Action.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Pick a lie to approve or reject." }, { status: 400 });
  const lie = await r.store.get(input.data.id);
  if (!lie || lie.classId !== r.cls.id) return NextResponse.json({ error: "Lie not found." }, { status: 404 });
  await r.store.setStatus(lie.id, input.data.action === "approve" ? "approved" : "rejected");
  return NextResponse.json({ ok: true });
}
