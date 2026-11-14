// Escape rooms, phase 6: witnesses in the room. One question for all three; each witness steps in just before the lock
// whose reading first checks them, solo and live, and chamber 2 opens by replaying the witnesses met in chamber 1.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks, norm } from "../lib/expedition.ts";
import { dueAt, inRoom, interviewStatements, isMet, meet, metBefore } from "../lib/interview.ts";
import { interviewProblems, interviewRoomTextProblems } from "../lib/expedition-check.ts";
import { firstBeat, nextBeat, parseExpSettings, roomMet, roomWitnesses, type LiveRaceRound } from "../lib/live/race.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const passages = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const names = new Set(world.characters.flatMap((c) => c.name.toLowerCase().split(/\s+/)));
const room1 = world.expeditions!.find((e) => e.id === "into-the-hollow")!;

test("every Sleepy Hollow room meets its witnesses inside, with one question, before the lock that checks them", () => {
  for (const e of world.expeditions!) {
    const iv = e.interview!; assert.ok(inRoom(iv), e.id);
    const ch = expeditionChunks(world, passages, e.id);
    const chunkOf = (l: string) => ch.findIndex((c) => c.lines.some((x) => norm(x.text) === norm(l))) + 1;
    for (const w of iv.witnesses) assert.ok(w.at! <= Math.min(...[...w.truth.lines, ...w.lie.lines].map(chunkOf)), `${e.id} ${w.character}`);
    // Every witness is met somewhere in the room, exactly once.
    const all = ch.flatMap((_, i) => dueAt(iv, i + 1)); assert.deepEqual([...all].sort(), [0, 1, 2]);
  }
});

test("solo: due witnesses, met witnesses, and the one question as every witness's card", () => {
  const iv = room1.interview!, hans = iv.witnesses.findIndex((w) => w.character === "hans-van-ripper");
  assert.deepEqual(dueAt(iv, 1), [hans]);
  assert.deepEqual(metBefore(iv, 1), []);
  let cards: number[] = [];
  assert.equal(isMet(cards, hans), false);
  cards = meet(cards, hans, 3);
  assert.equal(isMet(cards, hans), true); assert.equal(cards.filter((c) => c >= 0).length, 1);
  const said = interviewStatements(world, iv, 0, cards);
  assert.equal(said[hans].card, iv.question);
  assert.equal(said.filter((s) => s.card).length, 1);
  // The door Interview (no question) is unchanged: no lock, no due witnesses.
  const door = { witnesses: iv.witnesses.map(({ at: _, ...w }) => w) };
  assert.equal(inRoom(door), false); assert.deepEqual(dueAt(door, 1), []);
});

test("validator: a witness met after the lock that checks them, or without the one question, is flagged", () => {
  const ch = expeditionChunks(world, passages, room1.id), lines = ch.flatMap((c) => c.lines.map((l) => l.text));
  const chunks = ch.map((c) => ({ lines: c.lines.map((l) => ({ text: l.text, pid: l.pid })) }));
  assert.deepEqual(interviewProblems(world, room1, lines, names, chunks), []);
  const late = structuredClone(room1); late.interview!.witnesses.forEach((w) => (w.at = 10));
  assert.ok(interviewProblems(world, late, lines, names, chunks).some((m) => /after lock \d+ already checks them/.test(m)));
  const noQ = structuredClone(room1); delete noQ.interview!.question;
  assert.ok(interviewProblems(world, noQ, lines, names, chunks).some((m) => /need the one question/.test(m)));
  // The rewrite's rules: one sentence each, nothing from a content-noted paragraph.
  const long = structuredClone(room1); long.interview!.witnesses[0].truth.text = "One. Two.";
  assert.ok(interviewRoomTextProblems(world, long, chunks).some((m) => /more than one sentence/.test(m)));
});

test("the proposed rewrite passes every Interview rule, including content notes and one sentence each", () => {
  const rw = JSON.parse(readFileSync("scripts/interview-rewrite.json", "utf8")).rooms;
  const { evidenceSentences } = { evidenceSentences: (t: string) => t } as never; void evidenceSentences;
  for (const e0 of world.expeditions!) {
    const e = structuredClone(e0), r = rw[e.id], ch = expeditionChunks(world, passages, e.id);
    const chunks = ch.map((c) => ({ lines: c.lines.map((l) => ({ text: l.text, pid: l.pid })) })), all = ch.flatMap((c) => c.lines);
    const at = (ref: { p: string; s: number }) => all.find((l) => l.pid === ref.p && l.index === ref.s)!.text;
    for (const w of e.interview!.witnesses) { const x = r.witnesses[w.character];
      w.truth.text = x.truth; w.lie.text = x.lie; w.caught = x.caught; w.at = x.at;
      if (x.truthLines) w.truth.lines = x.truthLines.map(at); if (x.lieLines) w.lie.lines = x.lieLines.map(at); }
    e.interview!.question = r.question;
    assert.deepEqual([...interviewProblems(world, e, all.map((l) => l.text), names, chunks), ...interviewRoomTextProblems(world, e, chunks)], [], e.id);
  }
});

