// Story missions: each student picks one mission at the start of a story, built on a real problem in the text and solved
// only by what the text says. A mission has 4 to 6 pieces (exact lines spread across the scenes) that are collected only
// when the student proves them in play (a clue, a Story Mode round, or the piece's own "mission lead" question), never
// with coins. Its payoff line stays sealed until the verdict: the clue that holds it opens only then, and no question,
// near miss, hint or character reply may point to it. The verdict: pick a theory, pin pieces (any lines from the story
// when fewer than 2 were found), write 2 or 3 sentences, then the payoff is revealed. Nothing here scores free writing.
// Content: each story's world.json `missions`. Shared by the screens, the chat route, the validator and the tests.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";
import { screenMessage } from "./safety.ts";
import { nameWords, sharedRoots, type BankQuestion } from "./fair-play.ts";

export type Mission = NonNullable<WorldPack["missions"]>[number];
export type MissionPiece = Mission["pieces"][number];
// What the student has: pieces by id (shown: collected through a shown answer; via: where it was proven).
export type PieceRecord = { at: string; shown: boolean; via: string };
export type MissionVerdict = { mission_id: string; theory_id: string; pinned: { line: string; pid: string; piece: string | null }[]; writing: string; early: boolean; saved_at: string };

const same = (a: string, b: string) => lineWords(a) === lineWords(b);
export const missionFor = (world: WorldPack, id: string | null | undefined) => (id ? world.missions?.find((m) => m.id === id) : undefined);
export const pieceForLine = (m: Mission, line: string) => m.pieces.find((p) => same(p.line, line));
export const isPayoff = (m: Mission | undefined, line: string) => !!m && same(m.payoff.line, line);
export const MIN_PINS = 2;

// Collects the pieces among lines the student just proved. Already-found pieces keep their first record.
export function collectPieces(m: Mission | undefined, found: Record<string, PieceRecord> | undefined, lines: string[], o: { shown?: boolean; via: string }): Record<string, PieceRecord> | null {
  if (!m) return null;
  const next = { ...(found ?? {}) };
  let added = false;
  for (const l of lines) { const p = pieceForLine(m, l); if (p && !next[p.id]) { next[p.id] = { at: new Date().toISOString(), shown: !!o.shown, via: o.via }; added = true; } }
  return added ? next : null;
}
export const piecesFound = (m: Mission, found: Record<string, PieceRecord> | undefined) => m.pieces.filter((p) => found?.[p.id]);

// Sealing: the payoff clue opens only at the verdict. Banks never ask about the payoff line or use it as a near miss.
export const sealedClue = (m: Mission | undefined) => m?.sealed_clue ?? null;
export function withoutPayoff(bank: BankQuestion[], m: Mission | undefined): BankQuestion[] {
  if (!m) return bank;
  const kept = bank.filter((q) => !q.answers.some((a) => isPayoff(m, a.line))).map((q) => ({ ...q, near_misses: q.near_misses.filter((n) => !isPayoff(m, n.line)) }));
  return kept.length ? kept : bank;
}
// A character reply that names the payoff (any of its authored key phrases) is replaced before the student sees it.
const flat = (t: string) => t.replace(/\s+/g, " ").toLowerCase();
export const revealsPayoff = (m: Mission | undefined, text: string) => !!m && m.payoff.keywords.some((k) => flat(text).includes(flat(k)));
export const PAYOFF_GUARD = "I can't say more about that. Look closely at the story instead.";

// ---------- The verdict ----------
// Ready to save: a theory, at least 2 pinned lines (pieces, or any lines when fewer than 2 pieces were found), and 2 or
// 3 sentences, screened like character questions. Never scored.
export function verdictProblems(v: { theoryId: string; pinned: string[]; writing: string }) {
  const problems: string[] = [];
  if (!v.theoryId) problems.push("Pick your theory.");
  if (v.pinned.length < MIN_PINS) problems.push(`Pin at least ${MIN_PINS} lines.`);
  const t = v.writing.trim().replace(/\s+/g, " ");
  const n = (t.match(/[^.!?]+[.!?]+["”’)]*/g)?.filter((s) => /[A-Za-z]/.test(s)).length ?? 0) + (t.replace(/[^.!?]+[.!?]+["”’)]*/g, "").trim() ? 1 : 0);
  if (n < 2 || n > 3) problems.push("Write 2 or 3 sentences.");
  if (t && screenMessage(t).action !== "allow") problems.push(screenMessage(t).message ?? "Try different words.");
  return problems;
}
// An authored note for the reveal that never judges the writing: how many pieces were found.
export function verdictNote(found: number, total: number) {
  if (found === total) return `You found all ${total} pieces.`;
  if (found >= MIN_PINS) return `You found ${found} of ${total} pieces. Compare: which of your lines point the same way as the text?`;
  return `You found ${found} of ${total} pieces, so you cited other lines from the story. Compare them with what the text says.`;
}
export const EARLY = "You found it before the reveal.";

