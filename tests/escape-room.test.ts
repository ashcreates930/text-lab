// Escape room, phase 0: rooms from expeditions (chambers, locks, the inner door, the exit), proof as the key (a lock
// opens after a miss only with the shown proof tapped, for 0), chambers and resume, the class-seeded liar (never a win
// without the proof line, solo or live), and the three puzzle locks with their validator rules.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type RoomData, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { chunkTokens, expeditionChunks, proofLineIndexes } from "../lib/expedition.ts";
import { LIAR_POINTS, liarCheck, liarIndex } from "../lib/interview.ts";
import { parseExpSettings, raceAnswer, type LiveRaceRound } from "../lib/live/race.ts";
import {
  PUZZLE_POINTS, codeOf, codeResult, dialRight, emptyProgress, lineAt, lineTokens, liveLiar, liveLiarKey, lockKind, lockOutcome, paintingResult,
  recoveryOpens, recoveryTask, resumeAt, roomOf, roomProblems, roomSequence, roomsOf, sceneResult, sceneTray, stopNow, stopsAtInnerDoor,
} from "../lib/escape-room.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
const e1 = sh.expeditions![0], chunks = expeditionChunks(sh, shp, e1.id), iv = e1.interview!;

// The Expedition 1 puzzles from the approved plan (content for review arrives in phase 2; here they test the rules).
const E1_ROOM: RoomData = {
  expedition: e1.id,
  door: "The Glen. A spell holds everyone who stays here. Prove what the story says, and the way out opens.",
  puzzles: [
    { type: "painting", id: "glen-at-noon", after: 3, title: "The glen at noon", alt: "A painting of a quiet valley among hills", wrong: 2, details: [
      { id: "walnut", label: "Tall walnut trees shade one side", x: 20, y: 40, lines: [{ p: "p004", s: 0 }] },
      { id: "woodpecker", label: "A woodpecker on a branch", x: 30, y: 30, lines: [{ p: "p003", s: 4 }] },
      { id: "hills", label: "High hills all around", x: 50, y: 10, lines: [{ p: "p003", s: 3 }] },
      { id: "waterfall", label: "A roaring waterfall", x: 70, y: 50, wrong: true, lines: [{ p: "p003", s: 4 }] },
      { id: "market", label: "A busy market road through the valley", x: 60, y: 80, wrong: true, lines: [{ p: "p003", s: 3 }] },
    ] },
    { type: "code", id: "glen-gate", after: 5, title: "The gate out of the glen", dials: [
      { question: "Who named the town?", line: { p: "p003", s: 1 }, word: "housewives" },
      { question: "How many miles away is the valley?", line: { p: "p003", s: 3 }, word: "two" },
      { question: "What sound startled him?", line: { p: "p004", s: 1 }, word: "roar" },
      { question: "What does the witching power hold over people's minds?", line: { p: "p005", s: 3 }, word: "spell" },
    ] },
    { type: "scene", id: "churchyard-at-dusk", after: 10, title: "The churchyard at dusk", alt: "A churchyard at dusk beside a stream", objects: [
      { id: "shot", label: "A rusted iron shot half-buried in the grass", x: 30, y: 80, line: { p: "p006", s: 1 } },
      { id: "grave", label: "A fresh grave beside the steeple", x: 55, y: 60, line: { p: "p006", s: 3 } },
      { id: "streak", label: "A streak of light across the night sky", x: 70, y: 10, line: { p: "p005", s: 5 } },
      { id: "pool", label: "A glassy pool beside a fast creek, a twig drifting in it", x: 15, y: 50, line: { p: "p009", s: 1 } },
    ], near_misses: [{ p: "p005", s: 1 }, { p: "p006", s: 2 }] },
  ],
};
const withRoom = (room: RoomData, base: WorldPack = sh): WorldPack => ({ ...base, rooms: [room] });
const world = withRoom(E1_ROOM);
const puzzle = <T extends "code" | "painting" | "scene">(type: T) => E1_ROOM.puzzles!.find((p) => p.type === type) as Extract<NonNullable<RoomData["puzzles"]>[number], { type: T }>;
const edit = (f: (r: RoomData) => void) => { const r = structuredClone(E1_ROOM); f(r); return withRoom(r); };

