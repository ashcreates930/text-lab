import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { characterReply, retrieveRelevantPassages } from "@/lib/llm";
import { screenMessage } from "@/lib/safety";
import {WorldPackSchema} from "@/lib/world-schema";
import {consumeDemoAi} from "@/lib/demo-usage";
import {parseSourcePassages} from "@/lib/source-passages";
import {AngleSchema,DEFAULT_PERSONAL,personaPrompt} from "@/lib/student-role";
import {isFailure,studentFromRequest} from "@/lib/classroom/auth";
import {personalSettings} from "@/lib/classroom/store";
import {offClaimFor,offClaimTurn} from "@/lib/clue-game";
import {PAYOFF_GUARD,missionFor,revealsPayoff} from "@/lib/missions";
import {evidenceSentences} from "@/lib/lies";
const Input=z.object({sandboxId:z.string().uuid(),question:z.string().min(1).max(1000),scene:z.string(),worldId:z.string().regex(/^[a-z0-9-]+$/).default("tell-tale-heart"),character:z.string().default("narrator"),throughParagraph:z.string().regex(/^p\d{3}$/).optional(),clue:z.string().max(120).optional(),inRole:z.boolean().optional(),angle:AngleSchema.optional(),turn:z.number().int().min(1).max(50).optional(),mission:z.string().max(80).optional()});
export async function POST(request:NextRequest){
  const parsed=Input.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid question"},{status:400});
  const {question,scene,character,worldId}=parsed.data;const safety=screenMessage(question);if(safety.action!=="allow")return NextResponse.json({text:safety.message,safety});
  let pack;try{pack=WorldPackSchema.parse(JSON.parse(await readFile(join(process.cwd(),"worlds",worldId,"world.json"),"utf8")))}catch{return NextResponse.json({error:"World pack not found."},{status:404})}
  const markdown=await readFile(join(process.cwd(),"worlds",worldId,"source.md"),"utf8");
  // The storybook reader sends the last paragraph the student has reached, so a character can't reveal what comes next.
  const through=parsed.data.throughParagraph?Number(parsed.data.throughParagraph.slice(1)):null;
  // Paragraphs the story marks ai_exclude never reach a character.
  const excluded=new Set(pack.storybook?.ai_exclude??[]);
  // A student's mission keeps its payoff sealed until the verdict: the payoff paragraph never reaches a character.
  const mission=missionFor(pack,parsed.data.mission);
  if(mission){const pid=parseSourcePassages(markdown).find(p=>evidenceSentences(p.text).includes(mission.payoff.line))?.id;if(pid)excluded.add(pid)}
  const source=through||excluded.size?parseSourcePassages(markdown).filter(p=>(!through||Number(p.id.slice(1))<=through)&&!excluded.has(p.id)).map(p=>p.text):markdown.split(/\n\s*\n/).slice(1).map(p=>p.trim()).filter(Boolean);
  const item=pack.characters.find(x=>x.id===character);if(!item)return NextResponse.json({error:"Character not found."},{status:404});
  const capped=await consumeDemoAi(request,"character",parsed.data.sandboxId);if(capped)return capped;
  // Students in the story: the student's part and their angle (three choices only). A class student's teacher settings win.
  let personal={rolesOn:parsed.data.inRole!==false,anglesOn:!!parsed.data.angle};
  if(request.headers.get("x-class-token")){const ctx=await studentFromRequest(request);if(!isFailure(ctx)){const cls=await ctx.store.getClassById(ctx.student.session_id);const s=cls?personalSettings(cls):DEFAULT_PERSONAL;personal={rolesOn:personal.rolesOn&&s.rolesOn,anglesOn:personal.anglesOn&&s.anglesOn}}}
  const persona=personaPrompt(pack,parsed.data.angle,personal);
  const sceneText=through?"The student has read the story only up to this point. Your character notes may mention later events: keep them secret. Every event you mention must appear in the source passages below, and speak only to what you yourself saw, said, or did in them; if they do not show you there, say you were not there. Never mention or hint at later events.":pack.scenes.find(x=>x.id===scene)?.narration??"Only the story's known events are in scope.";
  // Spot the Lie: on the lie clue, the character who gave the testimony stands by it and makes up nothing new.
  const lie=pack.scenes.find(x=>x.id===scene)?.lie;
  const testimony=lie&&lie.clue_id===parsed.data.clue&&lie.character_id===character?` Earlier in this conversation you told the student: "${lie.testimony}" Stand by what you said: do not take it back, correct it, or say which part might be wrong. Do not add any new facts that are not in the source passages; for anything else, answer only from the passages.`:"";
  // Off claim: once per clue, on one of the character's first three answers (picked from the student's id), the character
  // states the clue's authored off claim. The reply says so, so "Something's off" can award the catch.
  const clueRow=pack.scenes.flatMap(s=>s.artifacts).find(a=>a.id===parsed.data.clue);
  const off=clueRow&&parsed.data.turn&&parsed.data.turn===offClaimTurn(parsed.data.sandboxId,clueRow.id)?offClaimFor(clueRow,character):undefined;
  try{const passages=await retrieveRelevantPassages(question,source);const reply=await characterReply({question,character:item,scene:sceneText+testimony+(persona?` ${persona}`:""),passages,...(off?{offClaim:off.claim}:{})});
   // And a reply that names it anyway is replaced.
   if(mission&&revealsPayoff(mission,reply.text))return NextResponse.json({...reply,text:PAYOFF_GUARD});
   return NextResponse.json({...reply,...(off?{offClaim:true}:{})})}
  catch(error){console.error("Character reply failed:",error instanceof Error?error.message:error);return NextResponse.json(off?{text:`${off.claim} Check the story if you don't believe me.`,safety,offClaim:true}:{text:"I can’t find an answer to that in the passages I have. What detail in this scene makes you ask?",safety})}
}
