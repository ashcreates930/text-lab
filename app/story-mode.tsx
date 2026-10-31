"use client";
// Story Mode (solo): the student lives inside the scene as their role and plays four rounds up the ladder: locate, infer,
// catch the lie, build the case. Each round opens on its own screen with a compact banner (the question and the next
// goal, with the Relaxed timer, scoring and power-ups as small links); the timer starts at the first tap. Then results. A miss is a "Not yet" screen (amber, no points, the try count and a hint)
// and a fresh 30 seconds; after three misses the answer is shown and the proof step still comes, for 0 points.
// One screen flow, one clear action at a time. The server scores every try (lib/story-server.ts); the rules are in
// lib/story-mode.ts and lib/fair-play.ts, and the content in the scene's `story_mode` block.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {ArrowRight,BookOpen,Check,CircleHelp,Coins,Flame,Hand,Minus,RotateCcw,Timer,Trophy,Volume2,VolumeX,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {GRACE_SECONDS,POUCH_MAX,POWER_UPS,ROUNDS,ROUND_NAMES,SECONDS,nextGoal,roundIntroLine,storyOpening,storyRivalMs,storyRivalOutcome,callQ,inferQ,lanternParagraph,lieOf,phaseSeconds,readQ,timeAnnouncement,type PowerUp,type RoundInput,type RoundKind,type RoundRecord,type RunState,type Scene,type TimeSetting} from "@/lib/story-mode";
import {LEVELS,levelFor} from "@/lib/fair-play";
import {contentNotes} from "@/lib/content-notes";
import {narrationFile} from "@/lib/narration";
import {ReadingPanel} from "./reading-panel";
import {displayLine,paragraphLabel} from "@/lib/clue-game";
import {ContentNote} from "./content-note";
import {AmbientPlayer,Portrait,useCharacterVoice,useSoundPref} from "./game-feel";
import {browserNarration,soundChannel} from "./sound-player";
import {playNarration} from "@/lib/narration";
import {focusScreenTop} from "./screen-focus";
import {getBrowserSupabase} from "@/lib/supabase-browser";
import {MAX_TRIES} from "@/lib/fair-play";
import {NotYet,PhrasePicker,PointsGoal,PointsMeter,ProveIt,useSpeedMeta} from "./fair-play-ui";
import {collectPieces,missionFor,pieceForLine} from "@/lib/missions";
import {MissionTracker} from "./missions";
import {FaceOff,RivalEmblem,playMode} from "./mode-screens";
import {newClueGame} from "@/lib/clue-game";

type PublicRun={id:string;topic:string;nickname:string;state:RunState;total:number;bestTotal:number;finished:boolean;timeSetting:TimeSetting;scope:"class"|"demo";goal:{max:number;level:string|null}};
type Board={kind:"individual"|"squad";top:{rank:number;name:string;score:number;me:boolean}[];me:{rank:number;score:number;movement:number}|null;players:number}|null;
type Pulse={key:string;label:string;pct:number;strongest:string}[];
type Reaction={line:string;trust:number}|null;
type Step={name:"phrase"|"prove"|"explain";choices:string[]|null;shown:string[]|null;phrase:[number,number]|null;note?:string|null};
type TryReply={run:PublicRun;notYet:{tryNo:number;hint:string;locked:string[]}|null;step:Step|null;reaction:Reaction};
type Resume={tryNo:number;locked:string[];line:string|null;shown:boolean;step:"phrase"|"prove"|"explain"|null;choices:string[]|null}|null;
type Result={record:RoundRecord;shown:string[]|null;reaction:Reaction;run:PublicRun;board:Board;pulse:Pulse;answered:number};
type Send=(input:RoundInput,elapsedMs:number,grace:boolean)=>Promise<TryReply|null>;
type Stage="loading"|"welcome"|"play"|"results"|"cleared"|"error";
type Overlay="tips"|"faceoff";
type Race={kind:RoundKind;start:number;rivalMs:number;youMs:number|null};

