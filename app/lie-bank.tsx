"use client";
// The teacher's Lie bank for one class: lies students planted (Plant a Lie) waiting for review, with screened ones
// marked, and the approved bank the teacher can use as Spot the Lie rounds in live mode.
import {useCallback,useEffect,useState} from "react";
import {Check,Flag,X} from "lucide-react";

type Lie={id:string;student:string;character:string;clue:string;sentence:string;truthLine:string;status:"pending"|"approved"|"rejected"|"flagged";createdAt:string};
type Fetcher=(path:string,init?:RequestInit)=>Promise<{ok:boolean;status:number;body:{lies?:Lie[];error?:string}}>;

export function LieBankTab({classId,fetcher}:{classId:string;fetcher:Fetcher}){
 const [lies,setLies]=useState<Lie[]|null>(null),[error,setError]=useState("");
 const load=useCallback(async()=>{const r=await fetcher(`/api/teacher/classes/${classId}/lies`);if(r.ok)setLies(r.body.lies??[]);else setError(r.body.error||"Could not load the Lie bank.")},[classId,fetcher]);
 useEffect(()=>{load()},[load]);
 async function review(id:string,action:"approve"|"reject"){
  setLies(ls=>ls?.map(l=>l.id===id?{...l,status:action==="approve"?"approved":"rejected"}:l)??null);
  const r=await fetcher(`/api/teacher/classes/${classId}/lies`,{method:"POST",body:JSON.stringify({id,action})});
  if(!r.ok){setError(r.body.error||"Could not save that.");load()}
 }
 if(error)return <p role="alert" className="text-base text-[#A33B20]">{error}</p>;
 if(!lies)return <p className="text-base text-white/70">Loading the Lie bank…</p>;
 const waiting=lies.filter(l=>l.status==="pending"||l.status==="flagged"),bank=lies.filter(l=>l.status==="approved");
 return <div className="space-y-5">
  <section className="panel p-6" aria-labelledby="lies-waiting-h">
   <h2 id="lies-waiting-h" className="serif text-2xl">Waiting for you</h2>
   <p className="mt-1 text-base text-white/75">Students planted these after proving a clue. Approve the ones a classmate could catch with the line shown.</p>
   {!waiting.length?<p className="mt-4 text-base text-white/75">Nothing waiting. Students can plant a lie after they prove a clue.</p>
   :<ul className="mt-4 space-y-3">{waiting.map(l=><li key={l.id} className="rounded-2xl border border-white/15 p-4">
    {l.status==="flagged"&&<p className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#F7DCD3] px-2 py-0.5 text-[13px] font-bold text-[#A33B20]"><Flag size={13}/>Flagged by the safety check. Only you can see this.</p>}
    <LieBody lie={l}/>
    <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>review(l.id,"approve")} className="gold-button flex min-h-11 items-center gap-2 px-4 py-2 text-sm"><Check size={16}/>Approve<span className="sr-only"> {l.student}'s lie</span></button><button type="button" onClick={()=>review(l.id,"reject")} className="flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm"><X size={16}/>Reject<span className="sr-only"> {l.student}'s lie</span></button></div>
   </li>)}</ul>}
  </section>
  <section className="panel p-6" aria-labelledby="lies-bank-h">
   <h2 id="lies-bank-h" className="serif text-2xl">Lie bank ({bank.length})</h2>
   <p className="mt-1 text-base text-white/75">Pick one in a live round under Spot the Lie. The writer's squad sits out that round and earns points for every squad that catches it with the right line and a sound explanation.</p>
   {!bank.length?<p className="mt-4 text-base text-white/75">No approved lies yet.</p>:<ul className="mt-4 space-y-3">{bank.map(l=><li key={l.id} className="rounded-2xl border border-white/15 p-4"><LieBody lie={l}/></li>)}</ul>}
  </section>
 </div>;
}

function LieBody({lie}:{lie:Lie}){
 return <>
  <p className="text-sm text-white/70">{lie.student} · {lie.clue}</p>
  <p className="mt-1 text-lg"><b>{lie.character}:</b> “{lie.sentence}”</p>
  <p className="mt-2 text-sm text-white/70">Disproved by:</p>
  <p className="serif mt-1 text-base italic text-white/90">“{lie.truthLine}”</p>
 </>;
}
