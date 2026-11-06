// World map, phase 2: pacing and rhythm. Levels and the checkpoint, the arc (warm-up, twist, boss, burst, finale),
// lightning beats, the leaderboard cadence, surprises (a double stop, the streak bonus), adaptive versions, no dead time
// in live games, and the validator.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { chunkTokens, expeditionChunks, proofLineIndexes, type Answer } from "../lib/expedition.ts";
import { DOUBLE, LIGHTNING_POINTS, STREAK_BONUS, arcOf, arcProblems, beatKind, isCheckpoint, levelOf, levelsOf, multiplierAt, questionAt, streakBonus, versionFor } from "../lib/pacing.ts";
import { caseNotes } from "../lib/case-notes.ts";
import { expeditionProblems } from "../lib/expedition-check.ts";
import { rightAnswerFor, wrongAnswerFor } from "./answers.ts";
import { playerAsked } from "../lib/live/race.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
const e1 = sh.expeditions![0], chunks = expeditionChunks(sh, shp, e1.id);
// The right answer for a chunk: the best choice(s) and the proof sentence.
function right(k: number): Answer {
  const q = e1.chunks[k].question, best = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => x.best), t = chunkTokens(chunks[k].lines);
  const line = chunks[k].lines[proofLineIndexes(q, t)[0]]?.text;
  return { ...(q.choices ? { choice: best(q.choices) } : {}), ...(q.choices2 ? { choice2: best(q.choices2.options) } : {}), ...(line && q.type !== "figure_it_out" ? { lines: [line] } : {}) };
}

test("levels: two levels of about 5 chunks, with the checkpoint after level 1", () => {
  assert.deepEqual(levelsOf(10), [{ level: 1, from: 0, to: 4 }, { level: 2, from: 5, to: 9 }]);
  assert.deepEqual(levelsOf(7), [{ level: 1, from: 0, to: 3 }, { level: 2, from: 4, to: 6 }]);
  assert.equal(isCheckpoint(4, 10), true); assert.equal(isCheckpoint(3, 10), false); assert.equal(isCheckpoint(9, 10), false, "the finale is the podium, not a checkpoint");
  assert.equal(isCheckpoint(3, 7), true); assert.equal(levelOf(4, 10), 1); assert.equal(levelOf(5, 10), 2);
});

test("the arc: warm-ups first, the twist mid-expedition, the boss in level 2 at its landmark, a surprise double in level 1, the burst after the checkpoint", () => {
  const a = arcOf(sh, e1);
  assert.deepEqual(a.warmup, [0, 1]); assert.equal(a.twist, 6, "Catch the Lie is the twist (a witness interrupts)");
  assert.equal(e1.chunks[a.twist!].question.type, "catch_lie");
  assert.equal(a.boss, 8); assert.equal(sh.world_map!.regions[0].stops[8].landmark, "boss", "the boss stands at the map's landmark");
  assert.ok(a.double !== null && a.double >= 2 && a.double <= 4, `the surprise double is in level 1 after the warm-ups (${a.double})`);
  assert.equal(arcOf(sh, e1).double, a.double, "seeded: the same every time");
  assert.equal(a.burstAfter, 4);
  assert.deepEqual(a.lightning.map((l) => [l.item.id, l.after]), [["walk", 3], ["wounded", 7]]);
  // Double points at the boss and the surprise, never more than double.
  assert.equal(multiplierAt(a, a.boss!), DOUBLE); assert.equal(multiplierAt(a, a.double!), DOUBLE); assert.equal(multiplierAt(a, 0), 1);
  assert.equal(beatKind(a, 6), "twist"); assert.equal(beatKind(a, 8), "boss"); assert.equal(beatKind(a, 0), "warmup");
  // Expeditions vary: the arc isn't the same order everywhere.
  const shapes = new Set(sh.expeditions!.map((e) => { const x = arcOf(sh, e); return `${x.twist}-${x.boss}`; }));
  assert.ok(shapes.size >= 5, `${shapes.size} different arcs`);
});

