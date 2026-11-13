// The escape room (escape-room phase 0). Every expedition plays as a room: its chunks are locks, the checkpoint is the
// inner door between two chambers, and Name the Liar is the exit door. Pure rules, shared by the solo room, the live
// board and phones, and validate:worlds; the screens arrive in phase 1.
// - Proof is the key: a lock opens on the first try only when the answer is proven. After a miss the student is shown
//   the answer and must tap the shown proof to open the lock; that scores 0 and is recorded as a miss (nobody is
//   stranded, and a second guess never earns anything).
// - Chambers: a room is played one chamber per class period. Progress saves at the inner door; a student resumes at the
//   next unopened lock of their chamber, or on the Case File recap at the start of chamber 2.
// - The liar: one per student and room in solo play; in a live game tied to a class, one per class and room, so a room
//   split across two days keeps its liar. Naming the liar never scores without the line that disproves the lie.
// - Puzzle locks (code, painting, scene): data in world.json `rooms`, checked here; see lib/world-schema.ts.
import type { SourcePassage } from "./source-passages.ts";
import type { ExpQuestion, LineRef, RoomData, RoomPuzzle, WorldPack } from "./world-schema.ts";
import { evidenceSentences } from "./lies.ts";
import { chunkTokens, cluesProve, expeditionChunks, norm, sentenceProves, shuffledOrder, type Answer, type Token } from "./expedition.ts";
import { dndResult, formatOf, multiRight, writtenProved } from "./formats.ts";
import { arcOf, beatKind, levelsOf } from "./pacing.ts";
import { contentNotes } from "./content-notes.ts";
import { nameWords, sharedRoots } from "./fair-play.ts";
import { liarIndex } from "./interview.ts";

// ---------- Locks ----------
// What each question format looks like as a lock.
export type LockKind = "dial" | "two_key" | "clue_words" | "multi_dial" | "sentence" | "seal" | "tray" | "pinboard";
export const LOCK_INFO: Record<LockKind, { name: string; how: string }> = {
  dial: { name: "Dial lock", how: "Turn the dial to the right answer." },
  two_key: { name: "Two-key lock", how: "Pick the answer, then tap the line that proves it." },
  clue_words: { name: "Clue-word lock", how: "Pick the meaning, then tap the clue words that show it." },
  multi_dial: { name: "Double dial", how: "Turn both dials to the right answers." },
  sentence: { name: "Sentence lock", how: "Tap the sentence that opens it." },
  seal: { name: "Written seal", how: "Write one sentence that explains it." },
  tray: { name: "Sorting tray", how: "Put every piece in its place." },
  pinboard: { name: "Pinboard lock", how: "Pick the theory and pin the two lines that prove it." },
};
export function lockKind(q: Pick<ExpQuestion, "type" | "format" | "choices2" | "theories" | "proof" | "clues">): LockKind {
  const f = formatOf(q);
  if (q.clues?.length) return "clue_words";
  return ({ two_part: "two_key", mc: "dial", multi: "multi_dial", tap: "sentence", written: "seal", dnd: "tray", call: "pinboard" } as const)[f];
}

// ---------- Rooms ----------
export type RoomLock = { step: number; chunkId: string; chamber: 1 | 2; kind: LockKind; beat: ReturnType<typeof beatKind>; place: string | null };
export type RoomPuzzleAt = { id: string; type: RoomPuzzle["type"]; after: number; chamber: 1 | 2; innerDoor: boolean };
export type Room = {
  expedition: string; number: number; name: string; door: string | null; clockReason: string | null;
  chambers: { chamber: 1 | 2; from: number; to: number }[]; locks: RoomLock[]; puzzles: RoomPuzzleAt[];
  // innerDoor: the step it follows (the checkpoint), and the code puzzle that opens it, if the room has one.
  innerDoor: { after: number; puzzle: string | null } | null; exit: "name_liar" | "make_call" | null;
};
export const roomData = (world: Pick<WorldPack, "rooms">, expeditionId: string): RoomData | null => world.rooms?.find((r) => r.expedition === expeditionId) ?? null;
export const chamberOf = (step: number, chunks: number): 1 | 2 => (step < Math.ceil(chunks / 2) ? 1 : 2);

