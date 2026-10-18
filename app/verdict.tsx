"use client";
// The Final Verdict screen (rules in lib/verdict.ts): 1 choose your theory, 2 pin exactly three proven clues, 3 make a
// closing argument and submit it to the judge. One revision is allowed. The case then closes with a full-screen VERDICT
// stamp. Also the verdict panel shown on the case board and the printed case file.
import {useEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Gavel,Pin,ShieldCheck} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {caseBoardCards} from "@/lib/game-feel";
import {PINS_NEEDED,canRevise,canSubmit,theoryOf,togglePin,verdictFor,verdictProblems,type SavedVerdict,type VerdictFeedback} from "@/lib/verdict";
import type {Demo} from "./page";
import {FactCheckerBadge} from "./case-game";

const card="rounded-3xl bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]";
const STARTERS=["I believe… because…","The strongest evidence is… This shows…","Some might say…, but…"];

export function VerdictView({world,demo,setDemo,onBack,onFinish}:{world:WorldPack;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onBack:()=>void;onFinish:()=>void}){
 const verdict=world.verdict!;
 const saved=verdictFor(demo.verdict,world.id);
 const cards=caseBoardCards(world,demo.artifactAnswers);
 const [theoryId,setTheoryId]=useState(saved?.theory_id??"");
 const [pinned,setPinned]=useState<string[]>(saved?.pinned.map(p=>p.clue_id)??[]);
 const [argument,setArgument]=useState(saved?.argument??"");
 const [editing,setEditing]=useState(!saved);
 const [sending,setSending]=useState(false),[notice,setNotice]=useState(""),[stamp,setStamp]=useState(false);
 const box=useRef<HTMLTextAreaElement>(null);
 const ready=canSubmit({theoryId,pinned,argument});
 const problems=verdictProblems({theoryId,pinned,argument});
 async function submit(){
  if(!ready||sending)return;
  setSending(true);setNotice("");
  const pins=pinned.map(id=>({clue_id:id,quote:cards.find(c=>c.clueId===id)?.quote??""}));
  let result:{status?:string;feedback?:VerdictFeedback;message?:string}={};
  try{const r=await fetch("/api/verdict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId:demo.id,worldId:world.id,theoryId,pinned:pins,argument})});if(r.ok)result=await r.json()}catch{}
  setSending(false);
  // An argument that isn't about the story is not saved; the student revises it.
  if(result.status==="flagged"){setNotice(result.message??"Let's keep your argument about the story.");return}
  const next:SavedVerdict={world_id:world.id,theory_id:theoryId,pinned:pins,argument:argument.trim(),feedback:result.status==="judged"&&result.feedback?result.feedback:null,submissions:(saved?.submissions??0)+1,saved_at:new Date().toISOString()};
  setDemo(d=>({...d,verdict:next,events:[...d.events,"verdict"]}));
  setEditing(false);
 }
 const theory=theoryOf(world,theoryId);
 if(stamp&&theory)return <VerdictStamp theory={theory.name} onContinue={onFinish}/>;
 return <div className="case-ui mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8">
  <button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[16px] font-semibold text-[#2A2620] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Back to the scene</button>
  <p className="mt-4 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Final verdict</p>
  <h1 className="mt-1 text-[30px] font-bold leading-tight outline-none">{verdict.question}</h1>
  <p className="mt-2 text-[16px] text-[#4A4438]">There is no single right answer. Choose a theory and defend it with the evidence you proved.</p>

  <section className="mt-6" aria-labelledby="v-theory">
   <h2 id="v-theory" className="text-[19px] font-bold"><span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#A0472C] text-[14px] text-white">1</span>Choose your theory</h2>
   <div className="mt-3 grid gap-3 md:grid-cols-3">{verdict.theories.map(t=>{const on=theoryId===t.id;return <button key={t.id} type="button" disabled={!editing} onClick={()=>setTheoryId(t.id)} aria-pressed={on} className={`rounded-3xl p-5 text-left transition ${on?"bg-[#A0472C] text-white shadow-lg":"bg-[#FFFDF8] text-[#2A2620] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] hover:bg-[#FBF1EB]"} disabled:cursor-default`}>
    <span className="flex items-center justify-between gap-2 text-[19px] font-bold">{t.name}{on&&<Check size={20}/>}</span>
    <span className={`mt-2 block text-[15px] leading-6 ${on?"text-white/90":"text-[#4A4438]"}`}>{t.description}</span>
   </button>})}</div>
  </section>

  <section className="mt-8" aria-labelledby="v-pin">
   <div className="flex flex-wrap items-end justify-between gap-2"><h2 id="v-pin" className="text-[19px] font-bold"><span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#A0472C] text-[14px] text-white">2</span>Pin your evidence</h2><p className="text-[15px] font-semibold" aria-live="polite">{pinned.length} of {PINS_NEEDED} pinned</p></div>
   <p className="mt-1 text-[15px] text-[#6B6457]">These are the clues you proved. Pin the {PINS_NEEDED} that best support your theory.</p>
   <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map(c=>{const on=pinned.includes(c.clueId),full=!on&&pinned.length>=PINS_NEEDED;return <li key={c.clueId}><button type="button" disabled={!editing||full} onClick={()=>setPinned(p=>togglePin(p,c.clueId))} aria-pressed={on} className={`relative flex h-full w-full flex-col rounded-2xl p-4 text-left transition ${on?"bg-[#FFFDF8] ring-4 ring-[#A0472C]":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"} disabled:cursor-default ${full?"opacity-50":""}`}>
    {on&&<span aria-hidden className="absolute -top-2 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full bg-[#A0472C] text-white shadow"><Pin size={12}/></span>}
    <span className="flex items-start justify-between gap-2"><span className="text-[12px] font-semibold uppercase tracking-wide text-[#8A3B23]">Scene {c.sceneIndex+1} · {c.name}</span>{c.factCheck&&<FactCheckerBadge count={1}/>}</span>
    <span className="mt-2 block border-l-4 border-[#A0472C] pl-3 font-serif text-[15px] italic leading-6 text-[#2A2620]">“{c.quote.length>220?c.quote.slice(0,220)+"…":c.quote}”</span>
    <span className="mt-auto pt-3 text-[14px] font-semibold text-[#8A3B23]">{on?"Pinned":"Pin this"}</span>
   </button></li>})}</ol>
   {!cards.length&&<p className={`${card} mt-3 p-5`}>Prove some clues first: they become your evidence.</p>}
  </section>

  <section className="mt-8" aria-labelledby="v-arg">
   <h2 id="v-arg" className="text-[19px] font-bold"><span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#A0472C] text-[14px] text-white">3</span>Make your closing argument</h2>
   <label htmlFor="verdict-argument" className="mt-1 block text-[15px] text-[#6B6457]">Write 2 to 4 sentences that connect your evidence to your theory.</label>
   <div className="mt-3 flex flex-wrap gap-2">{STARTERS.map(s=><button key={s} type="button" disabled={!editing} onClick={()=>{setArgument(v=>v?`${v} ${s}`:s);box.current?.focus()}} className="rounded-full bg-[#EFE8D8] px-3 py-1.5 text-[14px] font-semibold text-[#2A2620] hover:bg-[#E4DCCB] disabled:opacity-50">{s}</button>)}</div>
   <textarea id="verdict-argument" ref={box} value={argument} readOnly={!editing} onChange={e=>setArgument(e.target.value)} rows={5} maxLength={1500} className="mt-3 w-full rounded-2xl border border-[#E4DCCB] bg-white p-4 text-[17px] leading-7 outline-none focus:border-[#A0472C] read-only:bg-[#FBF7EE]"/>
   <div aria-live="polite">
    {notice&&<p className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px] text-[#2A2620]">{notice}</p>}
    {editing&&!ready&&(theoryId||pinned.length||argument)&&<p className="mt-2 text-[14px] text-[#6B6457]">{problems[0]}</p>}
   </div>
   {editing&&<button type="button" onClick={submit} disabled={!ready||sending} className="case-primary mt-4 w-full disabled:opacity-40 sm:w-auto"><Gavel size={18}/> {sending?"The judge is reading…":"Submit to the judge"}</button>}
  </section>

  {!editing&&saved&&<section className={`${card} mt-8 p-5 md:p-6`} aria-live="polite" aria-labelledby="v-judge">
   <h2 id="v-judge" className="flex items-center gap-2 text-[19px] font-bold"><Gavel size={20} className="text-[#A0472C]"/> The judge</h2>
   {saved.feedback?<>
    <p className="mt-3 inline-flex rounded-full bg-[#2A2620] px-4 py-1.5 text-[15px] font-bold text-white">Case strength: {saved.feedback.strength}</p>
    <p className="mt-3 text-[16px] leading-7"><span className="font-semibold">What's strong: </span>{saved.feedback.strength_note}</p>
    <p className="mt-2 text-[16px] leading-7"><span className="font-semibold">Next step: </span>{saved.feedback.next_step}</p>
   </>:<p className="mt-3 text-[16px]">Your verdict is saved.</p>}
   <div className="mt-5 flex flex-col gap-2 sm:flex-row">
    {canRevise(saved)&&<button type="button" onClick={()=>{setEditing(true);setTimeout(()=>box.current?.focus(),50)}} className="case-secondary justify-center">Revise and resubmit</button>}
    <button type="button" onClick={()=>setStamp(true)} className="case-primary">Close the case <ArrowRight size={18}/></button>
   </div>
   {!canRevise(saved)&&<p className="mt-3 text-[14px] text-[#6B6457]">You've used your revision. Your verdict is final.</p>}
  </section>}
 </div>;
}

// The full-screen moment before the case summary: a VERDICT stamp with the student's theory.
export function VerdictStamp({theory,onContinue}:{theory:string;onContinue:()=>void}){
 const button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{button.current?.focus({preventScroll:true})},[]);
 return <div role="dialog" aria-modal="true" aria-labelledby="verdict-stamp" className="consequence-in fixed inset-0 z-50 grid place-items-center bg-[#1B1712]/90 p-6">
  <div className="case-ui relative max-w-2xl text-center">
   <p className="case-stamp-page border-[5px] border-double border-[#F3C9B2] px-8 py-2 text-[clamp(32px,6vw,56px)] font-black uppercase tracking-[.2em] text-[#F3C9B2]" style={{borderRadius:12}}>Verdict</p>
   <p id="verdict-stamp" className="mt-6 font-serif text-[26px] leading-snug text-white md:text-[32px]">{theory}</p>
   <button ref={button} type="button" onClick={onContinue} className="case-primary mt-8">See your case file <ArrowRight size={18}/></button>
  </div>
 </div>;
}

// The verdict on the case board and in the printed case file.
export function VerdictPanel({world,verdict}:{world:WorldPack;verdict:SavedVerdict}){
 const theory=theoryOf(world,verdict.theory_id);
 const names=new Map(world.scenes.flatMap(s=>s.artifacts).map(a=>[a.id,a.name]));
 return <section className="rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_6px_18px_-10px_rgba(42,38,32,.5)] print:break-inside-avoid print:shadow-none print:ring-1 print:ring-[#E4DCCB]" aria-label="Your verdict">
  <div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]"><Gavel size={15}/> Verdict · {world.verdict?.question}</p>{verdict.feedback&&<span className="rounded-full bg-[#2A2620] px-3 py-1 text-[13px] font-bold text-white">Case strength: {verdict.feedback.strength}</span>}</div>
  <p className="mt-2 text-[20px] font-bold text-[#2A2620]">{theory?.name}</p>
  <ol className="mt-3 space-y-2">{verdict.pinned.map((p,i)=><li key={p.clue_id} className="flex gap-2 text-[15px] leading-6"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#A0472C] text-[11px] font-bold text-white">{i+1}</span><span><span className="font-semibold">{names.get(p.clue_id)}: </span><span className="font-serif italic">“{p.quote}”</span></span></li>)}</ol>
  <p className="mt-3 text-[16px] leading-7 text-[#2A2620]"><span className="font-semibold">Closing argument: </span>{verdict.argument}</p>
  {verdict.feedback&&<p className="mt-2 flex items-start gap-2 text-[14px] leading-6 text-[#4A4438]"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#A0472C]"/>{verdict.feedback.strength_note}</p>}
 </section>;
}
