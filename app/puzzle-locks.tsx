"use client";
// The puzzle locks (rules: lib/escape-room.ts), each solved only by reading: the code lock (tap the word in a line
// that answers each dial; its letter shows only once it's right), Fix the Painting (find one of the painter's mistakes,
// then decide sentence by sentence whether each proves the painter wrong) and Inspect the Scene (match one object to
// the line that explains it), one problem at a time. Only the first try scores.
// After a miss the answer is never shown at once (classroom review, 2026-11-20): first a pointer ("It's in the
// paragraph about ... Find the line."), then the paragraph lit after another wrong try, and only after a third the
// line (or word) outlined, the same steps as every other lock. Retries never score.
// Shared by the solo room and the live phones. Every hotspot is a real button, and the same items are listed beside
// the picture, so the puzzle works by keyboard and screen reader. Pictures sit beside the questions on a laptop and
// pinned small above them on a phone, so neither scrolls away.
import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,KeyRound,Search,X} from "lucide-react";
import {Held,LockBadge,LockMoment,PROVED_WORDS} from "./lock-art";
import type {LineRef,RoomPuzzle} from "@/lib/world-schema";
import {PUZZLE_POINTS,dialLetter,dialRight,lineTokens,refKey,sceneTray} from "@/lib/escape-room";

export type PuzzleOutcome={id:string;type:RoomPuzzle["type"];firstTry:boolean[];points:number};
type Code=Extract<RoomPuzzle,{type:"code"}>;type Painting=Extract<RoomPuzzle,{type:"painting"}>;type Scene=Extract<RoomPuzzle,{type:"scene"}>;
type Pointer=(r:LineRef)=>string;
const flat=(t:string)=>t.replace(/\s+/g," ").trim();
const KIND:Record<RoomPuzzle["type"],string>={code:"Code lock",painting:"Fix the Painting",scene:"Inspect the Scene"};
const defaultPointer:Pointer=r=>`It's in paragraph ${Number(r.p.slice(1))}. Find the line.`;

// lineOf: a story sentence by paragraph and sentence (solo: from the source; live: the lines the server sent).
// pointerFor: the pointer after a miss, by the paragraph that holds the answer (lib/engagement.ts pointerText).
export function PuzzleLock({puzzle,lineOf,readLines,readChunks,seed,onDone,submit,sound=false,pointerFor=defaultPointer}:{puzzle:RoomPuzzle;lineOf:(r:LineRef)=>string|null;readLines:LineRef[];readChunks?:LineRef[][];seed:string;onDone:(o:PuzzleOutcome)=>void;sound?:boolean;pointerFor?:Pointer;
 // Live: the phone sends its first try to the server (which scores it); solo scores here.
 submit?:(answer:Record<string,unknown>)=>void}){
 // The large padlock at the top stays closed until the last part is checked (open: every part right on the first try).
 const [opened,setOpened]=useState<null|boolean>(null);
 const ends={sound,onOpened:(all:boolean)=>setOpened(all),pointerFor};
 void readChunks;
 return <section aria-labelledby="pz-h" className={`mx-auto flex w-full flex-col gap-3 ${puzzle.type==="code"?"max-w-3xl":"max-w-6xl"}`}>
  <div className="flex items-center gap-3"><LockBadge state={opened===null?"closed":opened?"proved":"quiet"}/>
   <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[13px] font-extrabold text-on-gold"><KeyRound size={14} aria-hidden/>Puzzle lock · {KIND[puzzle.type]}</p></div>
  <h1 id="pz-h" tabIndex={-1} className="text-[26px] leading-tight outline-none md:text-[30px]">{puzzle.title}</h1>
  {puzzle.prompt&&<p className="text-[17px] font-bold leading-snug">{puzzle.prompt}</p>}
  {puzzle.type==="code"&&<CodeLock p={puzzle} lineOf={lineOf} onDone={onDone} submit={submit} {...ends}/>}
  {puzzle.type==="painting"&&<PaintingLock p={puzzle} lineOf={lineOf} readLines={readLines} onDone={onDone} submit={submit} {...ends}/>}
  {puzzle.type==="scene"&&<SceneLock p={puzzle} lineOf={lineOf} seed={seed} onDone={onDone} submit={submit} {...ends}/>}
 </section>;
}

