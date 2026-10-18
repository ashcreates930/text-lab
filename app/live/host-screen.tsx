"use client";
// The host screen for a live round: projector-friendly, large type, one clear next action at a time.
// Lobby (QR code, squads) → pick a round → live counters → reveal → scoreboard (squads only) → next round or end.
import {useEffect,useRef,useState} from "react";
import {Check,Gavel,MessageCircle,Pause,Play,Search,Shuffle,Square,Users,Volume2,X} from "lucide-react";
import type {hostView} from "@/lib/live/server";
import {ROLE_INFO,OBJECTION_SECONDS,type Role} from "@/lib/live/engine";
import {hostKey,postJson,readStored,useLive,useScreenTop} from "./use-live";

type View=ReturnType<typeof hostView>;
const big="text-[clamp(18px,1.6vw,26px)]";

export function HostScreen({sessionId}:{sessionId:string}){
 const [token,setToken]=useState<string|null>(null);
 useEffect(()=>{setToken(readStored<string>(hostKey(sessionId)))},[sessionId]);
 const {state,setState,error}=useLive<View>(token?sessionId:null,token?{"x-live-host":token}:null);
const screenKey=(v:{session:{status:string;roundIndex:number};round:unknown}|null)=>v?`${v.session.status}:${v.session.roundIndex}:${(v.round as {stage?:string}|null)?.stage??""}`:null;
 const [notice,setNotice]=useState(""),[ending,setEnding]=useState(false);
 useScreenTop(screenKey(state));
 async function act(body:Record<string,unknown>){const r=await postJson(`/api/live/sessions/${sessionId}/host`,body,{"x-live-host":token??""});if(r.ok){setState(r.data);setNotice("")}else setNotice(r.error)}
 if(token===null&&typeof window!=="undefined"&&!readStored(hostKey(sessionId)))return <Shell><p className={big}>This screen needs the host link from the device that started the round.</p></Shell>;
 if(!state)return <Shell><p className={big} aria-live="polite">{error||"Opening the live round…"}</p></Shell>;
 const s=state.session,round=state.round;
 const joinUrl=typeof window!=="undefined"?`${window.location.origin}/live/${s.code}`:"";
 return <Shell>
  <header className="flex flex-wrap items-center justify-between gap-4">
   <div><p className="text-[16px] font-semibold uppercase tracking-[.14em] text-[#F3C9B2]">Live round · {s.title}{s.demo?" · Demo room":""}</p>
    <h1 className="mt-1 text-[clamp(28px,3vw,48px)] font-bold leading-tight outline-none" tabIndex={-1}>{s.status==="lobby"?"Join the case":s.status==="ended"?"Case closed":round?roundTitle(round.type):"Next round"}</h1></div>
   <div className="flex flex-wrap items-center gap-2">
    <Counter label="Players" value={state.counters.players}/>
    <Counter label="Squads joined" value={state.counters.squadsJoined}/>
    {s.status==="round"&&state.counters.squadsAnswering>0&&<Counter label="Squads submitted" value={`${state.counters.squadsSubmitted}/${state.counters.squadsAnswering}`}/>}
    {s.status==="round"&&(round?.type==="verdict"&&"stage" in round&&round.stage==="vote"||round?.type==="objection"&&"stage" in round&&round.stage==="vote")&&<Counter label="Votes" value={state.counters.votes}/>}
    {s.status!=="ended"&&s.status!=="lobby"&&<button type="button" onClick={()=>act({action:s.paused?"resume":"pause"})} className="host-btn-secondary">{s.paused?<Play size={22}/>:<Pause size={22}/>}{s.paused?"Resume":"Pause"}</button>}
    {s.status!=="ended"&&(ending?<span role="group" aria-label="End this live round for everyone?" className="flex flex-wrap items-center gap-2"><span className="text-[16px] font-semibold">End for everyone?</span><button type="button" autoFocus onClick={()=>{setEnding(false);act({action:"end"})}} className="host-btn-secondary">Yes, end</button><button type="button" onClick={()=>setEnding(false)} className="host-btn-secondary">Keep playing</button></span>
     :<button type="button" onClick={()=>setEnding(true)} className="host-btn-secondary"><Square size={20}/>End</button>)}
   </div>
  </header>
  {notice&&<p role="alert" className={`mt-4 rounded-2xl bg-[#A0472C] px-5 py-3 ${big}`}>{notice}</p>}
  {state.flagged>0&&<p className="mt-4 rounded-2xl bg-[#3A332B] px-5 py-3 text-[18px]">{state.flagged} response{state.flagged===1?"":"s"} hidden for you to review (Evidence → Live rounds).</p>}
  {s.paused&&<p className={`mt-4 rounded-2xl bg-[#F3C9B2] px-5 py-3 font-bold text-[#2A2620] ${big}`}>Paused</p>}

  {(s.status==="lobby"||(s.status==="reveal"&&!round))&&<Lobby state={state} joinUrl={joinUrl} act={act}/>}
  {s.status==="round"&&round&&<LiveRound state={state} act={act} sessionId={sessionId}/>}
  {s.status==="reveal"&&round&&<Reveal state={state} act={act}/>}
  {(s.status==="reveal"||s.status==="lobby")&&state.squads.some(q=>q.members.length)&&<RoundPicker state={state} act={act} first={s.status==="lobby"}/>}
  {s.status!=="lobby"&&<Scoreboard state={state}/>}
  {s.status!=="ended"&&s.status!=="lobby"&&<p className="mt-8 text-[18px] text-[#F3C9B2]">Join at {joinUrl.replace(/^https?:\/\//,"")}</p>}
 </Shell>;
}

function Shell({children}:{children:React.ReactNode}){
 return <main className="case-ui case-ui-dark min-h-screen bg-[#1E1A15] px-5 py-6 md:px-10 md:py-8">{children}</main>;
}
const roundTitle=(t:string)=>t==="lie"?"Spot the Lie":t==="verdict"?"Verdict Vote":"Objection!";
function Counter({label,value}:{label:string;value:number|string}){
 return <div className="rounded-2xl bg-[#2E2821] px-4 py-2 text-center" aria-live="polite"><p className="text-[28px] font-bold leading-none tabular-nums">{value}</p><p className="mt-1 text-[14px] text-[#F3C9B2]">{label}</p></div>;
}

function Qr({url}:{url:string}){
 const [svg,setSvg]=useState("");
 useEffect(()=>{let on=true;import("qrcode").then(m=>((m as unknown as {default?:{toString:typeof m.toString}}).default??m).toString(url,{type:"svg",margin:1,color:{dark:"#1E1A15",light:"#FFFDF8"}})).then(s=>{if(on)setSvg(s)}).catch(()=>{});return()=>{on=false}},[url]);
 return <div role="img" aria-label={`QR code to join: ${url}`} className="h-[min(34vh,260px)] w-[min(34vh,260px)] shrink-0 overflow-hidden rounded-2xl bg-[#FFFDF8] p-2 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{__html:svg}}/>;
}

function Lobby({state,joinUrl,act}:{state:View;joinUrl:string;act:(b:Record<string,unknown>)=>void}){
 const [dragging,setDragging]=useState<string|null>(null);
 const squads=state.squads;
 const move=(playerId:string,squadId:string|null)=>act({action:"squads.move",playerId,squadId});
 return <section className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
  <div className="flex flex-col items-center gap-3 rounded-3xl bg-[#2E2821] p-5 text-center">
   <Qr url={joinUrl}/>
   <p className="text-[18px]">Scan to join, or go to</p>
   <p className="text-[22px] font-bold break-all">{joinUrl.replace(/^https?:\/\//,"")}</p>
   <p className="text-[15px] text-[#F3C9B2]">Class students: tap "Join live round" on your class screen.</p>
  </div>
  <div>
   <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-[26px] font-bold"><Users size={26}/> Squads</h2>
    <button type="button" onClick={()=>act({action:"squads.auto"})} disabled={!state.counters.players} className="host-btn"><Shuffle size={22}/>{squads.length?"Rebuild squads":"Build squads of 3 or 4"}</button></div>
   {!state.counters.players&&<p className={`mt-4 ${big} text-[#F3C9B2]`} aria-live="polite">Waiting for detectives to join…</p>}
   {state.unassigned.length>0&&<div className="mt-4 rounded-2xl border-2 border-dashed border-[#5A4F42] p-4" onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragging)move(dragging,null)}}>
    <p className="text-[16px] font-semibold text-[#F3C9B2]">Not in a squad yet</p>
    <ul className="mt-2 flex flex-wrap gap-2">{state.unassigned.map(p=><PlayerChip key={p.id} id={p.id} name={p.nickname} squads={squads} current={null} onMove={move} onDrag={setDragging}/>)}</ul>
   </div>}
   <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{squads.map(q=><li key={q.id} className="rounded-2xl bg-[#2E2821] p-4" onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragging)move(dragging,q.id)}}>
    <p className="text-[22px] font-bold">{q.name}</p>
    <p className="text-[15px] text-[#F3C9B2]">{state.purpose||"Catch the false claim with one line from the story."}</p>
    <ul className="mt-3 flex flex-wrap gap-2">{q.members.map(m=><PlayerChip key={m.id} id={m.id} name={m.nickname} squads={squads} current={q.id} onMove={move} onDrag={setDragging}/>)}</ul>
    {!q.members.length&&<p className="mt-2 text-[15px] text-[#B8AD9E]">Drag a player here.</p>}
   </li>)}</ol>
  </div>
 </section>;
}
// Drag a player to a squad, or use the menu (keyboard and touch).
function PlayerChip({id,name,squads,current,onMove,onDrag}:{id:string;name:string;squads:View["squads"];current:string|null;onMove:(p:string,s:string|null)=>void;onDrag:(id:string|null)=>void}){
 return <li draggable onDragStart={()=>onDrag(id)} onDragEnd={()=>onDrag(null)} className="flex max-w-full items-center justify-between gap-1 rounded-2xl bg-[#FFFDF8] py-1 pl-3 pr-1 text-[16px] font-semibold leading-5 text-[#2A2620]">
  <span className="min-w-0 break-words">{name}</span>
  <label className="sr-only" htmlFor={`move-${id}`}>Move {name} to</label>
  <select id={`move-${id}`} value={current??""} onChange={e=>onMove(id,e.target.value||null)} className="ml-1 max-w-[50%] shrink-0 rounded-full bg-[#EFE8D8] px-2 py-1 text-[14px]"><option value="">No squad</option>{squads.map(s=><option key={s.id} value={s.id}>{s.name.replace("Squad ","")}</option>)}</select>
 </li>;
}

