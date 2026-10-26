// Story Mode: a scene played from inside the story as four rounds that climb a ladder: locate (round 1), infer (round 2),
// catch the lie (round 3) and build the case (round 4), with streaks, Lantern coins, power-ups, a class pulse and a
// top-5 leaderboard. Each round's question comes from an authored bank in the scene's `story_mode` block (never
// generated live). These are the pure rules, shared by the server (which scores every try), the screens, the live
// version, the validator and the tests.
//
// Points come from evidence, never speed: full points on the first try, half on the second, none after (lib/fair-play.ts),
// and each wrong line costs 25. A miss gets a "Not yet" with a hint (try 2 names the paragraph, try 3 the part of it);
// after three misses the answer is shown and the round still asks for its proof step, for 0 points.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { contentNotes } from "./content-notes.ts";
import { isTruthLine, lieProblems, lineWords, type Lie } from "./lies.ts";
import { evidenceLines, matchEvidence } from "./evidence-check.ts";
import { soundExplanation } from "./live/engine.ts";
import { MAX_TRIES, afterWrongLines, levelPoints, answerFor, missHint, nameWords, nearMissFor, needsPhrase, phraseMatches, phraseRange, pickQuestion, proveChoices, proveRight, questionProblems, speedFlags, tryFactor, typedProof, type SpeedFlag } from "./fair-play.ts";

export type Scene = WorldPack["scenes"][number];
export type StoryContent = NonNullable<Scene["story_mode"]>;
// Round ids are stored with each scored round; round 2 ("confront") is the infer round, where a character asks.
export type RoundKind = "read" | "confront" | "lie" | "call";
export const ROUNDS: RoundKind[] = ["read", "confront", "lie", "call"];
export const ROUND_NAMES: Record<RoundKind, string> = { read: "Locate", confront: "Infer", lie: "Catch the lie", call: "Build the case" };

// ---------- Time ----------
// Seconds per round at normal speed; each retry after a "Not yet" gets a fresh 30 (scaled by the student's time).
export const SECONDS = { read: 120, confront: 90, lie: 60, call: 90, retry: 30 } as const;
export const GRACE_SECONDS = 20; // after "Time!", the first try still counts for half points
export const COUNTDOWN_SECONDS = 3;
// Extra time: the teacher sets 1.5x, 2x or untimed per student; solo and demo players can pick Relaxed (2x).
export type TimeSetting = "1" | "1.5" | "2" | "untimed";
export const TIME_SETTINGS: TimeSetting[] = ["1", "1.5", "2", "untimed"];
// null: no time limit (untimed).
export function phaseSeconds(base: number, setting: TimeSetting): number | null {
  return setting === "untimed" ? null : base * Number(setting);
}
// What the screen reader hears: only at 30, 10 and 5 seconds left, never every second.
export const ANNOUNCE_AT = [30, 10, 5];
export function timeAnnouncement(prevLeft: number, left: number) {
  const hit = ANNOUNCE_AT.find((s) => prevLeft > s && left <= s);
  return hit ? `${hit} seconds left` : "";
}

// ---------- Points ----------
// The most a round is worth (first try, no wrong lines, no power-ups), before the streak multiplier.
export const POINTS = { readLine: 100, infer: 400, lieLine: 400, lieExplain: 200, callLine: 200, callSupports: 200 };
export const ROUND_MAX: Record<RoundKind, number> = { read: 3 * POINTS.readLine, confront: POINTS.infer, lie: POINTS.lieLine + POINTS.lieExplain, call: 2 * POINTS.callLine + POINTS.callSupports };
export const POUCH_MAX = 3;
// Consecutive rounds right on the first try: the 2nd in a row x1.2, the 3rd and on x1.5 (the cap). A round that took
// retries still scores its points but starts the streak over.
export const streakMultiplier = (streakBefore: number) => (streakBefore >= 2 ? 1.5 : streakBefore === 1 ? 1.2 : 1);
// The points possible for this student's scene: every round they play answered right on the first try, with no
// power-ups. Rounds skipped at the start (the home page's "Catch the lie") don't count.
export function maxPoints(fromRound = 0) {
  let total = 0, streak = 0;
  for (const kind of ROUNDS.slice(fromRound)) { total += Math.round(ROUND_MAX[kind] * streakMultiplier(streak)); streak++; }
  return total;
}

