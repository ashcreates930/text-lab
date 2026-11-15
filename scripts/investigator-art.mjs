// Escape rooms, phase 8: the investigator avatars and gear (run: node scripts/investigator-art.mjs [id ...]; skips
// pictures that exist unless ids are given). Avatars: original painted portraits of young investigators (about 13), in
// the same painterly style as the story portraits, dressed for any story (a long coat, a scarf, a satchel), never a
// real person. Gear: painted objects on a transparent background, each earned only by proving things with lines.
// For the teacher's approval before the app shows them (lib/investigator.ts INVESTIGATOR_ART_APPROVED).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const root = "C:/Users/epiph/Documents/Codex/2026-09-30/files-pasted-by-the-user-project";
const req = createRequire(root + "/package.json");
const OpenAI = req("openai").default, sharp = req("sharp"); sharp.cache(false);
const key = (fs.readFileSync(root + "/.env.local", "utf8").match(/^OPENAI_API_KEY=(.*)$/m) || [])[1]?.trim().replace(/^"|"$/g, "");
const client = new OpenAI({ apiKey: key });
const PORTRAIT = "An original hand-painted portrait in a painterly storybook style: textured brushwork, warm candlelit browns and teal, soft dark background with a gentle glow behind the head, head and shoulders, looking at the viewer with a friendly, curious expression. A young investigator (the age given below), fully clothed and right for a school app used in grades 6 to 12: a long wool coat with a turned-up collar, a knitted scarf, a leather satchel strap across the chest. Timeless clothing that fits any old story, nothing modern, no logos. No text, no frame. Not a real person.";
const OBJECT = "An original hand-painted object in a painterly storybook style: textured brushwork, warm brass, leather and wood tones, soft rim light, the single object centered with a little space around it, on a fully transparent background, no shadow box, no text.";
const AVATARS = {
  "investigator-1": "An older teenage girl of about sixteen, clearly a high schooler with a mature, confident face: dark brown skin and short natural curly hair, a mustard-yellow scarf.",
  "investigator-2": "A boy of about twelve, a middle schooler: light skin, freckles and messy red hair, a deep green scarf.",
  "investigator-3": "A young woman of about seventeen, clearly a high school senior with a mature face: light brown skin and long black hair in a braid over one shoulder, a deep red scarf.",
  "investigator-4": "A teenage boy of about sixteen, clearly a high schooler: East Asian features, short black hair neatly swept back with a side part, thick dark rectangular glasses, a camel-brown wool coat instead of a dark one, a slate-grey scarf. Not resembling any famous film or book character.",
  "investigator-5": "A teenage boy of about fifteen, clearly a high schooler, tall with a calm, thoughtful face: dark brown skin and close-cropped hair, a grey wool cap, a rust-orange scarf.",
  "investigator-6": "A girl of about thirteen, a middle schooler: olive skin and wavy brown hair under a soft knitted hat, a plum-purple scarf.",
};
const GEAR = {
  lantern: "A small brass hand lantern with glass panes and a warm glowing candle inside.",
  quill: "A long feather quill pen beside a small round glass inkwell.",
  magnifier: "A brass magnifying glass with a wooden handle, the lens catching the light.",
  compass: "An open brass pocket compass with a hinged lid and a fine needle over a plain dial marked only with a small star, no letters or numbers on it.",
  ledger: "A thick leather-bound casebook tied with a cord, a ribbon bookmark hanging out.",
  key: "An ornate old brass key with a looped bow.",
};
const only = process.argv.slice(2);
const out = (dir, id, ext) => path.join(root, "public", "investigator", dir, `${id}.${ext}`);
async function make(dir, id, prompt, transparent) {
  const file = out(dir, id, transparent ? "png" : "webp");
  if (!only.length && fs.existsSync(file)) { console.log("kept", id); return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const r = await client.images.generate(transparent ? { model: "gpt-image-1.5", prompt, size: "1024x1024", quality: "medium", background: "transparent" } : { model: "gpt-image-2", prompt, size: "1024x1024", quality: "medium" });
  const buf = Buffer.from(r.data[0].b64_json, "base64");
  const img = sharp(buf).resize(transparent ? 384 : 640, transparent ? 384 : 640);
  fs.writeFileSync(file, await (transparent ? img.png() : img.webp({ quality: 86 })).toBuffer());
  console.log("made", dir, id);
}
const jobs = [...Object.entries(AVATARS).map(([id, d]) => ["avatars", id, `${PORTRAIT} ${d}`, false]), ...Object.entries(GEAR).map(([id, d]) => ["gear", id, `${OBJECT} ${d}`, true])].filter(([, id]) => !only.length || only.includes(id));
for (let i = 0; i < jobs.length; i += 4) await Promise.all(jobs.slice(i, i + 4).map((j) => make(...j).catch((e) => console.log("FAILED", j[1], e.status ?? "", e.message?.slice(0, 120)))));
