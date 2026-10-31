"use client";
// Fair-play pieces shared by Story Mode and the clue screen (rules: lib/fair-play.ts): the "Not yet" screen, the points
// meter with its goal levels, marking the exact words that prove a long line, and the Prove it step.
import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,Check,Lock,PenLine} from "lucide-react";
import {NotYetMoment} from "./game-ui";
import {LEVELS,MAX_TRIES,PROVE_FRAME,levelFor,levelPoints,lineTokens} from "@/lib/fair-play";

// ---------- Not yet: a miss is never shown as success ----------
// Coral, a large "Not yet", no points, the try count and the hint. Next stays locked until the line is found; the one
// action is to try again. focusOnMount: a new screen, so focus moves to its heading.
export function NotYet({tryNo,hint,maxTries=MAX_TRIES,onTryAgain,extra}:{tryNo:number;hint:string;maxTries?:number|null;onTryAgain:()=>void;extra?:React.ReactNode}){
 const h=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{h.current?.focus()},[]);
 return <div className="mt-4"><NotYetMoment headingRef={h} eyebrow={maxTries?`Try ${tryNo} of ${maxTries}`:`Try ${tryNo}`} hint={hint} note="Find the line that proves it to continue.">
  {extra}
  <button type="button" onClick={onTryAgain} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-button bg-on-notyet font-display text-[21px] font-bold text-notyet">Try again <ArrowRight size={18}/></button>
 </NotYetMoment></div>;
}

// ---------- The points meter ----------
// "1,240 / 2,580", with the goal levels marked. Past the most (Double down), it runs over and says "Bonus".
export function PointsMeter({total,max,compact}:{total:number;max:number;compact?:boolean}){
 const level=levelFor(total,max),over=total>max;
 const share=max>0?Math.min(1,total/max):0;
 return <div className={compact?"mt-1":"mt-3"}>
  <div className={`flex items-baseline justify-between gap-2 font-semibold ${compact?"text-[13px]":"text-[14px]"}`}><span className="text-muted">Points goal{level?` · ${level.name}`:""}{over?" · Bonus":""}</span><span className="tabular-nums text-ink">{total.toLocaleString()} / {max.toLocaleString()}</span></div>
  <div className={`relative mt-1 overflow-hidden rounded-full bg-panel-2 ${compact?"h-2":"h-3"}`} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={total} aria-label={`Points: ${total} of ${max}${level?`, ${level.name}`:""}${over?", bonus":""}`}>
   <div className={`h-full rounded-full ${over?"bg-gold":"bg-primary"}`} style={{width:`${share*100}%`}}/>
   {LEVELS.map(l=><span key={l.id} aria-hidden className="absolute top-0 h-full w-0.5 bg-panel" style={{left:`${l.pct}%`}}/>)}
  </div>
 </div>;
}
// Before round 1: the most this scene is worth and the three goal levels.
export function PointsGoal({max}:{max:number}){
 return <div className="mt-4 rounded-3xl bg-panel p-5">
  <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">Points possible</p>
  <p className="mt-1 text-[32px] font-bold tabular-nums">{max.toLocaleString()}</p>
  <p className="text-[15px] text-muted">Every round right on the first try, with no power-ups.</p>
  <ul className="mt-3 grid gap-2 sm:grid-cols-3">{levelPoints(max).map(l=><li key={l.id} className="rounded-2xl bg-primary-soft px-3 py-2"><span className="block text-[15px] font-bold">{l.name}</span><span className="text-[14px] tabular-nums">{l.points.toLocaleString()} points ({l.pct}%)</span></li>)}</ul>
 </div>;
}