// ---------- The questions a student gets ----------
// One per round, picked at the start of a run from the scene's banks: not one they've seen on a replay; in class, by
// roster seat so neighbors differ.
export type Picks = Record<RoundKind, string>;
export const sceneLies = (scene: Scene): (Lie & { id: string })[] => [...(scene.lie ? [{ ...scene.lie, id: "lie" }] : []), ...(scene.story_mode?.lies ?? [])];
export function pickRound(scene: Scene, o: { seed: string; seen?: string[]; seat?: number | null }): Picks {
  const c = scene.story_mode!;
  const pick = <T extends { id: string }>(kind: RoundKind, bank: T[]) => pickQuestion(bank, { seed: `${o.seed}:${kind}`, seen: o.seen?.filter((s) => s.startsWith(`${kind}:`)).map((s) => s.slice(kind.length + 1)), seat: o.seat }).id;
  return { read: pick("read", c.read.bank), confront: pick("confront", c.infer.bank), lie: pick("lie", sceneLies(scene)), call: pick("call", c.call.bank) };
}
const byId = <T extends { id: string }>(bank: T[], id: string | undefined) => bank.find((q) => q.id === id) ?? bank[0];
export const readQ = (scene: Scene, picks?: Partial<Picks>) => byId(scene.story_mode!.read.bank, picks?.read);
export const inferQ = (scene: Scene, picks?: Partial<Picks>) => byId(scene.story_mode!.infer.bank, picks?.confront);
export const lieOf = (scene: Scene, picks?: Partial<Picks>) => byId(sceneLies(scene), picks?.lie);
export const callQ = (scene: Scene, picks?: Partial<Picks>) => byId(scene.story_mode!.call.bank, picks?.call);

// ---------- Tries ----------
// A round in progress, held on the server: misses so far, wrong lines, round 1's locked lines (and the try each was
// found on), the accepted line for rounds 2 and 3, whether its exact words are marked, and whether the answer was shown.
// late: the first try came in after time (its round scores half, whatever step it ends on).
export type Attempt = { tries: number; wrong: number; locked: { line: string; tryNo: number }[]; line?: string; phraseOk?: boolean; shown?: boolean; trust?: number; firstTapMs?: number; swaps?: number; late?: boolean };
export const newAttempt = (): Attempt => ({ tries: 0, wrong: 0, locked: [] });
// firstTapMs / swaps: from the client, for the teacher's speed flags only (never scored). timeout: the try's time ran
// out, so whatever is there (even nothing) is locked in as the try.
type Meta = { firstTapMs?: number; swaps?: number; timeout?: boolean };
export type RoundInput =
  | ({ kind: "read"; pouch: string[] } & Meta)
  | ({ kind: "confront"; line: string; marked?: [number, number]; prove?: { choice?: string; proves?: string; because?: string } } & Meta)
  | ({ kind: "lie"; line: string; explanation?: string } & Meta)
  | ({ kind: "call"; theoryId: string; pins: string[] } & Meta);
export type Timing = { elapsedMs: number; grace: boolean };
// shown: the answer was shown after three misses (0 points); typed: a typed "This proves… because…" (never scored);
// flags: speed flags for the teacher; qid: the bank question the student got.
export type RoundScore = { kind: RoundKind; base: number; speed: number; valid: boolean; coinsEarned: number; detail: string; choice: string; proof: string[]; grace?: boolean; tries: number; wrong: number; shown: boolean; qid: string; typed?: string; flags?: SpeedFlag[]; explanation?: string };
export type AttemptResult =
  | { status: "notYet"; attempt: Attempt; tryNo: number; hint: string }
  | { status: "next"; attempt: Attempt; step: "phrase" | "prove" | "explain"; choices?: string[]; shown?: string[]; phrase?: [number, number] }
  | { status: "done"; attempt: Attempt; score: RoundScore; shown?: string[] }
  | { status: "invalid"; message: string };

const same = (a: string, b: string) => lineWords(a) === lineWords(b);
const sceneClueIds = (scene: Scene) => scene.artifacts.map((a) => a.id);
// A real evidence line for one of this scene's clues, as the world file has it, or null.
export const sceneEvidence = (world: WorldPack, passages: SourcePassage[], scene: Scene, quote: string) => matchEvidence(world, passages, quote, { clueIds: sceneClueIds(scene) });
const pidOfLine = (world: WorldPack, passages: SourcePassage[], scene: Scene, line: string) => sceneEvidence(world, passages, scene, line)?.pid ?? "";

