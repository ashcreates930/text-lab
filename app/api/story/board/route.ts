import { NextResponse, type NextRequest } from "next/server";
import { getStoryStore } from "@/lib/story-store";
import { boardFor } from "@/lib/story-server";
import { absentToday, classSquads, isIdentityError, ownsRun, storyIdentity } from "@/lib/story-api";

// The leaderboard as this player sees it: the top 5 and their own rank (refetched when the board's Realtime ping arrives).
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const who = await storyIdentity(request, q.get("sandboxId"));
  if (isIdentityError(who)) return NextResponse.json({ error: who.error }, { status: who.status });
  const store = getStoryStore();
  if (!store) return NextResponse.json({ board: null });
  const run = await store.getRun(q.get("runId") ?? "");
  if (!run || !ownsRun(who, run)) return NextResponse.json({ error: "Start the scene again." }, { status: 404 });
  const mode = who.scope === "class" ? who.leaderboard : "individual";
  const prev = Number(q.get("previousRank")) || null;
  const squad = who.scope === "class" && mode === "squad";
  const board = await boardFor(store, run, mode, prev, squad ? await classSquads(who.classId) : undefined, squad ? await absentToday(who.classId) : []);
  return NextResponse.json({ board }, { headers: { "Cache-Control": "no-store" } });
}
