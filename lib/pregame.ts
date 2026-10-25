// The path from "Try a case now" to the first line of the passage, one tap per screen: the role story with the mode
// cards ("How do you want to play?"), then the mission pick (stories with missions), then the passage. Story Mode opens
// round 1 with the passage on screen; a scene without Story Mode opens its first clue, whose passage is the main panel.
// The mission map shows between scenes, never before the first one. Shared by the case screen and the tap-count test.
import type { WorldPack } from "./world-schema";

export type PreGameScreen = "role-and-mode" | "mission" | "passage";
export type PreGameState = { roleIntroSeen?: boolean; mission?: string };
export function preGameScreen(world: Pick<WorldPack, "missions">, s: PreGameState): PreGameScreen {
  if (!s.roleIntroSeen) return "role-and-mode";
  if (world.missions?.length && !s.mission) return "mission";
  return "passage";
}
// The clue a scene without Story Mode opens with: its first clue that isn't locked behind another.
export const firstClue = (scene: WorldPack["scenes"][number]) => scene.artifacts.find((a) => !a.unlock_condition) ?? null;
// Taps from "Try a case now" to the passage for a new visitor: that tap, then one per pre-game screen.
export function tapsToPassage(world: Pick<WorldPack, "missions">): number {
  let s: PreGameState = {}, taps = 1;
  for (let screen = preGameScreen(world, s); screen !== "passage" && taps < 10; screen = preGameScreen(world, s)) {
    taps++;
    s = screen === "role-and-mode" ? { ...s, roleIntroSeen: true } : { ...s, mission: world.missions![0].id };
  }
  return taps;
}
