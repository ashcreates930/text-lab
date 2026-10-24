"use client";
// Story Mode on a player's phone during a live round: only the controls (the passage, confrontation and testimony are
// on the board). Read: keep up to 3 lines. Round 2: pick a move, then back it up. Round 3: tap the line that disproves
// the testimony, then say why. Round 4: pick a theory and pin 2 pouch lines. Between rounds: your points and your rank.
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,BookOpen,Trophy} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {tryLine,type LieHighlight} from "@/lib/lies";
import {EvidenceLines} from "../evidence-lines";

const STEP_NAMES=["Read and notice","Something happens to you","Catch the lie","Make your call"];
type Rec={round:number;points:number;detail:string;streak:number;multiplier:number;grace?:boolean;note?:string}|null;
type StoryView={answered:boolean;last:Rec;total:number;pouch:string[];board:{top:{rank:number;name:string;score:number;me:boolean}[];me:{rank:number;score:number;movement:number}|null;players:number};boardKind:"individual"|"squad"};
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
 if(round.kind==="read"&&round.read)return <ReadControls head={head} timer={timer} chunks={round.read.chunks} prompt={round.read.prompt} focus={round.read.focus} onSend={pouch=>act("story",{input:{kind:"read",pouch}})}/>;
 if(round.kind==="confront"&&round.confront)return <ConfrontControls head={head} timer={timer} actions={round.confront.actions} chunks={passages.filter(p=>round.confront!.chunks.includes(p.id))} pouch={story.pouch} onSend={(actionId,proof)=>act("story",{input:{kind:"confront",actionId,proof}})}/>;
 if(round.kind==="lie"&&round.lie)return <LieControls head={head} timer={timer} world={world} sceneId={sceneId} evidence={passages.filter(p=>round.lie!.evidence.includes(p.id))} onSend={(line,explanation)=>act("story",{input:{kind:"lie",line,explanation}})}/>;
 if(round.kind==="call"&&round.call)return <CallControls head={head} timer={timer} call={round.call} pouch={story.pouch} onSend={(theoryId,pins)=>act("story",{input:{kind:"call",theoryId,pins}})}/>;
 return null;
}

