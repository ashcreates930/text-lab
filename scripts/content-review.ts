// Writes the expeditions section of docs/game-content-review.md from world.json (between the markers), grouped by
// story, expedition and question type, so the review always matches what students see.
// Run: node --experimental-strip-types scripts/content-review.ts
import { readFileSync, writeFileSync } from "node:fs";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { TYPE_INFO, expeditionChunks } from "../lib/expedition.ts";
import { benchmark } from "../lib/best-standards.ts";

const START = "<!-- expeditions:start -->", END = "<!-- expeditions:end -->";
const one = (s: string) => s.replace(/\s+/g, " ").trim();
const out: string[] = [START, "## Proof Race expeditions", "", "Generated from world.json by `scripts/content-review.ts`. ✓ marks the best option. Standards are verified B.E.S.T. benchmarks (grade 7 codes shown; the class's grade picks the code).", ""];
for (const id of ["sleepy-hollow", "tell-tale-heart", "trifles"]) {
  const world = WorldPackSchema.parse(JSON.parse(readFileSync(`worlds/${id}/world.json`, "utf8")));
  if (!world.expeditions?.length && !world.draft_expeditions?.length) continue;
  const passages = parseSourcePassages(readFileSync(`public/worlds/${id}/source.md`, "utf8"));
  out.push(`### ${world.title}`, "");
  // Drafts are listed after the live expeditions, marked for review.
  const drafts = new Set((world.draft_expeditions ?? []).map((e) => e.id));
  for (const exp of [...(world.expeditions ?? []), ...(world.draft_expeditions ?? [])]) {
    const draft = drafts.has(exp.id), view = draft ? { ...world, expeditions: world.draft_expeditions } : world;
    const chunks = expeditionChunks(view, passages, exp.id);
    out.push(`#### ${draft ? "DRAFT for review, not live: " : ""}Expedition: ${exp.title} (${exp.chunks.length} chunks)`, "");
    // The Interview and Name the Liar: one witness lies per student (per game when live).
    if (exp.interview) {
      out.push("##### The Interview and Name the Liar", "", "Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.", "");
      for (const w of exp.interview.witnesses) {
        const name = world.characters.find((x) => x.id === w.character)?.name ?? w.character;
        out.push(`**${name}**`, "", `- Question cards: ${w.cards.map((c) => `"${c}"`).join(" / ")}`);
        out.push(`- True: "${w.truth.text}"`, ...w.truth.lines.map((l) => `  - Confirmed by: "${one(l)}"`));
        out.push(`- False${w.lie.gesture ? ` (${w.lie.gesture.replace("-", " ")})` : ""}: "${w.lie.text}"`, ...w.lie.lines.map((l) => `  - Disproved by: "${one(l)}"`));
        out.push(`- When caught: "${w.caught}"`, "");
      }
      out.push("Screen text: \"One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story.\" · \"Which witness lied?\" · \"Tap the line anywhere in the expedition that shows this is false, then lock in.\" · \"Case solved\" · \"Not this time.\" · \"It's in your Refresher.\" · Live: \"What should we ask [witness]?\" · \"Locked in\" · \"Nothing is revealed until everyone has locked in. Watch the board.\"", "");
    }
    // Grouped by question type, in the order the types first appear.
    const types = [...new Set(exp.chunks.map((c) => c.question.type))];
    for (const t of types) {
      out.push(`##### ${TYPE_INFO[t].name}`, "");
      exp.chunks.forEach((c, k) => {
        if (c.question.type !== t) return;
        const q = c.question, rc = chunks[k];
        const where = c.segments.map((s) => `¶${Number(s.p.slice(1))} sentences ${s.from + 1} to ${s.to + 1}`).join(", ");
        out.push(`**Chunk ${k + 1}** (${where}; ${rc.words} words)${q.reviewed ? " · shared words reviewed" : ""}`, "");
        out.push(`- Question: ${q.prompt}`);
        if (q.keywords.length) out.push(`- Key words highlighted: ${q.keywords.join(", ")}`);
        if (q.testimony) out.push(`- Testimony (${world.characters.find((x) => x.id === q.testimony!.speaker)?.name}): "${q.testimony.text}"`);
        if (q.choices) out.push(`- Choices: ${q.choices.map((o) => `${o.text}${o.best ? " ✓" : ""}`).join(" / ")}`);
        if (q.choices2) out.push(`- ${q.choices2.prompt} ${q.choices2.options.map((o) => `${o.text}${o.best ? " ✓" : ""}`).join(" / ")}`);
        if (q.proof?.words?.length) out.push(`- Proof words (any one): ${q.proof.words.map((w) => `"${w}"`).join(", ")}`);
        for (const l of q.proof?.lines ?? []) out.push(`- Proof line: "${one(l)}"`);
        for (const th of q.theories ?? []) out.push(`- Theory: ${th.name}. Backed by: ${th.lines.map((l) => `"${one(l).slice(0, 80)}…"`).join("; ")}`);
        out.push(`- Refresher hint: ${q.hint}`, `- Why: ${q.why}`, `- Standards: ${q.standards.map((s) => benchmark(s, 7).code).join(", ")}`);
        out.push(`- Gist check: ${c.gist.options.map((o) => `${o.text}${o.best ? " ✓" : ""}`).join(" / ")}`);
        out.push(`- Discovery (${c.discovery.kind}): "${c.discovery.phrase}". ${c.discovery.note}`, "");
      });
    }
  }
}
out.push(END);
const path = "docs/game-content-review.md", doc = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const a = doc.indexOf(START), b = doc.indexOf(END);
const next = a >= 0 && b > a ? doc.slice(0, a) + out.join("\n") + doc.slice(b + END.length) : doc.trimEnd() + "\n\n" + out.join("\n") + "\n";
writeFileSync(path, next);
console.log("expeditions section written:", out.length, "lines");
