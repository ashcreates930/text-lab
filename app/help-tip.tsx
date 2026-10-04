"use client";
import {useId,useState} from "react";
import {CircleHelp} from "lucide-react";

// A plain-language explanation that opens on tap or click, never on hover alone, so it works on tablets
// and for teachers who are new to the app.
export function HelpTip({label,children}:{label:string;children:React.ReactNode}){
 const [open,setOpen]=useState(false),id=useId();
 return <span className="inline">
  <button type="button" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(o=>!o)} className="help-tip-button ml-1 inline-flex items-center gap-1 rounded-full border border-[#4A6741]/50 px-2 py-0.5 align-middle text-xs text-[#3E5A36] hover:bg-[#4A6741]/15"><CircleHelp size={13} aria-hidden="true"/>{label}</button>
  {open&&<span id={id} role="note" className="mt-2 block border-l-2 border-[#4A6741] bg-[#4A6741]/[.08] px-3 py-2 text-sm leading-6 text-[#2A2620]">{children}</span>}
 </span>;
}
