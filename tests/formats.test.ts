// World map, phase 3: varied questions and drag and drop. Every format's scoring, every drag-and-drop kind, tap to
// place and the keyboard, the question bank (per student and per replay), derived easier and harder versions, the Gist
// check about every third chunk, the written answer's rubric, the variety rules, and Expeditions 1 and 2 rebuilt.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type ExpQuestion } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { chunkTokens, expeditionChunks, scoreAnswer, limitMs, POINTS } from "../lib/expedition.ts";
import { DND_INFO, DND_TYPE, bankOf, bankPick, formatOf, gistAt, multiRight, dndResult, versionOf, writtenByRule, ruleVerdict, askedQuestion, type DndKind } from "../lib/formats.ts";
import { dndProblems, expeditionProblems, variety } from "../lib/expedition-check.ts";
import { arcProblems } from "../lib/pacing.ts";
import { rightAnswerFor } from "./answers.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
const [e1, e2] = sh.expeditions!, c1 = expeditionChunks(sh, shp, e1.id), c2 = expeditionChunks(sh, shp, e2.id);
const lim = limitMs(45);
const find = (f: string) => { for (const [e, cs] of [[e1, c1], [e2, c2]] as const) for (const [k, c] of e.chunks.entries()) for (const q of bankOf(c)) if (formatOf(q) === f) return { q, rc: cs[k] }; throw new Error(f); };

test("formats: two-part evidence, multiple choice, choose two, tap the sentence, a written answer and drag and drop all score", () => {
  for (const f of ["two_part", "mc", "multi", "tap", "written", "dnd"]) {
    const { q, rc } = find(f), t = chunkTokens(rc.lines), right = scoreAnswer(q, rightAnswerFor(q, rc), t, 1000, lim);
    assert.ok(right.correct, `${f}: the right answer proves it`); assert.ok(right.points >= POINTS.correct, f);
  }
  // Choose two: exactly the right two, no more, no fewer.
  const m = find("multi").q, best = (m.choices ?? []).map((c, i) => (c.best ? i : -1)).filter((i) => i >= 0), wrongOne = (m.choices ?? []).findIndex((c) => !c.best);
  assert.ok(multiRight(m, best)); assert.ok(!multiRight(m, [best[0]])); assert.ok(!multiRight(m, [best[0], wrongOne])); assert.ok(!multiRight(m, [...best, wrongOne]));
  // Drag and drop: points for each piece in place; only a fully right answer counts as proved.
  const { q: d, rc } = find("dnd"), t = chunkTokens(rc.lines), all = rightAnswerFor(d, rc).placed!;
  const one = { ...all, [d.dnd!.items[0].id]: d.dnd!.slots.find((x) => x.id !== d.dnd!.items[0].slot)!.id };
  const part = scoreAnswer(d, { placed: one }, t, 1000, lim), r = dndResult(d, one);
  assert.equal(part.correct, false, "one piece wrong: not proved"); assert.equal(r.right.length, r.total - 1);
  assert.equal(part.points, Math.round(POINTS.correct * (r.total - 1) / r.total), "points for each right piece, no speed bonus");
  // Written: Strong and Solid prove it (Strong scores more); Needs more evidence doesn't; nothing is taken from the phone.
  const { q: w, rc: wr } = find("written"), wt = chunkTokens(wr.lines);
  const strong = scoreAnswer(w, { text: "x", judged: "Strong" }, wt, 1000, lim), solid = scoreAnswer(w, { text: "x", judged: "Solid" }, wt, 1000, lim), weak = scoreAnswer(w, { text: "x", judged: "Needs more evidence" }, wt, 1000, lim);
  assert.ok(strong.correct && solid.correct && !weak.correct); assert.ok(strong.points > solid.points); assert.equal(weak.points, 0);
});

