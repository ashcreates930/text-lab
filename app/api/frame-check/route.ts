import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { consumeDemoAi } from "@/lib/demo-usage";
import { checkFrame, loadFramePage } from "@/lib/frames-server";

// Checks a storyboard frame: is the student's description supported by the line they chose? Always answers with
// { ok, notes }; ok is null when the check cannot run (the student can still save the frame).
const Input = z.object({ sandboxId: z.string().uuid(), worldId: z.string().regex(/^[a-z0-9-]+$/), pageId: z.string().regex(/^[a-z0-9-]+$/), quote: z.string().min(1).max(400), description: z.string().min(1).max(600) });
const unavailable = { ok: null, notes: ["We couldn't check this one right now. You can still save your frame."] };

export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ ok: false, notes: ["Write 1 to 3 sentences about what you see, then check again."] });
  const found = await loadFramePage(input.data.worldId, input.data.pageId);
  if (!found) return NextResponse.json(unavailable);
  if (await consumeDemoAi(request, "frame_check", input.data.sandboxId)) return NextResponse.json(unavailable);
  return NextResponse.json(await checkFrame(found.pack, found.page, found.text, input.data.quote, input.data.description));
}
