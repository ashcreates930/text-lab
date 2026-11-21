"use client";
// The mission briefing at a room's door (rules: lib/briefing.ts; look approved 2026-11-21). The student taps to open the
// case file; the dossier opens, then "Your situation" and the mission checklist reveal one line at a time (under 45
// seconds), with Skip briefing (and Mute, when narrated) always on screen. It ends on the countdown ring and one large
// "Accept the mission" button, both in view without scrolling. Narration is recorded audio only; until a room's lines
// are recorded, the typed lines play over the sound bed with no voice. "Captions only" (a class setting) plays them
// silently. Reduced motion, and a student coming back mid-room, show everything at once. The live board uses the same
// briefing (mode "board"), the only screen that narrates in a live game; the phones (mode "phone") show it all as text,
// silently, with "Look at the board" in place of the button.
import {useEffect,useMemo,useRef,useState} from "react";
import {FileSearch,Play,SkipForward,Volume2,VolumeX,Timer} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {Room} from "@/lib/escape-room";
import {RING_HOLD_MS,briefingLines,lineTimes,ringFor,type BriefingLine} from "@/lib/briefing";
import {Ambience} from "./atmosphere";

export type Narration="on"|"captions";
const reduced=()=>typeof window!=="undefined"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||document.documentElement.dataset.motion==="reduced");

type Props={world:WorldPack;room:Room;scenario:string;concepts:{name:string;teaser:string}[];mission:string|null;budgetMs:number;chamber:0|1|2;art:string|null;
 narration?:Narration;mode?:"solo"|"board"|"phone";resumed?:boolean;acceptLabel?:string;onAccept?:()=>void;waitText?:string;audio?:string[];headingId?:string};

