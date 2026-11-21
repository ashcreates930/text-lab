// The digital mission briefing (approved 2026-11-21): tap to open the case file; the dossier, "Your situation" and the
// checklist reveal one line at a time in under 45 seconds, with Skip briefing (and Sound, when narrated) always on screen;
// it ends on the countdown ring and one "Accept the mission" button. No vocabulary in the briefing (it's "Words to know"
// in the Case File). Narration is recorded audio only, never the browser voice; "Captions only" is a class setting for
// solo play; in live games only the board narrates. Reduced motion shows everything at once. "Read passages aloud
// automatically" is a per-student teacher setting.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { WorldPackSchema, type WorldPack } from "../lib/world-schema.ts";
import { roomOf } from "../lib/escape-room.ts";
import { BRIEFING_MAX_MS, briefingLines, briefingMs, checklistFor, lineTimes, ringFor, sentences } from "../lib/briefing.ts";
import { MISSION, MISSION_PAIRS } from "../lib/mission-style.ts";
import { contrast } from "../lib/design-tokens.ts";

const src = (f: string) => readFileSync(f, "utf8");
const worlds = readdirSync("worlds").filter((d) => existsSync(`worlds/${d}/world.json`))
  .map((d) => WorldPackSchema.safeParse(JSON.parse(src(`worlds/${d}/world.json`)))).flatMap((r) => (r.success ? [r.data as WorldPack] : []));
const briefed = worlds.flatMap((w) => (w.rooms ?? []).filter((r) => r.briefing).map((r) => ({ w, r, room: roomOf(w, r.expedition)! })));
const sh = worlds.find((w) => w.id === "sleepy-hollow")!;

test("every briefed room in every world plays in under 45 seconds, timed or not, in order: dossier, situation, checklist", () => {
  assert.ok(briefed.filter((x) => x.w.id === "sleepy-hollow").length >= 14, "all 14 Sleepy Hollow rooms");
  for (const { w, r, room } of briefed) for (const minutes of [35, 0]) {
    assert.ok(room, `${w.id} ${r.expedition}`);
    const lines = briefingLines(w, room, r.briefing!.scenario, minutes);
    assert.ok(briefingMs(lines) < BRIEFING_MAX_MS, `${w.id} room ${room.number}: ${briefingMs(lines)} ms`);
    const kinds = lines.map((l) => l.kind), rank = { case: 0, question: 1, situation: 2, check: 3 } as const;
    assert.deepEqual([...kinds].sort((a, b) => rank[a] - rank[b]), kinds, "the order");
    assert.equal(lines.filter((l) => l.kind === "situation").map((l) => l.text).join(" "), sentences(r.briefing!.scenario).join(" "));
    for (const t of lineTimes(lines)) assert.ok(t >= 900, "every line stays long enough to see");
  }
});

test("the checklist: witnesses when the room has them, proof for every lock, the liar at the exit, the clock last", () => {
  for (const { w, room } of briefed.filter((x) => x.w.id === "sleepy-hollow")) {
    const c = checklistFor(w, room, 35), iv = w.expeditions!.find((e) => e.id === room.expedition)!.interview;
    assert.equal(c.some((l) => /witnesses/.test(l.text)), !!iv?.witnesses.length, `room ${room.number}`);
    assert.ok(c.some((l) => /Proof is the only key/.test(l.text)));
    assert.equal(c.some((l) => /Name the liar/.test(l.text)), room.exit === "name_liar");
    assert.deepEqual(c.at(-1), { kind: "check", text: "Escape before time runs out: 35 minutes for each chamber.", alarm: true });
    assert.equal(checklistFor(w, room, 0).at(-1)!.alarm, undefined, "no alarm without the timer");
  }
  const r1 = roomOf(sh, sh.expeditions![0].id)!;
  assert.deepEqual(ringFor(r1, 1, 35 * 60_000), { locks: r1.chambers[0].to - r1.chambers[0].from + 1, time: "35:00", label: "Chamber 1" });
  assert.equal(ringFor(r1, 0, 70 * 60_000).label, "Whole room"); assert.equal(ringFor(r1, 1, 0).time, null);
});