test("rooms: every expedition is a room of two chambers, its chunks are locks, the inner door at the checkpoint, Name the Liar the exit", () => {
  const rooms = roomsOf(sh);
  assert.equal(rooms.length, sh.expeditions!.length);
  const r = roomOf(sh, e1.id)!;
  assert.equal(r.name, "Tarry Town and the glen", "named from its map region");
  assert.deepEqual(r.chambers, [{ chamber: 1, from: 0, to: 4 }, { chamber: 2, from: 5, to: 9 }]);
  assert.equal(r.locks.length, 10);
  assert.deepEqual(r.locks.map((l) => l.chamber), [1, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
  assert.deepEqual(r.innerDoor, { after: 4, puzzle: null }, "no code lock yet: the inner door is the checkpoint");
  assert.equal(r.exit, "name_liar");
  // Lock kinds follow the question formats (E1: two-part, tap, drag and drop, choose two, written).
  assert.equal(r.locks[1].kind, "sentence"); assert.equal(r.locks[4].kind, "tray"); assert.equal(r.locks[5].kind, "multi_dial"); assert.equal(r.locks[8].kind, "seal");
  assert.equal(r.locks[6].beat, "twist"); assert.equal(r.locks[8].beat, "boss");
  assert.equal(r.locks[6].place, "church", "each lock sits at its map stop");
  // The last room (7 chunks) still splits into two chambers.
  const last = rooms.at(-1)!; assert.equal(last.locks.length, 7); assert.deepEqual(last.chambers.map((c) => [c.from, c.to]), [[0, 3], [4, 6]]);
  // A clue-word question is a clue-word lock.
  assert.equal(lockKind({ type: "word_detective", clues: ["dreamy"] }), "clue_words");
});

test("the room in order: door, locks with their puzzles, the code lock as the inner door, the recap, the exit, the escape", () => {
  const r = roomOf(world, e1.id)!, seq = roomSequence(r);
  assert.deepEqual(r.innerDoor, { after: 4, puzzle: "glen-gate" });
  const names = seq.map((b) => (b.kind === "lock" ? `L${b.step + 1}` : b.kind === "puzzle" ? b.id : b.kind));
  assert.deepEqual(names, ["door", "L1", "L2", "L3", "glen-at-noon", "L4", "L5", "inner_door", "recap", "L6", "L7", "L8", "L9", "L10", "churchyard-at-dusk", "exit", "escape"]);
  assert.equal(r.door, E1_ROOM.door);
});

test("proof is the key: first try scores; after a miss the lock opens only on the shown proof, for 0, recorded as a miss", () => {
  // Chunk 2: a sentence lock (tap the sentence).
  const q = e1.chunks[1].question, t = chunkTokens(chunks[1].lines), lines = chunks[1].lines.map((l) => l.text);
  const proof = lines[proofLineIndexes(q, t)[0]], other = lines.find((l) => l !== proof)!;
  assert.equal(recoveryTask(q), "proof_line");
  assert.deepEqual(lockOutcome({ correct: true, points: 912 }), { open: true, firstTry: true, points: 912, missed: false });
  assert.deepEqual(lockOutcome({ correct: false, points: 0 }), { open: false, firstTry: false, points: 0, missed: true }, "a miss alone never opens it");
  assert.equal(recoveryOpens(q, t, { lines: [other] }), false, "the wrong line keeps it shut");
  assert.equal(recoveryOpens(q, t, { lines: [proof] }), true);
  assert.deepEqual(lockOutcome({ correct: false, points: 0 }, recoveryOpens(q, t, { lines: [proof] })), { open: true, firstTry: false, points: 0, missed: true });
  // Drag and drop: the shown pieces must all be put in place.
  const dq = e1.chunks[4].question;
  assert.equal(recoveryTask(dq), "pieces");
  const placed = Object.fromEntries(dq.dnd!.items.map((i) => [i.id, i.slot ?? null]));
  assert.equal(recoveryOpens(dq, chunkTokens(chunks[4].lines), { placed }), true);
  assert.equal(recoveryOpens(dq, chunkTokens(chunks[4].lines), { placed: {} }), false);
  // Choose two: the shown picks.
  const mq = e1.chunks[5].question, picks = mq.choices!.flatMap((c, i) => (c.best ? [i] : []));
  assert.equal(recoveryTask(mq), "picks"); assert.equal(recoveryOpens(mq, [], { picks }), true); assert.equal(recoveryOpens(mq, [], { picks: [0] }), false);
});

test("chambers and resume: progress saves at the inner door; a student picks up at the recap or the next unopened lock", () => {
  const r = roomOf(world, e1.id)!;
  assert.deepEqual(resumeAt(r, emptyProgress()), { kind: "door", chamber: 1 });
  assert.deepEqual(resumeAt(r, { ...emptyProgress(), opened: [0, 1] }), { kind: "lock", step: 2, chamber: 1 }, "mid-chamber: the next unopened lock, past the door");
  assert.deepEqual(resumeAt(r, { ...emptyProgress(), opened: [0, 1, 2] }), { kind: "puzzle", id: "glen-at-noon", chamber: 1 });
  const ch1 = { opened: [0, 1, 2, 3, 4], puzzles: ["glen-at-noon"], innerDoor: false, exit: false };
  assert.deepEqual(resumeAt(r, ch1), { kind: "inner_door", chamber: 1, puzzle: "glen-gate" });
  const through = { ...ch1, puzzles: [...ch1.puzzles, "glen-gate"], innerDoor: true };
  assert.deepEqual(resumeAt(r, through), { kind: "recap", chamber: 2 }, "chamber 2 opens on the Case File recap");
  assert.deepEqual(resumeAt(r, { ...through, opened: [...through.opened, 5] }), { kind: "lock", step: 6, chamber: 2 }, "no recap once chamber 2 has begun");
  assert.deepEqual(resumeAt(r, { opened: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], puzzles: ["glen-at-noon", "glen-gate", "churchyard-at-dusk"], innerDoor: true, exit: false }), { kind: "exit", chamber: 2 });
  // "Stop at the inner door": on by default in class, off for the demo, and the teacher's choice wins.
  assert.equal(stopsAtInnerDoor({ classSession: true }), true); assert.equal(stopsAtInnerDoor({ classSession: false }), false);
  assert.equal(stopsAtInnerDoor({ classSession: true, stopAtInnerDoor: false }), false);
  assert.equal(stopNow(r, through, { classSession: true }), true); assert.equal(stopNow(r, through, { classSession: false }), false); assert.equal(stopNow(r, ch1, { classSession: true }), false);
});

test("the liar: seeded by class in a class's live games (the same across days), by the game otherwise", () => {
  assert.equal(liveLiarKey("class-7b", "game-mon"), "class:class-7b"); assert.equal(liveLiarKey(null, "game-mon"), "game-mon");
  for (const cls of ["c1", "c2", "c3", "c4", "c5"]) assert.equal(liveLiar(cls, "game-monday", e1.id), liveLiar(cls, "game-tuesday", e1.id), "Monday's liar is Tuesday's");
  const seen = new Set(Array.from({ length: 40 }, (_, k) => liveLiar(`class-${k}`, "g", e1.id))); assert.equal(seen.size, 3, "classes meet different liars");
});

test("naming the liar never scores without the line that disproves the lie: solo, live, and a class-seeded live game", () => {
  const liar = liarIndex("class:7b", e1.id), w = iv.witnesses[liar], truthful = iv.witnesses[(liar + 1) % 3];
  const someLine = chunks[0].lines[0].text;
  // Solo.
  assert.deepEqual(liarCheck(iv, liar, { liar: w.character, line: null }), { named: true, line: false, solved: false, points: 0 });
  assert.equal(liarCheck(iv, liar, { liar: w.character, line: someLine }).points, 0);
  assert.equal(liarCheck(iv, liar, { liar: w.character, line: truthful.truth.lines[0] }).points, 0, "a true witness's line doesn't disprove the lie");
  assert.equal(liarCheck(iv, liar, { liar: truthful.character, line: w.lie.lines[0] }).points, 0, "the right line with the wrong liar");
  assert.equal(liarCheck(iv, liar, { liar: w.character, line: w.lie.lines[0] }).points, LIAR_POINTS);
  // Live: the private lock-in, in a game whose liar is seeded by the class.
  const now = Date.parse("2026-11-13T15:00:00Z");
  const round: LiveRaceRound = { type: "race", settings: parseExpSettings({ expeditionId: e1.id }, sh)!, step: chunks.length - 1, beat: "liar", beatStartedAt: new Date(now - 5000).toISOString(), squadsOn: false,
    interview: { liar: liveLiar("7b", "game-tuesday", e1.id), witnesses: 3 } };
  assert.equal(round.interview!.liar, liar);
  const lock = (payload: Record<string, unknown>) => raceAnswer(round, chunks, [], 0, "p1", "liar_lock", payload, now, "1", iv);
  assert.match(String(lock({ liar: w.character })), /Tap the line/, "no line: not accepted at all");
  const wrong = lock({ liar: w.character, line: someLine }) as { payload: Record<string, unknown> };
  assert.equal(wrong.payload.points, 0); assert.equal(wrong.payload.solved, false); assert.equal(wrong.payload.named, true);
  const right = lock({ liar: w.character, line: w.lie.lines[0] }) as { payload: Record<string, unknown> };
  assert.equal(right.payload.points, LIAR_POINTS); assert.equal(right.payload.solved, true);
});

test("code lock: tap the word that answers; the letter shows only when right; same-letter words don't open it", () => {
  const p = puzzle("code"), d1 = p.dials[0], line = lineAt(shp, d1.line)!, tokens = lineTokens(line);
  assert.equal(codeOf(p), "HTRS");
  const at = (w: string) => tokens.findIndex((t) => t.key.replace(/[^a-z]/g, "") === w);
  assert.equal(dialRight(d1, line, at("housewives")), true);
  assert.equal(dialRight(d1, line, at("husbands")), false, "the same first letter is not the answer");
  const taps = p.dials.map((d) => lineTokens(lineAt(shp, d.line)!).findIndex((t) => t.key.replace(/[^a-z]/g, "") === d.word));
  assert.deepEqual(codeResult(p, shp, taps), { right: [true, true, true, true], letters: ["H", "T", "R", "S"], all: true, points: 4 * PUZZLE_POINTS.dial });
  const missed = codeResult(p, shp, [at("husbands"), ...taps.slice(1)]);
  assert.deepEqual(missed.letters, [null, "T", "R", "S"]); assert.equal(missed.all, false); assert.equal(missed.points, 3 * PUZZLE_POINTS.dial);
});

test("Fix the Painting: mark exactly two, and each mistake needs the line that disproves it", () => {
  const p = puzzle("painting"), brook = { p: "p003", s: 4 }, quiet = { p: "p003", s: 3 };
  assert.match(String(paintingResult(p, ["waterfall"], {})), /exactly 2/);
  assert.match(String(paintingResult(p, ["waterfall", "market", "hills"], {})), /exactly 2/, "marking everything isn't allowed");
  assert.deepEqual(paintingResult(p, ["waterfall", "market"], { waterfall: brook, market: quiet }), { caught: [true, true], all: true, points: 2 * PUZZLE_POINTS.mistake });
  assert.deepEqual(paintingResult(p, ["waterfall", "market"], { waterfall: quiet, market: quiet }), { caught: [false, true], all: false, points: PUZZLE_POINTS.mistake }, "the wrong line doesn't catch it");
  assert.deepEqual(paintingResult(p, ["waterfall", "hills"], { waterfall: brook, hills: quiet }), { caught: [true, false], all: false, points: PUZZLE_POINTS.mistake }, "a right detail isn't a mistake");
});

test("Inspect the Scene: each object to its own line; the tray adds near misses in each student's own order", () => {
  const p = puzzle("scene");
  const tray = sceneTray(p, "ana"); assert.equal(tray.length, 6);
  assert.deepEqual(sceneTray(p, "ana"), tray, "stable for the same student");
  assert.ok(new Set(["ana", "ben", "cy", "dee", "eli"].map((s) => JSON.stringify(sceneTray(p, s)))).size > 1, "different across students");
  const right = Object.fromEntries(p.objects.map((o) => [o.id, o.line]));
  assert.deepEqual(sceneResult(p, right), { right: [true, true, true, true], all: true, points: 4 * PUZZLE_POINTS.object });
  assert.equal(sceneResult(p, { ...right, grave: p.near_misses[1] }).all, false, "the church line is a near miss for the grave");
});

test("validate:worlds: the plan's E1 puzzles pass, and every puzzle rule catches its fault", () => {
  assert.deepEqual(roomProblems(world, shp), []);
  assert.deepEqual(roomProblems(sh, shp), [], "the live world has no rooms yet");
  const probs = (f: (r: RoomData) => void) => roomProblems(edit(f), shp).join("\n");
  // Code lock.
  assert.match(probs((r) => { (r.puzzles![1] as { dials: { word: string; line: { p: string; s: number } }[] }).dials[2] = { ...(r.puzzles![1] as { dials: { question: string }[] }).dials[2], line: { p: "p004", s: 1 }, word: "my" } as never; }), /appears 2 times|no other word starting/);
  assert.match(probs((r) => { const c = r.puzzles![1] as { dials: { question: string; line: { p: string; s: number }; word: string }[] }; c.dials = [c.dials[1], c.dials[0], { question: "q", line: { p: "p004", s: 1 }, word: "echoes" }]; }), /code THE spells a word/, "T-H-E spells a word in the story");
  assert.match(probs((r) => { (r.puzzles![1] as { dials: { question: string; line: { p: string; s: number }; word: string }[] }).dials[0] = { question: "q", line: { p: "p005", s: 1 }, word: "pervade" }; }), /no other word starting with "p"/, "no other P word in the line: the letter alone would find it");
  assert.match(probs((r) => { (r.puzzles![1] as { dials: { question: string; line: { p: string; s: number }; word: string }[] }).dials[0] = { question: "Who?", line: { p: "p005", s: 2 }, word: "doctor" }; }), /excluded from puzzles/, "the powwow sentence is never used");
  assert.match(probs((r) => { r.puzzles![1].after = 2; }), /not in chunks 1 to 2/, "a dial can't use a line the student hasn't read yet");
  // Content-noted paragraphs: no puzzle may use one.
  const noted = structuredClone(sh); noted.storybook!.ai_exclude = [...(noted.storybook!.ai_exclude ?? []), "p003"];
  noted.storybook!.pages.find((pg) => Number(pg.start.slice(1)) <= 3 && 3 <= Number(pg.end.slice(1)))!.content_note = "A note.";
  assert.match(roomProblems(withRoom(E1_ROOM, noted), shp).join("\n"), /p003:1 is in a content-noted paragraph/);
  // Painting.
  assert.match(probs((r) => { (r.puzzles![0] as { details: { wrong?: boolean }[] }).details[0].wrong = true; }), /3 details are marked wrong; the puzzle says 2/);
  // Scene.
  assert.match(probs((r) => { (r.puzzles![2] as { objects: { label: string }[] }).objects[0].label = "A rusted cannon-ball in the grass"; }), /shares words with its line/, "the label alone must not give the line away");
  assert.match(probs((r) => { (r.puzzles![2] as { near_misses: { p: string; s: number }[] }).near_misses[0] = { p: "p006", s: 1 }; }), /different sentence/);
  assert.match(probs((r) => { r.door = "The Glen — a spell"; }), /no em dashes/);
  assert.match(roomProblems({ ...sh, rooms: [{ expedition: "nowhere" }] }, shp).join("\n"), /no expedition/);
});
