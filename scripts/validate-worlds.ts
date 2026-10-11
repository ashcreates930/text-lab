import { readFile, readdir } from "node:fs/promises";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { cluesByPage, splitSentences, sentenceKey, pagePassages } from "../lib/storybook.ts";
// Every playable and preview world must pass; coming-soon folders hold metadata only.
// Storybook pages must cover the whole story in order with no gaps, and every clue must land on a page.
function storybookProblems(world:WorldPack,source:string):string[]{
  const book=world.storybook;if(!book)return[];
  const problems:string[]=[];const passages=parseSourcePassages(source);const sectionIds=new Set(book.sections.map(s=>s.id));
  let expected=1;
  for(const page of book.pages){
    const a=Number(page.start.slice(1)),b=Number(page.end.slice(1));
    if(a!==expected)problems.push(`${page.id} starts at ${page.start}; expected p${String(expected).padStart(3,"0")}`);
    if(b<a)problems.push(`${page.id} ends before it starts`);
    if(!sectionIds.has(page.section))problems.push(`${page.id} uses unknown section ${page.section}`);
    const keys=new Set(pagePassages(passages,page).flatMap(p=>splitSentences(p.text)).map(sentenceKey));
    for(const key of Object.keys(page.restatements))if(!keys.has(key))problems.push(`${page.id} has a restatement for a sentence that is not on the page`);
    expected=b+1;
  }
  if(expected-1!==passages.length)problems.push(`pages end at p${String(expected-1).padStart(3,"0")} but the story has ${passages.length} paragraphs`);
  const placed=cluesByPage(world).flat().length,total=world.scenes.reduce((n,s)=>n+s.artifacts.length,0);
  if(placed!==total)problems.push(`${total-placed} clue(s) cite paragraphs outside every page`);
  return problems;
}
const root=new URL("../worlds/",import.meta.url);let failed=false,checked=0;
for(const folder of await readdir(root,{withFileTypes:true})){
  if(!folder.isDirectory())continue;
  const pack=JSON.parse(await readFile(new URL(`${folder.name}/world.json`,root),"utf8"));
  if(pack.status==="coming_soon")continue;
  checked++;
  const result=WorldPackSchema.safeParse(pack);
  if(!result.success){failed=true;console.error(`Invalid world pack: ${folder.name}`);console.error(result.error.format());continue}
  let source:string;try{source=await readFile(new URL(`${folder.name}/source.md`,root),"utf8")}catch{failed=true;console.error(`Missing source.md: ${folder.name}`);continue}
  const problems=storybookProblems(result.data,source);
  if(problems.length){failed=true;console.error(`Invalid storybook: ${folder.name}`);problems.forEach(x=>console.error(`  - ${x}`));continue}
  console.log(`Valid world pack: ${result.data.id} (${result.data.status??"playable"}, ${result.data.scenes.length} scenes${result.data.storybook?`, ${result.data.storybook.pages.length} storybook pages`:""})`);
}
if(!checked){console.error("No playable or preview worlds found.");process.exit(1)}
if(failed)process.exit(1);
