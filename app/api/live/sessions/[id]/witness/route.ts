import { NextResponse, type NextRequest } from "next/server";
import { getLiveStore } from "@/lib/live/store";
import { expired, isWitness, loadState, witnessView } from "@/lib/live/server";

// The Witness stand phone (Hologram mode): read-only, with the signed link from the host screen's QR code.
type Params = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!isWitness(id, request.headers.get("x-live-witness"))) return NextResponse.json({ error: "Scan the Witness stand code on the board again." }, { status: 401 });
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: "Live rounds are not set up yet." }, { status: 503 });
  const st = await loadState(store, id);
  if (!st || expired(st.session)) return NextResponse.json({ error: "This live round has ended." }, { status: 404 });
  return NextResponse.json(witnessView(st), { headers: { "Cache-Control": "no-store" } });
}
