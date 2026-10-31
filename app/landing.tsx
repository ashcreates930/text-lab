"use client";
// Public home page: what Text Lab is, who it is for, and one click into a case.
import { useState } from "react";
import { ArrowRight, Check, MessageCircle, PenLine, Radio, Sparkles, Zap } from "lucide-react";
import { Wordmark } from "./wordmark";
import { openDemoRoom } from "./live/entry";
import { copyTransform, faceClip, hologramLayout } from "@/lib/hologram";

export function Landing({ brand, onStart, onCatchLie, onProofRace, onPreset, onJoin, onWaitlist, onPricing, onLessons, onClassroom, onApproach, onFeedback }: any) {
  const stories=[["The Legend of Sleepy Hollow","Washington Irving","Grades 6 to 8"],["The Tell-Tale Heart","Edgar Allan Poe","Grades 8 to 12"],["Trifles","Susan Glaspell","Grades 9 to 11"]];
  const steps=[["01","Open a clue","Students step into a scene from the story and pick a clue to examine."],["02","Question, then prove","They ask a character what happened. Characters can be wrong, so students tap the line in the text that backs them up or proves them wrong. A wrong line means 'Not yet': students look again, and first-try proof earns full points."],["03","Play your way","Solo missions, rival face-offs, or squads that read together."],["04","Spot the Lie","In every scene one character tells a lie on purpose. Students catch it with the one line from the story that disproves it."],["05","Close the case","Each student picks a mission, like Find Ichabod. They collect proof as they play, write their verdict with cited lines, and then the story reveals what really happened."],["06","Play live in squads","Teachers run live rounds on the board. Squads of 3 or 4 share roles and earn points for evidence and reasoning, not speed."]];
  const audiences:[string,string,string,string[],[string,()=>void]][]=[
    ["STUDENTS","Grades 6 to 12","Close reading that feels like solving a case, not filling out a worksheet.",["Short scenes, one clue at a time","Home-language help in Español, Kreyòl ayisyen, Português and Tiếng Việt","No email or password: a nickname is enough","Points come only from proof in the text, so guessing doesn't pay."],["Try a case",onStart]],
    ["TEACHERS","English and ELA classrooms","One class link and your students are reading in under a minute.",["Share a link or QR code; students type a nickname and start","See which evidence came from the story and which came from an AI character","Run a live class discussion and assign five-minute mini lessons","See each student's proof lines, squad pins, reactions and votes","Mark students absent so squad scores stay fair","Turn Freeze power-ups on or off for live rounds","See who found proof on the first try and who needed the answer shown","Aligned to Florida B.E.S.T., AP and Cambridge AICE"],["Teacher sign in",onClassroom]],
    ["FAMILIES","Practice at home","A reading game your child can play in short sessions, with proof they actually read.",["Works on a laptop, tablet or phone","Help in Español, Kreyòl ayisyen, Português and Tiếng Việt","No email or password for students"],["Try a case",onStart]],
    ["SCHOOLS AND DISTRICTS","AI literacy inside ELA","Students learn that AI is a resource, not the source, by checking every AI answer against the text.",["School and district plans with an admin view","Professional development for teachers","Built by a practicing English teacher"],["See plans",onPricing]],
  ];
  return <div className="case-ui">
    <nav className="flex h-[70px] items-center justify-between px-5 md:px-14"><a className="text-2xl no-underline" href="#top"><Wordmark byline/></a><div className="hidden items-center gap-7 text-[14px] font-medium text-muted lg:flex"><a href="#how" className="hover:text-highlight">How it works</a><a href="#who" className="hover:text-highlight">Who it's for</a><button onClick={onLessons} className="hover:text-highlight">Mini lessons</button><button onClick={onPricing} className="hover:text-highlight">Pricing</button><button onClick={onClassroom} className="hover:text-highlight">Teacher sign in</button></div><div className="flex items-center gap-2"><button type="button" onClick={onFeedback} className="min-h-11 whitespace-nowrap rounded-full px-2 text-[14px] font-semibold text-highlight underline-offset-4 hover:underline sm:px-3">Give feedback</button><button className="case-primary !min-h-11 whitespace-nowrap !px-4 !text-[15px] sm:!px-5" onClick={onStart}>Try the demo <ArrowRight size={16}/></button></div></nav>

    <section id="top" className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 md:grid-cols-[1fr_1.05fr] md:px-14 md:pb-24 md:pt-14">
      <div>
        <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">For grades 6 to 12 English classrooms</p>
        <h1 className="mt-4 text-[46px] leading-[1.05] tracking-[-.03em] md:text-[68px]">Step into the story.<br/><span className="italic text-highlight">Decide what to believe.</span></h1>
        <p className="mt-6 max-w-[560px] text-[20px] font-semibold leading-8 text-ink">Text Lab is a reading game for middle and high school students. They solve mysteries inside classic stories by finding proof in the text.</p>
        <p className="mt-3 max-w-[540px] text-[17px] leading-7 text-muted">Students question the characters, check every answer against the story, and close the case. Teachers see who found real evidence.</p>
        <div className="mt-8 flex flex-wrap gap-3"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onClassroom} className="case-secondary">I'm a teacher</button></div>
        <p className="mt-4 text-[14px] text-muted">The demo needs no account. <button onClick={onJoin} className="font-semibold text-highlight underline underline-offset-4">Students with a class code, join here.</button></p>
      </div>
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="case-art aspect-[4/3] w-full" style={{backgroundImage:"url('/worlds/sleepy-hollow/empty-schoolhouse.png')"}} role="img" aria-label="A scene from The Legend of Sleepy Hollow: the empty schoolhouse"/>
          <div aria-hidden className="case-stamp case-stamp-static">Scene solved</div>
          <div className="absolute inset-x-0 bottom-0 bg-deep/80 p-5 pb-16 pt-16"><p className="text-[12px] font-semibold uppercase tracking-wide text-muted">The Legend of Sleepy Hollow · Scene 1</p><p className="mt-1 text-[20px] font-semibold text-ink">Figure out what really happened to Ichabod.</p></div>
        </div>
        <div className="absolute -bottom-6 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-panel px-4 py-3 md:left-8 md:right-auto md:min-w-[340px]">
          <div className="min-w-[150px] flex-1"><p className="text-[13px] font-semibold text-ink">4 of 4 clues proven</p><div className="mt-1.5 flex gap-1">{[0,1,2,3].map(i=><span key={i} className="h-2 flex-1 rounded-full bg-primary"/>)}</div></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-deep px-3 py-1 text-[13px] font-semibold text-ink">Investigator</span>
        </div>
      </div>
    </section>

    <NewStrip onCatchLie={onCatchLie} onProofRace={onProofRace}/>

    <section id="how" className="border-t border-edge bg-panel px-5 py-16 md:px-14 md:py-20"><div className="mx-auto max-w-7xl">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">How a case works</p>
      <h2 className="mt-3 max-w-3xl text-[34px] leading-tight md:text-[44px]">AI can summarize any book. Text Lab makes students prove what's true.</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{steps.map(([n,t,d])=><li key={n} className="rounded-3xl border border-edge p-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[15px] font-bold text-on-primary">{n}</span><h3 className="mt-5 text-[21px] font-bold">{t}</h3><p className="mt-2 text-[16px] leading-7 text-muted">{d}</p></li>)}</ol>
    </div></section>

    <section id="who" className="px-5 py-16 md:px-14 md:py-20"><div className="mx-auto max-w-7xl">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">Who it's for</p>
      <h2 className="mt-3 text-[34px] leading-tight md:text-[44px]">Built for the classroom, from the classroom.</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{audiences.map(([eyebrow,sub,lead,points,[cta,go]])=><div key={eyebrow} className="flex flex-col rounded-3xl bg-panel p-7">
        <p className="text-[13px] font-bold tracking-[.12em] text-highlight">{eyebrow}</p><p className="mt-1 text-[15px] text-muted">{sub}</p>
        <h3 className="mt-4 text-[22px] font-bold leading-snug">{lead}</h3>
        <ul className="mt-5 flex-1 space-y-3">{points.map(pt=><li key={pt} className="flex gap-3 text-[16px] leading-6 text-muted"><Check size={18} className="mt-0.5 shrink-0 text-highlight"/>{pt}</li>)}</ul>
        <button onClick={go} className="case-secondary mt-7 w-fit">{cta} <ArrowRight size={16}/></button>
      </div>)}</div>
      <p className="mt-6 text-[15px] text-muted">Teachers: want to see the data first? <button onClick={()=>onPreset("teacher_end_unit")} className="font-semibold text-highlight underline underline-offset-4">Open a sample class report.</button></p>
    </div></section>

    <section className="border-t border-edge bg-panel px-5 py-16 md:px-14"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
      <div><p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">Ready now</p><h2 className="mt-3 text-[34px] leading-tight">Three cases to open today. Twenty-four more on the way.</h2><p className="mt-4 text-[16px] leading-7 text-muted">Classic stories from the texts teachers already assign, each built as a four-scene case with clues tied to the original text.</p></div>
      <ul className="grid gap-3">{stories.map(([t,a,g])=><li key={t}><button onClick={onStart} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-edge bg-panel-2 px-5 py-4 text-left transition hover:border-primary"><span><span className="block text-[18px] font-bold">{t}</span><span className="text-[15px] text-muted">{a} · {g}</span></span><ArrowRight size={18} className="shrink-0 text-highlight"/></button></li>)}</ul>
    </div></section>

    <section className="px-5 py-16 md:px-14"><div className="mx-auto max-w-3xl text-center">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">Who built this</p>
      <p className="font-display mt-3 text-[28px] leading-snug md:text-[32px]">Built by Ashley Hodges, a high school English teacher on Florida's Treasure Coast and the founder of {brand.organization}.</p>
      <p className="mt-4 text-[16px] leading-7 text-muted">Every case is built from texts teachers already assign, and every clue is tied to a passage in the original story.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onApproach} className="case-secondary">Read our approach</button></div>
    </div></section>

    <footer className="flex flex-wrap justify-between gap-4 border-t border-edge px-5 py-7 text-[13px] text-muted md:px-14"><span>{brand.organization} · {brand.principle}.</span><div className="flex flex-wrap gap-5"><button onClick={onApproach}>Our approach</button><button onClick={onPricing}>Pricing</button><button onClick={onWaitlist}>Join the waitlist</button><button onClick={onFeedback}>Give feedback</button></div></footer>
  </div>;
}

