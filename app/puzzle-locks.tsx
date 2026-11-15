"use client";
// The puzzle locks (rules: lib/escape-room.ts), each solved only by reading: the code lock (tap the word in a line
// that answers each dial; its letter shows only once it's right), Fix the Painting (mark the painter's mistakes, then
// prove each with a line) and Inspect the Scene (match each object to the line that explains it). One try scores;
// after a miss the right answer is outlined and the student taps it to open the lock (0 points, recorded as a miss).
// Shared by the solo room and the live phones. Every hotspot is a real button, and the same items are listed below
// the picture, so the puzzle works by keyboard and screen reader and at phone width.
import {useMemo,useState} from "react";
import {ArrowRight,Check,KeyRound,LockOpen,Search} from "lucide-react";
import type {LineRef,RoomPuzzle} from "@/lib/world-schema";
import {codeResultOf,dialLetter,dialRight,lineTokens,paintingResult,refKey,sceneResult,sceneTray} from "@/lib/escape-room";

export type PuzzleOutcome={id:string;type:RoomPuzzle["type"];firstTry:boolean[];points:number};
type Code=Extract<RoomPuzzle,{type:"code"}>;type Painting=Extract<RoomPuzzle,{type:"painting"}>;type Scene=Extract<RoomPuzzle,{type:"scene"}>;
const flat=(t:string)=>t.replace(/\s+/g," ").trim();
const KIND:Record<RoomPuzzle["type"],string>={code:"Code lock",painting:"Fix the Painting",scene:"Inspect the Scene"};

// lineOf: a story sentence by paragraph and sentence (solo: from the source; live: the lines the server sent).
export function PuzzleLock({puzzle,lineOf,readLines,seed,onDone,submit}:{puzzle:RoomPuzzle;lineOf:(r:LineRef)=>string|null;readLines:LineRef[];seed:string;onDone:(o:PuzzleOutcome)=>void;
 // Live: the phone sends its first try to the server (which scores it); solo scores here.
 submit?:(answer:Record<string,unknown>)=>void}){
 return <section aria-labelledby="pz-h" className="mx-auto flex w-full max-w-3xl flex-col gap-3">
  <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[13px] font-extrabold text-on-gold"><KeyRound size={14} aria-hidden/>Puzzle lock · {KIND[puzzle.type]}</p>
  <h1 id="pz-h" tabIndex={-1} className="text-[26px] leading-tight outline-none md:text-[30px]">{puzzle.title}</h1>
  {puzzle.prompt&&<p className="text-[17px] font-bold leading-snug">{puzzle.prompt}</p>}
  {puzzle.type==="code"&&<CodeLock p={puzzle} lineOf={lineOf} onDone={onDone} submit={submit}/>}
  {puzzle.type==="painting"&&<PaintingLock p={puzzle} lineOf={lineOf} readLines={readLines} onDone={onDone} submit={submit}/>}
  {puzzle.type==="scene"&&<SceneLock p={puzzle} lineOf={lineOf} seed={seed} onDone={onDone} submit={submit}/>}
 </section>;
}