test("the written rubric by rule: a claim with the key ideas, the right sentence as evidence, and a word that connects them", () => {
  const { q } = find("written");
  assert.equal(writtenByRule(q, q.written!.model, true), "Strong");
  assert.equal(writtenByRule(q, "Everyone who lives in the Hollow starts to dream and see ghosts", true), "Solid", "no connecting word");
  assert.equal(writtenByRule(q, q.written!.model, false), "Needs more evidence", "the wrong sentence");
  assert.equal(writtenByRule(q, "It is a nice place.", true), "Needs more evidence");
  const v = ruleVerdict(q, "It is a nice place.", true); assert.ok(v.next.length > 0); assert.ok(!/wrong/i.test(v.note + v.next), "never \"wrong\"");
  // Live: whatever a phone sends as a verdict is dropped; the server judges.
  assert.match(src("lib/live/server.ts"), /const clean = \{ \.\.\.payload \}; delete clean\.__judged; delete clean\.__verdict;/);
  assert.match(src("lib/live/race.ts"), /judged: payload\.__judged === "Strong"/);
  assert.match(src("app/api/expedition/judge/route.ts"), /askedQuestion\(chunk, \{ bank: a\.bank, version: a\.version \}\)/, "the solo judge rebuilds the question on the server");
});

test("drag and drop: all 8 kinds, 3 to 5 pieces, one piece per slot where the kind needs it, each kind on its skill", () => {
  const lines = ["One sentence.", "Two sentence."];
  const base = (kind: DndKind, items: { id: string; slot: string | null; line?: string }[], slots = ["a", "b", "c"]): ExpQuestion => ({ type: DND_TYPE[kind], format: "dnd", prompt: "p", keywords: [], hint: "h", why: "w", standards: ["K12.EE.1.1"],
    dnd: { kind, slots: slots.map((id) => ({ id, label: id.toUpperCase() })), items: items.map((i) => ({ ...i, text: `Piece ${i.id}` })) } });
  for (const kind of Object.keys(DND_INFO) as DndKind[]) {
    const ok = base(kind, [{ id: "1", slot: "a", line: "One sentence." }, { id: "2", slot: "b" }, { id: "3", slot: "c" }]);
    assert.deepEqual(dndProblems("x", ok, lines), [], kind);
    assert.ok(DND_INFO[kind].how.length > 10);
  }
  assert.match(dndProblems("x", base("order_events", [{ id: "1", slot: "a" }, { id: "2", slot: "a" }, { id: "3", slot: "c" }]), lines).join(" "), /slot a holds one piece/);
  assert.match(dndProblems("x", base("sort_evidence", [{ id: "1", slot: "a" }, { id: "2", slot: "a" }]), lines).join(" "), /3 to 5 pieces/);
  assert.match(dndProblems("x", base("story_map", [{ id: "1", slot: "a", line: "Not here." }, { id: "2", slot: "b" }, { id: "3", slot: "c" }]), lines).join(" "), /not copied exactly/);
  assert.match(dndProblems("x", { ...base("word_feeling", [{ id: "1", slot: "a" }, { id: "2", slot: "b" }, { id: "3", slot: "c" }]), type: "find_it" }, lines).join(" "), /word_feeling practises shades/);
});

