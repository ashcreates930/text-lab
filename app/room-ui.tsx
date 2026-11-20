"use client";
// The escape room's screens (rules: lib/escape-room.ts), shared by the solo room and the live phones: the door at the
// start, the lock banner above each question, opening a lock after a miss with the answer shown, the Case File drawer,
// the inner door between the chambers, the recap that opens chamber 2, a saved stop, and the escape moment. Every
// moment is a still card under reduced motion.
import {DoorVocab} from "./story-opening";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {createPortal} from "react-dom";
import {ArrowRight,BookOpen,KeyRound,Map as MapIcon,Timer,X} from "lucide-react";
import {DoorGlyph,DoorScene,LockBadge,Padlock} from "./lock-art";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Answer,Token} from "@/lib/expedition";
import {LOCK_INFO,type InventoryItem,type LockKind,type Recovery,type Room} from "@/lib/escape-room";
import {AnswerBars,ChunkText,MultiBars,type ChunkView} from "./expedition-race";
import {DragDrop,type DndView} from "./drag-drop";
import {ReadingPanel} from "./reading-panel";
import {DoNow} from "./practice-round";
import {DO_NOW} from "@/lib/onboarding";
import {HINT_STEPS,hintStep} from "@/lib/engagement";

// ---------- Above every question: a large closed padlock, and which lock this is ----------
export function LockBanner({lock,of,kind}:{lock:number;of:number;kind:LockKind}){
 return <div className="mt-2 flex items-center gap-3"><LockBadge state="closed"/>
  <p className="inline-flex w-fit items-center rounded-full bg-panel px-3 py-1 text-[13px] font-extrabold text-ink">Lock {lock} of {of} · {LOCK_INFO[kind].name}<span className="sr-only">, locked</span></p></div>;
}

// ---------- The door: where the student is, and what opens the way out ----------
// The briefing at every room's door (teacher, 2026-11-20): a short scenario in the story's voice, the one or two key
// concepts the room explores, the vocabulary, then "Start the clock" when the escape timer is on.
export function RoomDoor({room,onOpen,resumed=false,vocab=[],lineOf,briefing=null,concepts=[],timer=false}:{room:Room;onOpen:()=>void;resumed?:boolean;vocab?:{word:string;meaning:string;line:{p:string;s:number}}[];lineOf?:(r:{p:string;s:number})=>string|null;briefing?:{scenario:string;concepts:string[]}|null;concepts?:{name:string;teaser:string}[];timer?:boolean}){
 const [c1,c2]=room.chambers;
 return <section aria-labelledby="ex-h" className="mx-auto flex w-full max-w-xl flex-col gap-4 pt-2">
  <DoNow text={DO_NOW.door}/>
  <div className="rounded-[24px] bg-panel p-5 shadow-[0_8px_0_#0B0920]">
   <div className="flex items-center gap-3"><span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-deep text-highlight"><DoorGlyph size={30}/></span>
    <div><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Room {room.number}</p><h1 id="ex-h" className="text-[28px] leading-tight outline-none">{room.name}</h1></div></div>
   {briefing?<p className="mt-3 font-serif text-[18px] leading-relaxed">{briefing.scenario}</p>
    :<p className="mt-3 text-[17px] font-bold leading-snug">{room.door??"Every lock in this room opens only with proof from the story. Read closely, prove each answer, and find the way out."}</p>}
   {briefing&&briefing.concepts.length>0&&<div className="mt-3 flex flex-col gap-1.5"><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">This room explores</p>
    {briefing.concepts.map(n=>{const c=concepts.find(x=>x.name===n);return <p key={n} className="rounded-row bg-panel-2 px-3 py-2 text-[15px]"><b className="font-display text-gold">{n}.</b> {c?.teaser}</p>})}</div>}
   <ul className="mt-3 flex flex-col gap-1.5 text-[15px]">
    {c1&&<li className="flex items-center gap-2"><KeyRound size={16} className="shrink-0 text-gold" aria-hidden/>Chamber 1: locks {c1.from+1} to {c1.to+1}, then the inner door.</li>}
    {c2&&<li className="flex items-center gap-2"><KeyRound size={16} className="shrink-0 text-gold" aria-hidden/>Chamber 2: locks {c2.from+1} to {c2.to+1}.</li>}
    {room.exit==="name_liar"&&<li className="flex items-center gap-2"><DoorGlyph size={16} className="shrink-0 text-gold"/>The exit door: name the witness who lied, and prove it.</li>}
   </ul>
  </div>
  {/* The hard words before the reading (lib/engagement.ts): plain meaning and the sentence each comes from. */}
  {lineOf&&<DoorVocab vocab={vocab} lineOf={lineOf}/>}
  {timer&&!resumed&&<p className="flex items-center gap-2 text-[15px] font-bold"><Timer size={18} className="shrink-0 text-gold" aria-hidden/>Each chamber has an escape timer. It runs while you read, too. If it runs out, keep going: your work still counts.</p>}
  <button type="button" onClick={onOpen} className="case-primary min-h-[56px] w-full justify-center text-[18px]">{timer?<Timer size={18} aria-hidden/>:null}{resumed?(timer?"Back into the room: the clock runs again":"Back into the room"):timer?"Start the clock":"Open the door"}{timer?null:<ArrowRight size={18} aria-hidden/>}</button>
 </section>;
}

