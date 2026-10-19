"use client";
// Students in the story: before the first scene, a second-person card names the student's part, then "What's your
// angle?" asks three quick questions (one tap each, or Skip). The angle is saved with their progress only; only these
// three choices reach the AI. Either part can be turned off by the teacher.
import {useLayoutEffect,useState} from "react";
import {focusScreenTop} from "./screen-focus";
import {ArrowRight} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {ANGLE_OPTIONS,ANGLE_STEPS,type Angle,type StoryPersonalSettings} from "@/lib/student-role";

export function RoleIntro({world,settings,onDone}:{world:WorldPack;settings:StoryPersonalSettings;onDone:(angle?:Angle)=>void}){
 const role=settings.rolesOn?world.student_role:undefined;
 const [angle,setAngle]=useState<Angle>({}),[step,setStep]=useState(0);
 const key=ANGLE_STEPS[step],q=ANGLE_OPTIONS[key];
 function pick(value:string){const next={...angle,[key]:value} as Angle;setAngle(next);if(step<ANGLE_STEPS.length-1)setStep(step+1);else onDone(next)}
 // A new screen: open at the top with focus on its heading.
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const skip=()=>onDone(Object.keys(angle).length?angle:undefined);
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-8 md:px-8">
  {role&&<section className="rounded-3xl bg-[#2A2620] p-6 text-[#FFFDF8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.5)] md:p-8" aria-labelledby="role-h">
   <p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Your part in {world.title}</p>
   <h1 id="role-h" className="mt-2 text-[28px] font-bold leading-tight">{role.name}</h1>
   <p className="mt-3 text-[18px] leading-8 text-[#F6F0E3]">{role.intro}</p>
  </section>}
  {settings.anglesOn?<section className="mt-6 rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]" aria-labelledby="angle-h">
   {role?<h2 id="angle-h" className="text-[22px] font-bold">What's your angle?</h2>:<h1 id="angle-h" className="text-[28px] font-bold">What's your angle?</h1>}
   <p className="mt-1 text-[15px] text-[#6B6457]">Three quick taps, so the characters know how to talk to you. Only these three answers are shared.</p>
   <fieldset className="mt-4">
    <legend className="flex w-full items-baseline justify-between gap-3 text-[18px] font-semibold"><span aria-live="polite">{q.label}</span><span className="text-[14px] font-normal tabular-nums text-[#6B6457]">{step+1} of {ANGLE_STEPS.length}</span></legend>
    {/* Buttons keep their place between questions, so focus stays where the student tapped. */}
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(q.options).map(([value,text],i)=><button key={i} type="button" onClick={()=>pick(value)} className="min-h-[52px] rounded-2xl bg-[#F4E1D6] px-4 py-3 text-left text-[17px] font-semibold text-[#2A2620] transition hover:bg-[#EDD3C4]">{text}</button>)}</div>
   </fieldset>
   <button type="button" onClick={skip} className="mt-4 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Skip</button>
  </section>
  :<div className="mt-6 flex justify-end"><button type="button" onClick={()=>onDone()} className="case-primary">Step into the story <ArrowRight size={18}/></button></div>}
 </div>;
}
