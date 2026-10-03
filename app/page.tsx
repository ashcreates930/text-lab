"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { createDemoSandboxId, isDemoSandboxExpired } from "@/lib/demo-sandbox";
import type { AnalysisReport, SavedTextEvidence } from "@/lib/analysis-report";
import type { AuthorshipRange } from "@/lib/authorship";
import { AccessGate } from "./access-gate";
import { FeedbackBanner } from "./feedback-banner";
import { DisplaySettings } from "./display-settings";
import { Classroom } from "./classroom";
import { ClassHome, ClassLive, type ClassAuth } from "./class-student";
import { LessonPlayer, MiniLessonLibrary, type LessonRecord } from "./mini-lessons";
import { Landing, Join, Owner, Pricing, Student, Teacher, Waitlist, PickStory, ChooseLevel } from "./ui";

type View = "landing" | "story" | "level" | "play" | "teacher" | "waitlist" | "pricing" | "owner" | "join" | "lessons" | "classroom" | "classhome" | "classlive";
// Pricing and waitlist stay public; the owner screen has its own magic-link check.
// Class sessions sit outside the demo gate: the class code is their gate, so class students never receive the demo cookie or its device ID.
const ungatedViews: View[] = ["pricing", "waitlist", "owner", "join", "classroom"];
const classViews: View[] = ["play", "classhome", "classlive"];
const demoViews: View[] = ["story", "level", "play", "teacher", "lessons"];
export type Demo = {
  id:string;created: number; preset: string; worldId:string; grade:number|null; role: string; scene: number; events: string[];
  flags: string[]; messages: { q: string; a: string }[]; narrative: string;
  think: boolean; thinkSupport:boolean; thinkAnswers:Record<string,string>; trace: boolean; evidence: number; connection: string;
  myWords:string[]; glossaryOpens:number; suggestedArtifactType:string; readAloudOn:boolean; hintFrequency:"often"|"sometimes"|"on_request"|"off"; sentenceStartersOn:boolean;
  resumePhrase: string; submitted: boolean;
  artifactAnswers:Record<string,{notice:string;interpret:string;craft:string;technique:string;revisions:string[];history?:{stage:"notice"|"interpret"|"craft";text:string;submitted_at:string}[]}>;
  openedArtifacts:string[]; activeArtifact:string; artifactStage:number; artifactDialogOpen:boolean;
  briefingComplete:boolean; savedTextEvidence:SavedTextEvidence[]; authorshipRanges:AuthorshipRange[]; analysisReport?:AnalysisReport;
  previewComplete?:boolean; course?:"all"|"best"|"ap"|"aice"; lessonsDone?:Record<string,LessonRecord>; portionUnlocks?:string[]; classAuth?:ClassAuth;
};
type ScreenSnapshot = { insideTheTextScreen: true; sequence: number; view: View; demo: Demo };
let pendingHeadingObserver: MutationObserver | null = null;
function focusScreenTop() {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousScrollBehavior;
  const heading = document.querySelector<HTMLElement>("main h1");
  if (heading) {
    pendingHeadingObserver?.disconnect();
    pendingHeadingObserver = null;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  } else {
    pendingHeadingObserver?.disconnect();
    const main = document.querySelector("main");
    if (main) {
      pendingHeadingObserver = new MutationObserver(() => {
        const loadedHeading = main.querySelector<HTMLElement>("h1");
        if (!loadedHeading) return;
        pendingHeadingObserver?.disconnect();
        pendingHeadingObserver = null;
        if (!loadedHeading.hasAttribute("tabindex")) loadedHeading.setAttribute("tabindex", "-1");
        loadedHeading.focus({ preventScroll: true });
      });
      pendingHeadingObserver.observe(main, { childList: true, subtree: true });
    }
  }
}
const newDemo = (preset: string,worldId="tell-tale-heart"): Demo => ({
  id:createDemoSandboxId(),created: Date.now(), preset, worldId, grade:null, role: "", scene: preset === "student_first_visit" ? 0 : 2,
  events: [], flags: [], messages: [], narrative: "", think: false, thinkSupport:false, thinkAnswers:{}, trace: false,
  myWords:[],glossaryOpens:0,suggestedArtifactType:"observed",readAloudOn:false,hintFrequency:"on_request",sentenceStartersOn:false,
  evidence: 0, connection: "", resumePhrase: "", submitted: false,
  artifactAnswers:{},openedArtifacts:[],activeArtifact:"",artifactStage:0,artifactDialogOpen:false,briefingComplete:false,savedTextEvidence:[],authorshipRanges:[],
});

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [demo, setDemo] = useState<Demo>(() => newDemo("student_first_visit"));
  const [ownerData, setOwnerData] = useState<any[]>([]);
  const [ownerStatus, setOwnerStatus] = useState("");
  const [access, setAccess] = useState<"checking" | "granted" | "locked">("checking");
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState("");
  const classSession = demo.preset === "class_student";
  const gated = access !== "granted" && !ungatedViews.includes(view) && !(classViews.includes(view) && classSession);
  const focusedScreenKey = useRef<string | null>(null);
  const historyScreenKey = useRef<string | null>(null);
  const historyReady = useRef(false);
  const restoringHistory = useRef(false);
  const studentStep = demo.previewComplete ? "preview-end" : !demo.role ? "role-selection" : !demo.briefingComplete ? "role-briefing" : !demo.think ? "think-check-in" : `scene-${demo.scene}`;
  const screenKey = gated ? `access:${access}` : view === "play" ? `play:${demo.worldId}:${studentStep}` : view === "teacher" ? `teacher:${demo.preset}` : view;

  useLayoutEffect(() => {
    if (focusedScreenKey.current !== screenKey) {
      focusScreenTop();
      focusedScreenKey.current = screenKey;
    }
  }, [screenKey]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const snapshot = event.state as ScreenSnapshot | null;
      if (snapshot?.insideTheTextScreen) {
        restoringHistory.current = true;
        setView(snapshot.view);
        setDemo(snapshot.demo);
      } else {
        focusScreenTop();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const current = window.history.state as ScreenSnapshot | null;
    if (!historyReady.current) {
      const snapshot: ScreenSnapshot = { insideTheTextScreen: true, sequence:current?.insideTheTextScreen && Number.isFinite(current.sequence) ? current.sequence : 0, view, demo };
      window.history.replaceState(snapshot, "", window.location.href);
      historyReady.current = true;
      historyScreenKey.current = screenKey;
    } else if (restoringHistory.current) {
      restoringHistory.current = false;
      const snapshot: ScreenSnapshot = { insideTheTextScreen: true, sequence:current?.insideTheTextScreen && Number.isFinite(current.sequence) ? current.sequence : 0, view, demo };
      window.history.replaceState(snapshot, "", window.location.href);
      historyScreenKey.current = screenKey;
    } else if (historyScreenKey.current !== screenKey) {
      const snapshot: ScreenSnapshot = { insideTheTextScreen: true, sequence:current?.insideTheTextScreen && Number.isFinite(current.sequence) ? current.sequence + 1 : 1, view, demo };
      window.history.pushState(snapshot, "", window.location.href);
      historyScreenKey.current = screenKey;
    } else {
      const snapshot: ScreenSnapshot = { insideTheTextScreen: true, sequence:current?.insideTheTextScreen && Number.isFinite(current.sequence) ? current.sequence : 0, view, demo };
      window.history.replaceState(snapshot, "", window.location.href);
    }
  }, [demo, screenKey, view]);

  useEffect(() => {
    fetch("/api/access").then(r => r.json()).then(body => { setAccess(body.granted ? "granted" : "locked"); setFeedbackUrl(body.feedbackUrl ?? null); }).catch(() => setAccess("locked"));
  }, []);

  async function loadOwnerWaitlist() {
    const session = (await getBrowserSupabase()?.auth.getSession())?.data.session;
    if (!session) return;
    const response = await fetch("/api/owner/waitlist", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (response.ok) setOwnerData((await response.json()).entries);
    else setOwnerStatus("Only the configured owner email can view this list.");
  }
  useEffect(() => {
    try {
      const id=sessionStorage.getItem("itt-active-sandbox-id");
      const saved = id?sessionStorage.getItem(`itt-sandbox-${id}`):null;
      if (saved) {
        const parsed = JSON.parse(saved) as Demo;
        parsed.artifactAnswers??={};parsed.lessonsDone??={};parsed.openedArtifacts??=[];parsed.activeArtifact??="";parsed.artifactStage??=0;parsed.artifactDialogOpen??=false;parsed.savedTextEvidence??=[];parsed.authorshipRanges??=(parsed.narrative?[{start:0,end:parsed.narrative.length,source:"typed"}]:[]);parsed.briefingComplete??=!!parsed.role;parsed.thinkAnswers??={};parsed.myWords??=[];parsed.glossaryOpens??=0;parsed.suggestedArtifactType??="observed";parsed.readAloudOn??=false;parsed.hintFrequency??="on_request";parsed.sentenceStartersOn??=false;
        if (!isDemoSandboxExpired(parsed.created)) { setDemo(parsed); const savedView=sessionStorage.getItem(`itt-sandbox-view-${id}`) as View|null; if(savedView&&["story","level","play","teacher","lessons","classhome","classlive"].includes(savedView))setView(savedView); }
        else {sessionStorage.removeItem(`itt-sandbox-${id}`);sessionStorage.removeItem("itt-active-sandbox-id");}
      }
    } catch { sessionStorage.removeItem("itt-active-sandbox-id"); }
    const params = new URLSearchParams(window.location.search);
    if (params.get("teacher") === "1") {
      setView("classroom");
      const code = params.get("code");
      if (code) getBrowserSupabase()?.auth.exchangeCodeForSession(code).finally(() => window.history.replaceState({}, "", "/"));
    } else if (params.has("code")) {
      setView("owner");
      getBrowserSupabase()?.auth.exchangeCodeForSession(params.get("code")!).then(async () => {
        window.history.replaceState({}, "", "/"); await loadOwnerWaitlist();
      });
    } else if (params.get("owner") === "1") {
      setView("owner"); getBrowserSupabase()?.auth.getSession().then(({ data }) => { if (data.session) loadOwnerWaitlist(); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (["story","level","play","teacher","lessons","classhome","classlive"].includes(view)) {sessionStorage.setItem("itt-active-sandbox-id",demo.id);sessionStorage.setItem(`itt-sandbox-${demo.id}`,JSON.stringify(demo));sessionStorage.setItem(`itt-sandbox-view-${demo.id}`,view);if(demo.resumePhrase)localStorage.setItem(`itt-resume-${demo.resumePhrase}`,JSON.stringify(demo));}
    else if(view==="landing")sessionStorage.removeItem(`itt-sandbox-view-${demo.id}`);
    const remaining=demo.created+86_400_000-Date.now();
    if(remaining<=0){sessionStorage.removeItem(`itt-sandbox-${demo.id}`);return}
    const timer=window.setTimeout(()=>{sessionStorage.removeItem(`itt-sandbox-${demo.id}`);sessionStorage.removeItem("itt-active-sandbox-id");setDemo(newDemo("student_first_visit"));setView("landing")},remaining);
    return ()=>window.clearTimeout(timer);
  }, [demo, view]);

  function start(preset: string,worldId="tell-tale-heart",grade:number|null=null) {
    const next = newDemo(preset,worldId);
    next.grade=grade;
    if (preset.startsWith("teacher")) {
      next.scene = preset === "teacher_mid_unit" ? 2 : 3;
      next.role = "investigator"; next.think = true;
      next.events = Array.from({ length: 24 }, (_, i) => i % 5 === 0 ? "leader" : i % 3 === 0 ? "practitioner" : "explorer");
      next.flags = preset === "teacher_mid_unit" ? ["Maple"] : [];
      next.evidence = preset === "teacher_end_unit" ? 37 : 19;
      next.narrative = preset === "teacher_end_unit" ? "The narrator called himself calm, yet his account says that he paced, grew pale, and spoke louder as the sound grew. Those details make his version difficult to trust." : "";
    }
    setDemo(next); setView(preset.startsWith("teacher") ? "teacher" : preset==="student_first_visit" ? "story" : "play");
  }
  function chooseStory(worldId:string,course:"all"|"best"|"ap"|"aice"="all"){setDemo(d=>({...d,worldId,course,grade:null,role:"",think:false,previewComplete:false,scene:0}));setView("level")}
  function chooseGrade(grade:number){setDemo(d=>({...d,grade,role:"",think:false,previewComplete:false,scene:0}));setView("play")}
  function tryAnotherStory(){setDemo(d=>({...d,role:"",briefingComplete:false,think:false,previewComplete:false,scene:0}));setView("story")}
  function joinClass(session:{world_id:string;grade:number},auth:ClassAuth){const next=newDemo("class_student",session.world_id);next.grade=session.grade;next.scene=0;next.classAuth=auth;setDemo(next);setView("classhome")}
  function backToPreviousScreen(fallback:()=>void) {
    const current = window.history.state as ScreenSnapshot | null;
    if (current?.insideTheTextScreen && current.sequence > 0) window.history.back();
    else fallback();
  }

  if (gated) return <main className="min-h-screen bg-[#171918] text-[#eee9df]"><DisplaySettings/>{access === "locked" && <AccessGate brand={brand} onGranted={url => { setAccess("granted"); setFeedbackUrl(url); }} onPricing={() => setView("pricing")} onWaitlist={() => setView("waitlist")} onJoinClass={() => setView("join")} />}</main>;

  return <main className="min-h-screen bg-[#171918] text-[#eee9df]">
    {view !== "landing" && <header className="sticky top-0 z-30 flex min-h-[58px] items-center justify-between border-b border-white/10 bg-[#171918]/95 px-5 md:px-10">
      <button onClick={() => setView("landing")} className="flex items-center gap-2"><span className="serif text-xl">{brand.name}</span><span className="hidden text-xs text-white/45 sm:block">by {brand.organization}</span></button>
      {(view==="story"||view==="level"||view==="play")&&demo.preset!=="class_student"?<nav aria-label="Demo steps" className="flex items-center gap-2 text-[10px] tracking-wide sm:gap-3">{["Story","Level","Role"].map((step,i)=><span key={step} aria-current={(view==="story"&&i===0)||(view==="level"&&i===1)||(view==="play"&&i===2)?"step":undefined} className={(view==="story"&&i===0)||(view==="level"&&i===1)||(view==="play"&&i===2)?"text-[#dfb675]":"text-white/40"}>{i>0&&<span className="mr-2 text-white/25">·</span>}{step}</span>)}</nav>:<span className="hidden items-center gap-2 text-xs text-white/45 md:flex"><span>{brand.organization}</span><span aria-hidden="true">·</span><span className="eyebrow">FIELD EXPERIENCE</span></span>}
      <div className="flex items-center gap-2"><DisplaySettings placement="header"/>
      {classSession && demo.classAuth ? <button onClick={() => setView("classhome")} className={`rounded-full border px-4 py-2 text-xs ${view === "classhome" ? "border-[#dfb675] bg-[#dfb675] text-black" : "border-white/25 text-white/80"}`}>My class</button> : view === "classroom" ? null : <div className="flex gap-1 rounded-full border border-white/15 p-1 text-[11px]">
        <button onClick={() => setView("play")} className={`rounded-full px-3 py-1.5 ${view === "play" ? "bg-[#dfb675] text-black" : "text-white/65"}`}>Student</button>
        <button onClick={() => setView("teacher")} className={`rounded-full px-3 py-1.5 ${view === "teacher" ? "bg-[#dfb675] text-black" : "text-white/65"}`}>Teacher</button>
      </div>}</div>
    </header>}
    {demoViews.includes(view) && !classSession && <FeedbackBanner url={feedbackUrl} />}
    {view === "landing" && <Landing brand={brand} onStart={() => start("student_first_visit")} onPreset={start} onJoin={() => setView("join")} onWaitlist={() => setView("waitlist")} onLessons={() => { setActiveLesson(""); setView("lessons"); }} onPricing={() => setView("pricing")} onOwner={() => setView("owner")} onClassroom={() => setView("classroom")} />}
    {view === "lessons" && <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">{activeLesson ? <LessonPlayer lessonId={activeLesson} grade={demo.grade} onClose={() => { setActiveLesson(""); window.scrollTo(0, 0); }} onFinish={(id, record) => setDemo(d => ({ ...d, lessonsDone: { ...(d.lessonsDone ?? {}), [id]: record } }))} /> : <><button onClick={() => backToPreviousScreen(() => setView("landing"))} className="mb-8 inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">← Back</button><h1 className="sr-only">Mini lessons</h1><MiniLessonLibrary grade={demo.grade} done={demo.lessonsDone ?? {}} onOpen={id => { setActiveLesson(id); window.scrollTo(0, 0); }} /><button onClick={() => setView("story")} className="gold-button mt-10 px-6 py-4 text-sm">Ready? Pick a story →</button></>}</section>}
    {view === "story" && <PickStory onLessons={() => { setActiveLesson(""); setView("lessons"); }} onBack={()=>backToPreviousScreen(()=>setView("landing"))} onPick={chooseStory} initialCourse={demo.course??"all"} />}
    {view === "level" && <ChooseLevel worldId={demo.worldId} course={demo.course??"all"} onBack={()=>backToPreviousScreen(()=>setView("story"))} onChoose={chooseGrade} />}
    {view === "play" && <Student demo={demo} setDemo={setDemo} onTeacher={() => setView("teacher")} onBackScreen={()=>backToPreviousScreen(()=>setView("level"))} onBackToLevel={()=>backToPreviousScreen(()=>demo.preset==="class_student"?setView("join"):setView("level"))} onWaitlist={()=>setView("waitlist")} onTryAnotherStory={tryAnotherStory} feedbackUrl={feedbackUrl} />}
    {view === "teacher" && <Teacher demo={demo} setDemo={setDemo} onStudent={() => setView("play")} onPreset={start} onClassroom={() => setView("classroom")} />}
    {view === "classroom" && <Classroom onBack={() => backToPreviousScreen(() => setView("landing"))} />}
    {view === "classhome" && demo.classAuth && <ClassHome auth={demo.classAuth} onStory={() => setView("play")} onLive={() => setView("classlive")} />}
    {view === "classlive" && demo.classAuth && <ClassLive auth={demo.classAuth} onBack={() => setView("classhome")} />}
    {view === "waitlist" && <Waitlist />}
    {view === "pricing" && <Pricing onWaitlist={() => setView("waitlist")} />}
    {view === "join" && <Join onJoined={joinClass} />}
    {view === "owner" && <Owner data={ownerData} status={ownerStatus} setStatus={setOwnerStatus} />}
    {view === "landing" && <DisplaySettings/>}
  </main>;
}
