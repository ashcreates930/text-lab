// Prints a scene's reading as numbered sentences per paragraph (the units students tap), for answer-key reviews.
// Usage: node --experimental-strip-types scripts/scene-passages.ts <world-id> <scene number, 1-based>
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages, readingPortions } from "../lib/source-passages.ts";
import { evidenceSentences } from "../lib/lies.ts";
const [worldId, sceneArg] = process.argv.slice(2);
const world = WorldPackSchema.parse(JSON.parse(readFileSync(`worlds/${worldId}/world.json`, "utf8")));
const passages = parseSourcePassages(readFileSync(`worlds/${worldId}/source.md`, "utf8"));
const si = Number(sceneArg) - 1, scene = world.scenes[si];
const ids = new Set([...(readingPortions(passages, world.scenes)[si] ?? []).map((p) => p.id), ...scene.artifacts.flatMap((a) => a.source_anchor), ...(scene.story_mode?.read.chunks ?? [])]);
const out = [`# ${world.title} · Scene ${si + 1} reading (sentences are the tappable lines)`, ""];
for (const p of passages.filter((x) => ids.has(x.id))) { out.push(`## ¶${Number(p.id.slice(1))}`); evidenceSentences(p.text).forEach((s, i) => out.push(`${i + 1}. ${s.replace(/\s+/g, " ")}`)); out.push(""); }
console.log(out.join("\n"));
