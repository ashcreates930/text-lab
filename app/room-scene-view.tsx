"use client";
// The explorable chamber (rules: lib/room-scene.ts). The chamber's painting fills the screen; on a phone it is wider
// than the screen and scrolls sideways, opening on what glows next. Markers are subtle: a brass ring with a soft
// lantern glow on the next thing to tap, a small brass check on opened items, nothing on later or hidden ones (they can
// still be tapped). Below the painting, the same things as a list of buttons, for keyboards, screen readers and small
// screens. Tapping an opened item shows its proof again; a later item says it opens after the glowing one; a hidden
// bonus item (once its lock is open) asks one small reading task before it pays coins. Actions on this screen keep
// scroll and focus where they are; the panel that opens takes focus without moving the page.
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {Check,DoorClosed,Lock,Search,Sparkles,X} from "lucide-react";
import type {Scene,SceneBonus,SceneNext} from "@/lib/room-scene";
import {bonusRight} from "@/lib/room-scene";
import {lineTokens} from "@/lib/escape-room";
import {focusScreenTop} from "./screen-focus";

type ItemState="open"|"next"|"later";
export type SceneViewProps={scene:Scene;title:string;next:SceneNext;opened:(lock0:number)=>boolean;
 witnessName:(character:string)=>string;witnessState:(character:string)=>"due"|"met"|"away";
 puzzleState:(id:string)=>"open"|"next"|"later";doorState:"next"|"later";
 bonusAvailable:(b:SceneBonus)=>boolean;bonusFound:string[];lineOf:(ref:{p:string;s:number})=>string|null;proofOf:(lock0:number)=>string|null;
 onItem:(lock0:number)=>void;onWitness:(character:string)=>void;onPuzzle:(id:string)=>void;onDoor:()=>void;onBonus:(id:string)=>void};
type Panel={kind:"opened";lock:number;label:string}|{kind:"later";label:string}|{kind:"bonus";b:SceneBonus}|{kind:"door"}|null;

