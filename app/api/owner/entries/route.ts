import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isOwnerEmailAllowed } from "@/lib/owner-auth";

// Owner only (magic-link session for OWNER_EMAIL): every feedback and waitlist entry, newest first.
export async function GET(request: Request) {
  const db = getServiceSupabase(), owner = process.env.OWNER_EMAIL;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!db || !owner || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !isOwnerEmailAllowed(user?.email, owner)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // heard_from comes with the 202610250001 migration; until it runs, load the entries without it.
  const withHeard = async (table: string, cols: string) => {
    const r = await db.from(table).select(`${cols},heard_from`).order("created_at", { ascending: false });
    return r.error && /heard_from/.test(r.error.message) ? db.from(table).select(cols).order("created_at", { ascending: false }) : r;
  };
  const [waitlist, feedback] = await Promise.all([
    withHeard("waitlist", "id,created_at,name,email,role,organization,state,plan,intent,price_named,price_period,start_when,payer,approver,loi,pilot_commit,students,lock_founding_price,wants_updates,source"),
    withHeard("feedback_entries", "id,created_at,side_tried,ease,one_screen,would_use,change_text,broken_text,device,source,waitlist_id"),
  ]);
  if (waitlist.error || feedback.error) return NextResponse.json({ error: "Could not load entries. Has the feedback migration been run?" }, { status: 500 });
  return NextResponse.json({ waitlist: waitlist.data, feedback: feedback.data }, { headers: { "Cache-Control": "no-store" } });
}
