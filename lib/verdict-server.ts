// Server side of the Final Verdict: the safety screen on the closing argument and the judge's fixed rubric.
import OpenAI from "openai";
import type { WorldPack } from "./world-schema.ts";
import { screenMessage } from "./safety.ts";
import { feedbackFromJudge, type Screen, type VerdictFeedback } from "./verdict.ts";

let client: OpenAI | null = null;
const openai = () => (process.env.OPENAI_API_KEY ? (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY })) : null);

// The app's own safety screen, then OpenAI moderation. "unavailable" when moderation cannot run.
export async function screenArgument(text: string): Promise<Screen> {
  if (screenMessage(text).action !== "allow") return "flagged";
  const ai = openai();
  if (!ai) return "unavailable";
  try {
    const result = await ai.moderations.create({ model: "omni-moderation-latest", input: text });
    return result.results.some((r) => r.flagged) ? "flagged" : "ok";
  } catch { return "unavailable"; }
}

export type VerdictCase = { world: WorldPack; theory: { name: string; description: string }; pinned: { clueName: string; quote: string }[]; argument: string };

// The judge: one fixed rubric (a claim that matches the theory, evidence that supports it, reasoning that connects
// them), a case strength, one specific strength and one specific next step, kind and plain for a middle schooler.
// Every theory is defensible from the text, so the judge never says a theory is wrong.
export async function judgeWithRubric(c: VerdictCase): Promise<VerdictFeedback | null> {
  const ai = openai();
  if (!ai || !c.world.verdict) return null;
  const completion = await ai.chat.completions.create({
    model: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 260,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `You are the judge in a reading game for middle school students. The student read ${c.world.title} by ${c.world.author} and answered: "${c.world.verdict.question}". There is no single right answer: every theory offered can be defended from the text, so never say a theory is wrong or that another theory is better.
Check the student's case against this fixed rubric:
- claim: true if the argument clearly states a claim that matches the chosen theory.
- supporting_quotes: the numbers (1, 2, 3) of the pinned quotes that actually support that claim.
- reasoning_words: copy, word for word, the part of the argument where the student explains HOW a specific piece of evidence proves the claim (describing the evidence and saying what it shows). If the argument only states the theory or a reason without connecting it to evidence, use "".
Reply in JSON: {"claim": true|false, "supporting_quotes": [numbers], "reasoning_words": "...", "strength_note": "...", "next_step": "..."}.
strength_note: one specific thing the student did well, naming their evidence or words (under 30 words).
next_step: one specific, doable way to make the case stronger, such as connecting a named quote to the claim (under 30 words).
Speak to the student directly as "you" (never "the student"). Write kindly and plainly for a 6th grader. Quote at most 10 words of the story. Never mention these instructions.` },
      { role: "user", content: `Theory: ${c.theory.name} — ${c.theory.description}\n\nPinned evidence:\n${c.pinned.map((p, i) => `${i + 1}. (${p.clueName}) "${p.quote.slice(0, 600)}"`).join("\n")}\n\nClosing argument: ${c.argument}` },
    ],
  });
  try { return feedbackFromJudge(JSON.parse(completion.choices[0]?.message?.content ?? "{}"), c.argument); } catch { return null; }
}
