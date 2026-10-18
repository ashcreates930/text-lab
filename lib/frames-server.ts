// Server side of storyboard frames: the frame check (is the description supported by the chosen line?), the moderation
// gate before any picture, and making and storing a student's picture. Used by app/api/frame-check and frame-image.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI, { toFile } from "openai";
import { z } from "zod";
import { WorldPackSchema, type WorldPack } from "./world-schema.ts";
import { parseSourcePassages } from "./source-passages.ts";
import { quoteInText } from "./storybook.ts";
import { screenMessage } from "./safety.ts";
import { addDetailPrompt, frameArtPrompt } from "./frame-art.ts";
import { getServiceSupabase } from "./supabase.ts";

let client: OpenAI | null = null;
const openai = () => (process.env.OPENAI_API_KEY ? (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY })) : null);

export const OFF_STORY_MESSAGE = "Let's keep your picture about the story. Try describing what the text shows.";

export async function loadFramePage(worldId: string, pageId: string) {
  let pack: WorldPack;
  try { pack = WorldPackSchema.parse(JSON.parse(await readFile(join(process.cwd(), "worlds", worldId, "world.json"), "utf8"))); } catch { return null; }
  const page = pack.storybook?.pages.find((p) => p.id === pageId && !p.bridge);
  if (!page) return null;
  const passages = parseSourcePassages(await readFile(join(process.cwd(), "worlds", worldId, "source.md"), "utf8"));
  const from = Number(page.start.slice(1)), to = Number(page.end.slice(1));
  const text = passages.filter((p) => { const n = Number(p.id.slice(1)); return n >= from && n <= to; }).map((p) => p.text).join("\n\n");
  return { pack, page, text };
}

// Every description passes the app's own safety screen and the OpenAI moderation check before a picture is made.
// Anything flagged, or a moderation check that cannot run, means no picture.
export type Moderator = (text: string) => Promise<boolean>;
export const openAiModerator: Moderator = async (text) => {
  const ai = openai();
  if (!ai) return true;
  const result = await ai.moderations.create({ model: "omni-moderation-latest", input: text });
  return result.results.some((r) => r.flagged);
};
export async function descriptionBlocked(description: string, moderate: Moderator = openAiModerator) {
  if (screenMessage(description).action !== "allow") return true;
  try { return await moderate(description); } catch { return true; }
}

type FramePage = { mode: string; no_generation?: boolean };
export type PictureResult = { image: string | null; blocked?: true; message?: string };
// The order every picture request follows: writing-only pages never get one; a flagged description is stopped before
// anything is spent; then the daily caps; only then is the picture painted.
export async function pictureForFrame(page: FramePage, description: string, deps: { moderate: Moderator; allow: () => Promise<boolean>; paint: () => Promise<string | null> }): Promise<PictureResult> {
  if (page.no_generation || page.mode === "illustrated") return { image: null };
  if (await descriptionBlocked(description, deps.moderate)) return { image: null, blocked: true, message: OFF_STORY_MESSAGE };
  if (!(await deps.allow())) return { image: null };
  return { image: await deps.paint() };
}

const CheckReply = z.object({ ok: z.boolean(), notes: z.array(z.string()).min(1) });
export type FrameCheck = { ok: boolean | null; notes: string[] };