test("the briefing's palette meets contrast (4.5:1) for every pair it uses, and matches the stylesheet", () => {
  for (const [t, b] of MISSION_PAIRS) assert.ok(contrast(MISSION[t], MISSION[b]) >= 4.5, `${t} on ${b}: ${contrast(MISSION[t], MISSION[b]).toFixed(2)}`);
  const css = src("app/globals.css");
  const vars = { bg: "bg", panel: "panel", panel2: "panel2", line: "line", teal: "teal", tealDim: "teal-dim", red: "red", ink: "ink", muted: "muted", onTeal: "on-teal" } as const;
  for (const [k, v] of Object.entries(vars)) assert.ok(css.includes(`--ms-${v}:${MISSION[k as keyof typeof MISSION]}`), `--ms-${v}`);
  assert.doesNotMatch(src("app/mission-briefing.tsx"), /#[0-9a-fA-F]{3,6}\b/, "no hex colors in the component");
});

test("the sequence: tap to open, one line at a time, Skip and Sound always on screen, then the ring and one Accept button", () => {
  const mb = src("app/mission-briefing.tsx");
  assert.match(mb, /Tap to open the case file/);
  assert.match(mb, /\{phase!=="done"&&<div className="ms-bar">/, "the bar shows while closed and playing");
  assert.match(mb, /Skip briefing/); assert.match(mb, /\{narration==="on"&&<button[^>]*aria-pressed=\{muted\}/);
  assert.match(mb, /lines\.slice\(0,shown\)/); assert.match(mb, /aria-live="polite"/);
  assert.match(mb, /\{phase==="done"&&<>[\s\S]{0,120}\{frame\(true\)\}/, "the ring comes with the end screen");
  assert.equal((mb.match(/className="ms-accept"/g) ?? []).length, 1, "one Accept button");
  assert.match(mb, /window\.scrollTo\(\{top:0\}\);acceptRef\.current\?\.focus/);
  // Reduced motion and a student coming back mid-room see it all at once.
  assert.match(mb, /useEffect\(\(\)=>\{if\(reduced\(\)\)setPhase\("done"\)\},\[\]\)/); assert.match(mb, /resumed\|\|phone\?"done":"closed"/);
  assert.match(src("app/globals.css"), /html\[data-motion="reduced"\] \.ms-line-in/);
});

test("narration is recorded audio only, never the browser voice; captions only plays it silently", () => {
  const mb = src("app/mission-briefing.tsx");
  assert.doesNotMatch(mb, /speechSynthesis|SpeechSynthesisUtterance|useReadAloud/);
  assert.match(mb, /const voiced=narration==="on"&&!muted;/); assert.match(mb, /const src=voiced\?audio\[shown\]:undefined;/);
  assert.match(mb, /<Ambience on=\{phase==="playing"&&voiced\}\/>/, "the sound bed plays only when narrated");
  const race = src("app/expedition-race.tsx"), cas = src("app/case.tsx");
  assert.match(race, /narration=\{briefingNarration\}/);
  assert.match(cas, /setBriefingNarration\(j\?\.briefingNarration==="captions"\?"captions":"on"\)/);
  assert.match(cas, /briefingNarration=\{demo\.classAuth\?briefingNarration:"on"\}/);
  assert.match(src("app/api/student/class/route.ts"), /briefingNarration: cls\.briefing_narration \?\? "on"/);
  assert.match(src("app/classroom.tsx"), /\{c\.briefing_narration!==undefined&&<NarrationPanel/);
  assert.match(src("supabase/migrations/202611210001_briefing_narration.sql"), /briefing_narration text not null default 'on'/);
});

test("vocabulary is out of the briefing and in the Case File as Words to know", () => {
  assert.doesNotMatch(src("app/mission-briefing.tsx"), /DoorVocab|vocab/i);
  assert.match(src("app/room-ui.tsx"), /<DoorVocab vocab=\{words\} lineOf=\{lineOf\} title="Words to know"\/>/);
  assert.match(src("app/expedition-race.tsx"), /<CaseFileButton[^>]*words=/);
});

test("read passages aloud automatically: a per-student teacher setting; Read to me stays a button for everyone else", () => {
  const ra = src("app/read-aloud.tsx");
  assert.match(ra, /export const AutoRead=createContext\(false\)/);
  assert.match(src("app/case.tsx"), /autoRead=\{!!demo\.classAuth&&autoRead\}/);
  assert.match(src("app/classroom.tsx"), /\{data\.readAloud&&<StudentReadAloud/);
  assert.match(src("supabase/migrations/202611210001_briefing_narration.sql"), /read_aloud boolean not null default false/);
});
