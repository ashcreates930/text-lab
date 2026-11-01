"use client";
// Hologram mode: the character four times around a central square on a black screen, for a clear pyramid set
// point-down on a phone. The controls hide after 3 seconds; one tap brings them back. Play counts down 3 seconds (time
// to set the pyramid down), then the line plays in the character's voice while a glow follows the voice level
// (steady with reduced motion). The screen is kept awake while this is open.
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {FlipHorizontal2,Play,Square,X} from "lucide-react";
import {HOLOGRAM_DEFAULTS,copyTransform,hologramLayout,voiceLevel} from "@/lib/hologram";
import {CharacterStage,type CharacterModel} from "./character-stage";

// model: a 3D witness renders once off screen and each frame is copied into the four views; without WebGL, enough
// memory or a quick load, the flat hologram picture shows instead.
export type HologramCharacter={id:string;name:string;portrait?:string;hologram?:string;model?:CharacterModel|null};
const PREFS="textlab-hologram";
// An element can be wired into Web Audio only once, so remember each one's source node.
const sources=new WeakMap<HTMLMediaElement,MediaElementAudioSourceNode>();
// A silent sound, played on a tap to unlock audio on phones (the Witness stand plays later, on the host's cue).
export const SILENT_WAV="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
const readPrefs=()=>{try{const v=JSON.parse(localStorage.getItem(PREFS)??"null");if(v&&typeof v==="object")return {...HOLOGRAM_DEFAULTS,...v} as typeof HOLOGRAM_DEFAULTS}catch{}return HOLOGRAM_DEFAULTS};

