"use client";
// Public home page: what Text Lab is, who it is for, and one click into a case.
import { ArrowRight, Check } from "lucide-react";
import { Wordmark } from "./wordmark";

export function Landing({ brand, onStart, onPreset, onJoin, onWaitlist, onPricing, onLessons, onClassroom, onApproach }: any) {
  const stories=[["The Legend of Sleepy Hollow","Washington Irving","Grades 6 to 8"],["The Tell-Tale Heart","Edgar Allan Poe","Grades 8 to 12"],["Trifles","Susan Glaspell","Grades 9 to 11"]];
  const steps=[["01","Open a clue","Students step into a scene from the story and pick a clue to examine."],["02","Question, then prove","They ask a character what happened. Characters can be wrong, so students tap the line in the text that backs them up or proves them wrong."],["03","Close the case","Every proven clue fills the evidence meter and moves them up the detective ranks. The finished case file is ready to print."]];
  const audiences:[string,string,string,string[],[string,()=>void]][]=[
    ["STUDENTS","Grades 6 to 12","Close reading that feels like solving a case, not filling out a worksheet.",["Short scenes, one clue at a time","Home-language help in Español, Kreyòl ayisyen, Português and Tiếng Việt","No email or password: a nickname is enough"],["Try a case",onStart]],
    ["TEACHERS","English and ELA classrooms","One class link and your students are reading in under a minute.",["Share a link or QR code; students type a nickname and start","See which evidence came from the story and which came from an AI character","Run a live class discussion and assign five-minute mini lessons","Aligned to Florida B.E.S.T., AP and Cambridge AICE"],["Teacher sign in",onClassroom]],
    ["FAMILIES","Practice at home","A reading game your child can play in short sessions, with proof they actually read.",["Works on a laptop, tablet or phone","Help in Español, Kreyòl ayisyen, Português and Tiếng Việt","No email or password for students"],["Try a case",onStart]],
    ["SCHOOLS AND DISTRICTS","AI literacy inside ELA","Students learn that AI is a resource, not the source, by checking every AI answer against the text.",["School and district plans with an admin view","Professional development for teachers","Built by a practicing English teacher"],["See plans",onPricing]],
  ];
  return <div className="case-ui">
    <nav className="flex h-[70px] items-center justify-between px-5 md:px-14"><a className="text-2xl" href="#top"><Wordmark/></a><div className="hidden items-center gap-7 text-[14px] font-medium text-[#4A4438] lg:flex"><a href="#how" className="hover:text-[#A0472C]">How it works</a><a href="#who" className="hover:text-[#A0472C]">Who it's for</a><button onClick={onLessons} className="hover:text-[#A0472C]">Mini lessons</button><button onClick={onPricing} className="hover:text-[#A0472C]">Pricing</button><button onClick={onClassroom} className="hover:text-[#A0472C]">Teacher sign in</button></div><button className="case-primary !min-h-11 !px-5 !text-[15px]" onClick={onStart}>Try the demo <ArrowRight size={16}/></button></nav>

    <section id="top" className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 md:grid-cols-[1fr_1.05fr] md:px-14 md:pb-24 md:pt-14">
      <div>
        <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">For grades 6 to 12 English classrooms</p>
        <h1 className="serif mt-4 text-[46px] leading-[1.05] tracking-[-.03em] md:text-[68px]">Step into the story.<br/><span className="italic text-[#A0472C]">Decide what to believe.</span></h1>
        <p className="mt-6 max-w-[560px] text-[20px] font-semibold leading-8 text-[#2A2620]">Text Lab is a reading game for middle and high school students. They solve mysteries inside classic stories by finding proof in the text.</p>
        <p className="mt-3 max-w-[540px] text-[17px] leading-7 text-[#4A4438]">Students question the characters, check every answer against the story, and close the case. Teachers see who found real evidence.</p>
        <div className="mt-8 flex flex-wrap gap-3"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onClassroom} className="case-secondary">I'm a teacher</button></div>
        <p className="mt-4 text-[14px] text-[#6B6457]">The demo needs no account. <button onClick={onJoin} className="font-semibold text-[#8A3B23] underline underline-offset-4">Students with a class code, join here.</button></p>
      </div>
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_-20px_rgba(42,38,32,.45)]">
          <div className="case-art aspect-[4/3] w-full" style={{backgroundImage:"url('/worlds/sleepy-hollow/empty-schoolhouse.png')"}} role="img" aria-label="A scene from The Legend of Sleepy Hollow: the empty schoolhouse"/>
          <div aria-hidden className="case-stamp case-stamp-static">Scene solved</div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 pb-16 pt-16"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#F3C9B2]">The Legend of Sleepy Hollow · Scene 1</p><p className="mt-1 text-[20px] font-semibold text-white">Figure out what really happened to Ichabod.</p></div>
        </div>
        <div className="absolute -bottom-6 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FFFDF8] px-4 py-3 shadow-[0_10px_30px_-12px_rgba(42,38,32,.4)] md:left-8 md:right-auto md:min-w-[340px]">
          <div className="min-w-[150px] flex-1"><p className="text-[13px] font-semibold text-[#2A2620]">4 of 4 clues proven</p><div className="mt-1.5 flex gap-1">{[0,1,2,3].map(i=><span key={i} className="h-2 flex-1 rounded-full bg-[#A0472C]"/>)}</div></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2A2620] px-3 py-1 text-[13px] font-semibold text-white">Investigator</span>
        </div>
      </div>
    </section>

    <section id="how" className="border-t border-[#E4DCCB] bg-[#FFFDF8] px-5 py-16 md:px-14 md:py-20"><div className="mx-auto max-w-7xl">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">How a case works</p>
      <h2 className="serif mt-3 max-w-3xl text-[34px] leading-tight md:text-[44px]">AI can summarize any book. Text Lab makes students prove what's true.</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">{steps.map(([n,t,d])=><li key={n} className="rounded-3xl border border-[#E4DCCB] p-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#A0472C] text-[15px] font-bold text-white">{n}</span><h3 className="mt-5 text-[21px] font-bold">{t}</h3><p className="mt-2 text-[16px] leading-7 text-[#4A4438]">{d}</p></li>)}</ol>
    </div></section>

    <section id="who" className="px-5 py-16 md:px-14 md:py-20"><div className="mx-auto max-w-7xl">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Who it's for</p>
      <h2 className="serif mt-3 text-[34px] leading-tight md:text-[44px]">Built for the classroom, from the classroom.</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{audiences.map(([eyebrow,sub,lead,points,[cta,go]])=><div key={eyebrow} className="flex flex-col rounded-3xl bg-[#FFFDF8] p-7 shadow-[0_2px_14px_-6px_rgba(42,38,32,.3)]">
        <p className="text-[13px] font-bold tracking-[.12em] text-[#8A3B23]">{eyebrow}</p><p className="mt-1 text-[15px] text-[#6B6457]">{sub}</p>
        <h3 className="mt-4 text-[22px] font-bold leading-snug">{lead}</h3>
        <ul className="mt-5 flex-1 space-y-3">{points.map(pt=><li key={pt} className="flex gap-3 text-[16px] leading-6 text-[#4A4438]"><Check size={18} className="mt-0.5 shrink-0 text-[#A0472C]"/>{pt}</li>)}</ul>
        <button onClick={go} className="case-secondary mt-7 w-fit">{cta} <ArrowRight size={16}/></button>
      </div>)}</div>
      <p className="mt-6 text-[15px] text-[#6B6457]">Teachers: want to see the data first? <button onClick={()=>onPreset("teacher_end_unit")} className="font-semibold text-[#8A3B23] underline underline-offset-4">Open a sample class report.</button></p>
    </div></section>

    <section className="border-t border-[#E4DCCB] bg-[#FFFDF8] px-5 py-16 md:px-14"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
      <div><p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Ready now</p><h2 className="serif mt-3 text-[34px] leading-tight">Three cases to open today. Twenty-four more on the way.</h2><p className="mt-4 text-[16px] leading-7 text-[#4A4438]">Classic stories from the texts teachers already assign, each built as a four-scene case with clues tied to the original text.</p></div>
      <ul className="grid gap-3">{stories.map(([t,a,g])=><li key={t}><button onClick={onStart} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E4DCCB] bg-[#F6F0E3] px-5 py-4 text-left transition hover:border-[#A0472C]"><span><span className="block text-[18px] font-bold">{t}</span><span className="text-[15px] text-[#6B6457]">{a} · {g}</span></span><ArrowRight size={18} className="shrink-0 text-[#A0472C]"/></button></li>)}</ul>
    </div></section>

    <section className="px-5 py-16 md:px-14"><div className="mx-auto max-w-3xl text-center">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-[#8A3B23]">Who built this</p>
      <p className="serif mt-3 text-[28px] leading-snug md:text-[32px]">Built by Ashley Hodges, a high school English teacher on Florida's Treasure Coast and the founder of {brand.organization}.</p>
      <p className="mt-4 text-[16px] leading-7 text-[#4A4438]">Every case is built from texts teachers already assign, and every clue is tied to a passage in the original story.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={onStart} className="case-primary">Try a case now <ArrowRight size={18}/></button><button onClick={onApproach} className="case-secondary">Read our approach</button></div>
    </div></section>

    <footer className="flex flex-wrap justify-between gap-4 border-t border-[#E4DCCB] px-5 py-7 text-[13px] text-[#6B6457] md:px-14"><span>{brand.organization} · {brand.principle}.</span><div className="flex flex-wrap gap-5"><button onClick={onApproach}>Our approach</button><button onClick={onPricing}>Pricing</button><button onClick={onWaitlist}>Join the waitlist</button></div></footer>
  </div>;
}
