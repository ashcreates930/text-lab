import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { consumeDemoAi } from "@/lib/demo-usage";
import { readWorld } from "@/lib/classroom/worlds";
import { judgeVerdict } from "@/lib/verdict";
import { judgeWithRubric, screenArgument } from "@/lib/verdict-server";

// Judges a Final Verdict. Always answers { status, feedback?, message? }: "judged" with feedback, "saved" (the judge was
// unavailable; the verdict is kept without feedback), or "flagged" (the argument must be about the story).
const Input = z.object({
  sandboxId: z.string().uuid(), worldId: z.string().regex(/^[a-z0-9-]+$/), theoryId: z.string().max(120),
  pinned: z.array(z.object({ clue_id: z.string().max(120), quote: z.string().min(1).max(3000) })).length(3),
  argument: z.string().min(1).max(1500),
});
const saved = { status: "saved", message: "Your verdict is saved." };

export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json(saved);
  const world = await readWorld(input.data.worldId).catch(() => null);
  const theory = world?.verdict?.theories.find((t) => t.id === input.data.theoryId);
  if (!world || !theory) return NextResponse.json(saved);
  const clues = new Map(world.scenes.flatMap((s) => s.artifacts).map((a) => [a.id, a.name]));
  return NextResponse.json(await judgeVerdict(input.data.argument, {
    screen: screenArgument,
    allow: async () => !(await consumeDemoAi(request, "verdict", input.data.sandboxId)),
    judge: () => judgeWithRubric({ world, theory, argument: input.data.argument, pinned: input.data.pinned.map((p) => ({ clueName: clues.get(p.clue_id) ?? "Evidence", quote: p.quote })) }),
  }));
}
