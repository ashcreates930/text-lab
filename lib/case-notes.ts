// After the race (expedition phase 3): the Refresher, Case Notes, and the Bonus Round's Squad Case File. Pure functions
// shared by the solo race, the live phones and the host board; the PDFs are built here too (jsPDF), so they work in the
// browser and in tests.
import { jsPDF } from "jspdf";
import type { ExpQuestion } from "./world-schema.ts";
import { TYPE_INFO, chunkTokens, norm, proofShown, wordsProve, type Answer, type RaceChunk } from "./expedition.ts";

// One chunk's result, from the solo race or from a live game's rows.
export type ChunkResult = { index: number; answer: Answer | null; correct: boolean; late: boolean; gist: number | null; typed: string | null; unknown: string[] };
const bestOf = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => !!x.best);
export const gistRight = (chunk: RaceChunk, gist: number | null) => gist !== null && !!chunk.chunk.gist.options[gist]?.best;

// ---------- The Refresher ----------
// Only what the student missed, up to 4: race questions first (in story order), then Gist checks.
export const REFRESHER_MAX = 4;
export type RefresherItem = { index: number; kind: "question" | "gist" };
export function refresherItems(chunks: RaceChunk[], results: ChunkResult[]): RefresherItem[] {
  const q = results.filter((r) => !r.correct).map((r) => ({ index: r.index, kind: "question" as const }));
  const g = results.filter((r) => !gistRight(chunks[r.index], r.gist)).map((r) => ({ index: r.index, kind: "gist" as const }));
  return [...q, ...g].slice(0, REFRESHER_MAX);
}
// A Refresher answer: untimed, with a hint; the student taps the proof. Stars and a badge, never leaderboard points.
export type RefresherAnswer = { choice?: number | null; choice2?: number | null; lines?: string[]; words?: number[] };
export function refresherCorrect(item: RefresherItem, chunk: RaceChunk, a: RefresherAnswer, callLines: string[] = []) {
  if (item.kind === "gist") return a.choice === bestOf(chunk.chunk.gist.options);
  const q = chunk.chunk.question;
  if (q.type === "figure_it_out") return a.choice2 === bestOf(q.choices2?.options);
  if (q.type === "make_call") { const got = [...new Set((a.lines ?? []).map(norm))]; return got.length === 2 && (q.theories ?? []).some((t) => got.every((g) => t.lines.some((l) => norm(l) === g))) && got.every((g) => callLines.length === 0 || callLines.some((l) => norm(l) === g)); }
  if (q.proof?.words?.length) return wordsProve(chunkTokens(chunk.lines), a.words ?? [], q.proof.words);
  const want = (q.proof?.lines ?? []).map(norm), got = (a.lines ?? []).map(norm);
  return got.length > 0 && got.every((g) => want.includes(g));
}
// What the Refresher asks the student to do for an item.
export function refresherTask(item: RefresherItem, q: ExpQuestion): "gist" | "meaning" | "words" | "line" | "pin2" {
  if (item.kind === "gist") return "gist";
  if (q.type === "figure_it_out") return "meaning";
  if (q.type === "make_call") return "pin2";
  return q.proof?.words?.length ? "words" : "line";
}
// Stars: one for each item fixed. Badges: "Perfect run" for no misses at all; "Comeback Detective" for fixing every
// item; "Second Look" for fixing at least one.
export function refresherAward(items: RefresherItem[], fixed: boolean[]) {
  const stars = fixed.filter(Boolean).length;
  const badge = items.length === 0 ? "Perfect run" : stars === items.length ? "Comeback Detective" : stars > 0 ? "Second Look" : null;
  return { stars, of: items.length, badge };
}