// Sound cues: short and quiet, only when Sound is on.
function cue(on:boolean,name:"tick"|"chime"|"streak"|"reveal"){if(!on)return;try{const a=new Audio(`/sounds/story/${name}.mp3`);a.volume=0.35;a.play().catch(()=>{})}catch{}}
const reducedMotion=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// startAt: open at a later round ("Catch the lie" on the home page); onJumped: called once the run has opened there.
// onUnavailable: Story Mode's tables aren't set up (or the server can't reach them), so the scene opens in the Case
// file view instead, with no error screen.
// onLeads: this scene has mission leads the student hasn't followed (offered on the cleared screen).
// Each round opens straight to its screen: a compact banner (the question, the next goal, small links for the Relaxed
// timer, scoring and power-ups) above the passage. The timer starts at the student's first tap. Over the round, on a
// first visit, come the three "How to play" tips (the header's "How to play" reopens them); with Rival, the face-off
// and its 3-2-1 then play by themselves and the computer rival races. Who wins the face-off never changes points.
// A visitor with a saved run gets "Welcome back" first (Keep playing or Start over), never straight into a try.
// clearedLabel: the cleared screen's button (the public demo closes scene 1 with its ending instead of the next scene).
export function StoryMode({world,scene,sceneIndex,passages,demo,setDemo,onCleared,onCaseFile,startAt,onJumped,onUnavailable,onLeads,clearedLabel}:{world:WorldPack;scene:Scene;sceneIndex:number;passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onCleared:()=>void;onCaseFile?:()=>void;startAt?:RoundKind;onJumped?:()=>void;onUnavailable:()=>void;onLeads?:()=>void;clearedLabel?:string}){
 const content=scene.story_mode!;
 const headers=useMemo(()=>({"Content-Type":"application/json",...(demo.classAuth?{"x-class-token":demo.classAuth.token}:{}),...(testSession()?{"x-textlab-test":"1"}:{})}),[demo.classAuth]);
 const [run,setRun]=useState<PublicRun|null>(null),[mode,setMode]=useState<"individual"|"squad"|"off">("individual");
 const [stage,setStage]=useState<Stage>("loading"),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [result,setResult]=useState<Result|null>(null),[relaxed,setRelaxed]=useState(false),[resume,setResume]=useState<Resume>(null);
 const [soundOn,toggleSound]=useSoundPref("effects",demo.preset);
 const [ambientOn]=useSoundPref("ambient",demo.preset);
 const lastRank=useRef<number|null>(null);
 const round=run?.state.round??0,kind:RoundKind|undefined=ROUNDS[round];
 // A new stage is a new screen: top of the page, focus on its heading.
 const screen=`${stage}:${round}`,shown=useRef("");
 useLayoutEffect(()=>{if(shown.current===screen)return;const first=!shown.current;shown.current=screen;if(!first||stage!=="loading")focusScreenTop()},[screen,stage]);
 const post=useCallback(async(path:string,body:Record<string,unknown>)=>{const r=await fetch(path,{method:"POST",headers,body:JSON.stringify({sandboxId:demo.id,...body})});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error??"Something went wrong. Try again."),{status:r.status});return j},[headers,demo.id]);
 // Read once per start, so clearing the jump afterwards doesn't start the run again.
 const jump=useRef(startAt);jump.current=startAt;
 const callbacks=useRef({onJumped,onUnavailable});callbacks.current={onJumped,onUnavailable};
 const rival=playMode(demo)==="rival";
 const [race,setRace]=useState<Race|null>(null),[raceWon,setRaceWon]=useState<"you"|"rival"|null>(null);
 // Mission pieces this round's proof just earned (the "+1 piece" moment on the results screen).
 const [pieceGain,setPieceGain]=useState<{count:number;title:string}|null>(null);
 // What plays over the round before the student starts: the tips (first visit), then the face-off (Rival).
 const [overlay,setOverlay]=useState<Overlay[]>([]);
 const plan=useRef({rival,seen:howToSeen(demo)});plan.current={rival,seen:howToSeen(demo)};
 const enterRound=useCallback((resumed:boolean)=>{setRaceWon(null);setRace(null);setPieceGain(null);setStage("play");
  setOverlay([...(plan.current.seen?[]:["tips" as const]),...(plan.current.rival&&!resumed?["faceoff" as const]:[])])},[]);
 const start=useCallback(async(restart=false)=>{
  setStage("loading");setError("");
  try{const j=await post("/api/story/run",{worldId:world.id,sceneId:scene.id,restart,...(demo.mission?{missionId:demo.mission}:{}),...(jump.current&&!restart?{startAt:jump.current}:{})});
   if(j.unavailable){callbacks.current.onUnavailable();return}
   if(jump.current)callbacks.current.onJumped?.();
   setRun(j.run);setMode(j.leaderboard);setResult(null);setResume(j.resume??null);
   const open=storyOpening(j.run,!!j.resume,welcomed.has(j.run.id),restart);
   if(open!=="welcome")welcomed.add(j.run.id);
   // A round already in progress (a reload) picks up at its try, after "Welcome back".
   if(open==="play")enterRound(!!j.resume);else setStage(open)}
  catch(e){const status=(e as {status?:number}).status;
   // No answer, or a server error: open the Case file view rather than an error screen. A 4xx says what to do.
   if(!status||status>=500){callbacks.current.onUnavailable();return}
   setError((e as Error).message);setStage("error")}
 },[post,world.id,scene.id,enterRound]);
 useEffect(()=>{start()},[start]);
 const setting:TimeSetting=run?(relaxed&&(run.timeSetting==="1"||run.timeSetting==="1.5")?"2":run.timeSetting):"1";
 const rivalName=world.computer_players?.rival.name??"Computer rival";
 // Closing the top overlay: the tips are marked seen; the face-off starts the rival's race.
 function closeOverlay(){
  const top=overlay[0];
  if(top==="tips"){setDemo(d=>({...d,howToSeen:true}));try{localStorage.setItem(HOW_TO_KEY,"1")}catch{}}
  if(top==="faceoff"&&kind)setRace({kind,start:Date.now(),rivalMs:storyRivalMs(scene.id,kind,setting),youMs:null});
  setOverlay(o=>o.slice(1));
  if(overlay.length===1)setTimeout(()=>document.getElementById("play-h")?.focus({preventScroll:true}),0);
 }
 const howToPlay=()=>setOverlay(o=>o[0]==="tips"?o:["tips",...o]);

 // One try. A scored round moves to the results; anything else (Not yet, the next step) goes back to the round.
 const send:Send=async(input,elapsedMs,grace)=>{
  if(!run)return null;
  setNotice("");
  // The face-off: the student's first lock-in time this round.
  setRace(r=>r&&r.youMs===null?{...r,youMs:elapsedMs}:r);
  const j=await post("/api/story/round",{runId:run.id,round:round+1,input,elapsedMs,grace,relaxed,previousRank:lastRank.current});
  setRun(j.run);
  if(!j.record)return j as TryReply;
  const r=j as Result;
  setResult(r);setResume(null);if(r.board?.me)lastRank.current=r.board.me.rank;
  setStage("results");
  if(race){const o=storyRivalOutcome(r.record,race.youMs??elapsedMs,race.rivalMs);setRaceWon(o);setRace(null);
   setDemo(d=>{const g=d.game??newClueGame();return {...d,game:o==="you"?{...g,rivalWins:g.rivalWins+1}:{...g,rivalLosses:g.rivalLosses+1}}})}
  cue(soundOn,r.record.valid?"chime":"reveal");
  if(r.record.valid&&r.record.streak>=2)setTimeout(()=>cue(soundOn,"streak"),500);
  setTimeout(()=>cue(soundOn,"reveal"),reducedMotion()?0:900);
  // Saved with progress: the run's score, goal, pouch and trust; a caught lie also counts for the scene's lie clue.
  const lie=lieOf(scene,r.run.state.picks);
  // Mission pieces: the round's proof lines (shown ones marked shown).
  const shownLines=r.shown??[];
  {const m=missionFor(world,demo.mission);const gained=m?new Set([...r.record.proof,...shownLines].map(l=>pieceForLine(m,l)).filter(p=>p&&!demo.missionPieces?.[p.id]).map(p=>p!.id)):new Set<string>();setPieceGain(m&&gained.size?{count:gained.size,title:m.title}:null)}
  setDemo(d=>{const m=missionFor(world,d.mission);const a=collectPieces(m,d.missionPieces,r.record.proof.filter(l=>!shownLines.includes(l)),{via:`story:${r.record.kind}`});const b=collectPieces(m,a??d.missionPieces,shownLines,{shown:true,via:`story:${r.record.kind}`});return a||b?{...d,missionPieces:b??a!}:d});
  setDemo(d=>({...d,story:{...(d.story??{}),[scene.id]:{runId:r.run.id,total:r.run.total,bestStreak:r.run.state.bestStreak,trust:r.run.state.trust,pouch:r.run.state.pouch,cleared:r.run.finished,max:r.run.goal.max,level:(r.run.goal.level as "opened"|"built"|"cracked"|null)}},
   ...(input.kind==="lie"&&r.record.valid&&scene.lie&&lie.clue_id===scene.lie.clue_id?{lies:{...(d.lies??{}),[scene.id]:{clue_id:scene.lie.clue_id,caught:true,misses:r.record.tries,caught_at:new Date().toISOString()}},...(input.explanation?.trim()?{artifactAnswers:{...d.artifactAnswers,[scene.lie.clue_id]:{notice:r.record.proof[0]??input.line,interpret:input.explanation.trim(),craft:"contradicts",technique:"",revisions:d.artifactAnswers[scene.lie.clue_id]?.revisions??[]}}}:{})}:{})}));
  return null;
 };
 async function buy(p:PowerUp){if(!run)return;setNotice("");try{const j=await post("/api/story/buy",{runId:run.id,powerUp:p});setRun(j.run);if(p==="second-look")replayLast()}catch(e){setNotice((e as Error).message)}}
 // Second look: replays the last part of the reading.
 const replayLast=useCallback(()=>{const pid=content.read.chunks[content.read.chunks.length-1];if(!soundOn)return;playNarration(soundChannel,`${scene.id}:story`,[{id:pid,text:passages.find(p=>p.id===pid)?.text??"",src:narrationFile(world.id,scene.id,pid)}],browserNarration)},[content.read.chunks,soundOn,scene.id,passages,world.id]);

 // One short row, so the passage keeps the room on a phone.
 const header=<div className="flex items-center justify-between gap-2">
  <button type="button" onClick={howToPlay} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-panel px-3 text-[14px] font-bold text-highlight"><CircleHelp size={17} aria-hidden/>How to play</button>
  <div className="flex shrink-0 items-center gap-1.5">
   {run&&<span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[14px] font-bold tabular-nums text-highlight" title="Lantern coins"><Coins size={14}/>{run.state.coins}<span className="sr-only"> Lantern coins</span></span>}
   <button type="button" onClick={toggleSound} aria-pressed={soundOn} aria-label="Sound" className="grid h-10 w-10 place-items-center rounded-full bg-panel-2">{soundOn?<Volume2 size={18}/>:<VolumeX size={18}/>}</button>
  </div>
 </div>;
 const bar:Bar|null=run&&kind?{world,scene,kind,run,relaxed,setRelaxed,canRelax:run.timeSetting==="1"||run.timeSetting==="1.5",onBuy:buy}:null;
 return <div className={`case-ui mx-auto max-w-3xl px-4 pt-3 md:px-8 ${stage==="play"?"pb-3":"pb-24"}`}>
  {overlay[0]==="tips"&&<Over label="How to play"><HowToPlay rival={rival?rivalName:null} onDone={closeOverlay}/></Over>}
  {overlay[0]==="faceoff"&&kind&&<Over label="Face-off" full><FaceOff world={world} demo={demo} clueName={`Round ${round+1} · ${ROUND_NAMES[kind]}`} auto onGo={closeOverlay} rules={`Same question, same passage. Lock in the right line on your first try before ${rivalName} does to win the round. Points come only from the proof.`}/></Over>}
  <AmbientPlayer src={scene.ambient_audio} on={ambientOn&&soundOn} showing={stage==="play"}/>
  {header}
  {run&&stage!=="loading"&&stage!=="cleared"&&stage!=="play"&&<PointsMeter total={run.total} max={run.goal.max} compact/>}
  {notice&&<p role="alert" className="mt-3 rounded-2xl bg-primary-soft px-4 py-3 text-[16px]">{notice}</p>}
  {stage==="loading"&&<p className="mt-10 text-center text-[17px] text-muted">Opening the scene…</p>}
  {stage==="error"&&<div className="mt-8 rounded-3xl bg-panel p-6"><h1 className="text-[24px] font-bold">Story Mode can't open right now</h1><p className="mt-2 text-[16px]">{error}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>start()} className="case-primary">Try again</button>{onCaseFile&&<button type="button" onClick={onCaseFile} className="case-secondary">Open the Case file</button>}</div></div>}
  {stage==="welcome"&&run&&kind&&<WelcomeBack world={world} round={round} kind={kind} run={run} midTry={!!resume} onKeep={()=>{welcomed.add(run.id);enterRound(!!resume)}} onStartOver={()=>{welcomed.add(run.id);start(true)}}/>}
  {stage==="play"&&run&&kind&&<><RoundTracker round={round} skipped={run.state.skipped??0} compact/><MissionTracker world={world} demo={demo} compact/></>}
  {stage==="play"&&run&&kind&&race&&<RaceStrip race={race} name={rivalName} emblem={world.computer_players?.rival.emblem??"lantern"} wins={demo.game?.rivalWins??0} losses={demo.game?.rivalLosses??0}/>}
  {stage==="results"&&pieceGain&&<p role="status" className="piece-pop mt-4 flex items-center gap-3 rounded-2xl bg-deep px-4 py-3 text-[17px] font-bold text-ink"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-[20px]">+{pieceGain.count}</span>{pieceGain.count===1?"+1 piece":`+${pieceGain.count} pieces`} for {pieceGain.title}</p>}
  {stage==="results"&&raceWon&&<p role="status" className={`mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-[16px] font-semibold ${raceWon==="you"?"bg-success-soft text-success":"bg-violet-soft text-ink"}`}><span className="h-10 w-10 shrink-0 overflow-hidden rounded-full"><RivalEmblem kind={world.computer_players?.rival.emblem??"lantern"} size={40}/></span>{raceWon==="you"?`You beat ${rivalName} to the line.`:`${rivalName} won this face-off. Your points still come from your proof.`}</p>}
  {stage==="play"&&run&&kind&&bar&&<RoundPlay key={round} world={world} scene={scene} passages={passages} kind={kind} run={run} setting={setting} sound={soundOn} sandboxId={demo.id} resume={resume} send={send} onError={m=>setNotice(m)} bar={bar} hold={overlay.length>0}/>}
  {stage==="results"&&result&&run&&<Results world={world} scene={scene} result={result} mode={mode} run={run} headers={headers} sandboxId={demo.id} onNext={()=>{setResult(null);if(run.finished)setStage("cleared");else enterRound(false)}}/>}
  {stage==="cleared"&&run&&<Cleared run={run} mode={mode} headers={headers} sandboxId={demo.id} onNext={onCleared} onAgain={()=>start(true)} onLeads={onLeads} nextLabel={clearedLabel}/>}
 </div>;
}
// An overlay over the round, on the page body (so no animated parent moves it), with focus on its heading.
// full: it covers the round (the face-off); otherwise the round shows dimmed behind it (the tips).
function Over({label,full=false,children}:{label:string;full?:boolean;children:React.ReactNode}){
 const ref=useRef<HTMLDivElement>(null),[host,setHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{setHost(document.body)},[]);
 // After the content's own effects (the face-off focuses the page's heading on mount), so the overlay's heading wins.
 useEffect(()=>{if(!host)return;const t=setTimeout(()=>{const h=ref.current?.querySelector<HTMLElement>("h1,h2");if(h){if(!h.hasAttribute("tabindex"))h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}},0);return()=>clearTimeout(t)},[host]);
 if(!host)return null;
 return createPortal(<div ref={ref} role="dialog" aria-modal="true" aria-label={label} className={`case-ui fixed inset-0 z-50 overflow-y-auto overscroll-contain ${full?"bg-panel-2":""}`}>{children}</div>,host);
}
// A test session (opened with ?test=1, kept for the tab): its runs are tagged and stay off real leaderboards.
function testSession(){try{if(new URLSearchParams(location.search).get("test")==="1")sessionStorage.setItem("textlab-test","1");return sessionStorage.getItem("textlab-test")==="1"}catch{return false}}
// Runs already opened this page load: a run with progress opens on "Welcome back" until the student picks Keep playing
// or Start over (React may start the run twice; both must land on the card).
const welcomed=new Set<string>();
const HOW_TO_KEY="textlab-how-to-seen";
const howToSeen=(demo:Demo)=>{if(demo.howToSeen)return true;try{return localStorage.getItem(HOW_TO_KEY)==="1"}catch{return false}};

// ---------- Welcome back: a saved run never drops the student straight into a try ----------
function WelcomeBack({world,round,kind,run,midTry,onKeep,onStartOver}:{world:WorldPack;round:number;kind:RoundKind;run:PublicRun;midTry:boolean;onKeep:()=>void;onStartOver:()=>void}){
 return <section className="mt-4 rounded-3xl bg-panel p-6" aria-labelledby="welcome-h">
  <p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">{world.title}</p>
  <h1 id="welcome-h" className="mt-1 text-[30px] font-bold leading-tight">Welcome back</h1>
  <p className="mt-2 text-[17px] leading-7 text-muted">You're on round {round+1} of {ROUNDS.length}: {ROUND_NAMES[kind]}{midTry?", in the middle of a try":""}. You have {run.total.toLocaleString()} point{run.total===1?"":"s"} so far.</p>
  <p className="mt-1 text-[16px] font-semibold tabular-nums">{nextGoal(run.total,run.goal.max)}</p>
  <div className="mt-5 grid gap-2">
   <button type="button" onClick={onKeep} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Keep playing <ArrowRight size={20}/></button>
   <button type="button" onClick={onStartOver} className="case-secondary min-h-[52px] w-full justify-center"><RotateCcw size={17}/>Start over</button>
  </div>
 </section>;
}

// ---------- How to play: one short card over the round; the rest are inline tips at the moment they matter ----------
const TIPS=[
 {title:"Read, then tap the proof",body:"Read the passage, then tap the lines that answer the question at the top. The timer starts at your first tap."},
];
// Inline tips on the first round: when the first line goes in the pouch, and when the pouch is full.
export const INLINE_TIPS={pouch:"Tip: tap the × on a chip to take a line out.",lock:"Tip: lock in when you're ready. A wrong line means Not yet: look again. Points come from proof, never speed."};
function HowToPlay({rival,onDone}:{rival:string|null;onDone:()=>void}){
 const [i,setI]=useState(0),h=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{h.current?.focus({preventScroll:true})},[i]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onDone()};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[onDone]);
 const tip=TIPS[i],last=i===TIPS.length-1;
 return <div className="flex min-h-full items-end justify-center">
  <div aria-hidden className="fixed inset-0 bg-deep/40"/>
  <div className="relative m-3 w-full max-w-md rounded-3xl bg-panel p-5">
   <p className="text-[13px] font-bold uppercase tracking-wide text-highlight">How to play</p>
   <h2 id="howto-h" ref={h} tabIndex={-1} className="mt-1 text-[24px] font-bold leading-tight outline-none">{tip.title}</h2>
   <p className="mt-2 text-[17px] leading-7 text-muted">{tip.body}{last&&rival?` Then the face-off with ${rival} starts.`:""}</p>
   <button type="button" onClick={()=>last?onDone():setI(i+1)} className="case-primary mt-4 min-h-[52px] w-full justify-center text-[17px]">{last?"Start reading":"Next"} <ArrowRight size={18}/></button>
  </div>
 </div>;
}