export function roomOf(world: WorldPack, expeditionId: string): Room | null {
  const exps = world.expeditions ?? [], number = exps.findIndex((e) => e.id === expeditionId), exp = exps[number];
  if (!exp) return null;
  const n = exp.chunks.length, arc = arcOf(world, exp), data = roomData(world, exp.id), region = world.world_map?.regions.find((r) => r.expedition === exp.id);
  const levels = levelsOf(n), chambers = levels.map((l) => ({ chamber: l.level as 1 | 2, from: l.from, to: l.to }));
  const locks: RoomLock[] = exp.chunks.map((c, step) => ({ step, chunkId: c.id, chamber: chamberOf(step, n), kind: lockKind(c.question), beat: beatKind(arc, step), place: region?.stops[step]?.place ?? null }));
  const innerAfter = chambers.length > 1 ? chambers[0].to : null;
  // A code puzzle placed right after chamber 1's last lock opens the inner door.
  const puzzles: RoomPuzzleAt[] = (data?.puzzles ?? []).map((p) => ({ id: p.id, type: p.type, after: p.after - 1, chamber: chamberOf(p.after - 1, n), innerDoor: p.type === "code" && innerAfter !== null && p.after - 1 === innerAfter }));
  const finale = exp.interview ? "name_liar" : exp.chunks.some((c) => c.question.type === "make_call") ? "make_call" : null;
  return { expedition: exp.id, number: number + 1, name: region?.name ?? exp.title, door: data?.door ?? null, clockReason: data?.clock_reason ?? null, chambers, locks, puzzles,
    innerDoor: innerAfter === null ? null : { after: innerAfter, puzzle: puzzles.find((p) => p.innerDoor)?.id ?? null }, exit: finale };
}
export const roomsOf = (world: WorldPack): Room[] => (world.expeditions ?? []).map((e) => roomOf(world, e.id)!).filter(Boolean);

// The room in the order a student meets it: the door, each lock with any puzzles after it, the inner door after
// chamber 1, the recap that opens chamber 2, the exit door and the escape.
export type RoomBeat =
  | { kind: "door"; chamber: 1 } | { kind: "lock"; step: number; chamber: 1 | 2 } | { kind: "puzzle"; id: string; chamber: 1 | 2 }
  | { kind: "inner_door"; chamber: 1; puzzle: string | null } | { kind: "recap"; chamber: 2 } | { kind: "exit"; chamber: 1 | 2 } | { kind: "escape"; chamber: 1 | 2 };
export function roomSequence(room: Room): RoomBeat[] {
  const out: RoomBeat[] = [{ kind: "door", chamber: 1 }], last = room.chambers.at(-1)!.chamber;
  for (const l of room.locks) {
    out.push({ kind: "lock", step: l.step, chamber: l.chamber });
    for (const p of room.puzzles.filter((x) => x.after === l.step && !x.innerDoor)) out.push({ kind: "puzzle", id: p.id, chamber: p.chamber });
    if (room.innerDoor && l.step === room.innerDoor.after) out.push({ kind: "inner_door", chamber: 1, puzzle: room.innerDoor.puzzle }, { kind: "recap", chamber: 2 });
  }
  if (room.exit) out.push({ kind: "exit", chamber: last });
  out.push({ kind: "escape", chamber: last });
  return out;
}

