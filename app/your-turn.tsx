"use client";
// Your Turn: a personal 5 to 7 minute activity after the game. The student picks one of the two activities that match
// their "Unlock your challenge" answers, works through it in the story (every scored answer is an authored line, checked
// in lib/your-turn.ts), then writes 2 or 3 sentences citing at least one exact line. Used after a solo case and on
// phones when the teacher starts Your Turn from the live host screen.
import {useEffect,useLayoutEffect,useMemo,useState} from "react";
import {ArrowRight,Check,MessageCircle,Quote} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {checkAnswer,checkWriting,type AcceptLine,type YourTurnActivity,type YourTurnEntry} from "@/lib/your-turn";
import {displayLine,paragraphLabel} from "@/lib/clue-game";
import {lineWords} from "@/lib/lies";
import {screenMessage} from "@/lib/safety";
import {ReadingPanel,type PanelLine} from "./reading-panel";
import {Portrait} from "./game-feel";
import {focusScreenTop} from "./screen-focus";

type Result=YourTurnEntry["results"][number];
const same=(a:string,b:string)=>lineWords(a)===lineWords(b);
// ai: lets characters react in their own voice (solo only; live phones use the authored claims alone).
type Ai={sandboxId:string;classToken?:string;sceneId:string}|null;

export function YourTurn({world,passages,choices,theory,proven=[],ai=null,onSave,onClose}:{world:WorldPack;passages:SourcePassage[];choices:string[];theory?:string|null;proven?:string[];ai?:Ai;onSave:(e:YourTurnEntry)=>void|Promise<string|null>;onClose?:()=>void}){
 const acts=world.your_turn?.activities??{};
 const [id,setId]=useState<string|null>(choices.length===1?choices[0]:null);
 const [stage,setStage]=useState<"play"|"write"|"done">("play");
 const [results,setResults]=useState<Result[]>([]);
 useLayoutEffect(()=>{focusScreenTop()},[id,stage]);
 if(!id)return <section className="case-ui mx-auto max-w-xl px-4 pb-10 pt-4" aria-labelledby="yt-h">
  <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your Turn · 5 to 7 minutes</p>
  <h1 id="yt-h" className="mt-1 text-[26px] font-bold leading-tight outline-none">Pick your activity</h1>
  <p className="mt-1 text-[15px] text-[#4A4438]">{choices.length>1?"Picked from your answers. Both send you back into the story.":"It sends you back into the story."}</p>
  <ul className="mt-4 space-y-3">{choices.map(c=>{const a=acts[c];return a?<li key={c}><button type="button" onClick={()=>setId(c)} className="w-full rounded-3xl bg-[#FFFDF8] p-4 text-left shadow-[0_2px_12px_-6px_rgba(42,38,32,.35)] ring-2 ring-transparent hover:ring-[#A0472C]"><span className="block text-[19px] font-bold">{a.title}</span><span className="mt-1 block text-[14px] leading-5 text-[#4A4438]">{a.intro}</span><span className="mt-2 inline-block rounded-full bg-[#F4E1D6] px-3 py-1 text-[12px] font-bold text-[#8A3B23]">{a.minutes} minutes</span></button></li>:null})}</ul>
  {onClose&&<button type="button" onClick={onClose} className="mt-5 min-h-11 text-[15px] text-[#6B6457] underline underline-offset-4">Not now</button>}
 </section>;
 const a=acts[id];
 if(!a)return null;
 const header=<div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your Turn · {a.minutes} minutes</p>{onClose&&stage!=="done"&&<button type="button" onClick={onClose} className="min-h-11 text-[14px] text-[#6B6457] underline underline-offset-4">Leave</button>}</div>;
 if(stage==="done")return <section className="case-ui mx-auto max-w-xl px-4 pb-10 pt-4" aria-labelledby="yt-done">{header}
  <div className="mt-3 rounded-3xl bg-[#2A2620] p-6 text-[#FFFDF8]"><h1 id="yt-done" className="text-[26px] font-bold outline-none">Saved for your teacher</h1><p className="mt-2 text-[16px]">{results.filter(r=>r.ok).length} of {results.length} answers held up in the story. Your writing is in your case file.</p></div>
  {onClose&&<button type="button" onClick={onClose} className="case-primary mt-5 w-full">Done <ArrowRight size={18}/></button>}
 </section>;
 if(stage==="write")return <WriteStep world={world} passages={passages} a={a} id={id} results={results} header={header} onSave={onSave} onSaved={()=>setStage("done")}/>;
 const finish=(r:Result[])=>{setResults(r);setStage("write")};
 const panel=a.kind==="exhibits"?[...new Set([...a.paragraphs])]:a.paragraphs;
 return <section className="case-ui mx-auto max-w-xl px-4 pb-10 pt-4" aria-labelledby="yt-h">{header}
  <h1 id="yt-h" className="mt-1 text-[24px] font-bold leading-tight outline-none">{a.title}</h1>
  <p className="mt-1 text-[15px] leading-6 text-[#4A4438]">{a.intro}</p>
  {a.kind==="talk"&&<Talk world={world} passages={passages.filter(p=>panel.includes(p.id))} characterId={a.character_id??null} exchanges={a.exchanges??[]} ai={ai} onDone={finish}/>}
  {a.kind==="debate"&&<Debate world={world} passages={passages.filter(p=>panel.includes(p.id))} a={a} theory={theory??null} ai={ai} onDone={finish}/>}
  {(a.kind==="pick"||a.kind==="order")&&<Pick passages={passages.filter(p=>panel.includes(p.id))} a={a} onDone={finish}/>}
  {a.kind==="lines"&&<Lines passages={passages.filter(p=>panel.includes(p.id))} need={a.need??3} label="Your song's lines" onDone={finish}/>}
  {a.kind==="exhibits"&&<Lines passages={passages.filter(p=>panel.includes(p.id))} need={a.need??3} label="Your exhibits" proven={proven} onDone={finish}/>}
  {a.kind==="factcheck"&&<FactCheck passages={passages.filter(p=>panel.includes(p.id))} a={a} onDone={finish}/>}
 </section>;
}

