// Mastery levels per student per B.E.S.T. benchmark family (lib/best-standards.ts), from first-try answers only.
// Four levels, the same for students and teachers:
// - Not yet: under half right;
// - Developing: about half or more right, but not yet Proficient;
// - Proficient: at least 80 percent right across 3 or more questions;
// - Mastered: Proficient, with the evidence spread across 2 or more expeditions and 2 or more formats, and at least one
//   harder-version question proved. A standard needs 3 questions in 2 formats across 2 expeditions before Mastered is
//   possible.
// Only a question's first answer counts (a Refresher fix is "practice +1" and never raises a level), and only each
// expedition's first attempt with answers (a replay is practice). Levels are private: they appear only to the student and
// their teacher, never on the leaderboard or the map. "Not yet" is never shown as failure.
import type { ExpeditionAttempt } from "./expedition-progress.ts";
import { firstAttempts } from "./expedition-progress.ts";
import { provedFirstTry } from "./case-notes.ts";
import { benchmark, gradeOf, type BenchmarkFamily } from "./best-standards.ts";

export const LEVELS = ["Not yet", "Developing", "Proficient", "Mastered"] as const;
export type Level = (typeof LEVELS)[number];
export const PROFICIENT = { pct: 0.8, questions: 3 }, MASTERED = { expeditions: 2, formats: 2, harder: 1 };

// Each skill in plain words, what each level means, and one next step.
export const SKILLS: Record<BenchmarkFamily, { name: string; next: string }> = {
  "R.1.1": { name: "Character, setting and plot", next: "Ask what a character does, and what that choice changes in the story." },
  "R.1.2": { name: "Theme", next: "Name the big idea in a few words, then find the line that shows it." },
  "R.1.3": { name: "Point of view", next: "Ask who is telling this part, and how they want you to see it." },
  "R.3.1": { name: "Figurative language", next: "When words can't be literally true, ask what picture they paint." },
  "R.3.2": { name: "Summarizing", next: "Before you pick a summary, say the whole chunk to yourself in one sentence." },
  "V.1.3": { name: "Word meaning", next: "Look at the words around a tricky word for clues to what it means." },
  "K12.EE.1.1": { name: "Citing evidence", next: "Before you lock in, reread the sentence and ask: does it prove my answer?" },
  "K12.EE.3.1": { name: "Making inferences", next: "Combine what the text says with what you know, then check it against a line." },
  "K12.EE.4.1": { name: "Discussion", next: "Build on what a squadmate said, and point to the line you mean." },
};
export const LEVEL_MEANING: Record<Level, string> = {
  "Not yet": "You're just getting started. Every question you try builds this skill.",
  Developing: "You're getting it about half the time or more. Keep going.",
  Proficient: "You get this right most of the time.",
  Mastered: "You've shown this skill again and again, in different kinds of questions and on harder ones.",
};

// One piece of evidence: a first-try answer on a question tagged with this family.
export type Evidence = { family: BenchmarkFamily; right: boolean; format: string; expedition: string; harder: boolean; proof: string; question: string; at: string };
export type SkillLevel = { family: BenchmarkFamily; name: string; level: Level; right: number; total: number; formats: number; expeditions: number; harderRight: number;
  toward: { next: Level; have: number; need: number } | null; best: string | null };

