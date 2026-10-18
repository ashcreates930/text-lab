"use client";
// The storyboard in the scene game: the strip of frames on the scene screen, the screen for completing a frame (choose
// your line, describe what you see, check it), and the storyboard rows on the case board and the printout.
// Rules (which frames, what counts) live in lib/storyboard.ts.
import {useState} from "react";
import {ArrowLeft,Check,ImageIcon,PenLine,Sparkles} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {pagePassages} from "@/lib/storybook";
import {frameSaved,makeSavedFrame,type BoardFrame,type SavedFrame,type SceneFrame} from "@/lib/storyboard";
import type {Demo} from "./page";
import {EvidenceLines} from "./evidence-lines";

const card="rounded-3xl bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]";

// "Your storyboard": this scene's frames in story order. The story's own frames show their picture; frames to complete
// show a dashed outline until the student saves them.
export function StoryboardStrip({frames,saved,onOpen}:{frames:SceneFrame[];saved:Record<string,SavedFrame>|undefined;onOpen:(key:string)=>void}){
 if(!frames.length)return null;
 return <section aria-labelledby="storyboard-h" className="mt-10">
  <div className="flex items-end justify-between gap-4"><h2 id="storyboard-h" className="text-[21px] font-bold sm:text-[24px]">Your storyboard</h2><p className="text-[15px] font-semibold text-[#2A2620]">{frames.filter(f=>f.kind==="provided"||frameSaved(saved,f.key)).length} of {frames.length} frames</p></div>
  <p className="mt-1 text-[15px] text-[#6B6457]">The story paints the first frame. You complete the rest from the text.</p>
  <ol className="mt-4 grid gap-4 sm:grid-cols-3">{frames.map((f,i)=><li key={f.key}><FrameCard frame={f} index={i} mine={saved?.[f.key]} onOpen={()=>onOpen(f.key)}/></li>)}</ol>
 </section>;
}

