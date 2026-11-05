// validate:worlds checks for expeditions (lib/expedition.ts). Every problem is a line naming the expedition and chunk.
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences } from "./lies.ts";
import { sharedRoots } from "./fair-play.ts";
import type { Expedition, WorldPack } from "./world-schema.ts";
import { MIN_TYPES, TYPE_INFO, chunkTokens, expeditionChunks, norm, phraseRange, proofLineIndexes } from "./expedition.ts";

export const CHUNK_WORDS = { min: 50, max: 150, target: [60, 120] as const }, MAX_SENTENCES = 5;
const CHOICE_TYPES = new Set(["word_detective", "shades", "between_lines", "whose_eyes", "figure_it_out", "character_clue", "theme_thread", "gist"]);
const FOCUS_TYPES = new Set(["word_detective", "shades", "figure_it_out"]);
const PROOF_TYPES = new Set(["word_detective", "shades", "between_lines", "whose_eyes", "character_clue", "theme_thread", "find_it", "catch_lie"]);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

// Wrong options must be plausible: three different options, each a real phrase (3+ words), and the best one is not
// given away by being far longer or shorter than the others.
export function distractorProblems(at: string, options: { text: string; best?: boolean }[]) {
  const out: string[] = [];
  if (options.filter((o) => o.best).length !== 1) out.push(`${at}: exactly one best option`);
  if (new Set(options.map((o) => norm(o.text))).size !== options.length) out.push(`${at}: options must all be different`);
  if (options.some((o) => words(o.text) < 3)) out.push(`${at}: every option needs at least 3 words`);
  const lens = options.map((o) => o.text.length), bestLen = options.find((o) => o.best)?.text.length ?? 0, others = lens.filter((_, i) => !options[i].best);
  // The best option is never noticeably longer than the longest wrong one (at most 15%), nor far shorter than the rest.
  if (others.length && (bestLen > Math.max(...others) * 1.15 || bestLen * 1.6 < Math.min(...others))) out.push(`${at}: the best option stands out by its length`);
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
    out.push(...balanceProblems(`${world.id}/${exp.id}`, exp));
    // Lightning beats: the answer is a sentence of the chunk it recalls, and only that chunk's text answers it.
    for (const l of exp.lightning ?? []) {
      const c = chunks[l.chunk - 1], key = (t: string) => t.replace(/\s+/g, " ").trim();
      if (!c) { out.push(`${world.id}/${exp.id}: lightning ${l.id} recalls chunk ${l.chunk}, which doesn't exist`); continue; }
      for (const a of l.answer) if (!c.lines.some((x) => key(x.text) === key(a))) out.push(`${world.id}/${exp.id}: lightning ${l.id}: "${a.slice(0, 40)}" isn't a sentence of chunk ${l.chunk}`);
      if (/—/.test(l.question)) out.push(`${world.id}/${exp.id}: lightning ${l.id}: no em dashes`);
    }
    if (new Set(types).size < MIN_TYPES) out.push(`${world.id}/${exp.id}: mixes ${new Set(types).size} question types; needs at least ${MIN_TYPES}`);
    if (types.filter((t) => t === "theme_thread").length !== 1) out.push(`${world.id}/${exp.id}: needs exactly one Theme Thread`);
    // The finale: Name the Liar when the expedition has an Interview, otherwise Make the Call (last chunk, once).
    const calls = types.filter((t) => t === "make_call").length;
    if (exp.interview ? calls > 0 : calls !== 1 || types.at(-1) !== "make_call") out.push(exp.interview ? `${world.id}/${exp.id}: Name the Liar is the finale; no Make the Call` : `${world.id}/${exp.id}: Make the Call is the last chunk, once`);
    out.push(...interviewProblems(world, exp, allLines, names));
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
      const maxSentences = world.expedition_rules?.max_sentences ?? MAX_SENTENCES;
      if (sentences > maxSentences) out.push(`${at}: ${sentences} sentences; at most ${maxSentences}`);
      // Gist check and the discovery.
      out.push(...distractorProblems(`${at} gist`, c.gist.options));
      if (!phraseRange(tokens, c.discovery.phrase)) out.push(`${at}: discovery "${c.discovery.phrase}" is not in the chunk`);
      // The question: its parts for its type, exact proof, key words from the prompt.
      if (CHOICE_TYPES.has(q.type)) { if (!q.choices) out.push(`${at}: ${q.type} needs 3 choices`); else out.push(...distractorProblems(`${at} choices`, q.choices)); }
      if (q.type === "figure_it_out") { if (!q.choices2) out.push(`${at}: Figure It Out needs a second step (its meaning)`); else out.push(...distractorProblems(`${at} meaning`, q.choices2.options)); }
      if (PROOF_TYPES.has(q.type) && !q.proof?.lines?.length && !q.proof?.words?.length) out.push(`${at}: ${q.type} needs proof lines or words`);
      for (const l of q.proof?.lines ?? []) if (!rc.lines.some((x) => x.text === l)) out.push(`${at}: proof line "${l.replace(/\s+/g, " ").slice(0, 50)}" is not copied exactly from this chunk`);
      for (const w of q.proof?.words ?? []) { const r = phraseRange(tokens, w); if (!r) out.push(`${at}: proof words "${w}" are not in this chunk`); else if (tokens[r[0]].line !== tokens[r[1]].line) out.push(`${at}: proof words "${w}" cross two sentences`); }
      if (q.type === "catch_lie" && (!q.testimony || !speaking.has(q.testimony.speaker))) out.push(`${at}: Catch the Lie needs a testimony from one of the story's speaking characters`);
      if (q.type === "make_call") {
        if (!q.theories) out.push(`${at}: Make the Call needs 3 theories`);
        for (const t of q.theories ?? []) for (const l of t.lines) if (!allLines.includes(l)) out.push(`${at}: theory ${t.id} line "${l.replace(/\s+/g, " ").slice(0, 50)}" is not in this expedition`);
      }
      if (q.focus) {
        const fr = phraseRange(tokens, q.focus);
        if (!fr) out.push(`${at}: focus "${q.focus}" is not in the chunk`);
        else { const sentences = new Set(proofLineIndexes(q, tokens)); if (rc.lines.length > 1 && (sentences.has(tokens[fr[0]].line) || sentences.has(tokens[fr[1]].line))) out.push(`${at}: focus "${q.focus}" sits in a proof sentence; it would point to the answer`); }
      } else if (FOCUS_TYPES.has(q.type)) out.push(`${at}: ${q.type} is about a word or phrase; name it as focus`);
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

// The Interview: three different speaking witnesses; every statement's lines are exact lines from this expedition;
// a statement never repeats its own proof line's key words (students must find the line, not match words).
export function interviewProblems(world: WorldPack, exp: Expedition, allLines: string[], names: Set<string>) {
  const out: string[] = [], iv = exp.interview; if (!iv) return out;
  const at = `${world.id}/${exp.id} interview`;
  if (new Set(iv.witnesses.map((w) => w.character)).size !== iv.witnesses.length) out.push(`${at}: three different witnesses`);
  for (const w of iv.witnesses) {
    const c = world.characters.find((x) => x.id === w.character);
    if (!c) { out.push(`${at}: ${w.character} is not one of the story's speaking characters`); continue; }
    if (!c.voice_id) out.push(`${at}: ${w.character} needs a voice`);
    for (const [kind, st] of [["truth", w.truth], ["lie", w.lie]] as const) {
      for (const l of st.lines) if (!allLines.includes(l)) out.push(`${at}: ${w.character} ${kind} line "${l.replace(/\s+/g, " ").slice(0, 50)}" is not copied exactly from this expedition`);
      const shared = sharedRoots(st.text, st.lines, names);
      if (shared.length) out.push(`${at}: ${w.character} ${kind} repeats words from its proof line (${shared.join(", ")}); paraphrase it`);
    }
    if (w.truth.lines.some((l) => w.lie.lines.includes(l)) && w.truth.lines.length === 1 && w.lie.lines.length === 1) out.push(`${at}: ${w.character} truth and lie rest on the same line`);
    if ([w.truth.text, w.lie.text, w.caught, ...w.cards].some((t) => /—/.test(t))) out.push(`${at}: no em dashes`);
  }
  return out;
}

// Answer balance across an expedition: the best option is not always listed first, and it is not clearly the longest
// (by more than 3 characters) in more than half of the option sets. Students also see their own shuffled order.
export function balanceProblems(at: string, exp: Expedition) {
  const sets = exp.chunks.flatMap((c) => [c.gist.options, c.question.choices, c.question.choices2?.options]).filter((o): o is { text: string; best?: boolean }[] => !!o?.length);
  if (!sets.length) return [];
  const out: string[] = [], bestAt = sets.map((o) => o.findIndex((x) => x.best));
  if (sets.length > 1 && bestAt.every((b) => b === 0)) out.push(`${at}: the best answer is always listed first`);
  const clear = sets.filter((o) => { const b = o.findIndex((x) => x.best), L = o.map((x) => x.text.length); return L[b] > Math.max(...L.filter((_, i) => i !== b)) + 3; }).length;
  if (clear * 2 > sets.length) out.push(`${at}: the best answer is clearly the longest in ${clear} of ${sets.length} option sets; balance the choices`);
  return out;
}

// For the report: how far the expeditions reach, and the chunk lengths.
export function expeditionCoverage(world: WorldPack, passages: SourcePassage[]) {
  const chunks = (world.expeditions ?? []).flatMap((e) => expeditionChunks(world, passages, e.id));
  const last = chunks.at(-1)?.lines.at(-1)?.pid ?? null, story = passages.filter((p) => !(world.front_matter ?? []).includes(p.id));
  return { chunks: chunks.length, through: last, ofParagraphs: story.length, complete: last === story.at(-1)?.id, words: chunks.map((c) => c.words) };
}