// One try at the current round. maxTries: 3 solo (then the answer is shown); live classes retry until the timer ends.
// seed: makes the Prove it order stable for this student.
export function attemptRound(world: WorldPack, passages: SourcePassage[], scene: Scene, picks: Partial<Picks>, attempt: Attempt, input: RoundInput, o: { maxTries?: number; seed: string; pouch?: string[] }): AttemptResult {
  const maxTries = o.maxTries ?? MAX_TRIES;
  const a: Attempt = { ...attempt, locked: [...attempt.locked], ...(attempt.firstTapMs === undefined && typeof input.firstTapMs === "number" ? { firstTapMs: Math.max(0, Math.round(input.firstTapMs)) } : {}), swaps: Math.max(attempt.swaps ?? 0, Math.round(Number(input.swaps) || 0)) };
  const miss = (wrongLines: number) => ({ ...a, tries: a.tries + 1, wrong: a.wrong + wrongLines });
  const flags = () => speedFlags(a.firstTapMs, a.swaps);
  if (input.kind === "read") {
    const q = readQ(scene, picks);
    const lines = [...new Map(input.pouch.slice(0, POUCH_MAX).map((t) => sceneEvidence(world, passages, scene, t)).filter(Boolean).map((l) => [l!.text, l!])).values()];
    const fresh = lines.filter((l) => !a.locked.some((k) => same(k.line, l.text)));
    const tryNo = a.tries + 1;
    const right = fresh.filter((l) => q.answers.some((x) => same(x, l.text))), wrong = fresh.filter((l) => !q.answers.some((x) => same(x, l.text)));
    const next: Attempt = { ...a, locked: [...a.locked, ...right.map((l) => ({ line: l.text, tryNo }))].slice(0, POUCH_MAX) };
    const finish = (at: Attempt, shown: string[]) => {
      const base = afterWrongLines(at.locked.reduce((n, k) => n + POINTS.readLine * tryFactor(k.tryNo), 0), at.wrong);
      const proof = [...at.locked.map((k) => k.line), ...shown].slice(0, POUCH_MAX);
      return { status: "done" as const, attempt: at, shown: shown.length ? shown : undefined, score: { kind: "read" as const, base, speed: 0, valid: !shown.length, coinsEarned: at.locked.length, detail: shown.length ? `You found ${at.locked.length} of ${POUCH_MAX}. Here are the rest.` : `All ${POUCH_MAX} lines answer the question`, choice: "", proof, tries: at.tries, wrong: at.wrong, shown: shown.length > 0, qid: q.id, flags: flags() } };
    };
    if (next.locked.length >= POUCH_MAX) return finish({ ...next, wrong: a.wrong + wrong.length }, []);
    const missed = { ...miss(wrong.length), locked: next.locked };
    if (missed.tries >= maxTries) {
      const rest = q.answers.filter((x) => !missed.locked.some((k) => same(k.line, x))).slice(0, POUCH_MAX - missed.locked.length);
      return finish({ ...missed, shown: true }, rest);
    }
    const open = q.answers.find((x) => !missed.locked.some((k) => same(k.line, x)))!;
    const near = wrong.map((l) => nearMissFor(q, l.text)).find(Boolean);
    return { status: "notYet", attempt: missed, tryNo: missed.tries + 1, hint: notYetRead(missed, missHint(missed.tries + 1, { pid: pidOfLine(world, passages, scene, open), line: open }, passages, near?.hint)) };
  }
  if (input.kind === "confront") {
    const q = inferQ(scene, picks);
    const choices = () => proveChoices(q.prove, `${o.seed}:${q.id}`);
    const answer = q.answers[0];
    const toShown = (at: Attempt) => ({ status: "next" as const, attempt: { ...at, shown: true, line: at.line ?? answer.line }, step: "prove" as const, choices: choices(), shown: [at.line ?? answer.line], ...(answerFor(q, at.line ?? answer.line)?.phrase ? { phrase: phraseRange(at.line ?? answer.line, answerFor(q, at.line ?? answer.line)!.phrase!) ?? undefined } : {}) });
    if (!a.line) {
      const hit = answerFor(q, input.line);
      if (hit) return { status: "next", attempt: { ...a, line: hit.line }, step: needsPhrase(hit.line) && hit.phrase ? "phrase" : "prove", ...(needsPhrase(hit.line) && hit.phrase ? {} : { choices: choices() }) };
      const real = !!sceneEvidence(world, passages, scene, input.line);
      if (!real && !input.timeout) return { status: "invalid", message: "Tap a line in the story." };
      const m = { ...miss(real ? 1 : 0), trust: (a.trust ?? 0) - 1 };
      if (m.tries >= maxTries) return toShown(m);
      const near = nearMissFor(q, input.line);
      return { status: "notYet", attempt: m, tryNo: m.tries + 1, hint: missHint(m.tries + 1, { pid: pidOfLine(world, passages, scene, answer.line), line: answer.line }, passages, near?.hint) };
    }
    const hit = answerFor(q, a.line)!;
    if (needsPhrase(hit.line) && hit.phrase && !a.phraseOk && !a.shown) {
      if (input.marked && phraseMatches(hit.line, hit.phrase, input.marked)) return { status: "next", attempt: { ...a, phraseOk: true }, step: "prove", choices: choices() };
      const m = { ...miss(0), trust: (a.trust ?? 0) - 1 };
      if (m.tries >= maxTries) return toShown(m);
      return { status: "notYet", attempt: m, tryNo: m.tries + 1, hint: "Right line. Now mark only the words that prove it." };
    }
    const typed = typedProof(input.prove?.proves ?? "", input.prove?.because ?? "");
    if (typed || (input.prove?.choice && proveRight(q.prove, input.prove.choice))) {
      const base = a.shown ? 0 : afterWrongLines(POINTS.infer * tryFactor(a.tries + 1), a.wrong);
      return { status: "done", attempt: { ...a, trust: (a.trust ?? 0) + (a.shown ? 0 : 1) }, score: { kind: "confront", base, speed: 0, valid: !a.shown, coinsEarned: a.shown ? 0 : 1, detail: a.shown ? "Shown answer" : "Your proof holds up", choice: a.shown ? "missed" : "found", proof: [hit.line], tries: a.tries, wrong: a.wrong, shown: !!a.shown, qid: q.id, ...(typed ? { typed } : {}), flags: flags() } };
    }
    if (!input.prove?.choice) return { status: "invalid", message: "Pick what the line proves, or finish the sentence." };
    // A wrong choice is a miss; after the answer is shown, it is simply "Not yet" until the right one.
    const m = a.shown ? a : { ...miss(0), trust: (a.trust ?? 0) - 1 };
    if (!a.shown && m.tries >= maxTries) return toShown(m);
    return { status: "notYet", attempt: m, tryNo: m.tries + 1, hint: "Not quite. Read the line again: what does it actually show?" };
  }
  if (input.kind === "lie") {
    const lie = lieOf(scene, picks);
    const toShown = (at: Attempt) => ({ status: "next" as const, attempt: { ...at, shown: true, line: lie.truth_line }, step: "explain" as const, shown: [lie.truth_line] });
    if (!a.line) {
      if (sceneEvidence(world, passages, scene, input.line) && isTruthLine(lie, input.line)) return { status: "next", attempt: { ...a, line: lie.truth_line }, step: "explain" };
      const real = !!sceneEvidence(world, passages, scene, input.line);
      if (!real && !input.timeout) return { status: "invalid", message: "Tap a line in the story." };
      const m = miss(real ? 1 : 0);
      if (m.tries >= maxTries) return toShown(m);
      return { status: "notYet", attempt: m, tryNo: m.tries + 1, hint: m.tries + 1 <= 2 ? `Not quite. Look for a line about ${lie.topic}. Look again in ¶${Number(lie.truth_paragraph.slice(1))}.` : missHint(3, { pid: lie.truth_paragraph, line: lie.truth_line }, passages) };
    }
    const explanation = (input.explanation ?? "").trim().slice(0, 400);
    if (!explanation) return { status: "invalid", message: "Say why in one sentence." };
    const sound = !a.shown && soundExplanation(explanation, lie);
    const base = a.shown ? 0 : afterWrongLines(POINTS.lieLine * tryFactor(a.tries + 1) + (sound ? POINTS.lieExplain : 0), a.wrong);
    return { status: "done", attempt: a, score: { kind: "lie", base, speed: 0, valid: !a.shown, coinsEarned: a.shown ? 0 : 1, detail: a.shown ? "Shown answer" : sound ? "Right line, sound explanation" : "Right line", choice: a.shown ? "missed" : "caught", proof: [lie.truth_line], tries: a.tries, wrong: a.wrong, shown: !!a.shown, qid: lie.id, explanation, flags: flags() } };
  }
  // Build the case: a theory and two lines that support it, from the pouch or the reading.
  const q = callQ(scene, picks);
  const theory = q.theories.find((t) => t.id === input.theoryId);
  if (!theory && !input.timeout) return { status: "invalid", message: "Pick a theory first." };
  const reading = new Set(scene.story_mode!.read.chunks);
  const pins = [...new Set(input.pins.map((p) => sceneEvidence(world, passages, scene, p)).filter((l) => l && (reading.has(l.pid) || (o.pouch ?? []).some((x) => same(x, l.text)))).map((l) => l!.text))].slice(0, 2);
  if (pins.length < 2 && !input.timeout) return { status: "invalid", message: "Pin 2 lines that support your theory." };
  const supporting = theory ? pins.filter((p) => theory.supports.some((s) => same(s, p))) : [];
  const supports = theory?.supports ?? q.theories[0].supports;
  const done = (at: Attempt, shown: string[]) => {
    const base = at.shown ? 0 : afterWrongLines((2 * POINTS.callLine + POINTS.callSupports) * tryFactor(at.tries + 1), at.wrong);
    return { status: "done" as const, attempt: at, shown: shown.length ? shown : undefined, score: { kind: "call" as const, base, speed: 0, valid: !at.shown, coinsEarned: at.shown ? 0 : 2, detail: at.shown ? "Shown answer" : "Both lines support your theory", choice: theory ? `${q.id}|${theory.id}` : "", proof: at.shown ? supports.slice(0, 2) : pins, tries: at.tries, wrong: at.wrong, shown: !!at.shown, qid: q.id, flags: flags() } };
  };
  if (supporting.length === 2) return done(a, []);
  const m = miss(pins.length - supporting.length);
  if (m.tries >= maxTries) return done({ ...m, shown: true }, supports.slice(0, 2));
  const open = supports.find((s) => !supporting.some((p) => same(p, s)))!;
  return { status: "notYet", attempt: m, tryNo: m.tries + 1, hint: missHint(m.tries + 1, { pid: pidOfLine(world, passages, scene, open), line: open }, passages) };
}
function notYetRead(a: Attempt, hint: string) {
  const left = POUCH_MAX - a.locked.length;
  return `${a.locked.length ? `${a.locked.length} of ${POUCH_MAX} found. ` : ""}${hint} ${left === 1 ? "One more line to find." : `${left} more lines to find.`}`;
}
// The Prove it step again, for a reloaded screen: the choices for this student's infer question.
export const inferChoices = (scene: Scene, picks: Partial<Picks>, seed: string) => { const q = inferQ(scene, picks); return proveChoices(q.prove, `${seed}:${q.id}`); };

