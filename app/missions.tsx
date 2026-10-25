"use client";
// Story missions on screen (rules: lib/missions.ts): picking a mission at the start of a story, the tracker ("Mission:
// 2 of 5 pieces found") on the mission map and round intros, mission leads (a scene's own question for each piece not
// found yet), and the verdict: pick a theory, pin pieces, write 2 or 3 sentences, then the payoff is revealed.
import {useLayoutEffect,useMemo,useState} from "react";
import {ArrowLeft,ArrowRight,Check} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {EARLY,MIN_PINS,collectPieces,isPayoff,missionFor,pieceForLine,piecesFound,verdictNote,verdictProblems} from "@/lib/missions";
import {MAX_TRIES,missHint,pidOf} from "@/lib/fair-play";
import {displayLine,paragraphLabel} from "@/lib/clue-game";
import {lineWords} from "@/lib/lies";
import {readingPortions} from "@/lib/source-passages";
import {ReadingPanel} from "./reading-panel";
import {NotYet} from "./fair-play-ui";
import {focusScreenTop} from "./screen-focus";

const same=(a:string,b:string)=>lineWords(a)===lineWords(b);
export const studentMission=(world:WorldPack,demo:Demo)=>missionFor(world,demo.mission);

// ---------- Picking a mission (once, at the start of a story) ----------
export function MissionPick({world,onPick}:{world:WorldPack;onPick:(id:string)=>void}){
 useLayoutEffect(()=>{focusScreenTop()},[]);
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-8 md:px-8">
  <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{world.title}</p>
  <h1 className="mt-1 text-[30px] font-bold leading-tight outline-none">Choose your mission</h1>
  <p className="mt-2 text-[17px] text-[#4A4438]">Each one is a real question the story answers. Collect pieces by proving lines as you play; at the end, the text reveals what happened.</p>
  <ul className="mt-5 grid gap-3">{(world.missions??[]).map(m=><li key={m.id}><button type="button" onClick={()=>onPick(m.id)} className="w-full rounded-3xl bg-[#2A2620] p-5 text-left text-[#FFFDF8] hover:bg-[#3a342b]">
   <span className="block text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">★ Mission · {m.pieces.length} pieces</span>
   <span className="mt-1 block text-[22px] font-bold">{m.title}</span>
   <span className="mt-1 block text-[16px] leading-6 text-[#E8DDCB]">{m.problem}</span></button></li>)}</ul>
 </div>;
}

// ---------- The tracker ----------
export function MissionTracker({world,demo,dark=false}:{world:WorldPack;demo:Demo;dark?:boolean}){
 const m=studentMission(world,demo);
 if(!m)return null;
 const found=piecesFound(m,demo.missionPieces).length;
 return <div className={`mt-3 rounded-2xl px-4 py-3 ${dark?"bg-white/10 text-[#FFFDF8]":"bg-[#FFFDF8] shadow-[0_2px_10px_-5px_rgba(42,38,32,.3)]"}`}>
  <p className="flex items-baseline justify-between gap-2 text-[15px] font-bold"><span>Mission: {found} of {m.pieces.length} pieces found</span><span className={`text-[13px] font-semibold ${dark?"text-[#E8DDCB]":"text-[#6B6457]"}`}>{m.title}</span></p>
  <ol className="mt-2 grid gap-1.5" style={{gridTemplateColumns:`repeat(${m.pieces.length},minmax(0,1fr))`}} aria-label={`${found} of ${m.pieces.length} mission pieces found`}>{m.pieces.map(p=>{const got=demo.missionPieces?.[p.id];return <li key={p.id} className={`grid h-8 place-items-center rounded-lg text-[14px] font-bold ${got?"bg-[#A0472C] text-white":dark?"border-2 border-dashed border-white/30 text-white/50":"border-2 border-dashed border-[#C9B9A0] bg-[#EFE8D8] text-[#8B8478]"}`}>{got?<Check size={15} aria-label="found"/>:<span aria-label="not found yet">?</span>}</li>})}</ol>
 </div>;
}
// The pieces a scene holds that the student hasn't found yet (for the scene's mission leads).
export const openLeads=(world:WorldPack,demo:Demo,sceneId:string)=>{const m=studentMission(world,demo);return m?m.pieces.filter(p=>p.scene_id===sceneId&&!demo.missionPieces?.[p.id]):[]};

