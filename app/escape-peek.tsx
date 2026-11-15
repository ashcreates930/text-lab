"use client";
// The home page's escape moment, on a small phone in front of the poster: a student taps the proof line, the lock opens,
// and the door to the next room swings open. About five seconds, then it loops. Line icons only (the mature look). With
// reduced motion it holds one still frame (the lock open on its proof). Decorative: one description for screen readers.
import {useEffect,useState} from "react";
import {LockBadge} from "./lock-art";

const PHASE_MS=[1700,1500,2000];
export function EscapePeek({className=""}:{className?:string}){
 const [phase,setPhase]=useState(0),[still,setStill]=useState(false);
 useEffect(()=>{const mq=window.matchMedia("(prefers-reduced-motion: reduce)");const set=()=>{setStill(mq.matches);if(mq.matches)setPhase(1)};set();mq.addEventListener("change",set);return()=>mq.removeEventListener("change",set)},[]);
 useEffect(()=>{if(still)return;const t=setTimeout(()=>setPhase(p=>(p+1)%3),PHASE_MS[phase]);return()=>clearTimeout(t)},[phase,still]);
 const proved=phase>=1;
 return <figure aria-label="A student taps the line that proves the answer, the lock opens, and the door to the next room swings open." className={`escape-peek w-[176px] shrink-0 rounded-[22px] border-[5px] border-edge bg-deep p-2.5 shadow-[0_18px_40px_rgba(0,0,0,.5)] md:w-[196px] ${className}`}>
  <div aria-hidden className="flex h-[300px] flex-col md:h-[336px]">
   <p className="text-[9px] font-extrabold uppercase tracking-[.08em] text-highlight">Room 1 · Lock 2 of 10</p>
   <p className="mt-1 font-display text-[12px] font-semibold leading-tight text-ink">About how far is the glen from the village?</p>
   <div className="mt-2 rounded-row bg-reading p-2 font-serif text-[10.5px] leading-[1.4] text-reading-ink">
    <span className="opacity-70">…to linger about the village tavern on market days. </span>
    <span className={`relative rounded-[3px] px-0.5 transition-[box-shadow,background-color] duration-300 motion-reduce:transition-none ${proved?"bg-line-picked shadow-[0_0_0_2px_var(--color-success)]":"shadow-[0_0_0_0_transparent]"}`}>Not far from this village, perhaps about two miles, there is a little valley…
     {phase===0&&!still&&<span className="peek-tap absolute -right-1 -top-1 h-5 w-5 rounded-full border-2 border-highlight"/>}</span>
   </div>
   <div className="relative mt-auto grid h-[128px] place-items-center md:h-[150px]">
    {phase<2?<div className="flex flex-col items-center gap-1.5">
      <LockBadge state={proved?"proved":"closed"}/>
      <span className={`text-[10px] font-extrabold ${proved?"text-success":"text-muted"}`}>{proved?"Proved. The lock opens.":"Tap the line that proves it"}</span></div>
     :<div className="peek-door relative h-[112px] w-[78px] md:h-[130px] md:w-[88px]" style={{perspective:"420px"}}>
      <div className="absolute inset-0 grid place-items-center rounded-t-[6px] bg-gold pl-4 text-center font-display text-[13px] font-semibold leading-tight text-on-gold">Room 2</div>
      <div className="peek-leaf absolute inset-0 origin-left rounded-t-[6px] border-2 border-edge bg-panel"><span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold"/></div>
     </div>}
   </div>
  </div>
 </figure>;
}
