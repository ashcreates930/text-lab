// validate:worlds checks for expeditions (lib/expedition.ts). Every problem is a line naming the expedition and chunk.
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences } from "./lies.ts";
import { sharedRoots } from "./fair-play.ts";
import type { Expedition, ExpQuestion, WorldPack } from "./world-schema.ts";
import { DND_TYPE, bankOf, formatOf } from "./formats.ts";
import { MIN_TYPES, TYPE_INFO, chunkTokens, expeditionChunks, norm, phraseRange, proofLineIndexes } from "./expedition.ts";

export const CHUNK_WORDS = { min: 50, max: 150, target: [60, 120] as const }, MAX_SENTENCES = 5;
const CHOICE_TYPES = new Set(["word_detective", "shades", "between_lines", "whose_eyes", "figure_it_out", "character_clue", "theme_thread", "gist"]);
const FOCUS_TYPES = new Set(["word_detective", "shades", "figure_it_out"]);
const PROOF_TYPES = new Set(["word_detective", "shades", "between_lines", "whose_eyes", "character_clue", "theme_thread", "find_it", "catch_lie"]);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

// Wrong options must be plausible: three different options, each a real phrase (3+ words), and the best one is not
// given away by being far longer or shorter than the others.
export function distractorProblems(at: string, options: { text: string; best?: boolean }[], bestCount = 1) {
  const out: string[] = [];
  if (options.filter((o) => o.best).length !== bestCount) out.push(`${at}: exactly ${bestCount === 1 ? "one best option" : `${bestCount} best options`}`);
  if (new Set(options.map((o) => norm(o.text))).size !== options.length) out.push(`${at}: options must all be different`);
  if (options.some((o) => words(o.text) < 3)) out.push(`${at}: every option needs at least 3 words`);
  const lens = options.map((o) => o.text.length), bestLen = Math.max(0, ...options.filter((o) => o.best).map((o) => o.text.length)), others = lens.filter((_, i) => !options[i].best);
  // The best option is never noticeably longer than the longest wrong one (at most 15%), nor far shorter than the rest.
  if (others.length && (bestLen > Math.max(...others) * 1.15 || bestLen * 1.6 < Math.min(...others))) out.push(`${at}: the best option stands out by its length`);
  return out;
}

// Drag and drop: 3 to 5 pieces, every slot real and used, one piece per slot where the kind needs it, and each backing
// sentence copied exactly from the chunk.
// Words too vague to count as a key idea in a written answer (they match almost any sentence).
export const VAGUE_KEY_WORDS = ["see", "look", "like", "still", "even", "never", "keep", "real", "people", "life", "same", "think", "run", "take", "turn", "use", "place", "someone",
  "everything", "anything", "every", "others", "the way", "really", "truly", "also", "despite", "more than", "than they", "come", "move", "bit", "world"];