// ---------- Mission leads ----------
// One lead at a time: the piece's own question, the passage around it, the same tries and Not yet as everywhere.
export function MissionLeads({world,scene,passages,demo,setDemo,onClose}:{world:WorldPack;scene:WorldPack["scenes"][number];passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onClose:()=>void}){
 const m=studentMission(world,demo)!;
 const [queue]=useState(()=>openLeads(world,demo,scene.id));
 const [i,setI]=useState(0),[line,setLine]=useState(""),[tries,setTries]=useState(0),[notYet,setNotYet]=useState<string|null>(null),[found,setFound]=useState<{shown:boolean}|null>(null);
 const piece=queue[i];
 useLayoutEffect(()=>{focusScreenTop()},[i]);
 const panel=useMemo(()=>{if(!piece)return [];const pid=pidOf(passages,piece.line),n=Number(pid.slice(1));const near=new Set([n-1,n,n+1].map(x=>`p${String(x).padStart(3,"0")}`));const reading=new Set((readingPortions(passages,world.scenes)[world.scenes.indexOf(scene)]??[]).map(p=>p.id));return passages.filter(p=>near.has(p.id)&&(reading.has(p.id)||p.id===pid))},[piece,passages,world.scenes,scene]);
 if(!piece)return null;
 function collect(shown:boolean){const next=collectPieces(m,demo.missionPieces,[piece.line],{shown,via:"lead"});if(next)setDemo(d=>({...d,missionPieces:next}));setFound({shown})}
 function lock(){
  if(!line)return;
  if(same(line,piece.line)){collect(false);return}
  const t=tries+1;setTries(t);
  if(t>=MAX_TRIES){collect(true);return}
  setNotYet(missHint(t+1,{pid:pidOf(passages,piece.line),line:piece.line},passages));
 }
 function next(){setLine("");setTries(0);setFound(null);if(i+1<queue.length)setI(i+1);else onClose()}
 if(notYet)return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8"><NotYet tryNo={tries+1} hint={notYet} onTryAgain={()=>{setNotYet(null);setLine("")}}/></div>;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8">
  <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/>Back to the scene</button>
  <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Mission lead {i+1} of {queue.length} · {m.title}</p>
  <h1 className="mt-1 text-[26px] font-bold leading-tight outline-none">{piece.lead}</h1>
  <MissionTracker world={world} demo={demo}/>
  {found?<section className="mt-4 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]" aria-live="polite">
    <p className="text-[18px] font-bold">{found.shown?"Here is the piece. It counts, marked as shown.":"Mission piece found."}</p>
    <blockquote className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[17px] leading-7">{displayLine(piece.line)}</blockquote>
    <button type="button" onClick={next} className="case-primary mt-4">{i+1<queue.length?"Next lead":"Back to the scene"} <ArrowRight size={18}/></button></section>
   :<><ReadingPanel className="mt-4 max-h-[55vh]" glossary={world.glossary} passages={panel} kept={line?[line]:[]} onTap={l=>setLine(l.text)}/>
    <div className="mt-4 flex justify-end"><button type="button" disabled={!line} onClick={lock} className="case-primary disabled:opacity-40">Lock in this line <ArrowRight size={18}/></button></div></>}
 </div>;
}

