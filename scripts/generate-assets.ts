import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";
import OpenAI from "openai";
import sharp from "sharp";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { narrationParts } from "../lib/narration.ts";
import { frameArtPrompt, providedSceneDescription } from "../lib/frame-art.ts";
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
// --portraits: one square, painted, head-and-shoulders portrait per character, from the character's description, saved to
// public/worlds/<story>/characters/<id>.png and recorded as `portrait` in worlds/<story>/world.json.
// --ambient: one quiet, loopable ambient track per scene (ElevenLabs sound generation), saved to
// public/worlds/<story>/<scene>-ambient.mp3 and recorded as the scene's `ambient_audio`.
// Both take --world=<id> (several allowed, comma-separated) and leave every other file alone. --ambient also takes
// --only <scene-id> (or --only=<scene-id,...>) to regenerate just those scenes. A regenerated track gets a new
// versioned name (<scene>-ambient-v2.mp3, -v3, ...) so no browser or CDN cache can keep playing the old one.
// --holograms: one transparent-background PNG per character for Hologram mode (full figure from the waist up, lit
// from the front, nothing behind them), saved to public/worlds/<story>/holograms/<id>.png and recorded as `hologram` in
// worlds/<story>/world.json. Takes --world=<id,...> and --only=<story/character,...>.
const portraitsMode=process.argv.includes("--portraits"),ambientMode=process.argv.includes("--ambient"),hologramsMode=process.argv.includes("--holograms");
const onlyArg=process.argv.findIndex(a=>a==="--only"||a.startsWith("--only="));
const onlyScenes=ambientMode&&onlyArg>=0?(process.argv[onlyArg]==="--only"?process.argv[onlyArg+1]??"":process.argv[onlyArg].slice(7)).split(",").filter(Boolean):null;
// One sound description per scene, from the scene's setting.
const ambientPrompts:Record<string,string>={
  "sleepy-hollow/empty-schoolhouse":"A busy one-room schoolhouse in 1790s rural New York: many children murmuring and reciting lessons at once, a low steady hum like a beehive, wooden benches scraping, slates tapping, an occasional stern voice calling for quiet. No music. Seamless loop.",
  "sleepy-hollow/van-tassel-party":"A farmhouse party in the next room, heard through a wall: a crackling fireplace, warm muffled voices and laughter, a faint distant fiddle.",
  "sleepy-hollow/the-road-home":"A lonely country road at night in autumn: wind moving through bare trees, creaking branches, crickets, a small stream nearby, very distant owl.",
  "sleepy-hollow/the-towns-verdict":"A country churchyard on a quiet Sunday morning: soft murmuring voices at a distance, birds, a light breeze in tall trees, a brook.",
  "trifles/kitchen":"A cold, empty farmhouse kitchen in winter: wind pressing against the windows, a small iron stove crackling, a wall clock ticking.",
  "trifles/minnie-foster":"A quiet farmhouse kitchen on a winter day: a wall clock ticking, the stove ticking as it warms, wind outside, an occasional creak of floorboards.",
  "trifles/the-law-and-the-women":"A very quiet farmhouse kitchen: a clock ticking slowly, faint wind outside, muffled footsteps and floorboards upstairs.",
  "trifles/the-last-word":"A farmhouse kitchen as a cold winter day ends: wind outside, a horse team shifting and snorting faintly in the yard, a clock ticking.",
  "tell-tale-heart/arrival":"An old city street at four in the morning in the 1840s: a light night wind, distant dog barking once, footsteps on stone far away, a door latch.",
  "tell-tale-heart/search":"Inside a quiet old house at night: floorboards creaking under slow footsteps, a clock ticking in another room, soft wind at the shutters.",
  "tell-tale-heart/room":"A dark, still bedroom late at night: deep quiet, a pocket watch ticking softly, a faint draft, an old house settling.",
  "tell-tale-heart/confession":"A quiet room with a few people sitting still: a low muffled ticking like a watch wrapped in cloth, chairs creaking, faint daylight street sounds outside.",
};
// --narration: the scene's own reading, read aloud by the narrator voice, one file per paragraph, saved to
// public/worlds/<story>/narration/<scene>/<paragraph>.mp3. It reads exactly the paragraphs in "Read this part of the
// story" (lib/narration.ts). Files that already exist are kept, so a run stopped by the monthly character limit picks up
// where it left off; --force records them again. Takes --world=<id,...>, --scene=<id> and --only=<part,...> (paragraph ids,
// or note-<paragraph> for a content note, which is read just before its paragraph). The app reads any paragraph
// without a file with the browser's own speech, so nothing breaks while files are missing.
// --frames: the story's own storyboard pictures, one per "illustrated" or "add_detail" page with a scene_description
// (add_detail pictures leave out their missing detail), saved to public/worlds/<story>/frames/<page-id>.png, with
// illustration.src set and status "generated". Pages marked no_generation are skipped. Takes --world=<id,...>,
// --only=<page-id,...> and --force (otherwise pages that already have a picture are kept).
if(process.argv.includes("--frames")){
  if(!imageClient)throw new Error("OPENAI_API_KEY is required for storyboard frames.");
  const sharp=(await import("sharp")).default;
  const only=process.argv.find(a=>a.startsWith("--only="))?.slice(7).split(",");
  const force=process.argv.includes("--force");
  for(const id of (selectedWorld??"sleepy-hollow,trifles,tell-tale-heart").split(",")){
    const file=join(root,id,"world.json"),raw=JSON.parse(await readFile(file,"utf8"));const pack=WorldPackSchema.parse(raw);
    await mkdir(join(publicRoot,id,"frames"),{recursive:true});
    for(const page of raw.storybook?.pages??[]){
      const art=page.illustration;
      if(page.bridge||!art?.scene_description||!["illustrated","add_detail"].includes(page.mode)||page.no_generation)continue;
      if(only&&!only.includes(page.id))continue;
      const src=`/worlds/${id}/frames/${page.id}.png`;
      if(!force&&art.src===src){try{await readFile(join(process.cwd(),"public",src));continue}catch{}}
      const result=await imageClient.images.generate({model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-1",prompt:frameArtPrompt(pack,providedSceneDescription(art.scene_description)),size:"1536x1024",quality:"medium"});
      const encoded=result.data?.[0]?.b64_json;if(!encoded)throw new Error(`OpenAI returned no image for ${id}/${page.id}`);
      // 768 x 512 keeps each frame small enough to load quickly on a school network.
      await writeFile(join(process.cwd(),"public",src),await sharp(Buffer.from(encoded,"base64")).resize(768,512).png({palette:true,quality:90}).toBuffer());
      art.src=src;art.status="generated";
      await writeFile(file,JSON.stringify(raw,null,2)+"\n");
      console.log(`Frame ${id}/${page.id}.png · ${result.usage?.total_tokens??"?"} tokens`);
    }
    WorldPackSchema.parse(raw);
  }
  console.log("Done. Run npm run sync:worlds to copy the updated world files.");
  process.exit(0);
}
if(process.argv.includes("--narration")){
  if(!elevenLabsKey)throw new Error("ELEVENLABS_API_KEY is required for narration.");
  const voice=process.env.ELEVENLABS_NARRATOR_VOICE?.trim()||"onwK4e9ZLuTAKqWW03F9";
  const force=process.argv.includes("--force");let made=0,kept=0,chars=0;
  const onlyParts=process.argv.find(a=>a.startsWith("--only="))?.slice(7).split(",");
  for(const id of (selectedWorld??"sleepy-hollow,trifles,tell-tale-heart").split(",")){
    const pack=WorldPackSchema.parse(JSON.parse(await readFile(join(root,id,"world.json"),"utf8")));
    const passages=parseSourcePassages(await readFile(join(root,id,"source.md"),"utf8"));
    for(const scene of pack.scenes){
      if(selectedScene&&scene.id!==selectedScene)continue;
      const parts=narrationParts(pack,scene,passages);
      await mkdir(join(publicRoot,id,"narration",scene.id),{recursive:true});
      for(const [i,part] of parts.entries()){
        if(onlyParts&&!onlyParts.includes(part.id))continue;
        const file=join(process.cwd(),"public",part.src);
        if(!force){try{await readFile(file);kept++;continue}catch{}}
        const res=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`,{method:"POST",headers:{"xi-api-key":elevenLabsKey,"Content-Type":"application/json","Accept":"audio/mpeg"},body:JSON.stringify({text:part.text,model_id:"eleven_turbo_v2_5",voice_settings:{stability:0.6,similarity_boost:0.75},previous_text:parts[i-1]?.text.slice(-400),next_text:parts[i+1]?.text.slice(0,400)})});
        if(!res.ok){
          const detail=(await res.text()).slice(0,200);
          console.log(`Stopped at ${id}/${scene.id}/${part.id} (${res.status}): ${detail}`);
          console.log(`Recorded ${made} paragraph(s) (${chars} characters); ${kept} already existed. Run the same command again to continue.`);
          process.exit(1);
        }
        await writeFile(file,Buffer.from(await res.arrayBuffer()));made++;chars+=part.text.length;
        console.log(`Narration ${id}/${scene.id}/${part.id}.mp3 · ${part.text.length} characters`);
      }
    }
  }
  console.log(`Done. Recorded ${made} paragraph(s) (${chars} characters); ${kept} already existed.`);
  process.exit(0);
}
if(portraitsMode||ambientMode||hologramsMode){
  const worlds=(selectedWorld??"sleepy-hollow,trifles,tell-tale-heart").split(",");
  // Period and setting per story, so every portrait matches its scene art.
  const period:Record<string,string>={
    "sleepy-hollow":"a Dutch farming valley on the Hudson River around 1790; homespun wool coat, linen shirt, waistcoat",
    "trifles":"a lonely Iowa farmhouse in winter around 1916; plain heavy wool winter clothing of a farm family",
    "tell-tale-heart":"an American city around 1843; dark plain clothing of the period",
  };
  // Story-specific limits from each story's art style: the Tell-Tale Heart narrator's face is never shown.
  const special:Record<string,string>={
    "tell-tale-heart/narrator":"Show him only as a shadowed silhouette from the side: no visible face or features, just the outline of head and shoulders in dark clothing, lit faintly from behind.",
    "sleepy-hollow/brom-bones":"A burly, broad-shouldered young farmer with short curly black hair, a bold, good-humored face, and a fur cap with a fox tail.",
    "sleepy-hollow/hans-van-ripper":"An older, weathered Dutch farmer with a stern, practical face.",
    "tell-tale-heart/officer":"A woman police officer of the period in a plain dark wool uniform coat, no badge or insignia, with a calm, observant face.",
  };
  for(const id of worlds){
    const file=join(root,id,"world.json"),raw=JSON.parse(await readFile(file,"utf8"));const pack=WorldPackSchema.parse(raw);
    const out=join(publicRoot,id);await mkdir(join(out,"characters"),{recursive:true});
    if(portraitsMode){
      if(!imageClient)throw new Error("OPENAI_API_KEY is required for portraits.");
      // --only=trifles/mr-hale,... regenerates just those characters.
      const only=process.argv.find(a=>a.startsWith("--only="))?.slice(7).split(",");
      for(const c of pack.characters){
        if(only&&!only.includes(`${id}/${c.id}`))continue;
        const prompt=`A painted portrait for a school literature app: ${c.name}, from ${pack.title} by ${pack.author}. ${c.description} ${special[`${id}/${c.id}`]??""} Setting and clothing: ${period[id]??"period-accurate clothing"}. Head and shoulders, centered, facing slightly to one side, against a plain, solid, very dark brown backdrop: no scenery, landscape, windows, buildings, or objects behind them. Warm, low lantern light; painterly gouache-and-oil look with visible brush texture, matching a restrained American Gothic storybook style. Calm, dignified, age-appropriate for students. An original design, not based on any film, television adaptation, or illustrated edition. No text, letters, frames, or borders.`;
        const result=await imageClient.images.generate({model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-1",prompt,size:"1024x1024",quality:"medium"});
        const encoded=result.data?.[0]?.b64_json;if(!encoded)throw new Error(`No portrait returned for ${id}/${c.id}`);
        await writeFile(join(out,"characters",`${c.id}.png`),Buffer.from(encoded,"base64"));
        const target=raw.characters.find((x:{id:string})=>x.id===c.id);target.portrait=`/worlds/${id}/characters/${c.id}.png`;
        console.log(`Portrait ${id}/${c.id}.png${result.usage?` · ${result.usage.total_tokens} tokens`:""}`);
      }
    }
    if(hologramsMode){
      if(!imageClient)throw new Error("OPENAI_API_KEY is required for holograms.");
      await mkdir(join(out,"holograms"),{recursive:true});
      const only=process.argv.find(a=>a.startsWith("--only="))?.slice(7).split(",");
      for(const c of pack.characters){
        if(only&&!only.includes(`${id}/${c.id}`))continue;
        // The figure is reflected in a clear pyramid over a black screen: bright, high-contrast edges read best, and
        // anything dark disappears. The Tell-Tale Heart narrator stays a faceless silhouette, edged in light.
        const prompt=`A character figure for a school literature app's hologram display: ${c.name}, from ${pack.title} by ${pack.author}. ${c.description} ${special[`${id}/${c.id}`]??""} Setting and clothing: ${period[id]??"period-accurate clothing"}. Waist up, centered, facing the viewer, the whole figure inside the frame with empty space around it. Bright, even front lighting with a soft pale rim light on the edges so the figure glows against black; painterly storybook style. Fully transparent background: no backdrop, floor, shadow, scenery, or objects. Calm, dignified, age-appropriate for students. An original design, not based on any film, television adaptation, or illustrated edition. No text, letters, frames, or borders.`;
        const result=await imageClient.images.generate({model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-1",prompt,size:"1024x1024",quality:"medium",background:"transparent",output_format:"png"});
        const encoded=result.data?.[0]?.b64_json;if(!encoded)throw new Error(`No hologram returned for ${id}/${c.id}`);
        // 768px palette PNG with transparency: about 300 KB instead of 2 MB, for phones on school Wi-Fi.
        await sharp(Buffer.from(encoded,"base64")).resize(768).png({palette:true,quality:90,compressionLevel:9,effort:10}).toFile(join(out,"holograms",`${c.id}.png`));
        const target=raw.characters.find((x:{id:string})=>x.id===c.id);target.hologram=`/worlds/${id}/holograms/${c.id}.png`;
        console.log(`Hologram ${id}/${c.id}.png${result.usage?` · ${result.usage.total_tokens} tokens`:""}`);
      }
    }
    if(ambientMode){
      if(!elevenLabsKey)throw new Error("ELEVENLABS_API_KEY is required for ambient sound.");
      for(const scene of raw.scenes as {id:string;ambient_audio?:string|null;ambient_prompt?:string}[]){
        if(onlyScenes&&!onlyScenes.includes(scene.id)&&!onlyScenes.includes(`${id}/${scene.id}`))continue;
        const prompt=ambientPrompts[`${id}/${scene.id}`];if(!prompt){console.log(`No ambient prompt for ${id}/${scene.id}; skipped.`);continue}
        const body=(loop:boolean)=>JSON.stringify({text:`${prompt} Quiet, steady, seamless background ambience for reading, no music, no sudden loud sounds.`,duration_seconds:22,prompt_influence:0.5,...(loop?{loop:true,model_id:"eleven_text_to_sound_v2"}:{})});
        let res=await fetch("https://api.elevenlabs.io/v1/sound-generation",{method:"POST",headers:{"xi-api-key":elevenLabsKey,"Content-Type":"application/json","Accept":"audio/mpeg"},body:body(true)});
        if(!res.ok){console.log(`Looping sound generation not available (${res.status}); generating a plain track.`);res=await fetch("https://api.elevenlabs.io/v1/sound-generation",{method:"POST",headers:{"xi-api-key":elevenLabsKey,"Content-Type":"application/json","Accept":"audio/mpeg"},body:body(false)})}
        if(!res.ok)throw new Error(`ElevenLabs sound generation failed for ${id}/${scene.id} (${res.status})`);
        // First recording: <scene>-ambient.mp3. Each regeneration: the next -vN name, so caches never serve the old track.
        const current=scene.ambient_audio?.match(/-ambient(?:-v(\d+))?\.mp3$/);
        const file=current?`${scene.id}-ambient-v${Number(current[1]??1)+1}.mp3`:`${scene.id}-ambient.mp3`;
        await writeFile(join(out,file),Buffer.from(await res.arrayBuffer()));
        scene.ambient_audio=`/worlds/${id}/${file}`;
        console.log(`Ambient ${id}/${file}`);
      }
    }
    WorldPackSchema.parse(raw);
    await writeFile(file,JSON.stringify(raw,null,2)+"\n");
  }
  console.log("Done. Run npm run sync:worlds to copy the updated world files.");
  process.exit(0);
}
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
      // A scene-level art_direction in world.json wins; the per-world strings below remain for scenes written before that field existed.
      const sceneComposition=scene.art_direction??(pack.id==="tell-tale-heart"?{
        arrival:"Night exterior of the old house, with its weathered street door prominent near the lower center-left and two or three anonymous, indistinct officer silhouettes arriving at the right. No lanterns or other light-bearing props. Keep the upper-left 42% and upper 35% as plain, empty, unmarked dark sky and wall.",
        search:"A quiet, dim old bedroom after a careful search. No people, faces, hands, or human figures. Keep the upper-left 42% and upper 35% as plain, empty, unmarked dark wall. Show a chair, the bed, and a small closed wooden chest with its valuables intact and undisturbed on the right side; nothing is being opened or removed.",
        confession:"A dim old bedroom during the narrator's confession. Place two calm, featureless shadow silhouettes of officers together in the right-center of the room and one distressed, featureless shadow silhouette of the narrator lower-center. No visible faces, facial features, uniforms, badges, candles, lamps, lanterns, or other light sources. Keep the upper-left 42% and upper 35% as plain, empty, unmarked dark wall. Show bare floorboards near the bottom of the scene.",
      }[scene.id]:pack.id==="sleepy-hollow"?"A richly legible, painterly interior of a small one-room Hudson Valley log schoolhouse on an autumn morning. View from inside the room toward a large patched copybook-paper window occupying the right half of the frame; through the window, clearly show an autumn road leading to a small wooden bridge over a brook. Put an empty lesson desk and patched copybook shutters toward the upper-left. In the lower-left foreground, make a distinct small cloth bundle beside a closed psalm-tune book and a broken pitch-pipe. On a separate lower-right desk, clearly show three distinct old personal books belonging to Ichabod, with one open fortune-telling book and a loose sheet of foolscap covered in indistinct unreadable pen marks. Let a sleeve of an older farmer suggest that he is examining the books, but do not show a hand or face. All clue objects should be bright enough to recognize against the room; no flames, no readable writing, no people in detail." :pack.id==="trifles"?"A richly legible, gloomy cold farmhouse kitchen in winter, early 1900s, with period furnishings and no people. Light the kitchen enough that the evidence is easy to recognize. Arrange five clearly separated clue areas with generous empty space between them: at far left, the open kitchen doorway and Mrs. Wright's empty rocking chair; at upper-right on the counter, four visibly cracked glass preserve jars with fruit inside; at center-left on a kitchen table, a bright patchwork quilt with a few uneven stitches; at center-right, a clearly recognizable wire birdcage with its little door hanging loose from one pulled hinge; at lower-right, an open sewing basket holding a small closed box wrapped in silk, with no bird visible. Include cupboard, stove, and ordinary kitchen disorder in the background. Do not show a rope, body, violence, lettering, signs, or detailed people. Keep each of these five objects separately visible and easy to target." :undefined);
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
