"use client";
// Paged storybook reader. One page fills the screen; the screen itself never scrolls. A page whose text does not fit at
// the student's text settings is split into "continued" screens by sentence. The next page opens only after the clues
// on the current page are proven. Cards (questions, words, Say it again, Who's who, reading menu, picture frames) slide
// in over the page.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,ChevronLeft,ChevronRight,ImageIcon,MessageSquareQuote,PenLine,Type,Users} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {cluesByPage,pagePassages,sentenceKey,splitSentences,type StoryPage} from "@/lib/storybook";
import {isDone} from "../clue-steps";
import {RankChip,playStamp,recordScene} from "../case-game";
import type {Demo} from "../page";
import {Drawer,FrameCard,LockedHint,QuestionCard,ReadingMenu,SayCard,WhoCard,WordCard} from "./cards";
import {fontStacks,lineSpacings,textSizes,useReaderPrefs} from "./prefs";

// A piece is a whole sentence, or part of one too long to fit a screen by itself; full keeps the whole sentence for cards.
type Piece={text:string;full:string};
type Para={id:string;items:Piece[]};
type Card=null|{type:"questions"}|{type:"menu"}|{type:"who"}|{type:"frame"}|{type:"say";sentence:string}|{type:"word";term:string;word:string;sentence:string};
type Layout="spread"|"side"|"bottom";
const PARA_CLASS="mb-[0.7em] last:mb-0";
const escapeRe=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

function useLayout():Layout{
 const read=()=>typeof window==="undefined"?"bottom":window.innerWidth>=900&&window.innerWidth>window.innerHeight?"spread":window.innerWidth>window.innerHeight?"side":"bottom";
 const [layout,setLayout]=useState<Layout>("bottom");
 useEffect(()=>{const on=()=>setLayout(read());on();window.addEventListener("resize",on);return()=>window.removeEventListener("resize",on)},[]);
 return layout;
}

// Greedy split of a page's sentences into screens that fit the text box, measured with an invisible copy of the text.
// A sentence too tall for an empty screen (very large text on a small phone) is split between words.
function paginate(paras:Para[],box:HTMLElement,measurer:HTMLElement):Para[][]{
 const max=box.clientHeight-2;if(max<40)return[paras];
 const render=(list:Para[])=>{measurer.replaceChildren(...list.map(p=>{const el=document.createElement("p");el.className=PARA_CLASS;el.textContent=p.items.map(i=>i.text).join(" ");return el}));return measurer.offsetHeight};
 const add=(list:Para[],id:string,item:Piece)=>{const last=list[list.length-1];return last?.id===id?[...list.slice(0,-1),{id,items:[...last.items,item]}]:[...list,{id,items:[item]}]};
 const fitPieces=(id:string,item:Piece):Piece[]=>{if(render([{id,items:[item]}])<=max)return[item];const words=item.text.split(" "),out:Piece[]=[];let chunk:string[]=[];for(const word of words){const next=[...chunk,word];if(chunk.length&&render([{id,items:[{text:next.join(" "),full:item.full}]}])>max){out.push({text:chunk.join(" "),full:item.full});chunk=[word]}else chunk=next}if(chunk.length)out.push({text:chunk.join(" "),full:item.full});return out};
 const parts:Para[][]=[];let cur:Para[]=[];
 for(const para of paras)for(const whole of para.items)for(const item of fitPieces(para.id,whole)){const trial=add(cur,para.id,item);if(cur.length&&render(trial)>max){parts.push(cur);cur=add([],para.id,item)}else cur=trial}
 if(cur.length)parts.push(cur);
 measurer.replaceChildren();
 return parts.length?parts:[paras];
}

