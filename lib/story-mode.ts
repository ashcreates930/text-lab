// Story Mode: a scene played from inside the story as four timed, scored rounds (read and notice, something happens to
// you, catch the lie, make your call), with streaks, Lantern coins, power-ups, a class pulse and a top-5 leaderboard.
// All content comes from the scene's `story_mode` block in the world file (never generated live). These are the pure
// rules, shared by the server (which scores every round), the screens, the live version, the validator and the tests.
// Reading carefully always pays more than answering fast: a speed bonus is at most 100 and only on valid proof, while
// valid proof is worth 100 to 600.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { contentNotes } from "./content-notes.ts";
import { isTruthLine, lineWords, type Lie } from "./lies.ts";
import { evidenceLines, matchEvidence } from "./evidence-check.ts";
import { soundExplanation } from "./live/engine.ts";

export type Scene = WorldPack["scenes"][number];
export type StoryContent = NonNullable<Scene["story_mode"]>;
export type RoundKind = "read" | "confront" | "lie" | "call";
export const ROUNDS: RoundKind[] = ["read", "confront", "lie", "call"];
export const ROUND_NAMES: Record<RoundKind, string> = { read: "Read and notice", confront: "Something happens to you", lie: "Catch the lie", call: "Make your call" };

// ---------- Time ----------
// Seconds per phase at normal speed. Round 2 has a choice phase and a proof phase.
export const SECONDS = { read: 120, choice: 30, proof: 60, lie: 60, call: 90 } as const;
export const GRACE_SECONDS = 20; // after "Time!", proof still counts for half points
export const COUNTDOWN_SECONDS = 3;
// Extra time: the teacher sets 1.5x, 2x or untimed per student; solo and demo players can pick Relaxed (2x).
export type TimeSetting = "1" | "1.5" | "2" | "untimed";
export const TIME_SETTINGS: TimeSetting[] = ["1", "1.5", "2", "untimed"];
// null: no time limit (untimed). The speed bonus for an untimed student is measured against double time.
export function phaseSeconds(base: number, setting: TimeSetting): number | null {
  return setting === "untimed" ? null : base * Number(setting);
}
export function speedWindow(base: number, setting: TimeSetting) {
  return base * (setting === "untimed" ? 2 : Number(setting));
}
// Speed bonus, up to 100, measured against the student's own time. Never during the grace period.
export function speedBonus(elapsedMs: number, base: number, setting: TimeSetting, max = 100) {
  const window = speedWindow(base, setting) * 1000;
  if (!(elapsedMs >= 0) || elapsedMs >= window) return 0;
  return Math.round(max * (1 - elapsedMs / window));
}
// What the screen reader hears: only at 30, 10 and 5 seconds left, never every second.
export const ANNOUNCE_AT = [30, 10, 5];
export function timeAnnouncement(prevLeft: number, left: number) {
  const hit = ANNOUNCE_AT.find((s) => prevLeft > s && left <= s);
  return hit ? `${hit} seconds left` : "";
}

// ---------- Inputs and scoring ----------
export type Timing = { elapsedMs: number; grace: boolean };
export type RoundInput =
  | { kind: "read"; pouch: string[] }
  | { kind: "confront"; actionId: string; proof: string }
  | { kind: "lie"; line: string; explanation: string }
  | { kind: "call"; theoryId: string; pins: string[] };
// grace: scored in the 20 seconds after time ran out (half points, no speed bonus).
// offFocus (round 1): pouch lines that are true to the story but do not answer the focus question (0 points each).
// nearMiss (round 1): the authored hint for each off-focus line that is a near miss, by line.
export type RoundScore = { kind: RoundKind; base: number; speed: number; valid: boolean; coinsEarned: number; detail: string; choice: string; proof: string[]; grace?: boolean; note?: string; offFocus?: string[]; nearMiss?: Record<string, string> };

export const POINTS = { readLine: 100, confrontProof: 500, confrontAction: 100, lieFull: 600, lieLine: 300, callLine: 200, callSupports: 200, speedMax: 100 };
export const POUCH_MAX = 3;
export const OFF_FOCUS_NOTE = "True to the story, but it doesn't answer the question.";
const same = (a: string, b: string) => lineWords(a) === lineWords(b);
const sceneClueIds = (scene: Scene) => scene.artifacts.map((a) => a.id);
// A real evidence line for one of this scene's clues, as the world file has it, or null.
export const sceneEvidence = (world: WorldPack, passages: SourcePassage[], scene: Scene, quote: string) => matchEvidence(world, passages, quote, { clueIds: sceneClueIds(scene) });

