// Judges a one-sentence written answer in a solo expedition (lib/written-judge.ts). The question is rebuilt on the
// server from the chunk, the bank pick and the version, so nothing about the answer is trusted from the browser. The AI
// judge runs for class students (a class token); anyone else gets the rule check, so demo play never spends AI calls.
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { readPassages, readWorld } from "@/lib/classroom/worlds";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { chunkTokens, expeditionChunks, sentenceProves } from "@/lib/expedition";
import { askedQuestion } from "@/lib/formats";
import { judgeWritten, ruleVerdict } from "@/lib/written-judge";

const Input = z.object({
  worldId: z.string().regex(/^[a-z0-9-]+$/), expeditionId: z.string().max(80), chunk: z.number().int().min(0).max(200),
  bank: z.number().int().min(0).max(2), version: z.enum(["easier", "standard", "harder"]), text: z.string().max(400), line: z.string().max(3000).nullable(),
});

export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  const a = input.data, world = await readWorld(a.worldId);
  const exp = world?.expeditions?.find((e) => e.id === a.expeditionId), chunk = exp?.chunks[a.chunk];
  if (!world || !exp || !chunk) return NextResponse.json({ error: "That question isn't in the story." }, { status: 400 });
  const q = askedQuestion(chunk, { bank: a.bank, version: a.version });
  if (!q.written) return NextResponse.json({ error: "That question isn't a written one." }, { status: 400 });
  const rc = expeditionChunks(world, await readPassages(world.id), exp.id)[a.chunk];
  const evidenceOk = !q.proof?.lines?.length || (!!rc && !!a.line && sentenceProves(q, chunkTokens(rc.lines), [a.line]));
  const student = request.headers.get("x-class-token") ? await studentFromRequest(request) : null;
  const verdict = student && !isFailure(student) ? await judgeWritten(world, q, a.text, a.line, evidenceOk) : ruleVerdict(q, a.text, evidenceOk);
  return NextResponse.json(verdict);
}
