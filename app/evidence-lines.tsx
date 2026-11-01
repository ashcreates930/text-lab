"use client";
// The tappable evidence lines: every sentence of the given paragraphs, numbered, one of them chosen. Used by the clue
// screen ("tap the one that proves it") and the storyboard frame screen ("choose your line"). A flagged paragraph gets
// its content note directly before its first line.
import {Check} from "lucide-react";
import type {SourcePassage} from "@/lib/source-passages";
import {withContentNotes} from "@/lib/content-notes";
import {ContentNote} from "./content-note";
import {evidenceSentences,isHighlighted,type LieHighlight} from "@/lib/lies";

// The same split the lie checks use (lib/lies.ts), so a tapped line always matches what was validated.
export const sentences=evidenceSentences;

export function EvidenceLines({passages,picked,onPick,notes,highlight,className="mt-3 max-h-[62vh] space-y-2 overflow-y-auto pr-1"}:{passages:SourcePassage[];picked:string|undefined;onPick:(line:{text:string;pid:string})=>void;notes?:Map<string,string>;highlight?:LieHighlight;className?:string}){
 let n=-1;
 return <ol className={className}>{withContentNotes(passages,notes??new Map()).flatMap(item=>item.kind==="note"?[<li key={item.id}><ContentNote text={item.text}/></li>]:sentences(item.text).map((t,i)=>({t,pid:item.id,k:item.id+"-"+i})).map(line=>{n++;const on=picked===line.t;return <li key={line.k}><button onClick={()=>onPick({text:line.t,pid:line.pid})} aria-pressed={on} className={`flex w-full gap-3 rounded-2xl border px-3 py-2.5 text-left font-serif text-[16px] leading-7 transition ${on?"border-primary bg-primary text-on-primary shadow-md":isHighlighted(highlight,{text:line.t,pid:line.pid})?"border-gold bg-gold-soft hover:border-primary":"border-edge bg-panel hover:border-primary hover:bg-primary-soft"}`}><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-sans text-[12px] font-bold ${on?"bg-panel text-highlight":"bg-panel-2 text-muted"}`}>{on?<Check size={14}/>:n+1}</span><span>{line.t}</span></button></li>}))}</ol>;
}
