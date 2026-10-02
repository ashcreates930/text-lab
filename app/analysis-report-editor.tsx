"use client";
import type { Demo } from "./page";
import type { AnalysisReport } from "@/lib/analysis-report";

type EditableField = "centralJudgment" | "development" | "evidenceUsed" | "techniques" | "strength" | "nextStep" | "authorship";
const editableFields: [EditableField, string][] = [
  ["centralJudgment", "Central judgment"],
  ["development", "How the judgment developed"],
  ["evidenceUsed", "Evidence used"],
  ["techniques", "Narrative techniques"],
  ["strength", "Strength"],
  ["nextStep", "Next step"],
  ["authorship", "Authorship summary"],
];

export function AnalysisReportEditor({ demo, setDemo }: { demo: Demo; setDemo: React.Dispatch<React.SetStateAction<Demo>> }) {
  const report = demo.analysisReport;
  if (!report) return <div className="panel p-5"><p className="eyebrow">ANALYSIS REPORT</p><p className="mt-2 text-sm text-white/50">Save a narrative to create a teacher report for this student.</p></div>;
  function update(patch: Partial<AnalysisReport>) { setDemo((current) => current.analysisReport ? { ...current, analysisReport: { ...current.analysisReport, ...patch } } : current); }
  return <section className="panel p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">ANALYSIS REPORT · {demo.role.toUpperCase()}</p><h2 className="serif mt-2 text-2xl">Teacher review</h2></div><span className="border border-[#dfb675]/35 px-3 py-2 text-[10px] leading-4 text-[#e4c58f]">{report.generatedByAi ? "AI-generated summary of this student’s work. Review before using." : "AI report unavailable. This is an editable local summary."}</span></div>
    <div className="mt-5 space-y-4">{editableFields.map(([field,label])=><label key={field} className="block"><span className="eyebrow">{label}</span><textarea value={String(report[field] ?? "")} onChange={(event)=>update({[field]:event.target.value})} rows={field==="development"||field==="evidenceUsed"||field==="techniques"?3:2} className="mt-1 w-full border border-white/15 bg-[#171918] p-3 text-sm leading-6"/></label>)}</div>
    <div className="mt-5 border-t border-white/10 pt-4"><p className="eyebrow">SUGGESTED MASTERY LEVELS</p><p className="mt-1 text-xs text-white/45">Suggestions only. Review the evidence and choose a level.</p><div className="mt-3 grid gap-3 md:grid-cols-3">{report.skills.map((skill,index)=><div key={`${skill.skill}-${index}`} className="border border-white/10 p-3"><p className="serif">{skill.skill}</p><p className="mt-2 text-xs text-[#dfb675]">{skill.suggestedLevel}</p><p className="mt-1 text-xs leading-5 text-white/45">{skill.rationale}</p><label className="mt-3 block text-[10px] text-white/45">Teacher level<select value={skill.teacherLevel || ""} onChange={(event)=>update({skills:report.skills.map((item,i)=>i===index?{...item,teacherLevel:event.target.value}:item)})} className="mt-1 block w-full border border-white/15 bg-[#171918] p-2 text-xs"><option value="">Not selected</option>{["Explorer","Practitioner","Leader","Review again"].map((level)=><option key={level}>{level}</option>)}</select></label><button type="button" onClick={()=>update({skills:report.skills.map((item,i)=>i===index?{...item,teacherLevel:item.suggestedLevel.replace(/^Suggested:\s*/i,"")}:item)})} className="mt-2 text-[10px] text-[#dfb675] underline">Accept suggestion</button></div>)}</div></div>
    <div className="mt-5 border-t border-white/10 pt-4"><p className="eyebrow">SHARE WITH STUDENT</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{editableFields.map(([field,label])=><label key={field} className="flex items-center gap-2 text-xs text-white/55"><input type="checkbox" checked={!!report.shares[field]} onChange={(event)=>update({shares:{...report.shares,[field]:event.target.checked}})}/>{label}</label>)}<label className="flex items-center gap-2 text-xs text-white/55"><input type="checkbox" checked={!!report.shares.skills} onChange={(event)=>update({shares:{...report.shares,skills:event.target.checked}})}/>Suggested Mastery levels</label></div></div>
    <p className="mt-4 text-[10px] text-white/40">This report does not assign a final score. Teacher edits are saved in the student sandbox.</p>
  </section>;
}
