"use client";
// The screens after a student picks how they play ("What's your angle?" → How do you play?):
// Solo: a mission screen when a scene opens (role badge, four-stop scene map, coins, streak, trust meter).
// Rival: a face-off before each clue with an off claim (both players, VS, tug-of-war bar, 3-2-1).
// Squad: a team huddle before each clue (squad name, member tiles with status, one shared bar, a job each).
// Demo rivals and teammates are computer players, clearly labeled; their choices come only from authored lines.
// Class students play squads in live rounds with their class, so outside one they play solo.
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {MissionTracker,studentMission} from "./missions";
import {ArrowRight,Coins,Flame,Trophy,Check} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {Demo} from "./page";
import {SQUAD_JOBS,newClueGame,type SquadJob} from "@/lib/clue-game";
import {sceneTitle} from "@/lib/classroom/evidence";
import {focusScreenTop} from "./screen-focus";

export type PlayMode="solo"|"rival"|"squad";
// How this student plays. A class student who picked squads plays solo outside a live round.
export const SQUAD_SOLO_NOTE="Squads play in live class. You're playing solo today.";
// A class student who picked squads, outside a live round.
export const squadSoloToday=(demo:Demo)=>demo.angle?.style==="squad"&&!!demo.classAuth;
export function playMode(demo:Demo):PlayMode{
 const s=demo.angle?.style;
 if(s==="rival")return "rival";
 if(s==="squad"&&!demo.classAuth)return "squad";
 return "solo";
}
const reduced=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const sceneLabel=(world:WorldPack,i:number)=>sceneTitle(world.scenes[i].id,i,JSON.stringify([world.scenes,world.characters.map(c=>c.name)])).replace(/^Scene \d+ · /,"");

// Trust with the character who asks the student in Story Mode's infer round (the first scene that has one), from saved runs.
export function trustMeter(world:WorldPack,demo:Demo){
 const sm=world.scenes.find(s=>s.story_mode)?.story_mode;
 if(!sm)return null;
 const who=world.characters.find(c=>c.id===sm.infer.character_id);
 if(!who)return null;
 const value=Object.values(demo.story??{}).reduce((n,r)=>n+(r.trust?.[who.id]??0),0);
 return {name:who.name,value:Math.max(-3,Math.min(3,value))};
}

