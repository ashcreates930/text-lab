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
  <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[#2A2620]/50"/>
  <div className="relative flex max-h-[94%] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[#FFFDF8] shadow-[0_-12px_30px_-10px_rgba(0,0,0,.35)] md:rounded-3xl">
   <div className="flex items-start gap-4 p-5 pb-3">
    <Portrait character={character} size={84}/>
    <div className="min-w-0 flex-1">
     <h2 id="card-h" ref={heading} tabIndex={-1} className="text-[24px] font-bold leading-tight text-[#2A2620] outline-none">{card.name}</h2>
     <p className="mt-1 text-[15px] leading-6 text-[#4A4438]">{card.role}</p>
     {trust!==undefined&&<p className="mt-2 inline-flex rounded-full bg-[#F4E1D6] px-3 py-1 text-[13px] font-bold text-[#8A3B23]">Trust: {trust>0?`+${trust}`:trust}</p>}
    </div>
    <button type="button" onClick={onClose} aria-label="Close the card" className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-[#EFE8D8]"><X size={20}/></button>
   </div>
   <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-3">
    <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">What the story shows</h3>
    {card.traits.map(t=><div key={t.name} className="rounded-2xl border border-[#E4DCCB] p-3"><p className="text-[16px] font-bold text-[#2A2620]">{t.name}</p><blockquote className="mt-1 font-serif text-[15px] italic leading-6 text-[#4A4438]">{displayLine(t.line)}</blockquote><p className="mt-1 text-[12px] font-bold text-[#8A7F6E]">{paragraphLabel(t.paragraph)}</p></div>)}
    {!card.traits.length&&!card.locked&&<p className="text-[15px] text-[#6B6457]">Read on to learn more about {card.name}.</p>}
    {card.locked>0&&<p className="flex items-center gap-2 rounded-2xl border border-dashed border-[#C9B9A0] p-3 text-[14px] text-[#6B6457]"><Lock size={15}/>{card.locked===1?"One more trait unlocks":`${card.locked} more traits unlock`} later in the story.</p>}
   </div>
   <div className="grid grid-cols-2 gap-2 border-t border-[#EFE8D8] p-4">
    {onHologram?<button type="button" onClick={onHologram} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2A2620] text-[15px] font-bold text-white"><Sparkles size={17}/>Hologram</button>:<span/>}
    {onAsk?<button type="button" onClick={onAsk} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#A0472C] text-[15px] font-bold text-white"><MessageCircle size={17}/>Ask {card.name.split(" ")[0]}</button>:<span/>}
   </div>
  </div>
 </div>;
}
