// Escape rooms, phase 7: live squad escapes. Roles rotate each room; each member commits privately, then the Recorder
// locks in one of the squad's commits (once everyone has committed); the squad's row on the board gains points when
// the shared answer proves the lock; the squad Case File and each student's contribution in Evidence.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks } from "../lib/expedition.ts";
import { SQUAD_LOCK_POINTS, SQUAD_ROLES, recorderOf, rolesFor, sharedLockOpen } from "../lib/live/squad-escape.ts";
import { liveRaceBoard, parseExpSettings, raceAnswer, raceDone, squadLockOf, type LiveRaceRound } from "../lib/live/race.ts";
import { rightAnswerFor, wrongAnswerFor } from "./answers.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const passages = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const e1 = world.expeditions![0];

test("roles: all four in every squad, one seat on each room; a squad of 2 or 3 shares the extra roles", () => {
  const four = ["a", "b", "c", "d"], r1 = rolesFor(four, 1), r2 = rolesFor(four, 2);
  assert.deepEqual(four.map((m) => r1[m]), [["reader"], ["keeper"], ["interviewer"], ["recorder"]]);
  assert.deepEqual(four.map((m) => r2[m]), [["recorder"], ["reader"], ["keeper"], ["interviewer"]]);
  for (const n of [2, 3]) { const ms = four.slice(0, n), r = rolesFor(ms, 1); assert.deepEqual(ms.flatMap((m) => r[m]).sort(), [...SQUAD_ROLES].sort()); }
  assert.equal(recorderOf(four, 1), "d"); assert.equal(recorderOf(four, 2), "a");
  assert.equal(sharedLockOpen(["a", "b"], new Set(["a"])), false); assert.equal(sharedLockOpen(["a", "b"], new Set(["a", "b"])), true);
});

test("the shared lock-in: only the Recorder, only after every commit, one of the squad's commits, once; squad points on the board", () => {
  const w1 = structuredClone(world); w1.expeditions![0].chunks[1].bank = []; const chunks = expeditionChunks(w1, passages, e1.id);
  const round: LiveRaceRound = { type: "race", settings: parseExpSettings({ expeditionId: e1.id }, w1)!, step: 1, beat: "race", beatStartedAt: new Date().toISOString(), squadsOn: true, interview: null };
  const squad = ["p1", "p2", "p3", "p4"], recorder = recorderOf(squad, 1)!, other = squad.find((m) => m !== recorder)!;
  let n = 0; const row = (playerId: string, kind: string, payload: Record<string, unknown>) => ({ id: `r${n++}`, roundIndex: 0, squadId: "s1", playerId, role: null, kind, payload, flagged: false, createdAt: "" });
  const tap = (pid: string, right: boolean, rs: unknown[]) => { const a = right ? rightAnswerFor(chunks[1].chunk.question, chunks[1]) : wrongAnswerFor(chunks[1].chunk.question, chunks[1]); const r = raceAnswer(round, chunks, rs as never, 0, pid, "race_tap", { answer: a }, Date.now(), "1", null, null, squad) as { payload: Record<string, unknown> }; return row(pid, "race_tap", r.payload); };
  const lock = (pid: string, from: string, rs: unknown[]) => raceAnswer(round, chunks, rs as never, 0, pid, "squad_lock", { from }, Date.now(), "1", null, null, squad, null, [], 1);
  let rs: unknown[] = [];
  rs.push(tap("p1", true, rs), tap("p2", false, rs), tap("p3", true, rs));
  assert.match(String(lock(recorder, "p1", rs)), /Wait until everyone/);
  rs.push(tap("p4", false, rs));
  assert.match(String(lock(other, "p1", rs)), /Recorder locks in/);
  assert.match(String(lock(recorder, "nobody", rs)), /Pick one of your squad's answers/);
  const ok = lock(recorder, "p1", rs) as { payload: Record<string, unknown> };
  assert.equal(ok.payload.correct, true); assert.equal(ok.payload.points, SQUAD_LOCK_POINTS);
  rs = [...rs, row(recorder, "squad_lock", ok.payload)];
  assert.match(String(lock(recorder, "p3", rs)), /already locked in/);
  assert.equal(squadLockOf(rs as never, 0, 1, squad)!.from, "p1");
  // Done with the lock only once the squad has locked in (the host waits on squads, not just commits).
  const players = squad.map((id) => ({ id, nickname: id, squadId: "s1", studentId: null })) as never[];
  assert.equal(raceDone(round, rs.slice(0, -1) as never, 0, players).length, 0);
  assert.equal(raceDone(round, rs as never, 0, players).length, 4);
  const board = liveRaceBoard(rs as never, 0, players, [{ id: "s1", name: "Ravens" }] as never, true, 1);
  const avg = Math.round(rs.filter((r) => (r as { kind: string }).kind === "race_tap").reduce((s: number, r) => s + Number((r as { payload: { points: number } }).payload.points), 0) / 4);
  assert.equal(board.rows[0].points, avg + SQUAD_LOCK_POINTS);
  // Not a squad game: no shared lock-ins.
  assert.match(String(raceAnswer({ ...round, squadsOn: false }, chunks, rs as never, 0, recorder, "squad_lock", { from: "p1" }, Date.now(), "1", null, null, squad)), /for squads/);
});

test("screens and Evidence: the role bar and shared lock-in on phones, roles on the board, roles and used commits in Evidence", () => {
  const live = readFileSync("app/live/race-live.tsx", "utf8");
  assert.match(live, /function SquadRoleBar/); assert.match(live, /act\("squad_lock",\{from\}\)/); assert.match(live, /Squad roles this room/); assert.match(live, /<CaseFileButton items=\{esc\.caseFile\}\/>/);
  const ev = readFileSync("lib/live/evidence.ts", "utf8"); assert.match(ev, /case "squad_lock"/); assert.match(ev, /the squad locked in their answer/);
  assert.match(readFileSync("app/api/live/sessions/[id]/act/route.ts", "utf8"), /"squad_lock"/);
  // The squad sees each commit's proof line whole (a lost backslash once stripped every letter s).
  for (const f of ["lib/live/server.ts", "lib/expedition-check.ts", "app/live/race-live.tsx"]) assert.doesNotMatch(readFileSync(f, "utf8"), /replace\(\/s\+\/g|\(\?=s\|/, f);
});
