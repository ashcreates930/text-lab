// Live class mode: the rules of a live round, kept pure so the server, the screens and the tests share them.
// A round is played by squads. Every action is a row (who did what, in which role), and everything else (whether a squad
// can submit, the scores, the reveal, the class board) is worked out from those rows. Points come from evidence and
// reasoning; speed is only a small tiebreak bonus on correct answers; boards rank squads and classes, never students.
import type { WorldPack } from "../world-schema.ts";
import { isTruthLine, type Lie } from "../lies.ts";
import { STRENGTHS, type VerdictFeedback } from "../verdict.ts";

export const ROLES = ["lead", "keeper", "skeptic", "reporter"] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_INFO: Record<Role, { name: string; job: string }> = {
  lead: { name: "Lead Investigator", job: "Submit your squad's answer once everyone has done their part." },
  keeper: { name: "Evidence Keeper", job: "Pin the line from the story." },
  skeptic: { name: "Skeptic", job: "Approve the answer, or object so your squad fixes it." },
  reporter: { name: "Reporter", job: "Write the one-sentence explanation." },
};

export type RoundType = "lie" | "verdict" | "objection";
export type Round =
  | { type: "lie"; sceneId: string }
  | { type: "verdict"; stage: "vote" | "argue" }
  | { type: "objection"; stage: "counter" | "vote"; defendSquadId: string; objectSquadId: string; pin: { clueId?: string; quote: string }; endsAt: string };
export type SessionStatus = "lobby" | "round" | "reveal" | "ended";

export type LiveSession = {
  id: string; code: string; worldId: string; classId: string | null; demo: boolean;
  status: SessionStatus; paused: boolean; roundIndex: number; rounds: Round[]; roundStartedAt: string | null;
  createdAt: string; expiresAt: string;
};
export type LiveSquad = { id: string; name: string; position: number };
export type LivePlayer = { id: string; nickname: string; squadId: string | null; studentId: string | null; joinedAt: string };
export type ResponseKind = "pin" | "explain" | "approve" | "object" | "submit" | "vote" | "pins" | "argument" | "judged" | "counter_vote" | "override";
export type LiveResponse = {
  id: string; roundIndex: number; squadId: string | null; playerId: string | null; role: Role | "host" | "system" | null;
  kind: ResponseKind; payload: Record<string, unknown>; flagged: boolean; createdAt: string;
};

export const DEMO_ROOM = { maxPlayers: 40, hours: 2 };
export const OBJECTION_SECONDS = 45;

// ---------- Squads and roles ----------

const SQUAD_NAMES = ["Lantern", "Quill", "Compass", "Raven", "Inkwell", "Keyhole", "Candle", "Clocktower", "Magnifier", "Fog", "Owl", "Ember"];
export const squadName = (i: number) => `Squad ${SQUAD_NAMES[i % SQUAD_NAMES.length]}${i >= SQUAD_NAMES.length ? ` ${Math.floor(i / SQUAD_NAMES.length) + 1}` : ""}`;

// Squads of 3 or 4 where the class size allows it (5 players is the one size that can't: it makes a 3 and a 2).
export function squadSizes(players: number): number[] {
  if (players <= 0) return [];
  const k = Math.ceil(players / 4);
  return Array.from({ length: k }, (_, i) => Math.floor(players / k) + (i < players % k ? 1 : 0));
}
// Auto-build: deal players round-robin in join order, so friends who joined together are spread out.
export function buildSquads(playerIds: string[]): string[][] {
  const k = squadSizes(playerIds.length).length;
  return Array.from({ length: k }, (_, i) => playerIds.filter((_, j) => j % k === i));
}

// Roles rotate every round. In a squad of 4 each member has one role; in a squad of 3 one member also takes the fourth
// role, and which member that is rotates too. Smaller squads double up.
export function rolesFor(memberIds: string[], roundIndex: number): Record<Role, string> | null {
  if (!memberIds.length) return null;
  const n = memberIds.length;
  return Object.fromEntries(ROLES.map((role, i) => [role, memberIds[(i + roundIndex) % n]])) as Record<Role, string>;
}
export const rolesOf = (roles: Record<Role, string> | null, playerId: string) => (roles ? ROLES.filter((r) => roles[r] === playerId) : []);

