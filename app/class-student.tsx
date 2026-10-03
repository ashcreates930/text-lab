"use client";
import {useCallback,useEffect,useState} from "react";
import {ArrowRight,BookOpen,Check,MessagesSquare,Send} from "lucide-react";
import {lessonById} from "@/lib/mini-lessons";
import type {LiveStep,Phase} from "@/lib/classroom/plan";
import {LessonPlayer} from "./mini-lessons";

const big="min-h-12 px-5 py-3 text-sm md:text-base";
export type ClassAuth={token:string;nickname:string;className:string|null};

async function studentFetch(auth:ClassAuth,path:string,init:RequestInit={}){
 const headers=new Headers(init.headers);headers.set("Content-Type","application/json");headers.set("x-class-token",auth.token);
 const response=await fetch(path,{...init,headers});
 return {ok:response.ok,status:response.status,body:await response.json().catch(()=>({}))};
}

type ClassInfo={nickname:string;className:string|null;worldTitle:string;grade:number;assignments:{lessonId:string;dueDate:string|null;done:{first_try_correct:number;total:number}|null}[];liveActive:boolean};

// A class student's home: the live discussion when it is running, assigned lessons, and the story.
export function ClassHome({auth,onStory,onLive}:{auth:ClassAuth;onStory:()=>void;onLive:()=>void}){
 const [info,setInfo]=useState<ClassInfo|null>(null),[error,setError]=useState(""),[lesson,setLesson]=useState("");
 const load=useCallback(async()=>{const r=await studentFetch(auth,"/api/student/class");if(r.ok){setInfo(r.body);setError("")}else setError(r.body.error||"Could not load your class.")},[auth]);
 useEffect(()=>{load();const t=window.setInterval(load,5000);return()=>window.clearInterval(t)},[load]);
 if(lesson)return <section className="px-5 py-10"><LessonPlayer lessonId={lesson} grade={info?.grade??null} onClose={()=>{setLesson("");window.scrollTo(0,0)}} onFinish={async(id,record)=>{await studentFetch(auth,"/api/student/lessons",{method:"POST",body:JSON.stringify({lessonId:id,firstTryCorrect:record.firstTryCorrect,total:record.total})});load()}}/></section>;
 return <section className="mx-auto max-w-4xl px-5 py-10">
  <p className="eyebrow">MY CLASS</p><h1 className="serif mt-2 text-4xl md:text-5xl">Hi, {auth.nickname}.</h1>{info&&<p className="mt-2 text-lg text-white/75">{info.className||"Your class"} · {info.worldTitle}</p>}
  {error&&<p role="alert" className="mt-4 text-base text-[#f0b9a2]">{error}</p>}
  {info?.liveActive&&<button onClick={onLive} className="mt-6 flex w-full items-center justify-between gap-4 border-2 border-[#dfb675] bg-[#dfb675]/15 p-5 text-left"><span><span className="flex items-center gap-2 text-xl font-bold text-[#f0d9b2]"><MessagesSquare size={22}/> Your class discussion is live</span><span className="mt-1 block text-base text-white/80">Tap here to answer with your class.</span></span><ArrowRight size={26}/></button>}
  <div className="panel mt-6 p-6"><h2 className="serif text-2xl">Assigned mini lessons</h2>{!info?<p className="mt-3 text-base text-white/70">Loading…</p>:info.assignments.length===0?<p className="mt-3 text-base text-white/75">Nothing assigned right now.</p>:<ul className="mt-4 space-y-2">{info.assignments.map(a=>{const l=lessonById(a.lessonId);if(!l)return null;return <li key={a.lessonId}><button onClick={()=>{setLesson(a.lessonId);window.scrollTo(0,0)}} className={`flex w-full items-center justify-between gap-3 border p-4 text-left ${a.done?"border-[#a5ae8a]/60":"border-white/25 hover:border-[#dfb675]"}`}><span><span className="block text-lg font-bold">{l.title}</span><span className="text-sm text-white/70">{l.minutes} minutes{a.dueDate?` · Due ${a.dueDate}`:""}</span></span><span className={`text-base ${a.done?"text-[#c4d0a6]":"text-[#dfb675]"}`}>{a.done?<><Check size={16} className="mr-1 inline"/>Done · {a.done.first_try_correct}/{a.done.total}</>:<>Start <ArrowRight size={15} className="inline"/></>}</span></button></li>})}</ul>}</div>
  <button onClick={onStory} className={`gold-button mt-6 flex w-full items-center justify-center gap-2 ${big}`}><BookOpen size={18}/> Go to the story</button>
 </section>;
}

type LiveView={active:false}|{active:true;analysisId:string;worldTitle:string;sceneTitle:string;roleName:string;stepNumber:number;stepCount:number;phase:Phase;step:LiveStep;expecting:"answer"|"takeaway"|null;secondsLeft:number|null;starters:string[];myAnswer:string|null;myTakeaway:string|null};

