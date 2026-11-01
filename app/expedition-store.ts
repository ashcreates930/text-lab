// Where a student's expedition attempts live: a class student's on the server (api/student/expeditions, so the teacher
// sees them), anyone else's on this device. Both return the class's assigned expeditions for the map.
import type {ExpeditionAttempt} from "@/lib/expedition-progress";

type Auth={token:string}|null|undefined;
const key=(worldId:string)=>`textlab:expeditions:${worldId}`;
function local(worldId:string):ExpeditionAttempt[]{try{const v=JSON.parse(localStorage.getItem(key(worldId))??"[]");return Array.isArray(v)?v:[]}catch{return []}}
export async function loadAttempts(worldId:string,auth:Auth):Promise<{attempts:ExpeditionAttempt[];assigned:{expeditionId:string;due:string|null}[]}>{
 if(auth){try{const r=await fetch("/api/student/expeditions",{headers:{"x-class-token":auth.token},cache:"no-store"});if(r.ok){const j=await r.json();return {attempts:(j.attempts??[]).filter((a:ExpeditionAttempt)=>a.worldId===worldId),assigned:j.assigned??[]}}}catch{}}
 return {attempts:local(worldId),assigned:[]};
}
// Saves on the device always (so the map works offline), and for a class student on the server too.
export async function saveAttempt(a:ExpeditionAttempt,auth:Auth){
 try{const list=local(a.worldId).filter(x=>x.attemptId!==a.attemptId);list.push(a);localStorage.setItem(key(a.worldId),JSON.stringify(list.slice(-60)))}catch{}
 if(!auth)return true;
 try{const r=await fetch("/api/student/expeditions",{method:"POST",headers:{"Content-Type":"application/json","x-class-token":auth.token},body:JSON.stringify(a)});return r.ok}catch{return false}
}
