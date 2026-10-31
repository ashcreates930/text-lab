"use client";
// Public home page: what Text Lab is, who it is for, and one click into a case.
import { useState } from "react";
import { ArrowRight, MessageCircle, Radio, Sparkles, Zap } from "lucide-react";
import { SneakPeek } from "./sneak-peek";
import { Wordmark } from "./wordmark";
import { openDemoRoom } from "./live/entry";

export function Landing({ brand, onStart, onPreset, onJoin, onWaitlist, onPricing, onLessons, onClassroom, onApproach, onFeedback }: any) {
  const [busy,setBusy]=useState(false),[liveError,setLiveError]=useState("");
  async function playLive(){if(busy)return;setBusy(true);setLiveError("");setLiveError(await openDemoRoom());setBusy(false)}
  const stories=[["The Legend of Sleepy Hollow","Washington Irving","Grades 6 to 8"],["The Tell-Tale Heart","Edgar Allan Poe","Grades 8 to 12"],["Trifles","Susan Glaspell","Grades 9 to 11"]];
  // What students play now: one line each and a small arrow link.
  const ways:[typeof Zap,string,string,string,()=>void][]=[
    [Zap,"Proof Race","Read a chunk, then race to the line that proves it.","Play now",onStart],
    [Radio,"Play live with your class","Everyone races on their phones while the board shows the climb.","Open a demo room",playLive],
    [MessageCircle,"Catch the lie","A character lies inside the race. Tap the line that proves it false.","Try it",onStart],
    [Sparkles,"Holograms","Characters testify as holograms on the Witness stand in live games.","See it live",playLive],
  ];
  const steps:[string,string][]=[["Step inside","You're an investigator in the story."],["Read a chunk","A few sentences, no timer."],["Race to the proof","Answer, then tap the words that prove it."],["Climb the board","Points only for proof. Watch your rank move."],["Refresher","Missed one? Fix it with a hint after the race."],["Bonus round","Squads compare notes and agree on the best proof."]];
  const audiences:[string,string,string,()=>void][]=[
    ["Students","Close reading that feels like solving a case.","Try a case",onStart],
    ["Teachers","One class link, and every student's proof in one view.","Teacher sign in",onClassroom],
    ["Families","Short sessions on any device, no account.","Try a case",onStart],
    ["Schools and districts","AI literacy inside ELA, with an admin view.","See plans",onPricing],
  ];
  const sec="px-4 py-10 md:px-14 md:py-12",eyebrow="text-[13px] font-extrabold uppercase tracking-[.08em] text-highlight";
  const tile="flex flex-col gap-2 rounded-card bg-panel p-4",link="inline-flex min-h-11 items-center gap-1 self-start text-[15px] font-bold text-highlight";
  return <div className="case-ui">
    <nav className="flex h-[70px] items-center justify-between px-4 md:px-14"><a className="text-2xl no-underline" href="#top"><Wordmark byline/></a><div className="hidden items-center gap-7 text-[14px] font-medium text-muted lg:flex"><a href="#how" className="hover:text-highlight">How it works</a><a href="#who" className="hover:text-highlight">Who it's for</a><button onClick={onLessons} className="hover:text-highlight">Mini lessons</button><button onClick={onPricing} className="hover:text-highlight">Pricing</button><button onClick={onClassroom} className="hover:text-highlight">Teacher sign in</button></div><div className="flex items-center gap-2"><button type="button" onClick={onFeedback} className="min-h-11 whitespace-nowrap rounded-full px-2 text-[14px] font-semibold text-highlight underline-offset-4 hover:underline sm:px-3">Give feedback</button><button className="case-primary !min-h-11 whitespace-nowrap !px-4 !text-[15px] sm:!px-5" onClick={onStart}>Try the demo <ArrowRight size={16}/></button></div></nav>

    <section id="top" className="mx-auto grid max-w-7xl items-center gap-5 px-4 pb-8 pt-4 md:gap-8 md:grid-cols-[1.1fr_1fr] md:px-14 md:pb-12 md:pt-8">
      <div>
        <p className={eyebrow}>For grades 6 to 12 English classrooms</p>
        <h1 className="mt-3 text-[42px] leading-[1.02] md:text-[60px]">Step into the story.<br/><span className="text-highlight">Decide what to believe.</span></h1>
        <p className="mt-4 max-w-[520px] text-[18px] leading-7 text-muted">Students read classic stories chunk by chunk and race to the words that prove every answer.</p>
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onClassroom} className="case-secondary">I'm a teacher</button></div>
        <p className="mt-3 text-[14px] text-muted">No account needed. <button onClick={onJoin} className="font-semibold text-highlight underline underline-offset-4">Students with a class code, join here.</button></p>
      </div>
      <SneakPeek/>
    </section>

    <section aria-labelledby="ways-h" className={sec}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>What students play</p>
      <h2 id="ways-h" className="mt-2 text-[28px] leading-tight md:text-[34px]">More ways to prove what's true</h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{ways.map(([Icon,t,line,cta,go])=><li key={t} className={tile}>
        <Icon size={24} className="text-highlight" aria-hidden/><h3 className="text-[18px] leading-tight md:text-[20px]">{t}</h3><p className="flex-1 text-[14px] leading-snug text-muted md:text-[15px]">{line}</p>
        <button type="button" onClick={go} className={link}>{cta}<span className="sr-only">: {t}</span> <ArrowRight size={16} aria-hidden/></button></li>)}</ul>
      {busy&&<p role="status" className="mt-2 text-[15px] text-muted">Opening the demo room…</p>}
      {liveError&&<p role="alert" className="mt-2 text-[15px] text-notyet">{liveError}</p>}
    </div></section>

    <section id="how" aria-labelledby="how-h" className={`bg-panel-2 ${sec}`}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>How a case works</p>
      <h2 id="how-h" className="mt-2 text-[28px] leading-tight md:text-[34px]">AI can summarize any book. Text Lab makes students prove what's true.</h2>
      <ol className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{steps.map(([t,d],i)=><li key={t} className={tile}><span className="grid h-9 w-9 place-items-center rounded-row bg-primary font-display text-[17px] font-bold text-on-primary">{i+1}</span><h3 className="text-[18px] leading-tight">{t}</h3><p className="text-[14px] leading-snug text-muted">{d}</p></li>)}</ol>
    </div></section>

    <section id="who" aria-labelledby="who-h" className={sec}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>Who it's for</p>
      <h2 id="who-h" className="mt-2 text-[28px] leading-tight md:text-[34px]">Built for the classroom, from the classroom.</h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{audiences.map(([t,line,cta,go])=><li key={t} className={tile}><h3 className="text-[18px] leading-tight md:text-[20px]">{t}</h3><p className="flex-1 text-[14px] leading-snug text-muted md:text-[15px]">{line}</p><button type="button" onClick={go} className={link}>{cta}<span className="sr-only">: {t}</span> <ArrowRight size={16} aria-hidden/></button></li>)}</ul>
      <p className="mt-3 text-[14px] text-muted">Aligned to Florida B.E.S.T. ELA. <button onClick={()=>onPreset("teacher_end_unit")} className="font-semibold text-highlight underline underline-offset-4">Open a sample class report.</button></p>
    </div></section>

    <section aria-labelledby="stories-h" className={`bg-panel-2 ${sec}`}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>Ready now</p>
      <h2 id="stories-h" className="mt-2 text-[28px] leading-tight md:text-[34px]">Three stories to open today, more on the way.</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">{stories.map(([t,a,g])=><li key={t}><button onClick={onStart} className="flex w-full items-center justify-between gap-3 rounded-card bg-panel px-4 py-3 text-left"><span><span className="block font-display text-[18px] font-semibold">{t}</span><span className="text-[14px] text-muted">{a} · {g}</span></span><ArrowRight size={18} className="shrink-0 text-highlight" aria-hidden/></button></li>)}</ul>
    </div></section>

    <section aria-labelledby="built-h" className={sec}><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
      <div><p className={eyebrow}>Who built this</p><h2 id="built-h" className="mt-2 text-[22px] leading-snug md:text-[26px]">Built by Ashley Hodges, a high school English teacher on Florida's Treasure Coast and the founder of {brand.organization}.</h2></div>
      <div className="flex flex-wrap gap-3 md:justify-end"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onApproach} className="case-secondary">Read our approach</button></div>
    </div></section>

    <footer className="flex flex-wrap justify-between gap-4 border-t border-edge px-4 py-6 text-[13px] text-muted md:px-14"><span>{brand.organization} · {brand.principle}.</span><div className="flex flex-wrap gap-5"><button onClick={onApproach}>Our approach</button><button onClick={onPricing}>Pricing</button><button onClick={onWaitlist}>Join the waitlist</button><button onClick={onFeedback}>Give feedback</button></div></footer>
  </div>;
}
