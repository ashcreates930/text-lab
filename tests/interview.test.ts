// Expedition phase 5: the Interview and Name the Liar, and the 3D witness stage. Liar randomization (exactly one liar,
// stable per student, varied across students), the win rule, Case Notes and the Refresher, the content checks, live
// voting, the private lock-in and the reveal, the fallback choice, and Brom's model (no finger tracks).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks, joinedPassages } from "../lib/expedition.ts";
import { expeditionProblems } from "../lib/expedition-check.ts";
import { LIAR_POINTS, cardWinner, interviewAudioList, interviewNote, interviewStatements, liarBreakdown, liarCheck, liarIndex, liarLineFixed, saidLine } from "../lib/interview.ts";
import { caseNotesPdf, refresherCorrect, refresherItems, refresherView, type ChunkResult } from "../lib/case-notes.ts";
import { FINGER_BONE, MIN_DEVICE_MEMORY_GB, MODEL_TIMEOUT_MS, chooseStage, glowFor, idleTracks } from "../lib/character-motion.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
const exp = sh.expeditions![0], iv = exp.interview!, chunks = expeditionChunks(sh, shp, exp.id);

test("the liar: exactly one per student and expedition, the same every time, and different across students", () => {
  for (const key of ["ana", "ben", "cy", "dee"]) {
    const liar = liarIndex(key, exp.id), said = interviewStatements(sh, iv, liar);
    assert.equal(said.filter((s) => s.lied).length, 1, "exactly one liar");
    assert.equal(said.findIndex((s) => s.lied), liar);
    assert.equal(liarIndex(key, exp.id), liar, "stable for the same student");
    // The other two tell the truth.
    said.forEach((s, k) => assert.equal(s.text, k === liar ? iv.witnesses[k].lie.text : iv.witnesses[k].truth.text));
  }
  const counts = [0, 0, 0];
  for (let k = 0; k < 300; k++) counts[liarIndex(`student-${k}`, exp.id)]++;
  assert.ok(counts.every((n) => n > 60), `each witness is the liar for some students (${counts})`);
  // Another expedition can give the same student a different liar.
  assert.ok(Array.from({ length: 40 }, (_, k) => liarIndex(`s${k}`, exp.id) !== liarIndex(`s${k}`, "another-expedition")).some(Boolean));
});

test("Name the Liar: a win needs the liar AND the line that disproves the lie", () => {
  for (let liar = 0; liar < 3; liar++) {
    const w = iv.witnesses[liar], other = iv.witnesses[(liar + 1) % 3];
    const win = liarCheck(iv, liar, { liar: w.character, line: w.lie.lines[0] });
    assert.deepEqual(win, { named: true, line: true, solved: true, points: LIAR_POINTS });
    assert.equal(liarCheck(iv, liar, { liar: w.character, line: chunks[0].lines[0].text }).solved, false, "the right liar with the wrong line");
    assert.equal(liarCheck(iv, liar, { liar: other.character, line: w.lie.lines[0] }).solved, false, "the right line with the wrong liar");
    assert.equal(liarCheck(iv, liar, { liar: null, line: null }).points, 0);
    // Every accepted line works, with any spacing.
    for (const l of w.lie.lines) assert.ok(liarCheck(iv, liar, { liar: w.character, line: l.replace(/\s+/g, "  ") }).solved);
  }
  assert.equal(cardWinner([1, 1, 0]), 1); assert.equal(cardWinner([0, 1]), 0, "a tie takes the first card"); assert.equal(cardWinner([]), 0);
  const liar = 1, w = iv.witnesses[liar];
  const b = liarBreakdown(iv, liar, [{ liar: w.character, line: w.lie.lines[0] }, { liar: w.character, line: "x" }, { liar: iv.witnesses[0].character, line: "y" }, { liar: null, line: null }]);
  assert.deepEqual(b.named.map((n) => n.count), [1, 2, 0]); assert.equal(b.solved, 1); assert.equal(b.pct, 25);
});

