"use client";
// The expedition map: a vertical trail of numbered stops (locked, current, proven), stars for first-try proof, the
// rank badge for expeditions finished and skill badges by question type. Rules: lib/expedition-progress.ts.
import {useLayoutEffect} from "react";
import {ArrowLeft,ArrowRight,Award,CalendarDays,Check,Lock,Medal,Star} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {expeditionMap,rankFor,RANKS,skillBadges,type ExpeditionAttempt} from "@/lib/expedition-progress";
import {focusScreenTop} from "./screen-focus";

export function ExpeditionMap({world,attempts,assigned=[],justEarned,onStart,onBack}:{world:WorldPack;attempts:ExpeditionAttempt[];assigned?:{expeditionId:string;due:string|null}[];justEarned?:string|null;onStart:(id:string)=>void;onBack:()=>void}){
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const stops=expeditionMap(world,attempts,assigned),finished=stops.filter(s=>s.state==="proven").length;
 const rank=rankFor(finished,stops.length),badges=skillBadges(attempts);
 return <div className="case-ui mx-auto flex max-w-xl flex-col gap-4 px-4 pb-16 pt-4">
  <button type="button" onClick={onBack} className="case-secondary w-fit !min-h-11"><ArrowLeft size={18} aria-hidden/>Back</button>
  <section aria-labelledby="map-h">
   <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{world.title}</p>
   <h1 id="map-h" className="text-[30px] leading-tight outline-none">Expedition map</h1>
   <p className="text-[16px] text-muted">{finished} of {stops.length} expedition{stops.length===1?"":"s"} proven. Finish one to open the next.</p>
  </section>
  {justEarned&&<p role="status" className="moment-pop flex items-center gap-3 rounded-[24px] bg-gold p-4 text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]"><Medal size={32} aria-hidden/><span><span className="block text-[13px] font-extrabold uppercase tracking-[.08em]">New rank</span><span className="font-display text-[26px] font-bold leading-none">{justEarned}</span></span></p>}
  <div className="flex flex-wrap gap-2" aria-label="Ranks">{RANKS.map(r=><span key={r} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-extrabold ${r===rank?"bg-gold text-on-gold":RANKS.indexOf(r)<(rank?RANKS.indexOf(rank):-1)?"bg-panel text-ink":"bg-panel-2 text-muted"}`}><Medal size={15} aria-hidden/>{r}{r===rank?<span className="sr-only"> (your rank)</span>:null}</span>)}</div>
  <ol className="relative flex flex-col gap-3 pl-2" aria-label="Stops">
   <span aria-hidden className="absolute bottom-6 left-[34px] top-6 w-1 rounded-full bg-panel-2"/>
   {stops.map(s=>{const locked=s.state==="locked",current=s.state==="current";return <li key={s.id} className="relative">
    <button type="button" disabled={locked} onClick={()=>onStart(s.id)} aria-label={`Expedition ${s.number}: ${s.title}. ${locked?"Locked":current?"Your next expedition":`Proven, ${s.stars} of 3 stars`}${s.assigned?`. Assigned${s.assigned.due?`, due ${s.assigned.due}`:""}`:""}`}
     className={`flex w-full items-center gap-3 rounded-[20px] p-3 text-left ${current?"bg-primary text-on-primary shadow-[0_6px_0_var(--color-primary-shadow)]":locked?"bg-panel-2 text-muted":"bg-panel text-ink"}`}>
     <span aria-hidden className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-[20px] font-bold ${current?"bg-on-primary text-highlight":locked?"bg-deep text-muted":"bg-success text-on-success"}`}>{locked?<Lock size={18}/>:s.state==="proven"?<Check size={22}/>:s.number}</span>
     <span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold uppercase tracking-[.08em] opacity-80">Expedition {s.number}{current?" · next":""}</span><span className="block font-display text-[19px] font-bold leading-tight">{s.title}</span>
      {s.assigned&&<span className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-bold"><CalendarDays size={13} aria-hidden/>Assigned{s.assigned.due?` · due ${s.assigned.due}`:""}</span>}</span>
     {s.state==="proven"&&<span aria-hidden className="flex gap-0.5">{[0,1,2].map(i=><Star key={i} size={18} className={i<s.stars?"fill-gold text-gold":"text-muted"}/>)}</span>}
     {current&&<ArrowRight size={20} aria-hidden/>}
    </button></li>})}
  </ol>
  <section aria-labelledby="badges-h" className="rounded-card bg-panel p-4"><h2 id="badges-h" className="flex items-center gap-2 font-display text-[20px] font-bold"><Award size={20} aria-hidden/>Skill badges</h2>
   <ul className="mt-2 grid grid-cols-2 gap-2">{badges.map(b=><li key={b.skill} className={`rounded-row px-3 py-2 text-[14px] ${b.earned?"bg-gold text-on-gold":"bg-panel-2 text-ink"}`}><span className="block font-extrabold">{b.skill}</span><span className={b.earned?"":"text-muted"}>{b.earned?"Earned":`${Math.min(b.count,b.target)} of ${b.target}`} · {b.type}</span></li>)}</ul></section>
 </div>;
}
