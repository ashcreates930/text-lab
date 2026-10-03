"use client";
import {ArrowRight, BookOpen, Check, Languages, LineChart, MessagesSquare, ScrollText, ShieldCheck, Users} from "lucide-react";
import {brand} from "@/config/brand";

// "Our Approach" page. Public (no access code), so families, school leaders, and investors can read it before they try the demo.
// Statistics are cited in the Sources list at the bottom; update both together.

const stats=[
 {figure:"33%",label:"of U.S. eighth graders scored below NAEP Basic in reading in 2024, the largest share in the assessment’s history.",source:1},
 {figure:"30%",label:"of eighth graders reached NAEP Proficient in reading. Seven in ten did not.",source:1},
 {figure:"More than half",label:"of U.S. teens now use AI chatbots for help with schoolwork.",source:2},
];

const journey=[
 ["01","Prepare","A short mini lesson teaches the skill first: characterization, plot, point of view, theme, or text evidence."],
 ["02","Enter the text","Students take a role inside a classic story: an investigator, a reporter, a neighbor. The reading now has a purpose."],
 ["03","Investigate","The Case File turns clues into questions. Students notice a detail, interpret what it proves, and study how the author built it."],
 ["04","Question the voice","Students can talk with AI versions of the characters. Those voices can be wrong, so students check every answer against the story’s own words."],
 ["05","Write and talk","Students build their own account from evidence they chose, then defend it out loud in a timed Stop and Chat."],
] as const;

const fourDs=[
 ["Delegation","Deciding what to ask AI and what to work out yourself."],
 ["Description","Asking a clear, specific question."],
 ["Discernment","Checking what AI says against a trusted source."],
 ["Diligence","Owning the final work in your own words."],
] as const;

const outcomes=[
 "Read closely and cite exact evidence from the text.",
 "Separate a claim from the proof behind it.",
 "Question an AI answer instead of copying it.",
 "Write an original argument in their own voice.",
 "Share and defend ideas out loud with classmates.",
];

const audiences=[
 {icon:BookOpen,title:"Classroom teachers",body:"Ready-to-teach texts aligned to Florida B.E.S.T., AP, and Cambridge AICE, with mini lessons you can assign and a whole-class live analysis you can run from the front of the room."},
 {icon:Users,title:"Schools and districts",body:"Fluency checks that complement FAST progress monitoring, standards-tagged student work, and analysis reports teachers can share with leaders and families."},
 {icon:ScrollText,title:"Homeschool and microschool families",body:"A complete literature experience a parent or guide can lead without an English degree: the lesson, the reading, the questions, and the writing in one place."},
];

const access=[
 {icon:LineChart,title:"Intensive readers",body:"Students record a one-minute reading. The app scores words correct per minute against national norms, and the recording is discarded once it is scored."},
 {icon:Languages,title:"Multilingual learners",body:"Directions, questions, scene summaries, and vocabulary in Spanish, Haitian Creole, Portuguese, and Vietnamese, with English kept on screen beside them."},
 {icon:MessagesSquare,title:"Every learner in the room",body:"Adjustable text size, high contrast, reduced motion, read-aloud narration, and step-by-step screens built so no student gets lost between tasks."},
];

const durable=[
 ["Built in a real classroom","Designed and tested by a practicing English teacher and Instructional Lead with ten years in middle and high school classrooms."],
 ["Content that scales","Each text is a self-contained story pack. New titles, courses, and languages are added as content, not new software."],
 ["Evidence schools ask for","Fluency scores, standards alignment, and saved answer revisions give leaders proof of learning, not only usage."],
 ["Privacy by design","Students join with a class code and no personal account. Reading recordings are never stored, and student data stays behind the server."],
 ["A clear path to revenue","A free entry plan, individual teacher subscriptions, and school and district licenses, with professional development as a natural add-on."],
 ["A growing library","Classics across grades 6 to 12, with Frankenstein, Macbeth, A Doll’s House, and more in production."],
] as const;

const sources=[
 ["National Assessment Governing Board, “The Nation’s Report Card Shows Declines in Reading” (2024 NAEP results, released January 2025)","https://www.nagb.gov/news-and-events/news-releases/2025/nations-report-card-decline-in-reading-progress-in-math.html"],
 ["Pew Research Center, “How Teens Use and View AI” (February 2026)","https://www.pewresearch.org/internet/2026/02/24/how-teens-use-and-view-ai/"],
] as const;

