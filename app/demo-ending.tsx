"use client";
// The public demo's ending, after scene 1: testers finish a whole experience in one scene. A mini verdict (a theory, the
// scene's pieces or any scene 1 lines, 2 or 3 sentences, the mission verdict's checks, never scored), the case so far
// (pieces, points and the level reached; the payoff stays sealed), "Unlock your challenge" and Your Turn with scene 1
// lines only, then the feedback card and the way on: Scene 2, or another story. Class students and live class never
// see it; a demo player who keeps going gets the full mission verdict and reveal after the last scene.
import {useLayoutEffect,useMemo,useState} from "react";
import {ArrowRight,Check} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {readingPortions} from "@/lib/source-passages";
import type {Demo} from "./page";
import {MIN_PINS,pieceForLine,piecesFound,revealsPayoff,verdictProblems} from "@/lib/missions";
import {levelFor,pidOf} from "@/lib/fair-play";
import {paragraphLabel} from "@/lib/clue-game";
import {lineWords} from "@/lib/lies";
import {sceneYourTurn} from "@/lib/your-turn";
import {funChoices} from "@/lib/feedback";
import {ReadingPanel} from "./reading-panel";
import {MissionTracker,PinLine,studentMission} from "./missions";
import {UnlockChallenge} from "./role-intro";
import {YourTurn} from "./your-turn";
import {focusScreenTop} from "./screen-focus";

export type DemoEndingStep="verdict"|"sofar"|"unlock"|"yourturn"|"feedback"|"done";
const same=(a:string,b:string)=>lineWords(a)===lineWords(b);

export function DemoEnding({world,passages,demo,setDemo,sceneIndex,onAnotherStory}:{world:WorldPack;passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;sceneIndex:number;onAnotherStory?:()=>void}){
 const step=demo.demoEnding??"verdict",scene=world.scenes[sceneIndex],m=studentMission(world,demo);
 const go=(s:DemoEndingStep)=>setDemo(d=>({...d,demoEnding:s}));
 // Each step is a new screen: the top, with focus on its heading.
 useLayoutEffect(()=>{focusScreenTop()},[step]);
 const reading=useMemo(()=>readingPortions(passages,world.scenes)[sceneIndex]??[],[passages,world.scenes,sceneIndex]);
 const yt=useMemo(()=>sceneYourTurn(world,demo.angle,new Set(reading.map(p=>p.id)),t=>(world.missions??[]).some(x=>revealsPayoff(x,t))),[world,demo.angle,reading]);
 const next=()=>{setDemo(d=>({...d,demoEnding:"done",scene:sceneIndex+1,events:[...d.events,"scene_complete"]}));window.scrollTo({top:0})};
 if(step==="verdict"&&m)return <MiniVerdict world={world} reading={reading} demo={demo} setDemo={setDemo} sceneIndex={sceneIndex} onSaved={()=>go("sofar")}/>;
 if(step==="verdict"||step==="sofar")return <CaseSoFar world={world} demo={demo} sceneIndex={sceneIndex} onNext={()=>go(Object.keys(yt.activities).length?demo.challengeAsked?"yourturn":"unlock":"feedback")}/>;
 if(step==="unlock")return <UnlockChallenge onDone={a=>setDemo(d=>({...d,challengeAsked:true,angle:{...(d.angle??{}),...a},demoEnding:"yourturn"}))}/>;
 if(step==="yourturn")return <YourTurn world={{...world,your_turn:{activities:yt.activities}}} passages={reading} choices={yt.choices} proven={Object.values(demo.artifactAnswers).map(a=>a.notice).filter(Boolean)} ai={{sandboxId:demo.id,classToken:demo.classAuth?.token,sceneId:scene.id}}
  onSave={e=>{setDemo(d=>({...d,yourTurn:[...(d.yourTurn??[]),e].slice(-30)}))}} onClose={()=>go("feedback")}/>;
 return <FeedbackCard world={world} sceneIndex={sceneIndex} onNextScene={next} onAnotherStory={onAnotherStory}/>;
}

