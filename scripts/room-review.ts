// Writes the escape-room section of docs/game-content-review.md from world.json (between the markers): each room's
// door, and every puzzle lock with its answers and the lines that prove them, so the review matches what students see.
// Run: node --experimental-strip-types scripts/room-review.ts
import { readFileSync, writeFileSync } from "node:fs";
import { WorldPackSchema, type LineRef } from "../lib/world-schema.ts";
import { parseSourcePassages, paragraphNumber } from "../lib/source-passages.ts";
import { codeOf, lineAt, roomOf } from "../lib/escape-room.ts";

const START = "<!-- rooms:start -->", END = "<!-- rooms:end -->";
const one = (s: string) => s.replace(/\s+/g, " ").trim();
const out: string[] = [START, "## Escape rooms: puzzle locks (for review)", "",
  "Generated from world.json by `scripts/room-review.ts`. Every puzzle is solved only by reading: students tap or match lines from the story, never letters or pictures alone. One try scores; after a miss the right answer is outlined and the student taps it to open the lock (0 points, recorded as a miss). Pictures are original art (gpt-image-2) awaiting your approval.", ""];
for (const id of ["sleepy-hollow", "tell-tale-heart", "trifles"]) {
  const world = WorldPackSchema.parse(JSON.parse(readFileSync(`worlds/${id}/world.json`, "utf8")));
  if (!world.rooms?.length) continue;
  const passages = parseSourcePassages(readFileSync(`public/worlds/${id}/source.md`, "utf8"));
  const quote = (r: LineRef) => `¶${paragraphNumber(r.p)} sentence ${r.s + 1}: "${one(lineAt(passages, r) ?? "?")}"`;
  out.push(`### ${world.title}`, "");
  for (const data of world.rooms) {
    const room = roomOf(world, data.expedition); if (!room) continue;
    out.push(`#### Room ${room.number}: ${room.name} (Expedition: ${world.expeditions!.find((e) => e.id === data.expedition)!.title})`, "");
    if (data.door) out.push(`- The door: "${data.door}"`);
    for (const p of data.puzzles ?? []) {
      const where = room.puzzles.find((x) => x.id === p.id)?.innerDoor ? `the inner door, after lock ${p.after} and the checkpoint` : `after lock ${p.after}`;
      out.push("", `##### ${p.title} (${where})`, "");
      if (p.prompt) out.push(`Prompt: "${p.prompt}"`, "");
      if (p.type === "code") {
        out.push(`Code: ${codeOf(p).split("").join("-")} (spells no word in the story). Each dial: the question, the word to tap, and its line.`, "");
        p.dials.forEach((d, k) => out.push(`${k + 1}. ${d.question} → **${d.word}** · ${quote(d.line)}`));
      } else if (p.type === "painting") {
        out.push(`Picture: \`${p.art ?? "sketch until approved"}\` (${p.alt}). ${p.wrong} details are wrong (✗); each is disproved by its line. The right ones (✓) are confirmed by theirs.`, "");
        p.details.forEach((d, k) => out.push(`${k + 1}. ${d.wrong ? "✗" : "✓"} ${d.label} · ${d.lines.map(quote).join(" / ")}`));
      } else {
        out.push(`Picture: \`${p.art ?? "sketch until approved"}\` (${p.alt}). Each object matches one line; the tray adds near misses. Every object is a literal thing in the story, never taken from a simile or metaphor.`, "");
        p.objects.forEach((o, k) => out.push(`${k + 1}. ${o.label} → ${quote(o.line)}`));
        p.near_misses.forEach((r) => out.push(`- Near miss in the tray: ${quote(r)}`));
      }
    }
    out.push("");
  }
}
out.push(END);
const path = "docs/game-content-review.md", doc = readFileSync(path, "utf8");
const a = doc.indexOf(START), b = doc.indexOf(END);
writeFileSync(path, a >= 0 && b > a ? doc.slice(0, a) + out.join("\n") + doc.slice(b + END.length) : `${doc.trimEnd()}\n\n${out.join("\n")}\n`);
console.log("rooms section written");
