// Live chests end to end on the server (memory store): at the reveal, about half the players who proved the lock on
// the first try are offered a chest; nobody who missed is; opening one saves the server's own reward, once.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks } from "../lib/expedition.ts";
import { playerAsked } from "../lib/live/race.ts";
import { rightAnswerFor, wrongAnswerFor } from "./answers.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8")));
const passages = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const exp = world.expeditions![0], chunks = expeditionChunks(world, passages, exp.id);

test("live chests: offered to about half of first-try provers at the reveal, never to a miss; opened once, server's reward", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "CHEST1", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  const ids: string[] = []; for (let n = 0; n < 24; n++) { const r = await server.join(store, s, { nickname: `Tester ${n}`, studentId: null }); ids.push(r.player!.id); }
  let st = (await server.loadState(store, s.id))!;
  const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
  const act = async (pid: string, kind: string, payload: Record<string, unknown> = {}) => { st = (await server.loadState(store, s.id))!; const e = await server.playerAct(store, st, pid, { kind: kind as never, payload }, { judgeAllowed: async () => false, timeSetting: "1" as never }); st = (await server.loadState(store, s.id))!; return e; };
  const pub = () => server.hostView(st).round as unknown as { beat: string; step: number };
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: exp.id } }), null);
  while (!(pub().beat === "race" && pub().step === 1)) await host({ action: "race.next" });
  // The first 20 prove lock 2; the last 4 miss it.
  // A miss: a sentence of the chunk that isn't this player's proof (lock 2 is a find-the-sentence lock).
  const flat = (t: string) => t.replace(/\s+/g, " ").trim();
  const missFor = (q: typeof chunks[1]["chunk"]["question"]) => ({ ...wrongAnswerFor(q, chunks[1]), lines: [chunks[1].lines.find((l) => !(q.proof?.lines ?? []).some((p) => flat(p) === flat(l.text)))!.text] });
  for (const [n, pid] of ids.entries()) { const q = playerAsked(chunks, st.responses, st.session.roundIndex, pid, 1)!.question; assert.equal(await act(pid, "race_tap", { answer: n < 20 ? rightAnswerFor(q, chunks[1]) : missFor(q) }), null); }
  for (const pid of ids.slice(20)) assert.equal(server.playerView(st, pid).race && (server.playerView(st, pid).race as unknown as { mine: { correct: boolean } }).mine.correct, false, "the misses really missed");
  while (pub().beat !== "reveal") await host({ action: "race.next" });
  const view = (pid: string) => server.playerView(st, pid).race as unknown as { chest: { chest: { coins: number; piece: string | null }; opened: boolean } | null; chestCoins: number };
  const offered = ids.slice(0, 20).filter((pid) => view(pid).chest);
  assert.ok(offered.length >= 4 && offered.length <= 16, `about half of 20 provers: ${offered.length}`);
  for (const pid of ids.slice(20)) assert.equal(view(pid).chest, null, "never after a miss");
  // Opening: the server's reward is saved; a second open is refused; a player with no chest can't open one.
  const pid = offered[0], want = view(pid).chest!.chest;
  assert.equal(await act(pid, "race_chest", { coins: 999, piece: "watch" }), null);
  assert.deepEqual(view(pid).chest, { chest: want, opened: true }, "the phone's claimed reward is ignored");
  assert.equal(view(pid).chestCoins, want.coins);
  assert.match(String(await act(pid, "race_chest")), /already open/);
  const noChest = ids.slice(0, 20).find((x) => !view(x).chest)!;
  assert.match(String(await act(noChest, "race_chest")), /no chest/);
  assert.match(String(await act(ids[22], "race_chest")), /no chest/);
});
