"use client";
// Proof Race screens: the pieces the live host board, the phones and the solo game share (the chunk to read, its Words
// to Know and narration, the Gist check, "Your question", the race panel, the animated leaderboard and the podium), and
// the solo game against the Lantern Ghost for demo visitors. The rules are in lib/proof-race.ts.
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,Check,Crown,Hand,Timer,Volume2,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {DEFAULT_RACE,PROCESS_SECONDS,gistPoints,raceChunks,raceBoard,raceLimitMs,raceTap,rivalPlay,type BoardRow,type RaceChunk} from "@/lib/proof-race";
import {wordsToKnow} from "@/lib/fair-play";
import {narrationFile,playNarration} from "@/lib/narration";
import {screenMessage} from "@/lib/safety";
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
 return <div className="flex items-center gap-2 text-[15px] font-bold"><Timer size={16} aria-hidden/><div aria-hidden className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E4DCCB]"><div className="h-full rounded-full bg-[#A0472C] transition-[width] duration-200" style={{width:`${(left/seconds)*100}%`}}/></div><span className="tabular-nums">{Math.ceil(left)}s</span>{label&&<span className="sr-only">{label}</span>}</div>;
}

// ---------- Read ----------
// The chunk alone, large, with its Words to Know and a Listen button (the narration file when there is one, otherwise
// the device's reading voice).
export function ChunkRead({world,sceneId,passages,size="phone",dark=false}:{world:WorldPack;sceneId:string;passages:{id:string;text:string}[];size?:"phone"|"board";dark?:boolean}){
 const words=useMemo(()=>wordsToKnow(passages as SourcePassage[],world.glossary),[passages,world.glossary]);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>()=>soundChannel.stop(),[]);
 async function listen(){if(playing){soundChannel.stop();setPlaying(false);return}setPlaying(true);await playNarration(soundChannel,`race:${passages[0]?.id}`,passages.map(p=>({id:p.id,text:p.text,src:narrationFile(world.id,sceneId,p.id)})),browserNarration);setPlaying(false)}
 return <div className={`rounded-3xl ${dark?"bg-[#FFFDF8] text-[#2A2620]":"bg-[#FFFDF8] shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]"}`}>
  <div className="flex items-center justify-between gap-2 border-b border-[#EFE8D8] px-4 py-2"><p className="text-[12px] font-bold uppercase tracking-wide text-[#8A3B23]">Read this chunk</p>
   <button type="button" onClick={listen} aria-pressed={playing} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#EFE8D8] px-3 text-[14px] font-bold"><Volume2 size={16} aria-hidden/>{playing?"Stop":"Listen"}</button></div>
  {words.length>0&&<WordCards words={words}/>}
  <div className={`px-5 py-4 font-serif ${size==="board"?"text-[clamp(22px,2.2vw,36px)] leading-[1.6]":"text-[19px] leading-[1.7]"}`}>{passages.map(p=><p key={p.id} className="mb-3 last:mb-0"><span className="mr-2 font-sans text-[13px] font-bold text-[#8A7F6E]">¶{Number(p.id.slice(1))}</span>{p.text.replace(/\s+/g," ")}</p>)}</div>
 </div>;
}

