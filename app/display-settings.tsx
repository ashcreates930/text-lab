"use client";
import {useEffect,useState} from "react";
import {Type,X} from "lucide-react";

// Per-device display preferences: larger text, higher contrast, and less motion. Saved in this browser only.
type Settings={size:"standard"|"large"|"xl";contrast:"standard"|"high";motion:"standard"|"reduced"};
const KEY="itt-display-settings";
const defaults:Settings={size:"standard",contrast:"standard",motion:"standard"};
function apply(s:Settings){const root=document.documentElement;root.dataset.textSize=s.size;root.dataset.contrast=s.contrast;root.dataset.motion=s.motion}

export function DisplaySettings({placement="floating"}:{placement?:"floating"|"header"}){
 const [open,setOpen]=useState(false),[settings,setSettings]=useState<Settings>(defaults);
 useEffect(()=>{let saved=defaults;try{saved={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{}setSettings(saved);apply(saved)},[]);
 function change(next:Partial<Settings>){const s={...settings,...next};setSettings(s);apply(s);try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
 const option=(active:boolean)=>`min-h-12 flex-1 border px-3 py-2 text-sm ${active?"border-[#A0472C] bg-[#A0472C]/20 text-[#8A3B23] font-bold":"border-white/30 text-white/85 hover:border-white/60"}`;
 return <div className={`display-settings print:hidden ${placement==="floating"?"fixed bottom-4 right-4 z-50 flex flex-col items-end":"relative"}`}>
  {open&&<div role="dialog" aria-label="Display settings" className={`w-[min(92vw,340px)] border border-white/25 bg-[#FFFDF8] p-5 shadow-2xl ${placement==="floating"?"mb-3":"absolute right-0 top-full z-50 mt-2"}`}>
   <div className="flex items-center justify-between"><p className="text-lg font-bold">Display settings</p><button onClick={()=>setOpen(false)} aria-label="Close display settings" className="grid h-10 w-10 place-items-center rounded-full border border-white/25"><X size={16}/></button></div>
   <p className="mt-1 text-sm text-white/75">These settings stay on this device.</p>
   <fieldset className="mt-4"><legend className="text-base">Text size</legend><div className="mt-2 flex gap-2">{([["standard","Standard"],["large","Large"],["xl","Largest"]] as const).map(([v,l])=><button key={v} aria-pressed={settings.size===v} onClick={()=>change({size:v})} className={option(settings.size===v)}>{l}</button>)}</div></fieldset>
   <fieldset className="mt-4"><legend className="text-base">Contrast</legend><div className="mt-2 flex gap-2">{([["standard","Standard"],["high","High"]] as const).map(([v,l])=><button key={v} aria-pressed={settings.contrast===v} onClick={()=>change({contrast:v})} className={option(settings.contrast===v)}>{l}</button>)}</div></fieldset>
   <fieldset className="mt-4"><legend className="text-base">Motion</legend><div className="mt-2 flex gap-2">{([["standard","Standard"],["reduced","Less motion"]] as const).map(([v,l])=><button key={v} aria-pressed={settings.motion===v} onClick={()=>change({motion:v})} className={option(settings.motion===v)}>{l}</button>)}</div></fieldset>
   <button onClick={()=>change(defaults)} className="mt-4 text-sm text-white/75 underline underline-offset-4">Reset to standard</button>
  </div>}
  <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-label="Text size and display settings" className={`flex items-center gap-2 rounded-full border border-white/30 bg-[#FFFDF8] text-[#2A2620] hover:border-[#A0472C] ${placement==="floating"?"min-h-12 px-4 py-2 text-sm shadow-lg":"min-h-9 px-3 py-1.5 text-[11px]"}`}><Type size={placement==="floating"?16:13} aria-hidden="true"/> {placement==="floating"?"Text size & display":"Text size"}</button>
 </div>;
}
