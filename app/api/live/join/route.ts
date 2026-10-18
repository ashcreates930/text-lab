import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getLiveStore } from "@/lib/live/store";
import { isGeneratedNickname, nicknameChoices } from "@/lib/live/engine";
import { broadcast, expired, join, playerToken } from "@/lib/live/server";
import { studentFromRequest, isFailure } from "@/lib/classroom/auth";
import { readWorld } from "@/lib/classroom/worlds";

// GET: what a guest sees after scanning the QR code: the story and three detective nicknames to choose from.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: "Live rounds are not set up yet." }, { status: 503 });
  const s = await store.findByCode(code).catch(() => null);
  if (!s || s.status === "ended" || expired(s)) return NextResponse.json({ error: "This live round has ended, or the code is wrong." }, { status: 404 });
  const taken = (await store.listPlayers(s.id)).map((p) => p.nickname);
  const seed = Number(request.nextUrl.searchParams.get("seed")) || Math.floor(Math.random() * 1e6);
  return NextResponse.json({ sessionId: s.id, title: (await readWorld(s.worldId))?.title ?? "", nicknames: nicknameChoices(seed, taken) });
}

// POST: join. Class students join with one tap (their class nickname); guests join with a generated nickname. Nobody
// types a name.
const Input = z.object({ code: z.string().min(4).max(12), nickname: z.string().max(60).optional() });
export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Scan the code again." }, { status: 400 });
  const store = getLiveStore();
  if (!store) return NextResponse.json({ error: "Live rounds are not set up yet." }, { status: 503 });
  const s = await store.findByCode(input.data.code).catch(() => null);
  if (!s) return NextResponse.json({ error: "This live round has ended, or the code is wrong." }, { status: 404 });
  let nickname: string, studentId: string | null = null;
  if (request.headers.get("x-class-token")) {
    const auth = await studentFromRequest(request);
    if (isFailure(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (auth.student.session_id !== s.classId) return NextResponse.json({ error: "This live round is for another class." }, { status: 403 });
    nickname = auth.student.nickname; studentId = auth.student.id;
  } else {
    nickname = input.data.nickname ?? "";
    if (!isGeneratedNickname(nickname)) return NextResponse.json({ error: "Pick one of the detective names." }, { status: 400 });
  }
  const result = await join(store, s, { nickname, studentId });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });
  await broadcast(s.id);
  return NextResponse.json({ sessionId: s.id, code: s.code, playerId: result.player.id, playerToken: playerToken(s.id, result.player.id), nickname: result.player.nickname });
}
