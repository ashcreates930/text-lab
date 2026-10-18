"use client";
// Class students' reading progress follows them across days and devices through their class record.
// Demo visitors never use this: their progress stays in this browser tab.
import {useEffect,useRef} from "react";
import type {StudentProgress} from "@/lib/classroom/progress";
import type {Demo} from "./page";

type Auth={token:string};
const headers=(auth:Auth)=>({"Content-Type":"application/json","x-class-token":auth.token});

export function toProgress(demo:Demo):StudentProgress{
 return {v:1,worldId:demo.worldId,scene:demo.scene,submitted:demo.submitted,role:demo.role||undefined,readerProgress:demo.readerProgress??{},artifactAnswers:demo.artifactAnswers,savedTextEvidence:demo.savedTextEvidence,storyFrames:demo.storyFrames??{},...(demo.choices?{choices:demo.choices}:{}),...(demo.lies?{lies:demo.lies}:{}),...(demo.verdict?{verdict:demo.verdict}:{}),updatedAt:new Date().toISOString()};
}
export function applyProgress(demo:Demo,p:StudentProgress):Demo{
 return {...demo,scene:p.scene,submitted:p.submitted,role:p.role??demo.role,readerProgress:p.readerProgress,artifactAnswers:p.artifactAnswers,savedTextEvidence:p.savedTextEvidence,...(p.lies?{lies:p.lies}:{}),...(p.verdict?{verdict:p.verdict}:{}),storyFrames:p.storyFrames,...(p.choices?{choices:p.choices}:{})};
}
// ok is false when the server could not be reached, so callers never mistake a failed load for "no progress yet".
export async function loadClassProgress(auth:Auth,worldId:string):Promise<{ok:boolean;progress:StudentProgress|null}>{
 try{const r=await fetch("/api/student/progress",{headers:headers(auth)});if(!r.ok)return {ok:false,progress:null};const j=await r.json();return {ok:true,progress:j.progress?.worldId===worldId?j.progress:null}}catch{return {ok:false,progress:null}}
}

// Saves a second and a half after the student stops changing anything, and right away when the tab is hidden or closed.
export function useClassProgressSync(demo:Demo,enabled:boolean){
 const latest=useRef<{auth:Auth;body:string}|null>(null),sent=useRef(""),timer=useRef<number|null>(null);
 const snapshot=enabled&&demo.classAuth?(()=>{const {updatedAt:_u,...rest}=toProgress(demo);return JSON.stringify(rest)})():"";
 useEffect(()=>{
  if(!enabled||!demo.classAuth||!snapshot||snapshot===sent.current)return;
  latest.current={auth:demo.classAuth,body:snapshot};
  if(timer.current)window.clearTimeout(timer.current);
  timer.current=window.setTimeout(()=>flush(false),1500);
  return()=>{if(timer.current)window.clearTimeout(timer.current)};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[snapshot,enabled]);
 useEffect(()=>{const hide=()=>{if(document.visibilityState==="hidden")flush(true)};const leave=()=>flush(true);document.addEventListener("visibilitychange",hide);window.addEventListener("pagehide",leave);return()=>{document.removeEventListener("visibilitychange",hide);window.removeEventListener("pagehide",leave)}},[]);
 function flush(keepalive:boolean){const job=latest.current;if(!job||job.body===sent.current)return;const body=JSON.stringify({...JSON.parse(job.body),updatedAt:new Date().toISOString()});sent.current=job.body;fetch("/api/student/progress",{method:"PUT",headers:headers(job.auth),body,keepalive}).then(r=>{if(!r.ok)sent.current=""}).catch(()=>{sent.current=""})}
}
