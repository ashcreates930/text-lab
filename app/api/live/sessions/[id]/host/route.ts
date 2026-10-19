import { NextResponse, type NextRequest } from "next/server";
import { getLiveStore } from "@/lib/live/store";
import { broadcast, hostAct, hostView, isHost, loadState, type HostAction } from "@/lib/live/server";

// The host's controls: squads, start, next step, reveal, pause, end, and overrides.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: "Live rounds are not set up yet." }, { status: 503 });
  const st = await loadState(store, id).catch(() => null);
  if (!st) return NextResponse.json({ error: "This live round was not found." }, { status: 404 });
  if (!isHost(st.session, request.headers.get("x-live-host"))) return NextResponse.json({ error: "Only the host can do that." }, { status: 403 });
  const action = (await request.json().catch(() => null)) as HostAction | null;
  if (!action || typeof action.action !== "string") return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  const error = await hostAct(store, st, action);
  if (error) return NextResponse.json({ error }, { status: 409 });
  await broadcast(id);
  return NextResponse.json(hostView((await loadState(store, id))!));
}