// New: Proof Race, live squads, Spot the Lie, hologram mode and Your Turn.
function NewStrip({onCatchLie,onProofRace}:{onCatchLie:()=>void;onProofRace?:()=>void}){
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  async function playLive(){if(busy)return;setBusy(true);setError("");setError(await openDemoRoom());setBusy(false)}
  const card="flex flex-col rounded-3xl bg-panel p-6";
  return <section aria-labelledby="new-h" className="px-5 pb-16 md:px-14"><div className="mx-auto max-w-7xl">
    <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">New</p>
    <h2 id="new-h" className="mt-2 text-[30px] leading-tight md:text-[36px]">More ways to prove what's true</h2>
    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {onProofRace&&<div className={card}><Zap size={26} className="text-highlight"/><h3 className="mt-3 text-[21px] font-bold">Proof Race</h3><p className="mt-2 flex-1 text-[16px] leading-7 text-muted">Read a short chunk with no timer, check the gist, then race to tap the line that answers the question. Points come only from the right line, with a bonus for speed. Play live with your class, or solo against the Lantern Ghost.</p>
        <button type="button" onClick={onProofRace} className="case-primary mt-5 w-full sm:w-fit">Try Proof Race <ArrowRight size={18}/></button></div>}
      <div className={card}><Radio size={26} className="text-highlight"/><h3 className="mt-3 text-[21px] font-bold">Play live with your class</h3><p className="mt-2 flex-1 text-[16px] leading-7 text-muted">Squads join on their phones with a QR code. Each member reads a different part of the passage and has a job: Reader, Fact-checker or Connector. Teammates pin lines, react with sentence stems and vote on their best proof.</p>
        <button type="button" onClick={playLive} aria-busy={busy} className="case-primary mt-5 w-full sm:w-fit">{busy?"Opening the demo room…":"Open a demo room"} <ArrowRight size={18}/></button>
        {error&&<p role="alert" className="mt-2 text-[15px] text-notyet">{error}</p>}</div>
      <div className={card}><MessageCircle size={26} className="text-highlight"/><h3 className="mt-3 text-[21px] font-bold">Catch the lie</h3><p className="mt-2 flex-1 text-[16px] leading-7 text-muted">Hans Van Ripper swears he knows what was in Ichabod's bundle. One thing he says is false. Find the line in the story that proves it.</p>
        <button type="button" onClick={onCatchLie} className="case-primary mt-5 w-full sm:w-fit">Hear his testimony <ArrowRight size={18}/></button></div>
      <div className={card}><Sparkles size={26} className="text-highlight"/><h3 className="mt-3 text-[21px] font-bold">Characters as holograms</h3><p className="mt-2 text-[16px] leading-7 text-muted">Tap a character's portrait to open their card, with traits quoted from the story. Tap Hologram, set your phone under a clear pyramid, and the character appears.</p>
        <MiniHologram/></div>
      <div className={card}><PenLine size={26} className="text-highlight"/><h3 className="mt-3 text-[21px] font-bold">Your Turn</h3><p className="mt-2 flex-1 text-[16px] leading-7 text-muted">After the case, each student gets a personal activity, like styling a character or debating one, that sends them back to the text to cite their proof.</p></div>
    </div>
  </div></section>;
}

// A small, still picture of the four-way hologram layout, built with the same layout code as the real view.
function MiniHologram(){
  const size=168,copies=hologramLayout({width:size,height:size,size:0.95,gap:0.16,mirror:false}),clip=faceClip(copies[0].size,0.16*size);
  return <div aria-hidden className="relative mx-auto mt-5 overflow-hidden rounded-2xl bg-black" style={{width:size,height:size}}>
    {copies.map(c=><img key={c.side} src="/worlds/sleepy-hollow/holograms/hans-van-ripper.png" alt="" loading="lazy" className="absolute max-w-none" style={{left:c.x,top:c.y,width:c.size,height:c.size,transform:copyTransform(c),clipPath:clip,filter:"drop-shadow(0 0 6px rgba(140,235,255,.55))"}}/>)}
  </div>;
}
