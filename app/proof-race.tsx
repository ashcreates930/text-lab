"use client";
// Proof Race screens: the pieces the live host board, the phones and the solo game share (the chunk to read, its Words
// to Know and narration, the Gist check, "Your question", the race panel, the animated leaderboard and the podium), and
// the solo game against the Lantern Ghost for demo visitors. The rules are in lib/proof-race.ts.
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,Check,Crown,Hand,Star,Timer,Volume2,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {DEFAULT_RACE,PROCESS_SECONDS,gistPoints,raceChunks,raceBoard,raceLimitMs,raceTap,rivalPlay,type BoardRow,type RaceChunk} from "@/lib/proof-race";
import {wordsToKnow} from "@/lib/fair-play";
import {narrationFile,playNarration} from "@/lib/narration";
import {Pill} from "./game-ui";
import {LEGACY_MODES} from "@/lib/feature-flags";
import {screenBoardText} from "@/lib/safety";
import {lineWords} from "@/lib/lies";
import {ReadingPanel,WordCards} from "./reading-panel";
import {RivalEmblem} from "./mode-screens";
import {browserNarration,soundChannel} from "./sound-player";
import {focusScreenTop} from "./screen-focus";
import {useSoundPref} from "./game-feel";

export const reducedMotion=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
// A short sound cue, only when sound is on.
export function cue(on:boolean,name:string,volume=0.4){if(!on)return;try{const a=new Audio(`/sounds/story/${name}.mp3`);a.volume=volume;a.play().catch(()=>{})}catch{}}

// Seconds left in a beat that started at startedAt (null when there's no limit).
export function useBeatClock(startedAt:string|number,seconds:number|null){
 const start=typeof startedAt==="number"?startedAt:Date.parse(startedAt);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{if(seconds===null)return;setNow(Date.now());const t=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(t)},[start,seconds]);
 return seconds===null?null:Math.max(0,seconds-(now-start)/1000);
}
export function ClockBar({left,seconds,label}:{left:number|null;seconds:number;label?:string}){
 if(left===null)return <p className="flex items-center gap-2 text-[15px] font-semibold"><Timer size={16} aria-hidden/>No timer</p>;
 return <div className="flex items-center gap-2"><Timer size={18} className="text-muted" aria-hidden/><div aria-hidden className="h-3 flex-1 overflow-hidden rounded-full bg-panel"><div className={`h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none ${left<=5?"bg-notyet":"bg-primary"}`} style={{width:`${(left/seconds)*100}%`}}/></div><span className="w-11 text-right font-display text-[17px] font-bold tabular-nums">{Math.ceil(left)}s</span>{label&&<span className="sr-only">{label}</span>}</div>;
}

// ---------- Read ----------
// The chunk alone, large, with its Words to Know and a Listen button (the narration file when there is one, otherwise
// the device's reading voice).
export function ChunkRead({world,sceneId,passages,size="phone",dark=false}:{world:WorldPack;sceneId:string;passages:{id:string;text:string}[];size?:"phone"|"board";dark?:boolean}){
 const words=useMemo(()=>wordsToKnow(passages as SourcePassage[],world.glossary),[passages,world.glossary]);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>()=>soundChannel.stop(),[]);
 async function listen(){if(playing){soundChannel.stop();setPlaying(false);return}setPlaying(true);await playNarration(soundChannel,`race:${passages[0]?.id}`,passages.map(p=>({id:p.id,text:p.text,src:narrationFile(world.id,sceneId,p.id)})),browserNarration);setPlaying(false)}
 return <div className="reading-scope reading-card">
  <div className="flex items-center justify-between gap-2 border-b border-edge px-4 py-2"><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Read this chunk</p>
   <button type="button" onClick={listen} aria-pressed={playing} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-deep px-3 font-display text-[15px] font-semibold"><Volume2 size={16} aria-hidden/>{playing?"Stop":"Listen"}</button></div>
  {words.length>0&&<WordCards words={words}/>}
  <div className={`px-5 py-4 font-serif font-normal text-reading-ink ${size==="board"?"text-[clamp(22px,2.2vw,36px)] leading-[1.6]":"text-[19px] leading-[1.7]"}`}>{passages.map(p=><p key={p.id} className="mb-3 last:mb-0"><span className="mr-2 font-sans text-[13px] font-bold text-muted">¶{Number(p.id.slice(1))}</span>{p.text.replace(/\s+/g," ")}</p>)}</div>
 </div>;
}

