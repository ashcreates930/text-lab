// Run: node scripts/room-art-edits.mjs [id ...]. Redraws from the teacher's Rooms 3 to 14 review, editing each picture so its layout (and hotspots) stay put.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const root = "C:/Users/epiph/Documents/Codex/2026-09-30/files-pasted-by-the-user-project";
const req = createRequire(root + "/package.json");
const OpenAI = req("openai").default, { toFile } = req("openai"), sharp = req("sharp"); sharp.cache(false);
const key = (fs.readFileSync(root + "/.env.local", "utf8").match(/^OPENAI_API_KEY=(.*)$/m) || [])[1]?.trim().replace(/^"|"$/g, "");
const client = new OpenAI({ apiKey: key });
const dir = path.join(root, "public/worlds/sleepy-hollow/rooms");
const BROM = "a young man of about twenty, tall, broad-shouldered and powerfully built like an athlete, with short curly black hair and a bold, confident grin; strong and muscular, not heavyset, not fat";
const EDITS = {
  "arriving-party": "Keep this painting exactly as it is: the same farmhouse, guests, pumpkins, river, sailboat, sunset light and painterly style. Change only two things. 1) The young man walking in the center, seen from behind: his long braided queue of hair is tied at the end with a dark, glossy strip of eel-skin, not a ribbon or bow. 2) Add an old farmer with a weathered face, in a homespun coat and breeches, standing just to the right of the path in the lower middle, wearing big clunky shoes with large shiny pewter buckles, clearly visible; the young man's own shoes become plain. No text.",
  "pranked-school": `Keep this painting exactly as it is: the same smoking log schoolhouse, the overturned things inside, the gang at the door, the howling dog, the lanky schoolmaster in black, the light and the painterly style. Change only the burly man on the far left who is shaking the schoolmaster's hand: redraw him as Brom Bones, ${BROM}, in a work shirt and vest, offering the same friendly handshake. No text.`,
  "tea-table": `Keep this painting exactly as it is: the same feast table, cakes, doughnuts, pies, guests, the lanky schoolmaster refusing a plate, the window, the light and the painterly style. Change only the rider seen through the window: redraw him as Brom Bones, ${BROM}, in a blue coat, sitting on the same gentle, sleepy little pony. No text.`,
  "getting-ready": "Keep this painting exactly as it is: the same schoolroom, spilled ink and pages, cracked mirror, saddle with short stirrups, the old gray horse in the doorway, the light and the painterly style. Change only the horse's mane: it is tangled and knotted with many large, clearly visible brown prickly burrs, round spiky seed heads caught all through the mane and forelock. No text.",
};
for (const id of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(EDITS)) {
  try {
    const src = await sharp(path.join(dir, id + ".webp")).resize(1536, 1024).png().toBuffer();
    const r = await client.images.edit({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2", image: await toFile(src, id + ".png", { type: "image/png" }), prompt: EDITS[id], size: "1536x1024", quality: "high" });
    fs.writeFileSync(path.join(dir, id + ".webp"), await sharp(Buffer.from(r.data[0].b64_json, "base64")).resize(1200, 800).webp({ quality: 82 }).toBuffer());
    console.log("saved", id);
  } catch (e) { console.log("FAILED", id, String(e.message).slice(0, 160)); }
}
