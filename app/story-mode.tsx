"use client";
// Story Mode (solo): the student lives inside the scene as their role and plays four timed, scored rounds: read and
// notice, something happens to you, catch the lie, make your call. Each round: a ready card (power-ups, Relaxed timer),
// a 3-second countdown, the challenge with a timer bar, then results (points, streak, coins, leaderboard, class pulse).
// One screen flow, one clear action at a time. The server scores every round (lib/story-server.ts); the rules are in
// lib/story-mode.ts and the content in the scene's `story_mode` block.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,BookOpen,Coins,Flame,RotateCcw,Timer,Trophy,Volume2,VolumeX,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {COUNTDOWN_SECONDS,GRACE_SECONDS,POUCH_MAX,POWER_UPS,ROUNDS,ROUND_NAMES,SECONDS,lanternParagraph,phaseSeconds,timeAnnouncement,type PowerUp,type RoundInput,type RoundKind,type RoundRecord,type RunState,type Scene,type TimeSetting} from "@/lib/story-mode";
import {contentNotes} from "@/lib/content-notes";
import {tryLine} from "@/lib/lies";
import {narrationFile} from "@/lib/narration";
import {ReadingPanel} from "./reading-panel";
import {paragraphLabel} from "@/lib/clue-game";
import {ContentNote} from "./content-note";
import {AmbientPlayer,Portrait,useCharacterVoice,useSoundPref} from "./game-feel";
import {browserNarration,soundChannel} from "./sound-player";
import {playNarration} from "@/lib/narration";
import {focusScreenTop} from "./screen-focus";
import {getBrowserSupabase} from "@/lib/supabase-browser";

type PublicRun={id:string;topic:string;nickname:string;state:RunState;total:number;bestTotal:number;finished:boolean;timeSetting:TimeSetting;scope:"class"|"demo"};
type Board={kind:"individual"|"squad";top:{rank:number;name:string;score:number;me:boolean}[];me:{rank:number;score:number;movement:number}|null;players:number}|null;
type Pulse={key:string;label:string;pct:number;strongest:string}[];
type Result={record:RoundRecord;reaction:{line:string;trust:number}|null;run:PublicRun;board:Board;pulse:Pulse};
type Stage="loading"|"ready"|"countdown"|"play"|"results"|"cleared"|"error";