function RoundPicker({state,act,first}:{state:View;act:(b:Record<string,unknown>)=>void;first:boolean}){
 const [scene,setScene]=useState(state.lieScenes[0]?.sceneId??"");
 return <section className="mt-8 rounded-3xl bg-[#2E2821] p-5" aria-labelledby="pick-h">
  <h2 id="pick-h" className="text-[24px] font-bold">{first?"Start the first round":"Next round"}</h2>
  <div className="mt-4 grid gap-3 md:grid-cols-3">
   <div className="rounded-2xl bg-[#1E1A15] p-4"><p className="flex items-center gap-2 text-[22px] font-bold"><Search size={22}/> Spot the Lie</p><p className="mt-1 text-[16px] text-[#E8DDCB]">A character testifies. Squads find the line that disproves them.</p>
    <label htmlFor="lie-scene" className="mt-3 block text-[14px] text-[#F3C9B2]">Testimony</label>
    <select id="lie-scene" value={scene} onChange={e=>setScene(e.target.value)} className="mt-1 w-full rounded-xl bg-[#FFFDF8] px-3 py-2 text-[16px] text-[#2A2620]">{state.lieScenes.map(l=><option key={l.sceneId} value={l.sceneId}>{l.label}</option>)}</select>
    <button type="button" onClick={()=>act({action:"round.start",type:"lie",sceneId:scene})} className="host-btn mt-3 w-full">Start<span className="sr-only"> Spot the Lie</span></button></div>
   <div className="rounded-2xl bg-[#1E1A15] p-4"><p className="flex items-center gap-2 text-[22px] font-bold"><Gavel size={22}/> Verdict Vote</p><p className="mt-1 text-[16px] text-[#E8DDCB]">Everyone votes on a theory. Squads defend it with three pieces of evidence.</p>
    <button type="button" disabled={!state.session.hasVerdict} onClick={()=>act({action:"round.start",type:"verdict"})} className="host-btn mt-3 w-full">Start<span className="sr-only"> Verdict Vote</span></button></div>
   <div className="rounded-2xl bg-[#1E1A15] p-4"><p className="flex items-center gap-2 text-[22px] font-bold"><MessageCircle size={22}/> Objection!</p><p className="mt-1 text-[16px] text-[#E8DDCB]">One squad counters another squad's evidence in {OBJECTION_SECONDS} seconds. The class decides.</p>
    <button type="button" disabled={!state.canObjection} onClick={()=>act({action:"round.start",type:"objection"})} className="host-btn mt-3 w-full">Start<span className="sr-only"> Objection!</span></button>
    {!state.canObjection&&<p className="mt-2 text-[14px] text-[#B8AD9E]">Play a Verdict Vote with at least two squads first.</p>}</div>
  </div>
 </section>;
}