export function scoreRound(world: WorldPack, passages: SourcePassage[], scene: Scene, input: RoundInput, timing: Timing, setting: TimeSetting, pouch: string[] = []): RoundScore {
  return { ...scoreInput(world, passages, scene, input, timing, setting, pouch), grace: timing.grace };
}
function scoreInput(world: WorldPack, passages: SourcePassage[], scene: Scene, input: RoundInput, timing: Timing, setting: TimeSetting, pouch: string[]): RoundScore {
  const content = scene.story_mode!;
  const half = (n: number) => (timing.grace ? Math.round(n / 2) : n);
  const fast = (base: number) => (timing.grace ? 0 : speedBonus(timing.elapsedMs, base, setting));
  if (input.kind === "read") {
    // Up to 3 lines. Each line on the focus question's authored answer list earns 100; any other evidence line is true
    // to the story but earns 0 (it still goes in the pouch for later rounds). Duplicates count once.
    const lines = [...new Map(input.pouch.slice(0, POUCH_MAX).map((q) => sceneEvidence(world, passages, scene, q)).filter(Boolean).map((l) => [l!.text, l!])).values()];
    const answers = lines.filter((l) => content.read.answers.some((a) => same(a, l.text)));
    const offFocus = lines.filter((l) => !answers.includes(l)).map((l) => l.text);
    const nearMiss = Object.fromEntries(offFocus.flatMap((t) => { const n = content.read.near_misses?.find((m) => same(m.line, t)); return n ? [[t, n.hint]] : []; }));
    const tapped = Math.min(POUCH_MAX, input.pouch.length);
    return { kind: "read", base: half(answers.length * POINTS.readLine), speed: 0, valid: answers.length > 0, coinsEarned: answers.length, detail: `${answers.length} of ${tapped} line${tapped === 1 ? "" : "s"} answer the question`, choice: "", proof: lines.map((l) => l.text), offFocus, ...(Object.keys(nearMiss).length ? { nearMiss } : {}), ...(offFocus.length ? { note: OFF_FOCUS_NOTE } : {}) };
  }
  if (input.kind === "confront") {
    const action = content.confront.actions.find((a) => a.id === input.actionId);
    if (!action) return { kind: "confront", base: 0, speed: 0, valid: false, coinsEarned: 0, detail: "No action chosen", choice: "", proof: [] };
    // The proof must be a real evidence line that the authored mapping says supports this action.
    const line = sceneEvidence(world, passages, scene, input.proof);
    const valid = !!line && action.supports.some((s) => same(s, line.text));
    return valid
      ? { kind: "confront", base: half(POINTS.confrontProof), speed: fast(SECONDS.proof), valid, coinsEarned: 1, detail: "Your proof backs your move", choice: action.id, proof: [line!.text] }
      : { kind: "confront", base: half(POINTS.confrontAction), speed: 0, valid, coinsEarned: 0, detail: line ? "That line doesn't back this move" : "No proof from the story", choice: action.id, proof: line ? [line.text] : [] };
  }
  if (input.kind === "lie") {
    const lie = scene.lie as Lie;
    const correct = !!sceneEvidence(world, passages, scene, input.line) && isTruthLine(lie, input.line);
    const sound = correct && soundExplanation(input.explanation, lie);
    const base = !correct ? 0 : sound ? POINTS.lieFull : POINTS.lieLine;
    return { kind: "lie", base: half(base), speed: correct ? fast(SECONDS.lie) : 0, valid: correct, coinsEarned: correct ? 1 : 0, detail: !correct ? "Not the line that disproves it" : sound ? "Right line, sound explanation" : "Right line", choice: correct ? "caught" : "missed", proof: correct ? [lie.truth_line] : [] };
  }
  const theory = content.call.theories.find((t) => t.id === input.theoryId);
  // Pins come from the pouch only, two different lines.
  const pins = [...new Set(input.pins.filter((p) => pouch.some((q) => same(p, q))).map((p) => sceneEvidence(world, passages, scene, p)?.text).filter(Boolean) as string[])].slice(0, 2);
  const both = !!theory && pins.length === 2 && pins.every((p) => theory.supports.some((s) => same(s, p)));
  const base = theory ? pins.length * POINTS.callLine + (both ? POINTS.callSupports : 0) : 0;
  return { kind: "call", base: half(base), speed: 0, valid: !!theory && pins.length > 0, coinsEarned: theory ? pins.length : 0, detail: !theory ? "No theory chosen" : both ? "Both lines support your theory" : `${pins.length} valid line${pins.length === 1 ? "" : "s"} pinned`, choice: theory?.id ?? "", proof: pins };
}

