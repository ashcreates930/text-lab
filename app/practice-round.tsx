"use client";
// The practice round (lib/onboarding.ts): the first time a student plays, one easy chunk and one question, with arrows
// showing "Read this", "Tap the sentence" and "Lock it in". No points and no timer; about 30 seconds. The chunk comes
// from the story's own data (practiceChunk), so it works for every story.
import {AskButton} from "./interview";
import {useEffect,useLayoutEffect,useMemo,useState} from "react";
import {ArrowDown,ArrowRight,Check,GraduationCap} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {chunkTokens,expeditionChunks,proofTokens,sentenceProves} from "@/lib/expedition";
import {DO_NOW,practiceChunk,HINTS,markHintDone} from "@/lib/onboarding";
import {ChunkText,KeywordPrompt} from "./expedition-race";
import {focusScreenTop} from "./screen-focus";

// An arrow callout placed right above what to tap (it bobs gently, and stays still under reduced motion).
export function Coach({text,id}:{text:string;id?:string}){
 return <p id={id} role="note" className="coach-bob mx-auto mb-2 flex w-fit items-center gap-2 rounded-full bg-gold px-4 py-2 font-display text-[17px] font-bold text-on-gold shadow-[0_5px_0_var(--color-gold-shadow)]"><ArrowDown size={18} aria-hidden/>{text}</p>;
}
// One plain sentence at the top of a screen saying exactly what to do now.
export function DoNow({text,className=""}:{text:string;className?:string}){
 return <p className={`do-now text-[16px] font-bold leading-snug text-ink ${className}`}><span className="sr-only">What to do now: </span>{text}</p>;
}

export function PracticeRound({world,passages,onDone}:{world:WorldPack;passages:SourcePassage[];onDone:()=>void}){
 const at=practiceChunk(world);
 const chunk=useMemo(()=>at?expeditionChunks(world,passages,at.expeditionId)[at.index]:null,[world,passages,at?.expeditionId,at?.index]);// eslint-disable-line react-hooks/exhaustive-deps
 // Student testing (2026-11-15): practise asking a witness once first, when the story's rooms have witnesses. The first
 // witness the student will meet, the room's real question, and a plain note on how answers work. No line is spoken or
 // shown in the witness's voice here, so nothing about the real room is given away.
 const iv=world.expeditions?.[0]?.interview,first=iv?.question?[...iv.witnesses].sort((a,b)=>(a.at??99)-(b.at??99))[0]:null,who=first?world.characters.find(c=>c.id===first.character):null;
 const [step,setStep]=useState<"witness"|"read"|"tap"|"done">(()=>who?"witness":"read"),[picked,setPicked]=useState<string|null>(null),[askedPractice,setAskedPractice]=useState(false);
 // Each part of the practice (read, the question, the result) is its own screen: the top, focus on its heading.
 useLayoutEffect(()=>{focusScreenTop()},[step]);
 useEffect(()=>{if(!chunk)onDone()},[chunk]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!chunk)return null;
 const q=chunk.chunk.question,tokens=chunkTokens(chunk.lines),right=step==="done"&&sentenceProves(q,tokens,picked?[picked]:[]);
 const view={lines:chunk.lines,discovery:chunk.chunk.discovery};
 return <div className="case-ui mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-16 pt-4">
  <DoNow text={DO_NOW.practice}/>
  <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight"><GraduationCap size={16} aria-hidden/>Practice round · no points</p>
  {step==="witness"&&who&&iv?.question&&<>
   <h1 id="practice-h" tabIndex={-1} className="text-[28px] leading-tight outline-none">First, ask a witness</h1>
   <p className="text-[16px] text-muted">In each room, witnesses step in before some locks. Practise asking one.</p>
   {who.portrait&&<img src={who.portrait} alt={who.name} className="mx-auto h-32 w-32 rounded-full object-cover"/>}
   {!askedPractice?<div><Coach text={HINTS.witness}/><AskButton question={iv.question} onAsk={()=>{markHintDone("witness");setAskedPractice(true)}}/></div>
    :<div role="status" className="rounded-card bg-panel p-4"><p className="text-[17px] font-bold">That's how you ask. In the room, {who.name.split(" ")[0]} answers right here, out loud and in writing.</p>
     <p className="mt-1 text-[15px] text-muted">Every answer is saved to your Case File, and you'll check it against the story. One of the three witnesses is lying.</p>
     <button type="button" onClick={()=>setStep("read")} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">Next: practise a lock <ArrowRight size={18} aria-hidden/></button></div>}
  </>}
  {step!=="witness"&&<h1 id="practice-h" tabIndex={-1} className="text-[28px] leading-tight outline-none">{step==="read"?"First, read this chunk":step==="tap"?<KeywordPrompt prompt={q.prompt} keywords={q.keywords}/>:right?"That's it!":"That's the idea"}</h1>}
  {step==="read"&&<Coach text="Read this"/>}
  {step==="tap"&&!picked&&<Coach text="Tap the sentence"/>}
  {step!=="witness"&&<ChunkText chunk={view} world={world} tokens={tokens} pick={step==="tap"?{selected:picked,onPick:setPicked}:undefined} shown={step==="done"?proofTokens(q,tokens,chunk.lines):[]} shownStyle={right?"right":"missed"}/>}
  {step==="read"&&<button type="button" onClick={()=>setStep("tap")} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18} aria-hidden/></button>}
  {step==="tap"&&<>{picked&&<Coach text="Lock it in"/>}<button type="button" disabled={!picked} onClick={()=>setStep("done")} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Lock in <ArrowRight size={18} aria-hidden/></button></>}
  {step==="done"&&<div role="status" className="rounded-card bg-panel p-4"><p className="text-[17px] font-bold">{right?<><Check size={18} className="mr-1 inline text-success" aria-hidden/>You found the proof. In the real game, that earns points.</>:"The sentence that proves it is lit up. In the real game you get one try, then a Refresher later."}</p>
   <p className="mt-1 text-[15px] text-muted">That's how every question works: read, answer, tap the sentence that proves it, lock it in.</p>
   <button type="button" onClick={onDone} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">Start the real game <ArrowRight size={18} aria-hidden/></button></div>}
 </div>;
}
