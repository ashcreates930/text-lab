// Builds each story's world map into its world.json from scripts/maps/<world>.ts: places from the spec, one region per
// expedition, one stop per chunk laid out around the place where it happens. An expedition's stops at one place form a
// short trail; when several expeditions use the same place, each gets its own spot around it. The result is plain
// coordinates in world.json, which can be edited there by hand (re-running this script replaces them).
// Usage: node --experimental-strip-types scripts/build-map.ts [--world=sleepy-hollow]
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export type MapSpec = {
  width: number; height: number; art_description: string;
  areas?: { id: string; name: string; x: number; y: number }[];
  places: { id: string; name: string; x: number; y: number; label_only?: boolean; area?: string }[];
  expeditions: Record<string, { name: string; finale: string; twist?: number; boss?: number; secrets?: number[]; chunks: string[] }>;
};
type Pt = { x: number; y: number };
const ROW = 4, GAP = 46, MIN_GAP = 40, BADGE = 84;

// Lays out every stop. Pure, so tests can check it. Each expedition's run of chunks at one place snakes around that
// place (rows of up to 4, 46 px apart); only one region's stops are drawn at a time, so expeditions that share a place
// can overlap. The region's badge (label) sits at its main area (a place, or an area such as a farm's places together),
// spread around it when several regions share it; ties go to where the expedition starts.
export function layoutMap(spec: MapSpec, image: string) {
  const place = new Map(spec.places.map((p) => [p.id, p]));
  const regions = Object.entries(spec.expeditions).map(([expedition, e]) => {
    const runs: { place: string; chunks: number[] }[] = [];
    e.chunks.forEach((p, k) => { const last = runs.at(-1); if (last && last.place === p) last.chunks.push(k + 1); else runs.push({ place: p, chunks: [k + 1] }); });
    const stops: { chunk: number; place: string; x: number; y: number; landmark?: "twist" | "boss"; secret?: boolean }[] = [];
    const seen = new Map<string, number>();
    for (const run of runs) {
      const a = place.get(run.place); if (!a) throw new Error(`${expedition}: no place ${run.place}`);
      const again = seen.get(run.place) ?? 0; seen.set(run.place, again + 1);
      const n = run.chunks.length, rows = Math.ceil(n / ROW), cx = a.x + again * 40, cy = a.y + again * 36;
      run.chunks.forEach((chunk, i) => {
        const row = Math.floor(i / ROW), inRow = i % ROW, count = Math.min(ROW, n - row * ROW);
        const col = row % 2 ? count - 1 - inRow : inRow; // snake: every other row runs back
        stops.push({ chunk, place: run.place, x: cx + (col - (count - 1) / 2) * GAP, y: cy + (row - (rows - 1) / 2) * GAP + (col % 2 ? 7 : -7) });
      });
    }
    for (const s of stops) { if (s.chunk === e.twist) s.landmark = "twist"; else if (s.chunk === e.boss) s.landmark = "boss"; if (e.secrets?.includes(s.chunk)) s.secret = true; }
    const last = stops.at(-1)!, prev = stops.at(-2) ?? { x: last.x - 1, y: last.y };
    const len = Math.hypot(last.x - prev.x, last.y - prev.y) || 1;
    const fin = place.get(e.finale); if (!fin) throw new Error(`${expedition}: no finale place ${e.finale}`);
    // The finale sits just past the last stop when that is its place, or at its own place.
    const finale = e.finale === last.place ? { place: e.finale, x: last.x + ((last.x - prev.x) / len) * GAP * 1.2, y: last.y + ((last.y - prev.y) / len) * GAP * 1.2 } : { place: e.finale, x: fin.x, y: fin.y - GAP };
    // Keep this region's own stops apart.
    const own = [...stops, finale];
    for (let pass = 0; pass < 30; pass++) {
      let moved = false;
      for (let i = 0; i < own.length; i++) for (let j = i + 1; j < own.length; j++) {
        const dx = own[j].x - own[i].x, dy = own[j].y - own[i].y, d = Math.hypot(dx, dy);
        if (d < MIN_GAP) { const push = (MIN_GAP - d) / 2 + 0.5, ux = d ? dx / d : 1, uy = d ? dy / d : 0; own[i].x -= ux * push; own[i].y -= uy * push; own[j].x += ux * push; own[j].y += uy * push; moved = true; }
      }
      if (!moved) break;
    }
    // The badge: the area (or place) where most of this expedition happens; a tie goes to where it starts.
    const areaOf = (p: string) => place.get(p)?.area ?? p, counts = new Map<string, number>(); for (const p of e.chunks) counts.set(areaOf(p), (counts.get(areaOf(p)) ?? 0) + 1);
    const main = [...counts.entries()].sort((x, y) => y[1] - x[1])[0][0];
    return { expedition, name: e.name, area: main, label: { x: 0, y: 0 }, stops, finale };
  });
  // Badges: alone at their area, or evenly round a circle wide enough that neighbours stay a tap target apart on a
  // laptop or a projector (a phone merges them into one marker).
  const byArea = new Map<string, typeof regions>(); for (const r of regions) byArea.set(r.area, [...(byArea.get(r.area) ?? []), r]);
  for (const [area, list] of byArea) {
    const m = spec.areas?.find((a) => a.id === area) ?? place.get(area)!, n = list.length, R = n > 1 ? Math.max(BADGE, BADGE / (2 * Math.sin(Math.PI / n))) : 0;
    list.forEach((r, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; r.label = { x: m.x + R * Math.cos(a), y: m.y - BADGE * 0.9 + R * Math.sin(a) }; });
  }
  const clamp = (v: number, max: number) => Math.round(Math.min(max - 24, Math.max(24, v)));
  for (const r of regions) { for (const p of [...r.stops, r.finale, r.label]) { p.x = clamp(p.x, spec.width); p.y = clamp(p.y, spec.height); } }
  return { image, width: spec.width, height: spec.height, art_description: spec.art_description, ...(spec.areas ? { areas: spec.areas } : {}), places: spec.places, regions };
}


if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("build-map.ts")) {
  const only = process.argv.find((a) => a.startsWith("--world="))?.slice(8);
  const specs = (await readdir(join(process.cwd(), "scripts", "maps"))).filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3)).filter((w) => !only || w === only);
  for (const id of specs) {
    const { SPEC } = (await import(`./maps/${id}.ts`)) as { SPEC: MapSpec };
    const file = join(process.cwd(), "worlds", id, "world.json"), raw = JSON.parse(await readFile(file, "utf8"));
    const missing = (raw.expeditions ?? []).map((e: { id: string }) => e.id).filter((x: string) => !SPEC.expeditions[x]);
    if (missing.length) throw new Error(`${id}: no map region for ${missing.join(", ")}`);
    raw.world_map = layoutMap(SPEC, raw.world_map?.image ?? `/worlds/${id}/map/base.webp`);
    await writeFile(file, JSON.stringify(raw, null, 2) + "\n");
    console.log(`${id}: ${raw.world_map.regions.length} regions, ${raw.world_map.regions.reduce((a: number, r: { stops: unknown[] }) => a + r.stops.length, 0)} stops`);
  }
}
