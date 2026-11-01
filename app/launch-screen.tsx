"use client";
// The launch screen (after the first tap): the role card on top, one big "Start Proof Race" card and a smaller "Join a
// live game" tile beside it. Fits one phone screen without scrolling. Proof Race is the only way students play.
import {useLayoutEffect,useRef,useState} from "react";
import {ArrowRight,Search,Users,Zap} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {focusScreenTop} from "./screen-focus";

export function LaunchScreen({world,ready,onStart,onJoinLive}:{world:WorldPack;ready:boolean;onStart:()=>void;onJoinLive?:()=>void}){
 const [code,setCode]=useState<string|null>(null);
 const codeRef=useRef<HTMLInputElement>(null);
 useLayoutEffect(()=>{focusScreenTop()},[]);
 function join(){if(onJoinLive){onJoinLive();return}setCode("");setTimeout(()=>codeRef.current?.focus(),0)}
 const clean=(code??"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,12);
 return <div className="case-ui mx-auto flex max-w-xl flex-col gap-3 px-4 pb-6 pt-4">
  <section aria-labelledby="launch-h" className="rounded-card bg-panel-2 p-4">
   <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{world.title}</p>
   <h1 id="launch-h" className="mt-1 text-[26px] leading-[1.1] outline-none">You're an investigator stepping into the story</h1>
   <p className="mt-2 flex items-start gap-2 text-[15px] leading-snug text-muted"><Search size={18} className="mt-0.5 shrink-0 text-highlight" aria-hidden/>{world.hook}</p>
  </section>
  <div className="grid grid-cols-[1.55fr_1fr] gap-3">
   <button type="button" onClick={onStart} disabled={!ready} className="flex min-h-[200px] flex-col items-start gap-2 rounded-[24px] bg-primary p-4 text-left text-on-primary shadow-[0_8px_0_var(--color-primary-shadow)] transition-transform active:translate-y-1 disabled:opacity-50 motion-reduce:transition-none">
    <span className="flex w-full items-center justify-between"><span className="rounded-full bg-on-primary px-2.5 py-1 text-[11px] font-extrabold tracking-[.06em] text-highlight">PLAY</span><Zap size={36} strokeWidth={2.2} aria-hidden/></span>
    <span className="mt-1 font-display text-[28px] font-bold leading-none">Start Proof Race</span>
    <span className="text-[15px] font-bold leading-snug">{!ready?"Proof Race is coming to this story soon.":world.expeditions?.[0]?.interview?"Question the witnesses. Race through the story. Name the liar.":"Read a chunk. Race the Lantern Ghost to the line that proves it."}</span>
    <span className="mt-auto inline-flex items-center gap-1 font-display text-[18px] font-bold">Play now <ArrowRight size={18} aria-hidden/></span>
   </button>
   {code===null
    ?<button type="button" onClick={join} className="flex min-h-[200px] flex-col items-start gap-2 rounded-[20px] bg-panel p-4 text-left text-ink shadow-[0_6px_0_#0B0920] transition-transform active:translate-y-1 motion-reduce:transition-none">
     <Users size={30} className="text-highlight" aria-hidden/>
     <span className="font-display text-[20px] font-bold leading-tight">Join a live game</span>
     <span className="text-[14px] font-bold leading-snug text-muted">Your teacher has a code on the board.</span>
     <ArrowRight size={20} className="mt-auto text-highlight" aria-hidden/>
    </button>
    :<form onSubmit={e=>{e.preventDefault();if(clean.length>=4)window.location.href=`/live/${clean}`}} className="flex min-h-[200px] flex-col gap-2 rounded-[20px] bg-panel p-4">
     <label htmlFor="live-code" className="font-display text-[18px] font-bold leading-tight">Code on the board</label>
     <input ref={codeRef} id="live-code" value={code} onChange={e=>setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" inputMode="text" className="min-h-12 w-full rounded-row border-2 border-edge bg-panel-2 px-3 font-display text-[20px] uppercase tracking-[.1em] focus:border-highlight"/>
     <button type="submit" disabled={clean.length<4} className="btn btn-primary mt-auto !min-h-12 !px-3 !text-[16px]">Join <ArrowRight size={16} aria-hidden/></button>
    </form>}
  </div>
 </div>;
}
