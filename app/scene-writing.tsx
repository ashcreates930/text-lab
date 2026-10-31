"use client";
// The scene's one writing task: the Notice, Interpret and Craft questions of one clue (the scene's writing_clue, or its
// first), after the clues are proven. Saved by scene; the teacher sees it with the student's work.
import {useState} from "react";
import {ArrowLeft,Check} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {Demo} from "./page";
import {plain,type Scene} from "./clue-steps";

const TECHNIQUES=["description","dialogue","pacing","suspense","point of view"];
export function writingClue(scene:Scene){return scene.artifacts.find(a=>a.id===scene.writing_clue)??scene.artifacts[0]}

export function SceneWriting({world,scene,sceneIndex,roleId,demo,setDemo,onClose}:{world:WorldPack;scene:Scene;sceneIndex:number;roleId:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onClose:(saved:boolean)=>void}){
 const clue=writingClue(scene),prior=demo.sceneWriting?.[scene.id];
 const q=(id:"notice"|"interpret"|"craft")=>clue?.questions.find(x=>x.id===id);
 const [notice,setNotice]=useState(prior?.notice??""),[interpret,setInterpret]=useState(prior?.interpret??""),[craft,setCraft]=useState(prior?.craft??""),[technique,setTechnique]=useState(prior?.technique??"");
 const options=q("craft")?.technique_options?.length?q("craft")!.technique_options!:TECHNIQUES;
 const ready=!!notice.trim()&&!!interpret.trim()&&!!craft.trim();
 function save(){if(!ready)return;setDemo(d=>({...d,sceneWriting:{...(d.sceneWriting??{}),[scene.id]:{notice:notice.trim(),interpret:interpret.trim(),craft:craft.trim(),...(technique?{technique}:{}),saved_at:new Date().toISOString()}}}));onClose(true)}
 if(!clue)return null;
 const box="mt-2 w-full rounded-2xl border border-edge bg-panel px-4 py-3 text-[17px] leading-7";
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-8">
  <button type="button" onClick={()=>onClose(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[15px] text-muted hover:bg-panel-2"><ArrowLeft size={18}/>Back to the scene</button>
  <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-highlight">{world.title} · Scene {sceneIndex+1} · {clue.name}</p>
  <h1 className="mt-1 text-[30px] font-bold leading-tight outline-none">Write about this scene</h1>
  <p className="mt-2 text-[17px] text-muted">Three short answers. Use what you proved in this scene's clues.</p>
  <form onSubmit={e=>{e.preventDefault();save()}} className="mt-5 space-y-5">
   <div><label htmlFor="sw-notice" className="text-[18px] font-bold">Notice</label><p className="text-[16px] leading-6 text-muted">{plain(q("notice"),roleId)}</p><textarea id="sw-notice" value={notice} onChange={e=>setNotice(e.target.value)} rows={3} maxLength={3000} className={box}/></div>
   <div><label htmlFor="sw-interpret" className="text-[18px] font-bold">Interpret</label><p className="text-[16px] leading-6 text-muted">{plain(q("interpret"),roleId)}</p><textarea id="sw-interpret" value={interpret} onChange={e=>setInterpret(e.target.value)} rows={3} maxLength={3000} className={box}/></div>
   <div><label htmlFor="sw-craft" className="text-[18px] font-bold">Craft</label><p className="text-[16px] leading-6 text-muted">{plain(q("craft"),roleId)}</p>
    <fieldset className="mt-2"><legend className="text-[15px] font-semibold">Your technique</legend><div className="mt-1 flex flex-wrap gap-2">{options.map(t=><label key={t} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-[15px] ${technique===t?"bg-deep text-ink":"bg-panel-2"}`}><input type="radio" name="sw-tech" value={t} checked={technique===t} onChange={()=>setTechnique(t)} className="sr-only"/>{t}</label>)}</div></fieldset>
    <textarea id="sw-craft" value={craft} onChange={e=>setCraft(e.target.value)} rows={3} maxLength={3000} className={box}/></div>
   <button type="submit" disabled={!ready} className="case-primary w-full disabled:opacity-40 sm:w-auto"><Check size={18}/>Save my writing</button>
  </form>
 </div>;
}
