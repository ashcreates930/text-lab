import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {WorldPackSchema} from "@/lib/world-schema";
import { speak } from "@/lib/voice";
import {consumeDemoAi} from "@/lib/demo-usage";
const Input=z.object({sandboxId:z.string().uuid(),text:z.string().min(1).max(1800),worldId:z.string().regex(/^[a-z0-9-]+$/).default("tell-tale-heart"),character:z.string().default("narrator")});
export async function POST(request:NextRequest){const parsed=Input.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid narration"},{status:400});if(!process.env.ELEVENLABS_API_KEY)return NextResponse.json({error:"Voice provider is not configured"},{status:503});let voice:string;try{const pack=WorldPackSchema.parse(JSON.parse(await readFile(join(process.cwd(),"worlds",parsed.data.worldId,"world.json"),"utf8")));const character=pack.characters.find(c=>c.id===parsed.data.character&&!c.witness_only);if(!character)return NextResponse.json({error:"Character not found"},{status:404});voice=character.voice_id}catch{return NextResponse.json({error:"World pack not found"},{status:404})}const capped=await consumeDemoAi(request,"voice",parsed.data.sandboxId);if(capped)return capped;try{const bytes=await speak(parsed.data.text,voice);return new Response(bytes,{headers:{"Content-Type":"audio/mpeg","Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Voice service is unavailable"},{status:502})}}
