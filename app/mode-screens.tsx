"use client";
// The screens after a student picks how they play ("What's your angle?" → How do you play?):
// Solo: a mission screen when a scene opens (role badge, four-stop scene map, coins, streak, trust meter).
// Rival: a face-off before each clue with an off claim (both players, VS, tug-of-war bar, 3-2-1).
// Squad: a team huddle before each clue (squad name, member tiles with status, one shared bar, a job each).
// Demo rivals and teammates are computer players, clearly labeled; their choices come only from authored lines.
// Class students play squads in live rounds with their class, so outside one they play solo.
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {ArrowRight,Coins,Flame,Trophy} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {Demo} from "./page";
import {SQUAD_JOBS,newClueGame,type SquadJob} from "@/lib/clue-game";
import {sceneTitle} from "@/lib/classroom/evidence";
import {focusScreenTop} from "./screen-focus";

export type PlayMode="solo"|"rival"|"squad";
// How this student plays. A class student who picked squads plays solo outside a live round.
export function playMode(demo:Demo):PlayMode{
 const s=demo.angle?.style;
 if(s==="rival")return "rival";
 if(s==="squad"&&!demo.classAuth)return "squad";
 return "solo";
}
const reduced=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const sceneLabel=(world:WorldPack,i:number)=>sceneTitle(world.scenes[i].id,i,JSON.stringify([world.scenes,world.characters.map(c=>c.name)])).replace(/^Scene \d+ · /,"");

// Trust with the character who confronts the student in Story Mode (the first scene that has one), from saved runs.
export function trustMeter(world:WorldPack,demo:Demo){
 const sm=world.scenes.find(s=>s.story_mode)?.story_mode;
 if(!sm)return null;
 const who=world.characters.find(c=>c.id===sm.confront.character_id);
 if(!who)return null;
 const value=Object.values(demo.story??{}).reduce((n,r)=>n+(r.trust?.[who.id]??0),0);
 return {name:who.name,value:Math.max(-3,Math.min(3,value))};
}

