// Escape rooms, phase 8: the investigator avatar and gear. Gear comes from proof only; every lock, puzzle and liar
// counts once; clues past tier 1 never count; the art waits for approval; the profile table is server-only.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { AVATARS, INVESTIGATOR_ART_APPROVED, avatarSrc, gearFrom, gearSrc, parseAvatar, proofsFrom } from "../lib/investigator.ts";

const note = (chunk: number, extra: Record<string, unknown> = {}) => ({ chunk, type: "x", question: "q", answer: "a", proof: "p", rightFirstTry: true, fixed: null, gistPick: null, gistRight: false, typedQuestion: null, unknownWords: [], correctProof: "p", standards: ["R.1.1"], note: "", ...extra });
const attempt = (expeditionId: string, notes: unknown[], more: Record<string, unknown> = {}) => ({ worldId: "sleepy-hollow", expeditionId, notes, puzzles: [], interview: null, ...more }) as never;

test("gear comes from proof only: each lock once, never with a tier 2 or 3 clue, never from a miss", () => {
  const p = proofsFrom([
    attempt("room-1", [note(1), note(2), note(3, { clue: 2 }), note(4, { rightFirstTry: false }), note(5, { format: "written" })]),
    attempt("room-1", [note(1), note(2)]), // a replay proves nothing new
    attempt("room-2", [note(1, { clue: 1 })], { puzzles: [{ id: "code", type: "code", firstTry: [true, true, true, true], points: 600 }, { id: "scene", type: "scene", firstTry: [true, false], points: 150 }], interview: { solved: true } }),
  ]);
  assert.deepEqual(p, { locks: 4, seals: 1, puzzles: 1, liars: 1 });
  const g = Object.fromEntries(gearFrom([attempt("room-1", [1, 2, 3, 4, 5].map((n) => note(n)))]).map((x) => [x.id, x]));
  assert.equal(g.lantern.earned, true); assert.equal(g.compass.earned, false); assert.deepEqual([g.compass.have, g.compass.need], [5, 15]);
  assert.equal(g.key.earned, false); assert.equal(g.magnifier.earned, false);
});

test("avatars: six original investigators; only a known one is saved; the art waits for approval", () => {
  assert.equal(AVATARS.length, 6); assert.deepEqual(parseAvatar({ id: "investigator-3" }), { id: "investigator-3" }); assert.equal(parseAvatar({ id: "someone" }), null);
  assert.equal(INVESTIGATOR_ART_APPROVED, false, "the teacher approves the art before it shows");
  assert.equal(avatarSrc("investigator-1"), null); assert.equal(gearSrc("lantern"), null);
  for (const a of AVATARS) assert.ok(existsSync(`public/investigator/avatars/${a.id}.webp`), a.id);
  for (const g of ["lantern", "quill", "magnifier", "key", "compass", "ledger"]) assert.ok(existsSync(`public/investigator/gear/${g}.png`), g);
});

test("the profile: server-only table (RLS on, no browser grants); the student API only sets the avatar; gear is worked out on the server", () => {
  const sql = readFileSync("supabase/migrations/202611150002_investigator_profiles.sql", "utf8");
  assert.match(sql, /create table if not exists public\.investigator_profiles/); assert.match(sql, /student_id uuid primary key references public\.students\(id\) on delete cascade/);
  assert.match(sql, /avatar jsonb/); assert.match(sql, /gear jsonb not null default '\[\]'::jsonb/);
  assert.match(sql, /enable row level security/); assert.match(sql, /revoke all on public\.investigator_profiles from anon, authenticated/); assert.doesNotMatch(sql, /create policy/);
  const api = readFileSync("app/api/student/investigator/route.ts", "utf8");
  assert.match(api, /gearFrom\(/); assert.match(api, /z\.object\(\{ avatar:/); assert.doesNotMatch(api, /gear: input/);
  assert.match(readFileSync("app/expedition-map.tsx", "utf8"), /<InvestigatorCard attempts=\{attempts\} auth=\{auth\}\/>/);
});
