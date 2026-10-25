"use client";
// Before the game, two quick screens: the student's part (a second-person card with one Start button), then "How do
// you want to play?" (Solo, Rival or Squad, one tap). The interest questions come after the case closes ("Unlock your
// challenge", before Your Turn). The teacher can turn the part off for a class; the play question always shows.
import {useLayoutEffect,useState} from "react";
import {focusScreenTop} from "./screen-focus";
import {ArrowRight} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {ANGLE_OPTIONS,INTEREST_STEPS,PLAY_STEP,UNLOCK,type Angle,type StoryPersonalSettings} from "@/lib/student-role";
import {SQUAD_SOLO_NOTE} from "./mode-screens";

export function RoleIntro({world,settings,classSession=false,onDone}:{world:WorldPack;settings:StoryPersonalSettings;classSession?:boolean;onDone:(angle?:Angle)=>void}){
 const role=settings.rolesOn?world.student_role:undefined;
 const [step,setStep]=useState<"role"|"play">(role?"role":"play");
 // Each screen opens at the top with focus on its heading.
 useLayoutEffect(()=>{focusScreenTop()},[step]);
 const q=ANGLE_OPTIONS[PLAY_STEP];
 const pick=(value:string)=>onDone({[PLAY_STEP]:value} as Angle);
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-8 md:px-8">
  {step==="role"&&role?<section className="rounded-3xl bg-[#2A2620] p-6 text-[#FFFDF8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.5)] md:p-8" aria-labelledby="role-h">
   <p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Your part in {world.title}</p>
   <h1 id="role-h" className="mt-2 text-[28px] font-bold leading-tight">{role.name}</h1>
   <p className="mt-3 text-[18px] leading-8 text-[#F6F0E3]">{role.intro}</p>
   <button type="button" onClick={()=>setStep("play")} className="case-primary mt-6 min-h-[56px] w-full text-[18px] sm:w-auto">Start <ArrowRight size={18}/></button>
  </section>
  :<section className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]" aria-labelledby="play-h">
   <h1 id="play-h" className="text-[28px] font-bold">{q.label}</h1>
   {/* One tap each; buttons keep their place, so focus stays where the student tapped. */}
   <div className="mt-4 grid gap-2 sm:grid-cols-3">{Object.entries(q.options).map(([value,text])=><button key={value} type="button" onClick={()=>pick(value)} className="min-h-[56px] rounded-2xl bg-[#F4E1D6] px-4 py-3 text-left text-[18px] font-semibold text-[#2A2620] transition hover:bg-[#EDD3C4]">{text}{/* Outside a live round, Squad plays solo today: said on the button, no extra tap. */}{value==="squad"&&classSession&&<span className="mt-1 block text-[14px] font-semibold leading-5 text-[#8A3B23]">{SQUAD_SOLO_NOTE}</span>}</button>)}</div>
  </section>}
 </div>;
}

// After the case closes, before Your Turn: "Unlock your challenge", the two interest questions (one tap each, or Skip).
// Skipping gives the Cold case file. Only these choices are saved; characters never hear them.
export function UnlockChallenge({onDone}:{onDone:(angle:Angle)=>void}){
 const [angle,setAngle]=useState<Angle>({}),[step,setStep]=useState(0);
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const key=INTEREST_STEPS[step],q=ANGLE_OPTIONS[key];
 function pick(value:string){const next={...angle,[key]:value} as Angle;setAngle(next);if(step<INTEREST_STEPS.length-1)setStep(step+1);else onDone(next)}
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-8 md:px-8">
  <section className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]" aria-labelledby="unlock-h">
   <h1 id="unlock-h" className="text-[28px] font-bold">{UNLOCK.title}</h1>
   <p className="mt-1 text-[16px] text-[#4A4438]">{UNLOCK.line}</p>
   <fieldset className="mt-4">
    <legend className="flex w-full items-baseline justify-between gap-3 text-[18px] font-semibold"><span aria-live="polite">{q.label}</span><span className="text-[14px] font-normal tabular-nums text-[#6B6457]">{step+1} of {INTEREST_STEPS.length}</span></legend>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(q.options).map(([value,text],i)=><button key={i} type="button" onClick={()=>pick(value)} className="min-h-[52px] rounded-2xl bg-[#F4E1D6] px-4 py-3 text-left text-[17px] font-semibold text-[#2A2620] transition hover:bg-[#EDD3C4]">{text}</button>)}</div>
   </fieldset>
   <button type="button" onClick={()=>onDone(angle)} className="mt-4 min-h-11 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Skip</button>
  </section>
 </div>;
}
