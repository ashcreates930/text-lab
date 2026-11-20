// The escape timer (teacher decision, 2026-11-20), replacing the generous overtime-only room clock: on by default, 35
// minutes per chamber, stretched by the class's More time and each student's own time setting; it runs through the
// chamber, reading included; if it runs out the chamber isn't escaped in time (no badge, no escape bonus) but the
// student finishes and keeps everything. Teachers pause it (class and live) and add 5 minutes (live).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { ADD_MS, ESCAPE_BONUS, ESCAPE_MS, clockEnding, clockRuns, clockView, escapeBudgetMs, inTime, isRoomClock, roomClockOf, timeUp } from "../lib/room-clock.ts";
import { clockAdd, liveClock, parseExpSettings, type LiveRaceRound } from "../lib/live/race.ts";
import { parseResume, roomOf } from "../lib/escape-room.ts";
import { timerRow } from "../lib/expedition-progress.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const e1 = world.expeditions![0], room = roomOf(world, e1.id)!;
const src = (f: string) => readFileSync(f, "utf8");

test("35 minutes a chamber, on by default; More time and a student's own time stretch it; off is no timer", () => {
  assert.equal(ESCAPE_MS, 35 * 60_000);
  assert.equal(escapeBudgetMs("escape"), 35 * 60_000);
  assert.equal(escapeBudgetMs("escape", "more"), 52.5 * 60_000);
  assert.equal(escapeBudgetMs("escape", "standard", "1.5"), 52.5 * 60_000);
  assert.equal(escapeBudgetMs("escape", "more", "2"), 105 * 60_000);
  assert.equal(escapeBudgetMs("off", "more", "2"), 0);
  // Old saved values read as the timer; only "off" turns it off.
  assert.equal(roomClockOf(undefined), "escape"); assert.equal(roomClockOf("generous"), "escape"); assert.equal(roomClockOf("off"), "off");
  assert.equal(isRoomClock("escape"), true); assert.equal(isRoomClock("generous"), false);
});

test("it runs through the chamber, reading included; it stops at the briefing, between chambers and after the escape", () => {
  for (const b of ["read", "gist", "question", "result", "recover", "scene", "witness", "puzzle", "board", "countdown", "liar", "process", "race", "reveal"]) assert.equal(clockRuns(b), true, b);
  for (const b of ["door", "inner", "recap", "escape", "finish", "refresher", "notes", "essential", "verdict"]) assert.equal(clockRuns(b), false, b);
});

