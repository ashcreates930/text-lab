import { NextResponse, type NextRequest } from "next/server";
import { getStoryStore } from "@/lib/story-store";
import { boardFor, boardTopic, broadcastBoard, playRound, publicRun, pulseFor } from "@/lib/story-server";
import { absentToday, classSquads, isIdentityError, loadStory, ownsRun, storyIdentity } from "@/lib/story-api";

// One try at a Story Mode round, scored on the server. A miss answers "Not yet" with the next try's hint; a step answers
// what comes next (exact words, Prove it, the lie's explanation); the last step answers with the scored round, the
// leaderboard and the class pulse.
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
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: "invalid" in result ? 400 : 409 });
  if (!("record" in result) || !result.record) return NextResponse.json({ run: publicRun(result.run), notYet: "notYet" in result ? result.notYet : null, step: "step" in result ? result.step : null, reaction: result.reaction });
  const mode = who.scope === "class" ? who.leaderboard : "individual";
  const squads = who.scope === "class" && mode === "squad" ? await classSquads(who.classId) : undefined;
  const absent = who.scope === "class" && squads ? await absentToday(who.classId) : [];
  const [board, pulse] = await Promise.all([boardFor(store, result.run, mode, typeof body.previousRank === "number" ? body.previousRank : null, squads, absent), pulseFor(store, result.run, story.scene, result.record.round)]);
  await broadcastBoard(boardTopic(result.run));
  return NextResponse.json({ record: result.record, shown: result.shown, reaction: result.reaction, run: publicRun(result.run), board, pulse: Array.isArray(pulse) ? pulse : pulse.pulse, answered: Array.isArray(pulse) ? 0 : pulse.answered });
}
