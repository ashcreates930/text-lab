// Escape rooms, phase 5: the room clock. Off by default, generous or extra when a teacher turns it on, per chamber,
// paused while reading (and at witnesses, doors, recaps, results and boards), and zero ends nothing.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { CLOCK_PER_LOCK_MS, CLOCK_PER_PUZZLE_MS, chamberBudgetMs, clockEnding, clockRuns, clockView, isRoomClock } from "../lib/room-clock.ts";
import { clockAdd, liveClock, parseExpSettings, type LiveRaceRound } from "../lib/live/race.ts";
import { parseResume, roomOf } from "../lib/escape-room.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const e1 = world.expeditions![0], room = roomOf(world, e1.id)!;

test("budgets: off is no clock; generous is 2 minutes a lock and 4 a puzzle lock; extra is half as much again", () => {
  assert.equal(chamberBudgetMs(5, 2, "off"), 0);
  assert.equal(chamberBudgetMs(5, 2, "generous"), 5 * CLOCK_PER_LOCK_MS + 2 * CLOCK_PER_PUZZLE_MS);
  assert.equal(chamberBudgetMs(5, 2, "extra"), 1.5 * (5 * CLOCK_PER_LOCK_MS + 2 * CLOCK_PER_PUZZLE_MS));
  assert.ok(isRoomClock("generous")); assert.equal(isRoomClock("fast"), false);
});

test("the clock runs only while working a lock or puzzle, never while reading or meeting a witness", () => {
  for (const b of ["question", "race", "puzzle", "gist", "process", "recover", "lightning", "liar"]) assert.ok(clockRuns(b), b);
  for (const b of ["read", "witness", "testify", "door", "inner", "recap", "result", "reveal", "board", "countdown", "escape", "verdict"]) assert.equal(clockRuns(b), false, b);
});

test("zero ends nothing: overtime, announced at five minutes, one minute and zero; the escape never blames the clock", () => {
  assert.deepEqual(clockView(600_000, 0), { leftMs: 600_000, overtime: false, label: "10:00", warn: null });
  assert.equal(clockView(600_000, 301_000).warn, "five"); assert.equal(clockView(600_000, 545_000).warn, "one");
  const over = clockView(600_000, 630_000); assert.equal(over.overtime, true); assert.equal(over.label, "Overtime 0:30"); assert.equal(over.warn, "zero");
  assert.equal(clockEnding(600_000, 420_000), "Escaped with 3:00 to spare."); assert.match(clockEnding(600_000, 700_000)!, /never stops a room/); assert.equal(clockEnding(0, 5), null);
});

test("resume keeps each chamber's time used", () => {
  const blob = { v: 1, progress: { opened: [0, 1, 2, 3, 4], puzzles: [], innerDoor: true, exit: false }, records: [0, 1, 2, 3, 4].map(() => ({ correct: true })), ghost: [], cards: [], lightning: [], burst: 0, clock: [412_000, 0] };
  assert.deepEqual(parseResume(blob, room)!.clock, [412_000, 0]);
  assert.deepEqual(parseResume({ ...blob, clock: undefined }, room)!.clock, [0, 0]);
});

test("live: off unless the host turns it on; the chamber's budget; time added only for working beats, never while paused", () => {
  const settings = parseExpSettings({ expeditionId: e1.id, chamber: 1, clock: "generous" }, world)!;
  assert.equal(parseExpSettings({ expeditionId: e1.id }, world)!.clock, "off");
  const start = new Date(Date.now() - 30_000).toISOString();
  const round: LiveRaceRound = { type: "race", settings, step: 0, beat: "race", beatStartedAt: start, squadsOn: false, interview: null, clockUsedMs: 60_000 };
  const c = liveClock(round, 10, room.puzzles)!;
  const c1 = room.chambers[0], inC1 = room.puzzles.filter((p) => p.after >= c1.from && p.after <= c1.to).length;
  assert.equal(c.budgetMs, chamberBudgetMs(c1.to - c1.from + 1, inC1, "generous")); assert.equal(c.usedMs, 60_000); assert.equal(c.runningSince, start);
  assert.ok(Math.abs(clockAdd(round, Date.now()) - 30_000) < 2000);
  assert.equal(clockAdd({ ...round, beat: "read" }, Date.now()), 0); assert.equal(clockAdd({ ...round, pausedAt: start }, Date.now()), 0);
  assert.equal(liveClock({ ...round, beat: "read" }, 10, room.puzzles)!.runningSince, null);
  assert.equal(liveClock({ ...round, settings: { ...settings, clock: "off" } }, 10, room.puzzles), null);
});

test("wiring: the migration, the teacher's class setting, the student's class info, the solo HUD and the live board", () => {
  const sql = readFileSync("supabase/migrations/202611150001_room_clock.sql", "utf8");
  assert.match(sql, /add column if not exists room_clock text not null default 'off'/); assert.match(sql, /check \(room_clock in \('off', 'generous', 'extra'\)\)/);
  assert.match(readFileSync("app/api/teacher/classes/[id]/route.ts", "utf8"), /roomClock: z\.enum\(\["off", "generous", "extra"\]\)/);
  assert.match(readFileSync("app/api/student/class/route.ts", "utf8"), /roomClock: cls\.room_clock \?\? "off"/);
  assert.match(readFileSync("app/classroom.tsx", "utf8"), /function ClockPanel/);
  const race = readFileSync("app/expedition-race.tsx", "utf8"); assert.match(race, /<RaceHud [^>]*clock=\{clock\}/); assert.match(race, /clockRuns\(beat\)/);
  assert.match(readFileSync("app/case.tsx", "utf8"), /roomClock=\{demo\.classAuth\?roomClock:"off"\}/);
  assert.match(readFileSync("app/live/race-live.tsx", "utf8"), /Room clock \(pauses while everyone reads; zero ends nothing\)/);
});
