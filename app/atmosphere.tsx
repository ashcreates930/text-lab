"use client";
// Atmosphere (lib/engagement.ts): the lantern a student carries through a room, the fog that thickens when it dims,
// and a quiet night soundscape under the Sound setting. All of it is mood only: nothing here blocks a tap or changes
// a score. Under reduced motion the lantern and fog still change, just without movement.
import {useEffect,useState} from "react";
import {BookOpen,Droplet,Feather,Flame,Glasses,Magnet,Music,Watch,type LucideIcon} from "lucide-react";
import {KIT,LANTERN_MAX,type Chest,type KitId} from "@/lib/engagement";

// ---------- The lantern ----------
// level 1 (dim) to 5 (bright). The flame and its glow grow with the level.
export function LanternPill({level}:{level:number}){
 const t=Math.max(1,Math.min(LANTERN_MAX,level))/LANTERN_MAX;
 return <span role="img" aria-label={`Lantern ${level} of ${LANTERN_MAX}: ${level>=4?"burning bright":level>=3?"steady":"burning low"}`} className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-panel px-2 sm:px-2.5" data-lantern={level}>
  <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden className="lantern-icon overflow-visible">
   <circle cx="11" cy="15" r={4+7*t} fill="var(--color-gold)" opacity={0.12+0.33*t} className="lantern-glow"/>
   <path d="M7 4h8M9 4V2.5h4V4M6 6h10l-1 14H7L6 6Z M6 20h10v2.5H6Z" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinejoin="round"/>
   <path d={`M11 ${17-5*t}c${1.6*t+0.6} ${2*t+0.8} ${1.6*t+0.6} ${3.2+t} 0 ${3.2+t}s-${1.6*t+0.6} ${-1.2-t} 0 ${-3.2-t}`} fill="var(--color-gold)" opacity={0.45+0.55*t}/>
  </svg>
  <span className="font-display text-[15px] font-bold tabular-nums text-ink max-sm:hidden" aria-hidden>{level}</span>
 </span>;
}

// ---------- The fog ----------
// Over the room: clear at a bright lantern, thicker as it dims. Never takes taps (pointer-events: none).
export function LanternFog({level}:{level:number}){
 const thick=Math.max(0,(LANTERN_MAX-Math.max(1,Math.min(LANTERN_MAX,level)))/(LANTERN_MAX-1));
 return <div aria-hidden className="lantern-fog pointer-events-none fixed inset-0 z-10" style={{opacity:0.08+0.42*thick}} data-fog={thick.toFixed(2)}/>;
}

// ---------- Night sounds ----------
// Wind (soft filtered noise), crickets (short high chirps) and, now and then, a distant bell, all made in the browser
// and kept very quiet. One shared player: screens that come and go don't restart it.
type Amb={ctx:AudioContext;master:GainNode;timers:number[]};
let amb:Amb|null=null,wanted=false,stopTimer=0;
function startAmbience(){
 if(amb||typeof window==="undefined")return;
 const AC=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
 try{
  const ctx=new AC(),master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);master.gain.linearRampToValueAtTime(1,ctx.currentTime+2);
  // Wind: looping noise through a low-pass filter whose cutoff drifts slowly.
  const len=ctx.sampleRate*4,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let last=0;
  for(let i=0;i<len;i++){last=(last+0.02*(Math.random()*2-1))/1.02;d[i]=last*3.5}
  const noise=ctx.createBufferSource();noise.buffer=buf;noise.loop=true;
  const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=420;
  const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=0.07;lfoGain.gain.value=180;lfo.connect(lfoGain).connect(lp.frequency);
  const windGain=ctx.createGain();windGain.gain.value=0.05;noise.connect(lp).connect(windGain).connect(master);noise.start();lfo.start();
  const timers:number[]=[];
  // Crickets: a burst of quick chirps every few seconds.
  const chirp=()=>{const t0=ctx.currentTime+0.05;for(let k=0;k<3+Math.floor(Math.random()*3);k++){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=4300+Math.random()*300;g.gain.setValueAtTime(0,t0+k*0.07);g.gain.linearRampToValueAtTime(0.012,t0+k*0.07+0.01);g.gain.linearRampToValueAtTime(0,t0+k*0.07+0.045);o.connect(g).connect(master);o.start(t0+k*0.07);o.stop(t0+k*0.07+0.06)}};
  timers.push(window.setInterval(chirp,2600));
  // A distant bell: a few soft partials that fade, every minute or so.
  const bell=()=>{const t0=ctx.currentTime+0.05;for(const [f,v] of [[196,0.03],[392,0.014],[588,0.008],[784,0.005]] as const){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+5);o.connect(g).connect(master);o.start(t0);o.stop(t0+5.2)}};
  timers.push(window.setTimeout(bell,9000),window.setInterval(bell,62000));
  amb={ctx,master,timers};
 }catch{amb=null}
}
function stopAmbience(){
 const a=amb;amb=null;if(!a)return;
 for(const t of a.timers){clearInterval(t);clearTimeout(t)}
 try{a.master.gain.linearRampToValueAtTime(0,a.ctx.currentTime+0.6);setTimeout(()=>{void a.ctx.close().catch(()=>{})},800)}catch{}
}
// Browsers start sound only after a tap: the first tap on the page wakes it if it's wanted.
function wake(){if(wanted&&!amb)startAmbience();else if(amb&&amb.ctx.state==="suspended")void amb.ctx.resume().catch(()=>{})}
export function Ambience({on}:{on:boolean}){
 useEffect(()=>{
  wanted=on;clearTimeout(stopTimer);
  if(on){startAmbience();window.addEventListener("pointerdown",wake)}else stopAmbience();
  return()=>{window.removeEventListener("pointerdown",wake);wanted=false;stopTimer=window.setTimeout(()=>{if(!wanted)stopAmbience()},400)};
 },[on]);
 return null;
}

