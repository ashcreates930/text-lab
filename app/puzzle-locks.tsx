"use client";
// The puzzle locks (rules: lib/escape-room.ts), each solved only by reading: the code lock (tap the word in a line
// that answers each dial; its letter shows only once it's right), Fix the Painting (find one of the painter's mistakes
// and prove it with a line) and Inspect the Scene (match one object to the line that explains it), one problem at a
// time. One try scores; after a miss the right answer is outlined and the student taps it to go on (0 points,
// recorded as a miss).
// Shared by the solo room and the live phones. Every hotspot is a real button, and the same items are listed below
// the picture, so the puzzle works by keyboard and screen reader and at phone width.
import {useMemo,useState} from "react";
import {ArrowRight,KeyRound,Search} from "lucide-react";
import {Held,LockBadge,LockMoment,PROVED_WORDS} from "./lock-art";
import type {LineRef,RoomPuzzle} from "@/lib/world-schema";
import {PUZZLE_POINTS,dialLetter,dialRight,lineTokens,refKey,sceneTray} from "@/lib/escape-room";

export type PuzzleOutcome={id:string;type:RoomPuzzle["type"];firstTry:boolean[];points:number};
type Code=Extract<RoomPuzzle,{type:"code"}>;type Painting=Extract<RoomPuzzle,{type:"painting"}>;type Scene=Extract<RoomPuzzle,{type:"scene"}>;
const flat=(t:string)=>t.replace(/\s+/g," ").trim();
const KIND:Record<RoomPuzzle["type"],string>={code:"Code lock",painting:"Fix the Painting",scene:"Inspect the Scene"};

// lineOf: a story sentence by paragraph and sentence (solo: from the source; live: the lines the server sent).
export function PuzzleLock({puzzle,lineOf,readLines,readChunks,seed,onDone,submit,sound=false}:{puzzle:RoomPuzzle;lineOf:(r:LineRef)=>string|null;readLines:LineRef[];readChunks?:LineRef[][];seed:string;onDone:(o:PuzzleOutcome)=>void;sound?:boolean;
 // Live: the phone sends its first try to the server (which scores it); solo scores here.
 submit?:(answer:Record<string,unknown>)=>void}){
 // The large padlock at the top stays closed until the last part is checked (open: every part right on the first try).
 const [opened,setOpened]=useState<null|boolean>(null);
 const ends={sound,onOpened:(all:boolean)=>setOpened(all)};
 return <section aria-labelledby="pz-h" className="mx-auto flex w-full max-w-3xl flex-col gap-3">
  <div className="flex items-center gap-3"><LockBadge state={opened===null?"closed":opened?"proved":"quiet"}/>
   <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[13px] font-extrabold text-on-gold"><KeyRound size={14} aria-hidden/>Puzzle lock · {KIND[puzzle.type]}</p></div>
  <h1 id="pz-h" tabIndex={-1} className="text-[26px] leading-tight outline-none md:text-[30px]">{puzzle.title}</h1>
  {puzzle.prompt&&<p className="text-[17px] font-bold leading-snug">{puzzle.prompt}</p>}
  {puzzle.type==="code"&&<CodeLock p={puzzle} lineOf={lineOf} onDone={onDone} submit={submit} {...ends}/>}
  {puzzle.type==="painting"&&<PaintingLock p={puzzle} lineOf={lineOf} readLines={readLines} readChunks={readChunks} onDone={onDone} submit={submit} {...ends}/>}
  {puzzle.type==="scene"&&<SceneLock p={puzzle} lineOf={lineOf} seed={seed} onDone={onDone} submit={submit} {...ends}/>}
 </section>;
}

