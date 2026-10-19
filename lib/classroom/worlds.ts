import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WorldPackSchema, type WorldPack } from "../world-schema.ts";
import { parseSourcePassages, type SourcePassage } from "../source-passages.ts";

// Server-side read of a playable or preview story pack. Returns null for unknown ids or coming-soon folders.
export async function readWorld(worldId: string): Promise<WorldPack | null> {
  if (!/^[a-z0-9-]+$/.test(worldId)) return null;
  try {
    const parsed = WorldPackSchema.safeParse(JSON.parse(await readFile(join(process.cwd(), "worlds", worldId, "world.json"), "utf8")));
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}

// Server-side read of a story's paragraphs (source.md); empty for unknown ids. Kept in memory once read, since live
// rounds check pinned lines against it on every action.
const passageCache = new Map<string, Promise<SourcePassage[]>>();
export function readPassages(worldId: string): Promise<SourcePassage[]> {
  if (!/^[a-z0-9-]+$/.test(worldId)) return Promise.resolve([]);
  let p = passageCache.get(worldId);
  if (!p) {
    p = readFile(join(process.cwd(), "worlds", worldId, "source.md"), "utf8").then(parseSourcePassages, () => { passageCache.delete(worldId); return []; });
    passageCache.set(worldId, p);
  }
  return p;
}
