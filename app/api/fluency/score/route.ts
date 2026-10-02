import {NextResponse,type NextRequest} from "next/server";
import OpenAI from "openai";
import {consumeDemoAi} from "@/lib/demo-usage";

// Transcribes one fluency-check recording. The audio is held in memory for this request only:
// it is never written to disk, the database, or logs, and only the transcript is returned.
export const runtime="nodejs";
const MAX_BYTES=6*1024*1024;
export async function POST(request:NextRequest){
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"AI scoring is not set up yet. Listen to the recording and mark the words yourself.",manual:true},{status:503});
  let form:FormData;try{form=await request.formData()}catch{return NextResponse.json({error:"The recording could not be read."},{status:400})}
  const audio=form.get("audio"),sandboxId=String(form.get("sandboxId")||"");
  if(!(audio instanceof File)||audio.size===0)return NextResponse.json({error:"No recording was received."},{status:400});
  if(audio.size>MAX_BYTES)return NextResponse.json({error:"That recording is too long. Fluency checks are one minute."},{status:413});
  if(!/^[0-9a-f-]{36}$/i.test(sandboxId))return NextResponse.json({error:"Invalid session."},{status:400});
  const capped=await consumeDemoAi(request,"fluency",sandboxId);if(capped)return capped;
  try{
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    // whisper-1 is used because it returns word timestamps. The passage is deliberately NOT sent as a prompt:
    // that would nudge the transcript toward the printed words and hide real reading errors.
    const result=await client.audio.transcriptions.create({file:audio,model:process.env.OPENAI_TRANSCRIBE_MODEL||"whisper-1",language:"en",response_format:"verbose_json",timestamp_granularities:["word"]}) as unknown as {text:string;words?:{word:string;start:number;end:number}[]};
    return NextResponse.json({text:result.text??"",words:(result.words??[]).map(w=>({word:w.word,start:w.start,end:w.end}))},{headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("Fluency transcription failed:",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"AI scoring is unavailable right now. Listen to the recording and mark the words yourself.",manual:true},{status:502})}
}
