"use client";
// The Teacher Evidence View: one row per student, one column per clue (grouped by scene). A filled terracotta square
// means the student proved that clue with a line from the story; a shield means that line proved a character wrong.
// Selecting a square opens the student's line, their explanation, and what it showed about the character.
// Each scene with a Spot the Lie clue has a "Lie caught" column, and the Verdict column shows each student's Final Verdict
// (theory and case strength); selecting it opens their pinned quotes and closing argument.
// Used for real classes (app/classroom.tsx) and the sample classroom (app/teacher-demo.tsx).
import {useEffect,useMemo,useRef,useState} from "react";
import {AlertTriangle,Check,Download,Flag,Gavel,MessageCircle,Radio,ShieldCheck,X} from "lucide-react";
import type {LiveRoundEvidence} from "@/lib/live/evidence";
import {evidenceCsv,evidenceDetail,type ClassEvidence,type EvidenceClue,type EvidenceStudent} from "@/lib/classroom/evidence";

type Selected={student:EvidenceStudent;clue:EvidenceClue}|null;

export function EvidenceView({evidence,sample=false,className}:{evidence:ClassEvidence;sample?:boolean;className?:string}){
 const [selected,setSelected]=useState<Selected>(null),[verdictOf,setVerdictOf]=useState<EvidenceStudent|null>(null);
 const opener=useRef<HTMLElement|null>(null);
 const {summary,scenes,students}=evidence;
 const clues=useMemo(()=>scenes.flatMap(s=>s.clues),[scenes]);
 function exportCsv(){
  const blob=new Blob(["﻿"+evidenceCsv(evidence)],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`${(className||evidence.story.title).replace(/[^\w\- ]+/g,"").trim().replace(/\s+/g,"-").toLowerCase()||"class"}-evidence.csv`;
  a.click();URL.revokeObjectURL(a.href);
 }
 const open=(student:EvidenceStudent,clue:EvidenceClue,el:HTMLElement)=>{opener.current=el;setSelected({student,clue})};
 const close=()=>{setSelected(null);setVerdictOf(null);opener.current?.focus({preventScroll:true})};
 const openVerdict=(student:EvidenceStudent,el:HTMLElement)=>{opener.current=el;setVerdictOf(student)};
 return <section aria-labelledby="evidence-h" className="case-ui space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div>
    {sample&&<p className="mb-2 inline-flex rounded-full bg-[#F4E1D6] px-3 py-1 text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">Sample class data</p>}
    <h2 id="evidence-h" className="text-[28px] font-bold leading-tight text-[#2A2620]">Evidence</h2>
    <p className="mt-1 max-w-2xl text-[16px] leading-7 text-[#4A4438]">Which clues each student proved in <i>{evidence.story.title}</i>, the line from the story they chose, and their explanation in their own words.</p>
   </div>
   <button type="button" onClick={exportCsv} disabled={!students.length} className="case-secondary !min-h-12 disabled:opacity-40"><Download size={18}/> Export to spreadsheet</button>
  </div>

  <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
   <Stat label="Students joined" value={String(summary.joined)}/>
   <Stat label="Average clues proven" value={`${summary.averageProven}`} note={`out of ${summary.totalClues}`}/>
   <Stat label="Proved a character wrong" value={String(summary.provedWrongStudents)} note={summary.provedWrongStudents===1?"student":"students"} icon={<ShieldCheck size={20} className="text-[#A0472C]"/>}/>
   <Stat label="Need help" value={String(summary.needsHelp)} note={summary.needsHelp===1?"student":"students"} icon={summary.needsHelp?<AlertTriangle size={20} className="text-[#A33B20]"/>:undefined}/>
  </dl>

  {!summary.anyProven?<div className="rounded-3xl bg-[#FFFDF8] p-8 text-center shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]"><p className="text-[19px] font-semibold text-[#2A2620]">No one has proven a clue yet. Share your class link to get started.</p>{summary.needsHelp>0&&<p className="mt-2 text-[16px] text-[#6B6457]">{summary.needsHelp} {summary.needsHelp===1?"student has":"students have"} started reading.</p>}</div>
  :<>
   <ul aria-label="Key" className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#4A4438]">
    <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-md bg-[#A0472C] text-white"><Check size={14}/></span>Proved with a line from the story</li>
    <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-md bg-[#A0472C] text-white"><ShieldCheck size={14}/></span>Proved a character wrong</li>
    <li className="flex items-center gap-2"><span className="h-6 w-6 rounded-md border-2 border-[#E4DCCB] bg-[#FFFDF8]"/>Not proven yet</li>
    {scenes.some(s=>s.lie)&&<li className="flex items-center gap-2"><LieMark caught/>Caught the scene's lie (Spot the Lie)</li>}
   </ul>
   {/* The grid scrolls sideways on small screens; student names stay pinned on the left. */}
   <div className="relative overflow-x-auto rounded-3xl bg-[#FFFDF8] shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
    <table className="w-max min-w-full border-separate border-spacing-0 text-left">
     <caption className="sr-only">Clues each student proved, grouped by scene. Select a square to see the student's line and explanation.</caption>
     <thead>
      <tr>
       <th rowSpan={2} scope="col" className="sticky left-0 z-20 min-w-[170px] border-b border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 align-bottom text-[14px] font-bold text-[#2A2620]">Student</th>
       <th rowSpan={2} scope="col" className="border-b border-[#E4DCCB] px-3 py-3 align-bottom text-[14px] font-bold text-[#2A2620]">Proven</th>
       {scenes.map(s=><th key={s.id} colSpan={s.clues.length+(s.lie?1:0)} scope="colgroup" className="border-b border-l border-[#E4DCCB] px-3 pb-1 pt-3 text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">{s.title}</th>)}
       {evidence.verdict&&<th rowSpan={2} scope="col" className="min-w-[190px] border-b border-l border-[#E4DCCB] px-3 py-3 align-bottom text-[14px] font-bold text-[#2A2620]"><span className="flex items-center gap-1.5"><Gavel size={15} className="text-[#A0472C]"/>Verdict</span><span className="mt-1 block text-[11px] font-medium leading-4 text-[#6B6457]" title={evidence.verdict.standards.join(" · ")}>B.E.S.T. ELA.K12.EE.1.1 · C.1.4</span></th>}
      </tr>
      <tr>{scenes.flatMap(s=>s.clues.map((c,i)=><th key={c.id} scope="col" title={c.name} className={`w-[92px] border-b border-[#E4DCCB] px-2 pb-3 align-bottom text-[12px] font-semibold leading-4 text-[#4A4438] ${i===0?"border-l":""}`}><span className="line-clamp-3 block w-[84px]">{c.name}</span></th>).concat(s.lie?[<th key={`${s.id}-lie`} scope="col" title={`Spot the Lie: ${s.lie.character}'s testimony`} className="w-[84px] border-b border-[#E4DCCB] bg-[#FBF7EE] px-2 pb-3 align-bottom text-[12px] font-semibold leading-4 text-[#2A2620]"><span className="block w-[76px]">Lie caught</span></th>]:[]))}</tr>
     </thead>
     <tbody>{students.map(st=><tr key={st.id} className="group">
      <th scope="row" className="sticky left-0 z-10 border-b border-[#EFE8D8] bg-[#FFFDF8] px-4 py-2 text-[16px] font-semibold text-[#2A2620] group-hover:bg-[#FBF7EE]">
       <span className="block">{st.nickname}</span>
       {st.needsHelp?<span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#F7DCD3] px-2 py-0.5 text-[12px] font-bold text-[#A33B20]"><AlertTriangle size={12}/>Needs help</span>
       :!st.started?<span className="mt-0.5 block text-[12px] font-medium text-[#8B8478]">Not started</span>:null}
      </th>
      <td className="border-b border-[#EFE8D8] px-3 py-2 text-[15px] tabular-nums text-[#4A4438]">{st.proven} of {clues.length}</td>
      {scenes.flatMap(s=>s.clues.map((c,i)=>{const cell=st.cells[c.id],wrong=cell.finding==="proved-wrong";
       return <td key={c.id} className={`border-b border-[#EFE8D8] px-2 py-2 text-center ${i===0?"border-l border-l-[#E4DCCB]":""}`}>
        <button type="button" onClick={e=>open(st,c,e.currentTarget)} aria-label={`${st.nickname}, ${c.name}: ${cell.proven?(wrong?"proved, and proved a character wrong":"proved"):"not proven yet"}`} className={`mx-auto grid h-10 w-10 place-items-center rounded-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A2620] ${cell.proven?"bg-[#A0472C] text-white":"border-2 border-[#E4DCCB] bg-[#FFFDF8] hover:border-[#C9B9A0]"}`}>
         {cell.proven?(wrong?<ShieldCheck size={18}/>:<Check size={16}/>):null}
        </button>
       </td>}).concat(s.lie?[<td key={`${s.id}-lie`} className="border-b border-[#EFE8D8] bg-[#FBF7EE] px-2 py-2 text-center"><span className="sr-only">{st.nickname}, {s.title}, lie: </span><LieMark caught={!!st.liesCaught[s.id]}/></td>]:[]))}
      {evidence.verdict&&<td className="border-b border-l border-[#EFE8D8] border-l-[#E4DCCB] px-3 py-2">{st.verdict?<button type="button" onClick={e=>openVerdict(st,e.currentTarget)} className="w-full rounded-xl px-2 py-1.5 text-left hover:bg-[#F4E1D6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A0472C]"><span className="block text-[14px] font-semibold leading-5 text-[#2A2620]">{st.verdict.theory}</span><span className="mt-0.5 block text-[12px] font-semibold text-[#8A3B23]">{st.verdict.strength??"Saved without feedback"}</span></button>:<span className="text-[13px] text-[#8B8478]">Not yet</span>}</td>}
     </tr>)}</tbody>
    </table>
   </div>
  </>}
  {evidence.students.some(st=>st.marks?.length||st.claimFlags?.length)?<MarksAndFlags students={evidence.students}/>:null}
  {evidence.storyMode?.some(s=>s.rows.length)?<StoryBoards boards={evidence.storyMode}/>:null}
  {evidence.live?.length?<LiveRounds rounds={evidence.live}/>:null}
  {selected&&<DetailPanel evidence={evidence} selected={selected} onClose={close}/>}
  {verdictOf?.verdict&&<VerdictDetail evidence={evidence} student={verdictOf} onClose={close}/>}
 </section>;
}

function LieMark({caught}:{caught:boolean}){
 return caught?<span className="inline-flex items-center gap-1 rounded-md bg-[#2A2620] px-2 py-1 text-[12px] font-bold text-white"><MessageCircle size={12}/>Caught</span>:<span className="text-[13px] text-[#8B8478]">—<span className="sr-only">Not caught yet</span></span>;
}

// One student's Final Verdict: theory, case strength, the three pinned quotes and the closing argument.
function VerdictDetail({evidence,student,onClose}:{evidence:ClassEvidence;student:EvidenceStudent;onClose:()=>void}){
 const heading=useRef<HTMLHeadingElement>(null);const v=student.verdict!;
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[student.id]);
 useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",esc);return()=>window.removeEventListener("keydown",esc)},[onClose]);
 return <div className="fixed inset-0 z-50 flex justify-end">
  <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-[#2A2620]/25"/>
  <section role="dialog" aria-modal="true" aria-labelledby="verdict-detail-h" className="case-ui relative flex h-full w-full max-w-[460px] flex-col bg-[#FFFDF8] shadow-[-18px_0_50px_-20px_rgba(42,38,32,.45)]">
   <header className="flex items-start justify-between gap-3 border-b border-[#E4DCCB] px-6 py-4">
    <div><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">Final verdict · {evidence.verdict?.question}</p><h3 id="verdict-detail-h" ref={heading} tabIndex={-1} className="mt-1 text-[22px] font-bold leading-tight text-[#2A2620] outline-none">{student.nickname} · {v.theory}</h3></div>
    <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6B6457] hover:bg-[#EFE8D8]"><X size={22}/></button>
   </header>
   <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
    <p className="inline-flex rounded-full bg-[#2A2620] px-3 py-1 text-[14px] font-bold text-white">Case strength: {v.strength??"Saved without feedback"}</p>
    <div><p className="text-[14px] font-semibold text-[#6B6457]">Pinned evidence</p><ol className="mt-2 space-y-3">{v.pinned.map((p,i)=><li key={i}><p className="text-[13px] font-semibold text-[#8A3B23]">{i+1}. {p.clue}</p><blockquote className="mt-1 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/50 px-4 py-2 font-serif text-[16px] leading-7 text-[#2A2620]">“{p.quote}”</blockquote></li>)}</ol></div>
    <div><p className="text-[14px] font-semibold text-[#6B6457]">Closing argument</p><p className="mt-2 text-[17px] leading-7 text-[#2A2620]">{v.argument}</p></div>
    <div className="rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">Standards</p><ul className="mt-1 space-y-1 text-[14px] leading-5 text-[#2A2620]">{evidence.verdict?.standards.map(s=><li key={s}>{s}</li>)}</ul></div>
   </div>
  </section>
 </div>;
}

function Stat({label,value,note,icon}:{label:string;value:string;note?:string;icon?:React.ReactNode}){
 return <div className="rounded-2xl bg-[#FFFDF8] p-4 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
  <dt className="text-[14px] font-semibold text-[#6B6457]">{label}</dt>
  <dd className="mt-1 flex items-baseline gap-2"><span className="text-[30px] font-bold leading-none text-[#2A2620]">{value}</span>{note&&<span className="text-[15px] text-[#6B6457]">{note}</span>}{icon&&<span className="ml-auto self-center">{icon}</span>}</dd>
 </div>;
}

// A panel that slides in from the right with one student's work on one clue. Escape or the close button returns focus
// to the square that opened it.
function DetailPanel({evidence,selected,onClose}:{evidence:ClassEvidence;selected:NonNullable<Selected>;onClose:()=>void}){
 const heading=useRef<HTMLHeadingElement>(null);
 const {student,clue}=selected,d=evidenceDetail(evidence,student.id,clue.id)!;
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[student.id,clue.id]);
 useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",esc);return()=>window.removeEventListener("keydown",esc)},[onClose]);
 return <div className="fixed inset-0 z-50 flex justify-end">
  <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-[#2A2620]/25"/>
  <section role="dialog" aria-modal="true" aria-labelledby="evidence-detail-h" className="case-ui relative flex h-full w-full max-w-[460px] flex-col bg-[#FFFDF8] shadow-[-18px_0_50px_-20px_rgba(42,38,32,.45)]">
   <header className="flex items-start justify-between gap-3 border-b border-[#E4DCCB] px-6 py-4">
    <div><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">{d.sceneTitle}</p><h3 id="evidence-detail-h" ref={heading} tabIndex={-1} className="mt-1 text-[22px] font-bold leading-tight text-[#2A2620] outline-none">{d.title}</h3></div>
    <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6B6457] hover:bg-[#EFE8D8]"><X size={22}/></button>
   </header>
   <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
    {d.proven?<>
     <div><p className="text-[14px] font-semibold text-[#6B6457]">The line from the story</p><blockquote className="mt-2 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/50 px-4 py-3 font-serif text-[18px] leading-8 text-[#2A2620]">“{d.quote}”</blockquote></div>
     <div><p className="text-[14px] font-semibold text-[#6B6457]">Their explanation</p><p className="mt-2 text-[17px] leading-7 text-[#2A2620]">{d.explanation}</p></div>
     <p className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-[16px] font-semibold ${d.finding==="proved-wrong"?"bg-[#A0472C] text-white":"bg-[#EFE8D8] text-[#2A2620]"}`}>{d.finding==="proved-wrong"&&<ShieldCheck size={20} className="mt-0.5 shrink-0"/>}{d.findingLine}</p>
    </>:<p className="text-[17px] leading-7 text-[#4A4438]">{d.notProvenLine}</p>}
    {student.storyboard.length>0&&<div className="border-t border-[#E4DCCB] pt-5"><h4 className="text-[17px] font-bold text-[#2A2620]">Storyboard</h4><p className="mt-1 text-[14px] text-[#6B6457]">{student.nickname}'s completed frames, in story order.</p>
     <ol className="mt-3 space-y-4">{student.storyboard.map((f,i)=><li key={f.pageId} className="overflow-hidden rounded-2xl bg-[#F6F0E3]">
      {f.picture&&<img src={f.picture} alt={`${student.nickname}'s frame: ${f.description}`} className="aspect-[3/2] w-full object-cover"/>}
      <div className="p-4"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#8A3B23]">Frame {i+1}{f.picture?"":" · Saved without a picture"}</p><blockquote className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[16px] italic leading-7 text-[#2A2620]">“{f.quote}”</blockquote><p className="mt-2 text-[16px] leading-7 text-[#2A2620]">{f.description}</p></div>
     </li>)}</ol>
    </div>}
   </div>
  </section>
 </div>;
}

// Live rounds: one card per round with each squad's answer and result, and what each student did in their role.
// Flagged writing shows here, marked, for the teacher only; it was hidden from the host screen.
function LiveRounds({rounds}:{rounds:LiveRoundEvidence[]}){
 return <section aria-labelledby="live-rounds-h" className="space-y-3">
  <h3 id="live-rounds-h" className="flex items-center gap-2 text-[22px] font-bold text-[#2A2620]"><Radio size={20} className="text-[#A0472C]"/>Live rounds</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-[#4A4438]">Squads score together. Each student's role actions show who pinned, wrote, checked and submitted.</p>
  {rounds.map(r=><details key={`${r.sessionId}-${r.number}`} className="rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
   <summary className="cursor-pointer text-[17px] font-semibold text-[#2A2620]">{r.date} · Round {r.number} · {r.type}<span className="mt-1 block text-[14px] font-normal text-[#6B6457]">{r.prompt}</span></summary>
   <ul className="mt-4 grid gap-3 md:grid-cols-2">{r.squads.map(sq=><li key={sq.name} className="rounded-2xl border border-[#E4DCCB] p-4">
    <p className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-[16px] font-bold text-[#2A2620]">{sq.name}</span><span className="text-[14px] font-semibold tabular-nums text-[#8A3B23]">{sq.points} pts · {sq.result}</span></p>
    {sq.answer&&<p className="mt-2 text-[15px] italic leading-6 text-[#2A2620]">“{sq.answer}”</p>}
    {sq.explanation&&<p className="mt-1 text-[15px] leading-6 text-[#4A4438]">{sq.flagged&&<span className="mr-2 inline-flex items-center gap-1 rounded-full bg-[#F7DCD3] px-2 py-0.5 text-[12px] font-bold text-[#A33B20]"><Flag size={12}/>Flagged, hidden from the class</span>}{sq.explanation}</p>}
    <ul className="mt-3 space-y-1.5 text-[14px] text-[#4A4438]">{sq.members.map(m=><li key={m.nickname}><span className="font-semibold text-[#2A2620]">{m.nickname}</span>: {m.actions.length?m.actions.join("; "):"No actions"}</li>)}</ul>
   </li>)}</ul>
  </details>)}
 </section>;
}

// Story Mode: the full class leaderboard per scene (teachers only; students see the top 5 and their own rank), with
// each student's points and proof per round.
const ROUND_LABEL=["Read and notice","Something happens to you","Catch the lie","Make your call"];
function StoryBoards({boards}:{boards:NonNullable<ClassEvidence["storyMode"]>}){
 return <section aria-labelledby="story-boards-h" className="space-y-3">
  <h3 id="story-boards-h" className="flex items-center gap-2 text-[22px] font-bold text-[#2A2620]"><Gavel size={20} className="text-[#A0472C]"/>Story Mode leaderboard</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-[#4A4438]">The full board, for you only. Students see the top 5 and their own rank. Open a student to see their proof in each round.</p>
  {boards.filter(b=>b.rows.length).map(b=><div key={b.sceneId} className="rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
   <p className="text-[14px] font-bold uppercase tracking-wide text-[#8A3B23]">{b.sceneTitle}</p>
   <ol className="mt-3 space-y-2">{b.rows.map(r=><li key={r.nickname+r.rank}><details className="rounded-2xl border border-[#E4DCCB] px-4 py-3">
    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-[16px]"><span className="flex items-center gap-3"><span className="w-7 text-right font-bold tabular-nums">{r.rank}</span><span className="font-semibold">{r.nickname}</span>{r.timeSetting!=="1"&&<span className="rounded-full bg-[#EFE8D8] px-2 py-0.5 text-[12px] font-semibold">{r.timeSetting==="untimed"?"Untimed":r.timeSetting+"x time"}</span>}{!r.finished&&<span className="text-[13px] text-[#8B8478]">in progress</span>}</span><span className="tabular-nums">{r.score} pts · best streak {r.bestStreak}</span></summary>
    <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[#4A4438]">{r.rounds.map(x=><li key={x.round}><b>Round {x.round}, {ROUND_LABEL[x.round-1]}:</b> {x.points} pts{x.grace?" (late, half points)":""}{x.choice&&x.round!==1?<> · {x.choice}</>:null}{x.proof.map(p=><span key={p} className="mt-1 block font-serif italic">“{p.replace(/\s+/g," ")}”</span>)}{x.explanation&&<span className="mt-1 block">Explanation: {x.explanation}</span>}</li>)}</ul>
   </details></li>)}</ol>
  </div>)}
 </section>;
}

// Mark-up and "Something's off": each student's tagged lines (clue, word to know, question) and the character answers
// they flagged. A caught off claim earned points; the other flags wait for your review (no points, no penalty).
function MarksAndFlags({students}:{students:EvidenceStudent[]}){
 return <section aria-labelledby="marks-h" className="space-y-3">
  <h3 id="marks-h" className="flex items-center gap-2 text-[22px] font-bold text-[#2A2620]"><Flag size={20} className="text-[#A0472C]"/>Marked lines and flagged answers</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-[#4A4438]">Lines students tagged while reading, and character answers they said were off. Flags that didn't match a planted mistake are here for you to review.</p>
  <ul className="grid gap-3 md:grid-cols-2">{students.filter(st=>st.marks?.length||st.claimFlags?.length).map(st=><li key={st.id} className="rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
   <p className="text-[17px] font-bold text-[#2A2620]">{st.nickname}</p>
   {st.marks.length>0&&<ul className="mt-2 space-y-2 text-[15px] leading-6">{st.marks.map((m,i)=><li key={i}><span className="mr-2 rounded-full bg-[#EFE8D8] px-2 py-0.5 text-[12px] font-bold text-[#2A2620]">{m.tag}</span><span className="text-[13px] font-semibold text-[#6B6457]">{m.paragraph}</span><span className="mt-1 block font-serif italic text-[#2A2620]">“{m.text}”</span></li>)}</ul>}
   {st.claimFlags.length>0&&<ul className="mt-3 space-y-2 text-[15px] leading-6">{st.claimFlags.map((f,i)=><li key={i} className="rounded-2xl border border-[#E4DCCB] p-3"><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">{f.clue} · {f.character} · {f.matched?"Caught the mistake":"Needs your review"}</p><p className="mt-1 text-[#4A4438]">{f.character} said: {f.answer}</p><p className="mt-1 font-serif italic text-[#2A2620]">Student's line: “{f.line}”</p></li>)}</ul>}
  </li>)}</ul>
 </section>;
}
