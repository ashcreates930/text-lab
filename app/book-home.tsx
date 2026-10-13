"use client";
// The home page is a book. The closed cover opens into a two-page spread (stacked pages on phones): students on the
// left, teachers and parents on the right. Returning visitors skip the cover and land on the side they chose last.
// Nothing here calls AI or saves anything beyond the visitor's last side, kept in this browser.
import {useLayoutEffect,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,BookOpen,Bookmark} from "lucide-react";

export type Side="student"|"teacher";
const SIDE_KEY="textlab-home-side";
export function savedSide():Side|null{try{const v=localStorage.getItem(SIDE_KEY);return v==="student"||v==="teacher"?v:null}catch{return null}}
export function saveSide(side:Side){try{localStorage.setItem(SIDE_KEY,side)}catch{}}

// The book fills the space under the top bar exactly, so it never scrolls. Measured in CSS pixels, which differ from
// screen pixels when the Page size setting zooms the page.
function useFitHeight(){
 const ref=useRef<HTMLDivElement>(null),[height,setHeight]=useState<number|null>(null);
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const on=()=>{const zoom=Number(getComputedStyle(document.documentElement).getPropertyValue("--page-zoom"))||1;setHeight(Math.max(320,(window.innerHeight-el.getBoundingClientRect().top)/zoom))};on();window.addEventListener("resize",on);const ro=new ResizeObserver(on);ro.observe(document.body);return()=>{window.removeEventListener("resize",on);ro.disconnect()}},[]);
 return [ref,height] as const;
}
const reducedMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||document.documentElement.dataset.motion==="reduced";

export function BookCover({onOpen}:{onOpen:()=>void}){
 const [ref,height]=useFitHeight();
 const [opening,setOpening]=useState<""|"swing"|"fade">("");
 function open(){if(opening)return;const mode=reducedMotion()?"fade":"swing";setOpening(mode);window.setTimeout(onOpen,mode==="fade"?220:700)}
 return <div ref={ref} style={height?{height}:undefined} className="case-ui flex min-h-0 flex-col items-center justify-center gap-4 overflow-hidden px-4 py-4">
  {/* The cover keeps a book's proportions and takes as much of the screen as fits. */}
  <div className="book-stage relative min-h-0 w-full flex-1">
   <div className="absolute inset-0 grid place-items-center">
    <div onClick={open} className={`book-cover ${opening==="swing"?"book-cover-swing":opening==="fade"?"book-cover-fade":""} relative flex cursor-pointer flex-col items-center justify-between rounded-l-md rounded-r-2xl text-center text-[#FFF6EE]`}>
     <span aria-hidden className="book-spine"/>
     <div className="relative mt-[12%] px-[9%]">
      <h1 className="serif text-[clamp(40px,9vh,76px)] leading-none tracking-[-.02em]">TextLab</h1>
      <p className="serif mt-[6%] text-[clamp(17px,3.2vh,26px)] italic leading-snug text-[#F7E3D7]">Step into the story. Decide what to believe.</p>
     </div>
     <button type="button" onClick={e=>{e.stopPropagation();open()}} className="relative inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FFF6EE] px-6 text-[17px] font-bold text-[#8A3B23] shadow-[0_8px_24px_-10px_rgba(0,0,0,.5)] hover:bg-white"><BookOpen size={20}/> Open the book</button>
     <p className="relative mb-[9%] text-[15px] font-semibold tracking-[.12em] text-[#F7E3D7]">by AmplifiED</p>
    </div>
   </div>
  </div>
  <p className="shrink-0 text-[15px] text-[#6B6457]">For grades 6 to 12 · No student accounts.</p>
 </div>;
}

