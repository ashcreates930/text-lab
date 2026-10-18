import {NextResponse,type NextRequest} from "next/server";
import {DEMO_ACCESS_COOKIE,demoAccessDevice} from "@/lib/demo-access";
import {getServiceSupabase} from "@/lib/supabase";

import {usageCall,type DemoAiKind} from "./demo-limits.ts";
export {globalCeiling,imageCeiling,limits,usageCall,type DemoAiKind} from "./demo-limits.ts";
export const DEMO_LIMIT_MESSAGE="You've reached today's demo limit. Thanks for exploring!";
export const DEMO_RESTING_MESSAGE="The demo is resting for today. Please try again tomorrow.";
// Call immediately before an AI provider request. Returns a 429 response when a cap is reached, or null to proceed.
// Without Supabase configured (local development without keys) nothing is counted; if counting fails with Supabase configured, AI stays off.
export async function consumeDemoAi(request:NextRequest,kind:DemoAiKind,sandboxId:string,frame?:string){
  const db=getServiceSupabase();if(!db)return null;
  const device=await demoAccessDevice(request.cookies.get(DEMO_ACCESS_COOKIE)?.value);if(!device)return limited(DEMO_LIMIT_MESSAGE,"device");
  const call=usageCall(kind,sandboxId,device,frame);
  const {data,error}=await db.rpc(call.fn,call.args);
  if(error){console.error("Demo AI usage check failed:",error.message);return limited(DEMO_RESTING_MESSAGE,"unavailable")}
  if(data==="ok")return null;
  return limited(data==="global"?DEMO_RESTING_MESSAGE:DEMO_LIMIT_MESSAGE,String(data));
}
function limited(message:string,reason:string){return NextResponse.json({error:message,limit:reason},{status:429})}
