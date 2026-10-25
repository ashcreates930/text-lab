"use client";
// Story Mode (solo): the student lives inside the scene as their role and plays four rounds up the ladder: locate, infer,
// catch the lie, build the case. Before round 1 they see the points possible; a meter shows progress toward the goal
// levels at the top of every round. Each round: a ready card (power-ups, Relaxed timer), a 3-second countdown, the
// challenge with a timer bar, then results. A miss is a "Not yet" screen (amber, no points, the try count and a hint)
// and a fresh 30 seconds; after three misses the answer is shown and the proof step still comes, for 0 points.
// One screen flow, one clear action at a time. The server scores every try (lib/story-server.ts); the rules are in
// lib/story-mode.ts and lib/fair-play.ts, and the content in the scene's `story_mode` block.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,BookOpen,Check,Coins,Flame,Minus,RotateCcw,Timer,Trophy,Volume2,VolumeX,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {COUNTDOWN_SECONDS,GRACE_SECONDS,POUCH_MAX,POWER_UPS,ROUNDS,ROUND_NAMES,SECONDS,goalLine,roundIntroLine,callQ,inferQ,lanternParagraph,lieOf,phaseSeconds,readQ,timeAnnouncement,type PowerUp,type RoundInput,type RoundKind,type RoundRecord,type RunState,type Scene,type TimeSetting} from "@/lib/story-mode";
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
import {NotYet,PhrasePicker,PointsGoal,PointsMeter,ProveIt,useSpeedMeta} from "./fair-play-ui";
import {collectPieces,missionFor} from "@/lib/missions";
import {MissionTracker} from "./missions";

type PublicRun={id:string;topic:string;nickname:string;state:RunState;total:number;bestTotal:number;finished:boolean;timeSetting:TimeSetting;scope:"class"|"demo";goal:{max:number;level:string|null}};
type Board={kind:"individual"|"squad";top:{rank:number;name:string;score:number;me:boolean}[];me:{rank:number;score:number;movement:number}|null;players:number}|null;
type Pulse={key:string;label:string;pct:number;strongest:string}[];
type Reaction={line:string;trust:number}|null;
type Step={name:"phrase"|"prove"|"explain";choices:string[]|null;shown:string[]|null;phrase:[number,number]|null};
type TryReply={run:PublicRun;notYet:{tryNo:number;hint:string;locked:string[]}|null;step:Step|null;reaction:Reaction};
type Resume={tryNo:number;locked:string[];line:string|null;shown:boolean;step:"phrase"|"prove"|"explain"|null;choices:string[]|null}|null;
type Result={record:RoundRecord;shown:string[]|null;reaction:Reaction;run:PublicRun;board:Board;pulse:Pulse;answered:number};
type Send=(input:RoundInput,elapsedMs:number,grace:boolean)=>Promise<TryReply|null>;
type Stage="loading"|"ready"|"countdown"|"play"|"results"|"cleared"|"error";

