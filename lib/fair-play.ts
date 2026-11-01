// Fair play: students score only by reading. Shared by the clue screen, Story Mode (solo and live), the Evidence view,
// the validator and the tests. Content is authored in each world.json (clue `bank`s, Story Mode banks); nothing here is
// generated.
//
// - Question banks: 3 or 4 authored questions per clue (and per Story Mode round). A replay gets one the student hasn't
//   seen; in class, neighbors (by roster position) get different ones; in squads, each member's matches their chunk.
// - Paraphrase: a question shares no key word (by word root) with its answer lines.
// - Tries: full points on the first try, half on the second, none after; each wrong line costs 25 (never below 0 for the
//   round). Try 2 names the paragraph; try 3 names the part of the paragraph. After three misses the answer is shown and
//   the Prove it step is still required, for 0 points ("shown answer").
// - Exact words: lines over 25 words need the proof words marked: any span of the line that holds one of the answer's
//   key phrases counts. A span that misses them is "Right line! Mark the words that prove it", with no try used.
// - Prove it: pick from 4 authored choices, or finish "This proves ___ because ___" (saved for the teacher, never scored).
// - Speed flags, for the teacher only: a line tapped within 4 seconds of opening the passage, or more than 4 swaps
//   before locking in.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";
import { paragraphNumber } from "./source-passages.ts";

type Scene = WorldPack["scenes"][number];
type Clue = Scene["artifacts"][number];
export type BankQuestion = NonNullable<Clue["bank"]>[number];
export type BankAnswer = BankQuestion["answers"][number];
export type ProveIt = NonNullable<BankQuestion["prove"]>;

const same = (a: string, b: string) => lineWords(a) === lineWords(b);
export const paragraphLabelOf = (pid: string) => `¶${paragraphNumber(pid)}`;

// ---------- Tries and points ----------
export const MAX_TRIES = 3;
export const WRONG_LINE_COST = 25;
// The share of a question's points earned on a try: full, half, then none.
export const tryFactor = (tryNo: number) => (tryNo <= 1 ? 1 : tryNo === 2 ? 0.5 : 0);
// A round's points after wrong lines, never below 0.
export const afterWrongLines = (points: number, wrongLines: number) => Math.max(0, Math.round(points - wrongLines * WRONG_LINE_COST));

// Where a line sits in its paragraph: the first, middle or last part (try 3's hint).
export function partOfParagraph(passage: SourcePassage | undefined, line: string): "first" | "middle" | "last" {
  const lines = passage ? evidenceSentences(passage.text) : [];
  const i = lines.findIndex((l) => same(l, line));
  if (i < 0 || lines.length < 3) return i === lines.length - 1 && i > 0 ? "last" : "first";
  const share = i / lines.length;
  return share < 1 / 3 ? "first" : share < 2 / 3 ? "middle" : "last";
}
// The hint after a miss. Try 2 names the paragraph (a near miss's authored hint does that already); try 3 narrows it
// to the part of the paragraph. The right line itself is never shown or highlighted.
export function missHint(nextTry: number, answer: { pid: string; line: string }, passages: SourcePassage[], nearMiss?: string) {
  const where = paragraphLabelOf(answer.pid);
  if (nextTry <= 2) return nearMiss ?? `Not that one. Look again in ${where}.`;
  return `Look in the ${partOfParagraph(passages.find((p) => p.id === answer.pid), answer.line)} part of ${where}.`;
}

