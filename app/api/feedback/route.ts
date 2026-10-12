import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { SubmissionSchema, hasFeedback } from "@/lib/feedback";
import { clientAddress, hashClientAddress } from "@/lib/demo-access";

const RATE_LIMIT = 8, RATE_WINDOW_SECONDS = 600;

// One submission from the feedback and waitlist form: feedback, a waitlist entry, or both (linked).
export async function POST(request: Request) {
  const parsed = SubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue?.message && !issue.message.startsWith("Invalid") ? issue.message : "Check the form and try again.", field: issue?.path.join(".") }, { status: 400 });
  }
  const { feedback, waitlist, source, website } = parsed.data;
  // Honeypot: a hidden field only bots fill in.
  if (website) return NextResponse.json({ error: "Your entry could not be sent." }, { status: 400 });
  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ error: "Feedback storage is not configured." }, { status: 503 });
  const ipHash = await hashClientAddress(clientAddress(request.headers));
  const { data: allowed, error: rateError } = await db.rpc("consume_form_submission", { p_ip_hash: ipHash, p_limit: RATE_LIMIT, p_window_seconds: RATE_WINDOW_SECONDS });
  if (rateError) { console.error("Form rate limit check failed:", rateError.message); return NextResponse.json({ error: "We couldn't save that right now. Please try again in a minute." }, { status: 503 }); }
  if (!allowed) return NextResponse.json({ error: "Too many submissions from here. Please wait a few minutes and try again." }, { status: 429 });

  let waitlistId: string | null = null, duplicate = false;
  if (waitlist) {
    const row = {
      name: waitlist.name, email: waitlist.email.toLowerCase(), role: waitlist.role ?? null, organization: waitlist.organization ?? null, state: waitlist.state ?? null,
      plan: waitlist.plan, intent: waitlist.intent, price_named: waitlist.intent === "lower_price" ? waitlist.priceNamed ?? null : null, price_period: waitlist.intent === "lower_price" ? waitlist.pricePeriod ?? null : null,
      start_when: waitlist.start ?? null, payer: waitlist.payer ?? null, approver: waitlist.approver ?? null, loi: waitlist.loi ?? null, pilot_commit: waitlist.pilotCommit ?? null,
      students: waitlist.students ?? null, lock_founding_price: waitlist.lockFoundingPrice, wants_updates: waitlist.wantsUpdates, source: source ?? null,
    };
    const inserted = await db.from("waitlist").insert(row).select("id").single();
    if (inserted.error?.code === "23505") {
      duplicate = true;
      const existing = await db.from("waitlist").select("id").eq("email_normalized", row.email).eq("plan", row.plan).maybeSingle();
      waitlistId = existing.data?.id ?? null;
    } else if (inserted.error) { console.error("Waitlist insert failed:", inserted.error.message); return NextResponse.json({ error: "We couldn't save your entry. Please try again." }, { status: 500 }); }
    else waitlistId = inserted.data.id;
  }
  if (hasFeedback(feedback)) {
    const { error } = await db.from("feedback_entries").insert({
      side_tried: feedback!.side ?? null, ease: feedback!.ease ?? null, one_screen: feedback!.oneScreen ?? null, would_use: feedback!.wouldUse ?? null,
      change_text: feedback!.change ?? null, broken_text: feedback!.broken ?? null, device: feedback!.device ?? null, source: source ?? null, waitlist_id: waitlistId,
    });
    if (error) { console.error("Feedback insert failed:", error.message); return NextResponse.json({ error: "We couldn't save your feedback. Please try again." }, { status: 500 }); }
  }
  return NextResponse.json({ ok: true, joined: !!waitlist && !duplicate, duplicate, feedback: hasFeedback(feedback) }, { status: 201 });
}
