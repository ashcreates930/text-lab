// Server side of the Teacher Evidence View: loads one class for its own teacher and builds the evidence from each
// student's saved progress, plus the class's live rounds. Returns null when the class does not exist or belongs to
// another teacher.
import type { ClassroomStore } from "./store.ts";
import { readWorld } from "./worlds.ts";
import { buildEvidence, type ClassEvidence } from "./evidence.ts";
import { getLiveStore } from "../live/store.ts";
import { loadState } from "../live/server.ts";
import { liveRoundEvidence, type LiveRoundEvidence } from "../live/evidence.ts";

export async function loadClassEvidence(store: ClassroomStore, teacherId: string, classId: string): Promise<ClassEvidence | null> {
  const cls = await store.getClass(teacherId, classId);
  if (!cls) return null;
  const world = await readWorld(cls.world_id);
  if (!world) return null;
  const students = await store.listStudents(cls.id);
  const progress = await Promise.all(students.map((s) => store.getProgress(s.id)));
  const evidence = buildEvidence(world, students.map((s, i) => {
    const p = progress[i];
    // Only progress for this class's story counts; a student with no saved progress has not started.
    const mine = p && p.worldId === cls.world_id;
    return { id: s.id, nickname: s.nickname, answers: mine ? p.artifactAnswers : null, frames: mine ? p.storyFrames : null, lies: mine ? p.lies ?? null : null, verdict: mine ? p.verdict ?? null : null };
  }), cls.grade);
  const live = await loadLiveRounds(cls.id);
  return live.length ? { ...evidence, live } : evidence;
}

// The class's live rounds, newest session first. A live store that isn't set up yet (migration not run) means none.
async function loadLiveRounds(classId: string): Promise<LiveRoundEvidence[]> {
  const store = getLiveStore();
  if (!store) return [];
  const sessions = await store.listForClasses([classId]).catch(() => []);
  const out: LiveRoundEvidence[] = [];
  for (const s of [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const st = await loadState(store, s.id).catch(() => null);
    if (st) out.push(...liveRoundEvidence(st));
  }
  return out;
}