// ---------- Case Notes ----------
export type CaseNote = {
  chunk: number; type: string; question: string; answer: string; proof: string; rightFirstTry: boolean; fixed: boolean | null;
  gistPick: string | null; gistRight: boolean; typedQuestion: string | null; unknownWords: string[]; correctProof: string; standards: string[]; note: string;
};
// The student's answer and proof, in words.
export function answerText(q: ExpQuestion, a: Answer | null, chunk: RaceChunk) {
  if (!a) return { answer: "No answer (time ran out)", proof: "" };
  const tokens = chunkTokens(chunk.lines);
  const parts: string[] = [];
  if (a.choice != null && q.choices?.[a.choice]) parts.push(q.choices[a.choice].text);
  if (a.choice2 != null && q.choices2?.options[a.choice2]) parts.push(q.choices2.options[a.choice2].text);
  if (a.theory) parts.push(q.theories?.find((t) => t.id === a.theory)?.name ?? a.theory);
  const proof = a.words?.length ? `"${a.words.map((i) => tokens[i]?.text ?? "").join(" ")}"` : (a.lines ?? []).map((l) => `"${l.replace(/\s+/g, " ")}"`).join(" ");
  return { answer: parts.join(" · ") || (proof ? "Tapped a line" : "No answer"), proof };
}
export function correctProofText(q: ExpQuestion, chunk: RaceChunk) {
  const tokens = chunkTokens(chunk.lines), s = proofShown(q, tokens);
  if (s.words.length) return `"${s.words.map((i) => tokens[i].text).join(" ")}"`;
  if (q.type === "figure_it_out") return q.choices2?.options.find((o) => o.best)?.text ?? "";
  return s.lines.map((l) => `"${l.replace(/\s+/g, " ")}"`).join(" ");
}
// One entry per chunk, built during play, with blank space for the student's own notes.
export function caseNotes(chunks: RaceChunk[], results: ChunkResult[], refresher: { items: RefresherItem[]; fixed: boolean[] } = { items: [], fixed: [] }, notes: Record<number, string> = {}): CaseNote[] {
  return chunks.map((c) => {
    const r = results.find((x) => x.index === c.index), q = c.chunk.question, t = answerText(q, r?.answer ?? null, c);
    const k = refresher.items.findIndex((it) => it.index === c.index && it.kind === "question");
    return {
      chunk: c.index + 1, type: TYPE_INFO[q.type].name, question: q.prompt, answer: t.answer, proof: t.proof, rightFirstTry: !!r?.correct,
      fixed: k >= 0 ? !!refresher.fixed[k] : null, gistPick: r?.gist != null ? c.chunk.gist.options[r.gist]?.text ?? null : null, gistRight: gistRight(c, r?.gist ?? null),
      typedQuestion: r?.typed ?? null, unknownWords: r?.unknown ?? [], correctProof: correctProofText(q, c), standards: q.standards, note: notes[c.index] ?? "",
    };
  });
}

// ---------- The Bonus Round ----------
// Squads of 2 to 4 compare Case Notes. A question is flagged when members answered it differently; the expedition's
// final call is always on the list. Every member defends at least one choice.
export const BONUS_ROLES = ["Lead Investigator", "Evidence Keeper", "Skeptic", "Reporter"] as const;
export const BONUS_STEMS = ["I chose this line because…", "I disagree, because the text says…", "This proves it because…", "What if we look at…"] as const;
export const BONUS_POINTS = 100;
export type MemberResults = { id: string; name: string; results: ChunkResult[] };
const answerKey = (a: Answer | null | undefined) => JSON.stringify({ c: a?.choice ?? null, c2: a?.choice2 ?? null, t: a?.theory ?? null, l: [...(a?.lines ?? [])].map(norm).sort(), w: [...(a?.words ?? [])].sort((x, y) => x - y) });
export function flaggedQuestions(chunks: RaceChunk[], members: MemberResults[]) {
  return chunks.filter((c) => {
    if (c.chunk.question.type === "make_call") return true;
    const keys = members.map((m) => answerKey(m.results.find((r) => r.index === c.index)?.answer));
    return new Set(keys).size > 1;
  }).map((c) => c.index);
}
// Roles rotate through the squad, one per member (a pair takes the first two).
export const rolesFor = (members: { id: string }[], round = 0) => Object.fromEntries(members.map((m, k) => [m.id, BONUS_ROLES[(k + round) % BONUS_ROLES.length]]));
// The squad's agreed answer for one flagged question: whose proof they chose, who defended it and why.
export type BonusPick = { index: number; from: string; answer: Answer; defender: string; stem: string; reason: string };
export function bonusProblems(flagged: number[], members: { id: string }[], picks: BonusPick[]) {
  const out: string[] = [];
  for (const i of flagged) if (!picks.some((p) => p.index === i)) out.push(`Agree on chunk ${i + 1}`);
  for (const m of members) if (!picks.some((p) => p.defender === m.id)) out.push("Every member defends at least one choice");
  return [...new Set(out)];
}
export type SquadCaseFile = { squad: string; members: { name: string; role: string; defended: number[] }[]; items: { chunk: number; question: string; agreed: string; proof: string; right: boolean; from: string; defender: string; why: string }[]; finalCall: string | null; points: number };
export function squadCaseFile(squad: string, chunks: RaceChunk[], members: MemberResults[], picks: BonusPick[], round = 0): SquadCaseFile {
  const roles = rolesFor(members, round), nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "A member";
  const items = picks.slice().sort((a, b) => a.index - b.index).map((p) => {
    const c = chunks[p.index], q = c.chunk.question, t = answerText(q, p.answer, c);
    const tokens = chunkTokens(c.lines);
    const right = q.type === "make_call" ? !!q.theories?.find((th) => th.id === p.answer.theory && (p.answer.lines ?? []).length === 2 && (p.answer.lines ?? []).every((l) => th.lines.some((x) => norm(x) === norm(l))))
      : q.proof?.words?.length ? wordsProve(tokens, p.answer.words ?? [], q.proof.words) && p.answer.choice === bestOf(q.choices)
      : q.type === "figure_it_out" ? p.answer.choice === bestOf(q.choices) && p.answer.choice2 === bestOf(q.choices2?.options)
      : (q.choices ? p.answer.choice === bestOf(q.choices) : true) && (p.answer.lines ?? []).length > 0 && (p.answer.lines ?? []).every((l) => (q.proof?.lines ?? []).some((x) => norm(x) === norm(l)));
    return { chunk: p.index + 1, question: q.prompt, agreed: t.answer, proof: t.proof, right, from: nameOf(p.from), defender: nameOf(p.defender), why: `${p.stem} ${p.reason}`.trim() };
  });
  const call = picks.find((p) => chunks[p.index]?.chunk.question.type === "make_call");
  return {
    squad, members: members.map((m) => ({ name: m.name, role: roles[m.id], defended: picks.filter((p) => p.defender === m.id).map((p) => p.index + 1) })),
    items, finalCall: call ? items.find((i) => i.chunk === call.index + 1)?.agreed ?? null : null, points: items.filter((i) => i.right).length * BONUS_POINTS,
  };
}

