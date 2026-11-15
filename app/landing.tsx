"use client";
// Public home page: a reading escape room for grades 6 to 12. One primary button per audience ("Try a room" for
// students, "Teacher sign in" for adults) and the class-code link. The hero shows the poster with the escape moment on a
// phone beside it (app/escape-peek.tsx); then three moments of play (real screens, whole, never cropped mid-word), how a
// case works in three steps, who it's for, and the stories. The home page always uses the mature look, whatever this
// device's Look setting, and puts the setting back on the way out.
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { EscapePeek } from "./escape-peek";
import { Wordmark } from "./wordmark";

export function Landing({ brand, onStart, onPreset, onJoin, onWaitlist, onPricing, onLessons, onClassroom, onApproach, onFeedback }: any) {
  useEffect(() => { const root = document.documentElement, before = root.dataset.look; root.dataset.look = "mature"; return () => { if (before) root.dataset.look = before; else delete root.dataset.look; }; }, []);
  // Sleepy Hollow is open; the other two stories are on the way.
  const stories: [string, string, string, boolean][] = [["The Legend of Sleepy Hollow", "Washington Irving", "14 rooms", true], ["The Tell-Tale Heart", "Edgar Allan Poe", "", false], ["Trifles", "Susan Glaspell", "", false]];
  // The three moments of play: whole screens from the game (public/home), framed alike so they read on a laptop.
  const moments: [string, string, string][] = [
    ["/home/moment-map.jpg", "The map of rooms", "Each room is a place in the story. The next one is lit."],
    ["/home/moment-puzzle.jpg", "A puzzle lock", "Fix the Painting: spot what the painter got wrong, and prove it with a line."],
    ["/home/moment-exit.jpg", "The exit door", "Name the liar and tap the sentence that proves it to escape."],
  ];
  const steps: [string, string][] = [["Enter a room on the map", "Each room is a place in the story, with witnesses waiting inside."], ["Open each lock with a line from the text", "No line, no key: every answer is proven with a sentence from the story."], ["Name the liar to escape", "One witness lied. Name them and tap the line that proves it."]];
  const audiences: [string, string, string, () => void][] = [
    ["Students", "Close reading that feels like an escape room.", "Try a room", onStart],
    ["Teachers", "One class link, and every student's proof in one view.", "Teacher sign in", onClassroom],
    ["Families", "Each chamber takes about 20 minutes, on any device. No account needed.", "Try a room", onStart],
    ["Schools and districts", "AI literacy inside ELA, with an admin view.", "See plans", onPricing],
  ];
  const sec = "px-4 py-10 md:px-14 md:py-14", eyebrow = "text-[13px] font-extrabold uppercase tracking-[.08em] text-highlight", h2 = "mt-2 text-[28px] leading-tight md:text-[34px]";
  const tile = "flex flex-col gap-2 rounded-card bg-panel p-4", link = "inline-flex min-h-11 items-center gap-1 self-start text-[15px] font-bold text-highlight";
  return <div className="case-ui home-page">
    <nav className="flex h-[70px] items-center justify-between px-4 md:px-14"><a className="text-2xl no-underline" href="#top"><Wordmark byline/></a><div className="hidden items-center gap-7 text-[14px] font-medium text-muted lg:flex"><a href="#how" className="hover:text-highlight">How it works</a><a href="#who" className="hover:text-highlight">Who it's for</a><button onClick={onLessons} className="hover:text-highlight">Mini lessons</button><button onClick={onPricing} className="hover:text-highlight">Pricing</button><button onClick={onClassroom} className="hover:text-highlight">Teacher sign in</button></div><div className="flex items-center gap-2"><button type="button" onClick={onFeedback} className="min-h-11 whitespace-nowrap rounded-full px-2 text-[14px] font-semibold text-highlight underline-offset-4 hover:underline sm:px-3">Give feedback</button><button className="case-primary !min-h-11 whitespace-nowrap !px-4 !text-[15px] sm:!px-5" onClick={onStart}>Try a room <ArrowRight size={16}/></button></div></nav>

    <section id="top" className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-4 md:grid-cols-[1.05fr_1fr] md:gap-10 md:px-14 md:pb-14 md:pt-8">
      <div>
        <p className={eyebrow}>For English classrooms</p>
        <h1 className="mt-3 text-[44px] leading-[1.02] md:text-[62px]">Step into the story.</h1>
        <p className="mt-4 max-w-[520px] text-[19px] leading-7 text-muted">A reading escape room for grades 6 to 12. Every lock opens with a line from the text.</p>
        <div className="mt-6 grid gap-3 sm:max-w-[520px] sm:grid-cols-2">
          <div><p className="mb-1.5 text-[13px] font-extrabold uppercase tracking-[.08em] text-muted">Students</p><button onClick={onStart} className="case-primary w-full justify-center">Try a room <ArrowRight size={18}/></button></div>
          <div><p className="mb-1.5 text-[13px] font-extrabold uppercase tracking-[.08em] text-muted">Teachers and adults</p><button onClick={onClassroom} className="case-secondary w-full justify-center">Teacher sign in <ArrowRight size={18}/></button></div>
        </div>
        <p className="mt-3 text-[14px] text-muted">No account needed. <button onClick={onJoin} className="font-semibold text-highlight underline underline-offset-4">Have a class code? Join here.</button></p>
      </div>
      {/* The poster, whole (it carries its own title and gear), with the escape moment on a phone beside it: side by side on a
          phone, overlapping the poster's lower edge (never its title) on a laptop. */}
      <div className="flex items-end justify-center gap-0">
        <img src="/home/poster-escape-640.webp" alt="Poster: Escape the story. Every lock opens with a line from the text. Three young investigators study an open book by a moonlit country road, with a church and an old wooden bridge behind them." width={640} height={1147} className="w-[164px] rounded-card border border-edge shadow-[0_14px_36px_rgba(0,0,0,.45)] sm:w-[230px] md:w-[290px]"/>
        <EscapePeek className="ml-3 md:-ml-8 md:mb-10"/>
      </div>
    </section>

    <section aria-labelledby="play-h" className={sec}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>Escape rooms</p>
      <h2 id="play-h" className={h2}>Three moments of play</h2>
      <ul className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">{moments.map(([img, t, line]) => <li key={t} className="w-[86%] shrink-0 snap-center md:w-auto">
        <figure className="flex flex-col gap-2"><img src={img} alt={`${t}: ${line}`} loading="lazy" width={1200} height={900} className="aspect-[4/3] w-full rounded-card border border-edge object-contain"/>
         <figcaption><span className="block font-display text-[19px] font-semibold">{t}</span><span className="text-[15px] leading-snug text-muted">{line}</span></figcaption></figure></li>)}</ul>
      <button type="button" onClick={onStart} className="case-primary mt-5">Try a room <ArrowRight size={18}/></button>
    </div></section>

    <section id="how" aria-labelledby="how-h" className={`bg-panel-2 ${sec}`}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>How a case works</p>
      <h2 id="how-h" className={h2}>AI can summarize any book. Text Lab makes students prove what's true.</h2>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">{steps.map(([t, d], i) => <li key={t} className={tile}><span className="grid h-9 w-9 place-items-center rounded-row bg-primary font-display text-[17px] font-semibold text-on-primary">{i + 1}</span><h3 className="text-[19px] leading-tight">{t}</h3><p className="text-[15px] leading-snug text-muted">{d}</p></li>)}</ol>
    </div></section>

    <section id="who" aria-labelledby="who-h" className={sec}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>Who it's for</p>
      <h2 id="who-h" className={h2}>Built for the classroom, from the classroom.</h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{audiences.map(([t, line, cta, go]) => <li key={t} className={tile}><h3 className="text-[18px] leading-tight md:text-[20px]">{t}</h3><p className="flex-1 text-[14px] leading-snug text-muted md:text-[15px]">{line}</p><button type="button" onClick={go} className={link}>{cta}<span className="sr-only">: {t}</span> <ArrowRight size={16} aria-hidden/></button></li>)}</ul>
      <p className="mt-3 text-[14px] text-muted">Aligned to Florida B.E.S.T. ELA. <button onClick={() => onPreset("teacher_end_unit")} className="font-semibold text-highlight underline underline-offset-4">Open a sample class report.</button></p>
    </div></section>

    <section aria-labelledby="stories-h" className={`bg-panel-2 ${sec}`}><div className="mx-auto max-w-7xl">
      <p className={eyebrow}>Ready now</p>
      <h2 id="stories-h" className={h2}>Sleepy Hollow is open now. Two more stories are on the way.</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">{stories.map(([t, a, n, open]) => <li key={t}>{open
        ? <button onClick={onStart} className="flex w-full items-center justify-between gap-3 rounded-card bg-panel px-4 py-3 text-left"><span><span className="block font-display text-[18px] font-semibold">{t}</span><span className="text-[14px] text-muted">{a} · {n}</span></span><span className="shrink-0 rounded-full bg-success px-3 py-1 text-[12px] font-extrabold text-on-success">Open now</span></button>
        : <div className="flex w-full items-center justify-between gap-3 rounded-card bg-panel px-4 py-3"><span><span className="block font-display text-[18px] font-semibold">{t}</span><span className="text-[14px] text-muted">{a}</span></span><span className="shrink-0 rounded-full border border-edge px-3 py-1 text-[12px] font-extrabold text-muted">On the way</span></div>}</li>)}</ul>
    </div></section>

    <section aria-labelledby="built-h" className={sec}><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
      <div><p className={eyebrow}>Who built this</p><h2 id="built-h" className="mt-2 text-[22px] leading-snug md:text-[26px]">Built by Ashley Hodges, a high school English teacher on Florida's Treasure Coast and the founder of {brand.organization}.</h2></div>
      <div className="flex flex-wrap gap-3 md:justify-end"><button onClick={onStart} className="case-primary">Try a room <ArrowRight size={18}/></button><button onClick={onApproach} className="case-secondary">Read our approach</button></div>
    </div></section>

    <footer className="flex flex-wrap justify-between gap-4 border-t border-edge px-4 py-6 text-[13px] text-muted md:px-14"><span>{brand.organization} · {brand.principle}.</span><div className="flex flex-wrap gap-5"><button onClick={onApproach}>Our approach</button><button onClick={onPricing}>Pricing</button><button onClick={onWaitlist}>Join the waitlist</button><button onClick={onFeedback}>Give feedback</button></div></footer>
  </div>;
}
