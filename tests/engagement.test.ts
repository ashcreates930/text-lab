// Engagement (classroom testing, 2026-11-19): reading is the gameplay. lib/engagement.ts and lib/dok.ts, and the
// screens that use them.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { QUESTION_TYPES } from "../lib/world-schema.ts";
import { chestFor, engagementProblems, hintStep, KIT, lanternLevel, pointerText, proofParagraph, questionFirst } from "../lib/engagement.ts";
import { DOK_BY_TYPE, dokFromNote, dokOf } from "../lib/dok.ts";
import { TYPE_INFO } from "../lib/expedition.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const ps = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const src = (f: string) => readFileSync(f, "utf8");

test("every question has a Depth of Knowledge level; a question's own dok wins; old notes map from their type", () => {
  for (const t of QUESTION_TYPES) assert.ok([1, 2, 3].includes(DOK_BY_TYPE[t]), t);
  assert.equal(dokOf({ type: "find_it" } as never), 1); assert.equal(dokOf({ type: "between_lines" } as never), 3);
  assert.equal(dokOf({ type: "find_it", dok: 2 } as never), 2);
  for (const e of world.expeditions!) for (const c of e.chunks) for (const q of [c.question, ...(c.bank ?? [])]) assert.ok(dokOf(q) >= 1 && dokOf(q) <= 4);
  assert.equal(dokFromNote({ type: TYPE_INFO.word_detective.name }), 2); assert.equal(dokFromNote({ type: "x", format: "written" }), 3); assert.equal(dokFromNote({ type: "x", dok: 1 }), 1);
});

test("the story frame: the essential question, four concepts (teasers), a teacher-only synopsis, Room 1's plain words and vocabulary", () => {
  const e = world.engagement!;
  assert.equal(e.essential_question, "Why do people believe stories they can't prove?");
  assert.deepEqual(e.key_concepts.map((c) => c.name), ["Belief", "Fear", "Rivalry", "Appearances"]);
  assert.deepEqual(Object.keys(e.plain_words).sort(), ["p003", "p004", "p005", "p006", "p007", "p008", "p009"]);
  assert.equal(world.rooms![0].vocab!.length, 6);
  // The synopsis is only in the teacher view (lib/expedition-progress.ts story), never on a student screen.
  for (const f of ["app/story-opening.tsx", "app/expedition-map.tsx", "app/expedition-race.tsx", "app/live/race-live.tsx", "app/room-ui.tsx"]) assert.doesNotMatch(src(f), /synopsis/, f);
  assert.match(src("app/expedition-evidence.tsx"), /Synopsis \(teacher view only\)/);
});

