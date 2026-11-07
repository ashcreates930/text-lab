// From iPhone testing (2026-11-07): the Story map is the first screen, nothing shows through the header, badge
// subtitles name the skill, and every new screen starts at the top with focus on its heading.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BADGE_SKILL, skillBadges } from "../lib/expedition-progress.ts";
import { DO_NOW } from "../lib/onboarding.ts";

const src = (f: string) => readFileSync(f, "utf8");

test("the Story map is the first screen: the hook above it, zoomed to the next stop, one big Start button, Join small at the top", () => {
  const c = src("app/case.tsx"), m = src("app/expedition-map.tsx");
  assert.match(c, /if\(\(world\.expeditions\?\.length\?\?0\)>0\)return <ExpeditionMap/, "a story with expeditions opens on the map");
  assert.match(m, /Start Expedition \{next\.number\}: \{next\.title\}/);
  assert.match(m, />Join a live game<\/button>/);
  assert.match(m, /\{world\.hook&&<p/, "the story hook sits above the map");
  assert.match(m, /useState<string\|null>\(\(\)=>regions\.find\(r=>r\.state==="current"\)\?\.expedition\?\?null\)/, "opens zoomed in on the next stop's region");
  assert.ok(m.indexOf("<StoryMap") < m.indexOf('aria-labelledby="badges-h"') && m.indexOf("<StoryMap") < m.indexOf('aria-label="Ranks"'), "ranks and badges sit below the map");
  assert.ok(!/onBack=\{/.test(c.match(/<ExpeditionMap[^\n]*/)?.[0] ?? ""), "no separate launch screen to go back to");
  assert.ok(DO_NOW.map.length < 110);
});

test("the header is opaque, so nothing on the page shows through it", () => {
  const p = src("app/page.tsx");
  assert.match(p, /<header className="sticky top-0 z-30[^"]*bg-panel-2 /);
  assert.ok(!/<header className="sticky[^"]*bg-panel-2\/\d+/.test(p));
});

test("badge subtitles name the skill, not the badge again", () => {
  const b = skillBadges([]);
  for (const x of b) assert.ok(BADGE_SKILL[x.type], `${x.type} has a skill`);
  assert.equal(BADGE_SKILL["Word Detective"], "Vocabulary in context");
  for (const x of b) assert.notEqual(BADGE_SKILL[x.type], x.skill, `${x.skill}: the subtitle is not the badge name`);
  assert.match(src("app/expedition-map.tsx"), /\{BADGE_SKILL\[b\.type\]\?\?b\.type\} · \{b\.earned\?"Earned"/);
});

test("every new screen starts at the top with focus on its heading; no jump inside a question", () => {
  const f = src("app/screen-focus.ts");
  assert.match(f, /export function focusScreenTop\(\) \{\r?\n  toTop\(\); holdTop\(\);/, "the jump is held for a few frames (iPhone momentum)");
  assert.match(f, /window\.addEventListener\("touchstart", stop/, "unless the student starts scrolling");
  const race = src("app/expedition-race.tsx");
  assert.match(race, /useLayoutEffect\(\(\)=>\{focusScreenTop\(\)\},\[beat,k\]\);/, "read, question, result, next chunk: the top");
  assert.match(race, /if\(step>1\)focusHeading\(\)/, "the proof step of the same question: focus only, no jump");
  assert.match(src("app/practice-round.tsx"), /useLayoutEffect\(\(\)=>\{focusScreenTop\(\)\},\[step\]\);/, "each part of the practice round");
  for (const [file, re] of [["app/after-race.tsx", /focusScreenTop\(\)\},\[k,!!result,items\.length\]/], ["app/skill-feedback.tsx", /focusScreenTop\(\)\},\[\]\)/], ["app/interview.tsx", /focusScreenTop\(\)\},\[\]\)/], ["app/expedition-map.tsx", /if\(!skillsOpen\)focusScreenTop\(\)/]] as const)
    assert.match(src(file), re, file);
});

test("the phone question panel never grows over the header: capped below it, the middle part scrolls", () => {
  const s = src("app/split-stage.tsx");
  assert.match(s, /max-md:max-h-\[calc\(100dvh-var\(--header-h,64px\)-8px\)\]/);
  assert.match(s, /max-h-\[42dvh\] min-h-0 overflow-y-auto/, "the body shrinks and scrolls");
  assert.match(s, /split-foot shrink-0/, "Lock in and the Pieces bar stay in view");
});
