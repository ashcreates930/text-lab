import { NextResponse, type NextRequest } from "next/server";
import { getStoryStore } from "@/lib/story-store";
import { publicRun, startRun } from "@/lib/story-server";
import { isIdentityError, loadStory, storyIdentity } from "@/lib/story-api";

// Starts (or resumes) a Story Mode run for one scene. restart: start the scene over (the best score is kept).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const who = await storyIdentity(request, body.sandboxId);
  if (isIdentityError(who)) return NextResponse.json({ error: who.error }, { status: who.status });
  const store = getStoryStore();
  if (!store) return NextResponse.json({ error: "Story Mode isn't set up yet." }, { status: 503 });
  const story = await loadStory(body.worldId, body.sceneId);
  if (!story) return NextResponse.json({ error: "This scene has no Story Mode." }, { status: 404 });
  if (who.scope === "class" && story.world.id !== who.worldId) return NextResponse.json({ error: "That isn't your class's story." }, { status: 400 });
  const run = await startRun(store, story.world, story.scene, who, body.restart === true).catch((e: Error) => e.message);
  if (typeof run === "string") return NextResponse.json({ error: run }, { status: 429 });
  return NextResponse.json({ run: publicRun(run), leaderboard: who.scope === "class" ? who.leaderboard : "individual" });
}