// ---------- Exact words ----------
// Tap the first word that proves it, then the last, or drag across the words; the words between are marked. Keyboard and screen reader users get
// buttons instead: step to a word, then "Start here" and "End here". shownRange: the authored words, shown after three
// misses (read only).
export function PhrasePicker({line,onLock,busy,shownRange}:{line:string;onLock?:(range:[number,number])=>void;busy?:boolean;shownRange?:[number,number]|null}){
 const words=useMemo(()=>lineTokens(line),[line]);
 const [start,setStart]=useState<number|null>(shownRange?.[0]??null),[end,setEnd]=useState<number|null>(shownRange?.[1]??null),[cursor,setCursor]=useState(0);
 const [buttons,setButtons]=useState(false);
 const lo=start===null?null:end===null?start:Math.min(start,end),hi=start===null?null:end===null?start:Math.max(start,end);
 const marked=(i:number)=>lo!==null&&hi!==null&&i>=lo&&i<=hi;
 const readOnly=!!shownRange;
 function tap(i:number){if(readOnly)return;if(start===null||end!==null){setStart(i);setEnd(null)}else setEnd(i)}
 // Drag: press on a word and move across others to mark them; a press without moving is a tap.
 const drag=useRef<{from:number;moved:boolean}|null>(null);
 const wordAt=(x:number,y:number)=>{const el=document.elementFromPoint(x,y)?.closest<HTMLElement>("[data-word]");return el?Number(el.dataset.word):null};
 function down(e:React.PointerEvent){if(readOnly||buttons)return;const i=wordAt(e.clientX,e.clientY);if(i===null)return;drag.current={from:i,moved:false};(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)}
 function move(e:React.PointerEvent){const d=drag.current;if(!d)return;const i=wordAt(e.clientX,e.clientY);if(i===null||(!d.moved&&i===d.from))return;d.moved=true;setStart(d.from);setEnd(i)}
 function up(e:React.PointerEvent){const d=drag.current;drag.current=null;if(!d)return;if(!d.moved){const i=wordAt(e.clientX,e.clientY);tap(i??d.from)}}
 return <div className="mt-3">
  {!readOnly&&<p className="text-[16px] font-semibold">Mark the exact words that prove it: tap the first word, then the last, or drag across them.</p>}
  <p onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{drag.current=null}} className={`mt-2 select-none rounded-2xl bg-panel p-3 font-serif text-[18px] leading-[2.6] ring-1 ring-edge ${readOnly?"":"touch-none"}`} aria-hidden={buttons||undefined}>{words.map((w,i)=><span key={i}>{i>0?" ":""}<button type="button" data-word={i} tabIndex={buttons||readOnly?-1:0} onClick={e=>{if(e.detail===0)tap(i)}} aria-pressed={marked(i)} className={`-my-1 inline-block min-h-10 min-w-8 rounded-lg px-1.5 py-1 ${marked(i)?"bg-primary text-on-primary":readOnly?"":"hover:bg-primary-soft"}`}>{w}</button></span>)}</p>
  {!readOnly&&<>
   <button type="button" onClick={()=>setButtons(v=>!v)} aria-expanded={buttons} className="mt-2 min-h-11 text-[15px] font-semibold text-highlight underline underline-offset-4">{buttons?"Use tapping instead":"Use buttons instead (keyboard or screen reader)"}</button>
   {buttons&&<div className="mt-2 rounded-2xl bg-panel-2 p-3" role="group" aria-label="Mark words with buttons">
    <p className="text-[16px]" aria-live="polite">Word {cursor+1} of {words.length}: <b>{words[cursor]}</b>{lo!==null?` · marked: “${words.slice(lo,(hi??lo)+1).join(" ")}”`:""}</p>
    <div className="mt-2 flex flex-wrap gap-2">
     <button type="button" onClick={()=>setCursor(c=>Math.max(0,c-1))} className="case-secondary !min-h-11">Previous word</button>
     <button type="button" onClick={()=>setCursor(c=>Math.min(words.length-1,c+1))} className="case-secondary !min-h-11">Next word</button>
     <button type="button" onClick={()=>{setStart(cursor);setEnd(e=>e!==null&&e<cursor?null:e)}} className="case-secondary !min-h-11">Start here</button>
     <button type="button" onClick={()=>{if(start===null)setStart(cursor);setEnd(cursor)}} className="case-secondary !min-h-11">End here</button>
    </div>
   </div>}
   <div className="mt-3 flex justify-end"><button type="button" disabled={lo===null||busy} onClick={()=>lo!==null&&onLock?.([lo,hi??lo])} className="case-primary disabled:opacity-40">Lock in these words <ArrowRight size={18}/></button></div>
  </>}
 </div>;
}

