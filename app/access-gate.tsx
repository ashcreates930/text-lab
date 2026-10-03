"use client";
import {useState} from "react";
import {ArrowRight} from "lucide-react";

export function AccessGate({brand,onGranted,onPricing,onWaitlist,onJoinClass,onApproach}:{brand:{name:string;organization:string};onApproach?:()=>void;onGranted:(feedbackUrl:string|null)=>void;onPricing:()=>void;onWaitlist:()=>void;onJoinClass:()=>void}){
 const [code,setCode]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();if(!code.trim()||busy)return;setBusy(true);setError("");try{const r=await fetch("/api/access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});if(r.ok){const body=await r.json().catch(()=>null);onGranted(body?.feedbackUrl??null);return}const body=await r.json().catch(()=>null);setError(body?.error||"That code didn't work. Check your invitation.")}catch{setError("We couldn't reach the server. Check your connection and try again.")}finally{setBusy(false)}}
 return <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
  <p className="eyebrow">EARLY PREVIEW</p>
  <h1 className="serif mt-3 text-4xl md:text-5xl">{brand.name}</h1>
  <p className="mt-1 text-xs text-white/45">by {brand.organization}</p>
  <p className="mt-3 text-sm leading-6 text-white/60">This preview is open to invited educators. Enter the access code from your invitation.</p>
  <form onSubmit={submit} className="panel mt-8 p-5" noValidate>
   <label htmlFor="demo-access-code" className="eyebrow">ACCESS CODE</label>
   <input id="demo-access-code" value={code} onChange={e=>{setCode(e.target.value);if(error)setError("")}} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={!!error} aria-describedby={error?"demo-access-error":undefined} className="mt-2 block w-full border border-white/15 bg-[#171918] px-3 py-3 text-base"/>
   {error&&<p id="demo-access-error" role="alert" className="mt-3 text-sm text-[#f0b9a0]">{error}</p>}
   <button type="submit" disabled={busy||!code.trim()} className="gold-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-4 text-xs tracking-wider disabled:opacity-60">{busy?"CHECKING…":"ENTER THE PREVIEW"}<ArrowRight size={13}/></button>
  </form>
  <p className="mt-6 text-xs text-white/50">Joining your class? <button type="button" onClick={onJoinClass} className="text-[#dfb675] underline-offset-4 hover:underline">Enter your class code</button>.</p>
  <p className="mt-2 text-xs text-white/50">No code? <button type="button" onClick={onWaitlist} className="text-[#dfb675] underline-offset-4 hover:underline">Join the waitlist</button> or <button type="button" onClick={onPricing} className="text-[#dfb675] underline-offset-4 hover:underline">see pricing</button>.</p>
  {onApproach&&<p className="mt-2 text-xs text-white/50">New here? <button type="button" onClick={onApproach} className="text-[#dfb675] underline-offset-4 hover:underline">Read why we built {brand.name}</button>.</p>}
 </section>;
}