export function Approach({onDemo,onPricing,onWaitlist,onLessons}:{onDemo:()=>void;onPricing:()=>void;onWaitlist:()=>void;onLessons:()=>void}){
 return <article className="pb-6">
  <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 md:px-14 md:py-24">
   <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{backgroundImage:"radial-gradient(ellipse at 80% 30%, #8a5b2f 0%, transparent 40%),linear-gradient(115deg,#171918 20%,#22201d 60%,#171918 100%)"}}/>
   <div className="relative mx-auto max-w-5xl">
    <p className="eyebrow">OUR APPROACH · WHY WE BUILT THIS</p>
    <h1 className="serif mt-5 max-w-4xl text-4xl leading-[1.1] tracking-[-.02em] md:text-6xl">Students don’t need AI to read for them. <span className="italic text-[#dfb675]">They need a reason to read closer.</span></h1>
    <p className="mt-6 max-w-2xl text-base leading-7 text-[#c4c1b8]">{brand.name} puts students inside the stories they study. They investigate, question the characters, test every claim against the text, and write what they can prove. AI is part of the experience, and the text is always the authority.</p>
    <div className="mt-8 flex flex-wrap gap-3"><button onClick={onDemo} className="gold-button rounded-sm px-6 py-4 text-xs tracking-wider">TRY THE DEMO <ArrowRight className="ml-2 inline" size={14}/></button><button onClick={onPricing} className="soft-button rounded-sm px-6 py-4 text-xs tracking-wider">SEE PLANS</button></div>
   </div>
  </section>

  <section className="mx-auto max-w-5xl px-5 py-16 md:px-10" aria-labelledby="why-heading">
   <p className="eyebrow">THE PROBLEM</p>
   <h2 id="why-heading" className="serif mt-4 text-3xl md:text-4xl">Reading is slipping, and AI arrived anyway.</h2>
   <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Students are reading less closely than at any point in a generation, and the same students now carry a tool that will summarize, interpret, and write for them in seconds. Banning that tool has not worked. Ignoring it leaves students without the judgment to use it well.</p>
   <div className="mt-10 grid gap-4 md:grid-cols-3">{stats.map(s=><div key={s.figure} className="panel p-6"><p className="serif text-4xl text-[#dfb675]">{s.figure}</p><p className="mt-3 text-sm leading-6 text-white/70">{s.label}<sup className="ml-0.5 text-[10px] text-white/45">{s.source}</sup></p></div>)}</div>
  </section>

  <section className="border-y border-white/10 bg-[#1c1e1d] px-5 py-16 md:px-10" aria-labelledby="founder-heading">
   <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[.9fr_1.1fr]">
    <div><p className="eyebrow">FROM THE FOUNDER</p><h2 id="founder-heading" className="serif mt-4 text-3xl md:text-4xl">Built by a teacher, for the room it serves.</h2></div>
    <div className="space-y-4 text-sm leading-7 text-white/70">
     <p>I teach high school English. Every year I watch students who can decode every word on a page still miss what the page is saying, and now I watch them reach for AI to fill that gap.</p>
     <p>I didn’t want to fight the tool. I wanted to teach students to question it. {brand.name} grew from one belief I teach by: <span className="text-[#dfb675]">{brand.principle}.</span> Students use AI the way a good investigator uses a witness, as a voice worth hearing and never the final word.</p>
     <p>Every feature here started as a problem in my own classroom: the intensive reader who needs evidence of growth, the multilingual learner who understands more than they can yet say in English, the quiet student who has a strong idea and needs a structured moment to share it.</p>
     <p className="pt-2 text-white/85">Ashley Hodges<span className="block text-xs text-white/45">Founder, {brand.organization} · English Teacher and Instructional Lead</span></p>
    </div>
   </div>
  </section>

  <section className="mx-auto max-w-5xl px-5 py-16 md:px-10" aria-labelledby="how-heading">
   <p className="eyebrow">HOW IT WORKS</p>
   <h2 id="how-heading" className="serif mt-4 text-3xl md:text-4xl">One lesson, five moves.</h2>
   <ol className="mt-10 grid gap-4 md:grid-cols-5">{journey.map(([n,t,b])=><li key={n} className="panel p-5"><p className="eyebrow">{n}</p><h3 className="serif mt-3 text-xl">{t}</h3><p className="mt-3 text-xs leading-5 text-white/60">{b}</p></li>)}</ol>
   <button onClick={onLessons} className="mt-6 text-xs text-[#dfb675] underline-offset-4 hover:underline">Browse the mini lessons <ArrowRight className="inline" size={12}/></button>
  </section>

  <section className="mx-auto max-w-5xl px-5 pb-16 md:px-10" aria-labelledby="ds-heading">
   <div className="panel grid gap-8 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
    <div><p className="eyebrow">AI LITERACY, BUILT IN</p><h2 id="ds-heading" className="serif mt-4 text-3xl">The Four D’s</h2><p className="mt-4 text-sm leading-6 text-white/60">Every story practices four habits students will need long after English class. The app tracks each one as students earn it, so teachers can see AI literacy grow alongside reading.</p></div>
    <dl className="grid gap-4 sm:grid-cols-2">{fourDs.map(([d,t])=><div key={d} className="border-l border-[#dfb675] pl-4"><dt className="serif text-xl">{d}</dt><dd className="mt-1 text-xs leading-5 text-white/60">{t}</dd></div>)}</dl>
   </div>
  </section>

  <section className="border-y border-white/10 bg-[#1c1e1d] px-5 py-16 md:px-10" aria-labelledby="goal-heading">
   <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
    <div><p className="eyebrow">THE GOAL FOR LEARNERS</p><h2 id="goal-heading" className="serif mt-4 text-3xl md:text-4xl">Readers who think for themselves, in a world full of answers.</h2><p className="mt-4 text-sm leading-7 text-white/65">We measure success by what students can do without us. Every learner who finishes a story should be able to:</p></div>
    <ul className="space-y-3 self-center">{outcomes.map(o=><li key={o} className="flex gap-3 text-sm leading-6 text-white/80"><Check className="mt-1 shrink-0 text-[#dfb675]" size={15}/>{o}</li>)}</ul>
   </div>
   <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">{access.map(a=><div key={a.title} className="panel p-6"><a.icon className="text-[#dfb675]" size={20}/><h3 className="serif mt-4 text-xl">{a.title}</h3><p className="mt-2 text-xs leading-5 text-white/60">{a.body}</p></div>)}</div>
  </section>

  <section className="mx-auto max-w-5xl px-5 py-16 md:px-10" aria-labelledby="who-heading">
   <p className="eyebrow">WHO IT SERVES</p>
   <h2 id="who-heading" className="serif mt-4 text-3xl md:text-4xl">Wherever reading is taught.</h2>
   <div className="mt-10 grid gap-4 md:grid-cols-3">{audiences.map(a=><div key={a.title} className="panel p-6"><a.icon className="text-[#dfb675]" size={20}/><h3 className="serif mt-4 text-xl">{a.title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{a.body}</p></div>)}</div>
  </section>

  <section className="mx-auto max-w-5xl px-5 pb-16 md:px-10" aria-labelledby="durable-heading">
   <p className="eyebrow">FOR PARTNERS AND INVESTORS</p>
   <h2 id="durable-heading" className="serif mt-4 text-3xl md:text-4xl">Built to last beyond a single classroom.</h2>
   <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">{durable.map(([t,b])=><div key={t} className="flex gap-4"><ShieldCheck className="mt-1 shrink-0 text-[#dfb675]" size={18}/><div><h3 className="text-sm font-semibold text-white/90">{t}</h3><p className="mt-1 text-sm leading-6 text-white/60">{b}</p></div></div>)}</div>
  </section>

  <section className="border-t border-white/10 px-5 py-16 md:px-10" aria-labelledby="cta-heading">
   <h2 id="cta-heading" className="sr-only">Get involved</h2>
   <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
    <div className="panel flex flex-col p-7"><p className="eyebrow">EDUCATORS AND FAMILIES</p><p className="serif mt-4 text-2xl">Bring {brand.name} to your learners.</p><p className="mt-3 flex-1 text-sm leading-6 text-white/60">Start free with one story and one class, then grow into the full library when you’re ready.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={onPricing} className="gold-button rounded-sm px-5 py-3 text-xs tracking-wider">SEE PLANS</button><button onClick={onWaitlist} className="soft-button rounded-sm px-5 py-3 text-xs tracking-wider">JOIN THE WAITLIST</button></div></div>
    <div className="panel flex flex-col p-7"><p className="eyebrow">PARTNERS AND INVESTORS</p><p className="serif mt-4 text-2xl">Help us reach more readers.</p><p className="mt-3 flex-1 text-sm leading-6 text-white/60">We’re building partnerships with districts, funders, and organizations that want AI literacy rooted in real reading. Leave your details and we’ll be in touch.</p><div className="mt-6"><button onClick={onWaitlist} className="soft-button rounded-sm px-5 py-3 text-xs tracking-wider">START A CONVERSATION <ArrowRight className="ml-1 inline" size={13}/></button></div></div>
   </div>
  </section>

  <footer className="mx-auto max-w-5xl px-5 pb-10 md:px-10"><p className="eyebrow">SOURCES</p><ol className="mt-3 space-y-1 text-[11px] leading-5 text-white/45">{sources.map(([t,u],i)=><li key={u}>{i+1}. <a href={u} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white/70">{t}</a></li>)}</ol><p className="mt-6 text-[10px] text-white/35">{brand.organization} · {brand.tagline} · {brand.principle}.</p></footer>
 </article>;
}
