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
import { ESCAPE_MS, clockRuns, escapeBonusOf } from "../lib/room-clock.ts";
import { chunkTokens, clueTokens } from "../lib/expedition.ts";
import { recoveryTask } from "../lib/escape-room.ts";
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
  type Pub = { beat: string; step: number; briefing: { scenario: string; concepts: { name: string; teaser: string }[]; mission: string | null; timer: boolean } | null; clock: { runningSince: string | null } | null; escaped: { chamber: number; inTime: boolean; winners: number; escapers?: number }[] };
  const pub = () => server.hostView(st).round as unknown as Pub;
  const phone = (pid: string) => server.playerView(st, pid) as unknown as { round: Pub; race: { myBonus: { chamber: number; firstTries: number; points: number }[]; total: number } };
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
  // The board plays the mission briefing (the only screen that narrates); the teacher accepts the mission to start the
  // clock. Phones show the same briefing as silent text and point to the board (2026-11-21).
  assert.match(live, /if\(round\.beat==="brief"&&round\.briefing\)return <LiveBriefing mode="board"[^\n]*onStart=\{\(\)=>act\(\{action:"race\.next"\}\)\}/);
  assert.match(live, /if\(round\.beat==="brief"\)return <LiveBriefing mode="phone"/);
  assert.match(live, /acceptLabel=\{b\.timer\?"Accept the mission":"Open the door"\}/);
  assert.match(src("app/mission-briefing.tsx"), /const phone=mode==="phone";if\(phone\)narration="captions";/);
});

// Opening a missed lock with the shown proof, the way a phone does (0 points, recorded as a miss).
function recoverAnswer(q: NonNullable<ReturnType<typeof playerAsked>>["question"], step: number) {
  const t = recoveryTask(q), c = chunks[step];
  return t === "proof_line" ? { lines: q.proof?.lines ?? [] } : t === "pieces" ? { placed: Object.fromEntries(q.dnd!.items.map((it) => [it.id, it.slot])) }
    : t === "clue_words" ? { words: [...clueTokens(q, chunkTokens(c.lines))] } : t === "picks" ? { picks: (q.choices ?? []).flatMap((o, i) => (o.best ? [i] : [])) } : { choice: (q.choices ?? []).findIndex((o) => o.best) };
}

