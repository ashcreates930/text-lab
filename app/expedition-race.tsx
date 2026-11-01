"use client";
// Proof Race expeditions (rules: lib/expedition.ts). Each chunk: read (no timer) with its Words to Know, a hidden
// discovery and the optional highlighter; Gist check (20 seconds); one question (one shot, timed by type); then the
// result moment, the leaderboard (with Pause) and a countdown ring to the next chunk, all automatic. The HUD (score,
// streak, coins, sound, chunk count, seconds left) sits on every race screen. Extended time multiplies every timer and
// every automatic screen. Screen readers hear the result and the new rank before anything moves.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowRight,Check,Flame,Highlighter,Pause,Play,Star,Timer,Volume2,VolumeX,X} from "lucide-react";
import type {ExpQuestion,QuestionType,WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {DISCOVERY_COINS,GIST_SECONDS,TESTIMONY_MS,TYPE_INFO,chunkTokens,focusTokens,joinedPassages,proofTokens,expeditionChunks,ghostPlay,gistPoints,isDiscovery,keywordParts,limitMs,phraseRange,proofShown,scoreAnswer,screenMs,shuffledOrder,type Answer,type RaceChunk,type Token} from "@/lib/expedition";
import {SplitStage,useStickyOffsets} from "./split-stage";
import {raceBoard,type BoardRow} from "@/lib/proof-race";
import {contentNotes} from "@/lib/content-notes";
import {Pill} from "./game-ui";
import {ContentNote} from "./content-note";
import {ReadingPanel} from "./reading-panel";
import {Leaderboard,Podium,cue,reducedMotion,useBeatClock} from "./proof-race";
import {useSoundPref} from "./game-feel";
import {focusScreenTop} from "./screen-focus";
import {CaseNotesView,Refresher,type RefresherView} from "./after-race";
import {caseNotes,refresherAward,refresherCorrect,refresherItems,refresherShown,refresherView,type ChunkResult} from "@/lib/case-notes";
import {interviewNote,interviewStatements,liarCheck,liarIndex,witnessName,type LiarAnswer} from "@/lib/interview";
import {InterviewScreen,LiarVerdict,NameTheLiar} from "./interview";
import type {ExpeditionAttempt} from "@/lib/expedition-progress";
import {evidenceSentences} from "@/lib/lies";

type Beat="interview"|"read"|"gist"|"question"|"result"|"board"|"countdown"|"liar"|"verdict"|"finish"|"refresher"|"notes";
export type ChunkRecord={gist:number|null;answer:Answer;correct:boolean;points:number;late:boolean;coins:number;unknown:string[];discovered:boolean};
const AUTO:Partial<Record<Beat,"result"|"board"|"countdown">>={result:"result",board:"board",countdown:"countdown"};

// ---------- HUD ----------
export function RaceHud({score,streak,coins,sound,onSound,chunk,total,left,title}:{score:number;streak:number;coins:number;sound:boolean;onSound:()=>void;chunk:number;total:number;left:number|null;title?:string}){
 // Pinned directly below the site header on every race screen (--header-h is set by useStickyOffsets). On a phone it is
 // one row (the chunk count and timer join the pills) so the passage keeps the screen.
 return <div className="hud sticky top-[var(--header-h,0px)] z-20 -mx-4 flex flex-col gap-2 bg-deep px-4 pb-2 pt-1">
  <div className="flex items-center gap-1.5">
   <Pill label={`Score ${score}`} icon={<Star size={16} className="fill-highlight text-highlight" aria-hidden/>}>{score.toLocaleString()}</Pill>
   <Pill label={`Streak ${streak}`} tone={streak>0?"highlight":"muted"} icon={<Flame size={16} className={streak>0?"fill-primary text-primary":"text-muted"} aria-hidden/>}>x{streak}</Pill>
   <Pill label={`${coins} coins`} icon={<span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-gold ring-2 ring-inset ring-gold-shadow"/>}>{coins}</Pill>
   <span className="flex-1"/>
   <span className="font-display text-[16px] font-bold tabular-nums text-ink md:hidden" aria-label={`Chunk ${chunk} of ${total}`}>{chunk}/{total}</span>
   {left!==null&&<span className="w-10 text-right font-display text-[18px] font-bold tabular-nums text-ink md:hidden" aria-hidden>{Math.ceil(left)}s</span>}
   <button type="button" onClick={onSound} aria-label={sound?"Sound on":"Sound off"} aria-pressed={sound} className="grid h-11 w-11 place-items-center rounded-row bg-panel">{sound?<Volume2 size={20} aria-hidden/>:<VolumeX size={20} aria-hidden/>}</button>
  </div>
  <div className="hidden items-end justify-between gap-2 md:flex"><p className="font-display"><span className="block text-[22px] font-bold leading-none text-ink">Chunk {chunk} of {total}</span>{title&&<span className="text-[14px] font-semibold text-muted">{title}</span>}</p>{left!==null&&<span className="font-display text-[22px] font-bold tabular-nums text-ink" aria-hidden>{Math.ceil(left)}s</span>}</div>
 </div>;
}
export function TimerTrack({left,seconds}:{left:number|null;seconds:number}){
 if(left===null)return null;
 return <div role="timer" aria-label={`${Math.ceil(left)} seconds left`} className="h-3 overflow-hidden rounded-full bg-panel"><div className={`h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none ${left<=5?"bg-notyet":"bg-primary"}`} style={{width:`${Math.max(0,left/seconds)*100}%`}}/></div>;
}

// ---------- The chunk on the reading card ----------
// Words to Know get a soft violet highlight and a dotted underline (never color alone, never the orange of a picked
// line); a tap shows the definition. Every other word can be tapped too: the hidden discovery pays coins, and with the
// highlighter on, a tap marks a word the student doesn't know.
export type ChunkView={lines:{pid:string;index:number;text:string}[];discovery:{phrase:string;note:string}};
// focus: the word or phrase the question is about (highlighted from the start; never the proof). shown: the proof, lit up
// after the answer: teal when the student got it ("right"), outlined when they missed it ("missed"). "Look closer" lets
// keyboard and screen reader users step through the words and choose one (for a discovery, or to mark a word).
// pick: text evidence is a whole sentence. Tapping a sentence highlights it like a highlighter stroke; tapping it again
// clears it. "Look closer" then steps through the sentences instead of the words.
export function ChunkText({chunk,world,tokens,highlighter,marking,unknown,onUnknown,onDiscover,found,shown=[],shownStyle="right",focus=[],large=false,explore=false,pick}:{chunk:ChunkView;world:WorldPack;tokens:Token[];highlighter?:boolean;marking?:boolean;unknown?:Set<number>;onUnknown?:(i:number)=>void;onDiscover?:()=>void;found?:boolean;shown?:number[];shownStyle?:"right"|"missed";focus?:number[];large?:boolean;explore?:boolean;pick?:{selected:string|null;onPick:(text:string|null)=>void}}){
 const [open,setOpen]=useState<string|null>(null),[closer,setCloser]=useState(false),[cursor,setCursor]=useState(0);
 const tapHint=pick?"Tap the sentence that proves it. Tap it again to clear it.":null;
 const vocab=useMemo(()=>{const m=new Map<number,{term:string;def:string}>();for(const g of world.glossary){const r=phraseRange(tokens,g.term);if(r)for(let k=r[0];k<=r[1];k++)m.set(k,{term:g.term,def:g.student_friendly_definition})}return m},[tokens,world.glossary]);
 const card=world.glossary.find(g=>g.term===open);
 const notes=useMemo(()=>contentNotes(world),[world]);
 const notesHere=[...new Set(chunk.lines.map(l=>l.pid))].map(p=>notes.get(p)).filter(Boolean) as string[];
 const tap=(i:number)=>{if(marking&&onUnknown){onUnknown(i);return}if(onDiscover&&isDiscovery(tokens,chunk,i))onDiscover()};
 const showSet=new Set(shown),focusSet=new Set(focus);
 const canExplore=(explore&&(!!onDiscover||!!marking))||!!pick;
 const sentenceText=(k:number)=>chunk.lines[k]?.text??"",pickedLine=pick?.selected?chunk.lines.findIndex(l=>l.text===pick.selected):-1;
 const toggle=(k:number)=>{if(!pick)return;pick.onPick(k===pickedLine?null:sentenceText(k))};
 useEffect(()=>{setCursor(0)},[!!pick]);// eslint-disable-line react-hooks/exhaustive-deps
 // Consecutive words grouped by whether they're part of the lit-up proof.
 const runs:{shown:boolean;tokens:Token[]}[]=[];for(const t of tokens){const sh=showSet.has(t.i),last=runs.at(-1);if(last&&last.shown===sh&&(!pick||last.tokens[0].line===t.line))last.tokens.push(t);else runs.push({shown:sh,tokens:[t]})}
 return <div className="reading-scope reading-card p-4">
  {notesHere.map(n=><ContentNote key={n} text={n} className="mb-3"/>)}
  <div className="mb-2 flex items-center justify-between gap-2"><p className="text-[12px] font-extrabold text-muted">¶{Number(chunk.lines[0]?.pid.slice(1))}{chunk.lines.at(-1)?.pid!==chunk.lines[0]?.pid?` to ${Number(chunk.lines.at(-1)!.pid.slice(1))}`:""}</p>
   {shown.length>0&&<p className={`rounded-full px-2.5 py-0.5 text-[12px] font-extrabold ${shownStyle==="right"?"bg-line-right text-reading-ink":"border-2 border-line-wrong-edge text-reading-ink"}`}>{shownStyle==="right"?"The proof":"Here's the proof"}</p>}
   {canExplore&&<button type="button" aria-expanded={closer} onClick={()=>setCloser(c=>!c)} className="min-h-11 rounded-full bg-deep px-3 text-[14px] font-bold">{closer?"Done looking":"Look closer"}</button>}</div>
  <p className={`font-serif text-reading-ink ${large?"text-[clamp(22px,2.2vw,34px)] leading-[1.6]":"text-[19px] leading-[1.75]"}`}>{runs.map(run=>{const inProof=run.shown;const words=run.tokens.map(t=>{const v=pick?undefined:vocab.get(t.i);const isUnknown=unknown?.has(t.i),isShown=showSet.has(t.i),isFocus=focusSet.has(t.i),isCursor=closer&&cursor===t.i;
   const cls=isShown?""
    :isFocus?"rounded bg-highlight/25 underline decoration-highlight decoration-[3px] underline-offset-4":isUnknown?"rounded bg-gold-soft underline decoration-gold-shadow decoration-[3px] underline-offset-4":"";
   return <span key={t.i}>{t.i>0&&!(pick&&t.i===run.tokens[0].i)?" ":""}{v&&!marking&&!shown.length
    ?<button type="button" onClick={()=>{setOpen(o=>o===v.term?null:v.term);tap(t.i)}} aria-expanded={open===v.term} className={`rounded bg-violet-soft px-0.5 underline decoration-dotted decoration-2 underline-offset-4 ${cls} ${isCursor?"outline outline-[3px] outline-primary":""}`}>{t.text}<span className="sr-only"> (word to know)</span></button>
    :<span onClick={()=>tap(t.i)} className={`${marking?"cursor-pointer rounded hover:bg-gold-soft":""} ${cls} ${isCursor?"rounded outline outline-[3px] outline-primary":""}`}>{t.text}</span>}</span>});
   // A run of proof words is one highlight: teal when right, a dashed coral frame when missed.
   if(inProof)return <span key={run.tokens[0].i} className={`rounded-md px-0.5 [box-decoration-break:clone] ${shownStyle==="right"?"bg-line-right shadow-[0_0_0_2px_var(--color-line-right-edge)]":"shadow-[0_0_0_2px_var(--color-line-wrong-edge)]"}`}>{words}</span>;
   if(pick){const k=run.tokens[0].line,on=k===pickedLine,isCursor=closer&&cursor===k;return <span key={run.tokens[0].i}>{run.tokens[0].i>0?" ":""}<span role="button" tabIndex={0} aria-pressed={on} aria-label={`Sentence ${k+1}: ${sentenceText(k)}`} onClick={()=>toggle(k)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(k)}}}
    className={`cursor-pointer rounded-md px-0.5 [box-decoration-break:clone] outline-none focus-visible:ring-[3px] focus-visible:ring-primary ${on?"bg-line-picked shadow-[0_0_0_2px_var(--color-primary)]":"hover:bg-line-picked/50"} ${isCursor?"ring-[3px] ring-primary":""}`}>{words}</span></span>}
   return <span key={run.tokens[0].i}>{words}</span>})}</p>
  {closer&&pick&&<div role="group" aria-label="Look closer at the sentences" className="mt-3 rounded-row bg-panel-2 p-3">
   <p className="text-[15px]" aria-live="polite">Sentence {cursor+1} of {chunk.lines.length}: {sentenceText(cursor)}</p>
   <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={()=>setCursor(c=>Math.max(0,c-1))} className="case-secondary !min-h-11">Previous sentence</button><button type="button" onClick={()=>setCursor(c=>Math.min(chunk.lines.length-1,c+1))} className="case-secondary !min-h-11">Next sentence</button>
    <button type="button" onClick={()=>toggle(cursor)} className="case-primary !min-h-11">{cursor===pickedLine?"Clear this sentence":"Choose this sentence"}</button></div></div>}
  {closer&&!pick&&<div role="group" aria-label="Look closer at the words" className="mt-3 rounded-row bg-panel-2 p-3">
   <p className="text-[15px]" aria-live="polite">Word {cursor+1} of {tokens.length}: <b>{tokens[cursor]?.text}</b></p>
   <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={()=>setCursor(c=>Math.max(0,c-1))} className="case-secondary !min-h-11">Previous word</button><button type="button" onClick={()=>setCursor(c=>Math.min(tokens.length-1,c+1))} className="case-secondary !min-h-11">Next word</button>
    <button type="button" onClick={()=>tap(cursor)} className="case-primary !min-h-11">{marking?"Mark this word":"Choose this word"}</button></div></div>}
  {card&&<div role="note" aria-live="polite" className="mt-3 flex items-start justify-between gap-2 rounded-row bg-violet-soft px-3 py-2"><p className="text-[15px] leading-6 text-ink"><b>{card.term}:</b> {card.student_friendly_definition}</p><button type="button" onClick={()=>setOpen(null)} aria-label="Close the word card" className="grid h-11 w-11 shrink-0 place-items-center rounded-full"><X size={16} aria-hidden/></button></div>}
  {found&&<p role="status" className="mt-3 rounded-row bg-gold-soft px-3 py-2 text-[15px] font-bold text-ink">Discovery! +{DISCOVERY_COINS} coins. {chunk.discovery.note}</p>}
  {highlighter&&marking&&<p className="mt-2 text-[13px] text-muted">Tap the words you don't know. They're saved for your teacher.</p>}
  {tapHint&&<p className="mt-2 text-[13px] font-bold text-reading-muted">{tapHint}</p>}
 </div>;
}

