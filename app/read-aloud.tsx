"use client";
// Read to me and Plain words (lib/engagement.ts), on every passage a student reads.
// Read to me: reads the passage aloud one sentence at a time and lights the sentence being read. Until the narrator
// recordings are approved and made (plain standard English, no accent), it uses the browser's own voice.
// Plain words: a modern-language version of each paragraph, for understanding only; answers are still proved with
// the story's own line.
import {useEffect,useRef,useState} from "react";
import {BookOpenText,Square,Volume2} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";

export const canSpeak=()=>typeof window!=="undefined"&&"speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined";
// A plain standard-English voice from the browser: an en-US or en-GB voice, never a novelty one.
function plainVoice(){const vs=window.speechSynthesis.getVoices();return vs.find(v=>/^en-US/i.test(v.lang)&&/natural|google|samantha|aria|jenny|guy/i.test(v.name))??vs.find(v=>/^en-US/i.test(v.lang))??vs.find(v=>/^en/i.test(v.lang))??null}

// Reads the lines in order; onLine(k) as each starts (k: the line's index in the passage), onLine(null) when done.
// skip: line indexes never read aloud (content-noted paragraphs: no audio may draw on them).
export function useReadAloud(lines:string[],onLine:(k:number|null)=>void,skip:Set<number>=new Set()){
 const [on,setOn]=useState(false),stopped=useRef(false);
 useEffect(()=>()=>{stopped.current=true;if(canSpeak())window.speechSynthesis.cancel()},[]);
 function stop(){stopped.current=true;if(canSpeak())window.speechSynthesis.cancel();setOn(false);onLine(null)}
 function start(){
  if(!canSpeak())return;stopped.current=false;window.speechSynthesis.cancel();setOn(true);
  const say=(k:number)=>{
   if(stopped.current)return;while(k<lines.length&&skip.has(k))k++;if(k>=lines.length){setOn(false);onLine(null);return}
   const u=new SpeechSynthesisUtterance(lines[k].replace(/\s+/g," "));const v=plainVoice();if(v)u.voice=v;u.lang=v?.lang??"en-US";u.rate=0.92;u.pitch=1;
   u.onstart=()=>onLine(k);u.onend=()=>say(k+1);u.onerror=()=>{if(!stopped.current){setOn(false);onLine(null)}};
   window.speechSynthesis.speak(u);
  };
  say(0);
 }
 return {on,start,stop};
}

export function PassageTools({lines,world,onSpeaking,plainOpen,onPlain}:{lines:{pid:string;text:string}[];world:WorldPack;onSpeaking:(k:number|null)=>void;plainOpen:boolean;onPlain:()=>void}){
 // Content-noted paragraphs are never read aloud (the rule for all audio); the student reads them with the class.
 const noted=new Set(world.storybook?.ai_exclude??[]),skip=new Set(lines.flatMap((l,i)=>noted.has(l.pid)?[i]:[]));
 const read=useReadAloud(lines.map(l=>l.text),onSpeaking,skip);
 const [speechOk,setSpeechOk]=useState(false);useEffect(()=>setSpeechOk(canSpeak()),[]);
 const hasPlain=[...new Set(lines.map(l=>l.pid))].some(p=>world.engagement?.plain_words?.[p]);
 return <div className="flex flex-wrap items-center gap-2">
  {speechOk&&skip.size>0&&<p className="w-full text-[13px] font-bold text-reading-muted">Read to me skips the part with the content note.</p>}
  {speechOk&&<button type="button" onClick={read.on?read.stop:read.start} aria-pressed={read.on} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-deep px-3 text-[14px] font-bold">{read.on?<><Square size={14} aria-hidden/>Stop reading</>:<><Volume2 size={16} aria-hidden/>Read to me</>}</button>}
  {hasPlain&&<button type="button" onClick={onPlain} aria-pressed={plainOpen} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-deep px-3 text-[14px] font-bold"><BookOpenText size={16} aria-hidden/>{plainOpen?"Hide plain words":"Plain words"}</button>}
 </div>;
}

// The plain-language version of the paragraphs in this passage.
export function PlainWords({lines,world}:{lines:{pid:string}[];world:WorldPack}){
 const pids=[...new Set(lines.map(l=>l.pid))].filter(p=>world.engagement?.plain_words?.[p]);
 if(!pids.length)return null;
 return <div role="region" aria-label="Plain words" className="mt-3 rounded-row border-2 border-dashed border-edge bg-panel-2 p-3 text-ink">
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Plain words · to help you understand</p>
  {pids.map(p=><p key={p} className="mt-1.5 text-[16px] leading-relaxed"><span className="mr-1 text-[12px] font-extrabold text-muted">¶{Number(p.slice(1))}</span>{world.engagement!.plain_words[p]}</p>)}
  <p className="mt-2 text-[13px] font-bold text-muted">Prove your answers with the story's own words above, not these.</p>
 </div>;
}
