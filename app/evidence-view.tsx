"use client";
// The Teacher Evidence View: one row per student, one column per clue (grouped by scene). A filled terracotta square
// means the student proved that clue with a line from the story; a shield means that line proved a character wrong.
// Selecting a square opens the student's line, their explanation, and what it showed about the character.
// Used for real classes (app/classroom.tsx) and the sample classroom (app/teacher-demo.tsx).
import {useEffect,useMemo,useRef,useState} from "react";
import {AlertTriangle,Check,Download,ShieldCheck,X} from "lucide-react";
import {evidenceCsv,evidenceDetail,type ClassEvidence,type EvidenceClue,type EvidenceStudent} from "@/lib/classroom/evidence";

type Selected={student:EvidenceStudent;clue:EvidenceClue}|null;

export function EvidenceView({evidence,sample=false,className}:{evidence:ClassEvidence;sample?:boolean;className?:string}){
 const [selected,setSelected]=useState<Selected>(null);
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
 const close=()=>{setSelected(null);opener.current?.focus({preventScroll:true})};
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
   </ul>
   {/* The grid scrolls sideways on small screens; student names stay pinned on the left. */}
   <div className="overflow-x-auto rounded-3xl bg-[#FFFDF8] shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
    <table className="w-max min-w-full border-separate border-spacing-0 text-left">
     <caption className="sr-only">Clues each student proved, grouped by scene. Select a square to see the student's line and explanation.</caption>
     <thead>
      <tr>
       <th rowSpan={2} scope="col" className="sticky left-0 z-20 min-w-[170px] border-b border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 align-bottom text-[14px] font-bold text-[#2A2620]">Student</th>
       <th rowSpan={2} scope="col" className="border-b border-[#E4DCCB] px-3 py-3 align-bottom text-[14px] font-bold text-[#2A2620]">Proven</th>
       {scenes.map(s=><th key={s.id} colSpan={s.clues.length} scope="colgroup" className="border-b border-l border-[#E4DCCB] px-3 pb-1 pt-3 text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">{s.title}</th>)}
      </tr>
      <tr>{scenes.flatMap(s=>s.clues.map((c,i)=><th key={c.id} scope="col" title={c.name} className={`w-[92px] border-b border-[#E4DCCB] px-2 pb-3 align-bottom text-[12px] font-semibold leading-4 text-[#4A4438] ${i===0?"border-l":""}`}><span className="line-clamp-3 block w-[84px]">{c.name}</span></th>))}</tr>
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
       </td>}))}
     </tr>)}</tbody>
    </table>
   </div>
  </>}
  {selected&&<DetailPanel evidence={evidence} selected={selected} onClose={close}/>}
 </section>;
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
   </div>
  </section>
 </div>;
}