test("surprises: the streak bonus appears at 3 and 6 first-try answers in a row, never otherwise", () => {
  assert.equal(streakBonus(2, 3), STREAK_BONUS); assert.equal(streakBonus(5, 6), STREAK_BONUS);
  for (const [a, b] of [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [3, 0], [2, 0]]) assert.equal(streakBonus(a, b), 0, `${a} to ${b}`);
});

test("adaptive challenge: start standard, up after two first-try answers in a row, down after two misses in a row", () => {
  assert.equal(versionFor([]), "standard"); assert.equal(versionFor([true]), "standard"); assert.equal(versionFor([false]), "standard");
  assert.equal(versionFor([true, true]), "harder"); assert.equal(versionFor([true, true, true, true]), "harder", "never past harder");
  assert.equal(versionFor([false, false]), "easier"); assert.equal(versionFor([false, false, false, false]), "easier");
  assert.equal(versionFor([true, true, false, false]), "standard", "back down a step");
  assert.equal(versionFor([true, false, true, false, true]), "standard", "no step without two in a row");
  assert.equal(versionFor([false, false, true, true]), "standard");
  // The version a student sees: written out, or derived (harder: no highlighted key words; tests/formats.test.ts).
  const q = e1.chunks[0].question, harder = { ...q, prompt: "A harder prompt?" };
  assert.equal(questionAt(q, "harder").version, "harder"); assert.deepEqual(questionAt(q, "harder").question.keywords, []);
  assert.equal(questionAt({ ...q, versions: { harder } }, "harder").question.prompt, "A harder prompt?");
  assert.equal(questionAt({ ...q, versions: { harder } }, "harder").version, "harder");
  // The version is recorded in Case Notes, with the question the student was asked.
  const notes = caseNotes(chunks, [{ index: 0, answer: right(0), correct: true, late: false, gist: null, typed: null, unknown: [], version: "harder" }]);
  assert.equal(notes[0].version, "harder");
  const withV = structuredClone(chunks); withV[0].chunk.question = questionAt({ ...q, versions: { harder } }, "harder").question;
  assert.equal(caseNotes(withV, [{ index: 0, answer: right(0), correct: true, late: false, gist: null, typed: null, unknown: [], version: "harder" }])[0].question, "A harder prompt?");
});

