import { NextResponse, type NextRequest } from "next/server";
import { getLiveStore } from "@/lib/live/store";
import { expired } from "@/lib/live/server";
import { studentFromRequest, isFailure } from "@/lib/classroom/auth";

// For a class student's screen: is a live round open for their class right now? (Shows the "Join live round" button.)
export async function GET(request: NextRequest) {
  const auth = await studentFromRequest(request);
  if (isFailure(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = getLiveStore();
  if (!store) return NextResponse.json({ round: null });
  const sessions = await store.listForClasses([auth.student.session_id]).catch(() => []);
  const open = sessions.filter((s) => s.status !== "ended" && !expired(s)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return NextResponse.json({ round: open ? { code: open.code, sessionId: open.id } : null });
}