// ---------- Process ----------
export function GistPick({options,picked,best,onPick,disabled}:{options:string[];picked:number|null;best?:number|null;onPick:(i:number)=>void;disabled?:boolean}){
 return <fieldset className="mt-3"><legend className="text-[18px] font-bold">Gist: which is the best summary?</legend>
  <div className="mt-2 grid gap-2">{options.map((o,i)=>{const on=picked===i,shown=best!=null&&picked!==null;const right=shown&&i===best;
   return <button key={i} type="button" disabled={disabled||picked!==null} aria-pressed={on} onClick={()=>onPick(i)} className={`flex min-h-[56px] items-center gap-3 rounded-row border-[3px] px-4 py-3 text-left text-[16px] font-bold leading-snug transition-transform active:translate-y-[2px] motion-reduce:transition-none ${right?"border-success bg-success text-on-success":on?"border-notyet bg-notyet-soft text-ink":"border-edge bg-panel text-ink hover:border-primary"}`}>{right&&<Check size={18} aria-label="best"/>}{shown&&on&&!right&&<X size={18} aria-label="not the best"/>}{o}</button>})}</div>
 </fieldset>;
}
export function QuestionAsk({sent,onSend}:{sent:boolean;onSend:(text:string)=>Promise<string|null>|string|null}){
 const [text,setText]=useState(""),[error,setError]=useState("");
 if(sent)return <p role="status" className="mt-3 rounded-card bg-success px-4 py-3 text-[17px] font-bold text-on-success">Your question is in. Your teacher may pick it for discussion.</p>;
 return <div className="mt-3"><label htmlFor="race-q" className="text-[18px] font-bold">Your question: what do you wonder about this chunk?</label>
  <textarea id="race-q" value={text} onChange={e=>setText(e.target.value)} maxLength={200} rows={2} className="mt-2 w-full rounded-row border-2 border-edge bg-panel-2 px-4 py-3 text-[17px] focus:border-highlight" placeholder="I wonder why…"/>
  {error&&<p role="alert" className="mt-1 text-[15px] font-semibold text-notyet">{error}</p>}
  <button type="button" disabled={text.trim().length<3} onClick={async()=>{const e=await onSend(text.trim());if(e)setError(e)}} className="case-primary mt-2 min-h-[48px] w-full justify-center disabled:opacity-40">Send my question</button></div>;
}

