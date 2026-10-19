"use client";
// Ways into a live round: the Demo room (sample classroom), "Start a live round" (a teacher's class), the one-tap
// "Join live round" banner (class students), and the weekly period vs. period board (classes, never students).
import {useCallback,useEffect,useState} from "react";
import {ArrowRight,Radio,Trophy} from "lucide-react";
import {hostKey,playerKey,postJson,store} from "./use-live";

// The host screen opens in a new tab for the projector; if the browser blocks that, it opens here instead.
// (window.open with "noopener" always returns null, so the opener link is cut by hand.)
function openHost(id:string,token:string){store(hostKey(id),token);const url=`/live/host/${id}`,w=window.open(url,"_blank");if(w)w.opener=null;else window.location.href=url}

// Opens a Demo room (sample classroom, up to 40 players, 2 hours) on its host screen. Returns an error to show, or "".
export async function openDemoRoom(worldId="sleepy-hollow"){const r=await postJson("/api/live/sessions",{demo:true,worldId});if(!r.ok)return r.error;openHost(r.data.id,r.data.hostToken);return ""}

export function DemoRoomButton({worldId="sleepy-hollow",label="Run a live demo round",large=false}:{worldId?:string;label?:string;large?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function start(){if(busy)return;setBusy(true);setError("");const e=await openDemoRoom(worldId);setBusy(false);setError(e)}
 return <div className="flex flex-wrap items-center gap-3">
  <button type="button" onClick={start} aria-busy={busy} className={`case-primary ${large?"!min-h-[60px] !px-7 !text-[19px]":""}`}><Radio size={large?22:18}/>{busy?"Opening the demo room…":label}</button>
  <p className="text-[14px] text-[#6B6457]">Players join on their phones by scanning a QR code. Up to 40 players; the room closes after 2 hours.</p>
  {error&&<p role="alert" className="w-full text-[15px] text-[#A33B20]">{error}</p>}
 </div>;
}

export function StartLiveRound({classId,fetcher}:{classId:string;fetcher:(path:string,init?:RequestInit)=>Promise<{ok:boolean;status:number;body:{id?:string;hostToken?:string;error?:string}}>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function start(){if(busy)return;setBusy(true);setError("");const r=await fetcher("/api/live/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({classId})});setBusy(false);if(r.ok&&r.body.id&&r.body.hostToken)openHost(r.body.id,r.body.hostToken);else setError(r.body.error||"Could not start a live round.")}
 return <div><button type="button" onClick={start} aria-busy={busy} className="gold-button flex min-h-[60px] items-center gap-3 px-7 py-3 text-lg font-bold"><Radio size={22}/>{busy?"Opening…":"Start a live round"}</button>
  <p className="mt-2 text-sm text-white/70">Squads play Spot the Lie, Verdict Vote and Objection! on their phones. Students tap "Join live round" on their class screen.</p>
  {error&&<p role="alert" className="mt-2 text-sm text-[#F3C9B2]">{error}</p>}</div>;
}

// Period vs. period: squad points added up per class this week.
export function ClassWeekBoard({fetcher}:{fetcher:(path:string)=>Promise<{ok:boolean;body:{board?:{classId:string;className:string;points:number;rounds:number}[]}}>}){
 const [board,setBoard]=useState<{classId:string;className:string;points:number;rounds:number}[]|null>(null);
 useEffect(()=>{fetcher("/api/live/board").then(r=>{if(r.ok)setBoard(r.body.board??[])}).catch(()=>{})},[fetcher]);
 if(!board?.length)return null;
 const max=Math.max(1,...board.map(b=>b.points));
 return <section className="panel p-6" aria-labelledby="week-board-h"><h2 id="week-board-h" className="serif flex items-center gap-2 text-2xl"><Trophy size={22}/> This week's case board</h2>
  <p className="mt-1 text-sm text-white/70">Squad points from live rounds, added up per class. No individual rankings.</p>
  <ol className="mt-4 space-y-3">{board.map(b=><li key={b.classId}><div className="flex justify-between gap-3 text-base"><span className="font-semibold">{b.className}</span><span className="tabular-nums">{b.points} pts · {b.rounds} round{b.rounds===1?"":"s"}</span></div><div className="mt-1 h-3 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#A0472C]" style={{width:`${(b.points/max)*100}%`}}/></div></li>)}</ol>
 </section>;
}

// A class student's one-tap way in when their teacher has a live round open.
export function JoinLiveRoundBanner({auth}:{auth:{token:string}}){
 const [round,setRound]=useState<{code:string;sessionId:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const load=useCallback(async()=>{try{const r=await fetch("/api/live/class-round",{headers:{"x-class-token":auth.token},cache:"no-store"});if(r.ok)setRound((await r.json()).round)}catch{}},[auth.token]);
 useEffect(()=>{load();const t=window.setInterval(load,5000);return()=>window.clearInterval(t)},[load]);
 if(!round)return null;
 async function join(){if(!round)return;setBusy(true);const r=await postJson("/api/live/join",{code:round.code},{"x-class-token":auth.token});setBusy(false);
  if(r.ok){store(playerKey(round.code),{sessionId:r.data.sessionId,playerToken:r.data.playerToken,nickname:r.data.nickname});window.location.href=`/live/${round.code}`}else setError(r.error)}
 return <div className="case-ui mx-auto max-w-6xl px-4 pt-4 md:px-8"><button type="button" onClick={join} disabled={busy} className="flex min-h-[60px] w-full items-center justify-between gap-4 rounded-2xl bg-[#2A2620] px-5 py-4 text-left text-white hover:bg-[#3A332B]"><span className="flex items-center gap-2 text-[18px] font-bold"><Radio size={20} className="text-[#F3C9B2]"/>{busy?"Joining…":"Join live round"}</span><ArrowRight size={20}/></button>
  {error&&<p role="alert" className="mt-2 text-[15px] text-[#A33B20]">{error}</p>}</div>;
}
