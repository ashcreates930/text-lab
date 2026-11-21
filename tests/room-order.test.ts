// The order into a room (teacher decision, 2026-11-21): after the briefing and Start the clock, every room opens on its
// scene with the arrow on the first spot; a witness met at a lock steps in only after the student taps that lock's
// spot, before its reading; no witness comes before the room. Live games show the scene on the board first too.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { roomOf } from "../lib/escape-room.ts";
import { plainSceneOf, roomSceneOf, sceneOf } from "../lib/room-scene.ts";
import { dueAt } from "../lib/interview.ts";

const world = WorldPackSchema.parse(JSON.parse(readFileSync("worlds/sleepy-hollow/world.json", "utf8"))) as WorldPack;
const src = (f: string) => readFileSync(f, "utf8");

test("every chamber of every room has a scene: its painting, or a plain scene of its spots, puzzle locks and door", () => {
  for (const e of world.expeditions!) {
    const room = roomOf(world, e.id)!;
    for (const ch of room.chambers.map((c) => c.chamber)) {
      const s = roomSceneOf(world, room, ch), span = room.chambers[ch - 1];
      assert.deepEqual(s.items.map((i) => i.lock), Array.from({ length: span.to - span.from + 1 }, (_, i) => span.from + i + 1), `${e.id} chamber ${ch}: one spot per lock, in order`);
      assert.ok(s.items.every((i) => i.label.length > 2), `${e.id}: every spot is named`);
      if (!sceneOf(world, e.id, ch)) assert.deepEqual(s.witnesses, [], `${e.id}: no witness stands in a plain scene`);
    }
  }
  const r2 = roomOf(world, "the-schoolmaster")!, s1 = plainSceneOf(world, r2, 1), s2 = plainSceneOf(world, r2, 2);
  assert.equal(s1.art, ""); assert.equal(s1.door.label, "The schoolhouse door"); assert.equal(s2.door.label, "The exit door");
  assert.deepEqual(s1.puzzles.map((p) => p.id), ["schoolhouse-at-midday"]); assert.deepEqual(s2.puzzles.map((p) => p.id), ["farmhouse-room"]);
  assert.equal(s1.items[0].label[0], s1.items[0].label[0].toUpperCase(), "named by its paragraph topic, capitalized");
  // A spot on a content-noted paragraph has no topic, so it is just "Lock N" (Room 7 reaches ¶34).
  const r7 = roomOf(world, "the-invitation")!, noted = plainSceneOf(world, r7, 1).items.filter((i) => i.line?.p === "p034");
  assert.ok(noted.length > 0); for (const i of noted) assert.equal(i.label, `Lock ${i.lock}`);
});

test("solo: the scene first with the arrow on the first spot; a witness steps in after the spot is tapped, then the reading", () => {
  const race = src("app/expedition-race.tsx"), view = src("app/room-scene-view.tsx");
  assert.match(race, /const sceneFor=\(i:number\)=>room\?roomSceneOf\(world,room,chamberOfLock\(room,Math\.min\(i,chunks\.length-1\)\)\):null;/);
  // The scene never points at a witness: the next lock's spot, a puzzle lock, or the door.
  assert.match(race, /const next:SceneNext=pend\?\(pend\.innerDoor\?\{kind:"door"\}:\{kind:"puzzle",id:pend\.id\}\):lastDone\?\{kind:"door"\}:\{kind:"item",lock:k\};/);
  assert.doesNotMatch(race, /kind:"witness",index:due\[0\]/);
  // Tapping the spot: anyone met at this lock first, then the reading (never back to the scene in between).
  assert.match(race, /const due=dueAt\(iv,n\+1\)\.filter\(i=>!isMet\(cards,i\)\);if\(due\.length\)\{setMeeting\(due\[0\]\);go\("witness"\)\}else go\("read"\)\}/);
  assert.match(race, /if\(due\.length\)\{setMeeting\(due\[0\]\);go\("witness"\)\}else\{setMeeting\(null\);go\("read"\)\}\}/);
  // The arrow on the first spot whenever nothing in the chamber is open yet; a plain scene shows it in its list.
  assert.match(view, /arrow=firstVisit\|\|opened===0/); assert.match(view, /\{!scene\.art&&arrow&&st==="next"&&<ArrowBigRight/); assert.match(view, /\{scene\.art&&<div ref=\{scroller\}/);
  // Room 1: Hans is met at lock 1, so he steps in only after the first spot (the inn) is tapped.
  const iv = world.expeditions![0].interview!;
  assert.deepEqual(dueAt(iv, 1).map((i) => iv.witnesses[i].character), ["hans-van-ripper"]);
});

