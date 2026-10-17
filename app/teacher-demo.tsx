"use client";
// Read-only sample classroom for visitors who choose "I'm a teacher". No sign-in, no AI calls, no database writes:
// everything comes from lib/sample-classroom.ts and the story's static world file, and it resets on reload.
import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,ArrowRight,BookOpen,Check,ChevronLeft,ChevronRight,KeyRound,MessageSquare,Quote,Users} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {cluesByPage} from "@/lib/storybook";
import {STUCK_MINUTES,sampleCaseFile,sampleClass,sampleEvidenceClass,sampleEvidenceStudents,sampleFrames,sampleStopAndTalk,sampleStudents} from "@/lib/sample-classroom";
import {buildEvidence} from "@/lib/classroom/evidence";
import {EvidenceView} from "./evidence-view";

type Tab="evidence"|"overview"|"casefile"|"frames"|"live"|"code";
const tabs:[Tab,string][]=[["evidence","Evidence"],["overview","Class overview"],["casefile","Case file"],["frames","Picture frames"],["live","Live lesson"],["code","Class code"]];

// embedded: shown inside the teacher and parent hub, under its own page heading, so the class name is an h2.
export function TeacherDemo({onSignIn,embedded=false}:{onSignIn:()=>void;embedded?:boolean}){
 const Heading=embedded?"h2":"h1";
 const [world,setWorld]=useState<WorldPack|null>(null),[tab,setTab]=useState<Tab>("evidence");
 useEffect(()=>{fetch(`/worlds/${sampleClass.worldId}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>setWorld(null))},[]);
 return <div className="case-ui mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-8">
  <div role="note" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[#A0472C]/60 bg-[#F4E1D6]/60 px-5 py-3"><p className="text-[16px] font-semibold text-[#8A3B23]">Sample classroom. Sign in to create your own class.</p><button type="button" onClick={onSignIn} className="case-secondary !min-h-11">Teacher sign in <ArrowRight size={16}/></button></div>
  <p className="mt-6 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Teacher view · sample data</p>
  {/* The Evidence tab shows its own sample class (Sleepy Hollow); the other tabs show the Tell-Tale Heart class. */}
  <Heading className="mt-1 text-[32px] font-bold leading-tight md:text-[38px]">{tab==="evidence"?sampleEvidenceClass.name:sampleClass.name}</Heading>
  <p className="mt-1 text-[16px] text-[#6B6457]">{tab==="evidence"?`The Legend of Sleepy Hollow · ${sampleEvidenceStudents.length} students`:`${world?.title??"The Tell-Tale Heart"} · ${sampleStudents.length} students`} · fictional names</p>
  <div role="tablist" aria-label="Sample classroom" className="mt-6 flex gap-2 overflow-x-auto pb-1">{tabs.map(([id,label])=><button key={id} role="tab" type="button" aria-selected={tab===id} onClick={()=>setTab(id)} className={`min-h-11 shrink-0 rounded-full px-4 text-[15px] font-semibold ${tab===id?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620] hover:bg-[#E4DCCB]"}`}>{label}</button>)}</div>
  <div role="tabpanel" className="mt-6">{tab==="evidence"?<SampleEvidence/>:!world?<p className="text-[16px] text-[#6B6457]">Opening the sample class…</p>
   :tab==="overview"?<Overview world={world} onCaseFile={()=>setTab("casefile")}/>
   :tab==="casefile"?<CaseFile world={world}/>
   :tab==="frames"?<Frames/>
   :tab==="live"?<Live world={world}/>
   :<ClassCode/>}</div>
 </div>;
}

function useStudentRows(world:WorldPack){
 return useMemo(()=>{const gates=cluesByPage(world).map(g=>g.length),pages=world.storybook!.pages,total=gates.reduce((a,b)=>a+b,0);
  const sectionEnds=pages.map((p,i)=>i===pages.length-1||pages[i+1].section!==p.section?i:-1).filter(i=>i>=0);
  return sampleStudents.map(s=>{const idx=s.page-1,before=gates.slice(0,idx).reduce((a,b)=>a+b,0),onPage=gates[idx]??0;
   const clues=s.finished?total:before+Math.min(s.provenHere,onPage),sections=s.finished?sectionEnds.length:sectionEnds.filter(e=>e<idx).length;
   const stuck=!s.finished&&s.minutesHere>=STUCK_MINUTES&&s.provenHere<onPage;
   return {...s,clues,total,sections,sectionCount:sectionEnds.length,stuck,stuckReason:stuck?`${s.minutesHere} min on page ${s.page}; ${onPage-s.provenHere} clue${onPage-s.provenHere===1?"":"s"} not proven`:""}})},[world]);
}

function Overview({world,onCaseFile}:{world:WorldPack;onCaseFile:()=>void}){
 const rows=useStudentRows(world),pages=world.storybook!.pages.length;
 const stuck=rows.filter(r=>r.stuck),avgPage=Math.round(rows.reduce((a,r)=>a+r.page,0)/rows.length);
 return <div>
  <div className="grid gap-3 sm:grid-cols-3">{[["Average page",`${avgPage} of ${pages}`],["Finished the case",`${rows.filter(r=>r.finished).length} of ${rows.length}`],["Need a nudge",`${stuck.length} student${stuck.length===1?"":"s"}`]].map(([k,v])=><div key={k} className="rounded-2xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="text-[14px] text-[#6B6457]">{k}</p><p className="mt-1 text-[24px] font-bold">{v}</p></div>)}</div>
  {stuck.length>0&&<div className="mt-4 rounded-2xl bg-[#F4E1D6]/70 p-4"><p className="flex items-center gap-2 text-[16px] font-semibold text-[#8A3B23]"><AlertTriangle size={18}/> Stuck right now</p><ul className="mt-2 space-y-1 text-[15px]">{stuck.map(s=><li key={s.name}><b>{s.name}</b>: {s.stuckReason}</li>)}</ul></div>}
  <div className="mt-5 overflow-x-auto rounded-2xl bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <table className="w-full min-w-[620px] text-left text-[15px]"><caption className="sr-only">Progress for each student</caption>
    <thead className="text-[13px] uppercase tracking-wide text-[#6B6457]"><tr><th scope="col" className="px-4 py-3">Student</th><th scope="col" className="px-4 py-3">Pages read</th><th scope="col" className="px-4 py-3">Clues proven</th><th scope="col" className="px-4 py-3">Sections solved</th><th scope="col" className="px-4 py-3">Status</th></tr></thead>
    <tbody>{rows.map(r=><tr key={r.name} className="border-t border-[#EFE8D8]">
     <th scope="row" className="px-4 py-3 font-semibold">{r.name===sampleCaseFile.student?<button type="button" onClick={onCaseFile} className="text-[#8A3B23] underline underline-offset-4">{r.name}</button>:r.name}</th>
     <td className="px-4 py-3">{r.finished?pages:r.page} of {pages}</td><td className="px-4 py-3">{r.clues} of {r.total}</td><td className="px-4 py-3">{r.sections} of {r.sectionCount}</td>
     <td className="px-4 py-3">{r.finished?<span className="inline-flex items-center gap-1 text-[#3F6B3A]"><Check size={16}/> Case closed</span>:r.stuck?<span className="inline-flex items-center gap-1 font-semibold text-[#8A3B23]"><AlertTriangle size={16}/> Stuck</span>:<span className="text-[#6B6457]">Reading</span>}</td>
    </tr>)}</tbody>
   </table>
  </div>
  <p className="mt-3 text-[14px] text-[#6B6457]">Select {sampleCaseFile.student} to open a sample case file.</p>
 </div>;
}

function CaseFile({world}:{world:WorldPack}){
 const clues=world.scenes.flatMap(s=>s.artifacts),bench=new Map(world.benchmarks.map(b=>[b.code,b.description]));
 return <div>
  <h2 className="text-[24px] font-bold">{sampleCaseFile.student}'s case file</h2>
  <p className="mt-1 text-[15px] text-[#6B6457]">Claims, the line from the story that proves each one, and the student's explanation, tagged to B.E.S.T. benchmarks.</p>
  <ol className="mt-5 space-y-4">{sampleCaseFile.entries.map((e,i)=>{const clue=clues.find(c=>c.id===e.clueId);return <li key={e.clueId} className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[14px] font-semibold text-[#8A3B23]">Exhibit {i+1} · {clue?.name}</p><span className="rounded-full bg-[#EFE8D8] px-3 py-1 text-[13px] font-semibold">{e.stance==="contradicts"?"Proved a claim wrong":"Backed up a claim"}</span></div>
   <p className="mt-3 text-[17px] leading-7"><span className="font-semibold">Claim: </span>{e.explanation}</p>
   <blockquote className="mt-3 border-l-4 border-[#A0472C] pl-4 font-serif text-[16px] italic leading-7 text-[#4A4438]"><Quote size={14} className="mr-1 inline text-[#A0472C]"/>"{e.quote}"</blockquote>
   <ul className="mt-4 flex flex-wrap gap-2" aria-label="Benchmarks">{e.tags.map(t=><li key={t} title={bench.get(t)} className="rounded-full border border-[#A0472C]/40 px-3 py-1 text-[13px]"><b>{t}</b><span className="hidden md:inline"> · {bench.get(t)?.replace(/\s*PENDING.*$/,"")}</span></li>)}</ul>
  </li>})}</ol>
 </div>;
}

function Frames(){
 return <div>
  <h2 className="text-[24px] font-bold">Student picture frames</h2>
  <p className="mt-1 text-[15px] text-[#6B6457]">Students describe what they picture, then copy the line from the story that supports it.</p>
  <ul className="mt-5 grid gap-4 md:grid-cols-3">{sampleFrames.map(f=><li key={f.student+f.page} className="overflow-hidden rounded-3xl bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <div className="sb-placeholder relative aspect-[4/3]" role="img" aria-label={`${f.student}'s frame for page ${f.page}: picture not generated in the sample`}><span className="absolute left-3 top-3 rounded-full bg-[#FFFDF8]/90 px-3 py-1 text-[13px] font-semibold">Page {f.page} · {f.kind}</span></div>
   <div className="p-5"><p className="text-[15px] font-semibold">{f.student}</p><p className="mt-1 text-[16px] leading-6">{f.description}</p><blockquote className="mt-3 border-l-4 border-[#A0472C] pl-3 font-serif text-[15px] italic leading-6 text-[#4A4438]">"{f.quote}"</blockquote></div>
  </li>)}</ul>
 </div>;
}

function Live({world}:{world:WorldPack}){
 const pages=world.storybook!.pages,[page,setPage]=useState(sampleStopAndTalk.page),[showCard,setShowCard]=useState(false);
 const section=world.storybook!.sections.find(s=>s.id===pages[page-1].section)?.title;
 return <div className="grid gap-5 lg:grid-cols-2">
  <div className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <p className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]"><BookOpen size={16}/> Live Lessons preview</p>
   <h2 className="mt-2 text-[22px] font-bold">Turn the page for everyone</h2>
   <p className="mt-1 text-[15px] text-[#6B6457]">In a live lesson, every student's reader follows your page.</p>
   <p className="mt-5 text-center text-[17px]" aria-live="polite">The class is on <b>page {page} of {pages.length}</b> · {section}</p>
   <div className="mt-4 flex items-center justify-center gap-3"><button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} aria-label="Back a page" className="grid h-14 w-14 place-items-center rounded-full bg-[#EFE8D8] disabled:opacity-30"><ChevronLeft size={26}/></button><button type="button" onClick={()=>setPage(p=>Math.min(pages.length,p+1))} disabled={page===pages.length} className="case-primary">Turn the page <ChevronRight size={20}/></button></div>
  </div>
  <div className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <p className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]"><MessageSquare size={16}/> Stop-and-Talk card</p>
   <p className="mt-3 text-[17px] leading-7">{sampleStopAndTalk.prompt}</p>
   <button type="button" onClick={()=>setShowCard(v=>!v)} aria-expanded={showCard} className="case-secondary mt-4">{showCard?"Hide":"Show"} what students see</button>
   {showCard&&<div className="case-rise mt-4 rounded-2xl bg-[#2A2620] p-5 text-white"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Stop and talk · {sampleStopAndTalk.minutes} minutes</p><p className="mt-2 text-[18px] leading-7">{sampleStopAndTalk.prompt.replace(/^Stop and talk:\s*/,"")}</p><p className="mt-3 text-[14px] text-white/75">Reading pauses until you turn the page again.</p></div>}
  </div>
 </div>;
}

function ClassCode(){
 const [shown,setShown]=useState(false);
 return <div className="max-w-2xl rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
  <h2 className="flex items-center gap-2 text-[22px] font-bold"><KeyRound size={22} className="text-[#A0472C]"/> Class code</h2>
  {!shown?<><p className="mt-2 text-[16px] leading-7 text-[#4A4438]">Students join with a code and a first name or nickname. No email, no password, no student accounts.</p><button type="button" onClick={()=>setShown(true)} className="case-primary mt-5">Generate class code</button></>
  :<div aria-live="polite"><p className="mt-4 text-[14px] font-semibold uppercase tracking-wide text-[#6B6457]">Sample code</p><p className="mt-1 font-mono text-[40px] font-bold tracking-[.12em] text-[#A0472C]">{sampleClass.code}</p>
   <ol className="mt-5 space-y-3 text-[16px] leading-6">{["Students open Text Lab and type the code in the “Class code” box at the top of the page, or scan your QR code.","They type a first name or nickname. That's it: no account.","They land on their shelf with your story ready. You see their progress here."].map((t,i)=><li key={t} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#A0472C] text-[14px] font-bold text-white">{i+1}</span>{t}</li>)}</ol>
   <p className="mt-5 flex items-center gap-2 rounded-2xl bg-[#EFE8D8] px-4 py-3 text-[15px]"><Users size={16}/> This is a sample. No class was created, and the code doesn't work.</p></div>}
 </div>;
}

// The Evidence tab with a fictional Sleepy Hollow class (lib/sample-classroom.ts), built by the same code as a real
// class's Evidence view, so visitors see exactly what a teacher would.
function SampleEvidence(){
 const [world,setWorld]=useState<WorldPack|null>(null);
 useEffect(()=>{fetch(`/worlds/${sampleEvidenceClass.worldId}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>setWorld(null))},[]);
 const evidence=useMemo(()=>world?buildEvidence(world,sampleEvidenceStudents.map((s,i)=>({id:`sample-${i}`,nickname:s.nickname,answers:s.answers}))):null,[world]);
 if(!evidence)return <p className="text-[16px] text-[#6B6457]">Opening the sample class…</p>;
 return <EvidenceView evidence={evidence} sample className={sampleEvidenceClass.name}/>;
}
