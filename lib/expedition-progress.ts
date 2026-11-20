// Expedition progress (expedition phase 4): what one attempt saves, the expedition map (locked, current, proven, stars
// for first-try proof), rank badges for expeditions finished, skill badges by question type, and the class Evidence
// rollup (skill map by standard, first-try rates by type, Refresher fixes, Gist accuracy, unknown words, Case Notes,
// Name the Liar). Pure functions: solo progress lives on the device, a class student's in expedition_results.
import { DOK_NAMES, dokFromNote } from "./dok.ts";
import { roomDashRow, roomDashTotals, roomOf } from "./escape-room.ts";
import type { WorldPack } from "./world-schema.ts";
import { TYPE_INFO } from "./expedition.ts";
import { benchmark, type BenchmarkFamily, type Grade } from "./best-standards.ts";
import { classLevels, codeOf, evidenceFrom, levelHistory, masteryOf } from "./mastery.ts";
import type { CaseNote } from "./case-notes.ts";
import { provedFirstTry } from "./case-notes.ts";
import type { InterviewNote } from "./interview.ts";
import type { ExpeditionResultRow } from "./classroom/store.ts";

// One attempt at an expedition: saved when the race ends (complete: false until Case Notes close) and again after.
export type ExpeditionAttempt = {
  attemptId: string; worldId: string; expeditionId: string; startedAt: string; finishedAt: string | null; complete: boolean;
  score: number; notes: CaseNote[]; interview: InterviewNote | null; award: { stars: number; of: number; badge: string | null } | null;
  // The one-sentence reflection after the skill report ("Which skill improved, and how do you know?").
  reflection?: string | null;
  // The last room's exit door: the student's answer to the story's essential question, with Case File lines.
  essential?: { text: string; lines: string[] } | null;
  // The escape timer per chamber (lib/room-clock.ts): its budget, the time used, and whether each was escaped in time.
  timer?: { budgetMs: number; used: number[]; inTime: (boolean | null)[] } | null;
  // An unfinished room: where it picks up again (lib/escape-room.ts RoomResume); null once the room is finished.
  resume?: unknown;
  // Puzzle locks: each one's first-try result (lib/escape-room.ts).
  puzzles?: { id: string; type: string; firstTry: boolean[]; points: number }[];
};
// A saved row (expedition_results) as an attempt.
export const toAttempt = (r: ExpeditionResultRow): ExpeditionAttempt => ({ ...(r.record as unknown as ExpeditionAttempt), attemptId: r.attempt_id, worldId: r.world_id, expeditionId: r.expedition_id, startedAt: r.started_at, finishedAt: r.finished_at, complete: r.complete });
export const firstTryOf = (a: Pick<ExpeditionAttempt, "notes">) => a.notes.filter(provedFirstTry).length;

// ---------- The map ----------
// Stars for first-try proof: 3 for 9 or more of 10, 2 for 7, 1 for 4.
export function starsFor(firstTry: number, total: number) {
  if (!total) return 0;
  const share = firstTry / total;
  return share >= 0.9 ? 3 : share >= 0.7 ? 2 : share >= 0.4 ? 1 : 0;
}
export type StopState = "locked" | "current" | "proven";
export type MapStop = { id: string; number: number; title: string; state: StopState; stars: number; firstTry: number; total: number; solved: boolean | null; assigned: { due: string | null } | null };
// The first attempt counts for stars (first-try proof); any finished attempt proves the stop. Finishing one unlocks the next.
export function expeditionMap(world: WorldPack, attempts: ExpeditionAttempt[], assigned: { expeditionId: string; due: string | null }[] = []): MapStop[] {
  const exps = world.expeditions ?? [];
  let open = true;
  return exps.map((e, k) => {
    const mine = attempts.filter((a) => a.expeditionId === e.id && a.worldId === world.id).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const first = mine.find((a) => a.notes.length > 0), done = mine.some((a) => a.finishedAt);
    const state: StopState = done ? "proven" : open ? "current" : "locked";
    if (!done) open = false;
    const as = assigned.find((x) => x.expeditionId === e.id);
    return { id: e.id, number: k + 1, title: e.title, state, stars: first ? starsFor(firstTryOf(first), first.notes.length) : 0, firstTry: first ? firstTryOf(first) : 0, total: e.chunks.length,
      solved: first?.interview ? first.interview.solved : null, assigned: as ? { due: as.due } : null };
  });
}
// The expedition Start Proof Race opens: the current stop, or the last one once every stop is proven.
export const nextExpedition = (stops: MapStop[]) => (stops.find((s) => s.state === "current") ?? stops.at(-1))?.id ?? null;

