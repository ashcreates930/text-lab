// validate:worlds checks for expeditions (lib/expedition.ts). Every problem is a line naming the expedition and chunk.
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences } from "./lies.ts";
import { sharedRoots } from "./fair-play.ts";
import type { WorldPack } from "./world-schema.ts";
import { MIN_TYPES, TYPE_INFO, chunkTokens, expeditionChunks, norm, phraseRange } from "./expedition.ts";

export const CHUNK_WORDS = { min: 50, max: 150, target: [60, 120] as const }, MAX_SENTENCES = 5;
const CHOICE_TYPES = new Set(["word_detective", "shades", "between_lines", "whose_eyes", "figure_it_out", "character_clue", "theme_thread", "gist"]);
const PROOF_TYPES = new Set(["word_detective", "shades", "between_lines", "whose_eyes", "character_clue", "theme_thread", "find_it", "catch_lie"]);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

// Wrong options must be plausible: three different options, each a real phrase (3+ words), and the best one is not
// given away by being far longer or shorter than the others.
export function distractorProblems(at: string, options: { text: string; best?: boolean }[]) {
  const out: string[] = [];
  if (options.filter((o) => o.best).length !== 1) out.push(`${at}: exactly one best option`);
  if (new Set(options.map((o) => norm(o.text))).size !== options.length) out.push(`${at}: options must all be different`);
  if (options.some((o) => words(o.text) < 3)) out.push(`${at}: every option needs at least 3 words`);
  const lens = options.map((o) => o.text.length), bestLen = options.find((o) => o.best)?.text.length ?? 0, others = lens.filter((l) => l !== bestLen);
  if (others.length && (bestLen > Math.max(...others) * 1.6 || bestLen * 1.6 < Math.min(...others))) out.push(`${at}: the best option stands out by its length`);
  return out;
}

