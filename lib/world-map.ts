// The world map: each expedition is a region on a painted map of the story's own places, and each chunk a stop where
// that part of the story happens (data: world_map in world.json, built by scripts/build-map.ts). Pure rules:
// - regions: locked (in fog) until the expedition before is proven, then current, then proven;
// - stops: in a proven region each stop is proven with 0 to 3 stars from its first attempt (3: proved on the first try
//   with the Gist check right or not asked; 2: proved on the first try; 1: fixed in the Refresher; 0: not yet); in the
//   current region the first stop is next and the rest are ahead; in a locked region every stop is locked;
// - the student's token stands at the next stop (or the last finale once every region is proven);
// - secrets: a stop marked secret holds its chunk's discovery, found on a return visit once its region is proven.
// Drawing: app/world-map.tsx. Problems for validate:worlds: mapProblems.
import type { WorldPack } from "./world-schema.ts";
import { expeditionMap, firstAttempts, type ExpeditionAttempt, type StopState } from "./expedition-progress.ts";
import type { CaseNote } from "./case-notes.ts";

export type WorldMapData = NonNullable<WorldPack["world_map"]>;
export type MapRegionData = WorldMapData["regions"][number];
export type MapStopState = "locked" | "ahead" | "next" | "proven";
export type MapStopView = { chunk: number; x: number; y: number; place: string; placeName: string; state: MapStopState; stars: number; landmark: "twist" | "boss" | null; secret: "hidden" | "found" | null };
export type MapRegionView = { expedition: string; number: number; title: string; name: string; area: string | null; state: StopState; stars: number; label: { x: number; y: number }; stops: MapStopView[]; finale: { x: number; y: number; placeName: string; state: MapStopState; solved: boolean | null } | null; assigned: { due: string | null } | null };
export type TokenAt = { expedition: string; stop: number | "finale" };

// Stars for one stop, from its first-attempt note.
export function stopStars(n: Pick<CaseNote, "rightFirstTry" | "fixed" | "gistPick" | "gistRight"> | undefined) {
  if (!n) return 0;
  if (n.rightFirstTry) return n.gistPick === null || n.gistRight ? 3 : 2;
  return n.fixed ? 1 : 0;
}

// Every region with its stops' states. secretsFound: "expedition:chunk" keys of secrets already found.
export function worldMapView(world: WorldPack, attempts: ExpeditionAttempt[], assigned: { expeditionId: string; due: string | null }[] = [], secretsFound: string[] = []): MapRegionView[] {
  const map = world.world_map; if (!map) return [];
  const exps = expeditionMap(world, attempts, assigned), firsts = firstAttempts(attempts.filter((a) => a.worldId === world.id));
  const placeName = (id: string) => map.places.find((p) => p.id === id)?.name ?? id;
  return exps.map((x) => {
    const r = map.regions.find((g) => g.expedition === x.id)!, exp = world.expeditions!.find((e) => e.id === x.id)!;
    const first = firsts.find((a) => a.expeditionId === x.id);
    const stops: MapStopView[] = r.stops.map((s, k) => {
      const state: MapStopState = x.state === "proven" ? "proven" : x.state === "locked" ? "locked" : k === 0 ? "next" : "ahead";
      const note = first?.notes.find((n) => n.chunk === s.chunk);
      return { chunk: s.chunk, x: s.x, y: s.y, place: s.place, placeName: placeName(s.place), state, stars: state === "proven" ? stopStars(note) : 0, landmark: s.landmark ?? null,
        secret: s.secret && x.state === "proven" ? (secretsFound.includes(`${x.id}:${s.chunk}`) ? "found" : "hidden") : null };
    });
    const finale = exp.interview && r.finale ? { x: r.finale.x, y: r.finale.y, placeName: placeName(r.finale.place), state: (x.state === "proven" ? "proven" : x.state === "locked" ? "locked" : "ahead") as MapStopState, solved: x.solved } : null;
    return { expedition: x.id, number: x.number, title: x.title, name: r.name, area: r.area ?? null, state: x.state, stars: x.stars, label: r.label, stops, finale, assigned: x.assigned };
  });
}

// Where the student's token stands: the next stop of the current region, or the last region's finale (or last stop).
export function tokenAt(regions: MapRegionView[]): TokenAt | null {
  const cur = regions.find((r) => r.state === "current");
  if (cur) return { expedition: cur.expedition, stop: 0 };
  const last = regions.at(-1); if (!last) return null;
  return { expedition: last.expedition, stop: last.finale ? "finale" : last.stops.length - 1 };
}
// A point on the map for a token position.
export function pointOf(regions: Pick<MapRegionView, "expedition" | "stops" | "finale">[], at: TokenAt) {
  const r = regions.find((g) => g.expedition === at.expedition); if (!r) return null;
  if (at.stop === "finale") return r.finale ? { x: r.finale.x, y: r.finale.y } : { x: r.stops.at(-1)!.x, y: r.stops.at(-1)!.y };
  const s = r.stops[Math.max(0, Math.min(r.stops.length - 1, at.stop))]; return { x: s.x, y: s.y };
}
// The region's trail through its stops and on to the finale (for drawing and for the token's walk).
export const trailOf = (r: { stops: { x: number; y: number }[]; finale: { x: number; y: number } | null }) => [...r.stops.map((s) => ({ x: s.x, y: s.y })), ...(r.finale ? [{ x: r.finale.x, y: r.finale.y }] : [])];
// The frame that shows one region (its stops, finale and badge), padded, in map pixels.
export function regionFrame(map: Pick<WorldMapData, "width" | "height">, r: { stops: { x: number; y: number }[]; finale: { x: number; y: number } | null }, pad = 70) {
  const pts = trailOf(r), xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  // Never closer than a quarter of the map's width, so a tight cluster still shows where it is.
  const minW = map.width / 4, minH = map.height / 4;
  if (x1 - x0 < minW) { const c = (x0 + x1) / 2; x0 = c - minW / 2; x1 = c + minW / 2; }
  if (y1 - y0 < minH) { const c = (y0 + y1) / 2; y0 = c - minH / 2; y1 = c + minH / 2; }
  return { x: Math.max(0, x0), y: Math.max(0, y0), w: Math.min(map.width, x1) - Math.max(0, x0), h: Math.min(map.height, y1) - Math.max(0, y0) };
}