test("each witness is still met at or before the lock that checks them (lib/expedition-check.ts, validate:worlds)", async () => {
  const { expeditionProblems } = await import("../lib/expedition-check.ts");
  const { parseSourcePassages } = await import("../lib/source-passages.ts");
  const problems = expeditionProblems(world, parseSourcePassages(readFileSync("public/worlds/sleepy-hollow/source.md", "utf8")));
  assert.deepEqual(problems.filter((p) => /is met at lock|meet them at or before/.test(p)), []);
  for (const e of world.expeditions!) for (const w of e.interview?.witnesses ?? []) assert.ok(w.at! >= 1 && w.at! <= e.chunks.length, `${e.id}: ${w.character} is met inside the room`);
});

test("live: briefing, Start the clock, the room's scene on the board, then the first witness", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  for (const [code, chamber, first, then] of [["ORDER1", 1, 0, "testify"], ["ORDER2", 2, 5, "testify"]] as const) {
    const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
    const s = await store.createSession({ code, teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
    await server.join(store, s, { nickname: "Tester", studentId: null });
    let st = (await server.loadState(store, s.id))!;
    const host = async (a: Record<string, unknown>) => { st = (await server.loadState(store, s.id))!; const e = await server.hostAct(store, st, a as never); st = (await server.loadState(store, s.id))!; return e; };
    const pub = () => server.hostView(st).round as unknown as { beat: string; step: number; scene: { title: string; first: number; data: { art: string; items: { lock: number }[]; witnesses: unknown[] } } | null; clock: { runningSince: string | null } };
    assert.equal(await host({ action: "round.start", type: "race", settings: { expeditionId: "into-the-hollow", chamber } }), null);
    assert.equal(pub().beat, "brief");
    await host({ action: "race.next" });
    assert.equal(pub().beat, "scene", `chamber ${chamber}: the room comes right after Start the clock`); assert.equal(pub().step, first);
    assert.equal(pub().scene!.first, first); assert.match(pub().scene!.data.art, /into-the-hollow-\d\.webp$/); assert.equal(pub().scene!.data.items[0].lock, first + 1);
    assert.ok(pub().clock.runningSince, "the clock runs in the room");
    await host({ action: "race.next" });
    assert.equal(pub().beat, then, "then the witness met at the first lock"); assert.equal(pub().scene, null);
  }
  const live = src("app/live/race-live.tsx");
  assert.match(live, /\{round\.beat==="scene"&&round\.scene&&<div className="mt-3 max-w-3xl"><SceneView heading="h2"/);
  assert.match(live, /onItem=\{\(\)=>act\(\{action:"race\.next"\}\)\}/);
  assert.match(live, /Look around the room<\/h1>/);
});

test("the first screen is the escape room: a new student goes straight to Room 1's briefing; returning students get the map (2026-11-21)", () => {
  const cas = src("app/case.tsx"), ui = src("app/room-ui.tsx"), race = src("app/expedition-race.tsx"), bq = src("app/story-opening.tsx");
  assert.match(cas, /const first=world\.expeditions\?\.\[0\]\?\.id;if\(first&&attempts\.length===0\)\{setExpedition\(first\);setRacing\(true\)\}/);
  assert.match(cas, /if\(autoStarted\.current\|\|!world\|\|attemptsFor!==world\.id\|\|LEGACY_MODES\)return;autoStarted\.current=true;/, "once per visit, after the saved rooms have loaded");
  // The briefing (2026-11-21, the digital mission briefing): every room with a briefing opens on it, with the case line
  // and the big question in its dossier; rooms without one keep the plain door.
  void ui;
  assert.match(race, /return <MissionBriefing world=\{world\} room=\{room\} scenario=\{rb\.scenario\}/);
  const mb = src("app/mission-briefing.tsx");
  assert.match(mb, /Tap to open the case file/); assert.match(mb, /Accept the mission/);
  assert.equal(world.hook, "A schoolteacher vanished on the road home. Was it a ghost, or someone who wanted him gone?");
  // On the map the big question starts collapsed; all four concepts show only when it's opened there.
  // A class student who joins goes straight into the class's story (no shelf), so the same first screen applies.
  assert.match(src("app/page.tsx"), /next\.classAuth=auth;setDemo\(next\);[^\n]*\n    setView\("play"\);/);
  assert.match(bq, /const \[open,setOpen\]=useState\(false\);/);
  assert.match(bq, /\{open&&<>[\s\S]{0,300}e\.key_concepts\.map/);
});
