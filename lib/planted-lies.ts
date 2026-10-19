// Plant a Lie: after proving a clue, a class student writes one false sentence in a character's voice and taps the
// line from the story that disproves it. It is checked like the lies in the world files (lieProblems in lib/lies.ts),
// screened, and held for the teacher. Approved lies go into the class's Lie bank, which the teacher can use as a
// Spot the Lie round in live mode. The writer's squad earns points only when another squad catches the lie with the
// right line and a sound explanation; never when it stumps everyone.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { contentNotes } from "./content-notes.ts";
import { evidenceSentences, isTruthLine, lineWords, type Lie } from "./lies.ts";
import { matchEvidence } from "./evidence-check.ts";

export type PlantedLieStatus = "pending" | "approved" | "rejected" | "flagged";
export type PlantedLie = {
  id: string; classId: string; studentId: string; worldId: string; sceneId: string; clueId: string; characterId: string;
  sentence: string; truthParagraph: string; truthLine: string; status: PlantedLieStatus; createdAt: string; reviewedAt: string | null;
};
export type PlantedLieInput = Pick<PlantedLie, "sceneId" | "clueId" | "characterId" | "sentence" | "truthParagraph" | "truthLine">;

export const PLANTED_LIE_POINTS = 25; // to the writer's squad, for each other squad that catches it soundly

// Why a planted lie can't be used, in words a student can act on; empty when it is ready for the teacher.
export function plantedLieProblems(world: WorldPack, passages: SourcePassage[], input: PlantedLieInput): string[] {
  const problems: string[] = [];
  const scene = world.scenes.find((s) => s.id === input.sceneId);
  const clue = scene?.artifacts.find((a) => a.id === input.clueId);
  if (!scene || !clue) return ["That clue isn't in this story."];
  // Only speaking characters (world.characters) who are in this scene; non-speaking characters are never voiced.
  if (!scene.available_characters.includes(input.characterId) || !world.characters.some((c) => c.id === input.characterId)) problems.push("Pick a character who speaks in this scene.");
  const sentence = input.sentence.trim();
  const words = sentence.split(/\s+/).filter(Boolean).length;
  if (words < 5) problems.push("Write a full sentence, at least 5 words.");
  if (sentence.length > 220) problems.push("Keep it to one sentence, under 220 characters.");
  if (evidenceSentences(sentence.replace(/\b(Mrs|Mr|Ms|Dr|St)\./g, "$1")).length > 1) problems.push("Write just one sentence.");
  if (!clue.source_anchor.includes(input.truthParagraph)) problems.push("Tap a line from this clue's evidence.");
  if (contentNotes(world).has(input.truthParagraph)) problems.push("Pick a line from a different paragraph. That one has a content note.");
  // The truth line must be exactly one of this clue's evidence lines, in the paragraph named: not a fragment or an edit.
  const lie = asLie(input);
  if (!matchEvidence(world, passages, input.truthLine, { clueId: input.clueId, pid: input.truthParagraph })) problems.push("Tap the line from the story that proves it false.");
  // Exactly one tappable line may be the answer, so classmates can't be marked wrong for an equally good line.
  const matches = passages.filter((p) => clue.source_anchor.includes(p.id)).flatMap((p) => evidenceSentences(p.text)).filter((s) => isTruthLine(lie, s));
  if (matches.length > 1) problems.push("That line appears more than once in this clue. Pick a different one.");
  // Copying the story's own line isn't a lie.
  if (sentence && lineWords(sentence) === lineWords(input.truthLine)) problems.push("Change the sentence so it says something false.");
  return problems;
}

// A planted lie in the shape the Spot the Lie rules use. The explanation and topic come from the clue, since the
// student's sentence is the whole testimony.
export function asLie(p: PlantedLieInput, world?: WorldPack): Lie {
  const clue = world?.scenes.find((s) => s.id === p.sceneId)?.artifacts.find((a) => a.id === p.clueId);
  return {
    clue_id: p.clueId, character_id: p.characterId, testimony: p.sentence.trim(), false_claim: p.sentence.trim(),
    truth_paragraph: p.truthParagraph, truth_line: p.truthLine, explanation: "A classmate wrote this lie. The line from the story shows what really happened.",
    topic: clue ? clue.name.toLowerCase() : "this clue",
  };
}

// Points for the writer's squad: only for other squads' sound catches.
export function writerPoints(catches: { squadId: string; correct: boolean; sound: boolean }[], writerSquadId: string | null) {
  if (!writerSquadId) return 0;
  return catches.filter((c) => c.squadId !== writerSquadId && c.correct && c.sound).length * PLANTED_LIE_POINTS;
}
