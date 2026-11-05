"use client";
// Proof Race expeditions, live, and the lobby that every live game shares. The host board drives each chunk's beats on
// its own timers (read, Gist check, Your question on every third chunk, the question, the proof, the leaderboard and a
// countdown); the teacher can pause any screen or skip ahead. Every phone follows the board's timing with its own extra
// time and the same screens as the solo race (app/expedition-race.tsx). The lobby shows names and character avatars
// popping in, with a quiet music loop the host can mute; the game ends on a podium with class stats.
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {ArrowRight,Check,Download,Highlighter,Pin,Printer,Volume2,VolumeX,Zap} from "lucide-react";
import type {hostView,playerView} from "@/lib/live/server";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {type BoardRow} from "@/lib/proof-race";
import {DISCOVERY_COINS,TESTIMONY_MS,chunkTokens,focusTokens,norm,shuffledOrder,type Answer,type RaceChunk,type Token} from "@/lib/expedition";
// Every word of the given lines, as token positions.
const proofTokensOf=(tokens:Token[],lines:{text:string}[],proof:string[])=>{const want=new Set(proof.map(norm)),idx=new Set(lines.map((l,i)=>(want.has(norm(l.text))?i:-1)).filter(i=>i>=0));return tokens.filter(t=>idx.has(t.line)).map(t=>t.i)};
import {ReadingPanel} from "../reading-panel";
import {Leaderboard,Podium,QuestionAsk,cue,useBeatClock,type PodiumEntry} from "../proof-race";
import {CaseNotesView,Refresher} from "../after-race";
import {BONUS_STEMS,squadCaseFilePdf,type SquadCaseFile} from "@/lib/case-notes";
import {focusScreenTop} from "../screen-focus";
import {AnswerBars,ArcBanner,ChunkText,CountdownRing,DiscoveryBurst,KeywordPrompt,QuestionPanel,RaceHud,RankPill,TimerTrack} from "../expedition-race";
import {SplitStage,useStickyOffsets} from "../split-stage";
import {RaceMap} from "../world-map";
import {InterviewHost,InterviewPlayer,interviewBeat} from "./interview-live";

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

// ---------- Starting a Proof Race expedition (host) ----------
export function RacePick({state,act}:{state:HostView;act:(b:Record<string,unknown>)=>void}){
 const exps=state.expeditions;
 const [o,setO]=useState({expeditionId:exps[0]?.id??"",gradeBand:"6-8",questions:true,highlighter:false,autoAdvance:true,squads:false});
 const set=(k:string,v:unknown)=>setO(x=>({...x,[k]:v}));
 const sel="mt-1 w-full rounded-row bg-panel-2 px-3 py-2 text-[16px] text-ink";
 const box=(k:"questions"|"highlighter"|"autoAdvance"|"squads",label:string)=><label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={o[k]} onChange={e=>set(k,e.target.checked)} className="h-5 w-5"/>{label}</label>;
 return <div className="rounded-card bg-deep p-4 md:col-span-3"><p className="flex items-center gap-2 text-[22px] font-bold"><Zap size={22} aria-hidden/> Proof Race expedition</p>
  <p className="mt-1 text-[16px] text-muted">Everyone reads a chunk, checks the gist and answers one question with proof. The board moves on by itself; you can pause or skip ahead.</p>
  <div className="mt-3 grid gap-3 text-[15px] text-muted md:grid-cols-2">
   <label>Expedition<select value={o.expeditionId} onChange={e=>set("expeditionId",e.target.value)} className={sel}>{exps.map(e=><option key={e.id} value={e.id}>{e.title} · {e.chunks} chunks</option>)}</select></label>
   <label>Grade band<select value={o.gradeBand} onChange={e=>set("gradeBand",e.target.value)} className={sel}><option value="6-8">Grades 6 to 8</option><option value="9-10">Grades 9 to 10</option></select></label>
   <span className="flex flex-col">{box("questions","Your question (every third chunk)")}{box("highlighter","Highlighter: mark words students don't know")}</span>
   <span className="flex flex-col">{box("autoAdvance","Move on when 90% are ready")}{state.squads.some(q=>q.members.length)&&box("squads","Squads pool their points")}</span>
  </div>
  <button type="button" disabled={!state.proofRace||!state.counters.players||!o.expeditionId} onClick={()=>act({action:"round.start",type:"race",squads:o.squads,settings:o})} className="host-btn mt-3 w-full">Start<span className="sr-only"> the Proof Race expedition</span></button>
 </div>;
}

