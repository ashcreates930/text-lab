"use client";
// The simplified student flow: land in the scene, open a clue, ask a character, prove it with a line from the story.
// Adults (teacher or parent) choose the story, grade and language; students never see those settings.
import {useEffect,useMemo,useRef,useState} from "react";
import {PlayCircle,ArrowLeft,ArrowRight,BookOpen,Check,LayoutGrid,Lock,MessageCircle,Printer,Quote,Search,ShieldCheck,Sparkles,Square,Volume2,VolumeX} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {BilingualProvider,HomeText} from "./bilingual";
import {Ambient,ClosingArgumentBadge,FactCheckerBadge,RankChip,playStamp,recordClosingArgument,recordFactCheck,recordScene,useProgress} from "./case-game";

import {CLASS_AI_OFF,evidenceLabel,isDone,useClueSteps,type Clue,type Scene} from "./clue-steps";
import {StorybookReader} from "./storybook/reader";
import {firstLockedPage,reconcileSaved} from "@/lib/storybook";
import {useLayoutEffect} from "react";
import {AmbientPlayer,CaseBoard,CaseBoardDialog,ConsequenceMoment,Portrait,SoundToggle,useCharacterVoice,useSoundPref} from "./game-feel";
import {choicesMade} from "@/lib/game-feel";
import {focusScreenTop} from "./screen-focus";
import {nextStep} from "@/lib/next-step";
import {hintFor,lieFor,testimonyParts,tryLine,type LieHighlight} from "@/lib/lies";
import {sceneScreenShowing} from "@/lib/ambient";
import {listenButton,narrationParts,playNarration,sceneReadingItems} from "@/lib/narration";
import {voiceButtonFor} from "@/lib/voice-control";
import {contentNotes,withContentNotes} from "@/lib/content-notes";
import {ContentNote} from "./content-note";
import {browserNarration,soundChannel,useSoundChannel} from "./sound-player";
const STORYBOOK_ON=false;

import {EvidenceLines} from "./evidence-lines";
import {frameSaved,requiredFrame,sceneFrames,sceneSolved,storyboardSoFar,type SceneFrame} from "@/lib/storyboard";
import {FrameView,StoryboardRow,StoryboardStrip} from "./storyboard";
import {VerdictPanel,VerdictStamp,VerdictView} from "./verdict";
import {theoryOf,verdictFor} from "@/lib/verdict";
import {PlantLieView} from "./plant-lie";
import {HologramView} from "./hologram-view";
import {RoleIntro} from "./role-intro";
import {StoryMode} from "./story-mode";
import {REPROVE,REPROVE_VERDICT,cluesToReprove,upgradeSavedProofs} from "@/lib/evidence-check";
import {DEFAULT_PERSONAL,choiceFrame,partName,type StoryPersonalSettings} from "@/lib/student-role";

// startAtLie: open straight to the story's first Spot the Lie clue (the home page's "Catch the lie"). onStartOver: clear
// this demo's progress (demo visitors only; the scene screen asks first).
type CaseProps={demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onExit:()=>void;onAnotherStory:()=>void;onTutorial?:()=>void;onFeedback?:()=>void;startAtLie?:boolean;onStarted?:()=>void;onStartOver?:()=>void};
export function CaseFlow(props:CaseProps){
 return <BilingualProvider worldId={props.demo.worldId} lang={props.demo.homeLanguage??null}><CaseInner {...props}/></BilingualProvider>;
}

