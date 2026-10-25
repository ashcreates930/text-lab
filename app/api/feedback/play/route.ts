import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { PlayFeedbackSchema, confusingText } from "@/lib/feedback";
import { clientAddress, hashClientAddress } from "@/lib/demo-access";

const RATE_LIMIT = 8, RATE_WINDOW_SECONDS = 600;

// The demo ending's feedback card. Until the play-feedback migration (202610260001) runs, the fun and context columns
// don't exist: the answer is kept in change_text instead, and the server logs why.
export async function POST(request: Request) {
  const parsed = PlayFeedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your answers and try again." }, { status: 400 });
  const { fun, playAgain, world, website } = parsed.data;
  if (website) return NextResponse.json({ error: "Your answers could not be sent." }, { status: 400 });
  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ error: "Feedback storage is not configured." }, { status: 503 });
  const ipHash = await hashClientAddress(clientAddress(request.headers));
  const { data: allowed, error: rateError } = await db.rpc("consume_form_submission", { p_ip_hash: ipHash, p_limit: RATE_LIMIT, p_window_seconds: RATE_WINDOW_SECONDS });
  if (rateError) { console.error("Form rate limit check failed:", rateError.message); return NextResponse.json({ error: "We couldn't save that right now. Please try again in a minute." }, { status: 503 }); }
  if (!allowed) return NextResponse.json({ error: "Too many answers from here. Please wait a few minutes and try again." }, { status: 429 });
  const context = `demo-ending:${world}`;
  const row = { side_tried: "student", would_use: playAgain ?? null, broken_text: confusingText(parsed.data), fun: fun ?? null, context };
  let { error } = await db.from("feedback_entries").insert(row);
  if (error && /\b(fun|context)\b/.test(error.message)) {
    console.error("feedback_entries: fun/context aren't in the database yet (run 202610260001_play_feedback.sql); saved in change_text.");
    const { fun: _f, context: _c, ...rest } = row;
    ({ error } = await db.from("feedback_entries").insert({ ...rest, change_text: `Fun: ${fun ?? "no answer"} (${context})` }));
  }
  if (error) { console.error("Play feedback insert failed:", error.message); return NextResponse.json({ error: "We couldn't save that. Please try again." }, { status: 500 }); }
  return NextResponse.json({ ok: true }, { status: 201 });
}
