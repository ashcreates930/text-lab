"use client";
import {useMemo,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Clock,Printer,X} from "lucide-react";
import {lessonById,lessonGroups,miniLessons,type MiniLesson} from "@/lib/mini-lessons";
import {resolveBenchmark} from "@/lib/standards";

export type LessonRecord={finishedAt:string;firstTryCorrect:number;total:number};
const big="min-h-12 px-5 py-3 text-sm md:text-base";

// Library of mini lessons. Recommended lessons for the current story appear first.
export function MiniLessonLibrary({grade,recommended=[],done,onOpen,heading="Mini lessons",intro}:{grade:number|null;recommended?:string[];done:Record<string,LessonRecord>;onOpen:(id:string)=>void;heading?:string;intro?:string}){
 const [band,setBand]=useState<"all"|"6-8"|"9-12">(grade==null?"all":grade<=8?"6-8":"9-12");
 const fits=(l:MiniLesson)=>band==="all"||(band==="6-8"?l.grades.min<=8:l.grades.max>=9);
 const rec=recommended.map(lessonById).filter(Boolean) as MiniLesson[];
 const card=(l:MiniLesson)=>{const record=done[l.id];return <button key={l.id} onClick={()=>onOpen(l.id)} className="panel flex h-full flex-col p-5 text-left hover:border-[#dfb675]/70"><span className="flex items-center justify-between text-xs text-white/60"><span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true"/> {l.minutes} min</span><span>Grades {l.grades.min} to {l.grades.max}</span></span><span className="serif mt-3 block text-2xl">{l.title}</span><span className="mt-2 block flex-1 text-sm leading-6 text-white/75">{l.goal}</span><span className={`mt-4 block text-sm ${record?"text-[#c4d0a6]":"text-[#dfb675]"}`}>{record?<><Check size={14} className="mr-1 inline"/>Finished · {record.firstTryCorrect} of {record.total} right on the first try</>:<>Start lesson <ArrowRight size={14} className="inline"/></>}</span></button>};
 return <section>
  <p className="eyebrow">BEFORE YOU READ</p><h2 className="serif mt-2 text-3xl md:text-4xl">{heading}</h2>
  <p className="mt-3 max-w-3xl text-base leading-7 text-white/80">{intro??"Short lessons on the skills good readers use. Each one takes about five to eight minutes: a quick explanation, a worked example, and two practice questions with feedback."}</p>
  {rec.length>0&&<div className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wide text-[#f0d9b2]">Recommended for this story</h3><div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rec.map(card)}</div></div>}
  <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter lessons by grade"><span className="mr-2 text-sm text-white/70">Show lessons for</span>{([["all","All grades"],["6-8","Grades 6 to 8"],["9-12","Grades 9 to 12"]] as const).map(([v,label])=><button key={v} onClick={()=>setBand(v)} aria-pressed={band===v} className={`rounded-full border px-4 py-2 text-sm ${band===v?"border-[#dfb675] bg-[#dfb675]/10 text-[#dfb675]":"border-white/20 text-white/70"}`}>{label}</button>)}</div>
  {lessonGroups.map(group=>{const list=miniLessons.filter(l=>l.group===group&&fits(l)&&!recommended.includes(l.id));return list.length>0&&<div key={group} className="mt-7"><h3 className="text-sm font-bold uppercase tracking-wide text-white/75">{group}</h3><div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map(card)}</div></div>})}
 </section>;
}

// One lesson, one step per screen: why it matters, teaching cards, a worked example, practice, and a wrap-up.
export function LessonPlayer({lessonId,grade,onFinish,onClose,teacherView=false}:{lessonId:string;grade:number|null;onFinish:(id:string,record:LessonRecord)=>void;onClose:()=>void;teacherView?:boolean}){
 const lesson=lessonById(lessonId)!;
 const steps=useMemo(()=>["intro",...lesson.cards.map((_,i)=>`card-${i}`),"model",...lesson.checks.map((_,i)=>`check-${i}`),"wrap"],[lesson]);
 const [step,setStep]=useState(0),[revealed,setRevealed]=useState(0),[answers,setAnswers]=useState<Record<number,{picked:number;firstTry:boolean}>>({});
 const current=steps[step];
 const checkIndex=current.startsWith("check-")?Number(current.slice(6)):-1;
 const canContinue=checkIndex<0||answers[checkIndex]?.picked!=null&&lesson.checks[checkIndex].options[answers[checkIndex].picked].correct;
 const firstTryCorrect=Object.values(answers).filter(a=>a.firstTry).length;
 const showFurther=grade==null||grade>=9;
 function pick(i:number){setAnswers(a=>{const prev=a[checkIndex];const correct=!!lesson.checks[checkIndex].options[i].correct;return {...a,[checkIndex]:{picked:i,firstTry:prev?prev.firstTry:correct}}})}
 function next(){if(current==="wrap"){if(!teacherView)onFinish(lesson.id,{finishedAt:new Date().toISOString(),firstTryCorrect,total:lesson.checks.length});onClose();return}setRevealed(0);setStep(s=>Math.min(steps.length-1,s+1))}
 const codes=lesson.benchmarks.map(c=>resolveBenchmark(c,grade??8)).filter(Boolean) as {code:string;description:string}[];
 return <section className="mx-auto max-w-3xl" aria-label={`Mini lesson: ${lesson.title}`}>
  <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><button onClick={onClose} className={`soft-button inline-flex items-center gap-2 ${big}`}><X size={16}/> Close lesson</button>{teacherView&&<button onClick={()=>window.print()} className={`soft-button inline-flex items-center gap-2 ${big}`}><Printer size={16}/> Print</button>}</div>
  <div className="mt-4 h-2 bg-white/10 print:hidden" role="progressbar" aria-label="Lesson progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step+1}><div className="h-full bg-[#dfb675] transition-all" style={{width:`${((step+1)/steps.length)*100}%`}}/></div>
  <p className="mt-2 text-sm text-white/65 print:hidden">Step {step+1} of {steps.length}</p>
  {teacherView&&<PrintableLesson lesson={lesson} codes={codes}/>}
  <div className="panel mt-4 p-6 md:p-8 print:hidden">
   <p className="eyebrow">MINI LESSON · {lesson.group.toUpperCase()}</p>
   {current==="intro"&&<><h1 className="serif mt-2 text-4xl">{lesson.title}</h1><p className="mt-4 text-lg leading-8 text-[#f0d9b2]">{lesson.goal}</p><p className="mt-4 text-base leading-7 text-white/80"><b>Why this matters:</b> {lesson.why}</p><details className="mt-6 border-t border-white/15 pt-4"><summary className="cursor-pointer text-sm text-[#dfb675]">For teachers: standards and courses</summary><ul className="mt-3 space-y-2 text-sm leading-6">{codes.map(c=><li key={c.code}><span className="font-mono text-[#f0d9b2]">{c.code}</span> · {c.description}</li>)}</ul><p className="mt-3 text-sm text-white/70">{lesson.courseLink}</p></details></>}
   {current.startsWith("card-")&&(()=>{const c=lesson.cards[Number(current.slice(5))];return <><h2 className="serif mt-2 text-3xl">{c.heading}</h2><p className="mt-4 text-lg leading-8 text-white/85">{c.body}</p>{c.points&&<ul className="mt-4 space-y-3">{c.points.map(p=><li key={p} className="border-l-2 border-[#dfb675] pl-4 text-base leading-7 text-white/85">{p}</li>)}</ul>}</>})()}
   {current==="model"&&<><h2 className="serif mt-2 text-3xl">Watch it work</h2><p className="mt-2 text-sm text-white/70">Read the short passage, then reveal each step of the thinking.</p><blockquote className="serif mt-4 rounded-sm bg-[#f4efe4] p-5 text-xl leading-9 text-[#1b1b18]">{lesson.model.passage}</blockquote><ol className="mt-5 space-y-3">{lesson.model.steps.slice(0,revealed).map((s,i)=><li key={s} className="fade-in flex gap-3 text-base leading-7"><span className="font-mono text-[#dfb675]">{i+1}</span>{s}</li>)}</ol>{revealed<lesson.model.steps.length&&<button onClick={()=>setRevealed(r=>r+1)} className={`soft-button mt-5 ${big}`}>Show step {revealed+1} of {lesson.model.steps.length}</button>}</>}
   {checkIndex>=0&&(()=>{const c=lesson.checks[checkIndex],a=answers[checkIndex];return <><h2 className="serif mt-2 text-3xl">Try it · question {checkIndex+1} of {lesson.checks.length}</h2><p className="mt-4 text-lg leading-8">{c.question}</p><div className="mt-4 grid gap-2" role="radiogroup" aria-label={c.question}>{c.options.map((o,i)=>{const picked=a?.picked===i;return <button key={o.text} role="radio" aria-checked={picked} onClick={()=>pick(i)} className={`min-h-12 border px-4 py-3 text-left text-base ${picked?(o.correct?"border-[#a5ae8a] bg-[#a5ae8a]/15":"border-[#d08a6a] bg-[#d08a6a]/10"):"border-white/25 hover:border-white/50"}`}>{o.text}{picked&&<span className="mt-2 block text-sm leading-6 text-white/85"><b>{o.correct?"Yes. ":"Not quite. "}</b>{o.why}{!o.correct&&" Try another answer."}</span>}</button>})}</div></>})()}
   {current==="wrap"&&<><h2 className="serif mt-2 text-3xl">{teacherView?"Wrap-up":"Nice work."}</h2>{!teacherView&&<p className="mt-3 text-base text-white/80">You answered {firstTryCorrect} of {lesson.checks.length} on the first try.</p>}<div className="mt-5 space-y-4 text-base leading-7"><p><b className="text-[#f0d9b2]">Use it in the story:</b> {lesson.useInStory}</p><p><b className="text-[#f0d9b2]">AI as a resource, not the source:</b> {lesson.aiTip}</p>{showFurther&&<p><b className="text-[#f0d9b2]">Going further:</b> {lesson.goingFurther}</p>}</div></>}
  </div>
  <div className="mt-4 flex flex-wrap justify-between gap-3 print:hidden"><button disabled={step===0} onClick={()=>{setRevealed(0);setStep(s=>Math.max(0,s-1))}} className={`soft-button inline-flex items-center gap-2 disabled:opacity-30 ${big}`}><ArrowLeft size={16}/> Back</button><button disabled={!canContinue} onClick={next} className={`gold-button inline-flex items-center gap-2 disabled:opacity-40 ${big}`}>{current==="wrap"?(teacherView?"Close":"Finish lesson"):"Next"} {current==="wrap"?<Check size={16}/>:<ArrowRight size={16}/>}</button></div>
  {checkIndex>=0&&!canContinue&&<p className="mt-2 text-right text-sm text-white/65">Choose the best answer to continue.</p>}
 </section>;
}

// Full lesson on one page for printing or projecting, including the answer key.
function PrintableLesson({lesson,codes}:{lesson:MiniLesson;codes:{code:string;description:string}[]}){
 return <article className="hidden text-black print:block">
  <h1 className="text-3xl font-bold">{lesson.title}</h1><p className="mt-1">{lesson.goal} · about {lesson.minutes} minutes · Grades {lesson.grades.min} to {lesson.grades.max}</p>
  <p className="mt-2"><b>Why this matters:</b> {lesson.why}</p>
  {lesson.cards.map(c=><section key={c.heading} className="mt-4"><h2 className="text-xl font-bold">{c.heading}</h2><p>{c.body}</p>{c.points&&<ul className="list-disc pl-6">{c.points.map(p=><li key={p}>{p}</li>)}</ul>}</section>)}
  <section className="mt-4"><h2 className="text-xl font-bold">Worked example</h2><blockquote className="border-l-4 border-gray-400 pl-3 italic">{lesson.model.passage}</blockquote><ol className="list-decimal pl-6">{lesson.model.steps.map(s=><li key={s}>{s}</li>)}</ol></section>
  <section className="mt-4"><h2 className="text-xl font-bold">Practice</h2>{lesson.checks.map((c,i)=><div key={c.question} className="mt-2"><p>{i+1}. {c.question}</p><ol className="list-[upper-alpha] pl-8">{c.options.map(o=><li key={o.text}>{o.text}</li>)}</ol></div>)}</section>
  <section className="mt-4"><h2 className="text-xl font-bold">Answer key</h2>{lesson.checks.map((c,i)=>{const k=c.options.findIndex(o=>o.correct);return <p key={c.question}>{i+1}. {String.fromCharCode(65+k)} · {c.options[k].why}</p>})}</section>
  <section className="mt-4"><p><b>Use it in the story:</b> {lesson.useInStory}</p><p><b>AI as a resource, not the source:</b> {lesson.aiTip}</p><p><b>Going further (grades 9 to 12):</b> {lesson.goingFurther}</p></section>
  <section className="mt-4 text-sm"><p><b>Standards:</b> {codes.map(c=>`${c.code} (${c.description})`).join(" · ")}</p><p>{lesson.courseLink}</p></section>
 </article>;
}
