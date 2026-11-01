"use client";
// The Interview and Name the Liar, live (rules: lib/interview.ts, lib/live/race.ts). The host board: each witness on
// the stage while the class votes on the question card, then the witness answers in their recorded voice with
// captions; at the finale, how many have locked in (nothing else) until the reveal: the liar, their reaction, the proof
// and the class breakdown. Each phone: vote, read the caption, lock in privately, then its own result.
import {useEffect,useRef,useState} from "react";
import {ArrowRight,Check,Lock,RotateCcw} from "lucide-react";
import type {hostView,playerView} from "@/lib/live/server";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Said} from "@/lib/interview";
import {LIAR_POINTS,proofPassages} from "@/lib/interview";
import {CharacterStage,useVoice} from "../character-stage";
import {Caption,NameTheLiar} from "../interview";
import {ReadingPanel} from "../reading-panel";
import {TimerTrack} from "../expedition-race";

type HostView=ReturnType<typeof hostView>;
type PlayerView=ReturnType<typeof playerView>;
type RaceRound=Extract<NonNullable<HostView["round"]>,{type:"race"}>;
type IvView=NonNullable<RaceRound["interview"]>;
export const interviewBeat=(beat:string)=>beat==="vote"||beat==="testify"||beat==="liar"||beat==="verdict";
const asSaid=(iv:IvView):Said[]=>iv.said.map(s=>({...s,lied:false,gesture:null}));

