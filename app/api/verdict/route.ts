import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { consumeDemoAi } from "@/lib/demo-usage";
import { readPassages, readWorld } from "@/lib/classroom/worlds";
import { verdictPins } from "@/lib/evidence-check";
import { judgeVerdict } from "@/lib/verdict";
import { judgeWithRubric, screenArgument } from "@/lib/verdict-server";

// Judges a Final Verdict. Always answers { status, feedback?, message? }: "judged" with feedback, "saved" (the judge was
// unavailable; the verdict is kept without feedback), "flagged" (the argument must be about the story), or "invalid"
// (a pinned quote is not one of its clue's evidence lines; nothing is saved).
const Input = z.object({
  sandboxId: z.string().uuid(), worldId: z.string().regex(/^[a-z0-9-]+$/), theoryId: z.string().max(120),
  pinned: z.array(z.object({ clue_id: z.string().max(120), quote: z.string().min(1).max(3000) })).length(3),
  argument: z.string().min(1).max(1500),
});
const saved = { status: "saved", message: "Your verdict is saved." };
const PINS_NOT_EVIDENCE = "Each pinned clue needs a line from the story as its proof. Re-prove that clue with a line from its evidence, then try again.";

export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  // A malformed request (a missing or empty quote, say) is refused rather than saved.
  if (!input.success) return NextResponse.json({ status: "invalid", message: PINS_NOT_EVIDENCE });
  const world = await readWorld(input.data.worldId).catch(() => null);
  const theory = world?.verdict?.theories.find((t) => t.id === input.data.theoryId);
  if (!world || !theory) return NextResponse.json(saved);
  const clues = new Map(world.scenes.flatMap((s) => s.artifacts).map((a) => [a.id, a.name]));
  // Each pinned quote must be one of that clue's evidence lines in the world file, and three different lines.
  const passages = await readPassages(world.id);
  const pinned = verdictPins(world, passages, input.data.pinned);
  if (!pinned) return NextResponse.json({ status: "invalid", message: PINS_NOT_EVIDENCE });
  return NextResponse.json(await judgeVerdict(input.data.argument, {
    screen: screenArgument,
    allow: async () => !(await consumeDemoAi(request, "verdict", input.data.sandboxId)),
    judge: () => judgeWithRubric({ world, theory, argument: input.data.argument, pinned: pinned.map((p) => ({ clueName: clues.get(p.clue_id) ?? "Evidence", quote: p.quote })) }),
  }));
}
