"use client";
// Drag and drop (lib/formats.ts): 3 to 5 pieces placed into slots. Three ways to place a piece, all equal:
// - tap to place (phones): tap a piece, then tap its slot;
// - drag (laptops and tablets with a mouse): drag a piece onto a slot, or back to the tray;
// - keyboard and screen reader: Enter or Space picks a piece up, then on a slot places it; every move is announced.
// Targets are at least 44 px. After locking in, pieces in the right slot snap in teal and wrong ones slide to their right
// place with the sentence that proves it (no motion under reduced motion).
import {useEffect,useRef,useState} from "react";
import {ArrowDownToLine,Check,GripVertical,Undo2} from "lucide-react";
import type {DndKind} from "@/lib/formats";
import {DND_INFO} from "@/lib/formats";

export type DndView={kind:DndKind;slots:{id:string;label:string}[];items:{id:string;text:string}[]};
export type DndReveal={slotOf:Record<string,string|null>;lines:Record<string,string|undefined>};
// Kinds where a slot holds one piece (an order, a case, a map); otherwise a slot holds many (sorting).
const ONE_EACH:DndKind[]=["order_events","build_case","story_map","cause_effect"];

export function DragDrop({view,placed,onChange,disabled=false,reveal}:{view:DndView;placed:Record<string,string|null>;onChange:(p:Record<string,string|null>)=>void;disabled?:boolean;reveal?:DndReveal|null}){
 const [held,setHeld]=useState<string|null>(null),[said,setSaid]=useState("");
 const one=ONE_EACH.includes(view.kind),label=(id:string)=>view.items.find(i=>i.id===id)?.text??"",slotLabel=(id:string|null)=>id?view.slots.find(s=>s.id===id)?.label??"":"the tray";
 const dragId=useRef<string|null>(null),btns=useRef<Record<string,HTMLButtonElement|null>>({}),[focusTo,setFocusTo]=useState<string|null>(null);
 useEffect(()=>{if(disabled)setHeld(null)},[disabled]);
 // Keyboard: after a piece is placed it moves to another list, so focus follows to the next piece in the tray (or the
 // placed piece when the tray is empty) instead of falling back to the page.
 useEffect(()=>{if(focusTo){btns.current[focusTo]?.focus({preventScroll:true});setFocusTo(null)}},[focusTo]);
 function place(item:string,slot:string|null){
  const next={...placed};
  // A slot that holds one piece sends its current piece back to the tray.
  if(slot&&one)for(const [k,v] of Object.entries(next))if(v===slot&&k!==item)next[k]=null;
  next[item]=slot;onChange(next);setHeld(null);
  setFocusTo(view.items.find(i=>i.id!==item&&!next[i.id])?.id??item);
  setSaid(slot?`Placed "${label(item)}" in ${slotLabel(slot)}.`:`"${label(item)}" is back in the tray.`);
 }
 function pick(item:string){if(disabled)return;if(held===item){setHeld(null);setSaid(`Put "${label(item)}" down.`);return}setHeld(item);setSaid(`Picked up "${label(item)}". Now choose a slot.`)}
 const inTray=view.items.filter(i=>!placed[i.id]);
 const shown=(slot:string|null)=>(reveal?view.items.filter(i=>(reveal.slotOf[i.id]??null)===slot):view.items.filter(i=>(placed[i.id]??null)===slot));
 // In the reveal each proof sentence shows once, under the first moved piece it proves (pieces often share a sentence).
 const lineAt:Record<string,boolean>={};
 if(reveal){const seen=new Set<string>();for(const slot of [...view.slots.map(x=>x.id),null])for(const i of shown(slot)){const l=reveal.lines[i.id];if(l&&(placed[i.id]??null)!==(reveal.slotOf[i.id]??null)&&!seen.has(l)){seen.add(l);lineAt[i.id]=true}}}
 const piece=({id,text}:{id:string;text:string})=>{
  const right=reveal?(placed[id]??null)===(reveal.slotOf[id]??null):null,moved=reveal&&!right;
  return <li key={id} className={moved&&!disabledMotion()?"dnd-slide":""}><button ref={el=>{btns.current[id]=el}} type="button" draggable={!disabled} onDragStart={e=>{dragId.current=id;e.dataTransfer.setData("text/plain",id);e.dataTransfer.effectAllowed="move"}} onClick={()=>pick(id)} disabled={disabled&&!reveal} aria-pressed={held===id}
   aria-label={`${text}${reveal?right?". In the right place.":`. Moved to ${slotLabel(reveal.slotOf[id]??null)}.`:held===id?". Picked up.":""}`}
   className={`flex min-h-11 w-full items-center gap-2 rounded-row border-2 px-3 py-2 text-left text-[15px] font-bold leading-snug ${right===true?"border-[color:var(--color-line-right-edge)] bg-line-right text-reading-ink":right===false?"border-dashed border-[color:var(--color-line-wrong-edge)] bg-panel text-ink":held===id?"border-primary bg-primary text-on-primary":"border-edge bg-panel text-ink"} ${disabled?"":"cursor-grab active:cursor-grabbing"}`}>
   {!reveal&&<GripVertical size={16} className="shrink-0 opacity-60" aria-hidden/>}{right===true&&<Check size={16} className="shrink-0" aria-hidden/>}<span className="min-w-0 flex-1">{text}</span></button>
   {moved&&lineAt[id]&&<p className="mt-1 rounded-row bg-reading px-2 py-1 font-serif text-[14px] text-reading-ink">"{reveal.lines[id]}"</p>}</li>};
 const drop=(slot:string|null)=>({onDragOver:(e:React.DragEvent)=>{if(!disabled){e.preventDefault();e.dataTransfer.dropEffect="move"}},onDrop:(e:React.DragEvent)=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain")||dragId.current;if(id&&!disabled)place(id,slot)}});
 return <div className="flex flex-col gap-3">
  <p className="text-[15px] font-bold">{DND_INFO[view.kind].how}{!disabled&&" Tap a piece, then tap its place (or drag it)."}</p>
  <p className="sr-only" role="status" aria-live="polite">{said}</p>
  <div className={`grid gap-2 ${view.slots.length===3?"sm:grid-cols-3":"sm:grid-cols-2"}`}>{view.slots.map(s=>{const here=shown(s.id),full=one&&!reveal&&here.length>0;
   return <section key={s.id} aria-label={s.label} {...drop(s.id)} className={`flex min-h-[88px] flex-col gap-1.5 rounded-card border-2 p-2 ${held&&!full?"border-primary bg-primary/10":"border-edge bg-panel-2"}`}>
    <button type="button" disabled={!held||disabled} onClick={()=>held&&place(held,s.id)} className="flex min-h-11 items-center justify-between gap-2 rounded-row px-2 text-left font-display text-[15px] font-bold disabled:opacity-100">
     <span>{s.label}</span>{held&&!disabled&&<span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[12px] text-on-primary"><ArrowDownToLine size={13} aria-hidden/>Place here</span>}</button>
    <ul className="grid gap-1.5">{here.map(piece)}</ul></section>})}</div>
  {!reveal&&<section aria-label="Pieces to place" {...drop(null)} className="rounded-card border-2 border-dashed border-edge p-2">
   <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-extrabold uppercase tracking-[.08em] text-muted">Pieces ({inTray.length} left)</p>
    {held&&placed[held]&&<button type="button" onClick={()=>place(held,null)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-panel px-3 text-[14px] font-bold"><Undo2 size={14} aria-hidden/>Back to the tray</button>}</div>
   <ul className="mt-1.5 grid gap-1.5">{inTray.map(piece)}</ul>
   {!inTray.length&&<p className="text-[14px] text-muted">Every piece is placed. Tap one to move it, then lock in.</p>}</section>}
  {reveal&&shown(null).length>0&&<section aria-label="Pieces that belong nowhere" className="rounded-card border-2 border-dashed border-edge p-2"><p className="text-[13px] font-extrabold uppercase tracking-[.08em] text-muted">Left out (they belong nowhere)</p><ul className="mt-1.5 grid gap-1.5">{shown(null).map(piece)}</ul></section>}
 </div>;
}
const disabledMotion=()=>typeof window!=="undefined"&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