// ---------- The host board ----------
const BEAT_LABEL:Record<string,string>={read:"Read",process:"Gist check",ask:"Your question",race:"Question",reveal:"The proof",lightning:"Lightning",board:"Checkpoint",burst:"Squad burst",countdown:"Next chunk"};
const scaleOf=(setting:string|null|undefined)=>setting==="untimed"?3:Number(setting)>0?Number(setting):1;
export function RaceHost({state,round,world,act}:{state:HostView;round:RaceRound;world:WorldPack|null;act:(b:Record<string,unknown>)=>void}){
 const race=state.race!;
 const timed=round.beat!=="read";
 // Timed beats wait for the longest extra time still in use; the automatic screens stretch for the longest extra time in the room.
 const waiting=round.beat==="process"||round.beat==="ask"||round.beat==="race"||round.beat==="lightning"||round.beat==="vote"||round.beat==="liar";
 const maxScale=Math.max(1,...state.lobby.filter(p=>!waiting||!race.done.includes(p.id)).map(p=>scaleOf(p.extraTime)));
 const totalMs=round.beatMs===null?null:round.beatMs*maxScale;
 const left=useBeatClock(round.beatStartedAt,timed&&totalMs!==null&&!state.session.paused?totalMs/1000:null);
 const moved=useRef("");
 const key=`${round.step}:${round.beat}`;
 const everyone=state.counters.players>0&&race.answered>=state.counters.players;
 const due=!state.session.paused&&((round.beat==="read"&&race.ready.advance)||(timed&&left===0)||(waiting&&everyone));
 useEffect(()=>{if(due&&moved.current!==key){moved.current=key;act({action:"race.next"})}},[due,key,act]);
 if(interviewBeat(round.beat)&&round.interview)return <InterviewHost state={state} round={round} world={world} act={act} left={timed&&totalMs!==null?left:null} totalMs={totalMs}/>;
 const next=<button type="button" onClick={()=>act({action:"race.next"})} className="host-btn">{round.beat==="countdown"?(round.step+1>=round.total?(round.interview?"Name the Liar":"Final podium"):"Next chunk"):"Next"} <ArrowRight size={22} aria-hidden/></button>;
 const tokens=chunkTokens(round.chunk.lines);
 const q=round.question;
 const questions=<div className="mt-3"><p className="text-[20px]">Student questions (no names):</p><ul className="mt-2 grid gap-2">{race.questions.slice(0,3).map(x=><li key={x.id} className="flex items-center justify-between gap-3 rounded-card bg-panel px-5 py-3 text-[clamp(18px,1.8vw,26px)]"><span>{x.text}</span><button type="button" onClick={()=>act({action:"race.pin",questionId:race.pinned===x.id?null:x.id})} aria-pressed={race.pinned===x.id} className="host-btn-secondary"><Pin size={18} aria-hidden/>{race.pinned===x.id?"Pinned":"Pin"}</button></li>)}
  {!race.questions.length&&<li className="text-[18px] text-muted">Waiting for questions…</li>}</ul></div>;
 return <section className="mt-4" aria-labelledby="race-h">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="race-h" className="text-[clamp(24px,2.4vw,38px)] font-bold">Chunk {round.step+1} of {round.total} · {BEAT_LABEL[round.beat]}</h2>{next}</div>
  <p className="text-[18px] text-muted">{round.expedition.title} · Grades {round.gradeBand.replace("-"," to ")}</p>
  {timed&&left!==null&&<div className="mt-2"><TimerTrack left={left} seconds={(totalMs??1000)/1000}/></div>}
  {state.session.paused&&<p role="status" className="mt-2 rounded-card bg-gold px-4 py-2 text-[18px] font-bold text-on-gold">Paused. Everyone stays on this screen.</p>}
  {round.beat==="read"&&world&&<><p className="mt-2 text-[clamp(18px,1.6vw,26px)] text-muted" aria-live="polite">{race.ready.ready} of {race.ready.total} ready · no timer while reading</p>
   <div className="mt-3"><ChunkText chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} large/></div></>}
  {round.beat==="process"&&<div className="mt-3"><p className="text-[20px] text-muted">{race.answered} of {state.counters.players} answered</p><p className="mt-2 font-display text-[clamp(26px,2.8vw,44px)] font-bold">Which is the best summary?</p>
   <ol className="mt-3 grid gap-2">{round.chunk.gist.map((g,i)=><li key={i} className="rounded-card bg-panel px-5 py-3 text-[clamp(18px,1.8vw,28px)] font-bold">{g}</li>)}</ol></div>}
  {round.beat==="ask"&&<div className="mt-3"><p className="text-[20px] text-muted">{race.answered} of {state.counters.players} asked · you can move on once most have</p>{questions}</div>}
  {round.pinned&&<p className="mt-3 rounded-card bg-highlight px-5 py-3 text-[clamp(18px,1.8vw,26px)] font-bold text-on-primary"><Pin size={20} className="mr-2 inline" aria-hidden/>For discussion: {round.pinned}</p>}
  {round.beat==="race"&&q&&<div className="mt-3"><ArcBanner kind={round.arc} speaker={q.testimony?.speaker}/><p className="mt-2 text-[14px] font-extrabold uppercase tracking-[.08em] text-highlight">{q.name}</p><p className="font-display text-[clamp(26px,2.8vw,44px)] font-bold leading-tight"><KeywordPrompt prompt={q.prompt} keywords={q.keywords}/></p>
   {q.testimony&&<blockquote className="mt-3 rounded-card bg-violet p-5 text-on-violet"><p className="text-[14px] font-extrabold uppercase tracking-[.08em]">{q.testimony.speaker} testifies</p><p className="mt-1 text-[clamp(20px,2vw,30px)] font-bold">“{q.testimony.text}”</p></blockquote>}
   {(q.choices??q.theories?.map(t=>t.name))&&<ol className="mt-3 grid gap-2 md:grid-cols-3">{(q.choices??q.theories!.map(t=>t.name)).map((c,i)=><li key={i} className="rounded-card bg-panel px-4 py-3 text-[clamp(16px,1.5vw,22px)] font-bold">{c}</li>)}</ol>}
   <p className="mt-2 text-[20px] text-muted">{race.answered} of {state.counters.players} answered{maxScale>1?" · extra time still running for some":""}</p>
   {world&&<div className="mt-3"><ChunkText chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} focus={focusTokens(tokens,q.focus)} large/></div>}</div>}
  {round.beat==="reveal"&&round.reveal&&world&&<div className="mt-3"><p className="text-[clamp(26px,2.8vw,42px)] font-bold">{round.reveal.pct}% found the proof</p><p className="text-[20px] text-muted">{round.reveal.why}</p>
   <div className="mt-3">{q?.callPassages?<ReadingPanel passages={q.callPassages as SourcePassage[]} results={round.reveal.lines.map(l=>({line:l,ok:true}))} onTap={()=>{}} locked/>
    :<ChunkText chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} shown={round.reveal.words.length?round.reveal.words:proofTokensOf(tokens,round.chunk.lines,round.reveal.lines)} large/>}</div>
   {q?.type&&round.step%3===2&&race.questions.length>0&&questions}</div>}
  {round.beat==="lightning"&&round.lightning&&world&&<div className="mt-3"><p className="inline-flex items-center gap-2 text-[16px] font-extrabold uppercase tracking-[.08em] text-highlight"><Zap size={18} aria-hidden/>Lightning · recall chunk {round.lightning.chunk}</p>
   <p className="font-display text-[clamp(26px,2.8vw,44px)] font-bold leading-tight">{round.lightning.question}</p><p className="mt-2 text-[20px] text-muted">{race.answered} of {state.counters.players} answered</p>
   <div className="mt-3"><ChunkText chunk={{lines:round.lightning.lines,discovery:round.lightning.discovery??round.chunk.discovery}} world={world} tokens={chunkTokens(round.lightning.lines)} large/></div></div>}
  {round.beat==="burst"&&<div className="mt-3"><p className="font-display text-[clamp(26px,2.8vw,44px)] font-bold">Squad burst: find the hidden discoveries</p>
   <p className="text-[20px] text-muted">Every phone hunts level 1's chunks for the figurative phrase or rich word hidden in each. A find counts once per squad.</p>
   <p className="mt-3 font-display text-[clamp(30px,3vw,48px)] font-bold text-gold">{race.burst?.total??0} found</p>
   {(race.burst?.squads.length??0)>0&&<ol className="mt-2 grid gap-2 md:grid-cols-3">{race.burst!.squads.map(x=><li key={x.name} className="rounded-card bg-panel px-5 py-3 text-[22px] font-bold">{x.name}: {x.found}</li>)}</ol>}</div>}
  {round.beat==="board"&&<p className="mt-3 font-display text-[clamp(24px,2.4vw,36px)] font-bold text-gold">Level 1 complete. Next: the squad burst, then level 2{round.total>1?" and the boss question":""}.</p>}
  {(round.beat==="board"||round.beat==="countdown")&&(round.board||round.beat==="countdown")&&<div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">{round.beat==="countdown"&&world?.world_map?<RaceMap world={world} expeditionId={round.expedition.id} stars={Array.from({length:round.step+1},()=>-1)} className="h-[min(62vh,640px)] min-h-[320px]" label="The class map: every investigator walks to the next stop"
    tokens={state.lobby.map(p=>({id:p.id,name:p.nickname,portrait:p.avatar?.portrait??null,glow:(race.proved??[]).includes(p.id)}))}/>:round.board?<Leaderboard rows={round.board.top as BoardRow[]} dark title={round.board.kind==="squad"?"Squads":"Top 5"}/>:<span/>}
   {round.beat==="countdown"&&left!==null&&totalMs!==null&&<CountdownRing ms={left*1000} total={totalMs} label={round.step+1>=round.total?"Final results":`Chunk ${round.step+2} of ${round.total}`}/>}</div>}
 </section>;
}

