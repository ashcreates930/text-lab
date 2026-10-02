import type { AuthorshipRange } from "./authorship";
import { authorshipShares } from "./authorship";

export type SavedTextEvidence = { id: string; paragraphId: string; text: string; artifactId?: string };
export type AnalysisReport = {
  generatedByAi: boolean;
  centralJudgment: string;
  development: string;
  evidenceUsed: string;
  techniques: string;
  skills: { skill: string; suggestedLevel: string; rationale: string; teacherLevel?: string }[];
  strength: string;
  nextStep: string;
  authorship: string;
  shares: Record<string, boolean>;
};

export function countUniqueQuotes(narrative: string, quotes: SavedTextEvidence[]) {
  const extracted = [...narrative.matchAll(/[“"]([^”"]+)[”"]/g)].map((match) => match[1].trim().toLocaleLowerCase());
  return new Set([...quotes.map((quote) => quote.text.trim().toLocaleLowerCase()), ...extracted]).size;
}

export function createFallbackAnalysisReport(input: {
  narrative: string;
  answers: Record<string, { notice: string; interpret: string; craft: string; technique: string; revisions: string[] }>;
  quotes: SavedTextEvidence[];
  role: string;
  ranges: AuthorshipRange[];
}): AnalysisReport {
  const answers = Object.values(input.answers);
  const judgments = answers.map((answer) => answer.interpret).filter(Boolean);
  const craft = answers.map((answer) => answer.craft).filter(Boolean);
  const techniques = [...new Set(answers.map((answer) => answer.technique).filter(Boolean))];
  const directQuotes = countUniqueQuotes(input.narrative, input.quotes);
  const shares = authorshipShares(input.ranges, input.narrative.length);
  return {
    generatedByAi: false,
    centralJudgment: judgments.at(-1) || "No central judgment has been recorded yet.",
    development: judgments.length ? `The student saved ${judgments.length} interpretation(s) across artifacts. ${answers.reduce((total, answer) => total + answer.revisions.length, 0)} earlier response revision(s) are available in the Case File.` : "No interpretation answers have been recorded yet.",
    evidenceUsed: `${directQuotes} direct text quotation(s) counted in the narrative and saved passage quotes. ${input.role ? "AI-character evidence should be reviewed against the saved conversation." : "No AI-character evidence count is available."}`,
    techniques: techniques.length ? techniques.map((name) => `${name}: ${craft.find((answer) => answer.length > 0) || "No CRAFT example recorded."}`).join("\n") : "No CRAFT techniques have been recorded yet.",
    skills: ["Reading evidence", "Judging reliability", "Narrative craft"].map((skill) => ({ skill, suggestedLevel: "Review needed", rationale: "Consider the saved Case File answers and narrative before selecting a level." })),
    strength: "Review the student’s own interpretation and source selections for a specific strength.",
    nextStep: "Ask the student to connect one more precise quote to a claim in the narrative.",
    authorship: `Typed ${shares.typed}%, inserted from earlier answers ${shares.inserted}%, pasted from outside the app ${shares.pasted}%.`,
    shares: { centralJudgment: true, development: true, evidenceUsed: true, techniques: true, skills: false, strength: false, nextStep: false, authorship: false },
  };
}
