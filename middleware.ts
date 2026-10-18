import {NextResponse,type NextRequest} from "next/server";
import {DEMO_ACCESS_COOKIE,verifyDemoAccessToken} from "@/lib/demo-access";
// Demo APIs require the access-code cookie. Waitlist, owner, class join (gated by its class code), and /api/access stay open.
export async function middleware(request:NextRequest){if(await verifyDemoAccessToken(request.cookies.get(DEMO_ACCESS_COOKIE)?.value))return NextResponse.next();return NextResponse.json({error:"Enter your demo access code to continue."},{status:401})}
export const config={matcher:["/api/chat","/api/voice","/api/frame-check","/api/frame-image","/api/analysis-report","/api/student-answers","/api/fluency/score"]};