function Chips({demo,onDark=false}:{demo:Demo;onDark?:boolean}){
 const g=demo.game??newClueGame();
 return <div className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold">
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${onDark?"bg-ink/15 text-ink":"bg-deep text-ink"}`} aria-label={`${g.points} points`}><Trophy size={13}/>{g.points}</span>
  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-highlight" aria-label={`${g.coins} coins`}><Coins size={13}/>{g.coins}</span>
  {g.streak>0&&<span className={`items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-gold ${onDark?"hidden sm:inline-flex":"inline-flex"}`} aria-label={`Streak ${g.streak}`}><Flame size={13}/>{g.streak}</span>}
 </div>;
}
export {Chips as GameChips};

function useScreenTop(){useLayoutEffect(()=>{focusScreenTop()},[])}

// ---------- Solo: the mission screen ----------
export function MissionScreen({world,demo,sceneIndex,onGo}:{world:WorldPack;demo:Demo;sceneIndex:number;onGo:()=>void}){
 useScreenTop();
 const g=demo.game??newClueGame(),role=world.student_role,trust=trustMeter(world,demo);
 const goal=studentMission(world,demo)?.title??world.roles.find(r=>r.id===demo.role)?.goal??world.roles[0]?.goal??"";
 const scene=world.scenes[sceneIndex];
 return <div className="case-ui mx-auto flex min-h-[calc(100dvh-96px)] max-w-xl flex-col px-4 pb-6 pt-4">
  <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold text-muted">{world.title}</p><span className="rounded-full bg-deep px-3 py-1 text-[12px] font-bold text-ink">Solo</span></div>
  {squadSoloToday(demo)&&<p className="mt-2 rounded-2xl bg-primary-soft px-4 py-2 text-[14px] font-semibold text-highlight">{SQUAD_SOLO_NOTE}</p>}
  <section className="relative mt-3 overflow-hidden rounded-3xl bg-deep p-5 text-ink">
   <div aria-hidden className="hidden"/>
   {role&&<p className="inline-flex items-center gap-2 rounded-full bg-primary py-1 pl-1 pr-3 text-[13px] font-bold"><span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-highlight">★</span>{role.name}</p>}
   <h1 className="mt-3 text-[24px] font-bold leading-tight outline-none">Mission: {goal}</h1>
   <ol className="mt-5 flex items-center" aria-label={`Scene ${sceneIndex+1} of ${world.scenes.length}`}>{world.scenes.map((s,i)=><li key={s.id} className={`flex items-center ${i<world.scenes.length-1?"flex-1":""}`}>
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] text-[14px] font-bold ${i<sceneIndex?"border-edge bg-edge text-muted":i===sceneIndex?"border-highlight bg-primary text-on-primary shadow-[0_0_0_5px_rgba(160,71,44,.35)]":"border-edge bg-panel text-muted"}`} aria-current={i===sceneIndex?"step":undefined}><span className="sr-only">{i<sceneIndex?"Done: ":i===sceneIndex?"Now: ":"Later: "}</span>{i<sceneIndex?<Check size={16} aria-hidden/>:i+1}</span>
    {i<world.scenes.length-1&&<span aria-hidden className={`h-1 flex-1 ${i<sceneIndex?"bg-edge":"bg-edge"}`}/>}</li>)}</ol>
   <MissionTracker world={world} demo={demo} dark named={false}/>
   <div aria-hidden className="mt-1.5 grid text-[11px] font-semibold text-muted" style={{gridTemplateColumns:`repeat(${world.scenes.length},minmax(0,1fr))`}}>{world.scenes.map((s,i)=><span key={s.id} className={`leading-tight ${i===0?"text-left":i===world.scenes.length-1?"text-right":"text-center"}`}>{sceneLabel(world,i)}</span>)}</div>
  </section>
  <div className="mt-3 grid grid-cols-2 gap-2">
   <div className="rounded-2xl bg-panel p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-muted">Coins</p><p className="flex items-center gap-1 text-[26px] font-bold"><Coins size={20} className="text-highlight"/>{g.coins}</p></div>
   <div className="rounded-2xl bg-panel p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-muted">Streak</p><p className="flex items-center gap-1 text-[26px] font-bold"><Flame size={20} className="text-highlight"/>{g.streak}</p><p className="text-[12px] text-muted">correct proofs in a row</p></div>
   {trust&&<div className="col-span-2 rounded-2xl bg-panel p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-muted">{trust.name.split(" ")[0]}'s trust</p>
    <div className="relative mt-2 h-2.5 rounded-full bg-panel-2" role="meter" aria-valuemin={-3} aria-valuemax={3} aria-valuenow={trust.value} aria-label={`${trust.name.split(" ")[0]}'s trust`}><span className="absolute -top-1 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[3px] border-edge bg-deep" style={{left:`${((trust.value+3)/6)*100}%`}}/></div>
    <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-muted"><span>Wary</span><span>Friendly</span></div></div>}
  </div>
  <p className="mt-4 text-[12px] font-bold uppercase tracking-wide text-highlight">Next stop</p>
  <div className="mt-1 rounded-2xl bg-panel p-3"><p className="text-[17px] font-bold">Scene {sceneIndex+1} · {sceneLabel(world,sceneIndex)}</p><p className="text-[14px] text-muted">{scene.artifacts.length} clue{scene.artifacts.length===1?"":"s"} · {scene.available_characters.map(id=>world.characters.find(c=>c.id===id)?.name).filter(Boolean).join(" and ")||"No one to question"}</p></div>
  <button type="button" onClick={onGo} className="case-primary mt-auto min-h-[56px] w-full text-[18px]">Go to scene {sceneIndex+1} <ArrowRight size={20}/></button>
 </div>;
}

