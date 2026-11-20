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

test("Fix the Painting asks for one mistake at a time, then one sentence at a time (classroom review, 2026-11-20)", () => {
  const c = part("PaintingLock");
  assert.match(c, /label="Mistake"/); assert.match(c, /Tap one thing the painter got wrong\./);
  assert.match(c, /Does this prove the painter wrong\?/); assert.match(c, /Sentence \{idx\+1\} of \{shown\.length\}/);
  assert.match(c, /onClick=\{\(\)=>answer\(true\)\}[\s\S]{0,120}Yes<\/button>/); assert.match(c, /onClick=\{\(\)=>answer\(false\)\}[\s\S]{0,120}No<\/button>/);
  assert.match(c, /\{idx>0&&<button type="button" onClick=\{\(\)=>setIdx\(idx-1\)\}[\s\S]{0,120}Back<\/button>\}/, "Back to the previous sentence");
  // The first Yes is the answer; a No to the proving sentence is a miss.
  assert.match(c, /if\(yes\)\{setMarks\(m=>\[\.\.\.m,cur\.id\]\);setProofs\(x=>\(\{\.\.\.x,\[cur\.id\]:s\.r\}\)\)/);
  assert.match(c, /if\(correct\)\{setMarks\(m=>\[\.\.\.m,cur\.id\]\);setProofs\(x=>\(\{\.\.\.x,\[cur\.id\]:null\}\)\);miss\(\);return\}/);
  // One distinct detail per mistake (the server needs them distinct); a found one can't be picked again.
  assert.match(c, /const choosable=\(id:string\)=>!found\.includes\(id\)&&\(hinting\?true:!marks\.includes\(id\)&&!cleared\.includes\(id\)\)/);
  assert.match(c, /if\(n>=p\.wrong\)\{submit\?\.\(\{marks,proofs\}\)/);
  assert.match(c, /firstTry\.filter\(Boolean\)\.length\*PUZZLE_POINTS\.mistake/);
});

test("Inspect the Scene asks about one object at a time, and lines already explained leave the tray", () => {
  const c = part("SceneLock");
  assert.match(c, /const obj=p\.objects\[at\]/); assert.match(c, /why is this here\?/); assert.match(c, /Check this object/);
  assert.match(c, /tray\.filter\(r=>!settled\.includes\(refKey\(r\)\)\)/);
  assert.match(c, /if\(n>=p\.objects\.length\)\{submit\?\.\(\{matches\}\)/);
});

test("after a miss in any puzzle lock: the pointer, then the paragraph, then the line; never the answer at once", () => {
  assert.match(ui, /const Progress=/); for (const l of ["Dial", "Mistake", "Object"]) assert.ok(ui.includes(`label="${l}"`), l);
  assert.match(ui, /Not yet\. \{level===0\?pointer:level===1\?`The paragraph is lit up\. The \$\{what\} is in it\.`:`Now the \$\{what\} is outlined: tap it\.`\}/);
  for (const lock of ["CodeLock", "PaintingLock", "SceneLock"]) assert.match(part(lock), /<Hint level=\{level\?\?0\} pointer=\{pointerFor\(/, `${lock} uses the hint steps`);
  // The outline appears only at the last step.
  assert.match(part("CodeLock"), /const outlined=hinting&&level===HINT_LINE;/);
  assert.match(part("SceneLock"), /outline=\{hinting&&level===HINT_LINE&&refKey\(r\)===refKey\(obj\.line\)\}/);
  assert.match(part("PaintingLock"), /const lineHint=hinting&&level===HINT_LINE&&target;/);
  assert.doesNotMatch(ui, /The word that answers is outlined|The line that explains it is outlined: tap it/, "the old answer-on-first-miss is gone");
  assert.doesNotMatch(ui, /Lock in the code/, "no all-at-once lock-in");
});