// ---------- Opening a lock ----------
// After a miss, what the student does to open the lock with the answer shown: tap the proof line, tap the clue words,
// put the shown pieces in place, pick the shown answers, or pin the shown lines.
export type Recovery = "proof_line" | "clue_words" | "pieces" | "picks" | "pinboard" | "choice";
export function recoveryTask(q: ExpQuestion): Recovery {
  const f = formatOf(q);
  if (q.clues?.length) return "clue_words";
  if (f === "dnd") return "pieces";
  if (f === "multi") return "picks";
  if (f === "call") return "pinboard";
  if (q.proof?.lines?.length || q.proof?.words?.length) return "proof_line";
  return "choice";
}
const bestIndex = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => !!x.best);
// Whether the recovery answer opens the lock (the right answer is on screen; this checks the student did it).
export function recoveryOpens(q: ExpQuestion, tokens: Token[], a: Answer) {
  switch (recoveryTask(q)) {
    case "clue_words": return cluesProve(q, tokens, a.words);
    case "pieces": return dndResult(q, a.placed).all;
    case "picks": return multiRight(q, a.picks);
    case "pinboard": { const got = [...new Set((a.lines ?? []).map(norm))]; return got.length === 2 && (q.theories ?? []).some((t) => got.every((g) => t.lines.some((l) => norm(l) === g))); }
    case "proof_line": return sentenceProves(q, tokens, a.lines);
    case "choice": return a.choice === bestIndex(q.choices);
  }
}
// The outcome of a lock: open on the first try with its points, open after a miss with 0 (recorded as a miss), or
// still shut. first: the first-try result (correct and points come from lib/expedition.ts scoreAnswer).
export type LockOutcome = { open: boolean; firstTry: boolean; points: number; missed: boolean };
export function lockOutcome(first: { correct: boolean; points: number }, recovered: boolean | null = null): LockOutcome {
  if (first.correct) return { open: true, firstTry: true, points: first.points, missed: false };
  return { open: recovered === true, firstTry: false, points: 0, missed: true };
}
// A written seal is proven by its judged strength; after a miss the student taps the shown proof line.
export const sealProven = writtenProved;

// ---------- Chambers and resume ----------
// What a student has done in a room so far (saved in expedition_results.record or the browser).
export type RoomProgress = { opened: number[]; puzzles: string[]; innerDoor: boolean; exit: boolean };
export const emptyProgress = (): RoomProgress => ({ opened: [], puzzles: [], innerDoor: false, exit: false });
const beatDone = (b: RoomBeat, p: RoomProgress) =>
  b.kind === "lock" ? p.opened.includes(b.step) : b.kind === "puzzle" ? p.puzzles.includes(b.id) : b.kind === "inner_door" ? p.innerDoor : b.kind === "exit" ? p.exit : false;
// Where a student picks the room up again: the first beat not done. A student who opened the inner door and nothing in
// chamber 2 starts on the recap; anyone who started the room skips the door (the Interview is already in their Case
// File). Locks already opened keep their first-try result.
export function resumeAt(room: Room, p: RoomProgress): RoomBeat {
  const seq = roomSequence(room), started = p.opened.length > 0 || p.puzzles.length > 0 || p.innerDoor;
  for (const b of seq) {
    if (b.kind === "door") { if (!started) return b; continue; }
    if (b.kind === "recap") { if (p.innerDoor && !seq.some((x) => x.kind === "lock" && x.chamber === 2 && p.opened.includes(x.step))) return b; continue; }
    if (b.kind === "escape") return b;
    if (!beatDone(b, p)) return b;
  }
  return seq.at(-1)!;
}
// "Stop at the inner door": on by default in a class session, so a room fills two periods; off for demo visitors and
// whenever the teacher turns it off.
export const stopsAtInnerDoor = (s: { classSession: boolean; stopAtInnerDoor?: boolean | null }) => s.stopAtInnerDoor ?? s.classSession;
// Whether a student should stop now: just through the inner door, in a session that stops there.
export const stopNow = (room: Room, p: RoomProgress, s: { classSession: boolean; stopAtInnerDoor?: boolean | null }) =>
  stopsAtInnerDoor(s) && p.innerDoor && resumeAt(room, p).kind === "recap";

// ---------- The liar ----------
// The key the liar is seeded from in a live game: the class when the game belongs to one (so every game the class plays
// in a room has the same liar), the game itself otherwise. Solo play keeps the student's own key (lib/interview.ts).
export const liveLiarKey = (classId: string | null | undefined, liveSessionId: string) => (classId ? `class:${classId}` : liveSessionId);
export const liveLiar = (classId: string | null | undefined, liveSessionId: string, expeditionId: string, witnesses = 3) => liarIndex(liveLiarKey(classId, liveSessionId), expeditionId, witnesses);

