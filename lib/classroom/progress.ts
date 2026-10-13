// A class student's reading progress, saved in students.progress so it resumes on any day or device after they rejoin
// with their class code and nickname (same device) or their returning-student phrase (any device). It holds only the
// student's own reading work: pages and screens, clue answers, saved evidence, and picture frames. No device ID.
import { z } from "zod";

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
  storyFrames: z.record(id, frame),
  updatedAt: text(40),
});
export type StudentProgress = z.infer<typeof StudentProgressSchema>;
export const MAX_PROGRESS_BYTES = 200_000;
