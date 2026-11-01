"use client";
// After the race: the Refresher (only what the student missed, up to 4, untimed, a hint, tap the proof; stars and a
// badge, never leaderboard points) and Case Notes (one entry per chunk, with space for the student's own notes, to
// print or save as a PDF). Rules: lib/case-notes.ts. Used by the solo race and by every phone after a live podium.
import {useLayoutEffect,useMemo,useState} from "react";
import {ArrowRight,Check,Download,Lightbulb,Printer,Star} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {chunkTokens,type Answer} from "@/lib/expedition";
import {caseNotesPdf,refresherAward,type CaseNote,type RefresherViewData} from "@/lib/case-notes";
import {saidLine,type InterviewNote} from "@/lib/interview";
import {AnswerBars,ChunkText,type ChunkView} from "./expedition-race";
import {SplitStage} from "./split-stage";
import {ReadingPanel} from "./reading-panel";
import {focusScreenTop} from "./screen-focus";

// One Refresher item as the screen needs it (the answers stay with whoever checks).
export type RefresherView=RefresherViewData&{chunkView:ChunkView;result?:RefresherResult|null};
type RefresherResult={fixed:boolean;shown:number[];lines:string[]};
// Solo checks here and returns the result; a live phone sends the answer and the result comes back on the item.
export type RefresherCheck=(k:number,a:Answer)=>Promise<RefresherResult|null|void>|RefresherResult;

