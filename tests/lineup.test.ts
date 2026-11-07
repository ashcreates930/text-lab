// Phase 6: the character-select lineup (lib/lineup.ts, app/lineup.tsx) for the Interview, Name the Liar, the live host
// board and the investigator pick.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { allAsked, askedList, lineupKey, lineupWindow, nextUnasked, spotlightLabel, swipeStep, wrap, SWIPE_PX } from "../lib/lineup.ts";
import { liarCheck } from "../lib/interview.ts";
import { WorldPackSchema } from "../lib/world-schema.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));

test("the lineup: the spotlight in the middle, a dimmed neighbour on each side, wrapping round so any order works", () => {
  assert.deepEqual(lineupWindow(3, 0), [{ index: 2, slot: "left" }, { index: 0, slot: "center" }, { index: 1, slot: "right" }]);
  assert.deepEqual(lineupWindow(3, 2).map((w) => w.index), [1, 2, 0]);
  assert.deepEqual(lineupWindow(5, 4).map((w) => w.index), [3, 4, 0], "more characters (an investigator pick): a window of three");
  assert.deepEqual(lineupWindow(2, 1), [{ index: 1, slot: "center" }, { index: 0, slot: "right" }]);
  assert.deepEqual(lineupWindow(1, 0), [{ index: 0, slot: "center" }]);
  assert.deepEqual(lineupWindow(0, 0), []);
  assert.equal(wrap(-1, 3), 2); assert.equal(wrap(3, 3), 0);
});

