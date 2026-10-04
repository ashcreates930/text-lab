"use client";
import type {WorldPack} from "@/lib/world-schema";
import {courseLabels,frameworks,resolveBenchmark} from "@/lib/standards";

// Shows which Florida B.E.S.T. benchmarks a story targets at the student's grade, and which AP and Cambridge skills
// the same tasks build. Course tags mean the tasks fit that course's skills, not that the text is a set text.
export function StandardsPanel({world,grade}:{world:WorldPack;grade:number}){
 const codes=world.benchmarks.filter(b=>b.code.startsWith("ELA.K12.")||b.code.startsWith(`ELA.${grade}.`));
 const fallback=[...new Set(world.scenes.flatMap(s=>s.artifacts.flatMap(a=>a.questions.map(q=>q.benchmark.code))))].map(c=>resolveBenchmark(c,grade)).filter(Boolean) as {code:string;description:string}[];
 const best=codes.length?codes:fallback;
 const others=(world.courses??[]).filter(c=>c!=="best_ela") as Exclude<NonNullable<WorldPack["courses"]>[number],"best_ela">[];
 return <details className="mt-7 border border-white/15 p-4"><summary className="cursor-pointer text-sm text-[#A0472C]">For teachers: standards and course alignment</summary>
  <p className="mt-3 text-xs uppercase tracking-wide text-white/60">Florida B.E.S.T. · Grade {grade}</p>
  <ul className="mt-2 space-y-2">{best.map(b=><li key={b.code} className="text-sm leading-6"><span className="font-mono text-[#8A3B23]">{b.code}</span> · {b.description}</li>)}</ul>
  {others.length>0&&<><p className="mt-5 text-xs uppercase tracking-wide text-white/60">Also builds skills for</p><div className="mt-2 grid gap-3 md:grid-cols-2">{others.map(c=><div key={c} className="border border-white/10 p-3"><p className="text-sm font-bold">{courseLabels[c].long}</p><p className="mt-1 text-xs text-white/65">{frameworks[c].name}: {frameworks[c].items.join(" · ")}</p></div>)}</div></>}
 </details>;
}