function LiveRound({state,act,sessionId}:{state:View;act:(b:Record<string,unknown>)=>void;sessionId:string}){
 const round=state.round!;
 return <section className="mt-6" aria-live="polite">
  <p className={`text-[#F3C9B2] ${big}`}>{state.purpose}</p>
  {round.type==="lie"&&"testimony" in round&&<Testimony round={round} sessionId={sessionId} worldId={state.session.worldId}/>}
  {round.type==="verdict"&&"theories" in round&&<div className="mt-4 rounded-3xl bg-[#2E2821] p-6">
   <p className="text-[clamp(24px,2.4vw,40px)] font-bold">{round.question}</p>
   {round.stage==="vote"?<><p className={`mt-2 ${big}`}>Vote on your phone.</p><VoteBars votes={state.votes??[]}/></>:<p className={`mt-3 ${big}`}>Squads: pin three pieces of evidence and write your argument.</p>}
  </div>}
  {round.type==="objection"&&"pin" in round&&<Objection round={round}/>}
  <SquadStatus state={state}/>
  <div className="mt-6 flex flex-wrap gap-3">
   {round.type==="verdict"&&"stage" in round&&round.stage==="vote"&&<button type="button" onClick={()=>act({action:"round.stage"})} className="host-btn">Squads argue now</button>}
   {round.type==="objection"&&"stage" in round&&round.stage==="counter"&&<button type="button" onClick={()=>act({action:"round.stage"})} className="host-btn">Class votes now</button>}
   {!(round.type==="verdict"&&"stage" in round&&round.stage==="vote")&&!(round.type==="objection"&&"stage" in round&&round.stage==="counter")&&<button type="button" onClick={()=>act({action:"round.reveal"})} className="host-btn">Reveal</button>}
  </div>
 </section>;
}