test("keyboard and swipe move the spotlight; every move is announced", () => {
  assert.equal(lineupKey("ArrowRight", 2, 3), 0, "right wraps to the first");
  assert.equal(lineupKey("ArrowLeft", 0, 3), 2, "left wraps to the last");
  assert.equal(lineupKey("ArrowDown", 0, 3), 1); assert.equal(lineupKey("ArrowUp", 1, 3), 0);
  assert.equal(lineupKey("Home", 2, 3), 0); assert.equal(lineupKey("End", 0, 3), 2);
  assert.equal(lineupKey("Enter", 0, 3), null, "other keys do nothing (Enter still presses the focused button)");
  assert.equal(swipeStep(-SWIPE_PX), 1, "swipe left: the next one"); assert.equal(swipeStep(SWIPE_PX + 10), -1, "swipe right: the one before");
  assert.equal(swipeStep(-20), 0, "a small drag is not a swipe"); assert.equal(swipeStep(-60, 120), 0, "scrolling the page is not a swipe");
  assert.equal(spotlightLabel("Brom Bones", 1, 3, true), "Brom Bones, 2 of 3, asked");
  assert.equal(spotlightLabel("Hans Van Ripper", 0, 3, false), "Hans Van Ripper, 1 of 3, not asked yet");
  assert.equal(spotlightLabel("Katrina Van Tassel", 2, 3), "Katrina Van Tassel, 3 of 3");
  const ui = src("app/lineup.tsx");
  assert.match(ui, /onKeyDown=\{onKey\}/); assert.match(ui, /onPointerUp=\{onUp\}/, "swipe");
  assert.match(ui, /role="status" aria-live="polite">\{said\}/, "moves are announced");
  assert.match(ui, /aria-label=\{`Spotlight \$\{spotlightLabel/, "each dimmed neighbour is a labelled button");
  assert.match(ui, /tabIndex=\{interactive\?0:undefined\}/, "the lineup takes focus for the arrow keys");
});

test("the Interview: all witnesses required before the race, any order, the Asked check, replay with captions", () => {
  assert.deepEqual(askedList([0, undefined, 1], 3), [true, false, true]);
  assert.equal(allAsked([0, null, 1], 3), false); assert.equal(allAsked([1, 0, 1], 3), true); assert.equal(allAsked([], 0), false);
  assert.equal(nextUnasked([0, null, null], 3, 0), 1); assert.equal(nextUnasked([null, 1, 0], 3, 2), 0, "wraps round");
  assert.equal(nextUnasked([0, 1, 0], 3, 1), null, "all asked");
  const iv = src("app/interview.tsx");
  assert.match(iv, /<Lineup items=\{items\} index=\{k\} onIndex=\{spotlight\}/, "one continuous stage");
  assert.match(iv, /check:asked\[i\]\?"Asked":null/, "the Asked check");
  assert.match(iv, /\{done\?<button type="button" onClick=\{start\}/, "Start the race only once every witness is asked");
  assert.ok(!/Next witness/.test(iv), "no fixed witness order");
  assert.match(iv, /Hear it again/); assert.match(iv, /<Caption name=\{name\} text=\{st\.text\}\/>/, "a replay keeps the caption on");
  assert.match(iv, /useLayoutEffect\(\(\)=>\{focusScreenTop\(\)\},\[\]\);/, "moving the spotlight keeps focus and scroll (only the first view focuses the heading)");
});

test("Name the Liar on the same lineup: name the suspect, then the sentence; the same win rule", () => {
  const e = sh.expeditions!.find((x) => x.interview)!, iv = e.interview!, w = iv.witnesses[1], other = iv.witnesses[0];
  assert.equal(liarCheck(iv, 1, { liar: w.character, line: w.lie.lines[0] }).solved, true, "the liar and the line: solved");
  assert.equal(liarCheck(iv, 1, { liar: other.character, line: w.lie.lines[0] }).solved, false, "the right line, the wrong witness");
  assert.equal(liarCheck(iv, 1, { liar: w.character, line: "Not a proof line." }).solved, false, "the right witness, the wrong line");
  const ui = src("app/interview.tsx");
  assert.match(ui, /<Lineup items=\{items\} index=\{spot\} onIndex=\{setSpot\}[^>]*threeD=\{false\}/, "the lineup, portraits only");
  assert.match(ui, /Name \$\{sp\.short\} as the liar/, "naming sits in the footer with Next, in view on a phone");
  assert.match(ui, /onLock\(\{liar:pick,line\}\)/, "the same lock-in");
  assert.match(src("app/live/interview-live.tsx"), /locked=\{!!me\?\.locked\}/, "live: a private lock-in on each phone");
});

test("live and the lobby: the host board spotlights the witness being questioned; the investigator pick uses the lineup", () => {
  const host = src("app/live/interview-live.tsx");
  assert.match(host, /<Lineup interactive=\{false\}[^>]*index=\{iv\.witness\?\?0\}/, "the host board: the stage with the questioned witness in the spotlight");
  assert.match(host, /check:iv\.said\[i\]\?"Asked":null/);
  assert.match(host, /onClick=\{\(\)=>act\("interview_vote",\{card:i\}\)\}/, "phones: the cards and the vote");
  const lobby = src("app/live/race-live.tsx");
  // A slow refresh that started before a tap can't overwrite the tap's answer (the pick flipping back to "Play as").
  const live = src("app/live/use-live.ts");
  assert.match(live, /const at=stamp\.current;/); assert.match(live, /if\(at!==stamp\.current\)return;/); assert.match(live, /setState:setFresh/);
  assert.match(lobby, /Pick your investigator/); assert.match(lobby, /<Lineup items=\{state\.avatars\.map/); assert.match(lobby, /Play as \$\{a\.name\}/);
});

test("motion: the 3D witness reacts on entering the spotlight, portraits breathe, and all of it stops under reduced motion", () => {
  const ui = src("app/lineup.tsx"), css = src("app/globals.css"), stage = src("app/character-stage.tsx");
  assert.match(ui, /if\(cur\.model&&threeD&&!reducedMotion\(\)\)/, "a reaction only for a 3D character, never under reduced motion");
  assert.match(stage, /reduced\.current\?"":clip!=="idle"\?"portrait-talk":"portrait-idle"/, "portraits: a slow idle, a bob while talking");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.portrait-idle,\.lineup-in\{animation:none\}\}/);
  assert.match(stage, /if\(detectStage\(\)==="portrait"\)/, "the WebGL fallback stays");
  // No world-specific logic: the reaction comes from the character's own model data.
  for (const f of ["app/lineup.tsx", "app/interview.tsx", "app/live/interview-live.tsx"]) assert.ok(!/brom|katrina|hans/i.test(src(f)), f);
});

test("the Interview speed-up: the caption shows at once, Skip stops the recording and counts the answer as heard", () => {
  const iv = src("app/interview.tsx");
  assert.match(iv, /function ask\(i:number\)\{setCards\(c=>\{const x=\[\.\.\.c\];x\[k\]=i;return x\}\);setFocusTo\("asked"\);speak\(\)\}/, "asking sets the card, so the caption renders with the audio");
  assert.match(iv, /:<><p ref=\{askedRef\}[^\n]*\n\s*<Caption name=\{name\} text=\{st\.text\}\/>/, "the caption is on screen while the line plays");
  assert.match(iv, /function skip\(\)\{voice\.stop\(\);setGesture\(null\);setHeard\(h=>\{const x=\[\.\.\.h\];x\[k\]=true;return x\}\)\}/);
  assert.match(iv, /\{speaking\?<button type="button" onClick=\{skip\}/, "Skip shows while the witness speaks");
  // Lines longer than one sentence keep their recorded audio; they are listed for later, not trimmed.
  const list = src("docs/interview-lines-to-trim.md");
  assert.match(list, /^\d+ lines\.$/m);
  for (const e of sh.expeditions!) for (const w of e.interview?.witnesses ?? []) for (const t of [w.truth.text, w.lie.text, w.caught])
    if ((t.match(/[.!?]["”]?(?=\s|$)/g) ?? []).length > 1) assert.ok(list.includes(t.replace(/\|/g, "\|")), `listed: ${t.slice(0, 40)}`);
});