// Vocabulary questions: a word or phrase and its meaning.
const VOCAB_TYPES = new Set(["word_detective", "shades"]);
// Content words of a choice (for spotting two choices that say the same thing).
const contentWords = (t: string) => new Set(t.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !["that", "with", "they", "them", "their", "this", "from", "what", "when", "were", "have", "about", "into", "than"].includes(w)));
export function dndProblems(at: string, q: ExpQuestion, lines: string[]) {
  const out: string[] = [], d = q.dnd; if (!d) return [`${at}: drag and drop needs its pieces and slots`];
  const slots = new Set(d.slots.map((x) => x.id));
  if (d.items.length < 3 || d.items.length > 5) out.push(`${at}: drag and drop uses 3 to 5 pieces`);
  for (const it of d.items) { if (it.slot !== null && !slots.has(it.slot)) out.push(`${at}: piece ${it.id} goes to an unknown slot ${it.slot}`); if (it.line && !lines.some((l) => l === it.line)) out.push(`${at}: piece ${it.id}'s sentence is not copied exactly from this chunk`); }
  for (const x of d.slots) if (!d.items.some((it) => it.slot === x.id)) out.push(`${at}: slot ${x.id} has no piece`);
  if (["order_events", "build_case", "story_map", "cause_effect"].includes(d.kind)) for (const x of d.slots) if (d.items.filter((it) => it.slot === x.id).length > 1) out.push(`${at}: slot ${x.id} holds one piece`);
  if (DND_TYPE[d.kind] !== q.type) out.push(`${at}: ${d.kind} practises ${DND_TYPE[d.kind]}, not ${q.type}`);
  if (new Set(d.items.map((it) => it.id)).size !== d.items.length) out.push(`${at}: piece ids repeat`);
  // Build the case: the proof piece is the story's own words, in quotation marks, from its backing sentence, and the
  // claim never just repeats the proof.
  if (d.kind === "build_case") for (const it of d.items.filter((x) => x.slot === "proof")) {
    const m = /^"([^"]+)"$/.exec(it.text.trim()), flat = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();
    if (!m || !it.line || !flat(it.line).includes(flat(m[1]))) out.push(`${at}: the proof piece must quote its sentence exactly, in quotation marks`);
    const claim = d.items.find((x) => x.slot === "claim"), words = (t: string) => new Set(flat(t).replace(/[^a-z ]/g, "").split(" ").filter((w) => w.length > 3));
    if (claim && m) { const a = words(claim.text), b = words(m[1]), shared = [...a].filter((w) => b.has(w)).length; if (a.size && shared / a.size > 0.5) out.push(`${at}: the claim and the proof say the same thing`); }
  }
  return out;
}
// Variety, for expeditions rebuilt to the phase 3 rules: 2 or 3 questions per chunk, the same type never twice in a row,
// about 2 drag and drops (never back to back), at least 4 formats, and no repeated question frames (the first four words).
export function variety(at: string, exp: Expedition) {
  const out: string[] = [], types = exp.chunks.map((c) => c.question.type), formats = exp.chunks.map((c) => formatOf(c.question));
  exp.chunks.forEach((c, k) => { if (!(c.bank?.length)) out.push(`${at}: chunk ${k + 1} needs 2 or 3 questions (a bank)`); if (k && types[k] === types[k - 1]) out.push(`${at}: chunks ${k} and ${k + 1} are both ${types[k]}`); });
  const dnd = formats.map((f, k) => (f === "dnd" ? k : -1)).filter((k) => k >= 0);
  if (dnd.length < 2 || dnd.length > 3) out.push(`${at}: ${dnd.length} drag and drop questions (about 2)`);
  if (dnd.some((k, i) => i && k - dnd[i - 1] < 2)) out.push(`${at}: drag and drop questions back to back`);
  if (new Set(formats).size < 4) out.push(`${at}: ${new Set(formats).size} formats (at least 4)`);
  // Every two-part or tap question proves with a whole sentence, and words quoted from the story wear quotation marks.
  exp.chunks.forEach((c, k) => bankOf(c).forEach((q, i) => {
    const f = formatOf(q), where = `${at}: chunk ${k + 1} ${i ? "bank question" : "question"}`;
    if ((f === "two_part" || f === "tap") && q.type !== "make_call" && !q.proof?.lines?.length) out.push(`${where} needs a proof sentence`);
    if (/\bread the words (?!")/i.test(q.prompt)) out.push(`${where}: put the quoted words in quotation marks`);
  }));
  // A written answer every student reaches: one chunk whose every question is written.
  if (!exp.chunks.some((c) => bankOf(c).every((q) => formatOf(q) === "written"))) out.push(`${at}: needs a chunk where every bank question is written, so every student writes`);
  exp.chunks.forEach((c, k) => bankOf(c).forEach((q, i) => {
    const where = `${at}: chunk ${k + 1} ${i ? "bank question" : "question"}`;
    // No two choices share most of their words.
    for (const set of [q.choices?.map((o) => o.text) ?? [], q.choices2?.options.map((o) => o.text) ?? []]) for (let a = 0; a < set.length; a++) for (let b = a + 1; b < set.length; b++) {
      const x = contentWords(set[a]), y = contentWords(set[b]), shared = [...x].filter((w) => y.has(w)).length, small = Math.min(x.size, y.size);
      if (small >= 3 && shared / small > 0.6) out.push(`${where}: choices "${set[a].slice(0, 30)}" and "${set[b].slice(0, 30)}" share most of their words`);
    }
    // Written key ideas carry the idea itself: no vague words that could match almost any sentence.
    for (const g of q.written?.key_ideas ?? []) for (const w of g) if (VAGUE_KEY_WORDS.includes(w.trim().toLowerCase())) out.push(`${where}: the key idea "${w}" is too vague; use words that carry the idea`);
    // Theme questions ask about an idea, never a character's trait: the answer states an idea about people or life.
    if (q.type === "theme_thread") {
      const answer = q.written?.model ?? q.choices?.find((o) => o.best)?.text ?? "";
      if (/\b(proudest|trait|what kind of (person|man|woman)|kind of teacher)\b/i.test(q.prompt)) out.push(`${where}: a theme question asks about an idea, not a character trait`);
      if (/^(he|she|his|her|ichabod|brom|katrina|hans|baltus)\b/i.test(answer.trim())) out.push(`${where}: a theme answer states an idea, not a character's trait`);
    }
  }));
  const frames = exp.chunks.flatMap((c) => bankOf(c).map((q) => q.prompt.toLowerCase().replace(/[^a-z ]/g, "").split(/\s+/).slice(0, 4).join(" ")));
  const seen = new Set<string>(); for (const fr of frames) { if (seen.has(fr)) out.push(`${at}: the question frame "${fr}" repeats`); seen.add(fr); }
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
      // It recalls an earlier chunk, never the proof of the chunk just before the beat (that's not recall).
      if (l.chunk >= l.after) out.push(`${world.id}/${exp.id}: lightning ${l.id} must recall a chunk before chunk ${l.after}`);
      const before = exp.chunks[l.after - 1], proofs = before ? bankOf(before).flatMap((q) => [...(q.proof?.lines ?? []), ...(q.dnd?.items ?? []).flatMap((it) => (it.line ? [it.line] : []))]).map(key) : [];
      if (l.answer.some((a) => proofs.includes(key(a)))) out.push(`${world.id}/${exp.id}: lightning ${l.id} recalls the proof of chunk ${l.after}, just before it`);
    }
    if (new Set(types).size < MIN_TYPES) out.push(`${world.id}/${exp.id}: mixes ${new Set(types).size} question types; needs at least ${MIN_TYPES}`);
    if (types.filter((t) => t === "theme_thread").length !== 1) out.push(`${world.id}/${exp.id}: needs exactly one Theme Thread`);
    // The finale: Name the Liar when the expedition has an Interview, otherwise Make the Call (last chunk, once).
    const calls = types.filter((t) => t === "make_call").length;
    if (exp.interview ? calls > 0 : calls !== 1 || types.at(-1) !== "make_call") out.push(exp.interview ? `${world.id}/${exp.id}: Name the Liar is the finale; no Make the Call` : `${world.id}/${exp.id}: Make the Call is the last chunk, once`);
    out.push(...interviewProblems(world, exp, allLines, names));
    // A Catch the Lie testimony (main or bank) never shares its disproving line with an interview lie: the same claim twice.
    if (exp.interview) { const lieLines = new Set(exp.interview.witnesses.flatMap((w) => w.lie.lines).map(norm));
      exp.chunks.forEach((c, k) => bankOf(c).forEach((q, i) => { if (q.type === "catch_lie" && (q.proof?.lines ?? []).some((l) => lieLines.has(norm(l)))) out.push(`${world.id}/${exp.id}: chunk ${k + 1} ${i ? "bank question" : "question"}: its testimony is disproved by the same line as an interview lie`); })); }
    if (!(world.expedition_rules?.arc_pending ?? []).includes(exp.id)) out.push(...variety(`${world.id}/${exp.id}`, exp));
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
      const checkQ = (at: string, q: ExpQuestion) => {
      // The parts each format needs (lib/formats.ts).
      const f = formatOf(q);
      if (f === "two_part" || f === "mc" || f === "multi") { if (!q.choices && q.type !== "find_it" && q.type !== "catch_lie") out.push(`${at}: ${q.type} needs choices`); else if (q.choices) out.push(...distractorProblems(`${at} choices`, q.choices, f === "multi" ? q.pick ?? q.choices.filter((c) => c.best).length : 1)); }
      if (f === "multi" && (!q.choices || q.choices.length < 4 || q.choices.filter((c) => c.best).length < 2)) out.push(`${at}: choose two needs at least 4 choices and 2 or more right ones`);
      if (f === "multi" && q.pick && q.pick !== q.choices?.filter((c) => c.best).length) out.push(`${at}: pick must equal the number of right choices`);
      if (f !== "multi" && q.choices && q.choices.length !== 3 && f !== "dnd") out.push(`${at}: ${f} uses 3 choices`);
      if (f === "dnd") out.push(...dndProblems(at, q, rc.lines.map((l) => l.text)));
      if (f === "written") { if (!q.written) out.push(`${at}: a written question needs key ideas and a model answer`); if (!(q.type === "theme_thread" || q.type === "between_lines" || q.type === "character_clue" || q.type === "whose_eyes")) out.push(`${at}: written answers are for the deepest questions (theme, inference, character, point of view)`); }
      if (q.type === "figure_it_out") { if (!q.choices2) out.push(`${at}: Figure It Out needs a second step (its meaning)`); else out.push(...distractorProblems(`${at} meaning`, q.choices2.options)); }
      if ((f === "two_part" || f === "tap") && PROOF_TYPES.has(q.type) && !q.proof?.lines?.length && !q.proof?.words?.length) out.push(`${at}: ${q.type} needs proof lines or words`);
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
        else { const sentences = new Set(proofLineIndexes(q, tokens)); if (!q.clues?.length && rc.lines.length > 1 && (sentences.has(tokens[fr[0]].line) || sentences.has(tokens[fr[1]].line))) out.push(`${at}: focus "${q.focus}" sits in a proof sentence; it would point to the answer (ask for clue words instead)`); }
        // Clue words: in the chunk, never the word itself, and only on a vocabulary question answered in two parts.
        for (const c of q.clues ?? []) { const r = phraseRange(tokens, c); if (!r) out.push(`${at}: clue words "${c}" are not in the chunk`); else if (fr && r[0] <= fr[1] && fr[0] <= r[1]) out.push(`${at}: clue words "${c}" include the word itself`); }
        if (q.clues?.length && !(VOCAB_TYPES.has(q.type) && f === "two_part")) out.push(`${at}: clue words are for a vocabulary question in two parts`);
      } else if (FOCUS_TYPES.has(q.type) && f !== "dnd") out.push(`${at}: ${q.type} is about a word or phrase; name it as focus`);
      for (const kw of q.keywords) if (!q.prompt.toLowerCase().includes(kw.toLowerCase())) out.push(`${at}: key word "${kw}" is not in the question`);
      if (!q.standards.some((s) => TYPE_INFO[q.type].standards.includes(s))) out.push(`${at}: standards must include one of ${TYPE_INFO[q.type].standards.join(", ")}`);
      if (/,\s+and\s+(what|why|how|where|who|whose|when|which)\b/i.test(q.prompt) || (q.prompt.match(/\?/g) ?? []).length > 1) out.push(`${at}: ask one thing per question`);
      // No question shares a key word with its answer, unless a reviewer checked it.
      const answerLines = [...(q.proof?.lines ?? []), ...(q.proof?.words ?? []).flatMap((w) => rc.lines.filter((l) => norm(l.text).includes(norm(w))).map((l) => l.text))];
      if (!q.reviewed && answerLines.length) { const shared = sharedRoots(q.prompt, answerLines, names); if (shared.length) out.push(`${at}: the question shares key words with its answer (${shared.join(", ")}); paraphrase it or mark it reviewed`); }
      const texts = [q.prompt, q.hint, q.why, c.discovery.note, ...(q.dnd?.items.map((i) => i.text) ?? []), ...(q.dnd?.slots.map((x) => x.label) ?? []), q.written?.model ?? "", ...c.gist.options.map((o) => o.text), ...(q.choices ?? []).map((o) => o.text), ...(q.choices2?.options ?? []).map((o) => o.text), q.testimony?.text ?? "", ...(q.theories ?? []).map((t) => t.name)];
      if (texts.some((t) => dash.test(t))) out.push(`${at}: no em dashes`);
      };
      // The main question, the chunk's bank (the same skill, another wording), and any written-out versions.
      checkQ(at, c.question);
      (c.bank ?? []).forEach((bq, i) => { checkQ(`${at} bank ${i + 1}`, bq); if (bq.type !== c.question.type) out.push(`${at} bank ${i + 1}: the same skill as the chunk's question (${c.question.type})`); });
      for (const x of [c.question, ...(c.bank ?? [])]) for (const v of ["easier", "harder"] as const) if (x.versions?.[v]) checkQ(`${at} ${v}`, x.versions[v]!);
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
