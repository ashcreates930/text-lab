// One channel for every spoken sound in the scene game: scene narration and character voices. Starting any sound
// stops the one before it, so two voices can never talk over each other. The browser side (app/sound-player.ts)
// supplies the actual audio; this file holds only the rules, so they can be tested without a browser.
export type ChannelKind = "narration" | "voice";
// kind/id say what is playing (a scene id for narration, a character id for a voice); part is the paragraph being read.
export type ChannelState = { kind: ChannelKind | null; id: string; part: number };
export type ChannelHandle = { readonly active: boolean; part(n: number): void; end(): void };
export const idleChannel: ChannelState = { kind: null, id: "", part: -1 };

export function createSoundChannel() {
  let state: ChannelState = idleChannel, current: { token: number; stop: () => void } | null = null, token = 0;
  const listeners = new Set<(s: ChannelState) => void>();
  const set = (s: ChannelState) => { state = s; listeners.forEach((l) => l(s)); };
  function stop() {
    const playing = current;
    current = null;
    if (playing) { playing.stop(); set(idleChannel); }
  }
  // Starts a sound, stopping whatever was playing. `halt` must silence it at once. The handle reports progress and
  // the natural end; once another sound starts (or stop() is called) the handle goes inactive and its reports are ignored.
  function begin(kind: ChannelKind, id: string, halt: () => void): ChannelHandle {
    stop();
    const mine = ++token;
    current = { token: mine, stop: halt };
    set({ kind, id, part: -1 });
    const live = () => current?.token === mine;
    return {
      get active() { return live(); },
      part(n) { if (live()) set({ ...state, part: n }); },
      end() { if (live()) { current = null; set(idleChannel); } },
    };
  }
  return {
    get state() { return state; },
    subscribe(fn: (s: ChannelState) => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    begin,
    stop,
  };
}
export type SoundChannel = ReturnType<typeof createSoundChannel>;
