"use client";
// The expedition map. A story with a world map (world_map in world.json) shows it: each expedition a region, each
// chunk a stop where that part of the story happens, the student's token at the next stop, fog over locked regions,
// stars on proven stops, landmarks and secrets to find on a return visit, with a list view of the same stops. A story
// without one shows the vertical trail of expeditions. Both keep the rank and skill badges. Rules:
// lib/expedition-progress.ts and lib/world-map.ts.
import {useEffect,useLayoutEffect,useMemo,useState} from "react";
import {ArrowLeft,ArrowRight,Award,CalendarDays,Check,Crown,List,Lock,Map as MapIcon,Medal,Sparkles,Star,TrendingUp,X,Zap} from "lucide-react";
import {evidenceFrom,levelHistory,masteryOf} from "@/lib/mastery";
import {SkillPage} from "./skill-feedback";
import type {WorldPack} from "@/lib/world-schema";
import {expeditionMap,rankFor,RANKS,skillBadges,type ExpeditionAttempt} from "@/lib/expedition-progress";
import {secretOf,tokenAt,worldMapView,type MapRegionView,type MapStopView} from "@/lib/world-map";
import {focusScreenTop} from "./screen-focus";
import {MapList,WorldMap} from "./world-map";
import {loadSecrets,saveSecret} from "./map-store";

