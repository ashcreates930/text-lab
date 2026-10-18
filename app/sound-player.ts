"use client";
// The single shared player for scene narration and character voices (rules in lib/sound-channel.ts).
import {useSyncExternalStore} from "react";
import {createSoundChannel,idleChannel} from "@/lib/sound-channel";
import type {NarrationIO} from "@/lib/narration";

export const soundChannel=createSoundChannel();
export function useSoundChannel(){
 return useSyncExternalStore(soundChannel.subscribe,()=>soundChannel.state,()=>idleChannel);
}

// Plays one audio file. Resolves true when it ends or is stopped, false when it cannot be played.
export function playClip(src:string,signal:AbortSignal){
 return new Promise<boolean>(resolve=>{
  if(signal.aborted)return resolve(true);
  const audio=new Audio(src);
  const finish=(ok:boolean)=>{signal.removeEventListener("abort",abort);audio.onended=audio.onerror=null;resolve(ok)};
  const abort=()=>{audio.pause();audio.removeAttribute("src");audio.load();finish(true)};
  audio.onended=()=>finish(true);audio.onerror=()=>finish(false);
  signal.addEventListener("abort",abort);
  audio.play().catch(()=>{if(!signal.aborted)finish(false)});
 });
}

// The browser's own speech, a sentence at a time (some browsers cut off one long utterance part way through).
export function speakText(text:string,signal:AbortSignal){
 return new Promise<void>(resolve=>{
  if(signal.aborted||typeof speechSynthesis==="undefined")return resolve();
  const sentences=text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)??[text];
  const abort=()=>{speechSynthesis.cancel();resolve()};
  signal.addEventListener("abort",abort,{once:true});
  speechSynthesis.cancel();
  sentences.forEach((s,i)=>{const u=new SpeechSynthesisUtterance(s.trim());u.rate=.92;if(i===sentences.length-1){u.onend=u.onerror=()=>{signal.removeEventListener("abort",abort);resolve()}}speechSynthesis.speak(u)});
 });
}
export const browserNarration:NarrationIO={clip:playClip,speak:speakText};
