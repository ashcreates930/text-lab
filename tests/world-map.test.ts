// World map, phase 1: the map data (every chunk a stop at a real place, landmarks, finales, secrets), unlocking and
// fog, stars per stop, the token's place and its walk during a race, secrets on a return visit, the validator, the
// live class map, the list view and the map screen's accessibility.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { mapProblems, pointOf, raceRegions, raceTokenAt, regionFrame, secretOf, stopStars, tokenAt, trailOf, worldMapView } from "../lib/world-map.ts";
import { layoutMap } from "../scripts/build-map.ts";
import { SPEC } from "../scripts/maps/sleepy-hollow.ts";
import type { ExpeditionAttempt } from "../lib/expedition-progress.ts";
import type { CaseNote } from "../lib/case-notes.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const map = sh.world_map!, exps = sh.expeditions!;
const note = (chunk: number, o: Partial<CaseNote> = {}): CaseNote => ({ chunk, type: "Find It", question: "q", answer: "a", proof: "p", rightFirstTry: true, fixed: null, gistPick: "g", gistRight: true, typedQuestion: null, unknownWords: [], correctProof: "p", standards: ["R.1.1"], note: "", ...o });
const attempt = (expeditionId: string, notes: CaseNote[], finished = true, at = "2026-11-01T10:00:00.000Z"): ExpeditionAttempt => ({ attemptId: `a-${expeditionId}-${at}`, worldId: sh.id, expeditionId, startedAt: at, finishedAt: finished ? at : null, complete: finished, score: 1000, notes, interview: null, award: null });

test("map data: Irving's places, one region per expedition, one stop per chunk at the place where it happens", () => {
  assert.deepEqual(mapProblems(sh), []);
  assert.ok(existsSync(`public${map.image}`), "the painted base map exists");
  for (const place of ["Tarry Town", "The Hudson", "The glen of Sleepy Hollow", "The schoolhouse", "Farmhouses where Ichabod boards", "The old Dutch church", "The Van Tassel farmhouse", "Major André's tree", "Wiley's swamp", "The bridge by the church", "The brook"])
    assert.ok(map.places.some((p) => p.name === place), place);
  assert.equal(map.regions.length, exps.length);
  exps.forEach((e, k) => { const r = map.regions[k]; assert.equal(r.expedition, e.id); assert.equal(r.stops.length, e.chunks.length); assert.ok(r.finale, `${e.id}: the Name the Liar finale has a place`); });
  // Places from the story: the headless horseman's tales at the church, the hat and pumpkin by the brook, André's tree on the lonely road.
  const at = (e: string, chunk: number) => map.regions.find((r) => r.expedition === e)!.stops[chunk - 1].place;
  assert.equal(at("into-the-hollow", 1), "tarry-town"); assert.equal(at("into-the-hollow", 2), "glen");
  assert.equal(at("the-lonely-road", 9), "andre-tree"); assert.equal(at("the-headless-horseman", 1), "wiley-swamp");
  assert.equal(at("gone", 3), "church-bridge"); assert.equal(at("gone", 7), "brook");
  // Landmarks: at most one twist and one boss per region, and some secrets to find on a return visit.
  for (const r of map.regions) { assert.ok(r.stops.filter((s) => s.landmark === "twist").length <= 1); assert.ok(r.stops.filter((s) => s.landmark === "boss").length <= 1); }
  assert.ok(map.regions.filter((r) => r.stops.some((s) => s.secret)).length >= 10);
  // The painted base has no words; labels are drawn in code.
  assert.match(map.art_description, /No text, no letters/);
});

test("layout: rebuilding from the spec gives the same map, every stop on the map and apart from its neighbours", () => {
  const again = layoutMap(SPEC, map.image);
  assert.deepEqual(JSON.parse(JSON.stringify(again.regions)), JSON.parse(JSON.stringify(map.regions)), "world.json matches scripts/maps/sleepy-hollow.ts");
  for (const r of again.regions) { const pts = trailOf(r); for (let i = 0; i < pts.length; i++) { assert.ok(pts[i].x >= 0 && pts[i].x <= map.width && pts[i].y >= 0 && pts[i].y <= map.height); for (let j = i + 1; j < pts.length; j++) assert.ok(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) >= 20, `${r.expedition} ${i + 1}/${j + 1}`); } }
});