export function BookSpread({lastSide,onCover,onStartReading,onJoinCode,onTeacher,onApproach,onPricing}:{lastSide:Side|null;onCover:()=>void;onStartReading:()=>void;onJoinCode:(code:string)=>void;onTeacher:()=>void;onApproach:()=>void;onPricing:()=>void}){
 const [ref,height]=useFitHeight();
 const [code,setCode]=useState("");
 // A returning visitor's side comes first on phones and is marked with a bookmark; focus starts on its heading.
 const student=<Page key="student" side="student" marked={lastSide==="student"}>
  <h2 tabIndex={-1} data-autofocus={lastSide==="student"?"":undefined} className="serif text-[clamp(28px,4.4vh,40px)] leading-tight outline-none">I&apos;m a student.</h2>
  <p className="mt-2 text-[17px] leading-7 text-[#4A4438]">Step into a story and solve the case.</p>
  <button type="button" onClick={onStartReading} className="case-primary mt-4 w-full justify-center sm:w-auto">Start reading <ArrowRight size={18}/></button>
  <form onSubmit={e=>{e.preventDefault();if(code.trim())onJoinCode(code.trim().toUpperCase())}} aria-label="Join your class" className="mt-4">
   <label htmlFor="book-class-code" className="text-[15px] font-semibold text-[#4A4438]">Joining a class? Enter your class code.</label>
   <div className="mt-2 flex gap-2"><input id="book-class-code" value={code} onChange={e=>setCode(e.target.value)} placeholder="Class code" autoCapitalize="characters" autoComplete="off" maxLength={24} className="h-12 min-w-0 flex-1 rounded-full border border-[#E4DCCB] bg-white px-4 text-[16px] uppercase placeholder:normal-case placeholder:text-[#8B8478] focus:border-[#A0472C] focus:outline-none"/><button type="submit" disabled={!code.trim()} className="h-12 shrink-0 rounded-full bg-[#2A2620] px-5 text-[16px] font-semibold text-white disabled:opacity-40">Join</button></div>
  </form>
 </Page>;
 const teacher=<Page key="teacher" side="teacher" marked={lastSide==="teacher"}>
  <h2 tabIndex={-1} data-autofocus={lastSide==="teacher"?"":undefined} className="serif text-[clamp(28px,4.4vh,40px)] leading-tight outline-none">I&apos;m a teacher or parent.</h2>
  <p className="mt-2 text-[17px] leading-7 text-[#4A4438]">See what your students experience and how you&apos;d use it.</p>
  <button type="button" onClick={onTeacher} className="case-primary mt-4 w-full justify-center sm:w-auto">Take a look <ArrowRight size={18}/></button>
 </Page>;
 return <div ref={ref} style={height?{height}:undefined} className="book-spread case-ui flex min-h-0 flex-col overflow-y-auto px-3 py-3 md:px-6 md:py-5">
  <h1 className="sr-only">TextLab: choose your side</h1>
  <button type="button" onClick={onCover} className="inline-flex min-h-10 w-fit shrink-0 items-center gap-1.5 rounded-full px-2 text-[14px] font-semibold text-[#8A3B23] hover:bg-[#EFE8D8]"><ArrowLeft size={16}/> Back to the cover</button>
  <div className="book-open book-appear mx-auto mt-2 flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3 [justify-content:safe_center] md:mt-3 md:grid md:grid-cols-2 md:gap-0">
   {lastSide==="teacher"?<>{teacher}{student}</>:<>{student}{teacher}</>}
  </div>
  <p className="mt-3 shrink-0 text-center text-[15px] text-[#6B6457]">Just looking? <button type="button" onClick={onApproach} className="font-semibold text-[#8A3B23] underline underline-offset-4">Read our approach</button> · <button type="button" onClick={onPricing} className="font-semibold text-[#8A3B23] underline underline-offset-4">See pricing</button></p>
 </div>;
}

// One page of the open book. On wide screens the student page is always on the left (md:order) whatever the phone order.
function Page({side,marked,children}:{side:Side;marked:boolean;children:React.ReactNode}){
 return <section aria-label={side==="student"?"For students":"For teachers and parents"} className={`book-page book-page-${side} relative flex min-h-0 shrink-0 flex-col justify-center overflow-hidden px-5 py-4 md:shrink md:px-10 md:py-5 ${side==="student"?"md:order-1":"md:order-2"}`}>
  {marked&&<span className="absolute right-5 top-0 flex items-start gap-1 text-[12px] font-semibold uppercase tracking-wide text-[#8A3B23]"><span aria-hidden className="grid h-9 w-7 place-items-center bg-[#A0472C] text-white [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]"><Bookmark size={13}/></span><span className="mt-1.5">Last time</span></span>}
  <div className="relative">{children}</div>
 </section>;
}
