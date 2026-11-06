// A solo written answer, judged on the server (api/expedition/judge); offline or on an error, the same rule check runs
// here, so the race never waits on the network for long or stops.
import type {ExpQuestion} from "@/lib/world-schema";
import {sentenceProves,type Token} from "@/lib/expedition";
import type {Version} from "@/lib/formats";
import {ruleVerdict,type WrittenVerdict} from "@/lib/formats";

type Req={worldId:string;expeditionId:string;chunk:number;bank:number;version:Version;text:string;line:string|null};
// auth: a class student's token (the AI judge runs for class students; anyone else gets the rule check).
export async function judgeWritten(req:Req,q:ExpQuestion,tokens:Token[],auth?:string|null):Promise<WrittenVerdict>{
 const local=()=>ruleVerdict(q,req.text,!q.proof?.lines?.length||(!!req.line&&sentenceProves(q,tokens,[req.line])));
 try{
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);
  const r=await fetch("/api/expedition/judge",{method:"POST",headers:{"Content-Type":"application/json",...(auth?{"x-class-token":auth}:{})},body:JSON.stringify(req),signal:ctl.signal});clearTimeout(t);
  if(!r.ok)return local();const j=await r.json();return j?.strength?j as WrittenVerdict:local();
 }catch{return local()}
}
