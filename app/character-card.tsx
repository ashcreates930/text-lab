"use client";
// A character card, opened by tapping a character's portrait: their picture, their part in the story, and two or three
// traits, each with the exact line from the story that shows it (checked by validate:worlds). Spoiler-safe: only traits
// from paragraphs the student has reached (lib/clue-game.ts characterCard). The Hologram button lives here.
import {useEffect,useRef} from "react";
import {Lock,MessageCircle,Sparkles,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {characterCard,displayLine,paragraphLabel} from "@/lib/clue-game";
import {Portrait} from "./game-feel";

type Character=WorldPack["characters"][number];
export function CharacterCard({world,passages,character,sceneIndex,trust,onAsk,onHologram,onClose}:{world:WorldPack;passages:SourcePassage[];character:Character;sceneIndex:number;trust?:number;onAsk?:()=>void;onHologram?:()=>void;onClose:()=>void}){
 const card=characterCard(world,passages,character,sceneIndex);
 const heading=useRef<HTMLHeadingElement>(null),back=useRef<Element|null>(null);
 useEffect(()=>{back.current=document.activeElement;heading.current?.focus();const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",k);return()=>{window.removeEventListener("keydown",k);(back.current as HTMLElement|null)?.focus?.({preventScroll:true})}},[onClose]);
 return <div className="absolute inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="card-h">
  <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-deep/50"/>
  <div className="relative flex max-h-[94%] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-panel md:rounded-3xl">
   <div className="flex items-start gap-4 p-5 pb-3">
    <Portrait character={character} size={84}/>
    <div className="min-w-0 flex-1">
     <h2 id="card-h" ref={heading} tabIndex={-1} className="text-[24px] font-bold leading-tight text-ink outline-none">{card.name}</h2>
     <p className="mt-1 text-[15px] leading-6 text-muted">{card.role}</p>
     {trust!==undefined&&<p className="mt-2 inline-flex rounded-full bg-primary-soft px-3 py-1 text-[13px] font-bold text-highlight">Trust: {trust>0?`+${trust}`:trust}</p>}
    </div>
    <button type="button" onClick={onClose} aria-label="Close the card" className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-panel-2"><X size={20}/></button>
   </div>
   <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-3">
    <h3 className="text-[13px] font-bold uppercase tracking-wide text-highlight">What the story shows</h3>
    {card.traits.map(t=><div key={t.name} className="rounded-2xl border border-edge p-3"><p className="text-[16px] font-bold text-ink">{t.name}</p><blockquote className="mt-1 font-serif text-[15px] italic leading-6 text-muted">{displayLine(t.line)}</blockquote><p className="mt-1 text-[12px] font-bold text-muted">{paragraphLabel(t.paragraph)}</p></div>)}
    {!card.traits.length&&!card.locked&&<p className="text-[15px] text-muted">Read on to learn more about {card.name}.</p>}
    {card.locked>0&&<p className="flex items-center gap-2 rounded-2xl border border-dashed border-edge p-3 text-[14px] text-muted"><Lock size={15}/>{card.locked===1?"One more trait unlocks":`${card.locked} more traits unlock`} later in the story.</p>}
   </div>
   <div className="grid grid-cols-2 gap-2 border-t border-edge p-4">
    {onHologram?<button type="button" onClick={onHologram} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep text-[15px] font-bold text-ink"><Sparkles size={17}/>Hologram</button>:<span/>}
    {onAsk?<button type="button" onClick={onAsk} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-bold text-on-primary"><MessageCircle size={17}/>Ask {card.name.split(" ")[0]}</button>:<span/>}
   </div>
  </div>
 </div>;
}
