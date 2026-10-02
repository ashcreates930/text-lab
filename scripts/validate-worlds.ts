import { readFile, readdir } from "node:fs/promises";
import { WorldPackSchema } from "../lib/world-schema.ts";
// Every playable and preview world must pass; coming-soon folders hold metadata only.
const root=new URL("../worlds/",import.meta.url);let failed=false,checked=0;
for(const folder of await readdir(root,{withFileTypes:true})){
  if(!folder.isDirectory())continue;
  const pack=JSON.parse(await readFile(new URL(`${folder.name}/world.json`,root),"utf8"));
  if(pack.status==="coming_soon")continue;
  checked++;
  const result=WorldPackSchema.safeParse(pack);
  if(!result.success){failed=true;console.error(`Invalid world pack: ${folder.name}`);console.error(result.error.format());continue}
  try{await readFile(new URL(`${folder.name}/source.md`,root),"utf8")}catch{failed=true;console.error(`Missing source.md: ${folder.name}`);continue}
  console.log(`Valid world pack: ${result.data.id} (${result.data.status??"playable"}, ${result.data.scenes.length} scenes)`);
}
if(!checked){console.error("No playable or preview worlds found.");process.exit(1)}
if(failed)process.exit(1);