// ---------- Prove it ----------
// Pick what the line proves from 4 authored choices, or write it: "This proves ___ because ___" (saved for the teacher,
// never scored). onSubmit gets the choice, or the two blanks.
export function ProveIt({choices,onSubmit,busy,allowWriting=true}:{choices:string[]|null;onSubmit:(p:{choice?:string;proves?:string;because?:string})=>void;busy?:boolean;allowWriting?:boolean}){
 const [choice,setChoice]=useState(""),[writing,setWriting]=useState(!choices?.length),[proves,setProves]=useState(""),[because,setBecause]=useState("");
 const h=useRef<HTMLHeadingElement>(null);useEffect(()=>{h.current?.focus()},[]);
 const ready=writing?!!proves.trim()&&!!because.trim():!!choice;
 return <section aria-labelledby="prove-h" className="mt-4 rounded-3xl bg-panel p-5">
  <h2 id="prove-h" ref={h} tabIndex={-1} className="text-[22px] font-bold outline-none">Prove it: what does this line show?</h2>
  {!writing&&choices?.length?<fieldset className="mt-3"><legend className="sr-only">Pick one</legend><div className="grid gap-2">{choices.map(c=><label key={c} className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-[17px] ${choice===c?"bg-deep text-ink":"bg-primary-soft hover:bg-primary-soft"}`}><input type="radio" name="prove" value={c} checked={choice===c} onChange={()=>setChoice(c)} className="h-5 w-5 accent-primary"/>{c}</label>)}</div></fieldset>
  :<div className="mt-3 grid gap-2"><label className="text-[16px] font-semibold" htmlFor="prove-a">{PROVE_FRAME.start}…</label><input id="prove-a" value={proves} onChange={e=>setProves(e.target.value)} maxLength={300} className="min-h-12 rounded-2xl border border-edge bg-panel px-4 text-[17px]"/>
   <label className="text-[16px] font-semibold" htmlFor="prove-b">{PROVE_FRAME.middle}…</label><input id="prove-b" value={because} onChange={e=>setBecause(e.target.value)} maxLength={300} className="min-h-12 rounded-2xl border border-edge bg-panel px-4 text-[17px]"/>
   <p className="text-[14px] text-muted">Your teacher reads what you write.</p></div>}
  <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
   {allowWriting&&!!choices?.length?<button type="button" onClick={()=>setWriting(v=>!v)} className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-highlight underline underline-offset-4"><PenLine size={16}/>{writing?"Pick from choices instead":"Write it in my own words"}</button>:<span/>}
   <button type="button" disabled={!ready||busy} onClick={()=>onSubmit(writing?{proves,because}:{choice})} className="case-primary disabled:opacity-40"><Check size={18}/>Lock in my proof</button>
  </div>
 </section>;
}

// ---------- Speed (for the teacher's flags only) ----------
// How soon the first line was tapped after the passage opened, and how many times a line was swapped out before the
// lock-in. Never scored; the teacher sees the flags.
export function useSpeedMeta(){
 const opened=useRef(0),firstTap=useRef<number|null>(null),swaps=useRef(0);
 useEffect(()=>{opened.current=performance.now()},[]);
 return {
  tap(){if(firstTap.current===null)firstTap.current=Math.round(performance.now()-opened.current)},
  swap(){swaps.current+=1},
  meta(){return {firstTapMs:firstTap.current??undefined,swaps:swaps.current}},
 };
}