function Testimony({round,sessionId,worldId}:{round:Extract<NonNullable<View["round"]>,{type:"lie"}>;sessionId:string;worldId:string}){
 const [playing,setPlaying]=useState(false);const audio=useRef<HTMLAudioElement|null>(null),played=useRef(false);
 async function play(){
  if(playing){audio.current?.pause();setPlaying(false);return}
  try{const r=await fetch("/api/voice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId:sessionId,text:round.testimony,worldId,character:round.characterId})});if(!r.ok)return;const a=new Audio(URL.createObjectURL(await r.blob()));audio.current=a;a.onended=()=>setPlaying(false);setPlaying(true);await a.play()}catch{setPlaying(false)}
 }
 useEffect(()=>{if(played.current)return;played.current=true;play()},[]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>()=>audio.current?.pause(),[]);
 return <div className="mt-4 flex flex-col gap-5 rounded-3xl bg-[#2E2821] p-6 md:flex-row md:items-center">
  {round.portrait&&<img src={round.portrait} alt="" className={`h-40 w-40 shrink-0 rounded-full object-cover ${playing?"voice-ring":""}`}/>}
  <div className="min-w-0"><p className="text-[18px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Testimony · {round.character} · {round.clueName}</p>
   <p className="mt-2 font-serif text-[clamp(22px,2.2vw,36px)] leading-snug">“{round.testimony}”</p>
   <p className={`mt-3 ${big} text-[#F3C9B2]`}>One thing {round.character} said is false. Find the line in the story that proves it.</p>
   <button type="button" onClick={play} aria-label={playing?"Stop voice":`Hear ${round.character}'s testimony`} className="host-btn-secondary mt-4">{playing?<Square size={20}/>:<Volume2 size={22}/>}{playing?"Stop":"Play testimony"}</button></div>
 </div>;
}
function Objection({round}:{round:Extract<NonNullable<View["round"]>,{type:"objection"}>}){
 const [left,setLeft]=useState(0);
 useEffect(()=>{const tick=()=>setLeft(Math.max(0,Math.ceil((new Date(round.endsAt).getTime()-Date.now())/1000)));tick();const t=setInterval(tick,500);return()=>clearInterval(t)},[round.endsAt]);
 return <div className="mt-4 rounded-3xl bg-[#2E2821] p-6">
  <p className="text-[18px] font-semibold uppercase tracking-wide text-[#F3C9B2]">{round.defendSquad}'s evidence</p>
  <p className="mt-2 font-serif text-[clamp(22px,2.2vw,34px)] leading-snug">“{round.pin.quote}”</p>
  {round.stage==="counter"?<p className={`mt-4 font-bold ${big}`}>{round.objectSquad} objects! {left>0?`${left} seconds to counter it with a line and one sentence.`:"Time's up."}</p>
  :<>{round.counter?<div className="mt-5 border-t border-[#5A4F42] pt-5"><p className="text-[18px] font-semibold uppercase tracking-wide text-[#F3C9B2]">{round.objectSquad}'s counter</p><p className="mt-2 font-serif text-[clamp(22px,2.2vw,34px)] leading-snug">“{round.counter.line}”</p>{round.counter.text&&<p className={`mt-2 ${big}`}>{round.counter.text}</p>}</div>:<p className={`mt-4 ${big}`}>{round.objectSquad} didn't finish a counter in time.</p>}
  <p className={`mt-4 font-bold ${big}`}>Vote on your phone: is {round.objectSquad}'s objection sustained or overruled?</p></>}
 </div>;
}
function VoteBars({votes}:{votes:{theoryId:string;name:string;votes:number}[]}){
 const max=Math.max(1,...votes.map(v=>v.votes));
 return <ol className="mt-4 space-y-3" aria-label="Votes so far">{votes.map(v=><li key={v.theoryId}><div className="flex items-baseline justify-between gap-3 text-[20px]"><span className="font-semibold">{v.name}</span><span className="tabular-nums">{v.votes}</span></div>
  <div className="mt-1 h-6 overflow-hidden rounded-full bg-[#1E1A15]"><div className="h-full rounded-full bg-[#A0472C] transition-[width] duration-500 motion-reduce:transition-none" style={{width:`${(v.votes/max)*100}%`}}/></div></li>)}</ol>;
}
function SquadStatus({state}:{state:View}){
 const round=state.round;
 if(!round||(round.type==="verdict"&&"stage" in round&&round.stage==="vote")||(round.type==="objection"&&"stage" in round&&round.stage==="vote"))return null;
 const squads=state.squads.filter(q=>q.members.length&&(round.type!=="objection"||("objectSquad" in round&&q.name===round.objectSquad)));
 return <ul className="mt-5 flex flex-wrap gap-3" aria-label="Squads">{squads.map(q=><li key={q.id} className={`rounded-2xl px-4 py-3 text-[18px] ${q.submitted?"bg-[#A0472C]":"bg-[#2E2821]"}`}>
  <p className="flex items-center gap-2 font-bold">{q.submitted&&<Check size={20}/>}{q.name}</p>
  {!q.submitted&&<p className="text-[15px] text-[#F3C9B2]">Waiting for {q.waitingFor.map(r=>ROLE_INFO[r as Role].name).join(", ")}</p>}
 </li>)}</ul>;
}

function Reveal({state,act}:{state:View;act:(b:Record<string,unknown>)=>void}){
 const r=state.reveal;const names=new Map(state.squads.map(q=>[q.id,q.name]));
 if(!r)return null;
 if(r.type==="lie")return <section className="mt-6" aria-labelledby="reveal-h">
  <h2 id="reveal-h" className="text-[26px] font-bold">The line that disproves it</h2>
  <p className="mt-2 rounded-3xl bg-[#FFFDF8] p-5 font-serif text-[clamp(20px,2vw,32px)] leading-snug text-[#2A2620]">“{r.truthLine}”</p>
  <p className={`mt-3 ${big}`}>{r.explanation}</p>
  <ul className="mt-5 grid gap-3 md:grid-cols-2">{r.squads.map(q=><li key={q.squadId} className="rounded-2xl bg-[#2E2821] p-4">
   <div className="flex items-center justify-between gap-2"><p className="text-[20px] font-bold">{names.get(q.squadId)}</p><p className="text-[22px] font-bold tabular-nums">{q.points} pts</p></div>
   <p className="mt-1 flex items-center gap-2 text-[16px] text-[#F3C9B2]">{q.correct?<Check size={18}/>:<X size={18}/>}{q.detail}</p>
   {q.line&&<p className="mt-2 font-serif text-[16px] italic">“{q.line.length>160?q.line.slice(0,160)+"…":q.line}”</p>}
   {q.explanation&&<p className="mt-2 text-[16px]">{q.explanation}</p>}
   {q.correct&&<div className="mt-3 flex gap-2"><span className="text-[14px] text-[#B8AD9E]">Explanation:</span><button type="button" onClick={()=>act({action:"override",key:"sound",squadId:q.squadId,value:true})} aria-pressed={q.sound} className={`rounded-full px-3 py-1 text-[14px] font-semibold ${q.sound?"bg-[#FFFDF8] text-[#2A2620]":"bg-[#1E1A15]"}`}>Sound</button><button type="button" onClick={()=>act({action:"override",key:"sound",squadId:q.squadId,value:false})} aria-pressed={!q.sound} className={`rounded-full px-3 py-1 text-[14px] font-semibold ${!q.sound?"bg-[#FFFDF8] text-[#2A2620]":"bg-[#1E1A15]"}`}>Not yet</button></div>}
  </li>)}</ul>
 </section>;
 if(r.type==="verdict"){
  const theories=new Map(r.votes.map(v=>[v.theoryId,v.name]));
  return <section className="mt-6" aria-labelledby="reveal-h">
   <h2 id="reveal-h" className="text-[26px] font-bold">How the class voted</h2><VoteBars votes={r.votes}/>
   <h2 className="mt-6 text-[26px] font-bold">The strongest argument on each side</h2>
   <ul className="mt-3 grid gap-3 md:grid-cols-3">{Object.entries(r.strongest).map(([theoryId,best])=><li key={theoryId} className="rounded-2xl bg-[#2E2821] p-4">
    <p className="text-[16px] font-semibold uppercase tracking-wide text-[#F3C9B2]">{theories.get(theoryId)}</p>
    <p className="mt-1 text-[20px] font-bold">{names.get(best.squadId)} · {best.detail}</p>
    <p className="mt-2 text-[17px] leading-7">{best.argument}</p>
   </li>)}</ul>
   {!Object.keys(r.strongest).length&&<p className={`mt-3 ${big}`}>No arguments were submitted.</p>}
  </section>;
 }
 return <section className="mt-6" aria-labelledby="reveal-h">
  <h2 id="reveal-h" className="text-[30px] font-bold">{!r.countered?"No objection was filed: the evidence stands.":r.sustained?"Objection sustained!":"Objection overruled!"}</h2>
  {r.countered&&<><p className="mt-3 font-serif text-[clamp(20px,2vw,30px)] italic">“{r.counterLine}”</p><p className={`mt-2 ${big}`}>{r.counterText}</p>
   <p className="mt-3 text-[20px]">Class vote: {r.sustain} sustained · {r.overrule} overruled{r.overridden?" · teacher's ruling":""}</p>
   <div className="mt-4 flex gap-3"><button type="button" onClick={()=>act({action:"override",key:"objection",value:true})} className="host-btn-secondary">Rule: sustained</button><button type="button" onClick={()=>act({action:"override",key:"objection",value:false})} className="host-btn-secondary">Rule: overruled</button></div></>}
 </section>;
}

function Scoreboard({state}:{state:View}){
 const scores=state.scores.filter(s=>state.squads.find(q=>q.id===s.squadId)?.members.length);
 if(!scores.length)return null;
 return <section className="mt-8" aria-labelledby="score-h"><h2 id="score-h" className="text-[24px] font-bold">Squad points</h2>
  <ol className="mt-3 flex flex-wrap gap-3">{scores.map(s=><li key={s.squadId} className="rounded-2xl bg-[#2E2821] px-5 py-3"><p className="text-[18px] font-semibold">{s.name}</p><p className="text-[30px] font-bold tabular-nums">{s.points}</p></li>)}</ol>
  <p className="mt-2 text-[15px] text-[#B8AD9E]">Points come from evidence and reasoning. Speed is only a small bonus on correct answers.</p>
 </section>;
}
