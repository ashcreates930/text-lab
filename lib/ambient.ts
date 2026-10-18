// The scene's ambient sound plays only while the scene screen itself is showing. Opening a clue, the case board or a
// storyboard frame, a choice's consequence, leaving the case, or switching to another browser tab fades it out over half
// a second and stops it completely; coming back fades it in again (when Sound is on). Narration dips it to a third.
// There is only ever one ambient track: returning during the fade-out picks the same track back up, and a new scene's
// track starts only after the old one has stopped. Rules only; the browser engine is in app/game-feel.tsx.
export const AMBIENT_VOLUME = 0.12;
export const AMBIENT_FADE_OUT = 0.5, AMBIENT_FADE_IN = 2.5, AMBIENT_RETURN = 1, AMBIENT_DIP = 0.4, AMBIENT_UNDIP = 1.2;

// What the scene screen knows about itself. The screen is "showing" only when nothing covers or replaces it.
export type SceneScreen = { inCase: boolean; clueOpen: boolean; frameOpen: boolean; boardOpen: boolean; consequence: boolean };
export const sceneScreenShowing = (s: SceneScreen) => s.inCase && !s.clueOpen && !s.frameOpen && !s.boardOpen && !s.consequence;

export type AmbientInputs = { src: string | null; showing: boolean; on: boolean; visible: boolean; narrating: boolean; unlocked: boolean };
export const ambientIdle: AmbientInputs = { src: null, showing: false, on: false, visible: true, narrating: false, unlocked: false };

// The ambient track that should be audible now, and how loud, or null for silence.
export function ambientWanted(i: AmbientInputs): { src: string; volume: number } | null {
  if (!i.src || !i.showing || !i.on || !i.visible || !i.unlocked) return null;
  return { src: i.src, volume: i.narrating ? AMBIENT_VOLUME / 3 : AMBIENT_VOLUME };
}

// A playing track, as the engine gives it: it starts silent, fades to a volume, and stops for good.
export type AmbientTrack = { readonly src: string; fade(volume: number, seconds: number): void; stop(): void };
export type AmbientEngine = { start(src: string): AmbientTrack };
type Timers = { after(ms: number, fn: () => void): unknown; cancel(handle: unknown): void };
const realTimers: Timers = { after: (ms, fn) => setTimeout(fn, ms), cancel: (h) => clearTimeout(h as ReturnType<typeof setTimeout>) };

export function createAmbientController(engine: AmbientEngine, timers: Timers = realTimers) {
  let inputs: AmbientInputs = ambientIdle;
  let track: AmbientTrack | null = null, volume = 0, stopping: unknown = null;
  function apply() {
    const want = ambientWanted(inputs);
    // Silence, or another scene's track: fade this one out and stop it. A new track waits until it has stopped.
    if (track && (!want || want.src !== track.src)) {
      if (stopping === null) {
        const leaving = track;
        leaving.fade(0, AMBIENT_FADE_OUT);
        volume = 0;
        stopping = timers.after(AMBIENT_FADE_OUT * 1000, () => {
          stopping = null;
          leaving.stop();
          if (track === leaving) track = null;
          apply();
        });
      }
      return;
    }
    if (!want) return;
    if (track) {
      // Back before the fade-out finished: keep the same track and bring it back up.
      const returning = stopping !== null;
      if (returning) { timers.cancel(stopping); stopping = null; }
      if (want.volume !== volume || returning) {
        track.fade(want.volume, returning ? AMBIENT_RETURN : want.volume < volume ? AMBIENT_DIP : AMBIENT_UNDIP);
        volume = want.volume;
      }
      return;
    }
    track = engine.start(want.src);
    track.fade(want.volume, AMBIENT_FADE_IN);
    volume = want.volume;
  }
  return {
    set(patch: Partial<AmbientInputs>) { inputs = { ...inputs, ...patch }; apply(); },
    get inputs() { return inputs; },
    get track() { return track; },
  };
}
export type AmbientController = ReturnType<typeof createAmbientController>;
