"use client";
// The labeled card shown directly before a flagged paragraph (rules in lib/content-notes.ts).
export function ContentNote({text,active=false,className=""}:{text:string;active?:boolean;className?:string}){
 return <aside role="note" aria-label="Content note" className={`rounded-2xl border-l-4 border-[#A0472C] px-4 py-3 font-sans transition-colors motion-reduce:transition-none ${active?"bg-[#F3E2D6]":"bg-[#F4E1D6]/60"} ${className}`}>
  <p className="text-[12px] font-bold uppercase tracking-wide text-[#8A3B23]">Content note</p>
  <p className="mt-1 text-[15px] leading-6 text-[#2A2620]">{text}</p>
 </aside>;
}