const isFamily = (s: string): s is BenchmarkFamily => s in SKILLS;
// The evidence in a set of attempts (each expedition's first attempt with answers). The Gist check counts toward
// Summarizing (R.3.2).
export function evidenceFrom(attempts: ExpeditionAttempt[]): Evidence[] {
  const out: Evidence[] = [];
  for (const a of firstAttempts(attempts)) for (const n of a.notes) {
    for (const f of n.standards) if (isFamily(f)) out.push({ family: f, right: provedFirstTry(n), format: n.format ?? "two_part", expedition: a.expeditionId, harder: n.version === "harder", proof: n.correctProof, question: n.question, at: a.startedAt });
    if (n.gistPick !== null) out.push({ family: "R.3.2", right: n.gistRight, format: "gist", expedition: a.expeditionId, harder: false, proof: "", question: "Gist check", at: a.startedAt });
  }
  return out;
}
// A family's level from its evidence, and how far it is toward the next level.
export function levelOf(family: BenchmarkFamily, items: Evidence[]): SkillLevel {
  const mine = items.filter((e) => e.family === family), total = mine.length, right = mine.filter((e) => e.right).length;
  const formats = new Set(mine.map((e) => e.format)).size, expeditions = new Set(mine.map((e) => e.expedition)).size, harderRight = mine.filter((e) => e.right && e.harder).length;
  const pct = total ? right / total : 0, proficient = total >= PROFICIENT.questions && pct >= PROFICIENT.pct;
  const rightExpeditions = new Set(mine.filter((e) => e.right).map((e) => e.expedition)).size;
  const mastered = proficient && expeditions >= MASTERED.expeditions && rightExpeditions >= MASTERED.expeditions && formats >= MASTERED.formats && harderRight >= MASTERED.harder;
  const level: Level = mastered ? "Mastered" : proficient ? "Proficient" : total && pct >= 0.5 ? "Developing" : "Not yet";
  // Toward the next level: right answers toward Proficient (3, or enough for 80 percent), or the Mastered conditions met.
  const toward = level === "Mastered" ? null
    : level === "Proficient" ? { next: "Mastered" as Level, have: [rightExpeditions >= MASTERED.expeditions, formats >= MASTERED.formats, harderRight >= MASTERED.harder].filter(Boolean).length, need: 3 }
    : { next: "Proficient" as Level, have: right, need: Math.max(PROFICIENT.questions, Math.ceil(PROFICIENT.pct * Math.max(total, PROFICIENT.questions))) };
  const best = [...mine].reverse().find((e) => e.right && e.proof)?.proof ?? null;
  return { family, name: SKILLS[family].name, level, right, total, formats, expeditions, harderRight, toward, best };
}
// Every family with any evidence, in the order of SKILLS.
export function masteryOf(items: Evidence[]): SkillLevel[] {
  return (Object.keys(SKILLS) as BenchmarkFamily[]).filter((f) => items.some((e) => e.family === f)).map((f) => levelOf(f, items));
}
export const rankOfLevel = (l: Level) => LEVELS.indexOf(l);
// The families whose level rose between two sets of evidence (a level-up moment each).
export function levelUps(before: Evidence[], after: Evidence[]) {
  return masteryOf(after).filter((s) => rankOfLevel(s.level) > rankOfLevel(levelOf(s.family, before).level));
}
// The skill tag after an answer: "Point of view · Developing · 2 of 3 toward Proficient" (and the dots).
export function skillTag(s: SkillLevel) {
  const toward = s.toward ? `${Math.min(s.toward.have, s.toward.need)} of ${s.toward.need} toward ${s.toward.next}` : "the top level";
  return { text: `${s.name} · ${s.level} · ${toward}`, dots: s.toward ? { filled: Math.min(s.toward.have, s.toward.need), of: s.toward.need } : null };
}
// The family a question's tag shows: its first benchmark that isn't the evidence habit, or the first one.
export function mainFamily(standards: string[]): BenchmarkFamily | null {
  const fams = standards.filter(isFamily);
  return fams.find((f) => !f.startsWith("K12.")) ?? fams[0] ?? null;
}
// Levels over time: the level of each skill after each finished expedition, oldest first.
export function levelHistory(attempts: ExpeditionAttempt[]) {
  const firsts = firstAttempts(attempts).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  return firsts.map((a, i) => ({ expedition: a.expeditionId, at: a.finishedAt ?? a.startedAt, reflection: a.reflection ?? null, levels: masteryOf(evidenceFrom(firsts.slice(0, i + 1))).map((s) => ({ family: s.family, name: s.name, level: s.level })) }));
}
// The teacher's code for a family at the class grade (the same level names).
export const codeOf = (family: BenchmarkFamily, grade: unknown) => benchmark(family, gradeOf(grade)).code;
// The class rollup: how many students sit at each level for each family.
export function classLevels(students: { attempts: ExpeditionAttempt[] }[]) {
  const out = new Map<BenchmarkFamily, Record<Level, number>>();
  for (const s of students) for (const l of masteryOf(evidenceFrom(s.attempts))) { const row = out.get(l.family) ?? { "Not yet": 0, Developing: 0, Proficient: 0, Mastered: 0 }; row[l.level]++; out.set(l.family, row); }
  return [...out.entries()].map(([family, counts]) => ({ family, name: SKILLS[family].name, counts }));
}