// What students see on their own device during the live class analysis.
export function ClassLive({auth,onBack}:{auth:ClassAuth;onBack:()=>void}){
 const [view,setView]=useState<LiveView|null>(null),[draft,setDraft]=useState(""),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{const r=await studentFetch(auth,"/api/student/live");if(r.ok)setView(r.body)},[auth]);
 useEffect(()=>{load();const t=window.setInterval(load,2000);return()=>window.clearInterval(t)},[load]);
 const key=view&&view.active?`${view.analysisId}:${view.stepNumber}:${view.expecting}`:"none";
 useEffect(()=>{setDraft("");setStatus("")},[key]);
 async function send(e:React.FormEvent){e.preventDefault();if(!view||!view.active||!view.expecting||!draft.trim())return;setBusy(true);const r=await studentFetch(auth,"/api/student/live",{method:"POST",body:JSON.stringify({analysisId:view.analysisId,stepNumber:view.stepNumber,kind:view.expecting,text:draft.trim()})});setBusy(false);setStatus(r.ok?"Sent. Look up at the board.":r.body.error||"That did not send. Try again.");if(r.ok)load()}
 if(!view)return <section className="grid min-h-[60vh] place-items-center"><p className="text-xl">Connecting to your class…</p></section>;
 if(!view.active)return <section className="mx-auto max-w-2xl px-5 py-16 text-center"><h1 className="serif text-4xl">The class discussion has ended.</h1><button onClick={onBack} className={`gold-button mt-8 ${big}`}>Back to my class</button></section>;
 const step=view.step,sent=view.expecting==="answer"?view.myAnswer:view.expecting==="takeaway"?view.myTakeaway:null;
 return <section className="mx-auto max-w-3xl px-5 py-8">
  <div className="flex items-center justify-between gap-3"><button onClick={onBack} className="text-base text-white/70 underline underline-offset-4">My class</button><p className="text-base text-white/70">Step {view.stepNumber} of {view.stepCount}</p></div>
  <div className="panel mt-4 p-6">
   {step.kind==="question"?<><p className="eyebrow">{step.stage.toUpperCase()} · {step.artifactName.toUpperCase()}</p><h1 className="serif mt-3 text-3xl leading-snug">{step.prompt}</h1><p className="mt-2 text-base text-white/70">Read as: {view.roleName}. The passage is on the board.</p></>
   :<><p className="flex items-center gap-2 text-xl font-bold text-[#f0d9b2]"><MessagesSquare size={22}/> STOP AND CHAT</p>{view.phase==="chat"?<><h1 className="serif mt-3 text-3xl leading-snug">{step.prompt}</h1>{step.realWorld&&<p className="mt-4 border-l-4 border-[#a5ae8a] pl-4 text-xl">{step.realWorld}</p>}<p className="mt-5 text-sm font-bold uppercase tracking-wide text-white/70">Talk moves</p><ul className="mt-2 space-y-2">{view.starters.map(s=><li key={s} className="border border-white/20 px-4 py-3 text-lg">{s}</li>)}</ul>{view.secondsLeft!=null&&<p className="mt-5 text-center font-mono text-5xl font-bold text-[#f0d9b2]">{Math.floor(view.secondsLeft/60)}:{String(view.secondsLeft%60).padStart(2,"0")}</p>}<p className="mt-4 text-center text-lg text-white/80">Talk out loud with your partner. No typing yet.</p></>:<h1 className="serif mt-3 text-3xl leading-snug">In one sentence: what changed or grew in your thinking after the chat?</h1>}</>}
   {view.expecting&&<form onSubmit={send} className="mt-6"><label className="block text-base">{view.expecting==="answer"?"Your answer":"Your takeaway"}<textarea value={draft} onChange={e=>setDraft(e.target.value.slice(0,1200))} rows={4} placeholder={sent?"You can change your answer and send again.":view.expecting==="answer"?"Point to a detail from the text…":"Before the chat I thought… Now I think…"} className="mt-2 w-full border border-white/25 bg-[#151716] p-3 text-lg leading-8"/></label><button disabled={busy||!draft.trim()} className={`gold-button mt-3 inline-flex w-full items-center justify-center gap-2 disabled:opacity-40 ${big}`}><Send size={16}/> {sent?"Send again":"Send to my class"}</button>{sent&&<p className="mt-3 text-base text-[#c4d0a6]"><Check size={15} className="mr-1 inline"/>Sent: “{sent}”</p>}{status&&!sent&&<p role="status" className="mt-3 text-base text-[#f0d9b2]">{status}</p>}</form>}
   {!view.expecting&&step.kind==="question"&&<p className="mt-6 text-lg text-[#f0d9b2]">Answers are closed. Look up at the board to see what your class wrote.{view.myAnswer&&<span className="mt-2 block text-base text-white/75">Your answer: “{view.myAnswer}”</span>}</p>}
  </div>
 </section>;
}
