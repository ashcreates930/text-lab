// Expedition build, phase 3: after the race. The Refresher (selection, untimed proof, stars and badges, Perfect run),
// Case Notes (contents, PDF), the Bonus Round (flagged questions, every member defends, the Squad Case File and its PDF),
// and the live flow (Refresher on each phone after the podium, notes, the Bonus Round from start to the reveal).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { chunkTokens, expeditionChunks, joinedPassages, phraseRange, type Answer } from "../lib/expedition.ts";
import { rightAnswerFor, wrongAnswerFor } from "./answers.ts";
import { playerAsked } from "../lib/live/race.ts";
import { liarIndex, interviewStatements, type LiarAnswer } from "../lib/interview.ts";
import { BONUS_POINTS, REFRESHER_MAX, VERDICT_INDEX, verdictAnswer, bonusProblems, caseNotes, caseNotesPdf, flaggedQuestions, refresherAward, refresherCorrect, refresherItems, squadCaseFile, squadCaseFilePdf, type ChunkResult } from "../lib/case-notes.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
const exp = sh.expeditions![0], chunks = expeditionChunks(sh, shp, exp.id);
const best = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => x.best), wrong = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => !x.best);
// A right answer (with its proof) for every chunk, in any format (tests/answers.ts).
const rightAnswer = (k: number): Answer => rightAnswerFor(exp.chunks[k].question, chunks[k]);
const result = (k: number, correct: boolean, gistOk = true, extra: Partial<ChunkResult> = {}): ChunkResult => ({ index: k, answer: correct ? rightAnswer(k) : wrongAnswerFor(exp.chunks[k].question, chunks[k]), correct, late: false, gist: gistOk ? best(exp.chunks[k].gist.options) : wrong(exp.chunks[k].gist.options), typed: null, unknown: [], ...extra });

test("Refresher: only misses, up to 4, race questions before Gist checks", () => {
  const results = chunks.map((c) => result(c.index, ![1, 3, 5, 7, 9].includes(c.index), c.index !== 0));
  const items = refresherItems(chunks, results);
  assert.equal(items.length, REFRESHER_MAX);
  assert.deepEqual(items.map((i) => i.kind), ["question", "question", "question", "question"], "race questions come first");
  assert.deepEqual(items.map((i) => i.index), [1, 3, 5, 7]);
  // Two misses and a missed Gist: the Gist check comes after the questions.
  const few = chunks.map((c) => result(c.index, ![2, 4].includes(c.index), c.index !== 0));
  assert.deepEqual(refresherItems(chunks, few), [{ index: 2, kind: "question" }, { index: 4, kind: "question" }, { index: 0, kind: "gist" }]);
  // No misses: nothing to fix.
  assert.deepEqual(refresherItems(chunks, chunks.map((c) => result(c.index, true))), []);
});

test("Refresher: untimed proof taps are checked; stars and badges, Perfect run when nothing was missed", () => {
  for (let k = 0; k < chunks.length; k++) {
    const q = exp.chunks[k].question, a = rightAnswer(k);
    // Drag and drop and choose two are done again; the others need the proof (or Figure It Out's meaning).
    const proofOnly = a.placed ? { placed: a.placed } : a.picks ? { picks: a.picks } : q.type === "figure_it_out" ? { choice2: a.choice2 } : { lines: a.lines };
    assert.ok(refresherCorrect({ index: k, kind: "question" }, chunks[k], proofOnly), `chunk ${k + 1} ${q.type}: the proof fixes it`);
    assert.ok(!refresherCorrect({ index: k, kind: "question" }, chunks[k], { lines: ["Not a line"], words: [], choice2: wrong(q.choices2?.options), picks: [], placed: {} }), `chunk ${k + 1}: a wrong tap doesn't`);
  }
  assert.ok(refresherCorrect({ index: 0, kind: "gist" }, chunks[0], { choice: best(exp.chunks[0].gist.options) }));
  assert.deepEqual(refresherAward([], []), { stars: 0, of: 0, badge: "Perfect run" });
  const items = [{ index: 1, kind: "question" as const }, { index: 3, kind: "question" as const }];
  assert.deepEqual(refresherAward(items, [true, true]), { stars: 2, of: 2, badge: "Comeback Detective" });
  assert.deepEqual(refresherAward(items, [true, false]), { stars: 1, of: 2, badge: "Second Look" });
  assert.equal(refresherAward(items, [false, false]).badge, null);
  // Refresher answers earn stars, never leaderboard points.
  assert.deepEqual(Object.keys(refresherAward(items, [true, true])).sort(), ["badge", "of", "stars"], "no points in a Refresher award");
});