// Rank badges, by expeditions finished: Investigator at 1, Detective at 3, Chief Inspector at 6, and Master Sleuth for
// finishing every expedition in a story that has more than 6.
export const RANKS = ["Investigator", "Detective", "Chief Inspector", "Master Sleuth"] as const;
export type Rank = (typeof RANKS)[number];
export function rankFor(finished: number, stops: number): Rank | null {
  if (stops > 6 && finished >= stops) return "Master Sleuth";
  return finished >= 6 ? "Chief Inspector" : finished >= 3 ? "Detective" : finished >= 1 ? "Investigator" : null;
}
// The rank just earned by finishing one more expedition (for the moment at the end of an expedition), or null.
export function newRank(finishedBefore: number, stops: number) {
  const a = rankFor(finishedBefore, stops), b = rankFor(finishedBefore + 1, stops);
  return b && b !== a ? b : null;
}

// Skill badges by question type: a badge for 3 proofs of that type on the first try (Gist Getter: 5 best summaries).
export const SKILL_TARGET = 3, GIST_TARGET = 5;
// What each badge practises, in plain words, for its subtitle ("Vocabulary in context · 0 of 3").
export const BADGE_SKILL: Record<string, string> = {
  "Word Detective": "Vocabulary in context", "Shades of Meaning": "Word choice and tone", "Read Between the Lines": "Making inferences",
  "Whose Eyes?": "Point of view", "Figure It Out": "Figurative language", "Character Clue": "Character", "Theme Thread": "Theme",
  "Gist Check": "Summarizing", "Find It": "Citing evidence", "Catch the Lie": "Spotting a false claim", "Make the Call": "Drawing conclusions",
  "Story Order": "Story structure", "Weigh the Evidence": "Weighing evidence", "Name the Liar": "Proving a claim false",
};
export function skillBadges(attempts: ExpeditionAttempt[]) {
  const firsts = firstAttempts(attempts);
  const types = Object.values(TYPE_INFO).filter((t) => t.name !== "Gist Check" && t.name !== "Make the Call");
  const out = types.map((t) => { const count = firsts.flatMap((a) => a.notes).filter((n) => n.type === t.name && n.rightFirstTry).length; return { skill: t.skill, type: t.name, count, target: SKILL_TARGET, earned: count >= SKILL_TARGET }; });
  const gist = firsts.flatMap((a) => a.notes).filter((n) => n.gistRight).length;
  const liar = firsts.filter((a) => a.interview?.solved).length;
  return [...out, { skill: "Gist Getter", type: "Gist Check", count: gist, target: GIST_TARGET, earned: gist >= GIST_TARGET }, { skill: "Case Closer", type: "Name the Liar", count: liar, target: 1, earned: liar >= 1 }];
}
// Each expedition's first attempt with answers (first-try stats come from it).
export function firstAttempts(attempts: ExpeditionAttempt[]) {
  const by = new Map<string, ExpeditionAttempt>();
  for (const a of [...attempts].sort((x, y) => x.startedAt.localeCompare(y.startedAt))) if (a.notes.length && !by.has(`${a.worldId}:${a.expeditionId}`)) by.set(`${a.worldId}:${a.expeditionId}`, a);
  return [...by.values()];
}

// The escape timer for one student in one room: the latest attempt that ran the timer, and any attempt in time per chamber.
export function timerRow(attempts: Pick<ExpeditionAttempt, "startedAt" | "timer">[]) {
  const timed = attempts.filter((a) => a.timer && a.timer.budgetMs > 0).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const latest = timed[0]?.timer ?? null; if (!latest) return null;
  const chambers = latest.used.map((ms, c) => ({ ms, inTime: latest.inTime[c] ?? null, everInTime: timed.some((a) => a.timer!.inTime[c] === true) }));
  return { budgetMs: latest.budgetMs, chambers };
}

