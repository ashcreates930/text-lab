"use client";
// One in-app form for feedback and the waitlist. Step 1 is optional feedback; Step 2 joins the waitlist with
// pricing questions. Opened from the feedback banner, the reader's top bar, the pricing page, and the waitlist page.
import {useEffect,useId,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Star,X} from "lucide-react";
import {planById,plans,type PlanId} from "@/config/pricing";
import {heardChoices,heardFromRef,FeedbackSchema,WaitlistSchema,approvalPlans,deviceChoices,intentChoices,oneScreenChoices,payerChoices,roleChoices,sideChoices,startChoices,states,wouldUseChoices,yesMaybeNo,approverChoices,SOURCE_RE} from "@/lib/feedback";

export type FormOpen={step:1|2;plan?:PlanId;join:boolean}|null;
const REF_KEY="textlab-ref";
// The ?ref= value from the link, kept for this visit.
export function rememberRef(){try{const ref=new URLSearchParams(window.location.search).get("ref")?.toLowerCase();if(ref&&SOURCE_RE.test(ref))sessionStorage.setItem(REF_KEY,ref)}catch{}}
const currentRef=()=>{try{const r=sessionStorage.getItem(REF_KEY);return r&&SOURCE_RE.test(r)?r:undefined}catch{return undefined}};

type Choice=readonly (readonly [string,string])[];
function Choices({legend,options,value,onChange,required,error}:{legend:string;options:Choice;value:string|undefined;onChange:(v:string)=>void;required?:boolean;error?:string}){
 const name=useId();
 return <fieldset aria-describedby={error?`${name}-err`:undefined}><legend className="text-[16px] font-semibold">{legend}{required&&<span className="text-highlight"> (required)</span>}</legend>
  <div className="mt-2 flex flex-wrap gap-2">{options.map(([v,l])=><label key={v} className={`cursor-pointer rounded-2xl px-4 py-2.5 text-[15px] font-semibold focus-within:ring-2 focus-within:ring-primary ${value===v?"bg-deep text-ink":"bg-panel-2 text-ink hover:bg-panel-2"}`}><input type="radio" className="sr-only" name={name} value={v} checked={value===v} onChange={()=>onChange(v)}/>{l}</label>)}</div>
  {error&&<p id={`${name}-err`} className="mt-1 text-[14px] text-highlight">{error}</p>}
 </fieldset>;
}
function Field({label,error,children,hint}:{label:string;error?:string;hint?:string;children:(id:string,describedBy:string|undefined)=>React.ReactNode}){
 const id=useId();const d=error?`${id}-err`:hint?`${id}-hint`:undefined;
 return <div><label htmlFor={id} className="text-[16px] font-semibold">{label}</label>{hint&&<p id={`${id}-hint`} className="text-[14px] text-muted">{hint}</p>}<div className="mt-1">{children(id,d)}</div>{error&&<p id={`${id}-err`} className="mt-1 text-[14px] text-highlight">{error}</p>}</div>;
}
const inputCls="w-full rounded-2xl border border-edge bg-panel px-4 py-3 text-[16px] outline-none focus:border-primary";

