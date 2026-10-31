"use client";
// Proof Race expeditions (rules: lib/expedition.ts). Each chunk: read (no timer) with its Words to Know, a hidden
// discovery and the optional highlighter; Gist check (20 seconds); one question (one shot, timed by type); then the
// result moment, the leaderboard (with Pause) and a countdown ring to the next chunk, all automatic. The HUD (score,
// streak, coins, sound, chunk count, seconds left) sits on every race screen. Extended time multiplies every timer and
// every automatic screen. Screen readers hear the result and the new rank before anything moves.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,Check,Flame,Highlighter,Pause,Play,Star,Timer,Volume2,VolumeX,X} from "lucide-react";
import type {ExpQuestion,QuestionType,WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {DISCOVERY_COINS,GIST_SECONDS,TESTIMONY_MS,TYPE_INFO,chunkTokens,expeditionChunks,ghostPlay,gistPoints,isDiscovery,keywordParts,limitMs,phraseRange,proofShown,scoreAnswer,screenMs,type Answer,type RaceChunk,type Token} from "@/lib/expedition";
import {raceBoard,type BoardRow} from "@/lib/proof-race";
import {contentNotes} from "@/lib/content-notes";
import {Pill} from "./game-ui";
import {ContentNote} from "./content-note";
import {ReadingPanel} from "./reading-panel";
import {Leaderboard,Podium,cue,reducedMotion,useBeatClock} from "./proof-race";
import {useSoundPref} from "./game-feel";
import {focusScreenTop} from "./screen-focus";

type Beat="read"|"gist"|"question"|"result"|"board"|"countdown"|"finish";
export type ChunkRecord={gist:number|null;answer:Answer;correct:boolean;points:number;late:boolean;coins:number;unknown:string[];discovered:boolean};
const AUTO:Partial<Record<Beat,"result"|"board"|"countdown">>={result:"result",board:"board",countdown:"countdown"};

// ---------- HUD ----------
export function RaceHud({score,streak,coins,sound,onSound,chunk,total,left,title}:{score:number;streak:number;coins:number;sound:boolean;onSound:()=>void;chunk:number;total:number;left:number|null;title?:string}){
 return <div className="hud flex flex-col gap-2">
  <div className="flex items-center gap-1.5">
   <Pill label={`Score ${score}`} icon={<Star size={16} className="fill-highlight text-highlight" aria-hidden/>}>{score.toLocaleString()}</Pill>
   <Pill label={`Streak ${streak}`} tone={streak>0?"highlight":"muted"} icon={<Flame size={16} className={streak>0?"fill-primary text-primary":"text-muted"} aria-hidden/>}>x{streak}</Pill>
   <Pill label={`${coins} coins`} icon={<span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-gold ring-2 ring-inset ring-gold-shadow"/>}>{coins}</Pill>
   <span className="flex-1"/>
   <button type="button" onClick={onSound} aria-label={sound?"Sound on":"Sound off"} aria-pressed={sound} className="grid h-11 w-11 place-items-center rounded-row bg-panel">{sound?<Volume2 size={20} aria-hidden/>:<VolumeX size={20} aria-hidden/>}</button>
  </div>
  <div className="flex items-end justify-between gap-2"><p className="font-display"><span className="block text-[22px] font-bold leading-none text-ink">Chunk {chunk} of {total}</span>{title&&<span className="text-[14px] font-semibold text-muted">{title}</span>}</p>{left!==null&&<span className="font-display text-[22px] font-bold tabular-nums text-ink" aria-hidden>{Math.ceil(left)}s</span>}</div>
 </div>;
}
export function TimerTrack({left,seconds}:{left:number|null;seconds:number}){
 if(left===null)return null;
 return <div role="timer" aria-label={`${Math.ceil(left)} seconds left`} className="h-3 overflow-hidden rounded-full bg-panel"><div className={`h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none ${left<=5?"bg-notyet":"bg-primary"}`} style={{width:`${Math.max(0,left/seconds)*100}%`}}/></div>;
}

// ---------- The chunk on the reading card ----------
// Words to Know get a soft violet highlight and a dotted underline (never color alone, never the orange of a picked
// line); a tap shows the definition. Every other word can be tapped too: the hidden discovery pays coins, and with the
// highlighter on, a tap marks a word the student doesn't know.
export type ChunkView={lines:{pid:string;index:number;text:string}[];discovery:{phrase:string;note:string}};
export function ChunkText({chunk,world,tokens,highlighter,marking,unknown,onUnknown,onDiscover,found,shown=[],large=false}:{chunk:ChunkView;world:WorldPack;tokens:Token[];highlighter?:boolean;marking?:boolean;unknown?:Set<number>;onUnknown?:(i:number)=>void;onDiscover?:()=>void;found?:boolean;shown?:number[];large?:boolean}){
 const [open,setOpen]=useState<string|null>(null);
 const vocab=useMemo(()=>{const m=new Map<number,{term:string;def:string}>();for(const g of world.glossary){const r=phraseRange(tokens,g.term);if(r)for(let k=r[0];k<=r[1];k++)m.set(k,{term:g.term,def:g.student_friendly_definition})}return m},[tokens,world.glossary]);
 const card=world.glossary.find(g=>g.term===open);
 const notes=useMemo(()=>contentNotes(world),[world]);
 const notesHere=[...new Set(chunk.lines.map(l=>l.pid))].map(p=>notes.get(p)).filter(Boolean) as string[];
 const tap=(i:number)=>{if(marking&&onUnknown){onUnknown(i);return}if(onDiscover&&isDiscovery(tokens,chunk,i))onDiscover()};
 const showSet=new Set(shown);
 let line=-1;
 return <div className="reading-scope reading-card p-4">
  {notesHere.map(n=><ContentNote key={n} text={n} className="mb-3"/>)}
  <p className="mb-2 text-[12px] font-extrabold text-muted">¶{Number(chunk.lines[0]?.pid.slice(1))}{chunk.lines.at(-1)?.pid!==chunk.lines[0]?.pid?`–${Number(chunk.lines.at(-1)!.pid.slice(1))}`:""}</p>
  <p className={`font-serif text-reading-ink ${large?"text-[clamp(22px,2.2vw,34px)] leading-[1.6]":"text-[19px] leading-[1.75]"}`}>{tokens.map(t=>{const v=vocab.get(t.i),brk=t.line!==line;line=t.line;const isUnknown=unknown?.has(t.i),isShown=showSet.has(t.i);
   const cls=`${isShown?"rounded bg-line-right px-0.5 outline outline-2 outline-line-right-edge":isUnknown?"rounded bg-gold-soft underline decoration-gold-shadow decoration-[3px] underline-offset-4":""}`;
   return <span key={t.i}>{brk&&t.i>0?" ":t.i>0?" ":""}{v&&!marking
    ?<button type="button" onClick={()=>{setOpen(o=>o===v.term?null:v.term);tap(t.i)}} aria-expanded={open===v.term} className={`rounded bg-violet-soft px-0.5 underline decoration-dotted decoration-2 underline-offset-4 ${cls}`}>{t.text}<span className="sr-only"> (word to know)</span></button>
    :<span onClick={()=>tap(t.i)} className={`${marking?"cursor-pointer rounded hover:bg-gold-soft":""} ${cls}`}>{t.text}</span>}</span>})}</p>
  {card&&<div role="note" aria-live="polite" className="mt-3 flex items-start justify-between gap-2 rounded-row bg-violet-soft px-3 py-2"><p className="text-[15px] leading-6 text-ink"><b>{card.term}:</b> {card.student_friendly_definition}</p><button type="button" onClick={()=>setOpen(null)} aria-label="Close the word card" className="grid h-11 w-11 shrink-0 place-items-center rounded-full"><X size={16} aria-hidden/></button></div>}
  {found&&<p role="status" className="mt-3 rounded-row bg-gold-soft px-3 py-2 text-[15px] font-bold text-ink">Discovery! +{DISCOVERY_COINS} coins. {chunk.discovery.note}</p>}
  {highlighter&&<p className="mt-2 text-[13px] text-muted">{marking?"Tap the words you don't know. They're saved for your teacher.":""}</p>}
 </div>;
}

// ---------- Answer bars, word proof ----------
export function AnswerBars({options,picked,onPick,disabled,label}:{options:{text:string}[];picked:number|null;onPick:(i:number)=>void;disabled?:boolean;label:string}){
 return <fieldset className="mt-3"><legend className="sr-only">{label}</legend><div className="grid gap-2.5">{options.map((o,i)=><button key={i} type="button" disabled={disabled} aria-pressed={picked===i} onClick={()=>onPick(i)}
  className={`flex min-h-[60px] items-center gap-3 rounded-button border-[3px] px-4 py-3 text-left text-[17px] font-bold leading-snug transition-transform active:translate-y-1 motion-reduce:transition-none ${picked===i?"border-primary bg-primary text-on-primary":"border-edge bg-panel text-ink hover:border-primary"}`}>
  <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-row font-display text-[16px] ${picked===i?"bg-on-primary text-highlight":"bg-panel-2 text-muted"}`}>{String.fromCharCode(65+i)}</span>{o.text}</button>)}</div></fieldset>;
}
export function WordProof({tokens,selected,onToggle,disabled}:{tokens:Token[];selected:number[];onToggle:(i:number)=>void;disabled?:boolean}){
 const sel=new Set(selected);
 return <div className="reading-scope reading-card mt-3 p-3"><p className="font-serif text-[18px] leading-[2.4] text-reading-ink">{tokens.map(t=><span key={t.i}>{t.i>0?" ":""}<button type="button" disabled={disabled} aria-pressed={sel.has(t.i)} onClick={()=>onToggle(t.i)} className={`-my-1 inline-block min-h-10 rounded-lg px-1 ${sel.has(t.i)?"bg-primary text-on-primary":"hover:bg-line-picked"}`}>{t.text}</button></span>)}</p></div>;
}
// The question as players see it (no best answers): built from the world for solo, sent by the server for live phones.
export type ViewQuestion={type:QuestionType;name:string;steps:1|2;prompt:string;keywords:string[];choices:string[]|null;choices2:{prompt:string;options:string[]}|null;theories:{id:string;name:string}[]|null;testimony:{speaker:string;text:string}|null;proof:"words"|"lines"|"none";callPassages:{id:string;text:string}[]|null};
export function viewQuestion(q:ExpQuestion,world:WorldPack,callPassages:{id:string;text:string}[]):ViewQuestion{
 const info=TYPE_INFO[q.type];
 return {type:q.type,name:info.name,steps:info.steps,prompt:q.prompt,keywords:q.keywords,choices:q.choices?.map(o=>o.text)??null,choices2:q.choices2?{prompt:q.choices2.prompt,options:q.choices2.options.map(o=>o.text)}:null,theories:q.theories?.map(t=>({id:t.id,name:t.name}))??null,
  testimony:q.testimony?{speaker:world.characters.find(x=>x.id===q.testimony!.speaker)?.name??"A witness",text:q.testimony.text}:null,proof:q.proof?.words?.length?"words":q.proof?.lines?.length?"lines":"none",callPassages:q.type==="make_call"?callPassages:null};
}
export function KeywordPrompt({prompt,keywords}:{prompt:string;keywords:string[]}){
 return <>{keywordParts(prompt,keywords).map((p,i)=>p.key?<mark key={i} className="rounded-md bg-highlight/25 px-1 text-ink underline decoration-highlight decoration-2 underline-offset-4">{p.text}</mark>:<span key={i}>{p.text}</span>)}</>;
}
// One question, one shot: step 1 the answer (or the call), step 2 the proof (words, a line, the meaning, or two pinned
// lines). Used by the solo race and by every phone in a live game.
export function QuestionPanel({vq,passages,tokens,glossary,testifying,draft,setDraft,step,setStep,onLock,headingId="ex-h"}:{vq:ViewQuestion;passages:{id:string;text:string}[];tokens:Token[];glossary:WorldPack["glossary"];testifying:boolean;draft:Answer;setDraft:React.Dispatch<React.SetStateAction<Answer>>;step:1|2;setStep:(s:1|2)=>void;onLock:(a:Answer)=>void;headingId?:string}){
 const twoStep=vq.steps===2,needsProofStep=twoStep&&vq.type!=="figure_it_out"&&vq.type!=="make_call";
 const pinned=draft.lines??[];
 return <>
  <p className="mt-3 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{vq.name}{twoStep?` · Step ${step} of 2`:""}</p>
  <h1 id={headingId} className="text-[24px] leading-tight outline-none"><KeywordPrompt prompt={vq.prompt} keywords={vq.keywords}/></h1>
  {vq.testimony&&<blockquote className={`mt-3 rounded-card bg-violet p-4 text-on-violet shadow-[0_6px_0_var(--color-violet-shadow)] ${reducedMotion()?"":"rise-in"}`}><p className="text-[12px] font-extrabold uppercase tracking-[.08em]">{vq.testimony.speaker} testifies</p><p className="mt-1 text-[17px] font-bold leading-snug">“{vq.testimony.text}”</p>{testifying&&<p role="status" className="mt-2 text-[13px] font-extrabold">Listen to the whole testimony. The timer starts when it ends.</p>}</blockquote>}
  {step===1&&vq.choices&&<AnswerBars label={vq.prompt} options={vq.choices.map(t=>({text:t}))} picked={draft.choice??null} onPick={i=>{setDraft(d=>({...d,choice:i}));if(twoStep)setStep(2);else onLock({...draft,choice:i})}}/>}
  {step===1&&vq.theories&&<AnswerBars label="Your call" options={vq.theories.map(t=>({text:t.name}))} picked={vq.theories.findIndex(t=>t.id===draft.theory)} onPick={i=>{setDraft(d=>({...d,theory:vq.theories![i].id}));setStep(2)}}/>}
  {step===2&&vq.choices2&&<><p className="mt-3 font-display text-[20px] font-semibold">{vq.choices2.prompt}</p><AnswerBars label={vq.choices2.prompt} options={vq.choices2.options.map(t=>({text:t}))} picked={draft.choice2??null} onPick={i=>onLock({...draft,choice2:i})}/></>}
  {((step===2&&needsProofStep)||vq.type==="find_it"||vq.type==="catch_lie")&&!testifying&&<>
   <p className="mt-3 text-[15px] font-bold text-muted">{vq.proof==="words"?"Tap the words that prove it, then lock in.":"Tap the line that proves it, then lock in."}</p>
   {vq.proof==="words"
    ?<WordProof tokens={tokens} selected={draft.words??[]} onToggle={i=>setDraft(d=>{const w=new Set(d.words??[]);if(w.has(i))w.delete(i);else w.add(i);return {...d,words:[...w].sort((a,b)=>a-b)}})}/>
    :<ReadingPanel className="mt-2" glossary={glossary} passages={passages as SourcePassage[]} selected={draft.lines?.[0]} kept={[]} onTap={l=>setDraft(d=>({...d,lines:[l.text]}))}/>}
   <button type="button" disabled={!(draft.words?.length||draft.lines?.length)} onClick={()=>onLock(draft)} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">Lock in <ArrowRight size={18} aria-hidden/></button></>}
  {step===2&&vq.type==="make_call"&&<><p className="mt-3 text-[15px] font-bold text-muted">Pin 2 lines from the expedition that back your call ({pinned.length} of 2).</p>
   <ReadingPanel className="mt-2 max-h-[55dvh]" glossary={glossary} passages={(vq.callPassages??passages) as SourcePassage[]} kept={pinned} onTap={l=>setDraft(d=>{const ls=d.lines??[];return {...d,lines:ls.includes(l.text)?ls.filter(x=>x!==l.text):ls.length>=2?ls:[...ls,l.text]}})}/>
   <button type="button" disabled={pinned.length!==2} onClick={()=>onLock(draft)} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">Lock in my call <ArrowRight size={18} aria-hidden/></button></>}
 </>;
}
// The countdown ring to the next chunk.
export function CountdownRing({ms,total,label}:{ms:number;total:number;label:string}){
 const r=34,c=2*Math.PI*r,share=Math.max(0,Math.min(1,ms/total));
 return <div className="flex flex-col items-center gap-3"><svg width="96" height="96" viewBox="0 0 80 80" aria-hidden><circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-panel)" strokeWidth="8"/><circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-share)} transform="rotate(-90 40 40)"/><text x="40" y="47" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-display)">{Math.ceil(ms/1000)}</text></svg><p className="font-display text-[20px]">{label}</p></div>;
}

// ---------- The solo expedition ----------
export function ExpeditionRace({world,passages,expeditionId,preset,timeSetting="1",highlighter=false,onFinish,onExit}:{world:WorldPack;passages:SourcePassage[];expeditionId:string;preset:string;timeSetting?:string;highlighter?:boolean;onFinish?:(records:ChunkRecord[])=>void;onExit:()=>void}){
 const [sound,toggleSound]=useSoundPref("effects",preset);
 const chunks=useMemo(()=>expeditionChunks(world,passages,expeditionId),[world,passages,expeditionId]);
 const exp=world.expeditions?.find(e=>e.id===expeditionId);
 const rivalName=world.computer_players?.rival.name??"The Lantern Ghost";
 const [k,setK]=useState(0),[beat,setBeat]=useState<Beat>("read"),[startedAt,setStartedAt]=useState(Date.now());
 const [records,setRecords]=useState<ChunkRecord[]>([]),[ghost,setGhost]=useState<number[]>([]);
 const [gist,setGist]=useState<number|null>(null),[step,setStep]=useState<1|2>(1),[draft,setDraft]=useState<Answer>({});
 const [marking,setMarking]=useState(false),[unknown,setUnknown]=useState<Set<number>>(new Set()),[found,setFound]=useState(false);
 const [testifying,setTestifying]=useState(false),[paused,setPaused]=useState(false),[autoLeft,setAutoLeft]=useState(0);
 const c=chunks[k];const tokens=useMemo(()=>c?chunkTokens(c.lines):[],[c]);const q=c?.chunk.question;
 const go=useCallback((b:Beat)=>{setBeat(b);setStartedAt(Date.now())},[]);
 useLayoutEffect(()=>{focusScreenTop()},[beat,k,step]);
 // Timers: Gist 20 seconds; the question by its type (Catch the Lie starts after the testimony).
 const qSeconds=q?limitMs(TYPE_INFO[q.type].seconds,timeSetting)/1000:0,gSeconds=limitMs(GIST_SECONDS,timeSetting)/1000;
 const gistLeft=useBeatClock(startedAt,beat==="gist"?gSeconds:null);
 const qLeft=useBeatClock(startedAt,beat==="question"&&!testifying?qSeconds:null);
 const record=records[k];
 // Your points through a chunk: the question plus the Gist check.
 const mine=(upto:number)=>records.slice(0,upto+1).reduce((a,r,i)=>a+(r?.points??0)+(r&&r.gist!==null?gistPoints(chunks[i].chunk,r.gist):0),0);
 const score=mine(records.length-1);
 const coins=records.reduce((a,r)=>a+(r?.coins??0),0)+(found&&!record?DISCOVERY_COINS:0);
 const streak=(()=>{let s=0;for(let i=records.length-1;i>=0;i--){if(records[i]?.correct)s++;else break}return s})();

 function startChunk(n:number){setK(n);setGist(null);setStep(1);setDraft({});setMarking(false);setUnknown(new Set());setFound(false);setPaused(false);go("read")}
 function toQuestion(){setStep(1);setDraft({});const isLie=c?.chunk.question.type==="catch_lie";setTestifying(isLie);go("question")}
 // Catch the Lie: the testimony plays first (about 3 seconds, or at once with reduced motion), then its 45 seconds start.
 useEffect(()=>{if(!testifying)return;const t=setTimeout(()=>{setTestifying(false);setStartedAt(Date.now())},reducedMotion()?0:TESTIMONY_MS);return()=>clearTimeout(t)},[testifying]);
 // Gist: a pick (or time) moves on to the question after a beat.
 useEffect(()=>{if(beat!=="gist")return;if(gistLeft===0)toQuestion()},[gistLeft,beat]);// eslint-disable-line react-hooks/exhaustive-deps
 function pickGist(i:number){if(gist!==null)return;setGist(i);cue(sound,gistPoints(c.chunk,i)?"chime":"tick");setTimeout(toQuestion,reducedMotion()?200:900)}
 function lockIn(a:Answer){
  if(beat!=="question"||record)return;
  const res=scoreAnswer(q!,a,tokens,Date.now()-startedAt,limitMs(TYPE_INFO[q!.type].seconds,timeSetting));
  const g=ghostPlay(world.id+expeditionId,k,limitMs(TYPE_INFO[q!.type].seconds,timeSetting));
  const next=[...records];next[k]={gist,answer:a,correct:res.correct,points:res.points,late:res.late,coins:found?DISCOVERY_COINS:0,unknown:[...unknown].map(i=>tokens[i]?.text.replace(/[^\p{L}'-]/gu,"")).filter(Boolean),discovered:found};
  setRecords(next);setGhost(x=>{const n=[...x];n[k]=g.points+g.gist;return n});cue(sound,res.correct?"chime":"reveal");go("result");
 }
 // Time's up: whatever is picked counts, which is a miss.
 useEffect(()=>{if(beat==="question"&&qLeft===0&&!record)lockIn(draft)},[qLeft]);// eslint-disable-line react-hooks/exhaustive-deps
 // The automatic screens: result, then the leaderboard, then the countdown, then the next chunk. Pause holds them.
 const deadline=useRef(0),remaining=useRef(0);
 useEffect(()=>{const kind=AUTO[beat];if(!kind)return;remaining.current=screenMs(kind,timeSetting);deadline.current=Date.now()+remaining.current;setAutoLeft(remaining.current)},[beat,k,timeSetting]);
 useEffect(()=>{const kind=AUTO[beat];if(!kind||paused)return;deadline.current=Date.now()+remaining.current;
  const t=setInterval(()=>{const left=Math.max(0,deadline.current-Date.now());remaining.current=left;setAutoLeft(left);if(left===0){clearInterval(t);
   if(beat==="result")go("board");else if(beat==="board")go("countdown");else if(beat==="countdown"){if(k+1>=chunks.length){go("finish");onFinish?.(records)}else startChunk(k+1)}}},100);
  return()=>clearInterval(t)},[beat,paused,k]);// eslint-disable-line react-hooks/exhaustive-deps

 if(!c||!q||!exp)return null;
 const info=TYPE_INFO[q.type];
 const names=new Map([["me","You"],["ghost",rivalName]]);
 const theirs=(upto:number)=>ghost.slice(0,upto+1).reduce((a,x)=>a+(x??0),0);
 const board:BoardRow[]=raceBoard(new Map([["me",mine(k-1)],["ghost",theirs(k-1)]]),new Map([["me",mine(k)],["ghost",theirs(k)]]),names);
 const meRow=board.find(r=>r.id==="me");
 const hud=<RaceHud score={score} streak={streak} coins={coins} sound={sound} onSound={toggleSound} chunk={k+1} total={chunks.length} left={beat==="gist"?gistLeft:beat==="question"&&!testifying?qLeft:null} title={exp.title}/>;
 const shown=proofShown(q,tokens);
 // The lines a proof step taps: this chunk's, or for Make the Call every chunk of the expedition so far.
 const callPassages=chunks.slice(0,k+1).flatMap(x=>x.passages);

 return <div className="case-ui mx-auto flex max-w-2xl flex-col gap-3 px-4 pb-16 pt-3">
  {hud}
  {beat==="read"&&<section aria-labelledby="ex-h"><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Read · no timer</p><h1 id="ex-h" className="text-[28px] outline-none">Read the chunk</h1>
   {highlighter&&<button type="button" aria-pressed={marking} onClick={()=>setMarking(m=>!m)} className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold ${marking?"bg-gold text-on-gold":"bg-panel text-ink"}`}><Highlighter size={16} aria-hidden/>{marking?"Done marking":"Mark words I don't know"}</button>}
   <div className="mt-3"><ChunkText chunk={{lines:c.lines,discovery:c.chunk.discovery}} world={world} tokens={tokens} highlighter={highlighter} marking={marking} unknown={unknown} onUnknown={i=>setUnknown(s=>{const n=new Set(s);if(n.has(i))n.delete(i);else n.add(i);return n})} onDiscover={()=>{if(!found){setFound(true);cue(sound,"chime",0.3)}}} found={found}/></div>
   <button type="button" onClick={()=>go("gist")} className="case-primary mt-4 min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18} aria-hidden/></button></section>}

  {beat==="gist"&&<section aria-labelledby="ex-h"><TimerTrack left={gistLeft} seconds={gSeconds}/><p className="mt-3 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Gist check · {GIST_SECONDS} seconds</p><h1 id="ex-h" className="text-[28px] outline-none">Which is the best summary?</h1>
   <AnswerBars label="Which is the best summary?" options={c.chunk.gist.options} picked={gist} onPick={pickGist} disabled={gist!==null}/></section>}

  {beat==="question"&&<section aria-labelledby="ex-h"><TimerTrack left={testifying?qSeconds:qLeft} seconds={qSeconds}/>
   <QuestionPanel vq={viewQuestion(q,world,callPassages)} passages={c.passages} tokens={tokens} glossary={world.glossary} testifying={testifying} draft={draft} setDraft={setDraft} step={step} setStep={setStep} onLock={lockIn}/>
  </section>}

  {beat==="result"&&record&&<section aria-labelledby="ex-h" aria-live="assertive">
   {record.correct
    ?<div className="mt-8 flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{record.points.toLocaleString()}</p>
     <div className="moment-pop w-full rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{info.name}{streak>1?` · Streak x${streak}`:""}</p><h1 id="ex-h" className="mt-1 text-[40px] leading-none outline-none">Proof!<span className="sr-only"> Plus {record.points} points.</span></h1><p className="mt-2 text-[16px] font-bold">{q.why}</p></div></div>
    :<div className="notyet-shake mt-3 rounded-[24px] bg-notyet p-5 text-on-notyet shadow-[0_8px_0_var(--color-notyet-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{info.name}{record.late?" · Time's up":""}</p><h1 id="ex-h" className="mt-1 text-[36px] leading-none outline-none">Not yet.</h1><p className="mt-2 text-[17px] font-bold">You'll get another shot in the Refresher.</p></div>}
   <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[.08em] text-highlight">The proof</p>
   {shown.words.length?<div className="mt-1"><ChunkText chunk={{lines:c.lines,discovery:c.chunk.discovery}} world={world} tokens={tokens} shown={shown.words}/></div>
    :<ReadingPanel className="mt-1" glossary={world.glossary} passages={(q.type==="make_call"?callPassages:c.passages) as SourcePassage[]} results={shown.lines.map(l=>({line:l,ok:true}))} onTap={()=>{}} locked/>}
  </section>}

  {(beat==="board"||beat==="countdown")&&<section aria-labelledby="ex-h">
   <p role="status" className="sr-only">{record?.correct?`Plus ${record.points} points.`:"No points this time."} You're number {meRow?.rank} of 2.</p>
   <div className="flex items-center justify-between gap-3"><h1 id="ex-h" className="text-[28px] outline-none">{beat==="board"?"Leaderboard":"Next chunk"}</h1>
    <button type="button" onClick={()=>setPaused(p=>!p)} aria-pressed={paused} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-panel px-4 font-display text-[16px] font-semibold">{paused?<><Play size={16} aria-hidden/>Resume</>:<><Pause size={16} aria-hidden/>Pause</>}</button></div>
   <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
    <div className="rounded-[18px] bg-success p-3 text-on-success shadow-[0_5px_0_var(--color-success-shadow)]"><p className="font-display text-[24px] font-bold tabular-nums">+{(meRow?.gained??0).toLocaleString()}</p><p className="text-[13px] font-extrabold">this chunk</p></div>
    <div className="rounded-[18px] bg-gold p-3 text-on-gold shadow-[0_5px_0_var(--color-gold-shadow)]"><p className="font-display text-[24px] font-bold">{(meRow?.move??0)>0?`Up ${meRow!.move}`:(meRow?.move??0)<0?`Down ${-meRow!.move}`:`#${meRow?.rank}`}</p><p className="text-[13px] font-extrabold">now #{meRow?.rank} of 2</p></div>
    <div className="rounded-[18px] bg-panel p-3 text-ink shadow-[0_5px_0_#0B0920]"><p className="font-display text-[24px] font-bold">{record?.correct?<Check className="mx-auto" size={28} aria-hidden/>:<X className="mx-auto" size={28} aria-hidden/>}</p><p className="text-[13px] font-extrabold text-muted">{record?.correct?"found it":"missed"}</p></div>
   </div>
   {beat==="board"?<Leaderboard rows={board} meId="me" title="Top 5"/>:<div className="mt-8"><CountdownRing ms={autoLeft} total={screenMs("countdown",timeSetting)} label={k+1>=chunks.length?"Final results":`Chunk ${k+2} of ${chunks.length}`}/></div>}
   {paused&&<p className="mt-3 text-center text-[15px] text-muted">Paused. Take your time.</p>}
   {!paused&&<p aria-hidden className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-muted"><Timer size={14}/>Moving on in {Math.ceil(autoLeft/1000)}s</p>}
  </section>}

  {beat==="finish"&&<section className="mt-4"><Podium main sound={sound} entries={board.map(r=>({id:r.id,name:r.name,points:r.points}))} title="Final results"/>
   <p className="mt-6 text-center text-[16px] text-muted">Every point came from a line you proved in the story.</p>
   <button type="button" onClick={onExit} className="case-primary mt-5 min-h-[52px] w-full justify-center">Done <ArrowRight size={18} aria-hidden/></button></section>}
 </div>;
}
