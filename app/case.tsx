"use client";
// The simplified student flow: land in the scene, open a clue, ask a character, prove it with a line from the story.
// Adults (teacher or parent) choose the story, grade and language; students never see those settings.
import {useEffect,useMemo,useRef,useState} from "react";
import {PlayCircle,ArrowLeft,ArrowRight,BookOpen,Check,ChevronDown,LayoutGrid,Lock,MessageCircle,Printer,Quote,Search,Square,Volume2} from "lucide-react";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {BilingualProvider,HomeText} from "./bilingual";
import {Ambient,FactCheckerBadge,RankChip,RankLadder,playStamp,recordFactCheck,recordScene,useProgress} from "./case-game";

import {CLASS_AI_OFF,evidenceLabel,isDone,useClueSteps,type Clue,type Scene} from "./clue-steps";
import {StorybookReader} from "./storybook/reader";
import {firstLockedPage,reconcileSaved} from "@/lib/storybook";
import {useLayoutEffect} from "react";
import {AmbientPlayer,CaseBoard,CaseBoardDialog,ConsequenceMoment,Portrait,SoundToggle,useCharacterVoice,useSoundPref} from "./game-feel";
import {choicesMade} from "@/lib/game-feel";
import {focusScreenTop} from "./screen-focus";
import {listenButton,narrationParts,playNarration,sceneReading} from "@/lib/narration";
import {browserNarration,soundChannel,useSoundChannel} from "./sound-player";
const STORYBOOK_ON=false;

function sentences(text:string){return (text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)??[text]).map(s=>s.trim()).filter(Boolean)}

export function CaseFlow(props:{demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onExit:()=>void;onAnotherStory:()=>void;onTutorial?:()=>void;onFeedback?:()=>void}){
 return <BilingualProvider worldId={props.demo.worldId} lang={props.demo.homeLanguage??null}><CaseInner {...props}/></BilingualProvider>;
}

