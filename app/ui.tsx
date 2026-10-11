"use client";
import { HomeTop } from "./home";
import { DisplaySettings } from "./display-settings";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Download, Headphones, Info, Lightbulb, ShieldAlert, Waypoints } from "lucide-react";
import { pricing } from "@/config/pricing";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import {brand} from "@/config/brand";
import type { Demo } from "./page";
import { TeacherReview } from "./teacher-review";
import { Wordmark } from "./wordmark";
import { FluencyChecks } from "./fluency-checks";
import { TranslationReview } from "./translation-review";
import { LessonPlayer, MiniLessonLibrary } from "./mini-lessons";
import { WorldPackSchema, type WorldPack } from "@/lib/world-schema";
import { courseFilters, courseFitsBand, courseGrades, courseLabels, gradesFor, type Course } from "@/lib/standards";

function saveText(text: string, name: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; a.click(); }

// "Have a class code?" in the top bar takes a student straight to joining with the code filled in.
function ClassCodeField({onJoinCode,className=""}:{onJoinCode:(code:string)=>void;className?:string}){
  const [code,setCode]=useState("");
  return <form onSubmit={e=>{e.preventDefault();if(code.trim())onJoinCode(code.trim().toUpperCase())}} className={`items-center gap-2 ${className}`} aria-label="Join your class">
    <label htmlFor={`class-code-${className}`} className="sr-only">Have a class code?</label>
    <input id={`class-code-${className}`} value={code} onChange={e=>setCode(e.target.value)} placeholder="Have a class code?" autoCapitalize="characters" autoComplete="off" maxLength={24} className="h-11 w-full min-w-0 rounded-full border border-[#E4DCCB] bg-white px-4 text-[15px] uppercase placeholder:normal-case placeholder:text-[#6B6457] outline-none focus:border-[#A0472C] md:w-48"/>
    <button type="submit" disabled={!code.trim()} className="h-11 shrink-0 rounded-full bg-[#2A2620] px-4 text-[15px] font-semibold text-white disabled:opacity-40">Join</button>
  </form>;
}

