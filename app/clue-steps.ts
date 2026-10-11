"use client";
// The ask → prove → explain steps for one clue, shared by the case screen (case.tsx) and the storybook question card.
// Saving writes the same answer shape either way, so the case file, analysis report, and usage caps see one flow.
import {useMemo,useState} from "react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";

export type Scene=WorldPack["scenes"][number];
export type Clue=Scene["artifacts"][number];
export type Step="ask"|"prove"|"explain";
export const CLASS_AI_OFF="Character questions are turned off for class sessions. Look closely at the story instead.";
export const evidenceLabel:Record<string,string>={observed:"Seen firsthand",reported:"Someone else's report",claimed:"A character's claim"};

export function plain(q:Clue["questions"][number]|undefined,role:string){if(!q)return "";return q.prompt_by_role_plain?.[role]??q.prompt_by_role[role]??Object.values(q.prompt_by_role)[0]??""}
export function isDone(demo:Demo,id:string){const a=demo.artifactAnswers[id];return !!(a?.notice?.trim()&&a?.interpret?.trim())}

// reading: set by the storybook reader. Only characters the student has met can be asked, and replies use only the
// paragraphs the student has reached.
export function useClueSteps({world,scene,clue,roleId,demo,setDemo,passages,reading}:{world:WorldPack;scene:Scene;clue:Clue;roleId:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];reading?:{throughParagraph:string;characters:string[]}}){
 const classSession=demo.preset==="class_student";
 const prior=demo.artifactAnswers[clue.id];
 const chars=world.characters.filter(c=>scene.available_characters.includes(c.id)&&(!reading||reading.characters.includes(c.id)));
 const [character,setCharacter]=useState(chars[0]?.id??"");
 const [step,setStep]=useState<Step>(classSession||!chars.length?"prove":"ask");
 const [question,setQuestion]=useState(""),[reply,setReply]=useState(""),[asked,setAsked]=useState(""),[busy,setBusy]=useState(false);
 const [proof,setProof]=useState<{text:string;pid:string}|null>(prior?.notice?{text:prior.notice,pid:demo.savedTextEvidence.find(e=>e.artifactId===clue.id)?.paragraphId??""}:null);
 const [stance,setStance]=useState<string>(prior?.craft??"");
 const [explain,setExplain]=useState(prior?.interpret??"");
 const char=world.characters.find(c=>c.id===character);
 const source=useMemo(()=>passages.filter(p=>clue.source_anchor.includes(p.id)),[passages,clue.source_anchor]);
 const notice=plain(clue.questions.find(q=>q.id==="notice"),roleId),interpret=plain(clue.questions.find(q=>q.id==="interpret"),roleId);
 const suggestions=[`What do you know about ${clue.name.charAt(0).toLowerCase()+clue.name.slice(1)}?`,"What do you think really happened here?"];
 const steps:Step[]=classSession||!chars.length?["prove","explain"]:["ask","prove","explain"];
 const stepNo=steps.indexOf(step)+1;
 async function ask(q:string){const text=q.trim();if(!text||busy)return;setBusy(true);setAsked(text);setQuestion("");setReply("");try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sandboxId:demo.id,question:text,scene:scene.id,character,worldId:world.id,...(reading?{throughParagraph:reading.throughParagraph}:{})})});const j=await r.json();const a=r.status===429?j.error:(j.text||"I can't find that in the passages I have.");setReply(a);setDemo(d=>({...d,messages:[...d.messages,{q:text,a}],events:[...d.events,"description"],flags:j.safety?.action==="support"?[...d.flags,"Flag"]:d.flags}))}catch{setReply("I can't answer that right now. Look closely at the story instead.")}finally{setBusy(false)}}
 // Returns what the save achieved, or null when the answer is not complete yet.
 function save():{solves:boolean;factCheck:boolean}|null{if(!proof||!explain.trim())return null;const now=new Date().toISOString();const solves=!isDone(demo,clue.id)&&scene.artifacts.every(a=>a.id===clue.id||isDone(demo,a.id)),factCheck=!!asked&&stance==="contradicts";setDemo(d=>({...d,
  artifactAnswers:{...d.artifactAnswers,[clue.id]:{notice:proof.text,interpret:explain.trim(),craft:stance,technique:"",revisions:[...(d.artifactAnswers[clue.id]?.revisions??[])],history:[...(d.artifactAnswers[clue.id]?.history??[]),{stage:"notice",text:proof.text,submitted_at:now},{stage:"interpret",text:explain.trim(),submitted_at:now}]}},
  savedTextEvidence:[...d.savedTextEvidence.filter(e=>e.artifactId!==clue.id),{id:crypto.randomUUID(),paragraphId:proof.pid,text:proof.text,artifactId:clue.id}],
  openedArtifacts:[...new Set([...d.openedArtifacts,clue.id])],evidence:d.evidence+1,events:[...d.events,"trace","diligence",...(asked?["discernment"]:[])]}));return {solves,factCheck}}
 return {classSession,chars,character,setCharacter,char,step,setStep,question,setQuestion,reply,asked,busy,proof,setProof,stance,setStance,explain,setExplain,source,notice,interpret,suggestions,steps,stepNo,ask,save};
}
