"use client";
// Cards that slide in over the storybook page. The page underneath never moves or reloads, and closing a card
// returns focus to whatever opened it.
import {useEffect,useId,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Lock,MessageCircle,Quote,X} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {frameKey,isSpeakerLine,pageUnits,quoteInText,scriptPieces,splitSentences,type StoryPage} from "@/lib/storybook";
import {CLASS_AI_OFF,evidenceLabel,isDone,useClueSteps,type Clue,type Scene} from "../clue-steps";
import {recordFactCheck} from "../case-game";
import type {Demo} from "../page";
import {lineSpacings,textSizes,type ReaderPrefs} from "./prefs";
import {HomeText} from "../bilingual";

export function Drawer({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}){
 const headingId=useId(),heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{const opener=document.activeElement as HTMLElement|null;heading.current?.focus({preventScroll:true});return()=>{opener?.focus?.({preventScroll:true})}},[]);
 useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==="Escape"){e.stopPropagation();onClose()}};window.addEventListener("keydown",esc);return()=>window.removeEventListener("keydown",esc)},[onClose]);
 return <div className="absolute inset-0 z-30 flex justify-end">
  <button type="button" aria-label="Close card" tabIndex={-1} onClick={onClose} className="sb-scrim absolute inset-0 bg-[#2A2620]/25"/>
  <section role="dialog" aria-modal="true" aria-labelledby={headingId} className={`sb-drawer relative flex h-full w-full ${wide?"max-w-[600px]":"max-w-[440px]"} flex-col bg-[#FFFDF8] shadow-[-18px_0_50px_-20px_rgba(42,38,32,.45)]`}>
   <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E4DCCB] px-5 py-3"><h2 id={headingId} ref={heading} tabIndex={-1} className="text-[20px] font-bold outline-none">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full text-[#6B6457] hover:bg-[#EFE8D8]"><X size={22}/></button></header>
   <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
  </section>
 </div>;
}

