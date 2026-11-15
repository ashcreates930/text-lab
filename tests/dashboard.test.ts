// Escape-room wording on the home page and the teacher dashboard, and the dashboard's numbers: locks opened, puzzles
// solved on the first try, liars caught, and which chamber each student reached.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { roomDashRow, roomDashTotals, roomOf } from "../lib/escape-room.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const room = roomOf(world, "into-the-hollow")!;
const rec = { correct: true };
const att = (startedAt: string, more: Record<string, unknown>) => ({ startedAt, finishedAt: null, notes: [], interview: null, puzzles: [], ...more });
const resume = (opened: number[], innerDoor: boolean) => ({ v: 1, progress: { opened, puzzles: [], innerDoor, exit: false }, records: opened.map(() => rec), ghost: [], cards: [], lightning: [], burst: 0 });

test("the chamber each student reached, and their locks, puzzles and liar", () => {
  assert.equal(roomDashRow(room, []).reached, "Not started");
  assert.equal(roomDashRow(room, [att("1", { resume: resume([0, 1], false) })]).reached, "Chamber 1");
  const c1 = room.chambers[0].to, upto = Array.from({ length: c1 + 1 }, (_, i) => i);
  assert.equal(roomDashRow(room, [att("1", { resume: resume(upto, false) })]).reached, "At the inner door");
  const two = roomDashRow(room, [att("1", { resume: resume([...upto, c1 + 1], true), puzzles: [{ firstTry: [true, true] }, { firstTry: [true, false] }] })]);
  assert.equal(two.reached, "Chamber 2"); assert.equal(two.locksOpened, c1 + 2); assert.equal(two.puzzlesFirstTry, 1); assert.equal(two.liarCaught, null);
  const done = roomDashRow(room, [att("1", { finishedAt: "x", interview: { solved: true } }), att("2", { resume: resume([0], false) })]);
  assert.equal(done.reached, "Escaped"); assert.equal(done.locksOpened, room.locks.length); assert.equal(done.liarCaught, true);
  const t = roomDashTotals([two, done, roomDashRow(room, [])]);
  assert.equal(t.locksOpened, c1 + 2 + room.locks.length); assert.equal(t.puzzlesFirstTry, 1); assert.equal(t.liarsCaught, 1); assert.equal(t.liarTries, 1);
  assert.deepEqual([t.reached["Chamber 2"], t.reached.Escaped, t.reached["Not started"]], [1, 1, 1]);
});

test("escape-room wording: the home page, the map, the dashboard and the CSV", () => {
  const home = readFileSync("app/landing.tsx", "utf8"), launch = readFileSync("app/launch-screen.tsx", "utf8"), dash = readFileSync("app/expedition-evidence.tsx", "utf8");
  assert.match(home, /<p className=\{eyebrow\}>Escape rooms<\/p>/); assert.doesNotMatch(home, /Each expedition/);
  assert.match(launch, /Enter the escape rooms/); assert.doesNotMatch(launch, /Start Proof Race|Expedition map/);
  assert.match(dash, />Escape rooms<\/h3>/); assert.doesNotMatch(dash, /Proof Race expeditions|Solo expeditions/);
  for (const t of ["Locks opened", "Puzzles solved on the first try", "Liars caught", "Which chamber each student reached", "Chamber reached"]) assert.ok(dash.includes(t), t);
  assert.match(readFileSync("app/expedition-map.tsx", "utf8"), /"Escape rooms":"Room map"/);
  assert.match(readFileSync("app/escape-peek.tsx", "utf8"), /Room 1 · Lock 2 of 10/);
  // A room card shrinks on a phone so its table scrolls inside it (the browser check found the page 522 px wide at 390).
  assert.match(dash, /<li key={x.id} className="min-w-0 rounded-3xl bg-panel p-5">/);
  assert.match(readFileSync("lib/classroom/evidence.ts", "utf8"), /"Room", "Student", "Chamber reached", "Locks opened", "Puzzles solved first try", "Liar caught"/);
});

test("the teacher sign-in screen doesn't ask for classes while signed out (a clean console, no 401)", () => {
  const s = readFileSync("app/classroom.tsx", "utf8");
  assert.match(s, /if\(!session&&!dev\)\{setState\("signin"\);setMessage\(""\);return\}/);
  assert.ok(s.indexOf("if(!session&&!dev)") < s.indexOf('const r=await teacherFetch("/api/teacher/classes")'));
});
