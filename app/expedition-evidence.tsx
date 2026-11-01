"use client";
// Proof Race expeditions in the Teacher Evidence View (lib/expedition-progress.ts): assign an expedition and see who
// finished it; the class skill map by B.E.S.T. benchmark and first-try rates by question type; then each student's
// rank, badges, skills, Refresher fixes, Gist accuracy, words they didn't know, Case Notes and Name the Liar.
import {useState} from "react";
import {CalendarDays,Check,Compass,X} from "lucide-react";
import type {ClassEvidence} from "@/lib/classroom/evidence";

type Exp=NonNullable<ClassEvidence["expeditions"]>;
type Skills=Exp["class"];
const pctText=(p:number|null)=>p===null?"·":`${p}%`;
function Bars({rows,label}:{rows:{name:string;right:number;total:number;pct:number|null}[];label:string}){
 return <ul aria-label={label} className="grid gap-1.5">{rows.map(r=><li key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-[14px] text-ink">
  <span className="relative overflow-hidden rounded-full bg-panel-2 px-3 py-1"><span aria-hidden className="absolute inset-y-0 left-0 bg-highlight/25" style={{width:`${r.pct??0}%`}}/><span className="relative">{r.name}</span></span>
  <span className="tabular-nums text-muted">{r.right}/{r.total} · {pctText(r.pct)}</span></li>)}</ul>;
}
function SkillPanels({s}:{s:Skills}){
 return <div className="grid gap-4 md:grid-cols-2">
  <div><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Skill map by benchmark (first try)</p><div className="mt-2"><Bars label="By benchmark" rows={s.standards.map(x=>({name:x.code,...x}))}/></div></div>
  <div><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">First-try rate by question type</p><div className="mt-2"><Bars label="By question type" rows={s.types.map(x=>({name:x.type,...x}))}/></div>
   <p className="mt-2 text-[14px] text-ink">Gist accuracy: {s.gist.right}/{s.gist.total} ({pctText(s.gist.pct)}) · Refresher: {s.refresher.fixed} of {s.refresher.tried} fixed</p>
   {s.unknownWords.length>0&&<p className="mt-1 text-[14px] text-muted">Words students marked: {s.unknownWords.join(", ")}</p>}</div>
 </div>;
}
export function ExpeditionEvidence({data,onAssign,onUnassign}:{data:Exp;onAssign?:(id:string,due:string|null)=>Promise<void>;onUnassign?:(id:string)=>Promise<void>}){
 const [due,setDue]=useState<Record<string,string>>({}),[busy,setBusy]=useState("");
 return <section aria-labelledby="exp-ev-h" className="space-y-3">
  <h3 id="exp-ev-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><Compass size={20} className="text-highlight"/>Proof Race expeditions</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">Solo expeditions your students played while signed in to the class. First-try results come from each student's first attempt; every result is tagged to B.E.S.T.</p>
  <div className="rounded-3xl bg-panel p-5"><SkillPanels s={data.class}/></div>
  <ul className="grid gap-3">{data.expeditions.map((x,k)=><li key={x.id} className="rounded-3xl bg-panel p-5">
   <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[17px] font-semibold text-ink">{k+1}. {x.title} <span className="text-[14px] font-normal text-muted">· {x.finished} of {x.of} finished</span></p>
    {onAssign&&<div className="flex flex-wrap items-center gap-2">{x.assigned?<><span className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-[13px] font-bold text-on-success"><CalendarDays size={14}/>Assigned{x.assigned.due?` · due ${x.assigned.due}`:""}</span>
      <button type="button" disabled={busy===x.id} onClick={async()=>{setBusy(x.id);await onUnassign?.(x.id);setBusy("")}} className="case-secondary !min-h-10 !text-[14px]">Remove</button></>
     :<><label className="text-[13px] text-muted">Due<input type="date" value={due[x.id]??""} onChange={e=>setDue(d=>({...d,[x.id]:e.target.value}))} className="ml-1 rounded-row bg-panel-2 px-2 py-1 text-[14px] text-ink"/></label>
      <button type="button" disabled={busy===x.id} onClick={async()=>{setBusy(x.id);await onAssign(x.id,due[x.id]||null);setBusy("")}} className="case-primary !min-h-10 !text-[14px]">Assign</button></>}</div>}</div>
   <details className="mt-2"><summary className="cursor-pointer text-[15px] font-semibold text-highlight">Who finished, and each student's notes</summary>
    <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-[14px] text-ink"><thead><tr className="text-muted"><th className="py-1 pr-3 font-semibold">Student</th><th className="py-1 pr-3 font-semibold">Finished</th><th className="py-1 pr-3 font-semibold">First try</th><th className="py-1 pr-3 font-semibold">Score</th><th className="py-1 font-semibold">Name the Liar</th></tr></thead>
     <tbody>{x.rows.map(r=><tr key={r.id} className="border-t border-edge align-top"><td className="py-1 pr-3 font-semibold">{r.nickname}</td><td className="py-1 pr-3">{r.finished?<><Check size={14} className="mr-1 inline text-success"/>{r.finished.slice(0,10)}</>:<><X size={14} className="mr-1 inline text-muted"/>Not yet</>}</td>
      <td className="py-1 pr-3 tabular-nums">{r.firstTry===null?"·":`${r.firstTry}/${r.total}`}</td><td className="py-1 pr-3 tabular-nums">{r.score??"·"}</td>
      <td className="py-1">{r.liar?`${r.liar.solved?"Solved":"Not solved"} · named ${r.liar.pick??"no one"}`:"·"}</td></tr>)}</tbody></table></div>
    {x.rows.filter(r=>r.notes.some(n=>n.note)).map(r=><div key={r.id} className="mt-2 rounded-2xl bg-panel-2 p-3"><p className="text-[14px] font-bold text-ink">{r.nickname}'s Case Notes</p>
     <ul className="mt-1 space-y-1 text-[14px] text-ink">{r.notes.filter(n=>n.note).map(n=><li key={n.chunk}>Chunk {n.chunk} ({n.type}): {n.note}</li>)}</ul></div>)}
   </details>
  </li>)}</ul>
  <div className="rounded-3xl bg-panel p-5"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Each student</p>
   <ul className="mt-2 grid gap-3 md:grid-cols-2">{data.students.map(s=><li key={s.id} className="rounded-2xl border border-edge p-3">
    <p className="text-[15px] font-bold text-ink">{s.nickname} <span className="font-normal text-muted">· {s.finished} expedition{s.finished===1?"":"s"}{s.rank?` · ${s.rank}`:""}</span></p>
    {s.badges.length>0&&<p className="mt-1 text-[13px] text-ink">Badges: {s.badges.join(", ")}</p>}
    {s.skills.types.length>0&&<p className="mt-1 text-[13px] text-muted">{s.skills.types.map(t=>`${t.type} ${pctText(t.pct)}`).join(" · ")}</p>}
    {s.skills.unknownWords.length>0&&<p className="mt-1 text-[13px] text-muted">Words marked: {s.skills.unknownWords.join(", ")}</p>}
   </li>)}</ul></div>
 </section>;
}
