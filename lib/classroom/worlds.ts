import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WorldPackSchema, type WorldPack } from "../world-schema.ts";

// Server-side read of a playable or preview story pack. Returns null for unknown ids or coming-soon folders.
export async function readWorld(worldId: string): Promise<WorldPack | null> {
  if (!/^[a-z0-9-]+$/.test(worldId)) return null;
  try {
    const parsed = WorldPackSchema.safeParse(JSON.parse(await readFile(join(process.cwd(), "worlds", worldId, "world.json"), "utf8")));
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}