// ---------- The mini verdict ----------
function MiniVerdict({world,reading,demo,setDemo,sceneIndex,onSaved}:{world:WorldPack;reading:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;sceneIndex:number;onSaved:()=>void}){
 const m=studentMission(world,demo)!,scene=world.scenes[sceneIndex];
 const found=piecesFound(m,demo.missionPieces).filter(p=>p.scene_id===scene.id);
 const anyLine=found.length<MIN_PINS;
 const saved=demo.sceneVerdict?.scene_id===scene.id?demo.sceneVerdict:undefined;
 const [theory,setTheory]=useState(saved?.theory_id??""),[pinned,setPinned]=useState<string[]>(saved?.pinned.map(p=>p.line)??[]),[writing,setWriting]=useState(saved?.writing??""),[tried,setTried]=useState(false);
 const problems=verdictProblems({theoryId:theory,pinned,writing});
 const toggle=(l:string)=>setPinned(p=>p.some(x=>same(x,l))?p.filter(x=>!same(x,l)):[...p,l]);
 function save(){
  setTried(true);if(problems.length)return;
  setDemo(d=>({...d,sceneVerdict:{mission_id:m.id,scene_id:scene.id,theory_id:theory,pinned:pinned.map(l=>({line:l,pid:pidOf(reading,l),piece:pieceForLine(m,l)?.id??null})),writing:writing.trim(),saved_at:new Date().toISOString()}}));
  onSaved();
 }
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8">
  <span className="inline-block -rotate-2 rounded-lg border-[3px] border-[#A0472C] px-3 py-0.5 text-[13px] font-extrabold tracking-[.08em] text-[#A0472C]">SCENE {sceneIndex+1} CLOSED</span>
  <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Mission · {m.title}</p>
  <h1 className="mt-1 text-[28px] font-bold leading-tight outline-none">Your verdict so far</h1>
  <p className="mt-1 text-[16px] leading-6 text-[#4A4438]">{m.problem} Use what scene {sceneIndex+1} showed you.</p>
  <fieldset className="mt-5"><legend className="text-[18px] font-bold">1. Your theory</legend>
   <div className="mt-2 grid gap-2">{m.theories.map(t=><label key={t.id} className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 ${theory===t.id?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB]"}`}><input type="radio" name="mini-theory" value={t.id} checked={theory===t.id} onChange={()=>setTheory(t.id)} className="mt-1 h-5 w-5 accent-[#A0472C]"/><span><b className="block text-[17px]">{t.name}</b><span className="text-[15px] leading-5 opacity-90">{t.description}</span></span></label>)}</div>
  </fieldset>
  <section className="mt-5" aria-labelledby="mini-pins-h"><h2 id="mini-pins-h" className="text-[18px] font-bold">2. Pin your evidence (at least {MIN_PINS})</h2>
   {found.map(p=><PinLine key={p.id} line={p.line} on={pinned.some(x=>same(x,p.line))} onTap={toggle} tag={`Piece · ${paragraphLabel(pidOf(reading,p.line))}`}/>)}
   {anyLine&&<><p className="mt-2 text-[15px] text-[#4A4438]">You found {found.length} piece{found.length===1?"":"s"} in this scene, so you can pin any line from scene {sceneIndex+1}.</p>
    <ReadingPanel className="mt-2 max-h-[45vh]" glossary={world.glossary} passages={reading} kept={pinned} onTap={l=>toggle(l.text)}/></>}
  </section>
  <section className="mt-5"><label htmlFor="mini-writing" className="text-[18px] font-bold">3. Your verdict in 2 or 3 sentences</label>
   <textarea id="mini-writing" value={writing} onChange={e=>setWriting(e.target.value)} rows={6} maxLength={900} className="mt-2 min-h-[10rem] w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px] leading-7"/>
  </section>
  {tried&&problems.length>0&&<ul role="alert" className="mt-3 space-y-1 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[15px] font-semibold text-[#8A3B23]">{problems.map(p=><li key={p}>{p}</li>)}</ul>}
  <button type="button" onClick={save} className="case-primary mt-5 min-h-[56px] w-full justify-center text-[18px]">Save my verdict <ArrowRight size={18}/></button>
  <MissionTracker world={world} demo={demo}/>
 </div>;
}

// ---------- The case so far ----------
function CaseSoFar({world,demo,sceneIndex,onNext}:{world:WorldPack;demo:Demo;sceneIndex:number;onNext:()=>void}){
 const m=studentMission(world,demo),scene=world.scenes[sceneIndex];
 const run=demo.story?.[scene.id],level=run?.max?levelFor(run.total,run.max):null;
 const v=demo.sceneVerdict?.scene_id===scene.id?demo.sceneVerdict:null;
 const last=world.scenes.length;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8">
  <section className="rounded-3xl bg-[#2A2620] p-6 text-[#FFFDF8]" aria-labelledby="sofar-h">
   <p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">{world.title} · Scene {sceneIndex+1} closed</p>
   <h1 id="sofar-h" className="mt-1 text-[30px] font-bold leading-tight outline-none">Case so far</h1>
   <dl className="mt-4 grid grid-cols-2 gap-3">
    {m&&<div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px] text-[#E8DDCB]">Pieces found</dt><dd className="text-[24px] font-bold tabular-nums">{piecesFound(m,demo.missionPieces).length} of {m.pieces.length}</dd></div>}
    {run&&<div className="rounded-2xl bg-white/10 p-3"><dt className="text-[13px] text-[#E8DDCB]">Points</dt><dd className="text-[24px] font-bold tabular-nums">{run.total.toLocaleString()}</dd></div>}
    {run&&<div className="col-span-2 rounded-2xl bg-white/10 p-3"><dt className="text-[13px] text-[#E8DDCB]">Goal level reached</dt><dd className="text-[20px] font-bold">{level?level.name:"Not yet: keep proving lines"}</dd></div>}
   </dl>
   {m&&<p className="mt-4 text-[15px] text-[#E8DDCB]">Mission: {m.title}{v?` · your theory: ${m.theories.find(t=>t.id===v.theory_id)?.name}`:""}</p>}
   <p className="mt-3 rounded-2xl bg-[#A0472C] px-4 py-3 text-[17px] font-semibold">The full truth is waiting in scenes {sceneIndex+2} to {last}.</p>
  </section>
  <button type="button" onClick={onNext} className="case-primary mt-5 min-h-[56px] w-full justify-center text-[18px]">Next: Your Turn <ArrowRight size={18}/></button>
 </div>;
}

// ---------- The feedback card, then the way on ----------
function FeedbackCard({world,sceneIndex,onNextScene,onAnotherStory}:{world:WorldPack;sceneIndex:number;onNextScene:()=>void;onAnotherStory?:()=>void}){
 const [fun,setFun]=useState(""),[confusing,setConfusing]=useState(""),[again,setAgain]=useState(""),[state,setState]=useState<"idle"|"sending"|"sent">("idle"),[error,setError]=useState("");
 async function send(){
  setError("");setState("sending");
  try{const r=await fetch("/api/feedback/play",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({world:world.id,...(fun?{fun}:{}),...(confusing.trim()?{confusing}:{}),...(again?{playAgain:again}:{})})});
   const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error??"We couldn't send that. Try again.");setState("sent")}
  catch(e){setError((e as Error).message);setState("idle")}
 }
 const chips=(list:readonly (readonly [string,string])[],value:string,set:(v:string)=>void,name:string)=><div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={name}>{list.map(([k,label])=><button key={k} type="button" aria-pressed={value===k} onClick={()=>set(value===k?"":k)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[16px] font-semibold ${value===k?"bg-[#A0472C] text-white":"bg-[#F4E1D6] text-[#2A2620]"}`}>{value===k&&<Check size={16} aria-hidden/>}{label}</button>)}</div>;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8">
  <section className="rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]" aria-labelledby="fb-h">
   <h1 id="fb-h" className="text-[26px] font-bold leading-tight outline-none">{state==="sent"?"Thanks for telling us":"How was it?"}</h1>
   {state==="sent"?<p className="mt-2 text-[17px] text-[#4A4438]">Your answers help us make the next scene better.</p>:<>
    <p className="mt-3 text-[17px] font-bold">Was it fun?</p>{chips(funChoices,fun,setFun,"Was it fun?")}
    <label htmlFor="fb-confusing" className="mt-4 block text-[17px] font-bold">Was anything confusing? <span className="font-normal text-[#6B6457]">(optional)</span></label>
    <textarea id="fb-confusing" value={confusing} onChange={e=>setConfusing(e.target.value)} rows={2} maxLength={600} className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px]"/>
    <p className="mt-3 text-[17px] font-bold">Would you play again?</p>{chips([["yes","Yes"],["maybe","Maybe"],["no","No"]],again,setAgain,"Would you play again?")}
    {error&&<p role="alert" className="mt-3 text-[15px] font-semibold text-[#A33B20]">{error}</p>}
    <button type="button" disabled={state==="sending"||(!fun&&!again&&!confusing.trim())} onClick={send} className="case-secondary mt-4 min-h-[48px] w-full justify-center disabled:opacity-50">{state==="sending"?"Sending…":"Send"}</button></>}
  </section>
  <div className="mt-5 grid gap-2">
   <button type="button" onClick={onNextScene} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Keep playing: Scene {sceneIndex+2} <ArrowRight size={18}/></button>
   {onAnotherStory&&<button type="button" onClick={onAnotherStory} className="case-secondary min-h-[52px] w-full justify-center">Try another story</button>}
  </div>
 </div>;
}
