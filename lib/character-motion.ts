// 3D witnesses (app/character-stage.tsx): when to show the 3D model or the portrait, and the idle clip made in code.
// Pure data, so it is tested without a browser or three.js.

// The 3D model shows only when WebGL works, the device has the memory, and the model loads within 4 seconds.
export const MODEL_TIMEOUT_MS = 4000, MIN_DEVICE_MEMORY_GB = 4;
export type StageChoice = "3d" | "portrait";
export function chooseStage(env: { webgl: boolean; deviceMemory?: number | null; saveData?: boolean }): StageChoice {
  if (!env.webgl) return "portrait";
  if (env.deviceMemory != null && env.deviceMemory < MIN_DEVICE_MEMORY_GB) return "portrait";
  if (env.saveData) return "portrait";
  return "3d";
}
export const FINGER_BONE = /Hand(Index|Middle|Ring|Pinky|Thumb)\d/;

// The idle clip: slow breathing, small weight shifts and an occasional head turn, looping, no finger movement. Each
// track is a list of small rotations (radians about x, y, z) added to the bone's rest pose, keyed in seconds.
export type IdleTrack = { bone: "Hips" | "Spine" | "Spine1" | "Spine2" | "Neck" | "Head"; times: number[]; euler: [number, number, number][] };
export const IDLE_SECONDS = 12;
export function idleTracks(reduced = false): IdleTrack[] {
  const n = 49, times = Array.from({ length: n }, (_, k) => (k * IDLE_SECONDS) / (n - 1));
  const s = (period: number, phase = 0) => (t: number) => Math.sin(((2 * Math.PI) / period) * t + phase);
  // Reduced motion: breathing only, at half the depth.
  const amp = reduced ? 0.5 : 1;
  const breathe = s(4), sway = s(IDLE_SECONDS), look = (t: number) => (reduced ? 0 : t > 6.5 && t < 9.5 ? Math.sin(((t - 6.5) / 3) * Math.PI) : 0);
  const track = (bone: IdleTrack["bone"], f: (t: number) => [number, number, number]): IdleTrack => ({ bone, times, euler: times.map(f) });
  return [
    track("Spine", (t) => [0.012 * amp * breathe(t), 0, reduced ? 0 : 0.01 * sway(t)]),
    track("Spine2", (t) => [0.018 * amp * breathe(t), 0, 0]),
    track("Hips", (t) => [0, reduced ? 0 : 0.03 * sway(t), reduced ? 0 : 0.025 * sway(t)]),
    track("Neck", (t) => [-0.008 * amp * breathe(t), 0.12 * look(t), 0]),
    track("Head", (t) => [0, 0.18 * look(t), -0.03 * look(t)]),
  ];
}
// A voice level (0 to 1) as a gentle glow strength; flat under reduced motion.
export const glowFor = (level: number, reduced: boolean) => (reduced ? 0.35 : 0.25 + 0.75 * Math.max(0, Math.min(1, level)));
