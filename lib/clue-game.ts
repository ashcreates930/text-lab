// The clue screen as a game: the passage is the main panel, every line is tappable, characters make claims and the
// student checks them against the story. Pure rules shared by the screens (app/clue-screen.tsx and friends), the chat
// route (off claims), live squads, the validator and the tests. Content (traits, off claims, computer players) is
// authored in each world.json; nothing here is generated.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { paragraphNumber, readingPortions } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";
import { matchEvidence } from "./evidence-check.ts";
import { streakMultiplier } from "./story-mode.ts";
import { earnsFreeze } from "./freeze.ts";

type Scene = WorldPack["scenes"][number];
type Clue = Scene["artifacts"][number];
type Character = WorldPack["characters"][number];

// ---------- The reading panel ----------
// Display only (the stored text and every line check use the source as written): joins words split by a line-break
// hyphen, shows Irving's "--" as a dash, and collapses spacing.
export function displayLine(text: string) {
  return text.replace(/(\w)-[ \t]*\r?\n\s*(\w)/g, "$1-$2").replace(/\s+/g, " ").replace(/--/g, "—").trim();
}
export const paragraphLabel = (pid: string) => `¶${paragraphNumber(pid)}`;
export const sameLine = (a: string, b: string) => lineWords(a) === lineWords(b);
// A clue name inside a sentence: "The empty schoolhouse" becomes "the empty schoolhouse"; names keep their capitals.
export const inSentence = (name: string) => name.replace(/^(The|A|An) /, (w) => w.toLowerCase());

// The paragraphs a clue's panel shows: its evidence paragraphs plus one paragraph on each side from the scene's reading,
// so not every line on screen answers the question.
export function cluePanel(world: WorldPack, passages: SourcePassage[], scene: Scene, clue: Clue): SourcePassage[] {
  const i = world.scenes.indexOf(scene);
  const reading = new Set((readingPortions(passages, world.scenes)[i] ?? []).map((p) => p.id));
  const wanted = new Set(clue.source_anchor);
  for (const pid of clue.source_anchor) {
    const n = paragraphNumber(pid);
    for (const side of [n - 1, n + 1]) { const id = `p${String(side).padStart(3, "0")}`; if (reading.has(id)) wanted.add(id); }
  }
  return passages.filter((p) => wanted.has(p.id));
}
// What the student has reached: every paragraph in the readings of the scenes up to this one, and their clues.
export function reachedParagraphs(world: WorldPack, passages: SourcePassage[], sceneIndex: number) {
  const portions = readingPortions(passages, world.scenes);
  const ids = new Set<string>();
  world.scenes.slice(0, sceneIndex + 1).forEach((s, i) => { for (const p of portions[i] ?? []) ids.add(p.id); for (const a of s.artifacts) for (const pid of a.source_anchor) ids.add(pid); });
  return ids;
}
// A character card: picture, role and the traits from paragraphs the student has reached (spoiler-safe).
export function characterCard(world: WorldPack, passages: SourcePassage[], character: Character, sceneIndex: number) {
  const reached = reachedParagraphs(world, passages, sceneIndex);
  const traits = character.traits ?? [];
  return { id: character.id, name: character.name, role: character.description, portrait: character.portrait ?? null, traits: traits.filter((t) => reached.has(t.paragraph)), locked: traits.filter((t) => !reached.has(t.paragraph)).length };
}