// ---------- PDFs ----------
// White page, dark text; each Case Notes entry ends with ruled space for the student's own notes.
function pdfWriter(title: string, subtitle: string) {
  const doc = new jsPDF({ unit: "pt", format: "letter" }); const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
  let y = M;
  const ensure = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; } };
  const text = (s: string, size = 11, bold = false, gap = 4) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size); for (const line of doc.splitTextToSize(s, W - 2 * M) as string[]) { ensure(size + gap); doc.text(line, M, y + size); y += size + gap; } };
  const rule = (n: number) => { for (let k = 0; k < n; k++) { ensure(22); y += 20; doc.setDrawColor(170); doc.line(M, y, W - M, y); } y += 8; };
  doc.setTextColor(17, 17, 17); text(title, 20, true, 6); text(subtitle, 11, false, 10); y += 6;
  return { doc, text, rule, space: (h: number) => { y += h; } };
}
export function caseNotesPdf(student: string, story: string, expedition: string, notes: CaseNote[]) {
  const w = pdfWriter(`Case Notes: ${expedition}`, `${story} · ${student}`);
  for (const n of notes) {
    w.text(`Chunk ${n.chunk} · ${n.type} · ${n.rightFirstTry ? "Proved on the one try" : n.fixed ? "Fixed in the Refresher" : n.fixed === false ? "Not fixed yet" : "Missed"}`, 12, true);
    w.text(`Question: ${n.question}`); w.text(`My answer: ${n.answer}${n.proof ? ` · My proof: ${n.proof}` : ""}`);
    w.text(`The proof: ${n.correctProof}`);
    if (n.gistPick) w.text(`Gist pick: ${n.gistPick} (${n.gistRight ? "best summary" : "not the best"})`);
    if (n.typedQuestion) w.text(`My question: ${n.typedQuestion}`);
    if (n.unknownWords.length) w.text(`Words I didn't know: ${n.unknownWords.join(", ")}`);
    w.text(`Standards: ${n.standards.join(", ")}`, 9);
    w.text("My notes:", 11, true); if (n.note) w.text(n.note); w.rule(n.note ? 1 : 3); w.space(6);
  }
  return w.doc;
}
export function squadCaseFilePdf(story: string, expedition: string, file: SquadCaseFile) {
  const w = pdfWriter(`Squad Case File: ${file.squad}`, `${story} · ${expedition} · ${file.points} bonus points`);
  w.text("Members", 13, true);
  for (const m of file.members) w.text(`${m.name}, ${m.role}: defended chunk${m.defended.length === 1 ? "" : "s"} ${m.defended.join(", ") || "none"}`);
  w.space(8); w.text("Agreed answers", 13, true);
  for (const i of file.items) { w.text(`Chunk ${i.chunk}: ${i.question}`, 11, true); w.text(`Agreed: ${i.agreed}${i.proof ? ` · Proof: ${i.proof}` : ""} (${i.right ? "holds up" : "doesn't hold up"})`); w.text(`From ${i.from}'s notes; defended by ${i.defender}: ${i.why}`); w.space(4); }
  w.space(6); w.text(`The final call: ${file.finalCall ?? "not made"}`, 12, true);
  return w.doc;
}