// ---------- A character's claims, each answered with a line ----------
function Talk({world,passages,characterId,exchanges,ai,onDone}:{world:WorldPack;passages:SourcePassage[];characterId:string|null;exchanges:NonNullable<YourTurnActivity["exchanges"]>;ai:Ai;onDone:(r:Result[])=>void}){
 const who=characterId?world.characters.find(c=>c.id===characterId)??null:null;
 const name=who?.name??world.computer_players?.rival.name??"Computer rival";
 const [i,setI]=useState(0),[line,setLine]=useState(""),[text,setText]=useState(""),[msg,setMsg]=useState<{ok:boolean;text:string}|null>(null),[reply,setReply]=useState(""),[results,setResults]=useState<Result[]>([]),[busy,setBusy]=useState(false);
 const ex=exchanges[i];
 async function answer(){
  if(!line||!ex)return;
  const t=text.trim();if(t){const s=screenMessage(t);if(s.action!=="allow"){setMsg({ok:false,text:s.message??"Try different words."});return}}
  const c=checkAnswer(ex.accept as AcceptLine[],line);
  if(!c.ok){setMsg({ok:false,text:c.hint});return}
  const r=[...results,{label:ex.say,line,ok:true}];setResults(r);setMsg({ok:true,text:"That holds up."});
  // The character answers back in their own voice (solo only); scoring stays with the authored lines.
  if(ai&&who){setBusy(true);try{const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json",...(ai.classToken?{"x-class-token":ai.classToken}:{})},body:JSON.stringify({sandboxId:ai.sandboxId,worldId:world.id,scene:ai.sceneId,character:who.id,question:`You told me: "${ex.say}" I answer with this line from the story: "${line.replace(/\s+/g," ")}"${t?` and I say: ${t}`:""}. React in one or two sentences.`})});const j=await res.json();setReply(String(j.text??""))}catch{setReply("")}finally{setBusy(false)}}
 }
 function next(skip=false){const r=skip?[...results,{label:ex.say,line,ok:false}]:results;setResults(r);setLine("");setText("");setMsg(null);setReply("");if(i+1>=exchanges.length)onDone(r);else setI(i+1)}
 return <div className="mt-3 space-y-3">
  <p className="text-[13px] font-bold text-[#8A3B23]">Claim {i+1} of {exchanges.length}</p>
  <div className="flex gap-2.5 rounded-2xl bg-[#2A2620] p-3 text-[#FFFDF8]">{who?<Portrait character={who} size={40}/>:<span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2E3B4E]">🏮</span>}<div><p className="text-[11px] font-bold uppercase tracking-wide text-[#F3C9B2]">{name}{who?"":" · Computer rival"}</p><p className="text-[15px] leading-[1.45]">{ex.say}</p>{busy&&<p className="mt-1 text-[14px] text-[#E8DDCB]">…</p>}{reply&&<p className="mt-1 text-[14px] italic text-[#E8DDCB]">{reply}</p>}</div></div>
  <ReadingPanel className="max-h-[38dvh]" passages={passages} kept={line?[line]:[]} onTap={(l:PanelLine)=>{if(!msg?.ok){setLine(l.text);setMsg(null)}}} title={<span>The story · tap the line that answers</span>}/>
  {!msg?.ok&&<><label htmlFor="yt-say" className="block text-[14px] font-bold">Say it in your words (optional)</label><input id="yt-say" value={text} onChange={e=>setText(e.target.value)} maxLength={140} className="min-h-11 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 text-[16px]"/></>}
  <div aria-live="polite">{msg&&<p className={`rounded-2xl px-3 py-2 text-[14px] ${msg.ok?"bg-[#2F6B3A] font-semibold text-white":"border-l-4 border-[#A0472C] bg-[#FBF1EB]"}`}>{msg.text}</p>}</div>
  {msg?.ok?<button type="button" onClick={()=>next()} className="case-primary w-full">{i+1>=exchanges.length?"Write it up":"Next claim"} <ArrowRight size={18}/></button>
  :<div className="flex gap-2"><button type="button" onClick={()=>next(true)} className="min-h-12 flex-1 rounded-full bg-[#EFE8D8] text-[15px] font-bold">Move on</button><button type="button" disabled={!line} onClick={answer} className="flex min-h-12 flex-[2] items-center justify-center gap-1.5 rounded-full bg-[#A0472C] text-[15px] font-bold text-white disabled:opacity-40"><MessageCircle size={16}/>Answer with this line</button></div>}
 </div>;
}
// ---------- The debate: pick a side; a character argues the other one ----------
function Debate({world,passages,a,theory,ai,onDone}:{world:WorldPack;passages:SourcePassage[];a:YourTurnActivity;theory:string|null;ai:Ai;onDone:(r:Result[])=>void}){
 const sides=a.sides??{};
 const [side,setSide]=useState<string|null>(theory&&theory in sides?theory:null);
 if(!side)return <fieldset className="mt-3"><legend className="text-[16px] font-bold">Your side: what happened to Ichabod?</legend><div className="mt-2 grid gap-2">{(world.verdict?.theories??[]).filter(t=>t.id in sides).map(t=><button key={t.id} type="button" onClick={()=>setSide(t.id)} className="rounded-2xl bg-[#FFFDF8] p-3 text-left ring-1 ring-[#E4DCCB] hover:ring-[#A0472C]"><span className="block text-[17px] font-bold">{t.name}</span><span className="block text-[14px] text-[#4A4438]">{t.description}</span></button>)}</div></fieldset>;
 const s=sides[side];const mine=world.verdict?.theories.find(t=>t.id===side)?.name;
 return <><p className="mt-2 rounded-2xl bg-[#F4E1D6] px-3 py-2 text-[14px]"><b>Your side:</b> {mine}. {world.characters.find(c=>c.id===s.character_id)?.name} argues against it.</p><Talk world={world} passages={passages} characterId={s.character_id} exchanges={s.exchanges} ai={ai} onDone={onDone}/></>;
}
// ---------- Pick (closet, checkpoints, advice cards) and order (play by play): each piece backed by a line ----------
function Pick({passages,a,onDone}:{passages:SourcePassage[];a:YourTurnActivity;onDone:(r:Result[])=>void}){
 const items=a.items??[],order=a.kind==="order";
 const shown=useMemo(()=>order?[...items].sort((x,y)=>(x.id<y.id?-1:1)):items,[items,order]);
 const need=order?items.length:a.need??3;
 const [done,setDone]=useState<{id:string;line:string}[]>([]),[active,setActive]=useState<string|null>(null),[msg,setMsg]=useState<{ok:boolean;text:string}|null>(null),[tries,setTries]=useState<Result[]>([]);
 const groups=a.groups??null;
 const complete=done.length>=need&&(!groups||Object.keys(groups).every(g=>done.some(d=>items.find(i=>i.id===d.id)?.group===g)));
 function choose(id:string){
  if(done.some(d=>d.id===id))return;
  if(order){const expected=items[done.length];if(expected.id!==id){setMsg({ok:false,text:"Not yet. What happens before that?"});return}}
  setActive(id);setMsg(null);
 }
 function tap(l:PanelLine){
  const it=items.find(i=>i.id===active);if(!it)return;
  const c=checkAnswer(it.accept as AcceptLine[],l.text);
  setTries(t=>[...t,{label:it.label,line:l.text,ok:c.ok}]);
  if(!c.ok){setMsg({ok:false,text:c.hint});return}
  setDone(d=>[...d,{id:it.id,line:l.text}]);setActive(null);setMsg({ok:true,text:`${it.label}: that holds up.`});
 }
 return <div className="mt-3 space-y-3">
  <p className="text-[13px] font-bold text-[#8A3B23]">{order?`Moment ${Math.min(done.length+1,need)} of ${need}`:`${done.length} of ${need} picked`}{groups?` · at least one of each: ${Object.values(groups).join(" and ")}`:""}</p>
  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{shown.map(it=>{const d=done.find(x=>x.id===it.id),on=active===it.id;return <li key={it.id}><button type="button" aria-pressed={on||!!d} onClick={()=>choose(it.id)} className={`flex min-h-[64px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 p-2 text-center text-[13px] font-bold ${d?"border-[#2F6B3A] bg-[#E8F2E7]":on?"border-[#A0472C] bg-[#FBEDE5]":"border-[#E4DCCB] bg-[#FFFDF8]"}`}>{it.icon&&<span aria-hidden className="text-[22px]">{it.icon}</span>}{it.label}{groups&&it.group&&<span className="text-[11px] font-semibold text-[#6B6457]">{groups[it.group]}</span>}{d&&<span className="text-[11px] text-[#2F6B3A]">{order?`#${done.findIndex(x=>x.id===it.id)+1} · `:""}{paragraphLabel(passages.find(p=>p.text.includes(d.line.slice(0,30)))?.id??"p000")}</span>}</button></li>})}</ul>
  <div aria-live="polite">{msg&&<p className={`rounded-2xl px-3 py-2 text-[14px] ${msg.ok?"bg-[#2F6B3A] font-semibold text-white":"border-l-4 border-[#A0472C] bg-[#FBF1EB]"}`}>{msg.text}</p>}{active&&<p className="mt-1 text-[14px] font-semibold text-[#8A3B23]">Now tap the line that backs up "{items.find(i=>i.id===active)?.label}".</p>}</div>
  <ReadingPanel className="max-h-[38dvh]" passages={passages} kept={done.map(d=>d.line)} onTap={tap} title={<span>The story</span>}/>
  <button type="button" disabled={!complete} onClick={()=>onDone([...done.map(d=>({label:items.find(i=>i.id===d.id)!.label,line:d.line,ok:true})),...tries.filter(t=>!t.ok)])} className="case-primary w-full disabled:opacity-40">Write it up <ArrowRight size={18}/></button>
 </div>;
}
// ---------- Any lines (a ballad) or your own exhibits ----------
function Lines({passages,need,label,proven=[],onDone}:{passages:SourcePassage[];need:number;label:string;proven?:string[];onDone:(r:Result[])=>void}){
 const [kept,setKept]=useState<string[]>([]);
 const tap=(l:{text:string})=>setKept(k=>k.some(x=>same(x,l.text))?k.filter(x=>!same(x,l.text)):k.length>=need?k:[...k,l.text]);
 return <div className="mt-3 space-y-3">
  {proven.length>0&&<div><p className="text-[14px] font-bold">Lines you proved</p><ul className="mt-1 space-y-1.5">{proven.map(p=><li key={p}><button type="button" aria-pressed={kept.some(x=>same(x,p))} onClick={()=>tap({text:p})} className={`w-full rounded-2xl border-2 px-3 py-2 text-left font-serif text-[15px] ${kept.some(x=>same(x,p))?"border-[#A0472C] bg-[#FBEDE5]":"border-[#E4DCCB] bg-[#FFFDF8]"}`}>{displayLine(p)}</button></li>)}</ul></div>}
  <p className="text-[13px] font-bold text-[#8A3B23]">{label} · {kept.length} of {need}</p>
  <ReadingPanel className="max-h-[38dvh]" passages={passages} kept={kept} onTap={tap} title={<span>The story</span>}/>
  <button type="button" disabled={kept.length<need} onClick={()=>onDone(kept.map((l,i)=>({label:`${label} ${i+1}`,line:l,ok:true})))} className="case-primary w-full disabled:opacity-40">Write it up <ArrowRight size={18}/></button>
 </div>;
}
// ---------- Fact-check the feed: find the false post and prove it ----------
function FactCheck({passages,a,onDone}:{passages:SourcePassage[];a:YourTurnActivity;onDone:(r:Result[])=>void}){
 const posts=a.posts??[];
 const [pick,setPick]=useState<number|null>(null),[msg,setMsg]=useState<{ok:boolean;text:string}|null>(null),[proved,setProved]=useState<string|null>(null);
 const target=pick!==null?posts[pick]:null;
 function tap(l:PanelLine){if(!target?.false||proved)return;const c=checkAnswer((target.accept??[]) as AcceptLine[],l.text);if(c.ok){setProved(l.text);setMsg({ok:true,text:"Debunked. That line proves the post false."})}else setMsg({ok:false,text:c.hint})}
 return <div className="mt-3 space-y-3">
  <ul className="space-y-2">{posts.map((p,i)=><li key={i}><button type="button" aria-pressed={pick===i} disabled={!!proved} onClick={()=>{setPick(i);setMsg(p.false?{ok:true,text:"That's the one. Now tap the line that proves it false."}:{ok:false,text:"That post checks out. Look again."})}} className={`w-full rounded-2xl border-2 p-3 text-left ${pick===i?(p.false?"border-[#A0472C] bg-[#FBEDE5]":"border-[#E4DCCB] bg-[#EFE8D8]"):"border-[#E4DCCB] bg-[#FFFDF8]"}`}><span className="block text-[13px] font-bold text-[#3E5F86]">{p.author}</span><span className="block text-[15px]">{p.text}</span></button></li>)}</ul>
  <div aria-live="polite">{msg&&<p className={`rounded-2xl px-3 py-2 text-[14px] ${msg.ok?"bg-[#E8F2E7] font-semibold text-[#2F6B3A]":"border-l-4 border-[#A0472C] bg-[#FBF1EB]"}`}>{msg.text}</p>}</div>
  <ReadingPanel className="max-h-[38dvh]" passages={passages} kept={proved?[proved]:[]} onTap={tap} title={<span>The story</span>}/>
  <button type="button" disabled={!proved} onClick={()=>onDone([{label:target?.text??"",line:proved!,ok:true}])} className="case-primary w-full disabled:opacity-40">Write your own post <ArrowRight size={18}/></button>
 </div>;
}
// ---------- The closing 2 or 3 sentences, citing at least one line ----------
function WriteStep({world,passages,a,id,results,header,onSave,onSaved}:{world:WorldPack;passages:SourcePassage[];a:YourTurnActivity;id:string;results:Result[];header:React.ReactNode;onSave:(e:YourTurnEntry)=>void|Promise<string|null>;onSaved:()=>void}){
 const [text,setText]=useState(""),[cited,setCited]=useState<string[]>(()=>results.filter(r=>r.ok).map(r=>r.line).slice(0,1)),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{setErr("")},[text,cited]);
 const tap=(l:{text:string})=>setCited(c=>c.some(x=>same(x,l.text))?c.filter(x=>!same(x,l.text)):[...c,l.text].slice(-5));
 async function save(){
  const c=checkWriting(passages,text,cited);
  if(!c.ok){setErr(c.error);return}
  setBusy(true);const e=await onSave({activity:id,title:a.title,results,writing:text.trim().replace(/\s+/g," "),cited:c.cited,at:new Date().toISOString()});setBusy(false);
  if(typeof e==="string"&&e){setErr(e);return}
  onSaved();
 }
 void world;
 return <section className="case-ui mx-auto max-w-xl px-4 pb-10 pt-4" aria-labelledby="yt-w">{header}
  <h1 id="yt-w" className="mt-1 text-[24px] font-bold leading-tight outline-none">Write it up</h1>
  <p className="mt-1 text-[15px] leading-6 text-[#4A4438]">{a.write}</p>
  <div className="mt-3"><p className="flex items-center gap-1.5 text-[14px] font-bold"><Quote size={15} className="text-[#A0472C]"/>Lines you cite · {cited.length}</p>
   <ul className="mt-1 space-y-1.5">{cited.map(c=><li key={c} className="flex items-start gap-2 rounded-2xl bg-[#F4E1D6]/70 px-3 py-2 font-serif text-[14px] leading-5"><span className="flex-1">“{displayLine(c)}”</span><button type="button" onClick={()=>tap({text:c})} aria-label="Remove this citation" className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-[#EFE8D8]">×</button></li>)}</ul>
   {!cited.length&&<p className="text-[13px] text-[#6B6457]">Tap a line in the story below to cite it.</p>}</div>
  <label htmlFor="yt-text" className="mt-3 block text-[14px] font-bold">Your 2 or 3 sentences</label>
  <textarea id="yt-text" value={text} onChange={e=>setText(e.target.value)} rows={4} maxLength={900} className="mt-1 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px] leading-6" placeholder="I think… because the story says…"/>
  {err&&<p role="alert" className="mt-1 text-[14px] font-semibold text-[#A33B20]">{err}</p>}
  <ReadingPanel className="mt-3 max-h-[34dvh]" passages={passages.filter(p=>a.paragraphs.includes(p.id))} kept={cited} onTap={tap} title={<span>Tap to cite</span>}/>
  <button type="button" disabled={busy||!text.trim()} onClick={save} className="case-primary mt-4 w-full disabled:opacity-40"><Check size={18}/>Save for my teacher</button>
 </section>;
}