// ---------- The game layer: streaks, coins, power-ups ----------
export type PowerUp = "lantern" | "second-look" | "double-down";
export const POWER_UPS: Record<PowerUp, { name: string; cost: number; what: string }> = {
  lantern: { name: "Lantern", cost: 2, what: "Highlights the paragraph that holds a correct line." },
  "second-look": { name: "Second look", cost: 1, what: "Replays the last part of the reading." },
  "double-down": { name: "Double down", cost: 3, what: "Doubles the next round's points if your proof is valid. Lose your speed bonus if it isn't." },
};
export type RoundRecord = RoundScore & { round: number; multiplier: number; doubled: boolean; points: number; streak: number };
// skipped: rounds jumped over at the start (the home page's "Catch the lie" opens at round 3); they score nothing.
export type RunState = { round: number; total: number; streak: number; bestStreak: number; coins: number; pouch: string[]; trust: Record<string, number>; lantern: boolean; doubleDown: boolean; rounds: RoundRecord[]; restarts?: number; skipped?: number };
export const newRun = (): RunState => ({ round: 0, total: 0, streak: 0, bestStreak: 0, coins: 0, pouch: [], trust: {}, lantern: false, doubleDown: false, rounds: [] });
// Consecutive rounds with valid proof: the 2nd in a row x1.2, the 3rd and on x1.5 (the cap).
export const streakMultiplier = (streakBefore: number) => (streakBefore >= 2 ? 1.5 : streakBefore === 1 ? 1.2 : 1);

export function buy(state: RunState, p: PowerUp): RunState | string {
  const cost = POWER_UPS[p].cost;
  if (state.coins < cost) return `You need ${cost} coin${cost === 1 ? "" : "s"} for ${POWER_UPS[p].name}.`;
  if (p === "lantern" && state.lantern) return "Your Lantern is already lit for the next round.";
  if (p === "double-down" && state.doubleDown) return "Double down is already on for the next round.";
  return { ...state, coins: state.coins - cost, ...(p === "lantern" ? { lantern: true } : {}), ...(p === "double-down" ? { doubleDown: true } : {}) };
}

// Applies one scored round to the run: streak multiplier, double down, coins, the pouch (round 1) and trust (round 2).
export function applyRound(state: RunState, score: RoundScore, extra: { pouch?: string[]; trust?: { characterId: string; delta: number } } = {}): RunState {
  const streak = score.valid ? state.streak + 1 : 0;
  const multiplier = score.valid ? streakMultiplier(state.streak) : 1;
  const doubled = state.doubleDown && score.valid;
  // Double down on an invalid round: the speed bonus is lost (it already is, since speed needs valid proof).
  const speed = state.doubleDown && !score.valid ? 0 : score.speed;
  const points = Math.round((score.base + speed) * multiplier * (doubled ? 2 : 1));
  const record: RoundRecord = { ...score, speed, round: state.round + 1, multiplier, doubled, points, streak };
  const trust = extra.trust ? { ...state.trust, [extra.trust.characterId]: (state.trust[extra.trust.characterId] ?? 0) + extra.trust.delta } : state.trust;
  return {
    ...state, round: state.round + 1, total: state.total + points, streak, bestStreak: Math.max(state.bestStreak, streak),
    coins: state.coins + score.coinsEarned, lantern: false, doubleDown: false, rounds: [...state.rounds, record], trust,
    pouch: extra.pouch ? [...new Set(extra.pouch)].slice(0, POUCH_MAX) : state.pouch,
  };
}

// Where the Lantern points: the paragraph that holds a correct line for the coming round.
export function lanternParagraph(world: WorldPack, passages: SourcePassage[], scene: Scene, round: RoundKind, actionId?: string) {
  const content = scene.story_mode!;
  const pidOf = (line: string) => sceneEvidence(world, passages, scene, line)?.pid ?? null;
  if (round === "confront") {
    const action = content.confront.actions.find((a) => a.id === actionId) ?? content.confront.actions[0];
    return pidOf(action.supports[0]);
  }
  if (round === "lie") return scene.lie?.truth_paragraph ?? null;
  return null;
}