type Vocab=NonNullable<WorldPack["storybook"]>["vocabulary"][number];
export function WordCard({entry,sentence,word}:{entry:Vocab;sentence:string;word:string}){
 const parts=sentence.split(new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"i"));
 return <div className="space-y-5">
  <div><p className="text-[28px] font-bold leading-tight">{entry.term}</p>{entry.part_of_speech&&<p className="text-[15px] italic text-[#6B6457]">{entry.part_of_speech}</p>}</div>
  <p className="text-[18px] leading-7">{entry.definition}</p>
  <div className="rounded-2xl bg-[#F4E1D6]/60 p-4"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">In this sentence</p><p className="mt-2 font-serif text-[17px] leading-7">{parts.map((p,i)=>p.toLowerCase()===word.toLowerCase()?<mark key={i} className="rounded bg-[#A0472C] px-1 text-white">{p}</mark>:<span key={i}>{p}</span>)}</p></div>
  {(entry.es_term||entry.es_definition)&&<div lang="es" className="rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Español</p><p className="mt-1 text-[19px] font-semibold">{entry.es_term}</p><p className="mt-1 text-[16px] leading-6">{entry.es_definition}</p></div>}
 </div>;
}

export function SayCard({sentence,restatement,speaker}:{sentence:string;restatement:string|undefined;speaker?:string}){
 const [tried,setTried]=useState(false);
 return <div className="space-y-5">
  {speaker&&<p className="text-[15px] font-semibold text-[#8A3B23]"><span className="sb-speaker">{speaker}</span> says:</p>}
  <blockquote className="rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[18px] leading-8">{sentence}</blockquote>
  {!tried?<><p className="text-[17px] leading-7">First, say it in your own words. You can whisper it or think it.</p><button type="button" onClick={()=>setTried(true)} className="case-primary w-full">I tried <Check size={18}/></button></>
  :<div className="case-rise rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">In plain words</p><p className="mt-2 text-[18px] leading-7">{restatement??"This sentence doesn't have a plain-words version yet. Read it once more, slowly."}</p><p className="mt-3 text-[14px] text-[#6B6457]">How close was yours?</p></div>}
 </div>;
}

// offstage: someone the characters talk about who never appears (Trifles' Mrs. Wright).
export function WhoCard({characters}:{characters:{id:string;name:string;description:string;offstage?:boolean}[]}){
 if(!characters.length)return <p className="text-[17px]">You haven't met anyone yet.</p>;
 return <ul className="space-y-3">{characters.map(c=><li key={c.id} className="rounded-2xl bg-[#EFE8D8] p-4"><p className="text-[18px] font-bold">{c.name}{c.offstage&&<span className="ml-2 align-middle text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Talked about, never seen</span>}</p><p className="mt-1 text-[16px] leading-6 text-[#4A4438]">{c.description}</p></li>)}</ul>;
}

// spanish/onSpanish is the home-language setting (Spanish help in the briefing and question cards); the word card always shows Spanish.
export function ReadingMenu({prefs,update,spanish,onSpanish,showView=true}:{prefs:ReaderPrefs;update:(p:Partial<ReaderPrefs>)=>void;spanish?:boolean;onSpanish?:(on:boolean)=>void;showView?:boolean}){
 const group=(label:string,options:[string,boolean,()=>void][])=><fieldset className="mt-5 first:mt-0"><legend className="text-[15px] font-semibold">{label}</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{options.map(([text,on,act])=><button key={text} type="button" aria-pressed={on} onClick={act} className={`min-h-12 rounded-2xl px-4 text-[16px] font-semibold ${on?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620] hover:bg-[#E4DCCB]"}`}>{text}</button>)}</div></fieldset>;
 return <div>
  {showView&&group("View",[["Picture + text",prefs.view==="art",()=>update({view:"art"})],["Text only",prefs.view==="text",()=>update({view:"text"})]])}
  {group("Text size",textSizes.map((px,i)=>[["Small","Medium","Large","Extra large"][i],prefs.size===i,()=>update({size:i as ReaderPrefs["size"]})] as [string,boolean,()=>void]))}
  {group("Line spacing",lineSpacings.map((_,i)=>[["Snug","Normal","Roomy"][i],prefs.spacing===i,()=>update({spacing:i as ReaderPrefs["spacing"]})] as [string,boolean,()=>void]))}
  {group("Font",[["Standard",prefs.font==="standard",()=>update({font:"standard"})],["Dyslexia-friendly",prefs.font==="dyslexia",()=>update({font:"dyslexia"})]])}
  {onSpanish&&group("Spanish support",[["Off",!spanish,()=>onSpanish(false)],["Español",!!spanish,()=>onSpanish(true)]])}
  <p className="mt-6 text-[14px] leading-6 text-[#6B6457]">Your choices last until you close this browser tab. Animations follow your device's reduce-motion setting.</p>
 </div>;
}

// The page's gate: every clue that lives on this page, then the ask → prove → explain steps for the one picked.
export function QuestionCard({world,roleId,items,demo,setDemo,passages,onAllDone,lastPage,reading}:{world:WorldPack;roleId:string;items:{clue:Clue;scene:Scene}[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];onAllDone:()=>void;lastPage:boolean;reading:{throughParagraph:string;characters:string[]}}){
 const [open,setOpen]=useState(""),[note,setNote]=useState("");
 const current=items.find(x=>x.clue.id===open);
 if(current)return <ClueSteps key={current.clue.id} world={world} scene={current.scene} clue={current.clue} roleId={roleId} demo={demo} setDemo={setDemo} passages={passages} reading={reading} onBack={()=>setOpen("")} onSaved={factCheck=>{const badge=factCheck?recordFactCheck(`${world.id}:${current.clue.id}`):false;setNote(badge?"Badge earned: Fact Checker. You used the story to prove a character wrong.":"Clue proven and saved to your case file.");setOpen("")}}/>;
 const done=items.filter(x=>isDone(demo,x.clue.id)).length,all=done===items.length;
 return <div className="space-y-4">
  <p className="text-[17px] leading-7">{all?"Every clue on this page is proven.":`Prove ${items.length===1?"the clue":`all ${items.length} clues`} on this page to turn to the next one.`}</p>
  {note&&<p role="status" className="rounded-2xl bg-[#2A2620] px-4 py-3 text-[15px] text-white"><Check size={16} className="mr-2 inline"/>{note}</p>}
  <ul className="space-y-3">{items.map(({clue})=>{const dn=isDone(demo,clue.id);return <li key={clue.id}><button type="button" onClick={()=>{setNote("");setOpen(clue.id)}} className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left ${dn?"bg-[#EFE8D8]":"bg-[#F4E1D6] ring-2 ring-[#A0472C]"}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${dn?"bg-[#FFFDF8] text-[#A0472C]":"bg-[#A0472C] text-white"}`}>{dn?<Check size={20}/>:<Quote size={18}/>}</span><span className="min-w-0 flex-1"><span className="block text-[17px] font-semibold leading-snug">{clue.name}</span><span className="text-[14px] text-[#6B6457]">{dn?"Proven · tap to review":evidenceLabel[clue.evidence_type]}</span></span><ArrowRight size={18} className="shrink-0 text-[#A0472C]"/></button></li>})}</ul>
  {all&&<button type="button" onClick={onAllDone} className="case-primary w-full">{lastPage?"Close the case":"Turn the page"} <ArrowRight size={18}/></button>}
 </div>;
}

function ClueSteps({world,scene,clue,roleId,demo,setDemo,passages,reading,onBack,onSaved}:{world:WorldPack;scene:Scene;clue:Clue;roleId:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];reading:{throughParagraph:string;characters:string[]};onBack:()=>void;onSaved:(factCheck:boolean)=>void}){
 const s=useClueSteps({world,scene,clue,roleId,demo,setDemo,passages,reading});
 const script=world.storybook?.format==="script";
 const box=useRef<HTMLTextAreaElement>(null);
 return <div aria-live="polite">
  <div className="flex items-center justify-between gap-3"><button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> All clues</button><ol className="flex gap-2" aria-label={`Step ${s.stepNo} of ${s.steps.length}`}>{s.steps.map((x,i)=><li key={x} className={`h-2 rounded-full ${i<s.stepNo?"w-8 bg-[#A0472C]":"w-4 bg-[#E4DCCB]"}`}/>)}</ol></div>
  <p className="mt-3 text-[14px] font-semibold text-[#8A3B23]">{evidenceLabel[clue.evidence_type]}</p>
  <h3 className="text-[23px] font-bold leading-tight">{clue.name}</h3>
  {s.step==="ask"&&(s.char?<div className="mt-4">
   <p className="text-[17px] font-semibold">Ask {s.chars.length>1?"a character":s.char.name}</p><p className="text-[15px] text-[#6B6457]">Characters can be wrong. You'll check the answer in the story next.</p>
   {s.chars.length>1&&<div className="mt-3 flex flex-wrap gap-2">{s.chars.map(c=><button type="button" key={c.id} onClick={()=>s.setCharacter(c.id)} className={`min-h-11 rounded-full px-4 text-[15px] font-semibold ${s.character===c.id?"bg-[#2A2620] text-white":"bg-[#EFE8D8]"}`}>{c.name}</button>)}</div>}
   {!s.reply&&!s.busy&&<div className="mt-3 flex flex-col gap-2">{s.suggestions.map(q=><button type="button" key={q} onClick={()=>s.ask(q)} className="rounded-2xl bg-[#F4E1D6] px-4 py-3 text-left text-[16px] hover:bg-[#EDD3C4]"><MessageCircle size={16} className="mr-2 inline text-[#A0472C]"/>{q}</button>)}</div>}
   {(s.asked||s.busy)&&<div className="mt-4 space-y-3"><p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#2A2620] px-4 py-3 text-[16px] text-white">{s.asked}</p><div className="max-w-[92%] rounded-2xl rounded-bl-md bg-[#EFE8D8] px-4 py-3 text-[16px] leading-7"><p className="text-[13px] font-semibold text-[#8A3B23]">{s.char.name}</p>{s.busy?<p className="text-[#6B6457]">Thinking…</p>:<p>{s.reply}</p>}</div></div>}
   <form onSubmit={e=>{e.preventDefault();s.ask(s.question)}} className="mt-3 flex gap-2"><label className="sr-only" htmlFor="sb-ask">Your question</label><input id="sb-ask" value={s.question} onChange={e=>s.setQuestion(e.target.value)} maxLength={300} placeholder={s.reply?"Ask a follow-up…":"Or type your own question…"} className="min-w-0 flex-1 rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#A0472C]"/><button disabled={s.busy||!s.question.trim()} className="rounded-2xl bg-[#2A2620] px-4 text-[15px] font-semibold text-white disabled:opacity-40">Ask</button></form>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={()=>s.setStep("prove")} className="min-h-11 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Skip, I'll look myself</button>{s.reply&&<button type="button" onClick={()=>s.setStep("prove")} className="case-primary">Check it in the story <ArrowRight size={18}/></button>}</div>
  </div>:<p className="mt-4">{CLASS_AI_OFF}</p>)}
  {s.step==="prove"&&<div className="mt-4">
   <p className="text-[17px] font-semibold">{s.asked?"Prove it or disprove it":"Find your proof"}</p>
   <p className="text-[16px] leading-7 text-[#4A4438]">{s.asked?`Tap the line that shows whether ${s.char?.name??"the character"} was right.`:s.notice}</p>{!s.asked&&<HomeText text={s.notice}/>}
   <div className="mt-3 space-y-3 rounded-2xl bg-[#F6F0E3] p-4 font-serif text-[17px] leading-8">{s.source.map(p=>script&&isSpeakerLine(p.text)?<p key={p.id} className="sb-speaker -mb-2">{p.text.trim().replace(/\.$/,"")}</p>:<p key={p.id}>{(script?scriptPieces(p.text):splitSentences(p.text).map(t=>({text:t,full:t,stage:false}))).map((piece,i)=>{const line=piece.full,picked=s.proof?.text===line;return <button type="button" key={i} onClick={()=>s.setProof({text:line,pid:p.id})} aria-pressed={picked} className={`mr-1 inline rounded-md px-0.5 text-left ${piece.stage?"italic":""} ${picked?"bg-[#A0472C] text-white":"hover:bg-[#F4E1D6]"}`}><Emph text={piece.text}/></button>})}</p>)}</div>
   {s.asked&&s.proof&&<div className="mt-3"><p className="text-[15px] font-semibold">This line…</p><div className="mt-2 grid grid-cols-2 gap-2">{[["supports","Backs them up"],["contradicts","Proves them wrong"]].map(([v,l])=><button type="button" key={v} aria-pressed={s.stance===v} onClick={()=>s.setStance(v)} className={`min-h-12 rounded-2xl px-3 text-[16px] font-semibold ${s.stance===v?"bg-[#2A2620] text-white":"bg-[#EFE8D8]"}`}>{l}</button>)}</div></div>}
   <div className="mt-4 flex justify-end"><button type="button" disabled={!s.proof||(!!s.asked&&!s.stance)} onClick={()=>{s.setStep("explain");setTimeout(()=>box.current?.focus(),50)}} className="case-primary disabled:opacity-40">Use this line <ArrowRight size={18}/></button></div>
  </div>}
  {s.step==="explain"&&<div className="mt-4">
   <p className="text-[17px] font-semibold">What does it show?</p><p className="text-[16px] leading-7 text-[#4A4438]">{s.interpret}</p><HomeText text={s.interpret}/>
   {s.proof&&<blockquote className="mt-3 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[16px] leading-7">{s.proof.text}</blockquote>}
   <div className="mt-3 flex flex-wrap gap-2">{["This line shows…","I think this means… because…","This proves… was wrong because…"].map(t=><button type="button" key={t} onClick={()=>{s.setExplain(v=>v?v+" "+t:t);box.current?.focus()}} className="min-h-10 rounded-full bg-[#EFE8D8] px-3 text-[14px] hover:bg-[#E4DCCB]">{t}</button>)}</div>
   <label htmlFor="sb-explain" className="sr-only">Your answer</label>
   <textarea id="sb-explain" ref={box} value={s.explain} onChange={e=>s.setExplain(e.target.value)} rows={4} maxLength={1200} placeholder="Write it in your own words…" className="mt-3 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px] leading-7 outline-none focus:border-[#A0472C]"/>
   <div className="mt-4 flex items-center justify-between gap-3"><button type="button" onClick={()=>s.setStep("prove")} className="min-h-11 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Change my line</button><button type="button" disabled={!s.explain.trim()||!s.proof} onClick={()=>{const info=s.save();if(info)onSaved(info.factCheck)}} className="case-primary disabled:opacity-40"><Check size={18}/> Save this clue</button></div>
  </div>}
 </div>;
}

// Picture frames. Pages with a planned picture ask for one missing detail; later pages ask the student to describe the
// whole picture. Both need a supporting quote from this page. AI checking and image creation arrive in the next build.
export function FrameCard({worldId,page,pageText,demo,setDemo,onSkip,onContinue,lastPage}:{worldId:string;page:StoryPage;pageText:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onSkip:()=>void;onContinue:()=>void;lastPage:boolean}){
 const kind=page.mode==="add_detail"?"add_detail":"student";
 const key=frameKey(worldId,page.id),saved=demo.storyFrames?.[key];
 const [description,setDescription]=useState(saved?.description??""),[quote,setQuote]=useState(saved?.quote??""),[status,setStatus]=useState("");
 const quoteOk=quote.trim()?quoteInText(quote,pageText):null;
 const ready=description.trim().length>=8&&quoteOk===true;
 function save(){if(!ready)return;setDemo(d=>({...d,storyFrames:{...(d.storyFrames??{}),[key]:{...(d.storyFrames?.[key]??{}),kind,description:description.trim(),quote:quote.trim(),saved_at:new Date().toISOString()}}}));setStatus("Saved. You can change it any time.")}
 return <div className="space-y-4">
  <p className={`w-fit rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-wide ${page.frame_required?"bg-[#A0472C] text-white":"bg-[#EFE8D8] text-[#6B6457]"}`}>{page.frame_required?"Needed to turn the page":"Optional"}</p>
  <p className="text-[17px] leading-7">{kind==="add_detail"?"Something the story describes is missing from this picture. Add one detail, then copy the words from the page that show it.":`${page.frame_prompt??"Picture this page in your mind. Describe what you see: who is there, where they are, what is happening, the light and the colors."} Then copy the words from the page that support it.`}</p>
  {page.no_generation&&<p className="rounded-2xl bg-[#EFE8D8] px-4 py-3 text-[15px] leading-6">{page.no_generation_reason}</p>}
  <div><label htmlFor="sb-desc" className="text-[15px] font-semibold">{kind==="add_detail"?"The detail I would add":"My picture"}</label><textarea id="sb-desc" value={description} onChange={e=>{setDescription(e.target.value);setStatus("")}} rows={kind==="add_detail"?2:4} maxLength={kind==="add_detail"?300:600} className="mt-1 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px] leading-7 outline-none focus:border-[#A0472C]"/></div>
  <div><label htmlFor="sb-quote" className="text-[15px] font-semibold">The words from the page that show it</label><textarea id="sb-quote" value={quote} onChange={e=>{setQuote(e.target.value);setStatus("")}} rows={2} maxLength={400} aria-describedby="sb-quote-status" className="mt-1 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 font-serif text-[17px] leading-7 outline-none focus:border-[#A0472C]"/>
   <p id="sb-quote-status" className={`mt-1 text-[14px] ${quoteOk?"text-[#3F6B3A]":quoteOk===false?"text-[#8A3B23]":"text-[#6B6457]"}`}>{quoteOk?<><Check size={14} className="mr-1 inline"/>Found on this page.</>:quoteOk===false?"We can't find those words on this page yet. Copy at least three words in a row; capitals and punctuation don't matter.":"Copy at least three words in a row from this page."}</p></div>
  <button type="button" disabled={!ready} onClick={save} className="case-primary w-full disabled:opacity-40"><Check size={18}/> Save my {kind==="add_detail"?"detail":"picture description"}</button>
  {status&&<p role="status" className="text-[15px] text-[#3F6B3A]">{status}</p>}
  {saved&&page.frame_required&&<button type="button" onClick={onContinue} className="case-secondary w-full justify-center">{lastPage?"Close the case":"Turn the page"} <ArrowRight size={18}/></button>}
  {!page.frame_required&&!saved&&<button type="button" onClick={onSkip} className="min-h-11 w-full rounded-2xl text-[16px] font-semibold text-[#6B6457] hover:bg-[#EFE8D8]">Skip this picture</button>}
  {saved&&!status&&<p className="text-[14px] text-[#6B6457]">Saved {new Date(saved.saved_at).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}.</p>}
 </div>;
}

// The author's own words for the paragraphs a bridge page summarizes. Plays keep their speaker labels and italics.
export function FullTextCard({passages,format,note,onNoteRead}:{passages:SourcePassage[];format:"prose"|"script";note?:string;onNoteRead?:()=>void}){
 if(note)return <div className="space-y-5"><p className="text-[19px] font-bold">A note before you read</p><p className="text-[17px] leading-7">{note}</p><button type="button" onClick={onNoteRead} className="case-primary w-full">Continue reading <ArrowRight size={18}/></button></div>;
 return <div className="space-y-4">
  <p className="text-[15px] leading-6 text-[#6B6457]">This is the part the summary covers, exactly as it was written. It has no clues to prove.</p>
  <div className="space-y-3 font-serif text-[17px] leading-8">{sourceLines(passages,format).map(l=><p key={l.id}>{l.speaker&&<span className="sb-speaker mr-2">{l.speaker}</span>}{l.items.map((i,j)=>i.stage?<em key={j}>{i.text} </em>:<span key={j}><Emph text={i.text}/> </span>)}</p>)}</div>
 </div>;
}
// Source paragraphs as display lines: speaker lines join the speech that follows them, markdown italics become stage directions.
function sourceLines(passages:SourcePassage[],format:"prose"|"script"){
 return pageUnits(passages,{id:"",section:"",start:passages[0]?.id??"p000",end:passages[passages.length-1]?.id??"p000",mode:"student",characters_met:[],restatements:{}},format).map(u=>({...u,speaker:u.speaker?.trim().replace(/\.$/,"")}));
}

// Spoken emphasis in plays is marked _like this_ in the source.
export function Emph({text}:{text:string}){return <>{text.split(/_([^_]+)_/).map((s,i)=>i%2?<em key={i}>{s}</em>:s)}</>}

export function LockedHint({count}:{count:number}){return <span className="inline-flex items-center gap-1.5"><Lock size={16}/> {count===1?"Prove the clue to turn the page":`Prove ${count} clues to turn the page`}</span>}
