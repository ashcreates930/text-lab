import {NextResponse,type NextRequest} from "next/server";
import {DEMO_ACCESS_COOKIE,demoAccessDevice} from "@/lib/demo-access";
import {getServiceSupabase} from "@/lib/supabase";

export type DemoAiKind="character"|"feedback"|"voice"|"fluency";
export const DEMO_LIMIT_MESSAGE="You've reached today's demo limit. Thanks for exploring!";
export const DEMO_RESTING_MESSAGE="The demo is resting for today. Please try again tomorrow.";
// Daily caps; days follow US Eastern midnight (computed in consume_demo_ai). Voice narration has no caps of its own in the brief, so it shares the character-reply caps.
const limits:Record<DemoAiKind,{sandbox:number;device:number}>={character:{sandbox:40,device:120},feedback:{sandbox:60,device:180},voice:{sandbox:40,device:120},fluency:{sandbox:30,device:90}};
function globalCeiling(){const value=Number(process.env.DEMO_DAILY_AI_CEILING);return Number.isFinite(value)&&value>0?Math.floor(value):3000}

// Call immediately before an AI provider request. Returns a 429 response when a cap is reached, or null to proceed.
// Without Supabase configured (local development without keys) nothing is counted; if counting fails with Supabase configured, AI stays off.
export async function consumeDemoAi(request:NextRequest,kind:DemoAiKind,sandboxId:string){
  const db=getServiceSupabase();if(!db)return null;
  const device=await demoAccessDevice(request.cookies.get(DEMO_ACCESS_COOKIE)?.value);if(!device)return limited(DEMO_LIMIT_MESSAGE,"device");
  const {data,error}=await db.rpc("consume_demo_ai",{p_kind:kind,p_sandbox:sandboxId,p_device:device,p_sandbox_limit:limits[kind].sandbox,p_device_limit:limits[kind].device,p_global_limit:globalCeiling()});
  if(error){console.error("Demo AI usage check failed:",error.message);return limited(DEMO_RESTING_MESSAGE,"unavailable")}
  if(data==="ok")return null;
  return limited(data==="global"?DEMO_RESTING_MESSAGE:DEMO_LIMIT_MESSAGE,String(data));
}
function limited(message:string,reason:string){return NextResponse.json({error:message,limit:reason},{status:429})}