// ---------- The game layer: streaks, coins, power-ups ----------
export type PowerUp = "lantern" | "second-look" | "double-down";
export const POWER_UPS: Record<PowerUp, { name: string; cost: number; what: string }> = {
  lantern: { name: "Lantern", cost: 2, what: "Names the paragraph that holds a correct line." },
  "second-look": { name: "Second look", cost: 1, what: "Replays the last part of the reading." },
  "double-down": { name: "Double down", cost: 3, what: "Doubles the next round's points if your proof is valid. If it isn't, you lose the points you bet." },
};
// bet: with Double down, the points at stake (the round's most); lost: what an invalid round took off the total.
export type RoundRecord = RoundScore & { round: number; multiplier: number; doubled: boolean; points: number; streak: number; bet?: number; lost?: number };
// skipped: rounds jumped over at the start (the home page's "Catch the lie"); they score nothing and don't count toward
// the points possible. picks: this run's questions; seen: questions from earlier runs (kept through "Play again");
// attempt: the round in progress.
// env: a test run (a Vercel preview, local development, or a session opened with ?test=1). Test runs never appear on a
// real player's leaderboard or class pulse, and can be found and removed from the shared database.
export type RunState = { env?: "preview" | "dev" | "test"; round: number; total: number; streak: number; bestStreak: number; coins: number; pouch: string[]; trust: Record<string, number>; lantern: boolean; doubleDown: boolean; rounds: RoundRecord[]; restarts?: number; skipped?: number; picks?: Picks; seen?: string[]; attempt?: Attempt | null };
export const newRun = (): RunState => ({ round: 0, total: 0, streak: 0, bestStreak: 0, coins: 0, pouch: [], trust: {}, lantern: false, doubleDown: false, rounds: [] });
export const runMax = (s: Pick<RunState, "skipped">) => maxPoints(s.skipped ?? 0);