// ---------- Exact words (lines over 25 words) ----------
export const PHRASE_MIN_WORDS = 26, PHRASE_TOLERANCE = 2;
// The words of a line as the screen shows them: a word broken across a line ends joined again, and Irving's "--" stands
// alone as a dash.
export const lineTokens = (line: string) => line.replace(/(\w)-[ \t]*\r?\n\s*(\w)/g, "$1-$2").replace(/--|—/g, " — ").replace(/\s+/g, " ").trim().split(" ");
export const needsPhrase = (line: string) => lineTokens(line).length >= PHRASE_MIN_WORDS;
const bare = (w: string) => w.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9'-]/g, "");
// The word range [start, end] (inclusive, in lineTokens positions) a phrase covers in its line, or null. Dashes and
// punctuation-only tokens are skipped when matching.
export function phraseRange(line: string, phrase: string): [number, number] | null {
  const words = lineTokens(line).map((t, i) => ({ w: bare(t), i })).filter((x) => x.w), want = lineTokens(phrase).map(bare).filter(Boolean);
  if (!want.length) return null;
  for (let i = 0; i + want.length <= words.length; i++) if (want.every((w, k) => words[i + k].w === w)) return [words[i].i, words[i + want.length - 1].i];
  return null;
}
// A marked range proves the line when it holds one of the answer's key phrases (the authored phrase if none).
export const phraseKeys = (a: { phrase?: string; key?: string | string[] }) => (a.key === undefined ? (a.phrase ? [a.phrase] : []) : Array.isArray(a.key) ? a.key : [a.key]);
export function phraseMatches(line: string, a: { phrase?: string; key?: string | string[] }, marked: [number, number]) {
  const [s, e] = marked[0] <= marked[1] ? marked : [marked[1], marked[0]];
  return phraseKeys(a).some((k) => { const r = phraseRange(line, k); return !!r && s <= r[0] && e >= r[1]; });
}
export const MARK_AGAIN = "Right line! Mark the words that prove it.";

// ---------- Prove it ----------
export const PROVE_FRAME = { start: "This proves", middle: "because" } as const;
// The four choices in a stable shuffled order for this student (the right one is never always first).
export function proveChoices(p: ProveIt, seed: string) {
  const all = [p.right, ...p.wrong];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return all.map((text, i) => ({ text, k: (h ^ (i * 2654435761)) >>> 0 })).sort((a, b) => a.k - b.k).map((x) => x.text);
}
export const proveRight = (p: ProveIt, choice: string) => choice.trim() === p.right;
// A typed Prove it: "This proves ___ because ___", both blanks filled. Never scored; saved for the teacher.
export function typedProof(proves: string, because: string) {
  const a = proves.trim().replace(/\s+/g, " "), b = because.trim().replace(/\s+/g, " ");
  return a && b ? `${PROVE_FRAME.start} ${a} ${PROVE_FRAME.middle} ${b}` : "";
}

// ---------- Question banks ----------
function hash(s: string) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
// Picks a question for a student. seen: ids they've had (a replay gets a new one until they've seen them all); seat: their
// position in the class roster (neighbors differ); chunk: their squad chunk's paragraphs (answers must be there).
// prefer: questions to choose from first when any match (a student's mission pieces, so proving lines can earn them).
export function pickQuestion<T extends { id: string }>(bank: T[], o: { seed: string; seen?: string[]; seat?: number | null; chunk?: string[]; answerPids?: (q: T) => string[]; prefer?: (q: T) => boolean }): T {
  let pool = bank;
  if (o.prefer) { const preferred = bank.filter(o.prefer); if (preferred.length) pool = preferred; }
  if (o.chunk?.length && o.answerPids) { const inChunk = bank.filter((q) => o.answerPids!(q).some((pid) => o.chunk!.includes(pid))); if (inChunk.length) pool = inChunk; }
  const fresh = pool.filter((q) => !o.seen?.includes(q.id));
  const from = fresh.length ? fresh : pool;
  if (o.seat !== null && o.seat !== undefined) {
    // Seat order across the whole pool, so the student beside you starts one question later.
    const start = (o.seat + hash(o.seed)) % pool.length;
    for (let k = 0; k < pool.length; k++) { const q = pool[(start + k) % pool.length]; if (from.includes(q)) return q; }
  }
  return from[hash(o.seed) % from.length];
}

// A clue's questions: its authored bank, or (for stories without one yet) one question from the clue's Notice prompt
// that any of the clue's evidence lines answers.
export function clueBank(world: WorldPack, passages: SourcePassage[], clue: Clue, prompt: string): BankQuestion[] {
  if (clue.bank?.length) return clue.bank;
  const lines = passages.filter((p) => clue.source_anchor.includes(p.id)).flatMap((p) => evidenceSentences(p.text));
  return [{ id: "notice", ladder: "locate", question: prompt, answers: lines.map((line) => ({ line })), near_misses: [], prove: null }];
}
export const answerFor = (q: { answers: BankAnswer[] }, line: string) => q.answers.find((a) => same(a.line, line));
export const nearMissFor = (q: { near_misses?: { line: string; hint: string }[] }, line: string) => q.near_misses?.find((n) => same(n.line, line));
// The paragraph of an answer line, from the clue's panel or the whole story.
export function pidOf(passages: SourcePassage[], line: string) {
  return passages.find((p) => evidenceSentences(p.text).some((l) => same(l, line)))?.id ?? "";
}

