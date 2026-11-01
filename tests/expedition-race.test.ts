// Expedition build, phase 2: the race. Chunks, every question type's scoring, one shot, timers and extended time,
// automatic screens with Pause, the Gist screen and HUD, word proof, discoveries, key words and standards tags.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { GIST_SECONDS, POINTS, SCREEN_MS, TYPE_INFO, chunkTokens, expeditionChunks, gistPoints, isDiscovery, keywordParts, limitMs, phraseRange, proofShown, scoreAnswer, screenMs, timeScale, wordsProve } from "../lib/expedition.ts";
import { expeditionCoverage, expeditionProblems, distractorProblems } from "../lib/expedition-check.ts";
import { BENCHMARK_FAMILIES, benchmark } from "../lib/best-standards.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
const exp = sh.expeditions![0], chunks = expeditionChunks(sh, shp, exp.id);
const byType = (t: string) => { const k = exp.chunks.findIndex((c) => c.question.type === t); return { c: chunks[k], q: exp.chunks[k].question, tokens: chunkTokens(chunks[k].lines) }; };
const best = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => x.best), wrong = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => !x.best);
const wordsOf = (tokens: ReturnType<typeof chunkTokens>, p: string) => { const r = phraseRange(tokens, p)!; return Array.from({ length: r[1] - r[0] + 1 }, (_, k) => r[0] + k); };

test("chunks: whole sentences, 50 to 150 words, at most 5 sentences, no gaps, and the expedition validates", () => {
  assert.equal(chunks.length, 10);
  for (const c of chunks) { assert.ok(c.words >= 50 && c.words <= 150, `${c.id}: ${c.words} words`); assert.ok(c.lines.length <= 5); }
  assert.deepEqual(expeditionProblems(sh, shp), []);
  // The whole story: 14 expeditions (the last is shorter, where the story ends), every chunk 50 to 150 words, no gaps.
  const cov = expeditionCoverage(sh, shp); assert.equal(cov.chunks, 137); assert.equal(cov.through, "p081"); assert.equal(cov.complete, true);
  assert.ok(cov.words.every((w) => w >= 50 && w <= 150)); assert.equal(sh.expeditions!.length, 14);
  assert.ok(sh.expeditions!.slice(0, 13).every((e) => e.chunks.length === 10 && e.interview), "expeditions of 10, each with an Interview");
  // Drafts for review (Trifles, The Tell-Tale Heart) validate but are never live.
  for (const id of ["trifles", "tell-tale-heart"]) {
    const w = WorldPackSchema.parse(JSON.parse(src(`worlds/${id}/world.json`))), ps = parseSourcePassages(src(`public/worlds/${id}/source.md`));
    assert.ok(w.draft_expeditions?.length && !w.expeditions?.length, `${id}: drafts only`);
    assert.deepEqual(expeditionProblems({ ...w, expeditions: w.draft_expeditions }, ps), [], id);
  }
  // Paragraph 3 is split in two: how Tarry Town got its name, then the quiet valley.
  assert.deepEqual(exp.chunks.slice(0, 2).map((c) => c.segments), [[{ p: "p003", from: 0, to: 2 }], [{ p: "p003", from: 3, to: 4 }]]);
  // A gap or overlap and an invented proof line are both caught.
  const bad = structuredClone(sh); bad.expeditions![0].chunks[2].segments[0].from = 1; bad.expeditions![0].chunks[1].question.proof!.lines = ["Not far from this village."];
  const probs = expeditionProblems(bad, shp).join("\n");
  assert.match(probs, /no gaps or overlaps/); assert.match(probs, /not copied exactly/);
});

test("every expedition mixes at least 5 question types and one Theme Thread; with an Interview, Name the Liar replaces Make the Call", () => {
  const types = exp.chunks.map((c) => c.question.type);
  assert.ok(new Set(types).size >= 5); assert.equal(types.filter((t) => t === "theme_thread").length, 1);
  assert.ok(exp.interview); assert.ok(!types.includes("make_call"));
  // Expedition 1 uses every chunk type (Gist Check runs on every chunk; its finale is Name the Liar).
  for (const t of Object.keys(TYPE_INFO)) if (t !== "gist" && t !== "make_call") assert.ok(types.includes(t as never), t);
  // Without an Interview, Make the Call is still the last chunk, once.
  const noIv = structuredClone(sh); delete noIv.expeditions![0].interview;
  assert.match(expeditionProblems(noIv, shp).join(" | "), /Make the Call is the last chunk, once/);
});