test("validator: a stop off the map, a missing region, a wrong chunk count or an unknown place fails", () => {
  const bad = structuredClone(sh);
  bad.world_map!.regions[0].stops[0].x = 99999;
  bad.world_map!.regions[1].stops.pop();
  bad.world_map!.regions[2].stops[0].place = "nowhere";
  bad.world_map!.regions.splice(3, 1);
  bad.world_map!.regions[4].stops[1] = { ...bad.world_map!.regions[4].stops[0] };
  const p = mapProblems(bad).join(" | ");
  assert.match(p, /into-the-hollow stop 1 is off the map/); assert.match(p, /the-schoolmaster has 9 stops for 10 chunks/);
  assert.match(p, /unknown place nowhere/); assert.match(p, /no region for the-van-tassel-farm/); assert.match(p, /overlap/);
  // A story without a map has nothing to check (Trifles and The Tell-Tale Heart can get theirs later).
  const tr = WorldPackSchema.parse(JSON.parse(src("worlds/trifles/world.json")));
  assert.equal(tr.world_map, undefined); assert.deepEqual(mapProblems(tr), []);
});

test("unlocks and fog: the first region is current, the rest locked until the one before is proven; stars per stop", () => {
  const fresh = worldMapView(sh, []);
  assert.equal(fresh[0].state, "current"); assert.ok(fresh.slice(1).every((r) => r.state === "locked"));
  assert.equal(fresh[0].stops[0].state, "next"); assert.ok(fresh[0].stops.slice(1).every((s) => s.state === "ahead"));
  assert.ok(fresh[1].stops.every((s) => s.state === "locked"));
  assert.deepEqual(tokenAt(fresh), { expedition: exps[0].id, stop: 0 }, "the token waits at the first stop");
  // Expedition 1 proven: its stops carry stars from the first attempt; region 2 opens.
  const notes = exps[0].chunks.map((_, k) => note(k + 1, k === 2 ? { rightFirstTry: false, fixed: true } : k === 4 ? { rightFirstTry: false, fixed: false } : k === 6 ? { gistRight: false } : k === 7 ? { gistPick: null, gistRight: false } : {}));
  const v = worldMapView(sh, [attempt(exps[0].id, notes)]);
  assert.equal(v[0].state, "proven"); assert.equal(v[1].state, "current"); assert.equal(v[2].state, "locked");
  assert.deepEqual(v[0].stops.map((s) => s.stars), [3, 3, 1, 3, 0, 3, 2, 3, 3, 3]);
  assert.deepEqual(tokenAt(v), { expedition: exps[1].id, stop: 0 });
  assert.equal(stopStars(undefined), 0);
  // Only the first attempt counts for stars; a later replay doesn't change them.
  const replay = attempt(exps[0].id, exps[0].chunks.map((_, k) => note(k + 1)), true, "2026-11-02T10:00:00.000Z");
  assert.deepEqual(worldMapView(sh, [attempt(exps[0].id, notes), replay])[0].stops.map((s) => s.stars), [3, 3, 1, 3, 0, 3, 2, 3, 3, 3]);
  // Every region proven: the token stands at the last finale.
  const all = exps.map((e) => attempt(e.id, e.chunks.map((_, k) => note(k + 1))));
  assert.deepEqual(tokenAt(worldMapView(sh, all)), { expedition: exps.at(-1)!.id, stop: "finale" });
  assert.ok(pointOf(worldMapView(sh, all), { expedition: exps.at(-1)!.id, stop: "finale" }));
});