// ---------- The round banner: the question and the next goal, with small links ----------
const ROUND_HELP:Record<RoundKind,string>={read:"Listen to the story and tap the lines that answer the question. Your Evidence pouch holds 3, so choose carefully.",confront:"Someone asks you a question. Find the one line that answers it, mark the words that prove it, then say what it shows.",lie:"A witness gives testimony. One thing is false. Tap the line that proves it, then say why in one sentence.",call:"Answer the case question. Pick a theory and pin 2 lines that support it."};
type Bar={world:WorldPack;scene:Scene;kind:RoundKind;run:PublicRun;relaxed:boolean;setRelaxed:(v:boolean)=>void;canRelax:boolean;onBuy:(p:PowerUp)=>void};
// question: shown in the dark banner with the round's heading (round 1); without it, only the goal row (the other rounds
// show their own question). Relaxed timer and power-ups can change only before the first tap.
type Clock={text:string;share:number;grace:boolean;announce:string};
function RoundBanner({bar,started,label,question,clock}:{bar:Bar;started:boolean;label?:string;question?:string;clock?:Clock}){
 const {run,kind,scene}=bar,s=run.state;
 const [open,setOpen]=useState<"scoring"|"power"|null>(null);
 const coach=s.rounds.length?roundIntroLine(s.rounds.at(-1),run.state.round+(s.restarts??0)):"";
 const link=`min-h-6 underline underline-offset-2 ${question?"text-muted":"text-highlight"}`;
 const relax=bar.canRelax&&!started?<button type="button" aria-pressed={bar.relaxed} onClick={()=>bar.setRelaxed(!bar.relaxed)} className={`${link} text-[12.5px] font-semibold`}>Relaxed timer: {bar.relaxed?"on":"off"}</button>:null;
 const row=<div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 text-[13px] font-semibold">
  <span className={`tabular-nums ${question?"text-ink":"text-ink"}`}>{nextGoal(run.total,run.goal.max)}<span className="sr-only">. {run.total} of {run.goal.max} points so far.</span></span>
  <button type="button" aria-expanded={open==="scoring"} onClick={()=>setOpen(o=>o==="scoring"?null:"scoring")} className={link}>How scoring works</button>
  {s.round>0&&!started&&<button type="button" aria-expanded={open==="power"} onClick={()=>setOpen(o=>o==="power"?null:"power")} className={link}>Power-ups · {s.coins} coin{s.coins===1?"":"s"}</button>}
 </div>;
 return <>
  {question!==undefined?<div className="case-art overflow-hidden rounded-2xl" style={{backgroundImage:`url('${scene.background_image}')`}}><div className="bg-deep/90 px-3 pb-1.5 pt-2 text-ink">
   <div className="flex items-center gap-3"><h1 id="play-h" tabIndex={-1} className="text-[12px] font-bold uppercase tracking-wide text-muted outline-none">{label}</h1>{relax}<span className="flex-1"/>{clock&&<span className={`shrink-0 text-[12.5px] font-bold tabular-nums ${clock.grace?"text-highlight":"text-ink"}`} aria-hidden>{clock.text}</span>}</div>
   <p className="text-[16px] font-semibold leading-[1.35]">{question}</p>{row}</div>
   {clock&&<><div aria-hidden className="h-1 bg-deep/70"><div className={`h-full ${clock.grace?"bg-primary":"bg-primary-soft"}`} style={{width:`${Math.max(0,Math.min(1,clock.share))*100}%`}}/></div><p className="sr-only" aria-live="polite">{clock.announce}</p></>}</div>
   :<>{coach&&<p className="mt-1 text-[14px] leading-5 text-muted">{coach}</p>}{row}{relax}</>}
  {open==="scoring"&&<div className="mt-2 rounded-2xl bg-panel p-3 text-[14px] leading-5"><p>{ROUND_HELP[kind]}</p><PointsGoal max={run.goal.max}/></div>}
  {open==="power"&&!started&&<PowerUps kind={kind} run={run} onBuy={bar.onBuy}/>}
 </>;
}
function PowerUps({kind,run,onBuy}:{kind:RoundKind;run:PublicRun;onBuy:(p:PowerUp)=>void}){
 const s=run.state,usable=(p:PowerUp)=>p==="second-look"?kind!=="read":true;
 return <ul className="mt-2 grid gap-2 sm:grid-cols-3">{(Object.keys(POWER_UPS) as PowerUp[]).map(p=>{const on=(p==="lantern"&&s.lantern)||(p==="double-down"&&s.doubleDown);const short=s.coins<POWER_UPS[p].cost;const can=!on&&!short&&usable(p);
  // Can't afford it yet: a plain card that says what it takes, so it never looks used or done.
  return <li key={p}><button type="button" aria-disabled={!can} onClick={()=>can&&onBuy(p)} aria-pressed={on} className={`flex h-full w-full flex-col rounded-2xl p-3 text-left ${on?"bg-primary text-on-primary":can?"bg-primary-soft hover:bg-primary-soft":short&&usable(p)?"border-2 border-dashed border-edge bg-panel text-ink":"bg-panel-2 text-muted"}`}><span className="text-[16px] font-bold">{POWER_UPS[p].name} · {POWER_UPS[p].cost}</span><span className="mt-1 text-[13px] leading-5">{on?"Ready for this round.":!usable(p)?"Not used in this round.":short?<><b className="block text-highlight">Need {POWER_UPS[p].cost} coin{POWER_UPS[p].cost===1?"":"s"}</b>{POWER_UPS[p].what}</>:POWER_UPS[p].what}</span></button></li>})}</ul>;
}

