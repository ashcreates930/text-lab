"use client";
// The practice round (lib/onboarding.ts): the first time a student plays, one easy chunk and one question, with arrows
// showing "Read this", "Tap the sentence" and "Lock it in". No points and no timer; about 30 seconds. The chunk comes
// from the story's own data (practiceChunk), so it works for every story.
import {useEffect,useLayoutEffect,useMemo,useState} from "react";
import {ArrowDown,ArrowRight,Check,GraduationCap} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {chunkTokens,expeditionChunks,proofTokens,sentenceProves} from "@/lib/expedition";
import {DO_NOW,practiceChunk} from "@/lib/onboarding";
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
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const at=practiceChunk(world);
 const chunk=useMemo(()=>at?expeditionChunks(world,passages,at.expeditionId)[at.index]:null,[world,passages,at?.expeditionId,at?.index]);// eslint-disable-line react-hooks/exhaustive-deps
 const [step,setStep]=useState<"read"|"tap"|"done">("read"),[picked,setPicked]=useState<string|null>(null);
 useEffect(()=>{if(!chunk)onDone()},[chunk]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!chunk)return null;
 const q=chunk.chunk.question,tokens=chunkTokens(chunk.lines),right=step==="done"&&sentenceProves(q,tokens,picked?[picked]:[]);
 const view={lines:chunk.lines,discovery:chunk.chunk.discovery};
 return <div className="case-ui mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-16 pt-4">
  <DoNow text={DO_NOW.practice}/>
  <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight"><GraduationCap size={16} aria-hidden/>Practice round · no points</p>
  <h1 id="practice-h" tabIndex={-1} className="text-[28px] leading-tight outline-none">{step==="read"?"First, read this chunk":step==="tap"?<KeywordPrompt prompt={q.prompt} keywords={q.keywords}/>:right?"That's it!":"That's the idea"}</h1>
  {step==="read"&&<Coach text="Read this"/>}
  {step==="tap"&&!picked&&<Coach text="Tap the sentence"/>}
  <ChunkText chunk={view} world={world} tokens={tokens} pick={step==="tap"?{selected:picked,onPick:setPicked}:undefined} shown={step==="done"?proofTokens(q,tokens,chunk.lines):[]} shownStyle={right?"right":"missed"}/>
  {step==="read"&&<button type="button" onClick={()=>setStep("tap")} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18} aria-hidden/></button>}
  {step==="tap"&&<>{picked&&<Coach text="Lock it in"/>}<button type="button" disabled={!picked} onClick={()=>setStep("done")} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Lock in <ArrowRight size={18} aria-hidden/></button></>}
  {step==="done"&&<div role="status" className="rounded-card bg-panel p-4"><p className="text-[17px] font-bold">{right?<><Check size={18} className="mr-1 inline text-success" aria-hidden/>You found the proof. In the real game, that earns points.</>:"The sentence that proves it is lit up. In the real game you get one try, then a Refresher later."}</p>
   <p className="mt-1 text-[15px] text-muted">That's how every question works: read, answer, tap the sentence that proves it, lock it in.</p>
   <button type="button" onClick={onDone} className="case-primary mt-3 min-h-[56px] w-full justify-center text-[18px]">Start the real game <ArrowRight size={18} aria-hidden/></button></div>}
 </div>;
}
