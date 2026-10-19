import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getLiveStore } from "@/lib/live/store";
import { DEMO_ROOM } from "@/lib/live/engine";
import { hashHostToken, newHostToken, newJoinCode } from "@/lib/live/server";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";
import { consumeDemoAi } from "@/lib/demo-usage";

// Starts a live round: for one of the teacher's classes (signed in), or a Demo room from the sample classroom (anyone
// with demo access; up to 40 players; gone after 2 hours). Answers { id, code, hostToken }; the host token is shown once.
const Input = z.union([
  z.object({ classId: z.string().uuid() }),
  z.object({ demo: z.literal(true), worldId: z.string().regex(/^[a-z0-9-]+$/).default("sleepy-hollow") }),
]);
const UNSET = "Live rounds need the database update (supabase/migrations/202610190001_live_rounds.sql).";

export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose a class or the demo room." }, { status: 400 });
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: UNSET }, { status: 503 });
  let classId: string | null = null, teacherId: string | null = null, worldId: string, hours = 12;
  if ("classId" in input.data) {
    const auth = await teacherFromRequest(request);
    if (isFailure(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const cls = await auth.store.getClass(auth.teacherId, input.data.classId);
    if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });
    classId = cls.id; teacherId = auth.teacherId; worldId = cls.world_id;
  } else {
    const capped = await consumeDemoAi(request, "live_room", "demo-rooms");
    if (capped) return NextResponse.json({ error: "Today's demo rooms for this device are used up. Try again tomorrow." }, { status: 429 });
    worldId = input.data.worldId; hours = DEMO_ROOM.hours;
  }
  if (!(await readWorld(worldId))) return NextResponse.json({ error: "That story is not available." }, { status: 404 });
  const hostToken = newHostToken();
  try {
    const s = await store.createSession({ code: newJoinCode(), teacherId, classId, demo: !classId, worldId, status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: hashHostToken(hostToken), expiresAt: new Date(Date.now() + hours * 3600e3).toISOString() });
    return NextResponse.json({ id: s.id, code: s.code, hostToken }, { status: 201 });
  } catch (e) {
    console.error("Live session failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: UNSET }, { status: 503 });
  }
}
