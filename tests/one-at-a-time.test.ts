// One problem at a time (teacher, 2026-11-15): every puzzle lock shows one dial, one painting mistake or one scene
// object, checks it, and only then shows the next. Only each part's first try scores, and the whole first-try answer
// goes to the server once, at the end, where race_puzzle rescores it with the same rules.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ui = readFileSync("app/puzzle-locks.tsx", "utf8");
const part = (name: string) => { const a = ui.indexOf(`function ${name}(`), b = ui.indexOf("\nfunction ", a + 10); return ui.slice(a, b < 0 ? undefined : b); };

test("the code lock shows one dial at a time and checks each before the next", () => {
  const c = part("CodeLock");
  assert.match(c, /const d=p\.dials\[at\]/, "only the current dial is drawn");
  assert.doesNotMatch(c, /p\.dials\.map\(\(d,k\)=><fieldset/, "no list of every dial");
  assert.match(c, /Check this dial/); assert.match(c, /"Next dial":"Open the lock"/);
  assert.match(c, /if\(n>=p\.dials\.length\)\{submit\?\.\(\{taps:taps\}\)/, "the first-try taps go to the server once, after the last dial");
  assert.match(c, /right\*PUZZLE_POINTS\.dial/);
});

test("Fix the Painting asks for one mistake and its proof at a time", () => {
  const c = part("PaintingLock");
  assert.match(c, /label="Mistake"/); assert.match(c, /Tap one thing the painter got wrong\./);
  assert.match(c, /Now tap the line that proves the painter wrong\./); assert.match(c, /Check this mistake/);
  assert.match(c, /const choosable=\(id:string\)=>!result&&!found\.includes\(id\)/, "a mistake already found can't be marked again");
  assert.match(c, /if\(n>=p\.wrong\)\{submit\?\.\(\{marks,proofs\}\)/);
  assert.match(c, /firstTry\.filter\(Boolean\)\.length\*PUZZLE_POINTS\.mistake/);
});

test("Inspect the Scene asks about one object at a time, and lines already explained leave the tray", () => {
  const c = part("SceneLock");
  assert.match(c, /const obj=p\.objects\[at\]/); assert.match(c, /why is this here\?/); assert.match(c, /Check this object/);
  assert.match(c, /tray\.filter\(r=>!settled\.includes\(refKey\(r\)\)\)/);
  assert.match(c, /if\(n>=p\.objects\.length\)\{submit\?\.\(\{matches\}\)/);
});

test("after a miss the right answer is outlined and tapped to go on; every part says where it is", () => {
  assert.match(ui, /const Progress=/); for (const l of ["Dial", "Mistake", "Object"]) assert.ok(ui.includes(`label="${l}"`), l);
  assert.match(ui, /Not yet\. The word that answers is outlined/); assert.match(ui, /tap the outlined line that proves it/); assert.match(ui, /The line that explains it is outlined: tap it\./);
  assert.doesNotMatch(ui, /Lock in the code/, "no all-at-once lock-in");
});