export function Landing({ brand, onStart, onPreset, onJoin, onWaitlist, onPricing, onLessons, onClassroom, onApproach, onKeepReading, onTeacher, onRole, onJoinCode }: any) {
  const stories=[["The Legend of Sleepy Hollow","Washington Irving","Grades 6 to 8"],["The Tell-Tale Heart","Edgar Allan Poe","Grades 8 to 12"],["Trifles","Susan Glaspell","Grades 9 to 11"]];
  const steps=[["01","Open a clue","Students step into a scene from the story and pick a clue to examine."],["02","Question, then prove","They ask a character what happened. Characters can be wrong, so students tap the line in the text that backs them up or proves them wrong."],["03","Close the case","Every proven clue fills the evidence meter and moves them up the detective ranks. The finished case file is ready to print."]];
  const audiences:[string,string,string,string[],[string,()=>void]][]=[
    ["STUDENTS","Grades 6 to 12","Close reading that feels like solving a case, not filling out a worksheet.",["Short scenes, one clue at a time","Home-language help in Español, Kreyòl ayisyen, Português and Tiếng Việt","No email or password: a nickname is enough"],["Try a case",onStart]],
    ["TEACHERS","English and ELA classrooms","One class link and your students are reading in under a minute.",["Share a link or QR code; students type a nickname and start","See which evidence came from the story and which came from an AI character","Run a live class discussion and assign five-minute mini lessons","Aligned to Florida B.E.S.T., AP and Cambridge AICE"],["Teacher sign in",onClassroom]],
    ["SCHOOLS AND DISTRICTS","AI literacy inside ELA","Students learn that AI is a resource, not the source, by checking every AI answer against the text.",["School and district plans with an admin view","Professional development for teachers","Built by a practicing English teacher"],["See plans",onPricing]],
  ];
  return <div className="case-ui">
    <nav className="flex h-[70px] items-center justify-between px-5 md:px-14"><a className="text-2xl" href="#top"><Wordmark/></a><div className="hidden items-center gap-7 text-[14px] font-medium text-[#4A4438] lg:flex"><a href="#how" className="hover:text-[#A0472C]">How it works</a><a href="#who" className="hover:text-[#A0472C]">Who it's for</a><button onClick={onLessons} className="hover:text-[#A0472C]">Mini lessons</button><button onClick={onPricing} className="hover:text-[#A0472C]">Pricing</button><button onClick={onClassroom} className="hover:text-[#A0472C]">Teacher sign in</button></div><div className="flex items-center gap-3"><div className="hidden md:block"><DisplaySettings placement="header"/></div><ClassCodeField onJoinCode={onJoinCode} className="hidden md:flex"/><button className="case-primary !min-h-11 shrink-0 whitespace-nowrap !px-5 !text-[15px]" onClick={onStart}>Try the demo <ArrowRight size={16}/></button></div></nav>
    <div className="flex items-center gap-2 px-4 pb-2 md:hidden"><ClassCodeField onJoinCode={onJoinCode} className="flex min-w-0 flex-1"/><DisplaySettings placement="header"/></div>

    <HomeTop onKeepReading={onKeepReading} onStudent={onStart} onTeacher={onTeacher} onRole={onRole}/>


    <section id="how" className="border-t border-[#E4DCCB] bg-[#FFFDF8] px-5 py-16 md:px-14 md:py-20"><div className="mx-auto max-w-7xl">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">How a case works</p>
      <h2 className="serif mt-3 max-w-3xl text-[34px] leading-tight md:text-[44px]">AI can summarize any book. Text Lab makes students prove what's true.</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">{steps.map(([n,t,d])=><li key={n} className="rounded-3xl border border-[#E4DCCB] p-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#A0472C] text-[15px] font-bold text-white">{n}</span><h3 className="mt-5 text-[21px] font-bold">{t}</h3><p className="mt-2 text-[16px] leading-7 text-[#4A4438]">{d}</p></li>)}</ol>
    </div></section>

    <section id="who" className="px-5 py-16 md:px-14 md:py-20"><div className="mx-auto max-w-7xl">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Who it's for</p>
      <h2 className="serif mt-3 text-[34px] leading-tight md:text-[44px]">Built for the classroom, from the classroom.</h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">{audiences.map(([eyebrow,sub,lead,points,[cta,go]])=><div key={eyebrow} className="flex flex-col rounded-3xl bg-[#FFFDF8] p-7 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
        <p className="text-[13px] font-bold tracking-[.12em] text-[#8A3B23]">{eyebrow}</p><p className="mt-1 text-[15px] text-[#6B6457]">{sub}</p>
        <h3 className="mt-4 text-[22px] font-bold leading-snug">{lead}</h3>
        <ul className="mt-5 flex-1 space-y-3">{points.map(pt=><li key={pt} className="flex gap-3 text-[16px] leading-6 text-[#4A4438]"><Check size={18} className="mt-0.5 shrink-0 text-[#A0472C]"/>{pt}</li>)}</ul>
        <button onClick={go} className="case-secondary mt-7 w-fit">{cta} <ArrowRight size={16}/></button>
      </div>)}</div>
      <p className="mt-6 text-[15px] text-[#6B6457]">Teachers: want to see the data first? <button onClick={onTeacher} className="font-semibold text-[#8A3B23] underline underline-offset-4">Open a sample class report.</button></p>
    </div></section>

    <section className="border-t border-[#E4DCCB] bg-[#FFFDF8] px-5 py-16 md:px-14"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
      <div><p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Ready now</p><h2 className="serif mt-3 text-[34px] leading-tight">Three cases to open today. Twenty-four more on the way.</h2><p className="mt-4 text-[16px] leading-7 text-[#4A4438]">Classic stories from the texts teachers already assign, each built as a four-scene case with clues tied to the original text.</p></div>
      <ul className="grid gap-3">{stories.map(([t,a,g])=><li key={t}><button onClick={onStart} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E4DCCB] bg-[#F6F0E3] px-5 py-4 text-left transition hover:border-[#A0472C]"><span><span className="block text-[18px] font-bold">{t}</span><span className="text-[15px] text-[#6B6457]">{a} · {g}</span></span><ArrowRight size={18} className="shrink-0 text-[#A0472C]"/></button></li>)}</ul>
    </div></section>

    <section className="px-5 py-16 md:px-14"><div className="mx-auto max-w-3xl text-center">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Who built this</p>
      <p className="serif mt-3 text-[28px] leading-snug md:text-[32px]">Built by Ashley Hodges, a high school English teacher on Florida's Treasure Coast and the founder of {brand.organization}.</p>
      <p className="mt-4 text-[16px] leading-7 text-[#4A4438]">Every case is built from texts teachers already assign, and every clue is tied to a passage in the original story.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onApproach} className="case-secondary">Read our approach</button></div>
    </div></section>

    <footer className="flex flex-wrap justify-between gap-4 border-t border-[#E4DCCB] px-5 py-7 text-[13px] text-[#6B6457] md:px-14"><span>{brand.organization} · {brand.principle}.</span><div className="flex flex-wrap gap-5"><button onClick={onApproach}>Our approach</button><button onClick={onPricing}>Pricing</button><button onClick={onWaitlist}>Join the waitlist</button></div></footer>
  </div>;
}

