import { NextResponse } from "next/server";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { loadClassEvidence } from "@/lib/classroom/evidence-server";

// The Teacher Evidence View for one class. A teacher can only read their own classes: any other class id is "not found".
type Params = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Params) {
  const ctx = await teacherFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const evidence = await loadClassEvidence(ctx.store, ctx.teacherId, (await params).id);
  if (!evidence) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  return NextResponse.json(evidence);
}
