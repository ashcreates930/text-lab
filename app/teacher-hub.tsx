"use client";
// The teacher and parent side of the home book. It opens on the sample classroom (two taps from the cover); the live
// page-1 reader, pricing with the waitlist, Our Approach, and teacher sign-in are one tap away. No AI calls here.
import {useState} from "react";
import {ArrowRight,BookOpen,LogIn,School,Sparkles,Tag} from "lucide-react";
import {TeacherDemo} from "./teacher-demo";
import {StudentPreview} from "./home";

type Tab="classroom"|"students";
export function TeacherHub({onSignIn,onPricing,onApproach,onKeepReading}:{onSignIn:()=>void;onPricing:()=>void;onApproach:()=>void;onKeepReading:()=>void}){
 const [tab,setTab]=useState<Tab>("classroom");
 const tabButton=(id:Tab,label:string,icon:React.ReactNode)=><button type="button" role="tab" aria-selected={tab===id} aria-controls="hub-panel" onClick={()=>setTab(id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold ${tab===id?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620] hover:bg-[#E4DCCB]"}`}>{icon}{label}</button>;
 const link=(label:string,icon:React.ReactNode,go:()=>void)=><button type="button" onClick={go} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#E4DCCB] bg-[#FFFDF8] px-4 text-[15px] font-semibold text-[#8A3B23] hover:border-[#A0472C]">{icon}{label} <ArrowRight size={15}/></button>;
 return <div className="case-ui">
  <section className="mx-auto max-w-6xl px-4 pt-6 md:px-8">
   <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">For teachers and parents</p>
   <h1 className="mt-1 text-[30px] font-bold leading-tight md:text-[36px]">See it the way your students will</h1>
   <div className="mt-4 flex flex-wrap gap-2">
    <div role="tablist" aria-label="Look inside" className="flex flex-wrap gap-2">{tabButton("classroom","Sample classroom",<School size={17}/>)}{tabButton("students","See what students see",<BookOpen size={17}/>)}</div>
    {link("Pricing and waitlist",<Tag size={16}/>,onPricing)}{link("Our approach",<Sparkles size={16}/>,onApproach)}{link("Teacher sign-in",<LogIn size={16}/>,onSignIn)}
   </div>
  </section>
  <div id="hub-panel" role="tabpanel">
   {tab==="classroom"?<TeacherDemo onSignIn={onSignIn} embedded/>:<div className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-8"><StudentPreview onKeepReading={onKeepReading}/></div>}
  </div>
 </div>;
}
