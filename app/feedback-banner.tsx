"use client";
import {useEffect,useState} from "react";
import {X} from "lucide-react";

const DISMISSED_KEY="itt-feedback-banner-dismissed";
// Dismissal lasts for this browser tab; the banner returns in a new tab so testers can still find the link.
export function FeedbackBanner({url}:{url:string|null}){
 const [dismissed,setDismissed]=useState(true);
 useEffect(()=>{try{setDismissed(sessionStorage.getItem(DISMISSED_KEY)==="1")}catch{setDismissed(false)}},[]);
 if(!url||dismissed)return null;
 function dismiss(){setDismissed(true);try{sessionStorage.setItem(DISMISSED_KEY,"1")}catch{}}
 return <div role="region" aria-label="Preview feedback" className="flex items-center justify-between gap-3 border-b border-[#dfb675]/25 bg-[#dfb675]/[.08] px-5 py-2 text-xs text-[#eee9df] md:px-10">
  <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 underline-offset-4 hover:underline">You're testing an early preview. Tell us what you <span className="whitespace-nowrap">think →</span></a>
  <button type="button" onClick={dismiss} aria-label="Dismiss feedback banner" className="shrink-0 rounded-full p-1.5 text-white/55 hover:text-white"><X size={14}/></button>
 </div>;
}
