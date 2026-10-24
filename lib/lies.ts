// Spot the Lie: once per scene, one character gives a testimony with one false claim, and one line of the story
// disproves it. The student catches the lie by tapping that line among the clue's evidence lines. Rules only; the UI is
// in app/case.tsx (the clue screen), the content in each story's world.json (scene.lie), reviewed in
// docs/game-content-review.md.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { contentNotes } from "./content-notes.ts";

export type Lie = NonNullable<WorldPack["scenes"][number]["lie"]>;
// A student's result on a scene's lie, saved in progress (progress.lies[sceneId]).
export type LieRecord = { clue_id: string; caught: boolean; misses: number; caught_at?: string };

// The evidence lines a paragraph is split into, exactly as the clue screen shows them.
export function evidenceSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}
// Compare lines by their words: line breaks, spacing, curly quotes and stage-direction marks don't matter.
export const lineWords = (text: string) =>
  text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[_[\]]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
export const isTruthLine = (lie: Lie, tapped: string) => {
  const truth = lineWords(lie.truth_line);
  return !!truth && lineWords(tapped).includes(truth);
};

export const lieFor = (scene: { lie?: Lie }, clueId: string) => (scene.lie?.clue_id === clueId ? scene.lie : undefined);

export type LieAttempt =
  | { result: "caught"; misses: number }
  | { result: "miss"; misses: number; message: string; highlight?: LieHighlight };
// The gentle hint after two misses. A clue with several paragraphs highlights the paragraph that holds the answer. A
// one-paragraph clue would light up every line, so it highlights the answer and one line on each side instead (three
// lines, so the exact line is still the student's to find).
export type LieHighlight = { paragraph: string } | { lines: string[] };
export function hintFor(lie: Lie, evidence?: SourcePassage[]): LieHighlight {
  if (!evidence || evidence.length !== 1) return { paragraph: lie.truth_paragraph };
  const lines = evidenceSentences(evidence[0].text);
  const at = lines.findIndex((l) => isTruthLine(lie, l));
  if (at < 0) return { paragraph: lie.truth_paragraph };
  const start = Math.max(0, Math.min(at - 1, lines.length - 3));
  return { lines: lines.slice(start, start + 3) };
}
export const isHighlighted = (h: LieHighlight | undefined, line: { text: string; pid: string }) =>
  !!h && ("paragraph" in h ? h.paragraph === line.pid : h.lines.includes(line.text));
// One tap on an evidence line. A miss names the detail to look for; after two misses it also names the paragraph to
// look in. Nothing is highlighted: the right line is never lit up before the student taps it.
export function tryLine(lie: Lie, tapped: string, misses: number, _evidence?: SourcePassage[]): LieAttempt {
  if (isTruthLine(lie, tapped)) return { result: "caught", misses };
  const next = misses + 1;
  return { result: "miss", misses: next, message: `Not quite. Look for a line about ${lie.topic}.${next >= 2 ? ` Look again in ¶${Number(lie.truth_paragraph.slice(1))}.` : ""}` };
}

// The testimony split so the false sentence can be struck through once the lie is caught.
export function testimonyParts(lie: Lie) {
  const at = lie.testimony.indexOf(lie.false_claim);
  if (at < 0) return [{ text: lie.testimony, false: false }];
  return [
    { text: lie.testimony.slice(0, at), false: false },
    { text: lie.false_claim, false: true },
    { text: lie.testimony.slice(at + lie.false_claim.length), false: false },
  ].filter((p) => p.text);
}

// validate:worlds: every lie must be checkable by the student, and kept away from sensitive passages.
export function lieProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const problems: string[] = [];
  const notes = contentNotes(world);
  for (const scene of world.scenes) {
    const lie = scene.lie;
    if (!lie) continue;
    const where = `${world.id}/${scene.id} lie`;
    const clue = scene.artifacts.find((a) => a.id === lie.clue_id);
    if (!clue) { problems.push(`${where}: clue ${lie.clue_id} is not in this scene`); continue; }
    if (!scene.available_characters.includes(lie.character_id)) problems.push(`${where}: ${lie.character_id} is not available in this scene`);
    if (!world.characters.some((c) => c.id === lie.character_id)) problems.push(`${where}: unknown character ${lie.character_id}`);
    // "Mrs." and "Mr." are not the end of a sentence.
    const count = evidenceSentences(lie.testimony.replace(/\b(Mrs|Mr|Ms|Dr|St)\./g, "$1")).length;
    if (count < 2 || count > 3) problems.push(`${where}: testimony has ${count} sentences; it needs 2 to 3`);
    if (!lie.testimony.includes(lie.false_claim)) problems.push(`${where}: false_claim does not appear word for word in the testimony`);
    if (!clue.source_anchor.includes(lie.truth_paragraph)) problems.push(`${where}: ${lie.truth_paragraph} is not one of the clue's evidence paragraphs`);
    if (notes.has(lie.truth_paragraph)) problems.push(`${where}: ${lie.truth_paragraph} has a content note; lies never use those paragraphs`);
    const paragraph = passages.find((p) => p.id === lie.truth_paragraph);
    if (!paragraph) { problems.push(`${where}: paragraph ${lie.truth_paragraph} does not exist`); continue; }
    if (!lineWords(paragraph.text).includes(lineWords(lie.truth_line))) problems.push(`${where}: truth_line does not appear word for word in ${lie.truth_paragraph}`);
    else if (!evidenceSentences(paragraph.text).some((s) => isTruthLine(lie, s))) problems.push(`${where}: truth_line is not one of the evidence lines a student can tap`);
    // Exactly one line among the clue's evidence lines may be the answer.
    const matches = passages.filter((p) => clue.source_anchor.includes(p.id)).flatMap((p) => evidenceSentences(p.text)).filter((s) => isTruthLine(lie, s));
    if (matches.length > 1) problems.push(`${where}: ${matches.length} evidence lines match truth_line; it must be exactly one`);
  }
  if (world.verdict) {
    const ids = new Set(world.verdict.theories.map((t) => t.id));
    if (ids.size !== 3) problems.push(`${world.id} verdict: the three theories need different ids`);
  }
  return problems;
}
