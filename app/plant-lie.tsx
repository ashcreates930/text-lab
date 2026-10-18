"use client";
// Plant a Lie (class students, after proving a clue): pick who says it, write one false sentence in their voice, and
// tap the line from the story that proves it false. Checked here with the same rules the server uses
// (lib/planted-lies.ts), then sent to the teacher. Approved lies go into the class's Lie bank for live rounds.
import {useMemo,useState} from "react";
import {ArrowLeft,Send,ShieldCheck} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import {contentNotes} from "@/lib/content-notes";
import {plantedLieProblems} from "@/lib/planted-lies";
import {EvidenceLines} from "./evidence-lines";
import {Portrait} from "./game-feel";
import type {Clue,Scene} from "./clue-steps";

export function PlantLieView({world,scene,clue,passages,token,onClose}:{world:WorldPack;scene:Scene;clue:Clue;passages:SourcePassage[];token:string;onClose:()=>void}){
 const speakers=world.characters.filter(c=>scene.available_characters.includes(c.id));
 const [characterId,setCharacterId]=useState(speakers[0]?.id??""),[sentence,setSentence]=useState(""),[line,setLine]=useState<{text:string;pid:string}|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false);
 const notes=useMemo(()=>contentNotes(world),[world]);
 // Lines in a paragraph with a content note can't be the answer, so they aren't offered.
 const source=useMemo(()=>passages.filter(p=>clue.source_anchor.includes(p.id)&&!notes.has(p.id)),[passages,clue.source_anchor,notes]);
 const speaker=speakers.find(c=>c.id===characterId);
 const input={sceneId:scene.id,clueId:clue.id,characterId,sentence,truthParagraph:line?.pid??"",truthLine:line?.text??""};
 const problems=sentence.trim()&&line?plantedLieProblems(world,passages,input):[];
 const ready=!!sentence.trim()&&!!line&&!problems.length;
 async function send(){
  setBusy(true);setError("");
  try{const r=await fetch("/api/student/planted-lies",{method:"POST",headers:{"Content-Type":"application/json","x-class-token":token},body:JSON.stringify(input)});const j=await r.json().catch(()=>({}));
   if(r.ok)setSent(true);else setError(String(j.error??"Could not send it. Try again."))}
  catch{setError("Can't reach the server. Try again.")}
  setBusy(false);
 }
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-8">
  <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Back to the scene</button>
  <p className="mt-4 text-[14px] font-semibold text-[#8A3B23]">{clue.name}</p>
  <h1 className="mt-1 text-[28px] font-bold leading-tight">Plant a lie</h1>
  {sent?<div className="mt-5 rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]" role="status">
   <p className="flex items-center gap-2 text-[19px] font-bold"><ShieldCheck size={20} className="text-[#A0472C]"/> Sent to your teacher.</p>
   <p className="mt-2 text-[16px] leading-7">If your teacher approves it, it goes into your class's Lie bank. Your squad earns points when a classmate catches it with the right line and a good explanation.</p>
   <button type="button" onClick={onClose} className="case-primary mt-5">Back to the scene</button>
  </div>:<>
  <p className="mt-2 text-[16px] leading-7 text-[#4A4438]">Write one false sentence a character might say about this clue. Then tap the line from the story that proves it false. A good lie is catchable: one line disproves it.</p>
  {speakers.length>1&&<fieldset className="mt-5"><legend className="text-[15px] font-semibold">Who says it?</legend>
   <div className="mt-2 flex flex-wrap gap-2">{speakers.map(c=><button key={c.id} type="button" onClick={()=>setCharacterId(c.id)} aria-pressed={characterId===c.id} className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[15px] font-semibold ${characterId===c.id?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620]"}`}><Portrait character={c} size={32}/>{c.name}</button>)}</div></fieldset>}
  {!speakers.length&&<p className="mt-5 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">No one speaks in this scene, so there's no one to plant a lie on. Try a clue in another scene.</p>}
  {speaker&&<><label htmlFor="lie-sentence" className="mt-5 block text-[15px] font-semibold">{speaker.name} says…</label>
  <textarea id="lie-sentence" value={sentence} onChange={e=>setSentence(e.target.value)} maxLength={220} rows={2} placeholder={`One false sentence, in ${speaker.name}'s voice`} className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-[#FFFDF8] px-4 py-3 text-[17px] leading-7 focus:border-[#A0472C] focus:outline-none"/>
  <p className="mt-1 text-right text-[13px] text-[#8B8478]">{sentence.length}/220</p>
  <p className="mt-4 text-[15px] font-semibold">Tap the line that proves it false</p>
  <div className="mt-2 rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><EvidenceLines passages={source} picked={line?.text} onPick={setLine} className="max-h-[48vh] space-y-2 overflow-y-auto pr-1"/>{!source.length&&<p className="text-[15px] text-[#6B6457]">Loading the story…</p>}</div>
  <div aria-live="polite">{problems.length>0&&<p className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{problems[0]}</p>}
  {error&&<p role="alert" className="mt-3 rounded-2xl bg-[#FBF1EB] px-4 py-3 text-[16px]">{error}</p>}</div>
  <div className="mt-5 flex justify-end"><button type="button" disabled={!ready||busy} onClick={send} className="case-primary disabled:opacity-40"><Send size={18}/>{busy?"Sending…":"Send to my teacher"}</button></div></>}
  </>}
 </div>;
}