function PouchView({pouch,picked,onPick}:{pouch:string[];picked?:string[];onPick?:(t:string)=>void}){
 return <div className="mt-3 rounded-2xl border-2 border-dashed border-[#C9B9A0] bg-[#FBF7EE] p-3"><p className="flex items-center gap-2 text-[14px] font-bold"><BookOpen size={16} className="text-[#A0472C]"/>Evidence pouch · {pouch.length} of 3</p>
  {!pouch.length&&<p className="mt-1 text-[14px] text-[#6B6457]">Empty.</p>}
  <ul className="mt-2 space-y-2">{pouch.map(t=>{const on=!!picked?.some(x=>key(x)===key(t));return <li key={t}>{onPick?<button type="button" aria-pressed={on} onClick={()=>onPick(t)} className={`w-full rounded-xl px-3 py-2 text-left font-serif text-[15px] leading-6 ${on?"bg-[#A0472C] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB]"}`}>“{key(t)}”</button>:<p className="font-serif text-[15px] leading-6">“{key(t)}”</p>}</li>})}</ul></div>;
}
function ReadControls({head,timer,chunks,prompt,focus,onSend}:{head:React.ReactNode;timer:React.ReactNode;chunks:{id:string;text:string}[];prompt:string;focus:string;onSend:(p:string[])=>void}){
 const [pouch,setPouch]=useState<string[]>([]),[full,setFull]=useState(false);
 const tap=(l:{text:string})=>{setFull(false);setPouch(p=>p.some(x=>key(x)===key(l.text))?p.filter(x=>key(x)!==key(l.text)):p.length>=3?(setFull(true),p):[...p,l.text])};
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">{focus}</h1><p className="mt-1 text-[16px]">{prompt}</p>{timer}
  <PouchView pouch={pouch}/>{full&&<p className="mt-2 text-[14px] font-semibold text-[#A33B20]">Your pouch is full. Tap a kept line to take it out.</p>}
  <div className="mt-3"><EvidenceLines passages={chunks} picked={undefined} onPick={tap} highlight={{lines:pouch}} className="max-h-[50vh] space-y-2 overflow-y-auto pr-1"/></div>
  <button type="button" onClick={()=>onSend(pouch)} className="case-primary mt-4 w-full">Lock in {pouch.length} line{pouch.length===1?"":"s"} <ArrowRight size={18}/></button></section>;
}
function ConfrontControls({head,timer,actions,chunks,pouch,onSend}:{head:React.ReactNode;timer:React.ReactNode;actions:{id:string;label:string}[];chunks:SourcePassage[];pouch:string[];onSend:(a:string,p:string)=>void}){
 const [action,setAction]=useState(""),[proof,setProof]=useState("");
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">{action?"Back it up with one line":"What do you do?"}</h1>{timer}
  {!action?<div className="mt-3 grid gap-2">{actions.map(a=><button key={a.id} type="button" onClick={()=>setAction(a.id)} className="min-h-[56px] rounded-2xl bg-[#A0472C] px-4 py-3 text-left text-[17px] font-semibold text-white">{a.label}</button>)}</div>
  :<><PouchView pouch={pouch} picked={proof?[proof]:[]} onPick={setProof}/>
   <details className="mt-3 rounded-2xl bg-[#FFFDF8] p-3 ring-1 ring-[#E4DCCB]" open={!pouch.length}><summary className="cursor-pointer text-[15px] font-semibold text-[#8A3B23]">Or pick a line from the passage</summary><EvidenceLines passages={chunks} picked={proof||undefined} onPick={l=>setProof(l.text)} className="mt-2 max-h-[40vh] space-y-2 overflow-y-auto pr-1"/></details>
   <button type="button" disabled={!proof} onClick={()=>onSend(action,proof)} className="case-primary mt-4 w-full disabled:opacity-40">Back it up <ArrowRight size={18}/></button>
   <button type="button" onClick={()=>onSend(action,"")} className="mt-2 w-full text-[14px] text-[#6B6457] underline underline-offset-4">Go without proof</button></>}
 </section>;
}
function LieControls({head,timer,world,sceneId,evidence,onSend}:{head:React.ReactNode;timer:React.ReactNode;world:WorldPack|null;sceneId:string;evidence:SourcePassage[];onSend:(l:string,e:string)=>void}){
 const lie=useMemo(()=>world?.scenes.find(s=>s.id===sceneId)?.lie,[world,sceneId]);
 const [line,setLine]=useState(""),[misses,setMisses]=useState(0),[msg,setMsg]=useState(""),[hl,setHl]=useState<LieHighlight|undefined>(),[why,setWhy]=useState("");
 const pick=(l:{text:string})=>{if(!lie||line)return;const r=tryLine(lie,l.text,misses,evidence);if(r.result==="caught"){setLine(l.text);setMsg("")}else{setMisses(r.misses);setMsg(r.message);if(r.highlight)setHl(r.highlight)}};
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">Tap the line that proves it false</h1>{timer}
  <div aria-live="polite">{msg&&<p className="mt-2 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{msg}</p>}{line&&<p className="mt-2 rounded-2xl bg-[#A0472C] px-4 py-3 text-[16px] font-semibold text-white">Lie caught. Now say why in one sentence.</p>}</div>
  <div className="mt-3"><EvidenceLines passages={evidence} picked={line||undefined} onPick={pick} highlight={line?undefined:hl} className="max-h-[45vh] space-y-2 overflow-y-auto pr-1"/></div>
  {line&&<><label htmlFor="story-why" className="mt-3 block text-[16px] font-semibold">Why does it prove it false?</label><textarea id="story-why" value={why} onChange={e=>setWhy(e.target.value)} rows={2} maxLength={400} className="mt-1 w-full rounded-2xl border border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 text-[17px]"/></>}
  <button type="button" onClick={()=>onSend(line,why)} className="case-primary mt-4 w-full">{line?"Submit":"I'm stuck, move on"} <ArrowRight size={18}/></button></section>;
}
function CallControls({head,timer,call,pouch,onSend}:{head:React.ReactNode;timer:React.ReactNode;call:{question:string;theories:{id:string;name:string;description:string}[]};pouch:string[];onSend:(t:string,p:string[])=>void}){
 const [theory,setTheory]=useState(""),[pins,setPins]=useState<string[]>([]);
 const toggle=(l:string)=>setPins(p=>p.some(x=>key(x)===key(l))?p.filter(x=>key(x)!==key(l)):p.length>=2?[p[1],l]:[...p,l]);
 return <section className="mt-5">{head}<h1 className="mt-1 text-[24px] font-bold">{call.question}</h1>{timer}
  <div className="mt-3 grid gap-2">{call.theories.map(t=><button key={t.id} type="button" aria-pressed={theory===t.id} onClick={()=>setTheory(t.id)} className={`rounded-2xl p-3 text-left ${theory===t.id?"bg-[#2A2620] text-white":"bg-[#FFFDF8] ring-1 ring-[#E4DCCB]"}`}><span className="block text-[17px] font-bold">{t.name}</span></button>)}</div>
  <p className="mt-3 text-[15px] font-semibold">Pin 2 lines from your pouch</p><PouchView pouch={pouch} picked={pins} onPick={toggle}/>
  <button type="button" disabled={!theory} onClick={()=>onSend(theory,pins)} className="case-primary mt-4 w-full disabled:opacity-40">Make my call <ArrowRight size={18}/></button></section>;
}