test("Case Notes: one entry per chunk with the question, answer, proof, first try, Refresher fix, Gist, typed question and unknown words", () => {
  const results = chunks.map((c) => result(c.index, c.index !== 2, c.index !== 4, c.index === 2 ? { typed: "Why was he hunting alone?", unknown: ["stripling"] } : {}));
  const items = refresherItems(chunks, results), notes = caseNotes(chunks, results, { items, fixed: [true, false] }, { 0: "He won't swear to it." });
  assert.equal(notes.length, 10);
  const n3 = notes[2];
  assert.equal(n3.type, "Shades of Meaning"); assert.equal(n3.rightFirstTry, false); assert.equal(n3.fixed, true);
  assert.equal(n3.typedQuestion, "Why was he hunting alone?"); assert.deepEqual(n3.unknownWords, ["stripling"]);
  assert.match(n3.correctProof, /roar of my own gun/); assert.ok(n3.answer.length > 0);
  assert.equal(notes[0].note, "He won't swear to it."); assert.equal(notes[0].rightFirstTry, true); assert.equal(notes[0].fixed, null);
  assert.equal(notes[4].gistRight, false); assert.ok(notes[4].gistPick);
  assert.ok(notes.every((n) => n.standards.length > 0));
  // The PDF: a real PDF with the entries and ruled space for notes.
  const pdf = Buffer.from(caseNotesPdf("Ana Ruiz", sh.title, exp.title, notes).output("arraybuffer")).toString("latin1");
  assert.ok(pdf.startsWith("%PDF")); assert.match(pdf, /Case Notes: Into the Hollow/); assert.match(pdf, /My notes:/); assert.match(pdf, /He won't swear to it\./);
});

test("Bonus Round: opens on who each member named, flags differing answers, every member defends one, and the Squad Case File with its PDF", () => {
  const iv = exp.interview!, liar = liarIndex("lanterns", exp.id), w = iv.witnesses[liar], other = iv.witnesses[(liar + 1) % 3];
  const verdict = { world: sh, interview: iv, liar };
  const anaNamed: LiarAnswer = { liar: w.character, line: w.lie.lines[0] }, benNamed: LiarAnswer = { liar: other.character, line: other.truth.lines[0] };
  const ana = { id: "a", name: "Ana", results: chunks.map((c) => result(c.index, true)), named: anaNamed };
  const ben = { id: "b", name: "Ben", results: chunks.map((c) => result(c.index, c.index !== 1)), named: benNamed };
  const flagged = flaggedQuestions(chunks, [ana, ben], verdict);
  assert.deepEqual(flagged, [VERDICT_INDEX, 1], "who they named first, then the answer they differed on");
  // Picks: Ana's verdict defended by Ana, and Ana's answer on chunk 2 defended by Ben.
  const picks = [{ index: 1, from: "a", answer: ana.results[1].answer!, defender: "b", stem: "I chose this line because…", reason: "it gives the two miles." }, { index: VERDICT_INDEX, from: "a", answer: verdictAnswer(anaNamed)!, defender: "a", stem: "This proves it because…", reason: "the story says the opposite." }];
  assert.deepEqual(bonusProblems(flagged, [ana, ben], picks.slice(0, 1)), ["Agree on who lied", "Every member defends at least one choice"]);
  assert.deepEqual(bonusProblems(flagged, [ana, ben], picks), []);
  const file = squadCaseFile("Lanterns", chunks, [ana, ben], picks, 0, verdict);
  assert.equal(file.items.length, 2); assert.ok(file.items.every((i) => i.right)); assert.equal(file.points, 2 * BONUS_POINTS);
  assert.deepEqual(file.members.map((m) => [m.name, m.role, m.defended]), [["Ana", "Lead Investigator", [0]], ["Ben", "Evidence Keeper", [2]]]);
  assert.equal(file.finalCall, `${interviewStatements(sh, iv, liar)[liar].name} lied`);
  // Ben's verdict would not hold up.
  const wrongFile = squadCaseFile("Lanterns", chunks, [ana, ben], [{ ...picks[1], from: "b", answer: verdictAnswer(benNamed)! }], 0, verdict);
  assert.equal(wrongFile.items[0].right, false);
  const pdf = Buffer.from(squadCaseFilePdf(sh.title, exp.title, file).output("arraybuffer")).toString("latin1");
  assert.ok(pdf.startsWith("%PDF")); assert.match(pdf, /Squad Case File: Lanterns/); assert.match(pdf, /The verdict/); assert.match(pdf, /defended Name the Liar/);
});

test("live: the Refresher on each phone after the podium, notes saved, then the Bonus Round from start to the Squad Case File reveal", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "AFTER1", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  const ids: string[] = []; for (const n of ["Ana Ruiz", "Ben Cole"]) { const r = await server.join(store, s, { nickname: n, studentId: null }); ids.push(r.player!.id); }
  let st = (await server.loadState(store, s.id))!;
  const act = async (pid: string, kind: string, payload: Record<string, unknown> = {}) => { st = (await server.loadState(store, s.id))!; const e = await server.playerAct(store, st, pid, { kind: kind as never, payload }, { judgeAllowed: async () => false, timeSetting: "1" as never }); st = (await server.loadState(store, s.id))!; return e; };
  const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
  const pub = () => server.hostView(st).round as unknown as { beat: string; step: number };
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: exp.id } }), null);
  // Ana answers every question right; Ben answers chunk 2 wrong and leaves the rest blank.
  for (let k = 0; k < 10; k++) {
    while (pub().beat !== "race") await host({ action: "race.next" });
    const asked = playerAsked(chunks, st.responses, st.session.roundIndex, ids[0], k)!.question;
    const payload = await server.judgeLiveWritten(st, ids[0], { answer: rightAnswerFor(asked, chunks[k]) }, async () => false);
    assert.equal(await act(ids[0], "race_tap", payload), null, `chunk ${k + 1} (${asked.type})`);
    if (k === 1) assert.equal(await act(ids[1], "race_tap", { answer: { choice: 0, lines: [chunks[1].lines[1].text] } }), null);
    while (pub().beat !== "countdown") await host({ action: "race.next" });
    await host({ action: "race.next" });
  }
  // Name the Liar: Ana solves it; Ben names the liar with the wrong line.
  assert.equal(pub().beat, "liar");
  const v = server.hostView(st).round as unknown as { interview: { witnesses: { character: string }[] } };
  const race = st.session.rounds[st.session.roundIndex] as { interview: { liar: number } }, w = exp.interview!.witnesses[race.interview.liar];
  assert.equal(v.interview.witnesses.length, 3);
  assert.equal(await act(ids[0], "liar_lock", { liar: w.character, line: w.lie.lines[0] }), null);
  assert.equal(await act(ids[1], "liar_lock", { liar: w.character, line: chunks[0].lines[0].text }), null);
  await host({ action: "race.next" }); await host({ action: "race.next" });
  assert.equal(st.session.status, "ended");
  // Before the race ended there was no Refresher; now each phone has its own.
  const anaAfter = server.playerView(st, ids[0]).after!, benAfter = server.playerView(st, ids[1]).after!;
  assert.equal(anaAfter.refresher.length, 4, "Ana missed every Gist check (she never picked one)");
  assert.ok(anaAfter.refresher.every((r) => r.kind === "gist"));
  assert.equal(benAfter.refresher.length, 4); assert.equal(benAfter.refresher[0].kind, "liar", "an unsolved Name the Liar comes first"); assert.ok(benAfter.refresher.slice(1).every((r) => r.kind === "question"));
  assert.ok(anaAfter.interview!.solved); assert.equal(benAfter.interview!.solved, false); assert.equal(benAfter.interview!.said.length, 3);
  assert.ok(!JSON.stringify(benAfter.refresher).includes("\"best\""), "the phone never gets the answers");
  // Ben fixes chunk 2 in the Refresher (one try), and writes a note.
  assert.equal(benAfter.refresher[1].chunk, 1);
  // Ben's own question at chunk 1 (his bank pick), fixed with its proof sentence.
  const benQ = playerAsked(chunks, st.responses, st.session.rounds.findIndex((r) => (r as { type: string }).type === "race"), ids[1], 0)!.question;
  assert.equal(await act(ids[1], "race_refresh", { k: 1, answer: { lines: rightAnswerFor(benQ, chunks[0]).lines } }), null);
  assert.match((await act(ids[1], "race_refresh", { k: 1, answer: {} })) ?? "", /already tried/);
  assert.equal(await act(ids[1], "race_note", { index: 0, text: "He won't swear the story is true." }), null);
  const ben2 = server.playerView(st, ids[1]).after!;
  assert.equal(ben2.refresher[1].result!.fixed, true); assert.ok(ben2.refresher[1].result!.shown.length > 0);
  assert.equal(ben2.notes[0].fixed, true); assert.equal(ben2.notes[0].note, "He won't swear the story is true."); assert.deepEqual(ben2.award, { stars: 1, of: 4, badge: "Second Look" });
  // The Bonus Round: squads built for the class, every flagged question agreed and defended, handed in, revealed.
  assert.equal(await host({ action: "bonus.start" }), null);
  let b = server.playerView(st, ids[0]).bonus!;
  assert.ok(b.flagged.length >= 2); assert.deepEqual(Object.values(b.roles).sort(), ["Evidence Keeper", "Lead Investigator"]);
  const defenders = [ids[0], ids[1]];
  for (const [k, q] of b.flagged.entries()) assert.equal(await act(defenders[k % 2], "bonus_pick", { index: q.index, from: ids[0], stem: "I chose this line because…", reason: "the text says so plainly." }), null);
  b = server.playerView(st, ids[0]).bonus!; assert.deepEqual(b.problems, []);
  assert.equal(await act(ids[1], "bonus_submit"), null);
  assert.equal(await host({ action: "bonus.end" }), null);
  const hb = server.hostView(st).bonus!;
  assert.equal(hb.squads.length, 1); assert.equal(hb.squads[0].submitted, true); assert.equal(hb.board[0].points, hb.squads[0].file.points); assert.ok(hb.squads[0].file.points > 0);
  // Bonus points stay off the race leaderboard.
  assert.ok(server.hostView(st).scores.every((x) => x.points === 0));
});

test("Make the Call and the Refresher list each paragraph once, even when it is split across chunks", () => {
  const joined = joinedPassages(chunks);
  assert.equal(new Set(joined.map((p) => p.id)).size, joined.length, "no paragraph twice (React keys stay unique)");
  assert.equal(joined[0].id, "p003"); assert.match(joined[0].text, /Tarry\s+Town[\s\S]*uniform\s+tranquillity/, "both halves of paragraph 3, in order");
});