function CaseInner({demo,setDemo,onExit,onAnotherStory,onTutorial,onFeedback}:{demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;onExit:()=>void;onAnotherStory:()=>void;onTutorial?:()=>void;onFeedback?:()=>void}){
 const [world,setWorld]=useState<WorldPack|null>(null),[passages,setPassages]=useState<SourcePassage[]>([]),[error,setError]=useState("");
 const [openClue,setOpenClue]=useState<string>(""),[toast,setToast]=useState(""),[celebrate,setCelebrate]=useState<{sceneId:string;rankUp:string|null}|null>(null),[justProven,setJustProven]=useState("");
 // Opening a clue, or going back to the scene, is a new screen: start at the top with focus on its heading.
 const shownClue=useRef(openClue);
 useLayoutEffect(()=>{if(shownClue.current===openClue)return;shownClue.current=openClue;focusScreenTop()},[openClue]);
 useEffect(()=>{setWorld(null);fetch(`/worlds/${demo.worldId}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>setError("We couldn't open this story. Refresh the page to try again."));fetch(`/worlds/${demo.worldId}/source.md`).then(r=>r.ok?r.text():"").then(t=>setPassages(parseSourcePassages(t))).catch(()=>setPassages([]))},[demo.worldId]);
 // Students play the scene game. The storybook reader stays in the code, switched off, until we decide to bring it back.
 // Storybooks: saved work from another version of the story is cleared before anything renders, and a case can only
 // show as closed when every clue is proven and every required frame is saved.
 useLayoutEffect(()=>{if(!STORYBOOK_ON||!world?.storybook)return;setDemo(d=>{const r=reconcileSaved(world,d);return r.submitted&&r.worldId===world.id&&firstLockedPage(world,id=>isDone(r,id),k=>!!r.storyFrames?.[k])>=0?{...r,submitted:false}:r})},[world,setDemo,demo.classProgressLoaded]);
 // Students skip role and level screens: the first role is used unless an adult chose one.
 useEffect(()=>{if(world&&!world.roles.some(r=>r.id===demo.role))setDemo(d=>({...d,role:world.roles[0].id,briefingComplete:true,think:true}))},[world,demo.role,setDemo]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),4200);return()=>clearTimeout(t)},[toast]);
 if(error)return <div className="case-ui mx-auto max-w-xl px-6 py-24 text-center"><p className="text-lg">{error}</p></div>;
 if(!world||!world.roles.some(r=>r.id===demo.role))return <div className="case-ui grid min-h-[60vh] place-items-center"><p className="text-[15px] text-[#6B6457]">Opening the story…</p></div>;
 const sceneIndex=Math.min(demo.scene,world.scenes.length-1),scene=world.scenes[sceneIndex],role=world.roles.find(r=>r.id===demo.role)!;
 const finished=demo.submitted;
 if(finished)return <CaseSummary world={world} demo={demo} onAnotherStory={onAnotherStory}/>;
 if(STORYBOOK_ON&&world.storybook)return <StorybookReader world={world} role={role} passages={passages} demo={demo} setDemo={setDemo} onExit={onExit} onFeedback={onFeedback}/>;
 const clue=scene.artifacts.find(a=>a.id===openClue);
 if(clue)return <ClueView world={world} scene={scene} clue={clue} roleId={role.id} demo={demo} setDemo={setDemo} passages={passages} onClose={(saved,info)=>{setOpenClue("");if(!saved)return;window.scrollTo({top:0});setJustProven(clue.id);
  const badge=info?.factCheck?recordFactCheck(`${world.id}:${clue.id}`):false;
  setToast(badge?"Badge earned: Fact Checker. You used the story to prove a character wrong.":"Clue proven and saved to your case file.");
  if(info?.solves){setCelebrate({sceneId:scene.id,rankUp:recordScene(`${world.id}:${scene.id}`)});playStamp()}}}/>;
 return <SceneView world={world} scene={scene} sceneIndex={sceneIndex} role={role} demo={demo} setDemo={setDemo} passages={passages} onOpenClue={id=>{setOpenClue(id);window.scrollTo({top:0})}} onExit={onExit} toast={toast} celebrating={celebrate?.sceneId===scene.id} rankUp={celebrate?.sceneId===scene.id?celebrate.rankUp:null} justProven={justProven} onTutorial={onTutorial}/>;
}

function SceneView({world,scene,sceneIndex,role,demo,setDemo,passages,onOpenClue,onExit,toast,celebrating,rankUp,justProven,onTutorial}:{world:WorldPack;scene:Scene;sceneIndex:number;role:WorldPack["roles"][number];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];onOpenClue:(id:string)=>void;onExit:()=>void;toast:string;celebrating:boolean;rankUp:string|null;justProven:string;onTutorial?:()=>void}){
 const [reading,setReading]=useState(false),[boardOpen,setBoardOpen]=useState(false),[moment,setMoment]=useState<{text:string;image:string}|null>(null);
 // Ambient sound: on for the demo, off for class sessions; the student can switch it either way.
 const [ambientOn,toggleAmbient]=useSoundPref("ambient",demo.preset);
 const done=scene.artifacts.filter(a=>isDone(demo,a.id)).length,total=scene.artifacts.length,allDone=done===total;
 const locked=(a:Clue)=>!!a.unlock_condition?.startsWith("artifact:")&&!isDone(demo,a.unlock_condition.slice(9));
 const next=scene.artifacts.find(a=>!isDone(demo,a.id)&&!locked(a));
 const last=sceneIndex===world.scenes.length-1;
 const readingText=sceneReading(passages,scene);
 // "Listen to the scene" reads the paragraphs in the reading panel, one at a time, highlighting each. It stops when the
 // student opens a clue, moves to another scene, leaves the case or switches language.
 const listening=listenButton(useSoundChannel(),scene.id);
 const paragraphRefs=useRef<(HTMLParagraphElement|null)[]>([]);
 useEffect(()=>()=>{if(soundChannel.state.kind==="narration")soundChannel.stop()},[scene.id,demo.homeLanguage]);
 useEffect(()=>{const el=paragraphRefs.current[listening.part];if(!el)return;const still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;el.scrollIntoView({block:"nearest",behavior:still?"auto":"smooth"})},[listening.part]);
 function goNext(){setDemo(d=>({...d,scene:d.scene+1,events:[...d.events,"scene_complete"]}));window.scrollTo({top:0})}
 function finish(){playStamp(250);setDemo(d=>({...d,submitted:true,events:[...d.events,"case_closed"]}));window.scrollTo({top:0})}
 function listen(){if(listening.playing){soundChannel.stop();return}setReading(true);playNarration(soundChannel,scene.id,narrationParts(world.id,scene,passages),browserNarration)}
 const nextImage=world.scenes[sceneIndex+1]?.background_image??scene.background_image;
 return <div className="case-ui mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8">
  <AmbientPlayer src={moment?null:scene.ambient_audio} on={ambientOn}/>
  {moment&&<ConsequenceMoment image={moment.image} text={moment.text} onContinue={()=>{setMoment(null);goNext()}}/>}
  {boardOpen&&<CaseBoardDialog world={world} answers={demo.artifactAnswers} onClose={()=>setBoardOpen(false)}/>}
  <div className="flex items-center justify-between gap-4">
   <button onClick={onExit} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Stories</button>{onTutorial&&<button onClick={onTutorial} className="mr-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><PlayCircle size={18}/> <span className="hidden sm:inline">How it works</span><span className="sm:hidden">Tutorial</span></button>}
   <div className="flex items-center gap-3 text-[15px] text-[#6B6457]"><span className="hidden sm:inline">{world.title}</span><span className="whitespace-nowrap rounded-full bg-[#EFE8D8] px-3 py-1 font-semibold text-[#2A2620]">Scene {sceneIndex+1} of {world.scenes.length}</span><RankChip/></div>
  </div>
  <div className="relative mt-4 overflow-hidden rounded-3xl shadow-[0_10px_40px_-12px_rgba(42,38,32,.35)]">
   <div className={`case-art aspect-[4/3] w-full sm:aspect-[3/2] md:aspect-[16/8] ${allDone?"case-alive":""}`} style={{backgroundImage:`url('${scene.background_image}')`}} role="img" aria-label={`Scene: ${scene.id.replaceAll("-"," ")}`}/>
   {allDone&&<Ambient worldId={world.id}/>}
   {scene.artifacts.map((a,i)=>{const lk=locked(a),dn=isDone(demo,a.id);return <button key={a.id} disabled={lk} onClick={()=>onOpenClue(a.id)} aria-label={`Clue ${i+1}: ${a.name}${dn?", done":lk?", locked":""}`} className={`absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[15px] font-bold shadow-lg ring-4 transition hover:scale-110 ${a.id===justProven?"case-pop ":""}${dn?"bg-[#FFFDF8] text-[#A0472C] ring-[#FFFDF8]/40":lk?"bg-[#2A2620]/70 text-white/70 ring-white/20":"case-pulse bg-[#A0472C] text-white ring-[#A0472C]/30"}`} style={{left:`${a.position.x+a.position.width/2}%`,top:`${a.position.y+a.position.height/2}%`}}>{dn?<Check size={18}/>:lk?<Lock size={15}/>:i+1}</button>})}
   {done===0&&next&&<div aria-hidden className="case-hint pointer-events-none absolute z-20" style={{left:`${Math.min(85,Math.max(15,next.position.x+next.position.width/2))}%`,top:`calc(${next.position.y+next.position.height/2}% + 30px)`}}><span className="block whitespace-nowrap rounded-full bg-[#FFFDF8] px-4 py-2 text-[15px] font-bold text-[#8A3B23] shadow-lg">Start here: tap the glowing clue</span></div>}
   {allDone&&<div aria-hidden className={`case-stamp pointer-events-none z-10 ${celebrating?"":"case-stamp-static"}`}>Scene solved</div>}
   <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 pt-16 md:p-8 md:pt-24">
    <p className="text-[13px] font-semibold uppercase tracking-wide text-[#F3C9B2]">You are the {role.name}</p>
    <h1 className="mt-1 max-w-3xl text-[20px] font-semibold leading-snug text-white outline-none md:text-[26px]">{role.goal}</h1>
    <HomeText text={role.goal} className="border-[#F3C9B2] text-[#F7E3D7]"/>
   </div>
  </div>
  <div role="status" aria-live="polite">{celebrating&&<p className="case-rise mt-4 rounded-2xl bg-[#A0472C] px-5 py-3 text-[16px] font-semibold text-white">Scene solved. Every clue is backed by the story.{rankUp?` New rank: ${rankUp}.`:""}</p>}
  {toast&&<p className="mt-4 rounded-2xl bg-[#2A2620] px-5 py-3 text-[15px] text-white"><Check size={16} className="mr-2 inline"/>{toast}</p>}</div>
  <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
   <section aria-labelledby="clues-h">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] md:p-6"><div><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">Your mission</p><p className="mt-1 text-[19px] font-bold leading-snug">{allDone?"Scene solved. Every clue is proven.":`Prove all ${total} clues to solve this scene.`}</p><p className="mt-1 text-[14px] text-[#6B6457]">Open a clue, ask a character, then tap the line in the story that proves it.</p></div><RankLadder/></div>
    <div className="flex items-end justify-between gap-4"><h2 id="clues-h" className="text-[21px] font-bold sm:text-[24px]">Examine the clues</h2><p className="whitespace-nowrap text-[15px] font-semibold text-[#2A2620]">{done} of {total} clues proven</p></div>
    <div className="mt-2 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Clues proven">{scene.artifacts.map(a=><span key={a.id} className={`h-2.5 flex-1 rounded-full transition-colors duration-500 ${isDone(demo,a.id)?"bg-[#A0472C]":"bg-[#E4DCCB]"}`}/>)}</div>
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">{scene.artifacts.map((a,i)=>{const lk=locked(a),dn=isDone(demo,a.id),isNext=next?.id===a.id;return <li key={a.id}><button disabled={lk} onClick={()=>onOpenClue(a.id)} className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${a.id===justProven?"case-pop ":""}${lk?"cursor-not-allowed bg-[#EFE8D8]/60 text-[#9A9182]":"bg-[#FFFDF8] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-10px_rgba(42,38,32,.35)]"} ${isNext?"ring-2 ring-[#A0472C]":""}`}>
     <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[16px] font-bold ${dn?"bg-[#F4E1D6] text-[#A0472C]":lk?"bg-[#E4DCCB] text-[#9A9182]":"bg-[#A0472C] text-white"}`}>{dn?<Check size={20}/>:lk?<Lock size={16}/>:i+1}</span>
     <span className="min-w-0 flex-1"><span className="block text-[17px] font-semibold leading-snug">{a.name}</span><HomeText text={a.name} className="text-[14px]"/><span className="mt-1 block text-[14px] text-[#6B6457]">{lk?"Opens after an earlier clue":dn?<span className={`case-mini-stamp ${a.id===justProven?"fresh":""}`}>Proven</span>:evidenceLabel[a.evidence_type]}</span></span>
     {!lk&&<ArrowRight size={18} className="shrink-0 text-[#A0472C]"/>}
    </button></li>})}</ul>
    {allDone&&<div className="mt-8 rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">
     {last?<><h3 className="text-[22px] font-bold">You proved every clue.</h3><p className="mt-2 text-[16px] text-[#4A4438]">Close the case to stamp your case file.</p><button onClick={finish} className="case-primary mt-5">Close the case <ArrowRight size={18}/></button></>
     :scene.choice_point?<><h3 className="text-[22px] font-bold">{scene.choice_point.prompt}</h3><HomeText text={scene.choice_point.prompt}/><div className="mt-5 grid gap-3 sm:grid-cols-2">{scene.choice_point.options.map(o=><button key={o.id} onClick={()=>{setDemo(d=>({...d,events:[...d.events,"delegation"],connection:o.consequence_narration,choices:{...(d.choices??{}),[scene.id]:o.id}}));setMoment({text:o.consequence_narration,image:nextImage})}} className="rounded-2xl bg-[#A0472C] px-5 py-4 text-left text-[17px] font-semibold text-white transition hover:bg-[#8A3B23]">{o.label}<HomeText text={o.label} className="border-white/60 text-[15px] font-normal text-white/90"/></button>)}</div></>
     :<button onClick={goNext} className="case-primary">Next scene <ArrowRight size={18}/></button>}
    </div>}
   </section>
   <aside className="space-y-3">
    <button onClick={()=>setBoardOpen(true)} className="case-secondary w-full"><LayoutGrid size={18}/> Case board</button>
    <div className="flex flex-wrap items-center gap-2"><button onClick={listen} className="case-secondary flex-1">{listening.playing?<Square size={16} fill="currentColor"/>:<Volume2 size={18}/>} {listening.label}</button>{scene.ambient_audio&&<SoundToggle on={ambientOn} onToggle={toggleAmbient} label="Sound"/>}</div>
    <button onClick={()=>setReading(v=>!v)} aria-expanded={reading} className="case-secondary w-full"><BookOpen size={18}/> {reading?"Hide":"Read"} this part of the story <ChevronDown size={16} className={`ml-auto transition ${reading?"rotate-180":""}`}/></button>
    {reading&&<div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-2xl bg-[#FFFDF8] p-5 font-serif text-[17px] leading-8 text-[#2A2620] shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]">{readingText.map((p,i)=><p key={p.id} ref={el=>{paragraphRefs.current[i]=el}} aria-current={listening.part===i||undefined} className={`-mx-2 rounded-lg px-2 transition-colors motion-reduce:transition-none ${listening.part===i?"bg-[#F3E2D6]":""}`}>{p.text}</p>)}{!readingText.length&&<p className="text-[#6B6457]">The story text is loading.</p>}</div>}
    {scene.summary&&<div className="rounded-2xl bg-[#EFE8D8] p-5"><p className="text-[13px] font-semibold uppercase tracking-wide text-[#8A3B23]">What happens here</p><p className="mt-2 text-[15px] leading-6 text-[#4A4438]">{scene.summary}</p><HomeText text={scene.summary} className="text-[15px]"/></div>}
   </aside>
  </div>
 </div>;
}

function ClueView({world,scene,clue,roleId,demo,setDemo,passages,onClose}:{world:WorldPack;scene:Scene;clue:Clue;roleId:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];onClose:(saved:boolean,info?:{solves:boolean;factCheck:boolean})=>void}){
 const {chars,character,setCharacter,char,step,setStep,question,setQuestion,reply,asked,busy,proof,setProof,stance,setStance,explain,setExplain,source,notice,interpret,suggestions,steps,stepNo,ask,save:saveSteps}=useClueSteps({world,scene,clue,roleId,demo,setDemo,passages});
 const boxRef=useRef<HTMLTextAreaElement>(null);const [peek,setPeek]=useState(false);
 // Character voices: on for the demo, off for class sessions. A new answer plays once; the speaker button replays it.
 const [voicesOn,toggleVoices]=useSoundPref("voices",demo.preset);
 const voice=useCharacterVoice(world.id,demo.id);
 const askedOf=useRef(character),voiced=useRef("");
 useEffect(()=>{if(busy)askedOf.current=character},[busy,character]);
 useEffect(()=>{if(!reply||busy||voiced.current===reply)return;voiced.current=reply;if(voicesOn)voice.play(reply,askedOf.current)},[reply,busy,voicesOn,voice]);
 useEffect(()=>{if(!voicesOn)voice.stop()},[voicesOn,voice]);
 const replier=world.characters.find(c=>c.id===askedOf.current)??char;
 function save(){const info=saveSteps();if(info)onClose(true,info)}
 return <div className="case-ui mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8">
  <div className="flex items-center justify-between gap-4">
   <button onClick={()=>onClose(false)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-[#6B6457] hover:bg-[#EFE8D8]"><ArrowLeft size={18}/> Back to the scene</button>
   <ol className="flex items-center gap-2" aria-label={`Step ${stepNo} of ${steps.length}`}>{steps.map((s,i)=><li key={s} className={`h-2 rounded-full transition-all ${i<stepNo?"w-8 bg-[#A0472C]":"w-4 bg-[#E4DCCB]"}`}/>)}</ol>
  </div>
  <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
   <section className="order-2 lg:order-1" aria-label="From the story">
    <div className="overflow-hidden rounded-3xl shadow-[0_10px_40px_-14px_rgba(42,38,32,.35)]"><div className="case-art aspect-[16/9]" style={{backgroundImage:`url('${scene.background_image}')`,backgroundPosition:`${clue.position.x+clue.position.width/2}% ${clue.position.y+clue.position.height/2}%`,backgroundSize:"220%"}} role="img" aria-label={`Close-up: ${clue.name}`}/></div>
    {step==="ask"&&<div className="mt-4 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)]"><p className="flex items-center gap-2 text-[15px] font-semibold text-[#2A2620]"><BookOpen size={17} className="text-[#A0472C]"/> The story holds the answer.</p><p className="mt-1 text-[15px] text-[#6B6457]">Ask first. Then you will search the story for proof.</p><button onClick={()=>setPeek(v=>!v)} className="mt-3 text-[15px] font-semibold text-[#8A3B23] underline underline-offset-4">{peek?"Hide the story":"Peek at the story"}</button>{peek&&<div className="mt-3 max-h-[40vh] space-y-3 overflow-y-auto font-serif text-[16px] leading-7">{source.map(p=><p key={p.id}>{p.text}</p>)}</div>}</div>}
    {step==="prove"&&<div className="mt-4 rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] md:p-5">
     <p className="flex items-center gap-2 px-1 text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]"><Search size={15}/> Evidence lines · tap the one that proves it</p>
     <ol className="mt-3 max-h-[62vh] space-y-2 overflow-y-auto pr-1">{source.flatMap(p=>sentences(p.text).map((t,i)=>({t,pid:p.id,k:p.id+"-"+i}))).map((line,n)=>{const picked=proof?.text===line.t;return <li key={line.k}><button onClick={()=>setProof({text:line.t,pid:line.pid})} aria-pressed={picked} className={`flex w-full gap-3 rounded-2xl border px-3 py-2.5 text-left font-serif text-[16px] leading-7 transition ${picked?"border-[#A0472C] bg-[#A0472C] text-white shadow-md":"border-[#E4DCCB] bg-white hover:border-[#A0472C] hover:bg-[#FBF1EB]"}`}><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-sans text-[12px] font-bold ${picked?"bg-white text-[#A0472C]":"bg-[#EFE8D8] text-[#6B6457]"}`}>{picked?<Check size={14}/>:n+1}</span><span>{line.t}</span></button></li>})}</ol>
     {!source.length&&<p className="font-sans text-[15px] text-[#6B6457]">Loading the story…</p>}
    </div>}
   </section>
   <section className="order-1 lg:order-2" aria-live="polite">
    <div className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] md:p-7">
     <p className="text-[14px] font-semibold text-[#8A3B23]">Clue {scene.artifacts.findIndex(a=>a.id===clue.id)+1} of {scene.artifacts.length} · {evidenceLabel[clue.evidence_type]}</p>
     <h1 className="mt-1 text-[28px] font-bold leading-tight">{clue.name}</h1><HomeText text={clue.name}/>
     {step==="ask"&&char&&<div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-[20px] font-bold">{chars.length===1&&<Portrait character={char} size={44}/>}Ask {chars.length>1?"a character":char.name}</h2><SoundToggle on={voicesOn} onToggle={toggleVoices} label="Voices"/></div>
      <p className="mt-1 text-[15px] text-[#6B6457]">Characters can be wrong. You'll check the answer against the story next.</p>
      {chars.length>1&&<div className="mt-4 flex flex-wrap gap-2">{chars.map(c=><button key={c.id} onClick={()=>setCharacter(c.id)} aria-pressed={character===c.id} className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[15px] font-semibold ${character===c.id?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620]"}`}><Portrait character={c} size={36}/>{c.name}</button>)}</div>}
      {!reply&&!busy&&<div className="mt-4 flex flex-col gap-2">{suggestions.map(s=><button key={s} onClick={()=>ask(s)} className="rounded-2xl bg-[#F4E1D6] px-4 py-3 text-left text-[16px] text-[#2A2620] transition hover:bg-[#EDD3C4]"><MessageCircle size={16} className="mr-2 inline text-[#A0472C]"/>{s}</button>)}</div>}
      {(asked||busy)&&<div className="mt-5 space-y-3"><p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#2A2620] px-4 py-3 text-[16px] text-white">{asked}</p><div className="flex max-w-[94%] items-end gap-3">{replier&&<Portrait character={replier} size={48} speaking={!!voice.speaking&&voice.speaking===replier.id}/>}<div className="min-w-0 flex-1 rounded-2xl rounded-bl-md bg-[#EFE8D8] px-4 py-3 text-[16px] leading-7"><div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold text-[#8A3B23]">{replier?.name??char.name}</p>{!busy&&reply&&replier&&<button type="button" onClick={()=>voice.play(reply,replier.id)} aria-label={`Hear ${replier.name} say it again`} title="Hear it again" className="grid h-9 w-9 place-items-center rounded-full text-[#8A3B23] hover:bg-[#E4DCCB]"><Volume2 size={17}/></button>}</div>{busy?<p className="text-[#6B6457]">Thinking…</p>:<p>{reply}</p>}</div></div></div>}
      <form onSubmit={e=>{e.preventDefault();ask(question)}} className="mt-4 flex gap-2"><label className="sr-only" htmlFor="ask-box">Your question</label><input id="ask-box" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={300} placeholder={reply?"Ask a follow-up…":"Or type your own question…"} className="min-w-0 flex-1 rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#A0472C]"/><button disabled={busy||!question.trim()} className="rounded-2xl bg-[#2A2620] px-4 text-[15px] font-semibold text-white disabled:opacity-40">Ask</button></form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button onClick={()=>setStep("prove")} className="text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Skip, I'll look myself</button>{reply&&<button onClick={()=>setStep("prove")} className="case-primary">Check it in the story <ArrowRight size={18}/></button>}</div>
     </div>}
     {step==="ask"&&!char&&<p className="mt-4">{CLASS_AI_OFF}</p>}
     {step==="prove"&&<div className="mt-6">
      <h2 className="text-[20px] font-bold">{asked?`Prove it or disprove it`:`Find your proof`}</h2>
      <p className="mt-1 text-[16px] leading-7 text-[#4A4438]">{asked?`Tap the line in the story that shows whether ${char?.name??"the character"} was right.`:notice}</p>
      {!asked&&<HomeText text={notice}/>}
      {proof?<blockquote className="mt-4 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[17px] leading-7"><Quote size={16} className="mb-1 text-[#A0472C]"/>{proof.text}</blockquote>:<p className="mt-4 flex items-center gap-2 rounded-2xl bg-[#EFE8D8] px-4 py-3 text-[15px] text-[#6B6457]"><Search size={16}/> <span className="lg:hidden">Scroll down and tap a line in the story.</span><span className="hidden lg:inline">Tap a line in the story on the left.</span></p>}
      {asked&&proof&&<div className="mt-4"><p className="text-[15px] font-semibold">This line…</p><div className="mt-2 grid grid-cols-2 gap-2">{[["supports","Backs them up"],["contradicts","Proves them wrong"]].map(([v,l])=><button key={v} onClick={()=>setStance(v)} className={`rounded-2xl px-4 py-3 text-[16px] font-semibold transition ${stance===v?"bg-[#2A2620] text-white":"bg-[#EFE8D8] text-[#2A2620] hover:bg-[#E4DCCB]"}`}>{l}</button>)}</div><p className="mt-2 text-[14px] text-[#6B6457]">Catching a character who got it wrong earns the Fact Checker badge.</p></div>}
      <div className="mt-6 flex justify-end"><button disabled={!proof||(!!asked&&!stance)} onClick={()=>{setStep("explain");setTimeout(()=>boxRef.current?.focus(),50)}} className="case-primary disabled:opacity-40">Use this line <ArrowRight size={18}/></button></div>
     </div>}
     {step==="explain"&&<div className="mt-6">
      <h2 className="text-[20px] font-bold">What does it show?</h2>
      <p className="mt-1 text-[16px] leading-7 text-[#4A4438]">{interpret}</p><HomeText text={interpret}/>
      {proof&&<blockquote className="mt-4 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-4 py-3 font-serif text-[16px] leading-7">{proof.text}</blockquote>}
      <div className="mt-4 flex flex-wrap gap-2">{["This line shows…","I think this means… because…","This proves… was wrong because…"].map(s=><button key={s} onClick={()=>{setExplain(v=>v?v+" "+s:s);boxRef.current?.focus()}} className="rounded-full bg-[#EFE8D8] px-3 py-1.5 text-[14px] text-[#2A2620] hover:bg-[#E4DCCB]">{s}</button>)}</div>
      <label htmlFor="explain-box" className="sr-only">Your answer</label>
      <textarea id="explain-box" ref={boxRef} value={explain} onChange={e=>setExplain(e.target.value)} rows={4} maxLength={1200} placeholder="Write it in your own words…" className="mt-3 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[17px] leading-7 outline-none focus:border-[#A0472C]"/>
      <div className="mt-5 flex items-center justify-between gap-3"><button onClick={()=>setStep("prove")} className="text-[15px] text-[#6B6457] underline-offset-4 hover:underline">Change my line</button><button disabled={!explain.trim()||!proof} onClick={save} className="case-primary disabled:opacity-40"><Check size={18}/> Save this clue</button></div>
     </div>}
    </div>
   </section>
  </div>
 </div>;
}

export function CaseSummary({world,demo,onAnotherStory}:{world:WorldPack;demo:Demo;onAnotherStory:()=>void}){
 const role=world.roles.find(r=>r.id===demo.role);
 const items=world.scenes.flatMap(s=>s.artifacts).filter(a=>isDone(demo,a.id));
 const caught=items.filter(a=>demo.artifactAnswers[a.id]?.craft==="contradicts").length;
 const progress=useProgress();
 const chosen=choicesMade(world,demo.choices);
 const date=new Date().toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
 return <div className="case-ui mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">
  <div className="relative overflow-hidden rounded-3xl bg-[#FFFDF8] shadow-[0_10px_40px_-14px_rgba(42,38,32,.35)] print:shadow-none">
   <div className="flex items-center justify-between gap-4 bg-[#2A2620] px-6 py-3 text-[13px] font-semibold uppercase tracking-[.14em] text-[#F3C9B2] print:bg-white print:text-black"><span>Case file · {world.title}</span><span className="hidden sm:inline">{date}</span></div>
   <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
    <div>
     <h1 className="text-[34px] font-bold leading-tight">Here's what you proved.</h1>
     <p className="mt-2 text-[17px] text-[#4A4438]">{role?`As the ${role.name}, you`:"You"} proved {items.length} clue{items.length===1?"":"s"}, each one backed by a line from the story.</p>
     <div className="mt-4 flex flex-wrap items-center gap-2"><RankChip/>{caught>0&&<FactCheckerBadge count={caught}/>}<span className="text-[14px] text-[#6B6457]">{progress.scenes.length} scene{progress.scenes.length===1?"":"s"} solved so far</span></div>
    </div>
    <div aria-hidden className="case-stamp case-stamp-page justify-self-center">Case closed</div>
   </div>
  </div>
  {chosen.length>0&&<ul className="mt-6 space-y-2 rounded-3xl bg-[#FFFDF8] p-5 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] print:shadow-none">{chosen.map(c=><li key={c.sceneId} className="text-[16px] text-[#2A2620]"><span className="font-semibold">You chose:</span> {c.label}</li>)}</ul>}
  {/* On screen: the case board. On paper: the clean list below, so it fits the page. */}
  <div className="mt-6 print:hidden"><h2 className="mb-3 text-[22px] font-bold">Your case board</h2><CaseBoard world={world} answers={demo.artifactAnswers}/></div>
  <ol className="mt-6 hidden space-y-4 print:block">{items.map((a,i)=>{const x=demo.artifactAnswers[a.id];return <li key={a.id} className="rounded-3xl bg-[#FFFDF8] p-6 shadow-[0_2px_10px_-4px_rgba(42,38,32,.25)] print:break-inside-avoid print:shadow-none">
   <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[14px] font-semibold text-[#8A3B23]">Exhibit {i+1}</p>{x.craft==="contradicts"&&<FactCheckerBadge count={1}/>}</div>
   <h2 className="text-[20px] font-bold">{a.name}</h2>
   <p className="mt-3 text-[17px] leading-7">{x.interpret}</p>
   <blockquote className="mt-3 border-l-4 border-[#A0472C] pl-4 font-serif text-[16px] italic leading-7 text-[#4A4438]">"{x.notice}"</blockquote>
   {x.craft&&<p className="mt-2 text-[14px] text-[#6B6457]">{x.craft==="supports"?"This line backed up what the character said.":"This line proved the character wrong."}</p>}
  </li>})}</ol>
  <div className="mt-8 flex flex-wrap gap-3 print:hidden"><button onClick={()=>window.print()} className="case-primary"><Printer size={18}/> Print or save as PDF</button><button onClick={onAnotherStory} className="case-secondary">Start another story</button></div>
 </div>;
}
