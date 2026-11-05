// Where a student's world-map secrets live: a class student's on the server (api/student/map), anyone else's on this
// device. Saved on the device either way, so the map still shows them offline.
type Auth={token:string}|null|undefined;
const key=(worldId:string)=>`textlab:map-secrets:${worldId}`;
function local(worldId:string):string[]{try{const v=JSON.parse(localStorage.getItem(key(worldId))??"[]");return Array.isArray(v)?v.filter(x=>typeof x==="string"):[]}catch{return []}}
export async function loadSecrets(worldId:string,auth:Auth):Promise<string[]>{
 const mine=local(worldId);if(!auth)return mine;
 try{const r=await fetch(`/api/student/map?world=${encodeURIComponent(worldId)}`,{headers:{"x-class-token":auth.token},cache:"no-store"});if(r.ok){const j=await r.json();return [...new Set([...mine,...(j.secrets??[])])]}}catch{}
 return mine;
}
export async function saveSecret(worldId:string,expeditionId:string,chunk:number,auth:Auth){
 try{localStorage.setItem(key(worldId),JSON.stringify([...new Set([...local(worldId),`${expeditionId}:${chunk}`])]))}catch{}
 if(!auth)return;
 try{await fetch("/api/student/map",{method:"POST",headers:{"Content-Type":"application/json","x-class-token":auth.token},body:JSON.stringify({worldId,expeditionId,chunk})})}catch{}
}
