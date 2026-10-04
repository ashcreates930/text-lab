"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookmarkPlus, BookOpen, Check, LockKeyhole } from "lucide-react";
import type { WorldPack } from "@/lib/world-schema";
import { describePortion, parseSourcePassages, readingPortions, type SourcePassage } from "@/lib/source-passages";
import type { Demo } from "./page";
import {GlossaryText} from "./glossary-word";
import {HomeText,HomeUi} from "./bilingual";

type Props = { world: WorldPack; scene: WorldPack["scenes"][number]; demo: Demo; setDemo: React.Dispatch<React.SetStateAction<Demo>>; onGlossary: (term: string) => void; grade?:number };

export function PassagePanel({ world, scene, demo, setDemo, onGlossary, grade=10 }: Props) {
  const [source, setSource] = useState("");
  const [selection, setSelection] = useState("");
  const [selectedParagraph, setSelectedParagraph] = useState("");
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    fetch(`/worlds/${world.id}/source.md`).then((response) => response.ok ? response.text() : "").then(setSource).catch(() => setSource(""));
    setExpanded(window.matchMedia("(min-width: 768px)").matches);
  }, [world.id]);
  const allPassages = useMemo(() => parseSourcePassages(source), [source]);
  const active = world.scenes.flatMap((item) => item.artifacts).find((artifact) => artifact.id === demo.activeArtifact);
  function wordOpened(term:string){onGlossary(term);setDemo(d=>({...d,glossaryOpens:(d.glossaryOpens??0)+1,events:[...new Set([...d.events,"glossary_open"])]}))}
  function saveWord(term:string){setDemo(d=>({...d,myWords:d.myWords.includes(term)?d.myWords:[...d.myWords,term]}))}
  const shown = useMemo(() => {
    const ids = new Set([...scene.passage_anchors, ...(active?.source_anchor ?? [])]);
    return allPassages.filter((passage) => ids.has(passage.id));
  }, [active?.id, allPassages, scene.passage_anchors]);

  useEffect(() => {
    if (!active) return;
    setExpanded(true);
    const first = active.source_anchor.find((id) => document.getElementById(`passage-${id}`));
    if (first) requestAnimationFrame(() => document.getElementById(`passage-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }, [active?.id]);

  function saveSelection() {
    const text = selection.trim();
    if (!text || !selectedParagraph) return;
    setDemo((current) => current.savedTextEvidence.some((item) => item.text === text && item.paragraphId === selectedParagraph) ? current : {
      ...current,
      savedTextEvidence: [...current.savedTextEvidence, { id: crypto.randomUUID(), paragraphId: selectedParagraph, text, ...(active ? { artifactId: active.id } : {}) }],
      evidence: current.evidence + 1,
    });
    setSelection("");
  }

  return <section className="mx-5 mt-4 border border-white/15 bg-[#FFFDF8]/95 md:mx-12" aria-label="From the text">
    <details open={expanded} onToggle={(event) => setExpanded((event.currentTarget as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3"><span className="eyebrow"><BookOpen size={12} className="mr-2 inline"/>FROM THE TEXT</span><span className="text-[10px] text-white/40 md:hidden">{expanded ? "CLOSE" : "OPEN"}</span></summary>
      <div className="border-t border-white/10 px-4 py-4">
        <div onMouseUp={() => { const text = window.getSelection()?.toString().trim() || ""; const parent = window.getSelection()?.anchorNode?.parentElement?.closest("[data-passage-id]"); setSelection(text); setSelectedParagraph(parent?.getAttribute("data-passage-id") || ""); }} className="space-y-4">
          {shown.map((passage) => <p id={`passage-${passage.id}`} key={passage.id} data-passage-id={passage.id} className={`relative pl-12 text-sm leading-7 text-white/75 transition-colors ${active?.source_anchor.includes(passage.id) ? "rounded-sm bg-[#A0472C]/[.08] text-white" : ""}`}><span className="absolute left-0 top-1 font-mono text-[10px] text-[#A0472C]/70">¶ {passage.id.slice(1)}</span><GlossaryText text={passage.text} glossary={world.glossary} grade={grade} onOpen={()=>wordOpened("")} onSave={saveWord}/></p>)}
          {!shown.length && <p className="text-xs text-white/45">Source passages are unavailable for this scene.</p>}
        </div>
        {selection && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="max-w-xl text-xs text-white/55">Selected from ¶ {selectedParagraph.slice(1)}: “{selection.slice(0, 160)}{selection.length > 160 ? "…" : ""}”</span><button type="button" onClick={saveSelection} className="gold-button flex items-center gap-2 px-3 py-2 text-[10px]"><BookmarkPlus size={13}/> SAVE TO CASE FILE · TEXT EVIDENCE</button></div>}
        {!!demo.savedTextEvidence.length && <div className="mt-4 border-t border-white/10 pt-3"><p className="eyebrow">SAVED TEXT EVIDENCE</p><div className="mt-2 grid gap-2">{demo.savedTextEvidence.map((quote) => <div key={quote.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", `“${quote.text}” (¶ ${quote.paragraphId.slice(1)})`); event.dataTransfer.setData("application/x-itt-source", "inserted"); }} className="border border-white/10 p-2 text-xs text-white/60"><Check size={11} className="mr-1 inline text-[#A0472C]"/>“{quote.text}” <span className="text-[#A0472C]">¶ {quote.paragraphId.slice(1)} · TEXT EVIDENCE</span></div>)}</div></div>}
        <ReadingPortions world={world} scene={scene} demo={demo} setDemo={setDemo} passages={allPassages} grade={grade} onWord={()=>wordOpened("")} onSave={saveWord}/>
      </div>
    </details>
  </section>;
}


// The story in reading order, revealed one portion at a time. A new portion opens each time the student finishes
// the analysis questions (NOTICE, INTERPRET, CRAFT) on every clue in the current scene.
function ReadingPortions({world,scene,demo,setDemo,passages,grade,onWord,onSave}:{world:WorldPack;scene:WorldPack["scenes"][number];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];grade:number;onWord:()=>void;onSave:(term:string)=>void}){
  const portions=useMemo(()=>readingPortions(passages,world.scenes),[passages,world.scenes]);
  if(!portions.length)return null;
  const unlocks=demo.portionUnlocks??[];
  // Reaching a scene always opens that scene's portion; finishing a scene's clues opens the next one early.
  const sceneIndex=Math.max(0,world.scenes.findIndex(s=>s.id===scene.id));
  const unlocked=Math.min(portions.length,Math.max(1+unlocks.length,sceneIndex+1+(unlocks.includes(scene.id)?1:0)));
  const note=world.scenes[unlocked-1]?.reading_note;
  const isDone=(id:string)=>{const x=demo.artifactAnswers[id];return !!(x?.notice.trim()&&x?.interpret.trim()&&x?.craft.trim()&&x?.technique)};
  const finished=scene.artifacts.filter(a=>isDone(a.id)).length,total=scene.artifacts.length;
  const sceneDone=finished===total;
  const usedThisScene=unlocks.includes(scene.id);
  const canOpen=sceneDone&&!usedThisScene&&unlocked<portions.length;
  function openNext(){setDemo(d=>({...d,portionUnlocks:[...(d.portionUnlocks??[]),scene.id],events:[...new Set([...d.events,"portion_unlocked"])]}));requestAnimationFrame(()=>document.getElementById("current-portion")?.scrollIntoView({behavior:"smooth",block:"start"}))}
  const paragraph=(p:SourcePassage)=><p key={p.id} className="relative pl-12 text-sm leading-7 text-white/75"><span className="absolute left-0 top-1 font-mono text-[10px] text-[#A0472C]/70">¶ {p.id.slice(1)}</span><GlossaryText text={p.text} glossary={world.glossary} grade={grade} onOpen={onWord} onSave={onSave}/></p>;
  const range=(list:SourcePassage[])=>describePortion(list);
  return <section className="mt-5 border-t border-white/10 pt-4" aria-label="The story in order">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="eyebrow">YOUR READING · PORTION {unlocked} OF {portions.length}</p><p className="text-xs text-white/60">{range(portions[unlocked-1])}</p></div>
    {note&&<p className="mt-2 border-l-2 border-[#A0472C] pl-3 text-sm leading-6 text-white/85">{note}<HomeText text={note}/></p>}<p className="mt-1 text-sm leading-6 text-white/70">Read the story one portion at a time. Each time you finish the analysis questions on a scene’s clues, the next portion opens.</p>
    {unlocked>1&&<details className="mt-3 border border-white/10 px-3 py-2"><summary className="cursor-pointer text-sm text-[#A0472C]">{unlocked===2?"Reread portion 1":`Reread portions 1 to ${unlocked-1}`}</summary><div className="mt-3 max-h-[50vh] space-y-4 overflow-y-auto pr-2">{portions.slice(0,unlocked-1).flat().map(paragraph)}</div></details>}
    <article id="current-portion" tabIndex={-1} className="mt-3 scroll-mt-24 max-h-[60vh] space-y-4 overflow-y-auto pr-2" aria-label={`Portion ${unlocked}`}>{portions[unlocked-1].map(paragraph)}</article>
    {unlocked<portions.length&&<p className="mt-4 border-t border-white/10 pt-3 text-sm text-white/70"><LockKeyhole size={14} className="mr-2 inline text-[#A0472C]"/>The next portion of the text opens at the bottom of this page after you finish this scene’s clues.</p>}
    {unlocked>=portions.length&&<p className="mt-4 text-sm text-[#8A3B23]"><Check size={14} className="mr-1 inline"/>You have opened the whole story.</p>}
  </section>;
}


// The gate at the end of the scene: after the student finishes the analysis questions on every clue in this scene,
// this opens the next portion of the story. It sits at the bottom of the page so it is the natural next step.
export function NextPortionGate({world,scene,demo,setDemo}:{world:WorldPack;scene:WorldPack["scenes"][number];demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>}){
  const count=Math.max(2,world.scenes.length);
  const unlocks=demo.portionUnlocks??[];
  const sceneIndex=Math.max(0,world.scenes.findIndex(s=>s.id===scene.id));
  const unlocked=Math.min(count,Math.max(1+unlocks.length,sceneIndex+1+(unlocks.includes(scene.id)?1:0)));
  if(unlocked>=count)return null;
  const isDone=(id:string)=>{const x=demo.artifactAnswers[id];return !!(x?.notice.trim()&&x?.interpret.trim()&&x?.craft.trim()&&x?.technique)};
  const finished=scene.artifacts.filter(a=>isDone(a.id)).length,total=scene.artifacts.length;
  const usedThisScene=unlocks.includes(scene.id);
  const canOpen=finished===total&&!usedThisScene;
  function openNext(){setDemo(d=>({...d,portionUnlocks:[...(d.portionUnlocks??[]),scene.id],events:[...new Set([...d.events,"portion_unlocked"])]}));setTimeout(()=>{const el=document.getElementById("current-portion");const panel=el?.closest("details");if(panel&&!panel.open)panel.open=true;el?.scrollIntoView({behavior:"smooth",block:"start"});el?.focus({preventScroll:true})},50)}
  if(usedThisScene)return <div className="mt-8 border border-[#A0472C]/50 p-4 text-sm leading-6 text-[#8A3B23]"><Check size={14} className="mr-2 inline"/>You opened the next portion of the text. Read it in “From the text” above, then choose where to go next.</div>;
  return <section className="mt-8 border border-dashed border-[#A0472C]/50 bg-[#A0472C]/[.04] p-5" aria-label="Next portion of the text">
    <p className="eyebrow">WHEN YOUR ANALYSIS IS DONE</p>
    <h2 className="serif mt-2 text-2xl">Next portion of the text<HomeUi k="nextPortion" className="font-sans text-base"/></h2>
    {canOpen
      ?<><p className="mt-2 text-sm leading-6 text-white/80">You finished every clue in this scene. Keep reading to see what happens next.</p><button type="button" onClick={openNext} className="gold-button mt-4 flex min-h-12 w-full items-center justify-center gap-2 px-5 py-3 text-sm"><span>Read the next portion of the text<HomeUi k="readNext" className="border-0 pl-0 text-[#0f1b19]/80"/></span> <ArrowRight size={16}/></button></>
      :<><p className="mt-2 text-sm leading-6 text-white/80"><LockKeyhole size={14} className="mr-2 inline text-[#A0472C]"/>Finish the analysis questions on this scene’s clues to open it. <b>{finished} of {total} clues finished.</b><HomeUi k="nextPortionLocked"/></p><div className="mt-3 h-2 bg-white/10" aria-hidden="true"><div className="h-full bg-[#A0472C]" style={{width:`${total?finished/total*100:100}%`}}/></div><button type="button" onClick={()=>document.getElementById("case-file")?.scrollIntoView({behavior:"smooth",block:"start"})} className="soft-button mt-4 min-h-12 px-5 py-3 text-sm">Go to my clues<HomeUi k="goToClues" className="border-0 pl-0"/></button></>}
  </section>;
}
