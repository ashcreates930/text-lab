"use client";
// Top of the marketing home: page 1 of The Tell-Tale Heart running in the real reader (preview mode: no AI calls,
// no clue gate, no saved progress), a three-step tour over it, the two front doors, and the role cards.
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {ArrowRight,GraduationCap,Search,Scale,Newspaper,School} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {StorybookReader} from "./storybook/reader";

const HERO_WORLD="tell-tale-heart";
const TOUR_KEY="textlab-home-tour-v1";
const roleIcons:Record<string,React.ReactNode>={investigator:<Search size={26}/>,attorney:<Scale size={26}/>,reporter:<Newspaper size={26}/>};

// A throwaway demo record that lives only inside the hero; nothing in it is saved or sent anywhere.
function heroDemo():Demo{return {id:"00000000-0000-4000-8000-000000000000",created:Date.now(),preset:"hero_preview",worldId:HERO_WORLD,grade:null,role:"",scene:0,events:[],flags:[],messages:[],narrative:"",think:true,thinkSupport:false,thinkAnswers:{},trace:false,evidence:0,connection:"",myWords:[],glossaryOpens:0,suggestedArtifactType:"observed",readAloudOn:false,hintFrequency:"on_request",sentenceStartersOn:false,resumePhrase:"",submitted:false,artifactAnswers:{},openedArtifacts:[],activeArtifact:"",artifactStage:0,artifactDialogOpen:false,briefingComplete:true,savedTextEvidence:[],authorshipRanges:[],readerProgress:{[HERO_WORLD]:{page:0,briefed:true}}} as Demo}

