"use client";
// The character-select lineup (rules: lib/lineup.ts). One character in the spotlight in the middle, on the dark stage
// (3D when the story has a model for them, otherwise their portrait with a slow idle), with a dimmed neighbour on each
// side. Tap a neighbour, swipe, or use the arrow keys (Home and End too) to move the spotlight; it wraps around. A
// character with a model reacts as they step into the spotlight. The name card underneath shows the name, a check
// (for example "Asked") and dots for where you are. Each move is announced. Under reduced motion nothing slides,
// bobs or reacts. The host board uses it without controls (interactive={false}).
import {useEffect,useRef,useState} from "react";
import {Check} from "lucide-react";
import {CharacterStage,type CharacterModel,type StageClip} from "./character-stage";
import {lineupKey,lineupWindow,spotlightLabel,swipeStep,wrap} from "@/lib/lineup";

export type LineupItem={id:string;name:string;portrait?:string|null;model?:CharacterModel|null;check?:string|null};
const reducedMotion=()=>typeof window!=="undefined"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||document.documentElement.dataset.motion==="reduced");

export function Lineup({items,index,onIndex,label,height=300,speaking=false,level=0,gesture=null,threeD=true,interactive=true,cardExtra}:{items:LineupItem[];index:number;onIndex?:(i:number)=>void;label:string;height?:number;speaking?:boolean;level?:number;gesture?:{clip:"laughing"|"head-shake";key:number}|null;threeD?:boolean;interactive?:boolean;cardExtra?:React.ReactNode}){
 const n=items.length,i=wrap(index,n),cur=items[i];
 const [said,setSaid]=useState(""),[reaction,setReaction]=useState<{clip:"laughing"|"head-shake";key:number}|null>(null);
 const prev=useRef<string|null>(null),start=useRef<{x:number;y:number}|null>(null),swiped=useRef(0);
 // A move announces where the spotlight is; a character with a model reacts on stepping in (not under reduced motion).
 useEffect(()=>{
  if(!cur)return;
  if(cur.model&&threeD&&!reducedMotion()){const clips=cur.model.clips;const c:"laughing"|"head-shake"|null=clips.laughing?"laughing":clips["head-shake"]?"head-shake":null;setReaction(c?{clip:c,key:Date.now()}:null)}else setReaction(null);
  // Announce moves only: not the first view (React may run this twice), not the same character again.
 if(prev.current===null||prev.current===cur.id){prev.current=cur.id;return}
 prev.current=cur.id;
  setSaid(spotlightLabel(cur.name,i,n,cur.check===undefined?null:!!cur.check));
 },[cur?.id]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!cur)return null;
 const go=(k:number)=>{if(interactive&&onIndex&&k!==i)onIndex(wrap(k,n))};
 const onKey=(e:React.KeyboardEvent)=>{if(!interactive)return;const k=lineupKey(e.key,i,n);if(k===null)return;e.preventDefault();go(k)};
 const onDown=(e:React.PointerEvent)=>{start.current={x:e.clientX,y:e.clientY}};
 const onUp=(e:React.PointerEvent)=>{const s=start.current;start.current=null;if(!s||!interactive)return;const step=swipeStep(e.clientX-s.x,e.clientY-s.y);if(step){swiped.current=Date.now();go(i+step)}};
 // The neighbours stay smaller than the spotlight: at most about 40 percent of the stage height (and 120 px).
 const sideMax=Math.round(Math.min(120,height*0.42));
 const side=(k:number,slot:"left"|"right")=>{const it=items[k],img=<span className="relative block">
   {it.portrait?<img src={it.portrait} alt="" draggable={false} className="portrait-idle aspect-square w-full rounded-full border-2 border-edge object-cover"/>:<span className="grid aspect-square w-full place-items-center rounded-full bg-reading font-display text-[28px] font-bold text-reading-ink">{it.name.slice(0,1)}</span>}
   {it.check&&<span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-success text-on-success"><Check size={16} aria-hidden/></span>}</span>;
  const cls="lineup-side flex w-[24%] shrink-0 flex-col items-center gap-1 self-center opacity-50 saturate-50 transition-opacity";
  return interactive
   ?<button key={slot} type="button" onClick={()=>{if(Date.now()-swiped.current<400)return;go(k)}} aria-label={`Spotlight ${spotlightLabel(it.name,k,n,it.check===undefined?null:!!it.check)}`} style={{maxWidth:sideMax}} className={`${cls} min-h-11 rounded-card p-1 hover:opacity-80 focus-visible:opacity-100`}>{img}<span className="text-[13px] font-bold leading-tight text-ink">{it.name.split(/\s+/)[0]}</span></button>
   :<div key={slot} aria-hidden style={{maxWidth:sideMax}} className={cls}>{img}<span className="text-[15px] font-bold leading-tight text-ink">{it.name.split(/\s+/)[0]}</span></div>};
 const win=lineupWindow(n,i),left=win.find(w=>w.slot==="left"),right=win.find(w=>w.slot==="right");
 const clip:StageClip=speaking?"talking":"idle";
 return <div className="flex flex-col gap-2">
  <div role="group" aria-roledescription="lineup" aria-label={interactive?`${label}. Use the arrow keys or swipe to move the spotlight.`:label} tabIndex={interactive?0:undefined}
   onKeyDown={onKey} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={()=>{start.current=null}}
   className="flex items-center justify-center gap-2 rounded-card bg-deep p-2 outline-none focus-visible:ring-4 focus-visible:ring-highlight" style={{touchAction:"pan-y"}}>
   {left?side(left.index,"left"):n===2?<span style={{maxWidth:sideMax}} className="w-[24%] shrink-0"/>:null}
   <div key={cur.id} className="lineup-in min-w-0 flex-1">
    <CharacterStage model={threeD?cur.model??null:null} portrait={cur.portrait??null} name={cur.name} clip={clip} gesture={gesture??reaction} level={speaking?level:0} height={height}/>
   </div>
   {right?side(right.index,"right"):null}
  </div>
  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-card bg-panel px-4 py-2 text-center">
   <p className="font-display text-[22px] font-bold leading-tight">{cur.name}</p>
   {cur.check&&<span className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-[14px] font-bold text-on-success"><Check size={15} aria-hidden/>{cur.check}</span>}
   {n>1&&<span aria-hidden className="flex basis-full justify-center gap-1.5">{items.map((it,k)=><span key={it.id} className={`h-2 w-2 rounded-full ${k===i?"bg-highlight":"bg-edge"}`}/>)}</span>}
   {cardExtra}
  </div>
  <p className="sr-only" role="status" aria-live="polite">{said}</p>
 </div>;
}
