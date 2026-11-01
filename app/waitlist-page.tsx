"use client";
// The waitlist page opens the same feedback and waitlist form used everywhere else.
import {useEffect} from "react";
import {ArrowRight} from "lucide-react";

export function WaitlistPage({onOpen,onPricing}:{onOpen:()=>void;onPricing:()=>void}){
 useEffect(()=>{onOpen()},[]); // eslint-disable-line react-hooks/exhaustive-deps
 return <section className="case-ui mx-auto max-w-2xl px-5 py-16 text-center">
  <p className="text-[14px] font-semibold uppercase tracking-wide text-highlight">Waitlist</p>
  <h1 className="mt-2 text-[34px] font-bold leading-tight">Be first when TextLab opens.</h1>
  <p className="mt-3 text-[17px] leading-7 text-muted">Tell us which plan fits and we'll keep you posted. No payment now.</p>
  <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={onOpen} className="case-primary">Join the waitlist <ArrowRight size={18}/></button><button type="button" onClick={onPricing} className="case-secondary">See plans and prices</button></div>
 </section>;
}
