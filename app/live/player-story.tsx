"use client";
// Story Mode on a player's phone during a live round: only the controls (the passage, confrontation and testimony are
// on the board). Read: keep up to 3 lines. Round 2: pick a move, then back it up. Round 3: tap the line that disproves
// the testimony, then say why. Round 4: pick a theory and pin 2 pouch lines. Between rounds: your points and your rank.
import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,BookOpen,Trophy} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {tryLine} from "@/lib/lies";

import {ReadingPanel} from "../reading-panel";
import {REACTION_MAX,REACTION_STEMS,displayLine,paragraphLabel,type ReactionStem} from "@/lib/clue-game";
import {JOB_TEXT} from "@/lib/live/story";
import {screenMessage} from "@/lib/safety";

const STEP_NAMES=["Read and notice","Something happens to you","Catch the lie","Make your call"];
type Rec={round:number;points:number;detail:string;streak:number;multiplier:number;grace?:boolean;note?:string}|null;
type StoryView={reading?:{myJob:import("@/lib/clue-game").SquadJob|null;myChunk:string[];members:{id:string;name:string;me:boolean;job:import("@/lib/clue-game").SquadJob|null;part:string[];status:"ready"|"answering"|"absent"}[];pins:{line:string;by:string;mine:boolean}[];reactions:{line:string;by:string;stem:string;body:string}[];votes:{line:string;votes:number;reactions:number}[];myVote:string|null;winner:string|null;everyoneVoted:boolean}|null;answered:boolean;last:Rec;total:number;pouch:string[];board:{top:{rank:number;name:string;score:number;me:boolean}[];me:{rank:number;score:number;movement:number}|null;players:number};boardKind:"individual"|"squad"};
type StoryRound={type:"story";step:number;kind?:string;showing:"round"|"board";stepStartedAt:string;seconds:number;read:{prompt:string;focus:string;chunks:{id:string;text:string}[]}|null;confront:{actions:{id:string;label:string}[];chunks:string[]}|null;lie:{evidence:string[];clueId:string}|null;call:{question:string;theories:{id:string;name:string;description:string}[]}|null};
const key=(t:string)=>t.replace(/\s+/g," ").trim();