// Sound cues: short and quiet, only when Sound is on.
function cue(on:boolean,name:"tick"|"chime"|"streak"|"reveal"){if(!on)return;try{const a=new Audio(`/sounds/story/${name}.mp3`);a.volume=0.35;a.play().catch(()=>{})}catch{}}
const reducedMotion=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// startAt: open at a later round ("Catch the lie" on the home page); onJumped: called once the run has opened there.
// onUnavailable: Story Mode's tables aren't set up (or the server can't reach them), so the scene opens in the Case
// file view instead, with no error screen.
export function StoryMode({world,scene,sceneIndex,passages,demo,setDemo,onCleared,onCaseFile,startAt,onJumped,onUnavailable}:{world:WorldPack;scene:Scene;sceneIndex:number;passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onCleared:()=>void;onCaseFile?:()=>void;startAt?:RoundKind;onJumped?:()=>void;onUnavailable:()=>void}){
 const content=scene.story_mode!;
 const headers=useMemo(()=>({"Content-Type":"application/json",...(demo.classAuth?{"x-class-token":demo.classAuth.token}:{})}),[demo.classAuth]);
 const [run,setRun]=useState<PublicRun|null>(null),[mode,setMode]=useState<"individual"|"squad"|"off">("individual");
 const [stage,setStage]=useState<Stage>("loading"),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [result,setResult]=useState<Result|null>(null),[relaxed,setRelaxed]=useState(false);
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
   setRun(j.run);setMode(j.leaderboard);setResult(null);setStage(j.run.finished?"cleared":"ready")}
  catch(e){const status=(e as {status?:number}).status;
   // No answer, or a server error: open the Case file view rather than an error screen. A 4xx says what to do.
   if(!status||status>=500){callbacks.current.onUnavailable();return}
   setError((e as Error).message);setStage("error")}
 },[post,world.id,scene.id]);
 useEffect(()=>{start()},[start]);
 const setting:TimeSetting=run?(relaxed&&(run.timeSetting==="1"||run.timeSetting==="1.5")?"2":run.timeSetting):"1";

 async function submit(input:RoundInput,elapsedMs:number,grace:boolean){
  if(!run)return;
  try{
   const j:Result=await post("/api/story/round",{runId:run.id,round:round+1,input,elapsedMs,grace,relaxed,previousRank:lastRank.current});
   setResult(j);setRun(j.run);if(j.board?.me)lastRank.current=j.board.me.rank;
   setStage("results");
   cue(soundOn,j.record.valid?"chime":"reveal");
   if(j.record.valid&&j.record.streak>=2)setTimeout(()=>cue(soundOn,"streak"),500);
   setTimeout(()=>cue(soundOn,"reveal"),reducedMotion()?0:900);
   // Saved with progress: the run's score, pouch and trust; a caught lie also counts for the scene's lie clue.
   setDemo(d=>({...d,story:{...(d.story??{}),[scene.id]:{runId:j.run.id,total:j.run.total,bestStreak:j.run.state.bestStreak,trust:j.run.state.trust,pouch:j.run.state.pouch,cleared:j.run.finished}},
    ...(input.kind==="lie"&&j.record.valid&&scene.lie?{lies:{...(d.lies??{}),[scene.id]:{clue_id:scene.lie.clue_id,caught:true,misses:0,caught_at:new Date().toISOString()}},...(input.explanation.trim()?{artifactAnswers:{...d.artifactAnswers,[scene.lie.clue_id]:{notice:j.record.proof[0]??input.line,interpret:input.explanation.trim(),craft:"contradicts",technique:"",revisions:d.artifactAnswers[scene.lie.clue_id]?.revisions??[]}}}:{})}:{})}));
  }catch(e){setNotice((e as Error).message)}
 }
 async function buy(p:PowerUp){if(!run)return;setNotice("");try{const j=await post("/api/story/buy",{runId:run.id,powerUp:p});setRun(j.run);if(p==="second-look")replayLast()}catch(e){setNotice((e as Error).message)}}
 // Second look: replays the last part of the reading.
 const replayLast=useCallback(()=>{const pid=content.read.chunks[content.read.chunks.length-1];if(!soundOn)return;playNarration(soundChannel,`${scene.id}:story`,[{id:pid,text:passages.find(p=>p.id===pid)?.text??"",src:narrationFile(world.id,scene.id,pid)}],browserNarration)},[content.read.chunks,soundOn,scene.id,passages,world.id]);

 const header=<div className="flex flex-wrap items-center justify-between gap-2">
  <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{world.title} · Scene {sceneIndex+1} · Story Mode</p>
  <div className="flex items-center gap-2">
   {run&&<span className="inline-flex items-center gap-1 rounded-full bg-[#2A2620] px-3 py-1 text-[14px] font-bold tabular-nums text-white"><Trophy size={14}/>{run.total}</span>}
   {run&&<span className="inline-flex items-center gap-1 rounded-full bg-[#F4E1D6] px-3 py-1 text-[14px] font-bold tabular-nums text-[#8A3B23]" title="Lantern coins"><Coins size={14}/>{run.state.coins}<span className="sr-only"> Lantern coins</span></span>}
   <button type="button" onClick={toggleSound} aria-pressed={soundOn} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[#EFE8D8] px-3 text-[14px] font-semibold">{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>}Sound {soundOn?"on":"off"}</button>
  </div>
 </div>;
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-5 md:px-8">
  <AmbientPlayer src={scene.ambient_audio} on={ambientOn&&soundOn} showing={stage==="play"}/>
  {header}
  {notice&&<p role="alert" className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{notice}</p>}
  {stage==="loading"&&<p className="mt-10 text-center text-[17px] text-[#6B6457]">Opening the scene…</p>}
  {stage==="error"&&<div className="mt-8 rounded-3xl bg-[#FFFDF8] p-6"><h1 className="text-[24px] font-bold">Story Mode can't open right now</h1><p className="mt-2 text-[16px]">{error}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>start()} className="case-primary">Try again</button>{onCaseFile&&<button type="button" onClick={onCaseFile} className="case-secondary">Open the Case file</button>}</div></div>}
  {stage==="ready"&&run&&kind&&<ReadyCard world={world} scene={scene} kind={kind} round={round} run={run} relaxed={relaxed} setRelaxed={setRelaxed} canRelax={run.timeSetting==="1"||run.timeSetting==="1.5"} onBuy={buy} onStart={()=>{setNotice("");setStage("countdown")}} onCaseFile={round===0?onCaseFile:undefined}/>}
  {stage==="countdown"&&kind&&<Countdown kind={kind} round={round} sound={soundOn} onDone={()=>setStage("play")}/>}
  {stage==="play"&&run&&kind&&<RoundPlay key={round} world={world} scene={scene} passages={passages} kind={kind} run={run} setting={setting} sound={soundOn} sandboxId={demo.id} onSubmit={submit}/>}
  {stage==="results"&&result&&run&&<Results world={world} scene={scene} result={result} mode={mode} run={run} headers={headers} sandboxId={demo.id} onNext={()=>{setResult(null);setStage(run.finished?"cleared":"ready")}}/>}
  {stage==="cleared"&&run&&<Cleared run={run} mode={mode} headers={headers} sandboxId={demo.id} onNext={onCleared} onAgain={()=>start(true)}/>}
 </div>;
}

// ---------- Ready card: what this round is, power-ups, Relaxed timer, Start ----------
const ROUND_HELP:Record<RoundKind,string>={read:"Listen to the story and tap the lines that answer the question. Your Evidence pouch holds 3, so choose carefully.",confront:"Someone confronts you. Pick what you do, then back it up with one line from your pouch or the passage.",lie:"A witness gives testimony. One thing is false. Tap the line that proves it, then say why in one sentence.",call:"Answer the big question. Pick a theory and pin 2 lines from your pouch that support it."};
function ReadyCard({world,scene,kind,round,run,relaxed,setRelaxed,canRelax,onBuy,onStart,onCaseFile}:{world:WorldPack;scene:Scene;kind:RoundKind;round:number;run:PublicRun;relaxed:boolean;setRelaxed:(v:boolean)=>void;canRelax:boolean;onBuy:(p:PowerUp)=>void;onStart:()=>void;onCaseFile?:()=>void}){
 const role=world.student_role;const s=run.state;
 const usable=(p:PowerUp)=>p==="lantern"?kind==="confront"||kind==="lie":p==="second-look"?kind!=="read":true;
 return <section className="mt-5" aria-labelledby="ready-h">
  {round===(s.skipped??0)&&<div className="overflow-hidden rounded-3xl bg-[#2A2620] text-[#FFFDF8]"><div className="case-art aspect-[16/7]" role="img" aria-label={`The scene: ${scene.id.replace(/-/g," ")}`} style={{backgroundImage:`url('${scene.background_image}')`}}/><div className="p-5">{role&&<p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">You are {role.name.replace(/^The /,"the ")}</p>}<p className="mt-1 text-[17px] leading-7">{scene.story_mode!.intro}</p>{round>0&&<p className="mt-2 text-[15px] text-[#F3C9B2]">You're starting at round {round+1}. Play the whole scene any time with "Play this scene again" at the end.</p>}</div></div>}
  <p className="mt-5 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Round {round+1} of {ROUNDS.length}</p>
  <h1 id="ready-h" className="mt-1 text-[30px] font-bold leading-tight">{ROUND_NAMES[kind]}</h1>
  {kind==="read"&&<Focus text={scene.story_mode!.read.focus}/>}
  <p className="mt-2 text-[17px] leading-7 text-[#4A4438]">{ROUND_HELP[kind]}</p>
  {round>0&&<div className="mt-5 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
   <h2 className="flex items-center gap-2 text-[18px] font-bold"><Coins size={18} className="text-[#A0472C]"/>Power-ups <span className="text-[15px] font-normal text-[#6B6457]">· {s.coins} coin{s.coins===1?"":"s"}</span></h2>
   <ul className="mt-3 grid gap-2 sm:grid-cols-3">{(Object.keys(POWER_UPS) as PowerUp[]).map(p=>{const on=(p==="lantern"&&s.lantern)||(p==="double-down"&&s.doubleDown);const can=!on&&s.coins>=POWER_UPS[p].cost&&usable(p);
    return <li key={p}><button type="button" aria-disabled={!can} onClick={()=>can&&onBuy(p)} aria-pressed={on} className={`flex h-full w-full flex-col rounded-2xl p-3 text-left ${on?"bg-[#2A2620] text-white":can?"bg-[#F4E1D6] hover:bg-[#EDD3C4]":"bg-[#EFE8D8] text-[#8B8478]"}`}><span className="text-[16px] font-bold">{POWER_UPS[p].name} · {POWER_UPS[p].cost}</span><span className="mt-1 text-[13px] leading-5">{on?"Ready for this round.":!usable(p)?"Not used in this round.":POWER_UPS[p].what}</span></button></li>})}</ul>
  </div>}
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
   {canRelax?<label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-[16px]"><input type="checkbox" checked={relaxed} onChange={e=>setRelaxed(e.target.checked)} className="h-5 w-5 accent-[#A0472C]"/>Relaxed timer (2x time)</label>:<p className="text-[15px] text-[#6B6457]">{run.timeSetting==="untimed"?"No timer for you: take the time you need.":"Your teacher gave you extra time."}</p>}
   <button type="button" onClick={onStart} className="case-primary min-h-[58px] text-[18px]">Start round {round+1} <ArrowRight size={20}/></button>
  </div>
  {onCaseFile&&<p className="mt-6 text-[14px] text-[#6B6457]">Teachers: <button type="button" onClick={onCaseFile} className="font-semibold text-[#8A3B23] underline underline-offset-4">open the Case file view</button> instead.</p>}
 </section>;
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

// ---------- The round timer: counts down, pauses when the page is hidden (or a content note is open), then a
// 20-second grace period for half points. Announced to screen readers at 30, 10 and 5 seconds left only. ----------
function useRoundTimer(seconds:number|null,pausedByNote:boolean,onOver:()=>void){
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
    if(e>=(seconds+GRACE_SECONDS)*1000&&!fired.current){fired.current=true;over.current()}}},250);
  return()=>{clearInterval(t);acc.current+=performance.now()-startRef.current};
 },[paused,seconds]);
 const left=seconds===null?null:Math.max(0,seconds-elapsed/1000);
 const grace=seconds!==null&&elapsed>=seconds*1000;
 const graceLeft=grace&&seconds!==null?Math.max(0,seconds+GRACE_SECONDS-elapsed/1000):0;
 return {elapsed,left,grace,graceLeft,paused,announce};
}
function TimerBar({t,seconds}:{t:ReturnType<typeof useRoundTimer>;seconds:number|null}){
 if(seconds===null)return <p className="mt-3 flex items-center gap-2 text-[15px] text-[#6B6457]"><Timer size={16}/>No timer. Take the time you need.</p>;
 const share=t.grace?t.graceLeft/GRACE_SECONDS:(t.left??0)/seconds;
 const label=t.grace?`${Math.ceil(t.graceLeft)}s for half points`:`${Math.ceil(t.left??0)}s left`;
 return <div className="mt-3">
  <div className="flex items-center justify-between text-[14px] font-semibold"><span className={t.grace?"text-[#A33B20]":"text-[#4A4438]"}>{t.grace?"Time! You can still add proof for half points":t.paused?"Paused":"Time"}</span><span className="tabular-nums" aria-hidden>{label}</span></div>
  <div aria-hidden className="mt-1 h-3 overflow-hidden rounded-full bg-[#E4DCCB]"><div className={`h-full rounded-full ${t.grace?"bg-[#A33B20]":"bg-[#A0472C]"}`} style={{width:`${Math.max(0,Math.min(1,share))*100}%`}}/></div>
  <p className="sr-only" aria-live="polite">{t.announce}{t.grace?" Time! You can still add proof for half points.":""}</p>
 </div>;
}

// ---------- The four rounds ----------
function RoundPlay({world,scene,passages,kind,run,setting,sound,sandboxId,onSubmit}:{world:WorldPack;scene:Scene;passages:SourcePassage[];kind:RoundKind;run:PublicRun;setting:TimeSetting;sound:boolean;sandboxId:string;onSubmit:(input:RoundInput,elapsedMs:number,grace:boolean)=>void}){
 if(kind==="read")return <ReadRound world={world} scene={scene} passages={passages} setting={setting} sound={sound} onSubmit={onSubmit}/>;
 if(kind==="confront")return <ConfrontRound world={world} scene={scene} passages={passages} run={run} setting={setting} sound={sound} sandboxId={sandboxId} onSubmit={onSubmit}/>;
 if(kind==="lie")return <LieRound world={world} scene={scene} passages={passages} run={run} setting={setting} sound={sound} sandboxId={sandboxId} onSubmit={onSubmit}/>;
 return <CallRound scene={scene} run={run} setting={setting} onSubmit={onSubmit}/>;
}
const lineKey=(t:string)=>t.replace(/\s+/g," ").trim();

function ReadRound({world,scene,passages,setting,sound,onSubmit}:{world:WorldPack;scene:Scene;passages:SourcePassage[];setting:TimeSetting;sound:boolean;onSubmit:(i:RoundInput,e:number,g:boolean)=>void}){
 const c=scene.story_mode!,notes=useMemo(()=>contentNotes(world),[world]);
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const [shown,setShown]=useState(1),[pouch,setPouch]=useState<string[]>([]),[full,setFull]=useState(false);
 // A paragraph with a content note shows the note first, with the timer paused until the student continues.
 const [noteSeen,setNoteSeen]=useState<Record<string,boolean>>({});
 const current=chunks[shown-1],noteOpen=!!current&&notes.has(current.id)&&!noteSeen[current.id];
 const seconds=phaseSeconds(SECONDS.read,setting);
 const pouchRef=useRef(pouch);pouchRef.current=pouch;
 const sent=useRef(false);
 const send=(e:number,g:boolean)=>{if(sent.current)return;sent.current=true;soundChannel.stop();onSubmit({kind:"read",pouch:pouchRef.current},e,g)};
 const t=useRoundTimer(seconds,noteOpen,()=>send((seconds!+GRACE_SECONDS)*1000,true));
 // Each part is narrated when it appears (ambient dips while it plays).
 useEffect(()=>{if(!current||noteOpen||!sound)return;playNarration(soundChannel,`${scene.id}:story`,[{id:current.id,text:current.text,src:narrationFile(world.id,scene.id,current.id)}],browserNarration);return()=>soundChannel.stop()},[current,noteOpen,sound,scene.id,world.id]);
 function tap(line:{text:string}){const k=lineKey(line.text);setFull(false);setPouch(p=>p.some(x=>lineKey(x)===k)?p.filter(x=>lineKey(x)!==k):p.length>=POUCH_MAX?(setFull(true),p):[...p,line.text])}
 return <section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">Read and notice</h1>
  <Focus text={c.read.focus}/>
  <p className="mt-2 text-[16px] text-[#4A4438]">{c.read.prompt}</p>
  <TimerBar t={t} seconds={seconds}/>
  <Pouch pouch={pouch} onRemove={t=>tap({text:t})} full={full}/>
  <div className="case-art mt-4 aspect-[16/6] rounded-2xl" role="img" aria-label="The scene" style={{backgroundImage:`url('${scene.background_image}')`}}/>
  <div className="mt-4 space-y-4">{chunks.slice(0,shown).map((p,i)=>i===shown-1&&noteOpen?<div key={p.id}><ContentNote text={notes.get(p.id)!}/><button type="button" onClick={()=>setNoteSeen(s=>({...s,[p.id]:true}))} className="case-secondary mt-3">Continue reading</button></div>
   :<div key={p.id} className="rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Part {i+1} of {chunks.length}</p><ReadingPanel passages={[p]} kept={pouch} onTap={tap} className="shadow-none"/></div>)}</div>
  <div className="mt-5 flex flex-wrap justify-end gap-3">
   {shown<chunks.length&&<button type="button" onClick={()=>setShown(n=>n+1)} disabled={noteOpen} className="case-secondary">Next part <ArrowRight size={18}/></button>}
   <button type="button" onClick={()=>send(t.elapsed,t.grace)} className="case-primary">{pouch.length?`I'm done: lock in ${pouch.length} line${pouch.length===1?"":"s"}`:"I'm done reading"}</button>
  </div>
 </section>;
}

function Pouch({pouch,onRemove,full,picked,onPick,max}:{pouch:string[];onRemove?:(t:string)=>void;full?:boolean;picked?:string[];onPick?:(t:string)=>void;max?:number}){
 return <div className="mt-4 rounded-2xl border-2 border-dashed border-[#C9B9A0] bg-[#FBF7EE] p-3" aria-live="polite">
  <p className="flex items-center gap-2 text-[14px] font-bold text-[#2A2620]"><BookOpen size={16} className="text-[#A0472C]"/>Evidence pouch · {pouch.length} of {POUCH_MAX}{onPick&&max?` · pin ${max}`:""}</p>
  {!pouch.length&&<p className="mt-1 text-[14px] text-[#6B6457]">Empty. Tap a line in the story to keep it.</p>}
  <ul className="mt-2 space-y-2">{pouch.map(t=>{const on=!!picked?.some(x=>lineKey(x)===lineKey(t));return <li key={t} className="flex items-start gap-2">
   {onPick?<button type="button" aria-pressed={on} onClick={()=>onPick(t)} className={`flex-1 rounded-xl px-3 py-2 text-left font-serif text-[15px] leading-6 ${on?"bg-[#A0472C] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"}`}>“{t.replace(/\s+/g," ")}”</button>
   :<p className="flex-1 font-serif text-[15px] leading-6">“{t.replace(/\s+/g," ")}”</p>}
   {onRemove&&<button type="button" onClick={()=>onRemove(t)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-[#EFE8D8]" aria-label="Take this line out of your pouch"><X size={16}/></button>}
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

function ConfrontRound({world,scene,passages,run,setting,sound,sandboxId,onSubmit}:{world:WorldPack;scene:Scene;passages:SourcePassage[];run:PublicRun;setting:TimeSetting;sound:boolean;sandboxId:string;onSubmit:(i:RoundInput,e:number,g:boolean)=>void}){
 const c=scene.story_mode!;const [action,setAction]=useState(""),[proof,setProof]=useState("");
 const choiceSeconds=phaseSeconds(SECONDS.choice,setting),proofSeconds=phaseSeconds(SECONDS.proof,setting);
 const sent=useRef(false),choseLate=useRef(false);
 const send=(e:number,g:boolean,a=action,p=proof)=>{if(sent.current)return;sent.current=true;onSubmit({kind:"confront",actionId:a,proof:p},e,g||choseLate.current)};
 const choiceT=useRoundTimer(action?null:choiceSeconds,false,()=>send(0,true,"",""));
 const proofT=useRoundTimer(action?proofSeconds:null,!action,()=>send((proofSeconds!+GRACE_SECONDS)*1000,true));
 const chunks=useMemo(()=>c.read.chunks.map(id=>passages.find(p=>p.id===id)).filter(Boolean) as SourcePassage[],[c.read.chunks,passages]);
 const lantern=run.state.lantern?lanternParagraph(world,passages,scene,"confront",action):null;
 return <section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">Something happens to you</h1>
  <Speaker world={world} characterId={c.confront.character_id} line={c.confront.line} sound={sound} sandboxId={sandboxId} label="Confronts you"/>
  {!action?<>
   <TimerBar t={choiceT} seconds={choiceSeconds}/>
   <h2 className="mt-5 text-[18px] font-bold">What do you do?</h2>
   <div className="mt-2 grid gap-2">{c.confront.actions.map(a=><button key={a.id} type="button" onClick={()=>{choseLate.current=choiceT.grace;setAction(a.id)}} className="min-h-[56px] rounded-2xl bg-[#A0472C] px-5 py-3 text-left text-[17px] font-semibold text-white hover:bg-[#8A3B23]">{a.label}</button>)}</div>
  </>:<>
   <p className="mt-4 rounded-2xl bg-[#F4E1D6] px-4 py-3 text-[16px]"><b>You:</b> {c.confront.actions.find(a=>a.id===action)?.label}</p>
   <TimerBar t={proofT} seconds={proofSeconds}/>
   <h2 className="mt-5 text-[18px] font-bold">Back it up with one line</h2>
   <Pouch pouch={run.state.pouch} picked={proof?[proof]:[]} onPick={t=>setProof(t)}/>
   <details className="mt-3 rounded-2xl bg-[#FFFDF8] p-3 ring-1 ring-[#E4DCCB]" open={!run.state.pouch.length||!!lantern}><summary className="cursor-pointer text-[15px] font-semibold text-[#8A3B23]">Or pick a line from the passage{lantern?` (your Lantern points to ${paragraphLabel(lantern)})`:""}</summary>
    <ReadingPanel className="mt-2 max-h-[45vh] shadow-none" passages={chunks} kept={proof?[proof]:[]} onTap={l=>setProof(l.text)}/></details>
   <div className="mt-5 flex justify-end"><button type="button" disabled={!proof} onClick={()=>send(proofT.elapsed,proofT.grace)} className="case-primary disabled:opacity-40">Back it up <ArrowRight size={18}/></button></div>
   <p className="mt-2 text-right text-[14px] text-[#6B6457]"><button type="button" onClick={()=>send(proofT.elapsed,proofT.grace,action,"")} className="underline underline-offset-4">Go without proof</button></p>
  </>}
 </section>;
}

function LieRound({world,scene,passages,run,setting,sound,sandboxId,onSubmit}:{world:WorldPack;scene:Scene;passages:SourcePassage[];run:PublicRun;setting:TimeSetting;sound:boolean;sandboxId:string;onSubmit:(i:RoundInput,e:number,g:boolean)=>void}){
 const lie=scene.lie!,clue=scene.artifacts.find(a=>a.id===lie.clue_id)!;
 const source=useMemo(()=>passages.filter(p=>clue.source_anchor.includes(p.id)),[passages,clue.source_anchor]);
 const seconds=phaseSeconds(SECONDS.lie,setting);
 const [line,setLine]=useState(""),[misses,setMisses]=useState(0),[message,setMessage]=useState(""),[caught,setCaught]=useState(false),[explain,setExplain]=useState("");
 const sent=useRef(false);
 const send=(e:number,g:boolean)=>{if(sent.current)return;sent.current=true;onSubmit({kind:"lie",line,explanation:explain},e,g)};
 const lineRef=useRef(line);lineRef.current=line;const exRef=useRef(explain);exRef.current=explain;
 const t=useRoundTimer(seconds,false,()=>{if(sent.current)return;sent.current=true;onSubmit({kind:"lie",line:lineRef.current,explanation:exRef.current},(seconds!+GRACE_SECONDS)*1000,true)});
 // The hint rules: a miss names the detail to look for; after two misses, the paragraph. No line is ever highlighted.
 function pick(l:{text:string}){if(caught)return;const r=tryLine(lie,l.text,misses,source);if(r.result==="caught"){setLine(l.text);setCaught(true);setMessage("");cue(sound,"chime")}else{setMisses(r.misses);setMessage(r.message)}}
 return <section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">Catch the lie</h1>
  <Speaker world={world} characterId={lie.character_id} line={lie.testimony} sound={sound} sandboxId={sandboxId} label="Testimony"/>
  <TimerBar t={t} seconds={seconds}/>
  <p className="mt-4 text-[16px] font-semibold">One thing is false. Tap the line in the story that proves it.</p>
  <div aria-live="polite">{run.state.lantern&&!caught&&!message&&<p className="mt-2 rounded-2xl bg-[#FBEFD2] px-4 py-3 text-[16px]">Your Lantern points to {paragraphLabel(lie.truth_paragraph)}.</p>}{message&&<p className="mt-2 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{message}</p>}{caught&&<p className="mt-2 rounded-2xl bg-[#A0472C] px-4 py-3 text-[16px] font-semibold text-white">Lie caught. Now say why in one sentence.</p>}</div>
  <ReadingPanel className="mt-3 max-h-[45vh]" passages={source} kept={line?[line]:[]} results={caught?[{line,ok:true}]:[]} onTap={pick}/>
  {caught&&<><label htmlFor="lie-why" className="mt-4 block text-[16px] font-semibold">Why does this line prove it false?</label><textarea id="lie-why" value={explain} onChange={e=>setExplain(e.target.value)} rows={2} maxLength={400} className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 text-[17px]" placeholder={`${world.characters.find(c=>c.id===lie.character_id)?.name??"They"} said… but the story says…`}/></>}
  <div className="mt-5 flex flex-wrap justify-end gap-3">{!caught&&<button type="button" onClick={()=>send(t.elapsed,t.grace)} className="case-secondary">I'm stuck, move on</button>}<button type="button" disabled={!caught} onClick={()=>send(t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Submit <ArrowRight size={18}/></button></div>
 </section>;
}

function CallRound({scene,run,setting,onSubmit}:{scene:Scene;run:PublicRun;setting:TimeSetting;onSubmit:(i:RoundInput,e:number,g:boolean)=>void}){
 const c=scene.story_mode!.call;const [theory,setTheory]=useState(""),[pins,setPins]=useState<string[]>([]);
 const seconds=phaseSeconds(SECONDS.call,setting);
 const sent=useRef(false);const st=useRef({theory,pins});st.current={theory,pins};
 const send=(e:number,g:boolean)=>{if(sent.current)return;sent.current=true;onSubmit({kind:"call",theoryId:st.current.theory,pins:st.current.pins},e,g)};
 const t=useRoundTimer(seconds,false,()=>send((seconds!+GRACE_SECONDS)*1000,true));
 const togglePin=(line:string)=>setPins(p=>p.some(x=>lineKey(x)===lineKey(line))?p.filter(x=>lineKey(x)!==lineKey(line)):p.length>=2?[p[1],line]:[...p,line]);
 return <section className="mt-4" aria-labelledby="play-h">
  <h1 id="play-h" className="text-[24px] font-bold">Make your call</h1>
  <p className="mt-2 text-[19px] font-semibold leading-7">{c.question}</p>
  <TimerBar t={t} seconds={seconds}/>
  <fieldset className="mt-4"><legend className="text-[16px] font-semibold">Your theory</legend>
   <div className="mt-2 grid gap-2 sm:grid-cols-3">{c.theories.map(th=><button key={th.id} type="button" aria-pressed={theory===th.id} onClick={()=>setTheory(th.id)} className={`rounded-2xl p-4 text-left ${theory===th.id?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"}`}><span className="block text-[17px] font-bold">{th.name}</span><span className="mt-1 block text-[14px] leading-5 opacity-80">{th.description}</span></button>)}</div></fieldset>
  <Pouch pouch={run.state.pouch} picked={pins} onPick={togglePin} max={2}/>
  {run.state.pouch.length<2&&<p className="mt-2 text-[14px] text-[#6B6457]">You can only pin lines you kept in your pouch in round 1.</p>}
  <div className="mt-5 flex justify-end"><button type="button" disabled={!theory} onClick={()=>send(t.elapsed,t.grace)} className="case-primary disabled:opacity-40">Make my call <ArrowRight size={18}/></button></div>
 </section>;
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
function Results({world,scene,result,mode,run,headers,sandboxId,onNext}:{world:WorldPack;scene:Scene;result:Result;mode:"individual"|"squad"|"off";run:PublicRun;headers:Record<string,string>;sandboxId:string;onNext:()=>void}){
 const r=result.record;const board=useLiveBoard(run,result.board,headers,sandboxId,true);
 const who=scene.story_mode!.confront.character_id,trust=run.state.trust[who]??0,whoName=world.characters.find(c=>c.id===who)?.name??"";
 return <section className="mt-5" aria-labelledby="res-h">
  <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Round {r.round} · {ROUND_NAMES[r.kind]}</p>
  <h1 id="res-h" className="mt-1 text-[40px] font-bold leading-none tabular-nums">+{r.points}</h1>
  <p className="mt-2 text-[17px]">{r.detail}{r.grace?" · half points after time":""}</p>
  {r.note&&<p className="mt-2 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{r.note}</p>}
  <ul className="mt-3 flex flex-wrap gap-2 text-[14px] font-semibold">
   <li className="rounded-full bg-[#EFE8D8] px-3 py-1">Proof {r.base}</li>
   {r.speed>0&&<li className="rounded-full bg-[#EFE8D8] px-3 py-1">Speed +{r.speed}</li>}
   {r.multiplier>1&&<li className="inline-flex items-center gap-1 rounded-full bg-[#A0472C] px-3 py-1 text-white"><Flame size={14}/>Streak x{r.multiplier}</li>}
   {r.doubled&&<li className="rounded-full bg-[#2A2620] px-3 py-1 text-white">Doubled</li>}
   {r.coinsEarned>0&&<li className="inline-flex items-center gap-1 rounded-full bg-[#F4E1D6] px-3 py-1 text-[#8A3B23]"><Coins size={14}/>+{r.coinsEarned} coin{r.coinsEarned===1?"":"s"}</li>}
  </ul>
  <p className="mt-3 flex items-center gap-2 text-[16px]"><Flame size={18} className={r.streak?"text-[#A0472C]":"text-[#C9B9A0]"}/>{r.streak>=1?`Streak: ${r.streak} round${r.streak===1?"":"s"} in a row with proof`:"Streak reset. Back your next answer with a line from the story."}</p>
  {result.reaction&&<div className="mt-4 rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="text-[17px] leading-7">{result.reaction.line}</p>
   <TrustMeter name={whoName} value={trust} change={result.reaction.trust}/></div>}
  {r.proof.length>0&&<div className="mt-4"><p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">{r.kind==="read"?"Your pouch":"Your proof"}</p>{r.proof.map(p=>{const off=!!r.offFocus?.includes(p);return <blockquote key={p} className={`mt-2 border-l-4 pl-3 font-serif text-[15px] italic leading-6 ${off?"border-[#C9B9A0] text-[#6B6457]":"border-[#A0472C]"}`}>“{p.replace(/\s+/g," ")}”{r.kind==="read"&&<span className="mt-0.5 block font-sans text-[13px] font-semibold not-italic">{off?"0 points: true to the story, but it doesn't answer the question":"+100: answers the question"}</span>}</blockquote>})}</div>}
  <BoardView board={board} mode={mode}/>
  {result.pulse.length>0&&<section className="mt-5 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]" aria-labelledby="pulse-h">
   <h2 id="pulse-h" className="text-[18px] font-bold">{run.scope==="class"?"Class pulse":"Today's players"}</h2>
   <ul className="mt-3 space-y-3">{result.pulse.map(p=><li key={p.key}><div className="flex justify-between gap-3 text-[15px]"><span className="font-semibold">{p.label}</span><span className="tabular-nums">{p.pct}%</span></div><div aria-hidden className="mt-1 h-2.5 rounded-full bg-[#E4DCCB]"><div className="h-full rounded-full bg-[#A0472C]" style={{width:`${p.pct}%`}}/></div>{p.strongest&&<p className="mt-1 font-serif text-[14px] italic leading-5 text-[#4A4438]">Strongest proof: “{p.strongest.replace(/\s+/g," ").slice(0,160)}{p.strongest.length>160?"…":""}”</p>}</li>)}</ul>
  </section>}
  <div className="mt-6 flex justify-end"><button type="button" onClick={onNext} className="case-primary min-h-[58px] text-[18px]">{run.finished?"See your scene results":"Next round"} <ArrowRight size={20}/></button></div>
 </section>;
}
function TrustMeter({name,value,change}:{name:string;value:number;change:number}){
 const pct=Math.round(((Math.max(-3,Math.min(3,value))+3)/6)*100);
 return <div className="mt-3"><p className="text-[14px] font-semibold">Trust with {name}: <span className={change>0?"text-[#2F6B3A]":change<0?"text-[#A33B20]":""}>{change>0?`up ${change}`:change<0?`down ${-change}`:"no change"}</span></p>
  <div className="mt-1 h-2.5 rounded-full bg-[#E4DCCB]" role="meter" aria-valuemin={-3} aria-valuemax={3} aria-valuenow={value} aria-label={`Trust with ${name}`}><div className="h-full rounded-full bg-[#2A2620]" style={{width:`${pct}%`}}/></div></div>;
}

// ---------- Scene cleared ----------
function Cleared({run,mode,headers,sandboxId,onNext,onAgain}:{run:PublicRun;mode:"individual"|"squad"|"off";headers:Record<string,string>;sandboxId:string;onNext:()=>void;onAgain:()=>void}){
 const [board,setBoard]=useState<Board>(null);
 useEffect(()=>{if(mode==="off")return;fetch(`/api/story/board?runId=${run.id}&sandboxId=${sandboxId}`,{headers,cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>j&&setBoard(j.board)).catch(()=>{})},[run.id,headers,sandboxId,mode]);
 return <section className="mt-6" aria-labelledby="clear-h">
  <div className="rounded-3xl bg-[#2A2620] p-6 text-center text-[#FFFDF8]"><p className="text-[14px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Scene cleared</p><h1 id="clear-h" className="mt-2 text-[44px] font-bold tabular-nums">{run.total}</h1><p className="mt-1 text-[17px]">points</p>
   <dl className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px]">Best streak</dt><dd className="text-[22px] font-bold">{run.state.bestStreak}</dd></div><div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px]">Rank</dt><dd className="text-[22px] font-bold">{board?.me?`#${board.me.rank}`:"·"}</dd></div><div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px]">Coins left</dt><dd className="text-[22px] font-bold">{run.state.coins}</dd></div></dl></div>
  <div className="mt-5"><h2 className="text-[18px] font-bold">Your Evidence pouch</h2>{run.state.pouch.length?run.state.pouch.map(p=><blockquote key={p} className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[16px] italic leading-7">“{p.replace(/\s+/g," ")}”</blockquote>):<p className="mt-1 text-[15px] text-[#6B6457]">No lines kept this time.</p>}</div>
  <BoardView board={board} mode={mode}/>
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={onAgain} className="inline-flex min-h-11 items-center gap-2 text-[15px] text-[#6B6457] underline underline-offset-4"><RotateCcw size={16}/>Play this scene again</button><button type="button" onClick={onNext} className="case-primary min-h-[58px] text-[18px]">On to the next scene <ArrowRight size={20}/></button></div>
 </section>;
}
