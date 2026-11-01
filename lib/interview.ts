// The Interview and Name the Liar (an expedition's opening and finale). Before the race the student questions three
// witnesses, one card each; one witness, picked at random per student and expedition (per game when live), lies and
// the other two tell the truth. After the race the student names the liar and taps the line that disproves the lie:
// a win needs both, on the first try. Pure functions shared by the solo race, the live phones and the host board.
import type { Interview, WorldPack } from "./world-schema.ts";
import { norm } from "./expedition.ts";

export const LIAR_POINTS = 2000, LIAR_SECONDS = 90, VOTE_SECONDS = 20;

// A stable number from a string (FNV-1a), so the same student always meets the same liar.
export function hashSeed(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
// Which witness lies: from the student's key (a live game uses the session), the expedition and the witness count.
export const liarIndex = (key: string, expeditionId: string, n = 3) => hashSeed(`${key}|${expeditionId}|liar`) % n;
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
export const witnessName = (world: WorldPack, id: string) => world.characters.find((c) => c.id === id)?.name ?? id;

// What each witness said: the lie for the liar, the truth for the others, with the card the student asked.
export type Said = { character: string; name: string; short: string; text: string; lied: boolean; gesture: "laughing" | "head-shake" | null; card: string | null };
export function interviewStatements(world: WorldPack, iv: Interview, liar: number, cards: (number | null | undefined)[] = []): Said[] {
  return iv.witnesses.map((w, k) => {
    const st = k === liar ? w.lie : w.truth, name = witnessName(world, w.character);
    return { character: w.character, name, short: firstName(name), text: st.text, lied: k === liar, gesture: st.gesture ?? null, card: cards[k] != null ? w.cards[cards[k]!] ?? null : null };
  });
}
// Case Notes: each statement as "Brom said: ...".
export const saidLine = (s: Pick<Said, "short" | "text">) => `${s.short} said: "${s.text}"`;

// Name the Liar: the liar (a character id) and the line that disproves the lie. A win needs both.
export type LiarAnswer = { liar: string | null; line: string | null };
export function liarCheck(iv: Interview, liar: number, a: LiarAnswer) {
  const w = iv.witnesses[liar], named = !!w && a.liar === w.character;
  const line = !!w && !!a.line && w.lie.lines.some((l) => norm(l) === norm(a.line!));
  return { named, line, solved: named && line, points: named && line ? LIAR_POINTS : 0 };
}
// The Refresher's Name the Liar item (only when the case wasn't solved): the liar is shown, the student finds the line.
export const liarLineFixed = (iv: Interview, liar: number, line: string | null | undefined) => !!line && (iv.witnesses[liar]?.lie.lines ?? []).some((l) => norm(l) === norm(line));

// A live class votes on each witness's card; the most votes wins, and a tie goes to the first card.
export function cardWinner(votes: number[], cards = 2) {
  const n = Array.from({ length: cards }, (_, k) => votes.filter((v) => v === k).length);
  return n.reduce((best, x, k) => (x > n[best] ? k : best), 0);
}
// The class breakdown at the reveal: how many named each witness, and how many solved it.
export function liarBreakdown(iv: Interview, liar: number, answers: LiarAnswer[]) {
  const named = iv.witnesses.map((w) => ({ character: w.character, count: answers.filter((a) => a.liar === w.character).length }));
  const solved = answers.filter((a) => liarCheck(iv, liar, a).solved).length;
  return { named, solved, total: answers.length, pct: answers.length ? Math.round((solved / answers.length) * 100) : 0 };
}

// Pre-generated audio for each statement (scripts/generate-assets.ts); no AI calls at play time.
export type AudioKind = "truth" | "lie" | "caught";
export const interviewAudio = (worldId: string, expeditionId: string, character: string, kind: AudioKind) => `/worlds/${worldId}/interview/${expeditionId}-${character}-${kind}.mp3`;
// drafts: also the draft expeditions awaiting review (recorded ahead; the app never plays them until approved).
export function interviewAudioList(world: WorldPack, drafts = false) {
  return [...(world.expeditions ?? []), ...(drafts ? world.draft_expeditions ?? [] : [])].flatMap((e) => (e.interview?.witnesses ?? []).flatMap((w) => {
    const voice = world.characters.find((c) => c.id === w.character)?.voice_id ?? "";
    return ([["truth", w.truth.text], ["lie", w.lie.text], ["caught", w.caught]] as const).map(([kind, text]) => ({ path: interviewAudio(world.id, e.id, w.character, kind), text, voice, character: w.character }));
  }));
}

// For Case Notes and the Evidence view: the student's whole Interview and verdict.
export type InterviewNote = { said: Said[]; liar: string; lieText: string; lieLines: string[]; pick: string | null; line: string | null; named: boolean; solved: boolean; fixed: boolean | null; points: number };
export function interviewNote(world: WorldPack, iv: Interview, liar: number, cards: (number | null)[], a: LiarAnswer | null, fixed: boolean | null = null): InterviewNote {
  const w = iv.witnesses[liar], r = liarCheck(iv, liar, a ?? { liar: null, line: null });
  return { said: interviewStatements(world, iv, liar, cards), liar: witnessName(world, w.character), lieText: w.lie.text, lieLines: w.lie.lines,
    pick: a?.liar ? witnessName(world, a.liar) : null, line: a?.line ?? null, named: r.named, solved: r.solved, fixed: r.solved ? null : fixed, points: r.points };
}
// The passage that holds a proof line, so the reveal opens right on it.
export function proofPassages<P extends { text: string }>(passages: P[], line: string | undefined) {
  const want = norm(line ?? "").slice(0, 60), hit = passages.filter((p) => norm(p.text).includes(want));
  return hit.length ? hit : passages;
}
