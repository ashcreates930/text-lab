"use client";
// Before the game, one screen: the student's part (the role story) on top and "How do you want to play?" below, as
// large cards. Tapping a card moves on; there is no separate Start. The interest questions come after the case closes
// ("Unlock your challenge", before Your Turn). The teacher can turn the part off for a class; the play question always
// shows. Squads play only in live class, so outside one Squad says so and offers solo.
import {useLayoutEffect,useRef,useState} from "react";
import {focusScreenTop} from "./screen-focus";
import {ArrowRight,Check,Swords,User,Users,Zap} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {ANGLE_OPTIONS,INTEREST_STEPS,PLAY_STEP,UNLOCK,type Angle,type StoryPersonalSettings} from "@/lib/student-role";

// One line under each play mode, and its icon.
const MODE_CARDS:Record<string,{line:string;Icon:typeof User}>={
 solo:{line:"Work the case on your own, at your pace.",Icon:User},
 rival:{line:"Race a computer rival to the right line.",Icon:Swords},
 squad:{line:"Read together with your squad in live class.",Icon:Users},
 race:{line:"Read a chunk, then race the Lantern Ghost to the line that proves it.",Icon:Zap},
};
const reduced=()=>typeof window!=="undefined"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function RoleIntro({world,settings,onDone}:{world:WorldPack;settings:StoryPersonalSettings;onDone:(angle?:Angle)=>void}){
 const role=settings.rolesOn?world.student_role:undefined;
 const [squad,setSquad]=useState(false);
 const [picked,setPicked]=useState<string|null>(null);
 const moved=useRef(false);
 // Each screen opens at the top with focus on its heading.
 useLayoutEffect(()=>{focusScreenTop()},[squad]);
 const q=ANGLE_OPTIONS[PLAY_STEP];
 const done=(value:string)=>onDone({[PLAY_STEP]:value} as Angle);
 // The tapped card presses, gets an outline and a check, then the next screen opens.
 function pick(value:string){
  if(moved.current)return;moved.current=true;setPicked(value);
  window.setTimeout(()=>{if(value==="squad"){moved.current=false;setPicked(null);setSquad(true)}else done(value)},reduced()?80:380);
 }
 if(squad)return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8"><section className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]" aria-labelledby="squad-h">
   <span aria-hidden className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F4E1D6] text-[#A0472C]"><Users size={28}/></span>
   <h1 id="squad-h" className="mt-4 text-[28px] font-bold leading-tight">Squads play in live class</h1>
   <p className="mt-2 text-[17px] leading-7 text-[#4A4438]">When your teacher starts a live round, you'll read with your squad. Today you can play the case solo.</p>
   <button type="button" onClick={()=>done("solo")} className="case-primary mt-6 min-h-[56px] w-full justify-center text-[18px]">Play solo instead <ArrowRight size={18}/></button>
   <button type="button" onClick={()=>setSquad(false)} className="mt-3 min-h-11 w-full text-[15px] font-semibold text-[#6B6457] underline underline-offset-4">Back</button>
  </section></div>;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-16 pt-4 md:px-8">
  {role&&<section className="rounded-3xl bg-[#2A2620] p-5 text-[#FFFDF8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.5)]" aria-labelledby="role-h">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Your part in {world.title}</p>
   <h1 id="role-h" className="mt-1 text-[24px] font-bold leading-tight">{role.name}</h1>
   <p className="mt-2 text-[16px] leading-6 text-[#F6F0E3]">{role.intro}</p>
  </section>}
  <section className={role?"mt-5":"mt-4"} aria-labelledby="play-h">
   {role?<h2 id="play-h" className="text-[24px] font-bold leading-tight">{q.label}</h2>:<h1 id="play-h" className="text-[30px] font-bold leading-tight">{q.label}</h1>}
   <ul className="mt-3 grid gap-2.5">{Object.entries(q.options).map(([value,text])=>{const card=MODE_CARDS[value],on=picked===value;const Icon=card?.Icon??User;
    return <li key={value}><button type="button" onClick={()=>pick(value)} aria-pressed={on}
     className={`relative flex min-h-[84px] w-full items-center gap-4 rounded-3xl border-[3px] bg-[#FFFDF8] px-4 py-3 text-left shadow-[0_4px_16px_-8px_rgba(42,38,32,.4)] transition duration-150 motion-reduce:transition-none ${on?"scale-[.97] border-[#A0472C] shadow-none":"border-transparent hover:border-[#E4DCCB] active:scale-[.97]"}`}>
     <span aria-hidden className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${on?"bg-[#A0472C] text-white":"bg-[#F4E1D6] text-[#A0472C]"}`}><Icon size={26}/></span>
     <span className="min-w-0 flex-1"><span className="block text-[21px] font-bold leading-tight text-[#2A2620]">{text}</span><span className="mt-0.5 block text-[15px] leading-5 text-[#4A4438]">{card?.line}</span></span>
     <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${on?"bg-[#A0472C] text-white":"border-2 border-[#E4DCCB]"}`}>{on&&<Check size={18}/>}</span>
    </button></li>})}</ul>
  </section>
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
