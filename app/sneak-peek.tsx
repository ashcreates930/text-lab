"use client";
// The home page's sneak peek: Proof Race in a phone frame, built from the real game components (app/game-ui.tsx). It
// plays itself on a loop: a line is tapped, "Proof! +940" pops, your leaderboard row climbs to #2, repeat. Under reduced
// motion it shows one still frame of the Proof! moment.
import {useEffect,useState} from "react";
import {Flame,Star} from "lucide-react";
import {LineRow,Pill} from "./game-ui";

const LINES=["The dominant spirit, however, that haunts this enchanted region… is the apparition of a figure on horseback, without a head.","It is said by some to be the ghost of a Hessian trooper, whose head had been carried away by a cannon-ball…","His haunts are not confined to the valley, but extend at times to the adjacent roads…"];
// read, tap, proof, board (milliseconds on each)
const BEATS=[1800,1100,2200,2600] as const;

function useReduced(){
 const [r,setR]=useState(false);
 useEffect(()=>{const m=window.matchMedia("(prefers-reduced-motion: reduce)");const on=()=>setR(m.matches||document.documentElement.dataset.motion==="reduced");on();m.addEventListener("change",on);return()=>m.removeEventListener("change",on)},[]);
 return r;
}

export function SneakPeek(){
 const reduced=useReduced();
 const [beat,setBeat]=useState(0);
 useEffect(()=>{if(reduced){setBeat(2);return}const t=setTimeout(()=>setBeat(b=>(b+1)%4),BEATS[beat]);return()=>clearTimeout(t)},[beat,reduced]);
 // On the leaderboard, your row starts at #3 and climbs a moment later.
 const [up,setUp]=useState(false);
 useEffect(()=>{if(beat!==3){setUp(false);return}const t=setTimeout(()=>setUp(true),350);return()=>clearTimeout(t)},[beat]);
 const picked=beat>=1,score=beat>=2?"3,080":"2,140",climbed=up;
 return <figure className="mx-auto h-[290px] w-[280px] md:h-auto" aria-label="A sneak peek of Proof Race: a student taps the line that proves it, earns Proof! plus 940 points and climbs to second place.">
  <div aria-hidden inert className="relative h-[470px] origin-top scale-[.6] md:scale-100 overflow-hidden rounded-[40px] border-[10px] border-deep bg-stage shadow-[0_10px_0_#0B0920]">
   <div className="flex flex-col gap-2.5 p-3">
    <div className="flex items-center gap-1.5 text-[13px]"><Pill icon={<Star size={14} className="fill-highlight text-highlight"/>}>{score}</Pill><Pill tone="highlight" icon={<Flame size={14} className="fill-primary text-primary"/>}>x3</Pill><span className="flex-1"/><span className="font-display text-[14px] font-bold">14s</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-panel"><div className={`h-2 rounded-full bg-primary ${reduced?"":"transition-[width] duration-[6000ms] ease-linear"}`} style={{width:beat===0?"92%":beat===1?"70%":"55%"}}/></div>
    <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-highlight">Proof Race · Chunk 6 of 10</p>
    <p className="font-display text-[17px] font-bold leading-tight">How was the rider wounded long ago?</p>
    <div className="reading-scope reading-card flex flex-col gap-1.5 p-2 text-[11.5px]">{LINES.map((l,i)=><LineRow key={i} picked={picked&&i===1} className="!min-h-0 !px-2 !py-1.5 !text-[11.5px]">{l}</LineRow>)}</div>
   </div>
   {/* The Proof! moment */}
   {beat===2&&<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-deep/90 p-4">
    <p className={`font-display text-[44px] font-bold leading-none text-gold ${reduced?"":"float-up"}`}>+940</p>
    <div className={`w-full rounded-[20px] bg-success p-4 text-on-success shadow-[0_6px_0_var(--color-success-shadow)] ${reduced?"":"moment-pop"}`}><p className="text-[10px] font-extrabold uppercase tracking-[.08em]">First try · Streak x4</p><p className="font-display text-[32px] font-bold leading-none">Proof!</p><p className="mt-1.5 text-[12px] font-extrabold">You beat the Lantern Ghost to the line.</p></div>
   </div>}
   {/* The leaderboard: your row climbs from #3 to #2 */}
   {beat===3&&<div className="absolute inset-0 flex flex-col gap-2 bg-stage p-3 pt-6">
    <p className="text-center font-display text-[22px] font-bold">Leaderboard</p>
    <div className="relative h-[180px]">
     {[["Sleuth Thistle","3,210","bg-violet text-on-violet"],["Constable Wren","2,960","bg-success text-on-success"],["Agent Fox (you)","3,080","me"]].map(([n,p,tone],i)=>{const me=tone==="me";const slot=me?(climbed?1:2):i===1?(climbed?2:1):0;
      return <div key={n} className={`absolute inset-x-0 flex h-[52px] items-center gap-2 rounded-button px-2.5 ${me?"bg-primary text-on-primary shadow-[0_4px_0_var(--color-primary-shadow)]":"bg-panel text-ink"}`} style={{top:slot*60,transition:"top .7s cubic-bezier(.2,.9,.3,1.2)"}}>
       <span className="w-5 text-center font-display text-[16px] font-bold">{slot+1}</span><span className={`grid h-8 w-8 place-items-center rounded-row font-display text-[15px] font-bold ${me?"bg-reading text-reading-ink":tone}`}>{n.slice(0,1)}</span>
       <span className="flex min-w-0 flex-1 flex-col"><span className="truncate font-display text-[13px] font-semibold">{n}</span>{me&&<span className="text-[10px] font-extrabold">Up 1</span>}</span><span className="font-display text-[14px] font-bold">{p}</span></div>})}
    </div>
   </div>}
  </div>
 </figure>;
}
