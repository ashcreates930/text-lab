"use client";
// Mastery feedback (rules: lib/mastery.ts). Private to the student and their teacher: none of this appears on the
// leaderboard or the map.
// - SkillTag: after every answer, the skill with its level and progress dots.
// - LevelUp: the moment a student moves up, with the sentence that proved it (the biggest moment for Mastered, plus
//   the skill's badge).
// - SkillReport: at the end of an expedition (after the Refresher, before Case Notes), each skill met, its level, what
//   the level means in plain words, the best proof sentence and one next step, then a one-sentence reflection.
// - SkillPage: the student's own skills page: levels over time and their reflections.
// "Not yet" is never shown as failure: no red, no crosses, no "fail".
import {useLayoutEffect,useState} from "react";
import {ArrowLeft,ArrowRight,Award,Sparkles,TrendingUp} from "lucide-react";
import {LEVEL_MEANING,LEVELS,SKILLS,skillTag,type Level,type SkillLevel} from "@/lib/mastery";
import type {BenchmarkFamily} from "@/lib/best-standards";
import {focusScreenTop} from "./screen-focus";
import {DoNow} from "./practice-round";
import {DO_NOW} from "@/lib/onboarding";

const LEVEL_STYLE:Record<Level,string>={"Not yet":"bg-panel-2 text-ink","Developing":"bg-violet-soft text-ink","Proficient":"bg-line-right text-reading-ink","Mastered":"bg-gold text-on-gold"};
export function Dots({filled,of}:{filled:number;of:number}){
 return <span aria-hidden className="inline-flex items-center gap-1">{Array.from({length:of},(_,i)=><span key={i} className={`h-2.5 w-2.5 rounded-full border-2 border-current ${i<filled?"bg-current":""}`}/>)}</span>;
}
export function SkillTag({s,className=""}:{s:SkillLevel;className?:string}){
 const t=skillTag(s);
 return <p className={`inline-flex flex-wrap items-center gap-2 rounded-full px-3 py-1.5 text-[14px] font-bold ${LEVEL_STYLE[s.level]} ${className}`} aria-label={`Skill: ${t.text}`}>
  <span>{s.name} · {s.level}</span>{t.dots&&<><Dots filled={t.dots.filled} of={t.dots.of}/><span className="font-semibold">{t.dots.filled} of {t.dots.of} toward {s.toward!.next}</span></>}</p>;
}
export function LevelUp({s}:{s:SkillLevel}){
 const top=s.level==="Mastered";
 return <div role="status" className={`moment-pop w-full rounded-[24px] p-5 ${top?"bg-gold text-on-gold shadow-[0_8px_0_var(--color-gold-shadow)]":"bg-violet text-on-violet shadow-[0_6px_0_var(--color-violet-shadow)]"}`}>
  <p className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[.08em]">{top?<Award size={18} aria-hidden/>:<TrendingUp size={18} aria-hidden/>}Level up{top?" · new badge":""}</p>
  <p className={`mt-1 font-display font-bold leading-tight ${top?"text-[34px]":"text-[26px]"}`}>{s.name}: {s.level}</p>
  {top&&<p className="mt-1 text-[16px] font-bold">You earned the {s.name} badge.</p>}
  {s.best&&<p className="mt-2 rounded-row bg-reading px-3 py-2 font-serif text-[16px] text-reading-ink">The proof that did it: {s.best.replace(/\s+/g," ")}</p>}
 </div>;
}
export function SkillReport({skills,reflection,onReflect,onDone}:{skills:SkillLevel[];reflection:string;onReflect:(t:string)=>void;onDone:()=>void}){
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const words=reflection.trim().split(/\s+/).filter(Boolean).length;
 return <div className="case-ui mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-16 pt-4">
  <DoNow text={DO_NOW.skills}/>
  <h1 id="skills-h" tabIndex={-1} className="text-[30px] leading-tight outline-none">Your skill report</h1>
  <p className="text-[15px] text-muted">Only you and your teacher see this.</p>
  <ul className="grid gap-3">{skills.map(s=><li key={s.family} className="rounded-card bg-panel p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-[20px] font-bold">{s.name}</h2><SkillTag s={s}/></div>
   <p className="mt-2 text-[16px]">{LEVEL_MEANING[s.level]}</p>
   {s.best&&<p className="mt-2 rounded-row bg-reading px-3 py-2 font-serif text-[16px] text-reading-ink"><span className="font-sans text-[13px] font-extrabold uppercase tracking-[.08em]">Your best proof · </span>{s.best.replace(/\s+/g," ")}</p>}
   <p className="mt-2 flex items-start gap-2 text-[15px] font-bold"><ArrowRight size={16} className="mt-0.5 shrink-0 text-highlight" aria-hidden/>Next step: {SKILLS[s.family as BenchmarkFamily].next}</p></li>)}</ul>
  <label className="rounded-card bg-panel p-4"><span className="font-display text-[20px] font-bold">Which skill improved, and how do you know?</span>
   <span className="mt-1 block text-[15px] text-muted">One sentence. It goes in your Case Notes and to your teacher.</span>
   <textarea value={reflection} onChange={e=>onReflect(e.target.value.replace(/\n/g," ").slice(0,280))} rows={3} maxLength={280} className="mt-2 w-full rounded-row border-2 border-edge bg-panel-2 px-3 py-2 text-[17px] text-ink"/>
   <span className="text-[13px] text-muted">{words} words</span></label>
  <button type="button" onClick={onDone} className="case-primary min-h-[56px] w-full justify-center text-[18px]">{words?"Save and open my Case Notes":"Open my Case Notes"} <ArrowRight size={18} aria-hidden/></button>
 </div>;
}
// The student's skills page: each skill's level now, its level after each expedition, and the reflections.
export function SkillPage({skills,history,expeditionTitle,onBack}:{skills:SkillLevel[];history:{expedition:string;at:string;reflection:string|null;levels:{family:string;name:string;level:Level}[]}[];expeditionTitle:(id:string)=>string;onBack:()=>void}){
 useLayoutEffect(()=>{focusScreenTop()},[]);
 const [open,setOpen]=useState<string|null>(null);
 return <div className="case-ui mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-16 pt-4">
  <button type="button" onClick={onBack} className="case-secondary w-fit !min-h-11"><ArrowLeft size={18} aria-hidden/>Back to the map</button>
  <DoNow text={DO_NOW.myskills}/>
  <h1 id="myskills-h" tabIndex={-1} className="text-[30px] leading-tight outline-none">My skills</h1>
  <p className="text-[15px] text-muted">Only you and your teacher see your levels. Levels count first tries only; Refresher fixes are practice.</p>
  {!skills.length&&<p className="rounded-card bg-panel p-4 text-[16px]">Finish an expedition and your skills will appear here.</p>}
  <ul className="grid gap-3">{skills.map(s=><li key={s.family} className="rounded-card bg-panel p-4">
   <button type="button" aria-expanded={open===s.family} onClick={()=>setOpen(o=>o===s.family?null:s.family)} className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 text-left">
    <span className="font-display text-[20px] font-bold">{s.name}{s.level==="Mastered"&&<Sparkles size={18} className="ml-1 inline text-gold" aria-label="badge earned"/>}</span><SkillTag s={s}/></button>
   <p className="mt-1 text-[15px]">{LEVEL_MEANING[s.level]} {s.right} of {s.total} right on the first try.</p>
   {open===s.family&&<ol className="mt-2 grid gap-1 border-t border-edge pt-2" aria-label={`${s.name} over time`}>{history.filter(h=>h.levels.some(l=>l.family===s.family)).map((h,i)=>{const l=h.levels.find(x=>x.family===s.family)!;
    return <li key={i} className="flex items-center justify-between gap-2 text-[15px]"><span>After {expeditionTitle(h.expedition)}</span><span className={`rounded-full px-2.5 py-0.5 text-[13px] font-extrabold ${LEVEL_STYLE[l.level]}`}>{l.level}</span></li>})}</ol>}</li>)}</ul>
  {history.some(h=>h.reflection)&&<section aria-labelledby="refl-h" className="rounded-card bg-panel p-4"><h2 id="refl-h" className="font-display text-[20px] font-bold">My reflections</h2>
   <ul className="mt-2 grid gap-2">{history.filter(h=>h.reflection).map((h,i)=><li key={i} className="text-[16px]"><span className="block text-[13px] font-extrabold uppercase tracking-[.08em] text-muted">{expeditionTitle(h.expedition)}</span>"{h.reflection}"</li>)}</ul></section>}
  <p className="text-[13px] text-muted">Levels: {LEVELS.join(", ")}.</p>
 </div>;
}
