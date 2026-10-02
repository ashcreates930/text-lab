export async function speak(text:string,voiceId:string){
  if(!process.env.ELEVENLABS_API_KEY) return null;
  const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,{method:"POST",headers:{"xi-api-key":process.env.ELEVENLABS_API_KEY,"Content-Type":"application/json","Accept":"audio/mpeg"},body:JSON.stringify({text,model_id:"eleven_turbo_v2_5",voice_settings:{stability:0.55,similarity_boost:0.75}})});
  if(!response.ok) throw new Error("Voice service unavailable"); return response.arrayBuffer();
}
