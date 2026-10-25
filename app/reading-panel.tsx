"use client";
// The reading panel: the passage as the main thing on screen, one tappable unit per sentence. Tapping a line keeps it
// in the Evidence pouch (the same interaction everywhere: the clue screen, Story Mode and live rounds). A long press,
// or the Mark button beside each line for keyboard and screen reader users, tags a line as a clue, a word to know or a
// question. The text is cleaned for display only (lib/clue-game.ts displayLine); taps send the story's own text.
// The right line is never highlighted before the student taps it: only lines they kept, and their result, are marked.
// Words to know: glossary words that appear in the passage are listed above it; tapping one opens its card.
import {useEffect,useId,useMemo,useRef,useState} from "react";
import {Bookmark,Check,X} from "lucide-react";
import type {SourcePassage} from "@/lib/source-passages";
import {withContentNotes} from "@/lib/content-notes";
import {evidenceSentences,lineWords} from "@/lib/lies";
import {MARK_TAGS,displayLine,markKey,paragraphLabel,type LineMark} from "@/lib/clue-game";
import {wordsToKnow,type GlossaryWord} from "@/lib/fair-play";
import {ContentNote} from "./content-note";

export type PanelLine={pid:string;index:number;text:string};
export type PanelPin={line:string;by:string;color?:string;computer?:boolean};
export type PanelReaction={line:string;by:string;stem:string;body:string};
const same=(a:string,b:string)=>lineWords(a)===lineWords(b);
const TAG_STYLE:Record<string,string>={clue:"bg-[#A0472C] text-white",word:"bg-[#DDE7F3] text-[#24476E]",question:"bg-[#FBEFD2] text-[#6E520F]"};

