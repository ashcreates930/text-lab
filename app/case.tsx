"use client";
// The simplified student flow: land in the scene, open a clue, ask a character, prove it with a line from the story.
// Adults (teacher or parent) choose the story, grade and language; students never see those settings.
import {useEffect,useMemo,useRef,useState} from "react";
import {PlayCircle,ArrowLeft,ArrowRight,BookOpen,Check,LayoutGrid,Lock,MessageCircle,Printer,Square,Volume2,VolumeX} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {BilingualProvider,HomeText} from "./bilingual";
import {Ambient,ClosingArgumentBadge,FactCheckerBadge,RankChip,playStamp,recordClosingArgument,recordFactCheck,recordScene,useProgress} from "./case-game";
import {evidenceLabel,isDone,type Clue,type Scene} from "./clue-steps";
import {StorybookReader} from "./storybook/reader";
import {firstLockedPage,reconcileSaved} from "@/lib/storybook";
import {useLayoutEffect} from "react";
import {AmbientPlayer,CaseBoard,CaseBoardDialog,ConsequenceMoment,useSoundPref} from "./game-feel";
import {choicesMade} from "@/lib/game-feel";
import {focusScreenTop} from "./screen-focus";
import {nextStep} from "@/lib/next-step";
import {lieFor} from "@/lib/lies";
import {sceneScreenShowing} from "@/lib/ambient";
import {listenButton,narrationParts,playNarration,sceneReadingItems} from "@/lib/narration";
import {ContentNote} from "./content-note";
import {browserNarration,soundChannel,useSoundChannel} from "./sound-player";
const STORYBOOK_ON=false;
import {frameSaved,requiredFrame,sceneFrames,sceneSolved,storyboardSoFar,type SceneFrame} from "@/lib/storyboard";
import {FrameView,StoryboardRow,StoryboardStrip} from "./storyboard";
import {VerdictPanel,VerdictStamp,VerdictView} from "./verdict";
import {theoryOf,verdictFor} from "@/lib/verdict";
import {PlantLieView} from "./plant-lie";
import {RoleIntro,UnlockChallenge} from "./role-intro";
import {demoEndingDue,firstClue,preGameScreen} from "@/lib/pregame";
import {DemoEnding} from "./demo-ending";
import {ProofRaceSolo} from "./proof-race";
import {LaunchScreen} from "./launch-screen";
import {ExpeditionRace} from "./expedition-race";
import {ExpeditionMap} from "./expedition-map";
import {loadAttempts,saveAttempt} from "./expedition-store";
import {expeditionMap,newRank,nextExpedition,type ExpeditionAttempt} from "@/lib/expedition-progress";
import {LEGACY_MODES} from "@/lib/feature-flags";
import {hasProofRace} from "@/lib/proof-race";
import {StoryMode} from "./story-mode";
import {ClueScreen} from "./clue-screen";
import {SceneWriting} from "./scene-writing";
import {MissionLeads,MissionPick,MissionVerdictView,openLeads,studentMission} from "./missions";
import {sealedClue} from "@/lib/missions";
import {MissionScreen,playMode} from "./mode-screens";
import {YourTurn} from "./your-turn";
import {yourTurnChoices} from "@/lib/your-turn";
import {REPROVE,REPROVE_VERDICT,cluesToReprove,upgradeSavedProofs} from "@/lib/evidence-check";
import {DEFAULT_PERSONAL,choiceFrame,partName,type StoryPersonalSettings} from "@/lib/student-role";

// startAtLie: open straight to the story's first Spot the Lie clue (the home page's "Catch the lie"). onStartOver: clear
// this demo's progress (demo visitors only; the scene screen asks first).
type CaseProps={demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onExit:()=>void;onAnotherStory:()=>void;onTutorial?:()=>void;onFeedback?:()=>void;startAtLie?:boolean;onStarted?:()=>void;onStartOver?:()=>void;onJoinLive?:()=>void};
export function CaseFlow(props:CaseProps){
 return <BilingualProvider worldId={props.demo.worldId} lang={props.demo.homeLanguage??null}><CaseInner {...props}/></BilingualProvider>;
}