// The computer rival's emblem: a lantern or a headless rider, from the world file.
export function RivalEmblem({kind,size=84}:{kind:"lantern"|"rider";size?:number}){
 return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="rounded-full bg-violet-soft">
  {kind==="lantern"?<g><circle cx="32" cy="34" r="17" fill="#FFCF3F" opacity=".25"/><path d="M26 16h12M28 16v-4h8v4" stroke="#FFB65C" strokeWidth="2.5" fill="none" strokeLinecap="round"/><rect x="23" y="20" width="18" height="24" rx="5" fill="#FFCF3F"/><rect x="27" y="24" width="10" height="16" rx="3" fill="#FFF8EC"/><path d="M24 46h16" stroke="#FFB65C" strokeWidth="3" strokeLinecap="round"/></g>
  :<g fill="#0F141C"><path d="M14 46c4-8 12-11 20-11l8 2 6-6 2 3-4 6 3 10h-4l-3-7-6 2-9 1-5 7h-4l3-7z"/><path d="M33 34l-2-12 4-3 5 2 1 12z"/><circle cx="46" cy="24" r="3.5" fill="#FFCF3F"/></g>}
 </svg>;
}

// ---------- Rival: the face-off ----------
// auto: the 3-2-1 starts at once (a Story Mode round, after its ready card's Start). rules: what wins the face-off.
export function FaceOff({world,demo,clueName,onGo,auto=false,rules}:{world:WorldPack;demo:Demo;clueName:string;onGo:()=>void;auto?:boolean;rules?:string}){
 useScreenTop();
 const g=demo.game??newClueGame(),rival=world.computer_players?.rival??{name:"Computer rival",emblem:"lantern" as const};
 const [count,setCount]=useState<number|null>(auto?3:null);
 const go=useRef(onGo);go.current=onGo;
 useEffect(()=>{if(count===null)return;if(count===0){go.current();return}const t=setTimeout(()=>setCount(c=>(c??1)-1),reduced()?600:900);return()=>clearTimeout(t)},[count]);
 const total=Math.max(1,g.rivalWins+g.rivalLosses),share=g.rivalWins+g.rivalLosses?g.rivalWins/total:0.5;
 return <div className="case-ui mx-auto flex min-h-[calc(100dvh-96px)] max-w-xl flex-col px-4 pb-6 pt-4">
  <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-muted">Rival · {clueName}</p><Chips demo={demo}/></div>
  <h1 className="mt-3 text-center text-[28px] font-bold outline-none">Face-off</h1>
  <p className="mx-auto mt-1 max-w-sm text-center text-[15px] leading-6 text-muted">{rules??"Same claim, same passage. The right line wins the point; speed only breaks a tie. A wrong tap locks you out for 3 seconds."}</p>
  <div className="mt-5 flex items-center justify-between px-2">
   <div className="w-32 text-center"><span className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full border-4 border-edge bg-primary text-[24px] font-bold text-on-primary shadow-lg">You</span><p className="mt-2 text-[15px] font-bold">You</p><p className="text-[12px] font-semibold text-muted">{g.rivalWins} win{g.rivalWins===1?"":"s"}</p></div>
   <span className="text-[40px] font-bold italic text-highlight" aria-hidden>VS</span>
   <div className="w-32 text-center"><span className="mx-auto block h-[84px] w-[84px] overflow-hidden rounded-full border-4 border-edge shadow-lg"><RivalEmblem kind={rival.emblem}/></span><p className="mt-2 text-[15px] font-bold leading-tight">{rival.name}</p><p className="text-[12px] font-semibold text-muted">Computer rival · {g.rivalLosses} win{g.rivalLosses===1?"":"s"}</p></div>
  </div>
  <TugBar share={share} you={g.rivalWins} them={g.rivalLosses} label="Wins this story" rival={rival.name}/>
  {g.freezeHeld&&<p className="mt-3 rounded-2xl border-2 border-violet bg-violet-soft px-4 py-2 text-center text-[14px] font-bold text-ink">❄ You have a Freeze: pause {rival.name}'s taps for 5 seconds once this face-off.</p>}
  <div className="mt-6 flex flex-1 items-center justify-center">{count===null
   ?<button type="button" onClick={()=>setCount(3)} className="case-primary min-h-[56px] px-10 text-[18px]">I'm ready</button>
   :<p className="grid h-32 w-32 place-items-center rounded-full bg-deep text-[64px] font-bold tabular-nums text-ink shadow-[0_0_0_8px_var(--color-panel)]" aria-live="assertive">{Math.max(1,count)}</p>}</div>
  <p className="text-center text-[13px] text-muted">Points come from the right line, never from speed alone.</p>
 </div>;
}
export function TugBar({share,you,them,label,rival="Rival"}:{share:number;you:number;them:number;label:string;rival?:string}){
 return <div className="mt-5"><div className="relative h-5 overflow-hidden rounded-full bg-violet" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share*100)} aria-label={`${label}: you ${you}, ${rival} ${them}`}>
  <div className="h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{width:`${share*100}%`}}/><span aria-hidden className="absolute inset-y-[-3px] left-1/2 w-[3px] bg-panel"/></div>
  <div aria-hidden className="mt-1 flex justify-between text-[12px] font-bold"><span className="text-highlight">You {you}</span><span className="text-ink">{rival.replace(/^The /,"")} {them}</span></div></div>;
}