function Chips({demo,onDark=false}:{demo:Demo;onDark?:boolean}){
 const g=demo.game??newClueGame();
 return <div className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold">
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${onDark?"bg-white/15 text-white":"bg-[#2A2620] text-white"}`} aria-label={`${g.points} points`}><Trophy size={13}/>{g.points}</span>
  <span className="inline-flex items-center gap-1 rounded-full bg-[#F4E1D6] px-2.5 py-1 text-[#8A3B23]" aria-label={`${g.coins} coins`}><Coins size={13}/>{g.coins}</span>
  {g.streak>0&&<span className={`items-center gap-1 rounded-full bg-[#FBEFD2] px-2.5 py-1 text-[#6E520F] ${onDark?"hidden sm:inline-flex":"inline-flex"}`} aria-label={`Streak ${g.streak}`}><Flame size={13}/>{g.streak}</span>}
 </div>;
}
export {Chips as GameChips};

function useScreenTop(){useLayoutEffect(()=>{focusScreenTop()},[])}

// ---------- Solo: the mission screen ----------
export function MissionScreen({world,demo,sceneIndex,onGo}:{world:WorldPack;demo:Demo;sceneIndex:number;onGo:()=>void}){
 useScreenTop();
 const g=demo.game??newClueGame(),role=world.student_role,trust=trustMeter(world,demo);
 const goal=world.roles.find(r=>r.id===demo.role)?.goal??world.roles[0]?.goal??"";
 const scene=world.scenes[sceneIndex];
 return <div className="case-ui mx-auto flex min-h-[calc(100dvh-64px)] max-w-xl flex-col px-4 pb-6 pt-4">
  <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold text-[#6B6457]">{world.title}</p><span className="rounded-full bg-[#2A2620] px-3 py-1 text-[12px] font-bold text-white">Solo</span></div>
  <section className="relative mt-3 overflow-hidden rounded-3xl bg-[#2A2620] p-5 text-[#FFFDF8]">
   <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(231,181,74,.35),transparent_70%)]"/>
   {role&&<p className="inline-flex items-center gap-2 rounded-full bg-[#A0472C] py-1 pl-1 pr-3 text-[13px] font-bold"><span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-[#F3C9B2] text-[#8A3B23]">★</span>{role.name}</p>}
   <h1 className="mt-3 text-[24px] font-bold leading-tight outline-none">Mission: {goal}</h1>
   <ol className="mt-5 flex items-center" aria-label={`Scene ${sceneIndex+1} of ${world.scenes.length}`}>{world.scenes.map((s,i)=><li key={s.id} className={`flex items-center ${i<world.scenes.length-1?"flex-1":""}`}>
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] text-[14px] font-bold ${i<sceneIndex?"border-[#E7B54A] bg-[#E7B54A] text-[#2A2620]":i===sceneIndex?"border-[#F3C9B2] bg-[#A0472C] text-white shadow-[0_0_0_5px_rgba(160,71,44,.35)]":"border-[#5a5146] bg-[#3a342b] text-[#bdb3a2]"}`} aria-current={i===sceneIndex?"step":undefined}><span className="sr-only">{i<sceneIndex?"Done: ":i===sceneIndex?"Now: ":"Later: "}</span>{i+1}</span>
    {i<world.scenes.length-1&&<span aria-hidden className={`h-1 flex-1 ${i<sceneIndex?"bg-[#E7B54A]":"bg-[#5a5146]"}`}/>}</li>)}</ol>
   <div aria-hidden className="mt-1.5 grid text-[11px] font-semibold text-[#E8DDCB]" style={{gridTemplateColumns:`repeat(${world.scenes.length},minmax(0,1fr))`}}>{world.scenes.map((s,i)=><span key={s.id} className={`leading-tight ${i===0?"text-left":i===world.scenes.length-1?"text-right":"text-center"}`}>{sceneLabel(world,i)}</span>)}</div>
  </section>
  <div className="mt-3 grid grid-cols-2 gap-2">
   <div className="rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-5px_rgba(42,38,32,.3)]"><p className="text-[11px] font-bold uppercase tracking-wide text-[#6B6457]">Coins</p><p className="flex items-center gap-1 text-[26px] font-bold"><Coins size={20} className="text-[#A0472C]"/>{g.coins}</p></div>
   <div className="rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-5px_rgba(42,38,32,.3)]"><p className="text-[11px] font-bold uppercase tracking-wide text-[#6B6457]">Streak</p><p className="flex items-center gap-1 text-[26px] font-bold"><Flame size={20} className="text-[#A0472C]"/>{g.streak}</p><p className="text-[12px] text-[#6B6457]">correct proofs in a row</p></div>
   {trust&&<div className="col-span-2 rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-5px_rgba(42,38,32,.3)]"><p className="text-[11px] font-bold uppercase tracking-wide text-[#6B6457]">{trust.name.split(" ")[0]}'s trust</p>
    <div className="relative mt-2 h-2.5 rounded-full bg-[linear-gradient(90deg,#C7553A,#E4DCCB_50%,#5E8F5E)]" role="meter" aria-valuemin={-3} aria-valuemax={3} aria-valuenow={trust.value} aria-label={`${trust.name.split(" ")[0]}'s trust`}><span className="absolute -top-1 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[3px] border-white bg-[#2A2620]" style={{left:`${((trust.value+3)/6)*100}%`}}/></div>
    <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-[#6B6457]"><span>Wary</span><span>Friendly</span></div></div>}
  </div>
  <p className="mt-4 text-[12px] font-bold uppercase tracking-wide text-[#8A3B23]">Next stop</p>
  <div className="mt-1 rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-5px_rgba(42,38,32,.3)]"><p className="text-[17px] font-bold">Scene {sceneIndex+1} · {sceneLabel(world,sceneIndex)}</p><p className="text-[14px] text-[#6B6457]">{scene.artifacts.length} clue{scene.artifacts.length===1?"":"s"} · {scene.available_characters.map(id=>world.characters.find(c=>c.id===id)?.name).filter(Boolean).join(" and ")||"No one to question"}</p></div>
  <button type="button" onClick={onGo} className="case-primary mt-auto min-h-[56px] w-full text-[18px]">Go to scene {sceneIndex+1} <ArrowRight size={20}/></button>
 </div>;
}

// The computer rival's emblem: a lantern or a headless rider, from the world file.
export function RivalEmblem({kind,size=84}:{kind:"lantern"|"rider";size?:number}){
 return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="rounded-full bg-[#2E3B4E]">
  {kind==="lantern"?<g><circle cx="32" cy="34" r="17" fill="#E7B54A" opacity=".25"/><path d="M26 16h12M28 16v-4h8v4" stroke="#F3C9B2" strokeWidth="2.5" fill="none" strokeLinecap="round"/><rect x="23" y="20" width="18" height="24" rx="5" fill="#E7B54A"/><rect x="27" y="24" width="10" height="16" rx="3" fill="#FFF3CF"/><path d="M24 46h16" stroke="#F3C9B2" strokeWidth="3" strokeLinecap="round"/></g>
  :<g fill="#0F141C"><path d="M14 46c4-8 12-11 20-11l8 2 6-6 2 3-4 6 3 10h-4l-3-7-6 2-9 1-5 7h-4l3-7z"/><path d="M33 34l-2-12 4-3 5 2 1 12z"/><circle cx="46" cy="24" r="3.5" fill="#E7B54A"/></g>}
 </svg>;
}

// ---------- Rival: the face-off ----------
export function FaceOff({world,demo,clueName,onGo}:{world:WorldPack;demo:Demo;clueName:string;onGo:()=>void}){
 useScreenTop();
 const g=demo.game??newClueGame(),rival=world.computer_players?.rival??{name:"Computer rival",emblem:"lantern" as const};
 const [count,setCount]=useState<number|null>(null);
 const go=useRef(onGo);go.current=onGo;
 useEffect(()=>{if(count===null)return;if(count===0){go.current();return}const t=setTimeout(()=>setCount(c=>(c??1)-1),reduced()?600:900);return()=>clearTimeout(t)},[count]);
 const total=Math.max(1,g.rivalWins+g.rivalLosses),share=g.rivalWins+g.rivalLosses?g.rivalWins/total:0.5;
 return <div className="case-ui mx-auto flex min-h-[calc(100dvh-64px)] max-w-xl flex-col px-4 pb-6 pt-4">
  <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-[#6B6457]">Rival · {clueName}</p><Chips demo={demo}/></div>
  <h1 className="mt-3 text-center text-[28px] font-bold outline-none">Face-off</h1>
  <p className="mx-auto mt-1 max-w-sm text-center text-[15px] leading-6 text-[#4A4438]">Same claim, same passage. The right line wins the point; speed only breaks a tie. A wrong tap locks you out for 3 seconds.</p>
  <div className="mt-5 flex items-center justify-between px-2">
   <div className="w-32 text-center"><span className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full border-4 border-white bg-[#A0472C] text-[24px] font-bold text-white shadow-lg">You</span><p className="mt-2 text-[15px] font-bold">You</p><p className="text-[12px] font-semibold text-[#6B6457]">{g.rivalWins} win{g.rivalWins===1?"":"s"}</p></div>
   <span className="text-[40px] font-bold italic text-[#A0472C]" aria-hidden>VS</span>
   <div className="w-32 text-center"><span className="mx-auto block h-[84px] w-[84px] overflow-hidden rounded-full border-4 border-white shadow-lg"><RivalEmblem kind={rival.emblem}/></span><p className="mt-2 text-[15px] font-bold leading-tight">{rival.name}</p><p className="text-[12px] font-semibold text-[#6B6457]">Computer rival · {g.rivalLosses} win{g.rivalLosses===1?"":"s"}</p></div>
  </div>
  <TugBar share={share} you={g.rivalWins} them={g.rivalLosses} label="Wins this story"/>
  <div className="mt-6 flex flex-1 items-center justify-center">{count===null
   ?<button type="button" onClick={()=>setCount(3)} className="case-primary min-h-[56px] px-10 text-[18px]">I'm ready</button>
   :<p className="grid h-32 w-32 place-items-center rounded-full bg-[#2A2620] text-[64px] font-bold tabular-nums text-white shadow-[0_0_0_8px_#F4E1D6]" aria-live="assertive">{Math.max(1,count)}</p>}</div>
  <p className="text-center text-[13px] text-[#6B6457]">Points come from the right line, never from speed alone.</p>
 </div>;
}
export function TugBar({share,you,them,label}:{share:number;you:number;them:number;label:string}){
 return <div className="mt-5"><div className="relative h-5 overflow-hidden rounded-full bg-[#5E7FA8]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share*100)} aria-label={`${label}: you ${you}, rival ${them}`}>
  <div className="h-full bg-[#A0472C] transition-[width] duration-500 motion-reduce:transition-none" style={{width:`${share*100}%`}}/><span aria-hidden className="absolute inset-y-[-3px] left-1/2 w-[3px] bg-white"/></div>
  <div aria-hidden className="mt-1 flex justify-between text-[12px] font-bold"><span className="text-[#8A3B23]">You {you}</span><span className="text-[#3E5F86]">{them} Rival</span></div></div>;
}

// ---------- Squad: the team huddle ----------
export type HuddleMember={id:string;name:string;job:SquadJob;part:string;status:"ready"|"answering"|"absent";computer?:boolean;me?:boolean};
export function Huddle({squad,clueName,members,progress,onGo,demo}:{squad:string;clueName:string;members:HuddleMember[];progress:{done:number;total:number};onGo:()=>void;demo:Demo}){
 useScreenTop();
 const me=members.find(m=>m.me);
 return <div className="case-ui mx-auto flex min-h-[calc(100dvh-64px)] max-w-xl flex-col px-4 pb-6 pt-4">
  <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-[#6B6457]">Squad · {clueName}</p><Chips demo={demo}/></div>
  <section className="mt-3 rounded-3xl bg-[#2A2620] p-4 text-[#FFFDF8]"><p className="text-[11px] font-bold uppercase tracking-wide text-[#F3C9B2]">Your squad</p><h1 className="text-[24px] font-bold outline-none">{squad}</h1><p className="mt-1 text-[14px] text-[#E8DDCB]">Each of you reads a different part. Pins light up on everyone's screen.</p></section>
  <p className="mt-3 text-[12px] font-bold uppercase tracking-wide text-[#8A3B23]">Squad progress</p>
  <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#E4DCCB]" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Clues your squad has proven"><div className="h-full bg-[#A0472C]" style={{width:`${progress.total?progress.done/progress.total*100:0}%`}}/></div>
  <p className="mt-1 text-[13px] text-[#6B6457]">{progress.done} of {progress.total} clues proven</p>
  <ul className="mt-3 space-y-2">{members.map(m=><li key={m.id} className={`flex items-center gap-3 rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-6px_rgba(42,38,32,.3)] ${m.status==="absent"?"opacity-70":""}`}>
   <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{background:m.me?"#A0472C":m.computer?"#5E7FA8":"#6E8B5E"}}>{m.name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
   <div className="min-w-0 flex-1"><p className="text-[15px] font-bold">{m.name}{m.me&&m.name!=="You"?" (you)":""}{m.computer?<span className="ml-1 text-[12px] font-semibold text-[#3E5F86]">Computer teammate</span>:null}</p><p className="text-[13px] font-semibold text-[#6B6457]">{SQUAD_JOBS[m.job].name} · {m.part}</p></div>
   <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${m.status==="ready"?"bg-[#E8F2E7] text-[#2F6B3A]":m.status==="answering"?"bg-[#FBEFD2] text-[#6E520F]":"bg-[#EDE8DE] text-[#6B6457]"}`}>{m.status==="ready"?"Ready":m.status==="answering"?"Answering":"Absent"}</span></li>)}</ul>
  {me&&<p className="mt-3 rounded-2xl bg-[#F4E1D6] px-4 py-3 text-[15px] leading-6"><b>Your job: {SQUAD_JOBS[me.job].name}.</b> {SQUAD_JOBS[me.job].does}</p>}
  <button type="button" onClick={onGo} className="case-primary mt-auto min-h-[56px] w-full text-[18px]">Read your part <ArrowRight size={20}/></button>
 </div>;
}
