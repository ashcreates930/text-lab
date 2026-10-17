// Server side of the Teacher Evidence View: loads one class for its own teacher and builds the evidence from each
// student's saved progress. Returns null when the class does not exist or belongs to another teacher.
import type { ClassroomStore } from "./store.ts";
import { readWorld } from "./worlds.ts";
import { buildEvidence, type ClassEvidence } from "./evidence.ts";

export async function loadClassEvidence(store: ClassroomStore, teacherId: string, classId: string): Promise<ClassEvidence | null> {
  const cls = await store.getClass(teacherId, classId);
  if (!cls) return null;
  const world = await readWorld(cls.world_id);
  if (!world) return null;
  const students = await store.listStudents(cls.id);
  const progress = await Promise.all(students.map((s) => store.getProgress(s.id)));
  return buildEvidence(world, students.map((s, i) => {
    const p = progress[i];
    // Only progress for this class's story counts; a student with no saved progress has not started.
    return { id: s.id, nickname: s.nickname, answers: p && p.worldId === cls.world_id ? p.artifactAnswers : null };
  }));
}
