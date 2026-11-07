"use client";
// Keeps a live-round screen current: fetches the state, refetches when the server pings the session's Realtime channel,
// and polls as a fallback (often while Realtime isn't connected, rarely once it is).
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {focusScreenTop} from "../screen-focus";
import {getBrowserSupabase} from "@/lib/supabase-browser";
import {parseSourcePassages,type SourcePassage} from "@/lib/source-passages";
import {WorldPackSchema,type WorldPack} from "@/lib/world-schema";

export function useLive<T>(sessionId:string|null,headers:Record<string,string>|null){
 const [state,setState]=useState<T|null>(null),[error,setError]=useState("");
 const [live,setLive]=useState(false);
 const key=headers?JSON.stringify(headers):"";
 const busy=useRef(false);
 // A tap's own answer (setState from an action) is newer than any refresh already on its way: a refresh that started
 // before it is dropped, so a slow poll can't flip the screen back (a pick briefly showing as undone).
 const stamp=useRef(0);
 const setFresh=useCallback((v:T|null|((p:T|null)=>T|null))=>{stamp.current++;setState(v)},[]);
 const refresh=useCallback(async()=>{
  if(!sessionId||!key||busy.current)return;busy.current=true;
  const at=stamp.current;
  try{const r=await fetch(`/api/live/sessions/${sessionId}`,{headers:JSON.parse(key),cache:"no-store"});const j=await r.json();if(at!==stamp.current)return;if(r.ok){setState(j);setError("")}else setError(j.error??"Something went wrong.")}
  catch{setError("Reconnecting…")}finally{busy.current=false}
 },[sessionId,key]);
 useEffect(()=>{
  if(!sessionId)return;
  refresh();
  const db=getBrowserSupabase();
  const channel=db?.channel(`live:${sessionId}`).on("broadcast",{event:"changed"},()=>{refresh()}).subscribe(s=>setLive(s==="SUBSCRIBED"));
  return()=>{if(channel)db?.removeChannel(channel)};
 },[sessionId,refresh]);
 useEffect(()=>{const t=window.setInterval(refresh,live?8000:2000);return()=>window.clearInterval(t)},[refresh,live]);
 return {state,setState:setFresh,error,refresh,live};
}

// The story's world pack and paragraphs, for evidence lines on players' phones.
export function useStory(worldId:string|undefined){
 const [world,setWorld]=useState<WorldPack|null>(null),[passages,setPassages]=useState<SourcePassage[]>([]);
 useEffect(()=>{
  if(!worldId)return;
  fetch(`/worlds/${worldId}/world.json`).then(r=>r.json()).then(d=>setWorld(WorldPackSchema.parse(d))).catch(()=>{});
  fetch(`/worlds/${worldId}/source.md`).then(r=>r.ok?r.text():"").then(t=>setPassages(parseSourcePassages(t))).catch(()=>{});
 },[worldId]);
 return {world,passages};
}

// A live screen is new when its phase changes (lobby, a new round or stage, the reveal, the end): it opens at the top
// with focus on its heading. Updates inside a phase (counters, a squadmate's action) keep scroll and focus.
export function useScreenTop(key:string|null){
 const shown=useRef<string|null>(null);
 useLayoutEffect(()=>{if(!key||shown.current===key)return;shown.current=key;focusScreenTop()},[key]);
}

export async function postJson(url:string,body:unknown,headers:Record<string,string>={}){
 try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));return r.ok?{ok:true as const,data:j}:{ok:false as const,error:String(j.error??"Something went wrong.")}}
 catch{return {ok:false as const,error:"Can't reach the server. Try again."}}
}
export const hostKey=(id:string)=>`textlab-live-host-${id}`;
export const playerKey=(code:string)=>`textlab-live-player-${code.toUpperCase()}`;
export function readStored<T>(key:string):T|null{try{const v=localStorage.getItem(key);return v?JSON.parse(v) as T:null}catch{return null}}
export function store(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