// ---------- Answer bars, word proof ----------
// seed: the student and question, so each student sees the choices in their own stable order; onPick gets the original index.
export function AnswerBars({options,picked,onPick,disabled,label,seed}:{options:{text:string}[];picked:number|null;onPick:(i:number)=>void;disabled?:boolean;label:string;seed?:string}){
 const order=seed?shuffledOrder(options.length,`${seed}|${label}`):options.map((_,i)=>i);
 return <fieldset className="mt-3"><legend className="sr-only">{label}</legend><div className="grid gap-2.5">{order.map((i,pos)=>{const o=options[i];return <button key={i} type="button" disabled={disabled} aria-pressed={picked===i} onClick={()=>onPick(i)}
  className={`flex min-h-[60px] items-center gap-3 rounded-button border-[3px] px-4 py-3 text-left text-[17px] font-bold leading-snug transition-transform active:translate-y-1 motion-reduce:transition-none ${picked===i?"border-primary bg-primary text-on-primary":"border-edge bg-panel text-ink hover:border-primary"}`}>
  <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-row font-display text-[16px] ${picked===i?"bg-on-primary text-highlight":"bg-panel-2 text-muted"}`}>{String.fromCharCode(65+pos)}</span>{o.text}</button>})}</div></fieldset>;
}
// The question as players see it (no best answers): built from the world for solo, sent by the server for live phones.
export type ViewQuestion={type:QuestionType;name:string;steps:1|2;prompt:string;keywords:string[];focus:string|null;choices:string[]|null;choices2:{prompt:string;options:string[]}|null;theories:{id:string;name:string}[]|null;testimony:{speaker:string;text:string}|null;proof:"words"|"lines"|"none";callPassages:{id:string;text:string}[]|null};
export function viewQuestion(q:ExpQuestion,world:WorldPack,callPassages:{id:string;text:string}[]):ViewQuestion{
 const info=TYPE_INFO[q.type];
 return {type:q.type,name:info.name,steps:info.steps,prompt:q.prompt,keywords:q.keywords,focus:q.focus??null,choices:q.choices?.map(o=>o.text)??null,choices2:q.choices2?{prompt:q.choices2.prompt,options:q.choices2.options.map(o=>o.text)}:null,theories:q.theories?.map(t=>({id:t.id,name:t.name}))??null,
  testimony:q.testimony?{speaker:world.characters.find(x=>x.id===q.testimony!.speaker)?.name??"A witness",text:q.testimony.text}:null,proof:q.proof?.words?.length?"words":q.proof?.lines?.length?"lines":"none",callPassages:q.type==="make_call"?callPassages:null};
}
export function KeywordPrompt({prompt,keywords}:{prompt:string;keywords:string[]}){
 return <>{keywordParts(prompt,keywords).map((p,i)=>p.key?<mark key={i} className="rounded-md bg-highlight/25 px-1 text-ink underline decoration-highlight decoration-2 underline-offset-4">{p.text}</mark>:<span key={i}>{p.text}</span>)}</>;
}
// One question, one shot: step 1 the answer (or the call), step 2 the proof: tap the sentence that proves it (or the
// meaning, or two pinned lines for Make the Call). Laid out side by side (app/split-stage.tsx): the passage on the left,
// the question, choices, testimony and timer on the right; on a phone the question is a panel pinned to the bottom.
// Used by the solo race and by every phone in a live game. seed: this student's own answer order.
export function QuestionPanel({vq,passages,chunk,world,tokens,glossary,testifying,draft,setDraft,step,setStep,onLock,headingId="ex-h",seed,timer}:{vq:ViewQuestion;passages:{id:string;text:string}[];chunk:ChunkView;world:WorldPack;tokens:Token[];glossary:WorldPack["glossary"];testifying:boolean;draft:Answer;setDraft:React.Dispatch<React.SetStateAction<Answer>>;step:1|2;setStep:(s:1|2)=>void;onLock:(a:Answer)=>void;headingId?:string;seed?:string;timer?:React.ReactNode}){
 const twoStep=vq.steps===2,needsProofStep=twoStep&&vq.type!=="figure_it_out"&&vq.type!=="make_call";
 const pinned=draft.lines??[];
 const focus=focusTokens(tokens,vq.focus);
 const proofStep=((step===2&&needsProofStep)||vq.type==="find_it"||vq.type==="catch_lie")&&!testifying;
 const callStep=step===2&&vq.type==="make_call";
 // The passage keeps the word the question is about highlighted (never the proof); in the proof step its sentences are tappable.
 const passage=callStep
  ?<ReadingPanel className="mt-1" glossary={glossary} passages={(vq.callPassages??passages) as SourcePassage[]} kept={pinned} onTap={l=>setDraft(d=>{const ls=d.lines??[];return {...d,lines:ls.includes(l.text)?ls.filter(x=>x!==l.text):ls.length>=2?ls:[...ls,l.text]}})}/>
  :<ChunkText chunk={chunk} world={world} tokens={tokens} focus={focus} pick={proofStep?{selected:draft.lines?.[0]??null,onPick:t=>setDraft(d=>({...d,lines:t?[t]:[]}))}:undefined}/>;
 const head=<>{timer}<p className="mt-2 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">{vq.name}{twoStep?` · Step ${step} of 2`:""}</p>
  <h1 id={headingId} className="text-[22px] leading-tight outline-none md:text-[24px]"><KeywordPrompt prompt={vq.prompt} keywords={vq.keywords}/></h1></>;
 const body=<>
  {vq.testimony&&<blockquote className={`mt-3 rounded-card bg-violet p-4 text-on-violet shadow-[0_6px_0_var(--color-violet-shadow)] ${reducedMotion()?"":"rise-in"}`}><p className="text-[12px] font-extrabold uppercase tracking-[.08em]">{vq.testimony.speaker} testifies</p><p className="mt-1 text-[17px] font-bold leading-snug">“{vq.testimony.text}”</p>{testifying&&<p role="status" className="mt-2 text-[13px] font-extrabold">Listen to the whole testimony. The timer starts when it ends.</p>}</blockquote>}
  {step===1&&vq.choices&&<AnswerBars seed={seed} label={vq.prompt} options={vq.choices.map(t=>({text:t}))} picked={draft.choice??null} onPick={i=>{setDraft(d=>({...d,choice:i}));if(twoStep)setStep(2);else onLock({...draft,choice:i})}}/>}
  {step===1&&vq.theories&&<AnswerBars seed={seed} label="Your call" options={vq.theories.map(t=>({text:t.name}))} picked={vq.theories.findIndex(t=>t.id===draft.theory)} onPick={i=>{setDraft(d=>({...d,theory:vq.theories![i].id}));setStep(2)}}/>}
  {step===2&&vq.choices2&&<><p className="mt-3 font-display text-[20px] font-semibold">{vq.choices2.prompt}</p><AnswerBars seed={seed} label={vq.choices2.prompt} options={vq.choices2.options.map(t=>({text:t}))} picked={draft.choice2??null} onPick={i=>onLock({...draft,choice2:i})}/></>}
  {proofStep&&<p className="mt-3 text-[15px] font-bold text-muted">Tap the sentence in the passage that proves it, then lock in.</p>}
  {callStep&&<p className="mt-3 text-[15px] font-bold text-muted">Pin 2 lines from the expedition that back your call ({pinned.length} of 2).</p>}
 </>;
 const action=proofStep?<button type="button" disabled={!draft.lines?.length} onClick={()=>onLock(draft)} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Lock in <ArrowRight size={18} aria-hidden/></button>
  :callStep?<button type="button" disabled={pinned.length!==2} onClick={()=>onLock(draft)} className="case-primary min-h-[56px] w-full justify-center text-[18px]">Lock in my call <ArrowRight size={18} aria-hidden/></button>:null;
 return <SplitStage passage={passage} head={head} body={body} action={action} collapse={proofStep||callStep}/>;
}
// The countdown ring to the next chunk.
export function CountdownRing({ms,total,label}:{ms:number;total:number;label:string}){
 const r=34,c=2*Math.PI*r,share=Math.max(0,Math.min(1,ms/total));
 return <div className="flex flex-col items-center gap-3"><svg width="96" height="96" viewBox="0 0 80 80" aria-hidden><circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-panel)" strokeWidth="8"/><circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-share)} transform="rotate(-90 40 40)"/><text x="40" y="47" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-display)">{Math.ceil(ms/1000)}</text></svg><p className="font-display text-[20px]">{label}</p></div>;
}

// ---------- The solo expedition ----------
export function ExpeditionRace({world,passages,expeditionId,preset,timeSetting="1",highlighter=false,studentKey,onSave,onFinish,onExit}:{world:WorldPack;passages:SourcePassage[];expeditionId:string;preset:string;timeSetting?:string;highlighter?:boolean;studentKey?:string;onSave?:(a:ExpeditionAttempt)=>void;onFinish?:(records:ChunkRecord[])=>void;onExit:()=>void}){
 const [sound,toggleSound]=useSoundPref("effects",preset);
 const chunks=useMemo(()=>expeditionChunks(world,passages,expeditionId),[world,passages,expeditionId]);
 const exp=world.expeditions?.find(e=>e.id===expeditionId);
 const rivalName=world.computer_players?.rival.name??"The Lantern Ghost";
 const iv=exp?.interview;
 const [k,setK]=useState(0),[beat,setBeat]=useState<Beat>(iv?"interview":"read"),[startedAt,setStartedAt]=useState(Date.now());
 const [records,setRecords]=useState<ChunkRecord[]>([]),[ghost,setGhost]=useState<number[]>([]);
 const [gist,setGist]=useState<number|null>(null),[step,setStep]=useState<1|2>(1),[draft,setDraft]=useState<Answer>({});
 const [marking,setMarking]=useState(false),[unknown,setUnknown]=useState<Set<number>>(new Set()),[found,setFound]=useState(false);
 const [testifying,setTestifying]=useState(false),[paused,setPaused]=useState(false),[autoLeft,setAutoLeft]=useState(0);
 const [fixed,setFixed]=useState<boolean[]>([]),[notesText,setNotesText]=useState<Record<number,string>>({});
 // The Interview: one liar per student and expedition, the same every time this student plays it (saved with progress).
 const liar=useMemo(()=>liarIndex(studentKey??soloStudentKey(),expeditionId,iv?.witnesses.length??3),[studentKey,expeditionId,iv]);
 const [cards,setCards]=useState<number[]>(()=>loadCards(world.id,expeditionId)),[liarAnswer,setLiarAnswer]=useState<LiarAnswer|null>(null);
 const liarResult=iv&&liarAnswer?liarCheck(iv,liar,liarAnswer):null;
 const c=chunks[k];const tokens=useMemo(()=>c?chunkTokens(c.lines):[],[c]);const q=c?.chunk.question;
 const go=useCallback((b:Beat)=>{setBeat(b);setStartedAt(Date.now())},[]);
 useStickyOffsets();
 // This student's own answer order for every set of choices (stable on reload, different for each student).
 const seedKey=useMemo(()=>studentKey??soloStudentKey(),[studentKey]);
 useLayoutEffect(()=>{focusScreenTop()},[beat,k,step]);
 // Timers: Gist 20 seconds; the question by its type (Catch the Lie starts after the testimony).
 const qSeconds=q?limitMs(TYPE_INFO[q.type].seconds,timeSetting)/1000:0,gSeconds=limitMs(GIST_SECONDS,timeSetting)/1000;
 const gistLeft=useBeatClock(startedAt,beat==="gist"?gSeconds:null);
 const qLeft=useBeatClock(startedAt,beat==="question"&&!testifying?qSeconds:null);
 const record=records[k];
 // Your points through a chunk: the question plus the Gist check.
 const mine=(upto:number)=>records.slice(0,upto+1).reduce((a,r,i)=>a+(r?.points??0)+(r&&r.gist!==null?gistPoints(chunks[i].chunk,r.gist):0),0);
 const score=mine(records.length-1)+(liarResult?.points??0);
 const coins=records.reduce((a,r)=>a+(r?.coins??0),0)+(found&&!record?DISCOVERY_COINS:0);
 const streak=(()=>{let s=0;for(let i=records.length-1;i>=0;i--){if(records[i]?.correct)s++;else break}return s})();

 function startChunk(n:number){setK(n);setGist(null);setStep(1);setDraft({});setMarking(false);setUnknown(new Set());setFound(false);setPaused(false);go("read")}
 function toQuestion(){setStep(1);setDraft({});const isLie=c?.chunk.question.type==="catch_lie";setTestifying(isLie);go("question")}
 // Catch the Lie: the testimony plays first (about 3 seconds, or at once with reduced motion), then its 45 seconds start.
 useEffect(()=>{if(!testifying)return;const t=setTimeout(()=>{setTestifying(false);setStartedAt(Date.now())},reducedMotion()?0:TESTIMONY_MS);return()=>clearTimeout(t)},[testifying]);
 // Gist: a pick (or time) moves on to the question after a beat.
 useEffect(()=>{if(beat!=="gist")return;if(gistLeft===0)toQuestion()},[gistLeft,beat]);// eslint-disable-line react-hooks/exhaustive-deps
 function pickGist(i:number){if(gist!==null)return;setGist(i);cue(sound,gistPoints(c.chunk,i)?"chime":"tick");setTimeout(toQuestion,reducedMotion()?200:900)}
 function lockIn(a:Answer){
  if(beat!=="question"||record)return;
  const res=scoreAnswer(q!,a,tokens,Date.now()-startedAt,limitMs(TYPE_INFO[q!.type].seconds,timeSetting));
  const g=ghostPlay(world.id+expeditionId,k,limitMs(TYPE_INFO[q!.type].seconds,timeSetting));
  const next=[...records];next[k]={gist,answer:a,correct:res.correct,points:res.points,late:res.late,coins:found?DISCOVERY_COINS:0,unknown:[...unknown].map(i=>tokens[i]?.text.replace(/[^\p{L}'-]/gu,"")).filter(Boolean),discovered:found};
  setRecords(next);setGhost(x=>{const n=[...x];n[k]=g.points+g.gist;return n});cue(sound,res.correct?"chime":"reveal");go("result");
 }
 // Time's up: whatever is picked counts, which is a miss.
 useEffect(()=>{if(beat==="question"&&qLeft===0&&!record)lockIn(draft)},[qLeft]);// eslint-disable-line react-hooks/exhaustive-deps
 // The automatic screens: result, then the leaderboard, then the countdown, then the next chunk. Pause holds them.
 const deadline=useRef(0),remaining=useRef(0);
 useEffect(()=>{const kind=AUTO[beat];if(!kind)return;remaining.current=screenMs(kind,timeSetting);deadline.current=Date.now()+remaining.current;setAutoLeft(remaining.current)},[beat,k,timeSetting]);
 useEffect(()=>{const kind=AUTO[beat];if(!kind||paused)return;deadline.current=Date.now()+remaining.current;
  const t=setInterval(()=>{const left=Math.max(0,deadline.current-Date.now());remaining.current=left;setAutoLeft(left);if(left===0){clearInterval(t);
   if(beat==="result")go("board");else if(beat==="board")go("countdown");else if(beat==="countdown"){if(k+1>=chunks.length){if(iv)go("liar");else{go("finish");onFinish?.(records)}}else startChunk(k+1)}}},100);
  return()=>clearInterval(t)},[beat,paused,k]);// eslint-disable-line react-hooks/exhaustive-deps

 // After the race: the results for Case Notes, and the Refresher (misses only, up to 4).
 const results:ChunkResult[]=records.map((r,i)=>({index:i,answer:r?.answer??null,correct:!!r?.correct,late:!!r?.late,gist:r?.gist??null,typed:null,unknown:r?.unknown??[]}));
 const refItems=refresherItems(chunks,results,!!liarResult&&!liarResult.solved);
 const callAll=joinedPassages(chunks);
 const lie=iv?{name:witnessName(world,iv.witnesses[liar].character),lieText:iv.witnesses[liar].lie.text,lines:iv.witnesses[liar].lie.lines}:null;
 const refViews:RefresherView[]=refItems.map(it=>refresherView(it,chunks,callAll,lie));
 const attemptId=useMemo(()=>{try{return crypto.randomUUID()}catch{return `a${Date.now()}${Math.random().toString(36).slice(2)}`}},[]),startedIso=useMemo(()=>new Date().toISOString(),[]),finishedIso=useRef<string|null>(null);
 function save(complete:boolean){if(!onSave||!iv&&records.length<chunks.length)return;finishedIso.current??=new Date().toISOString();
  const liarAt=refItems.findIndex(x=>x.kind==="liar");
  onSave({attemptId,worldId:world.id,expeditionId,startedAt:startedIso,finishedAt:finishedIso.current,complete,score,notes:caseNotes(chunks,results,{items:refItems,fixed},notesText),
   interview:iv?interviewNote(world,iv,liar,cards,liarAnswer,liarAt>=0?!!fixed[liarAt]:null):null,award:complete?refresherAward(refItems,fixed):null})}
 const saved=useRef(false);
 useEffect(()=>{if(beat==="finish"&&!saved.current){saved.current=true;save(false)}},[beat]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!c||!q||!exp)return null;
 const info=TYPE_INFO[q.type];
 const names=new Map([["me","You"],["ghost",rivalName]]);
 const theirs=(upto:number)=>ghost.slice(0,upto+1).reduce((a,x)=>a+(x??0),0);
 // Name the Liar counts on the final board (and can change who wins).
 const liarPts=beat==="finish"?liarResult?.points??0:0;
 const board:BoardRow[]=raceBoard(new Map([["me",mine(k-1)],["ghost",theirs(k-1)]]),new Map([["me",mine(k)+liarPts],["ghost",theirs(k)]]),names);
 const meRow=board.find(r=>r.id==="me");
 const hud=<RaceHud score={score} streak={streak} coins={coins} sound={sound} onSound={toggleSound} chunk={k+1} total={chunks.length} left={beat==="gist"?gistLeft:beat==="question"&&!testifying?qLeft:null} title={exp.title}/>;
 const shown=proofShown(q,tokens);
 // The lines a proof step taps: this chunk's, or for Make the Call every chunk of the expedition so far.
 const callPassages=joinedPassages(chunks.slice(0,k+1));

 return <div className="race-root case-ui mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-16 pt-3">
  {beat!=="refresher"&&beat!=="notes"&&beat!=="interview"&&hud}
  {beat==="interview"&&iv&&<InterviewScreen world={world} expeditionId={expeditionId} interview={iv} liar={liar} onDone={cs=>{setCards(cs);saveCards(world.id,expeditionId,cs);startChunk(0)}}/>}
  {beat==="liar"&&iv&&<NameTheLiar seed={`${seedKey}|${expeditionId}`} world={world} said={interviewStatements(world,iv,liar,cards)} passages={callAll} onLock={a=>{setLiarAnswer(a);const r=liarCheck(iv,liar,a);cue(sound,r.solved?"streak":"reveal");go("verdict")}}/>}
  {beat==="verdict"&&iv&&liarResult&&<LiarVerdict world={world} expeditionId={expeditionId} interview={iv} liar={liar} solved={liarResult.solved} named={liarResult.named} passages={callAll} onNext={()=>{go("finish");onFinish?.(records)}}/>}
  {beat==="read"&&<section aria-labelledby="ex-h"><p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Read · no timer</p><h1 id="ex-h" className="text-[28px] outline-none">Read the chunk</h1>
   {highlighter&&<button type="button" aria-pressed={marking} onClick={()=>setMarking(m=>!m)} className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold ${marking?"bg-gold text-on-gold":"bg-panel text-ink"}`}><Highlighter size={16} aria-hidden/>{marking?"Done marking":"Mark words I don't know"}</button>}
   <div className="mt-3"><ChunkText explore chunk={{lines:c.lines,discovery:c.chunk.discovery}} world={world} tokens={tokens} highlighter={highlighter} marking={marking} unknown={unknown} onUnknown={i=>setUnknown(s=>{const n=new Set(s);if(n.has(i))n.delete(i);else n.add(i);return n})} onDiscover={()=>{if(!found){setFound(true);cue(sound,"chime",0.3)}}} found={found}/></div>
   <button type="button" onClick={()=>go("gist")} className="case-primary mt-4 min-h-[56px] w-full justify-center text-[18px]">Ready <ArrowRight size={18} aria-hidden/></button></section>}

  {beat==="gist"&&<SplitStage label="Gist check" passage={<ChunkText chunk={{lines:c.lines,discovery:c.chunk.discovery}} world={world} tokens={tokens}/>}
   head={<><TimerTrack left={gistLeft} seconds={gSeconds}/><p className="mt-3 text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Gist check · {GIST_SECONDS} seconds</p><h1 id="ex-h" className="text-[28px] outline-none">Which is the best summary?</h1></>}
   body={<AnswerBars seed={`${seedKey}|${c.id}|gist`} label="Which is the best summary?" options={c.chunk.gist.options} picked={gist} onPick={pickGist} disabled={gist!==null}/>}/>}

  {beat==="question"&&<QuestionPanel seed={`${seedKey}|${c.id}`} timer={<TimerTrack left={testifying?qSeconds:qLeft} seconds={qSeconds}/>} vq={viewQuestion(q,world,callPassages)} passages={c.passages} chunk={{lines:c.lines,discovery:c.chunk.discovery}} world={world} tokens={tokens} glossary={world.glossary} testifying={testifying} draft={draft} setDraft={setDraft} step={step} setStep={setStep} onLock={lockIn}/>}

  {beat==="result"&&record&&<section aria-labelledby="ex-h" aria-live="assertive">
   {record.correct
    ?<div className="mt-8 flex flex-col items-center gap-3"><p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{record.points.toLocaleString()}</p>
     <div className="moment-pop w-full rounded-[24px] bg-success p-5 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{info.name}{streak>1?` · Streak x${streak}`:""}</p><h1 id="ex-h" className="mt-1 text-[40px] leading-none outline-none">Proof!<span className="sr-only"> Plus {record.points} points.</span></h1><p className="mt-2 text-[16px] font-bold">{q.why}</p></div></div>
    :<div className="notyet-shake mt-3 rounded-[24px] bg-notyet p-5 text-on-notyet shadow-[0_8px_0_var(--color-notyet-shadow)]"><p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{info.name}{record.late?" · Time's up":""}</p><h1 id="ex-h" className="mt-1 text-[36px] leading-none outline-none">Not yet.</h1><p className="mt-2 text-[17px] font-bold">You'll get another shot in the Refresher.</p></div>}
   {q.type==="make_call"
    ?<><p className="mt-3 text-[13px] font-extrabold uppercase tracking-[.08em] text-highlight">{record.correct?"The proof":"Here's the proof"}</p><ReadingPanel className="mt-1" glossary={world.glossary} passages={callPassages as SourcePassage[]} results={shown.lines.map(l=>({line:l,ok:true}))} onTap={()=>{}} locked/></>
    :<div className="mt-3"><ChunkText chunk={{lines:c.lines,discovery:c.chunk.discovery}} world={world} tokens={tokens} shown={proofTokens(q,tokens,c.lines)} shownStyle={record.correct?"right":"missed"}/></div>}
  </section>}

  {(beat==="board"||beat==="countdown")&&<section aria-labelledby="ex-h">
   <p role="status" className="sr-only">{record?.correct?`Plus ${record.points} points.`:"No points this time."} You're number {meRow?.rank} of 2.</p>
   <div className="flex items-center justify-between gap-3"><h1 id="ex-h" className="text-[28px] outline-none">{beat==="board"?"Leaderboard":"Next chunk"}</h1>
    <button type="button" onClick={()=>setPaused(p=>!p)} aria-pressed={paused} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-panel px-4 font-display text-[16px] font-semibold">{paused?<><Play size={16} aria-hidden/>Resume</>:<><Pause size={16} aria-hidden/>Pause</>}</button></div>
   <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
    <div className="rounded-[18px] bg-success p-3 text-on-success shadow-[0_5px_0_var(--color-success-shadow)]"><p className="font-display text-[24px] font-bold tabular-nums">+{(meRow?.gained??0).toLocaleString()}</p><p className="text-[13px] font-extrabold">this chunk</p></div>
    <div className="rounded-[18px] bg-gold p-3 text-on-gold shadow-[0_5px_0_var(--color-gold-shadow)]"><p className="font-display text-[24px] font-bold">{(meRow?.move??0)>0?`Up ${meRow!.move}`:(meRow?.move??0)<0?`Down ${-meRow!.move}`:`#${meRow?.rank}`}</p><p className="text-[13px] font-extrabold">now #{meRow?.rank} of 2</p></div>
    <div className="rounded-[18px] bg-panel p-3 text-ink shadow-[0_5px_0_#0B0920]"><p className="font-display text-[24px] font-bold">{record?.correct?<Check className="mx-auto" size={28} aria-hidden/>:<X className="mx-auto" size={28} aria-hidden/>}</p><p className="text-[13px] font-extrabold text-muted">{record?.correct?"found it":"missed"}</p></div>
   </div>
   {beat==="board"?<Leaderboard rows={board} meId="me" title="Top 5"/>:<div className="mt-8"><CountdownRing ms={autoLeft} total={screenMs("countdown",timeSetting)} label={k+1>=chunks.length?"Final results":`Chunk ${k+2} of ${chunks.length}`}/></div>}
   {paused&&<p className="mt-3 text-center text-[15px] text-muted">Paused. Take your time.</p>}
   {!paused&&<p aria-hidden className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-muted"><Timer size={14}/>Moving on in {Math.ceil(autoLeft/1000)}s</p>}
  </section>}

  {beat==="finish"&&<section className="mt-4"><Podium main sound={sound} entries={board.map(r=>({id:r.id,name:r.name,points:r.points}))} title="Final results"/>
   <p className="mt-6 text-center text-[16px] text-muted">Every point came from a line you proved in the story.</p>
   <button type="button" onClick={()=>go("refresher")} className="case-primary mt-5 min-h-[52px] w-full justify-center">{refItems.length?`Refresher: fix ${refItems.length}`:"Refresher"} <ArrowRight size={18} aria-hidden/></button></section>}
  {beat==="refresher"&&<Refresher seed={seedKey} items={refViews} world={world} check={(i,a)=>{const it=refItems[i];return refresherShown(it,chunks,refresherCorrect(it,chunks[it.index],a,callAll.flatMap(p=>evidenceSentences(p.text)),lie?.lines),lie?.lines)}} onDone={f=>{setFixed(f);go("notes")}}/>}
  {beat==="notes"&&<CaseNotesView onDone={()=>{save(true);onExit?.()}} interview={iv?interviewNote(world,iv,liar,cards,liarAnswer,refItems.findIndex(x=>x.kind==="liar")>=0?!!fixed[refItems.findIndex(x=>x.kind==="liar")]:null):null} student="You" story={world.title} expedition={exp.title} notes={caseNotes(chunks,results,{items:refItems,fixed},notesText)} award={refresherAward(refItems,fixed)} onNote={(i,t)=>setNotesText(n=>({...n,[i]:t}))}
   bonus={<p className="no-print rounded-card bg-violet-soft p-4 text-[16px] font-bold">Bonus Round: in class, your squad compares Case Notes and agrees on the best proof for every question you answered differently.</p>} />}
 </div>;
}

// Solo: a per-browser key, so a student meets the same liar every time; the cards they asked are saved with it.
function soloStudentKey(){try{let k=localStorage.getItem("textlab:student-key");if(!k){k=crypto.randomUUID?.()??String(Math.random()).slice(2);localStorage.setItem("textlab:student-key",k)}return k}catch{return "guest"}}
function loadCards(world:string,exp:string):number[]{try{const v=JSON.parse(localStorage.getItem(`textlab:interview:${world}:${exp}`)??"[]");return Array.isArray(v)?v.filter(Number.isInteger):[]}catch{return []}}
function saveCards(world:string,exp:string,cards:number[]){try{localStorage.setItem(`textlab:interview:${world}:${exp}`,JSON.stringify(cards))}catch{}}
