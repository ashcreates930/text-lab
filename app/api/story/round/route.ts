import { NextResponse, type NextRequest } from "next/server";
import { getStoryStore } from "@/lib/story-store";
import { boardFor, boardTopic, broadcastBoard, playRound, publicRun, pulseFor } from "@/lib/story-server";
import { classSquads, isIdentityError, loadStory, ownsRun, storyIdentity } from "@/lib/story-api";

// Scores one Story Mode round on the server and answers with the result, the leaderboard and the class pulse.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const who = await storyIdentity(request, body.sandboxId);
  if (isIdentityError(who)) return NextResponse.json({ error: who.error }, { status: who.status });
  const store = getStoryStore();
  if (!store) return NextResponse.json({ error: "Story Mode isn't set up yet." }, { status: 503 });
  const run = typeof body.runId === "string" ? await store.getRun(body.runId) : null;
  if (!run || !ownsRun(who, run)) return NextResponse.json({ error: "Start the scene again." }, { status: 404 });
  const story = await loadStory(run.worldId, run.sceneId);
  if (!story) return NextResponse.json({ error: "This scene has no Story Mode." }, { status: 404 });
  if (!body.input || typeof body.input !== "object") return NextResponse.json({ error: "Something's missing. Try again." }, { status: 400 });
  const result = await playRound(store, story.world, story.passages, story.scene, run, { round: Number(body.round), input: body.input, elapsedMs: Number(body.elapsedMs), grace: body.grace === true, relaxed: body.relaxed === true });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });
  const mode = who.scope === "class" ? who.leaderboard : "individual";
  const squads = who.scope === "class" && mode === "squad" ? await classSquads(who.classId) : undefined;
  const [board, pulse] = await Promise.all([boardFor(store, result.run, mode, typeof body.previousRank === "number" ? body.previousRank : null, squads), pulseFor(store, result.run, story.scene, result.record.round)]);
  await broadcastBoard(boardTopic(result.run));
  return NextResponse.json({ record: result.record, reaction: result.reaction, run: publicRun(result.run), board, pulse });
}