// ---------- The verdict ----------
// Pick a theory, pin pieces (or any lines from the story when fewer than 2 were found), write 2 or 3 sentences; then
// the sealed clue opens and the payoff line is revealed. Never scored; saved for the teacher.
export function MissionVerdictView({world,passages,demo,setDemo,onBack,onFinish}:{world:WorldPack;passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onBack:()=>void;onFinish:()=>void}){
 const m=studentMission(world,demo)!;
 const saved=demo.missionVerdict?.mission_id===m.id?demo.missionVerdict:undefined;
 const found=piecesFound(m,demo.missionPieces);
 const anyLine=found.length<MIN_PINS;
 const [theory,setTheory]=useState(saved?.theory_id??""),[pinned,setPinned]=useState<string[]>(saved?.pinned.map(p=>p.line)??[]),[writing,setWriting]=useState(saved?.writing??""),[revealed,setRevealed]=useState(!!saved);
 useLayoutEffect(()=>{focusScreenTop()},[revealed]);
 const problems=verdictProblems({theoryId:theory,pinned,writing});
 // With fewer than 2 pieces, any line from the story can be cited: every scene's reading, one passage at a time.
 const [scenePick,setScenePick]=useState(0);
 const readings=useMemo(()=>readingPortions(passages,world.scenes),[passages,world.scenes]);
 const toggle=(l:string)=>setPinned(p=>p.some(x=>same(x,l))?p.filter(x=>!same(x,l)):[...p,l]);
 function save(){
  if(problems.length)return;
  const early=pinned.some(l=>isPayoff(m,l));
  const v={mission_id:m.id,theory_id:theory,pinned:pinned.map(l=>({line:l,pid:pidOf(passages,l),piece:pieceForLine(m,l)?.id??null})),writing:writing.trim(),early,saved_at:new Date().toISOString()};
  setDemo(d=>({...d,missionVerdict:v}));setRevealed(true);
 }
 if(revealed&&(saved||demo.missionVerdict)){
  const v=demo.missionVerdict!;
  return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-8 md:px-8">
   <section className="rounded-3xl bg-[#2A2620] p-6 text-[#FFFDF8]" aria-labelledby="payoff-h">
    <span className="inline-block -rotate-2 rounded-lg border-[3px] border-[#F3C9B2] px-3 py-0.5 text-[13px] font-extrabold tracking-[.08em] text-[#F3C9B2]">CASE CLOSED</span>
    <h1 id="payoff-h" className="mt-3 text-[26px] font-bold leading-tight outline-none">Here's what the text says happened.</h1>
    <blockquote className="mt-3 border-l-4 border-[#F3C9B2] pl-4 font-serif text-[18px] leading-8">{displayLine(m.payoff.line)}</blockquote>
    <p className="mt-2 text-[14px] text-[#E8DDCB]">{paragraphLabel(pidOf(passages,m.payoff.line))} · from the clue that was sealed until now</p>
   </section>
   {v.early&&<p className="mt-4 rounded-2xl bg-[#E8F2E7] px-4 py-3 text-[17px] font-bold text-[#2F6B3A]">{EARLY}</p>}
   <section className="mt-4 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your verdict · {m.theories.find(t=>t.id===v.theory_id)?.name}</p><p className="mt-2 text-[17px] leading-7">{v.writing}</p>
    {v.pinned.map(p=><blockquote key={p.line} className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[15px] italic leading-6">{displayLine(p.line)}</blockquote>)}</section>
   <p className="mt-4 rounded-2xl bg-[#EFE8D8] px-4 py-3 text-[16px]">{verdictNote(found.length,m.pieces.length)}</p>
   <section className="mt-4 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]" aria-labelledby="compare-h"><h2 id="compare-h" className="text-[20px] font-bold">Compare</h2><p className="mt-1 text-[15px] text-[#4A4438]">For each line you cited: does it point the same way as what the text says happened?</p>
    <ul className="mt-3 space-y-3">{v.pinned.map(p=>{const c=v.compare?.[p.line];return <li key={p.line}><blockquote className="border-l-4 border-[#A0472C] pl-3 font-serif text-[15px] leading-6">{displayLine(p.line)}</blockquote>
     <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Compare this line">{([["same","Points the same way"],["else","Points somewhere else"]] as const).map(([k,label])=><button key={k} type="button" aria-pressed={c===k} onClick={()=>setDemo(d=>d.missionVerdict?{...d,missionVerdict:{...d.missionVerdict,compare:{...(d.missionVerdict.compare??{}),[p.line]:k}}}:d)} className={`min-h-12 rounded-2xl px-3 text-[15px] font-semibold ${c===k?"bg-[#2A2620] text-white":"bg-[#EFE8D8]"}`}>{label}</button>)}</div></li>})}</ul></section>
   <div className="mt-6 flex justify-end"><button type="button" onClick={onFinish} className="case-primary min-h-[56px]">Close the case <ArrowRight size={18}/></button></div>
  </div>;
 }
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8">
  <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/>Back</button>
  <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Mission · {m.title}</p>
  <h1 className="mt-1 text-[28px] font-bold leading-tight outline-none">Your verdict: {m.problem.replace(/^Prove /,"").replace(/\.$/,"")}?</h1>
  <MissionTracker world={world} demo={demo}/>
  <fieldset className="mt-5"><legend className="text-[18px] font-bold">1. Your theory</legend>
   <div className="mt-2 grid gap-2">{m.theories.map(t=><label key={t.id} className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 ${theory===t.id?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB]"}`}><input type="radio" name="theory" value={t.id} checked={theory===t.id} onChange={()=>setTheory(t.id)} className="mt-1 h-5 w-5 accent-[#A0472C]"/><span><b className="block text-[17px]">{t.name}</b><span className="text-[14px] opacity-80">{t.description}</span></span></label>)}</div></fieldset>
  <section className="mt-5" aria-labelledby="pins-h"><h2 id="pins-h" className="text-[18px] font-bold">2. Pin your evidence (at least {MIN_PINS})</h2>
   {anyLine?<><p className="mt-1 text-[15px] text-[#4A4438]">You found {found.length} piece{found.length===1?"":"s"}, so you can cite any lines from the story.</p>
    {found.map(p=><PinLine key={p.id} line={p.line} on={pinned.some(x=>same(x,p.line))} onTap={toggle} tag={`Piece · ${paragraphLabel(pidOf(passages,p.line))}`}/>)}
    <div className="mt-3 flex flex-wrap gap-1.5">{world.scenes.map((s,k)=><button key={s.id} type="button" aria-pressed={scenePick===k} onClick={()=>setScenePick(k)} className={`min-h-10 rounded-full px-3 text-[14px] font-semibold ${scenePick===k?"bg-[#2A2620] text-white":"bg-[#EFE8D8]"}`}>Scene {k+1}</button>)}</div>
    <ReadingPanel className="mt-2 max-h-[45vh]" glossary={world.glossary} passages={readings[scenePick]??[]} kept={pinned} onTap={l=>toggle(l.text)}/></>
   :<>{m.pieces.map(p=>{const got=found.includes(p);return got?<PinLine key={p.id} line={p.line} on={pinned.some(x=>same(x,p.line))} onTap={toggle} tag={`${world.scenes.findIndex(s=>s.id===p.scene_id)+1>0?`Scene ${world.scenes.findIndex(s=>s.id===p.scene_id)+1} · `:""}${paragraphLabel(pidOf(passages,p.line))}${demo.missionPieces?.[p.id]?.shown?" · shown":""}`}/>:<p key={p.id} className="mt-2 rounded-xl border-2 border-dashed border-[#C9B9A0] px-3 py-2 text-[14px] text-[#8B8478]">A piece you didn't find. You can still close the case.</p>})}</>}
  </section>
  <section className="mt-5"><label htmlFor="mv-writing" className="text-[18px] font-bold">3. Your verdict in 2 or 3 sentences</label>
   <textarea id="mv-writing" value={writing} onChange={e=>setWriting(e.target.value)} rows={9} maxLength={900} className="mt-2 min-h-[16rem] w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px] leading-7"/>
   <ul className="mt-2 flex flex-wrap gap-2 text-[13px] font-bold" aria-live="polite">{["Pick your theory.",`Pin at least ${MIN_PINS} lines.`,"Write 2 or 3 sentences."].map(x=><li key={x} className={`rounded-full px-3 py-1 ${problems.includes(x)?"bg-[#EFE8D8] text-[#6B6457]":"bg-[#E8F2E7] text-[#2F6B3A]"}`}>{problems.includes(x)?"":"✓ "}{x.replace(/\.$/,"")}</li>)}</ul>
   {problems.filter(x=>!/^(Pick your theory|Pin at least|Write 2 or 3)/.test(x)).map(x=><p key={x} role="alert" className="mt-2 text-[15px] text-[#A33B20]">{x}</p>)}
  </section>
  <button type="button" disabled={problems.length>0} onClick={save} className="case-primary mt-6 min-h-[56px] w-full disabled:opacity-40">Close the case and see what the text says <ArrowRight size={18}/></button>
 </div>;
}
function PinLine({line,on,onTap,tag}:{line:string;on:boolean;onTap:(l:string)=>void;tag:string}){
 return <button type="button" aria-pressed={on} onClick={()=>onTap(line)} className={`mt-2 block w-full rounded-2xl border-l-4 px-3 py-2 text-left ${on?"border-[#A0472C] bg-[#FBEDE5] ring-2 ring-[#A0472C]":"border-[#A0472C] bg-[#FFFDF8]"}`}><span className="block text-[11px] font-bold uppercase tracking-wide text-[#8A3B23]">{tag}{on?" · pinned":""}</span><span className="font-serif text-[15px] leading-6">{displayLine(line)}</span></button>;
}
