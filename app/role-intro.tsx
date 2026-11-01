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

// One line under each play mode, its icon and its card color (Proof Race is the big orange card, first).
const MODE_CARDS:Record<string,{line:string;Icon:typeof User;tone:string;wide?:boolean}>={
 race:{line:"Read a chunk, then race the Lantern Ghost to the line that proves it.",Icon:Zap,tone:"bg-primary text-on-primary shadow-[0_8px_0_var(--color-primary-shadow)]",wide:true},
 solo:{line:"Work the case on your own, at your pace.",Icon:User,tone:"bg-success text-on-success shadow-[0_6px_0_var(--color-success-shadow)]"},
 rival:{line:"Race a computer rival to the right line.",Icon:Swords,tone:"bg-violet text-on-violet shadow-[0_6px_0_var(--color-violet-shadow)]"},
 squad:{line:"Read together with your squad in live class.",Icon:Users,tone:"bg-panel text-ink shadow-[0_6px_0_#0B0920]",wide:true},
};
const ORDER=["race","solo","rival","squad"];
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
 if(squad)return <div className="case-ui mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-8"><section className="rounded-3xl bg-panel p-6" aria-labelledby="squad-h">
   <span aria-hidden className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-highlight"><Users size={28}/></span>
   <h1 id="squad-h" className="mt-4 text-[28px] font-bold leading-tight">Squads play in live class</h1>
   <p className="mt-2 text-[17px] leading-7 text-muted">When your teacher starts a live round, you'll read with your squad. Today you can play the case solo.</p>
   <button type="button" onClick={()=>done("solo")} className="case-primary mt-6 min-h-[56px] w-full justify-center text-[18px]">Play solo instead <ArrowRight size={18}/></button>
   <button type="button" onClick={()=>setSquad(false)} className="mt-3 min-h-11 w-full text-[15px] font-semibold text-muted underline underline-offset-4">Back</button>
  </section></div>;
 return <div className="case-ui mx-auto max-w-2xl px-4 pb-16 pt-4 md:px-8">
  {role&&<section className="rounded-3xl bg-deep p-5 text-ink" aria-labelledby="role-h">
   <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Your part in {world.title}</p>
   <h1 id="role-h" className="mt-1 text-[24px] font-bold leading-tight">{role.name}</h1>
   <p className="mt-2 text-[16px] leading-6 text-ink">{role.intro}</p>
  </section>}
  <section className={role?"mt-5":"mt-4"} aria-labelledby="play-h">
   {role?<h2 id="play-h" className="text-[24px] font-bold leading-tight">{q.label}</h2>:<h1 id="play-h" className="text-[30px] font-bold leading-tight">{q.label}</h1>}
   <ul className="mt-3 grid grid-cols-2 gap-3">{Object.entries(q.options).sort(([a],[b])=>(ORDER.indexOf(a)+99)%99-(ORDER.indexOf(b)+99)%99).map(([value,text])=>{const card=MODE_CARDS[value],on=picked===value;const Icon=card?.Icon??User;
    return <li key={value} className={card?.wide?"col-span-2":""}><button type="button" onClick={()=>pick(value)} aria-pressed={on}
     className={`relative flex h-full w-full flex-col items-start gap-2 rounded-card p-4 text-left transition-transform duration-100 active:translate-y-1 motion-reduce:transition-none ${card?.tone??"bg-panel text-ink"} ${on?"outline outline-[3px] outline-offset-2 outline-highlight":""} ${card?.wide&&value==="race"?"min-h-[150px]":"min-h-[140px]"}`}>
     <span className="flex w-full items-start justify-between gap-2"><Icon aria-hidden size={value==="race"?40:30} strokeWidth={2.2}/>{on&&<span className="inline-flex items-center gap-1 rounded-full bg-deep px-2.5 py-1 text-[12px] font-extrabold text-ink"><Check size={14} aria-hidden/>Picked</span>}</span>
     <span className={`block font-display font-bold leading-none ${value==="race"?"text-[32px]":"text-[22px]"}`}>{text}</span><span className="block text-[15px] font-bold leading-snug">{card?.line}</span>
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
  <section className="rounded-3xl bg-panel p-6" aria-labelledby="unlock-h">
   <h1 id="unlock-h" className="text-[28px] font-bold">{UNLOCK.title}</h1>
   <p className="mt-1 text-[16px] text-muted">{UNLOCK.line}</p>
   <fieldset className="mt-4">
    <legend className="flex w-full items-baseline justify-between gap-3 text-[18px] font-semibold"><span aria-live="polite">{q.label}</span><span className="text-[14px] font-normal tabular-nums text-muted">{step+1} of {INTEREST_STEPS.length}</span></legend>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(q.options).map(([value,text],i)=><button key={i} type="button" onClick={()=>pick(value)} className="min-h-[52px] rounded-2xl bg-primary-soft px-4 py-3 text-left text-[17px] font-semibold text-ink transition hover:bg-primary-soft">{text}</button>)}</div>
   </fieldset>
   <button type="button" onClick={()=>onDone(angle)} className="mt-4 min-h-11 text-[15px] text-muted underline-offset-4 hover:underline">Skip</button>
  </section>
 </div>;
}
