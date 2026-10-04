"use client";
import {useEffect,useState} from "react";
import {Printer} from "lucide-react";
import {homeLanguages,languageNames,type HomeLanguage,type TranslationFile} from "@/lib/bilingual";

const big="min-h-12 px-5 py-3 text-sm md:text-base";
type Source={strings:Record<string,string>};

// Side-by-side English and home-language lines so a fluent colleague can check a story's translation before students use it.
export function TranslationReview(){
 const [worlds,setWorlds]=useState<{id:string;title:string}[]>([]),[worldId,setWorldId]=useState(""),[lang,setLang]=useState<HomeLanguage>("es"),[source,setSource]=useState<Source|null>(null),[file,setFile]=useState<TranslationFile|null>(null),[status,setStatus]=useState<Record<string,string>>({});
 useEffect(()=>{fetch("/worlds/index.json").then(r=>r.json()).then((list:{id:string;title:string;available:boolean}[])=>{const ok=list.filter(w=>w.available);setWorlds(ok);if(ok[0])setWorldId(ok[0].id)}).catch(()=>{})},[]);
 useEffect(()=>{if(!worlds.length)return;Promise.all(worlds.flatMap(w=>homeLanguages.map(l=>fetch(`/worlds/${w.id}/translations/${l}.json`).then(r=>r.ok?r.json():null).then((f:TranslationFile|null)=>[`${w.id}:${l}`,f?f.status:"missing"] as const).catch(()=>[`${w.id}:${l}`,"missing"] as const)))).then(rows=>setStatus(Object.fromEntries(rows)))},[worlds]);
 useEffect(()=>{if(!worldId)return;setSource(null);setFile(null);fetch(`/worlds/${worldId}/translations/source.json`).then(r=>r.ok?r.json():null).then(setSource).catch(()=>{});fetch(`/worlds/${worldId}/translations/${lang}.json`).then(r=>r.ok?r.json():null).then(setFile).catch(()=>{})},[worldId,lang]);
 const label=(s:string|undefined)=>s==="reviewed"?"Reviewed":s==="draft"?"Draft · needs review":"Not translated";
 const rows=source?Object.entries(source.strings):[];
 return <div className="panel p-6 md:p-8">
  <h2 className="serif text-2xl">Bilingual supports</h2>
  <p className="mt-2 max-w-3xl text-base leading-7 text-white/80">Students choose <b>Language help</b> on the role screen or in the story sidebar. The story stays in English; roles, scene summaries, questions, glossary words, and directions appear beside it in Spanish, Haitian Creole, Portuguese, or Vietnamese, and students may draft answers in their language with English sentence starters.</p>
  <p className="mt-2 max-w-3xl text-base leading-7 text-white/80">Translations are drafts until a fluent colleague checks them. Print a story’s lines below, mark any changes, and send them to your AmplifiED contact to update the file and mark it reviewed.</p>
  <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-white/25 text-white/75"><th className="py-2">Story</th>{homeLanguages.map(l=><th key={l}>{languageNames[l].english}</th>)}</tr></thead><tbody>{worlds.map(w=><tr key={w.id} className="border-b border-white/10"><td className="py-3 font-bold">{w.title}</td>{homeLanguages.map(l=>{const s=status[`${w.id}:${l}`];return <td key={l} className={s==="reviewed"?"text-[#4F6B2E]":s==="draft"?"text-[#3E5A36]":"text-white/50"}>{label(s)}</td>})}</tr>)}</tbody></table></div>
  <div className="mt-6 flex flex-wrap items-end gap-3 print:hidden"><label className="text-base">Story<select value={worldId} onChange={e=>setWorldId(e.target.value)} className="mt-1 block min-h-12 border border-white/25 bg-[#F6F0E3] px-3 text-base">{worlds.map(w=><option key={w.id} value={w.id}>{w.title}</option>)}</select></label><label className="text-base">Language<select value={lang} onChange={e=>setLang(e.target.value as HomeLanguage)} className="mt-1 block min-h-12 border border-white/25 bg-[#F6F0E3] px-3 text-base">{homeLanguages.map(l=><option key={l} value={l}>{languageNames[l].english} · {languageNames[l].native}</option>)}</select></label><button onClick={()=>window.print()} className={`soft-button inline-flex items-center gap-2 ${big}`}><Printer size={16}/> Print for review</button></div>
  {source&&<div className="mt-5"><p className="text-sm text-white/70">{rows.length} lines · {file?label(file.status):"Not translated yet"}{file?.reviewed_by?` by ${file.reviewed_by}`:""}</p><table className="mt-3 w-full text-left text-sm"><thead><tr className="border-b border-white/25 text-white/75"><th className="w-10 py-2">#</th><th className="w-1/2">English</th><th>{languageNames[lang].native}</th></tr></thead><tbody>{rows.map(([key,en],i)=><tr key={key} className="border-b border-white/10 align-top"><td className="py-2 text-white/50">{i+1}</td><td className="py-2 pr-4">{en}</td><td lang={lang} className="py-2 text-[#2F5D7C]">{file?.strings[key]??<span className="text-white/45">Not translated</span>}</td></tr>)}</tbody></table></div>}
 </div>;
}
