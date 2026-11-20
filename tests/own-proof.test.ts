// Live reveal on a phone (found in the live-site check, 2026-11-15): a student whose version of the question differs
// from the board's (a bank pick or an adaptive version) is shown the proof and explanation for their own question,
// never the class's main question's.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks, proofShown, chunkTokens } from "../lib/expedition.ts";
import { playerAsked } from "../lib/live/race.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8")));
const passages = parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8"));
const exp = world.expeditions![0], chunks = expeditionChunks(world, passages, exp.id);

test("the server sends each phone the proof and explanation for its own version at the reveal", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "OWNPF1", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  // Lock 2 has a bank question: join until one player gets it instead of the main question.
  let st = (await server.loadState(store, s.id))!, pid = "";
  for (let n = 0; n < 40 && !pid; n++) {
    const r = await server.join(store, s, { nickname: `Tester ${n}`, studentId: null }); st = (await server.loadState(store, s.id))!;
    const a = playerAsked(chunks, st.responses, 0, r.player!.id, 1)!;
    if (a.question.prompt !== chunks[1].chunk.question.prompt) pid = r.player!.id;
  }
  assert.ok(pid, "a player with the bank question");
  const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
  const pub = () => server.hostView(st).round as unknown as { beat: string; step: number; reveal?: { why: string; lines: string[] } };
  assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: exp.id } }), null);
  while (!(pub().beat === "reveal" && pub().step === 1)) await host({ action: "race.next" });
  const mine = playerAsked(chunks, st.responses, st.session.roundIndex, pid, 1)!.question, main = chunks[1].chunk.question;
  const key = (server.playerView(st, pid).race as unknown as { revealKey: { why: string | null; proof: string[] } }).revealKey;
  assert.equal(key.why, mine.why, "the explanation for this student's own question");
  assert.notEqual(key.why, main.why);
  assert.deepEqual(key.proof, proofShown(mine, chunkTokens(chunks[1].lines)).lines, "the proof for this student's own question");
  // The board keeps the class's main question.
  assert.equal(pub().reveal?.why, main.why);
});

test("the phone shows its own proof and explanation, falling back to the board's only when it has none", () => {
  const live = readFileSync("app/live/race-live.tsx", "utf8");
  assert.match(live, /const myLines=race\.revealKey\?\.proof\?\.length\?race\.revealKey\.proof:round\.reveal\?\.lines\?\?\[\],myWhy=race\.revealKey\?\.why\?\?round\.reveal\?\.why\?\?null;/);
  assert.match(live, /const shownTokens=race\.revealKey\?\.proof\?\.length\?proofTokensOf\(tokens,round\.chunk\.lines,myLines\)/);
  assert.match(live, /Plus \{mine\.tap\.points\.toLocaleString\(\)\} points<\/p><p className="mt-2 text-\[16px\] font-bold">\{myWhy\}<\/p>/);
  assert.match(live, /results=\{myLines\.map\(l=>\(\{line:l,ok:true\}\)\)\}/);
});