test("secrets: found on a return visit once the region is proven, from the chunk's own discovery", () => {
  const r0 = map.regions[0], s = r0.stops.find((x) => x.secret)!;
  assert.equal(worldMapView(sh, [])[0].stops.find((x) => x.chunk === s.chunk)!.secret, null, "not before the region is proven");
  const proven = [attempt(exps[0].id, exps[0].chunks.map((_, k) => note(k + 1)))];
  assert.equal(worldMapView(sh, proven)[0].stops.find((x) => x.chunk === s.chunk)!.secret, "hidden");
  assert.equal(worldMapView(sh, proven, [], [`${exps[0].id}:${s.chunk}`])[0].stops.find((x) => x.chunk === s.chunk)!.secret, "found");
  const d = secretOf(sh, exps[0].id, s.chunk)!;
  assert.equal(d.phrase, exps[0].chunks[s.chunk - 1].discovery.phrase);
  assert.equal(secretOf(sh, exps[0].id, r0.stops.find((x) => !x.secret)!.chunk), null, "only marked stops hold a secret");
  // The server checks the story, the secret and that the region is proven before saving; the migration is in place.
  const route = src("app/api/student/map/route.ts");
  assert.match(route, /secretOf\(world, expeditionId, chunk\)/); assert.match(route, /Finish that expedition first/);
  assert.match(src("supabase/migrations/202611040001_map_progress.sql"), /create table if not exists public\.map_progress/);
});

test("during a race: stops played so far, the next one, and the token's walk to it (the finale after the last chunk)", () => {
  const e = exps[0], r = raceRegions(sh, e.id, [3, 0, 2]).find((x) => x.expedition === e.id)!;
  assert.equal(r.state, "current");
  assert.deepEqual(r.stops.slice(0, 5).map((s) => [s.state, s.stars]), [["proven", 3], ["proven", 0], ["proven", 2], ["next", 0], ["ahead", 0]]);
  assert.deepEqual(raceTokenAt(sh, e.id, 3), { expedition: e.id, stop: 3 });
  assert.deepEqual(raceTokenAt(sh, e.id, e.chunks.length), { expedition: e.id, stop: "finale" });
  // The frame for one region covers its trail.
  const f = regionFrame(map, r);
  for (const p of trailOf(r)) assert.ok(p.x >= f.x && p.x <= f.x + f.w && p.y >= f.y && p.y <= f.y + f.h);
  // The class board: passed stops show without stars (-1), never anyone's levels.
  const host = raceRegions(sh, e.id, [-1, -1]).find((x) => x.expedition === e.id)!;
  assert.deepEqual(host.stops.slice(0, 2).map((s) => s.stars), [-1, -1]);
});

test("screens: the map replaces the trail, with a list view, keyboard and screen-reader labels, pan and zoom, and motion that stops for reduced motion", () => {
  const ui = src("app/world-map.tsx"), screen = src("app/expedition-map.tsx"), css = src("app/globals.css");
  assert.match(screen, /world\.world_map\?<StoryMap/); assert.match(screen, /<Trail stops=/, "stories without a map keep the trail");
  assert.match(screen, /aria-pressed=\{view==="list"\}/); assert.match(ui, /export function MapList/);
  assert.match(ui, /role="button" tabIndex=\{0\} aria-label=\{stopLabel\(r,s\)\}/); assert.match(ui, /aria-label="Zoom in"/); assert.match(ui, /onPointerMove=\{move\}/);
  assert.match(ui, /ArrowLeft/, "the arrow keys pan"); assert.match(ui, /r=\{22\*u\} fill="transparent"/, "44 px tap targets");
  assert.match(ui, /if\(reducedMotion\(\)\|\|pts\.length<2\)\{setWalk\(null\);return\}/, "no walk under reduced motion");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.map-fog,\.map-pulse,\.map-twinkle\{animation:none\}/);
  // Live: every token on the class map (gold when proved), each phone its own; the host only learns who proved after the reveal.
  assert.match(src("app/live/race-live.tsx"), /tokens=\{state\.lobby\.map\(p=>\(\{id:p\.id,name:p\.nickname/);
  assert.match(src("app/live/race-live.tsx"), /tokens=\{\[\{id:state\.me\.id/);
  assert.match(src("lib/live/server.ts"), /proved: round\.beat === "reveal" \|\| round\.beat === "board" \|\| round\.beat === "countdown"/);
  // The asset script paints the base map.
  assert.match(src("scripts/generate-assets.ts"), /process\.argv\.includes\("--map"\)/);
});
