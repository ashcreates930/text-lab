"use client";
// The game look's shared pieces (tokens: lib/design-tokens.ts and app/globals.css). Buttons have a solid bottom shadow
// and press down 4px; motion is for moments only and turns off under reduced motion; every control is at least 44px.
import {createContext,useCallback,useContext,useEffect,useId,useRef,useState} from "react";
import {AlertTriangle,Check,Flame,Inbox,Loader2,Star,Volume2,VolumeX,X} from "lucide-react";
import {Wordmark} from "./wordmark";
export {Wordmark};

const cx=(...c:(string|false|null|undefined)[])=>c.filter(Boolean).join(" ");

// ---------- Button ----------
export type ButtonVariant="primary"|"secondary"|"success"|"danger"|"ghost";
const BTN:Record<ButtonVariant,string>={primary:"btn btn-primary",secondary:"btn btn-secondary",success:"btn btn-success",danger:"btn btn-danger",ghost:"btn btn-ghost"};
export function Button({variant="primary",size="md",className,...p}:React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:ButtonVariant;size?:"md"|"lg"}){
 return <button type="button" {...p} className={cx(BTN[variant],size==="lg"&&"!min-h-[60px] !text-[22px]",className)}/>;
}

// ---------- Pill counter (score, streak, coins) ----------
export function Pill({icon,children,tone="ink",label}:{icon?:React.ReactNode;children:React.ReactNode;tone?:"ink"|"highlight"|"muted";label?:string}){
 return <span aria-label={label} className={cx("inline-flex min-h-10 items-center gap-1.5 rounded-full bg-panel px-3 font-display text-[18px] font-bold tabular-nums",tone==="highlight"?"text-highlight":tone==="muted"?"text-muted":"text-ink")}>{icon}<span>{children}</span></span>;
}

// ---------- Panel and Card ----------
export function Panel({tone="panel",className,children,...p}:React.HTMLAttributes<HTMLElement>&{tone?:"panel"|"panel-2"|"deep"}){
 return <section {...p} className={cx("rounded-card p-4",tone==="panel"?"bg-panel":tone==="panel-2"?"bg-panel-2":"bg-deep",className)}>{children}</section>;
}
export type CardTone="primary"|"success"|"violet"|"gold"|"panel";
const CARD:Record<CardTone,string>={primary:"bg-primary text-on-primary shadow-[0_8px_0_var(--color-primary-shadow)]",success:"bg-success text-on-success shadow-[0_6px_0_var(--color-success-shadow)]",violet:"bg-violet text-on-violet shadow-[0_6px_0_var(--color-violet-shadow)]",gold:"bg-gold text-on-gold shadow-[0_6px_0_var(--color-gold-shadow)]",panel:"bg-panel text-ink shadow-[0_6px_0_#0B0920]"};
export function Card({tone="panel",className,children,...p}:React.HTMLAttributes<HTMLDivElement>&{tone?:CardTone}){
 return <div {...p} className={cx("rounded-card p-5",CARD[tone],className)}>{children}</div>;
}

// ---------- Reading card and a line row ----------
// Cream paper and story type; the neutral tokens turn light inside (.reading-scope), so shared pieces read dark here.
export function ReadingCard({label,className,children}:{label?:string;className?:string;children:React.ReactNode}){
 return <div className={cx("reading-scope reading-card flex flex-col gap-2 p-2.5",className)}>{label&&<span className="px-1 text-[12px] font-extrabold text-muted">{label}</span>}{children}</div>;
}
export function LineRow({picked=false,result,onPick,children,disabled}:{picked?:boolean;result?:"right"|"wrong";onPick?:()=>void;children:React.ReactNode;disabled?:boolean}){
 const tone=result==="right"?"border-line-right-edge bg-line-right":result==="wrong"?"border-dashed border-line-wrong-edge bg-line-wrong":picked?"border-primary bg-line-picked":"border-line-edge bg-line-row";
 return <button type="button" aria-pressed={picked} disabled={disabled} onClick={onPick} className={cx("min-h-11 w-full rounded-row border-[3px] px-3 py-2.5 text-left font-serif text-[15px] font-normal leading-[1.45] text-reading-ink transition-transform active:translate-y-[2px] motion-reduce:transition-none",tone)}>{children}</button>;
}

