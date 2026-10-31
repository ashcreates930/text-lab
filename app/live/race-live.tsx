"use client";
// Proof Race, live, and the lobby that every live game shares: the host board moves the class through each chunk's
// beats (read, then the summary or a question, the race, the reveal and the animated leaderboard), and every phone shows
// only its own part. The lobby shows names and character avatars popping in, with a quiet music loop the host can mute;
// waiting phones show their avatar and a rotating Words to Know card. The game ends on a podium with class stats.
import {useEffect,useRef,useState} from "react";
import {ArrowRight,Check,Hand,Pin,Volume2,VolumeX,Zap} from "lucide-react";
import type {hostView,playerView} from "@/lib/live/server";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {RACE_CHOICES,type BoardRow} from "@/lib/proof-race";
import {ReadingPanel} from "../reading-panel";
import {ChunkRead,ClockBar,GistPick,Leaderboard,Podium,QuestionAsk,cue,useBeatClock,type PodiumEntry} from "../proof-race";

type HostView=ReturnType<typeof hostView>;
type PlayerView=ReturnType<typeof playerView>;
type RaceRound=Extract<NonNullable<HostView["round"]>,{type:"race"}>;
export const isRace=(r:unknown):r is RaceRound=>!!r&&(r as {type?:string}).type==="race";
const SPEEDS:[string,string][]=[["1","Standard"],["1.5","1.5x time"],["2","Double time"],["untimed","Untimed"]];