test("scoring: two-step questions need the right answer AND the right proof; one-step questions need the line", () => {
  const lim = limitMs(45);
  for (const t of ["whose_eyes", "shades", "word_detective", "character_clue"]) {
    const { q, tokens } = byType(t); const proof = wordsOf(tokens, q.proof!.words![0]);
    const right = scoreAnswer(q, { choice: best(q.choices), words: proof }, tokens, 1000, lim);
    assert.ok(right.correct, t); assert.ok(right.points > POINTS.correct && right.points <= POINTS.correct + POINTS.speedMax, t);
    assert.equal(scoreAnswer(q, { choice: wrong(q.choices), words: proof }, tokens, 1000, lim).points, 0, `${t}: wrong answer, right proof`);
    assert.equal(scoreAnswer(q, { choice: best(q.choices), words: [0, 1, 2] }, tokens, 1000, lim).points, 0, `${t}: right answer, wrong proof`);
  }
  for (const t of ["between_lines", "theme_thread"]) {
    const { q, tokens, c } = byType(t);
    assert.ok(scoreAnswer(q, { choice: best(q.choices), lines: [q.proof!.lines![0]] }, tokens, 1000, lim).correct, t);
    assert.equal(scoreAnswer(q, { choice: wrong(q.choices), lines: [q.proof!.lines![0]] }, tokens, 1000, lim).points, 0, t);
    const other = c.lines.find((l) => !q.proof!.lines!.includes(l.text));
    if (other) assert.equal(scoreAnswer(q, { choice: best(q.choices), lines: [other.text] }, tokens, 1000, lim).points, 0, t);
  }
  for (const t of ["find_it", "catch_lie"]) {
    const { q, tokens, c } = byType(t);
    assert.ok(scoreAnswer(q, { lines: [q.proof!.lines![0]] }, tokens, 1000, limitMs(30)).correct, t);
    const other = c.lines.find((l) => !q.proof!.lines!.includes(l.text))!;
    assert.equal(scoreAnswer(q, { lines: [other.text] }, tokens, 1000, limitMs(30)).points, 0, t);
  }
  { const { q, tokens } = byType("figure_it_out");
    assert.ok(scoreAnswer(q, { choice: best(q.choices), choice2: best(q.choices2!.options) }, tokens, 1000, lim).correct);
    assert.equal(scoreAnswer(q, { choice: best(q.choices), choice2: wrong(q.choices2!.options) }, tokens, 1000, lim).points, 0);
    assert.equal(scoreAnswer(q, { choice: wrong(q.choices), choice2: best(q.choices2!.options) }, tokens, 1000, lim).points, 0); }
  // Make the Call (for expeditions without an Interview): any theory wins with 2 of its lines.
  { const tokens = chunkTokens(chunks[9].lines); const q = { type: "make_call" as const, prompt: "Make the call: what is the Headless Horseman?", keywords: [], hint: "h", why: "w", standards: ["K12.EE.1.1" as const],
      theories: [{ id: "real", name: "A real ghost", lines: [chunks[6].lines[0].text, chunks[6].lines[1].text] }, { id: "story", name: "A story", lines: [chunks[3].lines[1].text, chunks[8].lines[0].text, chunks[5].lines[0].text] }, { id: "grew", name: "A legend", lines: [chunks[6].lines[1].text, chunks[8].lines[0].text] }] };
    const t = q.theories[1];
    assert.ok(scoreAnswer(q, { theory: t.id, lines: t.lines.slice(0, 2) }, tokens, 1000, limitMs(90)).correct, "any theory wins with 2 of its lines");
    assert.equal(scoreAnswer(q, { theory: t.id, lines: [t.lines[0]] }, tokens, 1000, limitMs(90)).points, 0, "needs 2 lines");
    assert.equal(scoreAnswer(q, { theory: q.theories![0].id, lines: t.lines.slice(0, 2) }, tokens, 1000, limitMs(90)).points, 0, "lines must back the call"); }
  // Gist check: 100 for the best summary only.
  assert.equal(gistPoints(exp.chunks[0], best(exp.chunks[0].gist.options)), POINTS.gist); assert.equal(gistPoints(exp.chunks[0], wrong(exp.chunks[0].gist.options)), 0);
});

test("one shot: no near-miss retry, and a late answer scores 0 even when right", () => {
  assert.doesNotMatch(src("lib/expedition.ts"), /near|retry/i);
  assert.doesNotMatch(src("app/expedition-race.tsx"), /near miss|One more try|retry/i);
  assert.ok(src("app/expedition-race.tsx").includes("You'll get another shot in the Refresher."));
  const { q, tokens } = byType("find_it");
  const late = scoreAnswer(q, { lines: [q.proof!.lines![0]] }, tokens, limitMs(30) + 1, limitMs(30));
  assert.equal(late.points, 0); assert.ok(late.late);
});

