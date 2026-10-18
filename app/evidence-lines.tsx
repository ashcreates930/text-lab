"use client";
// The tappable evidence lines: every sentence of the given paragraphs, numbered, one of them chosen. Used by the clue
// screen ("tap the one that proves it") and the storyboard frame screen ("choose your line"). A flagged paragraph gets
// its content note directly before its first line.
import {Check} from "lucide-react";
import type {SourcePassage} from "@/lib/source-passages";
import {withContentNotes} from "@/lib/content-notes";
import {ContentNote} from "./content-note";

export function sentences(text:string){return (text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)??[text]).map(s=>s.trim()).filter(Boolean)}

export function EvidenceLines({passages,picked,onPick,notes,className="mt-3 max-h-[62vh] space-y-2 overflow-y-auto pr-1"}:{passages:SourcePassage[];picked:string|undefined;onPick:(line:{text:string;pid:string})=>void;notes?:Map<string,string>;className?:string}){
 let n=-1;
 return <ol className={className}>{withContentNotes(passages,notes??new Map()).flatMap(item=>item.kind==="note"?[<li key={item.id}><ContentNote text={item.text}/></li>]:sentences(item.text).map((t,i)=>({t,pid:item.id,k:item.id+"-"+i})).map(line=>{n++;const on=picked===line.t;return <li key={line.k}><button onClick={()=>onPick({text:line.t,pid:line.pid})} aria-pressed={on} className={`flex w-full gap-3 rounded-2xl border px-3 py-2.5 text-left font-serif text-[16px] leading-7 transition ${on?"border-[#A0472C] bg-[#A0472C] text-white shadow-md":"border-[#E4DCCB] bg-white hover:border-[#A0472C] hover:bg-[#FBF1EB]"}`}><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-sans text-[12px] font-bold ${on?"bg-white text-[#A0472C]":"bg-[#EFE8D8] text-[#6B6457]"}`}>{on?<Check size={14}/>:n+1}</span><span>{line.t}</span></button></li>}))}</ol>;
}