// ---------- Checking a line ----------
export type ProofCheck = { ok: true } | { ok: false; hint: string };
// A proof is right when it is one of the clue's evidence lines. A wrong line gets a hint back to the passage (a
// paragraph number, never the line itself).
export function checkProof(world: WorldPack, passages: SourcePassage[], clue: Clue, line: string): ProofCheck {
  if (matchEvidence(world, passages, line, { clueId: clue.id })) return { ok: true };
  const where = clue.source_anchor.map(paragraphLabel).join(" and ");
  return { ok: false, hint: `Not that one. This clue is about ${inSentence(clue.name)}. Look again in ${where}.` };
}
// Off claims: one per clue, said by a character at an unpredictable answer (any of the first three they give on that
// clue, picked from the student's id). The student flags it with "Something's off" and taps the line that corrects it.
export function offClaimTurn(seed: string, clueId: string) {
  let h = 0;
  for (const ch of `${seed}:${clueId}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 1 + (h % 3);
}
export const offClaimFor = (clue: Clue, characterId: string) => (clue.off_claim?.character_id === characterId ? clue.off_claim : undefined);
// The authored correcting line, or any of its accepted alternatives.
export const offClaimLines = (clue: Clue) => (clue.off_claim ? [clue.off_claim, ...(clue.off_claim.also ?? [])] : []);
export const correctsOffClaim = (clue: Clue, line: string) => offClaimLines(clue).some((o) => sameLine(o.line, line));

// ---------- Points, coins and streaks (saved with progress) ----------
export const CLUE_POINTS = { proof: 100, offClaim: 300, lie: 300, rivalWin: 100 } as const;
export const CLUE_COINS = { proof: 1, offClaim: 2, lie: 2, rivalWin: 1 } as const;
export type EarnKind = keyof typeof CLUE_POINTS;
// Rival play also keeps Freeze state (lib/freeze.ts): whether one is held, races played, the last freeze, and a log.
export type ClueGame = { points: number; coins: number; streak: number; bestStreak: number; rivalWins: number; rivalLosses: number; earned: string[]; freezeHeld?: boolean; races?: number; lastFreeze?: { target: string; round: number }; freezeLog?: { target: string; clueId: string; at: string }[] };
export const newClueGame = (): ClueGame => ({ points: 0, coins: 0, streak: 0, bestStreak: 0, rivalWins: 0, rivalLosses: 0, earned: [] });
// A correct proof. Each award counts once (key: kind and clue), so proving the same clue again earns nothing new.
// Consecutive correct proofs build the streak: x1.2 for the second, x1.5 from the third (the Story Mode rule).
export function earn(game: ClueGame | undefined, kind: EarnKind, key: string) {
  const g = game ?? newClueGame(), id = `${kind}:${key}`;
  if (g.earned.includes(id)) return { game: g, points: 0, coins: 0 };
  const multiplier = streakMultiplier(g.streak);
  const points = Math.round(CLUE_POINTS[kind] * multiplier), coins = CLUE_COINS[kind], streak = g.streak + 1;
  return { game: { ...g, points: g.points + points, coins: g.coins + coins, streak, bestStreak: Math.max(g.bestStreak, streak), earned: [...g.earned, id], ...(kind === "rivalWin" ? { rivalWins: g.rivalWins + 1 } : {}) }, points, coins };
}
// Rival play: a proof that brings the streak to 3, 6, 9… earns a Freeze (hold at most one).
export function withFreeze(game: ClueGame, rival: boolean, streakGrew: boolean): ClueGame {
  return rival && streakGrew && earnsFreeze(game.streak, !!game.freezeHeld) ? { ...game, freezeHeld: true } : game;
}
// A wrong line submitted as proof ends the streak (no points lost).
export const miss = (game: ClueGame | undefined): ClueGame => ({ ...(game ?? newClueGame()), streak: 0 });

// ---------- Rival (demo and class play outside live rounds: a computer rival) ----------
// The point goes to the player who taps the right line; if both do, the faster one. A wrong tap locks that player out
// for 3 seconds, so tapping every line doesn't pay.
export const RIVAL_SECONDS = 45, RIVAL_LOCKOUT_MS = 3000;
export type RivalOutcome = "you" | "rival" | "tie" | "none";
export function rivalOutcome(youMs: number | null, rivalMs: number | null): RivalOutcome {
  if (youMs === null && rivalMs === null) return "none";
  if (rivalMs === null) return "you";
  if (youMs === null) return "rival";
  return youMs < rivalMs ? "you" : rivalMs < youMs ? "rival" : "tie";
}
// The computer rival's plan for one clue, from authored content only: it reads the panel at a steady pace and taps the
// off claim's correcting line. On some clues (picked by the clue id) it first taps another line from the panel and sits
// out the 3-second lockout like anyone else.
export function computerRivalPlan(clue: Clue, panel: SourcePassage[]) {
  const target = clue.off_claim?.line;
  if (!target) return null;
  const lines = panel.flatMap((p) => evidenceSentences(p.text));
  const at = lines.findIndex((l) => sameLine(l, target));
  const wordsBefore = lines.slice(0, Math.max(0, at)).join(" ").split(/\s+/).filter(Boolean).length;
  const correctMs = Math.min(25000, 6000 + wordsBefore * 250);
  let h = 0;
  for (const ch of clue.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const decoy = h % 3 === 0 ? lines.find((l) => !correctsOffClaim(clue, l)) : undefined;
  return decoy ? { target, wrong: { line: decoy, atMs: Math.round(correctMs / 2) }, correctMs: correctMs + RIVAL_LOCKOUT_MS } : { target, wrong: null, correctMs };
}

// ---------- Squads: jobs, chunks, reactions and the vote ----------
export const SQUAD_JOBS = {
  reader: { name: "Reader", does: "Pin the key line from your part of the passage." },
  "fact-checker": { name: "Fact-checker", does: "Test the character's claim against the pinned lines. React with \"This proves…\" or \"I disagree because…\"." },
  connector: { name: "Connector", does: "Link a pinned line to an earlier clue with a \"This connects to…\" reaction." },
} as const;
export type SquadJob = keyof typeof SQUAD_JOBS;
const JOB_ORDER: SquadJob[] = ["reader", "fact-checker", "connector"];
// Jobs go round in join order (a fourth member is a second Reader, and so on); each member reads a different chunk.
export function squadJobs(memberIds: string[]) {
  return new Map(memberIds.map((id, i) => [id, JOB_ORDER[i % JOB_ORDER.length]] as const));
}
export function squadChunks<T>(paragraphs: T[], members: number): T[][] {
  const n = Math.max(1, Math.min(members, paragraphs.length));
  return Array.from({ length: Math.max(1, members) }, (_, i) => { const k = i % n, size = Math.ceil(paragraphs.length / n); return paragraphs.slice(k * size, k * size + size); });
}
export const REACTION_STEMS = { proves: "This proves…", disagree: "I disagree because…", connects: "This connects to…" } as const;
export type ReactionStem = keyof typeof REACTION_STEMS;
export const REACTION_MAX = 80;
// The squad's best proof line: most votes; a tie goes to the line with the most reactions; still tied, the
// Fact-checker's vote decides; then the line pinned first.
export function voteWinner(pins: { line: string; reactions: number }[], votes: { voter: string; line: string }[], factCheckerId: string | null) {
  if (!pins.length) return null;
  const count = (line: string) => votes.filter((v) => sameLine(v.line, line)).length;
  const most = Math.max(...pins.map((p) => count(p.line)));
  let tied = pins.filter((p) => count(p.line) === most);
  if (tied.length > 1) { const r = Math.max(...tied.map((p) => p.reactions)); tied = tied.filter((p) => p.reactions === r); }
  if (tied.length > 1 && factCheckerId) { const fc = votes.find((v) => v.voter === factCheckerId); const pick = fc && tied.find((p) => sameLine(p.line, fc.line)); if (pick) tied = [pick]; }
  return tied[0].line;
}
// Demo squads: computer teammates pin authored lines from their own chunks, never a line that answers the clue, so the
// student always finds the proof first.
export function computerPins(world: WorldPack, passages: SourcePassage[], clue: Clue, chunk: SourcePassage[]) {
  return chunk.flatMap((p) => evidenceSentences(p.text)).filter((l) => !matchEvidence(world, passages, l, { clueId: clue.id }) && !correctsOffClaim(clue, l)).slice(0, 1);
}

// ---------- validate:worlds ----------
export function clueGameProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const problems: string[] = [];
  const byId = new Map(passages.map((p) => [p.id, p]));
  const exact = (pid: string, line: string) => { const p = byId.get(pid); return !!p && evidenceSentences(p.text).includes(line); };
  const dash = /—/;
  for (const c of world.characters) for (const t of c.traits ?? []) {
    if (!exact(t.paragraph, t.line)) problems.push(`${world.id}/${c.id} trait "${t.name}": the line is not copied exactly from ${t.paragraph}`);
    if (dash.test(t.name)) problems.push(`${world.id}/${c.id} trait "${t.name}": no em dashes`);
  }
  for (const scene of world.scenes) for (const clue of scene.artifacts) {
    const o = clue.off_claim;
    if (!o) continue;
    const where = `${world.id}/${clue.id} off_claim`;
    if (!world.characters.some((c) => c.id === o.character_id) || !scene.available_characters.includes(o.character_id)) problems.push(`${where}: ${o.character_id} must be a speaking character in this scene`);
    for (const c of offClaimLines(clue)) {
      if (!exact(c.paragraph, c.line)) problems.push(`${where}: the correcting line is not copied exactly from ${c.paragraph}`);
      if (!clue.source_anchor.includes(c.paragraph)) problems.push(`${where}: the correcting line must come from the clue's own paragraphs`);
    }
    if (dash.test(o.claim)) problems.push(`${where}: no em dashes in the claim`);
    if (scene.lie?.clue_id === clue.id && offClaimLines(clue).some((c) => sameLine(scene.lie!.truth_line, c.line))) problems.push(`${where}: use a different line from the Spot the Lie truth line`);
  }
  for (const n of [world.computer_players?.rival.name ?? "", ...(world.computer_players?.teammates ?? [])]) if (dash.test(n)) problems.push(`${world.id} computer player "${n}": no em dashes`);
  return problems;
}

// ---------- Saved with progress ----------
// Mark-up: a line tagged as a clue, a word to know, or a question (key: paragraph and line number, "p069#2").
export const MARK_TAGS = { clue: "Clue", word: "Word to know", question: "Question" } as const;
export type MarkTag = keyof typeof MARK_TAGS;
export type LineMark = { tag: MarkTag; pid: string; text: string; clueId?: string; at: string };
export const markKey = (pid: string, index: number) => `${pid}#${index}`;
// "Something's off": a flagged character answer and the line the student says contradicts it. matched: it was the
// clue's authored off claim and the right line (points awarded); otherwise it waits for the teacher, with no points and
// no penalty.
export type ClaimFlag = { clueId: string; characterId: string; answer: string; line: string; pid: string; matched: boolean; at: string };