test("timers: no reading timer, Gist 20, one-step 30, two-step 45, Theme Thread and Make the Call 90; extended time multiplies all", () => {
  assert.equal(GIST_SECONDS, 20);
  assert.equal(TYPE_INFO.find_it.seconds, 30); assert.equal(TYPE_INFO.catch_lie.seconds, 45);
  for (const t of ["word_detective", "shades", "between_lines", "whose_eyes", "figure_it_out", "character_clue"] as const) assert.equal(TYPE_INFO[t].seconds, 45, t);
  assert.equal(TYPE_INFO.theme_thread.seconds, 90); assert.equal(TYPE_INFO.make_call.seconds, 90);
  assert.equal(limitMs(45, "1.5"), 67500); assert.equal(limitMs(20, "2"), 40000); assert.equal(limitMs(30, "untimed"), 90000); assert.equal(timeScale(null), 1);
  // The automatic screens: about 3 seconds of result and 5 of leaderboard; longer with extended time.
  assert.deepEqual([SCREEN_MS.result, SCREEN_MS.board], [3000, 5000]); assert.equal(screenMs("board", "2"), 10000);
  // Reading has no timer; Catch the Lie's clock starts after the testimony; the leaderboard has Pause, which holds the clock.
  const ui = src("app/expedition-race.tsx");
  assert.ok(ui.includes("Read · no timer")); assert.ok(ui.includes("The timer starts when it ends")); assert.ok(ui.includes("aria-pressed={paused}"));
  assert.ok(ui.includes("if(!kind||paused)return"));
});

test("Gist screen: heading Gist check, question Which is the best summary, and the HUD on every race screen", () => {
  const ui = src("app/expedition-race.tsx");
  assert.ok(ui.includes("Gist check · {GIST_SECONDS} seconds")); assert.ok(ui.includes(">Which is the best summary?<"));
  for (const piece of ["Score ", "Streak ", " coins", "Sound on", "Chunk {chunk} of {total}"]) assert.ok(ui.includes(piece), piece);
});

test("words: word proof, the hidden discovery, and question key words (highlighted in the question, never the passage)", () => {
  const { q, tokens } = byType("word_detective");
  assert.ok(wordsProve(tokens, wordsOf(tokens, "repose"), q.proof!.words!));
  assert.ok(!wordsProve(tokens, wordsOf(tokens, "repose").concat([0, 1, 2, 3, 4, 5]), q.proof!.words!), "too many extra words");
  const c0 = exp.chunks[0], t0 = chunkTokens(chunks[0].lines), r = phraseRange(t0, c0.discovery.phrase)!;
  assert.ok(isDiscovery(t0, c0, r[0])); assert.ok(!isDiscovery(t0, c0, 0));
  assert.deepEqual(keywordParts("Why does listless matter?", ["listless"]).map((p) => p.key), [false, true, false]);
  assert.ok(proofShown(q, tokens).words.length > 0);
  // Words to Know: a soft highlight and a dotted underline, never the orange picked-line state.
  assert.ok(src("app/expedition-race.tsx").includes("bg-violet-soft px-0.5 underline decoration-dotted"));
});

test("standards: every question is tagged; every code is a verified B.E.S.T. benchmark", () => {
  for (const c of exp.chunks) for (const s of c.question.standards) assert.ok(BENCHMARK_FAMILIES.includes(s), s);
  assert.equal(benchmark("R.1.3", 7).code, "ELA.7.R.1.3"); assert.match(benchmark("R.1.3", 7).text, /unreliable narrator/);
  assert.equal(benchmark("K12.EE.3.1", 9).text, "Make inferences to support comprehension.");
  assert.equal(benchmark("V.1.3", 10).code, "ELA.10.V.1.3");
  assert.match(benchmark("R.3.1", 9).url, /cpalms\.org\/PreviewStandard\/Preview\/15110$/);
  // Inference is EE.3.1 (not EE.1.1), as verified.
  assert.ok(TYPE_INFO.between_lines.standards.includes("K12.EE.3.1"));
});

test("plausible distractors: three different options, real phrases, the best one not given away by length", () => {
  assert.deepEqual(distractorProblems("x", [{ text: "Quiet and calm here", best: true }, { text: "Loud and busy town" }, { text: "Far away and hard" }]), []);
  assert.ok(distractorProblems("x", [{ text: "A very long and detailed correct option that gives itself away", best: true }, { text: "Short wrong one" }, { text: "Another one here" }]).length > 0);
});
