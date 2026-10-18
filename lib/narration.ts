// Scene narration: "Listen to the scene" reads exactly what "Read this part of the story" shows, one recorded file per
// paragraph, in order, including any content note, read just before its paragraph. A part whose file is missing or
// fails is read by the browser's own speech instead, so a student never meets an error.
import type { SourcePassage } from "./source-passages.ts";
import { contentNotes, withContentNotes, type ReadingItem } from "./content-notes.ts";
import type { ChannelState, SoundChannel } from "./sound-channel.ts";

// The paragraphs of the story shown for a scene. The reading panel and the narration both use this, so they always match.
export function sceneReading(passages: SourcePassage[], scene: { passage_anchors: string[] }) {
  return passages.filter((p) => scene.passage_anchors.includes(p.id));
}
// What the reading panel shows, in order: the scene's paragraphs with any content note directly before its paragraph.
type ReadingWorld = Parameters<typeof contentNotes>[0] & { id: string };
export function sceneReadingItems(world: ReadingWorld, scene: { passage_anchors: string[] }, passages: SourcePassage[]): ReadingItem[] {
  return withContentNotes(sceneReading(passages, scene), contentNotes(world));
}
// One file per part: <paragraph>.mp3, and note-<paragraph>.mp3 for a content note.
export const narrationFile = (worldId: string, sceneId: string, partId: string) => `/worlds/${worldId}/narration/${sceneId}/${partId}.mp3`;
export type NarrationPart = { id: string; text: string; src: string };
export function narrationParts(world: ReadingWorld, scene: { id: string; passage_anchors: string[] }, passages: SourcePassage[]): NarrationPart[] {
  return sceneReadingItems(world, scene, passages).map((item) => ({ id: item.id, text: item.text, src: narrationFile(world.id, scene.id, item.id) }));
}

// The Listen button: "Stop reading" only while this scene's narration is playing.
export function listenButton(state: ChannelState, sceneId: string) {
  const playing = state.kind === "narration" && state.id === sceneId;
  return { playing, label: playing ? "Stop reading" : "Listen to the scene", part: playing ? state.part : -1 };
}

// How a paragraph is actually played. clip resolves true when the file played to the end (or was stopped), false
// when it could not be played. Both must stop at once when the signal aborts.
export type NarrationIO = {
  clip(src: string, signal: AbortSignal): Promise<boolean>;
  speak(text: string, signal: AbortSignal): Promise<void>;
};
export async function playNarration(channel: SoundChannel, sceneId: string, parts: NarrationPart[], io: NarrationIO) {
  const stopper = new AbortController();
  const handle = channel.begin("narration", sceneId, () => stopper.abort());
  for (let i = 0; i < parts.length && handle.active; i++) {
    handle.part(i);
    const played = await io.clip(parts[i].src, stopper.signal).catch(() => false);
    if (!handle.active) break;
    if (!played) await io.speak(parts[i].text, stopper.signal).catch(() => {});
  }
  handle.end();
}
