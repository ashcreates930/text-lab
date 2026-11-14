// Phase 5: first-time players (lib/onboarding.ts): the practice round, one plain sentence at the top of every screen, and
// first-time hints with a "What do I do?" button.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DO_NOW, HINTS, hintsDone, markHintDone, markPracticeDone, practiceDone, practiceChunk } from "../lib/onboarding.ts";
import { WorldPackSchema } from "../lib/world-schema.ts";

const src = (f: string) => readFileSync(f, "utf8");
const fakeStore = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

test("the practice round: shown once, the first time a student plays, on an easy chunk from the story's own data", () => {
  const s = fakeStore();
  assert.equal(practiceDone(s), false); markPracticeDone(s); assert.equal(practiceDone(s), true, "never shown again");
  const race = src("app/expedition-race.tsx");
  assert.match(race, /useState<Beat>\(\(\)=>resumeBeat\?.*:!practiceDone\(\)\?"practice"/, "a first-time solo race opens with the practice round");
  assert.match(race, /markPracticeDone\(\)/);
  assert.match(src("app/live/player-screen.tsx"), /First time\? Try a 30-second practice while you wait/, "live: offered in the lobby");
  const p = src("app/practice-round.tsx");
  for (const t of ["Read this", "Tap the sentence", "Lock it in"]) assert.match(p, new RegExp(`Coach text="${t}"`), t);
  assert.match(p, /no points/i); assert.doesNotMatch(p, /sleepy|ichabod|trifles|tell-tale/i, "nothing story-specific");
  for (const id of ["sleepy-hollow", "tell-tale-heart", "trifles"]) {
    const w = WorldPackSchema.parse(JSON.parse(src(`worlds/${id}/world.json`)));
    if (!w.expeditions?.length) continue;
    const at = practiceChunk(w)!; assert.ok(at, id);
    const q = w.expeditions.find((e) => e.id === at.expeditionId)!.chunks[at.index].question;
    assert.equal(q.type, "find_it"); assert.ok(q.proof?.lines?.length, `${id}: an easy one-tap question with a proof sentence`);
  }
});

test("one plain sentence at the top of every screen saying exactly what to do now", () => {
  for (const [k, t] of Object.entries(DO_NOW)) {
    assert.ok(t.length > 10 && t.length < 110, k);
    assert.equal((t.match(/[.!?](\s|$)/g) ?? []).length, 1, `${k}: one sentence`);
    assert.doesNotMatch(t, /—/, `${k}: no em dashes`);
  }
  // The race's top bar and the phone's carry it for every race screen; the other screens show it first.
  assert.match(src("app/expedition-race.tsx"), /doNow=\{DO_NOW\[screenNow\]\}/); assert.match(src("app/live/race-live.tsx"), /doNow=\{DO_NOW\[phoneScreen\]\}/);
  for (const [f, k] of [["app/interview.tsx", "interview"], ["app/launch-screen.tsx", "home"], ["app/after-race.tsx", "refresher"], ["app/after-race.tsx", "notes"], ["app/skill-feedback.tsx", "skills"], ["app/skill-feedback.tsx", "myskills"], ["app/expedition-map.tsx", "map"], ["app/live/player-screen.tsx", "lobby"], ["app/practice-round.tsx", "practice"]])
    assert.ok(src(f).includes(`DO_NOW.${k}}`), `${f}: ${k}`);
  // Every beat of the solo race has a sentence.
  const beats = /type Beat=([^;]+);/.exec(src("app/expedition-race.tsx"))![1].match(/"([a-z]+)"/g)!.map((x) => x.slice(1, -1));
  for (const b of beats) if (b !== "question") assert.ok(b in DO_NOW, b);
});

test("first-time hints right where the student taps, gone once done right, and a What do I do? button", () => {
  const s = fakeStore();
  assert.equal(hintsDone(s).size, 0); markHintDone("proof", s); markHintDone("proof", s); markHintDone("lock", s);
  assert.deepEqual([...hintsDone(s)].sort(), ["lock", "proof"]);
  for (const t of Object.values(HINTS)) assert.doesNotMatch(t, /—/);
  const race = src("app/expedition-race.tsx");
  assert.match(race, /show=\(h:HintId\)=>!!help&&\(help\.again\|\|!done\.has\(h\)\)/, "a hint shows until done, or again on request");
  assert.match(race, /markHintDone\("lock"\);if\(res\.correct\)/, "marked done only when the student does it right");
  assert.match(race, /What do I do\?/); assert.match(race, /onHelp=\{\(\)=>setAgain\(true\)\}/);
  assert.match(src("app/live/race-live.tsx"), /help=\{\{again\}\}/, "phones get the same hints");
  assert.match(src("app/globals.css"), /@media \(prefers-reduced-motion:reduce\)\{\.coach-bob\{animation:none\}\}/);
});

test("every answer is submitted with Lock in, in the race and the Refresher alike (a tap only selects)", () => {
  const race = src("app/expedition-race.tsx"), live = src("app/live/race-live.tsx"), after = src("app/after-race.tsx");
  assert.ok(race.includes("onPick={i=>{setDraft(d=>({...d,choice:i}));if(twoStep)setStep(2)}}"), "a one-step choice only selects");
  assert.ok(race.includes(":step===1&&vq.choices&&f!==\"multi\"&&!twoStep?lockBtn(draft.choice!=null)"), "then Lock in");
  assert.ok(race.includes(":step===2&&vq.choices2?lockBtn(draft.choice2!=null)"), "the second choice too");
  assert.ok(race.includes("onPick={setGistPick}") && live.includes("onPick={setGistPick}"), "the Gist check selects, solo and live");
  assert.ok(race.includes("if(gistPick!==null&&gist===null)pickGist(gistPick)"), "a selection left when time runs out counts");
  assert.match(after, /lockBtn\(/, "the Refresher uses Lock in");
});

test("the host heads-up before a content note: a short line on the projected board, a teacher-only Preview, and a server-held pause before the passage", async () => {
  process.env.CLASSROOM_DEV_STORE = "memory";
  const { memoryLiveStore } = await import("../lib/live/store.ts"); const server = await import("../lib/live/server.ts");
  const store = memoryLiveStore({ sessions: [], squads: [], players: [], responses: [] });
  const s = await store.createSession({ code: "HLD001", teacherId: null, classId: null, demo: true, worldId: "sleepy-hollow", status: "lobby", paused: false, roundIndex: -1, rounds: [], roundStartedAt: null, hostHash: "x", expiresAt: new Date(Date.now() + 36e5).toISOString() });
  await server.join(store, s, { nickname: "Detective Owl", studentId: null });
  const host = async (a: Record<string, unknown>) => server.hostAct(store, (await server.loadState(store, s.id))!, a as never);
  const round = async () => ((await server.loadState(store, s.id))!.session.rounds.at(-1)) as { step: number; beat: string; holdBefore?: number | null };
  await host({ action: "round.start", type: "race", settings: { expeditionId: "the-invitation", questions: true } });
  for (let k = 0; k < 60 && !((await round()).step === 1 && (await round()).beat === "read"); k++) await host({ action: "race.next" });
  assert.equal((await round()).step, 1);
  assert.equal(await host({ action: "race.holdBefore", step: 2 }), null); assert.equal((await round()).holdBefore, 2);
  assert.match((await host({ action: "race.holdBefore", step: 1 })) ?? "", /still to come/, "only a chunk still to come");
  // Moving on stops at the hold: the game pauses on chunk 2's last screen instead of showing chunk 3.
  for (let k = 0; k < 20 && !(await server.loadState(store, s.id))!.session.paused; k++) await host({ action: "race.next" });
  const st = (await server.loadState(store, s.id))!;
  assert.equal(st.session.paused, true); assert.equal((await round()).step, 1, "chunk 3's passage is not shown"); assert.equal((await round()).holdBefore ?? null, null, "the hold is used up");
  // The teacher resumes and moves on: chunk 3 appears, with the students' full content note before the passage.
  await host({ action: "resume" }); await host({ action: "race.next" });
  assert.equal((await round()).step, 2);
  // The projected board shows only the short line; the full wording sits behind the teacher-only Preview, which closes.
  const ui = src("app/live/race-live.tsx");
  assert.ok(ui.includes("Heads-up: the next chunk has a content note.")); assert.doesNotMatch(ui, /Students will see:/);
  assert.match(ui, /aria-label="Content note preview \(teacher only\)"/); assert.match(ui, /setTimeout\(\(\)=>setPreview\(false\),PREVIEW_SECONDS\*1000\)/);
  assert.match(ui, /act\(\{action:"race\.holdBefore",step:step\+1\}\)/);
});