export function StorybookReader({world,role,passages,demo,setDemo,onExit}:{world:WorldPack;role:WorldPack["roles"][number];passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onExit:()=>void}){
 const book=world.storybook!;const pages=book.pages;const last=pages.length-1;
 const gates=useMemo(()=>cluesByPage(world),[world]);
 const [prefs,update]=useReaderPrefs();const layout=useLayout();
 const [card,setCard]=useState<Card>(null),[sayMode,setSayMode]=useState(false),[celebrate,setCelebrate]=useState<{title:string;rankUp:string|null}|null>(null);
 const index=Math.min(Math.max(demo.readerPage??0,0),last);const page=pages[index];
 const pageDone=useCallback((i:number)=>gates[i].every(({clue})=>isDone(demo,clue.id)),[gates,demo]);
 const furthest=Math.max(demo.readerFurthest??0,index);
 const paras=useMemo<Para[]>(()=>pagePassages(passages,page).map(p=>({id:p.id,items:splitSentences(p.text).map(t=>({text:t,full:t}))})),[passages,page]);
 const pageText=useMemo(()=>paras.map(p=>p.items.map(i=>i.text).join(" ")).join(" "),[paras]);
 const section=book.sections.find(s=>s.id===page.section);
 const open=gates[index].filter(({clue})=>!isDone(demo,clue.id)).length;

 // Pagination: re-measure whenever the page, text settings, layout, panel size, or fonts change.
 const box=useRef<HTMLDivElement>(null),measurer=useRef<HTMLDivElement>(null);
 const [parts,setParts]=useState<Para[][]>([paras]),[part,setPart]=useState(0),[tick,setTick]=useState(0);
 const wantLastPart=useRef(false);
 useLayoutEffect(()=>{if(!box.current||!measurer.current)return;const next=paginate(paras,box.current,measurer.current);setParts(next);setPart(p=>wantLastPart.current?next.length-1:Math.min(p,next.length-1));wantLastPart.current=false},[paras,prefs,layout,tick,demo.readerBriefed]);
 useEffect(()=>{const el=box.current;if(!el)return;const ro=new ResizeObserver(()=>setTick(t=>t+1));ro.observe(el);document.fonts?.ready.then(()=>setTick(t=>t+1));return()=>ro.disconnect()},[prefs.view,layout,demo.readerBriefed]);
 // The reading screen never scrolls.
 useEffect(()=>{const root=document.documentElement,prev=root.style.overflow;root.style.overflow="hidden";return()=>{root.style.overflow=prev}},[]);

 const goTo=useCallback((i:number,toLastPart=false)=>{wantLastPart.current=toLastPart;setPart(0);setSayMode(false);setDemo(d=>({...d,readerPage:i,readerFurthest:Math.max(d.readerFurthest??0,i)}))},[setDemo]);
 const finishSection=useCallback((id:string)=>{if((demo.readerSections??[]).includes(id))return;const title=book.sections.find(s=>s.id===id)?.title??"";const rankUp=recordScene(`${world.id}:${id}`);playStamp();setCelebrate({title,rankUp});setDemo(d=>({...d,readerSections:[...(d.readerSections??[]),id],events:[...d.events,"scene_complete"]}))},[demo.readerSections,book.sections,world.id,setDemo]);
 // advance() turns forward; next() is the same but ignores input while a card or celebration is open.
 const advance=useCallback(()=>{
  if(part<parts.length-1){setPart(part+1);return}
  if(!pageDone(index)){setCard({type:"questions"});return}
  if(index===last){finishSection(page.section);setDemo(d=>({...d,submitted:true,events:[...d.events,"case_closed"]}));return}
  if(pages[index+1].section!==page.section)finishSection(page.section);
  goTo(index+1);
 },[part,parts.length,pageDone,index,last,page.section,pages,finishSection,goTo,setDemo]);
 const next=useCallback(()=>{if(!card&&!celebrate)advance()},[card,celebrate,advance]);
 const prev=useCallback(()=>{if(card||celebrate)return;if(part>0){setPart(part-1);return}if(index>0)goTo(index-1,true)},[card,celebrate,part,index,goTo]);

 useEffect(()=>{const key=(e:KeyboardEvent)=>{const t=e.target;if(t instanceof Element&&t.closest("input,textarea,select,[contenteditable]"))return;if(e.key==="ArrowRight"){e.preventDefault();next()}else if(e.key==="ArrowLeft"){e.preventDefault();prev()}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[next,prev]);
 const swipe=useRef<{x:number;y:number}|null>(null);
 const onPointerDown=(e:React.PointerEvent)=>{if(card||e.pointerType==="mouse")return;swipe.current={x:e.clientX,y:e.clientY}};
 const onPointerUp=(e:React.PointerEvent)=>{const s=swipe.current;swipe.current=null;if(!s)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.abs(dx)>60&&Math.abs(dx)>1.5*Math.abs(dy)){if(dx<0)next();else prev()}};

 // Vocabulary words are underlined buttons that open the word card.
 const vocab=book.vocabulary;
 const vocabRe=useMemo(()=>{const forms=vocab.flatMap(v=>[v.term,...v.forms]).filter(Boolean).sort((a,b)=>b.length-a.length);return forms.length?new RegExp(`\\b(${forms.map(escapeRe).join("|")})\\b`,"gi"):null},[vocab]);
 const findVocab=(word:string)=>vocab.find(v=>[v.term,...v.forms].some(f=>f.toLowerCase()===word.toLowerCase()));
 const textStyle={fontSize:textSizes[prefs.size],lineHeight:lineSpacings[prefs.spacing],fontFamily:fontStacks[prefs.font]};
 function renderSentence({text,full}:Piece,key:string){
  if(sayMode)return <button type="button" key={key} onClick={()=>setCard({type:"say",sentence:full})} className="sb-say mr-[0.25em] inline rounded-md text-left">{text}</button>;
  const bits=vocabRe?text.split(vocabRe):[text];
  return <span key={key}>{bits.map((b,i)=>{const v=i%2===1?findVocab(b):undefined;return v?<button type="button" key={i} onClick={()=>setCard({type:"word",term:v.term,word:b,sentence:full})} className="sb-word">{b}</button>:<span key={i}>{b}</span>})} </span>;
 }

 const characters=pages.slice(0,furthest+1).flatMap(p=>p.characters_met);
 const frame=demo.storyFrames?.[page.id];
 const studentImage=frame?.image;
 const art=page.illustration?.src||studentImage;

 if(!demo.readerBriefed)return <Shell title={world.title}><Briefing world={world} role={role} onStart={()=>setDemo(d=>({...d,readerBriefed:true,readerPage:d.readerPage??0}))} onExit={onExit}/></Shell>;

 const textPanel=(extra="")=><div className={`flex min-h-0 flex-col ${extra}`}>
  <p className="mb-2 shrink-0 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">{section?.title}{parts.length>1&&` · part ${part+1} of ${parts.length}`}</p>
  <div ref={box} className="relative min-h-0 flex-1 overflow-hidden text-[#2A2620]" style={textStyle}>
   <div ref={measurer} aria-hidden className="pointer-events-none invisible absolute inset-x-0 top-0"/>
   <div>{(parts[part]??paras).map((p,i)=><p key={`${p.id}-${i}`} className={PARA_CLASS}>{p.items.map((s,j)=>renderSentence(s,`${p.id}-${j}`))}</p>)}</div>
  </div>
  {sayMode&&<p className="mt-2 shrink-0 text-[14px] font-semibold text-[#8A3B23]">Tap a sentence to say it again.</p>}
 </div>;

 const picture=<Picture page={page} src={art} isStudent={!!studentImage&&!page.illustration?.src} layout={layout} onFrame={()=>setCard({type:"frame"})} framed={!!frame}/>;
 const textOnly=prefs.view==="text";

 return <Shell title={world.title} onExit={onExit} tools={<>
   <ToolButton label="Who's who" onClick={()=>setCard({type:"who"})}><Users size={20}/></ToolButton>
   <ToolButton label={sayMode?"Stop Say it again":"Say it again"} pressed={sayMode} onClick={()=>setSayMode(v=>!v)}><MessageSquareQuote size={20}/></ToolButton>
   {page.mode!=="illustrated"&&<ToolButton label={page.mode==="add_detail"?"Add a detail":"Illustrate this page"} onClick={()=>setCard({type:"frame"})}><PenLine size={20}/></ToolButton>}
   <ToolButton label="Reading settings" onClick={()=>setCard({type:"menu"})}><Type size={20}/></ToolButton>
  </>}>
  <div className="relative min-h-0 flex-1" style={{touchAction:"pan-y pinch-zoom"}} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={()=>{swipe.current=null}}>
   {textOnly?<div className="mx-auto flex h-full max-w-[760px] flex-col px-4 py-3 md:px-8 md:py-6"><div className="flex min-h-0 flex-1 flex-col rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_18px_-8px_rgba(42,38,32,.3)] md:p-8">{textPanel("flex-1")}</div></div>
   :layout==="spread"?<div className="grid h-full grid-cols-2 gap-4 p-4"><div className="relative overflow-hidden rounded-3xl bg-[#EFE8D8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.35)]">{picture}</div><div className="flex min-h-0 flex-col rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_10px_40px_-14px_rgba(42,38,32,.3)] lg:p-8">{textPanel("flex-1")}</div></div>
   :<div className="absolute inset-0">{picture}<div className={`absolute flex flex-col rounded-3xl bg-[#FFFDF8]/90 p-4 shadow-[0_10px_40px_-14px_rgba(42,38,32,.45)] backdrop-blur-md sm:p-5 ${layout==="side"?"bottom-3 right-3 top-3 w-[56%]":"inset-x-3 bottom-3 h-[58%]"}`}>{textPanel("flex-1")}</div></div>}
   {card&&<Drawer title={cardTitle(card,page)} wide={card.type==="questions"} onClose={()=>setCard(null)}>
    {card.type==="questions"&&<QuestionCard world={world} roleId={role.id} items={gates[index]} demo={demo} setDemo={setDemo} passages={passages} lastPage={index===last} reading={{throughParagraph:pages[furthest].end,characters:characters.map(c=>c.id)}} onAllDone={()=>{setCard(null);advance()}}/>}
    {card.type==="menu"&&<ReadingMenu prefs={prefs} update={update}/>}
    {card.type==="who"&&<WhoCard characters={characters}/>}
    {card.type==="say"&&<SayCard sentence={card.sentence} restatement={page.restatements[sentenceKey(card.sentence)]}/>}
    {card.type==="word"&&(()=>{const v=vocab.find(x=>x.term===card.term);return v?<WordCard entry={v} word={card.word} sentence={card.sentence}/>:null})()}
    {card.type==="frame"&&<FrameCard page={page} pageText={pageText} demo={demo} setDemo={setDemo}/>}
   </Drawer>}
   {celebrate&&<div className="absolute inset-0 z-40 grid place-items-center bg-[#2A2620]/45 p-6"><div role="dialog" aria-modal="true" aria-label="Section solved" className="case-rise relative w-full max-w-md rounded-3xl bg-[#FFFDF8] p-7 text-center shadow-2xl">
    <div aria-hidden className="case-stamp case-stamp-page">Section solved</div>
    <p className="mt-5 text-[22px] font-bold">{celebrate.title}: every clue is proven.</p>
    {celebrate.rankUp&&<p className="mt-2 text-[17px]">New rank: <b>{celebrate.rankUp}</b></p>}
    <div className="mt-3 flex justify-center"><RankChip/></div>
    <button type="button" autoFocus onClick={()=>setCelebrate(null)} className="case-primary mt-6 w-full">{demo.submitted?"See your case file":"Keep reading"} <ArrowRight size={18}/></button>
   </div></div>}
  </div>
  <nav aria-label="Page navigation" className="grid h-[72px] shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-[#E4DCCB] bg-[#F6F0E3] px-3 md:px-6">
   <button type="button" onClick={prev} disabled={index===0&&part===0} aria-label="Previous page" className="grid h-14 w-14 place-items-center rounded-full bg-[#FFFDF8] text-[#2A2620] shadow-[0_2px_10px_-4px_rgba(42,38,32,.3)] disabled:opacity-30"><ChevronLeft size={28}/></button>
   <div className="min-w-0 text-center" aria-live="polite">
    <p className="text-[16px] font-semibold">Page {index+1} of {pages.length}</p>
    <div className="mx-auto mt-1.5 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-[#E4DCCB]" aria-hidden><div className="h-full rounded-full bg-[#A0472C] transition-[width]" style={{width:`${((index+(part+1)/parts.length)/pages.length)*100}%`}}/></div>
   </div>
   {part<parts.length-1?<NavNext label="Next" onClick={next}/>
   :open?<button type="button" onClick={()=>setCard({type:"questions"})} className="case-primary min-h-14 px-4 text-[15px]"><span className="hidden sm:inline"><LockedHint count={open}/></span><span className="sm:hidden">Prove {open===1?"clue":`${open} clues`}</span></button>
   :index===last?<button type="button" onClick={next} className="case-primary min-h-14">Close the case <ArrowRight size={18}/></button>
   :<NavNext label="Next page" onClick={next}/>}
  </nav>
 </Shell>;
}
function NavNext({label,onClick}:{label:string;onClick:()=>void}){return <button type="button" onClick={onClick} aria-label={label} className="grid h-14 w-14 place-items-center rounded-full bg-[#A0472C] text-white shadow-[0_6px_18px_-6px_rgba(160,71,44,.6)]"><ChevronRight size={28}/></button>}
function ToolButton({label,onClick,pressed,children}:{label:string;onClick:()=>void;pressed?:boolean;children:React.ReactNode}){return <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={pressed} className={`grid h-11 w-11 place-items-center rounded-full ${pressed?"bg-[#A0472C] text-white":"text-[#2A2620] hover:bg-[#EFE8D8]"}`}>{children}</button>}
function cardTitle(card:NonNullable<Card>,page:StoryPage){return card.type==="questions"?"Before you turn the page":card.type==="menu"?"Reading settings":card.type==="who"?"Who's who":card.type==="say"?"Say it again":card.type==="word"?"Word":page.mode==="add_detail"?"Add a missing detail":"You illustrate this page"}

function Shell({title,onExit,tools,children}:{title:string;onExit?:()=>void;tools?:React.ReactNode;children:React.ReactNode}){
 return <div className="case-ui fixed inset-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-[#F6F0E3]">
  <header className="flex h-14 shrink-0 items-center gap-1 border-b border-[#E4DCCB] px-2 md:px-4">
   {onExit&&<button type="button" onClick={onExit} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/><span className="hidden sm:inline">Stories</span></button>}
   <h1 className="min-w-0 flex-1 truncate px-1 text-[17px] font-bold">{title}</h1>
   {tools}
  </header>
  {children}
 </div>;
}

// The picture side of a page: the curated illustration, the student's own picture, or a styled placeholder.
function Picture({page,src,isStudent,layout,onFrame,framed}:{page:StoryPage;src?:string;isStudent:boolean;layout:Layout;onFrame:()=>void;framed:boolean}){
 const [broken,setBroken]=useState(false);
 useEffect(()=>setBroken(false),[src]);
 const show=src&&!broken;
 // On phones the text panel covers the lower part of the picture, so prompts sit in the visible top area.
 const zone=layout==="bottom"?"absolute inset-x-0 top-0 h-[42%]":layout==="side"?"absolute inset-y-0 left-0 w-[44%]":"absolute inset-0";
 return <div className="absolute inset-0">
  {show?<img src={src} alt={isStudent?"Your illustration of this page":page.illustration?.alt??""} onError={()=>setBroken(true)} className="absolute inset-0 h-full w-full object-cover"/>
  :<div className="sb-placeholder absolute inset-0" role="img" aria-label="No picture yet"/>}
  <div className={`${zone} grid place-items-center p-4`}>
   {!show&&page.mode==="illustrated"&&<p className="max-w-[18rem] rounded-2xl bg-[#FFFDF8]/80 px-4 py-3 text-center text-[15px] leading-6 text-[#4A4438]"><ImageIcon size={18} className="mb-1 inline text-[#A0472C]"/><br/>The picture for this page is coming. Picture it in your mind as you read.</p>}
   {page.mode==="add_detail"&&<button type="button" onClick={onFrame} className="rounded-2xl bg-[#FFFDF8]/90 px-5 py-3 text-center text-[16px] font-semibold text-[#2A2620] shadow-lg"><PenLine size={18} className="mr-2 inline text-[#A0472C]"/>{framed?"Your detail is saved":"Something's missing. Add a detail"}</button>}
   {page.mode==="student"&&!show&&<button type="button" onClick={onFrame} className="sb-frame rounded-3xl px-6 py-5 text-center"><span className="block text-[20px] font-bold text-[#2A2620]">You illustrate this page</span><span className="mt-1 block text-[15px] text-[#4A4438]">{framed?"Your description is saved. Tap to change it.":"Describe the picture you see in your mind."}</span></button>}
  </div>
 </div>;
}

// One-screen case briefing before page 1: the student's role, why they're here, and what to look for.
function Briefing({world,role,onStart,onExit}:{world:WorldPack;role:WorldPack["roles"][number];onStart:()=>void;onExit:()=>void}){
 return <div className="relative min-h-0 flex-1 overflow-hidden">
  <div className="sb-placeholder absolute inset-0" aria-hidden/>
  <div className="relative mx-auto flex h-full max-w-xl flex-col justify-center p-4">
   <div className="flex max-h-full min-h-0 flex-col rounded-3xl bg-[#FFFDF8]/95 p-6 shadow-[0_10px_40px_-14px_rgba(42,38,32,.45)] md:p-8">
    <div className="min-h-0 overflow-y-auto">
     <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Case briefing · {world.title}</p>
     <h2 className="mt-1 text-[28px] font-bold leading-tight">You are the {role.name}</h2>
     <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Why you're here</p><p className="mt-1 text-[17px] leading-7">{role.briefing}</p>
     <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">What to look for</p><p className="mt-1 text-[17px] leading-7">{role.goal}</p>
     <ul className="mt-4 space-y-1.5 text-[15px] leading-6 text-[#4A4438]"><li>• Read one page at a time. Swipe, use the arrow keys, or tap the arrows.</li><li>• When a page has a clue, prove it with a line from the story to turn the page.</li><li>• Tap an underlined word for help. Use Say it again or Who's who any time.</li></ul>
    </div>
    <div className="mt-6 flex shrink-0 flex-wrap items-center justify-between gap-3"><button type="button" onClick={onExit} className="min-h-11 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Choose another story</button><button type="button" autoFocus onClick={onStart} className="case-primary">Start reading <ArrowRight size={18}/></button></div>
   </div>
  </div>
 </div>;
}
