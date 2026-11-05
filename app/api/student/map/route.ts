// A class student's world map: GET returns the secrets they have found on return visits; POST records one more (only a
// real secret in the class's own story, in a region the student has proven). Rules: lib/world-map.ts.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isFailure, studentFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";
import { toAttempt } from "@/lib/expedition-progress";
import { secretOf } from "@/lib/world-map";

export async function GET(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const world = new URL(request.url).searchParams.get("world") ?? "";
  const row = world ? await ctx.store.getMapProgress(ctx.student.id, world) : null;
  return NextResponse.json({ secrets: row?.secrets ?? [] });
}

const Found = z.object({ worldId: z.string().max(80), expeditionId: z.string().max(80), chunk: z.number().int().min(1).max(200) });
export async function POST(request: Request) {
  const ctx = await studentFromRequest(request);
  if (isFailure(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const input = Found.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid map progress." }, { status: 400 });
  const { worldId, expeditionId, chunk } = input.data, cls = await ctx.store.getClassById(ctx.student.session_id);
  const world = cls && cls.world_id === worldId ? await readWorld(worldId).catch(() => null) : null;
  if (!world || !secretOf(world, expeditionId, chunk)) return NextResponse.json({ error: "There's no discovery there." }, { status: 400 });
  const proven = (await ctx.store.listExpeditionResults([ctx.student.id])).map(toAttempt).some((a) => a.worldId === worldId && a.expeditionId === expeditionId && a.finishedAt);
  if (!proven) return NextResponse.json({ error: "Finish that expedition first." }, { status: 400 });
  const row = await ctx.store.getMapProgress(ctx.student.id, worldId), key = `${expeditionId}:${chunk}`;
  const secrets = [...new Set([...(row?.secrets ?? []), key])];
  await ctx.store.upsertMapProgress({ student_id: ctx.student.id, world_id: worldId, secrets });
  return NextResponse.json({ secrets });
}