test("content: truths confirmed and lies disproved by exact lines in the expedition, never repeating the proof's words, with recorded audio", () => {
  const all = chunks.flatMap((c) => c.lines.map((l) => l.text));
  assert.equal(iv.witnesses.length, 3); assert.deepEqual(iv.witnesses.map((w) => w.character), ["brom-bones", "hans-van-ripper", "katrina-van-tassel"], "Brom first, then Hans, then Katrina");
  for (const w of iv.witnesses) {
    assert.equal(w.cards.length, 2);
    for (const l of [...w.truth.lines, ...w.lie.lines]) assert.ok(all.includes(l), l);
    assert.ok(sh.characters.find((c) => c.id === w.character)?.voice_id, `${w.character} speaks`);
  }
  for (const a of interviewAudioList(sh)) assert.ok(existsSync(`public${a.path}`), a.path);
  // The checks catch a statement that repeats its line, and a line from outside the expedition.
  const bad = structuredClone(sh), b = bad.expeditions![0].interview!.witnesses[1];
  b.truth.text = "The good housewives named it because their husbands would linger at the village tavern."; b.lie.lines = ["It was the very witching time of night."];
  const probs = expeditionProblems(bad, shp).join(" | ");
  assert.match(probs, /hans-van-ripper truth repeats words from its proof line/); assert.match(probs, /hans-van-ripper lie line .* is not copied exactly from this expedition/);
  assert.deepEqual(expeditionProblems(sh, shp), []);
});

test("Case Notes: each statement as \"Brom said: ...\", the verdict, and the PDF; an unsolved case goes into the Refresher first", () => {
  const liar = 2, w = iv.witnesses[liar];
  const note = interviewNote(sh, iv, liar, [0, 1, 0], { liar: iv.witnesses[0].character, line: w.lie.lines[0] });
  assert.deepEqual(note.said.map(saidLine), [`Brom said: "${iv.witnesses[0].truth.text}"`, `Hans said: "${iv.witnesses[1].truth.text}"`, `Katrina said: "${w.lie.text}"`]);
  assert.equal(note.said[1].card, iv.witnesses[1].cards[1]);
  assert.equal(note.solved, false); assert.equal(note.pick, "Brom Bones"); assert.equal(note.liar, "Katrina Van Tassel");
  const pdf = Buffer.from(caseNotesPdf("Ana", sh.title, exp.title, [], note).output("arraybuffer")).toString("latin1");
  assert.match(pdf, /The Interview/); assert.match(pdf, /Brom said:/); assert.match(pdf, /Name the Liar/);
  // The Refresher: Name the Liar first, then the questions; fixing it means finding the line.
  const results: ChunkResult[] = chunks.map((c) => ({ index: c.index, answer: null, correct: c.index !== 4, late: false, gist: c.chunk.gist.options.findIndex((o) => o.best), typed: null, unknown: [] }));
  const items = refresherItems(chunks, results, true);
  assert.deepEqual(items.map((x) => x.kind), ["liar", "question"]);
  const view = refresherView(items[0], chunks, joinedPassages(chunks), { name: "Katrina Van Tassel", lieText: w.lie.text });
  assert.equal(view.task, "line"); assert.match(view.prompt, /Katrina Van Tassel said/); assert.ok(view.callPassages!.length > 3);
  assert.ok(refresherCorrect(items[0], undefined, { lines: [w.lie.lines[0]] }, [], w.lie.lines)); assert.equal(refresherCorrect(items[0], undefined, { lines: [chunks[0].lines[0].text] }, [], w.lie.lines), false);
  assert.ok(liarLineFixed(iv, liar, w.lie.lines[0]));
  assert.deepEqual(refresherItems(chunks, results, false).map((x) => x.kind), ["question"]);
});

