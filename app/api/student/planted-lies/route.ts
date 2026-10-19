import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { readPassages, readWorld } from "@/lib/classroom/worlds";
import { getLieBankStore } from "@/lib/lie-bank-store";
import { plantedLieProblems } from "@/lib/planted-lies";
import { matchEvidence } from "@/lib/evidence-check";
import { screenArgument } from "@/lib/verdict-server";

// Plant a Lie: a class student's planted lies (GET) and a new one (POST). Each is checked like a world-file lie,
// screened, and held for the teacher. A flagged sentence is kept for the teacher only and never reaches the class.
const Input = z.object({ sceneId: z.string().max(80), clueId: z.string().max(80), characterId: z.string().max(80), sentence: z.string().max(400), truthParagraph: z.string().max(10), truthLine: z.string().max(1500) });

export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const store = getLieBankStore();
  if (!store) return NextResponse.json({ lies: [] });
  const lies = await store.listForStudent(ctx.student.id).catch(() => []);
  return NextResponse.json({ lies: lies.map((l) => ({ id: l.id, clueId: l.clueId, sentence: l.sentence, status: l.status === "flagged" ? "pending" : l.status })) });
}

export async function POST(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const store = getLieBankStore();
  if (!store) return NextResponse.json({ error: "The Lie bank isn't set up yet. Ask your teacher." }, { status: 503 });
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Something's missing. Try again." }, { status: 400 });
  const cls = await ctx.store.getClassById(ctx.student.session_id);
  if (!cls) return NextResponse.json({ error: "Please join your class again with your class code." }, { status: 401 });
  const world = await readWorld(cls.world_id);
  if (!world) return NextResponse.json({ error: "This story can't take planted lies." }, { status: 400 });
  const data = { ...input.data, sentence: input.data.sentence.trim().replace(/\s+/g, " ") };
  const passages = await readPassages(cls.world_id);
  const problems = plantedLieProblems(world, passages, data);
  if (problems.length) return NextResponse.json({ error: problems[0], problems }, { status: 422 });
  // Store the world file's own text for the line, not what the client sent.
  data.truthLine = matchEvidence(world, passages, data.truthLine, { clueId: data.clueId, pid: data.truthParagraph })!.text;
  // A student can have at most 10 lies waiting for the teacher at once.
  const mine = await store.listForStudent(ctx.student.id);
  if (mine.filter((l) => l.status === "pending" || l.status === "flagged").length >= 10) return NextResponse.json({ error: "You have 10 lies waiting for your teacher. Plant more once they've reviewed some." }, { status: 429 });
  const screen = await screenArgument(data.sentence);
  const lie = await store.add({ classId: cls.id, studentId: ctx.student.id, worldId: cls.world_id, ...data, status: screen === "ok" ? "pending" : "flagged" });
  // A flagged lie looks the same to the student: it waits for the teacher.
  return NextResponse.json({ lie: { id: lie.id, clueId: lie.clueId, sentence: lie.sentence, status: "pending" } }, { status: 201 });
}