type WorldSummary = {courses?:Course[];id:string;title:string;author:string;hook:string;grade_band:{min:number;max:number};estimated_minutes:number;cover_image:string;status:"playable"|"preview"|"coming_soon";teacher_preview_required:boolean;content_notes:string;available:boolean};
type CourseFilterId=(typeof courseFilters)[number]["id"];
const gradeRanges=[["6-8","Grades 6 to 8",6,8],["9-10","Grades 9 to 10",9,10],["11-12","Grades 11 to 12",11,12]] as const;
export function PickStory({onBack,onPick,onLessons,initialCourse="all"}:{onBack:()=>void;onPick:(worldId:string,course:CourseFilterId)=>void;onLessons?:()=>void;initialCourse?:CourseFilterId}) {
  const [worlds,setWorlds]=useState<WorldSummary[]>([]);
  const [gradeFilter,setGradeFilter]=useState("all");
  const [courseFilter,setCourseFilter]=useState<CourseFilterId>(initialCourse);
  useEffect(()=>{fetch("/worlds/index.json").then(r=>r.json()).then(setWorlds).catch(()=>setWorlds([]))},[]);
  const course=courseFilters.find(c=>c.id===courseFilter)!;
  // A story shows under a course only when it is tagged for that course AND its grade band overlaps the grades the course is taught in.
  const courseMatch=(w:WorldSummary)=>!course.courses.length||(w.courses??["best_ela"]).some(c=>course.courses.includes(c)&&courseFitsBand(c,w.grade_band));
  const courseRange=course.courses.length?{min:Math.min(...course.courses.map(c=>courseGrades[c].min)),max:Math.max(...course.courses.map(c=>courseGrades[c].max))}:{min:6,max:12};
  const visibleRanges=gradeRanges.filter(([, ,min,max])=>min<=courseRange.max&&max>=courseRange.min);
  const gradeMatch=(w:WorldSummary)=>{const r=gradeRanges.find(x=>x[0]===gradeFilter);return !r||(w.grade_band.min<=r[3]&&w.grade_band.max>=r[2])};
  const filtered=worlds.filter(courseMatch).filter(gradeMatch);
  const ready=filtered.filter(w=>w.available),soon=filtered.filter(w=>!w.available);
  function chooseCourse(id:CourseFilterId){setCourseFilter(id);setGradeFilter("all")}
  const chip=(active:boolean)=>`rounded-full border px-4 py-2 text-xs ${active?"border-[#A0472C] bg-[#A0472C]/10 text-[#A0472C]":"border-white/15 text-white/55"}`;
  const card=(w:WorldSummary)=>{const disabled=!w.available;const badge=w.status==="preview"?"PREVIEW · SCENE 1":w.status==="coming_soon"?"COMING SOON":"";const shown=(w.courses??[]).filter(c=>!course.courses.length||course.courses.includes(c));return <button key={w.id} disabled={disabled} aria-disabled={disabled} aria-label={`${w.title}, Grades ${w.grade_band.min} to ${w.grade_band.max}${disabled?", coming soon, unavailable":""}`} onClick={()=>onPick(w.id,courseFilter)} className={`panel overflow-hidden text-left transition ${!disabled?"hover:border-[#A0472C]/70":"cursor-not-allowed opacity-65"}`}><div className="relative aspect-[16/9] bg-[#E9E1CF]">{w.cover_image&&<img src={w.cover_image} alt={`${w.title} scene 1`} className="h-full w-full object-cover"/>}{badge&&<span className="absolute right-3 top-3 rounded-full bg-[#F6F0E3]/90 px-3 py-1.5 text-[10px] tracking-wide">{badge}</span>}</div><div className="p-5"><h2 className="serif text-2xl">{w.title}</h2><p className="mt-1 text-xs text-white/50">{w.author}</p><div className="mt-4 flex flex-wrap gap-4 text-xs text-[#A0472C]"><span>Grades {w.grade_band.min} to {w.grade_band.max}</span>{w.estimated_minutes>0&&<span>About {w.estimated_minutes} minutes</span>}</div><p className="mt-4 text-sm leading-6 text-white/65">{w.hook}</p>{shown.length>0&&<p className="mt-3 flex flex-wrap gap-1.5" aria-label="Fits these courses">{shown.map(c=><span key={c} title={courseLabels[c].long} className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/70">{courseLabels[c].short}</span>)}</p>}{w.content_notes&&<p className="mt-3 text-xs text-white/45">Content note: {w.content_notes}</p>}</div></button>};
  return <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14"><button onClick={onBack} className="mb-9 inline-flex items-center gap-2 text-xs text-white/55 hover:text-white"><ArrowLeft size={14}/> Back</button><p className="eyebrow">YOUR CASE BEGINS</p><h1 className="serif mt-3 text-5xl">Pick a story.</h1><p className="mt-3 text-sm text-white/60">Choose your course first. You will see only the stories that fit it.</p>{onLessons&&<p className="mt-2 text-sm text-white/60">New to analysis? <button onClick={onLessons} className="text-[#A0472C] underline underline-offset-4">Take a five-minute mini lesson first</button>.</p>}
   <p className="mt-7 text-xs uppercase tracking-wide text-white/60">1. Course</p><div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter stories by course">{courseFilters.map(f=><button key={f.id} onClick={()=>chooseCourse(f.id)} aria-pressed={courseFilter===f.id} className={chip(courseFilter===f.id)}>{f.label}</button>)}</div>
   {course.courses.length>0&&<p className="mt-2 text-xs text-white/55">{course.courses.map(c=>courseLabels[c].long).join(" · ")}</p>}
   {visibleRanges.length>1&&<><p className="mt-5 text-xs uppercase tracking-wide text-white/60">2. Grade</p><div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter stories by grade"><button onClick={()=>setGradeFilter("all")} aria-pressed={gradeFilter==="all"} className={chip(gradeFilter==="all")}>All grades</button>{visibleRanges.map(([value,label])=><button key={value} onClick={()=>setGradeFilter(value)} aria-pressed={gradeFilter===value} className={chip(gradeFilter===value)}>{label}</button>)}</div></>}
   {!worlds.length?<p className="mt-7 text-sm text-white/50">Stories are loading.</p>:<>
    <h2 className="eyebrow mt-9">READY TO PLAY · {ready.length}</h2>
    {ready.length?<div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{ready.map(card)}</div>:<p className="mt-3 text-sm text-white/60">No playable stories for this course and grade yet. The ones below are on the way.</p>}
    {soon.length>0&&<details className="mt-10 border-t border-white/10 pt-5"><summary className="cursor-pointer text-sm text-[#A0472C]">Coming soon for this course · {soon.length}</summary><div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{soon.map(card)}</div></details>}
   </>}
  </section>;
}

export function ChooseLevel({worldId,course="all",onBack,onChoose}:{worldId:string;course?:string;onBack:()=>void;onChoose:(grade:number)=>void}) {
  const [world,setWorld]=useState<WorldPack|null>(null);
  useEffect(()=>{fetch(`/worlds/${worldId}/world.json`).then(r=>r.json()).then(data=>setWorld(WorldPackSchema.parse(data))).catch(()=>setWorld(null))},[worldId]);
  if(!world)return <section className="mx-auto max-w-5xl px-5 py-12"><button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-white/55"><ArrowLeft size={14}/> Back</button><p className="mt-10 eyebrow">LOADING STORY LEVELS</p></section>;
  const grades=gradesFor(world.grade_band,courseFilters.find(c=>c.id===course)?.courses??[]);
  return <section className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-14"><button onClick={onBack} className="mb-9 inline-flex items-center gap-2 text-xs text-white/55 hover:text-white"><ArrowLeft size={14}/> Back</button><p className="eyebrow">{world.title.toUpperCase()} · CHOOSE A LEVEL</p><h1 className="serif mt-3 text-5xl">Choose a level.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Pick your grade. The story stays the same; the support around it changes.</p><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{grades.map(grade=>{const adaptation=world.adaptations.find(a=>a.grade===grade);return <button key={grade} onClick={()=>onChoose(grade)} className="panel min-h-36 p-5 text-left hover:border-[#A0472C]/70"><span className="eyebrow">GRADE</span><h2 className="serif mt-2 text-3xl">{grade}</h2><p className="mt-3 text-xs leading-5 text-white/60">{adaptation?.description||"Standard supports available on request"}</p></button>})}</div></section>;
}

export function Teacher({ demo, setDemo, onStudent, onPreset, onClassroom }: { demo: Demo; setDemo: React.Dispatch<React.SetStateAction<Demo>>; onStudent: () => void; onPreset: (preset: string) => void; onClassroom?: () => void }) {
  const roster = ["Maple","Cedar","Northstar","Bluejay","Pencil","Comet","Harbor","Fern","Orbit","River","Clover","Mica","Juniper","Sol","Ember","Cloud","Birch","Echo","Sparrow","Luna","Ash","Quartz","Wren","Sage"];
  const counts = { Explorer: 8, Practitioner: 11, Leader: 5 };
  const [tab,setTab]=useState<"report"|"fluency"|"lessons"|"languages">("report");const [teacherLesson,setTeacherLesson]=useState("");
  const tabs=<div className="mb-6 border-b border-white/15 pb-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-[#A0472C]/50 bg-[#A0472C]/[.06] p-4"><p className="text-base text-white/85"><b>Ready for real students?</b> Create a class code, assign mini lessons, and run a live class analysis with Stop and Chat.</p>{onClassroom&&<button onClick={onClassroom} className="gold-button min-h-12 px-5 py-3 text-sm">Go to My Classes</button>}</div><div role="tablist" aria-label="Teacher Studio sections" className="flex flex-wrap gap-2">{([["report","Reading Resource Report","How students worked in the story"],["fluency","Fluency Checks","One-minute reading checks and FAST"],["lessons","Mini Lessons","Skill lessons to teach before reading"],["languages","Bilingual Supports","Home-language help and review"]] as const).map(([id,label,hint])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`min-h-12 border px-5 py-2 text-left ${tab===id?"border-[#A0472C] bg-[#A0472C]/15 text-[#8A3B23]":"border-white/25 text-white/80 hover:border-white/50"}`}><span className="block text-base font-bold">{label}</span><span className="block text-xs text-white/65">{hint}</span></button>)}</div></div>;
  const quickStart=<details open className="panel mb-6 p-5 md:p-6"><summary className="cursor-pointer text-lg font-bold text-[#8A3B23]">New here? Start with these four steps</summary><ol className="mt-4 grid gap-3 md:grid-cols-4">{[["Try it as a student","Press “Student” at the top right. Pick a story, a grade, and a role, and play for five minutes."],["Come back here","Press “Teacher.” This page shows how your class worked: evidence saved, glossary use, and safety flags."],["Check fluency","Open “Fluency Checks” for one-minute reading checks, or “Mini Lessons” to teach a skill before reading."],["Save or print","Use “Export CSV” for a spreadsheet, or download a student packet as a PDF."]].map(([title,body],i)=><li key={title} className="border border-white/20 p-4"><p className="text-base font-bold text-[#A0472C]">{i+1}. {title}</p><p className="mt-1 text-sm leading-6 text-white/80">{body}</p></li>)}</ol><p className="mt-3 text-sm text-white/70">Need bigger text? Use “Text size” at the top right of any screen.</p></details>;
  if(tab==="languages")return <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">{tabs}<p className="eyebrow">TEACHER STUDIO</p><h1 className="serif mt-2 text-4xl">Bilingual Supports</h1><div className="mt-6"><TranslationReview/></div></section>;
  if(tab==="lessons")return <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">{tabs}<p className="eyebrow">TEACHER STUDIO</p><h1 className="serif mt-2 text-4xl">Mini Lessons</h1><div className="mt-6">{teacherLesson?<LessonPlayer teacherView lessonId={teacherLesson} grade={null} onFinish={()=>{}} onClose={()=>setTeacherLesson("")}/>:<MiniLessonLibrary grade={null} done={{}} onOpen={setTeacherLesson} heading="Teach the skill before the story" intro="Open any lesson to preview it the way students see it, project it for the whole class, or print it with the answer key. Students can also take these on their own from the story briefing screen. Each lesson lists its B.E.S.T. benchmarks and its AP and Cambridge connections."/>}</div></section>;
  if(tab==="fluency")return <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">{tabs}<p className="eyebrow">TEACHER STUDIO</p><h1 className="serif mt-2 text-4xl">Fluency Checks</h1><FluencyChecks sandboxId={demo.id}/></section>;
  return <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">{quickStart}{tabs}<div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">TEACHER STUDIO · THE TELL-TALE HEART</p><h1 className="serif mt-2 text-4xl">Reading Resource Report</h1><p className="mt-2 text-sm text-white/50">Simulated class · 24 invented nicknames · sandbox expires after 24 hours</p></div><div className="flex gap-2"><button onClick={() => saveText([["Nickname","Progress","AI Fluency Ladder","Glossary opens"],...roster.map((n,i)=>[n,i<18?"Complete":"In progress",["Explorer","Practitioner","Leader"][i%3],n==="Maple"?String(demo.glossaryOpens):""])].map(r=>r.join(",")).join("\n"),"reading-resource-report.csv")} className="soft-button flex items-center gap-2 px-4 py-2.5 text-xs"><Download size={13}/> EXPORT CSV</button><button className="gold-button px-4 py-2.5 text-xs" onClick={onStudent}>STUDENT VIEW</button></div></div>
    <p className="mt-6 border border-[#A0472C]/40 bg-[#A0472C]/10 p-3 text-sm leading-6 text-[#7A3420]"><b>Sample class data.</b> This dashboard shows a demo class of 24 students so you can see what a teacher sees. These numbers are not calculated from your own typing.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Students in session","24","invented demo learners"],["Scenes reached","3.2 / 4","class average"],["Text evidence saved",String(demo.evidence||19),"across drafts"],["Glossary opens",String(demo.glossaryOpens??0),"this sandbox student"],["Safety flags",String(demo.flags.length),"review promptly"]].map(([k,v,s])=><div key={k} className="panel p-5"><p className="eyebrow">{k}</p><p className="serif mt-3 text-4xl">{v}</p><p className="mt-2 text-xs text-white/40">{s}</p></div>)}</div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="panel p-5 md:p-7"><p className="eyebrow">AI FLUENCY LADDER</p><h2 className="serif mt-2 text-2xl">How learners worked with AI</h2><div className="mt-7 space-y-5">{Object.entries(counts).map(([n,num],i)=><div key={n}><p className="flex justify-between text-sm">{n}<span className="text-xs text-white/60">{["Ask then check the source.","Use precise questions; compare AI with text.","Flag contradictions and cite evidence."][i]} <b className="ml-3 font-normal">{num}</b></span></p><div className="mt-2 h-1.5 bg-white/10"><div className="h-full bg-[#c3aa78]" style={{width:`${num/24*100}%`}}/></div></div>)}</div><div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-xs"><div><p className="eyebrow">WHERE STUDENT EVIDENCE CAME FROM</p><div className="mt-2 flex h-2"><span className="w-[68%] bg-[#aab58c]"/><span className="w-[32%] bg-[#b38a61]"/></div><p className="mt-2 text-white/60">68% quoted from the story · 32% from AI character answers</p><p className="mt-1 text-white/40">Higher story share means students checked the AI against the text.</p></div><div><p className="eyebrow">TRACE QUESTIONS</p><p className="serif mt-2 text-2xl">+18%</p><p className="text-white/45">grounded answers after TRACE</p></div></div></div>
      <div className="space-y-4"><div className="panel p-5"><p className="eyebrow">SAFETY REVIEW</p><h2 className="serif mt-2 text-2xl">Student flags</h2>{demo.flags.length ? demo.flags.map((f,i)=><div key={`${f}-${i}`} className="mt-4 border border-amber-200/20 p-3"><ShieldAlert size={14} className="mr-2 inline text-[#A0472C]"/>{f} · needs review<p className="mt-1 text-xs text-white/45">Support shown; character stepped out of role.</p></div>) : <p className="mt-3 text-sm text-white/45">No unreviewed flags in this preset.</p>}</div><div className="panel p-5"><p className="eyebrow">JEv · MOCK REPORT</p><h2 className="serif mt-2 text-xl">Learning signals</h2><p className="mt-3 text-xs leading-6 text-white/60">82% scaffolds · 76% recall · 71% text-linked real-world connections</p></div><div className="panel p-5"><p className="eyebrow">DEMO PRESETS</p><div className="mt-3 flex gap-2"><button onClick={() => onPreset("teacher_mid_unit")} className="soft-button px-3 py-2 text-xs">MID-UNIT</button><button onClick={() => onPreset("teacher_end_unit")} className="soft-button px-3 py-2 text-xs">END-UNIT</button></div></div></div></div>
    <div className="panel mt-4 p-5"><p className="eyebrow">CLASS ROSTER</p><p className="serif mt-1 text-xl">Progress snapshot</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{roster.slice(0,8).map((n,i)=><div key={n} className="flex justify-between border border-white/10 p-3 text-sm">{n}<span className="text-[10px] text-white/45">{i<5?"Scene 4 · Leader":"Scene 2 · Explorer"}</span></div>)}</div></div>
    <TeacherReview demo={demo} setDemo={setDemo}/>
  </section>;
}

export function Waitlist() {
  const [done, setDone] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true);setError("");try { const response=await fetch("/api/waitlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))}); const result=await response.json();if(!response.ok)throw new Error(result.error);setDone(true); } catch(e) { setError(e instanceof Error?e.message:"Could not save your entry."); } finally { setBusy(false); } }
  return <section className="mx-auto grid min-h-[calc(100vh-58px)] max-w-5xl items-center gap-10 px-5 py-12 md:grid-cols-2"><div><p className="eyebrow">BE PART OF WHAT’S NEXT</p><h1 className="serif mt-4 text-5xl">Bring the text<br/><i className="text-[#A0472C]">to life.</i></h1><p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Join educators exploring what happens when students can question the voices inside the story.</p></div><div className="panel p-6 md:p-8">{done?<div className="py-10 text-center"><Check className="mx-auto text-[#A0472C]" size={30}/><h2 className="serif mt-5 text-3xl">You’re on the list.</h2><p className="mt-3 text-sm text-white/55">Thanks for joining us.</p></div>:<><p className="eyebrow">JOIN THE WAITLIST</p><form onSubmit={submit} className="mt-5 space-y-3">{[["name","Name","text"],["email","Email","email"],["organization","School or organization","text"]].map(([name,label,type])=><label key={name} className="block text-xs text-white/55">{label}<input required name={name} type={type} className="mt-1 block w-full border border-white/15 bg-[#F6F0E3] px-3 py-3 text-sm"/></label>)}<label className="block text-xs text-white/55">Your role<select required name="role" defaultValue="" className="mt-1 block w-full border border-white/15 bg-[#F6F0E3] px-3 py-3 text-sm"><option value="" disabled>Select one</option>{["teacher","instructional coach","administrator","district leader","homeschool parent","microschool leader","EdTech","other"].map(x=><option key={x}>{x}</option>)}</select></label><button disabled={busy} className="gold-button w-full py-3 text-xs">{busy?"SAVING…":"SAVE MY PLACE"} <ArrowRight className="ml-2 inline" size={13}/></button></form><p className="mt-3 text-xs text-[#A0472C]">{error}</p></>}</div></section>;
}

type JoinedAuth={token:string;nickname:string;className:string|null;resumePhrase?:string|null};
type SavedClass={code:string;session:{world_id:string;grade:number};auth:JoinedAuth};
const savedKey=(code:string)=>`textlab-class-${code}`;
function readSaved(code:string):SavedClass|null{try{const v=JSON.parse(localStorage.getItem(savedKey(code))||"null");return v?.auth?.token&&v?.session?.world_id?v:null}catch{return null}}
// Join screen. From a class link the code is already filled in, so a student types only a nickname and taps Start.
// A student returning on the same device gets one button: Continue as [nickname].
export function Join({initialCode="",onJoined}:{initialCode?:string;onJoined:(session:{world_id:string;grade:number},auth:JoinedAuth)=>void}) {
  const [code,setCode]=useState(initialCode);const [nickname,setNickname]=useState("");const [phrase,setPhrase]=useState("");const [returning,setReturning]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState<SavedClass|null>(null);
  useEffect(()=>{if(initialCode)setSaved(readSaved(initialCode))},[initialCode]);
  const fromLink=!!initialCode;
  async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError("");try{const classCode=code.trim().toUpperCase();const response=await fetch("/api/students/join",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({classCode,nickname,resumePhrase:returning&&phrase?phrase:undefined})});const data=await response.json();if(!response.ok)throw new Error(data.error);
    const auth:JoinedAuth={token:data.token,nickname:data.student?.nickname??nickname,className:data.session?.name??null,resumePhrase:data.resumePhrase??null};const session={world_id:data.session.world_id,grade:data.session.grade};
    try{localStorage.setItem(savedKey(classCode),JSON.stringify({code:classCode,session,auth:{...auth,resumePhrase:null}}))}catch{}
    onJoined(session,auth);}catch(e){setError(e instanceof Error?e.message:"We couldn't join this class. Try again.");setBusy(false)}}
  const input="mt-2 block w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3.5 text-[18px] outline-none focus:border-[#A0472C]";
  return <section className="case-ui mx-auto grid min-h-[calc(100vh-70px)] max-w-md content-center px-5 py-12">
   <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">{fromLink?`Class ${initialCode}`:"Join your class"}</p>
   {saved?<>
    <h1 className="mt-2 text-[34px] font-bold leading-tight">Welcome back, {saved.auth.nickname}.</h1>
    <button onClick={()=>onJoined(saved.session,{...saved.auth,resumePhrase:null})} className="case-primary mt-8 w-full">Continue as {saved.auth.nickname} <ArrowRight size={18}/></button>
    <button onClick={()=>{try{localStorage.removeItem(savedKey(initialCode))}catch{}setSaved(null)}} className="mt-4 text-[15px] text-[#6B6457] underline underline-offset-4">Not {saved.auth.nickname}? Join as someone new</button>
   </>:<form onSubmit={submit}>
    <h1 className="mt-2 text-[34px] font-bold leading-tight">What should we call you?</h1>
    <p className="mt-2 text-[16px] text-[#6B6457]">Use a nickname, not your full name. No email or password.</p>
    {!fromLink&&<label className="mt-6 block text-[15px] font-semibold">Class code<input required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={24} autoComplete="off" className={`${input} font-mono tracking-widest`}/></label>}
    <label className="mt-5 block text-[15px] font-semibold">Nickname<input required autoFocus data-autofocus value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={32} autoComplete="off" className={input}/></label>
    {returning&&<label className="mt-5 block text-[15px] font-semibold">Resume phrase<input required value={phrase} onChange={e=>setPhrase(e.target.value)} placeholder="amber-river-lantern-nine" autoComplete="off" className={input}/></label>}
    <button disabled={busy} className="case-primary mt-6 w-full disabled:opacity-60">{busy?"Opening your story…":returning?"Pick up where I left off":"Start"} {!busy&&<ArrowRight size={18}/>}</button>
    {error&&<p role="alert" className="mt-4 text-[15px] text-[#A33B20]">{error}</p>}
    <button type="button" onClick={()=>{setReturning(v=>!v);setError("")}} className="mt-5 text-[15px] text-[#6B6457] underline underline-offset-4">{returning?"First time here? Start fresh":"Returning on a new device?"}</button>
   </form>}
  </section>;
}

export function Pricing({onWaitlist,onApproach}:{onWaitlist:()=>void;onApproach?:()=>void}) { return <section className="mx-auto max-w-6xl px-5 py-14"><p className="eyebrow text-center">SIMPLE PLANS · NO CHECKOUT</p><h1 className="serif mt-4 text-center text-5xl">Room to grow.</h1>{onApproach&&<p className="mt-3 text-center text-xs text-white/50">Wondering why we built this? <button onClick={onApproach} className="text-[#A0472C] underline-offset-4 hover:underline">Read our approach</button>.</p>}<div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{pricing.map((p,i)=><div key={p.name} className="panel flex min-h-[335px] flex-col p-6"><p className="eyebrow">{p.name.toUpperCase()}</p><p className="serif mt-5 text-3xl">{p.price}</p><p className="mt-1 text-xs text-white/45">{p.cadence}</p><p className="mt-4 text-sm">{p.detail}</p><ul className="mt-5 flex-1 space-y-3 border-t border-white/10 pt-5">{p.features.map(f=><li key={f} className="text-xs text-white/65"><Check className="mr-2 inline text-[#A0472C]" size={13}/>{f}</li>)}</ul><button onClick={onWaitlist} className={`mt-6 w-full py-3 text-xs ${i===1?"gold-button":"soft-button"}`}>JOIN THE WAITLIST</button></div>)}</div></section>; }

export function Owner({data,status,setStatus}:{data:any[];status:string;setStatus:(s:string)=>void}) {
  const [message,setMessage]=useState("");
  async function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const email=String(new FormData(e.currentTarget).get("email"));const supabase=getBrowserSupabase();if(!supabase){setMessage("Connect this app to its Supabase project before requesting a sign-in link.");return}const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/?owner=1`}});setMessage(error?error.message:"Check your inbox for a private sign-in link.");}
  function exportCsv(){const rows=[["name","email","role","organization","created_at"],...data.map(x=>[x.name,x.email,x.role,x.organization,x.created_at])];saveText(rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),"inside-the-text-waitlist.csv");}
  return <section className="mx-auto max-w-3xl px-5 py-16"><div className="panel p-8"><p className="eyebrow">OWNER ACCESS · WAITLIST</p><h1 className="serif mt-3 text-4xl">Private project view</h1><p className="mt-3 text-sm leading-6 text-white/55">Waitlist data requires magic-link sign-in and the configured owner email.</p>{data.length===0?<form onSubmit={login} className="mt-6 flex gap-2"><input required type="email" name="email" placeholder="Owner email" className="min-w-0 flex-1 border border-white/15 bg-[#F6F0E3] px-3 py-3 text-sm"/><button className="gold-button px-4 text-xs">SEND MAGIC LINK</button></form>:<><div className="mt-5 flex justify-between"><p>{data.length} entries</p><button onClick={exportCsv} className="soft-button flex gap-2 px-3 py-2 text-xs"><Download size={13}/> EXPORT CSV</button></div>{["teacher","instructional coach","administrator","district leader","homeschool parent","microschool leader","EdTech","other"].map(r=><span key={r} className="mr-2 text-xs text-white/60">{r}: {data.filter(x=>x.role===r).length}</span>)}{data.map(x=><p key={x.id} className="border-b border-white/10 py-3 text-sm">{x.name} · {x.email} · {x.role} · {x.organization}</p>)}</>}{(message||status)&&<p className="mt-3 text-xs text-[#A0472C]">{message||status}</p>}<button className="mt-3 text-xs text-white/40" onClick={()=>setStatus("")}> </button></div></section>;
}

export { Student } from "./student";