test("validator: the arc on expeditions built to it, lightning answers in the chunk they recall", () => {
  assert.deepEqual(arcProblems(sh), []);
  assert.deepEqual(sh.expedition_rules?.arc_pending?.length, 12, "expeditions 3 to 14 wait for their rebuild");
  const bad = structuredClone(sh); bad.expedition_rules = { ...bad.expedition_rules, arc_pending: [] };
  const p = arcProblems(bad).join(" | ");
  assert.match(p, /the-invitation: the twist is chunk 2, not mid-expedition/); assert.match(p, /a-rival-appears: chunk 1 is between_lines, not a warm-up type/);
  assert.match(p, /tales-by-the-fire: 0 lightning beats/);
  const early = structuredClone(sh); early.expeditions![0].lightning![1].after = 7;
  assert.match(arcProblems(early).join(" | "), /recalls chunk 7 too soon|follows the twist/);
  const wrong = structuredClone(sh); wrong.expeditions![0].lightning![0].answer = ["Not a sentence of that chunk."];
  assert.match(expeditionProblems(wrong, shp).join(" | "), /lightning walk: "Not a sentence of that chunk\." isn't a sentence of chunk 2/);
});

test("live: answer, rank pill, no board until the checkpoint; a lightning beat; the checkpoint board and squad burst; double points and the streak bonus", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "PACE01", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  const ids: string[] = []; for (const n of ["Ana Ruiz", "Ben Cole", "Cy Park", "Di Lee"]) { const r = await server.join(store, s, { nickname: n, studentId: null }); ids.push(r.player!.id); }
  let st = (await server.loadState(store, s.id))!;
  const act = async (pid: string, kind: string, payload: Record<string, unknown> = {}) => { st = (await server.loadState(store, s.id))!; const e = await server.playerAct(store, st, pid, { kind: kind as never, payload }, { judgeAllowed: async () => false, timeSetting: "1" as never }); st = (await server.loadState(store, s.id))!; return e; };
  const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
  type Pub = { beat: string; step: number; beatMs: number | null; board: unknown; arc: string | null; double: boolean; checkpoint: boolean; lightning: { question: string } | null; burst: { chunks: unknown[] } | null };
  const pub = () => server.hostView(st).round as unknown as Pub;
  const view = (pid: string) => server.playerView(st, pid).race!;
  // Two squads of two, so the burst counts a find once per squad.
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: e1.id, gradeBand: "6-8", questions: false } }), null);
  for (let k = 0; k < 8 && pub().beat !== "read"; k++) await host({ action: "race.next" });
  // Play one chunk: everyone reads and picks the best summary; Ana and Ben answer right, Cy and Di miss.
  const best = (k: number) => e1.chunks[k].gist.options.findIndex((o) => o.best);
  async function play(k: number, rightOnes: number[]) {
    assert.equal(pub().step, k);
    for (const p of ids) await act(p, "race_ready");
    // The Gist check about every third chunk (1, 4, 7, 10); otherwise straight to the question.
    await host({ action: "race.next" }); assert.equal(pub().beat, k % 3 === 0 ? "process" : "race");
    if (k % 3 === 0) { for (const p of ids) await act(p, "race_gist", { choice: best(k) }); await host({ action: "race.next" }); assert.equal(pub().beat, "race"); }
    // Each player answers the question the server asked them (their bank pick at their version).
    for (const [i, p] of ids.entries()) { const asked = playerAsked(chunks, st.responses, st.session.roundIndex, p, k)!.question;
      const payload = await server.judgeLiveWritten(st, p, { answer: rightOnes.includes(i) ? rightAnswerFor(asked, chunks[k]) : wrongAnswerFor(asked, chunks[k]) }, async () => false);
      assert.equal(await act(p, "race_tap", payload), null); }
    await host({ action: "race.next" }); assert.equal(pub().beat, "reveal");
  }
  await play(0, [0, 1]);
  assert.ok(view(ids[0]).place, "the phone gets its rank move after the answer");
  await host({ action: "race.next" }); assert.deepEqual([pub().beat, pub().board], ["countdown", null], "no leaderboard after chunk 1");
  await host({ action: "race.next" }); await play(1, [0, 1]); await host({ action: "race.next" }); await host({ action: "race.next" });
  await play(2, [0, 1]);
  // Ana's third first-try answer in a row: the streak bonus is in her points.
  const tap = view(ids[0]).mine.tap as { bonus?: number; mult?: number; points: number };
  assert.equal(tap.bonus, STREAK_BONUS, "streak bonus at 3");
  await host({ action: "race.next" }); await host({ action: "race.next" });
  // Chunk 4 (step 3): the lightning beat follows its reveal, 10 seconds, answered once, scored on the server.
  await play(3, [0, 1]);
  await host({ action: "race.next" }); assert.deepEqual([pub().beat, pub().beatMs], ["lightning", 10000]);
  assert.equal(pub().lightning!.question, e1.lightning![0].question);
  assert.equal(view(ids[0]).lightningAnswer, null, "the answer isn't sent before the phone answers");
  assert.equal(await act(ids[0], "race_lightning", { line: e1.lightning![0].answer[0] }), null);
  assert.match((await act(ids[0], "race_lightning", { line: "x" })) ?? "", /already/);
  assert.equal(await act(ids[1], "race_lightning", { line: "Something else." }), null);
  assert.deepEqual(view(ids[0]).mine.lightning, { step: 3, line: e1.lightning![0].answer[0], correct: true, late: false, points: LIGHTNING_POINTS });
  assert.ok(view(ids[0]).lightningAnswer?.length, "the answer shows once answered");
  await host({ action: "race.next" }); assert.equal(pub().beat, "countdown");
  await host({ action: "race.next" });
  // Chunk 5 (step 4) ends level 1: the checkpoint leaderboard, then the 60-second burst, then the countdown.
  const dbl = arcOf(sh, e1).double!;
  await play(4, [0]);
  assert.equal(pub().checkpoint, true);
  await host({ action: "race.next" }); assert.equal(pub().beat, "board"); assert.ok(pub().board, "the full leaderboard at the checkpoint");
  await host({ action: "race.next" }); assert.deepEqual([pub().beat, pub().beatMs], ["burst", 60000]); assert.equal(pub().burst!.chunks.length, 5);
  assert.equal(await act(ids[0], "race_burst", { chunk: 2 }), null);
  assert.match((await act(ids[0], "race_burst", { chunk: 2 })) ?? "", /already found/);
  assert.match((await act(ids[0], "race_burst", { chunk: 7 })) ?? "", /this level/);
  assert.equal(await act(ids[1], "race_burst", { chunk: 2 }), null, "without squads each player counts their own finds");
  assert.deepEqual(view(ids[0]).burstFound, [2]);
  await host({ action: "race.next" }); assert.equal(pub().beat, "countdown");
  // The surprise double: the question's points are doubled on that stop.
  const doubled = server.playerView(st, ids[0]).race!;
  void doubled;
  assert.ok(dbl >= 2 && dbl <= 4);
  const dTap = (st.responses.find((r) => r.kind === "race_tap" && r.playerId === ids[0] && r.payload.step === dbl)!.payload) as { mult: number };
  assert.equal(dTap.mult, DOUBLE, "double points on the surprise stop");
  // Totals include the lightning beat and the burst.
  const { raceTotals } = await import("../lib/live/race.ts");
  const t = raceTotals(st.responses, st.session.roundIndex, st.players, 4), parts = st.responses.filter((r) => r.playerId === ids[0] && r.roundIndex === st.session.roundIndex && ["race_gist", "race_tap", "race_lightning", "race_burst"].includes(r.kind)).reduce((a, r) => a + Number(r.payload.points ?? 0), 0);
  assert.equal(t.get(ids[0]), parts);
  // Adaptive: Ana answered right twice in a row, so she is on the harder version.
  assert.equal(view(ids[0]).version, "harder");
  const { playerVersion } = await import("../lib/live/race.ts");
  assert.equal(playerVersion(st.responses, st.session.roundIndex, 5, ids[0]), "harder"); assert.equal(playerVersion(st.responses, st.session.roundIndex, 5, ids[2]), "easier");
});