function RoundHeading({round,kind,tryNo}:{round:number;kind:RoundKind;tryNo:number}){
 return <div className="flex items-baseline justify-between gap-2"><h1 id="play-h" tabIndex={-1} className="text-[20px] font-bold leading-tight outline-none">Round {round} · {ROUND_NAMES[kind]}</h1>{tryNo>1&&<span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-0.5 text-[13px] font-bold text-gold">Try {tryNo} of {MAX_TRIES}</span>}</div>;
}
// The four rounds in a row: played rounds gray with a check (skipped ones gray with a dash), the current one highlighted.
// compact: one short row on round screens.
function RoundTracker({round,skipped,compact=false}:{round:number;skipped:number;compact?:boolean}){
 return <ol className={`grid grid-cols-4 gap-1 ${compact?"mt-2":"mt-4"}`} aria-label={`Round ${round+1} of ${ROUNDS.length}`}>{ROUNDS.map((k,i)=>{const done=i<round,now=i===round,skip=done&&i<skipped;
  return <li key={k} aria-current={now?"step":undefined} className={`flex flex-col justify-center rounded-xl px-1 text-center font-semibold leading-tight ${compact?"min-h-[28px] whitespace-nowrap py-1 text-[11px]":"min-h-[48px] py-1.5 text-[13px]"} ${now?"bg-primary text-on-primary shadow-[0_0_0_3px_rgba(160,71,44,.25)]":done?"bg-panel-2 text-muted":"bg-panel text-ink ring-1 ring-edge"}`}>
   {compact?<span className="flex items-center justify-center gap-1">{done&&(skip?<Minus size={12} aria-hidden/>:<Check size={12} aria-hidden/>)}<span className="sr-only">{now?"Now: ":skip?"Skipped: ":done?"Done: ":"Later: "}</span>{ROUND_NAMES[k]}</span>
    :<><span className="flex items-center justify-center gap-1">{done&&(skip?<Minus size={14} aria-hidden/>:<Check size={14} aria-hidden/>)}<span className="sr-only">{now?"Now: ":skip?"Skipped: ":done?"Done: ":"Later: "}</span>{i+1}</span><span>{ROUND_NAMES[k]}</span></>}</li>})}</ol>;
}

// Rival: the computer rival racing during the round (its own clock from the round's start). Clearly labeled.
function RaceStrip({race,name,emblem,wins,losses}:{race:Race;name:string;emblem:"lantern"|"rider";wins:number;losses:number}){
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(t)},[]);
 const done=now-race.start>=race.rivalMs,short=name.replace(/^The /,"");
 // The score is face-off wins this story, in plain words: "You 1 · Lantern Ghost 1".
 return <div className="mt-1.5 rounded-xl bg-panel px-3 py-1">
  <div className="flex items-center gap-2 text-[12.5px] font-bold"><span className="h-5 w-5 shrink-0 overflow-hidden rounded-full"><RivalEmblem kind={emblem} size={20}/></span><p className="shrink-0 font-semibold text-ink" aria-live="polite">{done?`${short} locked in a line.`:`${short} is reading...`}<span className="sr-only"> (computer rival)</span></p><span className="ml-auto whitespace-nowrap text-ink">You {wins} · {short} {losses}</span>
</div>
 </div>;
}

// The passage panel fills the rest of the phone screen (it scrolls inside), above the round's dock.
function useFitHeight(){
 const ref=useRef<HTMLDivElement>(null),dock=useRef<HTMLDivElement>(null);const [h,setH]=useState<number|null>(null);
 useLayoutEffect(()=>{const f=()=>{const el=ref.current;if(!el)return;const top=el.getBoundingClientRect().top+window.scrollY;const d=dock.current?.offsetHeight??0;setH(Math.max(240,Math.floor(window.innerHeight-top-d-22)))};f();window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f)});
 return {ref,dock,style:h?{height:h}:undefined};
}

// ---------- The try timer: counts down, pauses when the page is hidden (or a content note is open). The first try has
// a 20-second grace period for half points; a retry is a fresh 30 seconds with none. Announced to screen readers at
// 30, 10 and 5 seconds left only. ----------
function useRoundTimer(seconds:number|null,pausedByNote:boolean,onOver:()=>void,grace=GRACE_SECONDS){
 const [elapsed,setElapsed]=useState(0),[hidden,setHidden]=useState(false),[announce,setAnnounce]=useState("");
 const over=useRef(onOver);over.current=onOver;
 const startRef=useRef(0),acc=useRef(0),fired=useRef(false),prevLeft=useRef<number>(Infinity);
 useEffect(()=>{const v=()=>setHidden(document.visibilityState==="hidden");v();document.addEventListener("visibilitychange",v);return()=>document.removeEventListener("visibilitychange",v)},[]);
 const paused=hidden||pausedByNote;
 useEffect(()=>{
  if(paused)return;
  startRef.current=performance.now();
  const t=setInterval(()=>{const e=acc.current+performance.now()-startRef.current;setElapsed(e);
   if(seconds!==null){const left=Math.ceil(seconds-e/1000);const msg=timeAnnouncement(prevLeft.current,left);prevLeft.current=left;if(msg)setAnnounce(msg);
    if(e>=(seconds+grace)*1000&&!fired.current){fired.current=true;over.current()}}},250);
  return()=>{clearInterval(t);acc.current+=performance.now()-startRef.current};
 },[paused,seconds,grace]);
 const left=seconds===null?null:Math.max(0,seconds-elapsed/1000);
 const inGrace=grace>0&&seconds!==null&&elapsed>=seconds*1000;
 const graceLeft=inGrace&&seconds!==null?Math.max(0,seconds+grace-elapsed/1000):0;
 return {elapsed,left,grace:inGrace,graceLeft,graceSeconds:grace,paused,announce};
}
function TimerBar({t,seconds,compact=false,waiting=false}:{t:ReturnType<typeof useRoundTimer>;seconds:number|null;compact?:boolean;waiting?:boolean}){
 if(waiting&&seconds!==null)return <p className={`${compact?"mt-1.5":"mt-3"} flex items-center gap-2 text-[13px] font-semibold text-muted`}><Timer size={15} aria-hidden/>{Math.round(seconds)} seconds. The timer starts when you tap a line.</p>;
 if(seconds===null)return <p className={`${compact?"mt-1.5":"mt-3"} flex items-center gap-2 text-[15px] text-muted`}><Timer size={16}/>No timer. Take the time you need.</p>;
 const share=t.grace?t.graceLeft/t.graceSeconds:(t.left??0)/seconds;
 const label=t.grace?`${Math.ceil(t.graceLeft)}s for half points`:`${Math.ceil(t.left??0)}s left`;
 if(compact&&!t.grace)return <div className="mt-1.5 flex items-center gap-2 text-[13px] font-semibold"><span className="text-muted">{t.paused?"Paused":"Time"}</span><div aria-hidden className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2"><div className="h-full rounded-full bg-primary" style={{width:`${Math.max(0,Math.min(1,share))*100}%`}}/></div><span className="tabular-nums" aria-hidden>{label}</span><p className="sr-only" aria-live="polite">{t.announce}</p></div>;
 return <div className={compact?"mt-1.5":"mt-3"}>
  <div className="flex items-center justify-between text-[14px] font-semibold"><span className={t.grace?"text-notyet":"text-muted"}>{t.grace?"Time! You can still add proof for half points":t.paused?"Paused":"Time"}</span><span className="tabular-nums" aria-hidden>{label}</span></div>
  <div aria-hidden className="mt-1 h-3 overflow-hidden rounded-full bg-panel-2"><div className={`h-full rounded-full ${t.grace?"bg-notyet":"bg-primary"}`} style={{width:`${Math.max(0,Math.min(1,share))*100}%`}}/></div>
  <p className="sr-only" aria-live="polite">{t.announce}{t.grace?" Time! You can still add proof for half points.":""}</p>
 </div>;
}
// The banner's clock: the time left (or how long the round is, until the first tap).
function clockOf(t:ReturnType<typeof useRoundTimer>,seconds:number|null,waiting:boolean):Clock{
 if(seconds===null)return {text:"No timer",share:1,grace:false,announce:""};
 if(waiting)return {text:`${Math.round(seconds)}s`,share:1,grace:false,announce:""};
 return t.grace?{text:`${Math.ceil(t.graceLeft)}s for half points`,share:t.graceLeft/t.graceSeconds,grace:true,announce:`${t.announce} Time! You can still add proof for half points.`}:{text:t.paused?"Paused":`${Math.ceil(t.left??0)}s left`,share:(t.left??0)/seconds,grace:false,announce:t.announce};
}
// The seconds and grace for a try: the round's time on the first try, a fresh 30 (scaled) on each retry.
const trySeconds=(kind:RoundKind,tryNo:number,setting:TimeSetting)=>tryNo<=1?{seconds:phaseSeconds(SECONDS[kind],setting),grace:GRACE_SECONDS}:{seconds:phaseSeconds(SECONDS.retry,setting),grace:0};

