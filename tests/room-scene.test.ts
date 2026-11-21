// Explorable scenes (lib/room-scene.ts): one painted scene per chamber; one literal item per lock in story order;
// bonus items with a reading task; witnesses, puzzles and doors as places. No item or bonus item comes from a simile or
// metaphor.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { lineAt } from "../lib/escape-room.ts";
import { bonusOpen, bonusRight, literalIn, sceneOf, sceneProblems } from "../lib/room-scene.ts";
import { lineTokens } from "../lib/escape-room.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const ps = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const edit = (f: (w: WorldPack) => void) => { const w = structuredClone(world); f(w); return sceneProblems(w, ps).join("\n"); };
const s2 = (w: WorldPack) => w.rooms!.find((r) => r.expedition === "into-the-hollow")!.scenes!.find((s) => s.chamber === 2)!;
const s1 = (w: WorldPack) => w.rooms!.find((r) => r.expedition === "into-the-hollow")!.scenes!.find((s) => s.chamber === 1)!;

test("Room 1's two scenes pass every scene rule, and their paintings exist", () => {
  assert.deepEqual(sceneProblems(world, ps), []);
  for (const c of [1, 2]) { const sc = sceneOf(world, "into-the-hollow", c)!; assert.ok(existsSync("public" + sc.art), sc.art); assert.equal(sc.items.length, 5); }
});

test("literal, never figurative: a comparison sentence, a like/as if clause, or the chunk's figurative phrase is refused", () => {
  const p9 = lineAt(ps, { p: "p009", s: 1 })!; // "They are like those little nooks of still water ... the straw and bubble ..."
  assert.equal(literalIn(p9, "straw"), false);
  const p6 = lineAt(ps, { p: "p006", s: 3 })!; // "... buried in the churchyard ... like a midnight blast ..."
  assert.equal(literalIn(p6, "churchyard"), true, "its first churchyard is literal");
  assert.equal(literalIn(p6, "blast"), false, "inside 'like a midnight blast'");
  const p61 = lineAt(ps, { p: "p006", s: 1 })!; // "... cannon-ball ... as if on the wings of the wind."
  assert.equal(literalIn(p61, "cannon-ball"), true); assert.equal(literalIn(p61, "wind"), false);
  const p7 = lineAt(ps, { p: "p007", s: 0 })!;
  assert.equal(literalIn(p7, "shadows", "region of shadows"), false, "the chunk's figurative discovery"); assert.equal(literalIn(p7, "firesides", "region of shadows"), true);
  // In the data: the still pool from the ¶9 comparison is refused as lock 10's item.
  assert.match(edit((w) => { const it = s2(w).items.find((i) => i.lock === 10)!; it.line = { p: "p009", s: 1 }; it.subject = ["straw"]; }), /old-trees comes from a simile or metaphor/);
  assert.match(edit((w) => { s2(w).bonus[0].line = { p: "p006", s: 3 }; s2(w).bonus[0].subject = ["blast"]; s2(w).bonus[0].word = "daybreak"; }), /comes from a simile or metaphor/);
  // A metaphor with no "like" or "as if" ("a drowsy, dreamy influence seems to hang over the land") is caught by the
  // story's list of figurative phrases.
  assert.match(edit((w) => { s1(w).items[3].line = { p: "p005", s: 1 }; s1(w).items[3].subject = ["influence"]; }), /glen comes from a simile or metaphor/);
  assert.match(edit((w) => { w.expedition_rules!.figurative = w.expedition_rules!.figurative!.filter((x) => x.p !== "p005" || x.s !== 1); s1(w).items[3].line = { p: "p005", s: 1 }; s1(w).items[3].subject = ["influence"]; }), /^$/, "without the list entry the heuristic alone can't tell");
});