export function expeditionProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [];
  const exps = world.expeditions ?? []; if (!exps.length) return out;
  const names = new Set(world.characters.flatMap((c) => c.name.toLowerCase().split(/\s+/)));
  const speaking = new Set(world.characters.map((c) => c.id));
  const order = passages.filter((p) => !(world.front_matter ?? []).includes(p.id)).map((p) => p.id);
  const dash = /—/;
  // Chunks run in story order with no gaps: each picks up at the sentence after the last one ended.
  let next: { p: string; i: number } | null = { p: order[0], i: 0 };
  const sentencesOf = (p: string) => { const x = passages.find((q) => q.id === p); return x ? evidenceSentences(x.text).length : 0; };
  for (const exp of exps) {
    const chunks = expeditionChunks(world, passages, exp.id);
    const allLines = chunks.flatMap((c) => c.lines.map((l) => l.text));
    const types = exp.chunks.map((c) => c.question.type);
    if (new Set(types).size < MIN_TYPES) out.push(`${world.id}/${exp.id}: mixes ${new Set(types).size} question types; needs at least ${MIN_TYPES}`);
    if (types.filter((t) => t === "theme_thread").length !== 1) out.push(`${world.id}/${exp.id}: needs exactly one Theme Thread`);
    if (types.filter((t) => t === "make_call").length !== 1 || types.at(-1) !== "make_call") out.push(`${world.id}/${exp.id}: Make the Call is the last chunk, once`);
    exp.chunks.forEach((c, k) => {
      const at = `${world.id}/${exp.id}/${c.id}`, rc = chunks[k], tokens = chunkTokens(rc.lines), q = c.question;
      for (const sg of c.segments) {
        const n = sentencesOf(sg.p);
        if (!n) out.push(`${at}: ${sg.p} is not in the story`); else if (sg.from > sg.to || sg.to >= n) out.push(`${at}: ${sg.p} has sentences 0 to ${n - 1}`);
        if (next && (sg.p !== next.p || sg.from !== next.i)) out.push(`${at}: starts at ${sg.p}[${sg.from}] but the story continues at ${next.p}[${next.i}] (no gaps or overlaps)`);
        const pi = order.indexOf(sg.p);
        next = sg.to + 1 < n ? { p: sg.p, i: sg.to + 1 } : pi + 1 < order.length ? { p: order[pi + 1], i: 0 } : null;
      }
      const sentences = rc.lines.length;
      if (rc.words < CHUNK_WORDS.min || rc.words > CHUNK_WORDS.max) out.push(`${at}: ${rc.words} words; a chunk is ${CHUNK_WORDS.min} to ${CHUNK_WORDS.max}`);
      if (sentences > MAX_SENTENCES) out.push(`${at}: ${sentences} sentences; at most ${MAX_SENTENCES}`);
      // Gist check and the discovery.
      out.push(...distractorProblems(`${at} gist`, c.gist.options));
      if (!phraseRange(tokens, c.discovery.phrase)) out.push(`${at}: discovery "${c.discovery.phrase}" is not in the chunk`);
      // The question: its parts for its type, exact proof, key words from the prompt.
      if (CHOICE_TYPES.has(q.type)) { if (!q.choices) out.push(`${at}: ${q.type} needs 3 choices`); else out.push(...distractorProblems(`${at} choices`, q.choices)); }
      if (q.type === "figure_it_out") { if (!q.choices2) out.push(`${at}: Figure It Out needs a second step (its meaning)`); else out.push(...distractorProblems(`${at} meaning`, q.choices2.options)); }
      if (PROOF_TYPES.has(q.type) && !q.proof?.lines?.length && !q.proof?.words?.length) out.push(`${at}: ${q.type} needs proof lines or words`);
      for (const l of q.proof?.lines ?? []) if (!rc.lines.some((x) => x.text === l)) out.push(`${at}: proof line "${l.replace(/\s+/g, " ").slice(0, 50)}" is not copied exactly from this chunk`);
      for (const w of q.proof?.words ?? []) if (!phraseRange(tokens, w)) out.push(`${at}: proof words "${w}" are not in this chunk`);
      if (q.type === "catch_lie" && (!q.testimony || !speaking.has(q.testimony.speaker))) out.push(`${at}: Catch the Lie needs a testimony from one of the story's speaking characters`);
      if (q.type === "make_call") {
        if (!q.theories) out.push(`${at}: Make the Call needs 3 theories`);
        for (const t of q.theories ?? []) for (const l of t.lines) if (!allLines.includes(l)) out.push(`${at}: theory ${t.id} line "${l.replace(/\s+/g, " ").slice(0, 50)}" is not in this expedition`);
      }
      for (const kw of q.keywords) if (!q.prompt.toLowerCase().includes(kw.toLowerCase())) out.push(`${at}: key word "${kw}" is not in the question`);
      if (!q.standards.some((s) => TYPE_INFO[q.type].standards.includes(s))) out.push(`${at}: standards must include one of ${TYPE_INFO[q.type].standards.join(", ")}`);
      if (/,\s+and\s+(what|why|how|where|who|whose|when|which)\b/i.test(q.prompt) || (q.prompt.match(/\?/g) ?? []).length > 1) out.push(`${at}: ask one thing per question`);
      // No question shares a key word with its answer, unless a reviewer checked it.
      const answerLines = [...(q.proof?.lines ?? []), ...(q.proof?.words ?? []).flatMap((w) => rc.lines.filter((l) => norm(l.text).includes(norm(w))).map((l) => l.text))];
      if (!q.reviewed && answerLines.length) { const shared = sharedRoots(q.prompt, answerLines, names); if (shared.length) out.push(`${at}: the question shares key words with its answer (${shared.join(", ")}); paraphrase it or mark it reviewed`); }
      const texts = [q.prompt, q.hint, q.why, c.discovery.note, ...c.gist.options.map((o) => o.text), ...(q.choices ?? []).map((o) => o.text), ...(q.choices2?.options ?? []).map((o) => o.text), q.testimony?.text ?? "", ...(q.theories ?? []).map((t) => t.name)];
      if (texts.some((t) => dash.test(t))) out.push(`${at}: no em dashes`);
    });
  }
  return out;
}

// For the report: how far the expeditions reach, and the chunk lengths.
export function expeditionCoverage(world: WorldPack, passages: SourcePassage[]) {
  const chunks = (world.expeditions ?? []).flatMap((e) => expeditionChunks(world, passages, e.id));
  const last = chunks.at(-1)?.lines.at(-1)?.pid ?? null, story = passages.filter((p) => !(world.front_matter ?? []).includes(p.id));
  return { chunks: chunks.length, through: last, ofParagraphs: story.length, complete: last === story.at(-1)?.id, words: chunks.map((c) => c.words) };
}
