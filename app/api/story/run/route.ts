import { NextResponse, type NextRequest } from "next/server";
import { getStoryStore } from "@/lib/story-store";
import { publicRun, resumeRound, startRun } from "@/lib/story-server";
import { ROUNDS, type RoundKind } from "@/lib/story-mode";
import { isIdentityError, loadStory, storyIdentity } from "@/lib/story-api";
import { DEMO_ACCESS_COOKIE, DEMO_ACCESS_MAX_AGE, createDemoAccessToken, demoAccessConfigured, verifyDemoAccessToken } from "@/lib/demo-access";

// Starts (or resumes) a Story Mode run for one scene. restart: start the scene over (the best score is kept). startAt:
// open at a later round ("Catch the lie" on the home page, demo only).
// If Story Mode's tables aren't there (the migration hasn't run), the answer is { unavailable: true } and the scene opens
// in the Case file view instead, for everyone. The reason is logged here on the server only.
function unavailable(reason: unknown) {
  console.error("Story Mode unavailable, opening the Case file view instead:", reason instanceof Error ? reason.message : reason);
  return NextResponse.json({ unavailable: true }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const who = await storyIdentity(request, body.sandboxId);
  if (isIdentityError(who)) return NextResponse.json({ error: who.error }, { status: who.status });
  const store = getStoryStore();
  if (!store) return unavailable("no Story Mode store (Supabase is not configured)");
  const story = await loadStory(body.worldId, body.sceneId);
  if (!story) return NextResponse.json({ error: "This scene has no Story Mode." }, { status: 404 });
  if (who.scope === "class" && story.world.id !== who.worldId) return NextResponse.json({ error: "That isn't your class's story." }, { status: 400 });
  const startAt = ROUNDS.includes(body.startAt) ? (body.startAt as RoundKind) : undefined;
  let run;
  try { run = await startRun(store, story.world, story.scene, who, body.restart === true, startAt); }
  catch (e) { return unavailable(e); }
  if (typeof run === "string") return NextResponse.json({ error: run }, { status: 429 });
  // resume: the round in progress (its try number and step), so a reload picks up where the student was.
  const response = NextResponse.json({ run: publicRun(run), resume: resumeRound(story.scene, run), leaderboard: who.scope === "class" ? who.leaderboard : "individual" });
  // A demo visitor without the device cookie gets one here, as /api/access does, so the usage caps keep counting them.
  if (who.scope === "demo" && demoAccessConfigured() && !(await verifyDemoAccessToken(request.cookies.get(DEMO_ACCESS_COOKIE)?.value)))
    response.cookies.set(DEMO_ACCESS_COOKIE, await createDemoAccessToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: DEMO_ACCESS_MAX_AGE });
  return response;
}
