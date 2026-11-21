"use client";
// The story's frame (lib/engagement.ts): the essential question and four key concepts that open the story (teasers,
// never a plot summary; that is in the teacher view only), the hard words shown at each room's door, and, at the
// last exit door, the student's own answer to the essential question, backed by lines from their Case File.
import {useState} from "react";
import {ArrowRight,BookMarked,Compass} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {InventoryItem} from "@/lib/escape-room";

// On the map (2026-11-21) the panel starts collapsed, so the map and its Continue button show without scrolling; opening
// it shows the question's note and all four key concepts (the only place all four appear; a room's briefing shows its own).
export function BigQuestion({world}:{world:WorldPack}){
 const e=world.engagement;
 const [open,setOpen]=useState(false);
 if(!e)return null;
 const toggle=()=>setOpen(o=>!o);
 return <section aria-labelledby="bq-h" className="rounded-card border-2 border-gold bg-panel px-3 py-2">
  {/* Collapsed, it is one compact line: the label and question on the left, Show on the right. */}
  <button type="button" onClick={toggle} aria-expanded={open} className="flex min-h-11 w-full items-center gap-2 text-left">
   <Compass size={18} className="shrink-0 text-gold" aria-hidden/>
   <span className="min-w-0 flex-1 leading-tight"><span className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">The big question: </span>
    <span id="bq-h" className={`font-display font-bold ${open?"text-[19px]":"text-[16px]"}`}>{e.essential_question}</span></span>
   <span className="shrink-0 text-[14px] font-bold text-muted">{open?"Hide":"Show"}</span></button>
  {open&&<><p className="mt-2 text-[15px]">Keep it in mind in every room. At the last exit door, you'll answer it with lines from your Case File.</p>
   <ul className="mt-3 grid gap-2 sm:grid-cols-2">{e.key_concepts.map(c=><li key={c.name} className="rounded-row bg-panel-2 px-3 py-2"><p className="font-display text-[17px] font-bold text-gold">{c.name}</p><p className="text-[15px] leading-snug">{c.teaser}</p></li>)}</ul></>}
 </section>;
}

// The hard words at the door: each with a plain meaning and the sentence it comes from (the word marked in it).
export function DoorVocab({vocab,lineOf,title="Words you'll meet in this room"}:{vocab:{word:string;meaning:string;line:{p:string;s:number}}[];lineOf:(r:{p:string;s:number})=>string|null;title?:string}){
 if(!vocab.length)return null;
 return <section aria-labelledby="vocab-h" className="rounded-card bg-panel p-4">
  <h2 id="vocab-h" className="flex items-center gap-2 font-display text-[19px] font-bold"><BookMarked size={18} className="text-gold" aria-hidden/>{title}</h2>
  <ul className="mt-2 flex flex-col gap-2">{vocab.map(v=>{const line=(lineOf(v.line)??"").replace(/\s+/g," ").trim(),i=line.toLowerCase().indexOf(v.word.toLowerCase());
   return <li key={v.word} className="rounded-row bg-panel-2 px-3 py-2">
    <p><b className="font-display text-[18px]">{v.word}</b><span className="text-[15px]">: {v.meaning}</span></p>
    {line&&<p className="reading-scope mt-1 rounded-row bg-reading px-2.5 py-1.5 font-serif text-[15px] leading-snug text-reading-ink">{i>=0?<>{line.slice(0,i)}<b className="font-bold underline decoration-[3px] underline-offset-4">{line.slice(i,i+v.word.length)}</b>{line.slice(i+v.word.length)}</>:line}</p>}
   </li>})}</ul>
 </section>;
}

// Question before the reading (lib/engagement.ts questionFirst): the lock's question, so the student reads to answer it.
export function ReadFor({prompt}:{prompt:string}){
 return <div className="mt-2 rounded-card border-2 border-gold bg-panel p-3"><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Read to answer this</p>
  <p className="mt-1 font-display text-[19px] font-bold leading-snug">{prompt}</p><p className="mt-1 text-[14px] font-bold text-muted">You'll pick the answer and prove it with a line after you read.</p></div>;
}

// The last exit door: answer the essential question in one or two sentences, backed by one or two Case File lines.
export type EssentialAnswer={text:string;lines:string[]};
export function EssentialAnswerScreen({world,items,onDone}:{world:WorldPack;items:InventoryItem[];onDone:(a:EssentialAnswer)=>void}){
 const e=world.engagement,[text,setText]=useState(""),[lines,setLines]=useState<string[]>([]);
 const proofs=items.filter(it=>it.kind==="proof");
 const words=text.trim().split(/\s+/).filter(Boolean).length,ok=words>=6&&lines.length>=1;
 if(!e)return null;
 return <section aria-labelledby="ex-h" className="mx-auto flex w-full max-w-xl flex-col gap-3 pt-2">
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">The last exit door</p>
  <h1 id="ex-h" tabIndex={-1} className="text-[28px] leading-tight outline-none">{e.essential_question}</h1>
  <p className="text-[16px]">Answer in one or two sentences, then pick one or two lines from your Case File that back you up.</p>
  <label htmlFor="eq-text" className="font-bold">Your answer</label>
  <textarea id="eq-text" value={text} onChange={ev=>setText(ev.target.value.slice(0,400))} rows={3} className="rounded-row border-2 border-edge bg-panel-2 p-3 text-[17px] text-ink"/>
  <p className="text-[13px] font-bold text-muted">{words<6?"Write at least a full sentence.":"Good. Now back it up."}</p>
  <fieldset className="flex flex-col gap-2"><legend className="font-bold">Lines that back you up ({lines.length} of 2)</legend>
   {proofs.length?proofs.map((it,i)=>{const on=lines.includes(it.text);return <button key={i} type="button" aria-pressed={on} onClick={()=>setLines(l=>on?l.filter(x=>x!==it.text):l.length>=2?l:[...l,it.text])}
    className={`rounded-row px-3 py-2 text-left font-serif text-[16px] leading-snug ${on?"bg-line-picked text-reading-ink shadow-[0_0_0_2px_var(--color-primary)]":"bg-reading text-reading-ink"}`}>“{it.text}”</button>}):<p className="text-[15px] text-muted">Your Case File has no proof lines yet.</p>}
  </fieldset>
  <button type="button" disabled={!ok} onClick={()=>onDone({text:text.trim(),lines})} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Save my answer and open the door <ArrowRight size={18} aria-hidden/></button>
 </section>;
}
