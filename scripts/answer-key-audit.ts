// Prints a scene's full answer key as Markdown, for the answer-key audit (docs/answer-key-audit.md): every question as
// students see it, every accepted line with its paragraph, every near miss with its hint. Clue banks and off claims,
// Spot the Lie, Story Mode rounds 1 to 4, and Your Turn activities (the demo versions for the start scene).
// Usage: node --experimental-strip-types scripts/answer-key-audit.ts <world-id> <scene number, 1-based>
import { readFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages, readingPortions } from "../lib/source-passages.ts";
import { evidenceSentences } from "../lib/lies.ts";
import { cluePanel } from "../lib/clue-game.ts";

const [worldId, sceneArg] = process.argv.slice(2);
const world = WorldPackSchema.parse(JSON.parse(readFileSync(`worlds/${worldId}/world.json`, "utf8")));
const passages = parseSourcePassages(readFileSync(`worlds/${worldId}/source.md`, "utf8"));
const si = Number(sceneArg) - 1, scene = world.scenes[si];
const flat = (s: string) => s.replace(/\s+/g, " ").trim();
const pidOf = (line: string) => passages.find((p) => evidenceSentences(p.text).some((x) => flat(x) === flat(line)))?.id ?? "??";
const lab = (pid: string) => `¶${Number(pid.slice(1))}`;
const q = (line: string, pid?: string) => `${lab(pid ?? pidOf(line))}: "${flat(line)}"`;
const name = (id: string | null | undefined) => world.characters.find((c) => c.id === id)?.name ?? id ?? "";
const out: string[] = [];
const reading = readingPortions(passages, world.scenes)[si] ?? [];
out.push(`## ${world.title} · Scene ${si + 1} (${scene.id})`, "", `Reading: ${reading.map((p) => lab(p.id)).join(", ")}`, "");

for (const a of scene.artifacts) {
  out.push(`### Clue: ${a.name} (${a.id})`, "", `Clue paragraphs: ${a.source_anchor.map(lab).join(", ")} · tappable on the clue screen: ${cluePanel(world, passages, scene, a).map((p) => lab(p.id)).join(", ")}`, "");
  if (a.off_claim) out.push(`- **Off claim** (${name(a.off_claim.character_id)} says): "${a.off_claim.claim}"`, `  - Accepted (corrects it): ${q(a.off_claim.line, a.off_claim.paragraph)}`, "");
  for (const b of a.bank ?? []) {
    out.push(`- **Question (${b.ladder})**: ${b.question}`);
    for (const x of b.answers) out.push(`  - Accepted: ${q(x.line)}${x.phrase ? ` · exact words: "${x.phrase}" · key (any span holding one counts): ${[x.key ?? x.phrase].flat().map((k) => `"${k}"`).join(" or ")}` : ""}`);
    for (const n of b.near_misses) out.push(`  - Near miss: ${q(n.line)} · hint: "${n.hint}"`);
    if (b.prove) out.push(`  - Prove it: right "${b.prove.right}" · wrong: ${b.prove.wrong.map((w) => `"${w}"`).join("; ")}`);
    out.push("");
  }
}
if (scene.lie) out.push(`### Spot the Lie (clue ${scene.lie.clue_id})`, "", `- **Testimony** (${name(scene.lie.character_id)}): "${scene.lie.testimony}"`, `  - False claim: "${scene.lie.false_claim}"`, `  - Accepted (disproves it): ${q(scene.lie.truth_line, scene.lie.truth_paragraph)}`, "");

const sm = scene.story_mode;
if (sm) {
  out.push(`### Story Mode`, "", `Round 1 reading (in parts): ${sm.read.chunks.map(lab).join(", ")}`, "");
  out.push(`#### Round 1 · Locate`, "");
  for (const b of sm.read.bank) {
    out.push(`- **Question**: ${b.focus}`);
    for (const x of b.answers) out.push(`  - Accepted: ${q(x)}`);
    for (const n of b.near_misses) out.push(`  - Near miss: ${q(n.line)} · hint: "${n.hint}"`);
    out.push("");
  }
  out.push(`#### Round 2 · Infer (${name(sm.infer.character_id)} asks)`, "");
  for (const b of sm.infer.bank) {
    out.push(`- **Question**: ${b.question}`);
    for (const x of b.answers) out.push(`  - Accepted: ${q(x.line)}${x.phrase ? ` · exact words: "${x.phrase}" · key (any span holding one counts): ${[x.key ?? x.phrase].flat().map((k) => `"${k}"`).join(" or ")}` : ""}`);
    for (const n of b.near_misses) out.push(`  - Near miss: ${q(n.line)} · hint: "${n.hint}"`);
    if (b.prove) out.push(`  - Prove it: right "${b.prove.right}" · wrong: ${b.prove.wrong.map((w) => `"${w}"`).join("; ")}`);
    out.push("");
  }
  out.push(`#### Round 3 · Catch the lie`, "");
  for (const l of [...sm.lies, ...(scene.lie ? [scene.lie] : [])]) out.push(`- **Testimony** (${name(l.character_id)}): "${l.testimony}"`, `  - False claim: "${l.false_claim}"`, `  - Accepted (disproves it): ${q(l.truth_line, l.truth_paragraph)}`, "");
  out.push(`#### Round 4 · Build the case (pick a theory, pin 2 lines)`, "");
  for (const b of sm.call.bank) {
    out.push(`- **Question**: ${b.question}`);
    for (const t of b.theories) { out.push(`  - Theory "${t.name}" (${t.description})`); for (const x of t.supports) out.push(`    - Supports: ${q(x)}`); }
    out.push("");
  }
}
const start = Math.max(0, world.scenes.findIndex((s) => s.id === world.student_role?.start_scene));
const yt = Object.entries(world.your_turn?.activities ?? {}).map(([id, a]) => [id, si === start && a.demo ? { ...a, ...a.demo } : a] as const).filter(([, a]) => a.paragraphs.some((p) => reading.some((r) => r.id === p)));
if (yt.length) {
  out.push(`### Your Turn activities that use this scene's reading${si === start ? " (demo versions where authored)" : ""}`, "");
  for (const [id, a] of yt) {
    out.push(`- **${a.title}** (${id}, ${a.kind}): ${a.intro}`);
    for (const e of a.exchanges ?? []) { out.push(`  - Claim (${name(a.character_id)}): "${e.say}"`); for (const x of e.accept) out.push(`    - Accepted: ${q(x.line, x.paragraph)}`); }
    for (const [side, s] of Object.entries(a.sides ?? {})) for (const e of s.exchanges) { out.push(`  - Side ${side}, claim (${name(s.character_id)}): "${e.say}"`); for (const x of e.accept) out.push(`    - Accepted: ${q(x.line, x.paragraph)}`); }
    for (const i of a.items ?? []) { out.push(`  - Piece "${i.label}"${i.group ? ` (${i.group})` : ""}${i.accept.length ? "" : ": decoy, no line supports it"}`); for (const x of i.accept) out.push(`    - Accepted: ${q(x.line, x.paragraph)}`); }
    for (const p of a.posts ?? []) { out.push(`  - Post (${p.author}${p.false ? ", FALSE" : ""}): "${p.text}"`); for (const x of p.accept ?? []) out.push(`    - Accepted (disproves it): ${q(x.line, x.paragraph)}`); }
    if (a.kind === "lines" || a.kind === "exhibits") out.push(`  - Any ${a.need ?? 3} lines from ${a.paragraphs.map(lab).join(", ")}`);
    out.push("");
  }
}
console.log(out.join("\n"));