// ---------- HUD: score, streak, coins, sound ----------
export function Hud({score,streak,coins,sound,onSound,children}:{score?:number;streak?:number;coins?:number;sound?:boolean;onSound?:()=>void;children?:React.ReactNode}){
 return <div className="hud flex flex-wrap items-center gap-2">
  {score!==undefined&&<Pill label={`Score ${score}`} icon={<Star size={18} className="fill-highlight text-highlight" aria-hidden/>}>{score.toLocaleString()}</Pill>}
  {streak!==undefined&&streak>0&&<Pill label={`Streak ${streak}`} tone="highlight" icon={<Flame size={18} className="fill-primary text-primary" aria-hidden/>}>x{streak}</Pill>}
  {coins!==undefined&&<Pill label={`${coins} coins`} icon={<span aria-hidden className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gold ring-2 ring-inset ring-gold-shadow"/>}>{coins}</Pill>}
  {children}
  <span className="flex-1"/>
  {onSound&&<button type="button" onClick={onSound} aria-label={sound?"Sound on":"Sound off"} aria-pressed={!!sound} className="grid h-11 w-11 place-items-center rounded-row bg-panel text-ink">{sound?<Volume2 size={20}/>:<VolumeX size={20}/>}</button>}
 </div>;
}

// ---------- Timer bar: drains; a word and the seconds always show ----------
export function TimerBar({left,total,label,urgentAt=5}:{left:number|null;total:number;label?:string;urgentAt?:number}){
 if(left===null)return null;
 const share=total>0?Math.max(0,Math.min(1,left/total)):0,urgent=left<=urgentAt;
 return <div className="flex flex-col gap-1.5" role="timer" aria-label={`${left} seconds left`}>
  {label!==undefined&&<div className="flex justify-between font-display text-[15px] font-semibold text-muted"><span>{label}</span><span className="text-ink tabular-nums">{left}s</span></div>}
  <div className="flex items-center gap-2"><div className="h-3 flex-1 overflow-hidden rounded-full bg-panel"><div className={cx("h-3 rounded-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none",urgent?"bg-notyet":"bg-primary")} style={{width:`${share*100}%`}}/></div>{label===undefined&&<span className="w-10 text-right font-display text-[16px] font-bold tabular-nums">{left}s</span>}</div>
 </div>;
}

// ---------- Moments: Proof! and Not yet ----------
export function ProofMoment({points,eyebrow,quote,note,children,headingRef}:{points?:number;eyebrow?:string;quote?:string;note?:string;children?:React.ReactNode;headingRef?:React.Ref<HTMLHeadingElement>}){
 return <div className="flex flex-col items-center gap-4">
  {points!==undefined&&points>0&&<p aria-hidden className="float-up font-display text-[56px] font-bold leading-none text-gold">+{points.toLocaleString()}</p>}
  <section aria-labelledby="proof-h" className="moment-pop w-full rounded-[24px] bg-success p-6 text-on-success shadow-[0_8px_0_var(--color-success-shadow)]">
   {eyebrow&&<p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{eyebrow}</p>}
   <h2 id="proof-h" ref={headingRef} tabIndex={-1} className="mt-1 text-[40px] leading-none outline-none">Proof!{points!==undefined&&points>0&&<span className="sr-only"> Plus {points} points.</span>}</h2>
   {quote&&<p className="mt-3 font-serif text-[16px] font-normal leading-[1.45]">“{quote}”</p>}
   {note&&<p className="mt-2 text-[15px] font-extrabold">{note}</p>}
   {children}
  </section>
 </div>;
}
export function NotYetMoment({eyebrow,hint,note,children,headingRef}:{eyebrow?:string;hint:React.ReactNode;note?:string;children?:React.ReactNode;headingRef?:React.Ref<HTMLHeadingElement>}){
 return <section aria-labelledby="notyet-moment-h" className="rise-in rounded-[24px] bg-notyet p-5 text-on-notyet shadow-[0_8px_0_var(--color-notyet-shadow)]">
  {eyebrow&&<p className="text-[13px] font-extrabold uppercase tracking-[.08em]">{eyebrow}</p>}
  <h2 id="notyet-moment-h" ref={headingRef} tabIndex={-1} className="mt-1 text-[36px] leading-none outline-none">Not yet</h2>
  <div className="mt-3 text-[17px] font-bold leading-[1.4]">{hint}</div>
  {note&&<p className="mt-2 text-[14px] font-extrabold">{note}</p>}
  {children}
 </section>;
}

// ---------- Bottom sheet and Modal (focus moves in, Escape closes, focus returns) ----------
function useDialog(open:boolean,onClose:()=>void){
 const ref=useRef<HTMLDivElement>(null),back=useRef<Element|null>(null);
 useEffect(()=>{if(!open)return;back.current=document.activeElement;const first=ref.current?.querySelector<HTMLElement>("h2,[data-autofocus],button,input,select,textarea");first?.focus();
  const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",k);return()=>{window.removeEventListener("keydown",k);(back.current as HTMLElement|null)?.focus?.()}},[open,onClose]);
 return ref;
}
export function BottomSheet({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:React.ReactNode}){
 const ref=useDialog(open,onClose),id=useId();if(!open)return null;
 return <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby={id}>
  <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-deep/80"/>
  <div ref={ref} className="rise-in relative w-full max-w-lg rounded-t-[24px] bg-panel p-5 pb-8"><h2 id={id} tabIndex={-1} className="text-[22px] outline-none">{title}</h2><div className="mt-3">{children}</div></div>
 </div>;
}
export function Modal({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:React.ReactNode}){
 const ref=useDialog(open,onClose),id=useId();if(!open)return null;
 return <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby={id}>
  <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-deep/80"/>
  <div ref={ref} className="moment-pop relative w-full max-w-md rounded-[24px] bg-panel p-6"><div className="flex items-start justify-between gap-3"><h2 id={id} tabIndex={-1} className="text-[24px] outline-none">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-row bg-panel-2"><X size={18}/></button></div><div className="mt-3">{children}</div></div>
 </div>;
}
// In-page confirm: the question and two buttons in place, no pop-up.
export function Confirm({question,confirmLabel,onConfirm,onCancel,danger=false}:{question:string;confirmLabel:string;onConfirm:()=>void;onCancel:()=>void;danger?:boolean}){
 return <div role="group" aria-label={question} className="rounded-card bg-panel-2 p-4"><p className="text-[16px]">{question}</p><div className="mt-3 flex flex-wrap gap-3"><Button variant={danger?"danger":"primary"} onClick={onConfirm}>{confirmLabel}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div></div>;
}

// ---------- Tabs ----------
export function Tabs<T extends string>({tabs,value,onChange,label}:{tabs:{id:T;label:string}[];value:T;onChange:(id:T)=>void;label:string}){
 return <div role="tablist" aria-label={label} className="flex flex-wrap gap-2 rounded-full bg-panel-2 p-1.5">{tabs.map(t=><button key={t.id} type="button" role="tab" aria-selected={value===t.id} onClick={()=>onChange(t.id)} className={cx("min-h-11 rounded-full px-4 font-display text-[16px] font-semibold",value===t.id?"bg-primary text-on-primary":"text-muted hover:text-ink")}>{t.label}</button>)}</div>;
}

// ---------- Form controls ----------
export const fieldClass="min-h-12 w-full rounded-row border-2 border-edge bg-panel-2 px-3 text-[16px] text-ink placeholder:text-faint focus:border-highlight";
export function Input({label,hint,className,...p}:React.InputHTMLAttributes<HTMLInputElement>&{label:string;hint?:string}){
 const id=useId();
 return <label htmlFor={id} className="flex flex-col gap-1.5 text-[15px]"><span>{label}</span><input id={id} {...p} className={cx(fieldClass,className)}/>{hint&&<span className="text-[13px] text-muted">{hint}</span>}</label>;
}
export function Select({label,children,className,...p}:React.SelectHTMLAttributes<HTMLSelectElement>&{label:string}){
 const id=useId();
 return <label htmlFor={id} className="flex flex-col gap-1.5 text-[15px]"><span>{label}</span><select id={id} {...p} className={cx(fieldClass,className)}>{children}</select></label>;
}
export function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){
 return <button type="button" role="switch" aria-checked={checked} onClick={()=>onChange(!checked)} className="inline-flex min-h-11 items-center gap-3 text-[16px]">
  <span aria-hidden className={cx("relative h-7 w-12 rounded-full transition-colors",checked?"bg-success":"bg-edge")}><span className={cx("absolute top-1 h-5 w-5 rounded-full bg-ink transition-[left]",checked?"left-6":"left-1")}/></span>{label}<span className="text-[13px] text-muted">{checked?"On":"Off"}</span></button>;
}

// ---------- Chip, badge, rank badge ----------
export function Chip({children,selected=false,onClick}:{children:React.ReactNode;selected?:boolean;onClick?:()=>void}){
 const c=cx("inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[15px]",selected?"bg-primary text-on-primary":"bg-panel text-ink");
 return onClick?<button type="button" aria-pressed={selected} onClick={onClick} className={c}>{children}</button>:<span className={c}>{children}</span>;
}
export type BadgeTone="success"|"notyet"|"gold"|"violet"|"neutral";
const BADGE:Record<BadgeTone,string>={success:"bg-success text-on-success",notyet:"bg-notyet text-on-notyet",gold:"bg-gold text-on-gold",violet:"bg-violet text-on-violet",neutral:"bg-panel-2 text-ink"};
// A badge always carries a word (and usually an icon), never color alone.
export function Badge({tone="neutral",icon,children}:{tone?:BadgeTone;icon?:React.ReactNode;children:React.ReactNode}){
 return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-extrabold",BADGE[tone])}>{icon}{children}</span>;
}
export function RankBadge({rank}:{rank:number}){
 const tone=rank===1?"bg-gold text-on-gold":rank===2?"bg-violet text-on-violet":rank===3?"bg-primary text-on-primary":"bg-panel-2 text-ink";
 return <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-row font-display text-[18px] font-bold",tone)} aria-label={`Rank ${rank}`}>{rank}</span>;
}

// ---------- Table (teacher data) ----------
export function Table({caption,head,rows,className}:{caption:string;head:React.ReactNode[];rows:React.ReactNode[][];className?:string}){
 return <div className={cx("overflow-x-auto rounded-card bg-panel",className)}><table className="w-full border-collapse text-left text-[15px]"><caption className="sr-only">{caption}</caption>
  <thead><tr className="border-b-2 border-edge">{head.map((h,i)=><th key={i} scope="col" className="px-4 py-3 font-display text-[14px] font-semibold uppercase tracking-wide text-muted">{h}</th>)}</tr></thead>
  <tbody>{rows.map((r,i)=><tr key={i} className="border-b border-edge last:border-0 odd:bg-panel even:bg-panel-2">{r.map((c,k)=><td key={k} className="px-4 py-3 align-top">{c}</td>)}</tr>)}</tbody></table></div>;
}

// ---------- Toast ----------
type ToastItem={id:number;text:string;tone:"success"|"notyet"|"neutral"};
const ToastCtx=createContext<(text:string,tone?:ToastItem["tone"])=>void>(()=>{});
export const useToast=()=>useContext(ToastCtx);
export function ToastProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<ToastItem[]>([]);
 const push=useCallback((text:string,tone:ToastItem["tone"]="neutral")=>{const id=Date.now()+Math.random();setItems(x=>[...x,{id,text,tone}]);setTimeout(()=>setItems(x=>x.filter(t=>t.id!==id)),4000)},[]);
 return <ToastCtx.Provider value={push}>{children}<div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">{items.map(t=><Toast key={t.id} tone={t.tone}>{t.text}</Toast>)}</div></ToastCtx.Provider>;
}
export function Toast({tone="neutral",children}:{tone?:ToastItem["tone"];children:React.ReactNode}){
 const c=tone==="success"?"bg-success text-on-success":tone==="notyet"?"bg-notyet text-on-notyet":"bg-panel text-ink";
 return <div role="status" className={cx("rise-in pointer-events-auto flex min-h-12 max-w-md items-center gap-2 rounded-card px-4 text-[16px]",c)}>{tone==="success"?<Check size={18} aria-hidden/>:tone==="notyet"?<AlertTriangle size={18} aria-hidden/>:null}{children}</div>;
}

// ---------- Empty, loading and error states ----------
export function EmptyState({title,children,action}:{title:string;children?:React.ReactNode;action?:React.ReactNode}){
 return <div className="flex flex-col items-center gap-2 rounded-card bg-panel-2 px-6 py-8 text-center"><Inbox size={32} className="text-highlight" aria-hidden/><p className="font-display text-[20px]">{title}</p>{children&&<div className="text-[15px] text-muted">{children}</div>}{action&&<div className="mt-2">{action}</div>}</div>;
}
export function LoadingState({label="Loading"}:{label?:string}){
 return <div role="status" className="flex items-center justify-center gap-2 py-8 text-[16px] text-muted"><Loader2 size={20} className="animate-spin motion-reduce:animate-none" aria-hidden/>{label}…</div>;
}
export function ErrorState({title="Something went wrong",children,onRetry}:{title?:string;children?:React.ReactNode;onRetry?:()=>void}){
 return <div role="alert" className="flex flex-col items-center gap-2 rounded-card bg-notyet-soft px-6 py-8 text-center"><AlertTriangle size={30} className="text-notyet" aria-hidden/><p className="font-display text-[20px]">{title}</p>{children&&<div className="text-[15px] text-muted">{children}</div>}{onRetry&&<Button className="mt-2" onClick={onRetry}>Try again</Button>}</div>;
}

// ---------- Calm notice: content notes and safety messages, never styled as a game moment ----------
export function Notice({title,children,role="note"}:{title?:string;children:React.ReactNode;role?:"note"|"alert"|"status"}){
 return <div role={role} className="rounded-card border-2 border-edge bg-panel-2 px-4 py-3 text-[16px] font-bold leading-relaxed text-ink">{title&&<p className="font-display text-[17px] text-ink">{title}</p>}<div className={title?"mt-1 text-muted":""}>{children}</div></div>;
}
