// A class student's reading progress, saved in students.progress so it resumes on any day or device after they rejoin
// with their class code and nickname (same device) or their returning-student phrase (any device). It holds only the
// student's own reading work: pages and screens, clue answers, saved evidence, and picture frames. No device ID.
import { z } from "zod";
import { AngleSchema } from "../student-role.ts";

const text = (max: number) => z.string().max(max);
const id = z.string().max(120);
const readerProgress = z.object({
  page: z.number().int().min(0).max(500).optional(),
  part: z.number().int().min(0).max(500).optional(),
  furthest: z.number().int().min(0).max(500).optional(),
  briefed: z.boolean().optional(),
  sections: z.array(id).max(50).optional(),
  version: z.string().max(40).optional(),
  notesSeen: z.array(id).max(200).optional(),
  skippedFrames: z.array(id).max(200).optional(),
});
const answer = z.object({
  notice: text(3000), interpret: text(3000), craft: text(3000), technique: text(120),
  revisions: z.array(text(3000)).max(20),
  history: z.array(z.object({ stage: z.enum(["notice", "interpret", "craft"]), text: text(3000), submitted_at: text(40) })).max(60).optional(),
  // The character the student questioned before proving the clue. Older saves don't have it.
  character: id.optional(),
});
const frame = z.object({
  kind: z.enum(["add_detail", "student"]), description: text(600), quote: text(400), saved_at: text(40),
  image: text(500).optional(), check: z.object({ ok: z.boolean(), notes: z.array(text(400)).max(10) }).optional(),
});

export const StudentProgressSchema = z.object({
  v: z.literal(1),
  worldId: z.string().regex(/^[a-z0-9-]+$/),
  scene: z.number().int().min(0).max(100),
  submitted: z.boolean(),
  role: id.optional(),
  readerProgress: z.record(z.string().regex(/^[a-z0-9-]+$/), readerProgress),
  artifactAnswers: z.record(id, answer),
  savedTextEvidence: z.array(z.object({ id, paragraphId: text(12), text: text(1500), artifactId: id.optional() })).max(100),
  // Older saves may not have any frames.
  storyFrames: z.record(id, frame).default({}),
  // The option chosen at each scene's choice point (scene id -> option id). Older saves don't have it.
  choices: z.record(id, id).optional(),
  // Spot the Lie, per scene (scene id -> result). Older saves don't have it.
  lies: z.record(id, z.object({ clue_id: id, caught: z.boolean(), misses: z.number().int().min(0).max(100), caught_at: text(40).optional() })).optional(),
  // The Final Verdict: theory, the three pinned clues with their quotes, the closing argument, and the judge's feedback
  // (null when the judge was unavailable and the verdict was saved without it). Older saves don't have it.
  verdict: z.object({
    world_id: id,
    theory_id: id,
    pinned: z.array(z.object({ clue_id: id, quote: text(3000) })).length(3),
    argument: text(1500),
    feedback: z.object({ strength: z.enum(["Strong", "Solid", "Needs more evidence"]), strength_note: text(400), next_step: text(400) }).nullable(),
    submissions: z.number().int().min(1).max(5),
    saved_at: text(40),
  }).optional(),
  // Students in the story: "What's your angle?" (three choices only) and whether the role intro card was seen.
  angle: AngleSchema.optional(),
  roleIntroSeen: z.boolean().optional(),
  // The clue game (lib/clue-game.ts): points, coins and streak; lines the student marked; and "Something's off" flags.
  game: z.object({ points: z.number().int().min(0).max(1000000), coins: z.number().int().min(0).max(100000), streak: z.number().int().min(0).max(1000), bestStreak: z.number().int().min(0).max(1000), rivalWins: z.number().int().min(0).max(1000), rivalLosses: z.number().int().min(0).max(1000), earned: z.array(text(200)).max(500) }).optional(),
  marks: z.record(text(20), z.object({ tag: z.enum(["clue", "word", "question"]), pid: text(12), text: text(1500), clueId: id.optional(), at: text(40) })).optional(),
  claimFlags: z.array(z.object({ clueId: id, characterId: id, answer: text(1200), line: text(1500), pid: text(12), matched: z.boolean(), at: text(40) })).max(200).optional(),
  // How the student plays (solo, rival or squad) and the scenes whose mission screen they have seen.
  missionSeen: z.array(id).max(50).optional(),
  // Story Mode, per scene (scene id -> run summary): the score, the Evidence pouch and trust with the characters the
  // student met (character id -> trust, as on the server run). Older saves don't have it.
  story: z.record(id, z.object({
    runId: text(80), total: z.number().int().min(0).max(100000), bestStreak: z.number().int().min(0).max(10),
    trust: z.record(id, z.number().int().min(-12).max(12)), pouch: z.array(text(1500)).max(3), cleared: z.boolean(),
  })).optional(),
  updatedAt: text(40),
});
export type StudentProgress = z.infer<typeof StudentProgressSchema>;
export const MAX_PROGRESS_BYTES = 200_000;
