"use client";
// A player's phone in a live round. Join with one tap (a generated detective name, or your class nickname), then each
// round shows only what your role does next, plus your squad's progress so everyone sees who they're waiting for.
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,Check,ChevronDown,Gavel,Send,ThumbsDown,ThumbsUp,X} from "lucide-react";
import type {playerView} from "@/lib/live/server";
import {ROLE_INFO,type Role} from "@/lib/live/engine";
import {contentNotes} from "@/lib/content-notes";
import {EvidenceLines} from "../evidence-lines";
import {playerKey,postJson,readStored,store,useLive,useScreenTop,useStory} from "./use-live";
import {YourTurn} from "../your-turn";
import {UnlockChallenge} from "../role-intro";
import {PlayerStory} from "./player-story";
import {AvatarPick,RaceEndedPlayer,RacePlayer,WordsWhileWaiting,isRace} from "./race-live";

type View=ReturnType<typeof playerView>;
type Seat={sessionId:string;playerToken:string;nickname:string};

export function PlayerScreen({code}:{code:string}){
 const [seat,setSeat]=useState<Seat|null|undefined>(undefined);
 useEffect(()=>{setSeat(readStored<Seat>(playerKey(code)));fetch("/api/access").catch(()=>{})},[code]);
 if(seat===undefined)return <Frame><p className="text-[18px]">Opening…</p></Frame>;
 if(!seat)return <Join code={code} onJoined={s=>{store(playerKey(code),s);setSeat(s)}}/>;
 return <Play seat={seat} onLeave={()=>{try{localStorage.removeItem(playerKey(code))}catch{}setSeat(null)}}/>;
}

function Frame({children}:{children:React.ReactNode}){
 return <main className="case-ui mx-auto min-h-screen max-w-xl bg-[#F6F0E3] px-4 pb-16 pt-5 text-[#2A2620]">{children}</main>;
}