// ---------- After a miss: back into the text, then a little more help each wrong tap (0 points, recorded as a miss) ----------
// Reading is the way through (lib/engagement.ts): first a pointer to the paragraph by its topic ("It's in the paragraph
// about ..."), then that paragraph lit after a wrong tap, and only after another the proof line outlined and the
// answer shown, so a struggling reader is never stranded. task: what to do (lib/escape-room.ts recoveryTask);
// shownLines: the proof sentences (line indexes); paraLines: every sentence of the paragraph that holds the proof;
// answerText: the right answer in words, for choices and choose two; reveal: the full key (shown at the last step).
export function RecoveryPanel({task,chunk,world,tokens,shownLines,paraLines=[],pointer,reveal,answerText,clueWords,choices,dnd,callPassages,onOpen,seed}:{task:Recovery;chunk:ChunkView;world:WorldPack;tokens:Token[];shownLines:number[];paraLines?:number[];pointer?:string;reveal?:ReactNode;answerText?:string|null;clueWords?:string[];choices?:string[]|null;dnd?:DndView|null;callPassages?:{id:string;text:string}[]|null;onOpen:(a:Answer)=>boolean|Promise<boolean>;seed?:string}){
 const [draft,setDraft]=useState<Answer>({}),[level,setLevel]=useState(0),[wrong,setWrong]=useState(false),[busy,setBusy]=useState(false);
 const step=hintStep(level),full=step==="line";
 const ready=task==="proof_line"?!!draft.lines?.length:task==="clue_words"?!!draft.words?.length:task==="pieces"?Object.values(draft.placed??{}).filter(Boolean).length>=(dnd?.items.length??1):task==="picks"?(draft.picks?.length??0)>0:task==="pinboard"?(draft.lines?.length??0)===2:draft.choice!=null;
 async function open(){setBusy(true);const ok=await onOpen(draft);setBusy(false);setWrong(!ok);if(!ok)setLevel(l=>Math.min(HINT_STEPS-1,l+1))}
 const how=!full?(task==="proof_line"?"Read it again and tap the sentence that proves it. Then tap Open the lock."
   :task==="clue_words"?"Read it again and tap the clue words that show the meaning. Then tap Open the lock."
   :task==="pieces"?"Read it again and put every piece where the text says it goes. Then tap Open the lock."
   :task==="picks"?"Read it again and pick the answers the text proves. Then tap Open the lock."
   :task==="pinboard"?"Read it again and pin the two lines that prove it. Then tap Open the lock.":"Read it again and pick the answer the text proves. Then tap Open the lock.")
  :task==="proof_line"?"Tap the outlined sentence: that's the proof. Then tap Open the lock."
  :task==="clue_words"?`Tap the clue words in the passage${clueWords?.length?` (${clueWords.map(w=>`"${w}"`).join(", ")})`:""}, then tap Open the lock.`
  :task==="pieces"?"Put every piece where the answer below shows it, then tap Open the lock."
  :task==="picks"?"Pick the answers shown, then tap Open the lock."
  :task==="pinboard"?"Pin the two lines shown as the proof, then tap Open the lock.":"Pick the answer shown, then tap Open the lock.";
 // The passage's highlight: nothing at first (find it yourself), then the paragraph, then the proof line.
 const lit=step==="pointer"?[]:step==="paragraph"?(paraLines.length?paraLines:[]):shownLines;
 return <div className="mt-4 flex flex-col gap-3 rounded-card border-2 border-dashed border-line-wrong-edge bg-panel p-4">
  <p className="flex items-center gap-2 font-display text-[19px] font-bold"><KeyRound size={18} className="text-gold" aria-hidden/>Find the proof to open the lock</p>
  {pointer&&<p className="rounded-row bg-gold-soft px-3 py-2 text-[16px] font-bold text-ink">{pointer}</p>}
  {step==="paragraph"&&<p className="text-[15px] font-bold">The paragraph is lit up below. The proof is one of its sentences.</p>}
  <p className="text-[15px] font-bold text-muted">{how}</p>
  {full&&answerText&&<p className="rounded-row bg-violet-soft px-3 py-2 text-[15px]"><b>The answer:</b> {answerText}</p>}
  {full&&reveal}
  {task==="proof_line"&&<ChunkText chunk={chunk} world={world} tokens={tokens} outline={lit} pick={{selected:draft.lines?.[0]??null,onPick:t=>setDraft({lines:t?[t]:[]})}}/>}
  {task==="clue_words"&&<ChunkText chunk={chunk} world={world} tokens={tokens} outline={lit} wordPick={{selected:draft.words??[],onToggle:i=>setDraft(d=>{const w=d.words??[];return {words:w.includes(i)?w.filter(x=>x!==i):[...w,i].slice(0,30)}})}}/>}
  {/* Choices and pieces: the passage stays here to reread, lit as the hints go on. */}
  {(task==="choice"||task==="picks"||task==="pieces")&&<ChunkText chunk={chunk} world={world} tokens={tokens} outline={lit}/>}
  {task==="pieces"&&dnd&&<DragDrop view={dnd} placed={draft.placed??{}} onChange={p=>setDraft({placed:p})}/>}
  {task==="picks"&&choices&&<MultiBars seed={seed} label="Open the lock" need={Math.max(1,(answerText??"").split(" · ").length)} options={choices.map(t=>({text:t}))} picked={draft.picks??[]} onToggle={i=>setDraft(d=>{const p=d.picks??[];return {picks:p.includes(i)?p.filter(x=>x!==i):[...p,i]}})}/>}
  {task==="choice"&&choices&&<AnswerBars seed={seed} label="Open the lock" options={choices.map(t=>({text:t}))} picked={draft.choice??null} onPick={i=>setDraft({choice:i})}/>}
  {task==="pinboard"&&callPassages&&<ReadingPanel glossary={world.glossary} passages={callPassages as SourcePassage[]} kept={draft.lines??[]} onTap={l=>setDraft(d=>{const ls=d.lines??[];return {lines:ls.includes(l.text)?ls.filter(x=>x!==l.text):ls.length>=2?ls:[...ls,l.text]}})}/>}
  {wrong&&<p role="status" className="rounded-row bg-notyet-soft px-3 py-2 text-[15px] font-bold text-ink">{step==="paragraph"?"Not that one yet. The paragraph is lit up now.":"Not that one yet. Now the proof is outlined."}</p>}
  <button type="button" disabled={!ready||busy} onClick={open} className="case-primary min-h-[56px] w-full justify-center text-[18px]"><Padlock open quiet size={18}/>Open the lock</button>
 </div>;
}

