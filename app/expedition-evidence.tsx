"use client";
// Escape rooms in the Teacher Evidence View (lib/expedition-progress.ts): assign a room and see who
// finished it; the class skill map by B.E.S.T. benchmark and first-try rates by question type; then each student's
// rank, badges, skills, Refresher fixes, Gist accuracy, words they didn't know, Case Notes and Name the Liar.
import {mmss} from "@/lib/room-clock";
import {dokFromNote} from "@/lib/dok";
import {useState} from "react";
import {CalendarDays,Check,Compass,X} from "lucide-react";
import type {ClassEvidence} from "@/lib/classroom/evidence";
import {LEVELS} from "@/lib/mastery";

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
   {s.unknownWords.length>0&&<p className="mt-1 text-[14px] text-muted">Words students marked: {s.unknownWords.join(", ")}</p>}
   {s.plain&&<p className="mt-1 text-[14px] text-ink">Answered with Plain words open: {s.plain.answers} of {s.plain.of}{s.plain.answers?` · ${s.plain.right} of them proved on the first try`:""}</p>}</div>
  {s.dok&&s.dok.length>0&&<div className="md:col-span-2"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">First-try rate by Depth of Knowledge</p><div className="mt-2"><Bars label="By Depth of Knowledge" rows={s.dok.map(x=>({name:x.name,right:x.right,total:x.total,pct:x.pct}))}/></div>
   <p className="mt-1 text-[13px] text-muted">DOK 1: find it in the text. DOK 2: meaning, craft and structure. DOK 3: inference, evidence, theme and claims.</p></div>}
 </div>;
}
// The escape timer per chamber (lib/room-clock.ts): time used, and in time or after time ran out; "in time on a replay"
// when a later attempt made it; and for a chamber escaped in time, its escape bonus (+100 a first-try proof).
type TimerRow={budgetMs:number;chambers:{ms:number;inTime:boolean|null;everInTime:boolean;firstTries?:number|null;bonus?:number|null}[]}|null;
function timerCell(t:TimerRow){
 if(!t)return "·";
 return <ul className="flex flex-col gap-0.5">{t.chambers.map((c,i)=><li key={i} className="whitespace-nowrap">Ch {i+1}: <span className="tabular-nums">{mmss(c.ms)}</span> {c.inTime?<b className="text-success">in time</b>:c.inTime===false?<span className="font-semibold text-notyet">after time{c.everInTime?" (in time on a replay)":""}</span>:""}{c.inTime&&c.bonus!=null?<span className="block text-[13px] text-muted">{c.bonus?`+${c.bonus} escape bonus (${c.firstTries} first-try)`:"no escape bonus (no first-try proofs)"}</span>:null}</li>)}</ul>;
}
function timerSummary(rows:{timer:TimerRow}[]){
 const all=rows.flatMap(r=>r.timer?r.timer.chambers:[]);if(!all.length)return null;
 const bonus=all.reduce((n,c)=>n+(c.bonus??0),0);
 return `Chambers escaped in time: ${all.filter(c=>c.inTime).length} · finished after time ran out: ${all.filter(c=>c.inTime===false).length}${bonus?` · escape bonus earned: +${bonus} (+100 a first-try proof)`:""}`;
}
// onOverride: a teacher overrides the score on a written answer (or clears it with null).
export function ExpeditionEvidence({data,onAssign,onUnassign,onOverride}:{data:Exp;onAssign?:(id:string,due:string|null)=>Promise<void>;onUnassign?:(id:string)=>Promise<void>;onOverride?:(studentId:string,attemptId:string,chunk:number,verdict:string|null)=>Promise<void>}){
 const [due,setDue]=useState<Record<string,string>>({}),[busy,setBusy]=useState("");
 return <section aria-labelledby="exp-ev-h" className="space-y-3">
  <h3 id="exp-ev-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><Compass size={20} className="text-highlight"/>Escape rooms</h3>
  {data.story&&<details className="rounded-card bg-panel p-3"><summary className="cursor-pointer text-[16px] font-bold text-ink">The story for teachers: essential question, key concepts and synopsis</summary>
   <p className="mt-2 text-[15px] text-ink"><b>Essential question:</b> {data.story.question}</p><p className="mt-1 text-[15px] text-ink"><b>Key concepts:</b> {data.story.concepts.join(", ")}</p>
   <p className="mt-1 text-[15px] text-ink"><b>Synopsis (teacher view only):</b> {data.story.synopsis}</p></details>}
  <p className="max-w-2xl text-[15px] leading-6 text-muted">The rooms your students played solo while signed in to the class. First-try results come from each student's first attempt; every result is tagged to B.E.S.T.</p>
  <ClassRoomNumbers rooms={data.expeditions}/>
  <div className="rounded-3xl bg-panel p-5"><SkillPanels s={data.class}/></div>
  {data.levels.length>0&&<div className="rounded-3xl bg-panel p-5"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Mastery levels (the same levels students see; first tries only)</p>
   <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-[14px] text-ink"><thead><tr className="text-muted"><th className="py-1 pr-3 font-semibold">Skill</th>{LEVELS.map(l=><th key={l} className="py-1 pr-3 font-semibold">{l}</th>)}</tr></thead>
    <tbody>{data.levels.map(r=><tr key={r.family} className="border-t border-edge"><td className="py-1 pr-3"><span className="font-semibold">{r.name}</span> <span className="text-muted">{r.code}</span></td>{LEVELS.map(l=><td key={l} className="py-1 pr-3 tabular-nums">{r.counts[l]}</td>)}</tr>)}</tbody></table></div></div>}
  <ul className="grid gap-3">{data.expeditions.map((x,k)=><li key={x.id} className="min-w-0 rounded-3xl bg-panel p-5">
   <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[17px] font-semibold text-ink">Room {x.number??k+1}: {x.title} <span className="text-[14px] font-normal text-muted">· {x.finished} of {x.of} escaped</span></p>
    {timerSummary(x.rows)&&<p className="mt-0.5 text-[14px] text-ink">{timerSummary(x.rows)}</p>}
    {x.totals&&<p className="mt-0.5 text-[14px] text-muted">Locks opened: <b className="text-ink">{x.totals.locksOpened}</b> · Puzzles solved on the first try: <b className="text-ink">{x.totals.puzzlesFirstTry}</b> · Liars caught: <b className="text-ink">{x.totals.liarsCaught} of {x.totals.liarTries}</b> · Reached: {(["Chamber 1","At the inner door","Chamber 2","Escaped"] as const).map(r=>`${r} ${x.totals!.reached[r]}`).join(", ")}</p>}</div>
    {onAssign&&<div className="flex flex-wrap items-center gap-2">{x.assigned?<><span className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-[13px] font-bold text-on-success"><CalendarDays size={14}/>Assigned{x.assigned.due?` · due ${x.assigned.due}`:""}</span>
      <button type="button" disabled={busy===x.id} onClick={async()=>{setBusy(x.id);await onUnassign?.(x.id);setBusy("")}} className="case-secondary !min-h-10 !text-[14px]">Remove</button></>
     :<><label className="text-[13px] text-muted">Due<input type="date" value={due[x.id]??""} onChange={e=>setDue(d=>({...d,[x.id]:e.target.value}))} className="ml-1 rounded-row bg-panel-2 px-2 py-1 text-[14px] text-ink"/></label>
      <button type="button" disabled={busy===x.id} onClick={async()=>{setBusy(x.id);await onAssign(x.id,due[x.id]||null);setBusy("")}} className="case-primary !min-h-10 !text-[14px]">Assign</button></>}</div>}</div>
   <details className="mt-2"><summary className="cursor-pointer text-[15px] font-semibold text-highlight">Each student: the chamber reached, locks, puzzles, the liar and their notes</summary>
    <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-[14px] text-ink"><thead><tr className="text-muted"><th className="py-1 pr-3 font-semibold">Student</th><th className="py-1 pr-3 font-semibold">Chamber reached</th><th className="py-1 pr-3 font-semibold">Escape timer</th><th className="py-1 pr-3 font-semibold">Locks opened</th><th className="py-1 pr-3 font-semibold">Proved first try</th><th className="py-1 pr-3 font-semibold">Puzzles first try</th><th className="py-1 pr-3 font-semibold">Clues</th><th className="py-1 pr-3 font-semibold">Score</th><th className="py-1 font-semibold">Liar</th></tr></thead>
     <tbody>{x.rows.map(r=><tr key={r.id} className="border-t border-edge align-top"><td className="py-1 pr-3 font-semibold">{r.nickname}</td><td className="py-1 pr-3">{r.finished?<><Check size={14} className="mr-1 inline text-success"/>Escaped {r.finished.slice(0,10)}</>:r.room&&r.room.reached!=="Not started"?r.room.reached:<><X size={14} className="mr-1 inline text-muted"/>Not started</>}</td>
      <td className="py-1 pr-3">{timerCell(r.timer)}</td>
      <td className="py-1 pr-3 tabular-nums">{r.room?`${r.room.locksOpened}/${r.room.locks}`:"·"}</td>
      <td className="py-1 pr-3 tabular-nums">{r.firstTry===null?"·":`${r.firstTry}/${r.total}`}</td>
      <td className="py-1 pr-3 tabular-nums">{r.room&&r.room.puzzles?`${r.room.puzzlesFirstTry}/${r.room.puzzles}`:"·"}</td><td className="py-1 pr-3">{cluesText(r.notes)}</td><td className="py-1 pr-3 tabular-nums">{r.score??"·"}</td>
      <td className="py-1">{r.liar?`${r.liar.solved?"Caught, with the line":"Not caught"} · named ${r.liar.pick??"no one"}`:"·"}</td></tr>)}</tbody></table></div>
    {x.rows.some(r=>r.notes.some(n=>n.format==="written"))&&<div className="mt-2 rounded-2xl bg-panel-2 p-3"><p className="text-[14px] font-bold text-ink">Written answers (you can change the score)</p>
     <ul className="mt-1 space-y-2 text-[14px] text-ink">{x.rows.flatMap(r=>r.notes.filter(n=>n.format==="written").map(n=><li key={`${r.id}-${n.chunk}`} className="grid gap-1"><span><b>{r.nickname}</b>, chunk {n.chunk}: {n.answer}</span>
      <label className="text-[13px] text-muted">Score{n.teacherVerdict?" (set by you)":" (by the rubric)"}: <select disabled={!onOverride||!r.attemptId} value={n.teacherVerdict??""} onChange={async e=>{setBusy(`${r.id}-${n.chunk}`);await onOverride?.(r.id,r.attemptId!,n.chunk,e.target.value||null);setBusy("")}} className="ml-1 rounded-row bg-panel px-2 py-1 text-[14px] text-ink"><option value="">Rubric score ({/(Strong|Solid|Needs more evidence)/.exec(n.answer)?.[1]??"none"})</option><option>Strong</option><option>Solid</option><option>Needs more evidence</option></select></label></li>))}</ul></div>}
    {x.rows.some(r=>r.notes.some(n=>n.plainWords))&&<div className="mt-2 rounded-2xl bg-panel-2 p-3"><p className="text-[14px] font-bold text-ink">Plain words open when they answered</p>
     <ul className="mt-1 space-y-1 text-[14px] text-ink">{x.rows.filter(r=>r.notes.some(n=>n.plainWords)).map(r=><li key={r.id}><b>{r.nickname}</b>: {r.notes.filter(n=>n.plainWords).map(n=>`lock ${n.chunk}${n.rightFirstTry?" (proved)":" (missed)"}`).join(", ")}</li>)}</ul></div>}
    {x.rows.filter(r=>r.notes.some(n=>n.note)).map(r=><div key={r.id} className="mt-2 rounded-2xl bg-panel-2 p-3"><p className="text-[14px] font-bold text-ink">{r.nickname}'s Case Notes</p>
     <ul className="mt-1 space-y-1 text-[14px] text-ink">{r.notes.filter(n=>n.note).map(n=><li key={n.chunk}>Chunk {n.chunk} ({n.type}{dokFromNote(n)?` · DOK ${dokFromNote(n)}`:""}): {n.note}</li>)}</ul></div>)}
   </details>
  </li>)}</ul>
  <div className="rounded-3xl bg-panel p-5"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Each student</p>
   <ul className="mt-2 grid gap-3 md:grid-cols-2">{data.students.map(s=><li key={s.id} className="rounded-2xl border border-edge p-3">
    <p className="text-[15px] font-bold text-ink">{s.nickname} <span className="font-normal text-muted">· {s.finished} room{s.finished===1?"":"s"} escaped{s.rank?` · ${s.rank}`:""}</span></p>
    {s.badges.length>0&&<p className="mt-1 text-[13px] text-ink">Badges: {s.badges.join(", ")}</p>}
    {s.levels.length>0&&<ul aria-label={`${s.nickname}'s mastery levels`} className="mt-1 flex flex-wrap gap-1">{s.levels.map(l=><li key={l.family} className="rounded-full bg-panel-2 px-2 py-0.5 text-[12px] text-ink" title={l.code}>{l.name}: <b>{l.level}</b> ({l.right}/{l.total})</li>)}</ul>}
    {s.reflections.map((x,i)=><p key={i} className="mt-1 text-[13px] text-ink">Reflection after {x.expedition}: "{x.text}"</p>)}
    {s.skills.types.length>0&&<p className="mt-1 text-[13px] text-muted">{s.skills.types.map(t=>`${t.type} ${pctText(t.pct)}`).join(" · ")}</p>}
    {s.skills.plain?.answers>0&&<p className="mt-1 text-[13px] text-muted">Plain words open on {s.skills.plain.answers} answer{s.skills.plain.answers===1?"":"s"} ({s.skills.plain.right} proved first try)</p>}
    {s.skills.dok?.length>0&&<p className="mt-1 text-[13px] text-muted">{s.skills.dok.map(d=>`DOK ${d.level} ${pctText(d.pct)}`).join(" · ")}</p>}
    {s.skills.unknownWords.length>0&&<p className="mt-1 text-[13px] text-muted">Words marked: {s.skills.unknownWords.join(", ")}</p>}
   </li>)}</ul></div>
 </section>;
}
// Request a clue (lib/clues.ts): which locks used one, and how far (tier 2 or 3 means the lock doesn't count toward mastery).
function cluesText(notes:{chunk:number;clue?:number}[]){const used=notes.filter(n=>(n.clue??0)>0);return used.length?used.map(n=>`Lock ${n.chunk}: tier ${n.clue}`).join(", "):"None"}
// The class's numbers across every room: locks opened, puzzle locks solved on the first try, liars caught, rooms
// escaped, and where each student is now (the furthest room they have reached, and the chamber in it).
function ClassRoomNumbers({rooms}:{rooms:Exp["expeditions"]}){
 const t=rooms.flatMap(x=>x.totals?[x.totals]:[]);if(!t.length)return null;
 const sum=(f:(x:(typeof t)[number])=>number)=>t.reduce((a,x)=>a+f(x),0);
 const where=new Map<string,string>();for(const x of rooms)for(const r of x.rows)if(r.room&&r.room.reached!=="Not started")where.set(r.nickname,`Room ${x.number??"?"}, ${r.room.reached==="Escaped"?"escaped":r.room.reached.toLowerCase()}`);
 const cell="rounded-2xl bg-panel p-4",label="text-[13px] font-bold uppercase tracking-wide text-muted",big="font-display text-[30px] font-bold tabular-nums text-ink";
 return <div className="grid gap-3">
  <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
   <div className={cell}><dt className={label}>Locks opened</dt><dd className={big}>{sum(x=>x.locksOpened)}</dd></div>
   <div className={cell}><dt className={label}>Puzzles solved on the first try</dt><dd className={big}>{sum(x=>x.puzzlesFirstTry)}</dd></div>
   <div className={cell}><dt className={label}>Liars caught</dt><dd className={big}>{sum(x=>x.liarsCaught)} <span className="text-[16px] font-normal text-muted">of {sum(x=>x.liarTries)}</span></dd></div>
   <div className={cell}><dt className={label}>Rooms escaped</dt><dd className={big}>{sum(x=>x.reached.Escaped)}</dd></div>
  </dl>
  {where.size>0&&<div className={cell}><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Which chamber each student reached</p><ul className="mt-1 grid gap-x-6 gap-y-1 text-[14px] text-ink sm:grid-cols-2 md:grid-cols-3">{[...where].sort((a,b)=>a[0].localeCompare(b[0])).map(([n,w])=><li key={n}><b>{n}</b>: {w}</li>)}</ul></div>}
 </div>;
}