// playKey: when it changes to a new value, play the line (the live Witness stand uses this). unlocked: an audio element
// and context already unlocked by a tap, for plays that don't come from a tap here. audioSrc: a pre-recorded line
// (the Interview), played instead of asking for the voice.
export function HologramView({character,worldId,line,sandboxId,onClose,playKey,title,unlocked,audioSrc}:{character:HologramCharacter;worldId:string;line:string;sandboxId:string;onClose?:()=>void;playKey?:string|null;title?:string;unlocked?:{audio:HTMLAudioElement;context:AudioContext|null};audioSrc?:string}){
 const [prefs,setPrefs]=useState(HOLOGRAM_DEFAULTS),[box,setBox]=useState({width:0,height:0});
 const [ui,setUi]=useState(true),[count,setCount]=useState(0),[playing,setPlaying]=useState(false),[notice,setNotice]=useState("");
 const [src,setSrc]=useState(character.hologram??`/worlds/${worldId}/holograms/${character.id}.png`);
 const stage=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),hideTimer=useRef(0),audio=useRef<HTMLAudioElement|null>(null);
 const ctx=useRef<AudioContext|null>(null),frame=useRef(0),reduced=useRef(false);
 useEffect(()=>{setPrefs(readPrefs());reduced.current=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false},[]);
 useEffect(()=>{setSrc(character.hologram??`/worlds/${worldId}/holograms/${character.id}.png`)},[character.hologram,character.id,worldId]);
 const save=(next:Partial<typeof HOLOGRAM_DEFAULTS>)=>setPrefs(p=>{const v={...p,...next};try{localStorage.setItem(PREFS,JSON.stringify(v))}catch{}return v});
 // A new screen: start at the top with focus on the heading.
 useLayoutEffect(()=>{window.scrollTo(0,0);heading.current?.focus({preventScroll:true})},[]);
 // The four copies fill the screen; recompute on resize and rotation.
 useEffect(()=>{const el=stage.current;if(!el)return;const ro=new ResizeObserver(()=>setBox({width:el.clientWidth,height:el.clientHeight}));ro.observe(el);return()=>ro.disconnect()},[]);
 // Keep the screen awake while the hologram is open (and again after the tab comes back).
 useEffect(()=>{let lock:{release:()=>Promise<void>}|null=null;const nav=navigator as Navigator&{wakeLock?:{request:(t:"screen")=>Promise<{release:()=>Promise<void>}>}};
  const get=()=>{if(document.visibilityState==="visible")nav.wakeLock?.request("screen").then(l=>{lock=l}).catch(()=>{})};get();document.addEventListener("visibilitychange",get);
  return()=>{document.removeEventListener("visibilitychange",get);lock?.release().catch(()=>{})}},[]);
 // The controls hide 3 seconds after the last touch; any touch or key brings them back.
 const wake=useCallback(()=>{setUi(true);window.clearTimeout(hideTimer.current);hideTimer.current=window.setTimeout(()=>setUi(false),3000)},[]);
 useEffect(()=>{wake();return()=>window.clearTimeout(hideTimer.current)},[wake]);
 const glow=(level:number)=>stage.current?.style.setProperty("--glow",String(level));
 const stop=useCallback(()=>{audio.current?.pause();audio.current=null;cancelAnimationFrame(frame.current);setPlaying(false);setCount(0);glow(0.35)},[]);
 useEffect(()=>()=>{stop();if(!unlocked)ctx.current?.close().catch(()=>{})},[stop,unlocked]);
 useEffect(()=>{glow(0.35)},[]);
 const start=useCallback(async()=>{
  if(!line){setNotice("There's nothing for them to say yet.");return}
  stop();setNotice("");
  // Audio has to be unlocked by a tap; create the context now, while we still have it.
  if(!ctx.current){if(unlocked?.context)ctx.current=unlocked.context;else try{ctx.current=new AudioContext()}catch{}}
  ctx.current?.resume().catch(()=>{});
  for(let n=3;n>0;n--){setCount(n);await new Promise(r=>setTimeout(r,1000))}
  setCount(0);
  try{
   const r=audioSrc?await fetch(audioSrc):await fetch("/api/voice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId,text:line.slice(0,1800),worldId,character:character.id})});
   if(!r.ok){setNotice("The voice isn't available right now.");return}
   const a=unlocked?.audio??new Audio();a.src=URL.createObjectURL(await r.blob());audio.current=a;a.onended=stop;
   const c=ctx.current;
   let node=c?sources.get(a):undefined;
   if(c&&!node){try{node=c.createMediaElementSource(a);sources.set(a,node)}catch{}}
   node?.disconnect();
   if(c&&node&&!reduced.current){
    const analyser=c.createAnalyser();analyser.fftSize=1024;node.connect(analyser);analyser.connect(c.destination);
    const data=new Uint8Array(analyser.fftSize);
    const tick=()=>{analyser.getByteTimeDomainData(data);glow(0.25+voiceLevel(data)*0.75);frame.current=requestAnimationFrame(tick)};tick();
   }else{if(c&&node)node.connect(c.destination);glow(0.8)}
   setPlaying(true);await a.play();
  }catch{setNotice("The voice isn't available right now.");stop()}
 },[line,sandboxId,worldId,character.id,stop,audioSrc]);// eslint-disable-line react-hooks/exhaustive-deps
 // The Witness stand plays when the host says so.
 const lastKey=useRef(playKey);
 useEffect(()=>{if(playKey&&playKey!==lastKey.current){lastKey.current=playKey;start()}},[playKey,start]);
 const copies=hologramLayout({...box,...prefs});
 const [solid,setSolid]=useState<HTMLCanvasElement|null>(null),views=useRef<(HTMLCanvasElement|null)[]>([]);
 // Copy the 3D frame into the four views.
 useEffect(()=>{if(!solid)return;let raf=0;const draw=()=>{for(const v of views.current){const g=v?.getContext("2d");if(!v||!g)continue;if(v.width!==solid.width){v.width=solid.width;v.height=solid.height}g.clearRect(0,0,v.width,v.height);g.drawImage(solid,0,0)}raf=requestAnimationFrame(draw)};draw();return()=>cancelAnimationFrame(raf)},[solid]);
 return <div role="dialog" aria-modal="true" aria-labelledby="holo-h" className="dark-zone fixed inset-0 z-[100] select-none bg-black text-white" onPointerDown={wake} onKeyDown={e=>{wake();if(e.key==="Escape"&&onClose)onClose()}}>
  <div ref={stage} className="absolute inset-0 overflow-hidden" style={{["--glow" as string]:"0.35"}} aria-hidden>
   {character.model&&<CharacterStage model={character.model} portrait={null} name={character.name} clip={playing?"talking":"idle"} height={512} className="pointer-events-none !fixed -left-[2000px] top-0 w-[512px]" onCanvas={setSolid}/>}
   {solid?copies.map((c,k)=><canvas key={c.side} ref={el=>{views.current[k]=el}} className="pointer-events-none absolute max-w-none" style={{left:c.x,top:c.y,width:c.size,height:c.size,transform:copyTransform(c),clipPath:c.clip,filter:"brightness(1.15) drop-shadow(0 0 calc(4px + var(--glow) * 22px) rgba(140,235,255,calc(0.25 + var(--glow) * 0.6)))"}}/>)
   :copies.map(c=><img key={c.side} src={src} alt="" draggable={false} onError={()=>{if(character.portrait&&src!==character.portrait)setSrc(character.portrait)}}
    className="pointer-events-none absolute max-w-none object-contain" style={{left:c.x,top:c.y,width:c.size,height:c.size,transform:copyTransform(c),clipPath:c.clip,filter:"brightness(1.15) drop-shadow(0 0 calc(4px + var(--glow) * 22px) rgba(140,235,255,calc(0.25 + var(--glow) * 0.6)))"}}/>)}
   <div className="absolute rounded-sm" style={{left:box.width/2,top:box.height/2,width:Math.min(box.width,box.height)*prefs.gap,height:Math.min(box.width,box.height)*prefs.gap,transform:"translate(-50%,-50%)",boxShadow:"inset 0 0 0 1px rgba(255,255,255,.08)"}}/>
  </div>
  {count>0&&<p className="pointer-events-none absolute inset-0 grid place-items-center text-[min(30vw,180px)] font-bold tabular-nums text-white/90" aria-live="assertive">{count}</p>}
  <div className={`absolute inset-x-0 top-0 transition-opacity duration-300 motion-reduce:transition-none ${ui?"opacity-100":"pointer-events-none opacity-0"}`}>
   <div className="mx-auto flex max-w-xl flex-col gap-3 bg-gradient-to-b from-black via-black/85 to-transparent px-4 pb-8 pt-4">
    <div className="flex items-start justify-between gap-3">
     <div><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8CEBFF]">{title??"Hologram"}</p><h1 id="holo-h" ref={heading} tabIndex={-1} className="text-[22px] font-bold outline-none">{character.name}</h1></div>
     {onClose&&<button type="button" onClick={onClose} aria-label="Close the hologram" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X size={22}/></button>}
    </div>
    <p className="text-[14px] text-white/75">Turn brightness all the way up and dim the room.</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
     <label className="text-[14px]">Size<input type="range" min={20} max={100} value={Math.round(prefs.size*100)} onChange={e=>save({size:Number(e.target.value)/100})} className="mt-1 block w-full accent-[#8CEBFF]"/></label>
     <label className="text-[14px]">Center gap<input type="range" min={0} max={45} value={Math.round(prefs.gap*100)} onChange={e=>save({gap:Number(e.target.value)/100})} className="mt-1 block w-full accent-[#8CEBFF]"/></label>
    </div>
    <div className="flex flex-wrap gap-2">
     <button type="button" onClick={()=>playing||count?stop():start()} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#8CEBFF] px-5 text-[17px] font-bold text-black">{playing||count?<><Square size={18}/>Stop</>:<><Play size={18}/>Play in 3 seconds</>}</button>
     <button type="button" onClick={()=>save({mirror:!prefs.mirror})} aria-pressed={prefs.mirror} className={`flex min-h-12 items-center gap-2 rounded-full px-4 text-[16px] font-semibold ${prefs.mirror?"bg-white text-black":"bg-white/10"}`}><FlipHorizontal2 size={18}/>Mirror</button>
    </div>
    {notice&&<p role="alert" className="text-[15px] text-[#FFD2C2]">{notice}</p>}
   </div>
  </div>
 </div>;
}
