"use client";
// One-minute "How a case works" video, shown after Try the Demo; the same steps are listed in text below it.
// The <video> stays mounted (hidden) on every screen so callers can start it inside their own click handler:
// iOS and iPadOS Safari only allow sound when play() runs during the tap itself, on an element already in the page.
import {useEffect,useImperativeHandle,useRef,useState} from "react";
import {ArrowRight,Play,RotateCcw,Volume2} from "lucide-react";

export type TutorialHandle={start:()=>void};
const steps=["You're the detective. Every scene is a case to solve.","Your mission: prove every clue in the scene.","Tap a clue to open it.","Ask a character what happened.","Characters can be wrong. So you check the story.","Tap the line in the story that proves it.","Decide: does it back them up, or prove them wrong?","Explain what it shows, in your own words.","Every proven clue gets stamped and fills your meter.","Prove them all to solve the scene and move up the detective ranks."];

// Only offer "Tap for sound" when the file has an audio track. Safari and Firefox report it; elsewhere assume it does.
function hasAudio(v:HTMLVideoElement){const media=v as HTMLVideoElement&{audioTracks?:{length:number};mozHasAudio?:boolean};if(media.audioTracks)return media.audioTracks.length>0;if(typeof media.mozHasAudio==="boolean")return media.mozHasAudio;return true}

export function Tutorial({visible,onDone,ref}:{visible:boolean;onDone:()=>void;ref?:React.Ref<TutorialHandle>}){
 const video=useRef<HTMLVideoElement>(null);
 const [ended,setEnded]=useState(false),[needsSound,setNeedsSound]=useState(false),[needsTap,setNeedsTap]=useState(false);
 // Must be called synchronously from a click handler. Tries with sound first; if the browser refuses, plays muted and offers "Tap for sound".
 function start(){
  const v=video.current;if(!v)return;
  setEnded(false);setNeedsSound(false);setNeedsTap(false);
  try{v.currentTime=0}catch{}
  v.muted=false;
  v.play().catch(()=>{v.muted=true;v.play().then(()=>{if(hasAudio(v))setNeedsSound(true)}).catch(()=>setNeedsTap(true))});
 }
 useImperativeHandle(ref,()=>({start}),[]);
 useEffect(()=>{if(!visible)video.current?.pause()},[visible]);
 function unmute(){const v=video.current;if(!v)return;v.muted=false;setNeedsSound(false);v.play().catch(()=>{})}
 function finish(){video.current?.pause();onDone()}
 // The heading renders only while visible so the app's focus-the-main-heading rule never lands on this hidden screen.
 return <section hidden={!visible} aria-hidden={!visible} className="case-ui mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-8">
  {visible&&<div className="flex flex-wrap items-end justify-between gap-4">
   <div><p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">Before you start · 1 minute</p><h1 className="mt-1 text-[30px] font-bold leading-tight md:text-[36px]">How a case works</h1></div>
   <button type="button" onClick={finish} className="case-secondary">Skip video <ArrowRight size={18}/></button>
  </div>}
  <div className="relative mt-5 overflow-hidden rounded-3xl bg-deep">
   <video ref={video} poster="/tutorial/how-it-works-poster.jpg" playsInline {...{"webkit-playsinline":"true"}} controls preload="metadata" onEnded={()=>setEnded(true)} onVolumeChange={e=>{if(!e.currentTarget.muted)setNeedsSound(false)}} onPlay={()=>setNeedsTap(false)} aria-label="Video: how a case works in Text Lab" className="block aspect-video w-full"><source src="/tutorial/how-it-works.mp4" type="video/mp4"/><source src="/tutorial/how-it-works.webm" type="video/webm"/></video>
   {needsSound&&!ended&&<button type="button" onClick={unmute} className="absolute inset-0 grid place-items-center bg-deep/30"><span className="inline-flex items-center gap-3 rounded-full bg-panel px-7 py-4 text-[20px] font-bold text-ink shadow-xl md:text-[24px]"><Volume2 size={28}/> Tap for sound</span></button>}
   {needsTap&&!ended&&<button type="button" onClick={start} className="absolute inset-0 grid place-items-center bg-deep/40"><span className="inline-flex items-center gap-3 rounded-full bg-panel px-7 py-4 text-[20px] font-bold text-ink shadow-xl md:text-[24px]"><Play size={28}/> Play video</span></button>}
   {ended&&<div className="absolute inset-0 grid place-items-center bg-deep/75 p-6 text-center">
    <div><p className="text-[26px] font-bold text-ink md:text-[32px]">Your case is waiting.</p>
     <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={finish} className="case-primary">Start my case <ArrowRight size={18}/></button><button type="button" onClick={start} className="case-secondary"><RotateCcw size={16}/> Watch again</button></div></div>
   </div>}
  </div>
  {visible&&<div className="mt-5 flex flex-wrap items-start justify-between gap-4">
   <details className="max-w-xl text-[15px] text-muted"><summary className="cursor-pointer font-semibold text-ink">Read the steps instead</summary><ol className="mt-3 list-decimal space-y-1.5 pl-5">{steps.map(s=><li key={s}>{s}</li>)}</ol></details>
   <button type="button" onClick={finish} className="case-primary">Start my case <ArrowRight size={18}/></button>
  </div>}
 </section>;
}