test("drag and drop on every device: tap to place, drag, the keyboard, every move announced, 44 px targets, the reveal", () => {
  const ui = src("app/drag-drop.tsx");
  assert.match(ui, /onClick=\{\(\)=>pick\(id\)\}/, "tap a piece to pick it up"); assert.match(ui, /onClick=\{e=>held&&place\(held,s\.id,e\.detail===0\)\}/, "then tap its slot");
  // On a phone the tray is a collapsed "Pieces" bar pinned above Lock in; picking a piece closes it.
  assert.match(ui, /max-md:sticky max-md:bottom-0/); assert.match(ui, /aria-expanded=\{trayOpen\}/); assert.match(ui, /if\(!placed\[item\]\)setTrayOpen\(false\)/);
  assert.match(ui, /draggable=\{!disabled\}/); assert.match(ui, /onDrop:/, "drag onto a slot");
  assert.match(ui, /role="status" aria-live="polite">\{said\}/, "moves are announced");
  assert.match(ui, /Picked up "\$\{label\(item\)\}"\. Now choose a slot\./); assert.match(ui, /Placed "\$\{label\(item\)\}" in \$\{slotLabel\(slot\)\}\./);
  assert.match(ui, /aria-pressed=\{held===id\}/); assert.match(ui, /min-h-11/, "44 px targets");
  assert.match(ui, /In the right place\./); assert.match(ui, /Moved to \$\{slotLabel/, "a wrong piece moves to its place");
  assert.match(ui, /reveal\.lines\[id\]/, "with the sentence that proves it");
  assert.match(src("app/globals.css"), /@media \(prefers-reduced-motion:reduce\)\{\.dnd-slide\{animation:none\}\}/);
});

test("the question bank: each student gets one question per chunk, the same on reload, another on a replay, and neighbours differ", () => {
  const c = e1.chunks[0];
  assert.equal(bankOf(c).length, 2);
  assert.equal(bankPick(c, "ana"), bankPick(c, "ana"), "stable");
  const picks = new Set(Array.from({ length: 30 }, (_, i) => bankPick(c, `student-${i}`))); assert.equal(picks.size, 2, "neighbours see different questions");
  assert.notEqual(bankPick(c, "ana", 0), bankPick(c, "ana", 1), "a replay gets the other question");
  // The question asked is recorded with its bank pick and version (Case Notes, live taps).
  assert.equal(askedQuestion(c, { bank: 1, version: "standard" }).prompt, c.bank![0].prompt);
  assert.match(src("app/expedition-race.tsx"), /const bankAt=\(i:number\)=>records\[i\]\?\.bank\?\?bankPick\(chunks\[i\]\.chunk,seedKey,replay\)/);
  assert.match(src("lib/live/race.ts"), /bank = bankPick\(c\.chunk, playerId\)/);
});

test("versions: easier drops a wrong choice and shows the hint; harder hides the highlights and asks for the proof", () => {
  const q = e1.chunks[2].question;
  const easier = versionOf(q, "easier"); assert.equal(easier.choices!.length, 2); assert.ok(easier.choices!.some((c) => c.best)); assert.equal(easier.showHint, true);
  const harder = versionOf(q, "harder"); assert.deepEqual(harder.keywords, []); assert.equal(harder.focus, undefined);
  const mc: ExpQuestion = { ...q, format: "mc" }; assert.equal(formatOf(versionOf(mc, "harder")), "two_part", "harder asks for the proof sentence");
  const d = find("dnd").q; if (d.dnd!.items.length > 3) assert.equal(versionOf(d, "easier").dnd!.items.length, d.dnd!.items.length - 1);
});

test("the Gist check comes about every third chunk", () => {
  assert.deepEqual(Array.from({ length: 10 }, (_, k) => k).filter(gistAt), [0, 3, 6, 9]);
  assert.ok(src("app/expedition-race.tsx").includes(`onClick={()=>{markHintDone("read");gistAt(k)?go("gist"):toQuestion()}}`));
  assert.match(src("lib/live/race.ts"), /beat: gistAt\(s\) \? "process" : asksHere\(round, s\) \? "ask" : "race"/);
});

test("Expeditions 1 and 2 rebuilt: a bank on every chunk, 4+ formats, 2 drag and drops never back to back, a written answer, the arc", () => {
  assert.deepEqual(expeditionProblems(sh, shp), []); assert.deepEqual(arcProblems(sh), []);
  for (const e of [e1, e2]) {
    assert.ok(e.chunks.every((c) => (c.bank?.length ?? 0) >= 1), `${e.id}: every chunk has 2 or 3 questions`);
    const f = e.chunks.map((c) => formatOf(c.question));
    assert.ok(new Set(f).size >= 4, `${e.id}: ${[...new Set(f)].join(", ")}`);
    const dnd = f.flatMap((x, k) => (x === "dnd" ? [k] : [])); assert.equal(dnd.length, 2); assert.ok(dnd[1] - dnd[0] > 1);
    assert.equal(f.filter((x) => x === "written").length, 1); assert.equal(f.filter((x) => x === "multi").length, 1);
    e.chunks.forEach((c, k) => { if (k) assert.notEqual(c.question.type, e.chunks[k - 1].question.type, `${e.id} chunks ${k} and ${k + 1}`); });
    assert.equal(e.lightning?.length, 2);
    assert.ok(!(sh.expedition_rules?.arc_pending ?? []).includes(e.id));
  }
  // Varied stems: no question frame repeats within an expedition, main or bank.
  for (const e of [e1, e2]) assert.deepEqual(variety(e.id, e), []);
  const bad = structuredClone(e1); bad.chunks[1].question.type = bad.chunks[0].question.type; bad.chunks[2].bank![0].prompt = bad.chunks[2].question.prompt;
  const p = variety(e1.id, bad).join(" | "); assert.match(p, /chunks 1 and 2 are both/); assert.match(p, /repeats/);
  // The review document lists the rebuilt content.
  assert.match(src("docs/game-content-review.md"), /Bank question/);
});

test("the review lessons hold: proof sentences, quoted words, quoted build-the-case proofs, real recall in lightning beats, and the discussion note", () => {
  // Every two-part or tap question proves with a whole sentence; words read from the story wear quotation marks.
  const noProof = structuredClone(e1); delete noProof.chunks[0].question.proof;
  assert.match(variety(e1.id, noProof).join(" | "), /chunk 1 question needs a proof sentence/);
  const unquoted = structuredClone(e2); unquoted.chunks[1].bank![0].prompt = "Read the words looked like a weather-cock. What kind of figurative language is this?";
  assert.match(variety(e2.id, unquoted).join(" | "), /quotation marks/);
  // Build the case: the proof piece quotes its sentence exactly; the claim doesn't repeat it.
  const bc = e2.chunks.flatMap((c) => bankOf(c)).find((q) => q.dnd?.kind === "build_case")!, lines = c2.flatMap((c) => c.lines.map((l) => l.text));
  assert.deepEqual(dndProblems("bc", bc, lines), []);
  const para = structuredClone(bc); para.dnd!.items.find((i) => i.slot === "proof")!.text = "His school earned little and would barely buy his bread";
  assert.match(dndProblems("bc", para, lines).join(" "), /quote its sentence exactly/);
  const echo = structuredClone(bc); echo.dnd!.items.find((i) => i.slot === "claim")!.text = "The revenue arising from his school was small";
  assert.match(dndProblems("bc", echo, lines).join(" "), /say the same thing/);
  // Lightning beats recall an earlier chunk, never the proof of the chunk just before the beat.
  for (const e of [e1, e2]) for (const l of e.lightning!) {
    assert.ok(l.chunk < l.after, `${e.id} ${l.id}`);
    const just = bankOf(e.chunks[l.after - 1]).flatMap((q) => [...(q.proof?.lines ?? []), ...(q.dnd?.items ?? []).flatMap((i) => (i.line ? [i.line] : []))]);
    assert.ok(!l.answer.some((a) => just.includes(a)), `${e.id} ${l.id}`);
  }
  const echoBeat = structuredClone(sh); const ex = echoBeat.expeditions![0]; ex.lightning![1] = { ...ex.lightning![1], chunk: 8, after: 8, answer: [ex.chunks[7].question.dnd!.items[0].line!] };
  const ep = expeditionProblems(echoBeat, shp).join(" | "); assert.match(ep, /recalls the proof of chunk 8, just before it/); assert.match(ep, /must recall a chunk before chunk 8/);
  // The discussion note travels with every question that mentions the old chief, and to the view the phones see.
  const chief = e1.chunks.flatMap((c) => bankOf(c)).filter((q) => JSON.stringify(q).includes("old chief"));
  assert.ok(chief.length >= 2 && chief.every((q) => /^Teacher note: Irving, writing in 1820, describes Native people through the stereotypes of his time/.test(q.note ?? "")));
  assert.match(src("lib/formats.ts"), /note: q\.note \?\? null/);
  assert.match(src("app/expedition-race.tsx"), /<QuestionNote text={vq.note}/); assert.match(src("app/live/race-live.tsx"), /<QuestionNote text={q.note}/); assert.match(src("app/after-race.tsx"), /<QuestionNote text={it.note}/);
  // The card takes its label from the note ("Teacher note"), so the wording shows exactly as written.
  assert.match(src("app/content-note.tsx"), /([A-Z][a-z]+(?: [a-z]+)? note)/);
});

test("clue words, grade codes, a written answer for everyone, and the choice and theme checks", async () => {
  const { cluesProve, clueTokens } = await import("../lib/expedition.ts");
  const { codesFor, gradeOf } = await import("../lib/best-standards.ts");
  const { parseExpSettings } = await import("../lib/live/race.ts");
  // Clue words: the retreat question's Part B is the clue words, never the word itself or the whole sentence.
  const k = e1.chunks.findIndex((c) => bankOf(c).some((q) => q.clues?.length)), q = bankOf(e1.chunks[k]).find((x) => x.clues?.length)!, tokens = chunkTokens(c1[k].lines);
  const clue = [...clueTokens(q, tokens)], focus = tokens.filter((t) => t.text.toLowerCase().startsWith(q.focus!)).map((t) => t.i);
  assert.ok(clue.length > 0 && clue.every((i) => !focus.includes(i)));
  assert.ok(cluesProve(q, tokens, clue.slice(0, 2)), "a couple of clue words prove it");
  assert.ok(!cluesProve(q, tokens, focus), "the word itself does not");
  assert.ok(!cluesProve(q, tokens, [clue[0], 0, 1, 2, 3]), "mostly other words do not");
  const r = scoreAnswer(q, { choice: q.choices!.findIndex((o) => o.best), words: clue }, tokens, 1000, lim); assert.ok(r.correct);
  assert.ok(!scoreAnswer(q, { choice: q.choices!.findIndex((o) => o.best), lines: [q.proof!.lines![0]] }, tokens, 1000, lim).correct, "tapping the sentence is not the clue words");
  // Grade codes: the class grade picks each benchmark's code; grade 7 by default; live settings carry the grade.
  assert.deepEqual(codesFor(["R.1.2", "K12.EE.1.1"], 9), ["ELA.9.R.1.2", "ELA.K12.EE.1.1"]);
  assert.deepEqual(codesFor(["R.1.2"], undefined), ["ELA.7.R.1.2"]); assert.equal(gradeOf("11"), 7);
  const live = parseExpSettings({ expeditionId: e1.id, grade: "8" }, sh)!; assert.equal(live.grade, 8); assert.equal(live.gradeBand, "6-8");
  assert.equal(parseExpSettings({ expeditionId: e1.id, gradeBand: "9-10" }, sh)!.grade, 9);
  assert.match(src("app/after-race.tsx"), /codesFor\(n\.standards,grade\)/); assert.match(src("lib/case-notes.ts"), /codesFor\(n\.standards, grade\)/);
  // A written answer every student reaches: one chunk whose every bank question is written.
  for (const e of [e1, e2]) assert.ok(e.chunks.some((c) => bankOf(c).every((x) => formatOf(x) === "written")), e.id);
  const noWrite = structuredClone(e1); const wk = noWrite.chunks.findIndex((c) => bankOf(c).every((x) => formatOf(x) === "written")); noWrite.chunks[wk].bank = [e1.chunks[0].question];
  assert.match(variety(e1.id, noWrite).join(" | "), /every student writes/);
  // No two choices share most of their words; theme questions ask about an idea.
  const twin = structuredClone(e1); twin.chunks[9].question.choices![1].text = twin.chunks[9].question.choices![0].text.replace(/\w+$/, "today");
  assert.match(variety(e1.id, twin).join(" | "), /share most of their words/);
  const trait = structuredClone(e2); const tq = bankOf(trait.chunks[9])[0]; tq.prompt = "In a single sentence, explain what Ichabod is proudest of."; tq.written!.model = "He is proudest of his singing voice.";
  const tp = variety(e2.id, trait).join(" | "); assert.match(tp, /an idea, not a character trait/); assert.match(tp, /states an idea, not a character's trait/);
});

test("content review of Expeditions 3 to 14: twists never repeat an interview lie, no vague key ideas, the teacher override, content-note heads-up, niggardly", async () => {
  const { provedFirstTry } = await import("../lib/case-notes.ts");
  const { VAGUE_KEY_WORDS } = await import("../lib/expedition-check.ts");
  const exps = sh.expeditions!;
  // No Catch the Lie testimony shares its disproving line with an interview lie in the same expedition.
  for (const e of exps) { const lies = new Set((e.interview?.witnesses ?? []).flatMap((w) => w.lie.lines));
    e.chunks.forEach((c, k) => bankOf(c).forEach((q) => { if (q.type === "catch_lie") assert.ok(!(q.proof?.lines ?? []).some((l) => lies.has(l)), `${e.id} chunk ${k + 1}`); })); }
  const twin = structuredClone(sh), e5 = twin.expeditions!.find((x) => x.id === "a-rival-appears")!, tk = e5.chunks.findIndex((c) => c.question.type === "catch_lie");
  e5.chunks[tk].question.proof = { lines: [e5.interview!.witnesses[0].lie.lines[0]] };
  assert.match(expeditionProblems(twin, shp).join(" | "), /disproved by the same line as an interview lie/);
  // The twist comes before the boss in Expedition 5.
  const a5 = arcProblems(sh); assert.deepEqual(a5, []);
  const r5 = sh.world_map!.regions.find((r) => r.expedition === "a-rival-appears")!;
  assert.ok(exps.find((x) => x.id === "a-rival-appears")!.chunks.findIndex((c) => c.question.type === "catch_lie") + 1 < r5.stops.find((s) => s.landmark === "boss")!.chunk);
  // Written key ideas carry the idea: none of the vague words.
  for (const e of exps) for (const c of e.chunks) for (const q of bankOf(c)) for (const g of q.written?.key_ideas ?? []) for (const w of g) assert.ok(!VAGUE_KEY_WORDS.includes(w.toLowerCase()), `${e.id}: "${w}"`);
  const vague = structuredClone(e1); const wq = bankOf(vague.chunks.find((c) => formatOf(c.question) === "written")!)[0]; wq.written!.key_ideas[0].push("see");
  assert.match(variety(e1.id, vague).join(" | "), /too vague/);
  // A teacher override replaces the judge's verdict on a written answer.
  assert.equal(provedFirstTry({ rightFirstTry: true, teacherVerdict: "Needs more evidence" }), false);
  assert.equal(provedFirstTry({ rightFirstTry: false, teacherVerdict: "Solid" }), true);
  assert.equal(provedFirstTry({ rightFirstTry: true, teacherVerdict: null }), true);
  assert.match(src("app/api/teacher/classes/[id]/written-override/route.ts"), /teacherVerdict = verdict/); assert.match(src("app/expedition-evidence.tsx"), /you can change the score/);
  // The host board warns the teacher one chunk before a content-noted passage.
  assert.match(src("app/live/race-live.tsx"), /aria-label="Teacher heads-up"/);
  // Expedition 9 chunk 5: the twist questions avoid the line with "niggardly", which is glossed in the passage.
  const c5 = exps.find((x) => x.id === "the-feast-and-the-dance")!.chunks[4];
  for (const q of bankOf(c5)) assert.ok(!(q.proof?.lines ?? []).some((l) => /niggardly/.test(l)));
  assert.equal(sh.glossary.find((g) => g.term === "niggardly")?.student_friendly_definition, "stingy (an old word, unrelated to any slur)");
  // The lightning beat in Expedition 4 no longer asks Katrina's age; Expedition 11's device label.
  assert.ok(!exps.find((x) => x.id === "the-van-tassel-farm")!.lightning!.some((l) => /old is Katrina/.test(l.question)));
  assert.ok(bankOf(exps.find((x) => x.id === "the-lonely-road")!.chunks[3]).some((q) => (q.choices ?? []).some((o) => o.text.startsWith("Metaphor (implied comparison)"))));
});
