"use client";
// One-minute "How a case works" video, shown once per device right after Try the Demo.
// The captions are part of the video, so it plays muted; the same steps are listed in text below it.
import {useEffect,useRef,useState} from "react";
import {ArrowRight,RotateCcw} from "lucide-react";

const KEY="textlab-tutorial-seen-v1";
export function tutorialSeen(){try{return localStorage.getItem(KEY)==="1"}catch{return false}}
const steps=["You're the detective. Every scene is a case to solve.","Your mission: prove every clue in the scene.","Tap a clue to open it.","Ask a character what happened.","Characters can be wrong. So you check the story.","Tap the line in the story that proves it.","Decide: does it back them up, or prove them wrong?","Explain what it shows, in your own words.","Every proven clue gets stamped and fills your meter.","Prove them all to solve the scene and move up the detective ranks."];

export function Tutorial({onDone}:{onDone:()=>void}){
 const ref=useRef<HTMLVideoElement>(null);const [ended,setEnded]=useState(false);
 function finish(){try{localStorage.setItem(KEY,"1")}catch{}onDone()}
 useEffect(()=>{ref.current?.play().catch(()=>{})},[]);
 function again(){setEnded(false);const v=ref.current;if(v){v.currentTime=0;v.play().catch(()=>{})}}
 return <section className="case-ui mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-8">
  <div className="flex flex-wrap items-end justify-between gap-4">
   <div><p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Before you start · 1 minute</p><h1 className="mt-1 text-[30px] font-bold leading-tight md:text-[36px]">How a case works</h1></div>
   <button onClick={finish} className="text-[15px] font-semibold text-[#6B6457] underline underline-offset-4 hover:text-[#2A2620]">Skip, start my case</button>
  </div>
  <div className="relative mt-5 overflow-hidden rounded-3xl bg-[#2A2620] shadow-[0_24px_60px_-20px_rgba(42,38,32,.45)]">
   <video ref={ref} poster="/tutorial/how-it-works-poster.jpg" muted playsInline controls preload="auto" onEnded={()=>setEnded(true)} aria-label="Video: how a case works in Text Lab" className="block aspect-video w-full"><source src="/tutorial/how-it-works.mp4" type="video/mp4"/><source src="/tutorial/how-it-works.webm" type="video/webm"/></video>
   {ended&&<div className="absolute inset-0 grid place-items-center bg-[#2A2620]/75 p-6 text-center">
    <div><p className="text-[26px] font-bold text-white md:text-[32px]">Your case is waiting.</p>
     <div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={finish} className="case-primary">Start my case <ArrowRight size={18}/></button><button onClick={again} className="case-secondary"><RotateCcw size={16}/> Watch again</button></div></div>
   </div>}
  </div>
  <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
   <details className="max-w-xl text-[15px] text-[#4A4438]"><summary className="cursor-pointer font-semibold text-[#2A2620]">Read the steps instead</summary><ol className="mt-3 list-decimal space-y-1.5 pl-5">{steps.map(s=><li key={s}>{s}</li>)}</ol></details>
   <button onClick={finish} className="case-primary">Start my case <ArrowRight size={18}/></button>
  </div>
 </section>;
}