export function ReadingPanel({passages,notes,kept=[],selected,results,pins=[],reactions=[],marks,onTap,onMark,locked=false,title,className="",glossary}:{passages:SourcePassage[];notes?:Map<string,string>;kept?:string[];selected?:string;results?:{line:string;ok:boolean}[];pins?:PanelPin[];reactions?:PanelReaction[];marks?:Record<string,LineMark>;onTap:(l:PanelLine)=>void;onMark?:(l:PanelLine)=>void;locked?:boolean;title?:React.ReactNode;className?:string;glossary?:GlossaryWord[]}){
 const words=useMemo(()=>wordsToKnow(passages,glossary),[passages,glossary]);
 return <section aria-label="The story" className={`flex min-h-0 flex-col overflow-hidden rounded-3xl bg-[#FFFDF8] shadow-[0_2px_14px_-6px_rgba(42,38,32,.35)] ${className}`}>
  {title&&<div className="flex items-center justify-between gap-2 border-b border-[#EFE8D8] px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[#8A3B23]">{title}</div>}
  {words.length>0&&<WordCards words={words}/>}
  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 md:px-3" tabIndex={-1}>
   {withContentNotes(passages,notes??new Map()).map(item=>item.kind==="note"?<div key={item.id} className="px-2 py-1"><ContentNote text={item.text}/></div>
    :<div key={item.id} className="mb-2">
     <p className="px-2 pt-1 text-[12px] font-bold text-[#8A7F6E]" aria-hidden>{paragraphLabel(item.id)}</p>
     <ol aria-label={`Paragraph ${paragraphLabel(item.id).slice(1)}`}>{evidenceSentences(item.text).map((t,i)=>{
      const line={pid:item.id,index:i,text:t};
      const isKept=kept.some(k=>same(k,t)),isSel=!!selected&&same(selected,t),res=results?.find(r=>same(r.line,t));
      const mark=marks?.[markKey(item.id,i)],linePins=pins.filter(p=>same(p.line,t)),lineReacts=reactions.filter(r=>same(r.line,t));
      return <li key={i} className="group relative flex items-stretch gap-1">
       <LineButton line={line} display={displayLine(t)} kept={isKept} selected={isSel} result={res?.ok} mark={mark} locked={locked} onTap={onTap} onMark={onMark}/>
       {onMark&&<button type="button" onClick={()=>onMark(line)} aria-label={`Mark this line: ${displayLine(t).slice(0,60)}`} className="my-1 grid w-10 shrink-0 place-items-center rounded-xl text-[#8A7F6E] hover:bg-[#EFE8D8] hover:text-[#8A3B23]"><Bookmark size={17}/></button>}
       {linePins.length>0&&<span className="sr-only">{linePins.map(p=>`${p.by} pinned this line.`).join(" ")}{lineReacts.length?` ${lineReacts.length} reaction${lineReacts.length===1?"":"s"}.`:""}</span>}
      </li>;
     })}</ol>
     {/* Teammates' pins and reactions sit under the paragraph they belong to. */}
     {evidenceSentences(item.text).some(t=>pins.some(p=>same(p.line,t))||reactions.some(r=>same(r.line,t)))&&<ul className="mx-2 mt-1 space-y-1.5" aria-label="Pins and reactions">
      {evidenceSentences(item.text).flatMap((t,i)=>{const ps=pins.filter(p=>same(p.line,t)),rs=reactions.filter(r=>same(r.line,t));if(!ps.length&&!rs.length)return [];
       return [<li key={i} className="rounded-2xl bg-[#F6F0E3] px-3 py-2 text-[13px] leading-5">
        <p className="flex flex-wrap items-center gap-1.5 font-bold text-[#8A3B23]">{ps.map(p=><span key={p.by} className="inline-flex items-center gap-1"><span aria-hidden className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-white" style={{background:p.color??"#A0472C"}}>{initials(p.by)}</span>{p.by}{p.computer?" (computer)":""} pinned</span>)}<span className="font-normal text-[#6B6457]">“{displayLine(t).slice(0,48)}…”</span></p>
        {rs.map((r,k)=><p key={k} className="mt-1"><b className="text-[#8A3B23]">{r.by} · {r.stem}</b> {r.body}</p>)}
       </li>]})}
     </ul>}
    </div>)}
  </div>
 </section>;
}
const initials=(name:string)=>name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();

// One line: a tap keeps it; a long press (half a second) opens the mark-up menu. A long press never also counts as a tap.
function LineButton({line,display,kept,selected,result,mark,locked,onTap,onMark}:{line:PanelLine;display:string;kept:boolean;selected:boolean;result?:boolean;mark?:LineMark;locked:boolean;onTap:(l:PanelLine)=>void;onMark?:(l:PanelLine)=>void}){
 const timer=useRef<number|null>(null),pressed=useRef(false),textId=useId();
 useEffect(()=>()=>{if(timer.current)window.clearTimeout(timer.current)},[]);
 const start=()=>{if(!onMark)return;pressed.current=false;timer.current=window.setTimeout(()=>{pressed.current=true;onMark(line)},500)};
 const cancel=()=>{if(timer.current){window.clearTimeout(timer.current);timer.current=null}};
 const tone=result===true?"border-[#2F6B3A] bg-[#E8F2E7]":result===false?"border-[#A33B20] bg-[#FBEDE5]":selected?"border-[#A0472C] bg-[#FBEDE5] ring-2 ring-[#A0472C]/30":kept?"line-pop border-[#A0472C] bg-[#FBEDE5]":"border-[#E9E1D2] bg-[#FFFDF8] hover:border-[#C9B9A0] hover:bg-[#FBF7EE]";
 // Its name says where it is and what a tap does; the whole line is its description.
 const first=display.split(/\s+/).slice(0,6).join(" ");
 const name=`Line from paragraph ${paragraphLabel(line.pid).slice(1)}: ${first}… ${result!==undefined?(result?"Right line":"Not this line"):kept?"In your pouch. Tap to take out":"Add to pouch"}`;
 return <button type="button" disabled={locked} aria-pressed={kept} aria-label={name} aria-describedby={textId} onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onContextMenu={e=>{if(onMark)e.preventDefault()}}
  onClick={()=>{if(pressed.current){pressed.current=false;return}onTap(line)}}
  className={`my-0.5 flex min-h-[44px] w-full select-none items-start gap-2 rounded-2xl border-2 px-3 py-2 text-left font-serif text-[17px] leading-[1.55] text-[#2A2620] transition active:scale-[.98] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}>
  <span id={textId} className="min-w-0 flex-1">{mark&&<span className={`mr-1.5 inline-block rounded-md px-1.5 py-0.5 align-[2px] font-sans text-[11px] font-bold ${TAG_STYLE[mark.tag]}`}>{MARK_TAGS[mark.tag]}</span>}{display}</span>
  {result===true&&<Check size={18} className="mt-1 shrink-0 text-[#2F6B3A]" aria-label="Right line"/>}
  {result===false&&<X size={18} className="mt-1 shrink-0 text-[#A33B20]" aria-label="Not this line"/>}
  {result===undefined&&kept&&<span className="sr-only">In your pouch</span>}
 </button>;
}

// The mark-up menu (a bottom sheet). Escape or the close button returns focus to the panel.
export function MarkSheet({line,current,inPouch,onTag,onPouch,onClose}:{line:PanelLine;current?:LineMark;inPouch:boolean;onTag:(tag:keyof typeof MARK_TAGS|null)=>void;onPouch:()=>void;onClose:()=>void}){
 const first=useRef<HTMLButtonElement>(null);
 useEffect(()=>{first.current?.focus();const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[onClose]);
 const opts:[keyof typeof MARK_TAGS,string][]=[["clue","bg-[#A0472C] text-white"],["word","bg-[#DDE7F3] text-[#24476E]"],["question","bg-[#FBEFD2] text-[#6E520F]"]];
 return <div className="absolute inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="mark-h">
  <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[#2A2620]/45"/>
  <div className="relative w-full max-w-lg rounded-t-3xl bg-[#FFFDF8] p-5 pb-7 shadow-[0_-12px_30px_-10px_rgba(0,0,0,.35)]">
   <p id="mark-h" className="text-[13px] font-bold uppercase tracking-wide text-[#6B6457]">Mark this line · {paragraphLabel(line.pid)}</p>
   <p className="mt-2 line-clamp-3 font-serif text-[16px] italic leading-6 text-[#2A2620]">“{displayLine(line.text)}”</p>
   <div className="mt-4 grid gap-2">{opts.map(([tag,cls],i)=><button key={tag} ref={i===0?first:undefined} type="button" aria-pressed={current?.tag===tag} onClick={()=>onTag(current?.tag===tag?null:tag)} className={`flex min-h-12 items-center justify-between rounded-full px-5 text-[16px] font-bold ${cls}`}>{MARK_TAGS[tag]}{current?.tag===tag&&<span className="text-[13px] font-semibold">Tap to remove</span>}</button>)}
    <button type="button" onClick={onPouch} className="min-h-12 rounded-full bg-[#EFE8D8] px-5 text-left text-[16px] font-bold text-[#2A2620]">{inPouch?"Take out of my pouch":"Keep in my pouch"}</button>
    <button type="button" onClick={onClose} className="min-h-11 text-[15px] font-semibold text-[#6B6457] underline underline-offset-4">Done</button></div>
  </div>
 </div>;
}

// Words to know: a row of the glossary words in this passage. A card opens in place (one at a time) and closes with
// Escape or its button; focus stays in the row.
function WordCards({words}:{words:GlossaryWord[]}){
 const [open,setOpen]=useState<string|null>(null);
 const card=words.find(w=>w.term===open);
 useEffect(()=>{if(!open)return;const k=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(null)};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[open]);
 return <div className="border-b border-[#EFE8D8] px-3 py-2">
  <div className="flex flex-wrap items-center gap-1.5"><span className="text-[12px] font-bold uppercase tracking-wide text-[#24476E]">Words to know</span>{words.map(w=><button key={w.term} type="button" aria-expanded={open===w.term} onClick={()=>setOpen(o=>o===w.term?null:w.term)} className={`min-h-9 rounded-full px-3 text-[14px] font-semibold ${open===w.term?"bg-[#24476E] text-white":"bg-[#DDE7F3] text-[#24476E]"}`}>{w.term}</button>)}</div>
  {card&&<div role="note" aria-live="polite" className="mt-2 flex items-start justify-between gap-2 rounded-2xl bg-[#EEF3FA] px-3 py-2"><p className="text-[15px] leading-6 text-[#1F3550]"><b>{card.term}:</b> {card.student_friendly_definition}</p><button type="button" onClick={()=>setOpen(null)} aria-label="Close the word card" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-[#DDE7F3]"><X size={16}/></button></div>}
 </div>;
}