// ---------- validate:worlds ----------
export function missionProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const problems: string[] = [];
  const names = nameWords(world);
  const lineAt = (line: string) => passages.find((p) => evidenceSentences(p.text).includes(line))?.id ?? null;
  const dash = /—/;
  const storyLines = world.scenes.flatMap((s) => [
    ...(s.story_mode ? [...s.story_mode.read.bank.flatMap((q) => [...q.answers, ...q.near_misses.map((n) => n.line)]), ...s.story_mode.infer.bank.flatMap((q) => [...q.answers.map((a) => a.line), ...q.near_misses.map((n) => n.line)]), ...s.story_mode.call.bank.flatMap((q) => q.theories.flatMap((t) => t.supports)), ...s.story_mode.lies.map((l) => l.truth_line)] : []),
    ...(s.lie ? [s.lie.truth_line] : []),
  ]);
  for (const m of world.missions ?? []) {
    const where = `${world.id}/mission ${m.id}`;
    if (m.pieces.length < 4 || m.pieces.length > 6) problems.push(`${where}: 4 to 6 pieces`);
    const payoffPid = lineAt(m.payoff.line);
    if (!payoffPid) problems.push(`${where}: the payoff line is not copied exactly from the story`);
    const sealed = world.scenes.flatMap((s) => s.artifacts).find((a) => a.id === m.sealed_clue);
    if (!sealed) problems.push(`${where}: sealed_clue ${m.sealed_clue} is not a clue`);
    else if (payoffPid && !sealed.source_anchor.includes(payoffPid)) problems.push(`${where}: the sealed clue must hold the payoff paragraph (${payoffPid})`);
    if (!m.payoff.keywords.length || m.payoff.keywords.some((k) => !flat(m.payoff.line).includes(flat(k)))) problems.push(`${where}: payoff keywords must come from the payoff line`);
    if (storyLines.some((l) => same(l, m.payoff.line))) problems.push(`${where}: the payoff line is used in Story Mode or a Spot the Lie; it must stay sealed`);
    for (const s of world.scenes) for (const a of s.artifacts) if (a.id !== m.sealed_clue && (a.off_claim ? [a.off_claim, ...(a.off_claim.also ?? [])] : []).some((o) => same(o.line, m.payoff.line))) problems.push(`${where}: ${a.id}'s off claim is corrected by the payoff line`);
    const scenes = new Set<string>();
    for (const p of m.pieces) {
      const at = `${where}/${p.id}`;
      const pid = lineAt(p.line);
      if (!pid) { problems.push(`${at}: not copied exactly from the story`); continue; }
      const scene = world.scenes.find((s) => s.id === p.scene_id);
      if (!scene) { problems.push(`${at}: scene ${p.scene_id} doesn't exist`); continue; }
      scenes.add(scene.id);
      const inScene = (scene.reading ?? []).some((r) => pid >= r.start && pid <= r.end) || scene.artifacts.some((a) => a.source_anchor.includes(pid)) || (scene.story_mode?.read.chunks ?? []).includes(pid);
      if (!inScene) problems.push(`${at}: ${pid} is not in ${scene.id}'s reading`);
      if (same(p.line, m.payoff.line)) problems.push(`${at}: a piece can't be the payoff`);
      const shared = sharedRoots(p.lead, [p.line], names, p.shared_ok);
      if (shared.length) problems.push(`${at}: the mission lead shares key words with its line (${shared.join(", ")}); paraphrase it`);
      if (dash.test(p.lead)) problems.push(`${at}: no em dashes`);
    }
    if (scenes.size < 2) problems.push(`${where}: spread the pieces across the scenes`);
    if (m.theories.length !== 3 || new Set(m.theories.map((t) => t.id)).size !== 3) problems.push(`${where}: three theories with different ids`);
    if ([m.title, m.problem, ...m.theories.flatMap((t) => [t.name, t.description])].some((t) => dash.test(t))) problems.push(`${where}: no em dashes`);
  }
  return problems;
}