export function HomeTop({onKeepReading,onStudent,onTeacher,onRole}:{onKeepReading:()=>void;onStudent:()=>void;onTeacher:()=>void;onRole:(roleId:string)=>void}){
 const [world,setWorld]=useState<WorldPack|null>(null),[passages,setPassages]=useState<SourcePassage[]>([]),[demo,setDemo]=useState<Demo>(heroDemo);
 const [tour,setTour]=useState<number>(-1);
 const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{fetch(`/worlds/${HERO_WORLD}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>{});fetch(`/worlds/${HERO_WORLD}/source.md`).then(r=>r.ok?r.text():"").then(t=>setPassages(parseSourcePassages(t))).catch(()=>{})},[]);
 // The tour shows once per browser; Replay brings it back.
 useEffect(()=>{if(!world||!passages.length)return;let seen=false;try{seen=localStorage.getItem(TOUR_KEY)==="done"}catch{}if(!seen)setTour(0)},[world,passages.length]);
 const endTour=()=>{setTour(-1);try{localStorage.setItem(TOUR_KEY,"done")}catch{}};
 const role=world?.roles[0];
 return <>
  <section id="top" aria-label="Read page 1 of The Tell-Tale Heart" className="mx-auto max-w-6xl px-4 pt-4 md:px-8">
   <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">For grades 6 to 12 English classrooms</p>
   <h1 className="serif mt-2 text-[34px] leading-[1.08] tracking-[-.02em] md:text-[48px]">Step into the story. <span className="italic text-[#A0472C]">Decide what to believe.</span></h1>
   <p className="mt-2 max-w-2xl text-[17px] leading-7 text-[#4A4438]">This is page 1 of <i>The Tell-Tale Heart</i>. Turn the page, tap an underlined word, or tap Say it again.</p>
   <div ref={box} className="relative mt-5 h-[min(640px,76svh)] min-h-[500px]">
    {world&&role&&passages.length?<StorybookReader mode="preview" previewPages={2} world={world} role={role} passages={passages} demo={demo} setDemo={setDemo} onExit={()=>{}} feedbackUrl={null} onKeepReading={onKeepReading}/>
    :<div className="sb-placeholder grid h-full place-items-center rounded-3xl"><p className="rounded-2xl bg-[#FFFDF8]/85 px-4 py-2 text-[16px] text-[#6B6457]">Opening the story…</p></div>}
    {tour>=0&&<Tour root={box} step={tour} onNext={()=>tour>=2?endTour():setTour(tour+1)} onSkip={endTour}/>}
   </div>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
    <button type="button" onClick={onKeepReading} className="case-primary">Keep reading <ArrowRight size={18}/></button>
    <button type="button" onClick={()=>setTour(0)} className="min-h-11 text-[15px] font-semibold text-[#8A3B23] underline underline-offset-4">Replay tour</button>
   </div>
  </section>
  <section aria-label="Choose your side" className="mx-auto mt-10 grid max-w-6xl gap-4 px-4 md:grid-cols-2 md:px-8">
   <SideCard icon={<GraduationCap size={30}/>} title="I'm a student" lead="Pick a book from your shelf and start reading. No sign-in." cta="Open my shelf" onClick={onStudent}/>
   <SideCard icon={<School size={30}/>} title="I'm a teacher" lead="Walk through a sample classroom: progress, case files, and live lessons. No sign-in." cta="See a sample class" onClick={onTeacher}/>
  </section>
  {world&&<section aria-labelledby="roles-h" className="mx-auto mt-12 max-w-6xl px-4 md:px-8">
   <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Or start as</p>
   <h2 id="roles-h" className="mt-1 text-[28px] font-bold leading-tight">Choose your role in <i>{world.title}</i></h2>
   <ul className="mt-5 grid gap-4 sm:grid-cols-3">{world.roles.map(r=><li key={r.id}><RoleCard role={r} icon={roleIcons[r.id]} onClick={()=>onRole(r.id)}/></li>)}</ul>
  </section>}
 </>;
}

function SideCard({icon,title,lead,cta,onClick}:{icon:React.ReactNode;title:string;lead:string;cta:string;onClick:()=>void}){
 return <button type="button" onClick={onClick} className="group flex min-h-[170px] w-full flex-col justify-between rounded-3xl bg-[#FFFDF8] p-6 text-left shadow-[0_6px_28px_-14px_rgba(42,38,32,.45)] ring-2 ring-transparent transition hover:-translate-y-0.5 hover:ring-[#A0472C] md:p-8">
  <span className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#F4E1D6] text-[#A0472C]">{icon}</span><span className="text-[28px] font-bold leading-tight md:text-[32px]">{title}</span></span>
  <span className="mt-3 block text-[17px] leading-7 text-[#4A4438]">{lead}</span>
  <span className="mt-4 inline-flex items-center gap-2 text-[16px] font-bold text-[#A0472C]">{cta} <ArrowRight size={18} className="transition group-hover:translate-x-1"/></span>
 </button>;
}

// Flip card: the front names the role; hovering or focusing flips it to what that role does. Tapping starts the demo.
function RoleCard({role,icon,onClick}:{role:WorldPack["roles"][number];icon:React.ReactNode;onClick:()=>void}){
 return <button type="button" onClick={onClick} aria-label={`Start as the ${role.name}: ${role.description}`} className="role-card group block h-[210px] w-full text-left [perspective:900px]">
  <span className="role-card-inner relative block h-full w-full">
   <span className="role-face absolute inset-0 flex flex-col justify-between rounded-3xl bg-[#A0472C] p-6 text-white shadow-[0_8px_26px_-14px_rgba(42,38,32,.6)]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">{icon}</span><span><span className="block text-[13px] font-semibold uppercase tracking-wide text-[#F7E3D7]">Role</span><span className="block text-[24px] font-bold leading-tight">{role.name}</span><span className="mt-1 block text-[15px] leading-6 text-[#F7E3D7]">{role.description}</span></span></span>
   <span className="role-back absolute inset-0 flex flex-col justify-between rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_8px_26px_-14px_rgba(42,38,32,.6)] ring-2 ring-[#A0472C]"><span><span className="block text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">As the {role.name}</span><span className="mt-2 block text-[16px] leading-6 text-[#2A2620]">{role.goal}</span></span><span className="inline-flex items-center gap-2 text-[16px] font-bold text-[#A0472C]">Start as {role.name} <ArrowRight size={18}/></span></span>
  </span>
 </button>;
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
  <div role="dialog" aria-label={`Tour step ${step+1} of ${steps.length}: ${steps[step].title}`} className="pointer-events-auto absolute rounded-2xl bg-[#2A2620] p-4 text-white shadow-2xl" style={{left,top,width:tipW}}>
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Tour · {step+1} of {steps.length}</p>
   <p className="mt-1 text-[17px] font-bold leading-snug">{steps[step].title}</p>
   <p className="mt-1 text-[15px] leading-6 text-white/85">{steps[step].text}</p>
   <div className="mt-3 flex items-center justify-between gap-3"><button type="button" onClick={onSkip} className="min-h-10 text-[14px] font-semibold text-white/80 underline underline-offset-4">Skip tour</button><button type="button" onClick={onNext} className="min-h-10 rounded-full bg-[#A0472C] px-4 text-[15px] font-semibold">{step>=steps.length-1?"Done":"Next"}</button></div>
  </div>
 </div>;
}
