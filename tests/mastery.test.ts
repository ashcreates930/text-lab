// Phase 4: mastery levels per B.E.S.T. benchmark (lib/mastery.ts) and the student feedback around them.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evidenceFrom, levelOf, levelUps, masteryOf, skillTag, mainFamily, levelHistory, classLevels, LEVELS, type Evidence } from "../lib/mastery.ts";
import type { ExpeditionAttempt } from "../lib/expedition-progress.ts";
import { expeditionEvidence } from "../lib/expedition-progress.ts";
import type { CaseNote } from "../lib/case-notes.ts";
import { WorldPackSchema } from "../lib/world-schema.ts";

const src = (f: string) => readFileSync(f, "utf8");
const note = (k: number, right: boolean, extra: Partial<CaseNote> = {}): CaseNote => ({ chunk: k, type: "Point of view", question: `Q${k}`, answer: "", proof: "", rightFirstTry: right, fixed: null, gistPick: null, gistRight: false,
  typedQuestion: null, unknownWords: [], correctProof: `"Proof sentence ${k}."`, standards: ["R.1.3", "K12.EE.1.1"], note: "", version: "standard", format: "two_part", ...extra });
let clock = 0;
const attempt = (exp: string, notes: CaseNote[], extra: Partial<ExpeditionAttempt> = {}): ExpeditionAttempt => ({ attemptId: `a${clock}`, worldId: "sleepy-hollow", expeditionId: exp, startedAt: new Date(Date.UTC(2026, 10, 1, 0, clock++)).toISOString(), finishedAt: null, complete: true, score: 0, notes, interview: null, award: null, ...extra });
const ev = (f: Evidence["family"], right: boolean, o: Partial<Evidence> = {}): Evidence => ({ family: f, right, format: "two_part", expedition: "e1", harder: false, proof: "p", question: "q", at: "", ...o });

test("levels: Not yet under half, Developing about half, Proficient at 80 percent across 3+, Mastered needs 2 expeditions, 2 formats and a harder question", () => {
  assert.equal(levelOf("R.1.3", [ev("R.1.3", false), ev("R.1.3", false), ev("R.1.3", true)]).level, "Not yet");
  assert.equal(levelOf("R.1.3", [ev("R.1.3", true), ev("R.1.3", false)]).level, "Developing");
  assert.equal(levelOf("R.1.3", [ev("R.1.3", true), ev("R.1.3", true)]).level, "Developing", "2 right is not yet 3 questions");
  assert.equal(levelOf("R.1.3", [ev("R.1.3", true), ev("R.1.3", true), ev("R.1.3", true)]).level, "Proficient");
  assert.equal(levelOf("R.1.3", [ev("R.1.3", true), ev("R.1.3", true), ev("R.1.3", true), ev("R.1.3", true), ev("R.1.3", false)]).level, "Proficient", "4 of 5 is 80 percent");
  // Mastered: Proficient, across 2 expeditions and 2 formats, with a harder question proved.
  const m = [ev("R.1.3", true), ev("R.1.3", true, { format: "multi" }), ev("R.1.3", true, { expedition: "e2", harder: true })];
  assert.equal(levelOf("R.1.3", m).level, "Mastered");
  assert.equal(levelOf("R.1.3", m.map((x) => ({ ...x, expedition: "e1" }))).level, "Proficient", "one expedition is not enough");
  assert.equal(levelOf("R.1.3", m.map((x) => ({ ...x, format: "two_part" }))).level, "Proficient", "one format is not enough");
  assert.equal(levelOf("R.1.3", m.map((x) => ({ ...x, harder: false }))).level, "Proficient", "a harder question must be proved");
  assert.deepEqual([...LEVELS], ["Not yet", "Developing", "Proficient", "Mastered"]);
});

test("only first tries count: a Refresher fix is practice, and a replay of an expedition never changes a level", () => {
  const first = attempt("e1", [note(1, false, { fixed: true }), note(2, false, { fixed: true }), note(3, true)]);
  const replay = attempt("e1", [note(1, true), note(2, true), note(3, true)]);
  const items = evidenceFrom([first, replay]).filter((e) => e.family === "R.1.3");
  assert.equal(items.length, 3, "only the first attempt of each expedition");
  assert.equal(items.filter((e) => e.right).length, 1, "Refresher fixes do not count");
  assert.equal(levelOf("R.1.3", items).level, "Not yet");
  assert.match(src("app/after-race.tsx"), /Fixed in the Refresher/);
});

