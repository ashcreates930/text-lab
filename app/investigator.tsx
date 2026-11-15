"use client";
// Escape rooms, phase 8: the investigator card on the map (rules: lib/investigator.ts). The student's investigator and
// their gear shelf: earned gear shows lit, the rest shows what proof earns it and how close they are. Gear comes from
// proof only. Choosing an investigator opens a picker in place (same screen: scroll and focus stay put; focus goes to
// the picker's heading and back to the button when it closes). Class students save through /api/student/investigator;
// demo visitors keep their pick on this device. Until the art is approved, plain icons stand in.
import {useEffect,useMemo,useRef,useState} from "react";
import {BookOpen,Check,Compass,Feather,KeyRound,Lamp,Lock,Search,UserRound} from "lucide-react";
import type {ExpeditionAttempt} from "@/lib/expedition-progress";
import {AVATARS,avatarSrc,gearFrom,gearSrc,isAvatar,type AvatarId,type GearId,type GearState} from "@/lib/investigator";

const ICON:Record<GearId,typeof Lamp>={lantern:Lamp,quill:Feather,magnifier:Search,key:KeyRound,compass:Compass,ledger:BookOpen};
const LOCAL="textlab:investigator";
type Auth={token:string}|null|undefined;

function Portrait({id,size}:{id:AvatarId|null;size:number}){
 const src=id?avatarSrc(id):null,alt=id?AVATARS.find(a=>a.id===id)!.alt:"No investigator chosen yet";
 return src?<img src={src} alt={alt} width={size} height={size} className="shrink-0 rounded-full object-cover ring-2 ring-highlight" style={{width:size,height:size}}/>
  :<span role="img" aria-label={alt} className="grid shrink-0 place-items-center rounded-full bg-panel-2 text-muted ring-2 ring-edge" style={{width:size,height:size}}><UserRound size={size*0.5} aria-hidden/></span>;
}
function GearTile({g}:{g:GearState}){
 const Icon=ICON[g.id],src=gearSrc(g.id);
 return <li className={`flex items-center gap-3 rounded-row px-3 py-2 ${g.earned?"bg-panel-2":"bg-panel-2/50"}`}>
  <span className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full ${g.earned?"bg-gold/20":"bg-panel"}`}>
   {src?<img src={src} alt="" className={`h-11 w-11 object-contain ${g.earned?"":"opacity-30 grayscale"}`}/>:<Icon size={22} aria-hidden className={g.earned?"text-gold":"text-muted"}/>}
   {!g.earned&&<Lock size={13} aria-hidden className="absolute -bottom-0.5 -right-0.5 text-muted"/>}
  </span>
  <span className="min-w-0 text-[14px] leading-snug"><span className="font-bold text-ink">{g.name}</span>{g.earned?<span className="ml-1 inline-flex items-center gap-0.5 font-bold text-success"><Check size={13} aria-hidden/>Earned</span>:<span className="ml-1 text-muted">· {g.have} of {g.need}</span>}<br/><span className="text-muted">{g.earn}</span></span>
 </li>;
}
export function InvestigatorCard({attempts,auth}:{attempts:ExpeditionAttempt[];auth:Auth}){
 const local=useMemo(()=>gearFrom(attempts),[attempts]);
 const [remote,setRemote]=useState<{avatar:{id:AvatarId}|null;gear:GearState[];saveable:boolean}|null>(null);
 const [avatar,setAvatar]=useState<AvatarId|null>(null),[picking,setPicking]=useState(false),[error,setError]=useState("");
 const pickRef=useRef<HTMLHeadingElement|null>(null),openRef=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{if(auth?.token){fetch("/api/student/investigator",{headers:{"x-class-token":auth.token},cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j){setRemote(j);setAvatar(j.avatar?.id??null)}}).catch(()=>{});return}
  try{const v=localStorage.getItem(LOCAL);if(isAvatar(v))setAvatar(v)}catch{}},[auth?.token]);
 useEffect(()=>{if(picking)pickRef.current?.focus({preventScroll:true})},[picking]);
 const gear=remote?.gear??local,earned=gear.filter(g=>g.earned).length;
 async function choose(id:AvatarId){setError("");
  if(auth?.token){const r=await fetch("/api/student/investigator",{method:"POST",headers:{"Content-Type":"application/json","x-class-token":auth.token},body:JSON.stringify({avatar:id})});if(!r.ok){setError((await r.json().catch(()=>({}))).error??"Couldn't save your investigator.");return}}
  else{try{localStorage.setItem(LOCAL,id)}catch{}}
  setAvatar(id);setPicking(false);setTimeout(()=>openRef.current?.focus({preventScroll:true}),0)}
 return <section aria-labelledby="inv-h" className="rounded-card bg-panel p-4">
  <div className="flex flex-wrap items-center gap-3">
   <Portrait id={avatar} size={64}/>
   <div className="min-w-0 flex-1"><h2 id="inv-h" className="text-[20px] font-bold leading-tight">Your investigator</h2><p className="text-[14px] text-muted">{earned} of {gear.length} gear earned. Gear comes only from proving things with lines from the story.</p></div>
   <button ref={openRef} type="button" aria-expanded={picking} onClick={()=>setPicking(p=>!p)} className="case-secondary !min-h-11 text-[15px]">{avatar?"Change investigator":"Choose your investigator"}</button>
  </div>
  {picking&&<div className="mt-3 rounded-row bg-panel-2 p-3">
   <h3 ref={pickRef} tabIndex={-1} className="text-[17px] font-bold outline-none">Choose your investigator</h3>
   {remote&&!remote.saveable&&<p className="mt-1 text-[13px] font-bold text-muted">Saving investigators turns on once your teacher's app is updated.</p>}
   <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">{AVATARS.map(a=><li key={a.id}><button type="button" aria-pressed={avatar===a.id} aria-label={a.alt} onClick={()=>choose(a.id)} className={`grid w-full place-items-center rounded-row p-2 ${avatar===a.id?"bg-primary/25 ring-2 ring-primary":"hover:bg-panel"}`}><Portrait id={a.id} size={64}/></button></li>)}</ul>
   {error&&<p role="alert" className="mt-2 text-[14px] text-notyet">{error}</p>}
  </div>}
  <ul aria-label="Your gear" className="mt-3 grid gap-2 sm:grid-cols-2">{gear.map(g=><GearTile key={g.id} g={g}/>)}</ul>
 </section>;
}