// ---------- Class Evidence ----------
export type StudentExpeditions = { id: string; nickname: string; attempts: ExpeditionAttempt[] };
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);
// One student's (or the class's) skills: per B.E.S.T. benchmark and per question type, from first attempts.
// firsts: the attempts are already each student's first ones (a class rollup).
export function skillMap(attempts: ExpeditionAttempt[], grade: Grade, firsts = false) {
  const notes = (firsts ? attempts : firstAttempts(attempts)).flatMap((a) => a.notes);
  const byStd = new Map<string, { right: number; total: number }>();
  for (const n of notes) for (const s of n.standards) { const code = benchmark(s as BenchmarkFamily, grade).code, x = byStd.get(code) ?? { right: 0, total: 0 }; x.total++; if (provedFirstTry(n)) x.right++; byStd.set(code, x); }
  const gists = notes.filter((n) => n.gistPick !== null);
  const gistStd = benchmark("R.3.2", grade).code, g = byStd.get(gistStd) ?? { right: 0, total: 0 };
  byStd.set(gistStd, { right: g.right + gists.filter((n) => n.gistRight).length, total: g.total + gists.length });
  const byType = new Map<string, { right: number; total: number }>();
  for (const n of notes) { const x = byType.get(n.type) ?? { right: 0, total: 0 }; x.total++; if (provedFirstTry(n)) x.right++; byType.set(n.type, x); }
  // Depth of Knowledge (lib/dok.ts): first-try rate per level; older notes take their level from the question type.
  const byDok = new Map<number, { right: number; total: number }>();
  for (const n of notes) { const d = dokFromNote(n); if (!d) continue; const x = byDok.get(d) ?? { right: 0, total: 0 }; x.total++; if (provedFirstTry(n)) x.right++; byDok.set(d, x); }
  return {
    standards: [...byStd.entries()].map(([code, x]) => ({ code, ...x, pct: pct(x.right, x.total) })).sort((a, b) => a.code.localeCompare(b.code)),
    types: [...byType.entries()].map(([type, x]) => ({ type, ...x, pct: pct(x.right, x.total) })).sort((a, b) => a.type.localeCompare(b.type)),
    dok: [...byDok.entries()].sort((a, b) => a[0] - b[0]).map(([level, x]) => ({ level, name: DOK_NAMES[level as 1 | 2 | 3 | 4], ...x, pct: pct(x.right, x.total) })),
    gist: { right: gists.filter((n) => n.gistRight).length, total: gists.length, pct: pct(gists.filter((n) => n.gistRight).length, gists.length) },
    refresher: { fixed: notes.filter((n) => n.fixed === true).length, tried: notes.filter((n) => n.fixed !== null).length },
    unknownWords: [...new Set(notes.flatMap((n) => n.unknownWords.map((w) => w.toLowerCase())))].sort(),
    // Answers given with Plain words open (lib/engagement.ts), and how many of those were proved on the first try.
    plain: { answers: notes.filter((n) => n.plainWords).length, right: notes.filter((n) => n.plainWords && provedFirstTry(n)).length, of: notes.length },
  };
}
// The class view for one expedition: who finished it (assignments), and each student's first attempt in brief.
export function expeditionEvidence(world: WorldPack, students: StudentExpeditions[], grade: Grade, assignments: { expeditionId: string; due: string | null }[]) {
  const exps = world.expeditions ?? [];
  const all = students.flatMap((s) => firstAttempts(s.attempts));
  return {
    // The story frame for the teacher: the essential question, key concepts and the full synopsis (teacher view only).
    story: world.engagement ? { question: world.engagement.essential_question, concepts: world.engagement.key_concepts.map((c) => c.name), synopsis: world.engagement.synopsis } : null,
    class: skillMap(all, grade, true),
    // Mastery levels (lib/mastery.ts): the same level names and rules the students see.
    levels: classLevels(students).map((l) => ({ ...l, code: codeOf(l.family, grade) })),
    expeditions: exps.map((e) => {
      const room = roomOf(world, e.id);
      const rows = students.map((s) => {
        const mine = s.attempts.filter((a) => a.expeditionId === e.id), first = firstAttempts(mine)[0] ?? null, done = mine.find((a) => a.finishedAt);
        return { id: s.id, nickname: s.nickname, attemptId: first?.attemptId ?? null, finished: done?.finishedAt ?? null, attempts: mine.length, firstTry: first ? firstTryOf(first) : null, total: first?.notes.length ?? null, score: first?.score ?? null,
          solved: first?.interview ? first.interview.solved : null, liar: first?.interview ?? null, notes: first?.notes ?? [],
          // Escape rooms: the chamber reached, locks opened, puzzles solved on the first try, liar caught.
          room: room ? roomDashRow(room, mine) : null,
          // The escape timer (lib/room-clock.ts): the latest attempt's time per chamber and whether each was escaped in
          // time, and whether any attempt (a replay included) escaped each chamber in time.
          timer: timerRow(mine) };
      });
      const a = assignments.find((x) => x.expeditionId === e.id);
      const dash = rows.flatMap((r) => (r.room ? [r.room] : []));
      return { id: e.id, title: e.title, number: room?.number ?? null, assigned: a ? { due: a.due } : null, finished: rows.filter((r) => r.finished).length, of: rows.length, rows, totals: room ? roomDashTotals(dash) : null, locks: room?.locks.length ?? null, puzzles: room?.puzzles.length ?? null };
    }),
    students: students.map((s) => ({ id: s.id, nickname: s.nickname, finished: new Set(s.attempts.filter((a) => a.finishedAt).map((a) => a.expeditionId)).size, rank: rankFor(new Set(s.attempts.filter((a) => a.finishedAt).map((a) => a.expeditionId)).size, exps.length), skills: skillMap(s.attempts, grade),
      levels: masteryOf(evidenceFrom(s.attempts)).map((l) => ({ family: l.family, code: codeOf(l.family, grade), name: l.name, level: l.level, right: l.right, total: l.total })),
      reflections: levelHistory(s.attempts).filter((h) => h.reflection).map((h) => ({ expedition: exps.find((e) => e.id === h.expedition)?.title ?? h.expedition, text: h.reflection! })), badges: skillBadges(s.attempts).filter((b) => b.earned).map((b) => b.skill) })),
  };
}