test("feedback: the skill tag after every answer, level-ups with their proof, the skill report and the reflection", () => {
  const s = levelOf("R.1.3", [ev("R.1.3", true), ev("R.1.3", true)]);
  assert.equal(skillTag(s).text, "Point of view · Developing · 2 of 3 toward Proficient");
  assert.deepEqual(skillTag(s).dots, { filled: 2, of: 3 });
  assert.equal(mainFamily(["K12.EE.1.1", "R.1.3"]), "R.1.3", "the tag shows the reading skill, not the evidence habit");
  const before = [ev("R.1.3", true), ev("R.1.3", true)], after = [...before, ev("R.1.3", true, { proof: "\"The proof.\"" })];
  const ups = levelUps(before, after); assert.equal(ups.length, 1); assert.equal(ups[0].level, "Proficient"); assert.equal(ups[0].best, "\"The proof.\"");
  assert.equal(levelUps(after, after).length, 0, "no level-up without a change");
  const race = src("app/expedition-race.tsx"), ui = src("app/skill-feedback.tsx");
  assert.match(race, /<SkillTag s=\{skillNow\.tag\}\/>/); assert.match(race, /<LevelUp s=\{s\}\/>/);
  assert.match(race, /go\("skills"\)/, "the Refresher leads to the skill report"); assert.match(race, /<SkillReport skills=\{report\}/);
  assert.match(ui, /Which skill improved, and how do you know\?/); assert.match(ui, /Next step: /); assert.match(ui, /Your best proof/);
  assert.match(ui, /You earned the \{s\.name\} badge\./, "Mastered brings the skill's badge");
  // "Not yet" is never failure: no fail wording, no crosses.
  const shown = ui.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  assert.doesNotMatch(shown, /\bfail/i); assert.doesNotMatch(shown, /\bX\b|XCircle/);
  // The reflection goes into the attempt, Case Notes (and the PDF) and the teacher's Evidence view.
  assert.match(race, /reflection:reflection\.trim\(\)\|\|null/); assert.match(src("app/after-race.tsx"), /My reflection/); assert.match(src("lib/case-notes.ts"), /My reflection/);
  const hist = levelHistory([attempt("e1", [note(1, true)], { reflection: "Point of view, because I noticed who was telling it." })]);
  assert.equal(hist[0].reflection, "Point of view, because I noticed who was telling it.");
});

test("privacy and the teacher's skill map: levels only for the student and the teacher, with the same names", () => {
  // Never on the leaderboard, the world map or the host board.
  for (const f of ["app/world-map.tsx", "app/proof-race.tsx", "lib/world-map.ts", "lib/proof-race.ts"]) assert.doesNotMatch(src(f), /mastery|SkillTag|Proficient/, f);
  assert.doesNotMatch(src("lib/live/server.ts").split("export function hostView")[1].split("export function playerView")[0], /skill/, "the host board view has no levels");
  // The teacher's view uses the same rules and names.
  const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
  const students = [{ id: "s1", nickname: "Fox", attempts: [attempt(sh.expeditions![0].id, [note(1, true), note(2, true), note(3, true)], { reflection: "I got better at point of view." })] }];
  const e = expeditionEvidence(sh, students, 7, []);
  assert.equal(e.students[0].levels.find((l) => l.family === "R.1.3")!.level, "Proficient");
  assert.equal(e.students[0].levels.find((l) => l.family === "R.1.3")!.code, "ELA.7.R.1.3");
  assert.equal(e.students[0].reflections[0].text, "I got better at point of view.");
  assert.deepEqual(classLevels(students).find((x) => x.family === "R.1.3")!.counts, { "Not yet": 0, Developing: 0, Proficient: 1, Mastered: 0 });
  assert.match(src("app/expedition-evidence.tsx"), /the same levels students see/);
  assert.equal(masteryOf(evidenceFrom(students[0].attempts)).length, 2);
});
