// First-time players (testers found the instructions confusing). Three helps, all world-agnostic:
// - a 30-second practice round the first time a student plays: one easy chunk and one question, with arrows showing
//   "Read this", "Tap the sentence" and "Lock it in", and no points (practiceChunk picks it from the story's data);
// - one plain sentence at the top of every screen saying exactly what to do now (DO_NOW);
// - first-time hints right where the student taps, which disappear once they've done it right, and a "What do I do?"
//   button that replays the hint for that screen (HINTS; done hints are remembered on the device).
import type { WorldPack } from "./world-schema.ts";

export type Screen = "home" | "interview" | "read" | "gist" | "question" | "proof" | "clues" | "dnd" | "multi" | "written" | "result" | "lightning" | "board" | "burst"
  | "countdown" | "liar" | "verdict" | "finish" | "refresher" | "skills" | "notes" | "map" | "myskills" | "practice" | "lobby" | "wait"
  | "door" | "recover" | "inner" | "recap" | "escape" | "stopped";

// What to do now, in one plain sentence, for every screen.
export const DO_NOW: Record<Screen, string> = {
  home: "Tap Play now to start, or join your class's live game.",
  interview: "Bring each witness into the spotlight, pick a question and listen to all three before the first lock.",
  read: "Read the chunk, then tap Ready.",
  gist: "Pick the best summary of what you just read.",
  question: "Pick your answer.",
  proof: "Tap the sentence in the passage that proves your answer, then tap Lock in.",
  clues: "Tap the clue words in the passage that show the meaning, then tap Lock in.",
  dnd: "Tap a piece, then the place it belongs, and tap Lock in once every place is filled.",
  multi: "Pick the number of answers it asks for, then tap Lock in.",
  written: "Write one sentence in your own words, then tap the button below.",
  result: "See how you did, then wait for the next chunk.",
  lightning: "Tap the sentence that answers it before time runs out.",
  board: "Check the leaderboard while the next chunk gets ready.",
  burst: "Tap the hidden discoveries in the chunks you've read, then tap I'm done.",
  countdown: "Get ready: the next chunk is about to start.",
  liar: "Name the witness who lied to open the exit door, then tap the sentence that proves it.",
  verdict: "See who lied and the line that proves it, then tap Final results.",
  finish: "See the final results, then tap Refresher to fix what you missed.",
  refresher: "Try each missed question again with no timer, then tap Next.",
  skills: "Read your skill report, write one sentence, then open your Case Notes.",
  notes: "Read your Case Notes, add your own notes if you like, then tap Done.",
  map: "Tap the big orange button to enter your next room, or explore the map first.",
  myskills: "See how each skill is growing, and tap a skill to see its history.",
  practice: "Follow the arrows to try one practice question, with no points and no timer.",
  lobby: "Wait here until your teacher starts the game.",
  wait: "Wait for the next part to start.",
  door: "Read where you are, then tap Open the door to begin.",
  recover: "Use the answer shown to open the lock: do what it asks, then tap Open the lock.",
  inner: "You opened the inner door, so tap the button to go on.",
  recap: "Read what is in your Case File so far, then tap Into Chamber 2.",
  escape: "You escaped the room, so tap Final results.",
  stopped: "Your room is saved, so tap Back to the map and start Chamber 2 next time.",
};

// First-time hints, shown right where the student taps until they've done it right once.
export type HintId = "read" | "proof" | "lock" | "clues" | "dnd" | "multi" | "written" | "gist";
export const HINTS: Record<HintId, string> = {
  read: "Read this first. Take your time: the timer starts when you tap Ready.",
  proof: "Tap the sentence that proves your answer. It lights up when you pick it.",
  lock: "Lock it in. You get one try, so check your sentence first.",
  clues: "Tap the words near the highlighted word that show what it means.",
  dnd: "Tap a piece to pick it up, then tap the place where it belongs.",
  multi: "This one needs more than one answer. Tap each one you choose.",
  written: "Write your own sentence. Then you'll tap the sentence from the story that backs it up.",
  gist: "Which choice tells the whole chunk, not just one detail?",
};
// The hint that belongs to a screen (for the "What do I do?" button).
export const HINT_FOR: Partial<Record<Screen, HintId>> = { read: "read", proof: "proof", clues: "clues", dnd: "dnd", multi: "multi", written: "written", gist: "gist", question: "proof" };

const KEY = "textlab:hints-done", PRACTICE = "textlab:practice-done";
type Store = { getItem(k: string): string | null; setItem(k: string, v: string): void };
const store = (): Store | null => { try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; } };
export function hintsDone(s: Store | null = store()): Set<HintId> { try { return new Set(JSON.parse(s?.getItem(KEY) ?? "[]")); } catch { return new Set(); } }
export function markHintDone(id: HintId, s: Store | null = store()) { try { const d = hintsDone(s); d.add(id); s?.setItem(KEY, JSON.stringify([...d])); } catch { /* storage off: hints keep showing */ } }
export const practiceDone = (s: Store | null = store()) => { try { return s?.getItem(PRACTICE) === "1"; } catch { return false; } };
export const markPracticeDone = (s: Store | null = store()) => { try { s?.setItem(PRACTICE, "1"); } catch { /* storage off */ } };

// The practice chunk: the story's first Find It question with a proof sentence (an easy one-step tap), from its first
// expedition. Any story with expeditions has one; nothing here names a particular story.
export function practiceChunk(world: Pick<WorldPack, "expeditions">) {
  for (const e of world.expeditions ?? []) {
    const k = e.chunks.findIndex((c) => c.question.type === "find_it" && (c.question.proof?.lines?.length ?? 0) > 0);
    if (k >= 0) return { expeditionId: e.id, index: k };
  }
  return null;
}
