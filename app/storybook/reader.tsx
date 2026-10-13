"use client";
// Paged storybook reader. One page fills the screen; the screen itself never scrolls. A page whose text does not fit at
// the student's text settings is split into "continued" screens by sentence. The next page opens only after the clues
// on the current page are proven. Cards (questions, words, Say it again, Who's who, reading menu, picture frames) slide
// in over the page.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,BookOpen,ChevronLeft,ChevronRight,ImageIcon,MessageCircleHeart,MessageSquareQuote,PenLine,Type,Users} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {cluesByPage,firstLockedPage,frameKey,pagePassages,pageUnits,plain,sentenceKey,splitSentences,unitText,type Piece,type StoryPage,type Unit} from "@/lib/storybook";
import {isDone} from "../clue-steps";
import {RankChip,playStamp,recordScene} from "../case-game";
import {HomeText,saveHomeLanguage} from "../bilingual";
import type {Demo} from "../page";
import {Drawer,Emph,FrameCard,FullTextCard,LockedHint,QuestionCard,ReadingMenu,SayCard,WhoCard,WordCard} from "./cards";
import {fontStacks,lineSpacings,textSizes,useReaderPrefs} from "./prefs";

// A screen holds units (a paragraph, with its speaker in a play). A piece is a whole sentence or stage direction, or part
// of one too long to fit a screen by itself; full keeps the whole sentence for cards.
type Para=Unit;
type Card=null|{type:"keep"}|{type:"questions"}|{type:"menu"}|{type:"who"}|{type:"frame"}|{type:"full"}|{type:"say";sentence:string;speaker?:string}|{type:"word";term:string;word:string;sentence:string};
type Layout="spread"|"side"|"bottom";
const PARA_CLASS="mb-[0.7em] last:mb-0";
const SAY_CLASS="sb-say mr-[0.25em] inline rounded-md text-left";
const SPEAKER_CLASS="sb-speaker mr-[0.4em]";
// Verse keeps its line breaks; each sentence of a poem starts on its own line.
// A bridge (our summary, not the author's words) sits behind a dashed rule so it never looks like the story text.
const BRIDGE_CLASS="border-l-4 border-dashed border-[#C9B9A0] pl-3";
const VERSE_CLASS="whitespace-pre-line pl-[1.2em]";
const speakerName=(s:string)=>s.trim().replace(/\.$/,"");
const escapeRe=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

// Layout follows the reader's own box, so the same reader works full screen and embedded in the home page hero.
function useLayout(root:React.RefObject<HTMLElement|null>):[Layout,number]{
 const [size,setSize]=useState<[Layout,number]>(["bottom",0]);
 useEffect(()=>{const el=root.current;if(!el)return;const on=()=>{const w=el.clientWidth,h=el.clientHeight;const next:Layout=w>=900&&w>h?"spread":w>h?"side":"bottom";setSize(s=>s[0]===next&&s[1]===h?s:[next,h])};on();const ro=new ResizeObserver(on);ro.observe(el);return()=>ro.disconnect()},[root]);
 return size;
}
export type ReaderProgress={notesSeen?:string[];version?:string;page?:number;part?:number;furthest?:number;briefed?:boolean;sections?:string[];skippedFrames?:string[]};