// ---------- The layout for a picture puzzle ----------
// Laptop (768 px and wider): the picture on the left, pinned while the questions on the right scroll. Phone: a small
// copy of the picture pinned at the top, with the questions scrolling beneath it.
function PictureSplit({picture,children}:{picture:React.ReactNode;children:React.ReactNode}){
 return <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-5">
  <div className="puzzle-pic sticky top-[calc(var(--header-h,0px)+var(--hud-h,0px)+4px)] z-10 -mx-4 bg-stage px-4 pb-2 md:mx-0 md:px-0 md:pb-0">
   <div className="mx-auto w-[min(100%,34vh)] md:w-full">{picture}</div></div>
  <div className="flex min-w-0 flex-col gap-3">{children}</div>
 </div>;
}

// ---------- The picture: the approved art with hotspots, or a labeled sketch until the art is approved ----------
function Picture({art,alt,spots,active,onSpot,tone}:{art?:string;alt:string;spots:{id:string;label:string;x:number;y:number}[];active:(id:string)=>"on"|"off"|"right"|"missed";onSpot:(id:string)=>void;tone:"painting"|"scene"}){
 return <div className="relative w-full overflow-hidden rounded-card border-4 border-gold-shadow bg-reading" style={{aspectRatio:"3 / 2"}}>
  {art?<img src={art} alt={alt} className="absolute inset-0 h-full w-full object-cover"/>
   :<div role="img" aria-label={`${alt} (sketch until the painting is approved)`} className="absolute inset-0" style={{background:tone==="painting"?"linear-gradient(#cfe1ef 0 38%,#a9c38a 38% 100%)":"linear-gradient(#2b2a52 0 40%,#4b5a3c 40% 100%)"}}/>}
  {/* Each hotspot is a ring with a clear center (it frames the object rather than hiding it). Paintings use subtle
      brass rings with no numbers; scenes keep a small number badge. */}
  {spots.map((s,i)=>{const st=active(s.id),painting=tone==="painting",ring=st==="on"?"border-primary bg-primary text-on-primary":st==="right"?"border-success bg-success text-on-success":st==="missed"?"border-notyet bg-notyet text-on-notyet":painting?"border-gold bg-deep text-ink":"border-white bg-deep text-ink";
   return <button key={s.id} type="button" onClick={()=>onSpot(s.id)} aria-pressed={st==="on"} aria-label={painting?s.label:`${i+1}: ${s.label}`}
   className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-transparent shadow-[0_0_0_2px_rgba(0,0,0,.55),inset_0_0_0_2px_rgba(0,0,0,.35)] max-md:h-8 max-md:w-8 md:h-11 md:w-11 ${ring.split(" ")[0]}`} style={{left:`${s.x}%`,top:`${s.y}%`}}>
    {!painting&&<span aria-hidden className={`absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border-2 font-display text-[13px] font-bold ${ring}`}>{i+1}</span>}</button>})}
  {!art&&<p className="absolute bottom-1 right-2 rounded bg-black/40 px-1.5 text-[11px] font-bold text-white">Sketch: art awaiting approval</p>}
 </div>;
}
// A line the student can tap (a sentence from the story). lit: part of the paragraph shown as a hint; outline: the line itself.
function LineButton({text,on,outline,lit,onClick,disabled}:{text:string;on:boolean;outline?:boolean;lit?:boolean;onClick:()=>void;disabled?:boolean}){
 return <button type="button" disabled={disabled} aria-pressed={on} onClick={onClick} className={`reading-scope w-full rounded-row px-3 py-2 text-left font-serif text-[16px] leading-snug text-reading-ink disabled:opacity-70 ${on?"bg-line-picked shadow-[0_0_0_3px_var(--color-primary)]":outline?"bg-reading shadow-[0_0_0_3px_var(--color-line-wrong-edge)]":lit?"bg-gold-soft":"bg-reading"}`}>{flat(text)}</button>;
}
type Ends={sound?:boolean;onOpened?:(all:boolean)=>void;pointerFor:Pointer};
const Opened=({all,points,of,onDone,sound}:{all:boolean;points:number;of:string;onDone:()=>void;sound?:boolean})=><div className="flex flex-col gap-3 rounded-card bg-panel p-4">
 <LockMoment kind={all?"proved":"quiet"} sound={sound} size="md" words={all?PROVED_WORDS:"The lock opens. The right answers are set."}/>
 <Held skip={!all}><div className="flex flex-col gap-3"><p className="text-center text-[15px] font-bold">{points>0?`+${points.toLocaleString()} · `:""}{of}</p>
 <button type="button" onClick={onDone} className="case-primary min-h-[52px] w-full justify-center">Go on <ArrowRight size={18} aria-hidden/></button></div></Held></div>;

// ---------- One problem at a time, and the hint steps after a miss ----------
const Progress=({at,of,label}:{at:number;of:number;label:string})=><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{label} {Math.min(at+1,of)} of {of}</p>;
// level 0: the pointer to the paragraph; 1: the paragraph lit; 2: the line (or word) outlined. Never the answer at once.
export const HINT_LINE=2;
// The hint scrolls into view only if it's hidden (on a phone, under the pinned picture); otherwise nothing moves.
function Hint({level,pointer,what}:{level:number;pointer:string;what:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{ref.current?.scrollIntoView({block:"nearest"})},[level]);
 return <div ref={ref} role="status" className="flex scroll-mt-[calc(var(--header-h,0px)+var(--hud-h,0px)+min(36vh,280px))] scroll-mb-4 flex-col gap-1 rounded-row bg-notyet-soft px-3 py-2 text-[15px] font-bold text-ink md:scroll-mt-[calc(var(--header-h,0px)+var(--hud-h,0px)+12px)]">
  <span>Not yet. {level===0?pointer:level===1?`The paragraph is lit up. The ${what} is in it.`:`Now the ${what} is outlined: tap it.`}</span>
  {level===0&&<span className="text-[13px] font-semibold text-muted">Try again. This try doesn't score; it opens the lock.</span>}</div>;
}

// ---------- Code lock ----------
function CodeLock({p,lineOf,onDone,submit,sound,onOpened,pointerFor}:{p:Code;lineOf:(r:LineRef)=>string|null;onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}&Ends){
 const lines=p.dials.map(d=>lineOf(d.line)??"");
 // taps: each dial's first try; first: whether it was right; at: the dial being worked; level: hint steps after a miss
 // (null before any miss); set: the dial is opened (right first try, or found during the hint steps).
 const [taps,setTaps]=useState<(number|null)[]>(()=>p.dials.map(()=>null)),[first,setFirst]=useState<(boolean|null)[]>(()=>p.dials.map(()=>null));
 const [at,setAt]=useState(0),[pick,setPick]=useState<number|null>(null),[level,setLevel]=useState<number|null>(null),[found,setFound]=useState(false);
 const d=p.dials[at],toks=d?lineTokens(lines[at]):[],answer=d?toks.findIndex(t=>dialRight(d,lines[at],t.i)):-1;
 const firstDone=first[at]!==null&&first[at]!==undefined,open=firstDone&&(first[at]||found),hinting=firstDone&&!open;
 const done=at>=p.dials.length,right=first.filter(Boolean).length,points=right*PUZZLE_POINTS.dial;
 function check(){if(pick===null)return;const ok=dialRight(d,lines[at],pick);
  if(!firstDone){setTaps(x=>{const n=[...x];n[at]=pick;return n});setFirst(x=>{const n=[...x];n[at]=ok;return n});if(!ok){setLevel(0);setPick(null)}return}
  if(ok)setFound(true);else{setLevel(l=>Math.min(HINT_LINE,(l??0)+1));setPick(null)}}
 function next(){const n=at+1;setAt(n);setPick(null);setLevel(null);setFound(false);if(n>=p.dials.length){submit?.({taps:taps});onOpened?.(first.every(Boolean))}}
 const set=(k:number)=>first[k]!==null&&(k<at||(k===at&&open));
 const outlined=hinting&&level===HINT_LINE;
 return <div className="flex flex-col gap-3">
  <div className="flex justify-center gap-2" aria-label="The code">{p.dials.map((x,k)=><span key={k} className={`grid h-14 w-12 place-items-center rounded-row border-[3px] font-display text-[28px] font-bold ${set(k)?"border-gold bg-gold text-on-gold":k===at&&!done?"border-primary bg-panel text-muted":"border-edge bg-panel text-muted"}`}>{set(k)?dialLetter(x):"?"}</span>)}</div>
  {!done&&d&&<fieldset key={at} className="rounded-card bg-panel p-3"><Progress at={at} of={p.dials.length} label="Dial"/><legend className="sr-only">Dial {at+1} of {p.dials.length}</legend>
   <p className="mt-1 font-display text-[19px] font-bold">{d.question}</p>
   {hinting?<div className="mt-1"><Hint level={level??0} pointer={pointerFor(d.line).replace("Find the line.","Find the word in this sentence.")} what="word"/></div>
    :<p className="mt-1 text-[14px] font-bold text-muted">{open?(first[at]?"Right. The dial is set.":"That's it. The dial is set."):"Tap the word in this line that answers, then check it."}</p>}
   <p className={`reading-scope mt-2 rounded-row p-3 font-serif text-[17px] leading-[1.9] text-reading-ink ${hinting&&(level??0)>=1?"bg-gold-soft":"bg-reading"}`}>{toks.map(t=>{const on=!open&&pick===t.i,out=outlined&&t.i===answer,good=open&&t.i===answer;
    return <span key={t.i}>{t.i>0?" ":""}<button type="button" disabled={open} aria-pressed={on} onClick={()=>setPick(t.i)}
     className={`rounded px-0.5 ${good?"bg-line-right shadow-[0_0_0_2px_var(--color-line-right-edge)]":on?"bg-line-picked shadow-[0_0_0_2px_var(--color-primary)]":out?"shadow-[0_0_0_2px_var(--color-line-wrong-edge)]":"hover:bg-line-picked/50"}`}>{t.text}</button></span>})}</p>
   {!open?<button type="button" disabled={pick===null} onClick={check} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">{hinting?"Try this word":"Check this dial"} <ArrowRight size={18} aria-hidden/></button>
    :<button type="button" onClick={next} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">{at+1<p.dials.length?"Next dial":"Open the lock"} <ArrowRight size={18} aria-hidden/></button>}
  </fieldset>}
  {done&&<Opened all={right===p.dials.length} sound={sound} points={points} of={`${right} of ${p.dials.length} dials right on the first try.`} onDone={()=>onDone({id:p.id,type:"code",firstTry:first.map(Boolean),points})}/>}
 </div>;
}

// ---------- Fix the Painting ----------
// One mistake at a time. Pick one thing the painter got wrong; then the paragraph's sentences slide in one at a time,
// each asking "Does this prove the painter wrong?". The first Yes is the answer, the only one scored. Saying No to the
// sentence that proves it is a miss. Back returns to the previous sentence before a Yes. A No to every sentence means
// the painter got that detail right: the student picks another (no penalty, nothing was answered).
// After a miss, the hint steps: a pointer to the paragraph that holds a mistake still to find, then that paragraph's
// sentences lit, then the mistake named and its line outlined. Retries never score.
function PaintingLock({p,lineOf,readLines,onDone,submit,sound,onOpened,pointerFor}:{p:Painting;lineOf:(r:LineRef)=>string|null;readLines:LineRef[];onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}&Ends){
 const lines=readLines.map(r=>({r,text:lineOf(r)??""})).filter(l=>l.text),wrongs=p.details.filter(d=>d.wrong);
 // marks/proofs: each mistake's first try (one detail per mistake; proof null after a No to the proving sentence).
 // found: mistakes caught or found during the hint steps; cleared: details the student judged right (all No).
 const [marks,setMarks]=useState<string[]>([]),[proofs,setProofs]=useState<Record<string,LineRef|null>>({}),[found,setFound]=useState<string[]>([]),[cleared,setCleared]=useState<string[]>([]);
 const [at,setAt]=useState(0),[mark,setMark]=useState<string|null>(null),[idx,setIdx]=useState(0),[level,setLevel]=useState<number|null>(null),[status,setStatus]=useState<null|"right"|"found"|"cleared">(null);
 const done=at>=p.wrong,cur=p.details.find(x=>x.id===mark),firstDone=marks.length>at,hinting=firstDone&&status!=="right"&&status!=="found";
 // The mistake the hints point to: the one marked first if it was a mistake not yet found, else the first not found.
 const target=hinting?(()=>{const m=p.details.find(x=>x.id===marks[at]);return m?.wrong&&!found.includes(m.id)?m:wrongs.find(w=>!found.includes(w.id))??null})():null;
 // The sentences for a detail: every sentence read so far from the paragraph(s) it draws on.
 const sentencesFor=(refs:LineRef[])=>{const paras=new Set(refs.map(r=>r.p));return lines.filter(l=>paras.has(l.r.p))};
 const shown=cur?sentencesFor(cur.lines):[],s=shown[idx];
 const litParas=new Set(target&&(level??0)>=1?target.lines.map(r=>r.p):[]);
 const proves=(d:typeof cur,r:LineRef)=>!!d?.wrong&&d.lines.some(l=>refKey(l)===refKey(r));
 function pickDetail(id:string){setMark(id);setIdx(0);setStatus(null)}
 function miss(){setLevel(l=>l===null?0:Math.min(HINT_LINE,l+1));setMark(null);setIdx(0)}
 function answer(yes:boolean){if(!cur||!s)return;const correct=proves(cur,s.r);
  if(!firstDone){
   if(yes){setMarks(m=>[...m,cur.id]);setProofs(x=>({...x,[cur.id]:s.r}));if(correct){setFound(f=>[...f,cur.id]);setStatus("right")}else miss();return}
   if(correct){setMarks(m=>[...m,cur.id]);setProofs(x=>({...x,[cur.id]:null}));miss();return}
  }else{
   if(yes){if(correct&&!found.includes(cur.id)){setFound(f=>[...f,cur.id]);setStatus("found")}else miss();return}
   if(correct){miss();return}
  }
  if(idx+1<shown.length)setIdx(idx+1);else{if(!firstDone&&!cur.wrong)setCleared(c=>[...c,cur.id]);setMark(null);setIdx(0);setStatus(firstDone?null:"cleared")}}
 function next(){const n=at+1;setAt(n);setMark(null);setIdx(0);setLevel(null);setStatus(null);if(n>=p.wrong){submit?.({marks,proofs});onOpened?.(firstTry.every(Boolean))}}
 const firstTry=wrongs.map(w=>marks.includes(w.id)&&!!proofs[w.id]&&w.lines.some(l=>refKey(l)===refKey(proofs[w.id]!)));
 const points=firstTry.filter(Boolean).length*PUZZLE_POINTS.mistake;
 // First tries: a detail already used for a first try (or judged right) can't be picked again; hints: any not found.
 const choosable=(id:string)=>!found.includes(id)&&(hinting?true:!marks.includes(id)&&!cleared.includes(id));
 const active=(id:string)=>found.includes(id)?"right":id===mark?"on":hinting&&level===HINT_LINE&&target?.id===id?"missed":"off";
 const lineHint=hinting&&level===HINT_LINE&&target;
 return <PictureSplit picture={<Picture art={p.art} alt={p.alt} tone="painting" spots={p.details} active={active} onSpot={id=>{if(choosable(id)&&!lineHint)pickDetail(id)}}/>}>
  {!done&&<div className="flex flex-col gap-2 rounded-card bg-panel p-3"><Progress at={at} of={p.wrong} label="Mistake"/>
   {hinting&&target&&<Hint level={level??0} pointer={pointerFor(target.lines[0])} what="line"/>}
   {status==="cleared"&&!mark&&<p role="status" className="rounded-row bg-panel-2 px-3 py-2 text-[15px] font-bold">None of those sentences proves the painter wrong about that, so the painter got it right. Pick another detail.</p>}
   {/* Pick a detail */}
   {!mark&&status!=="right"&&status!=="found"&&!lineHint&&<><p className="font-display text-[18px] font-bold">{hinting?"Pick the detail the painter got wrong.":"Tap one thing the painter got wrong."}</p>
    <ol className="grid gap-2 sm:grid-cols-2">{p.details.map(x=><li key={x.id}><button type="button" disabled={!choosable(x.id)} onClick={()=>pickDetail(x.id)} className={`flex min-h-11 w-full items-center gap-2 rounded-row px-3 py-2 text-left text-[15px] font-bold disabled:opacity-60 ${found.includes(x.id)?"bg-success text-on-success":"bg-panel-2 text-ink"}`}><span aria-hidden className="h-6 w-6 shrink-0 rounded-full border-[3px] border-gold bg-deep"/>{x.label}{found.includes(x.id)?" (found)":cleared.includes(x.id)?" (matches the story)":""}</button></li>)}</ol></>}
   {/* The last hint: the mistake named and its line outlined */}
   {lineHint&&<><p className="font-display text-[18px] font-bold">One mistake is “{target.label}”. Tap the outlined line that proves it.</p>
    {sentencesFor(target.lines).map(l=><LineButton key={refKey(l.r)} text={l.text} on={false} outline={target.lines.some(x=>refKey(x)===refKey(l.r))} lit={!target.lines.some(x=>refKey(x)===refKey(l.r))} onClick={()=>{if(target.lines.some(x=>refKey(x)===refKey(l.r))){setFound(f=>[...f,target.id]);setStatus("found")}}}/>)}</>}
   {/* One sentence at a time */}
   {mark&&cur&&s&&!lineHint&&<>
    <p className="font-display text-[18px] font-bold">“{cur.label}”</p>
    <p className="text-[13px] font-extrabold uppercase tracking-[.08em] text-muted">Sentence {idx+1} of {shown.length}</p>
    <div key={`${mark}-${idx}`} className="sentence-in"><p data-sentence className={`reading-scope rounded-row px-3 py-2 font-serif text-[17px] leading-snug text-reading-ink ${litParas.has(s.r.p)?"bg-gold-soft":"bg-reading"}`}>{flat(s.text)}</p></div>
    <p className="font-bold">Does this prove the painter wrong?</p>
    <div className="grid grid-cols-2 gap-2">
     <button type="button" onClick={()=>answer(true)} className="case-primary min-h-[52px] justify-center"><Check size={18} aria-hidden/>Yes</button>
     <button type="button" onClick={()=>answer(false)} className="case-secondary min-h-[52px] justify-center"><X size={18} aria-hidden/>No</button></div>
    <div className="flex flex-wrap gap-2">{idx>0&&<button type="button" onClick={()=>setIdx(idx-1)} className="case-secondary !min-h-11"><ArrowLeft size={16} aria-hidden/>Back</button>}
     <button type="button" onClick={()=>{setMark(null);setIdx(0)}} className="case-secondary !min-h-11">Pick another detail</button></div></>}
   {(status==="right"||status==="found")&&<><p role="status" className="font-display text-[18px] font-bold">{status==="right"?"Right: that's a mistake, and the sentence proves it.":"That's it. That mistake is found."}</p>
    <button type="button" onClick={next} className="case-primary min-h-[52px] w-full justify-center">{at+1<p.wrong?"Next mistake":"Open the lock"} <ArrowRight size={18} aria-hidden/></button></>}
  </div>}
  {done&&<Opened all={firstTry.every(Boolean)} sound={sound} points={points} of={`${firstTry.filter(Boolean).length} of ${p.wrong} mistakes caught and proven on the first try.`} onDone={()=>onDone({id:p.id,type:"painting",firstTry,points})}/>}
 </PictureSplit>;
}

// ---------- Inspect the Scene ----------
// One object at a time, in order: the object glows in the picture, the student picks its line from the tray and
// checks. After a miss: the pointer to the paragraph, then that paragraph's lines lit in the tray, then the line outlined.
function SceneLock({p,lineOf,seed,onDone,submit,sound,onOpened,pointerFor}:{p:Scene;lineOf:(r:LineRef)=>string|null;seed:string;onDone:(o:PuzzleOutcome)=>void;submit?:(a:Record<string,unknown>)=>void}&Ends){
 const tray=useMemo(()=>sceneTray(p,seed),[p,seed]);
 const [at,setAt]=useState(0),[pick,setPick]=useState<LineRef|null>(null),[matches,setMatches]=useState<Record<string,LineRef|null>>({}),[first,setFirst]=useState<boolean[]>([]),[level,setLevel]=useState<number|null>(null),[found,setFound]=useState(false);
 const obj=p.objects[at],done=at>=p.objects.length,firstDone=first[at]!==undefined,open=firstDone&&(first[at]||found),hinting=firstDone&&!open;
 // Lines already explained (matched right, or found after a miss) leave the tray.
 const settled=p.objects.slice(0,at).map(o=>refKey(o.line));
 function check(){if(!pick||!obj)return;const ok=refKey(pick)===refKey(obj.line);
  if(!firstDone){setMatches(m=>({...m,[obj.id]:pick}));setFirst(f=>{const n=[...f];n[at]=ok;return n});if(!ok){setLevel(0);setPick(null)}return}
  if(ok)setFound(true);else{setLevel(l=>Math.min(HINT_LINE,(l??0)+1));setPick(null)}}
 function next(){const n=at+1;setAt(n);setPick(null);setLevel(null);setFound(false);if(n>=p.objects.length){submit?.({matches});onOpened?.(p.objects.every((_,i)=>!!first[i]))}}
 const right=first.filter(Boolean).length,points=right*PUZZLE_POINTS.object;
 const active=(id:string)=>{const i=p.objects.findIndex(o=>o.id===id);return i<at?"right":i===at&&!done?(hinting&&level===HINT_LINE?"missed":"on"):"off"};
 return <PictureSplit picture={<Picture art={p.art} alt={p.alt} tone="scene" spots={p.objects} active={active} onSpot={()=>{}}/>}>
  {!done&&obj&&<div key={at} className="flex flex-col gap-2 rounded-card bg-panel p-3"><Progress at={at} of={p.objects.length} label="Object"/>
   <p className="flex items-center gap-2 font-display text-[18px] font-bold"><Search size={18} className="text-highlight" aria-hidden/>{obj.label}: why is this here?</p>
   {hinting&&<Hint level={level??0} pointer={pointerFor(obj.line)} what="line"/>}
   {!open&&<>{tray.filter(r=>!settled.includes(refKey(r))).map(r=><LineButton key={refKey(r)} text={lineOf(r)??""} on={!!pick&&refKey(pick)===refKey(r)} lit={hinting&&level===1&&r.p===obj.line.p} outline={hinting&&level===HINT_LINE&&refKey(r)===refKey(obj.line)} onClick={()=>setPick(r)}/>)}
    <button type="button" disabled={!pick} onClick={check} className="case-primary min-h-[52px] w-full justify-center">{hinting?"Try this line":"Check this object"} <ArrowRight size={18} aria-hidden/></button></>}
   {open&&<><p role="status" className="font-display text-[17px] font-bold">{first[at]?"Right: that line explains it.":"That's it: that line explains it."}</p><LineButton text={lineOf(obj.line)??""} on={false} onClick={()=>{}} disabled/>
    <button type="button" onClick={next} className="case-primary min-h-[52px] w-full justify-center">{at+1<p.objects.length?"Next object":"Open the lock"} <ArrowRight size={18} aria-hidden/></button></>}
  </div>}
  {done&&<Opened all={right===p.objects.length} sound={sound} points={points} of={`${right} of ${p.objects.length} objects matched on the first try.`} onDone={()=>onDone({id:p.id,type:"scene",firstTry:p.objects.map((_,i)=>!!first[i]),points})}/>}
 </PictureSplit>;
}
