// Escape rooms, phase 4: Request a clue. Three tiers per lock, points only (never time); mastery counts a proof with no
// clue or tier 1; tier 2 or 3 counts as not yet. Solo and live charge the same.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { chunkTokens, expeditionChunks, proofLineIndexes } from "../lib/expedition.ts";
import { CLUE_COST, afterClues, clueCost, cluesAllowMastery, cluesFor } from "../lib/clues.ts";
import { evidenceFrom } from "../lib/mastery.ts";
import { liveClueTier, parseExpSettings, playerChunk, raceAnswer, type LiveRaceRound } from "../lib/live/race.ts";
import { rightAnswerFor } from "./answers.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const passages = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const e1 = world.expeditions![0], chunks = expeditionChunks(world, passages, e1.id);

test("costs: 100, then 150, then 200, off the lock's points only; a miss stays at 0", () => {
  assert.deepEqual([0, 1, 2, 3].map((t) => clueCost(t as 0)), [0, 100, 250, 450]);
  assert.equal(afterClues(700, 2), 450); assert.equal(afterClues(300, 3), 0); assert.equal(afterClues(0, 1), 0);
  assert.equal(CLUE_COST[1], 100);
});

test("tiers: the hint, then two sentences holding the proof, then the proof sentence with wrong choices crossed out", () => {
  for (const c of chunks) {
    const q = c.chunk.question, t = chunkTokens(c.lines), [one, two, three] = cluesFor(q, t, c.index), proof = proofLineIndexes(q, t);
    assert.equal(one.text, q.hint);
    if (proof.length) {
      assert.ok(two.lines.includes(proof[0]), `${c.chunk.id} tier 2 holds the proof`); assert.ok(two.lines.length <= 2);
      assert.deepEqual(three.lines, [proof[0]]);
    }
    // Never the right answer crossed out, and always at least one wrong one left to choose from.
    const best = (q.choices ?? []).flatMap((o, i) => (o.best ? [i] : [])), wrong = (q.choices ?? []).length - best.length;
    assert.ok(three.strike.every((i) => !best.includes(i)), c.chunk.id);
    if (wrong) assert.ok(three.strike.length < wrong, c.chunk.id);
  }
});

test("mastery: tier 2 or 3 turns a proved lock into not yet; tier 1 still counts", () => {
  assert.equal(cluesAllowMastery(0), true); assert.equal(cluesAllowMastery(1), true); assert.equal(cluesAllowMastery(2), false); assert.equal(cluesAllowMastery(3), false);
  const note = (clue: number) => ({ chunk: 1, type: "x", question: "q", answer: "a", proof: "p", rightFirstTry: true, fixed: null, gistPick: null, gistRight: false, typedQuestion: null, unknownWords: [], correctProof: "p", standards: ["R.1.1"], note: "", clue });
  const ev = (clue: number) => evidenceFrom([{ attemptId: "a", worldId: "sleepy-hollow", expeditionId: e1.id, startedAt: "2026-11-14", finishedAt: null, complete: true, score: 0, notes: [note(clue)], interview: null, award: null } as never]);
  assert.equal(ev(1)[0].right, true); assert.equal(ev(2)[0].right, false); assert.equal(ev(3)[0].right, false);
});

test("live: a phone asks for clues one tier at a time while the lock is open, and the shot is charged for them", () => {
  const round: LiveRaceRound = { type: "race", settings: parseExpSettings({ expeditionId: e1.id }, world)!, step: 1, beat: "race", beatStartedAt: new Date().toISOString(), squadsOn: false, interview: null };
  const w1 = structuredClone(world); w1.expeditions![0].chunks[1].bank = []; const ch1 = expeditionChunks(w1, passages, e1.id);
  const rs: never[] = [];
  const ask = (rows: unknown[]) => raceAnswer(round, ch1, rows as never, 0, "p1", "race_clue", {}, Date.now(), "1", null);
  const row = (payload: Record<string, unknown>, kind = "race_clue") => ({ id: Math.random().toString(36), roundIndex: 0, squadId: null, playerId: "p1", role: null, kind, payload, flagged: false, createdAt: "" });
  const c1 = ask(rs) as { payload: { tier: number } }; assert.equal(c1.payload.tier, 1);
  const rows = [row(c1.payload), row({ step: 1, tier: 2 }), row({ step: 1, tier: 3 })];
  assert.match(String(ask(rows)), /every clue/);
  assert.equal(playerChunk(rows as never, 0, 1, "p1").clue, 3);
  // The shot after tier 2: the points less 250, the same as solo.
  const q = ch1[1].chunk.question, right = rightAnswerFor(q, ch1[1]);
  const base = raceAnswer(round, ch1, [] as never, 0, "p1", "race_tap", { answer: right }, Date.now(), "1", null) as { payload: { points: number } };
  const two = raceAnswer(round, ch1, rows.slice(0, 2) as never, 0, "p1", "race_tap", { answer: right }, Date.now(), "1", null) as { payload: { points: number; clue: number } };
  assert.equal(two.payload.clue, 2); assert.equal(two.payload.points, Math.max(0, base.payload.points - 250));
  assert.match(String(raceAnswer({ ...round, beat: "reveal" }, ch1, [] as never, 0, "p1", "race_clue", {}, Date.now(), "1", null)), /isn't open/);
  assert.equal(liveClueTier(0, true), 1);
});

test("screens: Request a clue on the lock (solo and phones), points only, saved with each note and in the CSV", () => {
  const race = readFileSync("app/expedition-race.tsx", "utf8"), live = readFileSync("app/live/race-live.tsx", "utf8");
  assert.match(race, /Request a clue/); assert.match(race, /Your time isn't touched/); assert.match(race, /clue=\{clueState\}/);
  assert.match(live, /act\("race_clue"\)/);
  assert.match(readFileSync("app/api/student/expeditions/route.ts", "utf8"), /clue: z\.number\(\)\.int\(\)\.min\(0\)\.max\(3\)/);
  assert.match(readFileSync("app/api/live/sessions/[id]/act/route.ts", "utf8"), /"race_clue"/);
  assert.match(readFileSync("lib/classroom/evidence.ts", "utf8"), /"Clue"/);
});

test("live server: the phone's clues come from the real question (its proof), not the stripped copy phones see", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "CLUE04", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  const pid = (await server.join(store, s, { nickname: "Ana Ruiz", studentId: null })).player!.id;
  let st = (await server.loadState(store, s.id))!;
  const reload = async () => { st = (await server.loadState(store, s.id))!; };
  await server.hostAct(store, st, { action: "round.start", type: "race", settings: { expeditionId: e1.id, chamber: 1 } } as never); await reload();
  for (let k = 0; k < 6 && (server.hostView(st).round as { beat: string }).beat !== "race"; k++) { await server.hostAct(store, st, { action: "race.next" } as never); await reload(); }
  assert.equal((server.hostView(st).round as { beat: string }).beat, "race");
  assert.equal(await server.playerAct(store, st, pid, { kind: "race_clue" as never, payload: {} }, { judgeAllowed: async () => false, timeSetting: "1" as never }), null); await reload();
  assert.equal(await server.playerAct(store, st, pid, { kind: "race_clue" as never, payload: {} }, { judgeAllowed: async () => false, timeSetting: "1" as never }), null); await reload();
  const clues = (server.playerView(st, pid).race as unknown as { myClues: { tier: number; list: { tier: number; text: string }[] } }).myClues;
  assert.equal(clues.tier, 2); assert.match(clues.list[1].text, /^The proof is/); assert.equal(clues.list[2].text, "", "tier 3 stays on the server until asked for");
});
