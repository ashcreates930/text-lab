"use client";
// The student shelf: where students land after a class code or the demo. Stories are books; tapping one opens its
// case briefing, then page 1. A Continue card returns to the exact page and screen. Settings here are the reader's.
import {useEffect,useRef,useState} from "react";
import {ArrowRight,Bookmark,Eye,Lock,Type} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {parseSourcePassages} from "@/lib/source-passages";
import {splitSentences} from "@/lib/storybook";
import type {Demo} from "./page";
import {saveHomeLanguage} from "./bilingual";
import {Drawer,ReadingMenu} from "./storybook/cards";
import {useReaderPrefs} from "./storybook/prefs";

type Entry={id:string;title:string;author:string;hook:string;status:string;grade_band:{min:number;max:number};estimated_minutes:number;cover_image?:string};

export function Shelf({demo,setDemo,onOpen,onlyWorld,heading="Your shelf"}:{demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onOpen:(worldId:string)=>void;onlyWorld?:string;heading?:string}){
 const [entries,setEntries]=useState<Entry[]>([]),[covers,setCovers]=useState<Record<string,string|null>>({}),[peek,setPeek]=useState<string>(""),[settings,setSettings]=useState(false);
 const [prefs,update]=useReaderPrefs();
 useEffect(()=>{fetch("/worlds/index.json").then(r=>r.json()).then((list:Entry[])=>setEntries(onlyWorld?list.filter(e=>e.id===onlyWorld):list)).catch(()=>setEntries([]))},[onlyWorld]);
 // Storybook covers use page 1's illustration once it exists; until then the same placeholder art the reader shows.
 useEffect(()=>{for(const e of entries.filter(x=>x.status!=="coming_soon"))fetch(`/worlds/${e.id}/world.json`).then(r=>r.json()).then(d=>{const w=WorldPackSchema.safeParse(d);if(!w.success||!w.data.storybook)return;setCovers(c=>({...c,[e.id]:w.data.storybook!.pages[0].illustration?.src??null}))}).catch(()=>{})},[entries]);
 const open=entries.filter(e=>e.status!=="coming_soon"),sealed=entries.filter(e=>e.status==="coming_soon");
 const cont=continueFor(demo,entries);
 return <section className="case-ui mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-8" aria-labelledby="shelf-h">
  <div className="flex flex-wrap items-end justify-between gap-4">
   <div><p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Pick a book</p><h1 id="shelf-h" className="mt-1 text-[32px] font-bold leading-tight md:text-[38px]">{heading}</h1></div>
   <button type="button" onClick={()=>setSettings(true)} className="case-secondary !min-h-12"><Type size={18}/> Reading settings</button>
  </div>
  {cont&&<button type="button" onClick={()=>onOpen(cont.worldId)} className="shelf-bookmark mt-6 flex w-full items-center gap-4 rounded-2xl bg-[#FFFDF8] p-4 pr-5 text-left shadow-[0_6px_24px_-12px_rgba(42,38,32,.45)] hover:-translate-y-0.5 md:w-fit">
   <span className="grid h-12 w-10 shrink-0 place-items-center bg-[#A0472C] text-white [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]"><Bookmark size={18}/></span>
   <span><span className="block text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Continue</span><span className="block text-[18px] font-bold leading-snug">{cont.label}</span></span><ArrowRight size={20} className="ml-2 shrink-0 text-[#A0472C]"/>
  </button>}
  <ul className="shelf-row mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">{open.map(e=><li key={e.id}><Book entry={e} art={covers[e.id]} hasStorybook={e.id in covers} onOpen={()=>onOpen(e.id)} onPeek={()=>setPeek(e.id)}/></li>)}</ul>
  {sealed.length>0&&<><h2 className="mt-14 text-[22px] font-bold">Coming soon</h2><ul className="shelf-row mt-5 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">{sealed.map(e=><li key={e.id}><SealedBook entry={e}/></li>)}</ul></>}
  {peek&&<Overlay onClose={()=>setPeek("")}><Drawer title="Peek inside" onClose={()=>setPeek("")}><PeekCard worldId={peek} roleId={demo.role} onOpen={()=>{setPeek("");onOpen(peek)}}/></Drawer></Overlay>}
  {settings&&<Overlay onClose={()=>setSettings(false)}><Drawer title="Reading settings" onClose={()=>setSettings(false)}><ReadingMenu prefs={prefs} update={update} spanish={demo.homeLanguage==="es"} onSpanish={on=>{setDemo(d=>({...d,homeLanguage:on?"es":null}));saveHomeLanguage(on?"es":null)}}/></Drawer></Overlay>}
 </section>;
}

// The newest story with progress: a storybook page (with its screen) or a case-flow scene.
function continueFor(demo:Demo,entries:Entry[]){
 const title=(id:string)=>entries.find(e=>e.id===id)?.title;
 const prog=demo.readerProgress?.[demo.worldId];
 if(prog&&(prog.page||prog.part||prog.briefed)&&title(demo.worldId)&&!demo.submitted)return {worldId:demo.worldId,label:`Pick up on page ${(prog.page??0)+1} of ${title(demo.worldId)}`};
 if(!demo.readerProgress?.[demo.worldId]&&demo.scene>0&&title(demo.worldId)&&!demo.submitted)return {worldId:demo.worldId,label:`Pick up at scene ${demo.scene+1} of ${title(demo.worldId)}`};
 for(const [id,p] of Object.entries(demo.readerProgress??{}))if((p.page||p.part)&&title(id))return {worldId:id,label:`Pick up on page ${(p.page??0)+1} of ${title(id)}`};
 return null;
}

function Overlay({children}:{onClose:()=>void;children:React.ReactNode}){return <div className="fixed inset-0 z-50">{children}</div>}

function Book({entry,art,hasStorybook,onOpen,onPeek}:{entry:Entry;art:string|null|undefined;hasStorybook:boolean;onOpen:()=>void;onPeek:()=>void}){
 // Press and hold opens Peek on touch screens; the Peek button does the same for keyboard and mouse.
 const timer=useRef<number|null>(null),held=useRef(false);
 const down=(e:React.PointerEvent)=>{if(e.pointerType==="mouse")return;held.current=false;timer.current=window.setTimeout(()=>{held.current=true;onPeek()},550)};
 const clear=()=>{if(timer.current)window.clearTimeout(timer.current);timer.current=null};
 const alt=`Cover of ${entry.title} by ${entry.author}`;
 return <div className="flex flex-col items-center">
  <button type="button" onClick={()=>{if(!held.current)onOpen();held.current=false}} onPointerDown={down} onPointerUp={clear} onPointerLeave={clear} onPointerCancel={clear} onContextMenu={e=>{if(held.current)e.preventDefault()}} aria-label={`Open ${entry.title}`} className="shelf-book group relative aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-r-xl rounded-l-sm text-left shadow-[6px_10px_24px_-10px_rgba(42,38,32,.55)] transition hover:-translate-y-1">
   {hasStorybook?<ArtCover entry={entry} art={art} alt={alt}/>:<TypeCover entry={entry} alt={alt}/>}
   <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent"/>
  </button>
  <div className="mt-3 flex w-full max-w-[200px] items-start justify-between gap-2"><div className="min-w-0"><p className="text-[16px] font-bold leading-snug">{entry.title}</p><p className="text-[14px] text-[#6B6457]">Grades {entry.grade_band.min} to {entry.grade_band.max}</p></div><button type="button" onClick={onPeek} aria-label={`Peek inside ${entry.title}`} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-[#EFE8D8] px-3 text-[14px] font-semibold hover:bg-[#E4DCCB]"><Eye size={15}/> Peek</button></div>
 </div>;
}

function ArtCover({entry,art,alt}:{entry:Entry;art:string|null|undefined;alt:string}){
 const [broken,setBroken]=useState(false);
 return <span role="img" aria-label={alt} className="absolute inset-0 block">
  {art&&!broken?<img src={art} alt="" onError={()=>setBroken(true)} className="shelf-pan absolute inset-0 h-full w-full object-cover"/>:<span className="sb-placeholder shelf-pan absolute inset-0 block"/>}
  <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-[#2A2620]/85 via-[#2A2620]/40 to-transparent p-3 pt-14"><span className="block font-serif text-[19px] font-bold leading-tight text-white">{entry.title}</span><span className="mt-1 block text-[12px] uppercase tracking-wide text-[#F3C9B2]">{entry.author}</span></span>
 </span>;
}

// Typographic covers: the deliberate standard for stories without art.
function TypeCover({entry,alt}:{entry:Entry;alt:string}){
 return <span role="img" aria-label={alt} className="absolute inset-0 flex flex-col justify-between bg-[#FBF5EA] p-4">
  <span className="block h-1.5 w-10 bg-[#A0472C]"/>
  <span className="block"><span className="block font-serif text-[21px] font-bold leading-tight text-[#2A2620]">{entry.title}</span><span aria-hidden className="mt-3 block text-[16px] text-[#A0472C]">❦</span></span>
  <span className="block border-t border-[#A0472C]/40 pt-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#8A3B23]">{entry.author}</span>
 </span>;
}

function SealedBook({entry}:{entry:Entry}){
 return <div className="flex flex-col items-center" aria-label={`${entry.title}, coming soon`} role="group">
  <div className="relative aspect-[2/3] w-full max-w-[140px] overflow-hidden rounded-r-lg rounded-l-sm bg-[#EFE8D8] p-3 shadow-[4px_8px_18px_-10px_rgba(42,38,32,.45)]">
   <p className="font-serif text-[14px] font-bold leading-tight text-[#6B6457]">{entry.title}</p>
   <span aria-hidden className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#A0472C] text-white shadow-md"><Lock size={18}/></span>
   <span className="absolute inset-x-2 bottom-2 rounded-full bg-[#FFFDF8]/90 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-[#8A3B23]">Coming soon</span>
  </div>
  <p className="mt-2 max-w-[140px] text-center text-[13px] text-[#6B6457]">{entry.author}</p>
 </div>;
}

function PeekCard({worldId,roleId,onOpen}:{worldId:string;roleId:string;onOpen:()=>void}){
 const [data,setData]=useState<{world:WorldPack;opening:string}|null>(null);
 useEffect(()=>{Promise.all([fetch(`/worlds/${worldId}/world.json`).then(r=>r.json()),fetch(`/worlds/${worldId}/source.md`).then(r=>r.ok?r.text():"")]).then(([w,md])=>{const world=WorldPackSchema.parse(w);const first=parseSourcePassages(md).find(p=>!/^(author|edition)\b/i.test(p.text));setData({world,opening:first?splitSentences(first.text).slice(0,3).join(" "):""})}).catch(()=>{})},[worldId]);
 if(!data)return <p className="text-[16px] text-[#6B6457]">Opening the book…</p>;
 const role=data.world.roles.find(r=>r.id===roleId)??data.world.roles[0];
 return <div className="space-y-5">
  <p className="text-[24px] font-bold leading-tight">{data.world.title}</p>
  {data.opening&&<div><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">How it opens</p><blockquote className="mt-2 border-l-4 border-[#A0472C] pl-4 font-serif text-[17px] leading-7">{data.opening}</blockquote></div>}
  <div><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">The case</p><p className="mt-1 text-[17px] leading-7">{role.goal}</p></div>
  <div><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your role</p><p className="mt-1 text-[17px] leading-7"><b>{role.name}.</b> {role.description}</p></div>
  <button type="button" onClick={onOpen} className="case-primary w-full">Open the book <ArrowRight size={18}/></button>
 </div>;
}