// ---------- Class pulse (anonymized) ----------
// How everyone split on a round's choice, as percentages, plus the strongest proof line on each side: the line from
// the story most often used as valid proof. Student-written text never appears here.
export type PulseRow = { choice: string; valid: boolean; proof: string[] };
export function classPulse(rows: PulseRow[], options: { key: string; label: string }[]) {
  const total = rows.length;
  return options.map((o) => {
    const mine = rows.filter((r) => r.choice === o.key);
    const counts = new Map<string, number>();
    for (const r of mine) if (r.valid) for (const p of r.proof) counts.set(p, (counts.get(p) ?? 0) + 1);
    const strongest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return { key: o.key, label: o.label, pct: total ? Math.round((mine.length / total) * 100) : 0, strongest };
  });
}
// The sides of each round, for the pulse.
export function pulseOptions(scene: Scene, round: RoundKind) {
  const c = scene.story_mode!;
  if (round === "read") return [{ key: "found", label: "Answered the question" }, { key: "missed", label: "Not yet" }];
  if (round === "confront") return c.confront.actions.map((a) => ({ key: a.id, label: a.label }));
  if (round === "lie") return [{ key: "caught", label: "Caught the lie" }, { key: "missed", label: "Missed it" }];
  return c.call.theories.map((t) => ({ key: t.id, label: t.name }));
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
  const dash = /—/;
  for (const scene of world.scenes) {
    const c = scene.story_mode;
    if (!c) continue;
    const where = `${world.id}/${scene.id} story_mode`;
    const texts = [c.intro, c.read.prompt, c.read.focus, ...(c.read.near_misses ?? []).map((n) => n.hint), c.confront.line, ...c.confront.actions.flatMap((a) => [a.label, a.reaction]), c.call.question, ...c.call.theories.flatMap((t) => [t.name, t.description])];
    if (texts.some((t) => dash.test(t))) problems.push(`${where}: no em dashes in player-facing text`);
    if (!scene.lie) problems.push(`${where}: round 3 needs the scene's Spot the Lie testimony`);
    for (const pid of c.read.chunks) {
      if (!passages.some((p) => p.id === pid)) problems.push(`${where}: chunk ${pid} is not a paragraph`);
      if (notes.has(pid)) problems.push(`${where}: chunk ${pid} has a content note; Story Mode reading avoids those`);
    }
    if (!evidenceLines(world, passages, sceneClueIds(scene)).some((l) => c.read.chunks.includes(l.pid))) problems.push(`${where}: the reading has no evidence lines to find`);
    // The focus question's answers: exact evidence lines from the reading, all different, at least the pouch's 3.
    const answerTexts = new Set<string>();
    for (const a of c.read.answers) {
      const l = sceneEvidence(world, passages, scene, a);
      if (!l || l.text !== a) problems.push(`${where}: read answer "${a.replace(/\s+/g, " ").slice(0, 60)}" is not copied exactly from one of this scene's evidence lines`);
      else if (!c.read.chunks.includes(l.pid)) problems.push(`${where}: read answer from ${l.pid} is not in the reading`);
      else answerTexts.add(l.text);
    }
    if (answerTexts.size < POUCH_MAX) problems.push(`${where}: the focus question needs at least ${POUCH_MAX} different answer lines`);
    // Near misses: exact lines from the reading that are not answers, each with a hint naming a paragraph.
    for (const n of c.read.near_misses ?? []) {
      const l = sceneEvidence(world, passages, scene, n.line);
      if (!l || l.text !== n.line) problems.push(`${where}: near miss "${n.line.replace(/\s+/g, " ").slice(0, 60)}" is not copied exactly from one of this scene's evidence lines`);
      else if (!c.read.chunks.includes(l.pid)) problems.push(`${where}: near miss from ${l.pid} is not in the reading`);
      else if (answerTexts.has(l.text)) problems.push(`${where}: a near miss is also an answer`);
      if (!/¶\d+/.test(n.hint)) problems.push(`${where}: a near miss hint names a paragraph (¶)`);
    }
    const who = c.confront.character_id;
    if (!scene.available_characters.includes(who) || !world.characters.some((x) => x.id === who)) problems.push(`${where}: ${who} must be a speaking character in this scene`);
    if (!/\byou\b/i.test(c.confront.line)) problems.push(`${where}: the confrontation speaks to the student ("you")`);
    const ids = new Set<string>();
    for (const a of c.confront.actions) {
      if (ids.has(a.id)) problems.push(`${where}: action id ${a.id} is used twice`);
      ids.add(a.id);
      for (const s of a.supports) if (!sceneEvidence(world, passages, scene, s)) problems.push(`${where}: action ${a.id} supports a line that is not one of this scene's evidence lines`);
    }
    // Every supporting line has to be reachable: in the reading the student hears, or in the passage shown for proof.
    const readable = new Set(c.read.chunks);
    for (const a of c.confront.actions) for (const s of a.supports) { const l = sceneEvidence(world, passages, scene, s); if (l && !readable.has(l.pid)) problems.push(`${where}: action ${a.id} needs a line from ${l.pid}, which the reading doesn't include`); }
    const tids = new Set(c.call.theories.map((t) => t.id));
    if (tids.size !== 3) problems.push(`${where}: the three theories need different ids`);
    for (const t of c.call.theories) {
      for (const s of t.supports) { const l = sceneEvidence(world, passages, scene, s); if (!l) problems.push(`${where}: theory ${t.id} supports a line that is not one of this scene's evidence lines`); else if (!readable.has(l.pid)) problems.push(`${where}: theory ${t.id} needs a line from ${l.pid}, which the reading doesn't include`); }
    }
  }
  return problems;
}