// ---------- Squad: the team huddle ----------
export type HuddleMember={id:string;name:string;job:SquadJob;part:string;status:"ready"|"answering"|"absent";computer?:boolean;me?:boolean};
export function Huddle({squad,clueName,members,progress,onGo,demo}:{squad:string;clueName:string;members:HuddleMember[];progress:{done:number;total:number};onGo:()=>void;demo:Demo}){
 useScreenTop();
 const me=members.find(m=>m.me);
 return <div className="case-ui mx-auto flex min-h-[calc(100dvh-96px)] max-w-xl flex-col px-4 pb-6 pt-4">
  <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-muted">Squad · {clueName}</p><Chips demo={demo}/></div>
  <section className="mt-3 rounded-3xl bg-deep p-4 text-ink"><p className="text-[11px] font-bold uppercase tracking-wide text-muted">Your squad</p><h1 className="text-[24px] font-bold outline-none">{squad}</h1><p className="mt-1 text-[14px] text-muted">Each of you reads a different part. Pins light up on everyone's screen.</p></section>
  <p className="mt-3 text-[12px] font-bold uppercase tracking-wide text-highlight">Squad progress</p>
  <div className="mt-1 h-3 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Clues your squad has proven"><div className="h-full bg-primary" style={{width:`${progress.total?progress.done/progress.total*100:0}%`}}/></div>
  <p className="mt-1 text-[13px] text-muted">{progress.done} of {progress.total} clues proven</p>
  <ul className="mt-3 space-y-2">{members.map(m=><li key={m.id} className={`flex items-center gap-3 rounded-2xl bg-panel p-3 ${m.status==="absent"?"opacity-70":""}`}>
   <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold bg-primary text-on-primary" style={{background:m.me?"#FF8A1F":m.computer?"#8C7CFF":"#34E0C0"}}>{m.name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
   <div className="min-w-0 flex-1"><p className="text-[15px] font-bold">{m.name}{m.me&&m.name!=="You"?" (you)":""}{m.computer?<span className="ml-1 text-[12px] font-semibold text-ink">Computer teammate</span>:null}</p><p className="text-[13px] font-semibold text-muted">{SQUAD_JOBS[m.job].name} · {m.part}</p></div>
   <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${m.status==="ready"?"bg-success-soft text-success":m.status==="answering"?"bg-gold-soft text-gold":"bg-panel-2 text-muted"}`}>{m.status==="ready"?"Ready":m.status==="answering"?"Answering":"Absent"}</span></li>)}</ul>
  {me&&<p className="mt-3 rounded-2xl bg-primary-soft px-4 py-3 text-[15px] leading-6"><b>Your job: {SQUAD_JOBS[me.job].name}.</b> {SQUAD_JOBS[me.job].does}</p>}
  <button type="button" onClick={onGo} className="case-primary mt-auto min-h-[56px] w-full text-[18px]">Read your part <ArrowRight size={20}/></button>
 </div>;
}
