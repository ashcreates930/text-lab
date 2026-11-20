// Live escape rooms (teacher decision, 2026-11-20): the room's briefing on the board before the clock starts (the
// scenario, the key concepts, the chamber's mission; Start the clock for the teacher; phones show the mission), and the
// escape bonus in time for every player or squad who opened every lock in the chamber. Server-level, memory store.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks } from "../lib/expedition.ts";
import { escapeCheck, escapeWinners, liveRaceBoard, parseExpSettings, playerAsked, type LiveRaceRound } from "../lib/live/race.ts";
import { ESCAPE_BONUS, ESCAPE_MS, clockRuns } from "../lib/room-clock.ts";
import { rightAnswerFor } from "./answers.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8")));
const passages = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const exp = world.expeditions![0], chunks = expeditionChunks(world, passages, exp.id);
const briefing = world.rooms!.find((r) => r.expedition === exp.id)!.briefing!;
const src = (f: string) => readFileSync(f, "utf8");

async function game(code: string, settings: Record<string, unknown>, players = 2) {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code, teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  const ids: string[] = []; for (let n = 0; n < players; n++) { const r = await server.join(store, s, { nickname: `Tester ${n}`, studentId: null }); ids.push(r.player!.id); }
  let st = (await server.loadState(store, s.id))!;
  const load = async () => { st = (await server.loadState(store, s.id))!; return st; };
  const host = async (a: Record<string, unknown>) => { await load(); const e = await server.hostAct(store, st, a as never); await load(); return e; };
  const act = async (pid: string, kind: string, payload: Record<string, unknown> = {}) => { await load(); const e = await server.playerAct(store, st, pid, { kind: kind as never, payload }, { judgeAllowed: async () => false, timeSetting: "1" as never }); await load(); return e; };
  type Pub = { beat: string; step: number; briefing: { scenario: string; concepts: { name: string; teaser: string }[]; mission: string | null; timer: boolean } | null; clock: { runningSince: string | null } | null; escaped: { chamber: number; inTime: boolean; winners: number }[] };
  const pub = () => server.hostView(st).round as unknown as Pub;
  const phone = (pid: string) => server.playerView(st, pid) as unknown as { round: Pub; race: { myBonus: number[]; total: number } };
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: exp.id, ...settings } }), null);
  return { server, store, s, ids, host, act, pub, phone, load, st: () => st };
}

test("the briefing comes first on the board, outside the clock; Start the clock moves on to the room", async () => {
  const g = await game("BRIEF1", { chamber: 1 });
  assert.equal(g.pub().beat, "brief"); assert.equal(clockRuns("brief"), false);
  assert.deepEqual(g.pub().briefing, { room: 1, name: g.pub().briefing && (g.pub().briefing as unknown as { name: string }).name, scenario: briefing.scenario,
    concepts: briefing.concepts.map((n) => ({ name: n, teaser: world.engagement!.key_concepts.find((k) => k.name === n)!.teaser })), mission: briefing.mission, timer: true } as never);
  assert.equal(g.pub().clock!.runningSince, null, "the clock waits for the teacher");
  // Phones get the same mission line.
  assert.equal(g.phone(g.ids[0]).round.briefing!.mission, "Your mission: open 5 locks and the gate before the clock runs out.");
  assert.equal(await g.host({ action: "race.next" }), null);
  assert.notEqual(g.pub().beat, "brief"); assert.equal(g.pub().briefing, null); assert.ok(g.pub().clock!.runningSince, "Start the clock starts it");
  // A chamber 2 game shows chamber 2's mission; with the timer off, no mission (it names the clock) and Open the door.
  const g2 = await game("BRIEF2", { chamber: 2 }); assert.equal(g2.pub().briefing!.mission, briefing.mission2);
  const g3 = await game("BRIEF3", { chamber: 1, clock: "off" }); assert.equal(g3.pub().briefing!.mission, null); assert.equal(g3.pub().briefing!.timer, false);
  const live = src("app/live/race-live.tsx");
  assert.match(live, /if\(round\.beat==="brief"&&round\.briefing\)return <BriefingBoard/); assert.match(live, /<Timer size=\{22\} aria-hidden\/>Start the clock/);
  assert.match(live, /if\(round\.beat==="brief"\)return <section[\s\S]{0,400}Your mission/);
});

test("the escape bonus in time: every player who opened every lock in the chamber, once, when the class leaves the inner door", async () => {
  const g = await game("ESC1", { chamber: 1 });
  const [a, b] = g.ids;
  // a proves every lock; b answers none (never opens a lock).
  for (let guard = 0; guard < 200; guard++) {
    const p = g.pub();
    if (p.beat === "race") { const q = playerAsked(chunks, g.st().responses, g.st().session.roundIndex, a, p.step)!.question; await g.act(a, "race_tap", { answer: rightAnswerFor(q, chunks[p.step]) }); }
    if (p.beat === "countdown" && p.escaped.length) break;
    if (await g.host({ action: "race.next" })) break;
    if (g.st().session.status === "ended") break;
  }
  const e = g.pub().escaped;
  assert.equal(e.length, 1); assert.equal(e[0].chamber, 1); assert.equal(e[0].inTime, true); assert.equal(e[0].winners, 1);
  assert.deepEqual(g.phone(a).race.myBonus, [1]); assert.deepEqual(g.phone(b).race.myBonus, []);
  const rows = g.st().responses.filter((r) => r.kind === "race_escape");
  assert.equal(rows.length, 1); assert.equal(rows[0].playerId, a); assert.equal(Number(rows[0].payload.points), ESCAPE_BONUS);
  // It is part of the score, and not given twice.
  const board = liveRaceBoard(g.st().responses, g.st().session.roundIndex, g.st().players, [], false, 4);
  const before = liveRaceBoard(g.st().responses.filter((r) => r.kind !== "race_escape"), g.st().session.roundIndex, g.st().players, [], false, 4);
  assert.equal(board.rows.find((r) => r.id === a)!.points - before.rows.find((r) => r.id === a)!.points, ESCAPE_BONUS);
  await g.host({ action: "race.next" });
  assert.equal(g.st().responses.filter((r) => r.kind === "race_escape").length, 1);
});

