import { NextResponse, type NextRequest } from "next/server";
import { getLiveStore } from "@/lib/live/store";
import { classBoard, sessionScores } from "@/lib/live/engine";
import { loadState } from "@/lib/live/server";
import { isFailure, teacherFromRequest } from "@/lib/classroom/auth";

// Period vs. period: this week's squad points added up per class. Classes only; never individual students.
export async function GET(request: NextRequest) {
  const auth = await teacherFromRequest(request);
  if (isFailure(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = getLiveStore();
  if (!store) return NextResponse.json({ board: [] });
  const classes = await auth.store.listClasses(auth.teacherId);
  const names = new Map(classes.map((c) => [c.id, c.name || "Class"]));
  const sessions = await store.listForClasses(classes.map((c) => c.id)).catch(() => []);
  const weekAgo = Date.now() - 7 * 864e5;
  const entries: { classId: string; className: string; createdAt: string; points: number }[] = [];
  for (const s of sessions.filter((x) => new Date(x.createdAt).getTime() >= weekAgo)) {
    const st = await loadState(store, s.id);
    if (!st || !s.classId) continue;
    entries.push({ classId: s.classId, className: names.get(s.classId) ?? "Class", createdAt: s.createdAt, points: sessionScores(st.world, st.session, st.squads, st.responses).reduce((n, x) => n + x.points, 0) });
  }
  return NextResponse.json({ board: classBoard(entries) });
}