export function FeedbackForm({open,onClose}:{open:NonNullable<FormOpen>;onClose:()=>void}){
 const [step,setStep]=useState<1|2>(open.step);
 const [fb,setFb]=useState<{side?:string;ease?:number;oneScreen?:string;wouldUse?:string;change:string;broken:string;device?:string}>({change:"",broken:""});
 const [join,setJoin]=useState(open.join);
 // How did you hear about Text Lab? Required; an old ?ref= link preselects the matching answer.
 const [heard,setHeard]=useState<string|undefined>(()=>heardFromRef(currentRef()));
 const [w,setW]=useState<{plan:PlanId;intent?:string;priceNamed:string;pricePeriod?:string;start?:string;payer?:string;approver?:string;loi?:string;pilotCommit?:string;students:string;lockFoundingPrice:boolean;name:string;email:string;role?:string;organization:string;state?:string;wantsUpdates:boolean}>({plan:open.plan??"individual",priceNamed:"",students:"",lockFoundingPrice:false,name:"",email:"",organization:"",wantsUpdates:false});
 const [honeypot,setHoneypot]=useState(""),[errors,setErrors]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false),[result,setResult]=useState<{joined:boolean;duplicate:boolean;email:string}|null>(null),[failure,setFailure]=useState("");
 const heading=useRef<HTMLHeadingElement>(null),card=useRef<HTMLDivElement>(null);
 useEffect(()=>{const opener=document.activeElement as HTMLElement|null;heading.current?.focus();return()=>opener?.focus?.()},[]);
 useEffect(()=>{heading.current?.focus();card.current?.scrollTo({top:0})},[step,result]);
 // Escape closes; Tab stays inside the card.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){e.preventDefault();onClose()}if(e.key==="Tab"&&card.current){const f=[...card.current.querySelectorAll<HTMLElement>("button,input,select,textarea,a[href]")].filter(x=>!x.hasAttribute("disabled")&&x.tabIndex!==-1&&x.offsetParent);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[onClose]);
 const plan=planById(w.plan)!;
 const set=(patch:Partial<typeof w>)=>{setW(cur=>({...cur,...patch}));setErrors({})};
 function feedbackPayload(){return FeedbackSchema.parse({side:fb.side,ease:fb.ease,oneScreen:fb.oneScreen,wouldUse:fb.wouldUse,change:fb.change,broken:fb.broken,device:fb.broken.trim()||fb.device?fb.device:undefined})}
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy)return;setFailure("");
  const feedback=feedbackPayload();
  if(!heard){setErrors({heard:"Tell us how you heard about Text Lab."});requestAnimationFrame(()=>card.current?.querySelector<HTMLElement>('[data-heard] input')?.focus());return}
  let waitlist;
  if(join){
   const parsed=WaitlistSchema.safeParse({plan:w.plan,intent:w.intent,priceNamed:w.intent==="lower_price"&&w.priceNamed!==""?Number(w.priceNamed):undefined,pricePeriod:w.intent==="lower_price"?w.pricePeriod:undefined,start:w.start,payer:w.payer,approver:approvalPlans.includes(w.plan)?w.approver:undefined,loi:approvalPlans.includes(w.plan)?w.loi:undefined,pilotCommit:w.plan==="pilot"?w.pilotCommit:undefined,students:w.students?Number(w.students):undefined,lockFoundingPrice:w.lockFoundingPrice,name:w.name,email:w.email,role:w.role,organization:w.organization,state:w.state,wantsUpdates:w.wantsUpdates});
   // Plan-specific rules only run once the basics pass, so the student count is also checked here to show every problem at once.
   const missingStudents=plan.studentsRequired&&!w.students;
   if(!parsed.success||missingStudents){const errs:Record<string,string>={};for(const i of parsed.success?[]:parsed.error.issues){const k=String(i.path[0]);errs[k]??=k==="intent"?"Choose how likely you are to buy at this price.":k==="email"?"Enter a valid email address.":k==="name"?"Enter your full name.":k==="students"?"Enter the approximate number of students.":i.message}if(missingStudents)errs.students??="Enter the approximate number of students.";setErrors(errs);
    // Move focus to the first field with a problem (the first choice in a group, or the input itself).
    requestAnimationFrame(()=>{const err=card.current?.querySelector<HTMLElement>('[id$="-err"]');const target=err?.closest("fieldset")?.querySelector<HTMLElement>("input")??(err?card.current?.querySelector<HTMLElement>(`[aria-describedby="${err.id}"]`):null);target?.focus()});return}
   waitlist=parsed.data!;
  }else if(!Object.values(feedback).some(v=>v!==undefined)){setFailure("Add some feedback in Step 1, or check “Add me to the waitlist”.");return}
  setBusy(true);
  try{const r=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({feedback,waitlist,source:currentRef(),heardFrom:heard,website:honeypot})});const j=await r.json().catch(()=>({}));if(!r.ok){setFailure(j.error||"We couldn't send that. Please try again.");return}setResult({joined:!!waitlist,duplicate:!!j.duplicate,email:waitlist?.email??""})}
  catch{setFailure("We couldn't reach TextLab. Check your connection and try again.")}
  finally{setBusy(false)}
 }
 const title=result?(result.duplicate?"You're already on the list":result.joined?"You're on the list":"Thank you"):step===1?"Tell us what you think":join?"Join the waitlist":"Stay in touch";
 return <div className="fixed inset-0 z-[60] grid place-items-center bg-deep/45 p-3 sm:p-6" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div ref={card} role="dialog" aria-modal="true" aria-labelledby="fb-title" className="case-ui relative max-h-[94dvh] w-full max-w-[640px] overflow-y-auto overscroll-contain rounded-3xl bg-panel p-5 shadow-2xl sm:p-7">
   <div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">{result?"Sent":`Step ${step} of 2`}</p><h2 id="fb-title" ref={heading} tabIndex={-1} className="text-[26px] font-bold leading-tight outline-none">{title}</h2></div><button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-panel-2"><X size={22}/></button></div>
   {result?<div className="mt-4 space-y-4" role="status">
     <p className="text-[18px] leading-7">{result.duplicate?`We already have ${result.email} on the list for ${plan.name}.${hasAny(fb)?" Your feedback was saved.":""}`:result.joined?`We'll be in touch at ${result.email}.`:"Your feedback helps shape TextLab."}</p>
     <button type="button" onClick={onClose} className="case-primary w-full"><Check size={18}/> Done</button>
    </div>
   :<form onSubmit={submit} noValidate className="mt-3 space-y-6">
    <p className="rounded-2xl bg-panel-2 px-4 py-3 text-[15px]">For educators and families. Please don't enter student information.</p>
    {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)} name="website"/></label></div>
    {step===1?<>
     <Choices legend="Which side did you try?" options={sideChoices} value={fb.side} onChange={v=>setFb(f=>({...f,side:v}))}/>
     <fieldset><legend className="text-[16px] font-semibold">How easy was it to use?</legend><div className="mt-2 flex gap-1">{[1,2,3,4,5].map(n=><label key={n} className="cursor-pointer rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary"><input type="radio" className="sr-only" name="ease" checked={fb.ease===n} onChange={()=>setFb(f=>({...f,ease:n}))} aria-label={`${n} star${n===1?"":"s"}`}/><Star size={32} className={n<=(fb.ease??0)?"fill-highlight text-highlight":"text-muted"}/></label>)}</div></fieldset>
     <Choices legend="Did it feel like one screen at a time?" options={oneScreenChoices} value={fb.oneScreen} onChange={v=>setFb(f=>({...f,oneScreen:v}))}/>
     <Choices legend="Would you use TextLab with students or your own children?" options={wouldUseChoices} value={fb.wouldUse} onChange={v=>setFb(f=>({...f,wouldUse:v}))}/>
     <Field label="What would you change or add?">{id=><textarea id={id} rows={3} maxLength={1000} value={fb.change} onChange={e=>setFb(f=>({...f,change:e.target.value}))} className={inputCls}/>}</Field>
     <Field label="Anything that didn't work?">{id=><textarea id={id} rows={3} maxLength={1000} value={fb.broken} onChange={e=>setFb(f=>({...f,broken:e.target.value}))} className={inputCls}/>}</Field>
     <Field label="What device were you using?">{id=><select id={id} value={fb.device??""} onChange={e=>setFb(f=>({...f,device:e.target.value||undefined}))} className={inputCls}><option value="">Choose a device</option>{deviceChoices.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>}</Field>
     <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={()=>setStep(2)} className="min-h-11 text-[16px] font-semibold text-highlight underline underline-offset-4">Skip to waitlist</button><button type="button" onClick={()=>setStep(2)} className="case-primary">Next <ArrowRight size={18}/></button></div>
    </>:<>
     {open.step===2&&<button type="button" onClick={()=>setStep(1)} className="min-h-11 text-[15px] font-semibold text-highlight underline underline-offset-4">Leave feedback too</button>}
     <div data-heard><Choices legend="How did you hear about Text Lab?" required options={heardChoices} value={heard} onChange={v=>{setHeard(v);setErrors(e=>{const {heard:_h,...rest}=e;return rest})}} error={errors.heard}/></div>
     {open.step===1&&<button type="button" onClick={()=>setStep(1)} className="inline-flex min-h-11 items-center gap-2 text-[15px] text-muted"><ArrowLeft size={16}/> Back to feedback</button>}
     <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-edge p-4"><input type="checkbox" checked={join} onChange={e=>{setJoin(e.target.checked);setErrors({})}} className="mt-1 h-5 w-5 accent-primary"/><span className="text-[17px] font-semibold">Add me to the waitlist</span></label>
     {join&&<>
      <div className="rounded-3xl border-2 border-primary bg-primary-soft/40 p-5" aria-live="polite"><p className="text-[13px] font-semibold uppercase tracking-wide text-highlight">{plan.name}</p><p className="mt-1 text-[26px] font-bold leading-tight">{plan.price} <span className="text-[15px] font-normal text-muted">{plan.cadence}</span></p><ul className="mt-2 space-y-1 text-[15px]">{plan.features.slice(0,3).map(f=><li key={f}><Check size={15} className="mr-1.5 inline text-highlight"/>{f}</li>)}</ul></div>
      <Field label="Plan">{id=><select id={id} value={w.plan} onChange={e=>set({plan:e.target.value as PlanId})} className={inputCls}>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>}</Field>
      <Choices legend="At this price, how likely are you to buy?" required options={intentChoices} value={w.intent} onChange={v=>set({intent:v})} error={errors.intent}/>
      {w.intent==="lower_price"&&<div className="grid gap-3 sm:grid-cols-[1fr_auto]"><Field label="What price would work for you? ($)" error={errors.priceNamed}>{(id,d)=><input id={id} type="number" inputMode="decimal" min={0} step="1" value={w.priceNamed} onChange={e=>set({priceNamed:e.target.value})} aria-describedby={d} className={inputCls}/>}</Field><Choices legend="Per" options={[["month","Month"],["year","Year"]] as const} value={w.pricePeriod} onChange={v=>set({pricePeriod:v})} error={errors.pricePeriod}/></div>}
      <Choices legend="When would you want to start?" options={startChoices} value={w.start} onChange={v=>set({start:v})}/>
      <Choices legend="Who would pay?" options={payerChoices} value={w.payer} onChange={v=>set({payer:v})}/>
      {approvalPlans.includes(w.plan)&&<><Choices legend="Are you the person who approves purchases?" options={approverChoices} value={w.approver} onChange={v=>set({approver:v})}/><Choices legend="Would you sign a non-binding letter of intent?" options={yesMaybeNo} value={w.loi} onChange={v=>set({loi:v})}/></>}
      {w.plan==="pilot"&&<Choices legend="Could your school commit $500 for the 2026-27 pilot?" options={yesMaybeNo} value={w.pilotCommit} onChange={v=>set({pilotCommit:v})}/>}
      <Field label={`Number of students${plan.studentsRequired?" (required)":" (optional)"}`} error={errors.students}>{(id,d)=><input id={id} type="number" inputMode="numeric" min={1} value={w.students} onChange={e=>set({students:e.target.value})} aria-invalid={!!errors.students} aria-describedby={d} className={inputCls}/>}</Field>
      <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={w.lockFoundingPrice} onChange={e=>set({lockFoundingPrice:e.target.checked})} className="mt-1 h-5 w-5 accent-primary"/><span className="text-[16px]">Lock in founding pricing: reserve this price for your first year when TextLab opens.</span></label>
      <Field label="Full name (required)" error={errors.name}>{(id,d)=><input id={id} autoComplete="name" value={w.name} onChange={e=>set({name:e.target.value})} aria-invalid={!!errors.name} aria-describedby={d} className={inputCls}/>}</Field>
      <Field label="Email (required)" error={errors.email}>{(id,d)=><input id={id} type="email" autoComplete="email" value={w.email} onChange={e=>set({email:e.target.value})} aria-invalid={!!errors.email} aria-describedby={d} className={inputCls}/>}</Field>
      <Field label="Role">{id=><select id={id} value={w.role??""} onChange={e=>set({role:e.target.value||undefined})} className={inputCls}><option value="">Choose a role</option>{roleChoices.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>}</Field>
      <Field label="School, district, or organization (optional)">{id=><input id={id} autoComplete="organization" value={w.organization} onChange={e=>set({organization:e.target.value})} className={inputCls}/>}</Field>
      <Field label="State">{id=><select id={id} value={w.state??""} onChange={e=>set({state:e.target.value||undefined})} className={inputCls}><option value="">Choose a state</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select>}</Field>
      <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={w.wantsUpdates} onChange={e=>set({wantsUpdates:e.target.checked})} className="mt-1 h-5 w-5 accent-primary"/><span className="text-[16px]">Send me updates about TextLab</span></label>
     </>}
     {failure&&<p role="alert" className="rounded-2xl bg-primary-soft px-4 py-3 text-[15px] text-highlight">{failure}</p>}
     <button type="submit" disabled={busy} className="case-primary w-full disabled:opacity-50">{busy?"Sending…":join?"Send and join the waitlist":"Send feedback"}</button>
    </>}
   </form>}
  </div>
 </div>;
}
function hasAny(f:{side?:string;ease?:number;oneScreen?:string;wouldUse?:string;change:string;broken:string;device?:string}){return !!(f.side||f.ease||f.oneScreen||f.wouldUse||f.change.trim()||f.broken.trim()||f.device)}