// ---------- The host board ----------
export function InterviewHost({state,round,world,act,left,totalMs}:{state:HostView;round:RaceRound;world:WorldPack|null;act:(b:Record<string,unknown>)=>void;left:number|null;totalMs:number|null}){
 const iv=round.interview!,race=state.race!,voice=useVoice(),played=useRef("");
 const [gesture,setGesture]=useState<{clip:"laughing"|"head-shake";key:number}|null>(null);
 const k=round.step,w=iv.witnesses[iv.witness??0],players=state.counters.players;
 const key=`${round.step}:${round.beat}`;
 // The board speaks: the statement while the witness testifies, the caught line at the reveal; then the host moves on.
 function speak(){const v=race.voice;if(!v)return;if(v.gesture)setGesture({clip:v.gesture,key:Date.now()});voice.play(v.src)}
 useEffect(()=>{if(played.current===key)return;played.current=key;voice.stop();setGesture(null);if(round.beat==="testify"||round.beat==="verdict")speak()},[key]);// eslint-disable-line react-hooks/exhaustive-deps
 const stage=(character:string,height:number)=>{const c=iv.witnesses.find(x=>x.character===character);return <CharacterStage model={c?.model??null} portrait={c?.portrait??null} name={c?.name??character} clip={voice.playing?"talking":"idle"} gesture={gesture} level={voice.level} height={height}/>};
 const next=(label:string)=><button type="button" onClick={()=>act({action:"race.next"})} className="host-btn">{label} <ArrowRight size={22} aria-hidden/></button>;
 const title=round.beat==="vote"||round.beat==="testify"?`The Interview · witness ${k+1} of ${iv.witnesses.length}`:round.beat==="liar"?"Name the Liar":"The verdict";
 return <section className="mt-4" aria-labelledby="iv-host-h">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="iv-host-h" className="text-[clamp(24px,2.4vw,38px)] font-bold">{title}</h2>
   {round.beat==="vote"&&next("Ask this question")}{round.beat==="testify"&&next(k+1>=iv.witnesses.length?"Start reading":"Next witness")}{round.beat==="liar"&&next("Reveal the liar")}{round.beat==="verdict"&&next("Final podium")}</div>
  <p className="text-[18px] text-muted">{round.expedition.title} · One witness is lying. Listen closely.</p>
  {left!==null&&totalMs!==null&&<div className="mt-2"><TimerTrack left={left} seconds={totalMs/1000}/></div>}
  {state.session.paused&&<p role="status" className="mt-2 rounded-card bg-gold px-4 py-2 text-[18px] font-bold text-on-gold">Paused. Everyone stays on this screen.</p>}
  {(round.beat==="vote"||round.beat==="testify")&&w&&<div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start">
   {stage(w.character,440)}
   <div className="flex flex-col gap-3"><p className="font-display text-[clamp(26px,2.6vw,40px)] font-bold">{w.name}</p>
    {round.beat==="vote"?<><p className="text-[20px] text-muted">{race.answered} of {players} voted · which question should we ask?</p>
      <ol className="grid gap-3">{w.cards.map((c,i)=>{const n=iv.votes[k]?.[i]??0,total=Math.max(1,(iv.votes[k]?.[0]??0)+(iv.votes[k]?.[1]??0));return <li key={i} className="relative overflow-hidden rounded-card bg-panel px-5 py-4 text-[clamp(18px,1.8vw,28px)] font-bold">
       <span aria-hidden className="absolute inset-y-0 left-0 bg-highlight/25 transition-[width] duration-500" style={{width:`${(n/total)*100}%`}}/><span className="relative">{String.fromCharCode(65+i)}. {c}</span><span className="relative float-right tabular-nums">{n}</span></li>})}</ol></>
     :<><p className="rounded-card bg-violet-soft px-5 py-3 text-[clamp(18px,1.7vw,26px)] font-bold">The class asked: {iv.said[k]?.card}</p>
      {iv.said[k]&&<div className="text-[clamp(18px,1.8vw,28px)]"><Caption name={w.name} text={iv.said[k].text}/></div>}
      <button type="button" onClick={speak} disabled={!!voice.playing} className="host-btn-secondary w-fit"><RotateCcw size={20} aria-hidden/>Play it again</button></>}
   </div></div>}
  {round.beat==="liar"&&<div className="mt-4"><p className="font-display text-[clamp(26px,2.8vw,44px)] font-bold" aria-live="polite"><Lock size={30} className="mr-2 inline" aria-hidden/>{race.answered} of {players} locked in</p>
   <p className="text-[20px] text-muted">Every phone names the liar and taps the line that proves it. Nothing shows until everyone has locked in.</p>
   <ul className="mt-4 grid gap-3 md:grid-cols-3">{iv.said.map(s=>{const c=iv.witnesses.find(x=>x.character===s.character);return <li key={s.character} className="rounded-card bg-panel p-5">
    <div className="flex items-center gap-3">{c?.portrait?<img src={c.portrait} alt="" className="h-16 w-16 rounded-full object-cover"/>:null}<p className="font-display text-[24px] font-bold">{s.name}</p></div>
    <p className="mt-2 text-[clamp(16px,1.5vw,22px)]">"{s.text}"</p></li>})}</ul></div>}
  {round.beat==="verdict"&&iv.verdict&&<div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start">
   {stage(iv.verdict.liar,440)}
   <div className="flex flex-col gap-3">
    <div className="moment-pop rounded-[24px] bg-gold p-5 text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]"><p className="text-[14px] font-extrabold uppercase tracking-[.08em]">The liar</p><p className="font-display text-[clamp(32px,3.4vw,54px)] font-bold leading-none">{iv.verdict.name}</p>
     <p className="mt-2 text-[20px] font-bold">{iv.verdict.breakdown.solved} of {iv.verdict.breakdown.total} solved the case ({iv.verdict.breakdown.pct}%)</p></div>
    <div className="text-[clamp(18px,1.7vw,26px)]"><Caption name={iv.verdict.name} text={iv.verdict.caught}/></div>
    <Caption live={false} name={`${iv.verdict.name} said`} text={iv.verdict.lieText}/>
    <p className="text-[14px] font-extrabold uppercase tracking-[.08em] text-highlight">The proof</p>
    {iv.callPassages&&<ReadingPanel passages={proofPassages(iv.callPassages,iv.verdict.lieLines[0]) as SourcePassage[]} glossary={world?.glossary} results={iv.verdict.lieLines.slice(0,1).map(l=>({line:l,ok:true}))} onTap={()=>{}} locked className="max-h-[36vh]"/>}
    <div className="rounded-card bg-panel p-5"><p className="text-[20px] font-bold">Who the class named</p>
     <ul className="mt-2 grid gap-2">{iv.verdict.breakdown.named.map(n=>{const c=iv.witnesses.find(x=>x.character===n.character),pct=iv.verdict!.breakdown.total?Math.round(n.count/iv.verdict!.breakdown.total*100):0,right=n.character===iv.verdict!.liar;return <li key={n.character} className="relative overflow-hidden rounded-row bg-panel-2 px-4 py-2 text-[20px] font-bold">
      <span aria-hidden className={`absolute inset-y-0 left-0 ${right?"bg-gold/40":"bg-highlight/20"}`} style={{width:`${pct}%`}}/><span className="relative">{c?.name}{right?" (the liar)":""}</span><span className="relative float-right tabular-nums">{n.count} · {pct}%</span></li>})}</ul></div>
   </div></div>}
 </section>;
}

