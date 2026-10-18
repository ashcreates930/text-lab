// The storyboard in the scene game: as students solve scenes they build an illustrated version of the story. Each scene
// shows a few of the story's storybook pages as frames: the story paints the first, and students complete the rest by
// choosing a line, describing what they see, and (optionally) turning it into a picture. Rules only; UI in app/storyboard.tsx.
import type { WorldPack } from "./world-schema.ts";
import { readingPortions, type SourcePassage } from "./source-passages.ts";
import { frameKey } from "./storybook.ts";

type Page = NonNullable<WorldPack["storybook"]>["pages"][number];
export type FrameKind = "provided" | "add_detail" | "student";
export type SceneFrame = { page: Page; kind: FrameKind; required: boolean; key: string; picture?: string; writingOnly: boolean };
export type SavedFrame = { kind: "add_detail" | "student"; description: string; quote: string; saved_at: string; image?: string; check?: { ok: boolean; notes: string[] } };
export const MAX_FRAMES_PER_SCENE = 3;

// Which scene a page belongs to: the scene whose reading contains the page's first paragraph. Scenes with their own
// reading ranges use them; a story without them (The Tell-Tale Heart) is split into equal portions in story order.
export function pagesByScene(world: WorldPack, passages: SourcePassage[]): Page[][] {
  const pages = (world.storybook?.pages ?? []).filter((p) => !p.bridge);
  if (!passages.length) return world.scenes.map(() => []);
  const portions = readingPortions(passages, world.scenes);
  return world.scenes.map((_, i) => {
    const ids = new Set((portions[i] ?? []).map((p) => p.id));
    return pages.filter((p) => ids.has(p.start));
  });
}

const isProvided = (p: Page) => p.mode === "illustrated" && !!p.illustration;

// The frames a scene shows, in story order, at most three: the story's own first picture, the scene's required frame
// (at most one), then the earliest frames for the student to complete. Keeping a slot for the required frame means
// every scene that has one asks for exactly one, even when the story provides several pictures there.
export function sceneFrames(world: WorldPack, passages: SourcePassage[], sceneIndex: number): SceneFrame[] {
  const pages = pagesByScene(world, passages)[sceneIndex] ?? [];
  const usable = pages.filter((p) => isProvided(p) || p.mode !== "illustrated");
  const chosen: Page[] = [];
  const add = (p?: Page) => { if (p && !chosen.includes(p) && chosen.length < MAX_FRAMES_PER_SCENE) chosen.push(p); };
  add(usable.find(isProvided));
  const required = usable.find((p) => p.mode !== "illustrated" && p.frame_required);
  add(required);
  for (const p of usable) if (p.mode !== "illustrated") add(p);
  for (const p of usable) add(p);
  const order = new Map(pages.map((p, i) => [p.id, i]));
  return chosen.sort((a, b) => order.get(a.id)! - order.get(b.id)!).map((page) => ({
    page,
    kind: isProvided(page) ? "provided" : page.mode === "add_detail" ? "add_detail" : "student",
    required: page === required,
    key: frameKey(world.id, page.id),
    picture: page.illustration?.status === "generated" ? page.illustration.src : undefined,
    writingOnly: !!page.no_generation,
  }));
}

export const frameSaved = (frames: Record<string, SavedFrame> | undefined, key: string) => !!frames?.[key]?.description?.trim();
export const requiredFrame = (frames: SceneFrame[]) => frames.find((f) => f.required);

// A scene is solved when every clue is proven and its required frame (if it has one) is saved, with or without a picture.
export function sceneSolved(cluesProven: boolean, frames: SceneFrame[], saved: Record<string, SavedFrame> | undefined) {
  const need = requiredFrame(frames);
  return cluesProven && (!need || frameSaved(saved, need.key));
}

export function missionText(clues: number, frames: SceneFrame[]) {
  return requiredFrame(frames) ? `Prove all ${clues} clues and complete 1 frame.` : `Prove all ${clues} clues to solve this scene.`;
}

// A frame the student saves. The picture is optional: a frame saved without one still counts.
export function makeSavedFrame(kind: "add_detail" | "student", quote: string, description: string, check?: { ok: boolean; notes: string[] }, image?: string): SavedFrame {
  return { kind, quote: quote.trim().slice(0, 400), description: description.trim().slice(0, 600), saved_at: new Date().toISOString(), ...(image ? { image } : {}), ...(check ? { check } : {}) };
}

// The whole storyboard so far, in story order: the story's own frames from scenes the student has reached, and every
// frame the student has saved. Used by the case board, the printout and the teacher's view.
export type BoardFrame = { key: string; pageId: string; sceneIndex: number; picture?: string; alt: string; quote?: string; description?: string; mine: boolean };
export function storyboardSoFar(world: WorldPack, passages: SourcePassage[], saved: Record<string, SavedFrame> | undefined, reachedScene: number): BoardFrame[] {
  return world.scenes.flatMap((_, sceneIndex) => sceneFrames(world, passages, sceneIndex).flatMap((f): BoardFrame[] => {
    const mine = saved?.[f.key];
    if (mine && frameSaved(saved, f.key)) return [{ key: f.key, pageId: f.page.id, sceneIndex, picture: mine.image ?? (f.kind === "add_detail" ? f.picture : undefined), alt: f.page.illustration?.alt ?? "", quote: mine.quote, description: mine.description, mine: true }];
    if (f.kind === "provided" && sceneIndex <= reachedScene && f.picture) return [{ key: f.key, pageId: f.page.id, sceneIndex, picture: f.picture, alt: f.page.illustration?.alt ?? "", mine: false }];
    return [];
  }));
}