// Greedy split of a page's sentences into screens that fit the text box, measured with an invisible copy of the text.
// A sentence too tall for an empty screen (very large text on a small phone) is split between words.
// The measurer builds the same elements the page shows: a button per sentence in Say it again mode (buttons wrap as
// blocks), and otherwise italic emphasis and underlined vocabulary buttons (which never break at a hyphen).
function paginate(paras:Para[],box:HTMLElement,measurer:HTMLElement,sayMode=false,vocabRe:RegExp|null=null):Para[][]{
 const max=box.clientHeight-2;if(max<40)return[paras];
 const node=(tag:string,className:string,text:string)=>{const n=document.createElement(tag);if(className)n.className=className;n.textContent=text;return n};
 const words=(seg:string)=>(vocabRe?seg.split(vocabRe):[seg]).map((b,i)=>i%2?node("button","sb-word",b):node("span","",b));
 const render=(list:Para[])=>{measurer.replaceChildren(...list.map(p=>{const el=document.createElement("p");el.className=p.verse?`${PARA_CLASS} ${VERSE_CLASS}`:PARA_CLASS;if(p.speaker)el.append(node("span",SPEAKER_CLASS,speakerName(p.speaker)));for(const i of p.items){const span=document.createElement(i.stage?"em":"span");if(sayMode)span.append(node("button",SAY_CLASS,plain(i.text)));else i.text.split(/_([^_]+)_/).forEach((seg,n)=>{if(n%2){const em=document.createElement("em");em.append(...words(seg));span.append(em)}else span.append(...words(seg))});span.append(p.verse?"\n":" ");el.append(span)}return el}));return measurer.offsetHeight};
 // A unit continued on the next screen keeps its speaker so the reader always knows who is talking.
 const add=(list:Para[],u:Para,item:Piece)=>{const last=list[list.length-1];return last?.id===u.id?[...list.slice(0,-1),{...last,items:[...last.items,item]}]:[...list,{id:u.id,speaker:u.speaker,verse:u.verse,items:[item]}]};
 const fitPieces=(u:Para,item:Piece):Piece[]=>{const one=(text:string)=>[{id:u.id,speaker:u.speaker,verse:u.verse,items:[{...item,text}]}];if(render(one(item.text))<=max)return[item];const words=item.text.split(" "),out:Piece[]=[];let chunk:string[]=[];for(const word of words){const next=[...chunk,word];if(chunk.length&&render(one(next.join(" ")))>max){out.push({...item,text:chunk.join(" ")});chunk=[word]}else chunk=next}if(chunk.length)out.push({...item,text:chunk.join(" ")});return out};
 const parts:Para[][]=[];let cur:Para[]=[];
 for(const para of paras)for(const whole of para.items)for(const item of fitPieces(para,whole)){const trial=add(cur,para,item);if(cur.length&&render(trial)>max){parts.push(cur);cur=add([],para,item)}else cur=trial}
 if(cur.length)parts.push(cur);
 measurer.replaceChildren();
 return parts.length?parts:[paras];
}

