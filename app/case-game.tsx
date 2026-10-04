"use client";
// Game layer for the case flow: scene progress, detective ranks, the Fact Checker badge, the stamp sound, and ambient scene motion.
// Progress is kept on this device only (localStorage). Nothing here is sent to a server.
import {useEffect,useState} from "react";
import {Award,ShieldCheck} from "lucide-react";

const KEY="textlab-progress-v1",EVENT="textlab-progress";
type Progress={scenes:string[];factChecks:string[]};
export const RANKS=[{min:0,name:"Witness"},{min:1,name:"Investigator"},{min:4,name:"Lead Detective"},{min:8,name:"Case Closer"}] as const;
export function rankFor(solved:number){return [...RANKS].reverse().find(r=>solved>=r.min)!.name}
export function nextRank(solved:number){return RANKS.find(r=>r.min>solved)??null}

function empty():Progress{return {scenes:[],factChecks:[]}}
export function loadProgress():Progress{try{const p=JSON.parse(localStorage.getItem(KEY)||"{}");return {scenes:Array.isArray(p.scenes)?p.scenes:[],factChecks:Array.isArray(p.factChecks)?p.factChecks:[]}}catch{return empty()}}
function store(p:Progress){try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}try{window.dispatchEvent(new Event(EVENT))}catch{}}

/** Records a solved scene. Returns the new rank name when the student moved up, otherwise null. */
export function recordScene(key:string):string|null{const p=loadProgress();if(p.scenes.includes(key))return null;const before=rankFor(p.scenes.length);p.scenes.push(key);store(p);const after=rankFor(p.scenes.length);return after!==before?after:null}
/** Records a Fact Checker moment (the student used the story to prove a character wrong). Returns true the first time for this clue. */
export function recordFactCheck(key:string){const p=loadProgress();if(p.factChecks.includes(key))return false;p.factChecks.push(key);store(p);return true}

export function useProgress(){
 const [p,setP]=useState<Progress>(empty);
 useEffect(()=>{const sync=()=>setP(loadProgress());sync();window.addEventListener(EVENT,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(EVENT,sync);window.removeEventListener("storage",sync)}},[]);
 return p;
}

export function RankChip({className=""}:{className?:string}){
 const p=useProgress(),solved=p.scenes.length,rank=rankFor(solved),next=nextRank(solved);
 const hint=next?`${next.min-solved} more scene${next.min-solved===1?"":"s"} to ${next.name}`:"Top rank";
 return <span title={hint} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2A2620] px-3 py-1 text-[14px] font-semibold text-white ${className}`}><Award size={15} className="text-[#F3C9B2]"/>{rank}<span className="sr-only">. {hint}.</span></span>;
}

export function FactCheckerBadge({count}:{count:number}){
 return <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#A0472C] bg-[#F4E1D6] px-3 py-1 text-[14px] font-bold text-[#8A3B23]"><ShieldCheck size={16}/>Fact Checker{count>1?` ×${count}`:""}</span>;
}

/** A short, quiet stamp thud made with Web Audio, so no sound file is needed. */
export function playStamp(delay=330){
 setTimeout(()=>{try{
  const AC=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
  const ctx=new AC(),t=ctx.currentTime;
  const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(48,t+.18);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.26);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.3);
  const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.07),ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
  const n=ctx.createBufferSource(),ng=ctx.createGain();n.buffer=buf;ng.gain.value=.1;n.connect(ng).connect(ctx.destination);n.start(t);
  setTimeout(()=>{ctx.close().catch(()=>{})},700);
 }catch{}},delay);
}

/** Ambient motion layered over a solved scene. Chosen per story; any story without an entry gets drifting dust. */
const AMBIENT:Record<string,"dust"|"snow"|"candle"|"fog">={"sleepy-hollow":"fog","trifles":"snow","tell-tale-heart":"candle"};
export function Ambient({worldId}:{worldId:string}){return <div aria-hidden className={`pointer-events-none absolute inset-0 amb amb-${AMBIENT[worldId]??"dust"}`}/>}