function FrameCard({frame,index,mine,onOpen}:{frame:SceneFrame;index:number;mine?:SavedFrame;onOpen:()=>void}){
 const done=!!mine?.description?.trim();
 const picture=done?(mine!.image??(frame.kind==="add_detail"?frame.picture:undefined)):frame.picture;
 const label=`Frame ${index+1}`;
 if(frame.kind==="provided")return <figure className={`${card} overflow-hidden`}>
  {picture?<img src={picture} alt={frame.page.illustration?.alt??""} className="aspect-[3/2] w-full object-cover"/>:<div className="aspect-[3/2] w-full bg-[#EFE8D8]"/>}
  <figcaption className="p-3 text-[14px] leading-5 text-[#4A4438]"><span className="block text-[12px] font-semibold uppercase tracking-wide text-[#8A3B23]">{label} · From the story</span>{frame.page.illustration?.alt}</figcaption>
 </figure>;
 return <button type="button" onClick={onOpen} className={`group block w-full overflow-hidden text-left ${done?card:"rounded-3xl border-2 border-dashed border-[#C9A898] bg-[#FFFDF8]/60 hover:border-[#A0472C]"}`}>
  {picture?<span className="relative block"><img src={picture} alt={done?`Your frame: ${mine!.description}`:frame.page.illustration?.alt??""} className={`aspect-[3/2] w-full object-cover ${done?"":"opacity-80"}`}/>{!done&&frame.kind==="add_detail"&&<span className="absolute inset-x-2 bottom-2 rounded-xl bg-[#FFFDF8]/95 px-3 py-1.5 text-[13px] font-semibold text-[#8A3B23]">The artist left one detail out</span>}</span>
   :<span className="grid aspect-[3/2] w-full place-items-center bg-[#F6F0E3] px-4 text-center">{done?<span className="font-serif text-[15px] italic leading-6 text-[#4A4438]">“{mine!.description.slice(0,140)}{mine!.description.length>140?"…":""}”</span>:<span className="flex flex-col items-center gap-2 text-[16px] font-semibold text-[#8A3B23]"><PenLine size={22}/>Complete this frame.</span>}</span>}
  <span className="block p-3">
   <span className="block text-[12px] font-semibold uppercase tracking-wide text-[#8A3B23]">{label}{done?" · Saved":""}</span>
   {frame.required&&<span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${done?"bg-[#F4E1D6] text-[#8A3B23]":"bg-[#A0472C] text-white"}`}>{done&&<Check size={12}/>}Needed to finish this scene.</span>}
   <span className="mt-1 block text-[14px] leading-5 text-[#4A4438]">{done?mine!.quote.slice(0,90)+(mine!.quote.length>90?"…":""):frame.kind==="add_detail"?"Add the missing detail.":frame.page.frame_prompt?.split(".")[0]+"."}</span>
  </span>
 </button>;
}

type Check={ok:boolean|null;notes:string[]};
const STARTERS=["In this moment, I see…","The setting looks…"];

// Completing one frame, on its own screen: 1 choose your line, 2 describe what you see, 3 check it. After a passing
// check the student can create a picture; saving without a picture is always available and still counts.
export function FrameView({world,frame,passages,demo,setDemo,onClose}:{world:WorldPack;frame:SceneFrame;passages:SourcePassage[];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onClose:(saved:boolean)=>void}){
 const prior=demo.storyFrames?.[frame.key];
 const lines=pagePassages(passages,frame.page);
 const [quote,setQuote]=useState(prior?.quote??"");
 const [description,setDescription]=useState(prior?.description??"");
 const [check,setCheck]=useState<Check|null>(null),[checking,setChecking]=useState(false);
 const [painting,setPainting]=useState(false),[image,setImage]=useState<string|null>(null),[noPicture,setNoPicture]=useState(""),[tries,setTries]=useState(0);
 const addDetail=frame.kind==="add_detail";
 const prompt=addDetail?"The artist left one detail out of this picture on purpose. Find it in the text, then describe it so it can be added.":frame.page.frame_prompt??"Picture this moment. What do you see?";
 const sentencesCount=description.split(/[.!?]+/).filter(s=>s.trim()).length;
 const ready=!!quote&&description.trim().length>=12;
 const kind=addDetail?"add_detail" as const:"student" as const;
 async function runCheck(){
  setChecking(true);setImage(null);setNoPicture("");
  try{const r=await fetch("/api/frame-check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId:demo.id,worldId:world.id,pageId:frame.page.id,quote,description})});setCheck(r.ok?await r.json():{ok:null,notes:["We couldn't check this one right now. You can still save your frame."]})}
  catch{setCheck({ok:null,notes:["We couldn't check this one right now. You can still save your frame."]})}
  setChecking(false);
 }
 async function createPicture(){
  setPainting(true);setNoPicture("");setTries(t=>t+1);
  let result:{image?:string|null;blocked?:boolean;message?:string}={};
  try{const r=await fetch("/api/frame-image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId:demo.id,worldId:world.id,pageId:frame.page.id,quote,description,classToken:demo.classAuth?.token})});if(r.ok)result=await r.json()}catch{}
  setPainting(false);
  if(result.image){setImage(result.image);return}
  setNoPicture(result.blocked&&result.message?result.message:"Pictures aren't available right now. Save your frame without one. It still counts.");
 }
 function save(withImage:boolean){
  setDemo(d=>({...d,storyFrames:{...(d.storyFrames??{}),[frame.key]:makeSavedFrame(kind,quote,description,check?.ok===null||!check?undefined:{ok:check.ok,notes:check.notes},withImage&&image?image:undefined)}}));
  onClose(true);
 }
 const step=!quote?1:check?3:2;
 return <div className="case-ui mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8">
  <button onClick={()=>onClose(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[16px] font-semibold text-[#2A2620] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Back to the scene</button>
  <p className="mt-4 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your storyboard · Step {step} of 3{frame.required?" · Needed to finish this scene":""}</p>
  <h1 className="mt-1 text-[28px] font-bold leading-tight outline-none">{addDetail?"Add the missing detail":"Complete this frame"}</h1>
  <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
   <section className={`${card} p-4 md:p-5`} aria-labelledby="frame-line-h">
    <h2 id="frame-line-h" className="px-1 text-[17px] font-bold"><span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#A0472C] text-[14px] text-white">1</span>Choose your line</h2>
    <p className="mt-1 px-1 text-[15px] text-[#6B6457]">Tap the line your picture shows.</p>
    <EvidenceLines passages={lines} picked={quote||undefined} onPick={l=>{setQuote(l.text);setCheck(null)}} className="mt-3 max-h-[56vh] space-y-2 overflow-y-auto pr-1"/>
   </section>
   <section className="space-y-4">
    {addDetail&&frame.picture&&<img src={image??frame.picture} alt={frame.page.illustration?.alt??""} className="aspect-[3/2] w-full rounded-3xl object-cover shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"/>}
    <div className={`${card} p-4 md:p-5 ${quote?"":"opacity-60"}`}>
     <h2 className="text-[17px] font-bold"><span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#A0472C] text-[14px] text-white">2</span>Describe what you see</h2>
     <p className="mt-2 text-[16px] leading-6 text-[#2A2620]">{prompt}</p>
     <label htmlFor="frame-desc" className="mt-3 block text-[14px] font-semibold text-[#6B6457]">Describe it in 1 to 3 sentences</label>
     <textarea id="frame-desc" value={description} disabled={!quote} maxLength={600} onChange={e=>{setDescription(e.target.value);setCheck(null);setImage(null);setNoPicture("")}} rows={4} className="mt-1 w-full rounded-2xl border border-[#E4DCCB] bg-white p-3 text-[16px] leading-7 outline-none focus:border-[#A0472C]"/>
     <div className="mt-2 flex flex-wrap gap-2">{STARTERS.map(s=><button key={s} type="button" disabled={!quote} onClick={()=>{setDescription(v=>v?`${v} ${s}`:s);setCheck(null)}} className="rounded-full bg-[#EFE8D8] px-3 py-1.5 text-[14px] font-semibold text-[#2A2620] hover:bg-[#E4DCCB]">{s}</button>)}</div>
     {sentencesCount>3&&<p className="mt-2 text-[14px] text-[#8A3B23]">Try to keep it to 3 sentences.</p>}
    </div>
    <div className={`${card} p-4 md:p-5 ${ready?"":"opacity-60"}`} aria-live="polite">
     <h2 className="text-[17px] font-bold"><span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[#A0472C] text-[14px] text-white">3</span>Check it</h2>
     {!check&&<button type="button" onClick={runCheck} disabled={!ready||checking} className="case-primary mt-3 w-full disabled:opacity-40">{checking?"Checking…":"Check my frame"}</button>}
     {check&&<div className={`mt-3 rounded-2xl p-4 ${check.ok?"bg-[#EEF3E6]":"bg-[#FBF1EB]"}`}>
      <p className="text-[15px] font-semibold text-[#2A2620]">{check.ok?"The text supports your frame.":check.ok===false?"Almost. Take another look at the text.":"Your frame is ready to save."}</p>
      <ul className="mt-1 space-y-1 text-[15px] leading-6 text-[#4A4438]">{check.notes.map(n=><li key={n}>{n}</li>)}</ul>
      {check.ok===false&&<p className="mt-2 text-[14px] text-[#6B6457]">Change your description above, then check again.</p>}
     </div>}
     {image&&!addDetail&&<img src={image} alt={`Your picture: ${description}`} className="mt-4 aspect-[3/2] w-full rounded-2xl object-cover"/>}
     {noPicture&&<p className="mt-3 text-[15px] text-[#4A4438]">{noPicture}</p>}
     {frame.writingOnly&&check?.ok&&<p className="mt-3 text-[15px] text-[#4A4438]">{frame.page.no_generation_reason??"On this page you describe your picture in writing only. No image is created."}</p>}
     <div className="mt-4 flex flex-col gap-2">
      {image&&<button type="button" onClick={()=>save(true)} className="case-primary"><Check size={18}/> Save this frame</button>}
      {check?.ok&&!image&&!frame.writingOnly&&!noPicture&&tries<2&&<button type="button" onClick={createPicture} disabled={painting} className="case-primary disabled:opacity-60"><Sparkles size={18}/> {painting?"Painting your picture…":"Create my picture"}</button>}
      {ready&&<button type="button" onClick={()=>save(false)} className="case-secondary justify-center"><ImageIcon size={18}/> Save without a picture</button>}
     </div>
    </div>
   </section>
  </div>
 </div>;
}

// The storyboard as a row of small frames: on the case board (above the clue cards) and on the printout.
export function StoryboardRow({frames,print=false}:{frames:BoardFrame[];print?:boolean}){
 if(!frames.length)return null;
 return <ol className={print?"grid grid-cols-3 gap-3":"flex snap-x gap-4 overflow-x-auto pb-2"} aria-label="Your storyboard">{frames.map((f,i)=><li key={f.key} className={`${print?"break-inside-avoid":"w-56 shrink-0 snap-start"} overflow-hidden rounded-2xl bg-[#FFFDF8] shadow-[0_6px_18px_-10px_rgba(42,38,32,.5)] print:shadow-none print:ring-1 print:ring-[#E4DCCB]`}>
  {f.picture?<img src={f.picture} alt={f.mine?`Frame: ${f.description}`:f.alt} className="aspect-[3/2] w-full object-cover"/>:<div className="grid aspect-[3/2] w-full place-items-center bg-[#F6F0E3] p-3 text-center font-serif text-[13px] italic leading-5 text-[#4A4438]">“{f.description?.slice(0,120)}”</div>}
  <div className="p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A3B23]">Frame {i+1} · Scene {f.sceneIndex+1}{f.mine?"":" · From the story"}</p>
   {f.mine?<><p className={`mt-1 font-serif text-[13px] italic leading-5 text-[#4A4438] ${print?"":"line-clamp-4"}`}>“{f.quote}”</p><p className="mt-1 text-[13px] leading-5 text-[#2A2620]">{f.description}</p></>:<p className="mt-1 text-[13px] leading-5 text-[#4A4438]">{f.alt}</p>}</div>
 </li>)}</ol>;
}