function Marker({x,y,state,label,onTap,dashed}:{x:number;y:number;state:"next"|"open"|"none";label:string;onTap:()=>void;dashed?:boolean}){
 return <button type="button" onClick={onTap} aria-label={label} className="scene-spot absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-highlight" style={{left:`${x}%`,top:`${y}%`}} data-state={state}>
  {state==="next"&&<span aria-hidden className="scene-glow absolute inset-[-14px] rounded-full"/>}
  {state==="next"&&<span aria-hidden className={`absolute inset-1 rounded-full border-[3px] ${dashed?"border-dashed":""} border-gold`}/>}
  {state==="open"&&<span aria-hidden className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full border-2 border-gold bg-deep text-gold"><Check size={12} strokeWidth={3}/></span>}
 </button>;
}

export function SceneView(p:SceneViewProps){
 const {scene}=p,scroller=useRef<HTMLDivElement|null>(null),panelRef=useRef<HTMLDivElement|null>(null);
 const [panel,setPanel]=useState<Panel>(null),[tapped,setTapped]=useState<number|null>(null),[miss,setMiss]=useState(false);
 useLayoutEffect(()=>{focusScreenTop()},[]);
 // Open on what glows next: scroll the painting sideways (phones) so the next spot is in view.
 const nextSpot=(()=>{const n=p.next;if(!n)return null;if(n.kind==="item")return scene.items.find(i=>i.lock-1===n.lock)??null;if(n.kind==="witness")return scene.witnesses.find(w=>p.witnessState(w.character)==="due")??null;if(n.kind==="puzzle")return scene.puzzles.find(x=>x.id===n.id)??null;return scene.door})();
 useEffect(()=>{const el=scroller.current;if(!el||!nextSpot)return;el.scrollLeft=Math.max(0,(nextSpot.x/100)*el.scrollWidth-el.clientWidth/2)},[nextSpot?.x]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(panel)panelRef.current?.focus({preventScroll:true})},[panel]);
 const itemState=(lock0:number):ItemState=>p.opened(lock0)?"open":p.next?.kind==="item"&&p.next.lock===lock0?"next":"later";
 function tapItem(lock0:number,label:string){const st=itemState(lock0);if(st==="next"){p.onItem(lock0);return}setTapped(null);setMiss(false);setPanel(st==="open"?{kind:"opened",lock:lock0,label}:{kind:"later",label})}
 function tapBonus(b:SceneBonus){if(!p.bonusAvailable(b)){setPanel({kind:"later",label:"Something here"});return}setTapped(null);setMiss(false);setPanel({kind:"bonus",b})}
 function tapDoor(){if(p.doorState==="next")p.onDoor();else setPanel({kind:"door"})}
 const bonusLine=panel?.kind==="bonus"?p.lineOf(panel.b.line)??"":"",found=panel?.kind==="bonus"&&p.bonusFound.includes(panel.b.id);
 function checkBonus(){if(panel?.kind!=="bonus")return;if(bonusRight(panel.b,bonusLine,tapped)){p.onBonus(panel.b.id);setMiss(false)}else setMiss(true)}
 const opened=scene.items.filter(i=>p.opened(i.lock-1)).length;
 return <section aria-labelledby="scene-h" className="flex flex-col gap-3">
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{opened} of {scene.items.length} opened in this chamber</p>
  <h1 id="scene-h" className="text-[26px] leading-tight outline-none md:text-[30px]">{p.title}</h1>
  <div ref={scroller} className="overflow-x-auto rounded-card border border-edge">
   <div className="relative w-[780px] max-w-none md:w-full">
    <img src={scene.art} alt={scene.alt} className="block w-full select-none" draggable={false}/>
    {scene.items.map(i=>{const st=itemState(i.lock-1);return <Marker key={i.id} x={i.x} y={i.y} state={st==="later"?"none":st} label={`${i.label}${st==="open"?", opened":st==="next"?", tap to open its lock":", opens later"}`} onTap={()=>tapItem(i.lock-1,i.label)}/>})}
    {scene.witnesses.map(w=>{const st=p.witnessState(w.character);return st==="away"?null:<Marker key={w.character} x={w.x} y={w.y} state={st==="due"?"next":"none"} label={`${p.witnessName(w.character)}${st==="due"?", tap to ask your question":", already met"}`} onTap={()=>st==="due"?p.onWitness(w.character):setPanel({kind:"later",label:`${p.witnessName(w.character)} has answered; it's in your Case File.`})}/>})}
    {scene.puzzles.map(z=>{const st=p.puzzleState(z.id);return <Marker key={z.id} x={z.x} y={z.y} state={st==="later"?"none":st} label={`Puzzle lock${st==="open"?", solved":st==="next"?", tap to open it":", opens later"}`} onTap={()=>st==="next"?p.onPuzzle(z.id):setPanel({kind:"later",label:"This puzzle lock"})}/>})}
    <Marker x={scene.door.x} y={scene.door.y} state={p.doorState==="next"?"next":"none"} label={`${scene.door.label}${p.doorState==="next"?", tap to open":", locked"}`} onTap={tapDoor}/>
    {scene.bonus.map(b=><Marker key={b.id} x={b.x} y={b.y} state={p.bonusFound.includes(b.id)?"open":"none"} dashed label={p.bonusAvailable(b)?`Look closer: ${b.label}${p.bonusFound.includes(b.id)?", found":""}`:"Something to look at later"} onTap={()=>tapBonus(b)}/>)}
   </div>
  </div>
  {panel&&<div ref={panelRef} tabIndex={-1} role="region" aria-label="Details" className="relative rounded-card border border-edge bg-panel p-4 outline-none">
   <button type="button" onClick={()=>setPanel(null)} aria-label="Close" className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full text-muted hover:text-ink"><X size={18} aria-hidden/></button>
   {panel.kind==="opened"&&<><p className="pr-10 font-display text-[18px] font-semibold">{panel.label}</p><p className="mt-1 text-[14px] font-bold text-muted">Opened. Its proof is in your Case File:</p>
    <p className="mt-2 rounded-row bg-reading px-3 py-2 font-serif text-[16px] leading-snug text-reading-ink">{p.proofOf(panel.lock)??"Opened with the shown proof."}</p></>}
   {panel.kind==="later"&&<p className="pr-10 text-[16px] font-bold">{panel.label.endsWith(".")?panel.label:`${panel.label} opens later. Find the glowing spot first; the story goes in order.`}</p>}
   {panel.kind==="door"&&<p className="flex items-center gap-2 pr-10 text-[16px] font-bold"><DoorClosed size={18} aria-hidden className="text-highlight"/>{scene.door.label} opens once every lock in this chamber is open.</p>}
   {panel.kind==="bonus"&&<><p className="flex items-center gap-2 pr-10 font-display text-[18px] font-semibold"><Search size={18} aria-hidden className="text-highlight"/>Look closer: {panel.b.label}</p>
    {found?<p role="status" className="mt-2 flex items-center gap-2 text-[16px] font-bold text-success"><Sparkles size={18} aria-hidden/>Found it. The coins are yours.</p>
     :<><p className="mt-1 text-[15px] font-bold">{panel.b.question} Tap the word in the line that answers.</p>
      <p className="mt-2 rounded-row bg-reading px-3 py-2 font-serif text-[17px] leading-relaxed text-reading-ink">{lineTokens(bonusLine).map((t,i)=><span key={i}>{i>0?" ":""}<button type="button" aria-pressed={tapped===i} onClick={()=>{setTapped(i);setMiss(false)}} className={`rounded px-0.5 ${tapped===i?"bg-line-picked shadow-[0_0_0_2px_var(--color-primary)]":"hover:bg-line-picked/60"}`}>{t.text.trim()}</button></span>)}</p>
      {miss&&<p role="status" className="mt-2 text-[15px] font-bold text-notyet">Not that word. Read the line again.</p>}
      <button type="button" disabled={tapped===null} onClick={checkBonus} className="case-primary mt-3 min-h-[52px] w-full justify-center text-[17px]">Check the word</button></>}</>}
  </div>}
  <nav aria-label="Everything in this chamber" className="rounded-card bg-panel p-3">
   <ul className="grid gap-1.5 sm:grid-cols-2">
    {scene.items.map(i=>{const st=itemState(i.lock-1);return <li key={i.id}><button type="button" onClick={()=>tapItem(i.lock-1,i.label)} className={`flex min-h-11 w-full items-center gap-2 rounded-row px-3 text-left text-[15px] font-bold ${st==="next"?"bg-primary text-on-primary":"bg-panel-2 text-ink"}`}>{st==="open"?<Check size={16} aria-hidden/>:st==="later"?<Lock size={16} aria-hidden className="text-muted"/>:<span aria-hidden className="h-3 w-3 rounded-full border-2 border-current"/>}Lock {i.lock} · {i.label}<span className="sr-only">{st==="open"?", opened":st==="next"?", next":", opens later"}</span></button></li>})}
    {scene.witnesses.filter(w=>p.witnessState(w.character)==="due").map(w=><li key={w.character}><button type="button" onClick={()=>p.onWitness(w.character)} className="flex min-h-11 w-full items-center gap-2 rounded-row bg-primary px-3 text-left text-[15px] font-bold text-on-primary">Ask {p.witnessName(w.character)}</button></li>)}
    {scene.puzzles.filter(z=>p.puzzleState(z.id)==="next").map(z=><li key={z.id}><button type="button" onClick={()=>p.onPuzzle(z.id)} className="flex min-h-11 w-full items-center gap-2 rounded-row bg-primary px-3 text-left text-[15px] font-bold text-on-primary">Open the puzzle lock</button></li>)}
    <li><button type="button" onClick={tapDoor} className={`flex min-h-11 w-full items-center gap-2 rounded-row px-3 text-left text-[15px] font-bold ${p.doorState==="next"?"bg-primary text-on-primary":"bg-panel-2 text-ink"}`}><DoorClosed size={16} aria-hidden/>{scene.door.label}<span className="sr-only">{p.doorState==="next"?", open it":", locked"}</span></button></li>
    {scene.bonus.filter(b=>p.bonusAvailable(b)).map(b=><li key={b.id}><button type="button" onClick={()=>tapBonus(b)} className="flex min-h-11 w-full items-center gap-2 rounded-row bg-panel-2 px-3 text-left text-[15px] font-bold text-ink"><Search size={16} aria-hidden className="text-highlight"/>Look closer: {b.label}{p.bonusFound.includes(b.id)?" (found)":""}</button></li>)}
   </ul>
  </nav>
 </section>;
}
