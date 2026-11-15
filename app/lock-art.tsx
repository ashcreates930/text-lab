"use client";
// The one padlock and the one door, used everywhere a lock or door shows: the lock screens, the puzzle locks, the map,
// the room scenes, the doors, the live board and phones, and the home page's escape moment. Line icons in the home
// page's style (1.75 stroke, round caps). The padlock's shackle springs open when `open` turns true; a quiet opening
// (after a miss, opened with the shown proof) and reduced motion swap straight to open with no movement.
import {useEffect,useState} from "react";
import {reducedMotion} from "./proof-race";

type SvgPos={x?:number;y?:number;width?:number;height?:number};

// The padlock alone. Inside another SVG (the map) pass x/y/width/height; elsewhere pass size.
export function Padlock({open=false,quiet=false,size=24,strokeWidth=1.75,className="",color,...pos}:{open?:boolean;quiet?:boolean;size?:number;strokeWidth?:number;className?:string;color?:string}&SvgPos){
 return <svg {...pos} width={pos.width??size} height={pos.height??size} viewBox="0 0 24 24" fill="none" stroke={color??"currentColor"} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" overflow="visible" aria-hidden
  className={`padlock ${quiet?"padlock-quiet":""} ${className}`} data-open={open?"true":"false"}>
  <path className="padlock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"/>
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M12 15.5v2.5"/>
 </svg>;
}

// A door with a small padlock on it: the inner and exit doors in banners, lists, the map and the scene list.
export function DoorGlyph({open=false,size=24,strokeWidth=1.75,className="",color,...pos}:{open?:boolean;size?:number;strokeWidth?:number;className?:string;color?:string}&SvgPos){
 return <svg {...pos} width={pos.width??size} height={pos.height??size} viewBox="0 0 24 24" fill="none" stroke={color??"currentColor"} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" overflow="visible" aria-hidden className={`door-glyph ${className}`}>
  <path d="M2 21h20"/>
  {open?<><path d="M13 3h3a2 2 0 0 1 2 2v16"/><path d="M13 3.6v17.2l-7-1.5V5.2l7-1.6Z"/></>:<path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/>}
  <g transform={open?"translate(14.4 9.6) scale(.36)":"translate(7.7 8.6) scale(.36)"}><path d={open?"M7 11V7a5 5 0 0 1 9.9-1":"M7 11V7a5 5 0 0 1 10 0v4"}/><rect x="3" y="11" width="18" height="11" rx="2"/></g>
 </svg>;
}

// The big round padlock at the top of a lock, and in the opening moment. tone: closed (muted), proved (success, the
// shackle springs), quiet (opened with the shown proof: open, muted, no movement).
export function LockBadge({state,size="md",className=""}:{state:"closed"|"proved"|"quiet";size?:"sm"|"md"|"lg";className?:string}){
 const box=size==="lg"?"h-24 w-24":size==="md"?"h-14 w-14":"h-11 w-11",icon=size==="lg"?48:size==="md"?28:22;
 return <span aria-hidden className={`lock-badge grid ${box} shrink-0 place-items-center rounded-full border-2 ${state==="proved"?"lock-proved border-success text-success":state==="quiet"?"border-edge text-muted":"border-edge text-muted"} ${className}`} data-state={state}>
  <Padlock open={state!=="closed"} quiet={state==="quiet"} size={icon}/>
 </span>;
}

// Opens on mount: closed for a beat, then open (springing when proved). Reduced motion: open at once, no movement.
function useOpenSoon(delay=220){
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(reducedMotion()){setOpen(true);return}const t=setTimeout(()=>setOpen(true),delay);return()=>clearTimeout(t)},[delay]);
 return open;
}