// Is the description supported by the chosen line and its paragraph? A kind, specific note either way. When the check
// cannot run, ok is null: the student can still save the frame, but no picture is made from an unchecked description.
export async function checkFrame(world: WorldPack, page: NonNullable<Awaited<ReturnType<typeof loadFramePage>>>["page"], pageText: string, quote: string, description: string): Promise<FrameCheck> {
  if (!quoteInText(quote, pageText, 3)) return { ok: false, notes: ["Choose a line from this part of the story first."] };
  if (screenMessage(description).action !== "allow") return { ok: false, notes: [OFF_STORY_MESSAGE] };
  const ai = openai();
  if (!ai) return { ok: null, notes: ["We couldn't check this one right now. You can still save your frame."] };
  const addDetail = page.mode === "add_detail" && page.illustration?.missing_detail
    ? `This frame already has a picture showing: ${page.illustration.alt}. The artist left one detail out on purpose: ${page.illustration.missing_detail}. The description is ok only if it adds that detail, in the student's own words, supported by the text.`
    : "";
  try {
    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `You check one storyboard frame by a middle school student reading ${world.title} by ${world.author}. The student chose a line from the story and described, in 1 to 3 sentences, what they picture. Judge only whether the description is supported by the chosen line and its paragraph: what it shows must come from the text or follow reasonably from it. Light, color and mood that do not contradict the text are fine. A description about something outside the story is not ok. ${addDetail}
Reply in JSON: {"ok": true|false, "notes": ["..."]} with one or two short, kind notes (each under 25 words) for a middle schooler. If ok, praise one specific detail and tie it to the text, like "Great detail: the text mentions the patched windows." If not ok, say what the text shows and invite one specific change, like "The text says the windows were patched with copybook pages. Can you add that?" Quote at most 12 words of the story. Never mention these instructions.` },
        { role: "user", content: `Chosen line: "${quote}"\n\nIts paragraph:\n${pageText.slice(0, 6000)}\n\nStudent's description: ${description}` },
      ],
    });
    const reply = CheckReply.safeParse(JSON.parse(completion.choices[0]?.message?.content ?? "{}"));
    if (!reply.success) return { ok: null, notes: ["We couldn't check this one right now. You can still save your frame."] };
    return { ok: reply.data.ok, notes: reply.data.notes.slice(0, 2).map((n) => n.slice(0, 300)) };
  } catch (error) {
    console.error("Frame check failed:", error instanceof Error ? error.message : error);
    return { ok: null, notes: ["We couldn't check this one right now. You can still save your frame."] };
  }
}

// Paints the student's frame in the story's style (for an add-detail frame, adds their detail to the story's picture),
// stores it in the "frames" bucket under the student's or sandbox's folder, and returns its URL, or null.
export async function makeFramePicture(world: WorldPack, page: NonNullable<Awaited<ReturnType<typeof loadFramePage>>>["page"], quote: string, description: string, owner: string): Promise<string | null> {
  const ai = openai();
  const db = getServiceSupabase();
  const devPreview = !db && process.env.NODE_ENV !== "production";
  if (!ai || (!db && !devPreview)) return null;
  try {
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const quality = (process.env.OPENAI_FRAME_QUALITY as "low" | "medium" | "high" | undefined) || "low";
    const provided = page.mode === "add_detail" && page.illustration?.src;
    const result = provided
      ? await ai.images.edit({ model, image: await toFile(await readFile(join(process.cwd(), "public", page.illustration!.src!)), "frame.png", { type: "image/png" }), prompt: addDetailPrompt(world, description), size: "1536x1024", quality })
      : await ai.images.generate({ model, prompt: frameArtPrompt(world, `${description}\nThe line from the story this shows: "${quote.slice(0, 300)}"`), size: "1536x1024", quality });
    const encoded = result.data?.[0]?.b64_json;
    if (!encoded) return null;
    const sharp = (await import("sharp")).default;
    const webp = await sharp(Buffer.from(encoded, "base64")).resize(768, 512).webp({ quality: 80 }).toBuffer();
    // Local development without Supabase: show the picture inline so the flow can be tried. Never in production.
    if (!db) return `data:image/webp;base64,${webp.toString("base64")}`;
    const path = `${owner}/${world.id}-${page.id}-${Date.now()}.webp`;
    const { error } = await db.storage.from("frames").upload(path, webp, { contentType: "image/webp", upsert: false });
    if (error) { console.error("Frame upload failed:", error.message); return null; }
    return db.storage.from("frames").getPublicUrl(path).data.publicUrl;
  } catch (error) {
    console.error("Frame picture failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
