import OpenAI from "openai";
import { screenMessage } from "./safety.ts";
let client:OpenAI|undefined;
function openai(){ if(!process.env.OPENAI_API_KEY) return null; return client ??= new OpenAI({apiKey:process.env.OPENAI_API_KEY}); }
export async function characterReply(input:{question:string;character:{name:string;personality:string;speech_style:string;knowledge_limits:string;never_reveal:string[]};scene:string;passages:string[]}) {
  const safety=screenMessage(input.question); if(safety.action!=="allow") return {text:safety.message!,safety};
  if(input.passages.length===0)return {text:`I cannot say. I have no passage from this part of the story that answers that. What detail made you wonder?`,safety};
  const ai=openai(); if(!ai) return {text:`I can’t find an answer to that in the passages I have. What detail in this scene makes you ask?`,safety};
  const completion=await ai.chat.completions.create({model:process.env.OPENAI_TEXT_MODEL||"gpt-4o-mini",messages:[{role:"system",content:`You are ${input.character.name} in a literature classroom. ${input.character.personality} Speak in this style: ${input.character.speech_style}. Limits: ${input.character.knowledge_limits}. Never reveal: ${input.character.never_reveal.join(", ")}. Use only the supplied passage and scene. If unsupported, say you do not know, in character. Never invent plot or branches, never write the student's analysis or narrative, and quote at most two sentences from the source. If asked for a judgment, answer only from your own perspective and invite the student to find evidence. Keep responses under 90 words.`},{role:"user",content:`Allowed scene: ${input.scene}\nSource passages:\n${input.passages.join("\n\n")}\nStudent asks: ${input.question}`}],temperature:0.4,max_tokens:180});
  return {text:completion.choices[0]?.message.content||"I cannot answer that from what I know.",safety};
}
const embeddingCache=new Map<string,number[]>();
function similarity(a:number[],b:number[]){let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}return dot/(Math.sqrt(aa)*Math.sqrt(bb)||1)}
export async function retrieveRelevantPassages(question:string,paragraphs:string[],count=4){
  const ai=openai();if(!ai){const terms=question.toLowerCase().match(/[a-z]{3,}/g)||[];return paragraphs.map(text=>({text,score:terms.reduce((n,t)=>n+(text.toLowerCase().includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score).slice(0,count).filter(x=>x.score>0).map(x=>x.text)}
  const model=process.env.OPENAI_EMBEDDING_MODEL||"text-embedding-3-small";
  const missing=paragraphs.filter(p=>!embeddingCache.has(p));
  if(missing.length){const embedded=await ai.embeddings.create({model,input:missing});embedded.data.forEach((row,i)=>embeddingCache.set(missing[i],row.embedding))}
  const query=(await ai.embeddings.create({model,input:question})).data[0].embedding;
  return paragraphs.map(text=>({text,score:similarity(query,embeddingCache.get(text)||[])})).sort((a,b)=>b.score-a.score).slice(0,count).map(x=>x.text);
}
