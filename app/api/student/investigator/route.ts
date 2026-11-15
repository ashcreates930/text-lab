import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { toAttempt } from "@/lib/expedition-progress";
import { AVATARS, gearFrom, parseAvatar } from "@/lib/investigator";

// A class student's investigator (escape-room phase 8): the avatar they picked and the gear they have earned. Gear is
// worked out on the server from their saved results (proof only) and kept in step in investigator_profiles; the
// student can only choose an avatar. saveable: false until the 202611150002 migration has run.
export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const gear = gearFrom((await ctx.store.listExpeditionResults([ctx.student.id])).map(toAttempt));
  const earned = gear.filter((g) => g.earned).map((g) => g.id);
  let profile: { avatar: unknown; gear: unknown } | null = null, saveable = true;
  try { profile = await ctx.store.getInvestigator(ctx.student.id); } catch { saveable = false; }
  if (saveable && JSON.stringify(profile?.gear ?? []) !== JSON.stringify(earned)) { try { await ctx.store.setInvestigator(ctx.student.id, { gear: earned }); } catch { /* the next visit tries again */ } }
  return NextResponse.json({ avatar: parseAvatar(profile?.avatar), gear, saveable });
}
const Body = z.object({ avatar: z.enum(AVATARS.map((a) => a.id) as [string, ...string[]]) });
export async function POST(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const input = Body.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Pick one of the investigators." }, { status: 400 });
  try { await ctx.store.setInvestigator(ctx.student.id, { avatar: { id: input.data.avatar } }); }
  catch { return NextResponse.json({ error: "Run the 202611150002 migration to save investigators." }, { status: 503 }); }
  return NextResponse.json({ avatar: { id: input.data.avatar } });
}