// ---------- The Case File: what the student carries through the room ----------
// The button sits in the race HUD; the drawer opens over the screen in a portal, so the pinned HUD can't hold it under
// the site header (same screen: scroll stays, focus returns).
export function CaseFileButton({items}:{items:InventoryItem[]}){
 const [open,setOpen]=useState(false),btn=useRef<HTMLButtonElement>(null),head=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(open)head.current?.focus();else if(btn.current&&document.activeElement===document.body)btn.current.focus()},[open]);
 useEffect(()=>{if(!open)return;const k=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[open]);
 return <>
  <button ref={btn} type="button" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-label={`Case File, ${items.length} items`} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-panel px-3 text-[14px] font-bold text-ink"><BookOpen size={16} aria-hidden/><span className="max-sm:sr-only">Case File</span><span className="rounded-full bg-deep px-1.5 text-[12px] tabular-nums">{items.length}</span></button>
  {open&&typeof document!=="undefined"&&createPortal(<div className="fixed inset-0 z-[70] flex justify-end bg-black/50" onClick={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <div role="dialog" aria-modal="true" aria-labelledby="cf-h" className="flex h-full w-full max-w-md flex-col gap-3 overflow-y-auto bg-deep p-4 shadow-2xl">
    <div className="flex items-center justify-between gap-2"><h2 id="cf-h" ref={head} tabIndex={-1} className="text-[24px] outline-none">Case File</h2>
     <button type="button" onClick={()=>{setOpen(false);setTimeout(()=>btn.current?.focus(),0)}} aria-label="Close the Case File" className="grid h-11 w-11 place-items-center rounded-full bg-panel"><X size={18} aria-hidden/></button></div>
    <CaseFileList items={items}/>
   </div></div>,document.body)}
 </>;
}
export function CaseFileList({items}:{items:InventoryItem[]}){
 if(!items.length)return <p className="text-[15px] text-muted">Empty so far. Every lock you open adds its proof here.</p>;
 return <ul className="flex flex-col gap-2">{items.map((it,i)=><li key={i} className={`rounded-row p-3 ${it.kind==="statement"?"bg-violet-soft":"bg-panel"}`}>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{it.label}</p>
  <p className={`mt-0.5 text-[16px] leading-snug ${it.kind==="proof"?"font-serif":""}`}>{it.kind==="statement"||it.kind==="proof"?`“${it.text}”`:it.text}</p></li>)}</ul>;
}

// ---------- The escape timer runs out ----------
// A short story moment over the room, once per chamber. The chamber won't count as escaped in time, but nothing stops:
// the student finishes the locks and keeps every result. Focus goes to its button; it's a dialog until dismissed.
export function TimeoutMoment({text,onGo}:{text:string;onGo:()=>void}){
 const btn=useRef<HTMLButtonElement>(null);
 useEffect(()=>{btn.current?.focus()},[]);
 return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4"><div role="alertdialog" aria-modal="true" aria-labelledby="to-h" aria-describedby="to-d" className="flex w-full max-w-md flex-col gap-3 rounded-[24px] bg-panel p-5 text-center shadow-2xl">
  <Timer size={36} className="mx-auto text-notyet" aria-hidden/>
  <h2 id="to-h" className="font-display text-[26px] font-bold leading-tight">{text}</h2>
  <p id="to-d" className="text-[16px]">Time ran out, so this chamber won't count as escaped in time. Keep going: finish the locks, and every first-try proof still counts. You can replay the chamber later to escape in time.</p>
  <button ref={btn} type="button" onClick={onGo} className="case-primary min-h-[52px] w-full justify-center">Keep going <ArrowRight size={18} aria-hidden/></button>
 </div></div>;
}

// ---------- The doors ----------
// The door (app/lock-art.tsx DoorScene): its padlock opens once the chamber is cleared, then the door swings open.
// The inner door between the chambers. stop: the class stops here today (progress is saved).
const InTimeBadge=({ok}:{ok:boolean|null|undefined})=>ok===true?<p className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 font-display text-[15px] font-bold text-on-gold"><Timer size={16} aria-hidden/>Escaped in time</p>:null;
export function InnerDoor({room,stop,onNext,onMap,clockNote=null,inTimeBadge=null}:{room:Room;stop:boolean;onNext:()=>void;onMap:()=>void;clockNote?:string|null;inTimeBadge?:boolean|null}){
 return <section aria-labelledby="ex-h" className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 pt-2 text-center">
  <DoNow text={stop?DO_NOW.stopped:DO_NOW.inner}/>
  <DoorScene open behind="Chamber 2" label="The inner door: its padlock opens and the door swings open"/>
  <InTimeBadge ok={inTimeBadge}/>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Room {room.number} · {room.name}</p>
  <h1 id="ex-h" className="text-[32px] leading-tight outline-none">{inTimeBadge===false?"Chamber 1 finished":"Chamber 1 escaped"}</h1>
  {clockNote&&<p className="text-[16px] font-bold text-muted">{clockNote}</p>}
  <p role="status" className="text-[17px] font-bold">{stop?"The inner door is open, and your room is saved. Next time, you start in Chamber 2 with everything in your Case File.":"The inner door is open. Chamber 2 is ahead."}</p>
  {stop?<button type="button" onClick={onMap} className="case-primary min-h-[56px] w-full justify-center text-[18px]"><MapIcon size={18} aria-hidden/>Back to the map</button>
   :<button type="button" onClick={onNext} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Into Chamber 2 <ArrowRight size={18} aria-hidden/></button>}
 </section>;
}
// Chamber 2 after a break: what the Case File holds, then on.
export function ChamberRecap({room,items,onNext}:{room:Room;items:InventoryItem[];onNext:()=>void}){
 return <section aria-labelledby="ex-h" className="mx-auto flex w-full max-w-xl flex-col gap-3 pt-2">
  <DoNow text={DO_NOW.recap}/>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Room {room.number} · {room.name} · Chamber 2</p>
  <h1 id="ex-h" className="text-[30px] leading-tight outline-none">Your Case File so far</h1>
  <p className="text-[16px]">The witnesses' statements and every proof from Chamber 1. One witness lied: keep that in mind as you read on.</p>
  <CaseFileList items={items}/>
  <button type="button" onClick={onNext} className="case-primary mt-2 min-h-[56px] w-full justify-center text-[18px]">Into Chamber 2 <ArrowRight size={18} aria-hidden/></button>
 </section>;
}
// The exit door, above Name the Liar.
export function ExitBanner(){
 return <p className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-3 py-1.5 font-display text-[15px] font-bold text-on-gold"><DoorGlyph size={18}/>The exit door: name the liar to open it</p>;
}
// The escape: the door swings open and the way to the next room is open (the map lifts its fog when the student is back).
export function EscapeMoment({room,next,solved,onNext,clockNote=null,inTimeBadge=null}:{room:Room;next:Room|null;solved:boolean;onNext:()=>void;clockNote?:string|null;inTimeBadge?:boolean|null}){
 return <section aria-labelledby="ex-h" className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 pt-2 text-center">
  <DoNow text={DO_NOW.escape}/>
  <DoorScene open behind={next?`Room ${next.number}`:"Out"} label="The exit door: its padlock opens and the door swings open"/>
  <InTimeBadge ok={inTimeBadge}/>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Room {room.number} · {room.name}</p>
  <h1 id="ex-h" className="text-[36px] leading-tight outline-none">{inTimeBadge===false?"You made it out":"You escaped!"}</h1>
  {clockNote&&<p className="text-[16px] font-bold text-muted">{clockNote}</p>}
  <p role="status" className="text-[18px] font-bold">{solved?"Case solved, and the door is open. ":"The door is open. "}{next?`The way to Room ${next.number}, ${next.name}, is open on the map.`:"That was the last room in this story."}</p>
  <button type="button" onClick={onNext} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Final results <ArrowRight size={18} aria-hidden/></button>
 </section>;
}
