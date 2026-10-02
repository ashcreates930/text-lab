"use client";
import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, BookOpen, Check } from "lucide-react";
import type { WorldPack } from "@/lib/world-schema";
import { parseSourcePassages } from "@/lib/source-passages";
import type { Demo } from "./page";
import {GlossaryText} from "./glossary-word";

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

  return <section className="mx-5 mt-4 border border-white/15 bg-[#1a1d1c]/95 md:mx-12" aria-label="From the text">
    <details open={expanded} onToggle={(event) => setExpanded((event.currentTarget as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3"><span className="eyebrow"><BookOpen size={12} className="mr-2 inline"/>FROM THE TEXT</span><span className="text-[10px] text-white/40 md:hidden">{expanded ? "CLOSE" : "OPEN"}</span></summary>
      <div className="border-t border-white/10 px-4 py-4">
        <div onMouseUp={() => { const text = window.getSelection()?.toString().trim() || ""; const parent = window.getSelection()?.anchorNode?.parentElement?.closest("[data-passage-id]"); setSelection(text); setSelectedParagraph(parent?.getAttribute("data-passage-id") || ""); }} className="space-y-4">
          {shown.map((passage) => <p id={`passage-${passage.id}`} key={passage.id} data-passage-id={passage.id} className={`relative pl-12 text-sm leading-7 text-white/75 transition-colors ${active?.source_anchor.includes(passage.id) ? "rounded-sm bg-[#dfb675]/[.08] text-white" : ""}`}><span className="absolute left-0 top-1 font-mono text-[10px] text-[#dfb675]/70">¶ {passage.id.slice(1)}</span><GlossaryText text={passage.text} glossary={world.glossary} grade={grade} onOpen={()=>wordOpened("")} onSave={saveWord}/></p>)}
          {!shown.length && <p className="text-xs text-white/45">Source passages are unavailable for this scene.</p>}
        </div>
        {selection && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="max-w-xl text-xs text-white/55">Selected from ¶ {selectedParagraph.slice(1)}: “{selection.slice(0, 160)}{selection.length > 160 ? "…" : ""}”</span><button type="button" onClick={saveSelection} className="gold-button flex items-center gap-2 px-3 py-2 text-[10px]"><BookmarkPlus size={13}/> SAVE TO CASE FILE · TEXT EVIDENCE</button></div>}
        {!!demo.savedTextEvidence.length && <div className="mt-4 border-t border-white/10 pt-3"><p className="eyebrow">SAVED TEXT EVIDENCE</p><div className="mt-2 grid gap-2">{demo.savedTextEvidence.map((quote) => <div key={quote.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", `“${quote.text}” (¶ ${quote.paragraphId.slice(1)})`); event.dataTransfer.setData("application/x-itt-source", "inserted"); }} className="border border-white/10 p-2 text-xs text-white/60"><Check size={11} className="mr-1 inline text-[#dfb675]"/>“{quote.text}” <span className="text-[#dfb675]">¶ {quote.paragraphId.slice(1)} · TEXT EVIDENCE</span></div>)}</div></div>}
        <details className="mt-4 border-t border-white/10 pt-3"><summary className="cursor-pointer text-xs text-[#dfb675]">Read the full story</summary><article className="mt-3 max-h-[60vh] space-y-4 overflow-y-auto pr-2">{allPassages.map((passage) => <p key={passage.id} className="relative pl-12 text-sm leading-7 text-white/65"><span className="absolute left-0 top-1 font-mono text-[10px] text-[#dfb675]/70">¶ {passage.id.slice(1)}</span><GlossaryText text={passage.text} glossary={world.glossary} grade={grade} onOpen={()=>wordOpened("")} onSave={saveWord}/></p>)}</article></details>
      </div>
    </details>
  </section>;
}
