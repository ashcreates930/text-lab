// Revisions from student testing (2026-11-15): pacing (longer timers, a class "More time" setting, the solo result waits
// for Next), the witness screen (an obvious "Tap to ask" button, one top line, the Case File note and "Continue to lock
// n", a first-time hint, a practice step), and a calmer "Not yet" panel in the mature look.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { QUESTION_TIME_FACTOR, isQuestionTime, limitMs, questionSetting } from "../lib/expedition.ts";
import { DO_NOW, HINTS, WITNESS_SAVED, witnessDoNow } from "../lib/onboarding.ts";
const src = (f: string) => readFileSync(f, "utf8");

test("question time: More time is half as long again, and a student's own time setting still multiplies it", () => {
  assert.deepEqual(QUESTION_TIME_FACTOR, { standard: 1, more: 1.5 });
  assert.equal(questionSetting("1", "standard"), "1"); assert.equal(questionSetting("1", "more"), "1.5"); assert.equal(questionSetting("1.5", "more"), "2.25");
  assert.equal(questionSetting("untimed", "more"), "untimed"); assert.equal(questionSetting(null, null), "1");
  assert.equal(limitMs(70, questionSetting("2", "more")), 210000);
  assert.ok(isQuestionTime("more")); assert.equal(isQuestionTime("fast"), false);
  const sql = src("supabase/migrations/202611150003_question_time.sql");
  assert.match(sql, /add column if not exists question_time text not null default 'standard'/); assert.match(sql, /check \(question_time in \('standard', 'more'\)\)/);
  assert.match(src("app/api/teacher/classes/[id]/route.ts"), /questionTime: z\.enum\(\["standard", "more"\]\)/);
  assert.match(src("app/api/student/class/route.ts"), /questionTime: cls\.question_time \?\? "standard"/);
  assert.match(src("app/classroom.tsx"), /function QuestionTimePanel/);
  assert.match(src("app/expedition-race.tsx"), /const qSetting=questionSetting\(timeSetting,questionTime\)/);
  assert.match(src("lib/live/race.ts"), /questionSetting\(timeSetting, round\.settings\.questionTime\)/); assert.match(src("lib/live/server.ts"), /cls\?\.question_time === "more"/);
});

test("solo: the result after an answer waits for Next; the board and countdown still move on by themselves", () => {
  const s = src("app/expedition-race.tsx");
  assert.match(s, /const AUTO:Partial<Record<Beat,"result"\|"board"\|"countdown">>=\{board:"board",countdown:"countdown"\};/);
  assert.match(s, /onClick=\{afterResult\} className="case-primary[^"]*">Next <ArrowRight/);
  assert.match(DO_NOW.result, /tap Next/);
});

test("the witness screen: one top line, an orange Tap to ask, the Case File note, then Continue to lock n; solo and phones", () => {
  assert.equal(witnessDoNow("Hans"), "Ask Hans your question. One of the three witnesses is lying.");
  assert.equal(WITNESS_SAVED, "Saved to your Case File. You'll check it against the story.");
  const iv = src("app/interview.tsx");
  assert.match(iv, /export function AskButton/); assert.match(iv, /className="case-primary min-h-\[76px\] w-full/); assert.match(iv, />Tap to ask <ArrowRight/);
  assert.match(iv, />Continue to lock \{lock\} <ArrowRight/); assert.match(iv, /\{heard&&<>/);
  assert.doesNotMatch(iv, /One of the three witnesses in this room is lying\. At the exit door/, "no repeated paragraph under the heading");
  assert.match(iv, /\{hint&&<Coach text=\{HINTS\.witness\}\/>\}/); assert.ok(HINTS.witness.length > 10);
  assert.match(src("app/expedition-race.tsx"), /hint=\{!hintsDone\(\)\.has\("witness"\)\} onAsked=\{\(\)=>markHintDone\("witness"\)\}/);
  assert.match(src("app/expedition-race.tsx"), /doNowOverride=\{beat==="witness"/);
  const live = src("app/live/interview-live.tsx");
  assert.match(live, /<AskButton question=/); assert.match(live, /witnessDoNow\(firstName\(w\.name\)\)/); assert.match(live, /\{WITNESS_SAVED\}/); assert.match(live, /markHintDone\("witness"\)/);
});

test("the practice round practices asking a witness first, with no line in the witness's voice", () => {
  const p = src("app/practice-round.tsx");
  assert.match(p, /First, ask a witness/); assert.match(p, /<AskButton question=\{iv\.question\}/); assert.match(p, /Next: practice a lock/);
  assert.doesNotMatch(p, /\.truth\.text|\.lie\.text|interviewAudio/, "nothing about the real answers");
});

test("Not yet: a calm panel in the mature look, the words always there (never color alone)", () => {
  const css = src("app/globals.css");
  assert.match(css, /html\[data-look="mature"\] \.notyet-panel\{[^}]*background:var\(--color-panel\)[^}]*border:2px solid var\(--color-notyet\)/);
  assert.match(css, /html\[data-look="mature"\] \.notyet-panel\.notyet-shake\{animation:none\}/);
  for (const f of ["app/expedition-race.tsx", "app/interview.tsx", "app/live/interview-live.tsx", "app/live/race-live.tsx", "app/game-ui.tsx"]) assert.doesNotMatch(src(f), /bg-notyet p-5 text-on-notyet shadow/, f);
  assert.match(src("app/expedition-race.tsx"), /notyet-panel[^>]*>[\s\S]{0,400}Not yet\./);
});
