// Fixes to a scene that keep its layout (and item spots) in place. Run: node scripts/scene-art-edits.mjs [id ...]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const root = "C:/Users/epiph/Documents/Codex/2026-09-30/files-pasted-by-the-user-project";
const req = createRequire(root + "/package.json");
const OpenAI = req("openai").default, { toFile } = req("openai"), sharp = req("sharp"); sharp.cache(false);
const key = (fs.readFileSync(root + "/.env.local", "utf8").match(/^OPENAI_API_KEY=(.*)$/m) || [])[1]?.trim().replace(/^"|"$/g, "");
const client = new OpenAI({ apiKey: key });
const dir = path.join(root, "public/worlds/sleepy-hollow/scenes");
const EDITS = {
  "into-the-hollow-2": "Keep this painting exactly as it is: the same moonlit valley, stars and meteor, white church, churchyard and gravestones, the iron cannon-ball, the gate and stone wall, the farmhouses with glowing windows, the rapid stream and the still nook with the straw and bubble, the young woman with the lantern, the road, the light and the oil-painting style. Change only two things. 1) The distant rider on the dark horse far down the road is the Headless Horseman: make him clearly headless. He wears a long dark cloak whose broad shoulders end flat, and there is NO head, NO hat and NO face above them, only empty misty night sky where a head would be, so his silhouette is a cloak and shoulders with nothing on top. Make the rider a little larger and the mist behind him a little lighter so the empty space above his shoulders is easy to see. Keep it eerie, never gruesome: no neck, no blood. 2) The young man standing on the road: make him a broad-shouldered, powerfully built young man of about twenty, strong like an athlete, not heavyset, wearing a fur cap, with his thumbs hooked in his belt and a bold, confident look.",
};
for (const id of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(EDITS)) {
  try {
    const src = await sharp(path.join(dir, id + ".webp")).png().toBuffer();
    const r = await client.images.edit({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2", image: await toFile(src, id + ".png", { type: "image/png" }), prompt: EDITS[id], size: "1536x1024", quality: "high" });
    fs.writeFileSync(path.join(dir, id + ".webp"), await sharp(Buffer.from(r.data[0].b64_json, "base64")).webp({ quality: 84 }).toBuffer());
    console.log("saved", id);
  } catch (e) { console.log("FAILED", id, String(e.message).slice(0, 160)); }
}