type Auth={token:string}|null|undefined;
export function ExpeditionMap({world,attempts,assigned=[],justEarned,onStart,onBack,auth}:{world:WorldPack;attempts:ExpeditionAttempt[];assigned?:{expeditionId:string;due:string|null}[];justEarned?:string|null;onStart:(id:string)=>void;onBack:()=>void;auth?:Auth}){
 const [skillsOpen,setSkillsOpen]=useState(false);
 useLayoutEffect(()=>{if(!skillsOpen)focusScreenTop()},[skillsOpen]);
 const stops=expeditionMap(world,attempts,assigned),finished=stops.filter(s=>s.state==="proven").length;
 // My skills: the student's private levels (lib/mastery.ts); never shown on the map itself.
 if(skillsOpen)return <SkillPage skills={masteryOf(evidenceFrom(attempts))} history={levelHistory(attempts)} expeditionTitle={id=>world.expeditions?.find(e=>e.id===id)?.title??id} onBack={()=>setSkillsOpen(false)}/>;
 const rank=rankFor(finished,stops.length),badges=skillBadges(attempts);
 return <div className="case-ui mx-auto flex max-w-xl flex-col gap-4 px-4 pb-16 pt-4 md:max-w-6xl">
  <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" onClick={onBack} className="case-secondary w-fit !min-h-11"><ArrowLeft size={18} aria-hidden/>Back</button>
   <button type="button" onClick={()=>setSkillsOpen(true)} className="case-secondary w-fit !min-h-11"><TrendingUp size={18} aria-hidden/>My skills</button></div>
  <section aria-labelledby="map-h">
   <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{world.title}</p>
   <h1 id="map-h" className="text-[30px] leading-tight outline-none">{world.world_map?"Story map":"Expedition map"}</h1>
   <p className="text-[16px] text-muted">{finished} of {stops.length} expedition{stops.length===1?"":"s"} proven. Finish one to open the next.</p>
  </section>
  {justEarned&&<p role="status" className="moment-pop flex items-center gap-3 rounded-[24px] bg-gold p-4 text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]"><Medal size={32} aria-hidden/><span><span className="block text-[13px] font-extrabold uppercase tracking-[.08em]">New rank</span><span className="font-display text-[26px] font-bold leading-none">{justEarned}</span></span></p>}
  <div className="flex flex-wrap gap-2" aria-label="Ranks">{RANKS.map(r=><span key={r} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-extrabold ${r===rank?"bg-gold text-on-gold":RANKS.indexOf(r)<(rank?RANKS.indexOf(rank):-1)?"bg-panel text-ink":"bg-panel-2 text-muted"}`}><Medal size={15} aria-hidden/>{r}{r===rank?<span className="sr-only"> (your rank)</span>:null}</span>)}</div>
  {world.world_map?<StoryMap world={world} attempts={attempts} assigned={assigned} onStart={onStart} auth={auth}/>:<Trail stops={stops} onStart={onStart}/>}
  <section aria-labelledby="badges-h" className="rounded-card bg-panel p-4"><h2 id="badges-h" className="flex items-center gap-2 font-display text-[20px] font-bold"><Award size={20} aria-hidden/>Skill badges</h2>
   <ul className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{badges.map(b=><li key={b.skill} className={`rounded-row px-3 py-2 text-[14px] ${b.earned?"bg-gold text-on-gold":"bg-panel-2 text-ink"}`}><span className="block font-extrabold">{b.skill}</span><span className={b.earned?"":"text-muted"}>{b.earned?"Earned":`${Math.min(b.count,b.target)} of ${b.target}`} · {b.type}</span></li>)}</ul></section>
 </div>;
}

// The painted map, a list view of the same stops, and the panel for the region in focus.
function StoryMap({world,attempts,assigned,onStart,auth}:{world:WorldPack;attempts:ExpeditionAttempt[];assigned:{expeditionId:string;due:string|null}[];onStart:(id:string)=>void;auth?:Auth}){
 const [secrets,setSecrets]=useState<string[]>([]);
 useEffect(()=>{let live=true;loadSecrets(world.id,auth).then(s=>{if(live)setSecrets(s)});return()=>{live=false}},[world.id,auth]);
 const regions=useMemo(()=>worldMapView(world,attempts,assigned,secrets),[world,attempts,assigned,secrets]);
 const token=tokenAt(regions);
 const [focus,setFocus]=useState<string|null>(null),[view,setView]=useState<"map"|"list">("map");
 const [open,setOpen]=useState<{r:MapRegionView;s:MapStopView|"finale"}|null>(null);
 const region=regions.find(r=>r.expedition===focus)??null;
 const found=regions.flatMap(r=>r.stops).filter(s=>s.secret==="found").length,hidden=regions.flatMap(r=>r.stops).filter(s=>s.secret==="hidden").length;
 function stop(r:MapRegionView,s:MapStopView|"finale"){setFocus(r.expedition);setOpen({r,s});
  if(s!=="finale"&&s.secret==="hidden"){setSecrets(x=>[...new Set([...x,`${r.expedition}:${s.chunk}`])]);saveSecret(world.id,r.expedition,s.chunk,auth)}}
 const cur=regions.find(r=>r.state==="current");
 return <section aria-labelledby="sm-h" className="flex flex-col gap-3">
  <h2 id="sm-h" className="sr-only">The map</h2>
  <p className="text-[17px] font-bold">{cur?<>Tap your next stop to start <span className="text-highlight">Expedition {cur.number}: {cur.title}</span>, or tap any place you have been.</>:"Every expedition is proven. Tap any place to look back or play it again."}</p>
  <div className="flex flex-wrap items-center gap-2">
   <div role="group" aria-label="Show as" className="inline-flex rounded-full bg-panel p-1">
    <button type="button" aria-pressed={view==="map"} onClick={()=>setView("map")} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-bold ${view==="map"?"bg-primary text-on-primary":"text-ink"}`}><MapIcon size={16} aria-hidden/>Map</button>
    <button type="button" aria-pressed={view==="list"} onClick={()=>setView("list")} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-bold ${view==="list"?"bg-primary text-on-primary":"text-ink"}`}><List size={16} aria-hidden/>List</button>
   </div>
   {found+hidden>0&&<p className="inline-flex items-center gap-1.5 text-[14px] font-bold text-muted"><Sparkles size={15} className="text-gold" aria-hidden/>{found} of {found+hidden} secrets found{hidden?" · look for the sparkles":""}</p>}
  </div>
  {view==="map"?<WorldMap map={world.world_map!} regions={regions} focus={focus} onFocus={id=>{setFocus(id);setOpen(null)}} onStop={stop} tokens={token?[{id:"me",name:"You",at:token,me:true}]:[]} className="h-[62dvh] min-h-[340px] md:h-[min(72vh,760px)]" label={`${world.title} story map. Drag to look around; use the zoom buttons. A list of the same stops is under Show as.`}/>
   :<MapList regions={regions} focus={focus} onFocus={id=>setFocus(f=>f===id?null:id)} onStop={stop}/>}
  <Legend/>
  {region&&<RegionPanel world={world} r={region} open={open} onClose={()=>setOpen(null)} onStart={onStart}/>}
 </section>;
}

function Legend(){
 return <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-bold text-muted" aria-label="Map key">
  <li className="inline-flex items-center gap-1.5"><span aria-hidden className="h-3.5 w-3.5 rounded-full bg-primary"/>Next stop</li>
  <li className="inline-flex items-center gap-1.5"><span aria-hidden className="h-3.5 w-3.5 rounded-full bg-success"/>Proven</li>
  <li className="inline-flex items-center gap-1.5"><Lock size={13} aria-hidden/>In the fog: locked</li>
  <li className="inline-flex items-center gap-1.5"><Zap size={14} className="text-ink" aria-hidden/>Twist</li>
  <li className="inline-flex items-center gap-1.5"><Crown size={14} className="text-gold" aria-hidden/>Boss question</li>
  <li className="inline-flex items-center gap-1.5"><span aria-hidden className="font-display text-gold">?</span>Name the Liar</li>
  <li className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-gold" aria-hidden/>Secret</li>
 </ul>;
}

// The region in focus: what it is, its state, how to play it; and the stop just tapped (a secret, a landmark, a result).
function RegionPanel({world,r,open,onClose,onStart}:{world:WorldPack;r:MapRegionView;open:{r:MapRegionView;s:MapStopView|"finale"}|null;onClose:()=>void;onStart:(id:string)=>void}){
 const s=open&&open.r.expedition===r.expedition?open.s:null;
 const secret=s&&s!=="finale"&&s.secret?secretOf(world,r.expedition,s.chunk):null;
 return <section aria-labelledby="rp-h" className="rounded-card bg-panel p-4">
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Expedition {r.number} · {r.name}</p>
  <h2 id="rp-h" className="font-display text-[24px] font-bold leading-tight">{r.title}</h2>
  <p className="mt-1 text-[15px] text-muted">{r.state==="locked"?"Still in the fog. Prove the expedition before it to open this one.":r.state==="current"?`${r.stops.length} stops, then Name the Liar.`:<span className="inline-flex items-center gap-1">Proven{[0,1,2].map(i=><Star key={i} size={15} className={i<r.stars?"fill-gold text-gold":"text-muted"} aria-hidden/>)}<span className="sr-only">{r.stars} of 3 stars</span>{r.finale?.solved?" · case solved":""}</span>}
   {r.assigned&&<span className="ml-2 inline-flex items-center gap-1 font-bold text-ink"><CalendarDays size={14} aria-hidden/>Assigned{r.assigned.due?` · due ${r.assigned.due}`:""}</span>}</p>
  {s&&<div role="status" className={`mt-3 rounded-row p-3 ${secret?"moment-pop bg-gold text-on-gold":"bg-panel-2"}`}>
   <div className="flex items-start justify-between gap-2">
    {secret?<p><span className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-[.08em]"><Sparkles size={15} aria-hidden/>Secret found at stop {s!=="finale"&&s.chunk}</span>
      <span className="mt-1 block font-serif text-[18px]">"{secret.phrase}"</span><span className="mt-1 block text-[15px]">{secret.note}</span></p>
     :s==="finale"?<p className="text-[15px]"><b>Name the Liar</b> at {r.finale?.placeName}. {r.finale?.solved?"You solved this case.":r.state==="proven"?"Not solved yet: play it again to try.":"The finale of this expedition."}</p>
     :<p className="text-[15px]"><b>Stop {s.chunk}</b> · {s.placeName}. {s.state==="proven"?`${s.stars} of 3 stars.`:s.state==="next"?"This is where you start.":s.state==="ahead"?"Coming up on this expedition.":"Locked."}{s.landmark==="twist"?" A witness interrupts here.":s.landmark==="boss"?" The boss question.":""}</p>}
    <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full"><X size={18} aria-hidden/></button></div></div>}
  {r.state!=="locked"&&<button type="button" onClick={()=>onStart(r.expedition)} className="case-primary mt-3 w-full justify-center">{r.state==="current"?"Start this expedition":"Play it again"} <ArrowRight size={18} aria-hidden/></button>}
 </section>;
}

// A story without a world map: the vertical trail of expeditions.
function Trail({stops,onStart}:{stops:ReturnType<typeof expeditionMap>;onStart:(id:string)=>void}){
 return <ol className="relative flex flex-col gap-3 pl-2" aria-label="Stops">
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
  </ol>;
}
