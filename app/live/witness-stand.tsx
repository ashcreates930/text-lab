"use client";
// The Witness stand: a phone under a clear pyramid on the teacher's desk. During live Spot the Lie it shows the
// testifying character as a hologram and plays their testimony when the host taps "Play on the Witness stand".
// Opened from the QR code on the host screen; the signed link is in the URL fragment, so it never reaches server logs.
import {useCallback,useEffect,useRef,useState} from "react";
import {Sparkles} from "lucide-react";
import {getBrowserSupabase} from "@/lib/supabase-browser";
import type {witnessView} from "@/lib/live/server";
import {HologramView,SILENT_WAV} from "../hologram-view";
import {focusScreenTop} from "../screen-focus";

type View=ReturnType<typeof witnessView>;

export function WitnessStand({sessionId}:{sessionId:string}){
 const [token,setToken]=useState<string|null>(null),[view,setView]=useState<View|null>(null),[error,setError]=useState(""),[started,setStarted]=useState(false),[unlocked,setUnlocked]=useState<{audio:HTMLAudioElement;context:AudioContext|null}|undefined>();
 const busy=useRef(false);
 useEffect(()=>{setToken(decodeURIComponent(window.location.hash.slice(1))||null);fetch("/api/access").catch(()=>{})},[]);
 const refresh=useCallback(async()=>{
  if(!token||busy.current)return;busy.current=true;
  try{const r=await fetch(`/api/live/sessions/${sessionId}/witness`,{headers:{"x-live-witness":token},cache:"no-store"});const j=await r.json();if(r.ok){setView(j);setError("")}else setError(j.error??"Something went wrong.")}
  catch{setError("Reconnecting…")}finally{busy.current=false}
 },[sessionId,token]);
 useEffect(()=>{if(!token)return;refresh();const db=getBrowserSupabase();const ch=db?.channel(`live:${sessionId}`).on("broadcast",{event:"changed"},()=>{refresh()}).subscribe();const t=window.setInterval(refresh,1500);return()=>{window.clearInterval(t);if(ch)db?.removeChannel(ch)}},[token,sessionId,refresh]);
 useEffect(()=>{focusScreenTop()},[started]);
 if(token===null&&typeof window!=="undefined"&&!window.location.hash)return <Shell><h1 className="text-[24px] font-bold">Scan the Witness stand code on the board.</h1></Shell>;
 // Spot the Lie's witness, or Story Mode's speaker (round 2 confronts you, round 3 testifies).
 const w=view?.witness??view?.story??null;
 // The first tap unlocks sound on the phone; after that the host can play the testimony from the board.
 if(!started||!w)return <Shell>
  <p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">{view?.session.title??"Live round"} · Witness stand</p>
  <h1 className="mt-1 text-[26px] font-bold leading-tight">{w?`${w.character.name} takes the stand`:"Waiting for a testimony"}</h1>
  <p className="mt-3 text-[16px] leading-7 text-muted">{started?"The witness appears when your teacher starts Spot the Lie.":"Set this phone flat under the hologram pyramid. Turn brightness all the way up and dim the room."}</p>
  {!started&&<button type="button" onClick={()=>{const audio=new Audio(SILENT_WAV);audio.play().catch(()=>{});let context:AudioContext|null=null;try{context=new AudioContext();context.resume().catch(()=>{})}catch{}setUnlocked({audio,context});setStarted(true)}} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-[18px] font-bold text-on-primary"><Sparkles size={20}/>Start the Witness stand</button>}
  {error&&<p role="alert" className="mt-4 text-[15px] text-muted">{error}</p>}
 </Shell>;
 return <HologramView key={w.character.id} character={w.character} worldId={view!.session.worldId} line={w.line} sandboxId={sessionId} playKey={view!.playKey} title="Witness stand" unlocked={unlocked}/>;
}

function Shell({children}:{children:React.ReactNode}){
 return <main className="min-h-screen bg-stage px-5 py-8 text-ink"><div className="mx-auto max-w-md">{children}</div></main>;
}