// seed: this student's own answer order.
export function Refresher({items,world,check,onDone,seed}:{items:RefresherView[];world:WorldPack;check:RefresherCheck;onDone:(fixed:boolean[])=>void;seed?:string}){
 const [k,setK]=useState(0),[draft,setDraft]=useState<Answer>({}),[local,setLocal]=useState<RefresherResult|null>(null),[fixedLocal,setFixed]=useState<boolean[]>([]);
 const result=local??items[k]?.result??null;
 const fixed=items.map((x,i)=>x.result?x.result.fixed:fixedLocal[i]??false);
 useLayoutEffect(()=>{focusScreenTop()},[k,!!result,items.length]);
 if(!items.length)return <section aria-labelledby="rf-h" className="mt-4 flex flex-col items-center gap-4 text-center">
  <div className="moment-pop w-full rounded-[24px] bg-gold p-6 text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Refresher</p><h1 id="rf-h" className="mt-1 text-[36px] outline-none">Perfect run</h1><p className="mt-2 text-[17px] font-bold">You proved every question on the one try. Nothing to fix.</p></div>
  <button type="button" onClick={()=>onDone([])} className="case-primary w-full justify-center">Open my Case Notes <ArrowRight size={18} aria-hidden/></button></section>;
 const it=items[k];if(!it)return null;
 const tokens=chunkTokens(it.chunkView.lines);
 async function lock(a:Answer){const r=await check(k,a);if(r){setLocal(r);setFixed(f=>{const n=[...f];n[k]=r.fixed;return n})}}
 function next(){if(k+1>=items.length){onDone(fixed);return}setK(k+1);setDraft({});setLocal(null)}
 const award=refresherAward(items.map(x=>({index:x.chunk-1,kind:x.kind})),items.map((_,i)=>fixed[i]??false));
 const head=<><div className="flex items-center justify-between"><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Refresher · {k+1} of {items.length} · no timer</p><p className="flex items-center gap-1 font-display text-[18px] font-bold text-gold" aria-label={`${award.stars} stars`}>{Array.from({length:items.length},(_,i)=><Star key={i} size={18} className={fixed[i]?"fill-gold text-gold":"text-muted"} aria-hidden/>)}</p></div>
  <h1 id="rf-h" className="text-[24px] leading-tight outline-none">{it.kind==="liar"?`${it.typeName}: ${it.prompt}`:it.kind==="gist"?`Chunk ${it.chunk}: which is the best summary?`:`Chunk ${it.chunk} · ${it.typeName}: ${it.prompt}`}</h1></>;
 const hint=<p className="flex items-start gap-2 rounded-card bg-violet-soft px-4 py-3 text-[16px] font-bold"><Lightbulb size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden/>{it.hint}</p>;
 const lockBtn=(ok:boolean)=><button type="button" disabled={!ok} onClick={()=>lock(draft)} className="case-primary w-full justify-center">Lock in <ArrowRight size={18} aria-hidden/></button>;
 // The passage side: the chunk (a sentence to tap for a question's proof), or the whole expedition for Name the Liar
 // and Make the Call. After trying, the proof lights up there.
 const wide=it.kind==="liar"||it.task==="pin2";
 const passage=result
  ?(it.callPassages?<ReadingPanel passages={it.callPassages as SourcePassage[]} results={result.lines.map(l=>({line:l,ok:true}))} onTap={()=>{}} locked/>
   :<ChunkText chunk={it.chunkView} world={world} tokens={tokens} shown={result.shown} shownStyle={result.fixed?"right":"missed"}/>)
  :it.task==="pin2"?<ReadingPanel passages={(it.callPassages??it.passages) as SourcePassage[]} glossary={world.glossary} kept={draft.lines??[]} onTap={l=>setDraft(d=>{const ls=d.lines??[];return {lines:ls.includes(l.text)?ls.filter(x=>x!==l.text):ls.length>=2?ls:[...ls,l.text]}})}/>
  :wide?<ReadingPanel passages={it.passages as SourcePassage[]} glossary={world.glossary} selected={draft.lines?.[0]} kept={[]} onTap={l=>setDraft(d=>d.lines?.[0]===l.text?{}:{lines:[l.text]})}/>
  :<ChunkText chunk={it.chunkView} world={world} tokens={tokens} pick={it.task==="line"?{selected:draft.lines?.[0]??null,onPick:t=>setDraft(t?{lines:[t]}:{})}:undefined}/>;
 const body=result?<div aria-live="assertive">{result.fixed
   ?<div className="moment-pop rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">+1 star</p><p className="font-display text-[32px] font-bold leading-none">Fixed!</p></div>
   :<div className="rounded-card bg-panel p-5"><p className="font-display text-[26px] font-bold leading-none">Here's the proof</p><p className="mt-1 text-[15px] text-muted">Read it once more. It's saved in your Case Notes.</p></div>}</div>
  :<div className="flex flex-col gap-2">{hint}
   {(it.task==="gist"||it.task==="meaning")&&it.options&&<AnswerBars seed={seed?`${seed}|${it.kind}|${it.chunk}|${it.task}`:undefined} label={it.prompt} options={it.options.map(t=>({text:t}))} picked={null} onPick={i=>lock(it.task==="gist"?{choice:i}:{choice2:i})}/>}
   {it.task==="line"&&<p className="text-[15px] font-bold text-muted">Tap the sentence that proves it, then lock in.</p>}
   {it.task==="pin2"&&<p className="text-[15px] font-bold text-muted">Pin 2 lines that back one of the calls ({draft.lines?.length??0} of 2).</p>}</div>;
 const action=result?<button type="button" onClick={next} className="case-primary w-full justify-center">{k+1>=items.length?"Open my Case Notes":"Next"} <ArrowRight size={18} aria-hidden/></button>
  :it.task==="line"?lockBtn(!!draft.lines?.length):it.task==="pin2"?lockBtn((draft.lines?.length??0)===2):undefined;
 return <SplitStage key={k} label="Refresher" passage={passage} head={head} body={body} action={action} collapse={!result&&(it.task==="line"||it.task==="pin2")}/>;
}

