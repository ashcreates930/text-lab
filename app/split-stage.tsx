"use client";
// The question layout used by every race question, the Gist check, Name the Liar and the Refresher.
// Laptop and tablet (768 px and wider): the reading card on the left (about 55 percent) and the question side on the
// right; each side scrolls on its own and the question side stays put while the passage scrolls.
// Phone: the passage fills the screen and the question sits in a panel pinned to the bottom, which the student can
// expand to answer or shrink to read. The heading and the main action (Lock in) stay visible either way.
// Offsets: the site header and the race HUD are pinned; their heights are published as --header-h and --hud-h.
import {useEffect,useState} from "react";
import {ChevronDown,ChevronUp} from "lucide-react";

export function useStickyOffsets(){
 useEffect(()=>{
  const root=document.documentElement,set=()=>{const hd=document.querySelector("header"),h=hd&&["sticky","fixed"].includes(getComputedStyle(hd).position)?hd.getBoundingClientRect().height:0,hud=document.querySelector(".hud")?.getBoundingClientRect().height??0;
   root.style.setProperty("--header-h",`${Math.round(h)}px`);root.style.setProperty("--hud-h",`${Math.round(hud)}px`)};
  set();const ro=new ResizeObserver(set);const watch=()=>{ro.disconnect();for(const el of [document.querySelector("header"),document.querySelector(".hud")])if(el)ro.observe(el)};watch();
  const mo=new MutationObserver(()=>{watch();set()});mo.observe(document.body,{childList:true,subtree:true});window.addEventListener("resize",set);
  return()=>{ro.disconnect();mo.disconnect();window.removeEventListener("resize",set)};
 },[]);
}

export function SplitStage({passage,head,body,action,collapse=false,label="Question"}:{passage:React.ReactNode;head:React.ReactNode;body?:React.ReactNode;action?:React.ReactNode;collapse?:boolean;label?:string}){
 // On a phone the panel opens to answer; a step that needs the passage (tapping a sentence) shrinks it to read.
 const [open,setOpen]=useState(!collapse);
 useEffect(()=>{setOpen(!collapse)},[collapse]);
 return <div className="split-stage md:grid md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] md:items-start md:gap-5">
  <div className={`split-passage md:sticky md:top-[calc(var(--header-h,0px)+var(--hud-h,0px)+8px)] md:max-h-[calc(100dvh-var(--header-h,0px)-var(--hud-h,0px)-24px)] md:overflow-y-auto md:overscroll-contain md:pb-2 ${open?"pb-[62dvh]":"pb-44"} md:!pb-2`}>{passage}</div>
  <section aria-label={label} className="split-panel fixed inset-x-0 bottom-0 z-30 rounded-t-[22px] border-t-2 border-edge bg-panel-2 shadow-[0_-10px_30px_rgba(0,0,0,.35)] md:sticky md:inset-auto md:top-[calc(var(--header-h,0px)+var(--hud-h,0px)+8px)] md:z-auto md:max-h-[calc(100dvh-var(--header-h,0px)-var(--hud-h,0px)-24px)] md:overflow-y-auto md:overscroll-contain md:rounded-card md:border-0 md:bg-transparent md:shadow-none">
   <div className="flex items-start gap-2 px-4 pt-3 md:px-0 md:pt-0">
    <div className="min-w-0 flex-1">{head}</div>
    <button type="button" onClick={()=>setOpen(o=>!o)} aria-expanded={open} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-panel md:hidden">{open?<ChevronDown size={20} aria-hidden/>:<ChevronUp size={20} aria-hidden/>}<span className="sr-only">{open?"Shrink the question to read":"Expand the question to answer"}</span></button>
   </div>
   {body&&<div className={`${open?"max-h-[42dvh] overflow-y-auto":"hidden"} px-4 pb-2 md:block md:max-h-none md:overflow-visible md:px-0`}>{body}</div>}
   {action&&<div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 md:px-0 md:pb-0">{action}</div>}
   {!action&&<div className="h-3 md:hidden"/>}
  </section>
 </div>;
}