// ---------- Puzzle locks ----------
export const PUZZLE_POINTS = { dial: 150, mistake: 300, object: 150 } as const;
export const refKey = (r: LineRef) => `${r.p}:${r.s}`;
export function lineAt(passages: SourcePassage[], r: LineRef): string | null {
  const p = passages.find((x) => x.id === r.p); return p ? evidenceSentences(p.text)[r.s] ?? null : null;
}
// A line's words as the student taps them.
export const lineTokens = (line: string) => chunkTokens([{ text: line }]);
const bare = (k: string) => k.replace(/[^a-z0-9]/g, "");
const first = (k: string) => bare(k).charAt(0);

// Code lock: a dial is right when the tapped word is the answer word; its letter shows only then.
export function dialRight(dial: { word: string }, line: string, tapped: number | null | undefined) {
  const t = lineTokens(line)[tapped ?? -1]; return !!t && bare(t.key) === bare(norm(dial.word));
}
export const dialLetter = (dial: { word: string }) => first(norm(dial.word)).toUpperCase();
export const codeOf = (p: Extract<RoomPuzzle, { type: "code" }>) => p.dials.map(dialLetter).join("");
// Each dial: right on the first try (points) or not; the lock opens when every dial has its word (after a miss, the
// answer word is outlined and the student taps it).
export function codeResult(p: Extract<RoomPuzzle, { type: "code" }>, passages: SourcePassage[], taps: (number | null)[]) {
  const right = p.dials.map((d, k) => dialRight(d, lineAt(passages, d.line) ?? "", taps[k]));
  return { right, letters: right.map((r, k) => (r ? dialLetter(p.dials[k]) : null)), all: right.every(Boolean), points: right.filter(Boolean).length * PUZZLE_POINTS.dial };
}

// Fix the Painting: the student marks exactly `wrong` details, then taps a line for each. A mistake is caught when the
// detail is wrong and the line is one that disproves it. Marking a different number is not an answer yet.
export function paintingResult(p: Extract<RoomPuzzle, { type: "painting" }>, marks: string[], proofs: Record<string, LineRef | null | undefined>) {
  const picked = [...new Set(marks)];
  if (picked.length !== p.wrong) return `Mark exactly ${p.wrong} things the painter got wrong.`;
  const caught = picked.map((id) => { const d = p.details.find((x) => x.id === id), r = proofs[id]; return !!d?.wrong && !!r && d.lines.some((l) => refKey(l) === refKey(r)); });
  return { caught, all: caught.every(Boolean), points: caught.filter(Boolean).length * PUZZLE_POINTS.mistake };
}

// Inspect the Scene: the tray holds every object's line and the near misses, in each student's own order.
export function sceneTray(p: Extract<RoomPuzzle, { type: "scene" }>, seed: string): LineRef[] {
  const all = [...p.objects.map((o) => o.line), ...p.near_misses];
  return shuffledOrder(all.length, `${seed}|${p.id}`).map((i) => all[i]);
}
export function sceneResult(p: Extract<RoomPuzzle, { type: "scene" }>, matches: Record<string, LineRef | null | undefined>) {
  const right = p.objects.map((o) => { const m = matches[o.id]; return !!m && refKey(m) === refKey(o.line); });
  return { right, all: right.every(Boolean), points: right.filter(Boolean).length * PUZZLE_POINTS.object };
}

