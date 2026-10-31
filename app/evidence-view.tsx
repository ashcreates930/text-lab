"use client";
// The Teacher Evidence View: one row per student, one column per clue (grouped by scene). A filled terracotta square
// means the student proved that clue with a line from the story; a shield means that line proved a character wrong.
// Selecting a square opens the student's line, their explanation, and what it showed about the character.
// Each scene with a Spot the Lie clue has a "Lie caught" column, and the Verdict column shows each student's Final Verdict
// (theory and case strength); selecting it opens their pinned quotes and closing argument.
// Used for real classes (app/classroom.tsx) and the sample classroom (app/teacher-demo.tsx).
import {useEffect,useMemo,useRef,useState} from "react";
import {LEVELS,SPEED_FLAG_TEXT} from "@/lib/fair-play";
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
    {sample&&<p className="mb-2 inline-flex rounded-full bg-primary-soft px-3 py-1 text-[13px] font-bold uppercase tracking-wide text-highlight">Sample class data</p>}
    <h2 id="evidence-h" className="text-[28px] font-bold leading-tight text-ink">Evidence</h2>
    <p className="mt-1 max-w-2xl text-[16px] leading-7 text-muted">Which clues each student proved in <i>{evidence.story.title}</i>, the line from the story they chose, and their explanation in their own words.</p>
   </div>
   <button type="button" onClick={exportCsv} disabled={!students.length} className="case-secondary !min-h-12 disabled:opacity-40"><Download size={18}/> Export to spreadsheet</button>
  </div>

  <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
   <Stat label="Students joined" value={String(summary.joined)}/>
   <Stat label="Average clues proven" value={`${summary.averageProven}`} note={`out of ${summary.totalClues}`}/>
   <Stat label="Proved a character wrong" value={String(summary.provedWrongStudents)} note={summary.provedWrongStudents===1?"student":"students"} icon={<ShieldCheck size={20} className="text-highlight"/>}/>
   <Stat label="Need help" value={String(summary.needsHelp)} note={summary.needsHelp===1?"student":"students"} icon={summary.needsHelp?<AlertTriangle size={20} className="text-notyet"/>:undefined}/>
  </dl>

  {!summary.anyProven?<div className="rounded-3xl bg-panel p-8 text-center"><p className="text-[19px] font-semibold text-ink">No one has proven a clue yet. Share your class link to get started.</p>{summary.needsHelp>0&&<p className="mt-2 text-[16px] text-muted">{summary.needsHelp} {summary.needsHelp===1?"student has":"students have"} started reading.</p>}</div>
  :<>
   <ul aria-label="Key" className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted">
    <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-on-primary"><Check size={14}/></span>Proved with a line from the story</li>
    <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-on-primary"><ShieldCheck size={14}/></span>Proved a character wrong</li>
    <li className="flex items-center gap-2"><span className="h-6 w-6 rounded-md border-2 border-edge bg-panel"/>Not proven yet</li>
    {scenes.some(s=>s.lie)&&<li className="flex items-center gap-2"><LieMark caught/>Caught the scene's lie (Spot the Lie)</li>}
   </ul>
   {/* The grid scrolls sideways on small screens; student names stay pinned on the left. */}
   <div className="relative overflow-x-auto rounded-3xl bg-panel">
    <table className="w-max min-w-full border-separate border-spacing-0 text-left">
     <caption className="sr-only">Clues each student proved, grouped by scene. Select a square to see the student's line and explanation.</caption>
     <thead>
      <tr>
       <th rowSpan={2} scope="col" className="sticky left-0 z-20 min-w-[170px] border-b border-edge bg-panel px-4 py-3 align-bottom text-[14px] font-bold text-ink">Student</th>
       <th rowSpan={2} scope="col" className="border-b border-edge px-3 py-3 align-bottom text-[14px] font-bold text-ink">Proven</th>
       {scenes.map(s=><th key={s.id} colSpan={s.clues.length+(s.lie?1:0)} scope="colgroup" className="border-b border-l border-edge px-3 pb-1 pt-3 text-[13px] font-bold uppercase tracking-wide text-highlight">{s.title}</th>)}
       {evidence.verdict&&<th rowSpan={2} scope="col" className="min-w-[190px] border-b border-l border-edge px-3 py-3 align-bottom text-[14px] font-bold text-ink"><span className="flex items-center gap-1.5"><Gavel size={15} className="text-highlight"/>Verdict</span><span className="mt-1 block text-[11px] font-medium leading-4 text-muted" title={evidence.verdict.standards.join(" · ")}>B.E.S.T. ELA.K12.EE.1.1 · C.1.4</span></th>}
      </tr>
      <tr>{scenes.flatMap(s=>s.clues.map((c,i)=><th key={c.id} scope="col" title={c.name} className={`w-[92px] border-b border-edge px-2 pb-3 align-bottom text-[12px] font-semibold leading-4 text-muted ${i===0?"border-l":""}`}><span className="line-clamp-3 block w-[84px]">{c.name}</span></th>).concat(s.lie?[<th key={`${s.id}-lie`} scope="col" title={`Spot the Lie: ${s.lie.character}'s testimony`} className="w-[84px] border-b border-edge bg-panel-2 px-2 pb-3 align-bottom text-[12px] font-semibold leading-4 text-ink"><span className="block w-[76px]">Lie caught</span></th>]:[]))}</tr>
     </thead>
     <tbody>{students.map(st=><tr key={st.id} className="group">
      <th scope="row" className="sticky left-0 z-10 border-b border-edge bg-panel px-4 py-2 text-[16px] font-semibold text-ink group-hover:bg-panel-2">
       <span className="block">{st.nickname}</span>
       {st.needsHelp?<span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-notyet-soft px-2 py-0.5 text-[12px] font-bold text-notyet"><AlertTriangle size={12}/>Needs help</span>
       :!st.started?<span className="mt-0.5 block text-[12px] font-medium text-muted">Not started</span>:null}
      </th>
      <td className="border-b border-edge px-3 py-2 text-[15px] tabular-nums text-muted">{st.proven} of {clues.length}</td>
      {scenes.flatMap(s=>s.clues.map((c,i)=>{const cell=st.cells[c.id],wrong=cell.finding==="proved-wrong";
       return <td key={c.id} className={`border-b border-edge px-2 py-2 text-center ${i===0?"border-l border-l-edge":""}`}>
        <button type="button" onClick={e=>open(st,c,e.currentTarget)} aria-label={`${st.nickname}, ${c.name}: ${cell.proven?(wrong?"proved, and proved a character wrong":"proved"):"not proven yet"}`} className={`mx-auto grid h-10 w-10 place-items-center rounded-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge ${cell.proven?"bg-primary text-on-primary":"border-2 border-edge bg-panel hover:border-edge"}`}>
         {cell.proven?(wrong?<ShieldCheck size={18}/>:<Check size={16}/>):null}
        </button>
       </td>}).concat(s.lie?[<td key={`${s.id}-lie`} className="border-b border-edge bg-panel-2 px-2 py-2 text-center"><span className="sr-only">{st.nickname}, {s.title}, lie: </span><LieMark caught={!!st.liesCaught[s.id]}/></td>]:[]))}
      {evidence.verdict&&<td className="border-b border-l border-edge border-l-edge px-3 py-2">{st.verdict?<button type="button" onClick={e=>openVerdict(st,e.currentTarget)} className="w-full rounded-xl px-2 py-1.5 text-left hover:bg-primary-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><span className="block text-[14px] font-semibold leading-5 text-ink">{st.verdict.theory}</span><span className="mt-0.5 block text-[12px] font-semibold text-highlight">{st.verdict.strength??"Saved without feedback"}</span></button>:<span className="text-[13px] text-muted">Not yet</span>}</td>}
     </tr>)}</tbody>
    </table>
   </div>
  </>}
  {evidence.students.some(st=>st.mission)?<Missions students={evidence.students}/>:null}
  {evidence.students.some(st=>st.sceneWriting?.length)?<SceneWritingList students={evidence.students}/>:null}
  {evidence.students.some(st=>st.yourTurn?.length)?<YourTurnWriting students={evidence.students}/>:null}
  {evidence.students.some(st=>st.marks?.length||st.claimFlags?.length||st.freezes?.length)?<MarksAndFlags students={evidence.students}/>:null}
  {evidence.storyMode?.some(s=>s.rows.length)?<StoryBoards boards={evidence.storyMode}/>:null}
  {evidence.live?.length?<LiveRounds rounds={evidence.live}/>:null}
  {selected&&<DetailPanel evidence={evidence} selected={selected} onClose={close}/>}
  {verdictOf?.verdict&&<VerdictDetail evidence={evidence} student={verdictOf} onClose={close}/>}
 </section>;
}

function LieMark({caught}:{caught:boolean}){
 return caught?<span className="inline-flex items-center gap-1 rounded-md bg-deep px-2 py-1 text-[12px] font-bold text-ink"><MessageCircle size={12}/>Caught</span>:<span className="text-[13px] text-muted">—<span className="sr-only">Not caught yet</span></span>;
}

// One student's Final Verdict: theory, case strength, the three pinned quotes and the closing argument.
function VerdictDetail({evidence,student,onClose}:{evidence:ClassEvidence;student:EvidenceStudent;onClose:()=>void}){
 const heading=useRef<HTMLHeadingElement>(null);const v=student.verdict!;
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[student.id]);
 useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",esc);return()=>window.removeEventListener("keydown",esc)},[onClose]);
 return <div className="fixed inset-0 z-50 flex justify-end">
  <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-deep/25"/>
  <section role="dialog" aria-modal="true" aria-labelledby="verdict-detail-h" className="case-ui relative flex h-full w-full max-w-[460px] flex-col bg-panel">
   <header className="flex items-start justify-between gap-3 border-b border-edge px-6 py-4">
    <div><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Final verdict · {evidence.verdict?.question}</p><h3 id="verdict-detail-h" ref={heading} tabIndex={-1} className="mt-1 text-[22px] font-bold leading-tight text-ink outline-none">{student.nickname} · {v.theory}</h3></div>
    <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-panel-2"><X size={22}/></button>
   </header>
   <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
    <p className="inline-flex rounded-full bg-deep px-3 py-1 text-[14px] font-bold text-ink">Case strength: {v.strength??"Saved without feedback"}</p>
    <div><p className="text-[14px] font-semibold text-muted">Pinned evidence</p><ol className="mt-2 space-y-3">{v.pinned.map((p,i)=><li key={i}><p className="text-[13px] font-semibold text-highlight">{i+1}. {p.clue}</p><blockquote className="mt-1 rounded-2xl border-l-4 border-primary bg-primary-soft/50 px-4 py-2 font-serif text-[16px] leading-7 text-ink">“{p.quote}”</blockquote></li>)}</ol></div>
    <div><p className="text-[14px] font-semibold text-muted">Closing argument</p><p className="mt-2 text-[17px] leading-7 text-ink">{v.argument}</p></div>
    <div className="rounded-2xl bg-panel-2 p-4"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Standards</p><ul className="mt-1 space-y-1 text-[14px] leading-5 text-ink">{evidence.verdict?.standards.map(s=><li key={s}>{s}</li>)}</ul></div>
   </div>
  </section>
 </div>;
}

function Stat({label,value,note,icon}:{label:string;value:string;note?:string;icon?:React.ReactNode}){
 return <div className="rounded-2xl bg-panel p-4">
  <dt className="text-[14px] font-semibold text-muted">{label}</dt>
  <dd className="mt-1 flex items-baseline gap-2"><span className="text-[30px] font-bold leading-none text-ink">{value}</span>{note&&<span className="text-[15px] text-muted">{note}</span>}{icon&&<span className="ml-auto self-center">{icon}</span>}</dd>
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
  <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-deep/25"/>
  <section role="dialog" aria-modal="true" aria-labelledby="evidence-detail-h" className="case-ui relative flex h-full w-full max-w-[460px] flex-col bg-panel">
   <header className="flex items-start justify-between gap-3 border-b border-edge px-6 py-4">
    <div><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">{d.sceneTitle}</p><h3 id="evidence-detail-h" ref={heading} tabIndex={-1} className="mt-1 text-[22px] font-bold leading-tight text-ink outline-none">{d.title}</h3></div>
    <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-panel-2"><X size={22}/></button>
   </header>
   <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
    {d.proven?<>
     <div><p className="text-[14px] font-semibold text-muted">The line from the story</p><blockquote className="mt-2 rounded-2xl border-l-4 border-primary bg-primary-soft/50 px-4 py-3 font-serif text-[18px] leading-8 text-ink">“{d.quote}”</blockquote></div>
     <div><p className="text-[14px] font-semibold text-muted">Their explanation</p><p className="mt-2 text-[17px] leading-7 text-ink">{d.explanation}</p></div>
     {(d.tries!==null||d.flags.length>0)&&<p className="text-[15px] text-muted">{d.shown?"Shown answer after three tries (0 points).":d.tries?`Found on try ${d.tries+1}.`:d.tries===0?"Found on the first try.":""}{d.flags.map(f=><span key={f} className="ml-2 inline-flex rounded-full bg-gold-soft px-2 py-0.5 text-[13px] font-bold text-gold">⚑ {f}</span>)}</p>}
     <p className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-[16px] font-semibold ${d.finding==="proved-wrong"?"bg-primary text-on-primary":"bg-panel-2 text-ink"}`}>{d.finding==="proved-wrong"&&<ShieldCheck size={20} className="mt-0.5 shrink-0"/>}{d.findingLine}</p>
    </>:<p className="text-[17px] leading-7 text-muted">{d.notProvenLine}</p>}
    {student.storyboard.length>0&&<div className="border-t border-edge pt-5"><h4 className="text-[17px] font-bold text-ink">Storyboard</h4><p className="mt-1 text-[14px] text-muted">{student.nickname}'s completed frames, in story order.</p>
     <ol className="mt-3 space-y-4">{student.storyboard.map((f,i)=><li key={f.pageId} className="overflow-hidden rounded-2xl bg-panel-2">
      {f.picture&&<img src={f.picture} alt={`${student.nickname}'s frame: ${f.description}`} className="aspect-[3/2] w-full object-cover"/>}
      <div className="p-4"><p className="text-[12px] font-semibold uppercase tracking-wide text-highlight">Frame {i+1}{f.picture?"":" · Saved without a picture"}</p><blockquote className="mt-2 border-l-4 border-primary pl-3 font-serif text-[16px] italic leading-7 text-ink">“{f.quote}”</blockquote><p className="mt-2 text-[16px] leading-7 text-ink">{f.description}</p></div>
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
  <h3 id="live-rounds-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><Radio size={20} className="text-highlight"/>Live rounds</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">Squads score together. Each student's role actions show who pinned, wrote, checked and submitted.</p>
  {rounds.map(r=><details key={`${r.sessionId}-${r.number}`} className="rounded-3xl bg-panel p-5">
   <summary className="cursor-pointer text-[17px] font-semibold text-ink">{r.date} · Round {r.number} · {r.type}<span className="mt-1 block text-[14px] font-normal text-muted">{r.prompt}</span></summary>
   {r.freezes?.length?<div className="mt-3 rounded-2xl bg-violet-soft p-3"><p className="text-[13px] font-bold uppercase tracking-wide text-ink">❄ Freezes this round</p><ul className="mt-1 space-y-1 text-[14px] text-ink">{r.freezes.map((f,i)=><li key={i}>{f}</li>)}</ul></div>:null}
   {r.questions?.length?<div className="mt-3 rounded-2xl bg-panel-2 p-3"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">Student questions</p><ul className="mt-1 space-y-1.5 text-[15px] leading-6 text-ink">{r.questions.map((q,i)=><li key={i}><span className="font-semibold">{q.nickname}</span>, chunk {q.chunk}: {q.flagged&&<span className="mr-2 inline-flex items-center gap-1 rounded-full bg-notyet-soft px-2 py-0.5 text-[12px] font-bold text-notyet"><Flag size={12}/>Flagged, hidden from the class</span>}{q.text}</li>)}</ul></div>:null}
   <ul className="mt-4 grid gap-3 md:grid-cols-2">{r.squads.map(sq=><li key={sq.name} className="rounded-2xl border border-edge p-4">
    <p className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-[16px] font-bold text-ink">{sq.name}</span><span className="text-[14px] font-semibold tabular-nums text-highlight">{sq.points} pts · {sq.result}</span></p>
    {sq.answer&&<p className="mt-2 text-[15px] italic leading-6 text-ink">“{sq.answer}”</p>}
    {sq.explanation&&<p className="mt-1 text-[15px] leading-6 text-muted">{sq.flagged&&<span className="mr-2 inline-flex items-center gap-1 rounded-full bg-notyet-soft px-2 py-0.5 text-[12px] font-bold text-notyet"><Flag size={12}/>Flagged, hidden from the class</span>}{sq.explanation}</p>}
    <ul className="mt-3 space-y-1.5 text-[14px] text-muted">{sq.members.map(m=><li key={m.nickname}><span className="font-semibold text-ink">{m.nickname}</span>: {m.actions.length?m.actions.join("; "):"No actions"}</li>)}</ul>
   </li>)}</ul>
  </details>)}
 </section>;
}

// Story Mode: the full class leaderboard per scene (teachers only; students see the top 5 and their own rank), with
// each student's goal level, and per round their points, tries, proof, shown answers, typed proofs and speed flags.
// Speed flags are for the teacher only: students never see them.
const ROUND_LABEL=["Locate","Infer","Catch the lie","Build the case"];
function StoryBoards({boards}:{boards:NonNullable<ClassEvidence["storyMode"]>}){
 return <section aria-labelledby="story-boards-h" className="space-y-3">
  <h3 id="story-boards-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><Gavel size={20} className="text-highlight"/>Story Mode leaderboard</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">The full board, for you only. Students see the top 5 and their own rank. Open a student to see their proof in each round.</p>
  {boards.filter(b=>b.rows.length).map(b=><div key={b.sceneId} className="rounded-3xl bg-panel p-5">
   <p className="text-[14px] font-bold uppercase tracking-wide text-highlight">{b.sceneTitle}</p>
   <ol className="mt-3 space-y-2">{b.rows.map(r=><li key={r.nickname+r.rank}><details className="rounded-2xl border border-edge px-4 py-3">
    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-[16px]"><span className="flex items-center gap-3"><span className="w-7 text-right font-bold tabular-nums">{r.rank}</span><span className="font-semibold">{r.nickname}</span>{r.timeSetting!=="1"&&<span className="rounded-full bg-panel-2 px-2 py-0.5 text-[12px] font-semibold">{r.timeSetting==="untimed"?"Untimed":r.timeSetting+"x time"}</span>}{!r.finished&&<span className="text-[13px] text-muted">in progress</span>}</span><span className="tabular-nums">{r.score}{r.max?` / ${r.max}`:""} pts{r.level?` · ${LEVELS.find(l=>l.id===r.level)?.name??""}`:""} · best streak {r.bestStreak}{r.rounds.some(x=>x.flags?.length)?" · ⚑ speed flag":""}</span></summary>
    <ul className="mt-3 space-y-2 text-[14px] leading-6 text-muted">{r.rounds.map(x=><li key={x.round}><b>Round {x.round}, {ROUND_LABEL[x.round-1]}:</b> {x.points} pts{x.grace?" (late, half points)":""}{x.shown?" · shown answer":x.tries?` · right on try ${x.tries+1}`:""}{x.choice&&x.round!==1&&!["found","missed","caught"].includes(x.choice)?<> · {x.choice}</>:null}{x.flags?.map(f=><span key={f} className="ml-2 inline-flex rounded-full bg-gold-soft px-2 py-0.5 text-[12px] font-bold text-gold">⚑ {SPEED_FLAG_TEXT[f as keyof typeof SPEED_FLAG_TEXT]??f}</span>)}{x.typed&&<span className="mt-1 block">Typed proof: {x.typed}</span>}{x.proof.map(p=><span key={p} className="mt-1 block font-serif italic">“{p.replace(/\s+/g," ")}”</span>)}{x.explanation&&<span className="mt-1 block">Explanation: {x.explanation}</span>}</li>)}</ul>
   </details></li>)}</ol>
  </div>)}
 </section>;
}

// Mark-up and "Something's off": each student's tagged lines (clue, word to know, question) and the character answers
// they flagged. A caught off claim earned points; the other flags wait for your review (no points, no penalty).
function MarksAndFlags({students}:{students:EvidenceStudent[]}){
 return <section aria-labelledby="marks-h" className="space-y-3">
  <h3 id="marks-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><Flag size={20} className="text-highlight"/>Marked lines and flagged answers</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">Lines students tagged while reading, and character answers they said were off. Flags that didn't match a planted mistake are here for you to review.</p>
  <ul className="grid gap-3 md:grid-cols-2">{students.filter(st=>st.marks?.length||st.claimFlags?.length||st.freezes?.length).map(st=><li key={st.id} className="rounded-3xl bg-panel p-5">
   <p className="text-[17px] font-bold text-ink">{st.nickname}</p>
   {st.marks.length>0&&<ul className="mt-2 space-y-2 text-[15px] leading-6">{st.marks.map((m,i)=><li key={i}><span className="mr-2 rounded-full bg-panel-2 px-2 py-0.5 text-[12px] font-bold text-ink">{m.tag}</span><span className="text-[13px] font-semibold text-muted">{m.paragraph}</span><span className="mt-1 block font-serif italic text-ink">“{m.text}”</span></li>)}</ul>}
   {st.freezes?.length>0&&<div className="mt-3"><p className="text-[13px] font-bold uppercase tracking-wide text-ink">❄ Freezes used</p><ul className="mt-1 space-y-1 text-[14px] text-ink">{st.freezes.map((f,i)=><li key={i}>{f}</li>)}</ul></div>}
   {st.claimFlags.length>0&&<ul className="mt-3 space-y-2 text-[15px] leading-6">{st.claimFlags.map((f,i)=><li key={i} className="rounded-2xl border border-edge p-3"><p className="text-[13px] font-bold uppercase tracking-wide text-highlight">{f.clue} · {f.character} · {f.matched?"Caught the mistake":"Needs your review"}</p><p className="mt-1 text-muted">{f.character} said: {f.answer}</p><p className="mt-1 font-serif italic text-ink">Student's line: “{f.line}”</p></li>)}</ul>}
  </li>)}</ul>
 </section>;
}

// Missions: pieces found (shown ones marked), the verdict, and whether it cited the payoff before the reveal.
function Missions({students}:{students:EvidenceStudent[]}){
 return <section aria-labelledby="mission-ev-h" className="space-y-3">
  <h3 id="mission-ev-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><Gavel size={20} className="text-highlight"/>Missions</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">Each student's mission: the pieces they proved while playing, and their verdict before the text's answer was revealed.</p>
  <ul className="grid gap-3 md:grid-cols-2">{students.filter(st=>st.mission).map(st=>{const m=st.mission!;return <li key={st.id} className="rounded-3xl bg-panel p-5">
   <p className="text-[13px] font-bold uppercase tracking-wide text-highlight">{st.nickname} · {m.title} · {m.found.length} of {m.total} pieces</p>
   <ul className="mt-2 space-y-1.5">{m.found.map(p=><li key={p.line} className="font-serif text-[14px] italic leading-5 text-ink">“{p.line.replace(/\s+/g," ")}”{p.shown&&<span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 font-sans text-[12px] font-bold not-italic text-gold">shown</span>}</li>)}</ul>
   {m.verdict?<div className="mt-3 border-t border-edge pt-3"><p className="text-[14px] font-bold">Verdict: {m.verdict.theory}{m.verdict.early&&<span className="ml-2 rounded-full bg-success-soft px-2 py-0.5 text-[12px] text-success">Found it before the reveal</span>}</p><p className="mt-1 text-[15px] leading-6">{m.verdict.writing}</p>
    {m.verdict.pinned.length>0&&<ul className="mt-2 space-y-1.5">{m.verdict.pinned.map(l=><li key={l} className="text-[14px] leading-5"><span className="font-serif italic">“{l.replace(/s+/g," ")}”</span> <span className="font-bold text-muted">· {m.verdict!.compare[l]==="same"?"Points the same way":m.verdict!.compare[l]==="else"?"Points somewhere else":"Not compared yet"}</span></li>)}</ul>}</div>:<p className="mt-3 text-[14px] text-muted">No verdict yet.</p>}
  </li>})}</ul>
 </section>;
}

// Scene writing: one Notice, Interpret and Craft task per scene, after its clues.
function SceneWritingList({students}:{students:EvidenceStudent[]}){
 return <section aria-labelledby="sw-ev-h" className="space-y-3">
  <h3 id="sw-ev-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><MessageCircle size={20} className="text-highlight"/>Scene writing</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">Each scene's one writing task: what students noticed, what it means, and the craft choice they made.</p>
  <ul className="grid gap-3 md:grid-cols-2">{students.flatMap(st=>(st.sceneWriting??[]).map((w,i)=><li key={st.id+i} className="rounded-3xl bg-panel p-5">
   <p className="text-[13px] font-bold uppercase tracking-wide text-highlight">{st.nickname} · {w.scene} · {w.clue}</p>
   <dl className="mt-2 space-y-2 text-[15px] leading-6 text-ink"><div><dt className="font-bold">Notice</dt><dd>{w.notice}</dd></div><div><dt className="font-bold">Interpret</dt><dd>{w.interpret}</dd></div><div><dt className="font-bold">Craft{w.technique?` · ${w.technique}`:""}</dt><dd>{w.craft}</dd></div></dl>
  </li>))}</ul>
 </section>;
}

// Your Turn: each student's activity after the game, their 2 or 3 sentences and the lines they cited.
function YourTurnWriting({students}:{students:EvidenceStudent[]}){
 return <section aria-labelledby="yt-ev-h" className="space-y-3">
  <h3 id="yt-ev-h" className="flex items-center gap-2 text-[22px] font-bold text-ink"><MessageCircle size={20} className="text-highlight"/>Your Turn</h3>
  <p className="max-w-2xl text-[15px] leading-6 text-muted">The personal activity each student chose after the game, and what they wrote, citing the story.</p>
  <ul className="grid gap-3 md:grid-cols-2">{students.flatMap(st=>st.yourTurn.map((y,i)=><li key={st.id+i} className="rounded-3xl bg-panel p-5">
   <p className="text-[13px] font-bold uppercase tracking-wide text-highlight">{st.nickname} · {y.title} · {y.heldUp} held up</p>
   <p className="mt-2 text-[16px] leading-6 text-ink">{y.writing}</p>
   {y.cited.map(c=><p key={c} className="mt-1 font-serif text-[14px] italic leading-5 text-muted">“{c}”</p>)}
  </li>))}</ul>
 </section>;
}
