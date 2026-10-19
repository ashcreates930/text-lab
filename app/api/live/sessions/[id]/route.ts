import { NextResponse, type NextRequest } from "next/server";
import { getLiveStore } from "@/lib/live/store";
import { hostView, isHost, loadState, playerFromToken, playerView } from "@/lib/live/server";

// The current state of a live round, as the host or as one player sees it.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: "Live rounds are not set up yet." }, { status: 503 });
  const st = await loadState(store, id).catch(() => null);
  if (!st) return NextResponse.json({ error: "This live round was not found." }, { status: 404 });
  if (isHost(st.session, request.headers.get("x-live-host"))) return NextResponse.json(hostView(st));
  const playerId = playerFromToken(id, request.headers.get("x-live-player"));
  if (playerId && st.players.some((p) => p.id === playerId)) return NextResponse.json(playerView(st, playerId));
  return NextResponse.json({ error: "Join the round first." }, { status: 401 });
}