test("screens: the solo cadence, banners, the rank pill, lightning, the burst, no dead time on phones", () => {
  const race = src("app/expedition-race.tsx"), live = src("app/live/race-live.tsx");
  assert.match(race, /function afterExtras\(\)\{go\(isCheckpoint\(k,chunks\.length\)\?"board":"countdown"\)\}/);
  assert.match(race, /Checkpoint: Level 1 complete/); assert.match(race, /<RankPill move=\{meRow\.move\}/);
  // After chunk 1 there's no earlier rank: the pill shows the place only ("#1 of 2"), never "Held #1".
  assert.match(race, /if\(first\)return <span[^>]*>#\{rank\} of \{of\}<\/span>/); assert.match(race, /first=\{meRow\.prevRank===null\}/); assert.match(live, /first=\{\(race\.place\.row/);
  assert.match(race, /Twist! \{speaker\?\?"A witness"\} interrupts with a new claim\./); assert.match(race, /Boss question · double points/); assert.match(race, /Surprise! Double points on this stop\./);
  assert.match(race, /export function LightningBeat/); assert.match(race, /export function DiscoveryBurst/); assert.match(race, /Streak bonus! \+\{record\.bonus\}/);
  assert.match(live, /Bonus: find this chunk's hidden discovery/, "early finishers get a bonus on the same chunk");
  assert.match(live, /act\("race_lightning",\{line\}\)/); assert.match(live, /act\("race_burst",\{chunk:i\}\)/); assert.match(live, /race\.myQuestion\?\?round\.question/);
  assert.match(live, /<button type="button" onClick=\{\(\)=>setPaused|Pause/);
});
