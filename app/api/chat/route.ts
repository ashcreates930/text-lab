import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { characterReply, retrieveRelevantPassages } from "@/lib/llm";
import { screenMessage } from "@/lib/safety";
import {WorldPackSchema} from "@/lib/world-schema";
import {consumeDemoAi} from "@/lib/demo-usage";
import {parseSourcePassages} from "@/lib/source-passages";
const Input=z.object({sandboxId:z.string().uuid(),question:z.string().min(1).max(1000),scene:z.string(),worldId:z.string().regex(/^[a-z0-9-]+$/).default("tell-tale-heart"),character:z.string().default("narrator"),throughParagraph:z.string().regex(/^p\d{3}$/).optional()});
export async function POST(request:NextRequest){
  const parsed=Input.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid question"},{status:400});
  const {question,scene,character,worldId}=parsed.data;const safety=screenMessage(question);if(safety.action!=="allow")return NextResponse.json({text:safety.message,safety});
  let pack;try{pack=WorldPackSchema.parse(JSON.parse(await readFile(join(process.cwd(),"worlds",worldId,"world.json"),"utf8")))}catch{return NextResponse.json({error:"World pack not found."},{status:404})}
  const markdown=await readFile(join(process.cwd(),"worlds",worldId,"source.md"),"utf8");
  // The storybook reader sends the last paragraph the student has reached, so a character can't reveal what comes next.
  const through=parsed.data.throughParagraph?Number(parsed.data.throughParagraph.slice(1)):null;
  // Paragraphs the story marks ai_exclude never reach a character.
  const excluded=new Set(pack.storybook?.ai_exclude??[]);
  const source=through||excluded.size?parseSourcePassages(markdown).filter(p=>(!through||Number(p.id.slice(1))<=through)&&!excluded.has(p.id)).map(p=>p.text):markdown.split(/\n\s*\n/).slice(1).map(p=>p.trim()).filter(Boolean);
  const item=pack.characters.find(x=>x.id===character);if(!item)return NextResponse.json({error:"Character not found."},{status:404});
  const capped=await consumeDemoAi(request,"character",parsed.data.sandboxId);if(capped)return capped;
  const sceneText=through?"The student has read the story only up to this point. Your character notes may mention later events: keep them secret. Every event you mention must appear in the source passages below, and speak only to what you yourself saw, said, or did in them; if they do not show you there, say you were not there. Never mention or hint at later events.":pack.scenes.find(x=>x.id===scene)?.narration??"Only the story's known events are in scope.";
  try{const passages=await retrieveRelevantPassages(question,source);return NextResponse.json(await characterReply({question,character:item,scene:sceneText,passages}))}
  catch(error){console.error("Character reply failed:",error instanceof Error?error.message:error);return NextResponse.json({text:"I can’t find an answer to that in the passages I have. What detail in this scene makes you ask?",safety})}
}