test("the validator: vocab words are in their lines, nothing from content-noted paragraphs, every proof paragraph has a topic", () => {
  assert.deepEqual(engagementProblems(world, ps), []);
  const bad = structuredClone(world); bad.rooms![0].vocab![0].word = "zeppelin";
  assert.match(engagementProblems(bad, ps).join(), /vocab "zeppelin" isn't in its line/);
  const noted = structuredClone(world); noted.engagement!.passage_topics.p047 = "the dance";
  assert.match(engagementProblems(noted, ps).join(), /content-noted p047/);
  const gap = structuredClone(world); delete gap.engagement!.passage_topics.p010;
  assert.match(engagementProblems(gap, ps).join(), /paragraph p010 has no topic/);
  for (const p of ["p034", "p047", "p048"]) { assert.equal(world.engagement!.passage_topics[p], undefined); assert.equal(world.engagement!.plain_words[p], undefined); }
});

test("after a miss: a pointer to the paragraph by topic, then the paragraph, then the line", () => {
  assert.deepEqual([0, 1, 2, 5].map(hintStep), ["pointer", "paragraph", "line", "line"]);
  assert.equal(pointerText(world, "p004", 4), "It's in the paragraph about the narrator's boyhood hunt in the walnut grove. Find the line.");
  assert.equal(pointerText({ engagement: undefined }, "p004", 4), "It's in paragraph 4. Find the line.");
  const lines = [{ pid: "p003" }, { pid: "p003" }, { pid: "p004" }, { pid: "p004" }, { pid: "p004" }];
  assert.deepEqual(proofParagraph(lines, [3]), { pid: "p004", paraLines: [2, 3, 4], paraNumber: 4 });
  const ui = src("app/room-ui.tsx");
  // Nothing outlined and no answer at first; the paragraph after one wrong tap; the line and the answer only after two.
  assert.match(ui, /const lit=step==="pointer"\?\[\]:step==="paragraph"\?\(paraLines\.length\?paraLines:\[\]\):shownLines;/);
  assert.match(ui, /\{full&&answerText&&<p/); assert.match(ui, /\{full&&reveal\}/);
  assert.match(ui, /if\(!ok\)setLevel\(l=>Math\.min\(HINT_STEPS-1,l\+1\)\)/);
  // The solo miss screen no longer shows the key above the panel (only for a written seal, whose key is a model).
  const race = src("app/expedition-race.tsx");
  assert.match(race, /\{formatOf\(q\)==="written"&&<FormatResult q=\{q\}/);
  assert.match(race, /reveal=\{formatOf\(q\)==="written"\?null:<FormatResult/);
  // Live: the drag-and-drop key and the choose-two answers wait until the lock is open.
  const live = src("app/live/race-live.tsx");
  assert.match(live, /\{\(mine\.tap\?\.correct\|\|mine\.opened\)&&q\?\.format==="dnd"/); assert.match(live, /\{\(mine\.tap\?\.correct\|\|mine\.opened\)&&q\?\.format==="multi"/);
  assert.match(live, /paraLines=\{ownPara\.paraLines\} pointer=\{pointerText\(world,ownPara\.pid,ownPara\.paraNumber\)\}/);
});

test("the lantern: first-try proofs brighten it, misses dim it, it never goes out; it shows in solo and live", () => {
  assert.equal(lanternLevel([]), 3); assert.equal(lanternLevel([true, true, true, true]), 5); assert.equal(lanternLevel([false, false, false, false]), 1);
  assert.equal(lanternLevel([true, false, null, true]), 4);
  assert.match(src("app/expedition-race.tsx"), /\{lantern!==null&&<LanternFog level=\{lantern\}\/>\}/);
  assert.match(src("app/live/race-live.tsx"), /const hud=<RaceHud lantern=\{lantern\}/);
  assert.match(src("app/atmosphere.tsx"), /pointer-events-none fixed inset-0/, "the fog never takes a tap");
});

test("the chest: only after a first-try proof, never after a miss; seeded; coins or a kit piece not yet owned", () => {
  for (let i = 0; i < 50; i++) assert.equal(chestFor(`s${i}`, false, []), null);
  const all = Array.from({ length: 400 }, (_, i) => chestFor(`seed-${i}`, true, []));
  const shown = all.filter(Boolean).length; assert.ok(shown > 150 && shown < 250, `about half: ${shown}`);
  assert.ok(all.some((c) => c?.piece), "some hold a kit piece"); assert.ok(all.some((c) => c && c.coins > 0), "some hold coins");
  assert.deepEqual(chestFor("same", true, []), chestFor("same", true, []), "a replay can't reroll it");
  const owned = KIT.map((k) => k.id).slice(0, 7);
  for (let i = 0; i < 200; i++) { const c = chestFor(`o${i}`, true, owned); if (c?.piece) assert.equal(c.piece, KIT[7].id); }
  for (let i = 0; i < 200; i++) { const c = chestFor(`f${i}`, true, KIT.map((k) => k.id)); assert.ok(!c?.piece, "nothing left: coins only"); }
  // Saved with the room, so a resume can't reopen it; the kit shows on the map.
  assert.match(src("app/expedition-race.tsx"), /resume:\{v:1,bonus:bonusFound,chests,/);
  assert.match(src("app/expedition-map.tsx"), /<KitShelf worldId=\{world\.id\}\/>/);
});

test("question first for hook locks (two-key, choose two, theme thread); puzzle locks stay after the reading", () => {
  let hooks = 0;
  for (const e of world.expeditions!) for (const c of e.chunks) { if (questionFirst(c.question)) hooks++; if (c.question.type === "theme_thread") assert.ok(questionFirst(c.question)); }
  assert.ok(hooks > 0);
  assert.match(src("app/expedition-race.tsx"), /\{q&&questionFirst\(q\)&&<ReadFor prompt=\{q\.prompt\}\/>\}/);
  assert.match(src("lib/live/server.ts"), /const hookPrompt = round\.beat === "read" && mineAsked && questionFirst\(mineAsked\) \? mineAsked\.prompt : null;/);
});

test("read to me and plain words on every passage; answers still proved with the original line", () => {
  const ct = src("app/expedition-race.tsx");
  assert.match(ct, /\{!large&&<div className="mb-2"><PassageTools lines=\{chunk\.lines\}/);
  assert.match(ct, /\{plainOpen&&!large&&<PlainWords lines=\{chunk\.lines\} world=\{world\}\/>\}/);
  const ra = src("app/read-aloud.tsx");
  assert.match(ra, /u\.onstart=\(\)=>onLine\(k\);u\.onend=\(\)=>say\(k\+1\)/, "one sentence at a time, each lit as it's read");
  assert.match(ra, /Prove your answers with the story's own words above, not these\./);
  assert.match(src("app/atmosphere.tsx"), /export function Ambience\(\{on\}/);
});

test("Fix the Painting: brass rings, no number bubbles; after a pick, only the lines of the chunks the detail draws on", () => {
  const pz = src("app/puzzle-locks.tsx");
  assert.match(pz, /\{!painting&&<span aria-hidden className=\{`absolute -right-2 -top-2/);
  assert.match(pz, /painting\?"border-gold bg-deep text-ink"/);
  assert.match(pz, /const paras=new Set\(refs\.map\(r=>r\.p\)\)/, "the whole paragraph the detail comes from");
  assert.match(pz, /const near=cur\?groupOf\(cur\.lines\):null,detailLines=near\?lines\.filter\(l=>near\.has\(refKey\(l\.r\)\)\):lines;/);
  assert.match(src("lib/live/server.ts"), /readChunks: p\.readChunks/);
});

test("navigation: the next stop is bigger with an arrow on a first visit (map and scenes); the last door asks the essential question", () => {
  assert.match(src("app/world-map.tsx"), /R=st==="next"\?R0\*1\.4:R0/); assert.match(src("app/world-map.tsx"), /\{st==="next"&&firstVisit&&<MapArrow/);
  assert.match(src("app/room-scene-view.tsx"), /state==="next"\?"h-16 w-16":"h-12 w-12"/);
  assert.match(src("app/expedition-race.tsx"), /function toExit\(\)\{if\(!nextRoom&&world\.engagement&&!essential\)go\("essential"\)/);
  assert.match(src("app/story-opening.tsx"), /ok=words>=6&&lines\.length>=1/, "an answer and at least one Case File line");
});

test("plain words: tested words kept exactly as Irving wrote them, marked; no correct answer's key words; no ready-made written answer", async () => {
  const { plainProblems } = await import("../lib/engagement.ts");
  assert.deepEqual(plainProblems(world, ps), []);
  const P = world.engagement!.plain_words;
  assert.match(P.p004, /\[\[stripling\]\]/); assert.match(P.p004, /\[\[retreat\]\]/); assert.match(P.p005, /\[\[listless\]\]/); assert.match(P.p005, /\[\[drowsy\]\]/);
  assert.doesNotMatch(P.p003, /promise|not sure|can't be sure/i, "p003 doesn't state the narrator's uncertainty (lock 1)");
  assert.match(P.p003, /"Be that as it may, I do not vouch for the fact/, "Irving's own sentence, quoted");
  // The rule catches each kind of giveaway.
  const para = structuredClone(world); para.engagement!.plain_words.p004 = para.engagement!.plain_words.p004.replace("[[stripling]]", "young boy");
  assert.match(plainProblems(para, ps).join(), /keep the tested word "stripling"/);
  const give = structuredClone(world); give.engagement!.plain_words.p003 += " He can't promise it's true.";
  assert.match(plainProblems(give, ps).join(), /gives away the answer "Not sure/);
  const seal = structuredClone(world); seal.engagement!.plain_words.p008 = "Anyone who settles there starts to dream and imagine things.";
  assert.match(plainProblems(seal, ps).join(), /ready-made answer to the written seal/);
  // On screen the marked word is highlighted, as Irving wrote it.
  assert.match(src("app/read-aloud.tsx"), /title="Irving's own word">\{m\[1\]\}<\/b>/);
});

test("Plain words open is recorded with the answer (solo and live) and shown in Evidence", () => {
  const race = src("app/expedition-race.tsx");
  assert.match(race, /next\[k\]=\{plain:plainAt===k,/); assert.match(race, /<PlainWordsState\.Provider value=\{\{open:plainAt===k,/);
  assert.match(src("lib/case-notes.ts"), /plainWords: !!r\?\.plain/);
  assert.match(src("app/api/student/expeditions/route.ts"), /plainWords: z\.boolean\(\)\.optional\(\)/);
  assert.match(src("app/live/race-live.tsx"), /act\("race_tap",\{answer:a,plain:plainAt===round\.step\}\)/);
  assert.match(src("lib/live/race.ts"), /plain: payload\.plain === true/);
  assert.match(src("app/expedition-evidence.tsx"), /Plain words open when they answered/); assert.match(src("app/expedition-evidence.tsx"), /Answered with Plain words open/);
});

test("live chests: the server decides the reward, only after a first-try proof, opened once", async () => {
  const { liveChest, chestCoinsOf } = await import("../lib/live/race.ts");
  const none = liveChest([], 0, "p1", 2, false); assert.equal(none, null, "never after a miss");
  let found = null as null | ReturnType<typeof liveChest>, pid = "";
  for (let i = 0; i < 40 && !found; i++) { found = liveChest([], 0, `player-${i}`, 1, true); pid = `player-${i}`; }
  assert.ok(found && !found.opened);
  const opened = [{ id: "r", roundIndex: 0, squadId: null, playerId: pid, role: "player", kind: "race_chest", payload: { step: 1, coins: found!.chest.coins, piece: found!.chest.piece }, flagged: false, createdAt: "" }];
  assert.equal(liveChest(opened as never, 0, pid, 1, true)!.opened, true);
  assert.equal(chestCoinsOf(opened as never, pid), found!.chest.coins);
  assert.match(src("lib/live/race.ts"), /if \(kind === "race_chest"\) \{[\s\S]{0,400}const c = liveChest\(responses, roundIndex, playerId, round\.step, !!me\.correct\);/, "the phone's claim is never trusted");
  assert.match(src("app/api/live/sessions/[id]/act/route.ts"), /"race_chest"/);
  assert.match(src("app/live/race-live.tsx"), /(round.beat==="board"||round.beat==="countdown")&&race.chest&&<div className="mb-3"><ChestCard/, "still there after the short reveal");
});

test("the live board lights only the paragraph until every student has opened their lock", () => {
  assert.match(src("lib/live/race.ts"), /const stillFinding = players\.filter\(\(p\) => !playerChunk\(responses, roundIndex, chunk\.index, p\.id\)\.opened\)\.length;/);
  assert.match(src("app/live/race-live.tsx"), /\(round\.reveal\.stillFinding\?\?0\)>0\?<>/);
  assert.match(src("app/live/race-live.tsx"), /outline=\{boardPara\(round\.chunk\.lines,tokens,round\.reveal\.lines\)\} large\/>/);
});
