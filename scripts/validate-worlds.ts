import { readFile, readdir } from "node:fs/promises";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { lieProblems } from "../lib/lies.ts";
import { hologramPngProblem } from "../lib/hologram.ts";
import { studentRoleProblems } from "../lib/student-role.ts";
import { storyModeProblems } from "../lib/story-mode.ts";
import { clueGameProblems, cluePanel } from "../lib/clue-game.ts";
import { bankProblems } from "../lib/fair-play.ts";
import { yourTurnProblems } from "../lib/your-turn.ts";
import { inflateSync } from "node:zlib";
import { cluesByPage, sentenceKey, pagePassages, pageUnits, isSpeakerLine } from "../lib/storybook.ts";
// Every playable and preview world must pass; coming-soon folders hold metadata only.
// Storybook pages (and bridge summaries) must cover the whole story in order with no gaps, every clue must land on a
// real page, and only characters the student has met can be asked questions.
function storybookProblems(world:WorldPack,source:string):string[]{
  const book=world.storybook;if(!book)return[];
  const problems:string[]=[];const passages=parseSourcePassages(source);const sectionIds=new Set(book.sections.map(s=>s.id));
  let expected=1;const gates=cluesByPage(world);const met=new Set<string>();const speaking=new Set(world.characters.map(c=>c.id));
  const lastReal=new Map<string,string>();for(const page of book.pages)if(!page.bridge)lastReal.set(page.section,page.id);
  for(const [i,page] of book.pages.entries()){
    const a=Number(page.start.slice(1)),b=Number(page.end.slice(1));
    if(a!==expected)problems.push(`${page.id} starts at ${page.start}; expected p${String(expected).padStart(3,"0")}`);
    if(b<a)problems.push(`${page.id} ends before it starts`);
    if(page.frame_required&&page.mode==="illustrated")problems.push(`${page.id} requires a picture frame but is a fully illustrated page`);
    if(!sectionIds.has(page.section))problems.push(`${page.id} uses unknown section ${page.section}`);
    const keys=new Set(pageUnits(passages,page,book.format).flatMap(u=>u.items).map(item=>sentenceKey(item.full)));
    for(const key of Object.keys(page.restatements))if(!keys.has(key))problems.push(`${page.id} has a restatement for a sentence that is not on the page`);
    // A speaker's name must never be the last line of a page: it belongs with the speech after it.
    const last=pagePassages(passages,page).at(-1);if(book.format==="script"&&last&&isSpeakerLine(last.text))problems.push(`${page.id} ends on a speaker's name (${last.id})`);
    if(page.bridge){
      if(gates[i].length)problems.push(`${page.id} is a bridge but holds ${gates[i].length} clue(s); clues must be on pages with the author's words`);
      if(page.frame_required||page.mode!=="illustrated"||page.illustration)problems.push(`${page.id} is a bridge and must not have a picture frame or illustration`);
      if(Object.keys(page.restatements).length)problems.push(`${page.id} is a bridge and must not have restatements`);
    }else if(page.frame_required&&lastReal.get(page.section)!==page.id)problems.push(`${page.id} requires a frame but is not the last page of its section`);
    if(page.no_generation&&!page.frame_prompt)problems.push(`${page.id} is writing-only but has no mood-and-setting prompt`);
    for(const c of page.characters_met){if(met.has(c.id))problems.push(`${page.id} lists ${c.id} again; Who's who adds each person once`);met.add(c.id)}
    expected=b+1;
  }
  if(expected-1!==passages.length)problems.push(`pages end at p${String(expected-1).padStart(3,"0")} but the story has ${passages.length} paragraphs`);
  for(const id of speaking)if(!met.has(id))problems.push(`AI character ${id} never appears in Who's who, so the student can never ask them`);
  const placed=gates.flat().length,total=world.scenes.reduce((n,s)=>n+s.artifacts.length,0);
  if(placed!==total)problems.push(`${total-placed} clue(s) cite paragraphs outside every page`);
  return problems;
}
const root=new URL("../worlds/",import.meta.url);let failed=false,checked=0;
// Saved answers are keyed by clue id alone, so a clue id may belong to only one story.
const clueOwners=new Map<string,string>();
for(const folder of await readdir(root,{withFileTypes:true})){
  if(!folder.isDirectory())continue;
  const pack=JSON.parse(await readFile(new URL(`${folder.name}/world.json`,root),"utf8"));
  if(pack.status==="coming_soon")continue;
  checked++;
  const result=WorldPackSchema.safeParse(pack);
  if(!result.success){failed=true;console.error(`Invalid world pack: ${folder.name}`);console.error(result.error.format());continue}
  let source:string;try{source=await readFile(new URL(`${folder.name}/source.md`,root),"utf8")}catch{failed=true;console.error(`Missing source.md: ${folder.name}`);continue}
  const problems=[...storybookProblems(result.data,source),...lieProblems(result.data,parseSourcePassages(source)),...studentRoleProblems(result.data),...storyModeProblems(result.data,parseSourcePassages(source)),...clueGameProblems(result.data,parseSourcePassages(source)),...yourTurnProblems(result.data,parseSourcePassages(source)),...bankProblems(result.data,parseSourcePassages(source),(sc,clue)=>cluePanel(result.data,parseSourcePassages(source),sc,clue))];
  // Hologram mode: every hologram listed must exist under public/ as a transparent PNG.
  for(const c of result.data.characters){if(!c.hologram)continue;let png:Buffer;try{png=await readFile(new URL(`../public${c.hologram}`,import.meta.url))}catch{problems.push(`${c.id} hologram ${c.hologram} is missing`);continue}const issue=await hologramPngProblem(png,d=>inflateSync(d));if(issue)problems.push(`${c.id} hologram ${c.hologram} ${issue}`)}
  for(const scene of result.data.scenes)for(const clue of scene.artifacts){const owner=clueOwners.get(clue.id);if(owner&&owner!==result.data.id)problems.push(`clue id ${clue.id} is also used by ${owner}; clue ids must be unique across stories`);clueOwners.set(clue.id,result.data.id)}
  if(problems.length){failed=true;console.error(`Invalid storybook: ${folder.name}`);problems.forEach(x=>console.error(`  - ${x}`));continue}
  console.log(`Valid world pack: ${result.data.id} (${result.data.status??"playable"}, ${result.data.scenes.length} scenes${result.data.storybook?`, ${result.data.storybook.pages.length} storybook pages`:""})`);
}
if(!checked){console.error("No playable or preview worlds found.");process.exit(1)}
if(failed)process.exit(1);