function Join({code,onJoined}:{code:string;onJoined:(s:Seat)=>void}){
 const [info,setInfo]=useState<{title:string;nicknames:string[]}|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[seed,setSeed]=useState(0);
 useScreenTop("join");
 useEffect(()=>{fetch(`/api/live/join?code=${encodeURIComponent(code)}${seed?`&seed=${seed}`:""}`).then(async r=>{const j=await r.json();if(r.ok)setInfo(j);else setError(j.error)}).catch(()=>setError("Can't reach the round. Check your connection."))},[code,seed]);
 async function pick(nickname:string){setBusy(true);const r=await postJson("/api/live/join",{code,nickname});setBusy(false);if(r.ok)onJoined({sessionId:r.data.sessionId,playerToken:r.data.playerToken,nickname:r.data.nickname});else{setError(r.error);setSeed(Math.floor(Math.random()*1e6))}}
 return <Frame>
  <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Live round{info?.title?` · ${info.title}`:""}</p>
  <h1 className="mt-1 text-[30px] font-bold leading-tight">Pick your detective name</h1>
  <p className="mt-2 text-[17px] text-[#4A4438]">Tap one to join. No real names here.</p>
  {error&&<p role="alert" className="mt-4 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{error}</p>}
  <div className="mt-5 grid gap-3">{info?.nicknames.map(n=><button key={n} type="button" disabled={busy} onClick={()=>pick(n)} className="case-primary min-h-[64px] w-full justify-between text-[20px]">{n}<ArrowRight size={22}/></button>)}</div>
  {info&&<button type="button" onClick={()=>setSeed(Math.floor(Math.random()*1e6))} className="mt-4 text-[16px] font-semibold text-[#8A3B23] underline underline-offset-4">Show other names</button>}
 </Frame>;
}

function Play({seat,onLeave}:{seat:Seat;onLeave:()=>void}){
 const {state,setState,error}=useLive<View>(seat.sessionId,{"x-live-player":seat.playerToken});
 const {world,passages}=useStory(state?.session.worldId);
 const [notice,setNotice]=useState("");
 useScreenTop(state?`${state.session.status}:${state.session.roundIndex}:${(state.round as {stage?:string}|null)?.stage??""}:${!!state.answering}:${(state.round as {beat?:string}|null)?.beat??""}:${(state.round as {step?:number}|null)?.step??""}`:null);
 async function act(kind:string,payload:Record<string,unknown>={}):Promise<string|null>{const r=await postJson(`/api/live/sessions/${seat.sessionId}/act`,{kind,payload},{"x-live-player":seat.playerToken});if(r.ok){setState(r.data);setNotice("");return null}setNotice(r.error);return r.error}
 if(!state)return <Frame><p className="text-[18px]" aria-live="polite">{error||"Joining…"}</p>{error==="Join the round first."&&<button type="button" onClick={onLeave} className="case-primary mt-4">Join again</button>}</Frame>;
 const s=state.session,round=state.round;
 return <Frame>
  <header className="flex items-center justify-between gap-3">
   <div><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{s.title}</p><p className="text-[18px] font-bold">{state.me.nickname}</p></div>
   {state.squad&&<div className="text-right"><p className="text-[15px] font-semibold">{state.squad.name}</p><p className="text-[14px] tabular-nums text-[#6B6457]">{state.score} pts</p></div>}
  </header>
  {notice&&<p role="alert" className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{notice}</p>}
  {s.paused&&<p className="mt-3 rounded-2xl bg-[#2A2620] px-4 py-3 text-[17px] font-semibold text-white">Paused. Eyes on the board.</p>}
  <div aria-live="polite">
   {state.yourTurn&&s.status!=="round"&&world?<YourTurnPhone state={state} world={world} passages={passages} seat={seat}/>
   :s.status==="ended"&&isRace(round)?<RaceEndedPlayer state={state}/>
   :s.status==="ended"?<Ended state={state}/>
   :s.status==="lobby"||!round?<><Waiting state={state}/><AvatarPick state={state} act={act}/><WordsWhileWaiting world={world}/></>
   :isRace(round)?<RacePlayer state={state} world={world} act={act}/>
   :s.status==="reveal"?<Revealed state={state}/>
   :<RoundView state={state} act={act} world={world} passages={passages}/>}
  </div>
 </Frame>;
}

function Roles({state}:{state:View}){
 if(!state.myRoles.length)return null;
 return <ul className="mt-3 space-y-2">{state.myRoles.map(r=><li key={r} className="rounded-2xl bg-[#2A2620] px-4 py-3 text-white"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">Your role</p><p className="text-[19px] font-bold">{state.roleInfo[r as Role].name}</p><p className="text-[15px] text-[#E8DDCB]">{state.roleInfo[r as Role].job}</p></li>)}</ul>;
}
function Waiting({state}:{state:View}){
 return <section className="mt-6"><h1 className="text-[28px] font-bold leading-tight">You're in.</h1>
  <p className="mt-2 text-[18px] text-[#4A4438]">{state.squad?`You're in ${state.squad.name} with ${state.squad.members.filter(m=>m.id!==state.me.id).map(m=>m.nickname).join(", ")||"no one yet"}.`:"Your teacher is putting everyone into squads."}</p>
  <p className="mt-4 text-[17px]">Eyes on the board. The round starts soon.</p></section>;
}

// The squad's checklist: each role's job, done or waiting.
function Checklist({state}:{state:View}){
 const p=state.progress;if(!p)return null;
 const isVerdict=state.round?.type==="verdict";
 const rows:[Role,boolean,string][]= [["keeper",isVerdict?p.pins.length===3:!!p.pin,isVerdict?"Pinned 3 pieces of evidence":"Pinned the line"],["reporter",isVerdict?!!p.argument:!!p.explanation,isVerdict?"Wrote the argument":"Wrote why"],["skeptic",p.approved,p.skeptic==="object"?"Objected: fix it, then ask again":"Approved"],["lead",p.submitted,"Submitted"]];
 const who=(r:Role)=>state.squad?.members.filter(m=>m.roles.includes(r)).map(m=>m.id===state.me.id?"you":m.nickname).join(", ");
 return <ol className="mt-4 space-y-1 rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]" aria-label="Your squad's progress">{rows.map(([r,done,label])=><li key={r} className="flex items-start gap-2 text-[15px]"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${done?"bg-[#A0472C] text-white":"bg-[#EFE8D8]"}`}>{done&&<Check size={13}/>}</span><span><b>{ROLE_INFO[r].name}</b> ({who(r)}): {done?label:"waiting"}</span></li>)}</ol>;
}

// Story missions on the phone: the squad's mission and pieces, or the choice when squads pick.
function MissionBar({state,act}:{state:View;act:(k:string,p?:Record<string,unknown>)=>void}){
 const m=state.mission;if(!m)return null;
 if(!m.current&&m.choose)return <section className="mt-4 rounded-2xl bg-[#2A2620] p-4 text-[#FFFDF8]" aria-labelledby="mpick-h"><h2 id="mpick-h" className="text-[18px] font-bold">Choose your squad's mission</h2>
  <ul className="mt-2 space-y-2">{m.choose.map(o=><li key={o.id}><button type="button" onClick={()=>act("mission_pick",{missionId:o.id})} className="w-full rounded-xl bg-white/10 px-3 py-2 text-left"><b className="block text-[16px]">{o.title}</b><span className="text-[14px] text-[#E8DDCB]">{o.problem}</span></button></li>)}</ul></section>;
 if(!m.current)return null;
 return <p className="mt-4 rounded-2xl bg-[#FFFDF8] px-4 py-2 text-[15px] font-bold shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">Mission: {m.current.found} of {m.current.total} pieces found <span className="font-semibold text-[#6B6457]">· {m.current.title}</span></p>;
}

function RoundView({state,act,world,passages}:{state:View;act:(k:string,p?:Record<string,unknown>)=>void;world:ReturnType<typeof useStory>["world"];passages:ReturnType<typeof useStory>["passages"]}){
 const round=state.round!;const p=state.progress;const roles=state.myRoles as Role[];
 const [text,setText]=useState("");const [note,setNote]=useState("");
 useEffect(()=>{setText("")},[state.session.roundIndex]);
 const notes=useMemo(()=>world?contentNotes(world):new Map<string,string>(),[world]);
 // Story Mode: the phone shows only this round's controls.
 if(round.type==="story"&&state.story)return <><MissionBar state={state} act={act}/><PlayerStory round={round as never} story={state.story} act={act} world={world} passages={passages} sceneId={"sceneId" in round?String(round.sceneId):""}/></>;
 // Verdict vote and objection vote: everyone votes.
 if(round.type==="verdict"&&"stage" in round&&round.stage==="vote")return <section className="mt-5"><h1 className="text-[26px] font-bold leading-tight">{"question" in round?round.question:""}</h1><p className="mt-1 text-[16px] text-[#4A4438]">Vote for the theory you can best defend.</p>
  <div className="mt-4 grid gap-3">{"theories" in round&&round.theories.map(t=><button key={t.id} type="button" onClick={()=>act("vote",{theoryId:t.id})} aria-pressed={state.myVote===t.id} className={`rounded-2xl p-4 text-left ${state.myVote===t.id?"bg-[#A0472C] text-white":"bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"}`}><span className="flex items-center justify-between text-[19px] font-bold">{t.name}{state.myVote===t.id&&<Check size={20}/>}</span><span className={`mt-1 block text-[15px] ${state.myVote===t.id?"text-white/90":"text-[#4A4438]"}`}>{t.description}</span></button>)}</div></section>;
 if(round.type==="objection"&&"stage" in round&&round.stage==="vote")return <section className="mt-5"><h1 className="text-[26px] font-bold leading-tight">Sustained or overruled?</h1><p className="mt-1 text-[16px]">Did {round.objectSquad}'s line beat {round.defendSquad}'s evidence?</p>
  <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{round.defendSquad}'s evidence</p><p className="mt-1 font-serif text-[17px] leading-7">“{round.pin.quote}”</p>
  {round.counter?<><p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{round.objectSquad}'s counter</p><p className="mt-1 font-serif text-[17px] leading-7">“{round.counter.line}”</p>{round.counter.text&&<p className="mt-1 text-[16px] leading-6">{round.counter.text}</p>}</>:<p className="mt-3 text-[16px]">{round.objectSquad} didn't finish a counter in time.</p>}
  <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={()=>act("counter_vote",{sustain:true})} aria-pressed={state.myCounterVote===true} className={`min-h-[72px] rounded-2xl text-[19px] font-bold ${state.myCounterVote===true?"bg-[#A0472C] text-white":"bg-[#FFFDF8]"}`}><ThumbsUp className="mx-auto mb-1" size={22}/>Sustained</button><button type="button" onClick={()=>act("counter_vote",{sustain:false})} aria-pressed={state.myCounterVote===false} className={`min-h-[72px] rounded-2xl text-[19px] font-bold ${state.myCounterVote===false?"bg-[#2A2620] text-white":"bg-[#FFFDF8]"}`}><ThumbsDown className="mx-auto mb-1" size={22}/>Overruled</button></div></section>;
 if(!state.squad)return <Waiting state={state}/>;
 if(state.plantedByMySquad)return <section className="mt-5"><h1 className="text-[24px] font-bold">Your squad planted this lie.</h1><p className="mt-2 text-[17px]">Watch the board. Your squad earns points for every squad that catches it with the right line and a sound explanation.</p></section>;
 if(!state.answering)return <section className="mt-5"><h1 className="text-[24px] font-bold">{round.type==="objection"&&"objectSquad" in round?`${round.objectSquad} is objecting.`:"Watch the board."}</h1><p className="mt-2 text-[17px]">You'll vote in a moment.</p></section>;
 if(!p)return null;
 const isVerdict=round.type==="verdict";
 const has=(r:Role)=>roles.includes(r);
 return <section className="mt-4">
  {round.type==="lie"&&"testimony" in round&&<div className="rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">Testimony · {round.character}</p><p className="mt-1 font-serif text-[18px] leading-7">“{round.testimony}”</p><p className="mt-2 text-[15px] font-semibold">One thing is false. Find the line that proves it.</p></div>}
  {round.type==="objection"&&"pin" in round&&<div className="rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">{round.defendSquad}'s evidence</p><p className="mt-1 font-serif text-[17px] leading-7">“{round.pin.quote}”</p><p className="mt-2 text-[15px] font-semibold">Counter it with a better line and one sentence.</p></div>}
  {isVerdict&&"question" in round&&<div className="rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[13px] font-bold uppercase tracking-wide text-[#8A3B23]">Your squad argues</p><p className="mt-1 text-[18px] font-bold">{state.squadTheory?round.theories.find(t=>t.id===state.squadTheory)?.name:"Your theory"}</p></div>}
  <Roles state={state}/>
  {p.submitted?<p className="mt-4 rounded-2xl bg-[#A0472C] px-4 py-4 text-[19px] font-bold text-white"><Check className="mr-2 inline" size={20}/>Submitted. Eyes on the board.</p>:<>
   {has("keeper")&&!isVerdict&&<div className="mt-4"><h2 className="text-[18px] font-bold">Pin the line</h2>{p.pin&&<p className="mt-1 text-[14px] text-[#6B6457]">Pinned. Tap another line to change it.</p>}
    {round.type==="lie"&&"evidence" in round?<EvidenceLines passages={passages.filter(x=>round.evidence.includes(x.id))} picked={p.pin||undefined} onPick={l=>act("pin",{quote:l.text,pid:l.pid})} notes={notes} className="mt-2 max-h-[52vh] space-y-2 overflow-y-auto pr-1"/>
    :world&&<EvidencePicker world={world} passages={passages} notes={notes} picked={p.pin?[p.pin]:[]} max={1} onChange={pins=>{if(pins[0])act("pin",{quote:pins[0].quote,pid:pins[0].pid,clueId:pins[0].clueId})}}/>}</div>}
   {has("keeper")&&isVerdict&&world&&<div className="mt-4"><h2 className="text-[18px] font-bold">Pin 3 pieces of evidence</h2><PinThree world={world} passages={passages} notes={notes} saved={p.pins} onSave={pins=>act("pins",{pins})}/></div>}
   {has("reporter")&&<div className="mt-4"><h2 className="text-[18px] font-bold">{isVerdict?"Write the argument (2 to 4 sentences)":"Write why, in one sentence"}</h2>
    {(isVerdict?p.argument:p.explanation)&&<p className="mt-1 rounded-xl bg-[#FFFDF8] px-3 py-2 text-[15px]">Sent: {isVerdict?p.argument:p.explanation}</p>}
    <label htmlFor="live-text" className="sr-only">{isVerdict?"Argument":"Explanation"}</label>
    <textarea id="live-text" value={text} onChange={e=>setText(e.target.value)} rows={isVerdict?4:2} maxLength={isVerdict?1200:400} placeholder={isVerdict?"I believe… because… The strongest evidence is…":"This line shows… so the claim is false because…"} className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-white p-3 text-[17px] outline-none focus:border-[#A0472C]"/>
    <button type="button" disabled={text.trim().split(/\s+/).length<3} onClick={()=>{act(isVerdict?"argument":"explain",{text});}} className="case-primary mt-2 w-full disabled:opacity-40"><Send size={18}/>Send to my squad</button></div>}
   {has("skeptic")&&<div className="mt-4"><h2 className="text-[18px] font-bold">Check it</h2>
    {!((isVerdict?p.pins.length===3:p.pin)&&(isVerdict?p.argument:p.explanation))?<p className="mt-1 text-[16px] text-[#6B6457]">Waiting for the evidence and the {isVerdict?"argument":"explanation"}.</p>:<>
     <div className="mt-2 rounded-2xl bg-[#FFFDF8] p-3 text-[15px]">{isVerdict?<ol className="list-decimal space-y-1 pl-5">{p.pins.map(x=><li key={x.quote} className="font-serif italic">“{x.quote.slice(0,140)}{x.quote.length>140?"…":""}”</li>)}</ol>:<p className="font-serif italic">“{p.pin}”</p>}<p className="mt-2">{isVerdict?p.argument:p.explanation}</p></div>
     {p.approved?<p className="mt-2 text-[16px] font-semibold text-[#8A3B23]"><Check className="mr-1 inline" size={16}/>You approved it.</p>:<div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={()=>act("approve")} className="case-primary"><ThumbsUp size={18}/>Approve</button><button type="button" onClick={()=>act("object",{note})} className="case-secondary justify-center"><X size={18}/>Object</button></div>}
     {!p.approved&&<input value={note} onChange={e=>setNote(e.target.value)} maxLength={200} placeholder="Why you object (optional)" aria-label="Why you object" className="mt-2 w-full rounded-xl border border-[#E4DCCB] bg-white px-3 py-2 text-[15px]"/>}</>}
   </div>}
   {has("lead")&&<div className="mt-4"><h2 className="text-[18px] font-bold">Submit for your squad</h2>
    {isVerdict&&"theories" in round&&<TheoryChoice round={round} squadTheory={state.squadTheory} onSubmit={t=>act("submit",{theoryId:t})} canSubmit={p.canSubmit}/>}
    {!isVerdict&&<button type="button" disabled={!p.canSubmit} onClick={()=>act("submit")} className="case-primary mt-2 min-h-[60px] w-full text-[19px] disabled:opacity-40"><Gavel size={20}/>Submit</button>}
    {!p.canSubmit&&<p className="mt-1 text-[15px] text-[#6B6457]">Waiting for {p.waitingFor.filter(r=>r!=="lead").map(r=>ROLE_INFO[r as Role].name).join(", ")}.</p>}</div>}
   {p.objectionNote&&<p className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[15px]">The Skeptic objected: {p.objectionNote}</p>}
  </>}
  <Checklist state={state}/>
 </section>;
}

function TheoryChoice({round,squadTheory,onSubmit,canSubmit}:{round:Extract<NonNullable<View["round"]>,{type:"verdict"}>;squadTheory:string|null;onSubmit:(t:string)=>void;canSubmit:boolean}){
 const [t,setT]=useState(squadTheory??round.theories[0]?.id??"");
 useEffect(()=>{if(squadTheory)setT(squadTheory)},[squadTheory]);
 return <><label htmlFor="squad-theory" className="mt-1 block text-[15px] text-[#4A4438]">Your squad's theory (from your votes)</label>
  <select id="squad-theory" value={t} onChange={e=>setT(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E4DCCB] bg-white px-3 py-2 text-[16px]">{round.theories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
  <button type="button" disabled={!canSubmit} onClick={()=>onSubmit(t)} className="case-primary mt-2 min-h-[60px] w-full text-[19px] disabled:opacity-40"><Gavel size={20}/>Submit to the judge</button></>;
}

type Pin={clueId:string;quote:string;pid:string};
// Any clue in the story, opened to its evidence lines.
function EvidencePicker({world,passages,notes,picked,max,onChange}:{world:NonNullable<ReturnType<typeof useStory>["world"]>;passages:ReturnType<typeof useStory>["passages"];notes:Map<string,string>;picked:(Pin|string)[];max:number;onChange:(pins:Pin[])=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const pins=picked.filter((x):x is Pin=>typeof x!=="string");
 const pickedText=picked.map(x=>typeof x==="string"?x:x.quote);
 return <ul className="mt-2 space-y-2">{world.scenes.flatMap(s=>s.artifacts).map(c=><li key={c.id} className="rounded-2xl bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
  <button type="button" onClick={()=>setOpen(o=>o===c.id?null:c.id)} aria-expanded={open===c.id} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[16px] font-semibold">{c.name}<ChevronDown size={18} className={open===c.id?"rotate-180":""}/></button>
  {open===c.id&&<div className="px-2 pb-2"><EvidenceLines passages={passages.filter(x=>c.source_anchor.includes(x.id))} picked={pickedText.find(t=>passages.some(x=>c.source_anchor.includes(x.id)&&x.text.replace(/\s+/g," ").includes(t.replace(/\s+/g," "))))} notes={notes} className="max-h-[40vh] space-y-2 overflow-y-auto pr-1" onPick={l=>{const next={clueId:c.id,quote:l.text,pid:l.pid};onChange(max===1?[next]:[...pins.filter(x=>x.quote!==l.text),next].slice(-max))}}/></div>}
 </li>)}</ul>;
}
function PinThree({world,passages,notes,saved,onSave}:{world:NonNullable<ReturnType<typeof useStory>["world"]>;passages:ReturnType<typeof useStory>["passages"];notes:Map<string,string>;saved:{clueId?:string;quote:string}[];onSave:(pins:Pin[])=>void}){
 const [pins,setPins]=useState<Pin[]>(saved.map(x=>({clueId:x.clueId??"",quote:x.quote,pid:""})));
 return <>
  <ol className="mt-2 space-y-1">{pins.map((x,i)=><li key={x.quote} className="flex items-start gap-2 rounded-xl bg-[#F4E1D6] px-3 py-2 text-[14px]"><span className="font-bold">{i+1}.</span><span className="flex-1 font-serif italic">“{x.quote.slice(0,110)}{x.quote.length>110?"…":""}”</span><button type="button" aria-label="Remove this pin" onClick={()=>setPins(p=>p.filter(y=>y.quote!==x.quote))}><X size={16}/></button></li>)}</ol>
  <p className="mt-2 text-[15px] font-semibold">{pins.length} of 3 pinned</p>
  {pins.length<3&&<EvidencePicker world={world} passages={passages} notes={notes} picked={pins} max={3} onChange={setPins}/>}
  <button type="button" disabled={pins.length!==3} onClick={()=>onSave(pins)} className="case-primary mt-2 w-full disabled:opacity-40">Send these 3 to my squad</button>
 </>;
}

function Revealed({state}:{state:View}){
 const r=state.reveal as (View["reveal"]&{mine?:{points:number;detail:string}|null})|null;
 if(!r)return null;
 // Story Mode's final reveal: your total and your rank (the top 5 are on the board).
 if(r.type==="story")return <section className="mt-6"><h1 className="text-[28px] font-bold">Story Mode complete</h1>{state.story&&<p className="mt-3 rounded-2xl bg-[#2A2620] px-4 py-3 text-[18px] text-white">{state.story.total} points{state.story.board.me?` · ${state.story.boardKind==="squad"?"your squad is ":"you're "}#${state.story.board.me.rank} of ${state.story.board.players}`:""}</p>}<p className="mt-3 text-[16px]">Eyes on the board for the top 5.</p></section>;
 return <section className="mt-6"><h1 className="text-[28px] font-bold">{r.type==="objection"?(("sustained" in r&&r.sustained)?"Objection sustained!":"Objection overruled!"):"Eyes on the board"}</h1>
  {r.type==="lie"&&"truthLine" in r&&<><p className="mt-3 text-[15px] font-semibold text-[#8A3B23]">The line that disproves it</p><p className="mt-1 rounded-2xl bg-[#FFFDF8] p-4 font-serif text-[17px] leading-7">“{r.truthLine}”</p><p className="mt-2 text-[16px]">{r.explanation}</p></>}
  {r.mine&&<p className="mt-4 rounded-2xl bg-[#2A2620] px-4 py-4 text-[18px] text-white"><b>{state.squad?.name}:</b> {r.mine.detail} · {r.mine.points} pts</p>}
 </section>;
}
function Ended({state}:{state:View}){
 return <section className="mt-6"><h1 className="text-[30px] font-bold">Case closed</h1><p className="mt-2 text-[18px]">{state.squad?`${state.squad.name} earned ${state.score} points.`:"Thanks for playing."}</p><p className="mt-1 text-[15px] text-[#6B6457]">Points came from your squad's evidence and reasoning.</p></section>;
}

// Your Turn on a phone, once the teacher starts it: "Unlock your challenge" (two taps, or Skip), then the student's
// two activities from those answers.
function YourTurnPhone({state,world,passages,seat}:{state:View;world:NonNullable<ReturnType<typeof useStory>["world"]>;passages:ReturnType<typeof useStory>["passages"];seat:Seat}){
 const yt=state.yourTurn!;
 const [err,setErr]=useState("");
 if(yt.ask)return <div className="-mx-4">{err&&<p role="alert" className="mx-4 mt-4 rounded-2xl bg-[#FBE3DC] p-3 text-[15px] text-[#8A3B23]">{err}</p>}<UnlockChallenge onDone={async a=>{const r=await postJson(`/api/live/sessions/${seat.sessionId}/act`,{kind:"your_turn_angle",payload:a},{"x-live-player":seat.playerToken});setErr(r.ok?"":r.error??"Try again.")}}/></div>;
 if(yt.done.length&&yt.choices.length)return <section className="mt-5"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your Turn</p><h1 className="mt-1 text-[26px] font-bold">Saved for your teacher</h1><p className="mt-2 text-[16px]">{yt.done.join(", ")}. Eyes on the board.</p></section>;
 return <div className="-mx-4"><YourTurn world={world} passages={passages} choices={yt.choices} onSave={async e=>{const r=await postJson(`/api/live/sessions/${seat.sessionId}/act`,{kind:"your_turn",payload:e},{"x-live-player":seat.playerToken});return r.ok?null:r.error}}/></div>;
}