test("live: the class votes on each card, witnesses answer on the board, every phone locks in privately, and the board reveals the liar with the breakdown", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "LIAR01", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  const ids: string[] = []; for (const n of ["Ana Ruiz", "Ben Cole", "Cy Park"]) { const r = await server.join(store, s, { nickname: n, studentId: null }); ids.push(r.player!.id); }
  let st = (await server.loadState(store, s.id))!;
  const act = async (pid: string, kind: string, payload: Record<string, unknown> = {}) => { st = (await server.loadState(store, s.id))!; const e = await server.playerAct(store, st, pid, { kind: kind as never, payload }, { judgeAllowed: async () => false, timeSetting: "1" as never }); st = (await server.loadState(store, s.id))!; return e; };
  const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
  type Iv = { witness: number | null; votes: number[][]; cards: number[]; said: { character: string; text: string; card: string }[]; callPassages: unknown[] | null; verdict: { liar: string; breakdown: { named: { count: number }[]; solved: number; total: number } } | null };
  const pub = () => server.hostView(st).round as unknown as { beat: string; step: number; beatMs: number | null; interview: Iv };
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: exp.id } }), null);
  const race = () => st.session.rounds[st.session.roundIndex] as { interview: { liar: number; witnesses: number } };
  const liar = race().interview.liar, w = iv.witnesses[liar];
  assert.equal(liar, liarIndex(s.id, exp.id), "one liar per game, saved with the round");
  for (let k = 0; k < 3; k++) {
    assert.deepEqual([pub().beat, pub().step, pub().interview.witness, pub().beatMs], ["vote", k, k, 20000]);
    assert.equal(pub().interview.said.length, k, "nothing said yet by this witness");
    assert.equal(await act(ids[0], "interview_vote", { card: 1 }), null); assert.equal(await act(ids[1], "interview_vote", { card: 1 }), null); assert.equal(await act(ids[2], "interview_vote", { card: 0 }), null);
    assert.match((await act(ids[0], "interview_vote", { card: 0 })) ?? "", /already voted/);
    assert.deepEqual(pub().interview.votes[k], [1, 2]); assert.equal(server.hostView(st).race!.answered, 3);
    await host({ action: "race.next" });
    // Testify: the board plays the recorded line; phones get the caption only, never the audio file or who lies.
    assert.equal(pub().beat, "testify"); assert.equal(pub().interview.said[k].card, iv.witnesses[k].cards[1]);
    assert.equal(pub().interview.said[k].text, (k === liar ? iv.witnesses[k].lie : iv.witnesses[k].truth).text);
    assert.match(server.hostView(st).race!.voice!.src, new RegExp(`${iv.witnesses[k].character}-(truth|lie)\\.mp3$`));
    const phone = JSON.stringify(server.playerView(st, ids[0]));
    assert.ok(!phone.includes(".mp3") && !phone.includes("\"lied\"") && !phone.includes("\"lie\""), "no answers on the phone");
    await host({ action: "race.next" });
  }
  assert.equal(pub().beat, "read");
  // The race runs; at the end, Name the Liar.
  for (let k = 0; k < 120 && pub().beat !== "liar"; k++) await host({ action: "race.next" });
  assert.deepEqual([pub().beat, pub().beatMs], ["liar", 90000]); assert.ok(pub().interview.callPassages!.length > 3); assert.equal(pub().interview.verdict, null);
  assert.equal(await act(ids[0], "liar_lock", { liar: w.character, line: w.lie.lines[0] }), null);
  assert.match((await act(ids[0], "liar_lock", { liar: w.character, line: w.lie.lines[0] })) ?? "", /already locked in/);
  assert.match((await act(ids[1], "liar_lock", { liar: "nobody", line: "x" })) ?? "", /Pick a witness/);
  assert.equal(await act(ids[1], "liar_lock", { liar: w.character, line: chunks[0].lines[0].text }), null);
  // Private until the reveal: the phone knows only that it locked in; the board shows only how many have.
  const anaLocked = server.playerView(st, ids[0]).race!.interview!;
  assert.deepEqual(anaLocked, { voted: null, locked: true, result: null });
  assert.ok(!JSON.stringify(server.hostView(st).round).includes("\"verdict\":{"), "nothing revealed before every phone locks in");
  assert.equal(server.hostView(st).race!.answered, 2);
  await host({ action: "race.next" });
  // The reveal: the liar, the breakdown, each phone's own result and the points.
  const v = pub().interview.verdict!;
  assert.equal(pub().beat, "verdict"); assert.equal(v.liar, w.character); assert.equal(v.breakdown.total, 3); assert.equal(v.breakdown.solved, 1);
  assert.equal(v.breakdown.named[liar].count, 2);
  assert.match(server.hostView(st).race!.voice!.src, /-caught\.mp3$/);
  assert.equal(server.playerView(st, ids[0]).race!.interview!.result!.solved, true); assert.equal(server.playerView(st, ids[1]).race!.interview!.result!.solved, false);
  await host({ action: "race.next" });
  assert.equal(st.session.status, "ended");
  const { raceTotals } = await import("../lib/live/race.ts");
  const withLiar = raceTotals(st.responses, st.session.roundIndex, st.players, 9);
  assert.equal(withLiar.get(ids[0]), LIAR_POINTS, "the case is worth big points");
  // The Evidence view and the CSV: each student's statements heard, the liar, their pick, proof line and result, and the class breakdown.
  const { liveRoundEvidence } = await import("../lib/live/evidence.ts"); const { evidenceCsv } = await import("../lib/classroom/evidence.ts");
  const ev = liveRoundEvidence({ session: st.session, world: st.world, squads: st.squads, players: st.players, responses: st.responses });
  const x = ev[0].interview!;
  assert.equal(x.statements.length, 3); assert.equal(x.statements.filter((s) => s.lied).length, 1); assert.equal(x.statements[liar].lied, true);
  assert.equal(x.liar, sh.characters.find((c) => c.id === w.character)!.name); assert.deepEqual([x.solved, x.total], [1, 3]);
  assert.deepEqual(x.students.map((s) => [s.nickname, s.solved]), [["Ana Ruiz", true], ["Ben Cole", false], ["Cy Park", false]]); assert.equal(x.students[2].pick, null);
  assert.ok(ev[0].squads[0].members[0].actions.some((a) => /Name the Liar: named .*case solved/.test(a)));
  const csv = evidenceCsv({ students: [], scenes: [], live: ev } as never);
  assert.match(csv, /Name the Liar,Date,Student,Statements heard,The liar,Student named,Student's proof line,Case solved/);
  assert.match(csv, /Ana Ruiz,.*\(the lie\).*,Yes/); assert.match(csv, /Class breakdown/);
  // The Bonus Round opens with who each squad member named.
  assert.equal(await host({ action: "bonus.start" }), null);
  const bonus = server.playerView(st, ids[0]).bonus!;
  assert.equal(bonus.flagged[0].type, "Name the Liar"); assert.ok(bonus.flagged[0].answers.some((a) => a.answer.startsWith("Named ")));
});

