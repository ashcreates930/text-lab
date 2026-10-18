// Character voices on the clue screen, on the shared sound channel (lib/sound-channel.ts). The speaker button on a reply
// is a Play/Stop toggle: Stop while that character's reply is playing, Play otherwise. Starting any sound stops the one
// before it, so a voice can never play twice or over narration. Rules only; UI in app/case.tsx and app/game-feel.tsx.
import type { ChannelState, SoundChannel } from "./sound-channel.ts";

export function voiceButton(state: ChannelState, characterId: string, name: string) {
  const playing = state.kind === "voice" && state.id === characterId;
  return { playing, label: playing ? "Stop" : "Play", aria: playing ? "Stop voice" : `Hear ${name} say it again` };
}

// Tapping the button: stop the reply if it is playing (never a second copy), otherwise play it.
export function toggleVoice(channel: SoundChannel, characterId: string, play: () => void): "stopped" | "playing" {
  if (voiceButton(channel.state, characterId, "").playing) { channel.stop(); return "stopped"; }
  play();
  return "playing";
}

// The moments on the clue screen that silence a character's voice. Story narration stops it on its own, because
// starting narration takes the shared channel.
export type VoiceStop = "leave" | "new-question" | "switch-character";
export function stopVoice(channel: SoundChannel, _why: VoiceStop) {
  if (channel.state.kind === "voice") channel.stop();
}

// One character can have two things to say on the clue screen (a Spot the Lie testimony and a follow-up reply), so a
// button is "playing" only when its own words are playing: the key is the character and the text.
export const voiceKey = (characterId: string, text: string) => `${characterId}\n${text}`;
export function voiceButtonFor(playingKey: string | null, characterId: string, text: string, name: string, what: "reply" | "testimony" = "reply") {
  const playing = playingKey === voiceKey(characterId, text);
  return { playing, label: playing ? "Stop" : "Play", aria: playing ? "Stop voice" : what === "testimony" ? `Hear ${name}'s testimony again` : `Hear ${name} say it again` };
}
// Tapping a button: stop its words if they are playing (never a second copy); otherwise play them, which stops anything
// else on the shared channel first.
export function toggleVoiceKey(channel: SoundChannel, playingKey: string | null, characterId: string, text: string, play: () => void): "stopped" | "playing" {
  if (channel.state.kind === "voice" && playingKey === voiceKey(characterId, text)) { channel.stop(); return "stopped"; }
  play();
  return "playing";
}
