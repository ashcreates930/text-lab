// Expedition build, phase 1: Proof Race is the only way students play. The legacy modes stay in the code behind
// LEGACY_MODES (off by default) and no student or teacher screen links to them; the launch screen offers Start Proof
// Race and Join a live game; the home page talks about what students play now.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEGACY_MODES } from "../lib/feature-flags.ts";

const src = (f: string) => readFileSync(f, "utf8");

test("legacy modes are off by default", () => {
  assert.equal(process.env.NEXT_PUBLIC_LEGACY_MODES, undefined);
  assert.equal(LEGACY_MODES, false);
});

test("the case flow returns the launch screen or Proof Race before any legacy screen", () => {
  const s = src("app/case.tsx");
  const gate = s.indexOf("if(!LEGACY_MODES){");
  assert.ok(gate > 0, "the case flow checks LEGACY_MODES");
  const block = s.slice(gate, s.indexOf("\n }", gate));
  assert.match(block, /<ProofRaceSolo /); assert.match(block, /<LaunchScreen /);
  // Every legacy screen the case flow can show comes after the gate's unconditional return.
  for (const legacy of ["<RoleIntro ", "<MissionPick ", "<StoryMode ", "<ClueScreen ", "<VerdictView ", "<MissionVerdictView ", "<StorybookReader ", "<YourTurn ", "<SceneView ", "<CaseSummary ", "<DemoEnding "]) {
    const at = s.indexOf(legacy); if (at < 0) continue;
    const inCaseInner = at < s.indexOf("function SceneView(");
    if (inCaseInner) assert.ok(at > gate, `${legacy} is behind the gate`);
  }
});

test("live games offer Proof Race only; Your Turn and the other rounds stay behind the flag", () => {
  const s = src("app/live/host-screen.tsx");
  const picker = s.slice(s.indexOf("function RoundPicker("), s.indexOf("function LiveRound("));
  const flagAt = picker.indexOf("{LEGACY_MODES&&<>");
  assert.ok(flagAt > 0);
  for (const legacy of ["<StoryPick ", "<MissionPick ", "Spot the Lie", "Verdict Vote", "Objection!"]) assert.ok(picker.indexOf(legacy) > flagAt, `${legacy} is behind the flag`);
  assert.ok(picker.indexOf("<RacePick ") < flagAt, "Proof Race is offered");
  assert.match(s, /\{LEGACY_MODES&&\(s\.status==="reveal"\|\|s\.status==="ended"\)&&state\.yourTurn&&<YourTurnHost/);
});

test("teacher screens hide the legacy settings and tabs", () => {
  const c = src("app/classroom.tsx");
  assert.match(c, /\{LEGACY_MODES&&<StoryPersonalPanel /);
  assert.match(c, /\.\.\.\(LEGACY_MODES\?\[\["lies","Lie bank"\]\]/);
  assert.match(c, /\{LEGACY_MODES&&tab==="lies"&&<LieBankTab/);
  assert.match(src("app/teacher-demo.tsx"), /\.\.\.\(LEGACY_MODES\?\[\["casefile","Case file"\],\["frames","Picture frames"\]\]/);
});

test("the launch screen: the role card, Start Proof Race and Join a live game, no radio choices", () => {
  const s = src("app/launch-screen.tsx");
  assert.match(s, /You're an investigator stepping into the story/);
  assert.match(s, /Start Proof Race/);
  assert.match(s, /Read a chunk\. Race the Lantern Ghost to the line that proves it\./);
  assert.match(s, /Join a live game/);
  assert.doesNotMatch(s, /type="radio"|role="radio"|aria-checked/);
  // Two choices only: no Solo, Rival or Squad cards.
  assert.doesNotMatch(s, /\b(Rival|Squad|Solo)\b/);
});

test("the home page: the sneak peek replaces the painting; the strip lists what students play now", () => {
  const s = src("app/landing.tsx");
  assert.match(s, /<SneakPeek\/>/);
  assert.doesNotMatch(s, /empty-schoolhouse\.png|Scene solved/);
  for (const t of ["Proof Race", "Play live with your class", "Catch the lie", "Holograms"]) assert.ok(s.includes(`"${t}"`), t);
  for (const t of ["Step inside", "Read a chunk", "Race to the proof", "Climb the board", "Refresher", "Bonus round"]) assert.ok(s.includes(`"${t}"`), t);
  for (const t of ["Students", "Teachers", "Families", "Schools and districts"]) assert.ok(s.includes(`"${t}"`), t);
  assert.doesNotMatch(s, /Your Turn|mission|Spot the Lie/i);
  // The sneak peek: a loop that stops on the Proof! moment under reduced motion, and is out of the tab order.
  const p = src("app/sneak-peek.tsx");
  assert.match(p, /if\(reduced\)\{setBeat\(2\);return\}/);
  assert.match(p, /aria-hidden inert/);
  assert.match(p, /from "\.\/game-ui"/);
});

test("no em dashes in the new student-facing files", () => {
  for (const f of ["app/launch-screen.tsx", "app/landing.tsx", "app/sneak-peek.tsx"]) assert.doesNotMatch(src(f), /—/, f);
});