export function squadPurpose(type: RoundType) {
  return type === "lie" ? "Catch the false claim with one line from the story."
    : type === "verdict" ? "Defend your theory with three pieces of evidence."
    : "Counter the other squad's evidence with a better line from the text.";
}

// ---------- One squad's progress in a round ----------

// Which actions each round needs, in order, and which role does each one.
const STEPS: Record<"answer" | "argue", { kind: ResponseKind; role: Role }[]> = {
  answer: [{ kind: "pin", role: "keeper" }, { kind: "explain", role: "reporter" }, { kind: "approve", role: "skeptic" }, { kind: "submit", role: "lead" }],
  argue: [{ kind: "pins", role: "keeper" }, { kind: "argument", role: "reporter" }, { kind: "approve", role: "skeptic" }, { kind: "submit", role: "lead" }],
};
export const stepsFor = (round: Round | undefined) => (round?.type === "verdict" ? STEPS.argue : STEPS.answer);
export const roundTakesSquadAnswers = (round: Round | undefined) =>
  !!round && (round.type === "lie" || (round.type === "verdict" && round.stage === "argue") || (round.type === "objection" && round.stage === "counter"));

export type SquadProgress = {
  pin?: LiveResponse; explain?: LiveResponse; pins?: LiveResponse; argument?: LiveResponse;
  skeptic?: LiveResponse; submitted?: LiveResponse;
  approved: boolean; canSubmit: boolean; waitingFor: Role[];
};
// A squad can submit only when every role has acted: the evidence and the explanation are in, and the Skeptic approved
// them after their latest change (an objection sends the squad back to fix it).
export function squadProgress(round: Round | undefined, responses: LiveResponse[], squadId: string, roundIndex: number): SquadProgress {
  const mine = responses.filter((r) => r.roundIndex === roundIndex && r.squadId === squadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const last = (kind: ResponseKind) => [...mine].reverse().find((r) => r.kind === kind);
  const evidence = round?.type === "verdict" ? last("pins") : last("pin");
  const words = round?.type === "verdict" ? last("argument") : last("explain");
  const skeptic = [...mine].reverse().find((r) => r.kind === "approve" || r.kind === "object");
  const latestChange = [evidence, words].filter(Boolean).map((r) => r!.createdAt).sort().at(-1) ?? "";
  const approved = !!skeptic && skeptic.kind === "approve" && skeptic.createdAt >= latestChange && !!evidence && !!words;
  const submitted = last("submit");
  const waitingFor: Role[] = [];
  if (!evidence) waitingFor.push("keeper");
  if (!words) waitingFor.push("reporter");
  if (!approved) waitingFor.push("skeptic");
  if (!submitted) waitingFor.push("lead");
  return {
    ...(round?.type === "verdict" ? { pins: evidence, argument: words } : { pin: evidence, explain: words }),
    skeptic, submitted, approved, canSubmit: approved && !submitted, waitingFor,
  };
}
// Whether this player may take this action now: they hold the role, the round takes it, and the squad hasn't submitted.
export function mayAct(round: Round | undefined, roles: Record<Role, string> | null, playerId: string, kind: ResponseKind, progress: SquadProgress) {
  if (kind === "vote") return round?.type === "verdict" && round.stage === "vote";
  if (kind === "counter_vote") return round?.type === "objection" && round.stage === "vote";
  if (!roundTakesSquadAnswers(round) || progress.submitted) return false;
  const step = stepsFor(round).find((s) => s.kind === kind || (kind === "object" && s.kind === "approve"));
  if (!step || roles?.[step.role] !== playerId) return false;
  if (kind === "submit") return progress.canSubmit;
  if (kind === "approve" || kind === "object") return !!(progress.pin || progress.pins) && !!(progress.explain || progress.argument);
  return true;
}

// ---------- Scoring ----------

const STOP = new Set("about after again also because been before being could does from have here into just like line more said says some than that their them then there these they this those very what when where which while with would your story".split(" "));
const contentWords = (t: string) => new Set(t.toLowerCase().replace(/[^a-z' ]+/g, " ").split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w)));
// A sound explanation is a real sentence that ties the line to the claim: at least six words, sharing a key word with
// the false claim or the truth line. The teacher can mark it sound or not at the reveal.
export function soundExplanation(text: string, lie: Lie) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;
  const mine = contentWords(text), theirs = new Set([...contentWords(lie.false_claim), ...contentWords(lie.truth_line), ...contentWords(lie.topic)]);
  return [...mine].some((w) => theirs.has(w));
}
export const LIE_POINTS = { full: 100, lineOnly: 50, speed: [10, 7, 4, 2] };
export const VERDICT_POINTS: Record<(typeof STRENGTHS)[number] | "saved", number> = { Strong: 100, Solid: 70, "Needs more evidence": 40, saved: 50 };
export const OBJECTION_POINTS = { sustained: 60, held: 40 };

export type SquadScore = { squadId: string; points: number; detail: string };
const override = (responses: LiveResponse[], roundIndex: number, squadId: string | null, key: string) =>
  [...responses].reverse().find((r) => r.roundIndex === roundIndex && r.kind === "override" && r.payload.key === key && (squadId === null || r.squadId === squadId));

// Spot the Lie: right line + sound explanation = 100; right line alone = 50; wrong line = 0. Correct squads also get a
// small speed bonus by the order they submitted (10, 7, 4, then 2).
export function scoreLieRound(lie: Lie, squads: LiveSquad[], responses: LiveResponse[], roundIndex: number): (SquadScore & { correct: boolean; sound: boolean; line?: string; explanation?: string })[] {
  const rows = squads.map((s) => {
    const p = squadProgress({ type: "lie", sceneId: "" }, responses, s.id, roundIndex);
    const line = p.submitted ? String(p.pin?.payload.quote ?? "") : undefined;
    const explanation = p.submitted ? String(p.explain?.payload.text ?? "") : undefined;
    const correct = !!line && isTruthLine(lie, line);
    const auto = !!explanation && !p.explain?.flagged && soundExplanation(explanation, lie);
    const o = override(responses, roundIndex, s.id, "sound");
    const sound = correct && (o ? o.payload.value === true : auto);
    return { squadId: s.id, correct, sound, line, explanation, submittedAt: p.submitted?.createdAt ?? "" };
  });
  const order = rows.filter((r) => r.correct).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).map((r) => r.squadId);
  return rows.map(({ submittedAt: _s, ...r }) => {
    const base = !r.correct ? 0 : r.sound ? LIE_POINTS.full : LIE_POINTS.lineOnly;
    const rank = order.indexOf(r.squadId);
    const speed = r.correct ? (LIE_POINTS.speed[rank] ?? LIE_POINTS.speed.at(-1)!) : 0;
    const points = base + speed;
    return { ...r, points, detail: !r.line ? "No answer" : !r.correct ? "Not the line" : r.sound ? "Right line, sound explanation" : "Right line" };
  });
}

// Verdict Vote: everyone votes; each squad's argument is scored by the judge's case strength.
export function tallyVotes(world: WorldPack, responses: LiveResponse[], roundIndex: number) {
  const latest = new Map<string, string>();
  for (const r of responses) if (r.roundIndex === roundIndex && r.kind === "vote" && r.playerId) latest.set(r.playerId, String(r.payload.theoryId));
  return (world.verdict?.theories ?? []).map((t) => ({ theoryId: t.id, name: t.name, votes: [...latest.values()].filter((v) => v === t.id).length }));
}
export function scoreVerdictRound(squads: LiveSquad[], responses: LiveResponse[], roundIndex: number) {
  return squads.map((s) => {
    const p = squadProgress({ type: "verdict", stage: "argue" }, responses, s.id, roundIndex);
    const judged = [...responses].reverse().find((r) => r.roundIndex === roundIndex && r.squadId === s.id && r.kind === "judged");
    const feedback = (judged?.payload.feedback ?? null) as VerdictFeedback | null;
    const points = !p.submitted ? 0 : feedback ? VERDICT_POINTS[feedback.strength] : judged ? VERDICT_POINTS.saved : 0;
    return { squadId: s.id, points, feedback, theoryId: p.submitted ? String(p.submitted.payload.theoryId ?? "") : "", argument: p.argument && !p.argument.flagged ? String(p.argument.payload.text) : "", pins: (p.pins?.payload.pins ?? []) as { clueId?: string; quote: string }[], detail: !p.submitted ? "No argument" : feedback ? feedback.strength : judged ? "Saved without feedback" : "Waiting for the judge" };
  });
}
// The strongest argument for each theory, for the reveal: the best case strength, then the earliest.
export function strongestByTheory(scores: ReturnType<typeof scoreVerdictRound>) {
  const best = new Map<string, (typeof scores)[number]>();
  for (const s of scores) if (s.theoryId && s.argument) { const b = best.get(s.theoryId); if (!b || s.points > b.points) best.set(s.theoryId, s); }
  return best;
}

// Objection!: the class votes on the objecting squad's counter; the teacher can override. A sustained objection with a
// line and a sentence earns the objecting squad 60; otherwise the defending squad's evidence held, for 40.
export function objectionResult(round: Extract<Round, { type: "objection" }>, responses: LiveResponse[], roundIndex: number) {
  const p = squadProgress(round, responses, round.objectSquadId, roundIndex);
  const countered = !!p.submitted && !!p.pin && !!p.explain && !p.explain.flagged;
  const votes = new Map<string, boolean>();
  for (const r of responses) if (r.roundIndex === roundIndex && r.kind === "counter_vote" && r.playerId) votes.set(r.playerId, r.payload.sustain === true);
  const sustain = [...votes.values()].filter(Boolean).length, overrule = votes.size - sustain;
  const o = override(responses, roundIndex, null, "objection");
  const sustained = countered && (o ? o.payload.value === true : sustain > overrule);
  return {
    countered, sustain, overrule, sustained, overridden: !!o, counterLine: p.pin ? String(p.pin.payload.quote) : "", counterText: p.explain && !p.explain.flagged ? String(p.explain.payload.text) : "",
    scores: [{ squadId: round.objectSquadId, points: sustained ? OBJECTION_POINTS.sustained : 0 }, { squadId: round.defendSquadId, points: sustained ? 0 : OBJECTION_POINTS.held }],
  };
}

// Points per squad for the whole session.
export function sessionScores(world: WorldPack, session: LiveSession, squads: LiveSquad[], responses: LiveResponse[]) {
  const total = new Map(squads.map((s) => [s.id, 0]));
  session.rounds.forEach((round, i) => {
    if (i > session.roundIndex || (i === session.roundIndex && session.status === "round")) return; // only rounds that have been revealed count
    let scores: { squadId: string; points: number }[] = [];
    if (round.type === "lie") { const lie = world.scenes.find((s) => s.id === round.sceneId)?.lie; if (lie) scores = scoreLieRound(lie, squads, responses, i); }
    else if (round.type === "verdict") scores = scoreVerdictRound(squads, responses, i);
    else scores = objectionResult(round, responses, i).scores;
    for (const s of scores) total.set(s.squadId, (total.get(s.squadId) ?? 0) + s.points);
  });
  return squads.map((s) => ({ squadId: s.id, name: s.name, points: total.get(s.id) ?? 0 })).sort((a, b) => b.points - a.points);
}

// Period vs. period: squad points added up per class over the last seven days. Classes only, never students.
export function classBoard(entries: { classId: string; className: string; createdAt: string; points: number }[], now = new Date()) {
  const since = new Date(now.getTime() - 7 * 864e5).toISOString();
  const totals = new Map<string, { classId: string; className: string; points: number; rounds: number }>();
  for (const e of entries) {
    if (e.createdAt < since) continue;
    const t = totals.get(e.classId) ?? { classId: e.classId, className: e.className, points: 0, rounds: 0 };
    t.points += e.points; t.rounds++; totals.set(e.classId, t);
  }
  return [...totals.values()].sort((a, b) => b.points - a.points);
}

// Guests pick a generated detective nickname; nobody types a name.
const TITLES = ["Detective", "Inspector", "Sleuth", "Agent", "Constable", "Investigator"];
const NAMES = ["Owl", "Fox", "Lantern", "Raven", "Quill", "Ember", "Harbor", "Juniper", "Comet", "Thistle", "Maple", "Cobalt", "Sparrow", "Willow", "Flint", "Marble"];
export const isGeneratedNickname = (name: string) => { const [t, n, ...rest] = name.split(" "); return !rest.length && TITLES.includes(t) && NAMES.includes(n); };
export function nicknameChoices(seed: number, taken: string[] = [], count = 3) {
  const out: string[] = [];
  for (let i = 0; out.length < count && i < 200; i++) {
    const n = (seed + i * 7919) >>> 0;
    const name = `${TITLES[n % TITLES.length]} ${NAMES[Math.floor(n / TITLES.length) % NAMES.length]}`;
    if (!taken.includes(name) && !out.includes(name)) out.push(name);
  }
  return out;
}