// ---------- Lobby (host) ----------
// A quiet music loop while players join; the host can mute it (remembered on this device).
export function LobbyMusic({on}:{on:boolean}){
 const [muted,setMuted]=useState(true),ref=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>{try{setMuted(localStorage.getItem("textlab-lobby-muted")==="1")}catch{setMuted(false)}},[]);
 useEffect(()=>{if(!on||muted){ref.current?.pause();return}const a=ref.current??new Audio("/sounds/story/lobby.mp3");ref.current=a;a.loop=true;a.volume=0.25;a.play().catch(()=>{});return()=>a.pause()},[on,muted]);
 function toggle(){const m=!muted;setMuted(m);try{localStorage.setItem("textlab-lobby-muted",m?"1":"0")}catch{}}
 return <button type="button" onClick={toggle} aria-pressed={!muted} className="host-btn-secondary">{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}{muted?"Music off":"Music on"}</button>;
}
// Names and avatars as they join, and each player's time (extra time for students who need it).
export function LobbyBoard({state,act}:{state:HostView;act:(b:Record<string,unknown>)=>void}){
 if(!state.lobby.length)return null;
 return <section className="mt-6" aria-labelledby="lobby-h"><h2 id="lobby-h" className="text-[24px] font-bold">In the room</h2>
  <ul className="mt-3 flex flex-wrap gap-3">{state.lobby.map(p=><li key={p.id} className="piece-pop flex items-center gap-2 rounded-2xl bg-panel py-2 pl-2 pr-3">
   {p.avatar?.portrait?<img src={p.avatar.portrait} alt="" className="h-12 w-12 rounded-full border-2 border-highlight object-cover"/>:<span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-panel text-[20px] font-bold">{p.nickname.slice(0,1)}</span>}
   <span><span className="block text-[18px] font-bold leading-tight">{p.nickname}</span>{p.avatar&&<span className="block text-[13px] text-muted">as {p.avatar.name}</span>}</span>
   <label className="sr-only" htmlFor={`time-${p.id}`}>Time for {p.nickname}</label>
   <select id={`time-${p.id}`} value={p.extraTime??"1"} onChange={e=>act({action:"player.time",playerId:p.id,setting:e.target.value})} className="ml-1 rounded-full bg-deep px-2 py-1 text-[13px] text-ink">{SPEEDS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
  </li>)}</ul></section>;
}

// ---------- Starting a Proof Race (host) ----------
export function RacePick({state,act}:{state:HostView;act:(b:Record<string,unknown>)=>void}){
 const [o,setO]=useState({chunkSize:"paragraph",chunks:12,gist:true,questions:true,seconds:20,autoAdvance:true,squads:false});
 const set=(k:string,v:unknown)=>setO(x=>({...x,[k]:v}));
 const sel="mt-1 w-full rounded-xl bg-panel px-3 py-2 text-[16px] text-ink";
 return <div className="rounded-2xl bg-deep p-4"><p className="flex items-center gap-2 text-[22px] font-bold"><Zap size={22}/> Proof Race</p>
  <p className="mt-1 text-[16px] text-muted">Read a chunk together, check the gist, then race to the line that proves it. No squads needed.</p>
  <div className="mt-3 grid grid-cols-2 gap-2 text-[14px] text-muted">
   <label>Chunk size<select value={o.chunkSize} onChange={e=>set("chunkSize",e.target.value)} className={sel}><option value="paragraph">Paragraph</option><option value="sentences">2 to 4 sentences</option></select></label>
   <label>Chunks<select value={o.chunks} onChange={e=>set("chunks",Number(e.target.value))} className={sel}>{RACE_CHOICES.chunks.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
   <label>Race timer<select value={o.seconds} onChange={e=>set("seconds",Number(e.target.value))} className={sel}>{RACE_CHOICES.seconds.map(n=><option key={n} value={n}>{n} seconds</option>)}</select></label>
   <span className="flex flex-col justify-end gap-1">
    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={o.gist} onChange={e=>set("gist",e.target.checked)} className="h-5 w-5"/>Gist</label>
    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={o.questions} onChange={e=>set("questions",e.target.checked)} className="h-5 w-5"/>Your question</label></span>
   <label className="col-span-2 inline-flex items-center gap-2"><input type="checkbox" checked={o.autoAdvance} onChange={e=>set("autoAdvance",e.target.checked)} className="h-5 w-5"/>Move on when 90% are ready</label>
   {state.squads.some(q=>q.members.length)&&<label className="col-span-2 inline-flex items-center gap-2"><input type="checkbox" checked={o.squads} onChange={e=>set("squads",e.target.checked)} className="h-5 w-5"/>Squads pool their points</label>}
  </div>
  <button type="button" disabled={!state.proofRace||!state.counters.players} onClick={()=>act({action:"round.start",type:"race",squads:o.squads,settings:o})} className="host-btn mt-3 w-full">Start<span className="sr-only"> Proof Race</span></button>
  {!state.proofRace&&<p className="mt-2 text-[14px] text-muted">This story has no Proof Race chunks yet.</p>}</div>;
}

// ---------- The host board during a Proof Race ----------
export function RaceHost({state,round,world,act}:{state:HostView;round:RaceRound;world:WorldPack|null;act:(b:Record<string,unknown>)=>void}){
 const race=state.race!;
 // The longest time still in use: extra time counts only for players who have not answered yet.
 const maxScale=Math.max(1,...state.lobby.filter(p=>!race.done.includes(p.id)).map(p=>p.extraTime==="untimed"?3:Number(p.extraTime??1)||1));
 const processLeft=useBeatClock(round.beatStartedAt,round.beat==="process"?round.processSeconds:null);
 const raceLeft=useBeatClock(round.beatStartedAt,round.beat==="race"?round.seconds*maxScale:null);
 const baseLeft=useBeatClock(round.beatStartedAt,round.beat==="race"?round.seconds:null);
 // Move on by itself: 90% ready (when on), the summary's 15 seconds, or the race once everyone answered or time ran out.
 const moved=useRef("");
 const key=`${round.step}:${round.beat}`;
 const due=(round.beat==="read"&&race.ready.advance)||(round.beat==="process"&&processLeft===0)||(round.beat==="race"&&(raceLeft===0||(race.answered>=state.counters.players&&state.counters.players>0)));
 useEffect(()=>{if(due&&moved.current!==key&&!state.session.paused){moved.current=key;act({action:"race.next"})}},[due,key,act,state.session.paused]);
 // Up to 3 anonymous questions, pinnable while they are asked and again on the reveal.
 const questions=<div className="mt-3"><p className="text-[20px]">Student questions (no names):</p><ul className="mt-2 grid gap-2">{race.questions.slice(0,3).map(q=><li key={q.id} className="flex items-center justify-between gap-3 rounded-2xl bg-ink/10 px-5 py-3 text-[clamp(18px,1.8vw,26px)]"><span>{q.text}</span><button type="button" onClick={()=>act({action:"race.pin",questionId:race.pinned===q.id?null:q.id})} aria-pressed={race.pinned===q.id} className="host-btn-secondary"><Pin size={18}/>{race.pinned===q.id?"Pinned":"Pin"}</button></li>)}
     {!race.questions.length&&<li className="text-[18px] text-muted">Waiting for questions…</li>}</ul></div>;
 const next=<button type="button" onClick={()=>act({action:"race.next"})} className="host-btn">{round.beat==="board"?(round.step+1>=round.total?"Final podium":"Next chunk"):"Next"} <ArrowRight size={22}/></button>;
 return <section className="mt-4" aria-labelledby="race-h">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="race-h" className="text-[clamp(22px,2.2vw,34px)] font-bold">Chunk {round.step+1} of {round.total} · {({read:"Read",process:round.chunk.process==="question"?"Your question":"Gist",race:"Race",reveal:"The proof",board:"Leaderboard"} as Record<string,string>)[round.beat]}</h2>{next}</div>
  {round.beat==="read"&&world&&<><p className="mt-2 text-[clamp(18px,1.6vw,26px)] text-muted" aria-live="polite">{race.ready.ready} of {race.ready.total} ready · no timer while reading</p>
   <div className="mt-3"><ChunkRead world={world} sceneId={round.chunk.sceneId} passages={round.chunk.passages} size="board" dark/></div></>}
  {round.beat==="process"&&<div className="mt-3"><ClockBar left={processLeft} seconds={round.processSeconds}/><p className="mt-2 text-[20px] text-muted">{race.answered} of {state.counters.players} answered</p>
   {round.chunk.process==="gist"&&round.chunk.gist?<ol className="mt-3 grid gap-2">{round.chunk.gist.map((g,i)=><li key={i} className="rounded-2xl bg-ink/10 px-5 py-3 text-[clamp(18px,1.8vw,28px)]">{String.fromCharCode(65+i)}. {g}</li>)}</ol>
    :questions}</div>}
  {round.pinned&&<p className="mt-3 rounded-2xl bg-primary-soft px-5 py-3 text-[clamp(18px,1.8vw,26px)] font-bold text-ink"><Pin size={20} className="mr-2 inline"/>For discussion: {round.pinned}</p>}
  {round.beat==="race"&&<div className="mt-3"><p className="font-display text-[clamp(26px,2.8vw,44px)] font-bold leading-tight">{round.question}</p><div className="mt-2"><ClockBar left={baseLeft} seconds={round.seconds}/></div>
   <p className="mt-2 text-[20px] text-muted">{race.answered} of {state.counters.players} answered{maxScale>1?" · extra time still running for some":""}</p>
   <div className="reading-scope reading-card mt-3 px-6 py-4 font-serif text-[clamp(20px,2vw,32px)] leading-[1.6] text-reading-ink">{round.chunk.passages.map(p=><p key={p.id}>{p.text.replace(/\s+/g," ")}</p>)}</div></div>}
  {(round.beat==="reveal")&&round.reveal&&<div className="mt-3"><p className="text-[clamp(24px,2.6vw,40px)] font-bold">{round.reveal.pct}% found the proof</p><p className="text-[20px] text-muted">{round.question}</p>
   <div className="mt-3 [&_button]:text-[clamp(18px,1.8vw,28px)]"><ReadingPanel passages={round.chunk.passages as SourcePassage[]} results={[{line:round.reveal.line,ok:true}]} onTap={()=>{}} locked/></div>
   {round.chunk.process==="question"&&race.questions.length>0&&questions}</div>}
  {round.beat==="board"&&round.board&&<div className="mt-4"><Leaderboard rows={round.board.top as BoardRow[]} dark title={round.board.kind==="squad"?"Squads":"Top 5"}/></div>}
 </section>;
}
// The end of a Proof Race: the podium (avatars) and, for the teacher, the share who proved each chunk.
export function RaceFinishHost({state,round}:{state:HostView;round:RaceRound}){
 const f=round.finish;if(!f)return null;
 const portrait=(id:string)=>state.lobby.find(p=>p.id===id)?.avatar?.portrait??null;
 const entries:PodiumEntry[]=f.podium.map(r=>({id:r.id,name:r.name,points:r.points,portrait:f.kind==="player"?portrait(r.id):null}));
 return <section className="mt-6"><Podium entries={entries} dark sound title={f.kind==="squad"?"Top squads":"Top detectives"}/>
  <div className="mt-8 rounded-3xl bg-panel p-5"><h2 className="text-[24px] font-bold">Class stats</h2>
   <p className="mt-1 text-[16px] text-muted">The share who proved each chunk. The 3 hardest: {f.stats.hardest.map(h=>`chunk ${h.index+1} (${h.pct}%)`).join(", ")}.</p>
   <ol className="mt-3 grid gap-1.5 md:grid-cols-2">{f.stats.rows.map(r=><li key={r.index} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[16px]"><span className="tabular-nums">{r.index+1}</span><span className="truncate">{r.question}</span><span className="font-bold tabular-nums">{r.pct}%</span></li>)}</ol></div>
 </section>;
}

// ---------- The phone ----------
export function AvatarPick({state,act}:{state:PlayerView;act:(k:string,p?:Record<string,unknown>)=>void}){
 if(!state.avatars.length)return null;
 return <section className="mt-5" aria-labelledby="av-h"><h2 id="av-h" className="text-[20px] font-bold">Pick your character</h2>
  <ul className="mt-2 grid grid-cols-3 gap-2">{state.avatars.map(a=>{const on=state.avatar?.id===a.id;return <li key={a.id}><button type="button" aria-pressed={on} onClick={()=>act("avatar",{characterId:a.id})} className={`flex w-full flex-col items-center gap-1 rounded-2xl p-2 ${on?"bg-primary text-on-primary":"bg-panel ring-1 ring-edge"}`}><img src={a.portrait} alt="" className="h-16 w-16 rounded-full object-cover"/><span className="text-[13px] font-bold leading-tight">{a.name}</span></button></li>})}</ul>
 </section>;
}
// While waiting: a Words to Know card from the story, changing every few seconds.
export function WordsWhileWaiting({world}:{world:WorldPack|null}){
 const words=world?.glossary??[];const [i,setI]=useState(0);
 useEffect(()=>{if(words.length<2)return;const t=setInterval(()=>setI(x=>(x+1)%words.length),7000);return()=>clearInterval(t)},[words.length]);
 const w=words[i%Math.max(1,words.length)];if(!w)return null;
 return <aside className="mt-5 rounded-3xl bg-violet-soft p-4 text-ink" aria-label="Words to know"><p className="text-[12px] font-bold uppercase tracking-wide">Word to know</p><p className="mt-1 text-[22px] font-bold">{w.term}</p><p className="text-[16px] leading-6">{w.student_friendly_definition}</p></aside>;
}
export function RacePlayer({state,world,act}:{state:PlayerView;world:WorldPack|null;act:(k:string,p?:Record<string,unknown>)=>Promise<string|null>|void}){
 const round=state.round as RaceRound|null,race=state.race;
 const raceLeft=useBeatClock(round?.beatStartedAt??0,round?.beat==="race"&&race?race.limitMs/1000:null);
 const processLeft=useBeatClock(round?.beatStartedAt??0,round?.beat==="process"?round.processSeconds:null);
 const lastTap=race?.mine.taps.at(-1);
 useEffect(()=>{if(lastTap&&lastTap.result!=="near")cue(true,lastTap.points>0?"chime":"reveal",0.3)},[lastTap?.result]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!round||!race||!world)return null;
 const m=race.mine,chunkPts=m.taps.reduce((a,t)=>a+t.points,0);
 return <section className="mt-4" aria-labelledby="rp-h">
  <p className="text-[12px] font-bold uppercase tracking-wide text-highlight">Proof Race · Chunk {round.step+1} of {round.total}{race.extraTime?" · extra time":""}</p>
  {round.beat==="read"&&<><h1 id="rp-h" className="mt-1 text-[26px] font-bold outline-none">Read</h1><p className="text-[15px] text-muted">No timer. Read, then tap Ready.</p>
   <div className="mt-3"><ChunkRead world={world} sceneId={round.chunk.sceneId} passages={round.chunk.passages}/></div>
   {m.ready?<p role="status" className="mt-4 rounded-2xl bg-success-soft px-4 py-3 text-[17px] font-semibold text-success"><Check size={18} className="mr-1 inline"/>Ready. Waiting for the class.</p>
    :<button type="button" onClick={()=>act("race_ready")} className="case-primary mt-4 min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18}/></button>}</>}
  {round.beat==="process"&&<><h1 id="rp-h" className="mt-1 text-[26px] font-bold outline-none">{round.chunk.process==="gist"?"Gist":"Your question"}</h1><ClockBar left={processLeft} seconds={round.processSeconds}/>
   {round.chunk.process==="gist"&&round.chunk.gist?<GistPick options={round.chunk.gist} picked={m.gist} onPick={i=>act("race_gist",{choice:i})}/>:<QuestionAsk sent={m.asked} onSend={async t=>(await act("race_question",{text:t}))??null}/>}
   {m.gist!==null&&<p role="status" className="mt-3 text-[16px] font-semibold text-success">Locked in. Get ready to race.</p>}</>}
  {round.beat==="race"&&<><h1 id="rp-h" className="mt-1 text-[22px] font-bold leading-tight outline-none">{round.question}</h1><ClockBar left={raceLeft} seconds={race.limitMs/1000}/>
   {m.done?<p role="status" className="mt-3 rounded-2xl bg-deep px-4 py-3 text-[17px] font-semibold text-ink">Locked in. Eyes on the board.</p>
    :<>{m.near?<p role="status" className="rise-in mt-2 rounded-card bg-notyet px-4 py-3 text-[16px] font-bold text-on-notyet shadow-[0_5px_0_var(--color-notyet-shadow)]"><span className="font-display text-[20px]">Near miss.</span> {m.near} One more try for 350.</p>:<p className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-highlight"><Hand size={15} aria-hidden/>Tap the line that answers it.</p>}
     <ReadingPanel className="mt-2" glossary={world.glossary} passages={round.chunk.passages as SourcePassage[]} kept={[]} onTap={l=>act("race_tap",{line:l.text})}/></>}</>}
  {round.beat==="reveal"&&<>{m.correct
   ?<div className="mt-8 flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{chunkPts.toLocaleString()}</p>
    <div className="moment-pop w-full rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]"><h1 id="rp-h" className="text-[40px] leading-none outline-none">Proof!<span className="sr-only"> Plus {chunkPts} points.</span></h1><p className="mt-2 text-[16px] font-bold">{lastTap?.result==="retryRight"?"Found on the retry.":"Right line, with a speed bonus."}</p></div></div>
   :<div className="mt-2 rounded-card bg-panel p-5"><h1 id="rp-h" className="text-[32px] leading-none outline-none">Not this time</h1><p className="mt-2 text-[16px] text-muted">Here's the line that proves it.</p></div>}
   {round.reveal&&<div className="mt-3"><ReadingPanel passages={round.chunk.passages as SourcePassage[]} results={[{line:round.reveal.line,ok:true}]} onTap={()=>{}} locked/></div>}</>}
  {round.beat==="board"&&race.place&&<div className="mt-3"><h1 id="rp-h" className="text-center text-[32px] outline-none">Your place</h1>
   <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
    <div className="flex flex-col items-center rounded-[18px] bg-success p-3 text-on-success shadow-[0_5px_0_var(--color-success-shadow)]"><span className="font-display text-[26px] font-bold tabular-nums">+{race.place.gained.toLocaleString()}</span><span className="text-[13px] font-extrabold">this chunk</span></div>
    <div className="flex flex-col items-center rounded-[18px] bg-gold p-3 text-on-gold shadow-[0_5px_0_var(--color-gold-shadow)]"><span className="font-display text-[26px] font-bold">{race.place.move>0?`Up ${race.place.move}`:race.place.move<0?`Down ${-race.place.move}`:`#${race.place.rank}`}</span><span className="text-[13px] font-extrabold">now #{race.place.rank} of {race.place.of}</span></div>
    <div className="flex flex-col items-center rounded-[18px] bg-panel p-3 text-ink shadow-[0_5px_0_#0B0920]"><span className="font-display text-[26px] font-bold tabular-nums">{race.total.toLocaleString()}</span><span className="text-[13px] font-extrabold text-muted">total</span></div>
   </div></div>}
 </section>;
}
export function RaceEndedPlayer({state}:{state:PlayerView}){
 const round=state.round as RaceRound|null;const f=round?.finish;if(!f||!state.race)return null;
 const mine=f.kind==="squad"?null:f.podium.findIndex(r=>r.id===state.me.id);
 return <section className="mt-6 text-center"><h1 className="text-[30px] font-bold outline-none">Race over</h1>
  {state.race.place&&<p className="mt-2 text-[20px]">You finished <b>#{state.race.place.rank}</b> of {state.race.place.of} with {state.race.total.toLocaleString()} points.</p>}
  {mine!==null&&mine>=0&&<p className="mt-2 text-[20px] font-bold text-highlight">You're on the podium!</p>}
  <div className="mt-5"><Podium entries={f.podium.map(r=>({id:r.id,name:r.name,points:r.points,portrait:r.portrait}))}/></div>
  <p className="mt-4 text-[15px] text-muted">Every point came from a line proved in the story.</p></section>;
}
