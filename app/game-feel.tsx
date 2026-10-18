"use client";
// The game layer around the scene game: character portraits and voices, ambient sound, the consequence moment after a
// choice, and the case board. Rules (fallbacks, sound defaults, which cards appear) live in lib/game-feel.ts.
// Every sound has a visible off switch, and every animation stops under reduced motion (globals.css).
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {ArrowRight,Pin,Volume2,VolumeX,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import {createAmbientController,type AmbientController,type AmbientTrack} from "@/lib/ambient";
import {ambientLevelGain,caseBoardCards,crossfadeLoop,initials,portraitFor,soundKey,soundOn,type BoardCard,type SoundKind} from "@/lib/game-feel";
import {FactCheckerBadge,RankLadder} from "./case-game";
import {StoryboardRow} from "./storyboard";
import type {BoardFrame} from "@/lib/storyboard";
import {playClip,soundChannel,useSoundChannel} from "./sound-player";

type Character={id:string;name:string;portrait?:string};

// A character's portrait, or their initials in a terracotta circle when there is no portrait (or it fails to load).
// speaking adds a soft pulsing ring while their voice plays.
export function Portrait({character,size=40,speaking=false,decorative=true}:{character:Character;size?:number;speaking?:boolean;decorative?:boolean}){
 const [broken,setBroken]=useState(false);
 const p=portraitFor(character);
 const ring=speaking?"voice-ring":"";
 return <span className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${ring}`} style={{width:size,height:size}} aria-hidden={decorative||undefined} role={decorative?undefined:"img"} aria-label={decorative?undefined:character.name}>
  {p.kind==="image"&&!broken?<img src={p.src} alt="" width={size} height={size} onError={()=>setBroken(true)} className="h-full w-full object-cover"/>
  :<span className="grid h-full w-full place-items-center bg-[#A0472C] font-bold text-white" style={{fontSize:Math.round(size*0.38)}}>{initials(character.name)}</span>}
 </span>;
}

// A sound preference (voices or ambient), remembered on this device. Defaults: on for the demo, off for class sessions.
export function useSoundPref(kind:SoundKind,preset:string){
 const key=soundKey(kind,preset);
 const [on,setOn]=useState(()=>soundOn(kind,preset,null));
 useEffect(()=>{let stored:string|null=null;try{stored=localStorage.getItem(key)}catch{}setOn(soundOn(kind,preset,stored))},[key,kind,preset]);
 const toggle=useCallback(()=>setOn(v=>{const next=!v;try{localStorage.setItem(key,next?"on":"off")}catch{}return next}),[key]);
 return [on,toggle] as const;
}

export function SoundToggle({on,onToggle,label}:{on:boolean;onToggle:()=>void;label:string}){
 return <button type="button" onClick={onToggle} aria-pressed={on} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#EFE8D8] px-4 text-[15px] font-semibold text-[#2A2620] hover:bg-[#E4DCCB]">{on?<Volume2 size={17}/>:<VolumeX size={17}/>}{label} {on?"on":"off"}</button>;
}

// Plays character answers in their voice through /api/voice, on the shared player, so a voice stops any narration
// (and narration stops a voice). Any failure (no voice service, daily limit, autoplay blocked) leaves the text answer
// silently: a student never sees an error. Answers are cached so replay is free.
export function useCharacterVoice(worldId:string,sandboxId:string){
 const channel=useSoundChannel();
 const speaking=channel.kind==="voice"?channel.id:"";
 const cache=useRef(new Map<string,string>());
 const stop=useCallback(()=>{if(soundChannel.state.kind==="voice")soundChannel.stop()},[]);
 useEffect(()=>()=>{if(soundChannel.state.kind==="voice")soundChannel.stop();for(const url of cache.current.values())URL.revokeObjectURL(url)},[]);
 const play=useCallback(async(text:string,characterId:string)=>{
  const stopper=new AbortController();
  const handle=soundChannel.begin("voice",characterId,()=>stopper.abort());
  const key=`${characterId}:${text}`;
  try{
   let url=cache.current.get(key);
   if(!url){const r=await fetch("/api/voice",{method:"POST",signal:stopper.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId,text:text.slice(0,1800),worldId,character:characterId})});if(!r.ok||!(r.headers.get("content-type")||"").includes("audio"))return handle.end();url=URL.createObjectURL(await r.blob());cache.current.set(key,url)}
   if(handle.active)await playClip(url,stopper.signal);
  }catch{}
  handle.end();
 },[sandboxId,worldId]);
 return {speaking,play,stop};
}

// The scene's ambient sound. One shared controller (rules in lib/ambient.ts) owns the only ambient track; this engine
// plays it with Web Audio: each track is brought to the same level, its sudden loud moments are softened, and its end
// is blended into its start so the loop has no seam. Any failure is silent.
// Each ambient file is downloaded once per visit; returning to the scene reuses it.
const ambientFiles=new Map<string,Promise<ArrayBuffer>>();
function ambientFile(src:string){let file=ambientFiles.get(src);if(!file){file=fetch(src).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.arrayBuffer()});file.catch(()=>ambientFiles.delete(src));ambientFiles.set(src,file)}return file}
function webAudioTrack(src:string):AmbientTrack{
 let ctx:AudioContext|null=null,gain:GainNode|null=null,stopped=false,target={volume:0,seconds:0};
 const ramp=()=>{if(!ctx||!gain)return;const now=ctx.currentTime,g=gain.gain;g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(target.volume,now+Math.max(.05,target.seconds))};
 (async()=>{
  try{
   ctx=new AudioContext();
   const decoded=await ctx.decodeAudioData((await ambientFile(src)).slice(0));
   if(stopped)return;
   const channels=Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i));
   const looped=crossfadeLoop(channels,decoded.sampleRate);
   const buffer=ctx.createBuffer(looped.length,looped[0].length,decoded.sampleRate);
   looped.forEach((ch,i)=>buffer.getChannelData(i).set(ch));
   const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
   const level=ctx.createGain();level.gain.value=ambientLevelGain(channels,decoded.sampleRate);
   const soften=ctx.createDynamicsCompressor();soften.threshold.value=-24;soften.knee.value=6;soften.ratio.value=12;soften.attack.value=0.003;soften.release.value=0.25;
   gain=ctx.createGain();gain.gain.value=0;
   source.connect(level).connect(soften).connect(gain).connect(ctx.destination);
   await ctx.resume();if(stopped)return;
   source.start();ramp();
  }catch{ctx?.close().catch(()=>{});ctx=null;gain=null}
 })();
 return {src,fade(volume,seconds){target={volume,seconds};ramp()},stop(){stopped=true;ctx?.close().catch(()=>{});ctx=null;gain=null}};
}

let ambient:AmbientController|null=null;
// The one ambient controller, wired once to the things outside the scene screen: the student's first tap (browsers allow
// sound only after one), switching browser tabs, and scene narration (which dips the sound).
export function ambientController(){
 if(ambient)return ambient;
 const c=createAmbientController({start:webAudioTrack});
 ambient=c;
 const activated=(navigator as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation?.hasBeenActive;
 if(activated)c.set({unlocked:true});
 else{const unlock=()=>{window.removeEventListener("pointerdown",unlock);window.removeEventListener("keydown",unlock);c.set({unlocked:true})};window.addEventListener("pointerdown",unlock);window.addEventListener("keydown",unlock)}
 c.set({visible:document.visibilityState!=="hidden"});
 document.addEventListener("visibilitychange",()=>c.set({visible:document.visibilityState!=="hidden"}));
 c.set({narrating:soundChannel.state.kind==="narration"});
 soundChannel.subscribe(state=>c.set({narrating:state.kind==="narration"}));
 return c;
}

// Placed on the scene screen. showing is false while the case board or a choice's consequence covers the screen; when
// the scene screen goes away (a clue or frame opens, the student leaves the case) the sound fades out and stops.
export function AmbientPlayer({src,on,showing}:{src:string|null|undefined;on:boolean;showing:boolean}){
 useEffect(()=>{ambientController().set({src:src??null,on,showing})},[src,on,showing]);
 useEffect(()=>()=>{ambientController().set({showing:false})},[]);
 return null;
}

// The moment after a choice: the next scene's image, dimmed, with what the choice led to, and Continue.
export function ConsequenceMoment({image,text,onContinue}:{image:string;text:string;onContinue:()=>void}){
 const button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{button.current?.focus({preventScroll:true})},[]);
 return <div role="dialog" aria-modal="true" aria-labelledby="consequence-text" className="consequence-in fixed inset-0 z-50 grid place-items-center bg-[#2A2620] bg-cover bg-center p-6" style={{backgroundImage:`url('${image}')`}}>
  <div aria-hidden className="absolute inset-0 bg-[#1B1712]/75"/>
  <div className="case-ui relative max-w-2xl text-center">
   <p className="text-[13px] font-semibold uppercase tracking-[.16em] text-[#F3C9B2]">Your choice</p>
   <p id="consequence-text" className="mt-4 font-serif text-[24px] leading-relaxed text-white md:text-[30px]">{text}</p>
   <button ref={button} type="button" onClick={onContinue} className="case-primary mt-8">Continue <ArrowRight size={18}/></button>
  </div>
 </div>;
}

// The case board: each proven clue is a card pinned to a corkboard, joined by a thin terracotta string in scene order.
export function CaseBoard({world,answers,storyboard=[],top}:{world:WorldPack;answers:Record<string,{notice?:string;interpret?:string;craft?:string;character?:string}>;storyboard?:BoardFrame[];top?:React.ReactNode}){
 const cards=caseBoardCards(world,answers);
 const board=useRef<HTMLDivElement>(null),pins=useRef<(HTMLSpanElement|null)[]>([]);
 const [points,setPoints]=useState<string>("");
 const measure=useCallback(()=>{const b=board.current;if(!b)return;const r=b.getBoundingClientRect();setPoints(pins.current.slice(0,cards.length).filter(Boolean).map(p=>{const q=p!.getBoundingClientRect();return `${(q.left+q.width/2-r.left).toFixed(1)},${(q.top+q.height/2-r.top).toFixed(1)}`}).join(" "))},[cards.length]);
 useLayoutEffect(()=>{measure();const b=board.current;if(!b)return;const ro=new ResizeObserver(measure);ro.observe(b);return()=>ro.disconnect()},[measure]);
 const row=<>{top&&<div className="relative mb-6">{top}</div>}{storyboard.length>0&&<div className="relative mb-6"><p className="mb-2 inline-block rounded-full bg-[#FFFDF8] px-3 py-1 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23] shadow">Your storyboard</p><StoryboardRow frames={storyboard}/></div>}</>;
 if(!cards.length)return <div className="corkboard rounded-3xl p-5 text-center md:p-8">{row}<p className="mx-auto max-w-md rounded-2xl bg-[#FFFDF8] px-5 py-4 text-[17px] font-semibold text-[#2A2620] shadow">Prove a clue to pin it to your case board.</p></div>;
 return <div className="corkboard relative rounded-3xl p-5 md:p-8" data-testid="case-board">
  {row}
  <div ref={board} className="relative">
  <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"><polyline points={points} fill="none" stroke="#A0472C" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" opacity=".85"/></svg>
  <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards.map((c,i)=><BoardCardView key={c.clueId} card={c} index={i} pinRef={el=>{pins.current[i]=el}}/>)}</ol>
  </div>
 </div>;
}

function BoardCardView({card,index,pinRef}:{card:BoardCard;index:number;pinRef:(el:HTMLSpanElement|null)=>void}){
 const tilt=[-1.6,1.2,-0.8,1.6,-1.2,0.8][index%6];
 return <li className="relative rounded-2xl bg-[#FFFDF8] p-4 pt-6 shadow-[0_10px_24px_-12px_rgba(42,38,32,.6)]" style={{transform:`rotate(${tilt}deg)`}}>
  <span ref={pinRef} aria-hidden className="absolute left-1/2 top-1.5 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-[#A0472C] text-white shadow"><Pin size={11}/></span>
  <div className="flex items-start justify-between gap-2"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#8A3B23]">Scene {card.sceneIndex+1} · Exhibit {index+1}</p>{card.factCheck&&<FactCheckerBadge count={1}/>}</div>
  <div className="case-art mt-2 aspect-[16/9] rounded-xl" role="img" aria-label={`Close-up: ${card.name}`} style={{backgroundImage:`url('${card.image}')`,backgroundPosition:`${card.focus.x}% ${card.focus.y}%`,backgroundSize:"300%"}}/>
  <h3 className="mt-3 text-[17px] font-bold leading-snug text-[#2A2620]">{card.name}</h3>
  <blockquote className="mt-2 border-l-4 border-[#A0472C] pl-3 font-serif text-[15px] italic leading-6 text-[#4A4438]">“{card.quote}”</blockquote>
  <p className="mt-2 text-[15px] leading-6 text-[#2A2620]">{card.explanation}</p>
  {card.factCheck&&<p className="mt-2 text-[13px] font-semibold text-[#8A3B23]">This line proved {card.character??"a character"} wrong.</p>}
 </li>;
}

// The board so far, opened from the scene screen. Escape or Close returns to the scene.
export function CaseBoardDialog({world,answers,storyboard,top,onClose}:{world:WorldPack;answers:Record<string,{notice?:string;interpret?:string;craft?:string;character?:string}>;storyboard?:BoardFrame[];top?:React.ReactNode;onClose:()=>void}){
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{const opener=document.activeElement as HTMLElement|null;heading.current?.focus({preventScroll:true});const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",esc);return()=>{window.removeEventListener("keydown",esc);opener?.focus?.({preventScroll:true})}},[onClose]);
 return <div role="dialog" aria-modal="true" aria-labelledby="board-h" className="fixed inset-0 z-50 overflow-y-auto bg-[#2A2620]/55 p-3 md:p-8">
  <div className="case-ui mx-auto max-w-6xl rounded-3xl bg-[#F6F0E3] p-4 shadow-2xl md:p-6">
   <div className="mb-4 flex items-center justify-between gap-3"><h2 id="board-h" ref={heading} tabIndex={-1} className="text-[24px] font-bold outline-none">Your case board</h2><button type="button" onClick={onClose} aria-label="Close the case board" className="grid h-11 w-11 place-items-center rounded-full text-[#6B6457] hover:bg-[#EFE8D8]"><X size={22}/></button></div>
   <div className="mb-4 rounded-2xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your detective rank</p><RankLadder/></div>
   <CaseBoard world={world} answers={answers} storyboard={storyboard} top={top}/>
  </div>
 </div>;
}