export function buy(state: RunState, p: PowerUp): RunState | string {
  const cost = POWER_UPS[p].cost;
  if (state.coins < cost) return `You need ${cost} coin${cost === 1 ? "" : "s"} for ${POWER_UPS[p].name}.`;
  if (p === "lantern" && state.lantern) return "Your Lantern is already lit for the next round.";
  if (p === "double-down" && state.doubleDown) return "Double down is already on for the next round.";
  return { ...state, coins: state.coins - cost, ...(p === "lantern" ? { lantern: true } : {}), ...(p === "double-down" ? { doubleDown: true } : {}) };
}

// Applies one scored round to the run: streak multiplier, Double down (twice the points on valid proof; otherwise the
// bet, the round's most, comes off the total, never below 0), coins, the pouch (round 1) and trust (round 2).
export function applyRound(state: RunState, score: RoundScore, extra: { pouch?: string[]; trust?: { characterId: string; delta: number } } = {}): RunState {
  const kind = score.kind;
  const firstTry = score.valid && score.tries === 0 && !score.shown;
  const streak = firstTry ? state.streak + 1 : 0;
  const multiplier = firstTry ? streakMultiplier(state.streak) : 1;
  const doubled = state.doubleDown && score.valid;
  const earned = Math.round(score.base * multiplier * (doubled ? 2 : 1));
  const bet = state.doubleDown ? ROUND_MAX[kind] : undefined;
  const lost = state.doubleDown && !score.valid ? Math.min(state.total, ROUND_MAX[kind]) : 0;
  const record: RoundRecord = { ...score, speed: 0, round: state.round + 1, multiplier, doubled, points: earned, streak, ...(bet ? { bet } : {}), ...(lost ? { lost } : {}) };
  const trust = extra.trust ? { ...state.trust, [extra.trust.characterId]: (state.trust[extra.trust.characterId] ?? 0) + extra.trust.delta } : state.trust;
  return {
    ...state, round: state.round + 1, total: state.total + earned - lost, streak, bestStreak: Math.max(state.bestStreak, streak),
    coins: state.coins + score.coinsEarned, lantern: false, doubleDown: false, rounds: [...state.rounds, record], trust, attempt: null,
    pouch: extra.pouch ? [...new Set(extra.pouch)].slice(0, POUCH_MAX) : state.pouch,
  };
}