// ---------- The picture: the approved art with numbered hotspots, or a labeled sketch until the art is approved ----------
function Picture({art,alt,spots,active,onSpot,tone}:{art?:string;alt:string;spots:{id:string;label:string;x:number;y:number}[];active:(id:string)=>"on"|"off"|"right"|"missed";onSpot:(id:string)=>void;tone:"painting"|"scene"}){
 return <div className="relative w-full overflow-hidden rounded-card border-4 border-gold-shadow bg-reading" style={{aspectRatio:"3 / 2"}}>
  {art?<img src={art} alt={alt} className="absolute inset-0 h-full w-full object-cover"/>
   :<div role="img" aria-label={`${alt} (sketch until the painting is approved)`} className="absolute inset-0" style={{background:tone==="painting"?"linear-gradient(#cfe1ef 0 38%,#a9c38a 38% 100%)":"linear-gradient(#2b2a52 0 40%,#4b5a3c 40% 100%)"}}/>}
  {/* Each hotspot is a ring with a clear centre (it frames the object rather than hiding it) and a small number badge. */}
  {spots.map((s,i)=>{const st=active(s.id),tone=st==="on"?"border-primary bg-primary text-on-primary":st==="right"?"border-success bg-success text-on-success":st==="missed"?"border-notyet bg-notyet text-on-notyet":"border-white bg-deep text-ink";
   return <button key={s.id} type="button" onClick={()=>onSpot(s.id)} aria-pressed={st==="on"} aria-label={`${i+1}: ${s.label}`}
   className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-transparent shadow-[0_0_0_2px_rgba(0,0,0,.55),inset_0_0_0_2px_rgba(0,0,0,.35)] ${tone.split(" ")[0]}`} style={{left:`${s.x}%`,top:`${s.y}%`}}>
    <span aria-hidden className={`absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border-2 font-display text-[13px] font-bold ${tone}`}>{i+1}</span></button>})}
  {!art&&<p className="absolute bottom-1 right-2 rounded bg-black/40 px-1.5 text-[11px] font-bold text-white">Sketch: art awaiting approval</p>}
 </div>;
}
// A line the student can tap (a sentence from the story).
function LineButton({text,on,outline,onClick,disabled}:{text:string;on:boolean;outline?:boolean;onClick:()=>void;disabled?:boolean}){
 return <button type="button" disabled={disabled} aria-pressed={on} onClick={onClick} className={`reading-scope w-full rounded-row px-3 py-2 text-left font-serif text-[16px] leading-snug text-reading-ink disabled:opacity-70 ${on?"bg-line-picked shadow-[0_0_0_3px_var(--color-primary)]":outline?"bg-reading shadow-[0_0_0_3px_var(--color-line-wrong-edge)]":"bg-reading"}`}>{flat(text)}</button>;
}
const Opened=({points,of,onDone}:{points:number;of:string;onDone:()=>void})=><div role="status" className="moment-pop flex flex-col gap-3 rounded-card bg-success p-4 text-on-success">
 <p className="flex items-center gap-2 font-display text-[22px] font-bold"><LockOpen size={22} aria-hidden/>The lock is open{points>0?` · +${points.toLocaleString()}`:""}</p><p className="text-[15px] font-bold">{of}</p>
 <button type="button" onClick={onDone} className="case-primary min-h-[52px] w-full justify-center">Go on <ArrowRight size={18} aria-hidden/></button></div>;

// ---------- Code lock ----------
function CodeLock({p,lineOf,onDone,submit}:{p:Code;lineOf:(r:LineRef)=>string|null;onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}){
 const lines=p.dials.map(d=>lineOf(d.line)??"");
 const [taps,setTaps]=useState<(number|null)[]>(()=>p.dials.map(()=>null)),[first,setFirst]=useState<boolean[]|null>(null),[fixed,setFixed]=useState<boolean[]>(()=>p.dials.map(()=>false));
 const ready=taps.every(t=>t!==null);
 function lock(){const r=codeResultOf(p,lines,taps);setFirst(r.right);setFixed(r.right);submit?.({taps})}
 const open=!!first&&fixed.every(Boolean),points=first?first.filter(Boolean).length*150:0;
 return <div className="flex flex-col gap-3">
  <div className="flex justify-center gap-2" aria-label="The code">{p.dials.map((d,k)=><span key={k} className={`grid h-14 w-12 place-items-center rounded-row border-[3px] font-display text-[28px] font-bold ${fixed[k]?"border-gold bg-gold text-on-gold":"border-edge bg-panel text-muted"}`}>{fixed[k]?dialLetter(d):"?"}</span>)}</div>
  {p.dials.map((d,k)=>{const toks=lineTokens(lines[k]),answer=toks.findIndex(t=>dialRight(d,lines[k],t.i)),done=fixed[k],missed=!!first&&!first[k];
   return <fieldset key={k} className="rounded-card bg-panel p-3"><legend className="px-1 font-display text-[18px] font-bold">Dial {k+1}: {d.question}</legend>
    {missed&&!done&&<p className="mb-2 text-[14px] font-bold text-muted">Not yet. The word that answers is outlined: tap it to set this dial.</p>}
    <p className="reading-scope rounded-row bg-reading p-3 font-serif text-[17px] leading-[1.9] text-reading-ink">{toks.map(t=>{const on=taps[k]===t.i,out=missed&&!done&&t.i===answer;
     return <span key={t.i}>{t.i>0?" ":""}<button type="button" disabled={done||(!!first&&!missed)} aria-pressed={on} onClick={()=>{if(!first){setTaps(x=>{const n=[...x];n[k]=t.i;return n})}else if(missed&&t.i===answer)setFixed(f=>{const n=[...f];n[k]=true;return n})}}
      className={`rounded px-0.5 ${done&&t.i===answer?"bg-line-right shadow-[0_0_0_2px_var(--color-line-right-edge)]":on&&!first?"bg-line-picked shadow-[0_0_0_2px_var(--color-primary)]":out?"shadow-[0_0_0_2px_var(--color-line-wrong-edge)]":"hover:bg-line-picked/50"}`}>{t.text}</button></span>})}</p></fieldset>})}
  {!first?<button type="button" disabled={!ready} onClick={lock} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Lock in the code <ArrowRight size={18} aria-hidden/></button>
   :open?<Opened points={points} of={`${first.filter(Boolean).length} of ${p.dials.length} dials right on the first try.`} onDone={()=>onDone({id:p.id,type:"code",firstTry:first,points})}/>
   :<p role="status" className="rounded-row bg-notyet-soft px-3 py-2 text-[15px] font-bold">{first.filter(Boolean).length} of {p.dials.length} dials right. Tap the outlined words to set the rest.</p>}
 </div>;
}

// ---------- Fix the Painting ----------
function PaintingLock({p,lineOf,readLines,onDone,submit}:{p:Painting;lineOf:(r:LineRef)=>string|null;readLines:LineRef[];onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}){
 const [marks,setMarks]=useState<string[]>([]),[step,setStep]=useState<"mark"|"prove"|"done">("mark"),[proofs,setProofs]=useState<Record<string,LineRef|null>>({}),[at,setAt]=useState(0);
 const [result,setResult]=useState<{caught:boolean[];points:number}|null>(null),[fixed,setFixed]=useState<Record<string,boolean>>({});
 const lines=readLines.map(r=>({r,text:lineOf(r)??""})).filter(l=>l.text);
 const wrongs=p.details.filter(d=>d.wrong);
 function lock(){const r=paintingResult(p,marks,proofs);if(typeof r==="string")return;setResult(r);submit?.({marks,proofs});setStep("done")}
 const active=(id:string)=>step==="done"?(p.details.find(d=>d.id===id)?.wrong?(marks.includes(id)&&result?.caught[marks.indexOf(id)]?"right":"missed"):"off"):marks.includes(id)?"on":"off";
 // After the try: every mistake not caught is shown with its line outlined; the student taps it to open the lock.
 const missed=step==="done"&&result?wrongs.filter(d=>!(marks.includes(d.id)&&result.caught[marks.indexOf(d.id)])):[];
 const open=step==="done"&&missed.every(d=>fixed[d.id]);
 const firstTry=wrongs.map(d=>marks.includes(d.id)&&!!result?.caught[marks.indexOf(d.id)]);
 const cur=marks[at];
 return <div className="flex flex-col gap-3">
  <Picture art={p.art} alt={p.alt} tone="painting" spots={p.details} active={active} onSpot={id=>{if(step!=="mark")return;setMarks(m=>m.includes(id)?m.filter(x=>x!==id):m.length>=p.wrong?m:[...m,id])}}/>
  <ol className="grid gap-2 sm:grid-cols-2">{p.details.map((d,i)=>{const st=active(d.id);return <li key={d.id}><button type="button" disabled={step!=="mark"} aria-pressed={marks.includes(d.id)} onClick={()=>setMarks(m=>m.includes(d.id)?m.filter(x=>x!==d.id):m.length>=p.wrong?m:[...m,d.id])}
   className={`flex min-h-11 w-full items-center gap-2 rounded-row px-3 py-2 text-left text-[15px] font-bold ${st==="on"?"bg-primary text-on-primary":st==="right"?"bg-success text-on-success":st==="missed"?"bg-notyet text-on-notyet":"bg-panel text-ink"}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-deep font-display text-ink">{i+1}</span>{d.label}</button></li>})}</ol>
  {step==="mark"&&<><p className="text-[15px] font-bold text-muted">{marks.length} of {p.wrong} marked.</p><button type="button" disabled={marks.length!==p.wrong} onClick={()=>{setAt(0);setStep("prove")}} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Next: prove each mistake <ArrowRight size={18} aria-hidden/></button></>}
  {step==="prove"&&cur&&<div className="flex flex-col gap-2 rounded-card bg-panel p-3"><p className="font-display text-[18px] font-bold">Mistake {at+1} of {p.wrong}: “{p.details.find(d=>d.id===cur)?.label}”. Tap the line that proves the painter wrong.</p>
   {lines.map(l=><LineButton key={refKey(l.r)} text={l.text} on={!!proofs[cur]&&refKey(proofs[cur]!)===refKey(l.r)} onClick={()=>setProofs(x=>({...x,[cur]:l.r}))}/>)}
   <div className="flex gap-2">{at>0&&<button type="button" onClick={()=>setAt(at-1)} className="case-secondary">Back</button>}
    {at+1<marks.length?<button type="button" disabled={!proofs[cur]} onClick={()=>setAt(at+1)} className="case-primary flex-1 justify-center">Next mistake <ArrowRight size={18} aria-hidden/></button>
     :<button type="button" disabled={!marks.every(m=>proofs[m])} onClick={lock} className="case-primary flex-1 justify-center">Lock in <ArrowRight size={18} aria-hidden/></button>}</div></div>}
  {step==="done"&&!open&&<div className="flex flex-col gap-2 rounded-card border-2 border-dashed border-line-wrong-edge bg-panel p-3"><p className="font-display text-[18px] font-bold">Not yet. {missed.length===1?"This is the mistake":"These are the mistakes"} the painter made: tap the outlined line to open the lock.</p>
   {missed.filter(d=>!fixed[d.id]).map(d=>{const ok=d.lines.map(refKey);return <div key={d.id} className="flex flex-col gap-1.5"><p className="text-[15px] font-bold">“{d.label}”</p>
    {lines.filter(l=>ok.includes(refKey(l.r))).map(l=><LineButton key={refKey(l.r)} text={l.text} on={false} outline onClick={()=>setFixed(f=>({...f,[d.id]:true}))}/>)}</div>})}</div>}
  {open&&<Opened points={result?.points??0} of={`${firstTry.filter(Boolean).length} of ${p.wrong} mistakes caught and proven on the first try.`} onDone={()=>onDone({id:p.id,type:"painting",firstTry,points:result?.points??0})}/>}
 </div>;
}

// ---------- Inspect the Scene ----------
function SceneLock({p,lineOf,seed,onDone,submit}:{p:Scene;lineOf:(r:LineRef)=>string|null;seed:string;onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}){
 const tray=useMemo(()=>sceneTray(p,seed),[p,seed]);
 const [sel,setSel]=useState<string>(p.objects[0].id),[matches,setMatches]=useState<Record<string,LineRef|null>>({});
 const [result,setResult]=useState<boolean[]|null>(null),[fixed,setFixed]=useState<Record<string,boolean>>({});
 const used=(r:LineRef,except:string)=>Object.entries(matches).some(([o,m])=>o!==except&&m&&refKey(m)===refKey(r));
 function lock(){const r=sceneResult(p,matches);setResult(r.right);submit?.({matches})}
 const k=p.objects.findIndex(o=>o.id===sel),obj=p.objects[k];
 const done=(id:string)=>!!result&&(result[p.objects.findIndex(o=>o.id===id)]||!!fixed[id]);
 const open=!!result&&p.objects.every(o=>done(o.id)),points=result?result.filter(Boolean).length*150:0;
 const active=(id:string)=>result?(result[p.objects.findIndex(o=>o.id===id)]?"right":fixed[id]?"right":"missed"):id===sel?"on":"off";
 return <div className="flex flex-col gap-3">
  <Picture art={p.art} alt={p.alt} tone="scene" spots={p.objects} active={active} onSpot={setSel}/>
  <div className="flex flex-wrap gap-2" role="group" aria-label="Objects in the scene">{p.objects.map((o,i)=><button key={o.id} type="button" aria-pressed={o.id===sel} onClick={()=>setSel(o.id)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-bold ${o.id===sel?"bg-primary text-on-primary":"bg-panel text-ink"}`}>{i+1}{matches[o.id]?<Check size={14} aria-hidden/>:null}<span className="sr-only">: {o.label}{matches[o.id]?", matched":""}</span></button>)}</div>
  {obj&&<div className="flex flex-col gap-2 rounded-card bg-panel p-3">
   <p className="flex items-center gap-2 font-display text-[18px] font-bold"><Search size={18} className="text-highlight" aria-hidden/>{k+1}. {obj.label}: why is this here?</p>
   {!result&&tray.map(r=><LineButton key={refKey(r)} text={lineOf(r)??""} disabled={used(r,obj.id)} on={!!matches[obj.id]&&refKey(matches[obj.id]!)===refKey(r)} onClick={()=>setMatches(m=>({...m,[obj.id]:r}))}/>)}
   {result&&!done(obj.id)&&<><p className="text-[14px] font-bold text-muted">Not yet. The line that explains it is outlined: tap it.</p><LineButton text={lineOf(obj.line)??""} on={false} outline onClick={()=>setFixed(f=>({...f,[obj.id]:true}))}/></>}
   {result&&done(obj.id)&&<LineButton text={lineOf(obj.line)??""} on={false} onClick={()=>{}} disabled/>}
  </div>}
  {!result&&<button type="button" disabled={!p.objects.every(o=>matches[o.id])} onClick={lock} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Lock in <ArrowRight size={18} aria-hidden/></button>}
  {result&&!open&&<p role="status" className="rounded-row bg-notyet-soft px-3 py-2 text-[15px] font-bold">{result.filter(Boolean).length} of {p.objects.length} matched. Open each object marked in coral and tap its outlined line.</p>}
  {open&&<Opened points={points} of={`${result!.filter(Boolean).length} of ${p.objects.length} objects matched on the first try.`} onDone={()=>onDone({id:p.id,type:"scene",firstTry:result!,points})}/>}
 </div>;
}