export function PlayerStory({round,story,act,world,passages,sceneId}:{round:StoryRound;story:StoryView;act:(k:string,p?:Record<string,unknown>)=>void;world:WorldPack|null;passages:SourcePassage[];sceneId:string}){
 const [left,setLeft]=useState(round.seconds);
 useEffect(()=>{const tick=()=>setLeft(Math.max(0,Math.ceil(round.seconds-(Date.now()-new Date(round.stepStartedAt).getTime())/1000)));tick();const t=setInterval(tick,1000);return()=>clearInterval(t)},[round.stepStartedAt,round.seconds]);
 const head=<p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Story Mode · Round {round.step+1} of 4 · {STEP_NAMES[round.step]}</p>;
 if(round.showing==="board"){
  const me=story.board.me;
  return <section className="mt-5">{head}<h1 className="mt-1 text-[30px] font-bold tabular-nums">{story.last?`+${story.last.points}`:"No answer this round"}</h1>{story.last&&<p className="mt-1 text-[16px]">{story.last.detail}{story.last.multiplier>1?` · streak x${story.last.multiplier}`:""}{story.last.grace?" · half points after time":""}</p>}{story.last?.note&&<p className="mt-2 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{story.last.note}</p>}
   <p className="mt-4 flex items-center gap-2 rounded-2xl bg-[#2A2620] px-4 py-3 text-[18px] text-white"><Trophy size={18}/>{story.total} points{me?` · ${story.boardKind==="squad"?"your squad is ":"you're "}#${me.rank} of ${story.board.players}`:""}{me&&me.movement>0?` · up ${me.movement}`:""}</p>
   <p className="mt-3 text-[16px] text-[#6B6457]">Eyes on the board for the top 5.</p></section>;
 }
 if(story.answered)return <section className="mt-5">{head}<h1 className="mt-1 text-[26px] font-bold">Locked in.</h1><p className="mt-2 text-[17px]">Eyes on the board. Your points show at the leaderboard.</p></section>;
 const timer=<p className={`mt-2 text-[15px] font-semibold tabular-nums ${left===0?"text-[#A33B20]":"text-[#4A4438]"}`} aria-live={left===30||left===10||left===5?"polite":"off"}>{left>0?`${left} seconds left`:"Time! You can still add proof for half points"}</p>;
 if(round.kind==="read"&&round.read)return <ReadControls head={head} timer={timer} chunks={round.read.chunks} prompt={round.read.prompt} focus={round.read.focus} reading={story.reading??null} act={act} onSend={pouch=>act("story",{input:{kind:"read",pouch}})}/>;
 const together={reading:story.reading??null,act};
 if(round.kind==="confront"&&round.confront)return <ConfrontControls {...together} head={head} timer={timer} actions={round.confront.actions} chunks={passages.filter(p=>round.confront!.chunks.includes(p.id))} pouch={story.pouch} onSend={(actionId,proof)=>act("story",{input:{kind:"confront",actionId,proof}})}/>;
 if(round.kind==="lie"&&round.lie)return <LieControls {...together} head={head} timer={timer} world={world} sceneId={sceneId} evidence={passages.filter(p=>round.lie!.evidence.includes(p.id))} onSend={(line,explanation)=>act("story",{input:{kind:"lie",line,explanation}})}/>;
 if(round.kind==="call"&&round.call)return <CallControls {...together} head={head} timer={timer} call={round.call} pouch={story.pouch} onSend={(theoryId,pins)=>act("story",{input:{kind:"call",theoryId,pins}})}/>;
 return null;
}

function PouchView({pouch,picked,onPick,compact=false}:{pouch:string[];picked?:string[];onPick?:(t:string)=>void;compact?:boolean}){
 if(compact)return <div className="mt-2 shrink-0 rounded-2xl border-2 border-dashed border-[#C9B9A0] bg-[#FBF7EE] px-3 py-1.5" aria-live="polite"><p className="flex items-center gap-2 text-[13px] font-bold"><BookOpen size={15} className="text-[#A0472C]"/>Evidence pouch · {pouch.length} of 3</p>{pouch.map(t=><p key={t} className="line-clamp-1 font-serif text-[13px] text-[#4A4438]">“{key(t)}”</p>)}</div>;
 return <div className="mt-3 rounded-2xl border-2 border-dashed border-[#C9B9A0] bg-[#FBF7EE] p-3"><p className="flex items-center gap-2 text-[14px] font-bold"><BookOpen size={16} className="text-[#A0472C]"/>Evidence pouch · {pouch.length} of 3</p>
  {!pouch.length&&<p className="mt-1 text-[14px] text-[#6B6457]">Empty.</p>}
  <ul className="mt-2 space-y-2">{pouch.map(t=>{const on=!!picked?.some(x=>key(x)===key(t));return <li key={t}>{onPick?<button type="button" aria-pressed={on} onClick={()=>onPick(t)} className={`w-full rounded-xl px-3 py-2 text-left font-serif text-[15px] leading-6 ${on?"bg-[#A0472C] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB]"}`}>“{key(t)}”</button>:<p className="font-serif text-[15px] leading-6">“{key(t)}”</p>}</li>})}</ul></div>;
}
type Reading=NonNullable<StoryView["reading"]>;
// Round 1 on a phone: the reading as tappable lines (kept lines go in the pouch). With squads on, each member reads
// their own chunk with a job; pins light up on teammates' phones, teammates react with a sentence stem, and the squad
// votes on its best proof line before each member locks in.
function ReadControls({head,timer,chunks,prompt,focus,onSend,reading,act}:{head:React.ReactNode;timer:React.ReactNode;chunks:{id:string;text:string}[];prompt:string;focus:string;onSend:(p:string[])=>void;reading:Reading|null;act:(k:string,p?:Record<string,unknown>)=>void}){
 const [pouch,setPouch]=useState<string[]>([]),[full,setFull]=useState(false);
 const mine=reading?chunks.filter(c=>reading.myChunk.includes(c.id)):chunks;
 // After a reload, the pouch comes back from this player's pins.
 const restored=useRef(false);
 useEffect(()=>{if(restored.current||!reading)return;restored.current=true;const kept=reading.pins.filter(p=>p.mine).map(p=>p.line).slice(0,3);if(kept.length)setPouch(kept)},[reading]);
 const tap=(l:{text:string})=>{setFull(false);const has=pouch.some(x=>key(x)===key(l.text));if(!has&&pouch.length>=3){setFull(true);return}
  setPouch(p=>has?p.filter(x=>key(x)!==key(l.text)):[...p,l.text]);if(reading)act("story_pin",{line:l.text,...(has?{remove:true}:{})})};
 const mustVote=!!reading&&reading.votes.length>0&&!reading.myVote;
 // The round fills the phone below the round header; only the reading area scrolls, so Lock in stays in view.
 const box=useRef<HTMLElement>(null),[fit,setFit]=useState<number|null>(null);
 useEffect(()=>{const f=()=>{const el=box.current;if(!el)return;const main=el.closest("main"),pad=main?parseFloat(getComputedStyle(main).paddingBottom)||0:0;setFit(Math.max(460,window.innerHeight-Math.max(0,el.getBoundingClientRect().top+window.scrollY)-pad))};f();window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f)},[]);
 return <section ref={box} className="mt-3 flex flex-col" style={{height:fit??undefined}}>{head}<h1 className="mt-1 text-[20px] font-bold leading-tight">{focus}</h1><p className="mt-0.5 text-[14px]">{prompt}</p>{timer}
  {reading&&<p className="mt-2 text-[13px] font-semibold text-[#8A3B23]">Your part: {reading.myChunk.map(paragraphLabel).join(", ")}</p>}
  <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain">
  <ReadingPanel className="shadow-[0_2px_10px_-6px_rgba(42,38,32,.3)]" passages={mine.map(c=>({id:c.id,text:c.text}))} kept={pouch} onTap={tap} pins={(reading?.pins??[]).filter(p=>!p.mine).map(p=>({line:p.line,by:p.by,color:"#5E7FA8"}))} reactions={reading?.reactions??[]} title={<span>{reading?"Your part":"The story"} · {mine.map(c=>paragraphLabel(c.id)).join(" ")}</span>}/>
  {reading&&<Together reading={reading} act={act}/>}
  </div>
  <PouchView pouch={pouch} compact/>{full&&<p className="mt-1 text-[13px] font-semibold text-[#A33B20]">Your pouch is full. Tap a kept line to take it out.</p>}
  <button type="button" disabled={mustVote} onClick={()=>onSend(pouch)} className="case-primary mt-2 w-full shrink-0 disabled:opacity-40">{mustVote?"Vote before you lock in":`Lock in ${pouch.length} line${pouch.length===1?"":"s"}`} <ArrowRight size={18}/></button></section>;
}
// Reading together, in any round: squad status and your job, teammates' pins (react with a sentence stem), and the
// squad vote on its best line before anyone locks in.
function Together({reading,act}:{reading:Reading;act:(k:string,p?:Record<string,unknown>)=>void}){
 const [react,setReact]=useState<string|null>(null);
 const others=reading.pins.filter(p=>!p.mine);
 return <div className="mt-3 space-y-3">
  <Huddle reading={reading}/>
  {reading.myJob&&<p className="rounded-2xl bg-[#F4E1D6] px-3 py-2 text-[13px] leading-5"><b>{JOB_TEXT[reading.myJob].name}:</b> {JOB_TEXT[reading.myJob].does}</p>}
  {others.length>0&&<section aria-label="Teammates' pins"><h2 className="text-[15px] font-bold">Teammates' pins</h2>
   <ul className="mt-1 space-y-2">{others.map(p=><li key={p.by+p.line} className="rounded-2xl bg-[#FFFDF8] p-3 ring-1 ring-[#E4DCCB]"><p className="text-[12px] font-bold text-[#3E5F86]">{p.by} pinned</p><p className="font-serif text-[15px] leading-6">{displayLine(p.line)}</p>
    {reading.reactions.filter(r=>key(r.line)===key(p.line)).map((r,i)=><p key={i} className="mt-1 text-[13px]"><b className="text-[#8A3B23]">{r.by} · {r.stem}</b> {r.body}</p>)}
    <button type="button" onClick={()=>setReact(p.line)} className="mt-2 min-h-11 rounded-full bg-[#F4E1D6] px-4 text-[14px] font-bold text-[#8A3B23]">React</button></li>)}</ul></section>}
  {react&&<ReactBox line={react} onClose={()=>setReact(null)} onSend={(stem,body)=>{act("story_react",{line:react,stem,body});setReact(null)}}/>}
  {reading.votes.length>0&&<section aria-label="Vote"><h2 className="text-[15px] font-bold">Vote: your squad's best line</h2><p className="text-[13px] text-[#6B6457]">Ties go to the line with the most reactions, then the Fact-checker's vote.</p>
   <ul className="mt-1 space-y-2">{reading.votes.map(v=>{const me=!!reading.myVote&&key(reading.myVote)===key(v.line),lead=!!reading.winner&&key(reading.winner)===key(v.line);return <li key={v.line}><button type="button" aria-pressed={me} onClick={()=>act("story_vote",{line:v.line})} className={`w-full rounded-2xl border-2 p-3 text-left ${me?"border-[#A0472C] bg-[#FBEDE5]":"border-[#E4DCCB] bg-[#FFFDF8]"}`}><span className="block font-serif text-[15px] leading-6">{displayLine(v.line)}</span><span className="mt-1 flex flex-wrap justify-between gap-x-3 text-[12px] font-bold text-[#8A3B23]"><span>{v.reactions} reaction{v.reactions===1?"":"s"}</span><span className="whitespace-nowrap">{v.votes} vote{v.votes===1?"":"s"}{lead?" · leading":""}</span></span></button></li>})}</ul></section>}
 </div>;
}
// Live status for each squad member: ready, answering or absent (absent members are left out of the squad average).
function Huddle({reading}:{reading:Reading}){
 return <ul className="-mx-1 mt-2 flex shrink-0 gap-1.5 overflow-x-auto whitespace-nowrap px-1 pb-1" aria-label="Your squad">{reading.members.map(m=><li key={m.id} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-bold ${m.status==="absent"?"bg-[#EDE8DE] text-[#6B6457]":m.status==="answering"?"bg-[#FBEFD2] text-[#6E520F]":"bg-[#E8F2E7] text-[#2F6B3A]"}`}><span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-[#2A2620] text-[10px] text-white">{m.name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>{m.name}{m.me?" (you)":""}{m.job?` · ${JOB_TEXT[m.job].name}`:""} · {m.status==="absent"?"Absent":m.status==="answering"?"Answering":"Ready"}</li>)}</ul>;
}
function ReactBox({line,onSend,onClose}:{line:string;onSend:(stem:ReactionStem,body:string)=>void;onClose:()=>void}){
 const [stem,setStem]=useState<ReactionStem>("proves"),[body,setBody]=useState(""),[err,setErr]=useState("");
 function send(){const t=body.trim();if(!t)return;const r=screenMessage(t);if(r.action!=="allow"){setErr(r.message??"Try different words.");return}onSend(stem,t)}
 return <div className="mt-3 rounded-2xl bg-[#FFFDF8] p-3 ring-2 ring-[#A0472C]" role="group" aria-label="Your reaction">
  <p className="line-clamp-2 font-serif text-[14px] italic">{displayLine(line)}</p>
  <div className="mt-2 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Sentence starter">{(Object.keys(REACTION_STEMS) as ReactionStem[]).map(k=><button key={k} type="button" role="radio" aria-checked={stem===k} onClick={()=>setStem(k)} className={`min-h-11 rounded-xl px-1 text-[12px] font-bold ${stem===k?"bg-[#2A2620] text-white":"bg-[#F4E1D6] text-[#8A3B23]"}`}>{REACTION_STEMS[k]}</button>)}</div>
  <label htmlFor="live-react" className="mt-2 block text-[14px] font-bold">{REACTION_STEMS[stem]}</label>
  <input id="live-react" autoFocus value={body} onChange={e=>{setBody(e.target.value);setErr("")}} maxLength={REACTION_MAX} placeholder="finish the sentence" className="mt-1 min-h-11 w-full rounded-xl border border-[#E4DCCB] bg-white px-3 text-[16px]"/>
  {err&&<p role="alert" className="mt-1 text-[13px] text-[#A33B20]">{err}</p>}
  <div className="mt-2 flex gap-2"><button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-full bg-[#EFE8D8] text-[14px] font-bold">Cancel</button><button type="button" disabled={!body.trim()} onClick={send} className="min-h-11 flex-[2] rounded-full bg-[#A0472C] text-[14px] font-bold text-white disabled:opacity-40">Add reaction</button></div>
 </div>;
}
type Together={reading:Reading|null;act:(k:string,p?:Record<string,unknown>)=>void};
// A line chosen in rounds 2 to 4 is also a pin for the squad.
const pinFor=(t:Together,line:string)=>{if(t.reading&&line)t.act("story_pin",{line})};
const voteFirst=(r:Reading|null)=>!!r&&r.votes.length>0&&!r.myVote;
function ConfrontControls({head,timer,actions,chunks,pouch,onSend,reading,act}:{head:React.ReactNode;timer:React.ReactNode;actions:{id:string;label:string}[];chunks:SourcePassage[];pouch:string[];onSend:(a:string,p:string)=>void}&Together){
 const [action,setAction]=useState(""),[proof,setProofState]=useState("");
 const setProof=(l:string)=>{setProofState(l);pinFor({reading,act},l)};
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">{action?"Back it up with one line":"What do you do?"}</h1>{timer}
  {!action?<div className="mt-3 grid gap-2">{actions.map(a=><button key={a.id} type="button" onClick={()=>setAction(a.id)} className="min-h-[56px] rounded-2xl bg-[#A0472C] px-4 py-3 text-left text-[17px] font-semibold text-white">{a.label}</button>)}</div>
  :<><PouchView pouch={pouch} picked={proof?[proof]:[]} onPick={setProof}/>
   <details className="mt-3 rounded-2xl bg-[#FFFDF8] p-3 ring-1 ring-[#E4DCCB]" open={!pouch.length}><summary className="cursor-pointer text-[15px] font-semibold text-[#8A3B23]">Or pick a line from the passage</summary><ReadingPanel className="mt-2 max-h-[40vh] shadow-none" passages={chunks} kept={proof?[proof]:[]} onTap={l=>setProof(l.text)}/></details>
   {reading&&<Together reading={reading} act={act}/>}
   <button type="button" disabled={!proof||voteFirst(reading)} onClick={()=>onSend(action,proof)} className="case-primary mt-4 w-full disabled:opacity-40">{voteFirst(reading)?"Vote before you lock in":"Back it up"} <ArrowRight size={18}/></button>
   <button type="button" onClick={()=>onSend(action,"")} className="mt-2 w-full text-[14px] text-[#6B6457] underline underline-offset-4">Go without proof</button></>}
 </section>;
}
function LieControls({head,timer,world,sceneId,evidence,onSend,reading,act}:{head:React.ReactNode;timer:React.ReactNode;world:WorldPack|null;sceneId:string;evidence:SourcePassage[];onSend:(l:string,e:string)=>void}&Together){
 const lie=useMemo(()=>world?.scenes.find(s=>s.id===sceneId)?.lie,[world,sceneId]);
 const [line,setLine]=useState(""),[misses,setMisses]=useState(0),[msg,setMsg]=useState(""),[why,setWhy]=useState("");
 const pick=(l:{text:string})=>{if(!lie||line)return;pinFor({reading,act},l.text);const r=tryLine(lie,l.text,misses,evidence);if(r.result==="caught"){setLine(l.text);setMsg("")}else{setMisses(r.misses);setMsg(r.message)}};
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">Tap the line that proves it false</h1>{timer}
  <div aria-live="polite">{msg&&<p className="mt-2 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{msg}</p>}{line&&<p className="mt-2 rounded-2xl bg-[#A0472C] px-4 py-3 text-[16px] font-semibold text-white">Lie caught. Now say why in one sentence.</p>}</div>
  <ReadingPanel className="mt-3 max-h-[45vh]" passages={evidence} kept={line?[line]:[]} results={line?[{line,ok:true}]:[]} onTap={pick}/>
  {line&&<><label htmlFor="story-why" className="mt-3 block text-[16px] font-semibold">Why does it prove it false?</label><textarea id="story-why" value={why} onChange={e=>setWhy(e.target.value)} rows={2} maxLength={400} className="mt-1 w-full rounded-2xl border border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 text-[17px]"/></>}
  {reading&&<Together reading={reading} act={act}/>}
  <button type="button" disabled={!!line&&voteFirst(reading)} onClick={()=>onSend(line,why)} className="case-primary mt-4 w-full disabled:opacity-40">{line?voteFirst(reading)?"Vote before you submit":"Submit":"I'm stuck, move on"} <ArrowRight size={18}/></button></section>;
}
function CallControls({head,timer,call,pouch,onSend,reading,act}:{head:React.ReactNode;timer:React.ReactNode;call:{question:string;theories:{id:string;name:string;description:string}[]};pouch:string[];onSend:(t:string,p:string[])=>void}&Together){
 const [theory,setTheory]=useState(""),[pins,setPins]=useState<string[]>([]);
 const toggle=(l:string)=>{if(!pins.some(x=>key(x)===key(l)))pinFor({reading,act},l);setPins(p=>p.some(x=>key(x)===key(l))?p.filter(x=>key(x)!==key(l)):p.length>=2?[p[1],l]:[...p,l])};
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">{call.question}</h1>{timer}
  <div className="mt-3 grid gap-2">{call.theories.map(t=><button key={t.id} type="button" aria-pressed={theory===t.id} onClick={()=>setTheory(t.id)} className={`rounded-2xl p-3 text-left ${theory===t.id?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB]"}`}><span className="block text-[17px] font-bold">{t.name}</span></button>)}</div>
  <p className="mt-3 text-[15px] font-semibold">Pin 2 lines from your pouch</p><PouchView pouch={pouch} picked={pins} onPick={toggle}/>
  {reading&&<Together reading={reading} act={act}/>}
  <button type="button" disabled={!theory||voteFirst(reading)} onClick={()=>onSend(theory,pins)} className="case-primary mt-4 w-full disabled:opacity-40">{voteFirst(reading)?"Vote before you lock in":"Make my call"} <ArrowRight size={18}/></button></section>;
}