export function RaceFinishHost({state,round,act}:{state:HostView;round:RaceRound;act?:(b:Record<string,unknown>)=>void}){
 const f=round.finish;if(!f)return null;
 const portrait=(id:string)=>state.lobby.find(p=>p.id===id)?.avatar?.portrait??null;
 const entries:PodiumEntry[]=f.podium.map(r=>({id:r.id,name:r.name,points:r.points,portrait:f.kind==="player"?portrait(r.id):null}));
 return <section className="mt-6"><Podium entries={entries} dark sound title={f.kind==="squad"?"Top squads":"Top detectives"}/>
  <div className="mt-8 rounded-3xl bg-panel p-5"><h2 className="text-[24px] font-bold">Class stats</h2>
   <p className="mt-1 text-[16px] text-muted">The share who proved each chunk. The 3 hardest: {f.stats.hardest.map(h=>`chunk ${h.index+1} (${h.pct}%)`).join(", ")}.</p>
   {act&&<button type="button" onClick={()=>act({action:"bonus.start"})} className="host-btn mt-2">Start the Bonus Round <ArrowRight size={22} aria-hidden/></button>}
   <ol className="mt-3 grid gap-1.5 md:grid-cols-2">{f.stats.rows.map(r=><li key={r.index} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[16px]"><span className="tabular-nums">{r.index+1}</span><span className="truncate">{r.type}: {r.question}</span><span className="font-bold tabular-nums">{r.pct}%</span></li>)}</ol></div>
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
 const [sound,setSound]=useState(true),[coins,setCoins]=useState(0),[found,setFound]=useState<string|null>(null);
 const [draft,setDraft]=useState<Answer>({}),[step,setStep]=useState<1|2>(1),[marking,setMarking]=useState(false),[unknown,setUnknown]=useState<Set<number>>(new Set());
 const key=`${round?.step}:${round?.beat}`;
 useEffect(()=>{setDraft({});setStep(1)},[round?.step]);
 const scale=race?.scale??1;
 useStickyOffsets();
 const myMs=round?.beatMs!=null?round.beatMs*scale:null;
 const left=useBeatClock(round?.beatStartedAt??0,round&&round.beat!=="read"&&myMs!==null&&!round.paused?myMs/1000:null);
 // Catch the Lie: the testimony plays first; the clock (and the proof step) start after it.
 const testifying=round?.beat==="race"&&round.question?.type==="catch_lie"&&Date.now()-Date.parse(round.beatStartedAt)<TESTIMONY_MS;
 const [,tick]=useState(0);useEffect(()=>{if(!testifying)return;const t=setTimeout(()=>tick(x=>x+1),TESTIMONY_MS);return()=>clearTimeout(t)},[testifying,key]);
 const mine=race?.mine;
 useEffect(()=>{if(round?.beat==="reveal"&&mine?.tap)cue(sound,mine.tap.correct?"chime":"reveal",0.3)},[round?.beat,round?.step]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!round||!race||!world||!mine)return null;
 const tokens=chunkTokens(round.chunk.lines);
 // This student's own version of the question (easier or harder), else the standard one.
 const q=race.myQuestion??round.question;
 if(interviewBeat(round.beat)&&round.interview)return <>{(round.beat==="liar"||round.beat==="verdict")&&<RaceHud score={race.total} streak={race.streak} coins={coins} sound={sound} onSound={()=>setSound(s=>!s)} chunk={round.total} total={round.total} left={null} title={round.expedition.title}/>}<InterviewPlayer state={state} world={world} act={act} left={round.beat==="vote"||round.beat==="liar"?left:null} myMs={myMs}/></>;
 const hud=<RaceHud score={race.total} streak={race.streak} coins={coins} sound={sound} onSound={()=>setSound(s=>!s)} chunk={round.step+1} total={round.total} left={round.beat==="read"?null:left} title={round.expedition.title}/>;
 // The proof as token positions: its words, or every word of its lines.
 const shownTokens=round.reveal?.words.length?round.reveal.words:proofTokensOf(tokens,round.chunk.lines,round.reveal?.lines??[]);
 return <section className="wide-host mt-3 flex flex-col gap-3" aria-labelledby="rp-h">
  {hud}
  {race.extraTime&&<p className="text-[13px] font-bold text-muted">Extra time is on for you.</p>}
  {round.paused&&<p role="status" className="rounded-card bg-gold px-4 py-2 text-[16px] font-bold text-on-gold">Paused by your teacher.</p>}
  {round.beat==="read"&&<><h1 id="rp-h" className="text-[28px] outline-none">Read the chunk</h1>
   {round.highlighter&&!mine.ready&&<button type="button" aria-pressed={marking} onClick={()=>setMarking(m=>!m)} className={`inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-4 text-[15px] font-bold ${marking?"bg-gold text-on-gold":"bg-panel text-ink"}`}><Highlighter size={16} aria-hidden/>{marking?"Done marking":"Mark words I don't know"}</button>}
   <ChunkText explore chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} highlighter={round.highlighter} marking={marking} unknown={unknown} onUnknown={i=>setUnknown(s=>{const n=new Set(s);if(n.has(i))n.delete(i);else n.add(i);return n})} onDiscover={()=>{if(found!==round.chunk.id){setFound(round.chunk.id);setCoins(c=>c+DISCOVERY_COINS);cue(sound,"chime",0.3)}}} found={found===round.chunk.id}/>
   {mine.ready?<p role="status" className="rounded-card bg-success px-4 py-3 text-[17px] font-bold text-on-success"><Check size={18} className="mr-1 inline" aria-hidden/>Ready. Waiting for the class.</p>
    :<button type="button" onClick={async()=>{if(unknown.size)await act("race_unknown",{words:[...unknown].map(i=>tokens[i]?.text)});setMarking(false);act("race_ready")}} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18} aria-hidden/></button>}</>}
  {round.beat==="process"&&<SplitStage label="Gist check" passage={<ChunkText chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens}/>}
   head={<><TimerTrack left={left} seconds={(myMs??20000)/1000}/><p className="mt-2 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Gist check</p><h1 id="rp-h" className="text-[28px] outline-none">Which is the best summary?</h1></>}
   body={<><AnswerBars seed={`${state.me.id}|${round.chunk.id}|gist`} label="Which is the best summary?" options={round.chunk.gist.map(t=>({text:t}))} picked={mine.gist} disabled={mine.gist!==null} onPick={i=>act("race_gist",{choice:i})}/>
   {mine.gist!==null&&<p role="status" className="mt-2 text-[16px] font-bold text-muted">Locked in. The question is next.</p>}</>}/>}
  {round.beat==="ask"&&<><TimerTrack left={left} seconds={(myMs??60000)/1000}/><h1 id="rp-h" className="text-[28px] outline-none">Your question</h1><QuestionAsk sent={mine.asked} onSend={async t=>(await act("race_question",{text:t}))??null}/></>}
  {round.beat==="race"&&q&&<>{mine.done&&!testifying&&<TimerTrack left={left} seconds={(myMs??45000)/1000}/>}
   {mine.done?<><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{q.name}</p><h1 id="rp-h" className="text-[24px] leading-tight outline-none"><KeywordPrompt prompt={q.prompt} keywords={q.keywords}/></h1><p role="status" className="rounded-card bg-panel px-4 py-3 text-[17px] font-bold">Locked in. While the class finishes:</p>
    {/* No dead time: a bonus on the same chunk while others answer. */}
    {found!==round.chunk.id?<><p className="text-[16px] font-bold">Bonus: find this chunk's hidden discovery (a figurative phrase or rich word) for {DISCOVERY_COINS} coins.</p>
      <ChunkText explore chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} onDiscover={()=>{if(found!==round.chunk.id){setFound(round.chunk.id);setCoins(c=>c+DISCOVERY_COINS);cue(sound,"chime",0.3)}}} found={false}/></>
     :<p className="rounded-card bg-violet-soft px-4 py-3 text-[16px] font-bold">You found this chunk's discovery: "{round.chunk.discovery.phrase}". {round.chunk.discovery.note}</p>}</>
    :<QuestionPanel banner={<ArcBanner kind={round.arc} speaker={q.testimony?.speaker}/>} seed={`${state.me.id}|${round.chunk.id}`} timer={!testifying?<TimerTrack left={left} seconds={(myMs??45000)/1000}/>:null} headingId="rp-h" vq={q} passages={round.chunk.passages} chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} glossary={world.glossary} testifying={!!testifying} draft={draft} setDraft={setDraft} step={step} setStep={setStep} onLock={a=>act("race_tap",{answer:a})}/>}</>}
  {round.beat==="reveal"&&<div aria-live="assertive">{mine.tap?.correct
   ?<div className="mt-6 flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{mine.tap.points.toLocaleString()}</p>
    <div className="moment-pop w-full rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{q?.name}{(mine.tap.mult??1)>1?" · Double points":""}</p><h1 id="rp-h" className="mt-1 text-[40px] leading-none outline-none">Proof!<span className="sr-only"> Plus {mine.tap.points} points.</span></h1><p className="mt-2 text-[16px] font-bold">{round.reveal?.why}</p></div>
    {(mine.tap.bonus??0)>0&&<p role="status" className="moment-pop rounded-full bg-gold px-4 py-1.5 font-display text-[17px] font-bold text-on-gold">Streak bonus! +{mine.tap.bonus}</p>}</div>
   :<div className="notyet-shake rounded-[24px] bg-notyet p-5 text-on-notyet shadow-[0_8px_0_var(--color-notyet-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{q?.name}{mine.tap?.late||!mine.tap?" · Time's up":""}</p><h1 id="rp-h" className="mt-1 text-[36px] leading-none outline-none">Not yet.</h1><p className="mt-2 text-[17px] font-bold">You'll get another shot in the Refresher.</p></div>}
   <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[13px] font-bold text-muted">{race.place&&<RankPill move={race.place.move} rank={race.place.rank} of={race.place.of}/>}{round.reveal?.pct??0}% of the class found it.</p>
   <div className="mt-1">{q?.callPassages?<ReadingPanel passages={q.callPassages as SourcePassage[]} results={(round.reveal?.lines??[]).map(l=>({line:l,ok:true}))} onTap={()=>{}} locked/>
    :<ChunkText chunk={{lines:round.chunk.lines,discovery:round.chunk.discovery}} world={world} tokens={tokens} shown={shownTokens} shownStyle={mine.tap?.correct?"right":"missed"}/>}</div></div>}
  {round.beat==="lightning"&&round.lightning&&<LightningLive l={round.lightning} world={world} answered={mine.lightning} answer={race.lightningAnswer} left={left} seconds={(myMs??10000)/1000} onLock={line=>act("race_lightning",{line})}/>}
  {round.beat==="burst"&&round.burst&&<DiscoveryBurst key={round.step} chunks={round.burst.chunks.map(c=>({index:c.index,lines:c.lines,chunk:{discovery:c.discovery}}) as unknown as RaceChunk)} world={world} sound={sound} squad={round.squadsOn&&race.squadId?{name:"Your squad",found:race.burstFound.length}:null} onFind={i=>{act("race_burst",{chunk:i})}}/>}
  {(round.beat==="board"||round.beat==="countdown")&&race.place&&<><p role="status" className="sr-only">{mine.correct?`Plus ${mine.points} points.`:"No points this time."} You're number {race.place.rank} of {race.place.of}.</p>
   <h1 id="rp-h" className="text-center text-[30px] outline-none">{round.beat==="board"?"Checkpoint: Level 1 complete":"Next chunk"}</h1>
   {round.beat==="board"&&<div className="grid grid-cols-3 gap-2.5 text-center">
    <div className="rounded-[18px] bg-success p-3 text-on-success shadow-[0_5px_0_var(--color-success-shadow)]"><p className="font-display text-[24px] font-bold tabular-nums">+{race.place.gained.toLocaleString()}</p><p className="text-[13px] font-extrabold">this chunk</p></div>
    <div className="rounded-[18px] bg-gold p-3 text-on-gold shadow-[0_5px_0_var(--color-gold-shadow)]"><p className="font-display text-[24px] font-bold">{race.place.move>0?`Up ${race.place.move}`:race.place.move<0?`Down ${-race.place.move}`:`#${race.place.rank}`}</p><p className="text-[13px] font-extrabold">now #{race.place.rank} of {race.place.of}</p></div>
    <div className="rounded-[18px] bg-panel p-3 text-ink shadow-[0_5px_0_#0B0920]"><p className="font-display text-[24px] font-bold tabular-nums">{round.reveal?.pct??0}%</p><p className="text-[13px] font-extrabold text-muted">found it</p></div>
   </div>}
   {round.beat==="board"&&round.board?<Leaderboard rows={round.board.top as BoardRow[]} meId={round.board.kind==="squad"?race.squadId:state.me.id} own={race.place.row as BoardRow|undefined} title="Top 5"/>
    :<>{world.world_map&&race.path&&<div className="mt-3"><RaceMap world={world} expeditionId={round.expedition.id} stars={race.path} tokens={[{id:state.me.id,name:state.me.nickname,portrait:(state as {avatar?:{portrait?:string}|null}).avatar?.portrait??null,me:true}]} label="Map: your token walks to the next stop"/></div>}{left!==null&&myMs!==null&&<div className="mt-4"><CountdownRing ms={left*1000} total={myMs} label={round.step+1>=round.total?"Final results":`Chunk ${round.step+2} of ${round.total}`}/></div>}</>}</>}
 </section>;
}
// A live lightning beat: tap the sentence that answers; the server checks it, and the answer shows once you've answered.
function LightningLive({l,world,answered,answer,left,seconds,onLock}:{l:{question:string;chunk:number;lines:RaceChunk["lines"];discovery:RaceChunk["chunk"]["discovery"]|null};world:WorldPack;answered:{correct:boolean;points:number}|null;answer:string[]|null;left:number|null;seconds:number;onLock:(line:string)=>void}){
 const [pick,setPick]=useState<string|null>(null),tokens=chunkTokens(l.lines),key=(t:string)=>t.replace(/\s+/g," ").trim();
 const at=answer?l.lines.findIndex(x=>answer.some(a=>key(a)===key(x.text))):-1,shown=at>=0?tokens.filter(t=>t.line===at).map(t=>t.i):[];
 return <SplitStage label="Lightning beat" passage={<ChunkText chunk={{lines:l.lines,discovery:l.discovery??{phrase:"",note:""}}} world={world} tokens={tokens} pick={answered?undefined:{selected:pick,onPick:setPick}} shown={shown} shownStyle={answered?.correct?"right":"missed"}/>}
  head={<><TimerTrack left={answered?null:left} seconds={seconds}/><p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight"><Zap size={14} aria-hidden/>Lightning · from chunk {l.chunk}</p><h1 id="rp-h" className="text-[24px] leading-tight outline-none">{l.question}</h1></>}
  body={answered?<p role="status" className={`rounded-card px-4 py-3 font-display text-[22px] font-bold ${answered.correct?"bg-success text-on-success":"bg-panel text-ink"}`}>{answered.correct?`Lightning fast! +${answered.points}`:"Here's the sentence. Eyes on the board."}</p>:<p className="text-[15px] font-bold text-muted">Tap the sentence that answers it.</p>}
  action={answered?undefined:<button type="button" disabled={!pick} onClick={()=>pick&&onLock(pick)} className="case-primary w-full justify-center">Lock in <ArrowRight size={18} aria-hidden/></button>}/>;
}
// After the race, on each phone: the podium, then the Refresher (checked on the server), then Case Notes.
export function RaceEndedPlayer({state,world,act}:{state:PlayerView;world:WorldPack|null;act:(k:string,p?:Record<string,unknown>)=>Promise<string|null>|void}){
 const round=state.round as RaceRound|null;const f=round?.finish;
 const [stage,setStage]=useState<"podium"|"refresher"|"notes">("podium");
 if(!f||!state.race||!world)return null;
 const after=state.after;
 const mine=f.kind==="squad"?null:f.podium.findIndex(r=>r.id===state.me.id);
 if(stage==="refresher"&&after)return <Refresher seed={state.me.id} items={after.refresher} world={world} check={async(k,a)=>{await act("race_refresh",{k,answer:a})}} onDone={()=>setStage("notes")}/>;
 if(stage==="notes"&&after)return <CaseNotesView interview={after.interview} notes={after.notes} student={state.me.nickname} story={world.title} expedition={round.expedition.title} award={after.award} onNote={(i,t)=>act("race_note",{index:i,text:t})}
  bonus={<p className="no-print rounded-card bg-violet-soft p-4 text-[16px] font-bold">Bonus Round: when your teacher starts it, your squad compares Case Notes and agrees on the best proof.</p>}/>;
 return <section className="mt-6 text-center"><h1 className="text-[30px] font-bold outline-none">Race over</h1>
  {state.race.place&&<p className="mt-2 text-[20px]">You finished <b>#{state.race.place.rank}</b> of {state.race.place.of} with {state.race.total.toLocaleString()} points.</p>}
  {mine!==null&&mine>=0&&<p className="mt-2 text-[20px] font-bold text-highlight">You're on the podium!</p>}
  <div className="mt-5"><Podium entries={f.podium.map(r=>({id:r.id,name:r.name,points:r.points,portrait:r.portrait}))}/></div>
  <p className="mt-4 text-[15px] text-muted">Every point came from a line proved in the story.</p>
  {after&&<button type="button" onClick={()=>setStage(after.refresher.length?"refresher":"refresher")} className="case-primary mt-5 w-full justify-center">{after.refresher.length?`Refresher: fix ${after.refresher.length}`:"Refresher"} <ArrowRight size={18} aria-hidden/></button>}</section>;
}

// ---------- The Bonus Round ----------
type BonusView=NonNullable<PlayerView["bonus"]>;
// A phone in the Bonus Round: the squad's flagged questions side by side; pick a teammate's answer, defend it with a
// sentence stem; the Reporter hands in the Squad Case File.
export function BonusPlayer({state,world,act}:{state:PlayerView;world:WorldPack|null;act:(k:string,p?:Record<string,unknown>)=>Promise<string|null>|void}){
 const b=state.bonus as BonusView|null;
 const [open,setOpen]=useState<number|null>(null),[from,setFrom]=useState<string>(""),[stem,setStem]=useState<string>(BONUS_STEMS[0]),[reason,setReason]=useState(""),[error,setError]=useState("");
 useLayoutEffect(()=>{focusScreenTop()},[b?.status,b?.submitted]);
 if(!b||!world)return <section className="mt-5"><h1 className="text-[26px] outline-none">Bonus Round</h1><p className="mt-2 text-[17px] text-muted">Your teacher is putting squads together.</p></section>;
 const role=b.roles[state.me.id];
 if(b.status==="reveal"||b.submitted)return <section aria-labelledby="sq-h" className="mt-4 flex flex-col gap-3"><SquadFileCard file={b.file} story={world.title} expedition={(state.round as {raceIndex?:number}|null)?"Proof Race":""} headingId="sq-h"/></section>;
 async function pick(){const e=await act("bonus_pick",{index:open,from,stem,reason});if(e){setError(e);return}setError("");setOpen(null);setReason("")}
 return <section aria-labelledby="bn-h" className="mt-4 flex flex-col gap-3">
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Bonus Round · {b.name}</p>
  <h1 id="bn-h" className="text-[28px] leading-tight outline-none">Agree on the strongest proof</h1>
  <p className="rounded-card bg-panel-2 px-4 py-3 text-[16px] font-bold">Your role: {role}{role==="Reporter"||!Object.values(b.roles).includes("Reporter")?". You can hand in the Squad Case File.":role==="Skeptic"?". Ask: does the text really say that?":role==="Evidence Keeper"?". Check every proof against the passage.":". Keep the squad moving."}</p>
  <ul className="flex flex-wrap gap-2 text-[14px]">{b.members.map(m=><li key={m.id} className="rounded-full bg-panel px-3 py-1 font-bold">{m.nickname}: {b.roles[m.id]}</li>)}</ul>
  <ol className="flex flex-col gap-3">{b.flagged.map(q=>{const p=b.picks.find(x=>x.index===q.index),answers=shuffledOrder(q.answers.length,`${state.me.id}|bonus|${q.index}`).map(i=>q.answers[i]);return <li key={q.index} className="rounded-card bg-panel p-4">
   <p className="font-display text-[18px] font-bold">{q.chunk?`Chunk ${q.chunk} · ${q.type}`:`${q.type}: compare who you named, and why`}</p><p className="mt-1 text-[16px]">{q.question}</p>
   <ul className="mt-2 grid gap-2">{answers.map(a=><li key={a.id} className="rounded-row bg-panel-2 px-3 py-2 text-[15px]"><b>{a.nickname}:</b> {a.answer}{a.proof?<> · <span className="font-serif">{a.proof}</span></>:null}</li>)}</ul>
   {p?<p className="mt-2 rounded-row bg-success px-3 py-2 text-[15px] font-bold text-on-success"><Check size={16} className="mr-1 inline" aria-hidden/>Agreed: {b.members.find(m=>m.id===p.from)?.nickname}'s answer, defended by {p.defenderName}: {p.stem} {p.reason}</p>:null}
   {open===q.index?<div className="mt-3 flex flex-col gap-2 rounded-row bg-panel-2 p-3">
    <fieldset><legend className="text-[14px] font-extrabold">Use whose answer?</legend><div className="mt-1 flex flex-wrap gap-2">{answers.filter(a=>a.raw).map(a=><button key={a.id} type="button" aria-pressed={from===a.id} onClick={()=>setFrom(a.id)} className={`min-h-11 rounded-full px-4 text-[15px] font-bold ${from===a.id?"bg-primary text-on-primary":"bg-panel text-ink"}`}>{a.nickname}</button>)}</div></fieldset>
    <label className="text-[14px] font-extrabold">Sentence stem<select value={stem} onChange={e=>setStem(e.target.value)} className="mt-1 w-full rounded-row border-2 border-edge bg-panel px-3 py-2 text-[15px]">{BONUS_STEMS.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-[14px] font-extrabold">Finish it<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2} maxLength={200} className="mt-1 w-full rounded-row border-2 border-edge bg-panel px-3 py-2 text-[15px]"/></label>
    {error&&<p role="alert" className="text-[15px] font-bold text-notyet">{error}</p>}
    <button type="button" disabled={!from||reason.trim().length<3} onClick={pick} className="case-primary w-full justify-center">I'll defend this</button></div>
   :<button type="button" onClick={()=>{setOpen(q.index);setFrom(p?.from??"");setError("")}} className="case-secondary mt-3 !min-h-11">{p?"Change it":"Pick and defend"}</button>}
  </li>})}</ol>
  {b.problems.length>0&&<ul className="rounded-card bg-panel-2 p-4 text-[15px]">{b.problems.map(x=><li key={x}>• {x}</li>)}</ul>}
  {/* The Reporter hands it in; a squad without a Reporter (three or fewer) lets anyone. */}
  {(role==="Reporter"||!Object.values(b.roles).includes("Reporter"))&&<button type="button" disabled={b.problems.length>0} onClick={async()=>{const e=await act("bonus_submit");if(e)setError(e)}} className="case-primary w-full justify-center">Hand in the Squad Case File</button>}
 </section>;
}
// A Squad Case File: agreed answers, proof, the final call and who contributed what; print or save as a PDF.
export function SquadFileCard({file,story,expedition,headingId,dark=false}:{file:SquadCaseFile;story:string;expedition:string;headingId?:string;dark?:boolean}){
 return <div className={`case-notes rounded-card ${dark?"bg-panel":"bg-panel"} p-4`}>
  <div className="flex flex-wrap items-center justify-between gap-2"><h2 id={headingId} tabIndex={headingId?-1:undefined} className="text-[24px] outline-none">Squad Case File: {file.squad}</h2><span className="rounded-full bg-gold px-3 py-1 font-display text-[16px] font-bold text-on-gold">+{file.points} bonus</span></div>
  <ul className="mt-2 text-[15px]">{file.members.map(m=><li key={m.name}><b>{m.name}</b>, {m.role}: defended {m.defended.map(d=>d?`chunk ${d}`:"Name the Liar").join(", ")||"nothing yet"}</li>)}</ul>
  <ol className="mt-3 grid gap-2">{file.items.map(i=><li key={i.chunk} className="rounded-row bg-panel-2 px-3 py-2 text-[15px]"><p className="font-bold">{i.chunk?`Chunk ${i.chunk}`:"Name the Liar"}: {i.question}</p><p>Agreed: {i.agreed}{i.proof?<> · <span className="font-serif">{i.proof}</span></>:null} <span className={`ml-1 rounded-full px-2 py-0.5 text-[12px] font-extrabold ${i.right?"bg-success text-on-success":"bg-notyet text-on-notyet"}`}>{i.right?"Holds up":"Doesn't hold up"}</span></p><p className="text-muted">From {i.from}'s notes; defended by {i.defender}: {i.why}</p></li>)}</ol>
  <p className="mt-3 font-display text-[18px] font-bold">{file.items.some(i=>i.chunk===0)?`The verdict: ${file.finalCall??"not agreed"}`:`The final call: ${file.finalCall??"not made"}`}</p>
  <div className="no-print mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>window.print()} className="case-secondary !min-h-11"><Printer size={18} aria-hidden/>Print</button><button type="button" onClick={()=>squadCaseFilePdf(story,expedition,file).save(`squad-case-file-${file.squad.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.pdf`)} className="case-secondary !min-h-11"><Download size={18} aria-hidden/>Download PDF</button></div>
 </div>;
}
// The host board in the Bonus Round: every squad's progress; then the squad board (bonus points only) and the files.
export function BonusHost({state,world,act}:{state:HostView;world:WorldPack|null;act:(b:Record<string,unknown>)=>void}){
 const b=state.bonus;if(!b)return null;
 const live=state.session.status==="round";
 return <section className="mt-4" aria-labelledby="bh-h">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="bh-h" className="text-[clamp(24px,2.4vw,38px)] font-bold">Bonus Round</h2>{live&&<button type="button" onClick={()=>act({action:"bonus.end"})} className="host-btn">End the Bonus Round</button>}</div>
  <p className="text-[clamp(18px,1.6vw,24px)] text-muted">Squads start by comparing who they named as the liar and why, then agree on the strongest proof. Every member defends at least one choice.</p>
  {live?<ul className="mt-4 grid gap-3 md:grid-cols-3">{b.squads.map(q=><li key={q.squadId} className="rounded-card bg-panel p-5"><p className="font-display text-[24px] font-bold">{q.name}</p><p className="mt-1 text-[18px]">{q.agreed} of {q.flagged} agreed</p><p className="text-[16px] text-muted">{q.submitted?"Handed in":q.left?"Still working":"Ready to hand in"}</p></li>)}</ul>
   :<><div className="mt-4"><Leaderboard rows={b.board.map((x,i,all)=>({id:x.name,name:x.name,points:x.points,gained:x.points,rank:all.findIndex(y=>y.points===x.points)+1,prevRank:null,move:0}))} dark title="Squad bonus board"/></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">{b.squads.map(q=><SquadFileCard key={q.squadId} file={q.file} story={world?.title??""} expedition="Proof Race" dark/>)}</div></>}
 </section>;
}
