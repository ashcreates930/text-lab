// Writes the fair-play content of a story (clue banks, Story Mode banks, writing tasks) as Markdown for review, straight
// from its world.json, so the review always matches what students get. Usage:
//   node --experimental-strip-types scripts/fair-play-review.ts sleepy-hollow [scene-number]
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages, paragraphNumber } from "../lib/source-passages.ts";
import { evidenceSentences } from "../lib/lies.ts";
import { displayLine } from "../lib/clue-game.ts";
import { sceneLies } from "../lib/story-mode.ts";

const [id, only] = process.argv.slice(2);
const world = WorldPackSchema.parse(JSON.parse(readFileSync(`worlds/${id}/world.json`, "utf8")));
const passages = parseSourcePassages(readFileSync(`worlds/${id}/source.md`, "utf8"));
const where = (line: string) => passages.find((p) => evidenceSentences(p.text).includes(line))?.id ?? "";
const quote = (line: string) => `> ¶${paragraphNumber(where(line))}: “${displayLine(line)}”`;
const out: string[] = [];
const prove = (p: { right: string; wrong: string[] } | null) => (p ? [`Prove it (✓ is right; shuffled on screen):`, "", `1. ${p.right} ✓`, ...p.wrong.map((x, i) => `${i + 2}. ${x}`), ""] : []);
const near = (n: { line: string; hint: string }[]) => (n.length ? ["Near misses:", "", ...n.flatMap((x) => [quote(x.line), ">", `> Hint: ${x.hint}`, ""])] : []);
world.scenes.forEach((scene, i) => {
  if (only && Number(only) !== i + 1) return;
  out.push(`### Scene ${i + 1} (\`${scene.id}\`)`, "");
  const writing = scene.artifacts.find((a) => a.id === (scene.writing_clue ?? scene.artifacts[0]?.id));
  if (writing) out.push(`Scene writing (Notice, Interpret, Craft): the questions from **${writing.name}**.`, "");
  for (const clue of scene.artifacts) {
    out.push(`#### Clue: ${clue.name}`, "");
    for (const q of clue.bank ?? []) {
      out.push(`**${q.ladder === "locate" ? "Locate" : "Infer"}. ${q.question}**`, "", "Answers:", "");
      for (const a of q.answers) out.push(quote(a.line), ...(a.phrase ? [">", `> Proof phrase: *${a.phrase}*`] : []), "");
      out.push(...near(q.near_misses), ...prove(q.prove));
    }
  }
  const c = scene.story_mode;
  if (!c) return;
  out.push("#### Story Mode, round 1: locate (3 lines each)", "");
  for (const q of c.read.bank) out.push(`**${q.focus}**`, "", "Answers:", "", ...q.answers.flatMap((a) => [quote(a), ""]), ...near(q.near_misses));
  const who = world.characters.find((x) => x.id === c.infer.character_id)?.name ?? c.infer.character_id;
  out.push(`#### Story Mode, round 2: infer (${who} asks; tap one line, then Prove it)`, "", `Right: ${c.infer.reaction.right}`, "", `Wrong: ${c.infer.reaction.wrong}`, "");
  for (const q of c.infer.bank) {
    out.push(`**${q.question}**`, "", "Answer:", "");
    for (const a of q.answers) out.push(quote(a.line), ...(a.phrase ? [">", `> Proof phrase: *${a.phrase}*`] : []), "");
    out.push(...near(q.near_misses), ...prove(q.prove));
  }
  out.push("#### Story Mode, round 3: catch the lie", "");
  for (const l of sceneLies(scene)) out.push(`**${world.characters.find((x) => x.id === l.character_id)?.name ?? l.character_id}**: ${l.testimony}`, "", `- False claim: *${l.false_claim}*`, `- Disproved by: ${quote(l.truth_line).slice(2)}`, "");
  out.push("#### Story Mode, round 4: build the case (pick a theory, pin 2 lines)", "");
  for (const q of c.call.bank) {
    out.push(`**${q.question}**`, "");
    for (const t of q.theories) out.push(`- ${t.name}: ${t.description}`, ...t.supports.map((s) => `  ${quote(s)}`), "");
  }
});
console.log(out.join("\n"));