// Where the Lantern points: the paragraph that holds a correct line for the coming round.
export function lanternParagraph(world: WorldPack, passages: SourcePassage[], scene: Scene, round: RoundKind, picks?: Partial<Picks>, locked: string[] = []) {
  const pid = (line: string) => sceneEvidence(world, passages, scene, line)?.pid ?? null;
  if (round === "read") { const open = readQ(scene, picks).answers.find((x) => !locked.some((l) => same(l, x))); return open ? pid(open) : null; }
  if (round === "confront") return pid(inferQ(scene, picks).answers[0].line);
  if (round === "lie") return lieOf(scene, picks).truth_paragraph;
  const supports = callQ(scene, picks).theories.flatMap((t) => t.supports).map(pid).filter(Boolean) as string[];
  return supports.sort((a, b) => supports.filter((x) => x === b).length - supports.filter((x) => x === a).length)[0] ?? null;
}

// ---------- Round intros: a word on the last round ----------
// One line on each round intro about how the last round went: name what they did on a first-try success, coach after
// retries, encourage (never praise) after a shown answer. Several authored versions of each, so it doesn't repeat.
const FIRST_TRY: Record<RoundKind, string[]> = {
  read: ["3 of 3 lines on your first try. One clue closer to cracking the case.", "You found all 3 lines on your first try. That's how a detective reads.", "First try, all 3 lines. The case file is filling up."],
  confront: ["You found the line and proved what it shows on your first try.", "Right line, right words, first try. Brom noticed.", "First try: you backed your answer with the exact words."],
  lie: ["You caught the lie on your first try. The text doesn't lie.", "First try: you found the line that proves the testimony false.", "One line, one try, one lie caught."],
  call: ["Two lines, first try: your case holds up.", "First try: both lines support your theory.", "Your case is built on the text, first try."],
};
const RETRIES = ["That one took a few tries. Slow down and read closely; the proof is in the text.", "A few tries that time. Read each line all the way through before you lock it in.", "You got there. This round, check each line against the question before you tap it."];
const SHOWN = ["Now you know where to look. This round, find it yourself.", "The answer was shown last round. Read closely and find this one on your own.", "Fresh round, fresh start. The proof is in the text: go find it."];
const START = ["Read closely. Every point comes from a line in the story.", "Your case starts here. Find the lines that prove it."];
// The word on the last round (null before round 1 is played); seed keeps it from repeating the same version each round.
export function roundIntroLine(last: Pick<RoundRecord, "kind" | "valid" | "shown" | "tries" | "wrong"> | undefined, seed: number) {
  const pick = (xs: string[]) => xs[Math.abs(seed) % xs.length];
  if (!last) return pick(START);
  if (last.shown || !last.valid) return pick(SHOWN);
  if (last.tries > 0 || last.wrong > 0) return pick(RETRIES);
  return pick(FIRST_TRY[last.kind]);
}
// "200 / 1,200 · 280 more for Case Opened." (or the level reached, or Bonus past the most).
// How Story Mode opens a scene: a cleared run shows its results; a run with progress opens on "Welcome back" (once per
// page load, never on a restart); anything else opens straight into the round with the passage on screen.
export function storyOpening(run: { finished: boolean; state: { round: number; skipped?: number; rounds: unknown[] } }, resume: boolean, welcomed: boolean, restart: boolean): "cleared" | "welcome" | "play" {
  if (run.finished) return "cleared";
  const progress = resume || run.state.rounds.length > 0 || run.state.round > (run.state.skipped ?? 0);
  return progress && !welcomed && !restart ? "welcome" : "play";
}
// The round banner's one-line goal: the next level's points ("Goal: 1,032 for Case Opened").
export function nextGoal(total: number, max: number) {
  const next = levelPoints(max).find((l) => total < l.points);
  return next ? `Goal: ${next.points.toLocaleString("en-US")} for ${next.name}` : total > max ? "Goal reached: Bonus" : "Goal reached: Case Cracked";
}
// Rival in Story Mode: the labeled computer rival "locks in" partway through the round's first-try time (45 to 70
// percent, fixed per scene and round, scaled by the student's time setting). The student wins the round's face-off by
// locking in the right line on the first try before then. It never changes points: points come from the proof.
export function storyRivalMs(sceneId: string, kind: RoundKind, setting: TimeSetting) {
  let h = 0;
  for (const ch of `${sceneId}:${kind}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const secs = phaseSeconds(SECONDS[kind], setting) ?? SECONDS[kind] * 2;
  return Math.round(secs * 1000 * (0.45 + (h % 26) / 100));
}
export function storyRivalOutcome(record: { valid: boolean; tries: number; shown: boolean }, youMs: number | null, rivalMs: number): "you" | "rival" {
  return record.valid && record.tries === 0 && !record.shown && youMs !== null && youMs < rivalMs ? "you" : "rival";
}
export function goalLine(total: number, max: number) {
  const n = (x: number) => x.toLocaleString("en-US");
  const next = levelPoints(max).find((l) => total < l.points);
  const tail = total > max ? "Bonus" : next ? `${n(next.points - total)} more for ${next.name}` : "Case Cracked";
  return `${n(total)} / ${n(max)} · ${tail}${tail.endsWith("Bonus") || tail === "Case Cracked" ? "" : "."}`;
}

// ---------- Class pulse (anonymized) ----------
// How everyone split on a round, as percentages, plus the strongest proof line on each side: the line from the story
// most often used as valid proof. Shown only once 5 players have answered, so one player never shows as 100%.
// Student-written text never appears here.
export const PULSE_MIN_PLAYERS = 5;
export type PulseRow = { choice: string; valid: boolean; proof: string[] };
export function classPulse(rows: PulseRow[], options: { key: string; label: string }[]) {
  const total = rows.length;
  if (total < PULSE_MIN_PLAYERS) return [];
  return options.map((o) => {
    const mine = rows.filter((r) => r.choice === o.key);
    const counts = new Map<string, number>();
    for (const r of mine) if (r.valid) for (const p of r.proof) counts.set(p, (counts.get(p) ?? 0) + 1);
    const strongest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return { key: o.key, label: o.label, pct: total ? Math.round((mine.length / total) * 100) : 0, strongest };
  });
}
// The sides of each round, for the pulse. Round 4 compares players who got the same case question.
export function pulseOptions(scene: Scene, round: RoundKind, picks?: Partial<Picks>) {
  if (round === "read" || round === "confront") return [{ key: "found", label: "Found it" }, { key: "missed", label: "Not yet" }];
  if (round === "lie") return [{ key: "caught", label: "Caught the lie" }, { key: "missed", label: "Missed it" }];
  const q = callQ(scene, picks);
  return q.theories.map((t) => ({ key: `${q.id}|${t.id}`, label: t.name }));
}
export const pulseChoice = (r: RoundScore) => (r.kind === "read" ? (r.valid ? "found" : "missed") : r.choice);

// ---------- Leaderboards ----------
// Students see the top 5 and their own rank with "+N spots" movement; never the full ranked list.
export type BoardRow = { id: string; name: string; score: number };
export function rankRows<T extends BoardRow>(rows: T[]) {
  return [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
export function studentBoard(rows: BoardRow[], meId: string | null, previousRank: number | null = null) {
  const ranked = rankRows(rows);
  const i = meId ? ranked.findIndex((r) => r.id === meId) : -1;
  const rank = i >= 0 ? i + 1 : null;
  return {
    top: ranked.slice(0, 5).map((r, k) => ({ rank: k + 1, name: r.name, score: r.score, me: r.id === meId })),
    me: rank ? { rank, score: ranked[i].score, movement: previousRank ? previousRank - rank : 0 } : null,
    players: ranked.length,
  };
}
// Class leaderboards show a first name and last initial ("Rosa P."), from the student's class nickname.
export function boardName(nickname: string) {
  const parts = nickname.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Student";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// ---------- validate:worlds ----------
export function storyModeProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const problems: string[] = [];
  const notes = contentNotes(world);
  const names = nameWords(world);
  const dash = /—/;
  for (const scene of world.scenes) {
    const c = scene.story_mode;
    if (!c) continue;
    const where = `${world.id}/${scene.id} story_mode`;
    const reading = new Set(c.read.chunks);
    const inReading = (line: string) => { const l = sceneEvidence(world, passages, scene, line); return l && reading.has(l.pid) ? { text: l.text, pid: l.pid } : null; };
    const texts = [c.intro, c.read.prompt, c.infer.reaction.right, c.infer.reaction.wrong, ...c.read.bank.flatMap((q) => [q.focus, ...q.near_misses.map((n) => n.hint)]), ...c.infer.bank.flatMap((q) => [q.question, ...q.near_misses.map((n) => n.hint), q.prove.right, ...q.prove.wrong]), ...c.call.bank.flatMap((q) => [q.question, ...q.theories.flatMap((t) => [t.name, t.description])])];
    if (texts.some((t) => dash.test(t))) problems.push(`${where}: no em dashes in player-facing text`);
    if (!scene.lie) problems.push(`${where}: round 3 needs the scene's Spot the Lie testimony`);
    for (const pid of c.read.chunks) {
      if (!passages.some((p) => p.id === pid)) problems.push(`${where}: chunk ${pid} is not a paragraph`);
      if (notes.has(pid)) problems.push(`${where}: chunk ${pid} has a content note; Story Mode reading avoids those`);
    }
    if (!evidenceLines(world, passages, sceneClueIds(scene)).some((l) => reading.has(l.pid))) problems.push(`${where}: the reading has no evidence lines to find`);
    const banks: [string, { id: string }[]][] = [["read", c.read.bank], ["infer", c.infer.bank], ["lie", sceneLies(scene)], ["call", c.call.bank]];
    for (const [name, bank] of banks) {
      if (bank.length < 3 || bank.length > 4) problems.push(`${where}: the ${name} round needs 3 or 4 questions`);
      if (new Set(bank.map((q) => q.id)).size !== bank.length) problems.push(`${where}: ${name} question ids must differ`);
    }
    // Round 1: exact lines from the reading, at least the pouch's 3; no shared key words.
    for (const q of c.read.bank) {
      problems.push(...questionProblems(`${where}/read/${q.id}`, { focus: q.focus, answers: q.answers, near_misses: q.near_misses }, names, inReading, (l) => inReading(l)?.pid ?? null, false));
      if (new Set(q.answers.map(lineWords)).size < POUCH_MAX) problems.push(`${where}/read/${q.id}: needs at least ${POUCH_MAX} different answer lines`);
    }
    // Round 2: a speaking character asks; one exact line, its exact words when long, and Prove it.
    const who = c.infer.character_id;
    if (!scene.available_characters.includes(who) || !world.characters.some((x) => x.id === who)) problems.push(`${where}: ${who} must be a speaking character in this scene`);
    for (const q of c.infer.bank) problems.push(...questionProblems(`${where}/infer/${q.id}`, q, names, inReading, (l) => inReading(l)?.pid ?? null));
    // Round 3: every lie follows the Spot the Lie rules.
    for (const l of c.lies) problems.push(...lieProblems({ ...world, scenes: [{ ...scene, lie: l }] }, passages).map((p) => p.replace(" lie:", ` lie ${l.id}:`)));
    // Round 4: three theories, each backed by lines from the reading.
    for (const q of c.call.bank) {
      if (new Set(q.theories.map((t) => t.id)).size !== 3) problems.push(`${where}/call/${q.id}: the three theories need different ids`);
      for (const t of q.theories) for (const s of t.supports) if (!inReading(s)) problems.push(`${where}/call/${q.id}: theory ${t.id} needs an exact line from the reading`);
    }
  }
  return problems;
}
