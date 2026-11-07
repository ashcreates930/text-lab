"use client";
// The Interview (before the race) and Name the Liar (after it). Rules: lib/interview.ts. Each witness stands on the
// dark stage (3D when the story has a model for them, otherwise their portrait), the student picks one of two question
// cards and the witness answers in their recorded voice, captions always on. After the race the student names the
// liar and taps the line that disproves the lie; a win needs both, on the first try.
import {useEffect,useLayoutEffect,useState} from "react";
import {ArrowRight,Box,NotebookPen,RotateCcw,Volume2} from "lucide-react";
import type {Interview,WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {LIAR_POINTS,firstName,interviewAudio,proofPassages,saidLine,witnessName,type LiarAnswer,type Said} from "@/lib/interview";
import {CharacterStage,useVoice,type StageClip} from "./character-stage";
import {ReadingPanel} from "./reading-panel";
import {focusScreenTop} from "./screen-focus";
import {SplitStage} from "./split-stage";
import {shuffledOrder} from "@/lib/expedition";
import {HologramView} from "./hologram-view";
import {DoNow} from "./practice-round";
import {DO_NOW} from "@/lib/onboarding";

const characterOf=(world:WorldPack,id:string)=>world.characters.find(c=>c.id===id);
// One witness on the stage, speaking the line that's playing.
export function WitnessStage({world,character,speaking,level,gesture,height,forcePortrait}:{world:WorldPack;character:string;speaking:boolean;level:number;gesture?:{clip:"laughing"|"head-shake";key:number}|null;height?:number;forcePortrait?:boolean}){
 const c=characterOf(world,character);
 // Phones keep the question cards in view: the stage takes about a third of the screen.
 const [h,setH]=useState(height??320);useEffect(()=>{if(height==null)setH(Math.round(Math.max(220,Math.min(340,window.innerHeight*0.36))))},[height]);
 const clip:StageClip=speaking?"talking":"idle";
 return <CharacterStage model={c?.model??null} portrait={c?.portrait??null} name={c?.name??character} clip={clip} gesture={gesture} level={speaking?level:0} height={h} forcePortrait={forcePortrait}/>;
}
// The caption under a witness: always on, with the speaker's name.
export function Caption({name,text,live=true}:{name:string;text:string;live?:boolean}){
 return <p aria-live={live?"polite":undefined} className="rounded-card bg-reading px-4 py-3 font-serif text-[18px] leading-snug text-reading-ink"><span className="font-sans text-[13px] font-extrabold uppercase tracking-[.08em] text-reading-muted">{name}</span><br/>{text}</p>;
}

// ---------- The Interview ----------
export function InterviewScreen({world,expeditionId,interview,liar,onDone,saved}:{world:WorldPack;expeditionId:string;interview:Interview;liar:number;onDone:(cards:number[])=>void;saved?:number[]}){
 const [k,setK]=useState(0),[cards,setCards]=useState<number[]>(saved??[]),[heard,setHeard]=useState<boolean[]>([]),[gesture,setGesture]=useState<{clip:"laughing"|"head-shake";key:number}|null>(null),[holo,setHolo]=useState(false);
 const voice=useVoice();
 useLayoutEffect(()=>{focusScreenTop()},[k]);
 const w=interview.witnesses[k],name=witnessName(world,w.character),st=k===liar?w.lie:w.truth,card=cards[k];
 const kind=k===liar?"lie":"truth",src=interviewAudio(world.id,expeditionId,w.character,kind);
 function ask(i:number){setCards(c=>{const n=[...c];n[k]=i;return n});speak()}
 function speak(){if(st.gesture)setGesture({clip:st.gesture,key:Date.now()});voice.play(src,()=>setHeard(h=>{const n=[...h];n[k]=true;return n}))}
 function next(){voice.stop();setGesture(null);if(k+1>=interview.witnesses.length){onDone(cards);return}setK(k+1)}
 const notes:Said[]=interview.witnesses.slice(0,k+1).map((x,i)=>({character:x.character,name:witnessName(world,x.character),short:firstName(witnessName(world,x.character)),text:(i===liar?x.lie:x.truth).text,lied:i===liar,gesture:null,card:null})).filter((_,i)=>cards[i]!=null);
 const speaking=voice.playing===src;
 // Hologram mode: the witness four ways for a pyramid on the phone, speaking the same recorded line.
 const ch=characterOf(world,w.character);
 if(holo&&ch)return <HologramView character={ch} worldId={world.id} line={st.text} audioSrc={src} sandboxId="interview" title={`The Interview · ${name}`} onClose={()=>{setHolo(false);setTimeout(()=>focusScreenTop(),0)}}/>;
 return <section aria-labelledby="iv-h" className="flex flex-col gap-3">
  <DoNow text={DO_NOW.interview}/>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">The Interview · witness {k+1} of {interview.witnesses.length}</p>
  <h1 id="iv-h" className="text-[28px] leading-tight outline-none">{card==null?`Question ${name}`:`${firstName(name)} answers`}</h1>
  <p className="text-[16px] text-muted">One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story.</p>
  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
   <WitnessStage world={world} character={w.character} speaking={speaking} level={voice.level} gesture={gesture}/>
   <div className="flex flex-col gap-3">
    {card==null
     ?<><p className="font-display text-[18px] font-bold">Pick your question</p>
      <div className="grid gap-2.5">{w.cards.map((q,i)=><button key={i} type="button" onClick={()=>ask(i)} className="case-answer min-h-[64px] justify-start rounded-[18px] bg-panel px-4 text-left text-[17px] font-bold">{q}</button>)}</div></>
     :<><p className="rounded-card bg-violet-soft px-4 py-3 text-[16px] font-bold">You asked: {w.cards[card]}</p>
      <Caption name={name} text={st.text}/>
      <div className="flex flex-wrap gap-2">
       <button type="button" onClick={speak} disabled={speaking} className="case-secondary !min-h-11">{speaking?<><Volume2 size={18} aria-hidden/>Speaking…</>:<><RotateCcw size={18} aria-hidden/>Hear it again</>}</button>
       <button type="button" onClick={()=>{voice.stop();setHolo(true)}} className="case-secondary !min-h-11"><Box size={18} aria-hidden/>Hologram</button>
      </div>
      <button type="button" onClick={next} disabled={!heard[k]&&speaking} className="case-primary min-h-[56px] w-full justify-center text-[18px]">{k+1>=interview.witnesses.length?"Start the race":"Next witness"} <ArrowRight size={18} aria-hidden/></button></>}
   </div>
  </div>
  {notes.length>0&&<aside aria-label="Your notes from the Interview" className="rounded-card bg-panel p-4"><p className="flex items-center gap-2 font-display text-[16px] font-bold"><NotebookPen size={16} aria-hidden/>Case Notes</p>
   <ul className="mt-1.5 grid gap-1 text-[15px] leading-snug">{notes.map(n=><li key={n.character}>{saidLine(n)}</li>)}</ul></aside>}
 </section>;
}

// ---------- Name the Liar ----------
// Step 1: who lied? Step 2: tap the sentence that proves it. One try. Side by side: the expedition's text on the left
// (tappable in step 2), the witnesses and the lock-in on the right; on a phone the right side is the bottom panel.
// seed: this student's own witness order.
export function NameTheLiar({world,said,passages,onLock,seconds,left,locked=false,heading="Name the Liar",seed}:{world:WorldPack;said:Said[];passages:{id:string;text:string}[];onLock:(a:LiarAnswer)=>void;seconds?:number;left?:number|null;locked?:boolean;heading?:string;seed?:string}){
 const [step,setStep]=useState<1|2>(1),[pick,setPick]=useState<string|null>(null),[line,setLine]=useState<string|null>(null);
 useLayoutEffect(()=>{focusScreenTop()},[step]);
 const picked=said.find(s=>s.character===pick);
 const order=seed?shuffledOrder(said.length,`${seed}|liar`).map(i=>said[i]):said;
 if(locked)return <section aria-labelledby="nl-h" className="mt-6 flex flex-col items-center gap-3 text-center"><h1 id="nl-h" className="text-[30px] outline-none">Locked in</h1><p className="text-[17px] text-muted">Nothing is revealed until everyone has locked in. Watch the board.</p></section>;
 const head=<><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{heading} · step {step} of 2 · one try{seconds?` · ${seconds} seconds`:""}</p>
  <h1 id="nl-h" className="text-[26px] leading-tight outline-none">{step===1?"Which witness lied?":`Tap the sentence that proves ${picked?firstName(picked.name):"them"} wrong`}</h1>
  {left!=null&&<p className="font-display text-[18px] font-bold tabular-nums text-gold" aria-live="off">{Math.ceil(left)}s left</p>}</>;
 const body=step===1
  ?<div className="mt-2 grid gap-2.5">{order.map(s=>{const c=characterOf(world,s.character);return <button key={s.character} type="button" aria-pressed={pick===s.character} onClick={()=>setPick(s.character)} className={`flex min-h-[72px] items-start gap-3 rounded-[18px] p-3 text-left ${pick===s.character?"bg-gold text-on-gold":"bg-panel text-ink"}`}>
    {c?.portrait?<img src={c.portrait} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover"/>:<span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-reading font-display text-[24px] font-bold text-reading-ink">{s.name.slice(0,1)}</span>}
    <span><span className="block font-display text-[18px] font-bold">{s.name}</span><span className="block text-[15px] leading-snug">"{s.text}"</span></span></button>})}</div>
  :<div className="mt-2 flex flex-col gap-2"><Caption live={false} name={`${picked?.name} said`} text={picked?.text??""}/>
    <p className="text-[15px] font-bold text-muted">Tap the sentence anywhere in the expedition that shows this is false, then lock in.</p></div>;
 const action=step===1
  ?<button type="button" disabled={!pick} onClick={()=>setStep(2)} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Next: find the proof <ArrowRight size={18} aria-hidden/></button>
  :<div className="flex gap-2"><button type="button" onClick={()=>setStep(1)} className="case-secondary">Back</button>
    <button type="button" disabled={!line} onClick={()=>onLock({liar:pick,line})} className="case-primary flex-1 justify-center">Lock in <ArrowRight size={18} aria-hidden/></button></div>;
 const passage=<ReadingPanel passages={passages as SourcePassage[]} glossary={world.glossary} selected={step===2?line??undefined:undefined} kept={[]} onTap={l=>{if(step===2)setLine(x=>x===l.text?null:l.text)}}/>;
 return <SplitStage label="Name the Liar" passage={passage} head={head} body={body} action={action} collapse={step===2}/>;
}


// The verdict: a win is the gold "Case solved" moment with the liar's reaction and the line quoted; otherwise the
// liar and the line are shown, and the case goes into the Refresher.
export function LiarVerdict({world,expeditionId,interview,liar,solved,named,passages,onNext,next="Final results",breakdown}:{world:WorldPack;expeditionId:string;interview:Interview;liar:number;solved:boolean;named:boolean;passages:{id:string;text:string}[];onNext?:()=>void;next?:string;breakdown?:React.ReactNode}){
 const w=interview.witnesses[liar],name=witnessName(world,w.character),voice=useVoice();
 const [gesture,setGesture]=useState<{clip:"laughing"|"head-shake";key:number}|null>(null);
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const src=interviewAudio(world.id,expeditionId,w.character,"caught");
 // The liar reacts once: the gesture (a laugh or a head shake) and the line they say when caught.
 useEffect(()=>{setGesture({clip:w.lie.gesture??"head-shake",key:Date.now()});voice.play(src)},[src]);// eslint-disable-line react-hooks/exhaustive-deps
 const speaking=voice.playing===src;
 return <section aria-labelledby="lv-h" className="flex flex-col gap-3" aria-live="assertive">
  {solved
   ?<div className="flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{LIAR_POINTS.toLocaleString()}</p>
    <div className="moment-pop w-full rounded-[24px] bg-gold p-5 text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Name the Liar</p><h1 id="lv-h" className="mt-1 text-[40px] leading-none outline-none">Case solved<span className="sr-only">. Plus {LIAR_POINTS} points.</span></h1><p className="mt-2 text-[17px] font-bold">{name} lied, and you proved it.</p></div></div>
   :<div className="rounded-[24px] bg-notyet p-5 text-on-notyet shadow-[0_8px_0_var(--color-notyet-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Name the Liar</p><h1 id="lv-h" className="mt-1 text-[36px] leading-none outline-none">Not this time.</h1>
    <p className="mt-2 text-[17px] font-bold">{named?`You named ${name}, but that line doesn't prove it.`:`The liar was ${name}.`} It's in your Refresher.</p></div>}
  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
   <WitnessStage world={world} character={w.character} speaking={speaking} level={voice.level} gesture={gesture} height={280}/>
   <div className="flex flex-col gap-3"><Caption name={name} text={w.caught}/>
    <p className="text-[13px] font-extrabold uppercase tracking-[.08em] text-highlight">{solved?"The proof":"Here's the proof"}</p>
    <Caption live={false} name={`${name} said`} text={w.lie.text}/>
    <ReadingPanel passages={proofPassages(passages,w.lie.lines[0]) as SourcePassage[]} glossary={world.glossary} results={w.lie.lines.slice(0,1).map(l=>({line:l,ok:true}))} onTap={()=>{}} locked className="max-h-[40dvh]"/>
   </div></div>
  {breakdown}
  {onNext&&<button type="button" onClick={onNext} className="case-primary min-h-[52px] w-full justify-center">{next} <ArrowRight size={18} aria-hidden/></button>}
 </section>;
}