test("one item per lock in the chamber, in its own reading; spots inside the picture; witnesses and puzzles of this chamber", () => {
  assert.match(edit((w) => { s1(w).items.pop(); }), /lock 5 needs exactly one item \(has 0\)/);
  assert.match(edit((w) => { s1(w).items[0].line = { p: "p004", s: 0 }; s1(w).items[0].subject = ["grove"]; }), /item inn's line p004:0 isn't in lock 1's reading/);
  assert.match(edit((w) => { s1(w).items[0].x = 120; }), /item inn sits outside the picture/);
  assert.match(edit((w) => { s1(w).witnesses.push({ character: "brom-bones", x: 50, y: 50 }); }), /brom-bones is met at lock 7, not in chamber 1/);
  assert.match(edit((w) => { s1(w).puzzles.push({ id: "churchyard-at-dusk", x: 50, y: 50 }); }), /churchyard-at-dusk belongs to the other chamber/);
  assert.match(edit((w) => { s1(w).puzzles.push({ id: "glen-gate", x: 50, y: 50 }); }), /inner door's code lock/);
});

test("bonus items: a reading task whose answer word appears once and whose question doesn't repeat the line; open only after their lock", () => {
  assert.match(edit((w) => { s1(w).bonus[0].word = "a"; }), /must appear once in its line/);
  assert.match(edit((w) => { s1(w).bonus[1].question = "Which bird is the woodpecker?"; }), /question repeats words from its line/);
  const b = s1(world).bonus.find((x) => x.id === "woodpecker")!, line = lineAt(ps, b.line)!;
  const right = lineTokens(line).findIndex((t) => /woodpecker/i.test(t.key));
  assert.equal(bonusRight(b, line, right), true); assert.equal(bonusRight(b, line, 0), false);
  // The woodpecker's line is lock 2's reading: closed until lock 2 is open.
  assert.equal(bonusOpen(world, ps, "into-the-hollow", b, (k) => k < 1), false);
  assert.equal(bonusOpen(world, ps, "into-the-hollow", b, (k) => k <= 1), true);
});

test("the solo room: a chamber with a scene returns to it after each lock, and the student taps what glows next", () => {
  const race = readFileSync("app/expedition-race.tsx", "utf8"), view = readFileSync("app/room-scene-view.tsx", "utf8");
  assert.match(race, /function toLock\(n:number\)\{if\(sceneFor\(n\)\)\{setK\(n\);setMeeting\(null\);go\("scene"\)\}else startChunk\(n\)\}/);
  assert.match(race, /\}else toLock\(k\+1\)\}\}\},100\);/, "after the countdown: back to the scene");
  assert.match(race, /onOpen=\{\(\)=>\{if\(iv&&!inRoom\(iv\)&&!\(restored&&cards\.length\)\)go\("interview"\);else toLock\(k\)\}\}/);
  assert.match(race, /exitAtDoor\.current=true;go\("scene"\)/, "the exit door is a place in the scene");
  assert.match(race, /resume:\{v:1,bonus:bonusFound,/); assert.match(race, /bonusFound\.length\*BONUS_COINS/);
  // Markers stay subtle: a brass (gold) ring with a soft glow on the next spot, a small check on opened ones.
  assert.match(view, /scene-glow/); assert.match(view, /border-\[3px\][\s\S]{0,60}border-gold/); assert.doesNotMatch(view, /#[0-9a-fA-F]{6}/);
  assert.match(view, /aria-label="Everything in this chamber"/, "every spot is also a button in a list");
  assert.match(view, /Not that word\. Read the line again\./); assert.match(view, /Found it\. The coins are yours\./);
});

