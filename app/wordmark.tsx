import {brand} from "@/config/brand";
// The Text Lab wordmark: "Text" in white and "Lab" in lantern orange, Fredoka 700, with "by AmplifiED" small in muted text.
export function Wordmark({className="",byline=false}:{className?:string;byline?:boolean}){
 return <span className={`inline-flex flex-col items-start leading-none ${className}`}>
  <span aria-label="Text Lab" className="font-display font-bold tracking-[-.01em] text-ink">Text<span className="text-primary">Lab</span></span>
  {byline&&<span className="mt-0.5 font-sans text-[12px] font-bold text-muted">by {brand.organization}</span>}
 </span>;
}