// ---------- The picture: the approved art with numbered hotspots, or a labeled sketch until the art is approved ----------
function Picture({art,alt,spots,active,onSpot,tone}:{art?:string;alt:string;spots:{id:string;label:string;x:number;y:number}[];active:(id:string)=>"on"|"off"|"right"|"missed";onSpot:(id:string)=>void;tone:"painting"|"scene"}){
 return <div className="relative w-full overflow-hidden rounded-card border-4 border-gold-shadow bg-reading" style={{aspectRatio:"3 / 2"}}>
  {art?<img src={art} alt={alt} className="absolute inset-0 h-full w-full object-cover"/>
   :<div role="img" aria-label={`${alt} (sketch until the painting is approved)`} className="absolute inset-0" style={{background:tone==="painting"?"linear-gradient(#cfe1ef 0 38%,#a9c38a 38% 100%)":"linear-gradient(#2b2a52 0 40%,#4b5a3c 40% 100%)"}}/>}
  {/* Each hotspot is a ring with a clear centre (it frames the object rather than hiding it) and a small number badge. */}
  {/* Paintings use subtle brass rings with no numbers; scenes keep a small number badge. */}
  {spots.map((s,i)=>{const st=active(s.id),painting=tone==="painting",ring=st==="on"?"border-primary bg-primary text-on-primary":st==="right"?"border-success bg-success text-on-success":st==="missed"?"border-notyet bg-notyet text-on-notyet":painting?"border-gold bg-deep text-ink":"border-white bg-deep text-ink";
   return <button key={s.id} type="button" onClick={()=>onSpot(s.id)} aria-pressed={st==="on"} aria-label={painting?s.label:`${i+1}: ${s.label}`}
   className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-transparent shadow-[0_0_0_2px_rgba(0,0,0,.55),inset_0_0_0_2px_rgba(0,0,0,.35)] ${ring.split(" ")[0]}`} style={{left:`${s.x}%`,top:`${s.y}%`}}>
    {!painting&&<span aria-hidden className={`absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border-2 font-display text-[13px] font-bold ${ring}`}>{i+1}</span>}</button>})}
  {!art&&<p className="absolute bottom-1 right-2 rounded bg-black/40 px-1.5 text-[11px] font-bold text-white">Sketch: art awaiting approval</p>}
 </div>;
}
// A line the student can tap (a sentence from the story).
function LineButton({text,on,outline,onClick,disabled}:{text:string;on:boolean;outline?:boolean;onClick:()=>void;disabled?:boolean}){
 return <button type="button" disabled={disabled} aria-pressed={on} onClick={onClick} className={`reading-scope w-full rounded-row px-3 py-2 text-left font-serif text-[16px] leading-snug text-reading-ink disabled:opacity-70 ${on?"bg-line-picked shadow-[0_0_0_3px_var(--color-primary)]":outline?"bg-reading shadow-[0_0_0_3px_var(--color-line-wrong-edge)]":"bg-reading"}`}>{flat(text)}</button>;
}
type Ends={sound?:boolean;onOpened?:(all:boolean)=>void};
const Opened=({all,points,of,onDone,sound}:{all:boolean;points:number;of:string;onDone:()=>void;sound?:boolean})=><div className="flex flex-col gap-3 rounded-card bg-panel p-4">
 <LockMoment kind={all?"proved":"quiet"} sound={sound} size="md" words={all?PROVED_WORDS:"The lock opens. The right answers are set."}/>
 <Held skip={!all}><div className="flex flex-col gap-3"><p className="text-center text-[15px] font-bold">{points>0?`+${points.toLocaleString()} · `:""}{of}</p>
 <button type="button" onClick={onDone} className="case-primary min-h-[52px] w-full justify-center">Go on <ArrowRight size={18} aria-hidden/></button></div></Held></div>;

// ---------- One problem at a time ----------
// Every puzzle lock asks one thing at a time (teacher, 2026-11-15): one dial, one mistake, one object. Each part is
// checked on its own before the next appears. Only its first try counts; after a miss the right answer is outlined and
// the student taps it to go on (0 points for that part). The whole first-try answer goes to the server once, at the end.
const Progress=({at,of,label}:{at:number;of:number;label:string})=><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{label} {Math.min(at+1,of)} of {of}</p>;
const Missed=({text}:{text:string})=><p role="status" className="rounded-row bg-notyet-soft px-3 py-2 text-[15px] font-bold">{text}</p>;

// ---------- Code lock ----------
function CodeLock({p,lineOf,onDone,submit,sound,onOpened}:{p:Code;lineOf:(r:LineRef)=>string|null;onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}&Ends){
 const lines=p.dials.map(d=>lineOf(d.line)??"");
 // taps: each dial's first try; first: whether it was right; at: the dial being worked; fixedAt: a missed dial set with the outlined word.
 const [taps,setTaps]=useState<(number|null)[]>(()=>p.dials.map(()=>null)),[first,setFirst]=useState<(boolean|null)[]>(()=>p.dials.map(()=>null));
 const [at,setAt]=useState(0),[pick,setPick]=useState<number|null>(null),[fixed,setFixed]=useState(false);
 const d=p.dials[at],toks=d?lineTokens(lines[at]):[],answer=d?toks.findIndex(t=>dialRight(d,lines[at],t.i)):-1,checked=first[at]!==null&&first[at]!==undefined,missed=checked&&first[at]===false&&!fixed;
 const done=at>=p.dials.length,right=first.filter(Boolean).length,points=right*PUZZLE_POINTS.dial;
 function check(){if(pick===null)return;const ok=dialRight(d,lines[at],pick);setTaps(x=>{const n=[...x];n[at]=pick;return n});setFirst(x=>{const n=[...x];n[at]=ok;return n})}
 function next(){const n=at+1;setAt(n);setPick(null);setFixed(false);if(n>=p.dials.length){submit?.({taps:taps});onOpened?.(first.every(Boolean))}}
 const set=(k:number)=>first[k]!==null&&(k<at||first[k]||(k===at&&fixed));
 return <div className="flex flex-col gap-3">
  <div className="flex justify-center gap-2" aria-label="The code">{p.dials.map((x,k)=><span key={k} className={`grid h-14 w-12 place-items-center rounded-row border-[3px] font-display text-[28px] font-bold ${set(k)?"border-gold bg-gold text-on-gold":k===at&&!done?"border-primary bg-panel text-muted":"border-edge bg-panel text-muted"}`}>{set(k)?dialLetter(x):"?"}</span>)}</div>
  {!done&&d&&<fieldset key={at} className="rounded-card bg-panel p-3"><Progress at={at} of={p.dials.length} label="Dial"/><legend className="sr-only">Dial {at+1} of {p.dials.length}</legend>
   <p className="mt-1 font-display text-[19px] font-bold">{d.question}</p>
   <p className="mt-1 text-[14px] font-bold text-muted">{missed?"Not yet. The word that answers is outlined: tap it to set this dial.":checked?"Right. The dial is set.":"Tap the word in this line that answers, then check it."}</p>
   <p className="reading-scope mt-2 rounded-row bg-reading p-3 font-serif text-[17px] leading-[1.9] text-reading-ink">{toks.map(t=>{const on=!checked&&pick===t.i,out=missed&&t.i===answer,good=checked&&!missed&&t.i===answer;
    return <span key={t.i}>{t.i>0?" ":""}<button type="button" disabled={checked&&!missed} aria-pressed={on} onClick={()=>{if(!checked)setPick(t.i);else if(missed&&t.i===answer)setFixed(true)}}
     className={`rounded px-0.5 ${good?"bg-line-right shadow-[0_0_0_2px_var(--color-line-right-edge)]":on?"bg-line-picked shadow-[0_0_0_2px_var(--color-primary)]":out?"shadow-[0_0_0_2px_var(--color-line-wrong-edge)]":"hover:bg-line-picked/50"}`}>{t.text}</button></span>})}</p>
   {!checked?<button type="button" disabled={pick===null} onClick={check} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">Check this dial <ArrowRight size={18} aria-hidden/></button>
    :!missed&&<button type="button" onClick={next} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">{at+1<p.dials.length?"Next dial":"Open the lock"} <ArrowRight size={18} aria-hidden/></button>}
  </fieldset>}
  {done&&<Opened all={right===p.dials.length} sound={sound} points={points} of={`${right} of ${p.dials.length} dials right on the first try.`} onDone={()=>onDone({id:p.id,type:"code",firstTry:first.map(Boolean),points})}/>}
 </div>;
}

// ---------- Fix the Painting ----------
// One mistake at a time: tap one thing the painter got wrong, then the line that proves it, and check. After a miss, a
// mistake still to be found is shown with its proof outlined; the student taps the line to go on.
function PaintingLock({p,lineOf,readLines,readChunks,onDone,submit,sound,onOpened}:{p:Painting;lineOf:(r:LineRef)=>string|null;readLines:LineRef[];readChunks?:LineRef[][];onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}&Ends){
 const lines=readLines.map(r=>({r,text:lineOf(r)??""})).filter(l=>l.text),wrongs=p.details.filter(d=>d.wrong);
 // marks/proofs: each mistake's first try (in order); found: wrong details caught or revealed; at: the mistake being worked.
 const [marks,setMarks]=useState<string[]>([]),[proofs,setProofs]=useState<Record<string,LineRef|null>>({}),[found,setFound]=useState<string[]>([]);
 const [at,setAt]=useState(0),[mark,setMark]=useState<string|null>(null),[line,setLine]=useState<LineRef|null>(null),[result,setResult]=useState<null|{ok:boolean;reveal:string|null}>(null),[fixed,setFixed]=useState(false);
 const done=at>=p.wrong,cur=p.details.find(x=>x.id===mark);
 // After a pick: every sentence read so far from the paragraph(s) the detail draws on (a chunk can be just two
 // sentences, too few to read for; the teacher asked for more than two). Not every sentence read so far.
 const groupOf=(refs:LineRef[])=>{const paras=new Set(refs.map(r=>r.p));const g=lines.filter(l=>paras.has(l.r.p)).map(l=>refKey(l.r));return g.length?new Set(g):null};
 const near=cur?groupOf(cur.lines):null,detailLines=near?lines.filter(l=>near.has(refKey(l.r))):lines;
 function check(){if(!mark||!line)return;const d=p.details.find(x=>x.id===mark)!,ok=!!d.wrong&&d.lines.some(l=>refKey(l)===refKey(line));
  setMarks(m=>[...m,mark]);setProofs(x=>({...x,[mark]:line}));
  // A miss shows a mistake still to find: the one they marked if it was wrong, otherwise the first one not found yet.
  const reveal=ok?null:(d.wrong&&!found.includes(d.id)?d.id:wrongs.find(w=>!found.includes(w.id))?.id??null);
  setFound(f=>[...f,ok?mark:reveal].filter((x):x is string=>!!x));setResult({ok,reveal})}
 function next(){const n=at+1;setAt(n);setMark(null);setLine(null);setResult(null);setFixed(false);if(n>=p.wrong){submit?.({marks,proofs});onOpened?.(firstTry.every(Boolean))}}
 const revealed=result?.reveal?p.details.find(x=>x.id===result.reveal):null;
 const active=(id:string)=>found.includes(id)&&!(result&&!result.ok&&!fixed&&id===result.reveal)?"right":result&&!result.ok&&id===result.reveal?"missed":id===mark?"on":"off";
 const firstTry=wrongs.map(w=>{const i=marks.indexOf(w.id);return i>=0&&p.details.find(x=>x.id===w.id)!.lines.some(l=>proofs[w.id]&&refKey(l)===refKey(proofs[w.id]!))});
 const points=firstTry.filter(Boolean).length*PUZZLE_POINTS.mistake;
 const choosable=(id:string)=>!result&&!found.includes(id);
 return <div className="flex flex-col gap-3">
  <Picture art={p.art} alt={p.alt} tone="painting" spots={p.details} active={active} onSpot={id=>{if(choosable(id)){setMark(id);setLine(null)}}}/>
  {!done&&<div className="flex flex-col gap-2 rounded-card bg-panel p-3"><Progress at={at} of={p.wrong} label="Mistake"/>
   {!mark&&!result&&<><p className="font-display text-[18px] font-bold">Tap one thing the painter got wrong.</p>
    <ol className="grid gap-2 sm:grid-cols-2">{p.details.map((x,i)=><li key={x.id}><button type="button" disabled={!choosable(x.id)} onClick={()=>{setMark(x.id);setLine(null)}} className={`flex min-h-11 w-full items-center gap-2 rounded-row px-3 py-2 text-left text-[15px] font-bold disabled:opacity-60 ${found.includes(x.id)?"bg-success text-on-success":"bg-panel-2 text-ink"}`}><span aria-hidden className="h-6 w-6 shrink-0 rounded-full border-[3px] border-gold bg-deep"/>{x.label}{found.includes(x.id)?" (found)":""}</button></li>)}</ol></>}
   {mark&&!result&&cur&&<><p className="font-display text-[18px] font-bold">“{cur.label}”. Now tap the line that proves the painter wrong.</p>
    {detailLines.map(l=><LineButton key={refKey(l.r)} text={l.text} on={!!line&&refKey(line)===refKey(l.r)} onClick={()=>setLine(l.r)}/>)}
    <div className="flex gap-2"><button type="button" onClick={()=>{setMark(null);setLine(null)}} className="case-secondary">Pick another</button>
     <button type="button" disabled={!line} onClick={check} className="case-primary flex-1 justify-center">Check this mistake <ArrowRight size={18} aria-hidden/></button></div></>}
   {result&&(result.ok||fixed)&&<><p role="status" className="font-display text-[18px] font-bold">{result.ok?"Right: that's a mistake, and the line proves it.":"That one's set."}</p>
    <button type="button" onClick={next} className="case-primary min-h-[52px] w-full justify-center">{at+1<p.wrong?"Next mistake":"Open the lock"} <ArrowRight size={18} aria-hidden/></button></>}
   {result&&!result.ok&&!fixed&&revealed&&<><Missed text={`Not yet. One mistake is “${revealed.label}”: tap the outlined line that proves it.`}/>
    {lines.filter(l=>revealed.lines.some(x=>refKey(x)===refKey(l.r))).map(l=><LineButton key={refKey(l.r)} text={l.text} on={false} outline onClick={()=>setFixed(true)}/>)}</>}
  </div>}
  {done&&<Opened all={firstTry.every(Boolean)} sound={sound} points={points} of={`${firstTry.filter(Boolean).length} of ${p.wrong} mistakes caught and proven on the first try.`} onDone={()=>onDone({id:p.id,type:"painting",firstTry,points})}/>}
 </div>;
}

// ---------- Inspect the Scene ----------
// One object at a time, in order: the object glows in the picture, the student picks its line from the tray and checks.
function SceneLock({p,lineOf,seed,onDone,submit,sound,onOpened}:{p:Scene;lineOf:(r:LineRef)=>string|null;seed:string;onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}&Ends){
 const tray=useMemo(()=>sceneTray(p,seed),[p,seed]);
 const [at,setAt]=useState(0),[pick,setPick]=useState<LineRef|null>(null),[matches,setMatches]=useState<Record<string,LineRef|null>>({}),[first,setFirst]=useState<boolean[]>([]),[fixed,setFixed]=useState(false);
 const obj=p.objects[at],done=at>=p.objects.length,checked=first[at]!==undefined,missed=checked&&!first[at]&&!fixed;
 // Lines already explained (matched right, or set after a miss) leave the tray.
 const settled=p.objects.slice(0,at).map(o=>refKey(o.line));
 function check(){if(!pick||!obj)return;setMatches(m=>({...m,[obj.id]:pick}));setFirst(f=>{const n=[...f];n[at]=refKey(pick)===refKey(obj.line);return n})}
 function next(){const n=at+1;setAt(n);setPick(null);setFixed(false);if(n>=p.objects.length){submit?.({matches});onOpened?.(p.objects.every((_,i)=>!!first[i]))}}
 const right=first.filter(Boolean).length,points=right*PUZZLE_POINTS.object;
 const active=(id:string)=>{const i=p.objects.findIndex(o=>o.id===id);return i<at?"right":i===at&&!done?(missed?"missed":"on"):"off"};
 return <div className="flex flex-col gap-3">
  <Picture art={p.art} alt={p.alt} tone="scene" spots={p.objects} active={active} onSpot={()=>{}}/>
  {!done&&obj&&<div key={at} className="flex flex-col gap-2 rounded-card bg-panel p-3"><Progress at={at} of={p.objects.length} label="Object"/>
   <p className="flex items-center gap-2 font-display text-[18px] font-bold"><Search size={18} className="text-highlight" aria-hidden/>{obj.label}: why is this here?</p>
   {!checked&&<>{tray.filter(r=>!settled.includes(refKey(r))).map(r=><LineButton key={refKey(r)} text={lineOf(r)??""} on={!!pick&&refKey(pick)===refKey(r)} onClick={()=>setPick(r)}/>)}
    <button type="button" disabled={!pick} onClick={check} className="case-primary min-h-[52px] w-full justify-center">Check this object <ArrowRight size={18} aria-hidden/></button></>}
   {missed&&<><Missed text="Not yet. The line that explains it is outlined: tap it."/><LineButton text={lineOf(obj.line)??""} on={false} outline onClick={()=>setFixed(true)}/></>}
   {checked&&!missed&&<><p role="status" className="font-display text-[17px] font-bold">{first[at]?"Right: that line explains it.":"That one's set."}</p><LineButton text={lineOf(obj.line)??""} on={false} onClick={()=>{}} disabled/>
    <button type="button" onClick={next} className="case-primary min-h-[52px] w-full justify-center">{at+1<p.objects.length?"Next object":"Open the lock"} <ArrowRight size={18} aria-hidden/></button></>}
  </div>}
  {done&&<Opened all={right===p.objects.length} sound={sound} points={points} of={`${right} of ${p.objects.length} objects matched on the first try.`} onDone={()=>onDone({id:p.id,type:"scene",firstTry:p.objects.map((_,i)=>!!first[i]),points})}/>}
 </div>;
}