// ---------- Words to know ----------
// Word cards above the passage (app/reading-panel.tsx).
export type GlossaryWord = { term: string; student_friendly_definition: string };
// The glossary words in these paragraphs, in the order they first appear.
export function wordsToKnow(passages: SourcePassage[], glossary: GlossaryWord[] = []) {
  const text = passages.map((p) => p.text).join(" ").replace(/\s+/g, " ").toLowerCase();
  const letter = (c: string | undefined) => !!c && /[a-zà-ÿ]/.test(c);
  // A whole-word match: no letter right before or after ("discrimination", not "indiscriminate").
  const find = (term: string) => { const t = term.toLowerCase(); for (let i = text.indexOf(t); i >= 0; i = text.indexOf(t, i + 1)) if (!letter(text[i - 1]) && !letter(text[i + t.length])) return i; return -1; };
  return glossary.map((g) => ({ g, at: find(g.term) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at).map((x) => x.g);
}

// ---------- Points goal ----------
export const LEVELS = [
  { id: "opened", name: "Case Opened", pct: 40 },
  { id: "built", name: "Case Built", pct: 70 },
  { id: "cracked", name: "Case Cracked", pct: 90 },
] as const;
export type LevelId = (typeof LEVELS)[number]["id"];
export function levelFor(total: number, max: number) {
  if (max <= 0) return null;
  return [...LEVELS].reverse().find((l) => total >= Math.ceil((l.pct / 100) * max)) ?? null;
}
export const levelPoints = (max: number) => LEVELS.map((l) => ({ ...l, points: Math.ceil((l.pct / 100) * max) }));

// ---------- Speed flags (teacher only) ----------
export const FAST_TAP_MS = 4000, MAX_SWAPS = 4;
export type SpeedFlag = "fast" | "swaps";
export function speedFlags(firstTapMs: number | null | undefined, swaps: number | null | undefined): SpeedFlag[] {
  return [...(typeof firstTapMs === "number" && firstTapMs >= 0 && firstTapMs < FAST_TAP_MS ? ["fast" as const] : []), ...((swaps ?? 0) > MAX_SWAPS ? ["swaps" as const] : [])];
}
export const SPEED_FLAG_TEXT: Record<SpeedFlag, string> = { fast: "Tapped a line within 4 seconds of opening the passage", swaps: "More than 4 swaps before locking in" };

// ---------- Paraphrase check (by word root) ----------
// Common words and story names never count as a shared key word.
const STOP = new Set("what which where when while does that this with from have they their there them were then than into your about after before would could should only just been being also more most some other such very still back down over under once again across onto upon these those whose because said says tell tells show shows line lines find tap story text tapped".split(" "));
// A word's root: "belongings" and "belonged" are the same word ("belong").
export function wordRoot(word: string) {
  let w = word.toLowerCase().replace(/[‘’]/g, "'").replace(/'s$/, "").replace(/[^a-z]/g, "");
  for (const suf of ["ings", "ing", "edly", "ed", "ers", "er", "ies", "es", "s", "ly", "ments", "ment"]) {
    if (w.length - suf.length >= 4 && w.endsWith(suf)) { w = w.slice(0, -suf.length) + (suf === "ies" ? "y" : ""); break; }
  }
  return w.replace(/(.)\1$/, "$1").replace(/e$/, "");
}
// A capitalized word that doesn't start a sentence is a name ("Ichabod", "Hans Van Ripper") and never counts.
export function keyRoots(text: string, names: Set<string>) {
  const tokens = text.replace(/[“”"]/g, " ").split(/(?<=[.!?:])\s+|\s+/);
  const out = new Set<string>();
  tokens.forEach((tok, i) => {
    const startsSentence = i === 0 || /[.!?:]$/.test(tokens[i - 1] ?? "");
    for (const t of tok.split(/[^A-Za-z’']+/)) {
      if (t.length < 4 || STOP.has(t.toLowerCase()) || names.has(t.toLowerCase().replace(/[’']s$/, ""))) continue;
      if (/^[A-Z]/.test(t) && !startsSentence) continue;
      const r = wordRoot(t);
      if (r.length >= 3) out.add(r);
    }
  });
  return out;
}
// Name words (characters, title words) that may appear in both a question and its answers.
export function nameWords(world: WorldPack) {
  return new Set(world.characters.flatMap((c) => c.name.toLowerCase().split(/[^a-z]+/)).filter(Boolean));
}
export function sharedRoots(question: string, lines: string[], names: Set<string>, ok: string[] = []) {
  const q = keyRoots(question, names), allowed = new Set(ok.map(wordRoot));
  return [...new Set(lines.flatMap((l) => [...keyRoots(l, names)]))].filter((r) => q.has(r) && !allowed.has(r));
}

// ---------- validate:worlds: clue banks ----------
// Proof Race sprints (content only): each is one question, answered by a line in its own short chunk, checked like a
// bank question (exact lines, near misses on the chunk with a ¶ hint, one thing per question, no shared word roots), with
// the chunk inside the scene's reading.
export function sprintProblems(world: WorldPack, passages: SourcePassage[], reading: (sceneIndex: number) => Set<string>): string[] {
  const problems: string[] = [], names = nameWords(world), dash = /—/;
  world.scenes.forEach((scene, i) => {
    const ids = new Set<string>(), inScene = reading(i);
    for (const s of scene.sprints ?? []) {
      const at = `${world.id}/${scene.id} sprint/${s.id}`;
      if (ids.has(s.id)) problems.push(`${at}: id used twice`);
      ids.add(s.id);
      for (const p of s.paragraphs) if (!inScene.has(p)) problems.push(`${at}: ${p} is not in this scene's reading`);
      const chunk = new Set(s.paragraphs);
      const onChunk = (line: string) => { const p = passages.find((x) => chunk.has(x.id) && evidenceSentences(x.text).includes(line)); return p ? { text: line, pid: p.id } : null; };
      problems.push(...questionProblems(at, { question: s.question, answers: s.answers, near_misses: s.near_misses }, names, onChunk, (line) => onChunk(line)?.pid ?? null, false));
      if ([s.question, ...s.near_misses.map((n) => n.hint), ...(s.gist?.options.map((o) => o.text) ?? [])].some((t) => dash.test(t))) problems.push(`${at}: no em dashes`);
      // Gist: exactly one best summary, all three different.
      if (s.gist && (s.gist.options.filter((o) => o.best).length !== 1 || new Set(s.gist.options.map((o) => o.text)).size !== 3)) problems.push(`${at}: the gist needs 3 different summaries, exactly one best`);
      // Short chunk: 2 to 4 sentences of one of its paragraphs, holding every answer that is in that paragraph.
      if (s.short) {
        const p = passages.find((x) => x.id === s.short!.paragraph), lines = p ? evidenceSentences(p.text) : [];
        const n = s.short.to - s.short.from + 1, inShort = lines.slice(s.short.from - 1, s.short.to);
        if (!s.paragraphs.includes(s.short.paragraph) || !p) problems.push(`${at}: the short chunk must be one of the sprint's paragraphs`);
        else if (n < 2 || n > 4 || s.short.to > lines.length) problems.push(`${at}: the short chunk is 2 to 4 sentences of ${s.short.paragraph}`);
        else if (s.answers.some((a) => lines.includes(a) && !inShort.includes(a))) problems.push(`${at}: the short chunk leaves out an answer`);
      }
    }
  });
  return problems;
}
export function bankProblems(world: WorldPack, passages: SourcePassage[], panelOf: (scene: Scene, clue: Clue) => SourcePassage[]): string[] {
  const problems: string[] = [];
  const names = nameWords(world);
  const dash = /—/;
  for (const scene of world.scenes) {
    if (scene.writing_clue && !scene.artifacts.some((a) => a.id === scene.writing_clue)) problems.push(`${world.id}/${scene.id}: writing_clue ${scene.writing_clue} is not a clue in this scene`);
    for (const clue of scene.artifacts) {
      if (!clue.bank) continue;
      const where = `${world.id}/${clue.id} bank`;
      if (clue.bank.length < 3 || clue.bank.length > 4) problems.push(`${where}: 3 or 4 questions`);
      const ids = new Set<string>();
      const panel = new Set(panelOf(scene, clue).map((p) => p.id));
      for (const q of clue.bank) {
        const at = `${where}/${q.id}`;
        if (ids.has(q.id)) problems.push(`${at}: id used twice`);
        ids.add(q.id);
        // Answers and near misses: exact lines on the clue's panel (its paragraphs and one on each side).
        const onPanel = (line: string) => { const p = passages.find((x) => panel.has(x.id) && evidenceSentences(x.text).includes(line)); return p ? { text: line, pid: p.id } : null; };
        problems.push(...questionProblems(at, q, names, onPanel, (line) => onPanel(line)?.pid ?? null));
        if (q.prove === null) problems.push(`${at}: authored questions need Prove it choices`);
        if ([q.question, ...(q.near_misses ?? []).map((n) => n.hint), ...(q.prove ? [q.prove.right, ...q.prove.wrong] : [])].some((t) => dash.test(t))) problems.push(`${at}: no em dashes`);
      }
    }
  }
  return problems;
}
// One authored question: exact answer lines, exact phrases where a line is long, near misses that are on the panel and
// not answers with a hint naming a paragraph, 4 Prove it choices, and no key word shared with its answers.
// answerLine: the exact line an answer must be (or null); nearLine: the paragraph a near miss is on, if allowed.
export function questionProblems(at: string, q: { question?: string; focus?: string; answers: (BankAnswer | string)[]; near_misses?: { line: string; hint: string }[]; prove?: ProveIt | null; shared_ok?: string[] }, names: Set<string>, answerLine: (line: string) => { text: string; pid: string } | null, nearLine: (line: string) => string | null, phrases = true): string[] {
  const problems: string[] = [];
  const answers = q.answers.map((a) => (typeof a === "string" ? { line: a } : a));
  for (const a of answers) {
    const l = answerLine(a.line);
    if (!l || l.text !== a.line) problems.push(`${at}: answer "${a.line.replace(/\s+/g, " ").slice(0, 60)}" is not copied exactly from one of its evidence lines`);
    if (phrases && "phrase" in a && a.phrase !== undefined && !phraseRange(a.line, a.phrase)) problems.push(`${at}: phrase "${a.phrase.slice(0, 50)}" is not in its line`);
    if (phrases && "phrase" in a && a.phrase) {
      if (a.key === undefined) problems.push(`${at}: phrase "${a.phrase.slice(0, 40)}" needs its key proof words`);
      for (const k of phraseKeys(a)) if (!phraseRange(a.line, k)) problems.push(`${at}: key "${k.slice(0, 40)}" is not in its line`);
    }
    if (phrases && needsPhrase(a.line) && !("phrase" in a && a.phrase)) problems.push(`${at}: a line over 25 words needs a proof phrase`);
  }
  for (const n of q.near_misses ?? []) {
    if (!nearLine(n.line)) problems.push(`${at}: near miss "${n.line.replace(/\s+/g, " ").slice(0, 60)}" is not an exact line on this question's passage`);
    if (answers.some((a) => same(a.line, n.line))) problems.push(`${at}: a near miss is also an answer`);
    if (!/¶\d+/.test(n.hint)) problems.push(`${at}: a near miss hint names a paragraph (¶)`);
  }
  if (q.prove && (q.prove.wrong.length !== 3 || new Set([q.prove.right, ...q.prove.wrong]).size !== 4)) problems.push(`${at}: Prove it needs 4 different choices`);
  // One question, one thing: no "…, and what/why/how…" and no second question mark.
  const text = q.question ?? q.focus ?? "";
  if (/,\s+and\s+(what|why|how|where|who|whose|when|which)\b/i.test(text) || (text.match(/\?/g) ?? []).length > 1) problems.push(`${at}: ask one thing per question`);
  const shared = sharedRoots(text, answers.map((a) => a.line), names, q.shared_ok);
  if (shared.length) problems.push(`${at}: the question shares key words with its answers (${shared.join(", ")}); paraphrase it`);
  return problems;
}
