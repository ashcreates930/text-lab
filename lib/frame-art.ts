// Every storyboard picture, the story's own and the ones students create, starts with the same fixed style prefix and the
// story's art direction, so a student's frame sits beside the story's frames in one painted style. Used by
// scripts/generate-assets.ts (--frames) and app/api/frame-image.
export const FRAME_STYLE_PREFIX =
  "A painted storybook illustration for a school literature app, in warm gouache on cream paper with soft edges and visible brush texture, matching the story's scene art. " +
  "Paint only people, places and things from the story's own world and period. " +
  "School-appropriate: no text, letters, numbers, captions, signs or speech bubbles; no real or recognizable people; no gore, weapons in use or visible violence; no modern objects; no frames, borders or UI.";

type ArtWorld = { title: string; author: string; storybook?: { art_style?: string } | null };

// The story's description of a provided picture, without the note about the detail it leaves out on purpose.
export function providedSceneDescription(description: string) {
  return description.replace(/\s*LEFT OUT ON PURPOSE:[\s\S]*$/i, "").trim();
}

export function frameArtPrompt(world: ArtWorld, scene: string) {
  return `${FRAME_STYLE_PREFIX}\nStory: ${world.title} by ${world.author}.\nArt direction: ${world.storybook?.art_style ?? ""}\nPaint this moment: ${scene}`;
}

// For an add-detail frame: keep the provided picture and paint in the one detail the student describes.
export function addDetailPrompt(world: ArtWorld, detail: string) {
  return `${FRAME_STYLE_PREFIX}\nStory: ${world.title} by ${world.author}.\nKeep this picture exactly as it is, in the same style, and paint in one added detail from the story, small and natural in the scene: ${detail}`;
}
