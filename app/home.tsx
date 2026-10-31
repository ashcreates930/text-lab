"use client";
// Page 1 of The Tell-Tale Heart running in the real reader (preview mode: no AI calls, no clue gate, no saved
// progress) with a three-step tour over it, shown on the teacher and parent hub.
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {ArrowRight} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {StorybookReader} from "./storybook/reader";

const HERO_WORLD="tell-tale-heart";
const TOUR_KEY="textlab-home-tour-v1";

// A throwaway demo record that lives only inside the hero; nothing in it is saved or sent anywhere.
function heroDemo():Demo{return {id:"00000000-0000-4000-8000-000000000000",created:Date.now(),preset:"hero_preview",worldId:HERO_WORLD,grade:null,role:"",scene:0,events:[],flags:[],messages:[],narrative:"",think:true,thinkSupport:false,thinkAnswers:{},trace:false,evidence:0,connection:"",myWords:[],glossaryOpens:0,suggestedArtifactType:"observed",readAloudOn:false,hintFrequency:"on_request",sentenceStartersOn:false,resumePhrase:"",submitted:false,artifactAnswers:{},openedArtifacts:[],activeArtifact:"",artifactStage:0,artifactDialogOpen:false,briefingComplete:true,savedTextEvidence:[],authorshipRanges:[],readerProgress:{[HERO_WORLD]:{page:0,briefed:true}}} as Demo}

// "See what students see" on the teacher and parent hub: page 1 of the hero story in the real reader (preview mode),
// with a three-step tour over it. It never calls AI, never gates a clue, and saves nothing.
export function StudentPreview({onKeepReading}:{onKeepReading:()=>void}){
 const [world,setWorld]=useState<WorldPack|null>(null),[passages,setPassages]=useState<SourcePassage[]>([]),[demo,setDemo]=useState<Demo>(heroDemo);
 const [tour,setTour]=useState<number>(-1);
 const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{fetch(`/worlds/${HERO_WORLD}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>{});fetch(`/worlds/${HERO_WORLD}/source.md`).then(r=>r.ok?r.text():"").then(t=>setPassages(parseSourcePassages(t))).catch(()=>{})},[]);
 // The tour shows once per browser; Replay brings it back.
 useEffect(()=>{if(!world||!passages.length)return;let seen=false;try{seen=localStorage.getItem(TOUR_KEY)==="done"}catch{}if(!seen)setTour(0)},[world,passages.length]);
 const endTour=()=>{setTour(-1);try{localStorage.setItem(TOUR_KEY,"done")}catch{}};
 const role=world?.roles[0];
 return <section aria-labelledby="preview-h" className="case-ui">
  <h2 id="preview-h" className="text-[26px] font-bold leading-tight">See what students see</h2>
  <p className="mt-1 max-w-2xl text-[17px] leading-7 text-muted">This is page 1 of <i>The Tell-Tale Heart</i>, exactly as a student reads it. Turn the page, tap an underlined word, or tap Say it again.</p>
  <div ref={box} className="relative mt-4 h-[min(640px,76svh)] min-h-[500px]">
   {world&&role&&passages.length?<StorybookReader mode="preview" previewPages={2} world={world} role={role} passages={passages} demo={demo} setDemo={setDemo} onExit={()=>{}} onKeepReading={onKeepReading}/>
   :<div className="sb-placeholder grid h-full place-items-center rounded-3xl"><p className="rounded-2xl bg-panel/85 px-4 py-2 text-[16px] text-muted">Opening the story…</p></div>}
   {tour>=0&&<Tour root={box} step={tour} onNext={()=>tour>=2?endTour():setTour(tour+1)} onSkip={endTour}/>}
  </div>
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
   <button type="button" onClick={onKeepReading} className="case-primary">Keep reading as a student <ArrowRight size={18}/></button>
   <button type="button" onClick={()=>setTour(0)} className="min-h-11 text-[15px] font-semibold text-highlight underline underline-offset-4">Replay tour</button>
  </div>
 </section>;
}

// Coach marks over the live hero. Each step points at a real control inside the reader.
const steps=[
 {target:'nav[aria-label="Page navigation"] button:last-child',title:"Turn the page",text:"Swipe, use the arrow keys, or tap the arrow."},
 {target:".sb-word",title:"Tap a word",text:"Underlined words open a card with the meaning, the sentence it's in, and Spanish."},
 {target:'nav[aria-label="Page navigation"] button:last-child',title:"Prove a clue to unlock the next page",text:"Some pages hide a clue. In the full demo you prove it with a line from the story before the page turns."},
];
function Tour({root,step,onNext,onSkip}:{root:React.RefObject<HTMLDivElement|null>;step:number;onNext:()=>void;onSkip:()=>void}){
 const [rect,setRect]=useState<{x:number;y:number;w:number;h:number}|null>(null);
 const measure=useCallback(()=>{const box=root.current;const el=box?.querySelector<HTMLElement>(steps[step].target);if(!box||!el){setRect(null);return}const b=box.getBoundingClientRect(),r=el.getBoundingClientRect();setRect({x:r.left-b.left,y:r.top-b.top,w:r.width,h:r.height})},[root,step]);
 useLayoutEffect(()=>{measure();const t=window.setInterval(measure,400);window.addEventListener("resize",measure);return()=>{window.clearInterval(t);window.removeEventListener("resize",measure)}},[measure]);
 const box=root.current,W=box?.clientWidth??0,H=box?.clientHeight??0;
 const tipW=Math.min(320,W-24),below=rect?rect.y+rect.h+12+170<H:true;
 const left=rect?Math.min(Math.max(12,rect.x+rect.w/2-tipW/2),W-tipW-12):12,top=rect?(below?rect.y+rect.h+12:Math.max(12,rect.y-12-170)):12;
 return <div className="pointer-events-none absolute inset-0 z-50">
  {rect&&<span aria-hidden className="tour-ring absolute rounded-2xl" style={{left:rect.x-6,top:rect.y-6,width:rect.w+12,height:rect.h+12}}/>}
  <div role="dialog" aria-label={`Tour step ${step+1} of ${steps.length}: ${steps[step].title}`} className="pointer-events-auto absolute rounded-2xl bg-deep p-4 text-ink shadow-2xl" style={{left,top,width:tipW}}>
   <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Tour · {step+1} of {steps.length}</p>
   <p className="mt-1 text-[17px] font-bold leading-snug">{steps[step].title}</p>
   <p className="mt-1 text-[15px] leading-6 text-ink">{steps[step].text}</p>
   <div className="mt-3 flex items-center justify-between gap-3"><button type="button" onClick={onSkip} className="min-h-10 text-[14px] font-semibold text-muted underline underline-offset-4">Skip tour</button><button type="button" onClick={onNext} className="min-h-10 rounded-full bg-primary px-4 text-[15px] font-semibold">{step>=steps.length-1?"Done":"Next"}</button></div>
  </div>
 </div>;
}