// ---------- Leaderboard and podium ----------
// The top 5, reordered with a short slide from each row's old place ("up 2"); a static list with reduced motion.
// own: the student's row when it isn't in the top 5 (shown under them, with its rank).
export function Leaderboard({rows,meId,dark=false,title="Leaderboard",main=false,own}:{rows:BoardRow[];meId?:string|null;dark?:boolean;title?:string;main?:boolean;own?:BoardRow|null}){
 const top=rows.slice(0,5);const [settled,setSettled]=useState(false);
 // The slide-in runs once per new standings, not on every re-render (the countdown re-renders the screen 10 times a second).
 const standings=rows.map(r=>`${r.id}:${r.points}:${r.rank}:${r.prevPos??r.prevRank}`).join("|");
 useLayoutEffect(()=>{setSettled(false);if(reducedMotion()){setSettled(true);return}const t=requestAnimationFrame(()=>requestAnimationFrame(()=>setSettled(true)));return()=>cancelAnimationFrame(t)},[standings]);
 const below=own&&!top.some(r=>r.id===own.id)?own:null;
 const row=dark?64:56;
 return <section aria-labelledby="lb-h" className={dark?"":"mt-4"}>{(()=>{const H=main?"h1":"h2";return <H id="lb-h" className={`${dark?"text-[clamp(24px,2.4vw,36px)]":"text-[22px]"} font-bold outline-none`}>{title}</H>})()}
  <ol className="relative mt-3" style={{height:top.length*(row+8)}}>{top.map((r,k)=>{const was=r.prevPos??(r.prevRank===null?null:r.prevRank-1),from=was!==null&&was>=0?(Math.min(was,top.length)-k)*(row+8):0;
   const me=r.id===meId,tile=["bg-violet text-on-violet","bg-success text-on-success","bg-gold text-on-gold","bg-notyet text-on-notyet","bg-primary text-on-primary"][k%5];
   return <li key={r.id} className={`absolute inset-x-0 flex items-center gap-3 rounded-button px-3 ${me?"bg-primary text-on-primary shadow-[0_5px_0_var(--color-primary-shadow)]":"bg-panel text-ink"}`} style={{height:row,top:k*(row+8),transform:settled?"none":`translateY(${from}px)`,transition:settled&&!reducedMotion()?"transform .7s cubic-bezier(.2,.8,.2,1)":"none"}}>
    <span className={`w-8 text-center font-display font-bold tabular-nums ${dark?"text-[30px]":"text-[22px]"}`}>{r.rank}</span>
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-row font-display font-bold ${dark?"h-12 w-12 text-[24px]":"h-10 w-10 text-[20px]"} ${me?"bg-reading text-reading-ink":tile}`}>{r.name.slice(0,1)}</span>
    <span className="flex min-w-0 flex-1 flex-col"><span className={`truncate font-display font-semibold ${dark?"text-[clamp(20px,2vw,30px)]":"text-[18px]"}`}>{r.name}</span>
     <span className={`text-[13px] font-extrabold ${me?"":r.move>0?"text-success":r.move<0?"text-notyet":"text-muted"}`}>{r.move>0?`Up ${r.move}`:r.move<0?`Down ${-r.move}`:r.prevRank===null?"":`Held #${r.rank}`}</span></span>
    <span className={`font-display font-bold tabular-nums ${dark?"text-[clamp(22px,2.2vw,32px)]":"text-[20px]"}`}>{r.points.toLocaleString()}</span></li>})}</ol>
  {below&&<p className="mt-2 flex items-center gap-3 rounded-button bg-primary px-3 text-on-primary shadow-[0_5px_0_var(--color-primary-shadow)]" style={{minHeight:row}}><span className="w-8 text-center font-display text-[22px] font-bold tabular-nums">{below.rank}</span><span className="flex min-w-0 flex-1 flex-col"><span className="truncate font-display text-[18px] font-semibold">{below.name} (you)</span><span className="text-[13px] font-extrabold">{below.move>0?`Up ${below.move}`:below.move<0?`Down ${-below.move}`:below.prevRank===null?"":`Held #${below.rank}`}</span></span><span className="font-display text-[20px] font-bold tabular-nums">{below.points.toLocaleString()}</span></p>}
 </section>;
}
export type PodiumEntry={id:string;name:string;points:number;portrait?:string|null};
export function Podium({entries,dark=false,sound=false,title="Top detectives",main=false}:{entries:PodiumEntry[];dark?:boolean;sound?:boolean;title?:string;main?:boolean}){
 const [shown,setShown]=useState(reducedMotion()?3:0);
 useEffect(()=>{if(reducedMotion())return;cue(sound,"celebrate",0.5);const ts=[setTimeout(()=>setShown(1),400),setTimeout(()=>setShown(2),1100),setTimeout(()=>setShown(3),1800)];return()=>ts.forEach(clearTimeout)},[sound]);
 // Third, then second, then first.
 const order=[1,0,2],heights=[200,150,120];
 return <section aria-labelledby="podium-h" className="text-center">{(()=>{const H=main?"h1":"h2";return <H id="podium-h" className={`${dark?"text-[clamp(28px,3vw,48px)]":"text-[26px]"} font-bold outline-none`}>{title}</H>})()}
  <p className="sr-only">{entries.map((e,k)=>`${k+1}: ${e.name}, ${e.points} points`).join(". ")}</p>
  <div aria-hidden className="mt-6 flex items-end justify-center gap-3">{order.map(k=>{const e=entries[k];if(!e)return null;const visible=shown>=3-k;
   return <div key={k} className="flex w-[28%] max-w-[180px] flex-col items-center" style={{opacity:visible?1:0,transform:visible?"none":"translateY(24px)",transition:reducedMotion()?"none":"all .5s ease-out"}}>
    {k===0&&<Crown size={28} className="mb-1 text-gold"/>}
    {e.portrait?<img src={e.portrait} alt="" className="h-16 w-16 rounded-button border-4 border-panel object-cover"/>:<span className="grid h-16 w-16 place-items-center rounded-button bg-reading font-display text-[26px] font-bold text-reading-ink">{e.name.slice(0,1)}</span>}
    <p className={`mt-2 w-full truncate font-display font-semibold ${dark?"text-[clamp(18px,1.8vw,26px)]":"text-[16px]"}`}>{e.name}</p><p className="font-display text-[15px] font-bold tabular-nums text-gold">{e.points.toLocaleString()}</p>
    <div className={`mt-2 grid w-full place-items-center rounded-t-[20px] font-display text-[34px] font-bold ${k===0?"bg-gold text-on-gold":k===1?"bg-violet text-on-violet":"bg-primary text-on-primary"}`} style={{height:heights[k]*(dark?1:0.6)}}>{k+1}</div></div>})}</div>
 </section>;
}

