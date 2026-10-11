"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { createDemoSandboxId, isDemoSandboxExpired } from "@/lib/demo-sandbox";
import type { AnalysisReport, SavedTextEvidence } from "@/lib/analysis-report";
import type { AuthorshipRange } from "@/lib/authorship";
import { AccessGate } from "./access-gate";
import { Approach } from "./approach";
import { CaseFlow } from "./case";
import { Wordmark } from "./wordmark";
import { HeaderLanguage, saveHomeLanguage, savedHomeLanguage } from "./bilingual";
import { FeedbackBanner } from "./feedback-banner";
import { DisplaySettings } from "./display-settings";
import { Classroom } from "./classroom";
import type { HomeLanguage } from "@/lib/bilingual";
import { Tutorial, type TutorialHandle } from "./tutorial";
import { Shelf } from "./shelf";
import { TeacherDemo } from "./teacher-demo";
import { ClassBar, ClassHome, ClassLive, type ClassAuth } from "./class-student";
import { LessonPlayer, MiniLessonLibrary, type LessonRecord } from "./mini-lessons";
import { Landing, Join, Owner, Pricing, Student, Teacher, Waitlist, PickStory, ChooseLevel } from "./ui";

type View = "landing" | "story" | "level" | "play" | "teacher" | "waitlist" | "pricing" | "owner" | "join" | "lessons" | "classroom" | "classhome" | "classlive" | "approach" | "tutorial" | "shelf" | "teacherdemo";
// Pricing and waitlist stay public; the owner screen has its own magic-link check.
// Class sessions sit outside the demo gate: the class code is their gate, so class students never receive the demo cookie or its device ID.
const ungatedViews: View[] = ["teacherdemo", "tutorial", "approach", "pricing", "waitlist", "owner", "join", "classroom"];
const classViews: View[] = ["shelf", "play", "classhome", "classlive"];
const demoViews: View[] = ["shelf", "story", "level", "play", "teacher", "teacherdemo", "lessons"];
export type Demo = {
  id:string;created: number; preset: string; worldId:string; grade:number|null; role: string; scene: number; events: string[];
  flags: string[]; messages: { q: string; a: string }[]; narrative: string;
  think: boolean; thinkSupport:boolean; thinkAnswers:Record<string,string>; trace: boolean; evidence: number; connection: string;
  myWords:string[]; glossaryOpens:number; suggestedArtifactType:string; readAloudOn:boolean; hintFrequency:"often"|"sometimes"|"on_request"|"off"; sentenceStartersOn:boolean;
  resumePhrase: string; submitted: boolean;
  artifactAnswers:Record<string,{notice:string;interpret:string;craft:string;technique:string;revisions:string[];history?:{stage:"notice"|"interpret"|"craft";text:string;submitted_at:string}[]}>;
  openedArtifacts:string[]; activeArtifact:string; artifactStage:number; artifactDialogOpen:boolean;
  briefingComplete:boolean; savedTextEvidence:SavedTextEvidence[]; authorshipRanges:AuthorshipRange[]; analysisReport?:AnalysisReport;
  previewComplete?:boolean; course?:"all"|"best"|"ap"|"aice"; lessonsDone?:Record<string,LessonRecord>; portionUnlocks?:string[]; classAuth?:ClassAuth; homeLanguage?:HomeLanguage|null;
  // Storybook reader: current page, furthest page reached, briefing seen, sections solved, and the student's own picture frames.
  readerProgress?:Record<string,import("./storybook/reader").ReaderProgress>;
  storyFrames?:Record<string,{kind:"add_detail"|"student";description:string;quote:string;saved_at:string;image?:string;check?:{ok:boolean;notes:string[]}}>;
};
type ScreenSnapshot = { insideTheTextScreen: true; sequence: number; view: View; demo: Demo };
let pendingHeadingObserver: MutationObserver | null = null;
function focusScreenTop() {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousScrollBehavior;
  // A screen can name the field to start in (the join screen starts in the nickname box).
  const autofocus = document.querySelector<HTMLElement>("main [data-autofocus]");
  if (autofocus) { pendingHeadingObserver?.disconnect(); pendingHeadingObserver = null; autofocus.focus({ preventScroll: true }); return; }
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
  homeLanguage:savedHomeLanguage(),
});

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [joinCode, setJoinCode] = useState("");
  const [demo, setDemo] = useState<Demo>(() => newDemo("student_first_visit"));
  const [ownerData, setOwnerData] = useState<any[]>([]);
  const [ownerStatus, setOwnerStatus] = useState("");
  const [access, setAccess] = useState<"checking" | "granted" | "locked">("checking");
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState("");
  const classSession = demo.preset === "class_student";
  // Remember the home language in this browser; a restored session from before this feature picks up the saved choice.
  useEffect(()=>{if(demo.homeLanguage===undefined){const saved=savedHomeLanguage();if(saved)setDemo(d=>({...d,homeLanguage:saved}));return}saveHomeLanguage(demo.homeLanguage)},[demo.homeLanguage]);
  const gated = access !== "granted" && !ungatedViews.includes(view) && !(classViews.includes(view) && classSession);
  const tutorial = useRef<TutorialHandle>(null);
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
        if (!isDemoSandboxExpired(parsed.created)) { setDemo(parsed); const savedView=sessionStorage.getItem(`itt-sandbox-view-${id}`) as View|null; if(savedView&&["shelf","story","level","play","teacher","lessons","classhome","classlive"].includes(savedView))setView(savedView); }
        else {sessionStorage.removeItem(`itt-sandbox-${id}`);sessionStorage.removeItem("itt-active-sandbox-id");}
      }
    } catch { sessionStorage.removeItem("itt-active-sandbox-id"); }
    const params = new URLSearchParams(window.location.search);
    const join=params.get("join");
    if (join) { setJoinCode(join.toUpperCase()); setView("join"); window.history.replaceState({}, "", "/"); }
    else if (params.get("teacher") === "1") {
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
    if (["shelf","story","level","play","teacher","lessons","classhome","classlive"].includes(view)) {sessionStorage.setItem("itt-active-sandbox-id",demo.id);sessionStorage.setItem(`itt-sandbox-${demo.id}`,JSON.stringify(demo));sessionStorage.setItem(`itt-sandbox-view-${demo.id}`,view);if(demo.resumePhrase)localStorage.setItem(`itt-resume-${demo.resumePhrase}`,JSON.stringify(demo));}
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
    setDemo(next); setView(preset.startsWith("teacher") ? "teacher" : preset==="student_first_visit" ? "shelf" : "play");
  }
  function chooseStory(worldId:string,course:"all"|"best"|"ap"|"aice"="all"){setDemo(d=>({...d,worldId,course,grade:null,role:"",think:true,briefingComplete:true,previewComplete:false,submitted:false,scene:0}));setView("play")}
  function chooseGrade(grade:number){setDemo(d=>({...d,grade,role:"",think:false,previewComplete:false,scene:0}));setView("play")}
  // Try the Demo opens the first story directly (one click). The Stories button in the scene leads to the full story list.
  // Starts the tutorial video inside the click itself (required for sound on iPhone and iPad), then shows it.
  // The video lives on Our Approach and behind the case screen's "How it works"; it returns to where it was opened.
  const tutorialReturn = useRef<View>("play");
  function showTutorial(returnTo:View="play"){tutorialReturn.current=returnTo;tutorial.current?.start();setView("tutorial")}
  // Student front door: "Try the demo" and "I'm a student" land on the shelf, keeping any demo already in progress.
  function openShelf(){if(demo.preset==="student_first_visit"&&!demo.classAuth)setView("shelf");else start("student_first_visit")}
  const tryDemo=openShelf;
  // Opening a book keeps that story's progress; switching books starts the case flow at its first scene.
  function openStory(worldId:string){setDemo(d=>d.worldId===worldId?{...d,previewComplete:false}:{...d,worldId,course:"all",grade:null,think:true,briefingComplete:true,previewComplete:false,submitted:false,scene:0});setView("play")}
  // Hero "Keep reading": the full demo straight onto page 1 of the hero story (the hero already showed the opening).
  function keepReading(){const base=demo.preset==="student_first_visit"&&!demo.classAuth?demo:newDemo("student_first_visit");const prog=base.readerProgress?.["tell-tale-heart"]??{};setDemo({...base,worldId:"tell-tale-heart",think:true,briefingComplete:true,previewComplete:false,submitted:false,scene:0,readerProgress:{...(base.readerProgress??{}),"tell-tale-heart":{...prog,page:0,part:0,briefed:true}}});setView("play")}
  // Role cards: the demo with that role preselected, starting at the case briefing.
  function startRole(roleId:string){const base=demo.preset==="student_first_visit"&&!demo.classAuth?demo:newDemo("student_first_visit");const prog=base.readerProgress?.["tell-tale-heart"]??{};setDemo({...base,worldId:"tell-tale-heart",role:roleId,think:true,briefingComplete:true,previewComplete:false,submitted:false,scene:0,readerProgress:{...(base.readerProgress??{}),"tell-tale-heart":{...prog,briefed:false}}});setView("play")}
  function tryAnotherStory(){setDemo(d=>({...d,role:"",briefingComplete:false,think:false,previewComplete:false,scene:0}));setView("shelf")}
  function joinClass(session:{world_id:string;grade:number},auth:ClassAuth){const next=newDemo("class_student",session.world_id);next.grade=session.grade;next.scene=0;next.classAuth=auth;setDemo(next);setView("shelf")}
  function backToPreviousScreen(fallback:()=>void) {
    const current = window.history.state as ScreenSnapshot | null;
    if (current?.insideTheTextScreen && current.sequence > 0) window.history.back();
    else fallback();
  }

  if (gated) return <main className="min-h-screen bg-[#F6F0E3] text-[#2A2620]"><DisplaySettings/>{access === "locked" && <AccessGate brand={brand} onGranted={url => { setAccess("granted"); setFeedbackUrl(url); }} onPricing={() => setView("pricing")} onWaitlist={() => setView("waitlist")} onJoinClass={() => setView("join")} onApproach={() => setView("approach")} />}</main>;

  return <main className="min-h-screen bg-[#F6F0E3] text-[#2A2620]">
    {view !== "landing" && <header className="sticky top-0 z-30 flex min-h-[58px] flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-white/10 bg-[#F6F0E3]/95 px-5 py-2 md:px-10">
      <button onClick={() => setView("landing")} className="flex items-center gap-2"><Wordmark className="text-xl"/><span className="hidden text-xs text-white/45 sm:block">by {brand.organization}</span></button>
      {null}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{(["story","level","play","classhome","classlive"] as View[]).includes(view)&&<HeaderLanguage value={demo.homeLanguage??null} onChange={lang=>setDemo(d=>({...d,homeLanguage:lang}))}/>}<DisplaySettings placement="header"/>
      {classSession && demo.classAuth ? <button onClick={() => setView("classhome")} className={`rounded-full border px-4 py-2 text-xs ${view === "classhome" ? "border-[#A0472C] bg-[#A0472C] text-[#FFFDF8]" : "border-white/25 text-white/80"}`}>My class</button> : view === "classroom" ? null : <div className="flex gap-1 rounded-full border border-white/15 p-1 text-[11px]">
        {view === "teacherdemo" ? <button onClick={openShelf} className="rounded-full px-4 py-1.5 font-semibold text-[#8A3B23]">Switch to student view</button> : <button onClick={() => setView("teacherdemo")} className="rounded-full px-4 py-1.5 font-semibold text-[#8A3B23]">Switch to teacher view</button>}
      </div>}</div>
    </header>}
    {demoViews.includes(view) && !classSession && <FeedbackBanner url={feedbackUrl} />}
    {view === "landing" && <Landing brand={brand} onStart={tryDemo} onKeepReading={keepReading} onTeacher={() => setView("teacherdemo")} onRole={startRole} onJoinCode={(code:string) => { setJoinCode(code); setView("join"); }} onPreset={start} onJoin={() => setView("join")} onWaitlist={() => setView("waitlist")} onLessons={() => { setActiveLesson(""); setView("lessons"); }} onPricing={() => setView("pricing")} onOwner={() => setView("owner")} onClassroom={() => setView("classroom")} onApproach={() => setView("approach")} />}
    {view === "lessons" && <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">{activeLesson ? <LessonPlayer lessonId={activeLesson} grade={demo.grade} onClose={() => { setActiveLesson(""); window.scrollTo(0, 0); }} onFinish={(id, record) => setDemo(d => ({ ...d, lessonsDone: { ...(d.lessonsDone ?? {}), [id]: record } }))} /> : <><button onClick={() => backToPreviousScreen(() => setView("landing"))} className="mb-8 inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">← Back</button><h1 className="sr-only">Mini lessons</h1><MiniLessonLibrary grade={demo.grade} done={demo.lessonsDone ?? {}} onOpen={id => { setActiveLesson(id); window.scrollTo(0, 0); }} /><button onClick={() => setView("story")} className="gold-button mt-10 px-6 py-4 text-sm">Ready? Pick a story →</button></>}</section>}
    {view === "story" && <PickStory onLessons={() => { setActiveLesson(""); setView("lessons"); }} onBack={()=>backToPreviousScreen(()=>setView("landing"))} onPick={chooseStory} initialCourse={demo.course??"all"} />}
    {view === "level" && <ChooseLevel worldId={demo.worldId} course={demo.course??"all"} onBack={()=>backToPreviousScreen(()=>setView("story"))} onChoose={chooseGrade} />}
    {view === "play" && classSession && demo.classAuth && <ClassBar auth={demo.classAuth} onLive={() => setView("classlive")} onLessons={() => setView("classhome")} onDismissPhrase={() => setDemo(d => ({ ...d, classAuth: d.classAuth && { ...d.classAuth, resumePhrase: null } }))} />}
    {view === "play" && <CaseFlow demo={demo} setDemo={setDemo} feedbackUrl={classSession ? null : feedbackUrl} onTutorial={() => showTutorial("play")} onExit={()=>setView("shelf")} onAnotherStory={()=>{setDemo(d=>({...d,submitted:false,scene:0}));setView("shelf")}} />}
    {view === "shelf" && <Shelf demo={demo} setDemo={setDemo} onOpen={openStory} onlyWorld={classSession ? demo.worldId : undefined} heading={classSession ? "Your class shelf" : "Your shelf"} />}
    {view === "teacherdemo" && <TeacherDemo onSignIn={() => setView("classroom")} />}
    {view === "teacher" && <Teacher demo={demo} setDemo={setDemo} onStudent={() => setView("play")} onPreset={start} onClassroom={() => setView("classroom")} />}
    {view === "classroom" && <Classroom onBack={() => backToPreviousScreen(() => setView("landing"))} />}
    {view === "classhome" && demo.classAuth && <ClassHome auth={demo.classAuth} onStory={() => setView("play")} onLive={() => setView("classlive")} />}
    {view === "classlive" && demo.classAuth && <ClassLive auth={demo.classAuth} onBack={() => setView("classhome")} />}
    {view === "waitlist" && <Waitlist />}
    {view === "pricing" && <Pricing onWaitlist={() => setView("waitlist")} onApproach={() => setView("approach")} />}
    {view === "approach" && <Approach onVideo={() => showTutorial("approach")} onDemo={tryDemo} onPricing={() => setView("pricing")} onWaitlist={() => setView("waitlist")} onLessons={() => { setActiveLesson(""); setView("lessons"); }} />}
    {view === "join" && <Join initialCode={joinCode} onJoined={joinClass} />}
    {view === "owner" && <Owner data={ownerData} status={ownerStatus} setStatus={setOwnerStatus} />}
    <Tutorial ref={tutorial} visible={view === "tutorial"} onDone={() => setView(tutorialReturn.current)} />
  </main>;
}
