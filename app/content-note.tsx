"use client";
// The labeled card shown directly before a flagged paragraph (rules in lib/content-notes.ts). A calm, readable panel,
// never styled as a game moment; inside the reading card it reads dark on cream. The same card, labeled "Discussion
// note", sits with a question that carries a note (lib/world-schema.ts).
export function ContentNote({text,active=false,className="",label="Content note"}:{text:string;active?:boolean;className?:string;label?:string}){
 return <aside role="note" aria-label={label} className={`rounded-row border-2 px-4 py-3 font-sans ${active?"border-highlight":"border-edge"} bg-panel-2 ${className}`}>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-muted">{label}</p>
  <p className="mt-1 text-[15px] font-bold leading-6 text-ink">{text}</p>
 </aside>;
}
