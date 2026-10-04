"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Copy,Eye,EyeOff,MessagesSquare,Play,Square,Timer,Users} from "lucide-react";
import {getBrowserSupabase} from "@/lib/supabase-browser";
import {miniLessons,lessonGroups} from "@/lib/mini-lessons";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import {stageLabels,talkStarters,secondsLeft,type LivePlan,type LiveStep,type Phase,type Stage} from "@/lib/classroom/plan";
import {HelpTip} from "./help-tip";

const big="min-h-12 px-5 py-3 text-sm md:text-base";
const field="mt-1 block w-full min-h-12 border border-white/25 bg-[#F6F0E3] px-3 py-3 text-base";
const DEV_KEY="itt-dev-teacher";

// Teacher requests carry the Supabase magic-link session. Local development without Supabase can pass ?devTeacher=email.
async function teacherFetch(path:string,init:RequestInit={}){
 const headers=new Headers(init.headers);headers.set("Content-Type","application/json");
 const token=(await getBrowserSupabase()?.auth.getSession())?.data.session?.access_token;
 if(token)headers.set("Authorization",`Bearer ${token}`);
 try{const dev=sessionStorage.getItem(DEV_KEY);if(dev&&!token)headers.set("x-dev-teacher",dev)}catch{}
 const response=await fetch(path,{...init,headers});
 const body=await response.json().catch(()=>({}));
 return {ok:response.ok,status:response.status,body};
}

type ClassSummary={id:string;name:string|null;class_code:string;world_id:string;grade:number;studentCount:number;worldTitle:string;created_at:string};
type WorldOption={id:string;title:string;grade_band:{min:number;max:number};available:boolean};

export function Classroom({onBack}:{onBack:()=>void}){
 const [state,setState]=useState<"loading"|"signin"|"unavailable"|"ready">("loading");
 const [email,setEmail]=useState(""),[classes,setClasses]=useState<ClassSummary[]>([]),[message,setMessage]=useState("");
 const [openClass,setOpenClass]=useState(""),[presenting,setPresenting]=useState("");
 const load=useCallback(async()=>{const r=await teacherFetch("/api/teacher/classes");if(r.status===401||r.status===403){setState("signin");setMessage(r.status===403?r.body.error:"");return}if(!r.ok){setState("unavailable");setMessage(r.body.error||"Classes are not available right now.");return}setEmail(r.body.email);setClasses(r.body.classes);setState("ready")},[]);
 useEffect(()=>{try{const dev=new URLSearchParams(window.location.search).get("devTeacher");if(dev)sessionStorage.setItem(DEV_KEY,dev)}catch{}load()},[load]);
 async function signOut(){await getBrowserSupabase()?.auth.signOut();try{sessionStorage.removeItem(DEV_KEY)}catch{}setState("signin");setClasses([])}
 if(presenting&&openClass)return <LivePresenter classId={openClass} onExit={()=>setPresenting("")}/>;
 return <section className="mx-auto max-w-[1180px] px-5 py-8 md:px-10">
  <button onClick={openClass?()=>{setOpenClass("");load()}:onBack} className={`soft-button inline-flex items-center gap-2 ${big}`}><ArrowLeft size={16}/> {openClass?"All my classes":"Back"}</button>
  {state==="loading"&&<p className="mt-8 text-base text-white/70">Loading your classes…</p>}
  {state==="unavailable"&&<div className="panel mt-6 p-6"><h1 className="serif text-3xl">My classes</h1><p className="mt-3 text-base text-white/80">{message}</p></div>}
  {state==="signin"&&<TeacherSignIn note={message}/>}
  {state==="ready"&&!openClass&&<ClassList email={email} classes={classes} onOpen={setOpenClass} onCreated={load} onSignOut={signOut}/>}
  {state==="ready"&&openClass&&<ClassDetail classId={openClass} onPresent={()=>setPresenting(openClass)}/>}
 </section>;
}

