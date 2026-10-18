// The Final Verdict: after the last scene is solved, the student chooses a theory (world.verdict.theories), pins exactly
// three of the clues they proved, writes a two-to-four-sentence closing argument, and submits it to the judge
// (/api/verdict). The judge rates the case strength and never says a theory is wrong. Rules only; the screen is
// app/verdict.tsx and the judge's prompt is lib/verdict-server.ts.
import type { WorldPack } from "./world-schema.ts";

export const STRENGTHS = ["Strong", "Solid", "Needs more evidence"] as const;
export type Strength = (typeof STRENGTHS)[number];
export type VerdictFeedback = { strength: Strength; strength_note: string; next_step: string };
export type SavedVerdict = {
  world_id: string;
  theory_id: string;
  pinned: { clue_id: string; quote: string }[];
  argument: string;
  feedback: VerdictFeedback | null;
  submissions: number;
  saved_at: string;
};
export const PINS_NEEDED = 3;
export const MAX_SUBMISSIONS = 2; // the first submission and one revision
export const SAVED_WITHOUT_FEEDBACK = "Your verdict is saved.";
export const VERDICT_OFF_STORY = "Let's keep your argument about the story. Try explaining your theory with your evidence.";

// Pin or unpin a clue. Never more than three.
export function togglePin(pinned: string[], clueId: string) {
  if (pinned.includes(clueId)) return pinned.filter((id) => id !== clueId);
  return pinned.length >= PINS_NEEDED ? pinned : [...pinned, clueId];
}
export const argumentSentences = (text: string) => text.split(/[.!?]+(?=\s|$)/).map((s) => s.trim()).filter((s) => s.length > 1).length;
// Ready to submit: a theory, exactly three pinned clues, and a closing argument of two to four sentences.
export function verdictProblems(v: { theoryId: string; pinned: string[]; argument: string }) {
  const problems: string[] = [];
  if (!v.theoryId) problems.push("Choose your theory.");
  if (v.pinned.length !== PINS_NEEDED) problems.push(`Pin exactly ${PINS_NEEDED} pieces of evidence.`);
  const n = argumentSentences(v.argument);
  if (n < 2) problems.push("Write at least 2 sentences.");
  if (n > 4) problems.push("Keep it to 4 sentences.");
  return problems;
}
export const canSubmit = (v: { theoryId: string; pinned: string[]; argument: string }) => verdictProblems(v).length === 0;
export const canRevise = (saved: SavedVerdict | undefined) => !saved || saved.submissions < MAX_SUBMISSIONS;

// The verdict saved for this story (a demo can move on to another story).
export const verdictFor = (saved: SavedVerdict | undefined, worldId: string) => (saved?.world_id === worldId ? saved : undefined);
export const theoryOf = (world: WorldPack, id: string | undefined) => world.verdict?.theories.find((t) => t.id === id);

export type JudgeResult = { status: "judged"; feedback: VerdictFeedback } | { status: "saved"; message: string } | { status: "flagged"; message: string };
// The order every verdict follows: the argument is checked for safety first; then the daily caps; then the judge. When
// the judge is unavailable (no AI, a cap, an error, or an answer that doesn't fit the rubric) the verdict is still
// saved, without feedback. A student never sees a technical error.
export type Screen = "ok" | "flagged" | "unavailable";
export async function judgeVerdict(argument: string, deps: { screen: (text: string) => Promise<Screen>; allow: () => Promise<boolean>; judge: () => Promise<VerdictFeedback | null> }): Promise<JudgeResult> {
  const screen = await deps.screen(argument).catch((): Screen => "unavailable");
  if (screen === "flagged") return { status: "flagged", message: VERDICT_OFF_STORY };
  // Without a safety check the argument never reaches the judge; it is saved without feedback.
  if (screen === "unavailable") return { status: "saved", message: SAVED_WITHOUT_FEEDBACK };
  if (!(await deps.allow().catch(() => false))) return { status: "saved", message: SAVED_WITHOUT_FEEDBACK };
  const feedback = await deps.judge().catch(() => null);
  return feedback ? { status: "judged", feedback } : { status: "saved", message: SAVED_WITHOUT_FEEDBACK };
}
// The case strength comes from the rubric, not the model's mood: one point each for a clear claim that matches the
// theory, evidence that supports it, and reasoning that connects them. 3 is Strong, 2 is Solid, fewer needs more evidence.
export function strengthFromRubric(r: { claim: boolean; evidence: boolean; reasoning: boolean }): Strength {
  const points = [r.claim, r.evidence, r.reasoning].filter(Boolean).length;
  return points === 3 ? "Strong" : points === 2 ? "Solid" : "Needs more evidence";
}
// The judge's reply, checked rather than trusted: whether the claim matches the theory; which pinned quotes support it
// (evidence needs at least two); and the exact words of the argument that explain how evidence proves the claim
// (reasoning needs real words from the argument, at least six, not just the claim restated). Anything else counts as
// the judge being unavailable.
const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
export function feedbackFromJudge(x: unknown, argument: string): VerdictFeedback | null {
  const r = x as { claim?: unknown; supporting_quotes?: unknown; reasoning_words?: unknown; strength_note?: unknown; next_step?: unknown } | null;
  if (!r || typeof r.claim !== "boolean" || !Array.isArray(r.supporting_quotes) || typeof r.reasoning_words !== "string") return null;
  const supporting = new Set(r.supporting_quotes.filter((n) => n === 1 || n === 2 || n === 3)).size;
  const quoted = words(r.reasoning_words).join(" "), said = ` ${words(argument).join(" ")} `;
  const firstSentence = words(argument.split(/[.!?]/)[0] ?? "").join(" ");
  const reasoning = words(r.reasoning_words).length >= 6 && said.includes(` ${quoted} `) && quoted !== firstSentence;
  return validFeedback({ strength: strengthFromRubric({ claim: r.claim, evidence: supporting >= 2, reasoning }), strength_note: r.strength_note, next_step: r.next_step });
}
export function validFeedback(x: unknown): VerdictFeedback | null {
  const f = x as Partial<VerdictFeedback> | null;
  if (!f || !STRENGTHS.includes(f.strength as Strength)) return null;
  const note = String(f.strength_note ?? "").trim(), next = String(f.next_step ?? "").trim();
  return note && next ? { strength: f.strength as Strength, strength_note: note.slice(0, 400), next_step: next.slice(0, 400) } : null;
}