// ---------- The phone ----------
export function InterviewPlayer({state,world,act,left,myMs}:{state:PlayerView;world:WorldPack;act:(k:string,p?:Record<string,unknown>)=>Promise<string|null>|void;left:number|null;myMs:number|null}){
 const round=state.round as RaceRound,iv=round.interview!,me=state.race?.interview;
 const k=round.step,w=iv.witnesses[iv.witness??0];
 if(round.beat==="vote"&&w)return <section aria-labelledby="ivp-h" className="mt-3 flex flex-col gap-3">
  {left!==null&&myMs!==null&&<TimerTrack left={left} seconds={myMs/1000}/>}
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">The Interview · witness {k+1} of {iv.witnesses.length}</p>
  <h1 id="ivp-h" className="text-[28px] leading-tight outline-none">What should we ask {w.name}?</h1>
  <p className="text-[16px] text-muted">One witness will lie. Vote for a question; the most votes wins.</p>
  <div className="grid gap-2.5">{w.cards.map((c,i)=><button key={i} type="button" aria-pressed={me?.voted===i} disabled={me?.voted!=null} onClick={()=>act("interview_vote",{card:i})} className={`min-h-[64px] rounded-[18px] px-4 text-left text-[17px] font-bold ${me?.voted===i?"bg-gold text-on-gold":"bg-panel text-ink"}`}>{c}</button>)}</div>
  {me?.voted!=null&&<p role="status" className="rounded-card bg-success px-4 py-3 text-[17px] font-bold text-on-success"><Check size={18} className="mr-1 inline" aria-hidden/>Voted. Eyes on the board.</p>}
 </section>;
 if(round.beat==="testify"&&w)return <section aria-labelledby="ivp-h" className="mt-3 flex flex-col gap-3">
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">The Interview · witness {k+1} of {iv.witnesses.length}</p>
  <h1 id="ivp-h" className="text-[28px] leading-tight outline-none">{w.name} answers</h1>
  {w.portrait&&<img src={w.portrait} alt="" className="mx-auto h-28 w-28 rounded-full object-cover"/>}
  <p className="rounded-card bg-violet-soft px-4 py-3 text-[16px] font-bold">The class asked: {iv.said[k]?.card}</p>
  {iv.said[k]&&<Caption name={w.name} text={iv.said[k].text}/>}
  <p className="text-[15px] text-muted">Listen on the board. One of the three witnesses is lying.</p>
 </section>;
 if(round.beat==="liar")return <div className="mt-3"><NameTheLiar world={world} said={asSaid(iv)} passages={iv.callPassages??[]} locked={!!me?.locked} seconds={myMs?Math.round(myMs/1000):undefined} left={left} onLock={a=>act("liar_lock",{liar:a.liar,line:a.line})}/></div>;
 if(round.beat==="verdict"&&iv.verdict){const r=me?.result,v=iv.verdict;
  return <section aria-labelledby="ivp-h" className="mt-3 flex flex-col gap-3" aria-live="assertive">
   {r?.solved?<div className="flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{LIAR_POINTS.toLocaleString()}</p>
     <div className="moment-pop w-full rounded-[24px] bg-gold p-5 text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Name the Liar</p><h1 id="ivp-h" className="mt-1 text-[40px] leading-none outline-none">Case solved<span className="sr-only">. Plus {LIAR_POINTS} points.</span></h1><p className="mt-2 text-[17px] font-bold">{v.name} lied, and you proved it.</p></div></div>
    :<div className="rounded-[24px] bg-notyet p-5 text-on-notyet shadow-[0_8px_0_var(--color-notyet-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Name the Liar</p><h1 id="ivp-h" className="mt-1 text-[36px] leading-none outline-none">Not this time.</h1>
     <p className="mt-2 text-[17px] font-bold">{r?.named?`You named ${v.name}, but that line doesn't prove it.`:`The liar was ${v.name}.`} It's in your Refresher.</p></div>}
   <Caption live={false} name={`${v.name} said`} text={v.lieText}/>
   <p className="text-[13px] font-extrabold uppercase tracking-[.08em] text-highlight">{r?.solved?"The proof":"Here's the proof"}</p>
   {iv.callPassages&&<ReadingPanel passages={proofPassages(iv.callPassages,v.lieLines[0]) as SourcePassage[]} glossary={world.glossary} results={v.lieLines.slice(0,1).map(l=>({line:l,ok:true}))} onTap={()=>{}} locked className="max-h-[40dvh]"/>}
   <p className="text-[15px] font-bold text-muted">{v.breakdown.solved} of {v.breakdown.total} in the class solved it.</p>
  </section>}
 return null;
}