// ---------- Validation (validate:worlds) ----------
// Rooms name real expeditions, once each. Every puzzle line is a real sentence the student has already read in this
// room (chunks 1 to `after`), never in a content-noted paragraph or a sentence the story excludes from puzzles.
// Code lock: the code spells no word in the story, the answer word appears once in its line, and the line holds another
// word with the same first letter (so matching letters can't find it). Painting: exactly `wrong` details are wrong.
// Scene: one distinct line per object, near misses distinct from them, and no object's label shares a key word with its
// line (the label alone must not give the line away). No em dashes anywhere.
export function roomProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [], rooms = world.rooms ?? [];
  if (!rooms.length) return out;
  const noted = contentNotes(world), excluded = new Set((world.expedition_rules?.puzzle_exclude ?? []).map(refKey)), names = nameWords(world);
  const vocabulary = new Set(passages.flatMap((p) => p.text.toLowerCase().split(/[^a-z]+/)).filter((w) => w.length >= 3));
  const ids = new Set<string>(), seen = new Set<string>(), dash = /—/;
  for (const r of rooms) {
    const at = `room ${r.expedition}`, exp = world.expeditions?.find((e) => e.id === r.expedition);
    if (!exp) { out.push(`${at}: no expedition with that id`); continue; }
    if (seen.has(r.expedition)) out.push(`${at}: listed twice`); seen.add(r.expedition);
    if ([r.door, r.clock_reason].some((t) => t && dash.test(t))) out.push(`${at}: no em dashes`);
    const chunks = expeditionChunks(world, passages, exp.id);
    for (const p of r.puzzles ?? []) {
      const pat = `${at} puzzle ${p.id}`;
      if (ids.has(p.id)) out.push(`${pat}: puzzle ids must be unique`); ids.add(p.id);
      if (p.after > chunks.length) { out.push(`${pat}: placed after chunk ${p.after}, but the room has ${chunks.length}`); continue; }
      if ([p.title, p.prompt ?? "", ...(p.type === "code" ? p.dials.map((d) => d.question) : p.type === "painting" ? p.details.map((d) => d.label) : p.objects.map((o) => o.label))].some((t) => dash.test(t))) out.push(`${pat}: no em dashes`);
      const read = new Set(chunks.slice(0, p.after).flatMap((c) => c.lines.map((l) => `${l.pid}:${l.index}`)));
      const check = (ref: LineRef, what: string) => {
        const text = lineAt(passages, ref);
        if (!text) { out.push(`${pat}: ${what} ${refKey(ref)} is not a sentence of the story`); return null; }
        if (noted.has(ref.p)) out.push(`${pat}: ${what} ${refKey(ref)} is in a content-noted paragraph`);
        if (excluded.has(refKey(ref))) out.push(`${pat}: ${what} ${refKey(ref)} is excluded from puzzles`);
        if (!read.has(refKey(ref))) out.push(`${pat}: ${what} ${refKey(ref)} is not in chunks 1 to ${p.after} of this room`);
        return text;
      };
      if (p.type === "code") {
        const code = codeOf(p).toLowerCase();
        if (vocabulary.has(code)) out.push(`${pat}: the code ${code.toUpperCase()} spells a word`);
        p.dials.forEach((d, k) => {
          const text = check(d.line, `dial ${k + 1}`); if (!text) return;
          const keys = lineTokens(text).map((t) => bare(t.key)), w = bare(norm(d.word));
          const hits = keys.filter((x) => x === w).length;
          if (hits !== 1) out.push(`${pat}: dial ${k + 1}'s word "${d.word}" appears ${hits} times in its line (exactly once)`);
          if (!keys.some((x) => x !== w && x.charAt(0) === w.charAt(0))) out.push(`${pat}: dial ${k + 1}'s line has no other word starting with "${w.charAt(0)}", so the letter alone could find it`);
        });
      } else if (p.type === "painting") {
        const wrong = p.details.filter((d) => d.wrong).length;
        if (wrong !== p.wrong) out.push(`${pat}: ${wrong} details are marked wrong; the puzzle says ${p.wrong}`);
        if (wrong >= p.details.length) out.push(`${pat}: some details must be right`);
        if (new Set(p.details.map((d) => d.id)).size !== p.details.length) out.push(`${pat}: detail ids repeat`);
        p.details.forEach((d) => d.lines.forEach((l) => check(l, `detail ${d.id}`)));
      } else {
        if (new Set(p.objects.map((o) => o.id)).size !== p.objects.length) out.push(`${pat}: object ids repeat`);
        const keys = [...p.objects.map((o) => refKey(o.line)), ...p.near_misses.map(refKey)];
        if (new Set(keys).size !== keys.length) out.push(`${pat}: every line in the tray must be a different sentence`);
        for (const o of p.objects) {
          const text = check(o.line, `object ${o.id}`); if (!text) continue;
          const shared = sharedRoots(o.label, [text], names);
          if (shared.length) out.push(`${pat}: object ${o.id}'s label shares words with its line (${shared.join(", ")}); describe what it looks like instead`);
        }
        p.near_misses.forEach((l, k) => check(l, `near miss ${k + 1}`));
      }
    }
  }
  return out;
}
