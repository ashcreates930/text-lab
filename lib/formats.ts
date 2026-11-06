// Question formats and the question bank (world-map phase 3). Pure rules, used by the race (solo and live), Case
// Notes, the Refresher and validate:worlds.
// - Formats: two-part evidence (Part A an answer, Part B the sentence that proves it), multiple choice, choose two or
//   more, tap the sentence, a one-sentence written response (judged on the rubric), drag and drop, Make the Call.
// - Drag and drop: 3 to 5 items placed into slots (put events in order, sort the evidence, the feeling of a word,
//   match the character, cause and effect, fact or witness claim, build the case, story map). Points for each piece
//   in its right place; only a fully right answer counts as proved (for streaks, stars and mastery).
// - The bank: each chunk has 2 or 3 questions on the same skill; each student gets one, seeded by who they are and
//   which attempt this is, so replays and neighbours see different questions.
// - Versions: easier and harder versions are written out, or derived: easier drops one wrong choice (or one
//   drag-and-drop piece) and shows the hint from the start; harder hides the highlighted key words and adds the proof
//   step to a multiple-choice question that has one.
// - The Gist check comes about every third chunk (1, 4, 7, 10), not every chunk.
import type { DND_KINDS, ExpChunk, ExpQuestion, QUESTION_FORMATS, QuestionType } from "./world-schema.ts";
import { shuffledOrder } from "./expedition.ts";

export type Format = (typeof QUESTION_FORMATS)[number];
export type DndKind = (typeof DND_KINDS)[number];
export type Version = "easier" | "standard" | "harder";

// ---------- Formats ----------
export function formatOf(q: Pick<ExpQuestion, "type" | "format" | "choices2" | "theories" | "proof">): Format {
  if (q.format) return q.format;
  if (q.type === "find_it" || q.type === "catch_lie") return "tap";
  if (q.type === "make_call") return "call";
  if (q.type === "figure_it_out" || q.type === "gist") return "mc";
  return "two_part";
}
// Two steps: an answer then its proof sentence (two-part evidence, a written answer with a proof), Figure It Out's two
// choices, or Make the Call. Everything else is one step.
export const stepsOf = (f: Format, type: QuestionType, hasProof: boolean): 1 | 2 => (f === "two_part" || f === "call" || (f === "written" && hasProof) || (f === "mc" && type === "figure_it_out") ? 2 : 1);
// What a phone or the board sees of a question beyond its words: the format, how many to choose, the drag-and-drop
// pieces and slots (never where they go), the hint on the easier version, and any discussion note.
export function formatView(q: ExpQuestion & { showHint?: boolean }) {
  const format = formatOf(q);
  return { format, steps: stepsOf(format, q.type, !!q.proof?.lines?.length), pick: format === "multi" ? q.pick ?? (q.choices?.filter((c) => c.best).length ?? 2) : null,
    dnd: q.dnd ? { kind: q.dnd.kind, slots: q.dnd.slots, items: q.dnd.items.map((i) => ({ id: i.id, text: i.text })) } : null, written: format === "written", hint: q.showHint ? q.hint : null, note: q.note ?? null, clues: !!q.clues?.length,
    name: q.dnd ? DND_INFO[q.dnd.kind].name : null };
}
// Whether a format ends with tapping the proof sentence.
export const needsProof = (f: Format, q: Pick<ExpQuestion, "proof">) => f === "two_part" || f === "tap" || (f === "written" && !!q.proof?.lines?.length);
// The words a student sees for each drag-and-drop kind.
export const DND_INFO: Record<DndKind, { name: string; how: string }> = {
  order_events: { name: "Put events in order", how: "Put the events in the order they happen." },
  sort_evidence: { name: "Sort the evidence", how: "Sort each piece: does it support the claim or disprove it?" },
  word_feeling: { name: "Feeling of the word", how: "Sort each word by the feeling it carries in the story." },
  match_character: { name: "Match the character", how: "Match each trait to the character it fits." },
  cause_effect: { name: "Cause and effect", how: "Match each cause to what it leads to." },
  fact_or_claim: { name: "Fact or witness claim", how: "Sort each one: does the text say it, or does a witness only claim it?" },
  build_case: { name: "Build the case", how: "Build the case: a claim, the sentence that proves it, and the reason." },
  story_map: { name: "Story map", how: "Place each piece on the story map: setting, conflict or resolution." },
};
export const DND_SECONDS = 45;

