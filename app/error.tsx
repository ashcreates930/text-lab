"use client";
import {useEffect,useRef} from "react";
import {Wordmark} from "./wordmark";
// The error page in the game look: a calm panel and one way back.
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){
 const h=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{window.scrollTo(0,0);h.current?.focus()},[]);
 return <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-4 py-10">
  <Wordmark className="text-[28px]" byline/>
  <div role="alert" className="w-full rounded-card border-2 border-edge bg-panel-2 p-5">
   <h1 ref={h} tabIndex={-1} className="text-[30px] leading-tight outline-none">Something went wrong</h1>
   <p className="mt-2 text-[17px] text-muted">Try again, or go back to the home page.</p>
   <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={reset} className="btn btn-primary">Try again</button><a href="/" className="btn btn-secondary">Go to the home page</a></div>
  </div>
 </main>;
}