test("the 3D stage: the fallback choice, the idle made in code, the glow, and Brom's model with no finger tracks", async () => {
  assert.equal(MODEL_TIMEOUT_MS, 4000);
  assert.equal(chooseStage({ webgl: false }), "portrait", "no WebGL");
  assert.equal(chooseStage({ webgl: true, deviceMemory: MIN_DEVICE_MEMORY_GB - 2 }), "portrait", "low memory");
  assert.equal(chooseStage({ webgl: true, saveData: true }), "portrait", "data saver");
  assert.equal(chooseStage({ webgl: true, deviceMemory: 8 }), "3d"); assert.equal(chooseStage({ webgl: true, deviceMemory: null }), "3d", "unknown memory");
  // The stage falls back to the portrait on a slow load or an error, with the same voice, captions and flow.
  const stage = src("app/character-stage.tsx");
  assert.match(stage, /setTimeout\([^]*MODEL_TIMEOUT_MS/); assert.match(stage, /\.catch\(\(\)=>\{[^}]*setMode\("portrait"\)/);
  // Idle: breathing and small turns, never a finger; reduced motion keeps only a little breathing.
  const full = idleTracks(), reduced = idleTracks(true);
  assert.ok(full.every((t) => !FINGER_BONE.test(t.bone)));
  const peak = (ts: typeof full, bone: string, axis: number) => Math.max(...ts.find((t) => t.bone === bone)!.euler.map((e) => Math.abs(e[axis])));
  assert.ok(peak(full, "Head", 1) > 0.1); assert.equal(peak(reduced, "Head", 1), 0); assert.equal(peak(reduced, "Hips", 1), 0);
  assert.ok(peak(reduced, "Spine2", 0) < peak(full, "Spine2", 0));
  assert.equal(glowFor(1, true), glowFor(0, true), "no glow pulse under reduced motion"); assert.ok(glowFor(1, false) > glowFor(0, false));
  // The model: built by npm run build:characters; every finger track removed, the three clips kept.
  const report = JSON.parse(src("public/characters/brom/brom.report.json"));
  assert.equal(report.fingerTracksLeft, 0); assert.ok(report.fingerTracksRemoved > 0); assert.ok(report.megabytes < 6);
  const { NodeIO } = await import("@gltf-transform/core"); const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions"); const { MeshoptDecoder } = await import("meshoptimizer");
  await MeshoptDecoder.ready;
  const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder }).read("public/characters/brom/brom.glb");
  const anims = doc.getRoot().listAnimations();
  assert.deepEqual(anims.map((a) => a.getName()).sort(), ["head-shake", "laughing", "talking"]);
  assert.equal(anims.flatMap((a) => a.listChannels()).filter((c) => FINGER_BONE.test(c.getTargetNode()?.getName() ?? "")).length, 0, "no finger tracks");
  assert.deepEqual(sh.characters.find((c) => c.id === "brom-bones")!.model, { src: "/characters/brom/brom.glb", clips: { talking: "talking", laughing: "laughing", "head-shake": "head-shake" } });
});
