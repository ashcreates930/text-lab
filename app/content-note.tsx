"use client";
// The labeled card shown directly before a flagged paragraph (rules in lib/content-notes.ts). A calm, readable panel,
// never styled as a game moment; inside the reading card it reads dark on cream.
export function ContentNote({text,active=false,className=""}:{text:string;active?:boolean;className?:string}){
 return <aside role="note" aria-label="Content note" className={`rounded-row border-2 px-4 py-3 font-sans ${active?"border-highlight":"border-edge"} bg-panel-2 ${className}`}>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-muted">Content note</p>
  <p className="mt-1 text-[15px] font-bold leading-6 text-ink">{text}</p>
 </aside>;
}
