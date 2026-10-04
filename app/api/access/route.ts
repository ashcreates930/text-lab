import {NextResponse,type NextRequest} from "next/server";
import {z} from "zod";
import {DEMO_ACCESS_COOKIE,DEMO_ACCESS_MAX_AGE,DEMO_LOCKOUT_MESSAGE,clientAddress,createDemoAccessToken,demoAccessConfigured,demoCodeMatches,hashClientAddress,verifyDemoAccessToken} from "@/lib/demo-access";
import {getServiceSupabase} from "@/lib/supabase";
const Input=z.object({code:z.string().max(200)});
const WRONG_CODE="That code didn't work. Check your invitation.";
// FEEDBACK_FORM_URL is read at request time so it can change without a rebuild. Only http(s) links are passed to the page.
function feedbackUrl(){const value=process.env.FEEDBACK_FORM_URL?.trim();if(!value)return null;try{const url=new URL(value);return url.protocol==="https:"||url.protocol==="http:"?url.toString():null}catch{return null}}
// Open preview: visitors no longer type a code. A signed device cookie is issued automatically so the per-device and daily AI caps in lib/demo-usage.ts still apply.
export async function GET(request:NextRequest){
 if(await verifyDemoAccessToken(request.cookies.get(DEMO_ACCESS_COOKIE)?.value))return NextResponse.json({granted:true,feedbackUrl:feedbackUrl()});
 if(!demoAccessConfigured())return NextResponse.json({granted:false,feedbackUrl:feedbackUrl()});
 const response=NextResponse.json({granted:true,feedbackUrl:feedbackUrl()});response.cookies.set(DEMO_ACCESS_COOKIE,await createDemoAccessToken(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:DEMO_ACCESS_MAX_AGE});return response;
}
// Lockout: 10 wrong codes from one IP within an hour block that IP for an hour. Requires Supabase; without it only the per-attempt delay applies.
export async function POST(request:NextRequest){
 if(!demoAccessConfigured())return NextResponse.json({error:"Demo access is not configured yet."},{status:503});
 const db=getServiceSupabase();const ipHash=db?await hashClientAddress(clientAddress(request.headers)):"";
 if(db){const {data:blocked,error}=await db.rpc("demo_access_blocked",{p_ip_hash:ipHash});if(error)console.error("Access lockout check failed; the code is still required:",error.message);else if(blocked)return NextResponse.json({error:DEMO_LOCKOUT_MESSAGE},{status:429})}
 const input=Input.safeParse(await request.json().catch(()=>null));
 if(!input.success||!(await demoCodeMatches(input.data.code))){if(db){const {error}=await db.rpc("record_demo_access_failure",{p_ip_hash:ipHash});if(error)console.error("Access lockout update failed:",error.message)}await new Promise(r=>setTimeout(r,500));return NextResponse.json({error:WRONG_CODE},{status:401})}
 const response=NextResponse.json({granted:true,feedbackUrl:feedbackUrl()});response.cookies.set(DEMO_ACCESS_COOKIE,await createDemoAccessToken(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:DEMO_ACCESS_MAX_AGE});return response;
}
