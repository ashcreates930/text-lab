// Shared, testable rules for the game layer: portrait fallbacks, voice and ambient sound defaults, the case board, and
// the choices a student made. The UI lives in app/game-feel.tsx.
import type { WorldPack } from "./world-schema.ts";

// Initials for a character without a portrait: first letter of the first and last words ("Hans Van Ripper" -> "HR").
export function initials(name: string) {
  const words = name.replace(/[^\p{L}\s'-]/gu, " ").split(/\s+/).filter((w) => w && !/^(the|a|an)$/i.test(w));
  if (!words.length) return "?";
  const first = words[0][0], last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
export function portraitFor(character: { name: string; portrait?: string }) {
  return character.portrait ? { kind: "image" as const, src: character.portrait } : { kind: "initials" as const, text: initials(character.name) };
}

// Voices and ambient sound: on by default for the public demo, off for class sessions (30 laptops in one room), and the
// student's own choice is remembered on the device, separately for class and demo use.
export type SoundKind = "voices" | "ambient";
export const soundDefault = (preset: string) => preset !== "class_student";
export const soundKey = (kind: SoundKind, preset: string) => `textlab-${kind}-${preset === "class_student" ? "class" : "demo"}`;
export function soundOn(kind: SoundKind, preset: string, stored: string | null | undefined) {
  return stored === "on" ? true : stored === "off" ? false : soundDefault(preset);
}

type Answer = { notice?: string; interpret?: string; craft?: string; character?: string };
const proven = (a: Answer | undefined) => !!(a?.notice?.trim() && a?.interpret?.trim());

// One pinned card per proven clue, in scene order. The close-up uses the clue's spot in its scene image.
export type BoardCard = { clueId: string; name: string; sceneId: string; sceneIndex: number; quote: string; explanation: string; factCheck: boolean; image: string; focus: { x: number; y: number }; character?: string };
export function caseBoardCards(world: WorldPack, answers: Record<string, Answer>): BoardCard[] {
  const names = new Map(world.characters.map((c) => [c.id, c.name]));
  return world.scenes.flatMap((s, sceneIndex) => s.artifacts.filter((a) => proven(answers[a.id])).map((a) => {
    const x = answers[a.id];
    return {
      clueId: a.id, name: a.name, sceneId: s.id, sceneIndex,
      quote: x.notice!.trim(), explanation: x.interpret!.trim(), factCheck: x.craft === "contradicts",
      image: s.background_image, focus: { x: a.position.x + a.position.width / 2, y: a.position.y + a.position.height / 2 },
      ...(x.character && names.get(x.character) ? { character: names.get(x.character) } : {}),
    };
  }));
}

// The choice a student made at each scene's choice point, as labels for the case summary.
export function choicesMade(world: WorldPack, choices: Record<string, string> | undefined) {
  return world.scenes.flatMap((s) => {
    const option = s.choice_point?.options.find((o) => o.id === choices?.[s.id]);
    return option ? [{ sceneId: s.id, label: option.label }] : [];
  });
}

// Ambient tracks vary a lot in level, and a plain looping <audio> leaves a gap and a jump at the seam. The player
// evens them out: one gain brings each track's typical level to the same target, and the last moments of the track
// are blended into its start so the loop has no seam. Works on raw samples so it can be tested without a browser.
import { AMBIENT_VOLUME } from "./ambient.ts";
export { AMBIENT_VOLUME };
// The ambience dips to a third of its volume while the scene is read aloud.
export const ambientVolumeFor = (state: { kind: string | null }) => state.kind === "narration" ? AMBIENT_VOLUME / 3 : AMBIENT_VOLUME;
export function ambientLevelGain(channels: Float32Array[], sampleRate: number, targetDb = -20) {
  const win = Math.max(1, Math.round(sampleRate * 0.1)), levels: number[] = [];
  for (let i = 0; i + win <= channels[0].length; i += win) {
    let sum = 0;
    for (const ch of channels) for (let j = i; j < i + win; j++) sum += ch[j] * ch[j];
    const db = 10 * Math.log10(sum / (win * channels.length) || 1e-12);
    if (db > -90) levels.push(db);
  }
  if (!levels.length) return 1;
  levels.sort((a, b) => a - b);
  const typical = levels[Math.floor(levels.length * 0.6)];
  return 10 ** (Math.min(30, Math.max(-12, targetDb - typical)) / 20);
}
export function crossfadeLoop(channels: Float32Array[], sampleRate: number, seconds = 1.5) {
  const len = channels[0].length, fade = Math.min(Math.round(sampleRate * seconds), Math.floor(len / 4));
  return channels.map((ch) => {
    const out = new Float32Array(len - fade);
    out.set(ch.subarray(0, len - fade));
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      out[i] = ch[i] * Math.sin((t * Math.PI) / 2) + ch[len - fade + i] * Math.cos((t * Math.PI) / 2);
    }
    return out;
  });
}
