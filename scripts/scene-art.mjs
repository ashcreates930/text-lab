// Explorable room scenes (docs/scene-plan.md): one painted scene per chamber. Run: node scripts/scene-art.mjs [id ...]
// (skips scenes that exist unless ids are given). Style: the poster (public/home/poster-step-into.jpg) and the moodiest
// room art, passed only as style references: painterly, moody, period-accurate oil painting, muted colours, moonlit or
// golden-hour light, nothing cartoonish, no text. Each scene is accurate to its chamber's text, with no deliberate
// mistakes, and leaves the objects that become items clear and findable. People are adults or teens, never children.
// Nothing from a content-noted paragraph is drawn.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const root = "C:/Users/epiph/Documents/Codex/2026-09-30/files-pasted-by-the-user-project";
const req = createRequire(root + "/package.json");
const OpenAI = req("openai").default, { toFile } = req("openai"), sharp = req("sharp"); sharp.cache(false);
const key = (fs.readFileSync(root + "/.env.local", "utf8").match(/^OPENAI_API_KEY=(.*)$/m) || [])[1]?.trim().replace(/^"|"$/g, "");
const client = new OpenAI({ apiKey: key });
const dir = path.join(root, "public/worlds/sleepy-hollow/scenes");
const STYLE = "Paint a brand-new scene. The two reference images are for STYLE ONLY: copy their oil-painting brushwork, muted earthy palette, soft atmospheric depth and moody light, but do not copy their composition, figures, book, frame, border, title or any lettering. A wide landscape oil painting, painterly and moody, period-accurate for a Dutch farming valley on the Hudson River around 1790, muted colours, nothing cartoonish, no outlines, no text, no letters, no signs with writing, no border or frame. Any people are adults or teenagers, never children, small in the scene and dressed for the period. Every object listed below must be clearly visible, uncluttered and easy to find, each in its own part of the picture.";
const SCENES = {
  // Room 1, Chamber 1 (paragraphs 3 to 5): golden hour.
  "into-the-hollow-1": `${STYLE} The scene: late golden-hour light over a quiet little valley among high hills above the Hudson. Lower left: the edge of a broad river cove with a small Dutch market village at the water, its tavern (a low stone-and-timber inn with a hanging sign that has no lettering) nearest to us, a few sloops at anchor. A dirt road climbs from the village into the valley, left to right. On the road near the inn, an old farmer in a brown coat and hat stands waiting. Lower middle: a small brook glides through the valley under the road, gentle, not a waterfall. Middle left: a grove of tall walnut trees on the hillside; a grey squirrel sits on one high branch; a woodpecker clings to one trunk. In the grass beside the brook, a single quail. Middle: a soft, drowsy golden haze hangs low over the valley fields. Middle right: an old Dutch stone farmhouse with a deep porch, where two country folk sit idle, gazing into the distance as if in a daydream. Far right: a sturdy wooden farm gate where the road leaves the valley, closed. High hills all around, calm sky.`,
  // Room 1, Chamber 2 (paragraphs 5 to 9): moonlight.
  "into-the-hollow-2": `${STYLE} The scene: the same valley by moonlight, misty and still. Upper sky: deep blue night with stars and one bright meteor streaking across. Upper right: an old white Dutch church on a low rise among tall dark trees, its churchyard below it with old leaning gravestones; an old iron cannon-ball lies half sunk in the grass by the graves. A dirt road winds through the hollow toward the church; far down the road, a tall cloaked rider on a great dark horse, his whole shape lost in shadow and mist, only a silhouette, nothing gruesome. Middle left: a few farmhouses with warm glowing windows, as if families sit telling tales by the fire. Lower left: a rapid stream rushing over rocks, and at its edge a small nook of perfectly still water where a single straw and a bubble float calmly. On the road near the farmhouses, a broad-shouldered young man of about twenty in a fur cap stands with his thumbs in his belt; near the church gate, a young woman of about eighteen in a cap and shawl holds a lantern. The church door is closed and dark.`,
};
const refs = async () => Promise.all([
  toFile(await sharp(path.join(root, "public/home/poster-step-into.jpg")).png().toBuffer(), "poster.png", { type: "image/png" }),
  toFile(await sharp(path.join(root, "public/worlds/sleepy-hollow/rooms/andre-tree.webp")).png().toBuffer(), "andre-tree.png", { type: "image/png" }),
]);
fs.mkdirSync(dir, { recursive: true });
const only = process.argv.slice(2);
for (const id of only.length ? only : Object.keys(SCENES)) {
  const out = path.join(dir, id + ".webp");
  if (!only.length && fs.existsSync(out)) { console.log("kept", id); continue; }
  try {
    const r = await client.images.edit({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2", image: await refs(), prompt: SCENES[id], size: "1536x1024", quality: "high" });
    fs.writeFileSync(out, await sharp(Buffer.from(r.data[0].b64_json, "base64")).webp({ quality: 84 }).toBuffer());
    console.log("saved", id);
  } catch (e) { console.log("FAILED", id, e.status ?? "", String(e.message).slice(0, 200)); }
}