// ---------- Case Notes ----------
const status=(n:CaseNote)=>n.rightFirstTry?{label:"Proved on the one try",cls:"bg-success text-on-success",Icon:Check}:n.fixed?{label:"Fixed in the Refresher",cls:"bg-gold text-on-gold",Icon:Star}:{label:n.fixed===false?"Not fixed yet":"Missed",cls:"bg-panel-2 text-ink",Icon:null};
export function CaseNotesView({notes,student,story,expedition,award,onNote,bonus,onDone,interview}:{notes:CaseNote[];student:string;story:string;expedition:string;award?:{stars:number;of:number;badge:string|null};onNote?:(chunk:number,text:string)=>void;bonus?:React.ReactNode;onDone?:()=>void;interview?:InterviewNote|null}){
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const file=useMemo(()=>`case-notes-${expedition.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.pdf`,[expedition]);
 function download(){caseNotesPdf(student,story,expedition,notes,interview).save(file)}
 const right=notes.filter(n=>n.rightFirstTry).length;
 return <section aria-labelledby="cn-h" className="case-notes mt-2 flex flex-col gap-3">
  <div><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{story} · {expedition}</p><h1 id="cn-h" className="text-[30px] outline-none">Case Notes</h1>
   <p className="text-[16px] text-muted">{student} · {right} of {notes.length} proved on the one try{award&&award.of>0?` · ${award.stars} of ${award.of} fixed in the Refresher`:""}</p></div>
  {award?.badge&&<p className="no-print inline-flex w-fit items-center gap-2 rounded-full bg-gold px-4 py-2 font-display text-[18px] font-bold text-on-gold"><Star size={18} className="fill-on-gold" aria-hidden/>Badge: {award.badge}</p>}
  <div className="no-print flex flex-wrap gap-2"><button type="button" onClick={()=>window.print()} className="case-secondary !min-h-11"><Printer size={18} aria-hidden/>Print</button><button type="button" onClick={download} className="case-secondary !min-h-11"><Download size={18} aria-hidden/>Download PDF</button></div>
  {interview&&<section aria-labelledby="cn-iv" className="rounded-card bg-panel p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="cn-iv" className="font-display text-[18px] font-bold">The Interview</h2>
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-extrabold ${interview.solved?"bg-gold text-on-gold":interview.fixed?"bg-gold text-on-gold":"bg-panel-2 text-ink"}`}>{interview.solved?<><Check size={14} aria-hidden/>Case solved</>:interview.fixed?<><Star size={14} aria-hidden/>Fixed in the Refresher</>:"Not solved"}</span></div>
   <ul className="mt-2 grid gap-1.5 text-[15px] leading-snug">{interview.said.map(s=><li key={s.character}>{saidLine(s)}</li>)}</ul>
   <dl className="mt-2 grid gap-1.5 text-[15px] leading-snug">
    <div><dt className="inline font-extrabold">I named: </dt><dd className="inline">{interview.pick??"no one"}{interview.line?<> · <span className="font-serif">"{interview.line.replace(/\s+/g," ")}"</span></>:null}</dd></div>
    <div><dt className="inline font-extrabold">The liar: </dt><dd className="inline">{interview.liar}</dd></div>
    <div><dt className="inline font-extrabold">The proof: </dt><dd className="inline font-serif">{interview.lieLines.map(l=>`"${l.replace(/\s+/g," ")}"`).join(" ")}</dd></div>
   </dl></section>}
  <ol className="flex flex-col gap-3">{notes.map(n=>{const s=status(n);return <li key={n.chunk} className="rounded-card bg-panel p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-display text-[18px] font-bold">Chunk {n.chunk} · {n.type}</p><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-extrabold ${s.cls}`}>{s.Icon&&<s.Icon size={14} aria-hidden/>}{s.label}</span></div>
   <dl className="mt-2 grid gap-1.5 text-[15px] leading-snug">
    <div><dt className="inline font-extrabold">Question: </dt><dd className="inline">{n.question}</dd></div>
    <div><dt className="inline font-extrabold">My answer: </dt><dd className="inline">{n.answer}{n.proof?<> · <span className="font-serif">{n.proof}</span></>:null}</dd></div>
    <div><dt className="inline font-extrabold">The proof: </dt><dd className="inline font-serif">{n.correctProof}</dd></div>
    {n.gistPick&&<div><dt className="inline font-extrabold">Gist pick: </dt><dd className="inline">{n.gistPick} ({n.gistRight?"best summary":"not the best"})</dd></div>}
    {n.typedQuestion&&<div><dt className="inline font-extrabold">My question: </dt><dd className="inline">{n.typedQuestion}</dd></div>}
    {n.unknownWords.length>0&&<div><dt className="inline font-extrabold">Words I didn't know: </dt><dd className="inline">{n.unknownWords.join(", ")}</dd></div>}
    <div className="text-[13px] text-muted"><dt className="inline">Standards: </dt><dd className="inline">{n.standards.join(", ")}</dd></div>
   </dl>
   <label className="mt-3 block text-[14px] font-extrabold" htmlFor={`note-${n.chunk}`}>My notes</label>
   {onNote?<textarea id={`note-${n.chunk}`} defaultValue={n.note} onBlur={e=>onNote(n.chunk-1,e.target.value)} rows={2} className="no-print mt-1 w-full rounded-row border-2 border-edge bg-panel-2 px-3 py-2 text-[15px] focus:border-highlight" placeholder="What I noticed, what I'd check again…"/>:null}
   <p className="print-only min-h-[3em] whitespace-pre-wrap border-b border-edge text-[15px]">{n.note}</p>
  </li>})}</ol>
  {bonus}
  {onDone&&<button type="button" onClick={onDone} className="no-print case-primary w-full justify-center">Done <ArrowRight size={18} aria-hidden/></button>}
 </section>;
}
