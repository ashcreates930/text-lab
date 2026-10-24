import OpenAI from "openai";
import { screenMessage } from "./safety.ts";
let client:OpenAI|undefined;
function openai(){ if(!process.env.OPENAI_API_KEY) return null; return client ??= new OpenAI({apiKey:process.env.OPENAI_API_KEY}); }
// How characters answer: their own opinion, memory or claim in two or three sentences, never a summary of the passage,
// and always a pointer back to the text for proof. offClaim: an authored claim that is slightly wrong (lib/clue-game.ts);
// the character states it as if it were true and the student earns points for finding the line that corrects it.
export const ANSWER_STYLE="Answer in your own voice with an opinion, a memory or a claim, in at most three short sentences (under 50 words in all). Never retell or summarize what happens in the passage, and do not quote it: give your own view of it. Speak plain standard English with no dialect. End by sending the student to the text for proof, naming what to look for but never which line, for example: \"Read what the book says about the windows, then tell me I'm wrong.\"";
export const offClaimInstruction=(claim:string)=>` In this answer, make this one claim in your own words, confidently, as if it were true: "${claim}" Do not hint that it might be wrong and do not correct it. It is the only thing you may say that the passages do not support.`;
// Answers are cut at three sentences on the server too. If the cut would drop the off claim, the claim (as authored)
// takes the third sentence, so a flagged catch always has the claim to point at.
export function capSentences(text: string, offClaim?: string, max = 3) {
  const parts = text.replace(/\s+/g, " ").trim().match(/[^.!?]+(?:[.!?]+["”’)]*|$)\s*/g)?.map((x) => x.trim()).filter(Boolean) ?? [text.trim()];
  let kept = parts.slice(0, max);
  if (offClaim) {
    const words = (t: string) => new Set(t.toLowerCase().match(/[a-z']{4,}/g) ?? []);
    const want = [...words(offClaim)], have = words(kept.join(" "));
    if (want.length && want.filter((w) => have.has(w)).length < want.length / 2) kept = [...kept.slice(0, max - 1), offClaim];
  }
  return kept.join(" ");
}
// Without the AI (or with no passage), an off claim is still delivered as written, with a pointer to the story.
const plainClaim=(claim:string)=>`${claim} Check the story if you don't believe me.`;
export async function characterReply(input:{question:string;character:{name:string;personality:string;speech_style:string;knowledge_limits:string;never_reveal:string[]};scene:string;passages:string[];offClaim?:string}) {
  const safety=screenMessage(input.question); if(safety.action!=="allow") return {text:safety.message!,safety};
  if(input.passages.length===0)return {text:input.offClaim?plainClaim(input.offClaim):`I cannot say. I have no passage from this part of the story that answers that. What detail made you wonder?`,safety};
  const ai=openai(); if(!ai) return {text:input.offClaim?plainClaim(input.offClaim):`I can’t find an answer to that in the passages I have. What detail in this scene makes you ask?`,safety};
  const completion=await ai.chat.completions.create({model:process.env.OPENAI_TEXT_MODEL||"gpt-4o-mini",messages:[{role:"system",content:`You are ${input.character.name} in a literature classroom. ${input.character.personality} Speak in this style: ${input.character.speech_style}. Limits: ${input.character.knowledge_limits}. Never reveal: ${input.character.never_reveal.join(", ")}. Use only the supplied passage and scene. If unsupported, say you do not know, in character. Never invent plot or branches, never write the student's analysis or narrative, and quote at most two sentences from the source. If asked for a judgment, answer only from your own perspective. ${ANSWER_STYLE}${input.offClaim?offClaimInstruction(input.offClaim):""} Keep responses under 55 words.`},{role:"user",content:`Allowed scene: ${input.scene}\nSource passages:\n${input.passages.join("\n\n")}\nStudent asks: ${input.question}`}],temperature:0.4,max_tokens:120});
  return {text:capSentences(completion.choices[0]?.message.content||"I cannot answer that from what I know.",input.offClaim),safety};
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
