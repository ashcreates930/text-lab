import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { characterReply, retrieveRelevantPassages } from "@/lib/llm";
import { screenMessage } from "@/lib/safety";
import {WorldPackSchema} from "@/lib/world-schema";
import {consumeDemoAi} from "@/lib/demo-usage";
const Input=z.object({sandboxId:z.string().uuid(),question:z.string().min(1).max(1000),scene:z.string(),worldId:z.string().regex(/^[a-z0-9-]+$/).default("tell-tale-heart"),character:z.string().default("narrator")});
export async function POST(request:NextRequest){
  const parsed=Input.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid question"},{status:400});
  const {question,scene,character,worldId}=parsed.data;const safety=screenMessage(question);if(safety.action!=="allow")return NextResponse.json({text:safety.message,safety});
  let pack;try{pack=WorldPackSchema.parse(JSON.parse(await readFile(join(process.cwd(),"worlds",worldId,"world.json"),"utf8")))}catch{return NextResponse.json({error:"World pack not found."},{status:404})}
  const source=(await readFile(join(process.cwd(),"worlds",worldId,"source.md"),"utf8")).split(/\n\s*\n/).slice(1).map(p=>p.trim()).filter(Boolean);
  const item=pack.characters.find(x=>x.id===character);if(!item)return NextResponse.json({error:"Character not found."},{status:404});
  const capped=await consumeDemoAi(request,"character",parsed.data.sandboxId);if(capped)return capped;
  const sceneText=pack.scenes.find(x=>x.id===scene)?.narration??"Only the story's known events are in scope.";
  try{const passages=await retrieveRelevantPassages(question,source);return NextResponse.json(await characterReply({question,character:item,scene:sceneText,passages}))}
  catch(error){console.error("Character reply failed:",error instanceof Error?error.message:error);return NextResponse.json({text:"I can’t find an answer to that in the passages I have. What detail in this scene makes you ask?",safety})}
}