// A soft click (two light ticks), made in the browser, only when sound is on.
export function lockClick(on:boolean){
 if(!on||typeof window==="undefined")return;
 try{const AC=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;const ctx=new AC(),t0=ctx.currentTime+0.02;
  for(const [at,f,v] of [[0,1900,0.18],[0.07,1300,0.12]] as const){const len=Math.floor(ctx.sampleRate*0.03),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
   for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,6);
   const src=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=buf;bp.type="bandpass";bp.frequency.value=f;bp.Q.value=4;g.gain.value=v;
   src.connect(bp).connect(g).connect(ctx.destination);src.start(t0+at)}
  setTimeout(()=>{void ctx.close().catch(()=>{})},600)}catch{}
}

export const PROVED_WORDS="Proved. The lock opens.";
export const QUIET_WORDS="Opened with the proof. Try it again in the Refresher.";

// The opening moment. proved: the shackle springs open with "Proved. The lock opens." and a soft click; quiet: the lock
// is simply open, with the quiet words and no celebration. headingId makes the words the screen's heading.
export function LockMoment({kind,sound=false,words,headingId,size="lg",className=""}:{kind:"proved"|"quiet";sound?:boolean;words?:string;headingId?:string;size?:"md"|"lg";className?:string}){
 const open=useOpenSoon();
 useEffect(()=>{if(open&&kind==="proved")lockClick(sound)},[open]);// eslint-disable-line react-hooks/exhaustive-deps
 const text=words??(kind==="proved"?PROVED_WORDS:QUIET_WORDS);
 const H=headingId?"h1":"p";
 return <div role="status" className={`flex flex-col items-center gap-2 text-center ${className}`}>
  <LockBadge state={kind==="quiet"?"quiet":open?"proved":"closed"} size={size}/>
  <H id={headingId} tabIndex={headingId?-1:undefined} className={`font-display font-bold leading-tight outline-none ${size==="lg"?"text-[26px] md:text-[30px]":"text-[20px]"} ${kind==="proved"?"text-success":"text-ink"}`}>{text}</H>
 </div>;
}

// The proved moment holds about a second before the rest of the screen continues.
export function useHeld(ms=1000){
 const [done,setDone]=useState(false);
 useEffect(()=>{const t=setTimeout(()=>setDone(true),ms);return()=>clearTimeout(t)},[ms]);
 return done;
}

// A door, as on the home page: the next place shows behind it in gold; a padlock hangs on the leaf. When `open` is set
// the padlock opens first, then the leaf swings. Reduced motion: the padlock is open and the door already open.
export function DoorScene({open,behind,label,className=""}:{open:boolean;behind:string;label?:string;className?:string}){
 const [lockOpen,setLockOpen]=useState(false),[swing,setSwing]=useState(false);
 useEffect(()=>{if(!open){setLockOpen(false);setSwing(false);return}if(reducedMotion()){setLockOpen(true);setSwing(true);return}
  const a=setTimeout(()=>setLockOpen(true),300),b=setTimeout(()=>setSwing(true),1000);return()=>{clearTimeout(a);clearTimeout(b)}},[open]);
 return <figure aria-label={label} className={`door-scene relative mx-auto h-[150px] w-[104px] ${className}`} style={{perspective:"520px"}}>
  <div className="absolute inset-0 grid place-items-center rounded-t-[8px] bg-gold px-2 pl-5 text-center font-display text-[15px] font-semibold leading-tight text-on-gold">{behind}</div>
  <div className={`door-leaf absolute inset-0 origin-left rounded-t-[8px] border-2 border-edge bg-panel ${swing?"door-leaf-open":""}`}>
   <span className="absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gold"/>
   <span className={`absolute left-1/2 top-[58%] grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border-2 bg-deep ${lockOpen?"border-success text-success":"border-edge text-muted"}`}><Padlock open={lockOpen} size={20}/></span>
  </div>
 </figure>;
}

// The rest of a screen, after the proved moment has held about a second.
export const QUIET_HOLD_MS=1400;
export function Held({ms=1000,skip=false,children}:{ms?:number;skip?:boolean;children:React.ReactNode}){
 const done=useHeld(ms);
 if(skip)return <>{children}</>;
 return done?<div className="fade-in">{children}</div>:null;
}