// ---------- The chest (after a first-try proof only) ----------
// A closed chest the student taps open: bonus coins, or a piece for their kit. Nothing appears after a miss.
export const KIT_ICON:Record<KitId,LucideIcon>={candle:Flame,horseshoe:Magnet,whistle:Music,almanac:BookOpen,watch:Watch,spectacles:Glasses,inkpot:Droplet,feather:Feather};
const kitKey=(worldId:string)=>`textlab:kit:${worldId}`;
export function kitOwned(worldId:string):KitId[]{try{const v=JSON.parse(localStorage.getItem(kitKey(worldId))??"[]");return Array.isArray(v)?v.filter((x:unknown):x is KitId=>KIT.some(k=>k.id===x)):[]}catch{return []}}
export function addKit(worldId:string,id:KitId){try{const v=kitOwned(worldId);if(!v.includes(id))localStorage.setItem(kitKey(worldId),JSON.stringify([...v,id]))}catch{}}
export function ChestCard({chest,opened,onOpen}:{chest:Chest;opened:boolean;onOpen:()=>void}){
 const piece=chest.piece?KIT.find(k=>k.id===chest.piece):null,Icon=chest.piece?KIT_ICON[chest.piece]:null;
 if(!opened)return <button type="button" onClick={onOpen} className="chest-closed flex w-full items-center gap-3 rounded-card border-2 border-gold bg-panel p-3 text-left">
  <ChestArt open={false}/><span><span className="block font-display text-[19px] font-bold text-ink">A chest!</span><span className="block text-[14px] font-bold text-muted">Your proof found it. Tap to open.</span></span></button>;
 return <div role="status" className="chest-open flex w-full items-center gap-3 rounded-card border-2 border-gold bg-gold-soft p-3">
  <ChestArt open/>{piece&&Icon?<span className="flex items-center gap-2"><span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-deep text-gold"><Icon size={20}/></span><span><span className="block font-display text-[18px] font-bold text-ink">{piece.name}</span><span className="block text-[14px] font-bold text-muted">A new piece for your kit. See it on the map.</span></span></span>
   :<span><span className="block font-display text-[19px] font-bold text-ink">+{chest.coins} coins</span><span className="block text-[14px] font-bold text-muted">Bonus coins from the chest.</span></span>}
 </div>;
}
function ChestArt({open}:{open:boolean}){
 return <svg width="44" height="38" viewBox="0 0 44 38" aria-hidden className="shrink-0 overflow-visible">
  <rect x="5" y="17" width="34" height="18" rx="3" fill="none" stroke="var(--color-gold)" strokeWidth="2"/>
  <path d="M5 23h34" stroke="var(--color-gold)" strokeWidth="2"/>
  <g className={open?"chest-lid-open":""} style={{transformOrigin:"6px 17px"}}><path d="M5 17v-4a9 9 0 0 1 9-9h16a9 9 0 0 1 9 9v4Z" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinejoin="round"/></g>
  <rect x="19" y="20" width="6" height="7" rx="1.5" fill="var(--color-gold)"/>
 </svg>;
}

// The kit, on the map: every piece a student's proofs have turned up in chests.
export function KitShelf({worldId}:{worldId:string}){
 const [owned]=useState(()=>typeof window==="undefined"?[]:kitOwned(worldId));
 return <section aria-labelledby="kit-h" className="rounded-card bg-panel p-3">
  <h3 id="kit-h" className="font-display text-[17px] font-bold">Your kit <span className="text-[14px] font-bold text-muted">· {owned.length} of {KIT.length} pieces</span></h3>
  <p className="text-[13px] font-bold text-muted">Chests turn up only after a first-try proof.</p>
  <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">{KIT.map(k=>{const Icon=KIT_ICON[k.id],has=owned.includes(k.id);return <li key={k.id} className={`flex flex-col items-center gap-1 rounded-row p-1.5 text-center ${has?"bg-gold-soft":"bg-panel-2"}`}>
   <span aria-hidden className={`grid h-9 w-9 place-items-center rounded-full ${has?"bg-deep text-gold":"bg-deep text-faint"}`}><Icon size={18}/></span>
   <span className={`text-[11px] font-bold leading-tight ${has?"text-ink":"text-muted"}`}>{has?k.name:"Not found yet"}</span></li>})}</ul>
 </section>;
}