test("Rooms 2 to 6 have their two painted scenes (approved 2026-11-21: Rooms 2 and 3); a code-dial answer never appears in a scene's words", () => {
  for (const id of ["the-schoolmaster", "tales-by-the-fire", "the-van-tassel-farm", "a-rival-appears", "the-feud", "the-invitation", "the-ride-to-the-party", "the-feast-and-the-dance", "ghost-stories", "the-lonely-road", "the-headless-horseman", "gone", "the-postscript"]) for (const c of [1, 2]) {
    const sc = sceneOf(world, id, c)!; assert.ok(sc, `${id} chamber ${c}`); assert.ok(existsSync("public" + sc.art), sc.art); assert.deepEqual(sc.witnesses, [], "no witness painted in");
  }
  // Punishment is never a spot (Room 2 lock 5 is the school itself).
  const r2 = sceneOf(world, "the-schoolmaster", 1)!; assert.equal(r2.items.find((i) => i.lock === 5)!.label, "The one-room school");
  assert.ok(!r2.items.some((i) => /rod|birch rod/i.test(i.label)));
  // "clover" is a dial on Room 3's code lock, so lock 5's spot is the little brook; naming it would be caught.
  const r3 = (w: WorldPack) => w.rooms!.find((r) => r.expedition === "tales-by-the-fire")!.scenes![0];
  assert.equal(r3(world).items.find((i) => i.lock === 5)!.label, "The little brook");
  assert.match(edit((w) => { r3(w).items[4].label = "The clover by the brook"; }), /"clover" is a code-dial answer/);
  assert.match(edit((w) => { r3(w).bonus[0].alt = "Old tombstones and a patch of clover"; }), /"clover" is a code-dial answer/);
});

test("a plain marker paints nothing and rests on no line: Room 5's daydream and Room 6's narrator's aside (2026-11-21)", () => {
  const item = (id: string, c: number, lock: number) => sceneOf(world, id, c)!.items.find((i) => i.lock === lock)!;
  assert.deepEqual([item("a-rival-appears", 1, 2).marker, item("a-rival-appears", 1, 2).line, item("a-rival-appears", 1, 2).label], [true, undefined, "Ichabod's daydream"]);
  assert.deepEqual([item("the-feud", 2, 8).marker, item("the-feud", 2, 8).line, item("the-feud", 2, 8).label], [true, undefined, "The narrator's aside"]);
  const f2 = (w: WorldPack) => w.rooms!.find((r) => r.expedition === "the-feud")!.scenes![1].items.find((i) => i.lock === 8)!;
  assert.match(edit((w) => { f2(w).line = { p: "p032", s: 0 }; f2(w).subject = ["women"]; }), /plain marker, so it rests on no line or subject/);
  assert.match(edit((w) => { delete f2(w).marker; }), /needs its line and subject \(or is a plain marker\)/);
  assert.doesNotMatch(sceneOf(world, "the-feud", 2)!.alt, /young women/);
});

test("a lock whose reading is all content-noted is a plain marker: Room 7 locks 3 and 4 (¶34), Room 9 locks 7 to 9 (¶47 and ¶48)", () => {
  const noted = new Set(world.storybook?.ai_exclude ?? []);
  for (const [id, locks] of [["the-invitation", [3, 4]], ["the-feast-and-the-dance", [7, 8, 9]]] as const) {
    const items = world.rooms!.find((r) => r.expedition === id)!.scenes!.flatMap((s) => s.items);
    for (const k of locks) { const it = items.find((i) => i.lock === k)!; assert.equal(it.marker, true, `${id} lock ${k}`); assert.equal(it.line, undefined); }
  }
  // No item or bonus anywhere rests on a content-noted paragraph.
  for (const r of world.rooms!) for (const s of r.scenes ?? []) for (const x of [...s.items, ...s.bonus]) assert.ok(!x.line || !noted.has(x.line.p), `${r.expedition}: ${x.id}`);
  // Room 7 lock 5 rests on its one sentence outside ¶34.
  const l5 = world.rooms!.find((r) => r.expedition === "the-invitation")!.scenes![0].items.find((i) => i.lock === 5)!;
  assert.deepEqual(l5.line, { p: "p035", s: 0 });
});

test("every room in the story now has its two painted scenes (2026-11-21)", () => {
  for (const e of world.expeditions!) for (const c of [1, 2]) assert.ok(sceneOf(world, e.id, c), `${e.id} chamber ${c}`);
});
