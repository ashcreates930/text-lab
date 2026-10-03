import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";
import OpenAI from "openai";
import { WorldPackSchema } from "../lib/world-schema.ts";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const root=join(process.cwd(),"worlds"),publicRoot=join(process.cwd(),"public","worlds");
const openAIKey=process.env.OPENAI_API_KEY?.trim();
const elevenLabsKey=process.env.ELEVENLABS_API_KEY?.trim();
console.log(`OPENAI_API_KEY detected: ${openAIKey?"yes":"no"}`);
console.log(`ELEVENLABS_API_KEY detected: ${elevenLabsKey?"yes":"no"}`);
const imageClient=openAIKey?new OpenAI({apiKey:openAIKey}):null;
const selectedWorld=process.argv.slice(2).find(arg=>arg.startsWith("--world="))?.slice("--world=".length);
const selectedScene=process.argv.slice(2).find(arg=>arg.startsWith("--scene="))?.slice("--scene=".length);
const syncOnly=process.argv.includes("--sync-only");
const audioOnly=process.argv.includes("--audio-only");
const noAudio=process.argv.includes("--no-audio");
if(selectedWorld&&!imageClient&&!syncOnly)throw new Error(`OPENAI_API_KEY is required to generate assets for ${selectedWorld}; no files were changed.`);
if(selectedWorld&&["sleepy-hollow","trifles"].includes(selectedWorld)&&!elevenLabsKey&&!syncOnly)throw new Error(`ELEVENLABS_API_KEY is required to generate narration for ${selectedWorld}; no files were changed.`);
const usageTotals={images:0,textInputTokens:0,imageInputTokens:0,imageOutputTokens:0,audioChars:0,audioUnits:0,audioFiles:0};
const coursesById=new Map<string,string[]>();
const packs=[] as Array<{id:string;title:string;author:string;hook:string;grade_band:{min:number;max:number};estimated_minutes:number;cover_image:string;status:"playable"|"preview"|"coming_soon";teacher_preview_required:boolean;content_notes:string;available:boolean}>;
async function addLockedCard(entry:typeof packs[number]){const cover=`/worlds/${entry.id}/coming-soon.svg`;const dir=join(publicRoot,entry.id);await mkdir(dir,{recursive:true});await writeFile(join(dir,"coming-soon.svg"),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="night" x2="0" y2="1"><stop stop-color="#111820"/><stop offset="1" stop-color="#49352c"/></linearGradient><radialGradient id="moon"><stop stop-color="#d7b885" stop-opacity=".45"/><stop offset="1" stop-color="#d7b885" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#night)"/><circle cx="1140" cy="260" r="330" fill="url(#moon)"/><path d="M0 710 300 540l270 145 250-210 250 220 250-150 280 150v205H0z" fill="#101313" opacity=".86"/><path d="M0 800h1600" stroke="#a17b5a" stroke-opacity=".45" stroke-width="4"/></svg>`);packs.push({...entry,cover_image:cover,available:false})}
for(const folder of await readdir(root,{withFileTypes:true})){
  if(!folder.isDirectory())continue;
  const dir=join(root,folder.name);let metadata:any={};
  try{metadata=JSON.parse(await readFile(join(dir,"world.json"),"utf8"))}catch{}
  if(Array.isArray(metadata.courses))coursesById.set(String(metadata.id||folder.name),metadata.courses.map(String));
  const fallbackTitle=folder.name.split("-").map(x=>x[0]?.toUpperCase()+x.slice(1)).join(" ");
  const locked={id:String(metadata.id||folder.name),title:String(metadata.title||fallbackTitle),author:String(metadata.author||"Author to be confirmed"),hook:String(metadata.hook||"This story is being prepared."),grade_band:metadata.grade_band&&Number.isFinite(metadata.grade_band.min)&&Number.isFinite(metadata.grade_band.max)?metadata.grade_band:{min:6,max:12},estimated_minutes:Number(metadata.estimated_minutes)||0,cover_image:"",status:(metadata.status==="preview"?"preview":metadata.status==="coming_soon"?"coming_soon":"playable") as "playable"|"preview"|"coming_soon",teacher_preview_required:metadata.teacher_preview_required===true,content_notes:String(metadata.content_notes||""),available:false};
  let pack;
  try{pack=WorldPackSchema.parse(metadata)}catch{await addLockedCard(locked);console.log(`Locked incomplete world: ${locked.id}`);continue}
  try{await readFile(join(dir,"source.md"),"utf8")}catch{await addLockedCard({...locked,id:pack.id,title:pack.title,author:pack.author,hook:pack.hook,grade_band:pack.grade_band,estimated_minutes:pack.estimated_minutes});console.log(`Locked world without source: ${pack.id}`);continue}
  const out=join(publicRoot,pack.id);await mkdir(out,{recursive:true});
  if(selectedWorld&&folder.name!==selectedWorld){
    let ready=true;for(const scene of pack.scenes){try{await readFile(join(out,scene.background_image.split("/").pop()||`${scene.id}.png`))}catch{ready=false;break}}
    if(ready){const firstScene=pack.scenes[0];packs.push({id:pack.id,title:pack.title,author:pack.author,hook:pack.hook,grade_band:pack.grade_band,estimated_minutes:pack.estimated_minutes,cover_image:firstScene?.background_image||"",status:pack.status||"playable",teacher_preview_required:pack.teacher_preview_required===true,content_notes:pack.content_notes||"",available:!!firstScene});console.log(`Listed existing complete world: ${pack.id}`)}
    else{await addLockedCard({...locked,id:pack.id,title:pack.title,author:pack.author,hook:pack.hook,grade_band:pack.grade_band,estimated_minutes:pack.estimated_minutes});console.log(`Locked world without complete assets: ${pack.id}`)}
    continue;
  }
  for(const scene of pack.scenes){try{await readFile(join(out,`${scene.id}.png`));scene.background_image=`/worlds/${pack.id}/${scene.id}.png`}catch{}}
  await writeFile(join(out,"source.md"),await readFile(join(dir,"source.md"),"utf8"));
  try{const tdir=join(dir,"translations");const files=(await readdir(tdir)).filter(f=>/^([a-z]{2}|source)\.json$/.test(f));if(files.length){await mkdir(join(out,"translations"),{recursive:true});for(const f of files)await writeFile(join(out,"translations",f),await readFile(join(tdir,f),"utf8"))}}catch{}
  for(const [i,scene] of pack.scenes.entries()){
    if(syncOnly)continue;
    if(selectedScene&&scene.id!==selectedScene)continue;
    const title=scene.id.replaceAll("-"," ").replace(/^./,x=>x.toUpperCase());
    if(imageClient&&!audioOnly){
      const sceneComposition=pack.id==="tell-tale-heart"?{
        arrival:"Night exterior of the old house, with its weathered street door prominent near the lower center-left and two or three anonymous, indistinct officer silhouettes arriving at the right. No lanterns or other light-bearing props. Keep the upper-left 42% and upper 35% as plain, empty, unmarked dark sky and wall.",
        search:"A quiet, dim old bedroom after a careful search. No people, faces, hands, or human figures. Keep the upper-left 42% and upper 35% as plain, empty, unmarked dark wall. Show a chair, the bed, and a small closed wooden chest with its valuables intact and undisturbed on the right side; nothing is being opened or removed.",
        confession:"A dim old bedroom during the narrator's confession. Place two calm, featureless shadow silhouettes of officers together in the right-center of the room and one distressed, featureless shadow silhouette of the narrator lower-center. No visible faces, facial features, uniforms, badges, candles, lamps, lanterns, or other light sources. Keep the upper-left 42% and upper 35% as plain, empty, unmarked dark wall. Show bare floorboards near the bottom of the scene.",
      }[scene.id]:pack.id==="sleepy-hollow"?"A richly legible, painterly interior of a small one-room Hudson Valley log schoolhouse on an autumn morning. View from inside the room toward a large patched copybook-paper window occupying the right half of the frame; through the window, clearly show an autumn road leading to a small wooden bridge over a brook. Put an empty lesson desk and patched copybook shutters toward the upper-left. In the lower-left foreground, make a distinct small cloth bundle beside a closed psalm-tune book and a broken pitch-pipe. On a separate lower-right desk, clearly show three distinct old personal books belonging to Ichabod, with one open fortune-telling book and a loose sheet of foolscap covered in indistinct unreadable pen marks. Let a sleeve of an older farmer suggest that he is examining the books, but do not show a hand or face. All clue objects should be bright enough to recognize against the room; no flames, no readable writing, no people in detail." :pack.id==="trifles"?"A richly legible, gloomy cold farmhouse kitchen in winter, early 1900s, with period furnishings and no people. Light the kitchen enough that the evidence is easy to recognize. Arrange five clearly separated clue areas with generous empty space between them: at far left, the open kitchen doorway and Mrs. Wright's empty rocking chair; at upper-right on the counter, four visibly cracked glass preserve jars with fruit inside; at center-left on a kitchen table, a bright patchwork quilt with a few uneven stitches; at center-right, a clearly recognizable wire birdcage with its little door hanging loose from one pulled hinge; at lower-right, an open sewing basket holding a small closed box wrapped in silk, with no bird visible. Include cupboard, stove, and ordinary kitchen disorder in the background. Do not show a rope, body, violence, lettering, signs, or detailed people. Keep each of these five objects separately visible and easy to target." :undefined;
      const prompt=`Create a cinematic, school-appropriate literary scene background for ${pack.title}, scene ${title}. Atmosphere: restrained American Gothic, dark wood, moonlit amber glow, deep charcoal shadows, subtle dust, painterly editorial realism. Compose a full-bleed wide 3:2 establishing image. ${sceneComposition||"Keep the upper-left 42% and upper 35% plain, dark, empty, and unmarked; arrange only story-supported physical details naturally in the scene."} The image must contain absolutely no typography or writing of any kind: no words, letters, numbers, signs, captions, headings, or title text. Do not draw hotspot markers, bounding boxes, rectangles, outlines, rings, borders, labels, logos, frames, UI, or overlay graphics. Do not add unsupported props. No visible violence, weapons, or gore; no detailed or identifiable people.`;
      const result=await imageClient.images.generate({model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-1",prompt,size:"1536x1024",quality:"low"});
      const encoded=result.data?.[0]?.b64_json;if(!encoded)throw new Error(`OpenAI returned no image for ${pack.id}/${scene.id}`);
      scene.background_image=`/worlds/${pack.id}/${scene.id}.png`;await writeFile(join(out,`${scene.id}.png`),Buffer.from(encoded,"base64"));
      if(result.usage){usageTotals.images++;usageTotals.textInputTokens+=result.usage.input_tokens_details.text_tokens;usageTotals.imageInputTokens+=result.usage.input_tokens_details.image_tokens;usageTotals.imageOutputTokens+=result.usage.output_tokens;}
      console.log(`Generated ${pack.id}/${scene.id}.png${result.usage?` · usage: ${result.usage.total_tokens} tokens`:""}`);
    }
    if(!imageClient&&!audioOnly){
      const art=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#151a23"/><stop offset="1" stop-color="#38251f"/></linearGradient><radialGradient id="lamp"><stop stop-color="#edb878" stop-opacity=".7"/><stop offset="1" stop-color="#edb878" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="1000" fill="url(#g)"/><ellipse cx="850" cy="550" rx="520" ry="390" fill="url(#lamp)"/><path d="M150 0V1000M1480 0V1000M150 150H500V700H150M1480 150H1110V700H1480" fill="none" stroke="#87634d" stroke-width="24" opacity=".55"/><path d="M0 790H1600M0 900H1600" stroke="#77533f" stroke-width="10" opacity=".55"/><path d="M770 650h300v130H770zM800 540q120-190 240 0v110H800z" fill="#171718" opacity=".8"/><circle cx="945" cy="450" r="36" fill="#d9bb93" opacity=".8"/><text x="90" y="940" fill="#e6d7c1" font-family="Georgia" font-size="32" letter-spacing="8">${title.toUpperCase()}</text></svg>`;
      const file=scene.background_image.split("/").pop()||`${scene.id}.svg`;
      await writeFile(join(out,file),art);
    }
    if(!syncOnly&&!noAudio&&scene.narration_audio&&elevenLabsKey){
      const voiceId=pack.characters[0]?.voice_id||"onwK4e9ZLuTAKqWW03F9";
      const audioResponse=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,{method:"POST",headers:{"xi-api-key":elevenLabsKey,"Content-Type":"application/json","Accept":"audio/mpeg"},body:JSON.stringify({text:scene.narration,model_id:"eleven_turbo_v2_5",voice_settings:{stability:0.55,similarity_boost:0.75}})});
      if(!audioResponse.ok)throw new Error(`ElevenLabs narration failed for ${pack.id}/${scene.id} (${audioResponse.status})`);
      const chars=Number(audioResponse.headers.get("character-cost"))||scene.narration.length;
      usageTotals.audioChars+=scene.narration.length;usageTotals.audioUnits+=chars;usageTotals.audioFiles++;
      const audioFile=scene.narration_audio.split("/").pop()||`${scene.id}.mp3`;
      await writeFile(join(out,audioFile),Buffer.from(await audioResponse.arrayBuffer()));
      console.log(`Generated ${pack.id}/${audioFile} · ${chars} ElevenLabs characters`);
    }
  }
  await writeFile(join(out,"world.json"),JSON.stringify(pack));
  const firstScene=pack.scenes[0];
  packs.push({id:pack.id,title:pack.title,author:pack.author,hook:pack.hook,grade_band:pack.grade_band,estimated_minutes:pack.estimated_minutes,cover_image:firstScene?.background_image||"",status:pack.status||"playable",teacher_preview_required:pack.teacher_preview_required===true,content_notes:pack.content_notes||"",available:!!firstScene});
  console.log(`Prepared ${pack.id}: ${pack.scenes.length} scene backgrounds.`);
}
const statusOrder={playable:0,preview:1,coming_soon:2};
packs.sort((a,b)=>statusOrder[a.status]-statusOrder[b.status]||a.grade_band.min-b.grade_band.min||a.title.localeCompare(b.title));
await writeFile(join(publicRoot,"index.json"),JSON.stringify(packs.map(p=>({...p,courses:coursesById.get(p.id)??["best_ela"]}))));
console.log(`Prepared ${packs.length} validated world pack(s).`);
if(usageTotals.images){
  const cost=(usageTotals.textInputTokens*5+usageTotals.imageInputTokens*10+usageTotals.imageOutputTokens*40)/1_000_000;
  console.log(`Estimated OpenAI generation cost: $${cost.toFixed(6)} (${usageTotals.images} image(s), based on returned token usage; excludes taxes or organization-specific adjustments).`);
}
if(usageTotals.audioFiles){
  console.log(`ElevenLabs audio usage: ${usageTotals.audioUnits} billable characters across ${usageTotals.audioFiles} file(s). Estimated Turbo API cost: $${(usageTotals.audioUnits*0.05/1000).toFixed(4)} at $0.05/1K characters; actual account plan and credit adjustments may differ.`);
}
