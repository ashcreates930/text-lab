import { NextResponse, type NextRequest } from "next/server";
import { getLiveStore } from "@/lib/live/store";
import { broadcast, loadState, playerAct, playerFromToken, playerView, type PlayerAction } from "@/lib/live/server";
import { consumeDemoAi } from "@/lib/demo-usage";
import { getClassroomStore } from "@/lib/classroom/store";
import type { TimeSetting } from "@/lib/story-mode";

// A player's action in their role: pin a line, write the explanation, approve or object, submit, or vote.
const KINDS = ["pin", "explain", "approve", "object", "submit", "vote", "pins", "argument", "counter_vote", "story", "story_pin", "story_react", "story_vote", "story_freeze", "your_turn", "mission_pick"];
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: "Live rounds are not set up yet." }, { status: 503 });
  const playerId = playerFromToken(id, request.headers.get("x-live-player"));
  if (!playerId) return NextResponse.json({ error: "Join the round first." }, { status: 401 });
  const act = (await request.json().catch(() => null)) as PlayerAction | null;
  if (!act || !KINDS.includes(act.kind)) return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  const st = await loadState(store, id).catch(() => null);
  if (!st) return NextResponse.json({ error: "This live round was not found." }, { status: 404 });
  // Story Mode: a class student gets their teacher's extra time.
  const me = st.players.find((p) => p.id === playerId);
  let timeSetting: TimeSetting = "1";
  if (act.kind === "story" && st.session.classId && me?.studentId) timeSetting = ((await getClassroomStore()?.getStudentTimes(st.session.classId).catch(() => ({}))) as Record<string, TimeSetting> | undefined)?.[me.studentId] ?? "1";
  // Judge calls in live mode are counted per session (one shared cap for the whole room), not per phone.
  const error = await playerAct(store, st, playerId, { kind: act.kind, payload: act.payload ?? {} }, { judgeAllowed: async () => !(await consumeDemoAi(request, "live_judge", id)), timeSetting });
  if (error) return NextResponse.json({ error }, { status: 409 });
  await broadcast(id);
  return NextResponse.json(playerView((await loadState(store, id))!, playerId));
}