test("the escape bonus in time: +100 for each first-try proof in the chamber, for every player who opened every lock", async () => {
  const g = await game("ESC1", { chamber: 1 }, 3);
  const [a, b, c] = g.ids, ri = () => g.st().session.roundIndex, ask = (pid: string, k: number) => playerAsked(chunks, g.st().responses, ri(), pid, k)!.question;
  const { playerChunk } = await import("../lib/live/race.ts");
  // a answers every lock (any miss opened with the proof); c misses every lock and opens each with the shown proof;
  // b never opens a lock.
  for (let guard = 0; guard < 200; guard++) {
    const p = g.pub();
    if (p.beat === "race") await g.act(a, "race_tap", { answer: rightAnswerFor(ask(a, p.step), chunks[p.step]) });
    if (p.beat === "reveal" && p.step <= 4) {
      await g.act(c, "race_recover", { answer: recoverAnswer(ask(c, p.step), p.step) });
      if (!playerChunk(g.st().responses, ri(), p.step, a).opened) await g.act(a, "race_recover", { answer: recoverAnswer(ask(a, p.step), p.step) });
    }
    if (p.beat === "countdown" && p.escaped.length) break;
    if (await g.host({ action: "race.next" })) break;
    if (g.st().session.status === "ended") break;
  }
  const firstA = [0, 1, 2, 3, 4].filter((k) => playerChunk(g.st().responses, ri(), k, a).correct).length;
  assert.ok(firstA >= 3, `a proved most locks on the first try: ${firstA}`);
  assert.ok([0, 1, 2, 3, 4].every((k) => playerChunk(g.st().responses, ri(), k, c).opened && !playerChunk(g.st().responses, ri(), k, c).correct), "c opened every lock, none on the first try");
  const e = g.pub().escaped;
  assert.equal(e.length, 1); assert.equal(e[0].chamber, 1); assert.equal(e[0].inTime, true); assert.equal(e[0].escapers, 2, "a and c escaped"); assert.equal(e[0].winners, 1, "only a is paid");
  assert.deepEqual(g.phone(a).race.myBonus, [{ chamber: 1, firstTries: firstA, points: firstA * 100 }]);
  assert.deepEqual(g.phone(c).race.myBonus, [{ chamber: 1, firstTries: 0, points: 0 }], "opened after misses: counts toward escaping, no bonus");
  assert.deepEqual(g.phone(b).race.myBonus, []);
  // Part of the score, and not given twice.
  const board = liveRaceBoard(g.st().responses, ri(), g.st().players, [], false, 4);
  const before = liveRaceBoard(g.st().responses.filter((r) => r.kind !== "race_escape"), ri(), g.st().players, [], false, 4);
  assert.equal(board.rows.find((r) => r.id === a)!.points - before.rows.find((r) => r.id === a)!.points, escapeBonusOf(firstA, true));
  await g.host({ action: "race.next" });
  assert.equal(g.st().responses.filter((r) => r.kind === "race_escape").length, 2);
  const live = src("app/live/race-live.tsx");
  assert.match(live, /\$\{escapeBonusText\(mine\.firstTries\)\}/); assert.match(live, /escaped in time, but with no first-try proofs, so no escape bonus\./);
  assert.match(live, /Escape bonus: \+\$\{ESCAPE_BONUS_PER_LOCK\} for each first-try proof, to \$\{e\.winners\}/);
  assert.match(src("lib/live/evidence.ts"), /\+\$\{Number\(r\.payload\.points\) \|\| 0\} escape bonus for \$\{n\} first-try proof/);
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

test("squads: each squad whose shared lock-in opened every lock gets +100 for each lock-in that proved it", () => {
  const settings = parseExpSettings({ expeditionId: exp.id, chamber: 1 }, world)!;
  const round = { type: "race", settings, step: 4, beat: "puzzle", beatStartedAt: new Date().toISOString(), squadsOn: true, interview: null } as LiveRaceRound;
  const players = [{ id: "p1", squadId: "s1" }, { id: "p2", squadId: "s1" }, { id: "p3", squadId: "s2" }] as never[];
  const squads = [{ id: "s1", name: "Owls" }, { id: "s2", name: "Foxes" }] as never[];
  const lock = (pid: string, step: number, correct: boolean) => ({ id: `${pid}-${step}`, roundIndex: 0, squadId: null, playerId: pid, role: null, kind: "squad_lock", payload: { step, correct, points: correct ? 300 : 0 }, flagged: false, createdAt: "" });
  const responses = [0, 1, 2, 3, 4].map((k) => lock("p1", k, k !== 1 && k !== 3)).concat([0, 1, 2, 3].map((k) => lock("p3", k, true))) as never[];
  const w = escapeWinners(round, 10, 1, responses, 0, players, squads);
  assert.equal(w.kind, "squad"); assert.deepEqual(w.ids.map((x) => [(x as { squad: string }).squad, x.firstTries]), [["s1", 3]], "the Owls proved 3 of 5; the Foxes missed lock 5");
  const withBonus = [...responses, { id: "e", roundIndex: 0, squadId: "s1", playerId: "p1", role: null, kind: "squad_escape", payload: { chamber: 1, step: 4, firstTries: 3, points: 300 }, flagged: false, createdAt: "" }] as never[];
  const pts = (rs: never[]) => liveRaceBoard(rs, 0, players, squads, true, 4).rows.find((r) => r.id === "s1")!.points;
  assert.equal(pts(withBonus) - pts(responses), 300);
});

test("the exit: a chamber 2 game pays the bonus when the class leaves through the exit door, in time", async () => {
  const g = await game("ESC3", { chamber: 2 });
  const [a, b] = g.ids, ri = () => g.st().session.roundIndex;
  for (let guard = 0; guard < 300 && g.st().session.status !== "ended"; guard++) {
    const p = g.pub();
    if (p.beat === "race") { const q = playerAsked(chunks, g.st().responses, ri(), a, p.step)!.question; await g.act(a, "race_tap", { answer: rightAnswerFor(q, chunks[p.step]) }); }
    // A lock missed on the first try (the written seal needs the judge) opens with the shown proof, as on the phone.
    if (p.beat === "reveal" && p.step >= 5) { const q = playerAsked(chunks, g.st().responses, ri(), a, p.step)!.question; await g.act(a, "race_recover", { answer: recoverAnswer(q, p.step) }); }
    await g.host({ action: "race.next" });
  }
  assert.equal(g.st().session.status, "ended");
  const { playerChunk } = await import("../lib/live/race.ts");
  const first = [5, 6, 7, 8, 9].filter((k) => playerChunk(g.st().responses, ri(), k, a).correct).length;
  assert.ok(first < 5, "the written seal was opened after a miss, so it earns nothing");
  const round = g.st().session.rounds[ri()] as LiveRaceRound;
  assert.deepEqual(round.escaped!.map((e) => [e.chamber, e.step, e.inTime, e.escapers, e.winners]), [[2, 9, true, 1, 1]]);
  const rows = g.st().responses.filter((r) => r.kind === "race_escape");
  assert.deepEqual(rows.map((r) => [r.playerId, Number(r.payload.firstTries), Number(r.payload.points)]), [[a, first, first * 100]]);
  assert.deepEqual(g.phone(b).race.myBonus, []);
});