function CaseInner({demo,setDemo,onExit,onAnotherStory,onTutorial,onFeedback,startAtLie,onStarted,onStartOver}:CaseProps){
 const [world,setWorld]=useState<WorldPack|null>(null),[passages,setPassages]=useState<SourcePassage[]>([]),[error,setError]=useState("");
 const [openClue,setOpenClue]=useState<string>(""),[openFrame,setOpenFrame]=useState(""),[verdictOpen,setVerdictOpen]=useState(false),[toast,setToast]=useState(""),[celebrate,setCelebrate]=useState<{sceneId:string;rankUp:string|null}|null>(null),[justProven,setJustProven]=useState(""),[plantClue,setPlantClue]=useState("");
 // Opening a clue or a storyboard frame, or going back to the scene, is a new screen: start at the top with focus on its heading.
 // Students in the story: a class follows its teacher's settings for roles and angles; everyone else has both on.
 const [personal,setPersonal]=useState<StoryPersonalSettings|null>(demo.classAuth?null:DEFAULT_PERSONAL);
 // Story Mode is on unless the class's teacher switched scenes to the Case file view.
 const [storyModeOn,setStoryModeOn]=useState(true);
 // Story Mode isn't available (its tables aren't set up): scenes open in the Case file view for everyone this visit.
 // storyJump: "Catch the lie" opens Story Mode at round 3 on the first scene with a testimony.
 const [storyUnavailable,setStoryUnavailable]=useState(false),[storyJump,setStoryJump]=useState<{sceneId:string;round:"lie"}|null>(null);
 useEffect(()=>{if(!demo.classAuth)return;fetch("/api/student/class",{headers:{"x-class-token":demo.classAuth.token},cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{setPersonal(j?{rolesOn:j.rolesOn!==false,anglesOn:j.anglesOn!==false}:DEFAULT_PERSONAL);setStoryModeOn(j?.storyModeOn!==false)}).catch(()=>setPersonal(DEFAULT_PERSONAL))},[demo.classAuth]);
 const screen=`${openClue}|${openFrame}|${verdictOpen}|${plantClue}|${!!demo.roleIntroSeen}|${storyUnavailable}`,shownScreen=useRef(screen);
 useLayoutEffect(()=>{if(shownScreen.current===screen)return;shownScreen.current=screen;focusScreenTop()},[screen]);
 useEffect(()=>{setWorld(null);fetch(`/worlds/${demo.worldId}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>setError("We couldn't open this story. Refresh the page to try again."));fetch(`/worlds/${demo.worldId}/source.md`).then(r=>r.ok?r.text():"").then(t=>setPassages(parseSourcePassages(t))).catch(()=>setPassages([]))},[demo.worldId]);
 // Students play the scene game. The storybook reader stays in the code, switched off, until we decide to bring it back.
 // Storybooks: saved work from another version of the story is cleared before anything renders, and a case can only
 // show as closed when every clue is proven and every required frame is saved.
 useLayoutEffect(()=>{if(!STORYBOOK_ON||!world?.storybook)return;setDemo(d=>{const r=reconcileSaved(world,d);return r.submitted&&r.worldId===world.id&&firstLockedPage(world,id=>isDone(r,id),k=>!!r.storyFrames?.[k])>=0?{...r,submitted:false}:r})},[world,setDemo,demo.classProgressLoaded]);
 // Students skip role and level screens: the first role is used unless an adult chose one.
 useEffect(()=>{if(world&&!world.roles.some(r=>r.id===demo.role))setDemo(d=>({...d,role:world.roles[0].id,briefingComplete:true,think:true}))},[world,demo.role,setDemo]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),4200);return()=>clearTimeout(t)},[toast]);
 // Older saves: once the story and the saved progress have loaded, upgrade each proven clue's line to its exact evidence
 // line (lib/evidence-check.ts) and save that. Clues that can't be upgraded are marked "Re-prove this clue".
 // "Catch the lie": once the story has loaded, go to the first scene with a testimony. If that scene has Story Mode, it
 // opens at round 3 (Catch the lie) after the role card; otherwise its clue opens.
 useEffect(()=>{if(!startAtLie||!world)return;const i=world.scenes.findIndex(s=>s.lie);if(i>=0){const sc=world.scenes[i];setDemo(d=>({...d,scene:i,...(sc.story_mode?{caseFileView:false}:{})}));if(sc.story_mode&&storyModeOn&&!storyUnavailable)setStoryJump({sceneId:sc.id,round:"lie"});else setOpenClue(sc.lie!.clue_id)}onStarted?.()},[startAtLie,world,setDemo,onStarted,storyModeOn,storyUnavailable]);
 const upgradedFor=useRef("");
 useEffect(()=>{if(!world||!passages.length||(demo.classAuth&&!demo.classProgressLoaded))return;const key=`${world.id}:${!!demo.classProgressLoaded}`;if(upgradedFor.current===key)return;upgradedFor.current=key;
  setDemo(d=>{const r=upgradeSavedProofs(world,passages,d.artifactAnswers,d.savedTextEvidence);return r.changed?{...d,artifactAnswers:r.answers,savedTextEvidence:r.evidence}:d})},[world,passages,demo.classAuth,demo.classProgressLoaded,setDemo]);
 const reprove=useMemo(()=>world?cluesToReprove(world,passages,demo.artifactAnswers):[],[world,passages,demo.artifactAnswers]);
 if(error)return <div className="case-ui mx-auto max-w-xl px-6 py-24 text-center"><p className="text-lg">{error}</p></div>;
 if(!world||!world.roles.some(r=>r.id===demo.role))return <div className="case-ui grid min-h-[60vh] place-items-center"><p className="text-[15px] text-[#6B6457]">Opening the story…</p></div>;
 const sceneIndex=Math.min(demo.scene,world.scenes.length-1),scene=world.scenes[sceneIndex],role=world.roles.find(r=>r.id===demo.role)!;
 const finished=demo.submitted;
 if(finished)return <CaseSummary world={world} demo={demo} passages={passages} onAnotherStory={onAnotherStory} personal={personal??DEFAULT_PERSONAL}/>;
 // The role card and "What's your angle?" come once, before the first clue (after saved progress has loaded).
 const introDue=!!personal&&(!demo.classAuth||demo.classProgressLoaded)&&!demo.roleIntroSeen&&(!demo.classAuth||!Object.keys(demo.artifactAnswers).length)&&((personal.rolesOn&&!!world.student_role)||personal.anglesOn);
 if(introDue&&personal)return <RoleIntro world={world} settings={personal} onDone={angle=>setDemo(d=>({...d,roleIntroSeen:true,...(angle?{angle}:{}),scene:d.scene===0&&!storyJump&&personal.rolesOn&&world.student_role?Math.max(0,world.scenes.findIndex(s=>s.id===world.student_role!.start_scene)):d.scene}))}/>;
 if(STORYBOOK_ON&&world.storybook)return <StorybookReader world={world} role={role} passages={passages} demo={demo} setDemo={setDemo} onExit={onExit} onFeedback={onFeedback}/>;
 const frames=sceneFrames(world,passages,sceneIndex);
 // The scene is solved when every clue is proven and its required frame is saved, whichever comes last.
 const celebrateScene=()=>{setCelebrate({sceneId:scene.id,rankUp:recordScene(`${world.id}:${scene.id}`)});playStamp()};
 // Closing the case: after a verdict, the Closing Argument badge; then the case summary.
 const closeCase=()=>{if(verdictFor(demo.verdict,world.id))recordClosingArgument(world.id);playStamp(250);setDemo(d=>({...d,submitted:true,events:[...d.events,"case_closed"]}));setVerdictOpen(false);window.scrollTo({top:0})};
 if(verdictOpen&&world.verdict)return <VerdictView world={world} demo={demo} setDemo={setDemo} reprove={reprove} onBack={()=>setVerdictOpen(false)} onFinish={closeCase}/>;
 const frame=frames.find(f=>f.key===openFrame);
 if(frame)return <FrameView world={world} frame={frame} passages={passages} demo={demo} setDemo={setDemo} onClose={saved=>{setOpenFrame("");if(!saved)return;window.scrollTo({top:0});setToast("Frame saved to your storyboard.");
  if(frame.required&&!frameSaved(demo.storyFrames,frame.key)&&scene.artifacts.every(a=>isDone(demo,a.id)))celebrateScene()}}/>;
 // Plant a Lie (class students only): a new screen for a clue they have proven.
 const planting=demo.classAuth?scene.artifacts.find(a=>a.id===plantClue&&isDone(demo,a.id)):undefined;
 if(planting&&demo.classAuth)return <PlantLieView world={world} scene={scene} clue={planting} passages={passages} token={demo.classAuth.token} onClose={()=>setPlantClue("")}/>;
 const clue=scene.artifacts.find(a=>a.id===openClue);
 if(clue)return <ClueView world={world} scene={scene} clue={clue} roleId={role.id} demo={demo} setDemo={setDemo} passages={passages} onClose={(saved,info)=>{setOpenClue("");if(!saved)return;window.scrollTo({top:0});setJustProven(clue.id);
  const badge=info?.factCheck?recordFactCheck(`${world.id}:${clue.id}`):false;
  setToast(badge?"Badge earned: Fact Checker. You used the story to prove a character wrong.":"Clue proven and saved to your case file.");
  if(info?.solves&&sceneSolved(true,frames,demo.storyFrames))celebrateScene()}}/>;
 // Story Mode: scenes with a story_mode block are played as four timed rounds, unless an adult opened the Case file
 // view (demo) or the teacher turned Story Mode off for the class. Then the clue board below is the scene.
 const storyHere=!!scene.story_mode&&storyModeOn&&!demo.caseFileView&&!storyUnavailable;
 if(storyHere)return <StoryMode key={scene.id} world={world} scene={scene} sceneIndex={sceneIndex} passages={passages} demo={demo} setDemo={setDemo} startAt={storyJump?.sceneId===scene.id?storyJump.round:undefined} onJumped={()=>setStoryJump(null)} onUnavailable={()=>{if(storyJump&&scene.lie)setOpenClue(scene.lie.clue_id);setStoryJump(null);setStoryUnavailable(true)}} onCleared={()=>{setDemo(d=>({...d,scene:Math.min(d.scene+1,world.scenes.length-1),events:[...d.events,"scene_complete"]}))}} onCaseFile={demo.classAuth?undefined:()=>setDemo(d=>({...d,caseFileView:true}))}/>;
 return <SceneView world={world} scene={scene} sceneIndex={sceneIndex} onStoryMode={scene.story_mode&&demo.caseFileView&&!demo.classAuth&&!storyUnavailable?()=>setDemo(d=>({...d,caseFileView:false})):undefined} role={role} demo={demo} setDemo={setDemo} passages={passages} frames={frames} onOpenFrame={setOpenFrame} onOpenVerdict={()=>setVerdictOpen(true)} onCloseCase={closeCase} onOpenClue={id=>{setOpenClue(id);window.scrollTo({top:0})}} onExit={onExit} onStartOver={demo.classAuth?undefined:onStartOver} onPlantLie={demo.classAuth?setPlantClue:undefined} personal={personal??DEFAULT_PERSONAL} reprove={reprove} toast={toast} celebrating={celebrate?.sceneId===scene.id} rankUp={celebrate?.sceneId===scene.id?celebrate.rankUp:null} justProven={justProven} onTutorial={onTutorial}/>;
}

function SceneView({world,scene,sceneIndex,role,demo,setDemo,passages,frames,onOpenFrame,onOpenVerdict,onCloseCase,onOpenClue,onExit,onStartOver,onStoryMode,onPlantLie,personal,reprove,toast,celebrating,rankUp,justProven,onTutorial}:{onStartOver?:()=>void;onStoryMode?:()=>void;onPlantLie?:(clueId:string)=>void;personal:StoryPersonalSettings;reprove:string[];world:WorldPack;scene:Scene;sceneIndex:number;role:WorldPack["roles"][number];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];frames:SceneFrame[];onOpenFrame:(key:string)=>void;onOpenVerdict:()=>void;onCloseCase:()=>void;onOpenClue:(id:string)=>void;onExit:()=>void;toast:string;celebrating:boolean;rankUp:string|null;justProven:string;onTutorial?:()=>void}){
 const startOverRef=useRef<HTMLButtonElement>(null);
 const [confirmStart,setConfirmStart]=useState(false),[reading,setReading]=useState(false),[boardOpen,setBoardOpen]=useState(false),[moment,setMoment]=useState<{text:string;image:string}|null>(null);
 // Ambient sound: on for the demo, off for class sessions; the student can switch it either way.
 const [ambientOn,toggleAmbient]=useSoundPref("ambient",demo.preset);
 const done=scene.artifacts.filter(a=>isDone(demo,a.id)).length,total=scene.artifacts.length,allDone=done===total;
 const solved=sceneSolved(allDone,frames,demo.storyFrames),needFrame=requiredFrame(frames);
 const locked=(a:Clue)=>!!a.unlock_condition?.startsWith("artifact:")&&!isDone(demo,a.unlock_condition.slice(9));
 const next=scene.artifacts.find(a=>!isDone(demo,a.id)&&!locked(a));
 const last=sceneIndex===world.scenes.length-1;
 const readingItems=sceneReadingItems(world,scene,passages);
 // "Listen to the scene" reads the paragraphs in the reading panel, one at a time, highlighting each. It stops when the
 // student opens a clue, moves to another scene, leaves the case or switches language.
 const listening=listenButton(useSoundChannel(),scene.id);
 const paragraphRefs=useRef<(HTMLElement|null)[]>([]);
 useEffect(()=>()=>{if(soundChannel.state.kind==="narration")soundChannel.stop()},[scene.id,demo.homeLanguage]);
 useEffect(()=>{const el=paragraphRefs.current[listening.part];if(!el)return;const still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;el.scrollIntoView({block:"nearest",behavior:still?"auto":"smooth"})},[listening.part]);
 function goNext(){setDemo(d=>({...d,scene:d.scene+1,events:[...d.events,"scene_complete"]}));window.scrollTo({top:0})}
 // Closing the case after a Final Verdict shows the VERDICT stamp first.
 const savedVerdict=verdictFor(demo.verdict,world.id),[stamping,setStamping]=useState(false);
 function finish(){if(savedVerdict&&world.verdict){setStamping(true);return}onCloseCase()}
 function listen(){if(listening.playing){soundChannel.stop();return}setReading(true);playNarration(soundChannel,scene.id,narrationParts(world,scene,passages),browserNarration)}
 const nextImage=world.scenes[sceneIndex+1]?.background_image??scene.background_image;
 const step=nextStep({clues:scene.artifacts.map(a=>({id:a.id,name:a.name,done:isDone(demo,a.id),locked:locked(a)})),requiredFrame:needFrame&&{key:needFrame.key,saved:frameSaved(demo.storyFrames,needFrame.key)},last,hasChoice:!!scene.choice_point,choicePrompt:scene.choice_point?.prompt,verdict:world.verdict?{done:!!savedVerdict}:undefined});
 function choose(o:NonNullable<Scene["choice_point"]>["options"][number]){setDemo(d=>({...d,events:[...d.events,"delegation"],connection:o.consequence_narration,choices:{...(d.choices??{}),[scene.id]:o.id}}));setMoment({text:o.consequence_narration,image:nextImage})}
 function act(){const a=step.action;if(a.kind==="clue")onOpenClue(a.clueId);else if(a.kind==="frame")onOpenFrame(a.frameKey);else if(a.kind==="next")goNext();else if(a.kind==="verdict")onOpenVerdict();else if(a.kind==="close")finish()}
 return <div className="case-ui mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8">
  <AmbientPlayer src={scene.ambient_audio} on={ambientOn} showing={sceneScreenShowing({inCase:true,clueOpen:false,frameOpen:false,boardOpen,consequence:!!moment||stamping})}/>
  {moment&&<ConsequenceMoment image={moment.image} text={moment.text} onContinue={()=>{setMoment(null);goNext()}}/>}
  {stamping&&savedVerdict&&<VerdictStamp theory={theoryOf(world,savedVerdict.theory_id)?.name??""} onContinue={onCloseCase}/>}
  {boardOpen&&<CaseBoardDialog world={world} answers={demo.artifactAnswers} reprove={reprove} storyboard={storyboardSoFar(world,passages,demo.storyFrames,sceneIndex)} top={savedVerdict&&<VerdictPanel world={world} verdict={savedVerdict}/>} onClose={()=>setBoardOpen(false)}/>}
  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:gap-4">
   <button onClick={onExit} className="inline-flex items-center gap-2 rounded-full px-2 py-2 sm:px-3 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Stories</button>{onTutorial&&<button onClick={onTutorial} className={`${onStartOver&&!confirmStart?"":"mr-auto "}inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]`}><PlayCircle size={18}/> <span className="hidden sm:inline">How it works</span><span className="sr-only sm:hidden">How it works</span></button>}
   {onStoryMode&&<button type="button" onClick={onStoryMode} className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[15px] font-semibold text-[#8A3B23] underline-offset-4 hover:underline">Play Story Mode</button>}
   {onStartOver&&!confirmStart&&<button ref={startOverRef} type="button" onClick={()=>setConfirmStart(true)} className="mr-auto inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Start over</button>}
   <div className="flex items-center gap-2 text-[15px] text-[#6B6457] sm:gap-3"><span className="hidden sm:inline">{world.title}</span><span className="whitespace-nowrap rounded-full bg-[#EFE8D8] px-3 py-1 font-semibold text-[#2A2620]">Scene {sceneIndex+1} of {world.scenes.length}</span><RankChip/></div>
  </div>
  {confirmStart&&onStartOver&&<div role="group" aria-labelledby="start-over-h" className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-[#FBF1EB] px-4 py-3"><p id="start-over-h" className="text-[16px] font-semibold text-[#2A2620]">Start over? This clears your clues and progress in this demo.</p><div className="flex gap-2"><button type="button" onClick={()=>{setConfirmStart(false);onStartOver()}} className="case-primary !min-h-11 !px-4 !text-[15px]">Yes, start over</button><button type="button" autoFocus onClick={()=>{setConfirmStart(false);setTimeout(()=>startOverRef.current?.focus({preventScroll:true}),0)}} className="case-secondary !min-h-11 !px-4 !text-[15px]">Keep playing</button></div></div>}
  <div className="relative mx-auto mt-4 overflow-hidden rounded-3xl shadow-[0_10px_40px_-12px_rgba(42,38,32,.35)] md:max-w-[calc(44vh*2)]">
   <div className={`case-art aspect-[4/3] w-full sm:aspect-[3/2] md:aspect-[16/8] ${solved?"case-alive":""}`} style={{backgroundImage:`url('${scene.background_image}')`}} role="img" aria-label={`Scene: ${scene.id.replaceAll("-"," ")}`}/>
   {solved&&<Ambient worldId={world.id}/>}
   {scene.artifacts.map((a,i)=>{const lk=locked(a),dn=isDone(demo,a.id);return <button key={a.id} disabled={lk} onClick={()=>onOpenClue(a.id)} aria-label={`Clue ${i+1}: ${a.name}${lieFor(scene,a.id)?", testimony":""}${reprove.includes(a.id)?`, ${REPROVE.toLowerCase()}`:dn?", done":lk?", locked":""}`} className={`absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[15px] font-bold shadow-lg ring-4 transition hover:scale-110 ${a.id===justProven?"case-pop ":""}${dn?"bg-[#FFFDF8] text-[#A0472C] ring-[#FFFDF8]/40":lk?"bg-[#2A2620]/70 text-white/70 ring-white/20":"case-pulse bg-[#A0472C] text-white ring-[#A0472C]/30"}`} style={{left:`${a.position.x+a.position.width/2}%`,top:`${a.position.y+a.position.height/2}%`}}>{dn?<Check size={18}/>:lk?<Lock size={15}/>:i+1}{lieFor(scene,a.id)&&<span aria-hidden className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#2A2620] text-white ring-2 ring-[#FFFDF8]"><MessageCircle size={11}/></span>}</button>})}
   {done===0&&next&&<div aria-hidden className="case-hint pointer-events-none absolute z-20" style={{left:`${Math.min(85,Math.max(15,next.position.x+next.position.width/2))}%`,top:`calc(${next.position.y+next.position.height/2}% + 30px)`}}><span className="block whitespace-nowrap rounded-full bg-[#FFFDF8] px-4 py-2 text-[15px] font-bold text-[#8A3B23] shadow-lg">Start here: tap the glowing clue</span></div>}
   {solved&&<div aria-hidden className={`case-stamp pointer-events-none z-10 ${celebrating?"":"case-stamp-static"}`}>Scene solved</div>}
   <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 pt-16 md:p-8 md:pt-24">
    <p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">You are {partName(world,role.name,personal)}</p>
    <h1 className="mt-1 max-w-3xl text-[20px] font-semibold leading-snug text-white outline-none md:text-[26px]">{role.goal}</h1>
    <HomeText text={role.goal} className="border-[#F3C9B2] text-[#F7E3D7]"/>
   </div>
  </div>
  {/* Next step: one line of progress and the one button that points to what to do next. */}
  <section aria-label="Next step" className="mx-auto mt-4 flex flex-col gap-3 rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_6px_24px_-12px_rgba(42,38,32,.4)] md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">
   <div className="min-w-0">
    <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Next step</p>
    <p className="mt-0.5 text-[17px] font-bold text-[#2A2620]">{step.progress}</p>
    {step.action.kind==="choice"&&choiceFrame(world,scene.choice_point,personal)&&<p className="mt-1 text-[16px] italic leading-6 text-[#4A4438]">{choiceFrame(world,scene.choice_point,personal)}</p>}
    {step.action.kind==="choice"&&<><p className="mt-1 text-[16px] leading-6 text-[#2A2620]">{step.action.label}</p><HomeText text={step.action.label}/></>}
   </div>
   {step.action.kind==="choice"&&scene.choice_point
    ?<div className="grid gap-2 sm:grid-cols-2 md:w-[58%] md:shrink-0">{scene.choice_point.options.map(o=><button key={o.id} onClick={()=>choose(o)} className="rounded-2xl bg-[#A0472C] px-5 py-4 text-left text-[17px] font-semibold text-white transition hover:bg-[#8A3B23]">{o.label}<HomeText text={o.label} className="border-white/60 text-[15px] font-normal text-white/90"/></button>)}</div>
    :step.action.kind==="verdict"&&reprove.length?<div className="md:w-[58%] md:shrink-0"><button type="button" disabled aria-describedby="verdict-blocked" className="case-primary min-h-[58px] w-full text-[18px] opacity-50">{step.action.label} <ArrowRight size={20}/></button><p id="verdict-blocked" className="mt-2 text-[15px] leading-6 text-[#A33B20]">{REPROVE_VERDICT}</p></div>
    :<button onClick={act} className="case-primary min-h-[58px] w-full text-[18px] md:w-auto md:min-w-[300px] md:shrink-0">{step.action.label} <ArrowRight size={20}/></button>}
  </section>
  <div role="status" aria-live="polite">{celebrating&&<p className="case-rise mt-4 rounded-2xl bg-[#A0472C] px-5 py-3 text-[16px] font-semibold text-white">Scene solved. Every clue is backed by the story.{rankUp?` New rank: ${rankUp}.`:""}</p>}
  {toast&&<p className="mt-4 rounded-2xl bg-[#2A2620] px-5 py-3 text-[15px] text-white"><Check size={16} className="mr-2 inline"/>{toast}</p>}
  {onPlantLie&&justProven&&isDone(demo,justProven)&&<button type="button" onClick={()=>onPlantLie(justProven)} className="mt-2 text-[15px] font-semibold text-[#8A3B23] underline-offset-4 hover:underline">Plant a lie about this clue for your class</button>}</div>
  {/* Clues: one compact row. A chip opens its clue, just like its pin on the picture. */}
  <section aria-labelledby="clues-h" className="mt-5">
   <h2 id="clues-h" className="sr-only">Clues</h2>
   <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="list">{scene.artifacts.map((a,i)=>{const lk=locked(a),dn=isDone(demo,a.id),isNext=step.action.kind==="clue"&&step.action.clueId===a.id;return <li key={a.id} className="min-w-0"><button disabled={lk} onClick={()=>onOpenClue(a.id)} aria-label={`Clue ${i+1}: ${a.name}${lieFor(scene,a.id)?", testimony":""}${reprove.includes(a.id)?`, ${REPROVE.toLowerCase()}`:dn?", proven":lk?", locked":""}`} title={`${a.name} · ${lk?"Opens after an earlier clue":dn?"Proven":evidenceLabel[a.evidence_type]}`} className={`flex h-full w-full items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3 text-left transition ${a.id===justProven?"case-pop ":""}${lk?"cursor-not-allowed bg-[#EFE8D8]/60 text-[#9A9182]":isNext?"bg-[#FFFDF8] ring-2 ring-[#A0472C] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]":"bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] hover:bg-[#FBF1EB]"}`}>
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ${dn?"bg-[#F4E1D6] text-[#A0472C]":lk?"bg-[#E4DCCB] text-[#9A9182]":"bg-[#A0472C] text-white"}`}>{dn?<Check size={16}/>:lk?<Lock size={14}/>:i+1}</span>
    <span className="min-w-0 flex-1"><span className="line-clamp-2 block text-[14px] font-semibold leading-snug sm:text-[15px]">{a.name}</span>{lieFor(scene,a.id)&&<span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#2A2620] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"><MessageCircle size={10}/>Testimony</span>}{reprove.includes(a.id)&&<span className="mt-0.5 block text-[12px] font-bold text-[#A33B20]">{REPROVE}</span>}<HomeText text={a.name} className="text-[12px]"/></span>
   </button></li>})}</ol>
  </section>
  <StoryboardStrip frames={frames} saved={demo.storyFrames} onOpen={onOpenFrame}/>
  {/* Tools: four equal buttons in one row. */}
  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
   <button onClick={listen} className="case-tool">{listening.playing?<Square size={15} fill="currentColor"/>:<Volume2 size={17}/>} {listening.label==="Listen to the scene"?"Listen":listening.label}</button>
   <button onClick={()=>setReading(v=>!v)} aria-expanded={reading} aria-controls="scene-reading" className="case-tool"><BookOpen size={17}/> {reading?"Hide the story":"Read the story"}</button>
   <button onClick={()=>setBoardOpen(true)} className="case-tool"><LayoutGrid size={17}/> Case board</button>
   <button type="button" onClick={toggleAmbient} aria-pressed={ambientOn} disabled={!scene.ambient_audio} className="case-tool disabled:opacity-40">{ambientOn?<Volume2 size={17}/>:<VolumeX size={17}/>} Sound {ambientOn?"on":"off"}</button>
  </div>
  {reading&&<div id="scene-reading" className="mt-3 max-h-[60vh] space-y-4 overflow-y-auto rounded-2xl bg-[#FFFDF8] p-5 font-serif text-[17px] leading-8 text-[#2A2620] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   {scene.summary&&<div className="rounded-2xl bg-[#EFE8D8] p-4 font-sans"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">What happens here</p><p className="mt-1 text-[15px] leading-6 text-[#4A4438]">{scene.summary}</p><HomeText text={scene.summary} className="text-[15px]"/></div>}
   {readingItems.map((item,i)=>item.kind==="note"?<div key={item.id} ref={el=>{paragraphRefs.current[i]=el}}><ContentNote text={item.text} active={listening.part===i}/></div>:<p key={item.id} ref={el=>{paragraphRefs.current[i]=el}} aria-current={listening.part===i||undefined} className={`-mx-2 rounded-lg px-2 transition-colors motion-reduce:transition-none ${listening.part===i?"bg-[#F3E2D6]":""}`}>{item.text}</p>)}{!readingItems.length&&<p className="text-[#6B6457]">The story text is loading.</p>}
  </div>}
 </div>;
}

function ClueView({world,scene,clue,roleId,demo,setDemo,passages,onClose}:{world:WorldPack;scene:Scene;clue:Clue;roleId:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];onClose:(saved:boolean,info?:{solves:boolean;factCheck:boolean})=>void}){
 // Spot the Lie: on this scene's lie clue, the character's testimony comes first and the student catches the false claim.
 const lie=lieFor(scene,clue.id),liar=lie?world.characters.find(c=>c.id===lie.character_id):undefined;
 const {chars,character,setCharacter,char,step,setStep,question,setQuestion,reply,asked,busy,proof,setProof,stance,setStance,explain,setExplain,source,notice,interpret,suggestions,steps,stepNo,ask,save:saveSteps}=useClueSteps({world,scene,clue,roleId,demo,setDemo,passages,testimony:lie&&{characterId:lie.character_id,text:lie.testimony}});
 const priorLie=lie?demo.lies?.[scene.id]:undefined;
 const [lieState,setLieState]=useState<{caught:boolean;misses:number;message:string;highlight?:LieHighlight}>(()=>({caught:!!priorLie?.caught,misses:priorLie?.misses??0,message:"",...((priorLie?.misses??0)>=2&&!priorLie?.caught&&lie?{highlight:hintFor(lie,source)}:{})}));
 function pickLine(line:{text:string;pid:string}){
  if(!lie){setProof(line);return}
  if(lieState.caught)return;
  const r=tryLine(lie,line.text,lieState.misses,source);
  if(r.result==="caught"){setProof(line);setStance("contradicts");setLieState({caught:true,misses:r.misses,message:""});playStamp(0);setDemo(d=>({...d,lies:{...(d.lies??{}),[scene.id]:{clue_id:clue.id,caught:true,misses:r.misses,caught_at:new Date().toISOString()}}}));return}
  setLieState({caught:false,misses:r.misses,message:r.message,...(r.highlight?{highlight:r.highlight}:{})});
  setDemo(d=>({...d,lies:{...(d.lies??{}),[scene.id]:{clue_id:clue.id,caught:false,misses:r.misses}}}));
 }
 const boxRef=useRef<HTMLTextAreaElement>(null);const [peek,setPeek]=useState(false);
 // Character voices: on for the demo, off for class sessions. A new answer plays once; the speaker button replays it.
 const [voicesOn,toggleVoices]=useSoundPref("voices",demo.preset);
 const voice=useCharacterVoice(world.id,demo.id);
 const askedOf=useRef(character),voiced=useRef("");
 // Asking a new question or switching characters silences the voice that is playing.
 useEffect(()=>{if(busy){askedOf.current=character;voice.stop("new-question")}},[busy,character,voice]);
 const shownCharacter=useRef(character);
 useEffect(()=>{if(shownCharacter.current===character)return;shownCharacter.current=character;voice.stop("switch-character")},[character,voice]);
 const voiceToggle=replierButton();
 function replierButton(){const r=world.characters.find(c=>c.id===askedOf.current)??char;return r&&reply?voiceButtonFor(voice.current,r.id,reply,r.name):null}
 const testimonyToggle=lie&&liar?voiceButtonFor(voice.current,liar.id,lie.testimony,liar.name,"testimony"):null;
 useEffect(()=>{if(!reply||busy||voiced.current===reply)return;voiced.current=reply;if(voicesOn)voice.play(reply,askedOf.current)},[reply,busy,voicesOn,voice]);
 useEffect(()=>{if(!voicesOn)voice.stop()},[voicesOn,voice]);
 // The testimony plays once in the character's voice when the lie clue opens (voices on).
 const testified=useRef(false);
 const playRef=useRef(voice.play);playRef.current=voice.play;
 useEffect(()=>{if(!lie||!liar||testified.current||!voicesOn||priorLie?.caught)return;const t=setTimeout(()=>{testified.current=true;playRef.current(lie.testimony,liar.id)},150);return()=>clearTimeout(t)},[lie,liar,voicesOn,priorLie]);
 const replier=world.characters.find(c=>c.id===askedOf.current)??char;
 function save(){const info=saveSteps();if(info)onClose(true,info)}
 // Hologram mode: the character on this clue (the one answering, or the one testifying) with their latest line.
 const [holo,setHolo]=useState(false);
 const holoCharacter=(lie&&liar&&step==="prove"?liar:replier)??liar,holoLine=(holoCharacter&&holoCharacter.id===askedOf.current&&reply)||(lie&&holoCharacter?.id===lie.character_id?lie.testimony:"");
 const closeHolo=()=>{voice.stop();setHolo(false);setTimeout(()=>focusScreenTop(),0)};
 if(holo&&holoCharacter)return <HologramView character={holoCharacter} worldId={world.id} line={holoLine} sandboxId={demo.id} title={clue.name} onClose={closeHolo}/>;
 return <div className="case-ui mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8">
  <div className="flex items-center justify-between gap-4">
   <button onClick={()=>onClose(false)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Back to the scene</button>
   {holoCharacter&&<button type="button" onClick={()=>{voice.stop();setHolo(true)}} className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#2A2620] px-4 py-2 text-[15px] font-semibold text-white hover:bg-[#3A332B]"><Sparkles size={16}/> Hologram<span className="sr-only"> of {holoCharacter.name}</span></button>}
   <ol className="flex items-center gap-2" aria-label={`Step ${stepNo} of ${steps.length}`}>{steps.map((s,i)=><li key={s} className={`h-2 rounded-full transition-all ${i<stepNo?"w-8 bg-[#A0472C]":"w-4 bg-[#E4DCCB]"}`}/>)}</ol>
  </div>
  <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
   <section className="order-2 lg:order-1" aria-label="From the story">
    <div className="overflow-hidden rounded-3xl shadow-[0_10px_40px_-14px_rgba(42,38,32,.35)]"><div className="case-art aspect-[16/9]" style={{backgroundImage:`url('${scene.background_image}')`,backgroundPosition:`${clue.position.x+clue.position.width/2}% ${clue.position.y+clue.position.height/2}%`,backgroundSize:"220%"}} role="img" aria-label={`Close-up: ${clue.name}`}/></div>
    {step==="ask"&&<div className="mt-4 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="flex items-center gap-2 text-[15px] font-semibold text-[#2A2620]"><BookOpen size={17} className="text-[#A0472C]"/> The story holds the answer.</p><p className="mt-1 text-[15px] text-[#6B6457]">Ask first. Then you will search the story for proof.</p><button onClick={()=>setPeek(v=>!v)} className="mt-3 text-[15px] font-semibold text-[#8A3B23] underline underline-offset-4">{peek?"Hide the story":"Peek at the story"}</button>{peek&&<div className="mt-3 max-h-[40vh] space-y-3 overflow-y-auto font-serif text-[16px] leading-7">{withContentNotes(source,contentNotes(world)).map(item=>item.kind==="note"?<ContentNote key={item.id} text={item.text}/>:<p key={item.id}>{item.text}</p>)}</div>}</div>}
    {step==="prove"&&<div className="mt-4 rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] md:p-5">
     <p className="flex items-center gap-2 px-1 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]"><Search size={15}/> Evidence lines · tap the one that proves it</p>
     <EvidenceLines passages={source} picked={proof?.text} onPick={pickLine} notes={contentNotes(world)} highlight={lie&&!lieState.caught?lieState.highlight:undefined}/>
     {!source.length&&<p className="font-sans text-[15px] text-[#6B6457]">Loading the story…</p>}
    </div>}
   </section>
   <section className="order-1 lg:order-2" aria-live="polite">
    <div className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] md:p-7">
     <p className="text-[14px] font-semibold text-[#8A3B23]">Clue {scene.artifacts.findIndex(a=>a.id===clue.id)+1} of {scene.artifacts.length} · {evidenceLabel[clue.evidence_type]}</p>
     <h1 className="mt-1 text-[28px] font-bold leading-tight">{clue.name}</h1><HomeText text={clue.name}/>
     {step==="ask"&&char&&<div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-[20px] font-bold">{chars.length===1&&<Portrait character={char} size={44}/>}Ask {chars.length>1?"a character":char.name}</h2><SoundToggle on={voicesOn} onToggle={toggleVoices} label="Voices"/></div>
      <p className="mt-1 text-[15px] text-[#6B6457]">Characters can be wrong. You'll check the answer against the story next.</p>
      {chars.length>1&&<div className="mt-4 flex flex-wrap gap-2">{chars.map(c=><button key={c.id} onClick={()=>setCharacter(c.id)} aria-pressed={character===c.id} className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[15px] font-semibold ${character===c.id?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620]"}`}><Portrait character={c} size={36}/>{c.name}</button>)}</div>}
      {!reply&&!busy&&<div className="mt-4 flex flex-col gap-2">{suggestions.map(s=><button key={s} onClick={()=>ask(s)} className="rounded-2xl bg-[#F4E1D6] px-4 py-3 text-left text-[16px] text-[#2A2620] transition hover:bg-[#EDD3C4]"><MessageCircle size={16} className="mr-2 inline text-[#A0472C]"/>{s}</button>)}</div>}
      {(asked||busy)&&<div className="mt-5 space-y-3"><p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#2A2620] px-4 py-3 text-[16px] text-white">{asked}</p><div className="flex max-w-[94%] items-end gap-3">{replier&&<Portrait character={replier} size={48} speaking={!!voice.speaking&&voice.speaking===replier.id}/>}<div className="min-w-0 flex-1 rounded-2xl rounded-bl-md bg-[#EFE8D8] px-4 py-3 text-[16px] leading-7"><div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold text-[#8A3B23]">{replier?.name??char.name}</p>{!busy&&reply&&replier&&voiceToggle&&<button type="button" onClick={()=>voice.toggle(reply,replier.id)} aria-label={voiceToggle.aria} aria-pressed={voiceToggle.playing} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold ${voiceToggle.playing?"bg-[#A0472C] text-white hover:bg-[#8A3B23]":"text-[#8A3B23] hover:bg-[#E4DCCB]"}`}>{voiceToggle.playing?<Square size={13} fill="currentColor"/>:<Volume2 size={16}/>}{voiceToggle.label}</button>}</div>{busy?<p className="text-[#6B6457]">Thinking…</p>:<p>{reply}</p>}</div></div></div>}
      <form onSubmit={e=>{e.preventDefault();ask(question)}} className="mt-4 flex gap-2"><label className="sr-only" htmlFor="ask-box">Your question</label><input id="ask-box" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={300} placeholder={reply?"Ask a follow-up…":"Or type your own question…"} className="min-w-0 flex-1 rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#A0472C]"/><button disabled={busy||!question.trim()} className="rounded-2xl bg-[#2A2620] px-4 text-[15px] font-semibold text-white disabled:opacity-40">Ask</button></form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button onClick={()=>setStep("prove")} className="text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Skip, I'll look myself</button>{reply&&<button onClick={()=>setStep("prove")} className="case-primary">Check it in the story <ArrowRight size={18}/></button>}</div>
     </div>}
     {step==="ask"&&!char&&<p className="mt-4">{CLASS_AI_OFF}</p>}
     {step==="prove"&&lie&&liar&&<div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#EFE8D8] p-4 md:p-5">
       <p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">Testimony · One thing {liar.name} just said is false. Find the line in the story that proves it.</p>
       <div className="mt-3 flex items-start gap-3"><Portrait character={liar} size={52} speaking={!!voice.speaking&&voice.speaking===liar.id}/>
        <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[14px] font-semibold text-[#8A3B23]">{liar.name}</p>{testimonyToggle&&<button type="button" onClick={()=>voice.toggle(lie.testimony,liar.id)} aria-label={testimonyToggle.aria} aria-pressed={testimonyToggle.playing} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold ${testimonyToggle.playing?"bg-[#A0472C] text-white hover:bg-[#8A3B23]":"text-[#8A3B23] hover:bg-[#E4DCCB]"}`}>{testimonyToggle.playing?<Square size={13} fill="currentColor"/>:<Volume2 size={16}/>}{testimonyToggle.label}</button>}</div>
         <p className="mt-1 text-[17px] leading-7 text-[#2A2620]">{testimonyParts(lie).map((p,i)=>p.false&&lieState.caught?<s key={i} className="decoration-[#A0472C] decoration-2">{p.text}</s>:<span key={i}>{p.text}</span>)}</p></div></div>
       {lieState.caught&&<div aria-hidden className="case-stamp z-10 whitespace-nowrap" style={{fontSize:22,top:"55%"}}>Lie caught</div>}
      </div>
      <div>
       {!lieState.caught&&lieState.message&&<p className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px] text-[#2A2620]">{lieState.message}{lieState.highlight?("lines" in lieState.highlight?" The lines to look in are highlighted.":" The paragraph to look in is highlighted."):""}</p>}
       {lieState.caught&&<div className="mt-4 rounded-2xl bg-[#A0472C] p-4 text-white"><p className="flex items-center gap-2 text-[16px] font-bold"><ShieldCheck size={18}/> Lie caught. You proved {liar.name} wrong.</p><p className="mt-1 text-[16px] leading-7">{lie.explanation}</p></div>}
       {lieState.caught&&proof&&<blockquote className="mt-4 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[17px] leading-7"><Quote size={16} className="mb-1 text-[#A0472C]"/>{proof.text}</blockquote>}
      </div>
      <details className="mt-4 rounded-2xl bg-[#FFFDF8] px-4 py-3 ring-1 ring-[#E4DCCB]"><summary className="cursor-pointer text-[15px] font-semibold text-[#8A3B23]">Ask {liar.name} a follow-up question</summary>
       {reply&&<p className="mt-3 rounded-2xl bg-[#EFE8D8] px-4 py-3 text-[16px] leading-7"><span className="block text-[13px] font-semibold text-[#8A3B23]">{liar.name}</span>{busy?"Thinking…":reply}</p>}
       {busy&&!reply&&<p className="mt-3 text-[#6B6457]">Thinking…</p>}
       <form onSubmit={e=>{e.preventDefault();ask(question)}} className="mt-3 flex gap-2"><label className="sr-only" htmlFor="lie-ask-box">Your question</label><input id="lie-ask-box" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={300} placeholder="Ask about what they said…" className="min-w-0 flex-1 rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#A0472C]"/><button disabled={!question.trim()||busy} className="case-primary disabled:opacity-40">Ask</button></form>
      </details>
      <div className="mt-6 flex justify-end"><button disabled={!lieState.caught} onClick={()=>{setStep("explain");setTimeout(()=>boxRef.current?.focus(),50)}} className="case-primary disabled:opacity-40">Explain it in your words <ArrowRight size={18}/></button></div>
     </div>}
     {step==="prove"&&!lie&&<div className="mt-6">
      <h2 className="text-[20px] font-bold">{asked?`Prove it or disprove it`:`Find your proof`}</h2>
      <p className="mt-1 text-[16px] leading-7 text-[#4A4438]">{asked?`Tap the line in the story that shows whether ${char?.name??"the character"} was right.`:notice}</p>
      {!asked&&<HomeText text={notice}/>}
      {proof?<blockquote className="mt-4 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[17px] leading-7"><Quote size={16} className="mb-1 text-[#A0472C]"/>{proof.text}</blockquote>:<p className="mt-4 flex items-center gap-2 rounded-2xl bg-[#EFE8D8] px-4 py-3 text-[15px] text-[#6B6457]"><Search size={16}/> <span className="lg:hidden">Scroll down and tap a line in the story.</span><span className="hidden lg:inline">Tap a line in the story on the left.</span></p>}
      {asked&&proof&&<div className="mt-4"><p className="text-[15px] font-semibold">This line…</p><div className="mt-2 grid grid-cols-2 gap-2">{[["supports","Backs them up"],["contradicts","Proves them wrong"]].map(([v,l])=><button key={v} onClick={()=>setStance(v)} className={`rounded-2xl px-4 py-3 text-[16px] font-semibold transition ${stance===v?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620] hover:bg-[#E4DCCB]"}`}>{l}</button>)}</div><p className="mt-2 text-[14px] text-[#6B6457]">Catching a character who got it wrong earns the Fact Checker badge.</p></div>}
      <div className="mt-6 flex justify-end"><button disabled={!proof||(!!asked&&!stance)} onClick={()=>{setStep("explain");setTimeout(()=>boxRef.current?.focus(),50)}} className="case-primary disabled:opacity-40">Use this line <ArrowRight size={18}/></button></div>
     </div>}
     {step==="explain"&&<div className="mt-6">
      <h2 className="text-[20px] font-bold">What does it show?</h2>
      <p className="mt-1 text-[16px] leading-7 text-[#4A4438]">{interpret}</p><HomeText text={interpret}/>
      {proof&&<blockquote className="mt-4 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[16px] leading-7">{proof.text}</blockquote>}
      <div className="mt-4 flex flex-wrap gap-2">{["This line shows…","I think this means… because…","This proves… was wrong because…"].map(s=><button key={s} onClick={()=>{setExplain(v=>v?v+" "+s:s);boxRef.current?.focus()}} className="rounded-full bg-[#EFE8D8] px-3 py-1.5 text-[14px] text-[#2A2620] hover:bg-[#E4DCCB]">{s}</button>)}</div>
      <label htmlFor="explain-box" className="sr-only">Your answer</label>
      <textarea id="explain-box" ref={boxRef} value={explain} onChange={e=>setExplain(e.target.value)} rows={4} maxLength={1200} placeholder="Write it in your own words…" className="mt-3 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px] leading-7 outline-none focus:border-[#A0472C]"/>
      <div className="mt-5 flex items-center justify-between gap-3"><button onClick={()=>setStep("prove")} className="text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Change my line</button><button disabled={!explain.trim()||!proof} onClick={save} className="case-primary disabled:opacity-40"><Check size={18}/> Save this clue</button></div>
     </div>}
    </div>
   </section>
  </div>
 </div>;
}

export function CaseSummary({world,demo,passages=[],onAnotherStory,personal=DEFAULT_PERSONAL}:{world:WorldPack;demo:Demo;passages?:SourcePassage[];onAnotherStory:()=>void;personal?:StoryPersonalSettings}){
 const role=world.roles.find(r=>r.id===demo.role);
 const items=world.scenes.flatMap(s=>s.artifacts).filter(a=>isDone(demo,a.id));
 const caught=items.filter(a=>demo.artifactAnswers[a.id]?.craft==="contradicts").length;
 const progress=useProgress();
 const chosen=choicesMade(world,demo.choices);
 const storyboard=storyboardSoFar(world,passages,demo.storyFrames,world.scenes.length-1);
 const verdict=verdictFor(demo.verdict,world.id);
 const date=new Date().toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">
  <div className="relative overflow-hidden rounded-3xl bg-[#FFFDF8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.35)] print:shadow-none">
   <div className="flex items-center justify-between gap-4 bg-[#2A2620] px-6 py-3 text-[13px] font-semibold uppercase tracking-[.14em] text-[#F3C9B2] print:bg-white print:text-black"><span>Case file · {world.title}</span><span className="hidden sm:inline">{date}</span></div>
   <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
    <div>
     <h1 className="text-[34px] font-bold leading-tight">Here's what you proved.</h1>
     <p className="mt-2 text-[17px] text-[#4A4438]">{role?`As ${partName(world,role.name,personal)}, you`:"You"} proved {items.length} clue{items.length===1?"":"s"}, each one backed by a line from the story.</p>
     <div className="mt-4 flex flex-wrap items-center gap-2"><RankChip/>{caught>0&&<FactCheckerBadge count={caught}/>}{verdict&&<ClosingArgumentBadge/>}<span className="text-[14px] text-[#6B6457]">{progress.scenes.length} scene{progress.scenes.length===1?"":"s"} solved so far</span></div>
    </div>
    <div aria-hidden className="case-stamp case-stamp-page justify-self-center">Case closed</div>
   </div>
  </div>
  {chosen.length>0&&<ul className="mt-6 space-y-2 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] print:shadow-none">{chosen.map(c=><li key={c.sceneId} className="text-[16px] text-[#2A2620]"><span className="font-semibold">You chose:</span> {c.label}</li>)}</ul>}
  {/* On screen: the case board. On paper: the clean list below, so it fits the page. */}
  <div className="mt-6 print:hidden"><h2 className="mb-3 text-[22px] font-bold">Your case board</h2><CaseBoard world={world} answers={demo.artifactAnswers} storyboard={storyboard} top={verdict&&<VerdictPanel world={world} verdict={verdict}/>}/></div>
  {verdict&&<section className="mt-6 hidden print:block"><VerdictPanel world={world} verdict={verdict}/></section>}
  {storyboard.length>0&&<section className="mt-6 hidden print:block"><h2 className="mb-3 text-[20px] font-bold">Your storyboard</h2><StoryboardRow frames={storyboard} print/></section>}
  <ol className="mt-6 hidden space-y-4 print:block">{items.map((a,i)=>{const x=demo.artifactAnswers[a.id];return <li key={a.id} className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] print:break-inside-avoid print:shadow-none">
   <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[14px] font-semibold text-[#8A3B23]">Exhibit {i+1}</p>{x.craft==="contradicts"&&<FactCheckerBadge count={1}/>}</div>
   <h2 className="text-[20px] font-bold">{a.name}</h2>
   <p className="mt-3 text-[17px] leading-7">{x.interpret}</p>
   <blockquote className="mt-3 border-l-4 border-[#A0472C] pl-4 font-serif text-[16px] italic leading-7 text-[#4A4438]">"{x.notice}"</blockquote>
   {x.craft&&<p className="mt-2 text-[14px] text-[#6B6457]">{x.craft==="supports"?"This line backed up what the character said.":"This line proved the character wrong."}</p>}
  </li>})}</ol>
  <div className="mt-8 flex flex-wrap gap-3 print:hidden"><button onClick={()=>window.print()} className="case-primary"><Printer size={18}/> Print or save as PDF</button><button onClick={onAnotherStory} className="case-secondary">Start another story</button></div>
 </div>;
}