// ---------- Solo Proof Race (demo): the same beats against the Lantern Ghost ----------
type SoloBeat="read"|"process"|"race"|"reveal"|"board"|"finish";
export function ProofRaceSolo({world,passages,preset,onExit}:{world:WorldPack;passages:SourcePassage[];preset:string;onExit:()=>void}){
 const [sound]=useSoundPref("effects",preset);
 const chunks=useMemo(()=>raceChunks(world,passages,{...DEFAULT_RACE,chunks:6}),[world,passages]);
 const rivalName=world.computer_players?.rival.name??"The Lantern Ghost",emblem=world.computer_players?.rival.emblem??"lantern";
 const [k,setK]=useState(0),[beat,setBeat]=useState<SoloBeat>(chunks[0]?.samePassage?"race":"read"),[startedAt,setStartedAt]=useState(Date.now());
 const [me,setMe]=useState<number[]>([]),[ghost,setGhost]=useState<number[]>([]);
 const [gist,setGist]=useState<number|null>(null),[asked,setAsked]=useState(false),[near,setNear]=useState<string|null>(null),[tap,setTap]=useState<{line:string;result:string;points:number}|null>(null);
 const c=chunks[k];const limit=raceLimitMs(DEFAULT_RACE.seconds,"1");
 const go=(b:SoloBeat)=>{setBeat(b);setStartedAt(Date.now())};
 useLayoutEffect(()=>{focusScreenTop()},[beat,k]);
 const add=(arr:number[],set:(x:number[])=>void,pts:number)=>{const next=[...arr];next[k]=(next[k]??0)+pts;set(next)};
 const sum=(a:number[],upto=k)=>a.slice(0,upto+1).reduce((x,y)=>x+(y??0),0);
 const processLeft=useBeatClock(startedAt,beat==="process"?PROCESS_SECONDS:null),raceLeft=useBeatClock(startedAt,beat==="race"?limit/1000:null);
 // Time's up: the summary closes, or the race scores whatever was found.
 useEffect(()=>{if(beat==="process"&&processLeft===0)go("race");if(beat==="race"&&raceLeft===0&&!tap)finishRace(null)},[processLeft,raceLeft]);// eslint-disable-line react-hooks/exhaustive-deps
 function finishRace(r:{line:string;result:string;points:number}|null){const ghostPlay=rivalPlay(world.id,k,limit);setTap(r??{line:"",result:"none",points:0});add(ghost,setGhost,ghostPlay.points+(c.process==="gist"?ghostPlay.gist:0));cue(sound,r&&r.points>0?"chime":"reveal");go("reveal")}
 function tapLine(line:string){if(tap||beat!=="race")return;const r=raceTap(c,line,near?2:1,Date.now()-startedAt,limit);
  if(r.result==="near"){setNear(r.hint);return}
  add(me,setMe,r.points);finishRace({line,result:r.result,points:r.points})}
 function nextChunk(){if(k+1>=chunks.length){go("finish");return}const n=k+1;setK(n);setGist(null);setAsked(false);setNear(null);setTap(null);go(chunks[n].samePassage?"race":"read")}
 if(!c)return null;
 const names=new Map([["me","You"],["ghost",rivalName]]);
 const board=raceBoard(new Map([["me",sum(me,k-1)],["ghost",sum(ghost,k-1)]]),new Map([["me",sum(me)],["ghost",sum(ghost)]]),names);
 // HUD: your score, then the race against the rival; the chunk count under it.
 const header=<div className="hud flex flex-col gap-2">
  <div className="flex flex-wrap items-center gap-2"><Pill label={`Your score ${sum(me)}`} icon={<Star size={18} className="fill-highlight text-highlight" aria-hidden/>}>{sum(me).toLocaleString()}</Pill>
   <span className="flex min-h-10 items-center gap-2 rounded-card bg-panel-2 px-3 font-display text-[15px] font-bold"><span className="h-6 w-6 overflow-hidden rounded-full"><RivalEmblem kind={emblem} size={24}/></span>You {sum(me).toLocaleString()} · {rivalName.replace(/^The /,"")} {sum(ghost).toLocaleString()}</span></div>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Proof Race · Chunk {k+1} of {chunks.length}</p></div>;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-20 pt-4">
  {header}
  {beat==="read"&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[26px] font-bold outline-none">Read</h1><p className="text-[15px] text-muted">No timer. Read the chunk, then tap Ready.</p>
   <div className="mt-3"><ChunkRead world={world} sceneId={c.sceneId} passages={c.passages}/></div>
   <button type="button" onClick={()=>go(c.process?"process":"race")} className="case-primary mt-4 min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18}/></button></section>}
  {beat==="process"&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[26px] font-bold outline-none">{c.process==="gist"?"Gist":"Your question"}</h1>
   <ClockBar left={processLeft} seconds={PROCESS_SECONDS}/>
   {c.process==="gist"&&c.gist?<GistPick options={c.gist.options} picked={gist} best={gist!==null?c.gist.best:null} onPick={i=>{setGist(i);const p=gistPoints(c,i);add(me,setMe,p);cue(sound,p?"chime":"tick")}}/>
    :<QuestionAsk sent={asked} onSend={t=>{const s=screenBoardText(t);if(s.action!=="allow")return s.message??"Try different words.";setAsked(true);return null}}/>}
   {(gist!==null||asked)&&<button type="button" onClick={()=>go("race")} className="case-primary mt-4 min-h-[52px] w-full justify-center">To the race <ArrowRight size={18}/></button>}</section>}
  {beat==="race"&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[24px] font-bold leading-tight outline-none">{c.question}</h1>
   <ClockBar left={raceLeft} seconds={limit/1000}/>
   {near?<p role="status" className="rise-in mt-2 rounded-card bg-notyet px-4 py-3 text-[16px] font-bold text-on-notyet shadow-[0_5px_0_var(--color-notyet-shadow)]"><span className="font-display text-[20px]">Near miss.</span> {near} One more try for 350.</p>:<p className="mt-2 flex items-center gap-1.5 text-[15px] font-bold text-muted"><Hand size={15} aria-hidden/>Tap the line that answers it.</p>}
   <ReadingPanel key={near??"first"} className={`mt-2 ${near?"notyet-shake":""}`} glossary={world.glossary} passages={c.passages as SourcePassage[]} kept={[]} onTap={l=>tapLine(l.text)}/></section>}
  {beat==="reveal"&&tap&&<section aria-labelledby="pr-h">{tap.points>0
   ?<div className="mt-10 flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{tap.points.toLocaleString()}</p>
    <div className="moment-pop w-full rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{tap.result==="retryRight"?"Second try":"First try"}</p><h1 id="pr-h" className="mt-1 text-[40px] leading-none outline-none">Proof!<span className="sr-only"> Plus {tap.points} points.</span></h1>
    <p className="mt-2 text-[16px] font-bold">{tap.result==="right"?"Right line, with a speed bonus.":"Found it on the retry."}</p></div></div>
   :<div className="mt-3 rounded-card bg-panel p-5"><h1 id="pr-h" className="text-[32px] leading-none outline-none">{tap.result==="none"?"Time's up":"Not this time"}</h1><p className="mt-2 text-[16px] text-muted">Here's the line that proves it.</p></div>}
   <ReadingPanel className="mt-3" glossary={world.glossary} passages={c.passages as SourcePassage[]} results={[...c.answers.map(a=>({line:a,ok:true})),...(tap.line&&!c.answers.some(a=>lineWords(a)===lineWords(tap.line))?[{line:tap.line,ok:false}]:[])]} onTap={()=>{}} locked/>
   <button type="button" onClick={()=>go("board")} className="case-primary mt-4 min-h-[52px] w-full justify-center">Leaderboard <ArrowRight size={18}/></button></section>}
  {beat==="board"&&<section><Leaderboard main rows={board} meId="me"/>
   <button type="button" onClick={nextChunk} className="case-primary mt-5 min-h-[52px] w-full justify-center">{k+1>=chunks.length?"Final results":"Next chunk"} <ArrowRight size={18}/></button></section>}
  {beat==="finish"&&<section className="mt-4"><Podium main sound={sound} entries={board.map(r=>({id:r.id,name:r.name,points:r.points}))} title="Final results"/>
   <p className="mt-6 text-center text-[16px] text-muted">Every point came from a line you proved in the story.</p>
   <button type="button" onClick={onExit} className="case-primary mt-5 min-h-[52px] w-full justify-center">{LEGACY_MODES?"Play the case":"Done"} <ArrowRight size={18}/></button></section>}
 </div>;
}