test("running out: the chamber isn't escaped in time, no badge and no escape bonus; the student keeps going", () => {
  const budget = escapeBudgetMs("escape");
  assert.equal(inTime(budget, budget - 1000), true); assert.equal(inTime(budget, budget), false); assert.equal(inTime(0, 999_999), null);
  assert.equal(timeUp(budget, budget), true); assert.equal(timeUp(0, 999_999), false);
  assert.deepEqual(clockView(budget, budget + 5000), { leftMs: 0, overtime: true, label: "Time's up", warn: "zero" });
  assert.equal(clockView(budget, budget - 30_000).warn, "one");
  assert.match(clockEnding(budget, budget - 90_000)!, new RegExp(`Escaped in time, with 1:30 to spare\\. \\+${ESCAPE_BONUS} escape bonus\\.`));
  assert.match(clockEnding(budget, budget + 1)!, /isn't escaped in time\. Every lock you opened and every first-try proof still counts\. Replay it to escape in time\./);
  const race = src("app/expedition-race.tsx");
  assert.match(race, /const escapeBonus=\(innerOpen&&lastCh>0&&chamberInTime\(0\)\?ESCAPE_BONUS:0\)\+\(exitOpen&&chamberInTime\(lastCh\)\?ESCAPE_BONUS:0\);/);
  assert.match(race, /\+escapeBonus;/, "the bonus is part of the score only when earned");
  assert.match(race, /\{clock\?\.overtime&&!timeoutSeen\[ch\]&&clockRuns\(beat\)&&<TimeoutMoment text=\{world\.engagement\?\.timeout_moment/);
  assert.equal(world.engagement!.timeout_moment, "The Horseman reached the bridge before you.");
  assert.match(src("app/room-ui.tsx"), /Keep going: finish the locks, and every first-try proof still counts/);
  assert.match(src("app/room-ui.tsx"), /const InTimeBadge=\(\{ok\}:\{ok:boolean\|null\|undefined\}\)=>ok===true\?/);
});

test("the briefing at the door: a scenario, the room's concepts, the vocabulary, then Start the clock", () => {
  const b = world.rooms!.find((r) => r.expedition === e1.id)!.briefing!;
  assert.ok(b.scenario.split(/[.!?](\s|$)/).filter((x) => x && x.trim().length > 3).length <= 3, "two or three sentences");
  for (const c of b.concepts) assert.ok(world.engagement!.key_concepts.some((k) => k.name === c), c);
  const ui = src("app/room-ui.tsx");
  assert.match(ui, /timer\?"Start the clock":"Open the door"/); assert.match(ui, /This room explores/);
  assert.match(src("app/expedition-race.tsx"), /<RoomDoor timer=\{budget>0\} chamber=\{[^}]*\} briefing=/);
});

test("the mission line (approved 2026-11-20) ends the briefing and counts chamber 1's locks exactly", async () => {
  const { engagementProblems } = await import("../lib/engagement.ts");
  const { parseSourcePassages } = await import("../lib/source-passages.ts");
  const ps = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
  assert.equal(world.rooms!.find((r) => r.expedition === e1.id)!.briefing!.mission, "Your mission: open 5 locks and the gate before the clock runs out.");
  assert.deepEqual(engagementProblems(world, ps).filter((p) => /mission/.test(p)), []);
  const bad = structuredClone(world); bad.rooms!.find((r) => r.expedition === e1.id)!.briefing!.mission = "Your mission: open 4 locks and the gate before the clock runs out.";
  assert.match(engagementProblems(bad, ps).join(), /briefing mission: it must say "open 5 locks"/);
  const b2 = structuredClone(world); b2.rooms!.find((r) => r.expedition === e1.id)!.briefing!.mission2 = "Your mission: open 4 locks and the exit door before the clock runs out.";
  assert.match(engagementProblems(b2, ps).join(), /briefing mission2: it must say "open 5 locks"/);
  // Every room (approved 2026-11-20): a briefing of two or three sentences, the story's concepts, and a mission line for
  // each chamber with its own lock count (Room 14: 4 and 3).
  assert.equal(world.rooms!.length, 14);
  for (const r of world.rooms!) {
    const b = r.briefing!; assert.ok(b, r.expedition);
    const n = b.scenario.split(/[.!?](\s|$)/).filter((x) => x && x.trim().length > 3).length; assert.ok(n >= 2 && n <= 3, r.expedition);
    assert.match(b.mission!, /^Your mission: open \d locks and .+ before the clock runs out\.$/); assert.match(b.mission2!, /^Your mission: open \d locks and the exit door before the clock runs out\.$/);
  }
  assert.match(world.rooms!.at(-1)!.briefing!.mission!, /open 4 locks/); assert.match(world.rooms!.at(-1)!.briefing!.mission2!, /open 3 locks/);
  // The mission for the chamber being started, only while the escape timer is on: chamber 1 at the door, chamber 2 at
  // the door (coming back mid-chamber) and on the Case File recap that opens chamber 2.
  const ui = src("app/room-ui.tsx"), race = src("app/expedition-race.tsx");
  assert.match(ui, /\{timer&&missionFor\(briefing,chamber\)&&<p/); assert.match(ui, /export const missionFor=\(b:\{mission\?:string;mission2\?:string\}\|null\|undefined,chamber:1\|2\)=>\(chamber===2\?b\?\.mission2:b\?\.mission\)\?\?null;/);
  assert.match(race, /chamber=\{room\.chambers\[1\]&&k>=room\.chambers\[1\]\.from\?2:1\}/); assert.match(race, /<ChamberRecap room=\{room\} items=\{inventory\} mission=\{budget>0\?missionFor\(/);
});

test("briefings never answer the room: answer key words, code words, painting mistakes, scene subjects, quoted keys", async () => {
  const { briefingProblems } = await import("../lib/engagement.ts");
  const { parseSourcePassages } = await import("../lib/source-passages.ts");
  const ps = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
  assert.deepEqual(briefingProblems(world, ps), []);
  const withText = (id: string, extra: string) => { const w = structuredClone(world); const b = w.rooms!.find((r) => r.expedition === id)!.briefing!; b.scenario += " " + extra; return briefingProblems(w, ps).join("\n"); };
  assert.match(withText("the-van-tassel-farm", "She is his daughter."), /code-dial answer "daughter"/);
  assert.match(withText(e1.id, "A roaring waterfall pours down."), /painting's mistake "A roaring waterfall"/);
  assert.match(withText(e1.id, "A cannon stands by."), /scene object's subject/);
  assert.match(withText(e1.id, "I do not vouch for the fact, they say."), /quotes the proof/);
  assert.match(withText("the-lonely-road", "The party ends at midnight."), /gives away the answer "The party ends/);
  assert.match(withText("ghost-stories", "Out in the valley, people believe whatever they hear."), /ready-made answer to the written seal/);
  // A word a wrong choice or the question uses too can't point at the right answer.
  assert.equal(withText("the-schoolmaster", "Every house has a story."), "");
});

test("resume keeps each chamber's time; the attempt saves each chamber's time and result for the teacher", () => {
  const blob = { v: 1, progress: { opened: [0, 1, 2, 3, 4], puzzles: [], innerDoor: true, exit: false }, records: [0, 1, 2, 3, 4].map(() => ({ correct: true })), ghost: [], cards: [], lightning: [], burst: 0, clock: [412_000, 0] };
  assert.deepEqual(parseResume(blob, room)!.clock, [412_000, 0]);
  const t = (start: string, used: number[], ok: (boolean | null)[]) => ({ startedAt: start, timer: { budgetMs: ESCAPE_MS, used, inTime: ok } });
  // The latest attempt's times; "in time on a replay" when any attempt made it.
  const row = timerRow([t("2026-11-20T09:00:00Z", [2_000_000, 2_200_000], [true, false]), t("2026-11-21T09:00:00Z", [2_300_000, 1_900_000], [false, true])])!;
  assert.deepEqual(row.chambers, [{ ms: 2_300_000, inTime: false, everInTime: true }, { ms: 1_900_000, inTime: true, everInTime: true }]);
  assert.equal(timerRow([{ startedAt: "x", timer: null }]), null);
  assert.match(src("app/api/student/expeditions/route.ts"), /timer: z\.object\(\{ budgetMs:/);
  assert.match(src("app/expedition-evidence.tsx"), /Chambers escaped in time: /); assert.match(src("app/expedition-evidence.tsx"), /after time\{c\.everInTime\?" \(in time on a replay\)":""\}/);
});

test("live: on by default; 35 minutes per chamber played; runs while reading; pause stops it; the teacher adds 5 minutes", () => {
  assert.equal(parseExpSettings({ expeditionId: e1.id }, world)!.clock, "escape");
  const settings = parseExpSettings({ expeditionId: e1.id, chamber: 1 }, world)!;
  const start = new Date(Date.now() - 30_000).toISOString();
  const round: LiveRaceRound = { type: "race", settings, step: 0, beat: "read", beatStartedAt: start, squadsOn: false, interview: null, clockUsedMs: 60_000 };
  const c = liveClock(round, 10, room.puzzles)!;
  assert.equal(c.budgetMs, ESCAPE_MS); assert.equal(c.usedMs, 60_000); assert.equal(c.runningSince, start, "reading counts");
  assert.equal(liveClock({ ...round, settings: { ...settings, chamber: 0 } }, 10, room.puzzles)!.budgetMs, 2 * ESCAPE_MS, "the whole room: both chambers");
  assert.equal(liveClock({ ...round, clockExtraMs: ADD_MS }, 10, room.puzzles)!.budgetMs, ESCAPE_MS + ADD_MS);
  assert.ok(Math.abs(clockAdd(round, Date.now()) - 30_000) < 2000);
  assert.equal(clockAdd({ ...round, pausedAt: start }, Date.now()), 0); assert.equal(liveClock({ ...round, pausedAt: start }, 10, room.puzzles)!.runningSince, null);
  // A pause holds the clock where it was: the time read before the pause stays used, not dropped.
  const mid = new Date(Date.parse(start) + 10_000).toISOString();
  assert.equal(clockAdd({ ...round, pausedAt: mid }, Date.now()), 10_000);
  assert.equal(liveClock({ ...round, pausedAt: mid }, 10, room.puzzles)!.usedMs, 70_000);
  assert.equal(liveClock({ ...round, settings: { ...settings, clock: "off" } }, 10, room.puzzles), null);
  assert.match(src("lib/live/server.ts"), /case "clock\.add": \{[^\n]*clockExtraMs: \(round\.clockExtraMs \?\? 0\) \+ CLOCK_ADD_MS/);
  const live = src("app/live/race-live.tsx");
  assert.match(live, /onClick=\{\(\)=>act\(\{action:"clock\.add"\}\)\}[\s\S]{0,140}Add 5 minutes/);
  assert.match(live, /\{phoneClock\?\.overtime&&!timeoutSeen&&<TimeoutMoment/);
});

test("class play: the migration, the teacher's timer and pause, the student's 15-second check", () => {
  const sql = src("supabase/migrations/202611200001_escape_timer.sql");
  assert.match(sql, /check \(room_clock in \('escape', 'off', 'generous', 'extra'\)\)/); assert.match(sql, /alter column room_clock set default 'escape'/);
  assert.match(sql, /add column if not exists clock_paused_at timestamptz/);
  assert.match(src("app/api/teacher/classes/[id]/route.ts"), /roomClock: z\.enum\(\["escape", "off"\]\)\.optional\(\), clockPaused: z\.boolean\(\)\.optional\(\)/);
  assert.match(src("app/api/student/class/route.ts"), /roomClock: roomClockOf\(cls\.room_clock\), clockPaused: !!cls\.clock_paused_at/);
  assert.match(src("app/classroom.tsx"), /paused\?"Resume the class clock":"Pause the class clock"/);
  assert.match(src("app/case.tsx"), /setInterval\(\(\)=>\{fetch\("\/api\/student\/class"[\s\S]{0,200}setClockPaused\(j\.clockPaused===true\)[\s\S]{0,60}15000\)/);
  assert.match(src("app/expedition-race.tsx"), /if\(!budget\|\|!clockRuns\(beat\)\|\|clockPaused\)return;/);
});

test("after time ran out the doors don't say escaped", () => {
  const ui = src("app/room-ui.tsx");
  assert.match(ui, /\{inTimeBadge===false\?"Chamber 1 finished":"Chamber 1 escaped"\}/);
  assert.match(ui, /\{inTimeBadge===false\?"You made it out":"You escaped!"\}/);
});
