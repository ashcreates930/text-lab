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
