"use client";
// The Interview (before the race) and Name the Liar (after it). Rules: lib/interview.ts. Each witness stands on the
// dark stage (3D when the story has a model for them, otherwise their portrait), the student picks one of two question
// cards and the witness answers in their recorded voice, captions always on. After the race the student names the
// liar and taps the line that disproves the lie; a win needs both, on the first try.
import {useEffect,useLayoutEffect,useRef,useState} from "react";
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
import {Lineup,type LineupItem} from "./lineup";
import {allAsked,askedList,nextUnasked} from "@/lib/lineup";

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
// One continuous stage with all the witnesses (app/lineup.tsx): the one in the spotlight is questioned; tap, swipe or
// use the arrow keys to bring in another, in any order. Each asked witness gets the Asked check, and any statement can
// be replayed with its caption. Every witness must be asked before "Start the race". Moving the spotlight is an action
// on the same screen, so scroll and focus stay put; only the first view focuses the heading.
export function InterviewScreen({world,expeditionId,interview,liar,onDone,saved}:{world:WorldPack;expeditionId:string;interview:Interview;liar:number;onDone:(cards:number[])=>void;saved?:number[]}){
 const n=interview.witnesses.length;
 const [k,setK]=useState(()=>saved&&saved.length?nextUnasked(saved,n,-1)??0:0),[cards,setCards]=useState<(number|null)[]>(saved??[]),[heard,setHeard]=useState<boolean[]>([]),[gesture,setGesture]=useState<{clip:"laughing"|"head-shake";key:number}|null>(null),[holo,setHolo]=useState(false);
 const voice=useVoice();
 useLayoutEffect(()=>{focusScreenTop()},[]);
 // A pressed control that goes away (a question card once asked, "Next: question" once used) hands focus to what
 // replaced it, without scrolling, so a keyboard user keeps their place.
 const askedRef=useRef<HTMLParagraphElement|null>(null),pickRef=useRef<HTMLParagraphElement|null>(null),[focusTo,setFocusTo]=useState<"asked"|"pick"|null>(null);
 useEffect(()=>{if(!focusTo)return;(focusTo==="asked"?askedRef:pickRef).current?.focus({preventScroll:true});setFocusTo(null)},[focusTo]);
 // Phones keep the question cards in view: the stage takes about a third of the screen.
 const [h,setH]=useState(300);useEffect(()=>{setH(Math.round(Math.max(200,Math.min(320,window.innerHeight*0.32))))},[]);
 const w=interview.witnesses[k],name=witnessName(world,w.character),st=k===liar?w.lie:w.truth,card=cards[k];
 const kind=k===liar?"lie":"truth",src=interviewAudio(world.id,expeditionId,w.character,kind);
 const asked=askedList(cards,n),done=allAsked(cards,n),next=nextUnasked(cards,n,k);
 function spotlight(i:number){voice.stop();setGesture(null);setK(i)}
 function ask(i:number){setCards(c=>{const x=[...c];x[k]=i;return x});setFocusTo("asked");speak()}
 function speak(){if(st.gesture)setGesture({clip:st.gesture,key:Date.now()});const at=k;voice.play(src,()=>setHeard(h=>{const x=[...h];x[at]=true;return x}))}
 function start(){voice.stop();setGesture(null);onDone(cards.map(c=>c??0))}
 const notes:Said[]=interview.witnesses.map((x,i)=>({character:x.character,name:witnessName(world,x.character),short:firstName(witnessName(world,x.character)),text:(i===liar?x.lie:x.truth).text,lied:i===liar,gesture:null,card:null})).filter((_,i)=>cards[i]!=null);
 const speaking=voice.playing===src;
 // Hologram mode: the witness four ways for a pyramid on the phone, speaking the same recorded line.
 const ch=characterOf(world,w.character);
 if(holo&&ch)return <HologramView character={ch} worldId={world.id} line={st.text} audioSrc={src} sandboxId="interview" title={`The Interview · ${name}`} onClose={()=>{setHolo(false);setTimeout(()=>focusScreenTop(),0)}}/>;
 const items:LineupItem[]=interview.witnesses.map((x,i)=>{const c=characterOf(world,x.character);return {id:x.character,name:witnessName(world,x.character),portrait:c?.portrait??null,model:c?.model??null,check:asked[i]?"Asked":null}});
 return <section aria-labelledby="iv-h" className="flex flex-col gap-3">
  <DoNow text={DO_NOW.interview}/>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">The Interview · {asked.filter(Boolean).length} of {n} questioned</p>
  <h1 id="iv-h" className="text-[28px] leading-tight outline-none">The Interview</h1>
  <p className="text-[16px] text-muted">One witness will lie to you. Question all {n}, in any order. After the race you'll name the liar and prove it with a line from the story.</p>
  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
   <Lineup items={items} index={k} onIndex={spotlight} label={`The witnesses. ${name} is in the spotlight`} height={h} speaking={speaking} level={voice.level} gesture={gesture}/>
   <div className="flex flex-col gap-3">
    {card==null
     ?<><p ref={pickRef} tabIndex={-1} className="font-display text-[18px] font-bold outline-none">Pick your question for {firstName(name)}</p>
      <div className="grid gap-2.5">{w.cards.map((q,i)=><button key={i} type="button" onClick={()=>ask(i)} className="case-answer min-h-[64px] justify-start rounded-[18px] bg-panel px-4 text-left text-[17px] font-bold">{q}</button>)}</div></>
     :<><p ref={askedRef} tabIndex={-1} className="rounded-card bg-violet-soft px-4 py-3 text-[16px] font-bold outline-none focus-visible:ring-4 focus-visible:ring-highlight">You asked {firstName(name)}: {w.cards[card]}</p>
      <Caption name={name} text={st.text}/>
      <div className="flex flex-wrap gap-2">
       <button type="button" onClick={speak} disabled={speaking} className="case-secondary !min-h-11">{speaking?<><Volume2 size={18} aria-hidden/>Speaking…</>:<><RotateCcw size={18} aria-hidden/>Hear it again</>}</button>
       <button type="button" onClick={()=>{voice.stop();setHolo(true)}} className="case-secondary !min-h-11"><Box size={18} aria-hidden/>Hologram</button>
      </div></>}
    {next!=null&&<button type="button" onClick={()=>{spotlight(next);setFocusTo("pick")}} disabled={card!=null&&!heard[k]&&speaking} className={`${card==null?"case-secondary":"case-primary"} min-h-[56px] w-full justify-center text-[18px]`}>Next: question {firstName(witnessName(world,interview.witnesses[next].character))} <ArrowRight size={18} aria-hidden/></button>}
    {done?<button type="button" onClick={start} disabled={!heard[k]&&speaking} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Start the race <ArrowRight size={18} aria-hidden/></button>
     :<p className="text-[15px] font-bold text-muted">Question all {n} witnesses to start the race ({n-asked.filter(Boolean).length} to go).</p>}
   </div>
  </div>
  {notes.length>0&&<aside aria-label="Your notes from the Interview" className="rounded-card bg-panel p-4"><p className="flex items-center gap-2 font-display text-[16px] font-bold"><NotebookPen size={16} aria-hidden/>Case Notes</p>
   <ul className="mt-1.5 grid gap-1 text-[15px] leading-snug">{notes.map(n=><li key={n.character}>{saidLine(n)}</li>)}</ul></aside>}
 </section>;
}