// Sound cues: short and quiet, only when Sound is on.
function cue(on:boolean,name:"tick"|"chime"|"streak"|"reveal"){if(!on)return;try{const a=new Audio(`/sounds/story/${name}.mp3`);a.volume=0.35;a.play().catch(()=>{})}catch{}}
const reducedMotion=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// startAt: open at a later round ("Catch the lie" on the home page); onJumped: called once the run has opened there.
// onUnavailable: Story Mode's tables aren't set up (or the server can't reach them), so the scene opens in the Case
// file view instead, with no error screen.
// onLeads: this scene has mission leads the student hasn't followed (offered on the cleared screen).
export function StoryMode({world,scene,sceneIndex,passages,demo,setDemo,onCleared,onCaseFile,startAt,onJumped,onUnavailable,onLeads}:{world:WorldPack;scene:Scene;sceneIndex:number;passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onCleared:()=>void;onCaseFile?:()=>void;startAt?:RoundKind;onJumped?:()=>void;onUnavailable:()=>void;onLeads?:()=>void}){
 const content=scene.story_mode!;
 const headers=useMemo(()=>({"Content-Type":"application/json",...(demo.classAuth?{"x-class-token":demo.classAuth.token}:{})}),[demo.classAuth]);
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
 const start=useCallback(async(restart=false)=>{
  setStage("loading");setError("");
  try{const j=await post("/api/story/run",{worldId:world.id,sceneId:scene.id,restart,...(jump.current&&!restart?{startAt:jump.current}:{})});
   if(j.unavailable){callbacks.current.onUnavailable();return}
   if(jump.current)callbacks.current.onJumped?.();
   // A round already in progress (a reload) picks up at its try.
   setRun(j.run);setMode(j.leaderboard);setResult(null);setResume(j.resume??null);setStage(j.run.finished?"cleared":j.resume?"play":"ready")}
  catch(e){const status=(e as {status?:number}).status;
   // No answer, or a server error: open the Case file view rather than an error screen. A 4xx says what to do.
   if(!status||status>=500){callbacks.current.onUnavailable();return}
   setError((e as Error).message);setStage("error")}
 },[post,world.id,scene.id]);
 useEffect(()=>{start()},[start]);
 const setting:TimeSetting=run?(relaxed&&(run.timeSetting==="1"||run.timeSetting==="1.5")?"2":run.timeSetting):"1";

 // One try. A scored round moves to the results; anything else (Not yet, the next step) goes back to the round.
 const send:Send=async(input,elapsedMs,grace)=>{
  if(!run)return null;
  setNotice("");
  const j=await post("/api/story/round",{runId:run.id,round:round+1,input,elapsedMs,grace,relaxed,previousRank:lastRank.current});
  setRun(j.run);
  if(!j.record)return j as TryReply;
  const r=j as Result;
  setResult(r);setResume(null);if(r.board?.me)lastRank.current=r.board.me.rank;
  setStage("results");
  cue(soundOn,r.record.valid?"chime":"reveal");
  if(r.record.valid&&r.record.streak>=2)setTimeout(()=>cue(soundOn,"streak"),500);
  setTimeout(()=>cue(soundOn,"reveal"),reducedMotion()?0:900);
  // Saved with progress: the run's score, goal, pouch and trust; a caught lie also counts for the scene's lie clue.
  const lie=lieOf(scene,r.run.state.picks);
  // Mission pieces: the round's proof lines (shown ones marked shown).
  const shownLines=r.shown??[];
  setDemo(d=>{const m=missionFor(world,d.mission);const a=collectPieces(m,d.missionPieces,r.record.proof.filter(l=>!shownLines.includes(l)),{via:`story:${r.record.kind}`});const b=collectPieces(m,a??d.missionPieces,shownLines,{shown:true,via:`story:${r.record.kind}`});return a||b?{...d,missionPieces:b??a!}:d});
  setDemo(d=>({...d,story:{...(d.story??{}),[scene.id]:{runId:r.run.id,total:r.run.total,bestStreak:r.run.state.bestStreak,trust:r.run.state.trust,pouch:r.run.state.pouch,cleared:r.run.finished,max:r.run.goal.max,level:(r.run.goal.level as "opened"|"built"|"cracked"|null)}},
   ...(input.kind==="lie"&&r.record.valid&&scene.lie&&lie.clue_id===scene.lie.clue_id?{lies:{...(d.lies??{}),[scene.id]:{clue_id:scene.lie.clue_id,caught:true,misses:r.record.tries,caught_at:new Date().toISOString()}},...(input.explanation?.trim()?{artifactAnswers:{...d.artifactAnswers,[scene.lie.clue_id]:{notice:r.record.proof[0]??input.line,interpret:input.explanation.trim(),craft:"contradicts",technique:"",revisions:d.artifactAnswers[scene.lie.clue_id]?.revisions??[]}}}:{})}:{})}));
  return null;
 };
 async function buy(p:PowerUp){if(!run)return;setNotice("");try{const j=await post("/api/story/buy",{runId:run.id,powerUp:p});setRun(j.run);if(p==="second-look")replayLast()}catch(e){setNotice((e as Error).message)}}
 // Second look: replays the last part of the reading.
 const replayLast=useCallback(()=>{const pid=content.read.chunks[content.read.chunks.length-1];if(!soundOn)return;playNarration(soundChannel,`${scene.id}:story`,[{id:pid,text:passages.find(p=>p.id===pid)?.text??"",src:narrationFile(world.id,scene.id,pid)}],browserNarration)},[content.read.chunks,soundOn,scene.id,passages,world.id]);

 const header=<div>
  <div className="flex flex-wrap items-center justify-between gap-2">
   <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{world.title} · Scene {sceneIndex+1} · Story Mode</p>
   <div className="flex items-center gap-2">
    {run&&<span className="inline-flex items-center gap-1 rounded-full bg-[#F4E1D6] px-3 py-1 text-[14px] font-bold tabular-nums text-[#8A3B23]" title="Lantern coins"><Coins size={14}/>{run.state.coins}<span className="sr-only"> Lantern coins</span></span>}
    <button type="button" onClick={toggleSound} aria-pressed={soundOn} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[#EFE8D8] px-3 text-[14px] font-semibold">{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>}Sound {soundOn?"on":"off"}</button>
   </div>
  </div>
  {run&&stage!=="loading"&&stage!=="cleared"&&<PointsMeter total={run.total} max={run.goal.max}/>}
 </div>;
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-5 md:px-8">
  <AmbientPlayer src={scene.ambient_audio} on={ambientOn&&soundOn} showing={stage==="play"}/>
  {header}
  {notice&&<p role="alert" className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{notice}</p>}
  {stage==="loading"&&<p className="mt-10 text-center text-[17px] text-[#6B6457]">Opening the scene…</p>}
  {stage==="error"&&<div className="mt-8 rounded-3xl bg-[#FFFDF8] p-6"><h1 className="text-[24px] font-bold">Story Mode can't open right now</h1><p className="mt-2 text-[16px]">{error}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>start()} className="case-primary">Try again</button>{onCaseFile&&<button type="button" onClick={onCaseFile} className="case-secondary">Open the Case file</button>}</div></div>}
  {stage==="ready"&&run&&kind&&<MissionTracker world={world} demo={demo}/>}
  {stage==="ready"&&run&&kind&&<ReadyCard world={world} scene={scene} kind={kind} round={round} run={run} relaxed={relaxed} setRelaxed={setRelaxed} canRelax={run.timeSetting==="1"||run.timeSetting==="1.5"} onBuy={buy} onStart={()=>{setNotice("");setStage("countdown")}} onCaseFile={round===0?onCaseFile:undefined}/>}
  {stage==="countdown"&&kind&&<Countdown kind={kind} round={round} sound={soundOn} onDone={()=>setStage("play")}/>}
  {stage==="play"&&run&&kind&&<RoundPlay key={round} world={world} scene={scene} passages={passages} kind={kind} run={run} setting={setting} sound={soundOn} sandboxId={demo.id} resume={resume} send={send} onError={m=>setNotice(m)}/>}
  {stage==="results"&&result&&run&&<Results world={world} scene={scene} result={result} mode={mode} run={run} headers={headers} sandboxId={demo.id} onNext={()=>{setResult(null);setStage(run.finished?"cleared":"ready")}}/>}
  {stage==="cleared"&&run&&<Cleared run={run} mode={mode} headers={headers} sandboxId={demo.id} onNext={onCleared} onAgain={()=>start(true)} onLeads={onLeads}/>}
 </div>;
}

// ---------- Ready card: what this round is, power-ups, Relaxed timer, Start ----------
const ROUND_HELP:Record<RoundKind,string>={read:"Listen to the story and tap the lines that answer the question. Your Evidence pouch holds 3, so choose carefully.",confront:"Someone asks you a question. Find the one line that answers it, mark the words that prove it, then say what it shows.",lie:"A witness gives testimony. One thing is false. Tap the line that proves it, then say why in one sentence.",call:"Answer the case question. Pick a theory and pin 2 lines that support it."};
function ReadyCard({world,scene,kind,round,run,relaxed,setRelaxed,canRelax,onBuy,onStart,onCaseFile}:{world:WorldPack;scene:Scene;kind:RoundKind;round:number;run:PublicRun;relaxed:boolean;setRelaxed:(v:boolean)=>void;canRelax:boolean;onBuy:(p:PowerUp)=>void;onStart:()=>void;onCaseFile?:()=>void}){
 const role=world.student_role;const s=run.state;
 const usable=(p:PowerUp)=>p==="second-look"?kind!=="read":true;
 const firstRound=round===(s.skipped??0);
 return <section className="mt-5" aria-labelledby="ready-h">
  {firstRound&&<div className="overflow-hidden rounded-3xl bg-[#2A2620] text-[#FFFDF8]"><div className="case-art aspect-[16/7]" role="img" aria-label={`The scene: ${scene.id.replace(/-/g," ")}`} style={{backgroundImage:`url('${scene.background_image}')`}}/><div className="p-5">{role&&<p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">You are {role.name.replace(/^The /,"the ")}</p>}<p className="mt-1 text-[17px] leading-7">{scene.story_mode!.intro}</p>{round>0&&<p className="mt-2 text-[15px] text-[#F3C9B2]">You're starting at round {round+1}. Play the whole scene any time with "Play this scene again" at the end.</p>}</div></div>}
  {firstRound&&<PointsGoal max={run.goal.max}/>}
  <RoundTracker round={round} skipped={s.skipped??0}/>
  <p className="mt-3 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Round {round+1} of {ROUNDS.length}</p>
  <h1 id="ready-h" className="mt-1 text-[30px] font-bold leading-tight">{ROUND_NAMES[kind]}</h1>
  <div className="mt-3 rounded-2xl bg-[#FFFDF8] px-4 py-3 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="text-[17px] leading-7">{roundIntroLine(s.rounds.at(-1),round+(s.restarts??0))}</p><p className="mt-1 text-[15px] font-semibold tabular-nums text-[#4A4438]">{goalLine(run.total,run.goal.max)}</p></div>
  {kind==="read"&&<Focus text={readQ(scene,s.picks).focus}/>}
  <p className="mt-2 text-[17px] leading-7 text-[#4A4438]">{ROUND_HELP[kind]}</p>
  {round>0&&<div className="mt-5 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <h2 className="flex items-center gap-2 text-[18px] font-bold"><Coins size={18} className="text-[#A0472C]"/>Power-ups <span className="text-[15px] font-normal text-[#6B6457]">· {s.coins} coin{s.coins===1?"":"s"}</span></h2>
   <ul className="mt-3 grid gap-2 sm:grid-cols-3">{(Object.keys(POWER_UPS) as PowerUp[]).map(p=>{const on=(p==="lantern"&&s.lantern)||(p==="double-down"&&s.doubleDown);const short=s.coins<POWER_UPS[p].cost;const can=!on&&!short&&usable(p);
    // Can't afford it yet: a plain card that says what it takes, so it never looks used or done.
    return <li key={p}><button type="button" aria-disabled={!can} onClick={()=>can&&onBuy(p)} aria-pressed={on} className={`flex h-full w-full flex-col rounded-2xl p-3 text-left ${on?"bg-[#2A2620] text-white":can?"bg-[#F4E1D6] hover:bg-[#EDD3C4]":short&&usable(p)?"border-2 border-dashed border-[#C9B9A0] bg-[#FFFDF8] text-[#2A2620]":"bg-[#EFE8D8] text-[#8B8478]"}`}><span className="text-[16px] font-bold">{POWER_UPS[p].name} · {POWER_UPS[p].cost}</span><span className="mt-1 text-[13px] leading-5">{on?"Ready for this round.":!usable(p)?"Not used in this round.":short?<><b className="block text-[#8A3B23]">Need {POWER_UPS[p].cost} coin{POWER_UPS[p].cost===1?"":"s"}</b>{POWER_UPS[p].what}</>:POWER_UPS[p].what}</span></button></li>})}</ul>
  </div>}
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
   {canRelax?<label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-[16px]"><input type="checkbox" checked={relaxed} onChange={e=>setRelaxed(e.target.checked)} className="h-5 w-5 accent-[#A0472C]"/>Relaxed timer (2x time)</label>:<p className="text-[15px] text-[#6B6457]">{run.timeSetting==="untimed"?"No timer for you: take the time you need.":"Your teacher gave you extra time."}</p>}
   <button type="button" onClick={onStart} className="case-primary min-h-[58px] text-[18px]">Start round {round+1} <ArrowRight size={20}/></button>
  </div>
  {onCaseFile&&<p className="mt-6 text-[14px] text-[#6B6457]">Teachers: <button type="button" onClick={onCaseFile} className="font-semibold text-[#8A3B23] underline underline-offset-4">open the Case file view</button> instead.</p>}
 </section>;
}

// The four rounds in a row: played rounds gray with a check (skipped ones gray with a dash), the current one highlighted.
function RoundTracker({round,skipped}:{round:number;skipped:number}){
 return <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label={`Round ${round+1} of ${ROUNDS.length}`}>{ROUNDS.map((k,i)=>{const done=i<round,now=i===round,skip=done&&i<skipped;
  return <li key={k} aria-current={now?"step":undefined} className={`flex min-h-[52px] flex-col justify-center rounded-2xl px-2 py-1.5 text-center text-[13px] font-semibold leading-tight ${now?"bg-[#A0472C] text-white shadow-[0_0_0_3px_rgba(160,71,44,.25)]":done?"bg-[#E4DCCB] text-[#6B6457]":"bg-[#FFFDF8] text-[#2A2620] ring-1 ring-[#E4DCCB]"}`}>
   <span className="flex items-center justify-center gap-1">{done&&(skip?<Minus size={14} aria-hidden/>:<Check size={14} aria-hidden/>)}<span className="sr-only">{now?"Now: ":skip?"Skipped: ":done?"Done: ":"Later: "}</span>{i+1}</span><span>{ROUND_NAMES[k]}</span></li>})}</ol>;
}

// Round 1's focus question, on the ready card and above the passage.
function Focus({text}:{text:string}){
 return <p className="mt-3 rounded-2xl bg-[#2A2620] px-4 py-3 text-[18px] font-semibold leading-7 text-[#FFFDF8]"><span className="block text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Your question</span>{text}</p>;
}

// ---------- 3-second countdown ----------
function Countdown({kind,round,sound,onDone}:{kind:RoundKind;round:number;sound:boolean;onDone:()=>void}){
 const [n,setN]=useState(COUNTDOWN_SECONDS);
 const done=useRef(onDone);done.current=onDone;
 useEffect(()=>{let left=COUNTDOWN_SECONDS;cue(sound,"tick");const t=setInterval(()=>{left-=1;setN(left);if(left>0)cue(sound,"tick");else{clearInterval(t);done.current()}},1000);return()=>clearInterval(t)},[sound]);
 return <section className="mt-16 text-center" aria-labelledby="cd-h"><h1 id="cd-h" className="text-[22px] font-bold">Round {round+1}: {ROUND_NAMES[kind]}</h1><p className="mt-6 text-[96px] font-bold leading-none tabular-nums text-[#A0472C]" aria-live="assertive">{Math.max(n,1)}</p></section>;
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
function TimerBar({t,seconds}:{t:ReturnType<typeof useRoundTimer>;seconds:number|null}){
 if(seconds===null)return <p className="mt-3 flex items-center gap-2 text-[15px] text-[#6B6457]"><Timer size={16}/>No timer. Take the time you need.</p>;
 const share=t.grace?t.graceLeft/t.graceSeconds:(t.left??0)/seconds;
 const label=t.grace?`${Math.ceil(t.graceLeft)}s for half points`:`${Math.ceil(t.left??0)}s left`;
 return <div className="mt-3">
  <div className="flex items-center justify-between text-[14px] font-semibold"><span className={t.grace?"text-[#A33B20]":"text-[#4A4438]"}>{t.grace?"Time! You can still add proof for half points":t.paused?"Paused":"Time"}</span><span className="tabular-nums" aria-hidden>{label}</span></div>
  <div aria-hidden className="mt-1 h-3 overflow-hidden rounded-full bg-[#E4DCCB]"><div className={`h-full rounded-full ${t.grace?"bg-[#A33B20]":"bg-[#A0472C]"}`} style={{width:`${Math.max(0,Math.min(1,share))*100}%`}}/></div>
  <p className="sr-only" aria-live="polite">{t.announce}{t.grace?" Time! You can still add proof for half points.":""}</p>
 </div>;
}
// The seconds and grace for a try: the round's time on the first try, a fresh 30 (scaled) on each retry.
const trySeconds=(kind:RoundKind,tryNo:number,setting:TimeSetting)=>tryNo<=1?{seconds:phaseSeconds(SECONDS[kind],setting),grace:GRACE_SECONDS}:{seconds:phaseSeconds(SECONDS.retry,setting),grace:0};

// ---------- The four rounds ----------
type RoundProps={world:WorldPack;scene:Scene;passages:SourcePassage[];run:PublicRun;setting:TimeSetting;sound:boolean;sandboxId:string;resume:Resume;send:Send;onError:(m:string)=>void};
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
 return pid?<p className="mt-2 rounded-2xl bg-[#FBEFD2] px-4 py-3 text-[16px]">Your Lantern names {paragraphLabel(pid)}: a correct line is there.</p>:null;
}

function ReadRound({world,scene,passages,run,setting,sound,resume,send,onError}:RoundProps){
 const c=scene.story_mode!,q=readQ(scene,run.state.picks),notes=useMemo(()=>contentNotes(world),[world]);
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [shown,setShown]=useState(resume?chunks.length:1),[locked,setLocked]=useState<string[]>(resume?.locked??[]),[pouch,setPouch]=useState<string[]>(resume?.locked??[]),[full,setFull]=useState(false);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<{hint:string}|null>(null),[busy,setBusy]=useState(false);
 const speed=useSpeedMeta();
 // A paragraph with a content note shows the note first, with the timer paused until the student continues.
 const [noteSeen,setNoteSeen]=useState<Record<string,boolean>>({});
 const current=chunks[shown-1],noteOpen=!!current&&notes.has(current.id)&&!noteSeen[current.id];
 // Each part is narrated when it appears (ambient dips while it plays).
 useEffect(()=>{if(!current||noteOpen||!sound||tryNo>1)return;playNarration(soundChannel,`${scene.id}:story`,[{id:current.id,text:current.text,src:narrationFile(world.id,scene.id,current.id)}],browserNarration);return()=>soundChannel.stop()},[current,noteOpen,sound,scene.id,world.id,tryNo]);
 const isLocked=(t:string)=>locked.some(x=>lineKey(x)===lineKey(t));
 function tap(line:{text:string}){if(isLocked(line.text))return;speed.tap();const k=lineKey(line.text);setFull(false);setPouch(p=>{if(p.some(x=>lineKey(x)===k)){speed.swap();return p.filter(x=>lineKey(x)!==k)}if(p.length>=POUCH_MAX){setFull(true);return p}return [...p,line.text]})}
 async function lockIn(elapsed:number,grace:boolean,timeout=false){
  if(busy)return;setBusy(true);soundChannel.stop();
  const r=await trySend(send,onError,{kind:"read",pouch,...speed.meta(),...(timeout?{timeout:true}:{})},elapsed,grace);
  setBusy(false);
  if(r.reply?.notYet){setLocked(r.reply.notYet.locked);setPouch(r.reply.notYet.locked);setTryNo(r.reply.notYet.tryNo);setNotYet({hint:r.reply.notYet.hint})}
 }
 if(notYet)return <NotYet tryNo={tryNo} hint={notYet.hint} onTryAgain={()=>setNotYet(null)} extra={locked.length?<FoundSoFar lines={locked}/>:null}/>;
 return <TimedTry key={tryNo} kind="read" tryNo={tryNo} setting={setting} paused={noteOpen} onOver={(e,g)=>lockIn(e,g,true)}>{t=><section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">{tryNo>1?`Try ${tryNo}: find the rest`:ROUND_NAMES.read}</h1>
  <Focus text={q.focus}/>
  <p className="mt-2 text-[16px] text-[#4A4438]">{c.read.prompt}</p>
  <TimerBar t={t} seconds={trySeconds("read",tryNo,setting).seconds}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="read" run={run} locked={locked}/>
  <Pouch pouch={pouch} locked={locked} onRemove={x=>tap({text:x})} full={full}/>
  {tryNo===1&&<div className="case-art mt-4 aspect-[16/6] rounded-2xl" role="img" aria-label="The scene" style={{backgroundImage:`url('${scene.background_image}')`}}/>}
  <div className="mt-4 space-y-4">{chunks.slice(0,shown).map((p,i)=>i===shown-1&&noteOpen?<div key={p.id}><ContentNote text={notes.get(p.id)!}/><button type="button" onClick={()=>setNoteSeen(s=>({...s,[p.id]:true}))} className="case-secondary mt-3">Continue reading</button></div>
   :<div key={p.id} className="rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Part {i+1} of {chunks.length}</p><ReadingPanel glossary={world.glossary} passages={[p]} kept={pouch} onTap={tap} className="shadow-none"/></div>)}</div>
  <div className="mt-5 flex flex-wrap justify-end gap-3">
   {shown<chunks.length&&<button type="button" onClick={()=>setShown(n=>n+1)} disabled={noteOpen} className="case-secondary">Next part <ArrowRight size={18}/></button>}
   <button type="button" disabled={busy||pouch.length===locked.length} onClick={()=>lockIn(t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Lock in {pouch.length} line{pouch.length===1?"":"s"}</button>
  </div>
 </section>}</TimedTry>;
}
function FoundSoFar({lines}:{lines:string[]}){
 return <div className="mt-3"><p className="text-[15px] font-bold">Found so far</p>{lines.map(l=><blockquote key={l} className="mt-1 flex gap-2 border-l-4 border-[#2F6B3A] pl-3 font-serif text-[15px] leading-6"><Check size={16} className="mt-1 shrink-0 text-[#2F6B3A]" aria-label="found"/>{displayLine(l)}</blockquote>)}</div>;
}
// One timed try: a fresh timer each try (its key), handed to the round's view.
function TimedTry({kind,tryNo,setting,paused=false,onOver,children}:{kind:RoundKind;tryNo:number;setting:TimeSetting;paused?:boolean;onOver:(elapsed:number,grace:boolean)=>void;children:(t:ReturnType<typeof useRoundTimer>)=>React.ReactNode}){
 const {seconds,grace}=trySeconds(kind,tryNo,setting);
 const t=useRoundTimer(seconds,paused,()=>onOver(((seconds??0)+grace)*1000,grace>0),grace);
 return <>{children(t)}</>;
}

function Pouch({pouch,onRemove,full,picked,onPick,max,locked=[]}:{pouch:string[];onRemove?:(t:string)=>void;full?:boolean;picked?:string[];onPick?:(t:string)=>void;max?:number;locked?:string[]}){
 return <div className="mt-4 rounded-2xl border-2 border-dashed border-[#C9B9A0] bg-[#FBF7EE] p-3" aria-live="polite">
  <p className="flex items-center gap-2 text-[14px] font-bold text-[#2A2620]"><BookOpen size={16} className="text-[#A0472C]"/>Evidence pouch · {pouch.length} of {POUCH_MAX}{onPick&&max?` · pin ${max}`:""}</p>
  {!pouch.length&&<p className="mt-1 text-[14px] text-[#6B6457]">Empty. Tap a line in the story to keep it.</p>}
  <ul className="mt-2 space-y-2">{pouch.map(t=>{const on=!!picked?.some(x=>lineKey(x)===lineKey(t));const done=locked.some(x=>lineKey(x)===lineKey(t));return <li key={t} className="flex items-start gap-2">
   {onPick?<button type="button" aria-pressed={on} onClick={()=>onPick(t)} className={`flex-1 rounded-xl px-3 py-2 text-left font-serif text-[15px] leading-6 ${on?"bg-[#A0472C] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"}`}>“{t.replace(/\s+/g," ")}”</button>
   :<p className="flex-1 font-serif text-[15px] leading-6">{done&&<Check size={15} className="mr-1 inline text-[#2F6B3A]" aria-label="found"/>}“{t.replace(/\s+/g," ")}”</p>}
   {onRemove&&!done&&<button type="button" onClick={()=>onRemove(t)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-[#EFE8D8]" aria-label="Take this line out of your pouch"><X size={16}/></button>}
  </li>})}</ul>
  {full&&<p className="mt-2 text-[14px] font-semibold text-[#A33B20]">Your pouch is full. Take a line out to swap it.</p>}
 </div>;
}

function Speaker({world,characterId,line,sound,sandboxId,label}:{world:WorldPack;characterId:string;line:string;sound:boolean;sandboxId:string;label:string}){
 const who=world.characters.find(c=>c.id===characterId);const voice=useCharacterVoice(world.id,sandboxId);
 const said=useRef(false);
 useEffect(()=>{if(said.current||!sound||!who)return;said.current=true;voice.play(line,who.id)},[sound,who,line,voice]);
 useEffect(()=>()=>voice.stop(),[voice]);
 if(!who)return null;
 return <div className="mt-4 flex items-start gap-3 rounded-3xl bg-[#2A2620] p-4 text-[#FFFDF8]"><Portrait character={who} size={64} speaking={voice.speaking===who.id}/><div className="min-w-0"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">{label} · {who.name}</p><p className="mt-1 text-[18px] leading-7">{line}</p></div></div>;
}
// The accepted (or shown) line, quoted.
function TheLine({line,shown}:{line:string;shown?:boolean}){
 return <div className="mt-4">{shown&&<p className="text-[15px] font-bold text-[#8A5A00]">Here is the line that answers it. This round scores 0, but the proof step still counts toward your case.</p>}<blockquote className="mt-1 border-l-4 border-[#A0472C] bg-[#FFFDF8] px-4 py-3 font-serif text-[17px] leading-7">{displayLine(line)}</blockquote></div>;
}

// Round 2, infer: the character asks; the student finds the one line, marks its exact words if it's long, then proves it.
function InferRound({world,scene,passages,run,setting,sound,sandboxId,resume,send,onError}:RoundProps){
 const c=scene.story_mode!,q=inferQ(scene,run.state.picks),who=c.infer.character_id;
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<{hint:string;reaction:Reaction}|null>(null),[busy,setBusy]=useState(false);
 const [line,setLine]=useState(""),[accepted,setAccepted]=useState(resume?.line??""),[step,setStep]=useState<Step|null>(resume?.step?{name:resume.step,choices:resume.choices,shown:resume.shown&&resume.line?[resume.line]:null,phrase:null}:null);
 const speed=useSpeedMeta();
 async function go(input:RoundInput,elapsed=0,grace=false){
  if(busy)return;setBusy(true);
  const r=await trySend(send,onError,input,elapsed,grace);setBusy(false);
  if(!r.reply)return;
  if(r.reply.notYet){setTryNo(r.reply.notYet.tryNo);setNotYet({hint:r.reply.notYet.hint,reaction:r.reply.reaction});return}
  if(r.reply.step){const s=r.reply.step;if(s.shown?.[0])setAccepted(s.shown[0]);else if(input.kind==="confront"&&!accepted)setAccepted(input.line);setStep(s)}
 }
 if(notYet)return <><Speaker world={world} characterId={who} line={q.question} sound={false} sandboxId={sandboxId} label="Asks you"/><NotYet tryNo={tryNo} hint={notYet.hint} onTryAgain={()=>{setNotYet(null);setLine("")}} extra={notYet.reaction?<Reacts world={world} who={who} reaction={notYet.reaction} trust={run.state.trust[who]??0}/>:null}/></>;
 if(step&&accepted){
  const shown=!!step.shown;
  return <section className="mt-4" aria-labelledby="play-h">
   <h1 id="play-h" className="text-[24px] font-bold">{step.name==="phrase"?"Mark the exact words":"Prove it"}</h1>
   <Speaker world={world} characterId={who} line={q.question} sound={false} sandboxId={sandboxId} label="Asks you"/>
   {step.name==="phrase"?<PhrasePicker line={accepted} busy={busy} onLock={range=>go({kind:"confront",line:accepted,marked:range})}/>
    :<><TheLine line={accepted} shown={shown}/>{shown&&step.phrase&&<PhrasePicker line={accepted} shownRange={step.phrase}/>}<ProveIt choices={step.choices} busy={busy} onSubmit={p=>go({kind:"confront",line:accepted,prove:p})}/></>}
  </section>;
 }
 return <TimedTry key={tryNo} kind="confront" tryNo={tryNo} setting={setting} onOver={(e,g)=>go({kind:"confront",line,...speed.meta(),timeout:true},e,g)}>{t=><section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">{tryNo>1?`Try ${tryNo}`:ROUND_NAMES.confront}</h1>
  <Speaker world={world} characterId={who} line={q.question} sound={sound&&tryNo===1} sandboxId={sandboxId} label="Asks you"/>
  <TimerBar t={t} seconds={trySeconds("confront",tryNo,setting).seconds}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="confront" run={run}/>
  <p className="mt-4 text-[16px] font-semibold">Tap the one line that answers it.</p>
  <ReadingPanel glossary={world.glossary} className="mt-2 max-h-[50vh]" passages={chunks} kept={line?[line]:[]} onTap={l=>{speed.tap();if(line&&lineKey(line)!==lineKey(l.text))speed.swap();setLine(l.text)}}/>
  <div className="mt-5 flex justify-end"><button type="button" disabled={!line||busy} onClick={()=>go({kind:"confront",line,...speed.meta()},t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Lock in this line <ArrowRight size={18}/></button></div>
 </section>}</TimedTry>;
}
// The character's reaction to a try, with trust moving the same way.
function Reacts({world,who,reaction,trust}:{world:WorldPack;who:string;reaction:{line:string;trust:number};trust:number}){
 const name=world.characters.find(c=>c.id===who)?.name??"";
 return <div className="mt-3 rounded-2xl bg-[#FFFDF8] p-3"><p className="text-[16px] leading-6">{reaction.line}</p><TrustMeter name={name} value={trust} change={reaction.trust}/></div>;
}

// Round 3, catch the lie: tap the line that proves the testimony false, then say why.
function LieRound({world,scene,passages,run,setting,sound,sandboxId,resume,send,onError}:RoundProps){
 const lie=lieOf(scene,run.state.picks),clue=scene.artifacts.find(a=>a.id===lie.clue_id)!;
 const source=useMemo(()=>passages.filter(p=>clue.source_anchor.includes(p.id)),[passages,clue.source_anchor]);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<string|null>(null),[busy,setBusy]=useState(false);
 const [line,setLine]=useState(""),[accepted,setAccepted]=useState(resume?.line??""),[shownLine,setShownLine]=useState(resume?.shown&&resume.line?resume.line:""),[explain,setExplain]=useState("");
 const speed=useSpeedMeta();
 async function go(input:RoundInput,elapsed=0,grace=false){
  if(busy)return;setBusy(true);
  const r=await trySend(send,onError,input,elapsed,grace);setBusy(false);
  if(!r.reply)return;
  if(r.reply.notYet){setTryNo(r.reply.notYet.tryNo);setNotYet(r.reply.notYet.hint);return}
  if(r.reply.step){const s=r.reply.step.shown?.[0];if(s){setShownLine(s);setAccepted(s)}else if(input.kind==="lie")setAccepted(input.line)}
 }
 const testimony=<Speaker world={world} characterId={lie.character_id} line={lie.testimony} sound={sound&&tryNo===1&&!accepted} sandboxId={sandboxId} label="Testimony"/>;
 if(notYet)return <>{testimony}<NotYet tryNo={tryNo} hint={notYet} onTryAgain={()=>{setNotYet(null);setLine("")}}/></>;
 if(accepted)return <section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">{shownLine?"Here's the proof":"Lie caught"}</h1>
  {testimony}
  <TheLine line={accepted} shown={!!shownLine}/>
  <label htmlFor="lie-why" className="mt-4 block text-[16px] font-semibold">Why does this line prove it false?</label>
  <textarea id="lie-why" value={explain} onChange={e=>setExplain(e.target.value)} rows={2} maxLength={400} className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 text-[17px]" placeholder={`${world.characters.find(c=>c.id===lie.character_id)?.name??"They"} said… but the story says…`}/>
  <div className="mt-5 flex justify-end"><button type="button" disabled={!explain.trim()||busy} onClick={()=>go({kind:"lie",line:accepted,explanation:explain})} className="case-primary disabled:opacity-40">Submit <ArrowRight size={18}/></button></div>
 </section>;
 return <TimedTry key={tryNo} kind="lie" tryNo={tryNo} setting={setting} onOver={(e,g)=>go({kind:"lie",line,...speed.meta(),timeout:true},e,g)}>{t=><section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">{tryNo>1?`Try ${tryNo}`:"Catch the lie"}</h1>
  {testimony}
  <TimerBar t={t} seconds={trySeconds("lie",tryNo,setting).seconds}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="lie" run={run}/>
  <p className="mt-4 text-[16px] font-semibold">One thing is false. Tap the line in the story that proves it.</p>
  <ReadingPanel glossary={world.glossary} className="mt-3 max-h-[45vh]" passages={source} kept={line?[line]:[]} onTap={l=>{speed.tap();if(line&&lineKey(line)!==lineKey(l.text))speed.swap();setLine(l.text)}}/>
  <div className="mt-5 flex justify-end"><button type="button" disabled={!line||busy} onClick={()=>go({kind:"lie",line,...speed.meta()},t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Lock in this line <ArrowRight size={18}/></button></div>
 </section>}</TimedTry>;
}

// Round 4, build the case: a theory and two lines that support it, from the pouch or the reading.
function CallRound({world,scene,passages,run,setting,resume,send,onError}:RoundProps){
 const q=callQ(scene,run.state.picks),c=scene.story_mode!;
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [theory,setTheory]=useState(""),[pins,setPins]=useState<string[]>([]);
 const [tryNo,setTryNo]=useState(resume?.tryNo??1),[notYet,setNotYet]=useState<string|null>(null),[busy,setBusy]=useState(false);
 const speed=useSpeedMeta();
 const togglePin=(line:string)=>{speed.tap();setPins(p=>p.some(x=>lineKey(x)===lineKey(line))?(speed.swap(),p.filter(x=>lineKey(x)!==lineKey(line))):p.length>=2?(speed.swap(),[p[1],line]):[...p,line])};
 async function go(elapsed:number,grace:boolean,timeout=false){
  if(busy)return;setBusy(true);
  const r=await trySend(send,onError,{kind:"call",theoryId:theory,pins,...speed.meta(),...(timeout?{timeout:true}:{})},elapsed,grace);setBusy(false);
  if(r.reply?.notYet){setTryNo(r.reply.notYet.tryNo);setNotYet(r.reply.notYet.hint)}
 }
 if(notYet)return <NotYet tryNo={tryNo} hint={notYet} onTryAgain={()=>{setNotYet(null);setPins([])}}/>;
 return <TimedTry key={tryNo} kind="call" tryNo={tryNo} setting={setting} onOver={(e,g)=>go(e,g,true)}>{t=><section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">{tryNo>1?`Try ${tryNo}`:"Build the case"}</h1>
  <p className="mt-2 text-[19px] font-semibold leading-7">{q.question}</p>
  <TimerBar t={t} seconds={trySeconds("call",tryNo,setting).seconds}/>
  <LanternNote world={world} passages={passages} scene={scene} kind="call" run={run}/>
  <fieldset className="mt-4"><legend className="text-[16px] font-semibold">Your theory</legend>
   <div className="mt-2 grid gap-2 sm:grid-cols-3">{q.theories.map(th=><button key={th.id} type="button" aria-pressed={theory===th.id} onClick={()=>setTheory(th.id)} className={`rounded-2xl p-4 text-left ${theory===th.id?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"}`}><span className="block text-[17px] font-bold">{th.name}</span><span className="mt-1 block text-[14px] leading-5 opacity-80">{th.description}</span></button>)}</div></fieldset>
  <Pouch pouch={run.state.pouch} picked={pins} onPick={togglePin} max={2}/>
  <details className="mt-3 rounded-2xl bg-[#FFFDF8] p-3 ring-1 ring-[#E4DCCB]" open={run.state.pouch.length<2}><summary className="cursor-pointer text-[15px] font-semibold text-[#8A3B23]">Or pin a line from the reading</summary>
   <ReadingPanel glossary={world.glossary} className="mt-2 max-h-[45vh] shadow-none" passages={chunks} kept={pins} onTap={l=>togglePin(l.text)}/></details>
  <div className="mt-5 flex justify-end"><button type="button" disabled={!theory||pins.length<2||busy} onClick={()=>go(t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Lock in my case <ArrowRight size={18}/></button></div>
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
 return <section className="mt-5 rounded-3xl bg-[#2A2620] p-5 text-[#FFFDF8]" aria-labelledby="board-h">
  <h2 id="board-h" className="flex items-center gap-2 text-[18px] font-bold"><Trophy size={18} className="text-[#F3C9B2]"/>{board.kind==="squad"?"Squad leaderboard":"Leaderboard"} · top 5</h2>
  <ol className="mt-3 space-y-1.5">{board.top.map(r=><li key={r.rank} className={`flex items-center justify-between rounded-xl px-3 py-2 ${r.me?"bg-[#A0472C]":"bg-white/5"}`}><span className="flex items-center gap-3"><span className="w-6 text-right font-bold tabular-nums">{r.rank}</span><span className="font-semibold">{r.name}{r.me?" (you)":""}</span></span><span className="tabular-nums">{r.score}</span></li>)}</ol>
  {board.me&&board.me.rank>5&&<p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[16px]">You're <b>#{board.me.rank}</b> with {board.me.score}{board.me.movement>0?` · up ${board.me.movement} spot${board.me.movement===1?"":"s"}`:""}</p>}
  {board.me&&board.me.rank<=5&&board.me.movement>0&&<p className="mt-3 text-[15px] text-[#F3C9B2]">Up {board.me.movement} spot{board.me.movement===1?"":"s"}!</p>}
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
  <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Round {r.round} · {ROUND_NAMES[r.kind]}</p>
  {ok&&r.points===0?<h1 id="res-h" className="mt-1 text-[32px] font-bold leading-tight">Found it</h1>
   :ok?<h1 id="res-h" className="mt-1 text-[40px] font-bold leading-none tabular-nums">+{r.points}</h1>
   :<h1 id="res-h" className="mt-1 text-[32px] font-bold leading-tight">Here's what proves it</h1>}
  <p className="mt-2 text-[17px]">{ok&&r.points===0?`${r.detail} on try ${r.tries+1}. Points come on the first two tries.`:ok?`${r.detail}${r.tries?` · found on try ${r.tries+1}`:""}${r.grace?" · half points after time":""}`:r.points>0?`+${r.points} for the lines you found. The rest are shown below.`:"0 points this round. Read the line below: it's the proof."}</p>
  {ok&&<ul className="mt-3 flex flex-wrap gap-2 text-[14px] font-semibold">
   <li className="rounded-full bg-[#EFE8D8] px-3 py-1">Proof {r.base}</li>
   {r.multiplier>1&&<li className="inline-flex items-center gap-1 rounded-full bg-[#A0472C] px-3 py-1 text-white"><Flame size={14}/>Streak x{r.multiplier}</li>}
   {r.doubled&&<li className="rounded-full bg-[#2A2620] px-3 py-1 text-white">Doubled</li>}
   {r.coinsEarned>0&&<li className="inline-flex items-center gap-1 rounded-full bg-[#F4E1D6] px-3 py-1 text-[#8A3B23]"><Coins size={14}/>+{r.coinsEarned} coin{r.coinsEarned===1?"":"s"}</li>}
  </ul>}
  {!!r.lost&&<p className="mt-3 rounded-2xl bg-[#FFF4D6] px-4 py-3 text-[16px] font-semibold text-[#3D2E0A]">Double down: you bet {r.bet} and lost {r.lost}.</p>}
  {r.streak>0?<p className="mt-3 flex items-center gap-2 text-[16px]"><Flame size={18} className="text-[#A0472C]"/>Streak: {r.streak} round{r.streak===1?"":"s"} in a row right on the first try</p>
   :<p className="mt-3 text-[16px]">Streak reset: streaks count rounds right on the first try.</p>}
  {result.reaction&&<Reacts world={world} who={who} reaction={result.reaction} trust={trust}/>}
  {shownLines.length>0&&(r.kind==="read"||r.kind==="call")&&<div className="mt-4 rounded-3xl border-2 border-[#C98A12] bg-[#FFF4D6] p-4"><p className="text-[16px] font-bold">Shown answer{shownLines.length>1?"s":""}: tap each line to keep it</p>
   <ul className="mt-2 space-y-2">{shownLines.map(l=>{const on=kept.includes(l);return <li key={l}><button type="button" aria-pressed={on} onClick={()=>setKept(k=>on?k.filter(x=>x!==l):[...k,l])} className={`w-full rounded-2xl px-4 py-3 text-left font-serif text-[16px] leading-6 ${on?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#C98A12]"}`}>{on&&<Check size={16} className="mr-1 inline"/>}{displayLine(l)}</button></li>})}</ul></div>}
  {r.proof.length>0&&ok&&<div className="mt-4"><p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">{r.kind==="read"?"Your pouch":"Your proof"}</p>{r.proof.map(p=><blockquote key={p} className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[15px] italic leading-6">“{p.replace(/\s+/g," ")}”</blockquote>)}</div>}
  <PointsMeter total={run.total} max={run.goal.max}/>
  <BoardView board={board} mode={mode}/>
  <section className="mt-5 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]" aria-labelledby="pulse-h">
   <h2 id="pulse-h" className="text-[18px] font-bold">{run.scope==="class"?"Class pulse":"Today's players"}</h2>
   {result.pulse.length?<ul className="mt-3 space-y-3">{result.pulse.map(p=><li key={p.key}><div className="flex justify-between gap-3 text-[15px]"><span className="font-semibold">{p.label}</span><span className="tabular-nums">{p.pct}%</span></div><div aria-hidden className="mt-1 h-2.5 rounded-full bg-[#E4DCCB]"><div className="h-full rounded-full bg-[#A0472C]" style={{width:`${p.pct}%`}}/></div>{p.strongest&&<p className="mt-1 font-serif text-[14px] italic leading-5 text-[#4A4438]">Strongest proof: “{p.strongest.replace(/\s+/g," ").slice(0,160)}{p.strongest.length>160?"…":""}”</p>}</li>)}</ul>
    :<p className="mt-2 text-[15px] text-[#6B6457]">Percentages show once 5 players have answered{result.answered?` (${result.answered} so far)`:""}.</p>}
  </section>
  <div className="mt-6 flex flex-col items-end gap-1"><button type="button" disabled={mustKeep} onClick={onNext} className="case-primary min-h-[58px] text-[18px] disabled:opacity-40">{run.finished?"See your scene results":"Next round"} <ArrowRight size={20}/></button>{mustKeep&&<p className="text-[14px] text-[#6B6457]">Keep each shown line to continue.</p>}</div>
 </section>;
}
function TrustMeter({name,value,change}:{name:string;value:number;change:number}){
 const pct=Math.round(((Math.max(-3,Math.min(3,value))+3)/6)*100);
 return <div className="mt-3"><p className="text-[14px] font-semibold">Trust with {name}: <span className={change>0?"text-[#2F6B3A]":change<0?"text-[#A33B20]":""}>{change>0?`up ${change}`:change<0?`down ${-change}`:"no change"}</span></p>
  <div className="mt-1 h-2.5 rounded-full bg-[#E4DCCB]" role="meter" aria-valuemin={-3} aria-valuemax={3} aria-valuenow={value} aria-label={`Trust with ${name}`}><div className="h-full rounded-full bg-[#2A2620]" style={{width:`${pct}%`}}/></div></div>;
}

// ---------- Scene cleared: the total against the points possible, and the goal level reached ----------
function Cleared({run,mode,headers,sandboxId,onNext,onAgain,onLeads}:{run:PublicRun;mode:"individual"|"squad"|"off";headers:Record<string,string>;sandboxId:string;onNext:()=>void;onAgain:()=>void;onLeads?:()=>void}){
 const [board,setBoard]=useState<Board>(null);
 useEffect(()=>{if(mode==="off")return;fetch(`/api/story/board?runId=${run.id}&sandboxId=${sandboxId}`,{headers,cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>j&&setBoard(j.board)).catch(()=>{})},[run.id,headers,sandboxId,mode]);
 const level=levelFor(run.total,run.goal.max),next=LEVELS.find(l=>run.total<Math.ceil((l.pct/100)*run.goal.max));
 return <section className="mt-6" aria-labelledby="clear-h">
  <div className="rounded-3xl bg-[#2A2620] p-6 text-center text-[#FFFDF8]"><p className="text-[14px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Scene cleared</p><h1 id="clear-h" className="mt-2 text-[34px] font-bold">{level?level.name:"Case still open"}</h1><p className="mt-1 text-[22px] font-bold tabular-nums">{run.total.toLocaleString()} / {run.goal.max.toLocaleString()} points{run.total>run.goal.max?" · Bonus":""}</p>
   {next&&<p className="mt-1 text-[15px] text-[#E8DDCB]">{next.name} takes {Math.ceil((next.pct/100)*run.goal.max).toLocaleString()}.</p>}
   <dl className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px]">Best streak</dt><dd className="text-[22px] font-bold">{run.state.bestStreak}</dd></div><div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px]">Rank</dt><dd className="text-[22px] font-bold">{board?.me?`#${board.me.rank}`:"·"}</dd></div><div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px]">Coins left</dt><dd className="text-[22px] font-bold">{run.state.coins}</dd></div></dl></div>
  <div className="mt-5"><h2 className="text-[18px] font-bold">Your Evidence pouch</h2>{run.state.pouch.length?run.state.pouch.map(p=><blockquote key={p} className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[16px] italic leading-7">“{p.replace(/\s+/g," ")}”</blockquote>):<p className="mt-1 text-[15px] text-[#6B6457]">No lines kept this time.</p>}</div>
  <BoardView board={board} mode={mode}/>
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={onAgain} className="inline-flex min-h-11 items-center gap-2 text-[15px] text-[#6B6457] underline underline-offset-4"><RotateCcw size={16}/>Play this scene again</button>{onLeads?<button type="button" onClick={onLeads} className="case-primary min-h-[58px] text-[18px]">Follow your mission leads <ArrowRight size={20}/></button>:<button type="button" onClick={onNext} className="case-primary min-h-[58px] text-[18px]">On to the next scene <ArrowRight size={20}/></button>}</div>
 </section>;
}
