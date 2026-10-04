"use client";
import {useEffect,useRef,useState} from "react";
import {BookmarkPlus,Volume2} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {useBilingual} from "./bilingual";

type Entry=WorldPack["glossary"][number];
export function GlossaryWord({entry,onSave,onOpen,grade=10}:{entry:Entry;onSave:()=>void;onOpen:()=>void;grade?:number}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLSpanElement>(null);
 useEffect(()=>{if(!open)return;const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};document.addEventListener("keydown",esc);document.addEventListener("pointerdown",outside);return()=>{document.removeEventListener("keydown",esc);document.removeEventListener("pointerdown",outside)}},[open]);
 function show(){if(!open){onOpen();setOpen(true)}}
 const {lang,tr}=useBilingual();const homeTerm=tr(entry.term),homeDef=tr(entry.student_friendly_definition);
 const definition=grade<=9?(entry.plain_definition||entry.student_friendly_definition):(entry.definition||entry.student_friendly_definition);
 return <span ref={root} className="relative inline-block"><button type="button" aria-haspopup="dialog" aria-expanded={open} onPointerEnter={show} onFocus={show} onClick={()=>{if(open)setOpen(false);else show()}} className="border-b border-dotted border-[#4A6741] text-[#4A6741]">{entry.term}</button>{open&&<span role="dialog" aria-label={`${entry.term} vocabulary`} onPointerEnter={()=>{}} className="absolute left-0 top-full z-[80] mt-2 block w-[min(19rem,80vw)] rounded-sm border border-[#4A6741]/45 bg-[#F6F0E3] p-4 text-left text-sm text-[#2A2620] shadow-2xl"><span className="flex items-start justify-between gap-2"><span><b className="serif text-lg">{entry.term}</b><span className="ml-2 text-xs italic text-white/45">{entry.part_of_speech||"word"}</span></span><button type="button" aria-label={`Read ${entry.term} aloud`} onClick={()=>{const u=new SpeechSynthesisUtterance(`${entry.term}. ${definition}`);u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}} className="rounded-full border border-white/15 p-1.5 text-[#4A6741]"><Volume2 size={14}/></button></span><span className="mt-2 block leading-5">{definition}</span>{lang&&(homeTerm||homeDef)&&<span lang={lang} className="mt-2 block border-l-2 border-[#8fb3cf] pl-2 leading-5 text-[#2F5D7C]">{homeTerm&&<b>{homeTerm}</b>}{homeTerm&&homeDef?": ":""}{homeDef}</span>}<span className="mt-3 block border-t border-white/10 pt-2 text-xs leading-5 text-white/65"><b className="text-[#4A6741]">In the text</b><br/>{entry.text_sentence||`“${entry.term}” appears in the source text.`}</span><span className="mt-2 block text-xs leading-5 text-white/65"><b className="text-[#4A6741]">Everyday example</b><br/>{entry.example_sentence||""}</span><button type="button" onClick={onSave} className="mt-3 inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 text-[10px] uppercase tracking-wide hover:border-[#4A6741]"><BookmarkPlus size={12}/> Save word</button></span>}</span>
}
export function GlossaryText({text,glossary,onSave,onOpen,grade=10}:{text:string;glossary:Entry[];onSave:(term:string)=>void;onOpen:()=>void;grade?:number}){
 const entries=[...glossary].sort((a,b)=>b.term.length-a.term.length);if(!entries.length)return <>{text}</>;
 const escaped=entries.map(x=>x.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));const matcher=new RegExp(`\\b(${escaped.join("|")})\\b`,"gi");
 return <>{text.split(matcher).map((part,i)=>{const entry=entries.find(x=>x.term.toLowerCase()===part.toLowerCase());return entry?<GlossaryWord key={`${part}-${i}`} entry={entry} grade={grade} onSave={()=>onSave(entry.term)} onOpen={onOpen}/>:part})}</>;
}
