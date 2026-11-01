// Expedition phase 4: the map (locked, current, proven, stars), ranks, skill badges, saved attempts for class students
// (the memory store), assignments, and the Teacher Evidence rollup and CSV.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { expeditionChunks } from "../lib/expedition.ts";
import { caseNotes, type ChunkResult } from "../lib/case-notes.ts";
import { interviewNote, liarIndex } from "../lib/interview.ts";
import { expeditionEvidence, expeditionMap, firstAttempts, newRank, nextExpedition, rankFor, skillBadges, skillMap, starsFor, type ExpeditionAttempt } from "../lib/expedition-progress.ts";

const src = (f: string) => readFileSync(f, "utf8");
const sh = WorldPackSchema.parse(JSON.parse(src("worlds/sleepy-hollow/world.json")));
const shp = parseSourcePassages(src("public/worlds/sleepy-hollow/source.md"));
// A story with four stops (copies of expedition 1), for the map.
const four: WorldPack = { ...sh, expeditions: [0, 1, 2, 3].map((k) => ({ ...sh.expeditions![0], id: k ? `${sh.expeditions![0].id}-${k}` : sh.expeditions![0].id, title: `Stop ${k + 1}` })) };
const chunks = expeditionChunks(sh, shp, sh.expeditions![0].id);
function attempt(expeditionId: string, right: number, opts: { finished?: boolean; at?: string; solved?: boolean; gist?: boolean; fixed?: boolean } = {}): ExpeditionAttempt {
  const results: ChunkResult[] = chunks.map((c) => ({ index: c.index, answer: null, correct: c.index < right, late: false, gist: opts.gist === false ? null : c.chunk.gist.options.findIndex((o) => o.best), typed: null, unknown: c.index === 2 ? ["stripling"] : [] }));
  const items = results.filter((r) => !r.correct).slice(0, 4).map((r) => ({ index: r.index, kind: "question" as const }));
  const iv = sh.expeditions![0].interview!, liar = liarIndex("s", expeditionId), w = iv.witnesses[liar];
  return { attemptId: `${expeditionId}-${opts.at ?? "1"}`, worldId: sh.id, expeditionId, startedAt: `2026-11-0${opts.at ?? "1"}T10:00:00.000Z`, finishedAt: opts.finished === false ? null : `2026-11-0${opts.at ?? "1"}T10:20:00.000Z`, complete: true, score: right * 900,
    notes: caseNotes(chunks, results, { items, fixed: items.map(() => !!opts.fixed) }, { 0: "He won't swear to it." }), interview: interviewNote(sh, iv, liar, [0, 0, 0], { liar: w.character, line: opts.solved ? w.lie.lines[0] : "x" }), award: null };
}

test("the map: the first stop is current, finishing one unlocks the next, stars for first-try proof, and assignments show", () => {
  assert.deepEqual(expeditionMap(four, []).map((s) => s.state), ["current", "locked", "locked", "locked"]);
  const a1 = attempt(four.expeditions![0].id, 9), a2 = attempt(four.expeditions![1].id, 5, { finished: false });
  const stops = expeditionMap(four, [a1, a2], [{ expeditionId: four.expeditions![2].id, due: "2026-11-20" }]);
  assert.deepEqual(stops.map((s) => s.state), ["proven", "current", "locked", "locked"], "an unfinished attempt doesn't prove the stop");
  assert.equal(stops[0].stars, 3); assert.equal(stops[0].firstTry, 9); assert.equal(stops[2].assigned!.due, "2026-11-20");
  assert.equal(nextExpedition(stops), four.expeditions![1].id);
  assert.deepEqual([starsFor(10, 10), starsFor(7, 10), starsFor(4, 10), starsFor(3, 10), starsFor(0, 0)], [3, 2, 1, 0, 0]);
  // A replay never lowers the stars: the first attempt counts.
  const replay = attempt(four.expeditions![0].id, 2, { at: "5" });
  assert.equal(expeditionMap(four, [a1, a2, replay])[0].stars, 3);
  // Every stop proven: Start Proof Race opens the last one.
  const all = four.expeditions!.map((e, k) => attempt(e.id, 6, { at: String(k + 1) }));
  assert.equal(nextExpedition(expeditionMap(four, all)), four.expeditions![3].id);
});

test("ranks and skill badges", () => {
  assert.deepEqual([0, 1, 2, 3, 5, 6, 11, 12].map((n) => rankFor(n, 12)), [null, "Investigator", "Investigator", "Detective", "Detective", "Chief Inspector", "Chief Inspector", "Master Sleuth"]);
  assert.equal(rankFor(4, 4), "Detective", "Master Sleuth needs a story with more than 6 expeditions");
  assert.equal(newRank(0, 12), "Investigator"); assert.equal(newRank(1, 12), null); assert.equal(newRank(2, 12), "Detective"); assert.equal(newRank(11, 12), "Master Sleuth");
  const b = skillBadges([attempt(four.expeditions![0].id, 10, { solved: true }), attempt(four.expeditions![1].id, 10, { at: "2" }), attempt(four.expeditions![2].id, 10, { at: "3" })]);
  const by = (s: string) => b.find((x) => x.skill === s)!;
  assert.ok(by("Word Detective").earned, "3 Word Detective proofs on the first try"); assert.ok(by("Gist Getter").earned); assert.ok(by("Case Closer").earned, "a solved Name the Liar");
  const none = skillBadges([attempt(four.expeditions![0].id, 0, { gist: false })]);
  assert.ok(none.every((x) => !x.earned));
  assert.equal(firstAttempts([attempt("x", 3, { at: "2" }), attempt("x", 9, { at: "1" })])[0].notes.filter((n) => n.rightFirstTry).length, 9);
});