// A secret's discovery: the chunk's own figurative phrase or rich word, with its note.
export function secretOf(world: WorldPack, expedition: string, chunk: number) {
  const e = world.expeditions?.find((x) => x.id === expedition), c = e?.chunks[chunk - 1];
  const s = world.world_map?.regions.find((r) => r.expedition === expedition)?.stops.find((x) => x.chunk === chunk);
  return c && s?.secret ? { phrase: c.discovery.phrase, note: c.discovery.note, kind: c.discovery.kind } : null;
}

// For validate:worlds: every expedition has a region with one stop per chunk, in order, on the map; places exist; one
// twist and one boss at most per region; a finale for each Interview; stops in a region at least 20 px apart.
export function mapProblems(world: WorldPack): string[] {
  const map = world.world_map; if (!map) return [];
  const out: string[] = [], places = new Set(map.places.map((p) => p.id));
  const inside = (p: { x: number; y: number }) => p.x >= 0 && p.y >= 0 && p.x <= map.width && p.y <= map.height;
  if (!/\.(webp|png|jpg)$/.test(map.image)) out.push(`world_map: image must be a picture file (${map.image})`);
  for (const p of map.places) if (!inside(p)) out.push(`world_map: place ${p.id} is off the map`);
  if (new Set(map.places.map((p) => p.id)).size !== map.places.length) out.push("world_map: place ids repeat");
  for (const e of world.expeditions ?? []) {
    const r = map.regions.find((g) => g.expedition === e.id);
    if (!r) { out.push(`world_map: no region for ${e.id}`); continue; }
    if (r.stops.length !== e.chunks.length) out.push(`world_map: ${e.id} has ${r.stops.length} stops for ${e.chunks.length} chunks`);
    r.stops.forEach((s, k) => {
      if (s.chunk !== k + 1) out.push(`world_map: ${e.id} stop ${k + 1} is for chunk ${s.chunk}`);
      if (!places.has(s.place)) out.push(`world_map: ${e.id} stop ${s.chunk} is at an unknown place ${s.place}`);
      if (!inside(s)) out.push(`world_map: ${e.id} stop ${s.chunk} is off the map`);
    });
    for (const kind of ["twist", "boss"] as const) if (r.stops.filter((s) => s.landmark === kind).length > 1) out.push(`world_map: ${e.id} has more than one ${kind}`);
    if (e.interview && !r.finale) out.push(`world_map: ${e.id} has an Interview but no finale for Name the Liar`);
    if (r.finale && (!places.has(r.finale.place) || !inside(r.finale))) out.push(`world_map: ${e.id} finale is off the map or at an unknown place`);
    if (!inside(r.label)) out.push(`world_map: ${e.id} badge is off the map`);
    const pts = trailOf({ stops: r.stops, finale: r.finale ?? null });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < 20) out.push(`world_map: ${e.id} stops ${i + 1} and ${j + 1} overlap`);
  }
  for (const r of map.regions) if (!(world.expeditions ?? []).some((e) => e.id === r.expedition)) out.push(`world_map: region ${r.expedition} has no expedition`);
  const areas = new Set(map.areas?.map((a) => a.id) ?? []);
  for (const p of map.places) if (p.area && !areas.has(p.area)) out.push(`world_map: place ${p.id} is in an unknown area ${p.area}`);
  for (const r of map.regions) if (r.area && !areas.has(r.area) && !places.has(r.area)) out.push(`world_map: region ${r.expedition} is in an unknown area ${r.area}`);
  return out;
}

// The map during a race: this expedition's region with the stops played so far proven (stars: 0 to 3 per stop, or -1
// to show a stop as passed without stars, as on the class board), the next one to play, and the rest ahead. The other
// regions keep their places as small badges.
export function raceRegions(world: WorldPack, expeditionId: string, stars: number[]): MapRegionView[] {
  return worldMapView(world, [], []).map((r) => {
    if (r.expedition !== expeditionId) return { ...r, state: "locked" as const, stars: 0, stops: r.stops.map((s) => ({ ...s, state: "ahead" as const, secret: null })), finale: r.finale ? { ...r.finale, state: "ahead" as const } : null };
    const stops = r.stops.map((s, k) => ({ ...s, secret: null, state: (k < stars.length ? "proven" : k === stars.length ? "next" : "ahead") as MapStopState, stars: k < stars.length ? stars[k] : 0 }));
    return { ...r, state: "current" as const, stops, finale: r.finale ? { ...r.finale, state: (stars.length >= r.stops.length ? "next" : "ahead") as MapStopState } : null };
  });
}
// Where a token stands during a race after `played` stops: at the next stop, or at the finale (or last stop) once all
// are played.
export function raceTokenAt(world: WorldPack, expeditionId: string, played: number): TokenAt {
  const r = world.world_map?.regions.find((g) => g.expedition === expeditionId), n = r?.stops.length ?? 0;
  return played < n ? { expedition: expeditionId, stop: played } : { expedition: expeditionId, stop: r?.finale ? "finale" : Math.max(0, n - 1) };
}
