import { NextResponse, type NextRequest } from "next/server";
import { getStoryStore } from "@/lib/story-store";
import { buyPowerUp, publicRun } from "@/lib/story-server";
import { POWER_UPS, type PowerUp } from "@/lib/story-mode";
import { isIdentityError, ownsRun, storyIdentity } from "@/lib/story-api";

// Spends Lantern coins on a power-up for the next round.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const who = await storyIdentity(request, body.sandboxId);
  if (isIdentityError(who)) return NextResponse.json({ error: who.error }, { status: who.status });
  const store = getStoryStore();
  if (!store) return NextResponse.json({ error: "Story Mode isn't set up yet." }, { status: 503 });
  const run = typeof body.runId === "string" ? await store.getRun(body.runId) : null;
  if (!run || !ownsRun(who, run)) return NextResponse.json({ error: "Start the scene again." }, { status: 404 });
  if (!(body.powerUp in POWER_UPS)) return NextResponse.json({ error: "Pick a power-up." }, { status: 400 });
  const next = await buyPowerUp(store, run, body.powerUp as PowerUp);
  if (typeof next === "string") return NextResponse.json({ error: next }, { status: 409 });
  return NextResponse.json({ run: publicRun(next) });
}
