// Server-side check that a quote is a real evidence line: one of the tappable lines (lib/lies.ts evidenceSentences) of a
// clue's evidence paragraphs (source_anchor) in the world file. Every pinned quote and tapped line that reaches the
// server (live rounds, the Final Verdict, planted lies) goes through here, and anything that doesn't match is refused.
// A match is exact up to spacing, line breaks, curly quotes and case (lineWords); a fragment or an edited line is not.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";

export type EvidenceLine = { clueId: string; pid: string; text: string };

// Every tappable line of the given clues (all clues in the story when none are named).
export function evidenceLines(world: WorldPack, passages: SourcePassage[], clueIds?: string[]): EvidenceLine[] {
  const byId = new Map(passages.map((p) => [p.id, p]));
  return world.scenes.flatMap((s) => s.artifacts)
    .filter((a) => !clueIds || clueIds.includes(a.id))
    .flatMap((a) => a.source_anchor.flatMap((pid) => {
      const p = byId.get(pid);
      return p ? evidenceSentences(p.text).map((text) => ({ clueId: a.id, pid, text })) : [];
    }));
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