// ---------- The bank and versions ----------
// The questions a chunk has (the main one first).
export const bankOf = (c: Pick<ExpChunk, "question" | "bank">): ExpQuestion[] => [c.question, ...(c.bank ?? [])];
// Which bank question a student gets: seeded by the student, the chunk and the attempt (a replay gets another).
export function bankPick(c: Pick<ExpChunk, "id" | "question" | "bank">, seed: string, attempt = 0) {
  const all = bankOf(c); if (all.length === 1) return 0;
  const order = shuffledOrder(all.length, `${seed}|${c.id}|bank`);
  return order[attempt % all.length];
}
// A question at a version: the written-out one, or derived.
export function versionOf(q: ExpQuestion, v: Version): ExpQuestion & { showHint?: boolean } {
  if (v === "standard") return q;
  const written = q.versions?.[v]; if (written) return { ...written, standards: written.standards?.length ? written.standards : q.standards };
  const f = formatOf(q);
  if (v === "easier") {
    const out: ExpQuestion & { showHint?: boolean } = { ...q, showHint: true };
    if (q.choices && q.choices.length >= 3 && f !== "multi") { const drop = q.choices.findIndex((c) => !c.best); out.choices = q.choices.filter((_, i) => i !== drop); }
    if (q.dnd && q.dnd.items.length > 3) { const drop = q.dnd.items.length - 1; out.dnd = { ...q.dnd, items: q.dnd.items.filter((_, i) => i !== drop) }; }
    return out;
  }
  // Harder: no highlighted key words or focus word, and a multiple-choice question with a proof sentence asks for it.
  return { ...q, keywords: [], focus: undefined, ...(f === "mc" && q.proof?.lines?.length && !q.choices2 ? { format: "two_part" as const } : {}) };
}
// The question a student is asked at a chunk: their bank pick at their version.
export function askedQuestion(c: Pick<ExpChunk, "id" | "question" | "bank">, pick: { bank?: number; version?: Version }) {
  const all = bankOf(c), q = all[pick.bank ?? 0] ?? all[0];
  return versionOf(q, pick.version ?? "standard");
}
// A chunk with the question this student was asked (for Case Notes and the Refresher).
export const withAsked = <T extends { chunk: ExpChunk }>(rc: T, pick: { bank?: number; version?: Version }): T => ({ ...rc, chunk: { ...rc.chunk, question: askedQuestion(rc.chunk, pick) } });

// ---------- The Gist check ----------
export const gistAt = (step: number) => step % 3 === 0;

// ---------- Scoring the new formats ----------
// Choose two or more: right only with exactly the best choices.
export function multiRight(q: Pick<ExpQuestion, "choices">, picks: number[] | undefined) {
  const best = (q.choices ?? []).map((c, i) => (c.best ? i : -1)).filter((i) => i >= 0), got = [...new Set(picks ?? [])].sort((a, b) => a - b);
  return best.length > 0 && got.length === best.length && got.every((g, i) => g === best[i]);
}
// Drag and drop: which pieces are in their right slot (an item that belongs nowhere is right when left out).
export function dndResult(q: Pick<ExpQuestion, "dnd">, placed: Record<string, string | null> | undefined) {
  const items = q.dnd?.items ?? [], right = items.filter((it) => (placed?.[it.id] ?? null) === it.slot).map((it) => it.id);
  return { right, total: items.length, all: items.length > 0 && right.length === items.length };
}
// The written response, by rule (when the judge can't run, and as a floor): a claim that holds one idea from each
// group of key ideas, at least 6 words, one sentence; the evidence, a proof sentence; the reasoning, a word that
// connects them. Strong: all three; Solid: claim and evidence; otherwise Needs more evidence.
export type Strength = "Strong" | "Solid" | "Needs more evidence";
const CONNECT = /\b(because|shows?|showing|proves?|means|so|since|which|that is why|this is why|tells us|suggests?)\b/i;
export function writtenByRule(q: Pick<ExpQuestion, "written">, text: string, evidenceOk: boolean): Strength {
  const t = ` ${text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ")} `, words = t.trim().split(" ").filter(Boolean);
  const claim = words.length >= 6 && (q.written?.key_ideas ?? []).every((group) => group.some((k) => t.includes(` ${k.toLowerCase()}`)));
  if (claim && evidenceOk && CONNECT.test(text)) return "Strong";
  return claim && evidenceOk ? "Solid" : "Needs more evidence";
}
// The verdict on a written answer, in kind, plain words, when the judge can't write its own.
export type WrittenVerdict = { strength: Strength; note: string; next: string };
export function ruleVerdict(q: Pick<ExpQuestion, "written">, text: string, evidenceOk: boolean): WrittenVerdict {
  const strength = writtenByRule(q, text, evidenceOk);
  return { strength, note: strength === "Needs more evidence" ? "You gave an answer in your own words." : evidenceOk ? "Your answer and your sentence fit together." : "You answered in your own words.",
    next: strength === "Strong" ? "Keep explaining how the sentence proves your point." : !evidenceOk ? "Tap the sentence that best backs your answer." : strength === "Solid" ? "Add a few words that explain how your sentence proves it (because, shows, so)." : "Name the main idea the question asks about, then explain it." };
}
// Proved means a Solid or Strong answer; points scale with it.
export const writtenProved = (s: Strength | null | undefined) => s === "Strong" || s === "Solid";
export const writtenShare = (s: Strength | null | undefined) => (s === "Strong" ? 1 : s === "Solid" ? 0.75 : 0);
// Skills a drag-and-drop kind practises, for the type it should carry.
export const DND_TYPE: Record<DndKind, QuestionType> = {
  order_events: "story_structure", cause_effect: "story_structure", story_map: "story_structure",
  sort_evidence: "weigh_evidence", fact_or_claim: "weigh_evidence", build_case: "weigh_evidence",
  word_feeling: "shades", match_character: "character_clue",
};
