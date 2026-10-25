// Server-side check that a quote is a real evidence line: one of the tappable lines (lib/lies.ts evidenceSentences) of a
// clue's evidence paragraphs (source_anchor) in the world file. Every pinned quote and tapped line that reaches the
// server (live rounds, the Final Verdict, planted lies) goes through here, and anything that doesn't match is refused.
// A match is exact up to spacing, line breaks, curly quotes and case (lineWords); a fragment or an edited line is not.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";

export type EvidenceLine = { clueId: string; pid: string; text: string };

// Every tappable line of the given clues (all clues in the story when none are named): the lines of each clue's evidence
// paragraphs, plus its question bank's answer lines (lib/fair-play.ts), which may sit in a paragraph beside them.
export function evidenceLines(world: WorldPack, passages: SourcePassage[], clueIds?: string[]): EvidenceLine[] {
  const byId = new Map(passages.map((p) => [p.id, p]));
  return world.scenes.flatMap((s) => s.artifacts)
    .filter((a) => !clueIds || clueIds.includes(a.id))
    .flatMap((a) => {
      const own = a.source_anchor.flatMap((pid) => {
        const p = byId.get(pid);
        return p ? evidenceSentences(p.text).map((text) => ({ clueId: a.id, pid, text })) : [];
      });
      const extra = (a.bank ?? []).flatMap((q) => q.answers).filter((x) => !own.some((l) => l.text === x.line)).flatMap((x) => {
        const p = passages.find((q) => evidenceSentences(q.text).includes(x.line));
        return p ? [{ clueId: a.id, pid: p.id, text: x.line }] : [];
      });
      return [...own, ...extra.filter((l, i) => extra.findIndex((m) => m.text === l.text) === i)];
    });
}

// The evidence line a quote is, or null. clueId limits it to that clue's evidence; pid, when given, must match too.
// The returned line is the world file's own text, so callers store that rather than what the client sent.
export function matchEvidence(world: WorldPack, passages: SourcePassage[], quote: unknown, opts: { clueId?: string; clueIds?: string[]; pid?: string } = {}): EvidenceLine | null {
  if (typeof quote !== "string") return null;
  const want = lineWords(quote);
  if (!want) return null;
  const clueIds = opts.clueIds ?? (opts.clueId ? [opts.clueId] : undefined);
  if (clueIds && !clueIds.length) return null;
  return evidenceLines(world, passages, clueIds).find((l) => lineWords(l.text) === want && (!opts.pid || l.pid === opts.pid)) ?? null;
}

export const NOT_EVIDENCE = "Pick a line from the story's evidence. That one isn't an evidence line.";

// The Final Verdict's three pins: each must be one of its clue's evidence lines, and all three different. Returns the
// pins with the world file's own text, or null to refuse the verdict.
export function verdictPins(world: WorldPack, passages: SourcePassage[], pinned: { clue_id: string; quote: string }[]) {
  const lines = pinned.map((p) => matchEvidence(world, passages, p.quote, { clueId: p.clue_id }));
  if (lines.length !== 3 || lines.some((l) => !l) || new Set(lines.map((l) => l!.text)).size !== 3) return null;
  return lines.map((l) => ({ clue_id: l!.clueId, quote: l!.text }));
}

// ---------- Saved proofs from older saves ----------
// A proof saved before the server checked lines may not be an exact evidence line. On load we try to upgrade it: an
// exact match keeps it; otherwise, if exactly one of the clue's evidence lines contains it (or is contained in it, at
// least three words either way, compared with lineWords as above), that line replaces it. Anything else is "unmatched",
// and the student is asked to re-prove that clue before the Final Verdict.
export type ProofCheck = { status: "exact" | "upgraded"; line: EvidenceLine } | { status: "unmatched" };
export function upgradeQuote(world: WorldPack, passages: SourcePassage[], clueId: string, quote: string): ProofCheck {
  const exact = matchEvidence(world, passages, quote, { clueId });
  if (exact) return { status: "exact", line: exact };
  const want = lineWords(quote);
  if (want.split(" ").length < 3) return { status: "unmatched" };
  const found = new Map<string, EvidenceLine>();
  for (const l of evidenceLines(world, passages, [clueId])) {
    const have = lineWords(l.text);
    if (have.includes(want) || (have.split(" ").length >= 3 && want.includes(have))) found.set(have, l);
  }
  return found.size === 1 ? { status: "upgraded", line: [...found.values()][0] } : { status: "unmatched" };
}

type SavedAnswer = { notice?: string; interpret?: string };
type SavedEvidence = { artifactId?: string; paragraphId: string; text: string };
const provenAnswer = (a: SavedAnswer | undefined) => !!(a?.notice?.trim() && a?.interpret?.trim());
// Upgrades every proven clue's saved line (and its saved evidence entry). changed: something was rewritten and should
// be saved; reprove: the clues whose line still isn't an evidence line.
export function upgradeSavedProofs<A extends SavedAnswer, E extends SavedEvidence>(world: WorldPack, passages: SourcePassage[], answers: Record<string, A>, evidence: E[]) {
  const known = new Set(world.scenes.flatMap((s) => s.artifacts.map((a) => a.id)));
  const nextAnswers = { ...answers }, nextEvidence = [...evidence], reprove: string[] = [];
  let changed = false;
  for (const [clueId, a] of Object.entries(answers)) {
    if (!known.has(clueId) || !provenAnswer(a)) continue;
    const r = upgradeQuote(world, passages, clueId, a.notice!);
    if (r.status === "unmatched") { reprove.push(clueId); continue; }
    if (r.line.text === a.notice) continue;
    changed = true;
    nextAnswers[clueId] = { ...a, notice: r.line.text };
    const i = nextEvidence.findIndex((e) => e.artifactId === clueId);
    if (i >= 0) nextEvidence[i] = { ...nextEvidence[i], text: r.line.text, paragraphId: r.line.pid };
  }
  return { answers: nextAnswers, evidence: nextEvidence, changed, reprove };
}
// The proven clues whose saved line is not an exact evidence line (what the case board and the verdict button show).
export function cluesToReprove(world: WorldPack, passages: SourcePassage[], answers: Record<string, SavedAnswer>) {
  if (!passages.length) return [];
  const known = new Set(world.scenes.flatMap((s) => s.artifacts.map((a) => a.id)));
  return Object.entries(answers).filter(([id, a]) => known.has(id) && provenAnswer(a) && !matchEvidence(world, passages, a.notice, { clueId: id })).map(([id]) => id);
}
export const REPROVE = "Re-prove this clue";
export const REPROVE_VERDICT = "Re-prove the clues marked on your case board before your Final verdict: their saved lines aren't lines from the story.";