// ---------- The four rounds ----------
// bar: the round banner's goal and links; hold: an overlay (tips, face-off) is open, so the timer and narration wait.
type RoundProps={world:WorldPack;scene:Scene;passages:SourcePassage[];run:PublicRun;setting:TimeSetting;sound:boolean;sandboxId:string;resume:Resume;send:Send;onError:(m:string)=>void;bar:Bar;hold:boolean};
function RoundPlay(p:RoundProps&{kind:RoundKind}){
 if(p.kind==="read")return <ReadRound {...p}/>;
 if(p.kind==="confront")return <InferRound {...p}/>;
 if(p.kind==="lie")return <LieRound {...p}/>;
 return <CallRound {...p}/>;
}
const lineKey=(t:string)=>t.replace(/\s+/g," ").trim();
// Sends a try and reports a refused one ("Tap a line in the story") without leaving the round.
async function trySend(send:Send,onError:(m:string)=>void,input:RoundInput,elapsed:number,grace:boolean){try{return {reply:await send(input,elapsed,grace)}}catch(e){onError((e as Error).message);return {error:true}}}
function LanternNote({world,passages,scene,kind,run,locked}:{world:WorldPack;passages:SourcePassage[];scene:Scene;kind:RoundKind;run:PublicRun;locked?:string[]}){
 if(!run.state.lantern)return null;
 const pid=lanternParagraph(world,passages,scene,kind,run.state.picks,locked);
 return pid?<p className="mt-2 rounded-2xl bg-gold-soft px-4 py-3 text-[16px]">Your Lantern names {paragraphLabel(pid)}: a correct line is there.</p>:null;
}

function ReadRound({world,scene,passages,run,setting,sound,resume,send,onError,bar,hold}:RoundProps){
 const c=scene.story_mode!,q=readQ(scene,run.state.picks),notes=useMemo(()=>contentNotes(world),[world]);
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [shown,setShown]=useState(resume?chunks.length:1),[locked,setLocked]=useState<string[]>(resume?.locked??[]),[pouch,setPouch]=useState<string[]>(resume?.locked??[]),[full,setFull]=useState(false);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<{hint:string}|null>(null),[busy,setBusy]=useState(false);
 const [started,setStarted]=useState(!!resume);
 const speed=useSpeedMeta();
 // A paragraph with a content note shows the note first, with the timer paused until the student continues.
 const [noteSeen,setNoteSeen]=useState<Record<string,boolean>>({});
 const current=chunks[shown-1],noteOpen=!!current&&notes.has(current.id)&&!noteSeen[current.id];
 const fit=useFitHeight();
 // A new part scrolls into view inside the panel.
 useEffect(()=>{if(shown<2)return;const sc=fit.ref.current?.querySelector<HTMLElement>(".overflow-y-auto"),ols=sc?.querySelectorAll("ol"),last=ols?.[ols.length-1]?.parentElement;if(sc&&last)sc.scrollTo({top:last.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-4,behavior:reducedMotion()?"auto":"smooth"})},[shown]);// eslint-disable-line react-hooks/exhaustive-deps
 // Each part is narrated when it appears (ambient dips while it plays).
 useEffect(()=>{if(!current||noteOpen||!sound||tryNo>1||hold)return;playNarration(soundChannel,`${scene.id}:story`,[{id:current.id,text:current.text,src:narrationFile(world.id,scene.id,current.id)}],browserNarration);return()=>soundChannel.stop()},[current,noteOpen,sound,scene.id,world.id,tryNo,hold]);
 const isLocked=(t:string)=>locked.some(x=>lineKey(x)===lineKey(t));
 function tap(line:{text:string}){if(isLocked(line.text))return;setStarted(true);speed.tap();const k=lineKey(line.text);setFull(false);setPouch(p=>{if(p.some(x=>lineKey(x)===k)){speed.swap();return p.filter(x=>lineKey(x)!==k)}if(p.length>=POUCH_MAX){setFull(true);return p}return [...p,line.text]})}
 async function lockIn(elapsed:number,grace:boolean,timeout=false){
  if(busy)return;setBusy(true);soundChannel.stop();
  const r=await trySend(send,onError,{kind:"read",pouch,...speed.meta(),...(timeout?{timeout:true}:{})},elapsed,grace);
  setBusy(false);
  if(r.reply?.notYet){setLocked(r.reply.notYet.locked);setPouch(r.reply.notYet.locked);setTryNo(r.reply.notYet.tryNo);setNotYet({hint:r.reply.notYet.hint})}
 }
 if(notYet)return <NotYet tryNo={tryNo} hint={notYet.hint} onTryAgain={()=>{setNotYet(null);setStarted(false)}} extra={locked.length?<FoundSoFar lines={locked}/>:null}/>;
 const firstEver=tryNo===1&&run.state.round===(run.state.skipped??0);
 const need=Math.max(1,POUCH_MAX-locked.length);
 return <TimedTry key={tryNo} kind="read" tryNo={tryNo} setting={setting} paused={noteOpen||hold} waiting={!started} onOver={(e,g)=>lockIn(e,g,true)}>{t=><section className="mt-2" aria-labelledby="play-h">
  {/* The question and goal as a short banner; the passage is the main panel. */}
  <RoundBanner bar={bar} started={started} label={`Round 1 · ${ROUND_NAMES.read}${tryNo>1?` · Try ${tryNo} of ${MAX_TRIES}`:""}`} question={q.focus} clock={clockOf(t,trySeconds("read",tryNo,setting).seconds,!started)}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="read" run={run} locked={locked}/>
  <div ref={fit.ref} style={fit.style} className="relative mt-2 flex min-h-0 flex-col">
   {firstEver&&!pouch.length&&!noteOpen&&<span aria-hidden className="pointer-events-none absolute right-3 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[12.5px] font-bold text-on-primary shadow"><Hand size={14}/>Tap a line to start</span>}
   {noteOpen&&current?<div className="overflow-y-auto"><ContentNote text={notes.get(current.id)!}/><button type="button" onClick={()=>setNoteSeen(s=>({...s,[current.id]:true}))} className="case-secondary mt-3">Continue reading</button></div>
    :<ReadingPanel glossary={world.glossary} passages={chunks.slice(0,shown)} kept={pouch} onTap={tap} className="h-full"/>}
  </div>
  <div ref={fit.dock} className="pt-2">
   <PouchChips pouch={pouch} locked={locked} full={full} onRemove={x=>tap({text:x})}/>
   {firstEver&&pouch.length>locked.length&&<p role="status" className="mt-1 text-[12.5px] font-semibold text-highlight">{pouch.length>=POUCH_MAX?INLINE_TIPS.lock:INLINE_TIPS.pouch}</p>}
   <div className="mt-2 flex gap-2">
    {shown<chunks.length&&<button type="button" onClick={()=>setShown(n=>n+1)} disabled={noteOpen} className="case-secondary min-h-[48px] min-w-0 flex-1 justify-center whitespace-nowrap px-3 text-[14px]">Next part <span className="text-[13px] font-semibold opacity-75">{shown+1}/{chunks.length}</span><ArrowRight size={18}/></button>}
    <button type="button" disabled={busy||pouch.length===locked.length} onClick={()=>lockIn(t.elapsed,t.grace)} className="case-primary min-h-[48px] min-w-0 flex-[1.3] justify-center whitespace-nowrap px-3 text-[14px] disabled:opacity-50">{pouch.length===locked.length?`Tap ${need} line${need===1?"":"s"} to lock in`:`Lock in ${pouch.length} line${pouch.length===1?"":"s"}`}</button>
   </div>
  </div>
 </section>}</TimedTry>;
}
function FoundSoFar({lines}:{lines:string[]}){
 return <div className="mt-3"><p className="text-[15px] font-bold">Found so far</p>{lines.map(l=><blockquote key={l} className="mt-1 flex gap-2 border-l-4 border-success pl-3 font-serif text-[15px] leading-6"><Check size={16} className="mt-1 shrink-0 text-success" aria-label="found"/>{displayLine(l)}</blockquote>)}</div>;
}
// One timed try: a fresh timer each try (its key), handed to the round's view.
// waiting: the timer hasn't started (it starts at the student's first tap); paused: a content note or an overlay is open.
function TimedTry({kind,tryNo,setting,paused=false,waiting=false,onOver,children}:{kind:RoundKind;tryNo:number;setting:TimeSetting;paused?:boolean;waiting?:boolean;onOver:(elapsed:number,grace:boolean)=>void;children:(t:ReturnType<typeof useRoundTimer>)=>React.ReactNode}){
 const {seconds,grace}=trySeconds(kind,tryNo,setting);
 const t=useRoundTimer(seconds,paused||waiting,()=>onOver(((seconds??0)+grace)*1000,grace>0),grace);
 return <>{children(t)}</>;
}