export function MissionBriefing({world,room,scenario,concepts,mission,budgetMs,chamber,art,narration="on",mode="solo",resumed=false,acceptLabel,onAccept,audio=[],headingId="ex-h",waitText}:Props){
 const phone=mode==="phone";if(phone)narration="captions";
 // The checklist names each chamber's time; a live game on the whole room runs both chambers on one clock.
 const minutes=budgetMs>0?Math.round(budgetMs/(chamber===0?Math.max(1,room.chambers.length):1)/6000)/10:0;
 const lines=useMemo(()=>briefingLines(world,room,scenario,minutes),[world,room,scenario,minutes]);
 const times=useMemo(()=>lineTimes(lines),[lines]);
 const [phase,setPhase]=useState<"closed"|"playing"|"done">(()=>resumed||phone?"done":"closed");
 useEffect(()=>{if(reduced())setPhase("done")},[]);
 const [shown,setShown]=useState(0),[muted,setMuted]=useState(false);
 const acceptRef=useRef<HTMLButtonElement>(null),liveRef=useRef<HTMLDivElement>(null),audioRef=useRef<HTMLAudioElement|null>(null),moved=useRef(false);
 const voiced=narration==="on"&&!muted;
 // The reveal: each line after the one before has had its time (or its recording has finished, when there is one).
 useEffect(()=>{
  if(phase!=="playing")return;
  if(shown>=lines.length){const t=setTimeout(()=>finish(),RING_HOLD_MS);return()=>clearTimeout(t)}
  let done=false,timer=0;const next=()=>{if(!done){done=true;setShown(s=>s+1)}};
  const src=voiced?audio[shown]:undefined;
  if(src){const a=new Audio(src);audioRef.current=a;let timeUp=false,ended=false;a.onended=()=>{ended=true;if(timeUp)next()};a.onerror=()=>{ended=true;if(timeUp)next()};void a.play().catch(()=>{ended=true});timer=window.setTimeout(()=>{timeUp=true;if(ended)next()},shown===0?400:times[shown-1])}
  else timer=window.setTimeout(next,shown===0?400:times[shown-1]);
  return()=>{done=true;clearTimeout(timer);audioRef.current?.pause()};
 },[phase,shown]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(muted)audioRef.current?.pause()},[muted]);
 // Each new line comes into view as it appears (on a phone the list runs past the screen); Skip stays pinned above.
 useEffect(()=>{if(phase!=="playing"||shown<2)return;const el=liveRef.current?.querySelectorAll(".ms-line-in");el?.[el.length-1]?.scrollIntoView({block:"nearest",behavior:reduced()?"auto":"smooth"})},[phase,shown]);
 // The end screen: back to the top, with the ring and the button in view and focus on the button.
 function finish(){audioRef.current?.pause();setPhase("done");moved.current=true}
 useEffect(()=>{if(phase==="done"&&moved.current){window.scrollTo({top:0});acceptRef.current?.focus({preventScroll:true})}},[phase]);
 const ring=ringFor(room,chamber,budgetMs),total=world.expeditions?.length??0,H=mode==="board"?"h2":"h1";
 const shownLines=phase==="done"?lines:lines.slice(0,shown);
 const of=(k:BriefingLine["kind"])=>shownLines.map((l,i)=>({l,i})).filter(x=>x.l.kind===k);
 const dossier=[...of("case"),...of("question")],situation=of("situation"),checks=of("check");
 const anim=phase==="playing"?"ms-line-in":"";
 const label=acceptLabel??(resumed?(budgetMs>0?"Back into the room":"Back into the room"):"Accept the mission");
 const frame=(withRing:boolean,slim=false)=><div className="ms-frame" style={slim?{height:150}:undefined}>
  <span className="ms-corner tl"/><span className="ms-corner tr"/><span className="ms-corner bl"/><span className="ms-corner br"/>
  {art?<img src={art} alt="" style={slim?undefined:{aspectRatio:"3 / 2"}}/>:<div style={{aspectRatio:"3 / 2"}}/>}
  <span className="ms-tag ms-label">Case file {String(room.number).padStart(2,"0")} · {ring.label}</span>
  {withRing&&<div className={`ms-ring ${moved.current?"ms-ring-in":""}`} role="img" aria-label={`${ring.time?`${ring.time} on the clock, `:""}${ring.locks} locks, ${ring.label}`}><div>{ring.time&&<b>{ring.time}</b>}<span>{ring.locks} locks</span><span>{ring.label}</span></div></div>}
 </div>;
 return <section aria-labelledby={headingId} className={`ms ${mode==="board"?"ms-board":""}`} data-phase={phase}>
  <Ambience on={phase==="playing"&&voiced}/>
  <div className="ms-in">
   {phase!=="done"&&<div className="ms-bar">
    {narration==="on"&&<button type="button" className="ms-btn" aria-pressed={muted} onClick={()=>setMuted(m=>!m)}>{muted?<><VolumeX size={16} aria-hidden/>Sound off</>:<><Volume2 size={16} aria-hidden/>Sound on</>}</button>}
    <button type="button" className="ms-btn skip" onClick={finish}><SkipForward size={16} aria-hidden/>Skip briefing</button></div>}
   <p className="ms-kicker">Mission briefing · Room {room.number}{total?` of ${total}`:""}</p>
   <H id={headingId} tabIndex={-1} className="ms-h1">{room.name}</H>

   {phase==="closed"&&<div className="mt-4"><button type="button" className="ms-open" onClick={()=>{setShown(0);setPhase("playing")}}>
    <span className="ms-open-ring"><FileSearch size={36} aria-hidden/></span>
    <span className="ms-label ms-muted">Dossier · {world.title}</span>
    <span className="ms-question">Tap to open the case file</span></button></div>}

   {phase==="playing"&&<div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-start">
    <div className="hidden lg:sticky lg:top-[calc(var(--header-h,0px)+64px)] lg:block">{frame(false)}</div>
    <div className="lg:hidden">{frame(false,true)}</div>
    <div ref={liveRef} className="grid gap-3" aria-live="polite">
     <Dossier world={world} items={dossier} anim={anim}/>
     {situation.length>0&&<div className="ms-card"><p className="ms-h2">▸ Your situation</p><p className="ms-scenario mt-2">{situation.map(({l,i})=><span key={i} className={anim}>{l.text} </span>)}</p></div>}
     {checks.length>0&&<div className="ms-card"><p className="ms-h2">▸ Mission briefing</p><Checklist items={checks.map(x=>x.l)} anim={anim}/></div>}
    </div></div>}

   {phase==="done"&&<>
    <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-6">
     <div>{frame(true)}</div>
     <div className="grid gap-3">
      {concepts.length>0&&<p className="flex flex-wrap items-center gap-2"><span className="ms-label ms-muted">This room explores</span>{concepts.map(c=><span key={c.name} className="ms-concept">{c.name}</span>)}</p>}
      {mission&&<p className="ms-mission"><small>Your mission</small>{missionText(mission)}</p>}
      {phone?<p className="ms-card ms-h2" style={{fontSize:18}}>{waitText??"Look at the board."}</p>
      :<button ref={acceptRef} type="button" className="ms-accept" onClick={()=>{audioRef.current?.pause();onAccept?.()}}>{budgetMs>0?<Timer size={22} aria-hidden/>:<Play size={22} aria-hidden/>}{label}</button>}
      {!resumed&&!phone&&<button type="button" className="ms-btn w-fit" onClick={()=>{moved.current=false;setShown(0);setPhase(reduced()?"done":"playing")}}>Replay briefing</button>}
     </div></div>
    {/* Everything from the briefing stays below the button, to read again at any time. */}
    <div className="mt-5 grid gap-3 lg:grid-cols-3">
     <Dossier world={world} items={dossier} anim=""/>
     <div className="ms-card"><p className="ms-h2">▸ Your situation</p><p className="ms-scenario mt-2">{scenario}</p></div>
     <div className="ms-card"><p className="ms-h2">▸ Mission briefing</p><Checklist items={checks.map(x=>x.l)} anim=""/></div>
    </div>
    {concepts.some(c=>c.teaser)&&<div className="ms-card mt-3 grid gap-2 lg:grid-cols-2">{concepts.map(c=><p key={c.name}><b className="ms-teal ms-label" style={{fontSize:15}}>{c.name}.</b> {c.teaser}</p>)}</div>}
   </>}
  </div>
 </section>;
}

// The box is labelled "Your mission", so the line drops its own opening words.
const missionText=(m:string)=>{const t=m.replace(/^Your mission:s*/i,"");return t.charAt(0).toUpperCase()+t.slice(1)};
function Dossier({world,items,anim}:{world:WorldPack;items:{l:BriefingLine;i:number}[];anim:string}){
 if(!items.length)return null;
 return <div className="ms-dossier"><p className="ms-label ms-muted flex justify-between gap-2"><span>Dossier · {world.title}</span><span>Status: unsolved</span></p>
  {items.map(({l,i})=>l.kind==="case"?<p key={i} className={`ms-case mt-2 ${anim}`}>{l.text}</p>
   :<div key={i} className={`mt-3 border-t border-dashed pt-3 ${anim}`} style={{borderColor:"var(--ms-line)"}}><p className="ms-label ms-red">The big question</p><p className="ms-question mt-0.5">{l.text}</p></div>)}</div>;
}
function Checklist({items,anim}:{items:BriefingLine[];anim:string}){
 return <ol className="ms-check mt-2">{items.map((l,i)=><li key={i} className={anim}><span className={`ms-dot ${l.alarm?"alarm":""}`} aria-hidden>{l.alarm?"!":i+1}</span>{l.text}</li>)}</ol>;
}