function TeacherSignIn({note}:{note:string}){
 const [email,setEmail]=useState(""),[status,setStatus]=useState(note),[busy,setBusy]=useState(false);
 async function send(e:React.FormEvent){e.preventDefault();setBusy(true);const supabase=getBrowserSupabase();if(!supabase){setStatus("Teacher sign-in is not set up on this server yet.");setBusy(false);return}const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/?teacher=1`}});setStatus(error?error.message:"Check your email for a sign-in link. Open it on this device.");setBusy(false)}
 return <div className="panel mx-auto mt-6 max-w-xl p-6 md:p-8"><p className="eyebrow">TEACHERS</p><h1 className="serif mt-2 text-4xl">Sign in to your classes</h1><p className="mt-3 text-base leading-7 text-white/80">Enter your school email. We will send you a link; there is no password to remember.</p><form onSubmit={send} className="mt-5"><label className="block text-base">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className={field}/></label><button disabled={busy} className={`gold-button mt-4 w-full ${big}`}>{busy?"Sending…":"Email me a sign-in link"}</button></form>{status&&<p role="status" className="mt-4 text-base text-[#8A3B23]">{status}</p>}</div>;
}

function ClassList({email,classes,onOpen,onCreated,onSignOut}:{email:string;classes:ClassSummary[];onOpen:(id:string)=>void;onCreated:()=>void;onSignOut:()=>void}){
 const [worlds,setWorlds]=useState<WorldOption[]>([]),[name,setName]=useState(""),[worldId,setWorldId]=useState(""),[grade,setGrade]=useState(8),[error,setError]=useState(""),[busy,setBusy]=useState(false),[showForm,setShowForm]=useState(classes.length===0);
 useEffect(()=>{fetch("/worlds/index.json").then(r=>r.json()).then((list:WorldOption[])=>{const ok=list.filter(w=>w.available);setWorlds(ok);if(ok[0]){setWorldId(ok[0].id);setGrade(ok[0].grade_band.min)}}).catch(()=>{})},[]);
 const world=worlds.find(w=>w.id===worldId);
 async function create(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const r=await teacherFetch("/api/teacher/classes",{method:"POST",body:JSON.stringify({name,worldId,grade})});setBusy(false);if(!r.ok){setError(r.body.error||"Could not create the class.");return}setName("");setShowForm(false);onCreated();onOpen(r.body.class.id)}
 return <div className="mt-6 space-y-5">
  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">TEACHER</p><h1 className="serif mt-2 text-4xl">My classes</h1><p className="mt-1 text-sm text-white/65">Signed in as {email}</p></div><div className="flex gap-2"><button onClick={()=>setShowForm(s=>!s)} className={`gold-button ${big}`}>+ New class</button><button onClick={onSignOut} className={`soft-button ${big}`}>Sign out</button></div></div>
  {showForm&&<form onSubmit={create} className="panel grid gap-4 p-6 md:grid-cols-4"><label className="text-base md:col-span-2">Class name<input required value={name} onChange={e=>setName(e.target.value.slice(0,80))} placeholder="For example: 3rd period English 9" className={field}/></label><label className="text-base">Story<select value={worldId} onChange={e=>{setWorldId(e.target.value);const w=worlds.find(x=>x.id===e.target.value);if(w)setGrade(w.grade_band.min)}} className={field}>{worlds.map(w=><option key={w.id} value={w.id}>{w.title}</option>)}</select></label><label className="text-base">Grade<select value={grade} onChange={e=>setGrade(Number(e.target.value))} className={field}>{world&&Array.from({length:world.grade_band.max-world.grade_band.min+1},(_,i)=>world.grade_band.min+i).map(g=><option key={g} value={g}>Grade {g}</option>)}</select></label><button disabled={busy||!worldId} className={`gold-button md:col-span-4 ${big}`}>{busy?"Creating…":"Create class and get a class code"}</button>{error&&<p className="text-base text-[#A33B20] md:col-span-4">{error}</p>}</form>}
  {classes.length===0?!showForm&&<p className="text-base text-white/75">No classes yet. Create one to get a class code.</p>:<div className="grid gap-4 md:grid-cols-2">{classes.map(c=><button key={c.id} onClick={()=>onOpen(c.id)} className="panel p-5 text-left hover:border-[#A0472C]"><p className="text-xl font-bold">{c.name||"Untitled class"}</p><p className="mt-1 text-base text-white/75">{c.worldTitle} · Grade {c.grade}</p><p className="mt-3 flex flex-wrap gap-4 text-base"><span>Code <b className="font-mono tracking-widest text-[#8A3B23]">{c.class_code}</b></span><span className="text-white/70"><Users size={15} className="mr-1 inline"/>{c.studentCount} students</span></p><p className="mt-3 text-sm text-[#A0472C]">Open class <ArrowRight size={14} className="inline"/></p></button>)}</div>}
 </div>;
}

type Detail={class:{id:string;name:string|null;class_code:string;grade:number;preview_enabled:boolean};students:{id:string;nickname:string}[];assignments:{lesson_id:string;due_date:string|null}[];completions:{student_id:string;lesson_id:string;first_try_correct:number;total:number}[];activeAnalysisId:string|null;world:{title:string;teacherPreviewRequired:boolean;scenes:{id:string;clues:number}[];roles:{id:string;name:string}[]}|null};

// QR code for the class link, drawn as SVG in the browser. Projected on the board, students scan it to join.
function JoinQr({url}:{url:string}){
 const [svg,setSvg]=useState("");
 useEffect(()=>{let live=true;if(!url)return;import("qrcode").then(m=>((m as unknown as {default?:{toString:typeof m.toString}}).default??m).toString(url,{type:"svg",margin:1,color:{dark:"#2A2620",light:"#FFFDF8"}})).then(out=>{if(live)setSvg(out)}).catch(()=>{});return()=>{live=false}},[url]);
 return svg?<div role="img" aria-label={`QR code for ${url}`} className="h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-[#FFFDF8] p-1 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{__html:svg}}/>:null;
}

function ClassDetail({classId,onPresent}:{classId:string;onPresent:()=>void}){
 const [data,setData]=useState<Detail|null>(null),[tab,setTab]=useState<"students"|"lessons"|"live">("live"),[error,setError]=useState(""),[copied,setCopied]=useState(false);
 const load=useCallback(async()=>{const r=await teacherFetch(`/api/teacher/classes/${classId}`);if(r.ok)setData(r.body);else setError(r.body.error||"Could not load this class.")},[classId]);
 useEffect(()=>{load();const t=window.setInterval(load,8000);return()=>window.clearInterval(t)},[load]);
 if(error)return <p className="mt-6 text-base text-[#A33B20]">{error}</p>;
 if(!data)return <p className="mt-6 text-base text-white/70">Loading class…</p>;
 const c=data.class;
 const joinUrl=typeof window!=="undefined"?`${window.location.origin}/c/${c.class_code}`:"";
 return <div className="mt-6 space-y-5">
  <div className="panel flex flex-wrap items-center justify-between gap-5 p-6"><div><p className="eyebrow">CLASS</p><h1 className="serif mt-2 text-4xl">{c.name||"Untitled class"}</h1><p className="mt-1 text-base text-white/75">{data.world?.title} · Grade {c.grade} · {data.students.length} students joined</p></div><div className="flex flex-wrap items-center gap-5"><JoinQr url={joinUrl}/><div className="text-right"><p className="text-sm text-white/70">Students scan the code or open this link, then type a nickname:</p><p className="mt-1 break-all font-mono text-lg font-bold text-[#8A3B23]">{joinUrl.replace(/^https?:\/\//,"")}</p><button onClick={()=>{navigator.clipboard?.writeText(joinUrl);setCopied(true);setTimeout(()=>setCopied(false),1500)}} className="mt-2 text-sm text-white/70 underline underline-offset-4"><Copy size={13} className="mr-1 inline"/>{copied?"Copied":"Copy class link"}</button><p className="mt-2 text-xs text-white/60">Without the link: class code <span className="font-mono font-bold tracking-widest">{c.class_code}</span></p></div></div></div>
  {data.world?.teacherPreviewRequired&&<div className="panel flex flex-wrap items-center justify-between gap-3 p-5"><p className="text-base text-white/85">This story has content notes, so students cannot join until you enable it after previewing.</p><button onClick={async()=>{await teacherFetch(`/api/teacher/classes/${classId}`,{method:"PATCH",body:JSON.stringify({previewEnabled:!c.preview_enabled})});load()}} className={`${c.preview_enabled?"soft-button":"gold-button"} ${big}`}>{c.preview_enabled?"Enabled · turn off":"I previewed it · enable for students"}</button></div>}
  <div role="tablist" className="flex flex-wrap gap-2">{([["live","Live class analysis"],["lessons","Assign mini lessons"],["students","Students"]] as const).map(([id,label])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`border ${big} ${tab===id?"border-[#A0472C] bg-[#A0472C]/15 text-[#8A3B23]":"border-white/25 text-white/80"}`}>{label}</button>)}</div>
  {tab==="live"&&<LivePlanner classId={classId} detail={data} onStarted={onPresent}/>}
  {tab==="lessons"&&<AssignLessons classId={classId} detail={data} onChange={load}/>}
  {tab==="students"&&<div className="panel p-6"><h2 className="serif text-2xl">Students</h2>{data.students.length===0?<p className="mt-3 text-base text-white/75">No one has joined yet. Share the class code above.</p>:<ul className="mt-4 grid gap-2 md:grid-cols-3">{data.students.map(s=>{const done=data.completions.filter(x=>x.student_id===s.id&&data.assignments.some(a=>a.lesson_id===x.lesson_id)).length;return <li key={s.id} className="border border-white/20 p-3"><p className="text-base font-bold">{s.nickname}</p><p className="text-sm text-white/70">{done} of {data.assignments.length} assigned lessons finished</p></li>})}</ul>}</div>}
 </div>;
}

function AssignLessons({classId,detail,onChange}:{classId:string;detail:Detail;onChange:()=>void}){
 const [due,setDue]=useState<Record<string,string>>({}),[busy,setBusy]=useState("");
 const assigned=new Map(detail.assignments.map(a=>[a.lesson_id,a]));
 async function assign(lessonId:string){setBusy(lessonId);await teacherFetch(`/api/teacher/classes/${classId}/assignments`,{method:"POST",body:JSON.stringify({lessonId,dueDate:due[lessonId]||null})});setBusy("");onChange()}
 async function remove(lessonId:string){if(!window.confirm("Remove this lesson from the class? Students keep any progress they made."))return;setBusy(lessonId);await teacherFetch(`/api/teacher/classes/${classId}/assignments?lessonId=${encodeURIComponent(lessonId)}`,{method:"DELETE"});setBusy("");onChange()}
 return <div className="panel p-6"><h2 className="serif text-2xl">Assign mini lessons</h2><p className="mt-2 text-base text-white/80">Assigned lessons appear on every student’s class page. You will see who has finished each one and how many practice questions they got right on the first try.</p>
  {lessonGroups.map(group=><div key={group} className="mt-6"><h3 className="text-sm font-bold uppercase tracking-wide text-white/75">{group}</h3><ul className="mt-3 space-y-2">{miniLessons.filter(l=>l.group===group).map(l=>{const a=assigned.get(l.id);const finished=detail.completions.filter(x=>x.lesson_id===l.id);return <li key={l.id} className={`border p-4 ${a?"border-[#A0472C]/60 bg-[#A0472C]/[.05]":"border-white/15"}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-base font-bold">{l.title}</p><p className="text-sm text-white/70">{l.minutes} minutes · Grades {l.grades.min} to {l.grades.max}{a?.due_date?` · Due ${a.due_date}`:""}</p></div>{a?<div className="flex flex-wrap items-center gap-3"><span className="text-base"><Check size={15} className="mr-1 inline text-[#8A3B23]"/>{finished.length} of {detail.students.length} finished</span><button disabled={busy===l.id} onClick={()=>remove(l.id)} className={`soft-button ${big}`}>Remove</button></div>:<div className="flex flex-wrap items-end gap-2"><label className="text-sm text-white/75">Due date (optional)<input type="date" value={due[l.id]??""} onChange={e=>setDue(d=>({...d,[l.id]:e.target.value}))} className="mt-1 block min-h-12 border border-white/25 bg-[#F6F0E3] px-3 text-base"/></label><button disabled={busy===l.id} onClick={()=>assign(l.id)} className={`gold-button ${big}`}>Assign to class</button></div>}</div>{a&&finished.length>0&&<details className="mt-3"><summary className="cursor-pointer text-sm text-[#A0472C]">Who finished</summary><p className="mt-2 text-sm text-white/80">{finished.map(f=>`${detail.students.find(s=>s.id===f.student_id)?.nickname??"Student"} (${f.first_try_correct}/${f.total})`).join(" · ")}</p></details>}</li>})}</ul></div>)}
 </div>;
}

function LivePlanner({classId,detail,onStarted}:{classId:string;detail:Detail;onStarted:()=>void}){
 const scenes=detail.world?.scenes.filter(s=>s.clues>0)??[];
 const [sceneId,setSceneId]=useState(scenes[0]?.id??""),[roleId,setRoleId]=useState(detail.world?.roles[0]?.id??""),[stages,setStages]=useState<Stage[]>(["notice","interpret"]),[chatEach,setChatEach]=useState(true),[seconds,setSeconds]=useState(120),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const scene=scenes.find(s=>s.id===sceneId);
 const stepCount=scene?scene.clues*stages.length+(chatEach?scene.clues:1):0;
 async function start(){setBusy(true);setError("");const r=await teacherFetch(`/api/teacher/classes/${classId}/live`,{method:"POST",body:JSON.stringify({sceneId,roleId,stages,chatAfterEachClue:chatEach,chatSeconds:seconds})});setBusy(false);if(!r.ok){setError(r.body.error||"Could not start.");return}onStarted()}
 const toggle=(s:Stage)=>setStages(list=>list.includes(s)?list.filter(x=>x!==s):[...list,s]);
 return <div className="panel p-6"><h2 className="serif text-2xl">Live class analysis</h2><p className="mt-2 max-w-3xl text-base leading-7 text-white/80">Project this on your board. Students answer each question on their own devices; you see how many have answered, then reveal the answers without names. Stop and Chat pauses give partners time to talk out loud before everyone writes a one-sentence takeaway.</p>
  {detail.activeAnalysisId&&<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#A0472C]/60 p-4"><p className="text-base">A live analysis is already running for this class.</p><button onClick={onStarted} className={`gold-button ${big}`}><Play size={16} className="mr-2 inline"/>Return to it</button></div>}
  {!scenes.length?<p className="mt-4 text-base text-white/75">This story has no clues to analyze yet.</p>:<div className="mt-6 grid gap-5 md:grid-cols-2">
   <label className="text-base">Scene<select value={sceneId} onChange={e=>setSceneId(e.target.value)} className={field}>{scenes.map(s=><option key={s.id} value={s.id}>{s.id.replaceAll("-"," ")} · {s.clues} clues</option>)}</select></label>
   <label className="text-base">Read as which role? <HelpTip label="Why?">Each story’s questions are written for a role, such as an investigator or reporter. Pick the lens your class will use together.</HelpTip><select value={roleId} onChange={e=>setRoleId(e.target.value)} className={field}>{detail.world?.roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
   <fieldset className="text-base"><legend>Questions for each clue</legend><div className="mt-2 flex flex-wrap gap-2">{(["notice","interpret","craft"] as Stage[]).map(s=><button key={s} type="button" aria-pressed={stages.includes(s)} onClick={()=>toggle(s)} className={`border ${big} ${stages.includes(s)?"border-[#A0472C] bg-[#A0472C]/15 text-[#8A3B23]":"border-white/25"}`}>{stages.includes(s)?"✓ ":""}{stageLabels[s]}</button>)}</div></fieldset>
   <fieldset className="text-base"><legend>Stop and Chat</legend><label className="mt-2 flex min-h-12 items-center gap-3"><input type="checkbox" checked={chatEach} onChange={e=>setChatEach(e.target.checked)} className="h-5 w-5"/>After every clue (otherwise once, at the end)</label><label className="mt-2 block">Talk time<select value={seconds} onChange={e=>setSeconds(Number(e.target.value))} className={field}>{[60,90,120,180].map(s=><option key={s} value={s}>{s/60} minute{s===60?"":"s"}</option>)}</select></label></fieldset>
  </div>}
  {scene&&<p className="mt-5 text-base text-white/75">{stepCount} steps · about {Math.round(stepCount*2.5)} minutes</p>}
  <button disabled={busy||!stages.length||!scenes.length} onClick={start} className={`gold-button mt-4 w-full disabled:opacity-40 ${big}`}>{busy?"Starting…":"Start live analysis"}</button>{error&&<p className="mt-3 text-base text-[#A33B20]">{error}</p>}
 </div>;
}

type LiveData={analysis:{id:string;plan:LivePlan;step:number;phase:Phase;chatStartedAt:string|null;status:string}|null;studentCount:number;responses:{id:string;kind:"answer"|"takeaway";text:string;nickname:string;flagged:boolean}[];serverNow:string};

// The projected screen. Large type, one action at a time, and student names hidden unless the teacher turns them on.
function LivePresenter({classId,onExit}:{classId:string;onExit:()=>void}){
 const [data,setData]=useState<LiveData|null>(null),[showNames,setShowNames]=useState(false),[now,setNow]=useState(Date.now()),[skew,setSkew]=useState(0),[source,setSource]=useState<SourcePassage[]>([]),[busy,setBusy]=useState(false),[reviewOpen,setReviewOpen]=useState(false);
 const load=useCallback(async()=>{const r=await teacherFetch(`/api/teacher/classes/${classId}/live`);if(r.ok){setData(r.body);if(r.body.serverNow)setSkew(Date.parse(r.body.serverNow)-Date.now())}},[classId]);
 useEffect(()=>{load();const t=window.setInterval(load,2000),c=window.setInterval(()=>setNow(Date.now()),250);return()=>{window.clearInterval(t);window.clearInterval(c)}},[load]);
 const worldId=data?.analysis?.plan.worldId;
 useEffect(()=>{if(worldId)fetch(`/worlds/${worldId}/source.md`).then(r=>r.text()).then(t=>setSource(parseSourcePassages(t))).catch(()=>{})},[worldId]);
 async function move(action:string){setBusy(true);await teacherFetch(`/api/teacher/classes/${classId}/live`,{method:"PATCH",body:JSON.stringify({action})});setBusy(false);setReviewOpen(false);await load()}
 const a=data?.analysis;
 const step:LiveStep|undefined=a?.plan.steps[a.step];
 const passages=useMemo(()=>step?.kind==="question"?source.filter(p=>step.passageIds.includes(p.id)):[],[step,source]);
 if(!data)return <section className="grid min-h-[70vh] place-items-center"><p className="text-xl">Loading…</p></section>;
 if(!a||!step)return <section className="mx-auto max-w-3xl px-5 py-16 text-center"><h1 className="serif text-5xl">Analysis complete</h1><p className="mt-4 text-lg text-white/80">Nice work, everyone.</p><button onClick={onExit} className={`gold-button mt-8 ${big}`}>Back to the class</button></section>;
 const kind=a.phase==="takeaway"?"takeaway":"answer";
 const current=data.responses.filter(r=>r.kind===kind);
 const visible=current.filter(r=>!r.flagged),flagged=current.filter(r=>r.flagged);
 const left=step.kind==="chat"?secondsLeft(step,a.chatStartedAt,now+skew):null;
 return <section className="min-h-[calc(100vh-58px)] px-5 py-6 md:px-10">
  <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3"><button onClick={onExit} className={`soft-button inline-flex items-center gap-2 ${big}`}><ArrowLeft size={16}/> Class page</button><p className="text-base text-white/75">{a.plan.worldTitle} · {a.plan.sceneTitle} · Step {a.step+1} of {a.plan.steps.length}</p><div className="flex gap-2"><button onClick={()=>setShowNames(s=>!s)} className={`soft-button inline-flex items-center gap-2 ${big}`}>{showNames?<EyeOff size={16}/>:<Eye size={16}/>} {showNames?"Hide names":"Show names"}</button><button onClick={()=>{if(window.confirm("End the live analysis for everyone?"))move("end")}} className={`soft-button ${big}`}>End</button></div></div>
  <div className="mx-auto mt-3 h-2 max-w-[1280px] bg-white/10"><div className="h-full bg-[#A0472C]" style={{width:`${((a.step+1)/a.plan.steps.length)*100}%`}}/></div>
  <div className="mx-auto mt-6 max-w-[1280px]">
   {step.kind==="question"?<div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
    <div className="panel p-6 md:p-8"><p className="eyebrow">{stageLabels[step.stage].toUpperCase()} · {step.artifactName.toUpperCase()}</p><h1 className="serif mt-3 text-3xl leading-snug md:text-[44px]">{step.prompt}</h1><p className="mt-4 text-lg text-white/75">Reading as: {a.plan.roleName}</p>
     <div className="mt-8 flex flex-wrap items-center gap-6"><p className="text-6xl font-bold tabular-nums text-[#8A3B23]">{current.length}<span className="text-3xl text-white/60"> / {data.studentCount}</span></p><p className="text-xl text-white/80">students have answered</p></div></div>
    <div className="rounded-sm bg-[#f4efe4] p-6 text-[#0f1b19] md:p-8"><p className="text-sm font-bold uppercase tracking-wide text-[#8A3B23]">From the text</p>{passages.length?passages.map(p=><p key={p.id} className="serif mt-3 text-xl leading-9"><span className="mr-2 font-mono text-sm text-[#A0472C]">¶{Number(p.id.slice(1))}</span>{p.text}</p>):<p className="mt-3 text-lg">Loading the passage…</p>}</div>
   </div>
   :<div className="panel p-6 md:p-10"><p className="flex items-center gap-3 text-2xl font-bold text-[#8A3B23]"><MessagesSquare size={30}/> STOP AND CHAT</p>
     {a.phase==="chat"?<div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><h1 className="serif text-3xl leading-snug md:text-[44px]">{step.prompt}</h1>{step.realWorld&&<div className="mt-6 border-l-4 border-[#A0472C] pl-5"><p className="text-sm font-bold uppercase tracking-wide text-[#8A3B23]">Real-world connection</p><p className="mt-2 text-2xl leading-snug">{step.realWorld}</p></div>}<div className="mt-6"><p className="text-sm font-bold uppercase tracking-wide text-white/70">Talk moves</p><ul className="mt-2 grid gap-2 md:grid-cols-2">{talkStarters.map(s=><li key={s} className="border border-white/20 px-4 py-3 text-xl">{s}</li>)}</ul></div></div>
      <div className="flex flex-col items-center justify-center rounded-sm border border-white/20 p-6 text-center">{left==null?<><Timer size={40} className="text-[#A0472C]"/><p className="mt-3 text-xl">{step.seconds/60} minute{step.seconds===60?"":"s"} to talk</p><button disabled={busy} onClick={()=>move("start_timer")} className={`gold-button mt-5 ${big}`}>Start the talk timer</button></>:<><p className={`font-mono text-[96px] font-bold leading-none tabular-nums ${left===0?"text-[#A33B20]":"text-[#8A3B23]"}`}>{Math.floor(left/60)}:{String(left%60).padStart(2,"0")}</p><p className="mt-3 text-xl">{left===0?"Time’s up. Bring it back together.":"Talk with your partner"}</p></>}</div></div>
     :<div className="mt-5"><h1 className="serif text-3xl md:text-[44px]">Quick takeaway</h1><p className="mt-3 text-2xl text-white/85">On your device: in one sentence, what changed or grew in your thinking after the chat?</p><div className="mt-8 flex flex-wrap items-center gap-6"><p className="text-6xl font-bold tabular-nums text-[#8A3B23]">{current.length}<span className="text-3xl text-white/60"> / {data.studentCount}</span></p><p className="text-xl text-white/80">takeaways in</p></div></div>}
    </div>}
   {(a.phase==="reveal"||a.phase==="takeaway")&&<div className="mt-6"><h2 className="text-xl font-bold">{a.phase==="reveal"?"Class answers":"Takeaways"} {!showNames&&<span className="text-base font-normal text-white/65">· names hidden</span>}</h2>{visible.length===0?<p className="mt-3 text-lg text-white/70">No answers yet.</p>:<div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map(r=><div key={r.id} className="border border-white/20 bg-white/[.03] p-4 text-lg leading-8">{r.text}{showNames&&<p className="mt-2 text-sm text-[#A0472C]">{r.nickname}</p>}</div>)}</div>}{flagged.length>0&&<div className="mt-4"><button onClick={()=>setReviewOpen(o=>!o)} className="text-base text-[#A33B20] underline underline-offset-4">{flagged.length} response{flagged.length>1?"s":""} held for your private review</button>{reviewOpen&&<ul className="mt-2 space-y-2">{flagged.map(r=><li key={r.id} className="border border-[#A33B20]/50 p-3 text-base">{r.nickname}: {r.text}</li>)}</ul>}</div>}</div>}
   <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/15 pt-5"><button disabled={busy||a.step===0} onClick={()=>move("back")} className={`soft-button inline-flex items-center gap-2 disabled:opacity-30 ${big}`}><ArrowLeft size={16}/> Previous step</button><div className="flex flex-wrap gap-3">
    {step.kind==="question"&&a.phase==="answer"&&<button disabled={busy} onClick={()=>move("reveal")} className={`gold-button inline-flex items-center gap-2 ${big}`}><Square size={16}/> Close answers and show them</button>}
    {step.kind==="chat"&&a.phase==="chat"&&<button disabled={busy} onClick={()=>move("takeaway")} className={`gold-button ${big}`}>Ask for takeaways</button>}
    {(a.phase==="reveal"||a.phase==="takeaway")&&<button disabled={busy} onClick={()=>move("next")} className={`gold-button inline-flex items-center gap-2 ${big}`}>{a.step>=a.plan.steps.length-1?"Finish":"Next step"} <ArrowRight size={16}/></button>}
   </div></div>
  </div>
 </section>;
}