function CaseInner({demo,setDemo,onExit,onAnotherStory,onTutorial,onFeedback,startAtLie,onStarted,onStartOver,onJoinLive}:CaseProps){
 // racing: Proof Race is open (the one way to play when LEGACY_MODES is off).
 const [racing,setRacing]=useState(false);
 // The expedition map and saved attempts (this device, or the class for a signed-in student).
 const [mapOpen,setMapOpen]=useState(false),[expedition,setExpedition]=useState<string|null>(null),[earned,setEarned]=useState<string|null>(null);
 const [attempts,setAttempts]=useState<ExpeditionAttempt[]>([]),[assigned,setAssigned]=useState<{expeditionId:string;due:string|null}[]>([]);
 const worldId=demo.worldId;
 useEffect(()=>{if(!worldId)return;let live=true;loadAttempts(worldId,demo.classAuth).then(r=>{if(live){setAttempts(r.attempts);setAssigned(r.assigned)}});return()=>{live=false}},[worldId,demo.classAuth]);
 const [world,setWorld]=useState<WorldPack|null>(null),[passages,setPassages]=useState<SourcePassage[]>([]),[error,setError]=useState("");
 const [openClue,setOpenClue]=useState<string>(""),[openFrame,setOpenFrame]=useState(""),[openWriting,setOpenWriting]=useState(false),[openLeadsFor,setOpenLeadsFor]=useState(""),[verdictOpen,setVerdictOpen]=useState(false),[toast,setToast]=useState(""),[celebrate,setCelebrate]=useState<{sceneId:string;rankUp:string|null}|null>(null),[justProven,setJustProven]=useState(""),[plantClue,setPlantClue]=useState("");
 // Opening a clue or a storyboard frame, or going back to the scene, is a new screen: start at the top with focus on its heading.
 // Students in the story: a class follows its teacher's settings for roles and angles; everyone else has both on.
 const [personal,setPersonal]=useState<StoryPersonalSettings|null>(demo.classAuth?null:DEFAULT_PERSONAL);
 // Story Mode is on unless the class's teacher switched scenes to the Case file view.
 const [storyModeOn,setStoryModeOn]=useState(true);
 // Story Mode isn't available (its tables aren't set up): scenes open in the Case file view for everyone this visit.
 // storyJump: "Catch the lie" opens Story Mode at round 3 on the first scene with a testimony.
 const [storyUnavailable,setStoryUnavailable]=useState(false),[storyJump,setStoryJump]=useState<{sceneId:string;round:"lie"}|null>(null);
 useEffect(()=>{if(!demo.classAuth)return;fetch("/api/student/class",{headers:{"x-class-token":demo.classAuth.token},cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{setPersonal(j?{rolesOn:j.rolesOn!==false,anglesOn:j.anglesOn!==false}:DEFAULT_PERSONAL);setStoryModeOn(j?.storyModeOn!==false);if(typeof j?.seat==="number")setDemo(d=>d.classSeat===j.seat?d:{...d,classSeat:j.seat})}).catch(()=>setPersonal(DEFAULT_PERSONAL))},[demo.classAuth]);
 const screen=`${openClue}|${openFrame}|${openWriting}|${openLeadsFor}|${demo.mission??""}|${verdictOpen}|${plantClue}|${!!demo.roleIntroSeen}|${storyUnavailable}|${(demo.missionSeen??[]).length}`,shownScreen=useRef(screen);
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
 if(!world||!world.roles.some(r=>r.id===demo.role))return <div className="case-ui grid min-h-[60vh] place-items-center"><p className="text-[15px] text-muted">Opening the story…</p></div>;
 const sceneIndex=Math.min(demo.scene,world.scenes.length-1),scene=world.scenes[sceneIndex],role=world.roles.find(r=>r.id===demo.role)!;
 // One way to play (LEGACY_MODES off): the launch screen, then Proof Race. The case flow below stays behind the flag.
 if(!LEGACY_MODES){
  // Start Proof Race opens the next expedition's Interview directly; the map is reached from the launch screen and
  // after Case Notes.
  const stops=expeditionMap(world,attempts,assigned),next=nextExpedition(stops);
  const proven=(list:ExpeditionAttempt[])=>new Set(list.filter(a=>a.finishedAt).map(a=>a.expeditionId)).size;
  function record(a:ExpeditionAttempt){setAttempts(list=>{const before=proven(list),nextList=[...list.filter(x=>x.attemptId!==a.attemptId),a];if(proven(nextList)>before)setEarned(newRank(before,stops.length));return nextList});saveAttempt(a,demo.classAuth)}
  if(racing&&passages.length&&(expedition??next))return <ExpeditionRace key={expedition??next!} world={world} passages={passages} expeditionId={(expedition??next)!} preset={demo.preset} studentKey={demo.classAuth?`class:${demo.classAuth.className??""}:${demo.classAuth.nickname}`:undefined} onSave={record} onExit={()=>{setRacing(false);setExpedition(null);setMapOpen(true)}}/>;
  if(mapOpen)return <ExpeditionMap world={world} attempts={attempts} assigned={assigned} justEarned={earned} onStart={id=>{setEarned(null);setExpedition(id);setMapOpen(false);setRacing(true)}} onBack={()=>{setEarned(null);setMapOpen(false)}}/>;
  return <LaunchScreen world={world} ready={passages.length>0&&!!next} onStart={()=>{setExpedition(null);setRacing(true)}} onMap={(world.expeditions?.length??0)>0?()=>setMapOpen(true):undefined} onJoinLive={onJoinLive}/>;
 }
 const finished=demo.submitted;
 if(finished)return <CaseSummary world={world} demo={demo} passages={passages} onAnotherStory={onAnotherStory} personal={personal??DEFAULT_PERSONAL} setDemo={setDemo}/>;
 // Before the game, once (after saved progress has loaded): one screen with the role story and the mode cards, then
 // the mission pick (lib/pregame.ts). The last tap opens the passage: round 1 of Story Mode, or the scene's first clue.
 // The mission map is skipped before the first scene and shows between scenes.
 const loaded=!!personal&&(!demo.classAuth||demo.classProgressLoaded);
 const pre=preGameScreen(world,demo);
 const introDue=loaded&&pre==="role-and-mode"&&(!demo.classAuth||!Object.keys(demo.artifactAnswers).length);
 const enterPassage=(d:Demo,sceneIdx:number):Demo=>{const sc=world.scenes[Math.min(sceneIdx,world.scenes.length-1)];
  if(!storyJump&&!(sc.story_mode&&storyModeOn&&!d.caseFileView&&!storyUnavailable)){const c=firstClue(sc);if(c)setOpenClue(c.id)}
  return {...d,missionSeen:[...new Set([...(d.missionSeen??[]),sc.id])]}};
 if(introDue&&personal){const startIdx=demo.scene===0&&!storyJump&&personal.rolesOn&&world.student_role?Math.max(0,world.scenes.findIndex(s=>s.id===world.student_role!.start_scene)):demo.scene;
  return <RoleIntro world={world} settings={personal} onDone={angle=>setDemo(d=>{const next={...d,roleIntroSeen:true,...(angle?{angle:{...(d.angle??{}),...angle}}:{}),scene:startIdx};return world.missions?.length?next:enterPassage(next,startIdx)})}/>}
 // Proof Race (solo): chunked reading against the Lantern Ghost; "Play the case" goes on to the mission and the scenes.
 if(loaded&&demo.angle?.style==="race"&&hasProofRace(world)&&passages.length)return <ProofRaceSolo world={world} passages={passages} preset={demo.preset} onExit={()=>setDemo(d=>({...d,angle:{...(d.angle??{}),style:"solo"}}))}/>;
 if(loaded&&pre==="mission")return <MissionPick world={world} onPick={id=>setDemo(d=>enterPassage({...d,mission:id},d.scene))}/>;
 // The public demo's ending after scene 1 (app/demo-ending.tsx), until the player goes on to scene 2.
 if(demo.demoEnding&&demo.demoEnding!=="done")return <DemoEnding world={world} passages={passages} demo={demo} setDemo={setDemo} sceneIndex={sceneIndex} onAnotherStory={onAnotherStory}/>;
 if(STORYBOOK_ON&&world.storybook)return <StorybookReader world={world} role={role} passages={passages} demo={demo} setDemo={setDemo} onExit={onExit} onFeedback={onFeedback}/>;
 const frames=sceneFrames(world,passages,sceneIndex);
 // The scene is solved when every clue is proven and its required frame is saved, whichever comes last.
 const celebrateScene=()=>{setCelebrate({sceneId:scene.id,rankUp:recordScene(`${world.id}:${scene.id}`)});playStamp()};
 // Closing the case: after a verdict, the Closing Argument badge; then the case summary.
 const closeCase=()=>{if(verdictFor(demo.verdict,world.id))recordClosingArgument(world.id);playStamp(250);setDemo(d=>({...d,submitted:true,events:[...d.events,"case_closed"]}));setVerdictOpen(false);window.scrollTo({top:0})};
 // Students with a mission close the case with the mission verdict (it replaces the Final Verdict).
 if(verdictOpen&&studentMission(world,demo))return <MissionVerdictView world={world} passages={passages} demo={demo} setDemo={setDemo} onBack={()=>setVerdictOpen(false)} onFinish={closeCase}/>;
 if(verdictOpen&&world.verdict)return <VerdictView world={world} demo={demo} setDemo={setDemo} reprove={reprove} onBack={()=>setVerdictOpen(false)} onFinish={closeCase}/>;
 const frame=frames.find(f=>f.key===openFrame);
 if(frame)return <FrameView world={world} frame={frame} passages={passages} demo={demo} setDemo={setDemo} onClose={saved=>{setOpenFrame("");if(!saved)return;window.scrollTo({top:0});setToast("Frame saved to your storyboard.");
  if(frame.required&&!frameSaved(demo.storyFrames,frame.key)&&scene.artifacts.every(a=>isDone(demo,a.id)))celebrateScene()}}/>;
 // Plant a Lie (class students only): a new screen for a clue they have proven.
 const planting=demo.classAuth?scene.artifacts.find(a=>a.id===plantClue&&isDone(demo,a.id)):undefined;
 if(planting&&demo.classAuth)return <PlantLieView world={world} scene={scene} clue={planting} passages={passages} token={demo.classAuth.token} onClose={()=>setPlantClue("")}/>;
 const leadScene=world.scenes.find(s=>s.id===openLeadsFor);
 if(leadScene)return <MissionLeads world={world} scene={leadScene} passages={passages} demo={demo} setDemo={setDemo} onClose={()=>{setOpenLeadsFor("");window.scrollTo({top:0})}}/>;
 if(openWriting)return <SceneWriting world={world} scene={scene} sceneIndex={sceneIndex} roleId={role.id} demo={demo} setDemo={setDemo} onClose={saved=>{setOpenWriting(false);if(saved){window.scrollTo({top:0});setToast("Your writing for this scene is saved.")}}}/>;
 const clue=scene.artifacts.find(a=>a.id===openClue);
 if(clue)return <ClueScreen world={world} scene={scene} sceneIndex={sceneIndex} clue={clue} roleId={role.id} demo={demo} setDemo={setDemo} passages={passages} onClose={(saved,info)=>{setOpenClue("");if(!saved)return;window.scrollTo({top:0});setJustProven(clue.id);
  const badge=info?.factCheck?recordFactCheck(`${world.id}:${clue.id}`):false;
  setToast(badge?"Badge earned: Fact Checker. You used the story to prove a character wrong.":`Clue proven and saved to your case file.${info?.points?` +${info.points} points.`:""}`);
  if(info?.solves&&sceneSolved(true,frames,demo.storyFrames))celebrateScene()}}/>;
 // Story Mode: scenes with a story_mode block are played as four timed rounds, unless an adult opened the Case file
 // view (demo) or the teacher turned Story Mode off for the class. Then the clue board below is the scene.
 // Solo players get the mission screen once per scene, before the scene itself.
 if(playMode(demo)==="solo"&&!(demo.missionSeen??[]).includes(scene.id))return <MissionScreen world={world} demo={demo} sceneIndex={sceneIndex} onGo={()=>setDemo(d=>({...d,missionSeen:[...new Set([...(d.missionSeen??[]),scene.id])]}))}/>;
 const storyHere=!!scene.story_mode&&storyModeOn&&!demo.caseFileView&&!storyUnavailable;
 if(storyHere)return <StoryMode key={scene.id} world={world} scene={scene} sceneIndex={sceneIndex} passages={passages} demo={demo} setDemo={setDemo} startAt={storyJump?.sceneId===scene.id?storyJump.round:undefined} onJumped={()=>setStoryJump(null)} onUnavailable={()=>{if(storyJump&&scene.lie)setOpenClue(scene.lie.clue_id);setStoryJump(null);setStoryUnavailable(true)}} clearedLabel={demoEndingDue(demo,world,sceneIndex)?`Close scene ${sceneIndex+1}`:undefined} onCleared={()=>{setDemo(d=>demoEndingDue(d,world,sceneIndex)?{...d,demoEnding:"verdict"}:{...d,scene:Math.min(d.scene+1,world.scenes.length-1),events:[...d.events,"scene_complete"]})}} onCaseFile={demo.classAuth?undefined:()=>setDemo(d=>({...d,caseFileView:true}))} onLeads={openLeads(world,demo,scene.id).length?()=>setOpenLeadsFor(scene.id):undefined}/>;
 return <SceneView world={world} scene={scene} sceneIndex={sceneIndex} onStoryMode={scene.story_mode&&demo.caseFileView&&!demo.classAuth&&!storyUnavailable?()=>setDemo(d=>({...d,caseFileView:false})):undefined} role={role} demo={demo} setDemo={setDemo} passages={passages} frames={frames} onOpenFrame={setOpenFrame} onOpenVerdict={()=>setVerdictOpen(true)} onOpenWriting={()=>setOpenWriting(true)} onOpenLeads={()=>setOpenLeadsFor(scene.id)} onCloseCase={closeCase} onOpenClue={id=>{setOpenClue(id);window.scrollTo({top:0})}} onExit={onExit} onStartOver={demo.classAuth?undefined:onStartOver} onPlantLie={demo.classAuth?setPlantClue:undefined} personal={personal??DEFAULT_PERSONAL} reprove={reprove} toast={toast} celebrating={celebrate?.sceneId===scene.id} rankUp={celebrate?.sceneId===scene.id?celebrate.rankUp:null} justProven={justProven} onTutorial={onTutorial}/>;
}

function SceneView({world,scene,sceneIndex,role,demo,setDemo,passages,frames,onOpenFrame,onOpenVerdict,onOpenWriting,onOpenLeads,onCloseCase,onOpenClue,onExit,onStartOver,onStoryMode,onPlantLie,personal,reprove,toast,celebrating,rankUp,justProven,onTutorial}:{onStartOver?:()=>void;onStoryMode?:()=>void;onPlantLie?:(clueId:string)=>void;personal:StoryPersonalSettings;reprove:string[];world:WorldPack;scene:Scene;sceneIndex:number;role:WorldPack["roles"][number];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];frames:SceneFrame[];onOpenFrame:(key:string)=>void;onOpenVerdict:()=>void;onOpenWriting:()=>void;onOpenLeads:()=>void;onCloseCase:()=>void;onOpenClue:(id:string)=>void;onExit:()=>void;toast:string;celebrating:boolean;rankUp:string|null;justProven:string;onTutorial?:()=>void}){
 const startOverRef=useRef<HTMLButtonElement>(null);
 const [confirmStart,setConfirmStart]=useState(false),[reading,setReading]=useState(false),[boardOpen,setBoardOpen]=useState(false),[moment,setMoment]=useState<{text:string;image:string}|null>(null);
 // Ambient sound: on for the demo, off for class sessions; the student can switch it either way.
 const [ambientOn,toggleAmbient]=useSoundPref("ambient",demo.preset);
 const sealed=sealedClue(studentMission(world,demo));
 const open=scene.artifacts.filter(a=>a.id!==sealed);
 const done=open.filter(a=>isDone(demo,a.id)).length,total=open.length,allDone=done===total;
 const solved=sceneSolved(allDone,frames,demo.storyFrames),needFrame=requiredFrame(frames);
 const locked=(a:Clue)=>a.id===sealed||(!!a.unlock_condition?.startsWith("artifact:")&&!isDone(demo,a.unlock_condition.slice(9)));
 const next=open.find(a=>!isDone(demo,a.id)&&!locked(a));
 const last=sceneIndex===world.scenes.length-1;
 const readingItems=sceneReadingItems(world,scene,passages);
 // "Listen to the scene" reads the paragraphs in the reading panel, one at a time, highlighting each. It stops when the
 // student opens a clue, moves to another scene, leaves the case or switches language.
 const listening=listenButton(useSoundChannel(),scene.id);
 const paragraphRefs=useRef<(HTMLElement|null)[]>([]);
 useEffect(()=>()=>{if(soundChannel.state.kind==="narration")soundChannel.stop()},[scene.id,demo.homeLanguage]);
 useEffect(()=>{const el=paragraphRefs.current[listening.part];if(!el)return;const still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;el.scrollIntoView({block:"nearest",behavior:still?"auto":"smooth"})},[listening.part]);
 function goNext(){setDemo(d=>demoEndingDue(d,world,sceneIndex)?{...d,demoEnding:"verdict"}:{...d,scene:d.scene+1,events:[...d.events,"scene_complete"]});window.scrollTo({top:0})}
 // Closing the case after a Final Verdict shows the VERDICT stamp first.
 const savedVerdict=verdictFor(demo.verdict,world.id),[stamping,setStamping]=useState(false);
 function finish(){if(savedVerdict&&world.verdict){setStamping(true);return}onCloseCase()}
 function listen(){if(listening.playing){soundChannel.stop();return}setReading(true);playNarration(soundChannel,scene.id,narrationParts(world,scene,passages),browserNarration)}
 const nextImage=world.scenes[sceneIndex+1]?.background_image??scene.background_image;
 const step=nextStep({clues:open.map(a=>({id:a.id,name:a.name,done:isDone(demo,a.id),locked:locked(a)})),leads:openLeads(world,demo,scene.id).length,...(scene.artifacts.length?{writing:{saved:!!demo.sceneWriting?.[scene.id]}}:{}),requiredFrame:needFrame&&{key:needFrame.key,saved:frameSaved(demo.storyFrames,needFrame.key)},last,hasChoice:!!scene.choice_point,choicePrompt:scene.choice_point?.prompt,verdict:studentMission(world,demo)?{done:demo.missionVerdict?.mission_id===demo.mission}:world.verdict?{done:!!savedVerdict}:undefined});
 function choose(o:NonNullable<Scene["choice_point"]>["options"][number]){setDemo(d=>({...d,events:[...d.events,"delegation"],connection:o.consequence_narration,choices:{...(d.choices??{}),[scene.id]:o.id}}));setMoment({text:o.consequence_narration,image:nextImage})}
 function act(){const a=step.action;if(a.kind==="clue")onOpenClue(a.clueId);else if(a.kind==="lead")onOpenLeads();else if(a.kind==="writing")onOpenWriting();else if(a.kind==="frame")onOpenFrame(a.frameKey);else if(a.kind==="next")goNext();else if(a.kind==="verdict")onOpenVerdict();else if(a.kind==="close")finish()}
 return <div className="case-ui mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8">
  <AmbientPlayer src={scene.ambient_audio} on={ambientOn} showing={sceneScreenShowing({inCase:true,clueOpen:false,frameOpen:false,boardOpen,consequence:!!moment||stamping})}/>
  {moment&&<ConsequenceMoment image={moment.image} text={moment.text} onContinue={()=>{setMoment(null);goNext()}}/>}
  {stamping&&savedVerdict&&<VerdictStamp theory={theoryOf(world,savedVerdict.theory_id)?.name??""} onContinue={onCloseCase}/>}
  {boardOpen&&<CaseBoardDialog world={world} answers={demo.artifactAnswers} reprove={reprove} storyboard={storyboardSoFar(world,passages,demo.storyFrames,sceneIndex)} top={savedVerdict&&<VerdictPanel world={world} verdict={savedVerdict}/>} onClose={()=>setBoardOpen(false)}/>}
  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:gap-4">
   <button onClick={onExit} className="inline-flex items-center gap-2 rounded-full px-2 py-2 sm:px-3 text-[15px] text-muted hover:bg-panel-2"><ArrowLeft size={18}/> Stories</button>{onTutorial&&<button onClick={onTutorial} className={`${onStartOver&&!confirmStart?"":"mr-auto "}inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-muted hover:bg-panel-2`}><PlayCircle size={18}/> <span className="hidden sm:inline">How it works</span><span className="sr-only sm:hidden">How it works</span></button>}
   {onStoryMode&&<button type="button" onClick={onStoryMode} className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[15px] font-semibold text-highlight underline-offset-4 hover:underline">Play Story Mode</button>}
   {onStartOver&&!confirmStart&&<button ref={startOverRef} type="button" onClick={()=>setConfirmStart(true)} className="mr-auto inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[15px] text-muted underline-offset-4 hover:underline">Start over</button>}
   <div className="flex items-center gap-2 text-[15px] text-muted sm:gap-3"><span className="hidden sm:inline">{world.title}</span><span className="whitespace-nowrap rounded-full bg-panel-2 px-3 py-1 font-semibold text-ink">Scene {sceneIndex+1} of {world.scenes.length}</span><RankChip/></div>
  </div>
  {confirmStart&&onStartOver&&<div role="group" aria-labelledby="start-over-h" className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-primary-soft px-4 py-3"><p id="start-over-h" className="text-[16px] font-semibold text-ink">Start over? This clears your clues and progress in this demo.</p><div className="flex gap-2"><button type="button" onClick={()=>{setConfirmStart(false);onStartOver()}} className="case-primary !min-h-11 !px-4 !text-[15px]">Yes, start over</button><button type="button" autoFocus onClick={()=>{setConfirmStart(false);setTimeout(()=>startOverRef.current?.focus({preventScroll:true}),0)}} className="case-secondary !min-h-11 !px-4 !text-[15px]">Keep playing</button></div></div>}
  <div className="relative mx-auto mt-4 overflow-hidden rounded-3xl md:max-w-[calc(44vh*2)]">
   <div className={`case-art aspect-[4/3] w-full sm:aspect-[3/2] md:aspect-[16/8] ${solved?"case-alive":""}`} style={{backgroundImage:`url('${scene.background_image}')`}} role="img" aria-label={`Scene: ${scene.id.replaceAll("-"," ")}`}/>
   {solved&&<Ambient worldId={world.id}/>}
   {scene.artifacts.map((a,i)=>{const lk=locked(a),dn=isDone(demo,a.id);return <button key={a.id} disabled={lk} onClick={()=>onOpenClue(a.id)} aria-label={`Clue ${i+1}: ${a.name}${lieFor(scene,a.id)?", testimony":""}${reprove.includes(a.id)?`, ${REPROVE.toLowerCase()}`:dn?", done":a.id===sealed?", opens at your verdict":lk?", locked":""}`} className={`absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[15px] font-bold shadow-lg ring-4 transition hover:scale-110 ${a.id===justProven?"case-pop ":""}${dn?"bg-panel text-highlight ring-stage/40":lk?"bg-deep/70 text-muted ring-edge":"case-pulse bg-primary text-on-primary ring-primary/30"}`} style={{left:`${a.position.x+a.position.width/2}%`,top:`${a.position.y+a.position.height/2}%`}}>{dn?<Check size={18}/>:lk?<Lock size={15}/>:i+1}{lieFor(scene,a.id)&&<span aria-hidden className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-deep text-ink ring-2 ring-stage"><MessageCircle size={11}/></span>}</button>})}
   {solved&&<div aria-hidden className={`case-stamp pointer-events-none z-10 ${celebrating?"":"case-stamp-static"}`}>Scene solved</div>}
  </div>
  {/* The role and goal sit under the picture, so no clue marker covers them. */}
  <div className="mx-auto mt-3 md:max-w-[calc(44vh*2)]">
   <p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">You are {partName(world,role.name,personal)}</p>
   <h1 className="mt-0.5 text-[20px] font-bold leading-snug text-ink outline-none md:text-[24px]">{role.goal}</h1>
   <HomeText text={role.goal}/>
   {done===0&&next&&<p className="mt-2 inline-flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-[15px] font-bold text-highlight"><span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[13px] text-on-primary">{scene.artifacts.indexOf(next)+1}</span>Start here: tap the glowing clue</p>}
  </div>
  {/* Next step: one line of progress and the one button that points to what to do next. */}
  <section aria-label="Next step" className="mx-auto mt-4 flex flex-col gap-3 rounded-3xl bg-panel p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">
   <div className="min-w-0">
    <p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">Next step</p>
    <p className="mt-0.5 text-[17px] font-bold text-ink">{step.progress}</p>
    {step.action.kind==="choice"&&choiceFrame(world,scene.choice_point,personal)&&<p className="mt-1 text-[16px] italic leading-6 text-muted">{choiceFrame(world,scene.choice_point,personal)}</p>}
    {step.action.kind==="choice"&&<><p className="mt-1 text-[16px] leading-6 text-ink">{step.action.label}</p><HomeText text={step.action.label}/></>}
   </div>
   {step.action.kind==="choice"&&scene.choice_point
    ?<div className="grid gap-2 sm:grid-cols-2 md:w-[58%] md:shrink-0">{scene.choice_point.options.map(o=><button key={o.id} onClick={()=>choose(o)} className="rounded-2xl bg-primary px-5 py-4 text-left text-[17px] font-semibold text-on-primary transition hover:bg-primary">{o.label}<HomeText text={o.label} className="border-edge text-[15px] font-normal text-ink"/></button>)}</div>
    :step.action.kind==="verdict"&&reprove.length?<div className="md:w-[58%] md:shrink-0"><button type="button" disabled aria-describedby="verdict-blocked" className="case-primary min-h-[58px] w-full text-[18px] opacity-50">{step.action.label} <ArrowRight size={20}/></button><p id="verdict-blocked" className="mt-2 text-[15px] leading-6 text-notyet">{REPROVE_VERDICT}</p></div>
    :<button onClick={act} className="case-primary min-h-[58px] w-full text-[18px] md:w-auto md:min-w-[300px] md:shrink-0">{step.action.label} <ArrowRight size={20}/></button>}
  </section>
  <div role="status" aria-live="polite">{celebrating&&<p className="case-rise mt-4 rounded-2xl bg-primary px-5 py-3 text-[16px] font-semibold text-on-primary">Scene solved. Every clue is backed by the story.{rankUp?` New rank: ${rankUp}.`:""}</p>}
  {toast&&<p className="mt-4 rounded-2xl bg-deep px-5 py-3 text-[15px] text-ink"><Check size={16} className="mr-2 inline"/>{toast}</p>}
  {onPlantLie&&justProven&&isDone(demo,justProven)&&<button type="button" onClick={()=>onPlantLie(justProven)} className="mt-2 text-[15px] font-semibold text-highlight underline-offset-4 hover:underline">Plant a lie about this clue for your class</button>}</div>
  {/* Clues: one compact row. A chip opens its clue, just like its pin on the picture. */}
  <section aria-labelledby="clues-h" className="mt-5">
   <h2 id="clues-h" className="sr-only">Clues</h2>
   <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="list">{scene.artifacts.map((a,i)=>{const lk=locked(a),dn=isDone(demo,a.id),isNext=step.action.kind==="clue"&&step.action.clueId===a.id;return <li key={a.id} className="min-w-0"><button disabled={lk} onClick={()=>onOpenClue(a.id)} aria-label={`Clue ${i+1}: ${a.name}${lieFor(scene,a.id)?", testimony":""}${reprove.includes(a.id)?`, ${REPROVE.toLowerCase()}`:dn?", proven":a.id===sealed?", opens at your verdict":lk?", locked":""}`} title={`${a.name} · ${a.id===sealed?"Opens at your verdict":lk?"Opens after an earlier clue":dn?"Proven":evidenceLabel[a.evidence_type]}`} className={`flex h-full w-full items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3 text-left transition ${a.id===justProven?"case-pop ":""}${lk?"cursor-not-allowed bg-panel-2/60 text-muted":isNext?"bg-panel ring-2 ring-primary":"bg-panel hover:bg-primary-soft"}`}>
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ${dn?"bg-primary-soft text-highlight":lk?"bg-panel-2 text-muted":"bg-primary text-on-primary"}`}>{dn?<Check size={16}/>:lk?<Lock size={14}/>:i+1}</span>
    <span className="min-w-0 flex-1"><span className="line-clamp-2 block text-[14px] font-semibold leading-snug sm:text-[15px]">{a.name}</span>{lieFor(scene,a.id)&&<span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-deep px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink"><MessageCircle size={10}/>Testimony</span>}{reprove.includes(a.id)&&<span className="mt-0.5 block text-[12px] font-bold text-notyet">{REPROVE}</span>}{a.id===sealed&&<span className="mt-0.5 block text-[12px] font-bold text-muted">Opens at your verdict</span>}<HomeText text={a.name} className="text-[12px]"/></span>
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
  {reading&&<div id="scene-reading" className="mt-3 max-h-[60vh] space-y-4 overflow-y-auto rounded-2xl bg-panel p-5 font-serif text-[17px] leading-8 text-ink">
   {scene.summary&&<div className="rounded-2xl bg-panel-2 p-4 font-sans"><p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">What happens here</p><p className="mt-1 text-[15px] leading-6 text-muted">{scene.summary}</p><HomeText text={scene.summary} className="text-[15px]"/></div>}
   {readingItems.map((item,i)=>item.kind==="note"?<div key={item.id} ref={el=>{paragraphRefs.current[i]=el}}><ContentNote text={item.text} active={listening.part===i}/></div>:<p key={item.id} ref={el=>{paragraphRefs.current[i]=el}} aria-current={listening.part===i||undefined} className={`-mx-2 rounded-lg px-2 transition-colors motion-reduce:transition-none ${listening.part===i?"bg-primary-soft":""}`}>{item.text}</p>)}{!readingItems.length&&<p className="text-muted">The story text is loading.</p>}
  </div>}
 </div>;
}

export function CaseSummary({world,demo,passages=[],onAnotherStory,personal=DEFAULT_PERSONAL,setDemo}:{world:WorldPack;demo:Demo;passages?:SourcePassage[];onAnotherStory:()=>void;personal?:StoryPersonalSettings;setDemo?:React.Dispatch<React.SetStateAction<Demo>>}){
 // Your Turn: a personal activity after the game, from the student's angle answers.
 const [yourTurn,setYourTurn]=useState(false),[unlocking,setUnlocking]=useState(false);
 // "Unlock your challenge" comes first, once, unless the teacher turned angles off (then: the Cold case file).
 const needUnlock=personal.anglesOn&&!demo.challengeAsked&&!demo.angle?.firedUpBy&&!demo.angle?.lane;
 const ytChoices=world.your_turn?yourTurnChoices(world,demo.angle):[];
 const ytDone=(demo.yourTurn??[]).filter(e=>ytChoices.includes(e.activity));
 const role=world.roles.find(r=>r.id===demo.role);
 const items=world.scenes.flatMap(s=>s.artifacts).filter(a=>isDone(demo,a.id));
 const caught=items.filter(a=>demo.artifactAnswers[a.id]?.craft==="contradicts").length;
 const progress=useProgress();
 const chosen=choicesMade(world,demo.choices);
 const storyboard=storyboardSoFar(world,passages,demo.storyFrames,world.scenes.length-1);
 const verdict=verdictFor(demo.verdict,world.id);
 const date=new Date().toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
 if(unlocking&&setDemo)return <UnlockChallenge onDone={a=>{setDemo(d=>({...d,challengeAsked:true,angle:{...(d.angle??{}),...a}}));setUnlocking(false);setYourTurn(true)}}/>;
 if(yourTurn&&setDemo)return <YourTurn world={world} passages={passages} choices={ytChoices} theory={verdictFor(demo.verdict,world.id)?.theory_id??null} proven={Object.values(demo.artifactAnswers).map(a=>a.notice).filter(Boolean)} ai={{sandboxId:demo.id,classToken:demo.classAuth?.token,sceneId:world.scenes[world.scenes.length-1].id}} onSave={e=>{setDemo(d=>({...d,yourTurn:[...(d.yourTurn??[]),e].slice(-30)}))}} onClose={()=>{setYourTurn(false);setTimeout(()=>focusScreenTop(),0)}}/>;
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">
  <div className="relative overflow-hidden rounded-3xl bg-panel print:shadow-none">
   <div className="flex items-center justify-between gap-4 bg-deep px-6 py-3 text-[13px] font-semibold uppercase tracking-[.14em] text-muted print:bg-panel print:text-ink"><span>Case file · {world.title}</span><span className="hidden sm:inline">{date}</span></div>
   <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
    <div>
     <h1 className="text-[34px] font-bold leading-tight">Here's what you proved.</h1>
     <p className="mt-2 text-[17px] text-muted">{role?`As ${partName(world,role.name,personal)}, you`:"You"} proved {items.length} clue{items.length===1?"":"s"}, each one backed by a line from the story.</p>
     <div className="mt-4 flex flex-wrap items-center gap-2"><RankChip/>{caught>0&&<FactCheckerBadge count={caught}/>}{verdict&&<ClosingArgumentBadge/>}<span className="text-[14px] text-muted">{progress.scenes.length} scene{progress.scenes.length===1?"":"s"} solved so far</span></div>
    </div>
    <div aria-hidden className="case-stamp case-stamp-page justify-self-center">Case closed</div>
   </div>
  </div>
  {ytChoices.length>0&&setDemo&&<section aria-labelledby="yt-card-h" className="mt-6 rounded-3xl bg-deep p-5 text-ink print:hidden"><p className="text-[12px] font-bold uppercase tracking-wide text-muted">5 to 7 minutes</p><h2 id="yt-card-h" className="text-[22px] font-bold">Your Turn</h2><p className="mt-1 text-[15px] text-muted">{needUnlock?"One more trip into the story, picked to fit you.":`One more trip into the story: ${ytChoices.map(c=>world.your_turn!.activities[c].title).join(" or ")}.`}</p>{ytDone.length>0&&<p className="mt-1 text-[14px] text-muted">Done: {ytDone.map(e=>e.title).join(", ")}</p>}<button type="button" onClick={()=>needUnlock?setUnlocking(true):setYourTurn(true)} className="case-primary mt-3">{needUnlock?"Unlock your challenge":ytDone.length?"Do another":"Start Your Turn"} <ArrowRight size={18}/></button></section>}
  {chosen.length>0&&<ul className="mt-6 space-y-2 rounded-3xl bg-panel p-5 print:shadow-none">{chosen.map(c=><li key={c.sceneId} className="text-[16px] text-ink"><span className="font-semibold">You chose:</span> {c.label}</li>)}</ul>}
  {/* On screen: the case board. On paper: the clean list below, so it fits the page. */}
  <div className="mt-6 print:hidden"><h2 className="mb-3 text-[22px] font-bold">Your case board</h2><CaseBoard world={world} answers={demo.artifactAnswers} storyboard={storyboard} top={verdict&&<VerdictPanel world={world} verdict={verdict}/>}/></div>
  {verdict&&<section className="mt-6 hidden print:block"><VerdictPanel world={world} verdict={verdict}/></section>}
  {storyboard.length>0&&<section className="mt-6 hidden print:block"><h2 className="mb-3 text-[20px] font-bold">Your storyboard</h2><StoryboardRow frames={storyboard} print/></section>}
  <ol className="mt-6 hidden space-y-4 print:block">{items.map((a,i)=>{const x=demo.artifactAnswers[a.id];return <li key={a.id} className="rounded-3xl bg-panel p-6 print:break-inside-avoid print:shadow-none">
   <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[14px] font-semibold text-highlight">Exhibit {i+1}</p>{x.craft==="contradicts"&&<FactCheckerBadge count={1}/>}</div>
   <h2 className="text-[20px] font-bold">{a.name}</h2>
   <p className="mt-3 text-[17px] leading-7">{x.interpret}</p>
   <blockquote className="mt-3 border-l-4 border-primary pl-4 font-serif text-[16px] italic leading-7 text-muted">"{x.notice}"</blockquote>
   {x.craft&&<p className="mt-2 text-[14px] text-muted">{x.craft==="supports"?"This line backed up what the character said.":"This line proved the character wrong."}</p>}
  </li>})}</ol>
  <div className="mt-8 flex flex-wrap gap-3 print:hidden"><button onClick={()=>window.print()} className="case-primary"><Printer size={18}/> Print or save as PDF</button><button onClick={onAnotherStory} className="case-secondary">Start another story</button></div>
 </div>;
}