// ---------- Process ----------
export function GistPick({options,picked,best,onPick,disabled}:{options:string[];picked:number|null;best?:number|null;onPick:(i:number)=>void;disabled?:boolean}){
 return <fieldset className="mt-3"><legend className="text-[18px] font-bold">Gist: which is the best summary?</legend>
  <div className="mt-2 grid gap-2">{options.map((o,i)=>{const on=picked===i,shown=best!=null&&picked!==null;const right=shown&&i===best;
   return <button key={i} type="button" disabled={disabled||picked!==null} aria-pressed={on} onClick={()=>onPick(i)} className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] font-semibold leading-snug ${right?"bg-[#E8F2E7] text-[#2F6B3A] ring-2 ring-[#2F6B3A]":on?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"}`}>{right&&<Check size={18} aria-label="best"/>}{shown&&on&&!right&&<X size={18} aria-label="not the best"/>}{o}</button>})}</div>
 </fieldset>;
}
export function QuestionAsk({sent,onSend}:{sent:boolean;onSend:(text:string)=>Promise<string|null>|string|null}){
 const [text,setText]=useState(""),[error,setError]=useState("");
 if(sent)return <p role="status" className="mt-3 rounded-2xl bg-[#E8F2E7] px-4 py-3 text-[17px] font-semibold text-[#2F6B3A]">Your question is in. Your teacher may pick it for discussion.</p>;
 return <div className="mt-3"><label htmlFor="race-q" className="text-[18px] font-bold">Your question: what do you wonder about this chunk?</label>
  <textarea id="race-q" value={text} onChange={e=>setText(e.target.value)} maxLength={200} rows={2} className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px]" placeholder="I wonder why…"/>
  {error&&<p role="alert" className="mt-1 text-[15px] font-semibold text-[#A33B20]">{error}</p>}
  <button type="button" disabled={text.trim().length<3} onClick={async()=>{const e=await onSend(text.trim());if(e)setError(e)}} className="case-primary mt-2 min-h-[48px] w-full justify-center disabled:opacity-40">Send my question</button></div>;
}

// ---------- Leaderboard and podium ----------
// The top 5, reordered with a short slide from each row's old place ("up 2"); a static list with reduced motion.
export function Leaderboard({rows,meId,dark=false,title="Leaderboard"}:{rows:BoardRow[];meId?:string|null;dark?:boolean;title?:string}){
 const top=rows.slice(0,5);const [settled,setSettled]=useState(false);
 useLayoutEffect(()=>{setSettled(false);if(reducedMotion()){setSettled(true);return}const t=requestAnimationFrame(()=>requestAnimationFrame(()=>setSettled(true)));return()=>cancelAnimationFrame(t)},[rows]);
 const row=dark?64:56;
 return <section aria-labelledby="lb-h" className={dark?"":"mt-4"}><h2 id="lb-h" className={`${dark?"text-[clamp(24px,2.4vw,36px)]":"text-[22px]"} font-bold`}>{title}</h2>
  <ol className="relative mt-3" style={{height:top.length*(row+8)}}>{top.map((r,k)=>{const from=r.prevRank!==null&&r.prevRank<=8?(r.prevRank-r.rank)*(row+8):0;
   return <li key={r.id} className={`absolute inset-x-0 flex items-center gap-3 rounded-2xl px-4 ${r.id===meId?"bg-[#A0472C] text-white":dark?"bg-white/10":"bg-[#FFFDF8] shadow-[0_1px_8px_-4px_rgba(42,38,32,.35)]"}`} style={{height:row,top:k*(row+8),transform:settled?"none":`translateY(${from}px)`,transition:settled&&!reducedMotion()?"transform .7s cubic-bezier(.2,.8,.2,1)":"none"}}>
    <span className={`w-8 text-center font-bold tabular-nums ${dark?"text-[28px]":"text-[20px]"}`}>{r.rank}</span>
    <span className={`min-w-0 flex-1 truncate font-bold ${dark?"text-[clamp(20px,2vw,30px)]":"text-[17px]"}`}>{r.name}</span>
    {r.move>0&&<span className="rounded-full bg-[#E8F2E7] px-2 py-0.5 text-[13px] font-bold text-[#2F6B3A]">up {r.move}</span>}
    {r.move<0&&<span className="rounded-full bg-[#EFE8D8] px-2 py-0.5 text-[13px] font-bold text-[#6B6457]">down {-r.move}</span>}
    <span className={`font-bold tabular-nums ${dark?"text-[clamp(20px,2vw,30px)]":"text-[17px]"}`}>{r.points.toLocaleString()}</span></li>})}</ol>
 </section>;
}
export type PodiumEntry={id:string;name:string;points:number;portrait?:string|null};
export function Podium({entries,dark=false,sound=false,title="Top detectives"}:{entries:PodiumEntry[];dark?:boolean;sound?:boolean;title?:string}){
 const [shown,setShown]=useState(reducedMotion()?3:0);
 useEffect(()=>{if(reducedMotion())return;cue(sound,"celebrate",0.5);const ts=[setTimeout(()=>setShown(1),400),setTimeout(()=>setShown(2),1100),setTimeout(()=>setShown(3),1800)];return()=>ts.forEach(clearTimeout)},[sound]);
 // Third, then second, then first.
 const order=[1,0,2],heights=[200,150,120];
 return <section aria-labelledby="podium-h" className="text-center"><h2 id="podium-h" className={`${dark?"text-[clamp(28px,3vw,48px)]":"text-[26px]"} font-bold`}>{title}</h2>
  <p className="sr-only">{entries.map((e,k)=>`${k+1}: ${e.name}, ${e.points} points`).join(". ")}</p>
  <div aria-hidden className="mt-6 flex items-end justify-center gap-3">{order.map(k=>{const e=entries[k];if(!e)return <div key={k} className="w-[28%] max-w-[180px]"/>;const visible=shown>=3-k;
   return <div key={k} className="flex w-[28%] max-w-[180px] flex-col items-center" style={{opacity:visible?1:0,transform:visible?"none":"translateY(24px)",transition:reducedMotion()?"none":"all .5s ease-out"}}>
    {k===0&&<Crown size={28} className="mb-1 text-[#E7B54A]"/>}
    {e.portrait?<img src={e.portrait} alt="" className="h-16 w-16 rounded-full border-4 border-white object-cover"/>:<span className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-[#F4E1D6] text-[22px] font-bold text-[#8A3B23]">{e.name.slice(0,1)}</span>}
    <p className={`mt-2 w-full truncate font-bold ${dark?"text-[clamp(18px,1.8vw,26px)]":"text-[16px]"}`}>{e.name}</p><p className="text-[14px] tabular-nums opacity-80">{e.points.toLocaleString()}</p>
    <div className={`mt-2 grid w-full place-items-center rounded-t-2xl text-[30px] font-bold text-white ${k===0?"bg-[#A0472C]":k===1?"bg-[#8B8478]":"bg-[#6E4B2A]"}`} style={{height:heights[k]*(dark?1:0.6)}}>{k+1}</div></div>})}</div>
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
 const header=<div className="flex items-center justify-between gap-2"><p className="text-[12px] font-bold uppercase tracking-wide text-[#8A3B23]">Proof Race · Chunk {k+1} of {chunks.length}</p>
  <p className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold">You {sum(me).toLocaleString()} · <span className="h-5 w-5 overflow-hidden rounded-full"><RivalEmblem kind={emblem} size={20}/></span>{rivalName.replace(/^The /,"")} {sum(ghost).toLocaleString()}</p></div>;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-20 pt-4">
  {header}
  {beat==="read"&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[26px] font-bold outline-none">Read</h1><p className="text-[15px] text-[#4A4438]">No timer. Read the chunk, then tap Ready.</p>
   <div className="mt-3"><ChunkRead world={world} sceneId={c.sceneId} passages={c.passages}/></div>
   <button type="button" onClick={()=>go(c.process?"process":"race")} className="case-primary mt-4 min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18}/></button></section>}
  {beat==="process"&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[26px] font-bold outline-none">{c.process==="gist"?"Gist":"Your question"}</h1>
   <ClockBar left={processLeft} seconds={PROCESS_SECONDS}/>
   {c.process==="gist"&&c.gist?<GistPick options={c.gist.options} picked={gist} best={gist!==null?c.gist.best:null} onPick={i=>{setGist(i);const p=gistPoints(c,i);add(me,setMe,p);cue(sound,p?"chime":"tick")}}/>
    :<QuestionAsk sent={asked} onSend={t=>{const s=screenMessage(t);if(s.action!=="allow")return s.message??"Try different words.";setAsked(true);return null}}/>}
   {(gist!==null||asked)&&<button type="button" onClick={()=>go("race")} className="case-primary mt-4 min-h-[52px] w-full justify-center">To the race <ArrowRight size={18}/></button>}</section>}
  {beat==="race"&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[24px] font-bold leading-tight outline-none">{c.question}</h1>
   <ClockBar left={raceLeft} seconds={limit/1000}/>
   {near?<p role="status" className="mt-2 rounded-2xl bg-[#FFF4D6] px-4 py-2 text-[16px] font-semibold text-[#3D2E0A]">Near miss: {near} One more try for 350.</p>:<p className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-[#8A3B23]"><Hand size={15} aria-hidden/>Tap the line that answers it.</p>}
   <ReadingPanel className="mt-2" glossary={world.glossary} passages={c.passages as SourcePassage[]} kept={[]} onTap={l=>tapLine(l.text)}/></section>}
  {beat==="reveal"&&tap&&<section aria-labelledby="pr-h"><h1 id="pr-h" className="mt-2 text-[26px] font-bold outline-none">{tap.points>0?`+${tap.points.toLocaleString()}`:tap.result==="none"?"Time's up":"Not this time"}</h1>
   <p className="text-[16px] text-[#4A4438]">{tap.result==="right"?"Right line, with a speed bonus.":tap.result==="retryRight"?"Found it on the retry.":"Here's the line that proves it."}</p>
   <ReadingPanel className="mt-3" glossary={world.glossary} passages={c.passages as SourcePassage[]} results={[...c.answers.map(a=>({line:a,ok:true})),...(tap.line&&!c.answers.some(a=>lineWords(a)===lineWords(tap.line))?[{line:tap.line,ok:false}]:[])]} onTap={()=>{}} locked/>
   <button type="button" onClick={()=>go("board")} className="case-primary mt-4 min-h-[52px] w-full justify-center">Leaderboard <ArrowRight size={18}/></button></section>}
  {beat==="board"&&<section><Leaderboard rows={board} meId="me"/>
   <button type="button" onClick={nextChunk} className="case-primary mt-5 min-h-[52px] w-full justify-center">{k+1>=chunks.length?"Final results":"Next chunk"} <ArrowRight size={18}/></button></section>}
  {beat==="finish"&&<section className="mt-4"><Podium sound={sound} entries={board.map(r=>({id:r.id,name:r.name,points:r.points}))} title="Final results"/>
   <p className="mt-6 text-center text-[16px] text-[#4A4438]">Every point came from a line you proved in the story.</p>
   <button type="button" onClick={onExit} className="case-primary mt-5 min-h-[52px] w-full justify-center">Play the case <ArrowRight size={18}/></button></section>}
 </div>;
}