test("the Evidence rollup: skill map by B.E.S.T. benchmark, first-try rates by type, Refresher fixes, Gist, unknown words, Case Notes, Name the Liar, and who finished", () => {
  const ana = { id: "a", nickname: "Ana", attempts: [attempt(sh.expeditions![0].id, 8, { solved: true, fixed: true })] }, ben = { id: "b", nickname: "Ben", attempts: [attempt(sh.expeditions![0].id, 4, { finished: false })] };
  const e = expeditionEvidence(sh, [ana, ben], 7, [{ expeditionId: sh.expeditions![0].id, due: "2026-11-15" }]);
  const x = e.expeditions[0];
  assert.equal(x.assigned!.due, "2026-11-15"); assert.equal(x.finished, 1); assert.equal(x.of, 2);
  assert.deepEqual(x.rows.map((r) => [r.nickname, r.firstTry, !!r.finished, r.solved]), [["Ana", 8, true, true], ["Ben", 4, false, false]]);
  assert.ok(e.class.standards.every((s) => /^(ELA|ELA\.K12)\./.test(s.code)), "every standard is a B.E.S.T. benchmark code");
  assert.ok(e.class.standards.some((s) => s.code.includes("R.3.2")), "Gist accuracy counts toward the summary benchmark");
  assert.equal(e.class.types.reduce((a, t) => a + t.total, 0), 20); assert.equal(e.class.types.reduce((a, t) => a + t.right, 0), 12);
  assert.deepEqual(e.class.unknownWords, ["stripling"]); assert.equal(e.class.refresher.fixed, 2);
  assert.equal(e.students[0].rank, "Investigator"); assert.equal(e.students[1].rank, null);
  assert.equal(x.rows[0].notes[0].note, "He won't swear to it.");
  assert.equal(skillMap([], 7).gist.pct, null);
});

test("class students: attempts saved per attempt, assignments, and the teacher's Evidence and CSV include them", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { getClassroomStore } = await import("../lib/classroom/store.ts");
  const store = getClassroomStore()!;
  const t = await store.ensureTeacher("dev:t-exp@example.org", "t-exp@example.org");
  const cls = await store.createClass(t.id, { name: "Period 3", worldId: "sleepy-hollow", grade: 7 });
  const st = await store.createStudent(cls.id, "Ana", "hash-ana"); if (st === "taken") throw new Error("taken");
  const a = attempt(sh.expeditions![0].id, 7, { solved: true });
  const row = { student_id: st.id, world_id: a.worldId, expedition_id: a.expeditionId, attempt_id: a.attemptId, complete: false, score: a.score, first_try: 7, total: 10, solved_case: true, record: { score: a.score, notes: a.notes, interview: a.interview, award: null }, started_at: a.startedAt, finished_at: a.finishedAt };
  await store.upsertExpeditionResult(row); await store.upsertExpeditionResult({ ...row, complete: true });
  assert.equal((await store.listExpeditionResults([st.id])).length, 1, "the same attempt updates in place");
  await store.upsertExpeditionAssignment(cls.id, a.expeditionId, "2026-11-30");
  assert.equal((await store.listExpeditionAssignments(cls.id))[0].due_date, "2026-11-30");
  const { loadClassEvidence } = await import("../lib/classroom/evidence-server.ts");
  const ev = (await loadClassEvidence(store, t.id, cls.id))!;
  assert.equal(ev.expeditions!.expeditions[0].finished, 1); assert.equal(ev.expeditions!.expeditions[0].assigned!.due, "2026-11-30");
  const { evidenceCsv } = await import("../lib/classroom/evidence.ts");
  const csv = evidenceCsv(ev);
  assert.match(csv, /Expedition,Student,Finished,Chunk,Question type/); assert.match(csv, /Into the Hollow,Ana,2026-11-01,1,Whose Eyes\?/); assert.match(csv, /Statements heard,The liar/);
  await store.deleteExpeditionAssignment(cls.id, a.expeditionId);
  assert.equal((await store.listExpeditionAssignments(cls.id)).length, 0);
  // The migration creates both tables, behind the service role only.
  const sql = src("supabase/migrations/202610310001_expeditions.sql");
  assert.match(sql, /create table if not exists public\.expedition_results/); assert.match(sql, /unique \(student_id, expedition_id, attempt_id\)/); assert.match(sql, /revoke all on public\.expedition_results, public\.expedition_assignments from anon, authenticated/);
});

test("the host board hides Squads joined during Proof Race unless squads are on", () => {
  assert.match(src("app/live/host-screen.tsx"), /\{!\(isRace\(round\)&&!round\.squadsOn\)&&<Counter label="Squads joined"/);
});
