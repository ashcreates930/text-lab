"use client";
import {createContext,useContext,useEffect,useState} from "react";
import {Languages} from "lucide-react";
import {homeLanguages,languageNames,translator,ui,type HomeLanguage,type TranslationFile,type UiKey} from "@/lib/bilingual";

type Ctx={lang:HomeLanguage|null;tr:(english:string|undefined|null)=>string|null;draft:boolean};
const BilingualContext=createContext<Ctx>({lang:null,tr:()=>null,draft:false});
export const useBilingual=()=>useContext(BilingualContext);

// Loads a story's prebuilt translation file for the chosen home language. Missing files simply mean English only.
export function BilingualProvider({worldId,lang,children}:{worldId:string;lang:HomeLanguage|null;children:React.ReactNode}){
 const [file,setFile]=useState<TranslationFile|null>(null);
 useEffect(()=>{setFile(null);if(!lang)return;let cancelled=false;fetch(`/worlds/${worldId}/translations/${lang}.json`).then(r=>r.ok?r.json():null).then(f=>{if(!cancelled)setFile(f)}).catch(()=>{});return()=>{cancelled=true}},[worldId,lang]);
 return <BilingualContext.Provider value={{lang,tr:translator(file),draft:file?.status!=="reviewed"}}>{children}</BilingualContext.Provider>;
}

const homeStyle="mt-1 block border-l-2 border-[#8fb3cf] pl-3 text-[0.95em] leading-relaxed text-[#cfe0ee]";

// The home-language version of a story line, shown under the English. Renders nothing when there is no translation.
export function HomeText({text,className=""}:{text:string|undefined|null;className?:string}){
 const {lang,tr}=useBilingual();const t=tr(text);
 if(!lang||!t)return null;
 return <span lang={lang} className={`${homeStyle} ${className}`}>{t}</span>;
}

// Interface text: English, with the home language underneath when one is chosen.
export function UiText({k,className=""}:{k:UiKey;className?:string}){
 const {lang}=useBilingual();
 return <>{ui[k].en}{lang&&<span lang={lang} className={`${homeStyle} ${className}`}>{ui[k][lang]}</span>}</>;
}
export function uiFor(k:UiKey,lang:HomeLanguage|null){return lang?ui[k][lang]:null}

export function LanguagePicker({value,onChange,compact=false}:{value:HomeLanguage|null;onChange:(lang:HomeLanguage|null)=>void;compact?:boolean}){
 const pill=(active:boolean)=>`min-h-11 rounded-full border px-4 py-2 ${compact?"text-xs":"text-sm"} ${active?"border-[#8fb3cf] bg-[#8fb3cf]/20 text-[#e3eef7]":"border-white/20 text-white/75 hover:border-white/50"}`;
 return <div role="group" aria-label="Language help" className="flex flex-wrap items-center gap-2"><span className={`mr-1 inline-flex items-center gap-1.5 ${compact?"text-xs":"text-sm"} text-white/75`}><Languages size={compact?14:16} aria-hidden="true"/> {ui.languageHelp.en}{value&&<span lang={value} className="text-[#cfe0ee]"> · {ui.languageHelp[value]}</span>}</span><button type="button" aria-pressed={!value} onClick={()=>onChange(null)} className={pill(!value)}>English only</button>{homeLanguages.map(l=><button key={l} type="button" lang={l} aria-pressed={value===l} onClick={()=>onChange(l)} className={pill(value===l)}>{languageNames[l].native}</button>)}</div>;
}

// Only the home-language line for an interface key (use where the English is already on screen).
export function HomeUi({k,className=""}:{k:UiKey;className?:string}){
 const {lang}=useBilingual();
 if(!lang)return null;
 return <span lang={lang} className={`${homeStyle} ${className}`}>{ui[k][lang]}</span>;
}

// The home language is remembered in this browser so students choose it once, not on every visit.
const languageStorageKey="itt-home-language";
export function savedHomeLanguage():HomeLanguage|null{try{if(typeof window==="undefined")return null;const v=window.localStorage.getItem(languageStorageKey);return homeLanguages.includes(v as HomeLanguage)?v as HomeLanguage:null}catch{return null}}
export function saveHomeLanguage(lang:HomeLanguage|null){try{if(lang)window.localStorage.setItem(languageStorageKey,lang);else window.localStorage.removeItem(languageStorageKey)}catch{}}

// Top-bar language button, available on every student screen.
export function HeaderLanguage({value,onChange}:{value:HomeLanguage|null;onChange:(lang:HomeLanguage|null)=>void}){
 return <label className={`flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs ${value?"border-[#8fb3cf] bg-[#8fb3cf]/15 text-[#e3eef7]":"border-white/20 text-white/75"}`} title="Language help">
  <Languages size={14} aria-hidden="true"/><span className="sr-only">Language help</span>
  <select value={value??""} onChange={e=>onChange((e.target.value||null) as HomeLanguage|null)} className="max-w-[9.5rem] cursor-pointer bg-transparent py-2 pr-1 text-xs outline-none">
   <option value="" className="bg-[#151a1a] text-white">English only</option>
   {homeLanguages.map(l=><option key={l} value={l} lang={l} className="bg-[#151a1a] text-white">{languageNames[l].native}</option>)}
  </select>
 </label>;
}