// mode "preview" is the home page hero: the first few pages only, no AI, no clue gate, no saved progress.
export function StorybookReader({world,role,passages,demo,setDemo,onExit,onFeedback,mode="full",previewPages=2,onKeepReading}:{world:WorldPack;role:WorldPack["roles"][number];passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onExit:()=>void;onFeedback?:()=>void;mode?:"full"|"preview";previewPages?:number;onKeepReading?:()=>void}){
 const preview=mode==="preview";
 const rootRef=useRef<HTMLDivElement>(null);
 // Progress is kept per story so the shelf's Continue card can return to the exact page and screen.
 const prog:ReaderProgress=demo.readerProgress?.[world.id]??{};
 const setProg=useCallback((patch:ReaderProgress|((p:ReaderProgress)=>ReaderProgress))=>setDemo(d=>{const cur=d.readerProgress?.[world.id]??{};const next=typeof patch==="function"?patch(cur):{...cur,...patch};return {...d,readerProgress:{...(d.readerProgress??{}),[world.id]:next}}}),[setDemo,world.id]);
 const book=world.storybook!;const pages=preview?book.pages.slice(0,previewPages):book.pages;const last=pages.length-1;
 const gates=useMemo(()=>cluesByPage(world),[world]);
 const [prefs,update]=useReaderPrefs();const [layout,readerHeight]=useLayout(rootRef);
 const [card,setCard]=useState<Card>(null),[sayMode,setSayMode]=useState(false),[celebrate,setCelebrate]=useState<{title:string;rankUp:string|null}|null>(null);
 const index=Math.min(Math.max(prog.page??0,0),last);const page=pages[index];
 const pageDone=useCallback((i:number)=>gates[i].every(({clue})=>isDone(demo,clue.id)),[gates,demo]);
 // The first page the student may not pass yet (an unproven clue or a missing required frame), or -1 when none.
 const locked=useMemo(()=>preview?-1:firstLockedPage(world,id=>isDone(demo,id),k=>!!demo.storyFrames?.[k]),[preview,world,demo]);
 // Saved progress can never sit past the gate, whatever is in storage: the reader moves back to the locked page.
 useLayoutEffect(()=>{if(locked>=0&&(prog.page??0)>locked)setProg(p=>({...p,page:locked,part:0,furthest:Math.min(p.furthest??0,locked)}))},[locked,prog.page,setProg]);
 const furthest=Math.max(prog.furthest??0,index);
 // A bridge page shows our labeled summary of skipped paragraphs; the author's words are one tap away.
 const bridge=page.bridge;
 const paras=useMemo<Para[]>(()=>bridge?[{id:`${page.id}-summary`,items:splitSentences(bridge.summary).map(t=>({text:t,full:t}))}]:pageUnits(passages,page,book.format),[passages,page,bridge,book.format]);
 const pageText=useMemo(()=>unitText(paras),[paras]);
 // Page numbers count story pages only; a bridge sits between two of them.
 const realPages=useMemo(()=>pages.map((_,i)=>pages.slice(0,i+1).filter(x=>!x.bridge).length),[pages]);
 const realCount=book.pages.filter(p=>!p.bridge).length;
 const section=book.sections.find(s=>s.id===page.section);
 const open=gates[index].filter(({clue})=>!isDone(demo,clue.id)).length;
 // A required picture frame is part of the page's gate; optional frames never block and can be skipped.
 const frameNeeded=!!page.frame_required&&!demo.storyFrames?.[frameKey(world.id,page.id)];
 const frameSkipped=(prog.skippedFrames??[]).includes(page.id);
 // A content note shows once per page, before the page's text (or, on a bridge, before its full text).
 const noteDue=!preview&&!!page.content_note&&!(prog.notesSeen??[]).includes(page.id);
// The note takes focus when it appears, after the app has focused the screen heading.
 useEffect(()=>{if(!noteDue||bridge)return;const t=window.setTimeout(()=>document.getElementById("sb-note-h")?.focus(),60);return()=>window.clearTimeout(t)},[noteDue,bridge,page.id]);
 const markNoteRead=useCallback(()=>setProg(p=>({...p,notesSeen:[...new Set([...(p.notesSeen??[]),page.id])]})),[setProg,page.id]);

 // Pagination: re-measure whenever the page, text settings, layout, panel size, or fonts change.
 const box=useRef<HTMLDivElement>(null),measurer=useRef<HTMLDivElement>(null);
 const [parts,setParts]=useState<Para[][]>([paras]),[part,setPartState]=useState(prog.part??0),[tick,setTick]=useState(0);
 // The current screen is mirrored in a ref so saving it to progress happens outside React's state updater.
 const partRef=useRef(prog.part??0);
 const setPart=useCallback((n:number|((p:number)=>number))=>{const v=typeof n==="function"?n(partRef.current):n;partRef.current=v;setPartState(v);if(!preview)setProg({part:v})},[preview,setProg]);
 const wantLastPart=useRef(false);
 const vocab=book.vocabulary;
 const vocabRe=useMemo(()=>{const forms=vocab.flatMap(v=>[v.term,...v.forms]).filter(Boolean).sort((a,b)=>b.length-a.length);return forms.length?new RegExp(`\\b(${forms.map(escapeRe).join("|")})\\b`,"gi"):null},[vocab]);
 // On a phone, very large text leaves the text panel over the picture room for only a line or two; below about five
 // lines the page switches to the text-only view (frames stay on the toolbar and the page-turn button).
 const lineHeight=textSizes[prefs.size]*lineSpacings[prefs.spacing];
 const cramped=!preview&&layout==="bottom"&&readerHeight>0&&(readerHeight-128)*0.58-64<lineHeight*5;
 useLayoutEffect(()=>{if(!box.current||!measurer.current)return;const next=paginate(paras,box.current,measurer.current,sayMode,vocabRe);setParts(next);setPart(p=>wantLastPart.current?next.length-1:Math.min(p,next.length-1));wantLastPart.current=false},[paras,prefs,layout,tick,prog.briefed,sayMode,vocabRe,cramped]);
 useEffect(()=>{const el=box.current;if(!el)return;const ro=new ResizeObserver(()=>setTick(t=>t+1));ro.observe(el);document.fonts?.ready.then(()=>setTick(t=>t+1));return()=>ro.disconnect()},[prefs.view,layout,prog.briefed,cramped]);
 // The reading screen never scrolls.
 useEffect(()=>{if(preview)return;const root=document.documentElement,prev=root.style.overflow;root.style.overflow="hidden";return()=>{root.style.overflow=prev}},[preview]);

 const goTo=useCallback((i:number,toLastPart=false)=>{wantLastPart.current=toLastPart;partRef.current=0;setPartState(0);setSayMode(false);setProg(p=>({...p,page:i,part:0,furthest:Math.max(p.furthest??0,i)}))},[setProg]);
 // "Section solved" comes only after every clue in the section is proven. A section with no clues is recorded
 // quietly: no stamp, no rank, and no claim that clues were proven.
 const finishSection=useCallback((id:string)=>{if((prog.sections??[]).includes(id))return;const clues=pages.flatMap((p,i)=>p.section===id?gates[i]:[]);if(!clues.every(({clue})=>isDone(demo,clue.id)))return;if(!clues.length){setProg(p=>({...p,sections:[...(p.sections??[]),id]}));return}const title=book.sections.find(s=>s.id===id)?.title??"";const rankUp=recordScene(`${world.id}:${id}`);playStamp();setCelebrate({title,rankUp});setProg(p=>({...p,sections:[...(p.sections??[]),id]}));setDemo(d=>({...d,events:[...d.events,"scene_complete"]}))},[prog.sections,book.sections,world.id,setProg,setDemo,pages,gates,demo]);
 // advance() turns forward; next() is the same but ignores input while a card or celebration is open.
 const advance=useCallback(()=>{
  if(part<parts.length-1){setPart(part+1);return}
  if(preview&&(index===last||!pageDone(index))){setCard({type:"keep"});return}
  if(!pageDone(index)){setCard({type:"questions"});return}
  if(frameNeeded){setCard({type:"frame"});return}
  // The case closes only when every clue in the story is proven; otherwise go back to the first unproven one.
  if(index===last&&locked>=0&&locked!==index){goTo(locked);setCard({type:"questions"});return}
  if(index===last){finishSection(page.section);setDemo(d=>({...d,submitted:true,events:[...d.events,"case_closed"]}));return}
  if(pages[index+1].section!==page.section)finishSection(page.section);
  goTo(index+1);
 },[preview,part,parts.length,pageDone,frameNeeded,index,last,locked,page.section,pages,finishSection,goTo,setDemo,setPart]);
 const next=useCallback(()=>{if(!card&&!celebrate)advance()},[card,celebrate,advance]);
 const prev=useCallback(()=>{if(card||celebrate)return;if(part>0){setPart(part-1);return}if(index>0)goTo(index-1,true)},[card,celebrate,part,index,goTo,setPart]);

 useEffect(()=>{const key=(e:KeyboardEvent)=>{const t=e.target;if(t instanceof Element&&t.closest("input,textarea,select,[contenteditable]"))return;if(preview&&!(t instanceof Node&&rootRef.current?.contains(t)))return;if(e.key==="ArrowRight"){e.preventDefault();next()}else if(e.key==="ArrowLeft"){e.preventDefault();prev()}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[next,prev,preview]);
 const swipe=useRef<{x:number;y:number}|null>(null);
 const onPointerDown=(e:React.PointerEvent)=>{if(card||e.pointerType==="mouse")return;swipe.current={x:e.clientX,y:e.clientY}};
 const onPointerUp=(e:React.PointerEvent)=>{const s=swipe.current;swipe.current=null;if(!s)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.abs(dx)>60&&Math.abs(dx)>1.5*Math.abs(dy)){if(dx<0)next();else prev()}};

 // Vocabulary words are underlined buttons that open the word card.
 const findVocab=(word:string)=>vocab.find(v=>[v.term,...v.forms].some(f=>f.toLowerCase()===word.toLowerCase()));
 const textStyle={fontSize:textSizes[prefs.size],lineHeight:lineSpacings[prefs.spacing],fontFamily:fontStacks[prefs.font]};
 function renderSentence({text,full,stage}:Piece,key:string,speaker?:string,verse=false){
  const sep=verse?"\n":" ";
  // Stage directions stay italic; .sb-say inherits its font from the <em> around it.
  const Tag=stage?"em":"span";
  if(sayMode)return <Tag key={key}><button type="button" onClick={()=>setCard({type:"say",sentence:full,speaker:!stage&&speaker?speakerName(speaker):undefined})} className={SAY_CLASS}><Emph text={text}/></button>{verse&&sep}</Tag>;
  // Spoken emphasis (_know_) is italic; vocabulary words inside it are still tappable.
  const words=(seg:string,k:string)=>(vocabRe?seg.split(vocabRe):[seg]).map((b,i)=>{const v=i%2===1?findVocab(b):undefined;return v?<button type="button" key={`${k}-${i}`} onClick={()=>setCard({type:"word",term:v.term,word:b,sentence:full})} className="sb-word">{b}</button>:<span key={`${k}-${i}`}>{b}</span>});
  return <Tag key={key}>{text.split(/_([^_]+)_/).map((seg,n)=>n%2?<em key={n}>{words(seg,String(n))}</em>:words(seg,String(n)))}{sep}</Tag>;
 }

 const characters=pages.slice(0,furthest+1).flatMap(p=>p.characters_met);
 const frame=demo.storyFrames?.[frameKey(world.id,page.id)];
 const studentImage=frame?.image;
 const art=page.illustration?.src||studentImage;

 if(!preview&&!prog.briefed)return <Shell rootRef={rootRef} title={world.title}><Briefing world={world} role={role} onStart={roleId=>{if(roleId!==role.id)setDemo(d=>({...d,role:roleId}));setProg(p=>({...p,briefed:true,page:p.page??0}))}} onExit={onExit}/></Shell>;

 const textPanel=(extra="")=><div className={`flex min-h-0 flex-col ${extra}`}>
  {/* The part counter sits in a fixed-width slot, always reserved, so the title wraps the same way on every screen of a
      page and the text box keeps the height it was measured with. */}
  <div className="mb-2 flex shrink-0 items-start justify-between gap-3 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">
   <p className="min-w-0">{bridge?`Between the pages: a summary, not ${world.author.split(" ").pop()}'s words`:section?.title}</p>
   <p className={`shrink-0 whitespace-nowrap text-right tabular-nums ${parts.length>1?"":"invisible"}`} aria-hidden={parts.length<2}><span className="sr-only">Part </span><span className="inline-block min-w-[7ch]">{part+1} of {parts.length}</span></p>
  </div>
  <div ref={box} className="relative min-h-0 flex-1 overflow-hidden text-[#2A2620]" style={textStyle}>
   <div ref={measurer} aria-hidden className={`pointer-events-none invisible absolute inset-x-0 top-0 ${bridge?BRIDGE_CLASS:""}`}/>
   <div className={bridge?`${BRIDGE_CLASS} text-[#4A4438]`:undefined}>{(parts[part]??paras).map((p,i)=><p key={`${p.id}-${i}`} className={p.verse?`${PARA_CLASS} ${VERSE_CLASS}`:PARA_CLASS}>{p.speaker&&<span className={SPEAKER_CLASS}>{speakerName(p.speaker)}</span>}{p.items.map((s,j)=>renderSentence(s,`${p.id}-${j}`,p.speaker,p.verse))}</p>)}</div>
  </div>
  {sayMode&&<p className="mt-2 shrink-0 text-[14px] font-semibold text-[#8A3B23]">Tap a sentence to say it again.</p>}
  {bridge&&<button type="button" onClick={()=>setCard({type:"full"})} className="mt-2 inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-[#F4E1D6] px-4 text-[15px] font-semibold text-[#8A3B23] hover:bg-[#EDD3C4]"><BookOpen size={18}/> Read this part in full</button>}
 </div>;

 const picture=<Picture bridge={!!bridge} page={page} src={art} isStudent={!!studentImage&&!page.illustration?.src} layout={layout} onFrame={()=>setCard({type:"frame"})} framed={!!frame} skipped={frameSkipped&&!frame} onSkip={()=>setProg(p=>({...p,skippedFrames:[...new Set([...(p.skippedFrames??[]),page.id])]}))}/>;
 const textOnly=prefs.view==="text"||cramped;

 return <Shell rootRef={rootRef} preview={preview} title={world.title} onExit={preview?undefined:onExit} tools={<>
   <ToolButton label="Who's who" onClick={()=>setCard({type:"who"})}><Users size={20}/></ToolButton>
   {!bridge&&<ToolButton label={sayMode?"Stop Say it again":"Say it again"} pressed={sayMode} onClick={()=>setSayMode(v=>!v)}><MessageSquareQuote size={20}/></ToolButton>}
   {!preview&&!bridge&&page.mode!=="illustrated"&&<ToolButton label={page.mode==="add_detail"?"Add a detail":"Illustrate this page"} onClick={()=>setCard({type:"frame"})}><PenLine size={20}/></ToolButton>}
   <ToolButton label="Reading settings" onClick={()=>setCard({type:"menu"})}><Type size={20}/></ToolButton>
   {!preview&&onFeedback&&<button type="button" onClick={onFeedback} className="ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#F4E1D6] px-3 text-[14px] font-semibold text-[#8A3B23] hover:bg-[#EDD3C4]"><MessageCircleHeart size={18}/><span className="hidden md:inline">Give feedback</span><span className="md:hidden">Feedback</span></button>}
  </>}>
  <div className="relative min-h-0 flex-1" style={{touchAction:"pan-y pinch-zoom"}} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={()=>{swipe.current=null}}>
   {textOnly?<div className="mx-auto flex h-full max-w-[760px] flex-col px-4 py-3 md:px-8 md:py-6"><div className="flex min-h-0 flex-1 flex-col rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_18px_-8px_rgba(42,38,32,.3)] md:p-8">{textPanel("flex-1")}</div></div>
   :layout==="spread"?<div className="grid h-full grid-cols-2 gap-4 p-4"><div className="relative overflow-hidden rounded-3xl bg-[#EFE8D8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.35)]">{picture}</div><div className="flex min-h-0 flex-col rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_10px_40px_-14px_rgba(42,38,32,.3)] lg:p-8">{textPanel("flex-1")}</div></div>
   :<div className="absolute inset-0">{picture}<div className={`absolute flex flex-col rounded-3xl bg-[#FFFDF8]/90 p-4 shadow-[0_10px_40px_-14px_rgba(42,38,32,.45)] backdrop-blur-md sm:p-5 ${layout==="side"?"bottom-3 right-3 top-3 w-[56%]":"inset-x-3 bottom-3 h-[58%]"}`}>{textPanel("flex-1")}</div></div>}
   {card&&<Drawer title={cardTitle(card,page)} wide={card.type==="questions"} onClose={()=>setCard(null)}>
    {card.type==="questions"&&!preview&&<QuestionCard world={world} roleId={role.id} items={gates[index]} demo={demo} setDemo={setDemo} passages={passages} lastPage={index===last} reading={{throughParagraph:pages[furthest].end,characters:characters.map(c=>c.id)}} onAllDone={()=>{setCard(null);advance()}}/>}
    {card.type==="menu"&&<ReadingMenu prefs={prefs} update={update} spanish={demo.homeLanguage==="es"} onSpanish={preview?undefined:on=>{setDemo(d=>({...d,homeLanguage:on?"es":null}));saveHomeLanguage(on?"es":null)}}/>}
    {card.type==="who"&&<WhoCard characters={characters}/>}
    {card.type==="say"&&<SayCard sentence={card.sentence} speaker={card.speaker} restatement={page.restatements[sentenceKey(card.sentence)]}/>}
    {card.type==="full"&&<FullTextCard passages={pagePassages(passages,page)} format={book.format} note={noteDue?page.content_note:undefined} onNoteRead={markNoteRead}/>}
    {card.type==="word"&&(()=>{const v=vocab.find(x=>x.term===card.term);return v?<WordCard entry={v} word={card.word} sentence={card.sentence}/>:null})()}
    {card.type==="keep"&&<div className="space-y-4"><p className="text-[17px] leading-7">{open?"In the full demo, you prove this clue with a line from the story before the page turns. Characters can help, but they can be wrong.":"That's the end of the preview."}</p><p className="text-[16px] leading-7 text-[#4A4438]">Keep reading to open the whole case: {realCount} pages, every clue, and your case file.</p>{onKeepReading&&<button type="button" onClick={onKeepReading} className="case-primary w-full">Keep reading <ArrowRight size={18}/></button>}</div>}
    {card.type==="frame"&&<FrameCard worldId={world.id} page={page} pageText={pageText} demo={demo} setDemo={setDemo} onSkip={()=>{setProg(p=>({...p,skippedFrames:[...new Set([...(p.skippedFrames??[]),page.id])]}));setCard(null)}} onContinue={()=>{setCard(null);advance()}} lastPage={index===last&&pageDone(index)}/>}
   </Drawer>}
   {noteDue&&!bridge&&!celebrate&&<div className="absolute inset-0 z-40 grid place-items-center bg-[#F6F0E3] p-6"><div role="dialog" aria-modal="true" aria-labelledby="sb-note-h" className="case-rise w-full max-w-md rounded-3xl bg-[#FFFDF8] p-7 shadow-2xl">
    <h2 id="sb-note-h" tabIndex={-1} className="text-[22px] font-bold outline-none">A note before you read</h2>
    <p className="mt-3 text-[17px] leading-7">{page.content_note}</p>
    <button type="button" autoFocus onClick={markNoteRead} className="case-primary mt-6 w-full">Continue reading <ArrowRight size={18}/></button>
   </div></div>}
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
    <p className="text-[16px] font-semibold">{bridge?`Between pages ${realPages[index]} and ${realPages[index]+1}`:`Page ${realPages[index]} of ${preview?realPages[last]:realCount}`}</p>
    <div className="mx-auto mt-1.5 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-[#E4DCCB]" aria-hidden><div className="h-full rounded-full bg-[#A0472C] transition-[width]" style={{width:`${((index+(part+1)/parts.length)/pages.length)*100}%`}}/></div>
   </div>
   {part<parts.length-1?<NavNext label="Next" onClick={next}/>
   :open?<button type="button" onClick={()=>setCard({type:preview?"keep":"questions"})} className="case-primary min-h-14 px-4 text-[15px]"><span className="hidden sm:inline"><LockedHint count={open}/></span><span className="sm:hidden">Prove {open===1?"clue":`${open} clues`}</span></button>
   :frameNeeded?<button type="button" onClick={()=>setCard({type:"frame"})} className="case-primary min-h-14 px-4 text-[15px]"><PenLine size={18}/><span className="hidden sm:inline">Finish your picture to turn the page</span><span className="sm:hidden">Finish picture</span></button>
   :index===last?<button type="button" onClick={next} className="case-primary min-h-14">Close the case <ArrowRight size={18}/></button>
   :<NavNext label="Next page" onClick={next}/>}
  </nav>
 </Shell>;
}
function NavNext({label,onClick}:{label:string;onClick:()=>void}){return <button type="button" onClick={onClick} aria-label={label} className="grid h-14 w-14 place-items-center rounded-full bg-[#A0472C] text-white shadow-[0_6px_18px_-6px_rgba(160,71,44,.6)]"><ChevronRight size={28}/></button>}
function ToolButton({label,onClick,pressed,children}:{label:string;onClick:()=>void;pressed?:boolean;children:React.ReactNode}){return <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={pressed} className={`grid h-11 w-11 place-items-center rounded-full ${pressed?"bg-[#A0472C] text-white":"text-[#2A2620] hover:bg-[#EFE8D8]"}`}>{children}</button>}
function cardTitle(card:NonNullable<Card>,page:StoryPage){return card.type==="keep"?"Keep reading":card.type==="full"?"The author's words":card.type==="questions"?"Before you turn the page":card.type==="menu"?"Reading settings":card.type==="who"?"Who's who":card.type==="say"?"Say it again":card.type==="word"?"Word":page.mode==="add_detail"?"Add a missing detail":"You illustrate this page"}

function Shell({title,onExit,tools,children,rootRef,preview=false}:{title:string;onExit?:()=>void;tools?:React.ReactNode;children:React.ReactNode;rootRef:React.RefObject<HTMLDivElement|null>;preview?:boolean}){
 // Full screen in the reader; a bordered box on the home page hero. The full reader opens with a short book-opening motion.
 return <div ref={rootRef} className={preview?"case-ui relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#E4DCCB] bg-[#F6F0E3] shadow-[0_24px_60px_-24px_rgba(42,38,32,.45)]":"sb-open case-ui fixed inset-0 z-40 flex h-[calc(100dvh/var(--page-zoom,1))] flex-col overflow-hidden bg-[#F6F0E3]"}>
  <header className="flex h-14 shrink-0 items-center gap-1 border-b border-[#E4DCCB] px-2 md:px-4">
   {onExit&&<button type="button" onClick={onExit} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/><span className="hidden sm:inline">Stories</span></button>}
   <h1 className="min-w-0 flex-1 truncate px-1 text-[17px] font-bold">{title}</h1>
   {tools}
  </header>
  {children}
 </div>;
}

// The picture side of a page: the curated illustration, the student's own picture, or a styled placeholder.
function Picture({bridge,page,src,isStudent,layout,onFrame,framed,skipped,onSkip}:{bridge:boolean;page:StoryPage;src?:string;isStudent:boolean;layout:Layout;onFrame:()=>void;framed:boolean;skipped:boolean;onSkip:()=>void}){
 const optional=!page.frame_required;
 const [broken,setBroken]=useState(false);
 useEffect(()=>setBroken(false),[src]);
 const show=src&&!broken;
 // On phones the text panel covers the lower part of the picture, so prompts sit in the visible top area.
 const zone=layout==="bottom"?"absolute inset-x-0 top-0 h-[42%]":layout==="side"?"absolute inset-y-0 left-0 w-[44%]":"absolute inset-0";
 return <div className="absolute inset-0">
  {show?<img src={src} alt={isStudent?"Your illustration of this page":page.illustration?.alt??""} onError={()=>setBroken(true)} className="absolute inset-0 h-full w-full object-cover"/>
  :<div className="sb-placeholder absolute inset-0" role="img" aria-label="No picture yet"/>}
  <div className={`${zone} grid place-items-center p-4`}>
   {bridge?null:<>{!show&&(page.mode==="illustrated"||skipped)&&<p className="max-w-[18rem] rounded-2xl bg-[#FFFDF8]/80 px-4 py-3 text-center text-[15px] leading-6 text-[#4A4438]"><ImageIcon size={18} className="mb-1 inline text-[#A0472C]"/><br/>The picture for this page is coming. Picture it in your mind as you read.</p>}
   {page.mode==="add_detail"&&!skipped&&<div className="flex flex-col items-center gap-2"><button type="button" onClick={onFrame} className="rounded-2xl bg-[#FFFDF8]/90 px-5 py-3 text-center text-[16px] font-semibold text-[#2A2620] shadow-lg"><PenLine size={18} className="mr-2 inline text-[#A0472C]"/>{framed?"Your detail is saved":optional?"Something's missing. Add a detail (optional)":"Something's missing. Add a detail"}</button>{optional&&!framed&&<SkipButton onSkip={onSkip}/>}</div>}
   {page.mode==="student"&&!show&&!skipped&&<div className="flex flex-col items-center gap-2"><button type="button" onClick={onFrame} className="sb-frame rounded-3xl px-6 py-5 text-center"><span className="block text-[20px] font-bold text-[#2A2620]">You illustrate this page{optional&&!framed?" (optional)":""}</span><span className="mt-1 block text-[15px] text-[#4A4438]">{framed?"Your description is saved. Tap to change it.":"Describe the picture you see in your mind."}</span></button>{optional&&!framed&&<SkipButton onSkip={onSkip}/>}</div>}</>}
  </div>
 </div>;
}

function SkipButton({onSkip}:{onSkip:()=>void}){return <button type="button" onClick={onSkip} className="min-h-11 rounded-full bg-[#FFFDF8]/90 px-5 text-[15px] font-semibold text-[#6B6457] shadow">Skip</button>}

// One-screen case briefing before page 1. The student chooses a role (Investigator, Attorney, Reporter...) here; the
// briefing below the choices follows the role picked, and Start reading opens page 1 as that role.
function Briefing({world,role,onStart,onExit}:{world:WorldPack;role:WorldPack["roles"][number];onStart:(roleId:string)=>void;onExit:()=>void}){
 const [picked,setPicked]=useState(role.id);
 const chosen=world.roles.find(r=>r.id===picked)??role;
 return <div className="relative min-h-0 flex-1 overflow-hidden">
  <div className="sb-placeholder absolute inset-0" aria-hidden/>
  <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-center p-3 md:p-4">
   <div className="flex max-h-full min-h-0 flex-col rounded-3xl bg-[#FFFDF8]/95 p-5 shadow-[0_10px_40px_-14px_rgba(42,38,32,.45)] md:p-7">
    <div className="min-h-0 overflow-y-auto">
     <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Case briefing · {world.title}</p>
     <fieldset className="mt-1">
      <legend className="text-[26px] font-bold leading-tight">Choose your role</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">{world.roles.map(r=><label key={r.id} className={`flex cursor-pointer flex-col rounded-2xl border-2 p-3 transition ${picked===r.id?"border-[#A0472C] bg-[#F4E1D6]/70":"border-[#E4DCCB] bg-white hover:border-[#C9B9A0]"}`}>
       <input type="radio" name="sb-role" value={r.id} checked={picked===r.id} onChange={()=>setPicked(r.id)} className="sr-only"/>
       <span className="text-[17px] font-bold leading-snug">{r.name}</span><span className="mt-0.5 text-[14px] leading-5 text-[#4A4438]">{r.description}</span>
      </label>)}</div>
     </fieldset>
     <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Why you're here</p><p className="mt-1 text-[16px] leading-6">{chosen.briefing}</p><HomeText text={chosen.briefing}/>
     <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">What to look for</p><p className="mt-1 text-[16px] leading-6">{chosen.goal}</p><HomeText text={chosen.goal}/>
     <p className="mt-3 text-[14px] leading-6 text-[#4A4438]">Read one page at a time. Prove each clue with a line from the story to turn the page. Tap an underlined word for help.</p>
    </div>
    <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-3"><button type="button" onClick={onExit} className="min-h-11 text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Choose another story</button><button type="button" onClick={()=>onStart(chosen.id)} className="case-primary">Start reading as {chosen.name.split(" ").pop()} <ArrowRight size={18}/></button></div>
   </div>
  </div>
 </div>;
}
