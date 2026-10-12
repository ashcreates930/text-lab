"use client";
import {useEffect,useState} from "react";
import {X} from "lucide-react";

const DISMISSED_KEY="itt-feedback-banner-dismissed";
// Dismissal lasts for this browser tab; the banner returns in a new tab so testers can still find it.
// It opens the in-app feedback and waitlist form.
export function FeedbackBanner({onOpen}:{onOpen:()=>void}){
 const [dismissed,setDismissed]=useState(true);
 useEffect(()=>{try{setDismissed(sessionStorage.getItem(DISMISSED_KEY)==="1")}catch{setDismissed(false)}},[]);
 if(dismissed)return null;
 function dismiss(){setDismissed(true);try{sessionStorage.setItem(DISMISSED_KEY,"1")}catch{}}
 return <div role="region" aria-label="Preview feedback" className="flex items-center justify-between gap-3 border-b border-[#A0472C]/25 bg-[#A0472C]/[.08] px-5 py-2 text-xs text-[#2A2620] md:px-10">
  <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left underline-offset-4 hover:underline">You're testing an early preview. Tell us what you <span className="whitespace-nowrap">think →</span></button>
  <button type="button" onClick={dismiss} aria-label="Dismiss feedback banner" className="shrink-0 rounded-full p-1.5 text-[#6B6457] hover:text-[#2A2620]"><X size={14}/></button>
 </div>;
}