// Walk a live game beat by beat and note who testifies before which reading.
function walk(chamber: 0 | 1 | 2) {
  const settings = parseExpSettings({ expeditionId: room1.id, chamber }, world)!;
  const at = room1.interview!.witnesses.map((w) => w.at!), chunks = Array.from({ length: room1.chunks.length }, () => ({})) as never[];
  const f = firstBeat(settings, chunks.length, true, at);
  let round: LiveRaceRound = { type: "race", settings, step: f.step, beat: f.beat, witness: f.witness ?? null, beatStartedAt: "", squadsOn: false, interview: { liar: 0, witnesses: 3, at } };
  const seen: string[] = [];
  for (let n = 0; n < 400; n++) {
    if (round.beat === "testify") seen.push(`${round.witness}@${round.step}`);
    if (round.beat === "read") seen.push(`read@${round.step}`);
    const nx = nextBeat(round, chunks); if (nx === "end") break;
    round = { ...round, step: nx.step, beat: nx.beat, witness: nx.witness ?? null };
  }
  return seen;
}

test("live: each witness testifies once, just before the reading of their lock; chamber 2 opens with a replay", () => {
  const at = room1.interview!.witnesses.map((w) => w.at!);
  const whole = walk(0);
  at.forEach((a, k) => { const i = whole.indexOf(`${k}@${a - 1}`); assert.ok(i >= 0, `witness ${k}`); assert.equal(whole[i + 1 + whole.slice(i + 1).findIndex((x) => x.startsWith("read"))], `read@${a - 1}`); });
  assert.equal(whole.filter((x) => !x.startsWith("read")).length, 3);
  // Chamber 1 meets only chamber 1's witnesses; chamber 2 first replays them, then meets the rest at their locks.
  const c1 = walk(1), c2 = walk(2), early = at.flatMap((a, k) => (a <= 5 ? [k] : []));
  assert.deepEqual(c1.filter((x) => !x.startsWith("read")).map((x) => Number(x.split("@")[0])).sort(), early.sort());
  assert.deepEqual(c2.slice(0, early.length), early.map((k) => `${k}@5`));
  assert.equal(c2.filter((x) => !x.startsWith("read")).length, early.length + (3 - early.length));
  assert.deepEqual(roomWitnesses(at, 5, { from: 5 }, true).slice(0, early.length), early);
});

test("live: who counts as met, for the board's Met checks and Name the Liar", () => {
  const at = [8, 1, 9];
  assert.equal(roomMet(at, 0, 1, 1), true); // Hans, while he speaks
  assert.equal(roomMet(at, 0, 1, 0), false); // Brom, not yet
  assert.equal(roomMet(at, 7, null, 0), true); // after his testimony at lock 8
  assert.equal(roomMet(at, 9, null, 2), true);
  assert.equal(roomMet(at, 6, null, 0), false);
});

test("live server: a room game opens on the first witness, not a card vote; chamber 2 opens on the replay", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "ROOM06", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  await server.join(store, s, { nickname: "Ana Ruiz", studentId: null });
  let st = (await server.loadState(store, s.id))!;
  const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
  type Pub = { beat: string; step: number; interview: { witness: number | null; inRoom: boolean; question: string | null; said: ({ character: string; card: string } | null)[] } };
  const pub = () => server.hostView(st).round as unknown as Pub;
  const iv = room1.interview!, hans = iv.witnesses.findIndex((w) => w.character === "hans-van-ripper");
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: room1.id, chamber: 1 } }), null);
  assert.equal(pub().beat, "testify"); assert.equal(pub().interview.witness, hans); assert.equal(pub().interview.inRoom, true);
  assert.equal(pub().interview.said.filter(Boolean).length, 1); assert.equal(pub().interview.said[hans]!.card, iv.question);
  assert.match(JSON.stringify(server.hostView(st).race), /hans-van-ripper-(truth|lie)\.mp3/);
  assert.equal(await host({ action: "race.next" }), null);
  assert.equal(pub().beat, "read"); assert.equal(pub().step, 0);
  // Chamber 2, a new game: the witnesses met in chamber 1 again first.
  const s2 = await store.createSession({ code: "ROOM07", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() }); await server.join(store, s2, { nickname: "Ana Ruiz", studentId: null });
  st = (await server.loadState(store, s2.id))!; assert.equal(await server.hostAct(store, st, { action: "round.start", type: "race", settings: { expeditionId: room1.id, chamber: 2 } } as never), null); st = (await server.loadState(store, s2.id))!;
  assert.equal(pub().beat, "testify"); assert.equal(pub().step, 5); assert.equal(pub().interview.witness, hans);
});

test("validator: a witness who testifies (a twist, main or bank question, any version) is met at or before that lock", () => {
  // Every room as built passes, including the one-sentence and content-note rules now that the approved lines are in.
  for (const e of world.expeditions!) {
    const ch = expeditionChunks(world, passages, e.id), cc = ch.map((c) => ({ lines: c.lines.map((l) => ({ text: l.text, pid: l.pid })) }));
    assert.deepEqual([...interviewProblems(world, e, ch.flatMap((c) => c.lines.map((l) => l.text)), names, cc), ...interviewRoomTextProblems(world, e, cc)], [], e.id);
  }
  // Room 1: Brom bursts in at lock 7; meeting him at lock 8 is flagged.
  const late = structuredClone(room1), brom = late.interview!.witnesses.find((w) => w.character === "brom-bones")!;
  const lock = late.chunks.findIndex((c) => [c.question, ...(c.bank ?? [])].some((q) => q.testimony?.speaker === "brom-bones")) + 1;
  brom.at = lock + 1;
  const ch = expeditionChunks(world, passages, room1.id), cc = ch.map((c) => ({ lines: c.lines.map((l) => ({ text: l.text, pid: l.pid })) }));
  assert.ok(interviewProblems(world, late, ch.flatMap((c) => c.lines.map((l) => l.text)), names, cc).some((m) => m.includes(`brom-bones testifies at lock ${lock} but is met at lock ${lock + 1}`)));
});