// ---------- Name the Liar ----------
// Step 1: who lied? The witnesses stand in the same lineup as the Interview (portraits, so it stays light on a phone):
// bring a suspect into the spotlight, read what they said, and name them. Step 2: tap the sentence that proves it.
// One try; the win rule is lib/interview.ts liarCheck. Side by side: the expedition's text on the left (tappable in
// step 2), the lineup and the lock-in on the right; on a phone the right side is the bottom panel.
// seed: this student's own witness order.
export function NameTheLiar({world,said,passages,onLock,seconds,left,locked=false,heading="Name the Liar",seed}:{world:WorldPack;said:Said[];passages:{id:string;text:string}[];onLock:(a:LiarAnswer)=>void;seconds?:number;left?:number|null;locked?:boolean;heading?:string;seed?:string}){
 const [step,setStep]=useState<1|2>(1),[pick,setPick]=useState<string|null>(null),[line,setLine]=useState<string|null>(null),[spot,setSpot]=useState(0);
 useLayoutEffect(()=>{focusScreenTop()},[step]);
 const picked=said.find(s=>s.character===pick);
 const order=seed?shuffledOrder(said.length,`${seed}|liar`).map(i=>said[i]):said;
 if(locked)return <section aria-labelledby="nl-h" className="mt-6 flex flex-col items-center gap-3 text-center"><h1 id="nl-h" className="text-[30px] outline-none">Locked in</h1><p className="text-[17px] text-muted">Nothing is revealed until everyone has locked in. Watch the board.</p></section>;
 const head=<><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{heading} · step {step} of 2 · one try{seconds?` · ${seconds} seconds`:""}</p>
  <h1 id="nl-h" className="text-[26px] leading-tight outline-none">{step===1?"Which witness lied?":`Tap the sentence that proves ${picked?firstName(picked.name):"them"} wrong`}</h1>
  {left!=null&&<p className="font-display text-[18px] font-bold tabular-nums text-gold" aria-live="off">{Math.ceil(left)}s left</p>}</>;
 const body=step===1
  ?(()=>{const s=order[spot]??order[0],items:LineupItem[]=order.map(x=>{const c=characterOf(world,x.character);return {id:x.character,name:x.name,portrait:c?.portrait??null,check:pick===x.character?"Named":null}});
    return <div className="mt-2 flex flex-col gap-2">
     <Lineup items={items} index={spot} onIndex={setSpot} label={`The witnesses. ${s.name} is in the spotlight`} height={150} threeD={false}
      cardExtra={<p className="basis-full font-serif text-[16px] leading-snug text-ink">"{s.text}"</p>}/>
    </div>})()
  :<div className="mt-2 flex flex-col gap-2"><Caption live={false} name={`${picked?.name} said`} text={picked?.text??""}/>
    <p className="text-[15px] font-bold text-muted">Tap the sentence anywhere in the expedition that shows this is false, then lock in.</p></div>;
 // Naming sits in the footer with Next, so on a phone it is in view without scrolling the panel.
 const sp=order[spot]??order[0];
 const action=step===1
  ?<div className="grid gap-2"><button type="button" aria-pressed={pick===sp.character} onClick={()=>setPick(p=>p===sp.character?null:sp.character)} className={`min-h-[52px] w-full rounded-[18px] px-4 text-[17px] font-bold ${pick===sp.character?"bg-gold text-on-gold":"bg-panel text-ink ring-2 ring-edge"}`}>{pick===sp.character?`You named ${sp.short} as the liar`:`Name ${sp.short} as the liar`}</button>
   <button type="button" disabled={!pick} onClick={()=>setStep(2)} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Next: find the proof <ArrowRight size={18} aria-hidden/></button></div>
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