// The pouch on the read round's dock: the count (it bumps when a line goes in) and a chip per chosen line (its first
// words and ×), so picks from earlier parts stay in view and can be taken out. Lines found on an earlier try are green.
function PouchChips({pouch,locked,full,onRemove}:{pouch:string[];locked:string[];full:boolean;onRemove:(t:string)=>void}){
 const found=(t:string)=>locked.some(x=>lineKey(x)===lineKey(t));
 const words=(t:string)=>displayLine(t).split(/\s+/).slice(0,2).join(" ");
 return <div className="rounded-2xl border-2 border-dashed border-edge bg-panel-2 px-2 py-1">
  <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
   <span className="inline-flex min-h-8 shrink-0 items-center gap-1 px-0.5 text-[13px] font-bold" aria-live="polite"><BookOpen size={15} className="text-highlight" aria-hidden/><span className="sr-only">Evidence pouch:</span><span key={pouch.length} className="count-bump tabular-nums">{pouch.length}</span><span aria-hidden>/</span><span className="sr-only"> of </span>{POUCH_MAX}</span>
   {!pouch.length&&<span className="text-[13px] text-muted">Your pouch is empty</span>}
   {pouch.map(t=>found(t)?<span key={t} className="inline-flex min-h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-success-soft px-2 text-[12px] font-semibold text-success"><Check size={13} aria-label="found"/>{words(t)}…</span>
    :<button key={t} type="button" onClick={()=>onRemove(t)} aria-label={`Take out of your pouch: ${words(t)}…`} className="inline-flex min-h-8 shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-primary pl-2 pr-1 text-[12px] font-semibold text-on-primary">{words(t)}…<X size={13} aria-hidden/></button>)}
  </div>
  {full&&<p className="mt-1 text-[12.5px] font-semibold text-notyet">Your pouch is full. Take a line out to swap it.</p>}
 </div>;
}
function Pouch({pouch,onRemove,full,picked,onPick,max,locked=[]}:{pouch:string[];onRemove?:(t:string)=>void;full?:boolean;picked?:string[];onPick?:(t:string)=>void;max?:number;locked?:string[]}){
 return <div className="mt-4 rounded-2xl border-2 border-dashed border-edge bg-panel-2 p-3" aria-live="polite">
  <p className="flex items-center gap-2 text-[14px] font-bold text-ink"><BookOpen size={16} className="text-highlight"/>Evidence pouch · {pouch.length} of {POUCH_MAX}{onPick&&max?` · pin ${max}`:""}</p>
  {!pouch.length&&<p className="mt-1 text-[14px] text-muted">Empty. Tap a line in the story to keep it.</p>}
  <ul className="mt-2 space-y-2">{pouch.map(t=>{const on=!!picked?.some(x=>lineKey(x)===lineKey(t));const done=locked.some(x=>lineKey(x)===lineKey(t));return <li key={t} className="flex items-start gap-2">
   {onPick?<button type="button" aria-pressed={on} onClick={()=>onPick(t)} className={`flex-1 rounded-xl px-3 py-2 text-left font-serif text-[15px] leading-6 ${on?"bg-primary text-on-primary":"bg-panel ring-1 ring-edge hover:ring-primary"}`}>“{t.replace(/\s+/g," ")}”</button>
   :<p className="flex-1 font-serif text-[15px] leading-6">{done&&<Check size={15} className="mr-1 inline text-success" aria-label="found"/>}“{t.replace(/\s+/g," ")}”</p>}
   {onRemove&&!done&&<button type="button" onClick={()=>onRemove(t)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-panel-2" aria-label="Take this line out of your pouch"><X size={16}/></button>}
  </li>})}</ul>
  {full&&<p className="mt-2 text-[14px] font-semibold text-notyet">Your pouch is full. Take a line out to swap it.</p>}
 </div>;
}

function Speaker({world,characterId,line,sound,sandboxId,label}:{world:WorldPack;characterId:string;line:string;sound:boolean;sandboxId:string;label:string}){
 const who=world.characters.find(c=>c.id===characterId);const voice=useCharacterVoice(world.id,sandboxId);
 const said=useRef(false);
 useEffect(()=>{if(said.current||!sound||!who)return;said.current=true;voice.play(line,who.id)},[sound,who,line,voice]);
 useEffect(()=>()=>voice.stop(),[voice]);
 if(!who)return null;
 return <div className="mt-4 flex items-start gap-3 rounded-3xl bg-deep p-4 text-ink"><Portrait character={who} size={64} speaking={voice.speaking===who.id}/><div className="min-w-0"><p className="text-[13px] font-semibold uppercase tracking-wide text-muted">{label} · {who.name}</p><p className="mt-1 text-[18px] leading-7">{line}</p></div></div>;
}
// The accepted (or shown) line, quoted.
function TheLine({line,shown}:{line:string;shown?:boolean}){
 return <div className="mt-4">{shown&&<p className="text-[15px] font-bold text-gold">Here is the line that answers it. This round scores 0, but the proof step still counts toward your case.</p>}<blockquote className="mt-1 border-l-4 border-primary bg-panel px-4 py-3 font-serif text-[17px] leading-7">{displayLine(line)}</blockquote></div>;
}

// Round 2, infer: the character asks; the student finds the one line, marks its exact words if it's long, then proves it.
function InferRound({world,scene,passages,run,setting,sound,sandboxId,resume,send,onError,bar,hold}:RoundProps){
 const c=scene.story_mode!,q=inferQ(scene,run.state.picks),who=c.infer.character_id;
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<{hint:string;reaction:Reaction}|null>(null),[busy,setBusy]=useState(false);
 const [started,setStarted]=useState(!!resume);
 const [line,setLine]=useState(""),[accepted,setAccepted]=useState(resume?.line??""),[step,setStep]=useState<Step|null>(resume?.step?{name:resume.step,choices:resume.choices,shown:resume.shown&&resume.line?[resume.line]:null,phrase:null}:null);
 const speed=useSpeedMeta();
 const fit=useFitHeight();
 async function go(input:RoundInput,elapsed=0,grace=false){
  if(busy)return;setBusy(true);
  const r=await trySend(send,onError,input,elapsed,grace);setBusy(false);
  if(!r.reply)return;
  if(r.reply.notYet){setTryNo(r.reply.notYet.tryNo);setNotYet({hint:r.reply.notYet.hint,reaction:r.reply.reaction});return}
  if(r.reply.step){const s=r.reply.step;if(s.shown?.[0])setAccepted(s.shown[0]);else if(input.kind==="confront"&&!accepted)setAccepted(input.line);setStep(s)}
 }
 if(notYet)return <><Speaker world={world} characterId={who} line={q.question} sound={false} sandboxId={sandboxId} label="Asks you"/><NotYet tryNo={tryNo} hint={notYet.hint} onTryAgain={()=>{setNotYet(null);setLine("");setStarted(false)}} extra={notYet.reaction?<Reacts world={world} who={who} reaction={notYet.reaction} trust={run.state.trust[who]??0}/>:null}/></>;
 if(step&&accepted){
  const shown=!!step.shown;
  return <section className="mt-4" aria-labelledby="play-h">
   <h1 id="play-h" className="text-[24px] font-bold">{step.name==="phrase"?"Mark the exact words":"Prove it"}</h1>
   <Speaker world={world} characterId={who} line={q.question} sound={false} sandboxId={sandboxId} label="Asks you"/>
   {step.name==="phrase"&&step.note&&<p role="status" className="mt-3 rounded-2xl bg-success-soft px-4 py-3 text-[17px] font-semibold text-success">{step.note}</p>}
   {step.name==="phrase"?<PhrasePicker line={accepted} busy={busy} onLock={range=>go({kind:"confront",line:accepted,marked:range})}/>
    :<><TheLine line={accepted} shown={shown}/>{shown&&step.phrase&&<PhrasePicker line={accepted} shownRange={step.phrase}/>}<ProveIt choices={step.choices} busy={busy} onSubmit={p=>go({kind:"confront",line:accepted,prove:p})}/></>}
  </section>;
 }
 return <TimedTry key={tryNo} kind="confront" tryNo={tryNo} setting={setting} paused={hold} waiting={!started} onOver={(e,g)=>go({kind:"confront",line,...speed.meta(),timeout:true},e,g)}>{t=><section className="mt-3" aria-labelledby="play-h">
  <RoundHeading round={2} kind="confront" tryNo={tryNo}/>
  <RoundBanner bar={bar} started={started}/>
  <Speaker world={world} characterId={who} line={q.question} sound={sound&&tryNo===1} sandboxId={sandboxId} label="Asks you"/>
  <TimerBar t={t} seconds={trySeconds("confront",tryNo,setting).seconds} waiting={!started}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="confront" run={run}/>
  <p className="mt-4 text-[16px] font-semibold">Tap the one line that answers it.</p>
  <div ref={fit.ref} style={fit.style} className="mt-2 flex min-h-0 flex-col"> <ReadingPanel glossary={world.glossary} className="h-full" passages={chunks} kept={line?[line]:[]} onTap={l=>{setStarted(true);speed.tap();if(line&&lineKey(line)!==lineKey(l.text))speed.swap();setLine(l.text)}}/></div>
  <div ref={fit.dock} className="flex justify-end pt-2"><button type="button" disabled={!line||busy} onClick={()=>go({kind:"confront",line,...speed.meta()},t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Lock in this line <ArrowRight size={18}/></button></div>
 </section>}</TimedTry>;
}
// The character's reaction to a try, with trust moving the same way.
function Reacts({world,who,reaction,trust}:{world:WorldPack;who:string;reaction:{line:string;trust:number};trust:number}){
 const name=world.characters.find(c=>c.id===who)?.name??"";
 return <div className="mt-3 rounded-2xl bg-panel p-3"><p className="text-[16px] leading-6">{reaction.line}</p><TrustMeter name={name} value={trust} change={reaction.trust}/></div>;
}

// Round 3, catch the lie: tap the line that proves the testimony false, then say why.
function LieRound({world,scene,passages,run,setting,sound,sandboxId,resume,send,onError,bar,hold}:RoundProps){
 const lie=lieOf(scene,run.state.picks),clue=scene.artifacts.find(a=>a.id===lie.clue_id)!;
 const source=useMemo(()=>passages.filter(p=>clue.source_anchor.includes(p.id)),[passages,clue.source_anchor]);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<string|null>(null),[busy,setBusy]=useState(false);
 const [started,setStarted]=useState(!!resume);
 const [line,setLine]=useState(""),[accepted,setAccepted]=useState(resume?.line??""),[shownLine,setShownLine]=useState(resume?.shown&&resume.line?resume.line:""),[explain,setExplain]=useState("");
 const speed=useSpeedMeta();
 const fit=useFitHeight();
 async function go(input:RoundInput,elapsed=0,grace=false){
  if(busy)return;setBusy(true);
  const r=await trySend(send,onError,input,elapsed,grace);setBusy(false);
  if(!r.reply)return;
  if(r.reply.notYet){setTryNo(r.reply.notYet.tryNo);setNotYet(r.reply.notYet.hint);return}
  if(r.reply.step){const s=r.reply.step.shown?.[0];if(s){setShownLine(s);setAccepted(s)}else if(input.kind==="lie")setAccepted(input.line)}
 }
 const testimony=<Speaker world={world} characterId={lie.character_id} line={lie.testimony} sound={sound&&tryNo===1&&!accepted} sandboxId={sandboxId} label="Testimony"/>;
 if(notYet)return <>{testimony}<NotYet tryNo={tryNo} hint={notYet} onTryAgain={()=>{setNotYet(null);setLine("");setStarted(false)}}/></>;
 if(accepted)return <section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">{shownLine?"Here's the proof":"Lie caught"}</h1>
  {testimony}
  <TheLine line={accepted} shown={!!shownLine}/>
  <label htmlFor="lie-why" className="mt-4 block text-[16px] font-semibold">Why does this line prove it false?</label>
  <textarea id="lie-why" value={explain} onChange={e=>setExplain(e.target.value)} rows={2} maxLength={400} className="mt-2 w-full rounded-2xl border border-edge bg-panel px-4 py-3 text-[17px]" placeholder={`${world.characters.find(c=>c.id===lie.character_id)?.name??"They"} said… but the story says…`}/>
  <div className="mt-5 flex justify-end"><button type="button" disabled={!explain.trim()||busy} onClick={()=>go({kind:"lie",line:accepted,explanation:explain})} className="case-primary disabled:opacity-40">Submit <ArrowRight size={18}/></button></div>
 </section>;
 return <TimedTry key={tryNo} kind="lie" tryNo={tryNo} setting={setting} paused={hold} waiting={!started} onOver={(e,g)=>go({kind:"lie",line,...speed.meta(),timeout:true},e,g)}>{t=><section className="mt-3" aria-labelledby="play-h">
  <RoundHeading round={3} kind="lie" tryNo={tryNo}/>
  <RoundBanner bar={bar} started={started}/>
  {testimony}
  <TimerBar t={t} seconds={trySeconds("lie",tryNo,setting).seconds} waiting={!started}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="lie" run={run}/>
  <p className="mt-4 text-[16px] font-semibold">One thing is false. Tap the line in the story that proves it.</p>
  <div ref={fit.ref} style={fit.style} className="mt-2 flex min-h-0 flex-col"> <ReadingPanel glossary={world.glossary} className="h-full" passages={source} kept={line?[line]:[]} onTap={l=>{setStarted(true);speed.tap();if(line&&lineKey(line)!==lineKey(l.text))speed.swap();setLine(l.text)}}/></div>
  <div ref={fit.dock} className="flex justify-end pt-2"><button type="button" disabled={!line||busy} onClick={()=>go({kind:"lie",line,...speed.meta()},t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Lock in this line <ArrowRight size={18}/></button></div>
 </section>}</TimedTry>;
}

// Round 4, build the case: a theory and two lines that support it, from the pouch or the reading.
function CallRound({world,scene,passages,run,setting,resume,send,onError,bar,hold}:RoundProps){
 const q=callQ(scene,run.state.picks),c=scene.story_mode!;
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [theory,setTheory]=useState(""),[pins,setPins]=useState<string[]>([]);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<string|null>(null),[busy,setBusy]=useState(false);
 const speed=useSpeedMeta();
 const [started,setStarted]=useState(!!resume);
 const togglePin=(line:string)=>{setStarted(true);speed.tap();setPins(p=>p.some(x=>lineKey(x)===lineKey(line))?(speed.swap(),p.filter(x=>lineKey(x)!==lineKey(line))):p.length>=2?(speed.swap(),[p[1],line]):[...p,line])};
 async function go(elapsed:number,grace:boolean,timeout=false){
  if(busy)return;setBusy(true);
  const r=await trySend(send,onError,{kind:"call",theoryId:theory,pins,...speed.meta(),...(timeout?{timeout:true}:{})},elapsed,grace);setBusy(false);
  if(r.reply?.notYet){setTryNo(r.reply.notYet.tryNo);setNotYet(r.reply.notYet.hint)}
 }
 const fit=useFitHeight();
 const picked=q.theories.find(th=>th.id===theory);
 const fromPouch=run.state.pouch.filter(l=>!pins.some(p=>lineKey(p)===lineKey(l)));
 if(notYet)return <NotYet tryNo={tryNo} hint={notYet} onTryAgain={()=>{setNotYet(null);setPins([]);setStarted(false)}}/>;
 return <TimedTry key={tryNo} kind="call" tryNo={tryNo} setting={setting} paused={hold} waiting={!started} onOver={(e,g)=>go(e,g,true)}>{t=><section className="mt-2" aria-labelledby="play-h">
  <RoundHeading round={4} kind="call" tryNo={tryNo}/>
  <RoundBanner bar={bar} started={started}/>
  <p className="mt-1 text-[17px] font-semibold leading-6">{q.question}</p>
  <TimerBar t={t} seconds={trySeconds("call",tryNo,setting).seconds} compact waiting={!started}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="call" run={run}/>
  <fieldset className="mt-2"><legend className="text-[14px] font-bold uppercase tracking-wide text-highlight">1 · Your theory</legend>
   <div className="mt-1 grid grid-cols-3 gap-1.5">{q.theories.map(th=><button key={th.id} type="button" aria-pressed={theory===th.id} aria-label={`Theory: ${th.name}. ${th.description}`} onClick={()=>{setStarted(true);setTheory(th.id)}} className={`min-h-[48px] rounded-xl px-2 py-1.5 text-center text-[14px] font-bold leading-tight ${theory===th.id?"bg-primary text-on-primary":"bg-panel ring-1 ring-edge hover:ring-primary"}`}>{th.name}</button>)}</div>
   {picked&&<p className="mt-1 text-[13.5px] leading-5 text-muted">{picked.description}</p>}</fieldset>
  <p className="mt-2 text-[14px] font-bold uppercase tracking-wide text-highlight">2 · Pin 2 lines that support it <span className="normal-case tracking-normal text-ink">· {pins.length}/2</span></p>
  {fromPouch.length>0&&<div className="mt-1 flex items-center gap-1 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Lines from your pouch"><span className="shrink-0 text-[12.5px] font-semibold text-muted">Your pouch:</span>{fromPouch.map(l=><button key={l} type="button" onClick={()=>togglePin(l)} aria-label={`Pin from your pouch: ${displayLine(l).split(/\s+/).slice(0,6).join(" ")}…`} className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-primary-soft px-2.5 text-[12.5px] font-semibold text-highlight">+ {displayLine(l).split(/\s+/).slice(0,3).join(" ")}…</button>)}</div>}
  <div ref={fit.ref} style={fit.style} className="mt-1.5 flex min-h-0 flex-col"><ReadingPanel glossary={world.glossary} className="h-full" passages={chunks} kept={pins} onTap={l=>togglePin(l.text)}/></div>
  <div ref={fit.dock} className="pt-2"><button type="button" disabled={!theory||pins.length<2||busy} onClick={()=>go(t.elapsed,t.grace)} className="case-primary min-h-[48px] w-full justify-center disabled:opacity-40">{!theory?"Pick a theory":pins.length<2?`Pin ${2-pins.length} more line${pins.length===1?"":"s"}`:"Lock in my case"} <ArrowRight size={18}/></button></div>
 </section>}</TimedTry>;
}

// ---------- Results: points, streak, coins, leaderboard, class pulse ----------
function useLiveBoard(run:PublicRun,initial:Board,headers:Record<string,string>,sandboxId:string,active:boolean){
 const [board,setBoard]=useState<Board>(initial);
 useEffect(()=>{setBoard(initial)},[initial]);
 useEffect(()=>{
  if(!active)return;
  const load=()=>fetch(`/api/story/board?runId=${run.id}&sandboxId=${sandboxId}`,{headers,cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&"board" in j)setBoard(j.board)}).catch(()=>{});
  const db=getBrowserSupabase();
  const ch=db?.channel(run.topic).on("broadcast",{event:"changed"},()=>{load()}).subscribe();
  const t=setInterval(load,8000);return()=>{clearInterval(t);if(ch)db?.removeChannel(ch)};
 },[active,run.id,run.topic,headers,sandboxId]);
 return board;
}
function BoardView({board,mode}:{board:Board;mode:"individual"|"squad"|"off"}){
 if(mode==="off"||!board)return null;
 return <section className="mt-5 rounded-3xl bg-deep p-5 text-ink" aria-labelledby="board-h">
  <h2 id="board-h" className="flex items-center gap-2 text-[18px] font-bold"><Trophy size={18} className="text-muted"/>{board.kind==="squad"?"Squad leaderboard":"Leaderboard"} · top 5</h2>
  <ol className="mt-3 space-y-1.5">{board.top.map(r=><li key={r.rank} className={`flex items-center justify-between rounded-xl px-3 py-2 ${r.me?"bg-primary":"bg-ink/5"}`}><span className="flex items-center gap-3"><span className="w-6 text-right font-bold tabular-nums">{r.rank}</span><span className="font-semibold">{r.name}{r.me?" (you)":""}</span></span><span className="tabular-nums">{r.score}</span></li>)}</ol>
  {board.me&&board.me.rank>5&&<p className="mt-3 rounded-xl bg-ink/10 px-3 py-2 text-[16px]">You're <b>#{board.me.rank}</b> with {board.me.score}{board.me.movement>0?` · up ${board.me.movement} spot${board.me.movement===1?"":"s"}`:""}</p>}
  {board.me&&board.me.rank<=5&&board.me.movement>0&&<p className="mt-3 text-[15px] text-muted">Up {board.me.movement} spot{board.me.movement===1?"":"s"}!</p>}
 </section>;
}
// A right round shows its points; a round that needed the answer shown is never shown as success: no streak flame, no
// approving reaction. Shown lines must each be kept (tapped) before Next.
function Results({world,scene,result,mode,run,headers,sandboxId,onNext}:{world:WorldPack;scene:Scene;result:Result;mode:"individual"|"squad"|"off";run:PublicRun;headers:Record<string,string>;sandboxId:string;onNext:()=>void}){
 const r=result.record;const board=useLiveBoard(run,result.board,headers,sandboxId,true);
 const who=scene.story_mode!.infer.character_id,trust=run.state.trust[who]??0;
 const shownLines=result.shown??[],[kept,setKept]=useState<string[]>([]);
 const mustKeep=(r.kind==="read"||r.kind==="call")&&shownLines.length>0&&shownLines.some(l=>!kept.includes(l));
 const ok=r.valid;
 return <section className="mt-5" aria-labelledby="res-h">
  {/* A right answer with points is the Proof! moment: the points float up over a teal card. */}
  {ok&&r.points>0&&<p aria-hidden className="float-up mt-6 text-center font-display text-[56px] font-bold leading-none tabular-nums text-gold">+{r.points}</p>}
  <div className={ok&&r.points>0?"moment-pop mt-2 rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]":"rounded-card bg-panel p-5"}>
  <p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Round {r.round} · {ROUND_NAMES[r.kind]}</p>
  {ok&&r.points===0?<h1 id="res-h" className="mt-1 text-[32px] font-bold leading-tight">Found it</h1>
   :ok?<h1 id="res-h" className="mt-1 text-[40px] font-bold leading-none">Proof!<span className="sr-only"> Plus {r.points} points.</span></h1>
   :<h1 id="res-h" className="mt-1 text-[32px] font-bold leading-tight">Here's what proves it</h1>}
  <p className="mt-2 text-[17px] font-bold">{ok&&r.points===0?`${r.detail} on try ${r.tries+1}. Points come on the first two tries.`:ok?`${r.detail}${r.tries?` · found on try ${r.tries+1}`:""}${r.grace?" · half points after time":""}`:r.points>0?`+${r.points} for the lines you found. The rest are shown below.`:"0 points this round. Read the line below: it's the proof."}</p>
  </div>
  {ok&&<ul className="mt-3 flex flex-wrap gap-2 text-[14px] font-semibold">
   <li className="rounded-full bg-panel px-3 py-1">Proof {r.base}</li>
   {r.multiplier>1&&<li className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-on-primary"><Flame size={14}/>Streak x{r.multiplier}</li>}
   {r.doubled&&<li className="rounded-full bg-deep px-3 py-1 text-ink">Doubled</li>}
   {r.coinsEarned>0&&<li className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-highlight"><Coins size={14}/>+{r.coinsEarned} coin{r.coinsEarned===1?"":"s"}</li>}
  </ul>}
  {!!r.lost&&<p className="mt-3 rounded-2xl bg-gold-soft px-4 py-3 text-[16px] font-semibold text-gold">Double down: you bet {r.bet} and lost {r.lost}.</p>}
  {r.streak>0?<p className="mt-3 flex items-center gap-2 text-[16px]"><Flame size={18} className="text-highlight"/>Streak: {r.streak} round{r.streak===1?"":"s"} in a row right on the first try</p>
   :<p className="mt-3 text-[16px]">Streak reset: streaks count rounds right on the first try.</p>}
  {result.reaction&&<Reacts world={world} who={who} reaction={result.reaction} trust={trust}/>}
  {shownLines.length>0&&(r.kind==="read"||r.kind==="call")&&<div className="mt-4 rounded-3xl border-2 border-gold bg-gold-soft p-4"><p className="text-[16px] font-bold">Shown answer{shownLines.length>1?"s":""}: tap each line to keep it</p>
   <ul className="mt-2 space-y-2">{shownLines.map(l=>{const on=kept.includes(l);return <li key={l}><button type="button" aria-pressed={on} onClick={()=>setKept(k=>on?k.filter(x=>x!==l):[...k,l])} className={`w-full rounded-2xl px-4 py-3 text-left font-serif text-[16px] leading-6 ${on?"bg-primary text-on-primary":"bg-panel ring-1 ring-gold"}`}>{on&&<Check size={16} className="mr-1 inline"/>}{displayLine(l)}</button></li>})}</ul></div>}
  {r.proof.length>0&&ok&&<div className="mt-4"><p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">{r.kind==="read"?"Your pouch":"Your proof"}</p>{r.proof.map(p=><blockquote key={p} className="mt-2 border-l-4 border-primary pl-3 font-serif text-[15px] italic leading-6">“{p.replace(/\s+/g," ")}”</blockquote>)}</div>}
  <PointsMeter total={run.total} max={run.goal.max}/>
  <BoardView board={board} mode={mode}/>
  <section className="mt-5 rounded-3xl bg-panel p-5" aria-labelledby="pulse-h">
   <h2 id="pulse-h" className="text-[18px] font-bold">{run.scope==="class"?"Class pulse":"Today's players"}</h2>
   {result.pulse.length?<ul className="mt-3 space-y-3">{result.pulse.map(p=><li key={p.key}><div className="flex justify-between gap-3 text-[15px]"><span className="font-semibold">{p.label}</span><span className="tabular-nums">{p.pct}%</span></div><div aria-hidden className="mt-1 h-2.5 rounded-full bg-panel-2"><div className="h-full rounded-full bg-primary" style={{width:`${p.pct}%`}}/></div>{p.strongest&&<p className="mt-1 font-serif text-[14px] italic leading-5 text-muted">Strongest proof: “{p.strongest.replace(/\s+/g," ").slice(0,160)}{p.strongest.length>160?"…":""}”</p>}</li>)}</ul>
    :<p className="mt-2 text-[15px] text-muted">Percentages show once 5 players have answered{result.answered?` (${result.answered} so far)`:""}.</p>}
  </section>
  <div className="mt-6 flex flex-col items-end gap-1">{mustKeep&&<p className="text-[15px] font-semibold text-gold">Tap the shown line to keep it</p>}<button type="button" disabled={mustKeep} onClick={onNext} className="case-primary min-h-[58px] text-[18px] disabled:opacity-40">{run.finished?"See your scene results":"Next round"} <ArrowRight size={20}/></button></div>
 </section>;
}
function TrustMeter({name,value,change}:{name:string;value:number;change:number}){
 const pct=Math.round(((Math.max(-3,Math.min(3,value))+3)/6)*100);
 return <div className="mt-3"><p className="text-[14px] font-semibold">Trust with {name}: <span className={change>0?"text-success":change<0?"text-notyet":""}>{change>0?`up ${change}`:change<0?`down ${-change}`:"no change"}</span></p>
  <div className="mt-1 h-2.5 rounded-full bg-panel-2" role="meter" aria-valuemin={-3} aria-valuemax={3} aria-valuenow={value} aria-label={`Trust with ${name}`}><div className="h-full rounded-full bg-deep" style={{width:`${pct}%`}}/></div></div>;
}

// The demo's ending replaces the next scene's button (and sits beside mission leads, so testers can always close).
const NEXT_SCENE="On to the next scene";
// ---------- Scene cleared: the total against the points possible, and the goal level reached ----------
function Cleared({run,mode,headers,sandboxId,onNext,onAgain,onLeads,nextLabel=NEXT_SCENE}:{run:PublicRun;mode:"individual"|"squad"|"off";headers:Record<string,string>;sandboxId:string;onNext:()=>void;onAgain:()=>void;nextLabel?:string;onLeads?:()=>void}){
 const [board,setBoard]=useState<Board>(null);
 useEffect(()=>{if(mode==="off")return;fetch(`/api/story/board?runId=${run.id}&sandboxId=${sandboxId}`,{headers,cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>j&&setBoard(j.board)).catch(()=>{})},[run.id,headers,sandboxId,mode]);
 const level=levelFor(run.total,run.goal.max),next=LEVELS.find(l=>run.total<Math.ceil((l.pct/100)*run.goal.max));
 return <section className="mt-6" aria-labelledby="clear-h">
  <div className="rounded-3xl bg-deep p-6 text-center text-ink"><p className="text-[14px] font-semibold uppercase tracking-wide text-muted">Scene cleared</p><h1 id="clear-h" className="mt-2 text-[34px] font-bold">{level?level.name:"Case still open"}</h1><p className="mt-1 text-[22px] font-bold tabular-nums">{run.total.toLocaleString()} / {run.goal.max.toLocaleString()} points{run.total>run.goal.max?" · Bonus":""}</p>
   {next&&<p className="mt-1 text-[15px] text-muted">{next.name} takes {Math.ceil((next.pct/100)*run.goal.max).toLocaleString()}.</p>}
   <dl className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl bg-ink/10 p-3"><dt className="text-[13px]">Best streak</dt><dd className="text-[22px] font-bold">{run.state.bestStreak}</dd></div><div className="rounded-2xl bg-ink/10 p-3"><dt className="text-[13px]">Rank</dt><dd className="text-[22px] font-bold">{board?.me?`#${board.me.rank}`:"·"}</dd></div><div className="rounded-2xl bg-ink/10 p-3"><dt className="text-[13px]">Coins left</dt><dd className="text-[22px] font-bold">{run.state.coins}</dd></div></dl></div>
  <div className="mt-5"><h2 className="text-[18px] font-bold">Your Evidence pouch</h2>{run.state.pouch.length?run.state.pouch.map(p=><blockquote key={p} className="mt-2 border-l-4 border-primary pl-3 font-serif text-[16px] italic leading-7">“{p.replace(/\s+/g," ")}”</blockquote>):<p className="mt-1 text-[15px] text-muted">No lines kept this time.</p>}</div>
  <BoardView board={board} mode={mode}/>
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={onAgain} className="inline-flex min-h-11 items-center gap-2 text-[15px] text-muted underline underline-offset-4"><RotateCcw size={16}/>Play this scene again</button>{onLeads?<span className="flex flex-col items-end gap-1"><button type="button" onClick={onLeads} className="case-primary min-h-[58px] text-[18px]">Follow your mission leads <ArrowRight size={20}/></button>{nextLabel!==NEXT_SCENE&&<button type="button" onClick={onNext} className="min-h-11 text-[15px] font-semibold text-highlight underline underline-offset-4">{nextLabel}</button>}</span>:<button type="button" onClick={onNext} className="case-primary min-h-[58px] text-[18px]">{nextLabel} <ArrowRight size={20}/></button>}</div>
 </section>;
}