test("time ran out: no escape bonus, and the board says so; the timer off gives none either", async () => {
  const g = await game("ESC2", { chamber: 1 });
  const [a] = g.ids;
  for (let guard = 0; guard < 200; guard++) {
    const p = g.pub();
    if (p.beat === "race") { const q = playerAsked(chunks, g.st().responses, g.st().session.roundIndex, a, p.step)!.question; await g.act(a, "race_tap", { answer: rightAnswerFor(q, chunks[p.step]) }); }
    if (p.beat === "puzzle" && p.step === 4) {
      // The clock ran out before the class reached the gate.
      const sess = g.st().session, rounds = [...sess.rounds]; rounds[sess.roundIndex] = { ...(rounds[sess.roundIndex] as LiveRaceRound), clockUsedMs: ESCAPE_MS + 1 };
      await g.store.updateSession(g.s.id, { rounds }); await g.load();
      await g.host({ action: "race.next" }); break;
    }
    await g.host({ action: "race.next" });
  }
  assert.deepEqual(g.pub().escaped.map((e) => [e.chamber, e.inTime, e.winners]), [[1, false, 0]]);
  assert.equal(g.st().responses.filter((r) => r.kind === "race_escape").length, 0);
  const settings = parseExpSettings({ expeditionId: exp.id, chamber: 1, clock: "off" }, world)!;
  assert.equal(escapeCheck({ type: "race", settings, step: 4, beat: "puzzle", beatStartedAt: new Date().toISOString(), squadsOn: false, interview: null } as LiveRaceRound, 10, Date.now()), null);
  assert.match(src("app/live/race-live.tsx"), /wasn't escaped in time, so there's no escape bonus\. Every proof still counts\./);
});

test("squads: the bonus goes to each squad whose shared lock-in opened every lock in the chamber", () => {
  const settings = parseExpSettings({ expeditionId: exp.id, chamber: 1 }, world)!;
  const round = { type: "race", settings, step: 4, beat: "puzzle", beatStartedAt: new Date().toISOString(), squadsOn: true, interview: null } as LiveRaceRound;
  const players = [{ id: "p1", squadId: "s1" }, { id: "p2", squadId: "s1" }, { id: "p3", squadId: "s2" }] as never[];
  const squads = [{ id: "s1", name: "Owls" }, { id: "s2", name: "Foxes" }] as never[];
  const lock = (pid: string, step: number) => ({ id: `${pid}-${step}`, roundIndex: 0, squadId: null, playerId: pid, role: null, kind: "squad_lock", payload: { step, points: 300 }, flagged: false, createdAt: "" });
  const responses = [0, 1, 2, 3, 4].map((k) => lock("p1", k)).concat([0, 1, 2, 3].map((k) => lock("p3", k))) as never[];
  const w = escapeWinners(round, 10, 1, responses, 0, players, squads);
  assert.equal(w.kind, "squad"); assert.deepEqual(w.ids.map((x) => (x as { squad: string }).squad), ["s1"], "the Foxes missed lock 5");
  const withBonus = [...responses, { id: "e", roundIndex: 0, squadId: "s1", playerId: "p1", role: null, kind: "squad_escape", payload: { chamber: 1, step: 4, points: ESCAPE_BONUS }, flagged: false, createdAt: "" }] as never[];
  const pts = (rs: never[]) => liveRaceBoard(rs, 0, players, squads, true, 4).rows.find((r) => r.id === "s1")!.points;
  assert.equal(pts(withBonus) - pts(responses), ESCAPE_BONUS);
});

test("the exit: a chamber 2 game gives the bonus when the class leaves through the exit door, in time", async () => {
  const g = await game("ESC3", { chamber: 2 });
  const [a, b] = g.ids;
  for (let guard = 0; guard < 300 && g.st().session.status !== "ended"; guard++) {
    const p = g.pub();
    if (p.beat === "race") { const q = playerAsked(chunks, g.st().responses, g.st().session.roundIndex, a, p.step)!.question; await g.act(a, "race_tap", { answer: rightAnswerFor(q, chunks[p.step]) }); }
    // A lock missed on the first try (the written seal needs the judge) opens with the shown proof, as on the phone.
    if (p.beat === "reveal" && p.step >= 5) { const q = playerAsked(chunks, g.st().responses, g.st().session.roundIndex, a, p.step)!.question; await g.act(a, "race_recover", { answer: { lines: q.proof?.lines ?? [] } }); }
    await g.host({ action: "race.next" });
  }
  assert.equal(g.st().session.status, "ended");
  const round = g.st().session.rounds[g.st().session.roundIndex] as LiveRaceRound;
  assert.deepEqual(round.escaped!.map((e) => [e.chamber, e.step, e.inTime, e.winners]), [[2, 9, true, 1]]);
  assert.deepEqual(g.st().responses.filter((r) => r.kind === "race_escape").map((r) => r.playerId), [a]);
  assert.deepEqual(g.phone(b).race.myBonus, []);
});
