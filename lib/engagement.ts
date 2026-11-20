// Engagement (classroom testing, 2026-11-19): reading is the gameplay. Pure rules shared by the solo room, the live
// phones, the teacher view and the validator.
//  - After a miss the answer is never shown at once: first a pointer into the text, then the paragraph lit, and only
//    after that the line outlined (so a struggling reader is never stranded). Only the first try scores.
//  - A lantern that first-try proofs brighten and misses dim (atmosphere only; it never blocks anything).
//  - A chance chest after a first-try proof (never after a miss): bonus coins or a piece for the student's kit.
//  - Depth of Knowledge for every question, the story's essential question, plain words and vocabulary.
import type { ExpQuestion, WorldPack } from "./world-schema";
import type { SourcePassage } from "./source-passages";
import { lockKind } from "./escape-room.ts";
import { lineAt, roomOf } from "./escape-room.ts";

// Depth of Knowledge: lib/dok.ts (kept apart so case notes can use it without the room rules).
export {DOK_BY_TYPE,DOK_NAMES,dokOf,dokFromNote} from "./dok.ts";
import {dokOf} from "./dok.ts";

// ---------- After a miss: back into the text ----------
// level 0: a pointer to the paragraph by its topic; 1: that paragraph lit; 2: the proof line outlined (and, for a
// choice, the answer shown). Each wrong tap while opening the lock moves up one level.
export const HINT_STEPS = 3;
export function topicOf(world: Pick<WorldPack, "engagement">, pid: string | null | undefined) {
  return pid ? world.engagement?.passage_topics?.[pid] ?? null : null;
}
export function pointerText(world: Pick<WorldPack, "engagement">, pid: string | null | undefined, paraNumber: number | null) {
  const t = topicOf(world, pid);
  return t ? `It's in the paragraph about ${t}. Find the line.` : paraNumber ? `It's in paragraph ${paraNumber}. Find the line.` : "It's in this chunk. Read it again and find the line.";
}
export function hintStep(level: number): "pointer" | "paragraph" | "line" {
  return level <= 0 ? "pointer" : level === 1 ? "paragraph" : "line";
}

// ---------- The lantern ----------
// Starts at 3 of 5. A first-try proof brightens it a step, a miss dims it a step; it never goes out (min 1).
export const LANTERN_MAX = 5;
export function lanternLevel(results: (boolean | null | undefined)[], start = 3) {
  let n = start;
  for (const r of results) { if (r === true) n = Math.min(LANTERN_MAX, n + 1); else if (r === false) n = Math.max(1, n - 1); }
  return n;
}

// ---------- The chest ----------
// After a first-try proof only: about half the time a chest appears. It holds bonus coins, or (about one chest in
// four, while any are left) a piece for the student's kit. Seeded, so a replay can't reroll it.
export const KIT = [
  { id: "candle", name: "Tallow candle" }, { id: "horseshoe", name: "Lucky horseshoe" }, { id: "whistle", name: "Tin whistle" },
  { id: "almanac", name: "Farmer's almanac" }, { id: "watch", name: "Pocket watch" }, { id: "spectacles", name: "Wire spectacles" },
  { id: "inkpot", name: "Pewter inkpot" }, { id: "feather", name: "Goose-feather quill" },
] as const;
export type KitId = (typeof KIT)[number]["id"];
export type Chest = { coins: number; piece: null } | { coins: 0; piece: KitId };
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
export function chestFor(seed: string, provedFirstTry: boolean, owned: string[]): Chest | null {
  if (!provedFirstTry) return null;
  if (hash(`${seed}|chest`) >= 0.5) return null;
  const left = KIT.filter((k) => !owned.includes(k.id));
  if (left.length && hash(`${seed}|kind`) < 0.25) return { coins: 0, piece: left[Math.floor(hash(`${seed}|piece`) * left.length)].id };
  return { coins: 5 + Math.floor(hash(`${seed}|coins`) * 3) * 5, piece: null };
}

// ---------- Question before the reading ----------
// Locks that work as a hook (two-key, choose two, theme thread) show the question first, then the passage.
export function questionFirst(q: Pick<ExpQuestion, "type" | "format" | "choices2" | "theories" | "proof" | "clues">) {
  const k = lockKind(q);
  return k === "two_key" || k === "multi_dial" || q.type === "theme_thread";
}

// ---------- Validator ----------
const noted = (world: WorldPack) => new Set(world.storybook?.ai_exclude ?? []);
export function engagementProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [], at = world.id, skip = noted(world), e = world.engagement;
  for (const room of world.rooms ?? []) for (const v of room.vocab ?? []) {
    const line = lineAt(passages, v.line);
    if (!line) out.push(`${at}/${room.expedition} vocab "${v.word}": line ${v.line.p}:${v.line.s} not found`);
    else if (!new RegExp(`\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(line)) out.push(`${at}/${room.expedition} vocab "${v.word}" isn't in its line`);
    if (skip.has(v.line.p)) out.push(`${at}/${room.expedition} vocab "${v.word}" comes from a content-noted paragraph`);
  }
  if (e) {
    for (const p of Object.keys(e.passage_topics ?? {})) if (skip.has(p)) out.push(`${at}: a paragraph topic points into content-noted ${p}`);
    for (const p of Object.keys(e.plain_words ?? {})) if (skip.has(p)) out.push(`${at}: plain words for content-noted ${p}`);
    // Every paragraph that holds a proof has a topic, so the pointer after a miss names it.
    for (const exp of world.expeditions ?? []) for (const c of exp.chunks) for (const seg of c.segments) if (!skip.has(seg.p) && !e.passage_topics?.[seg.p]) { out.push(`${at}/${exp.id}: paragraph ${seg.p} has no topic`); break; }
  }
  out.push(...plainProblems(world, passages));
  // A room's briefing names only the story's own key concepts.
  for (const room of world.rooms ?? []) for (const c of room.briefing?.concepts ?? []) if (!e?.key_concepts.some((k) => k.name === c)) out.push(`${at}/${room.expedition} briefing: "${c}" isn't one of the story's key concepts`);
  // Each mission line counts its chamber's locks exactly (mission: chamber 1, mission2: chamber 2).
  for (const room of world.rooms ?? []) for (const [key, i] of [["mission", 0], ["mission2", 1]] as const) {
    const m = room.briefing?.[key]; if (!m) continue; const n = /open (\d+) locks?/.exec(m), c = roomOf(world, room.expedition)?.chambers[i];
    if (!n || !c || +n[1] !== c.to - c.from + 1) out.push(`${at}/${room.expedition} briefing ${key}: it must say "open ${c ? c.to - c.from + 1 : "?"} locks"`); }
  out.push(...briefingProblems(world, passages));
  // Every question has a DOK level.
  for (const exp of world.expeditions ?? []) for (const c of exp.chunks) for (const q of [c.question, ...(c.bank ?? [])]) if (!dokOf(q)) out.push(`${at}/${exp.id}/${c.id}: no DOK level`);
  return [...new Set(out)];
}

// The paragraph that holds the proof: its id, every sentence of it in the chunk (line indexes), and its number.
export function proofParagraph(lines: { pid: string }[], shownLines: number[]) {
  const pid = shownLines.length ? lines[shownLines[0]]?.pid ?? null : null;
  const paraLines = pid ? lines.flatMap((l, i) => (l.pid === pid ? [i] : [])) : [];
  return { pid, paraLines, paraNumber: pid ? Number(pid.slice(1)) : null };
}

// ---------- Plain words must not answer the questions ----------
// A plain version (a modern retelling of one paragraph) may help a student understand, never answer. For every
// question on a chunk that covers the paragraph (its bank and versions too):
//  - a tested word (the question's focus, e.g. "stripling", "listless") stays exactly as Irving wrote it, marked
//    [[like this]] so the screen can highlight it, and is never paraphrased;
//  - the plain version holds none of a correct answer's key words. Key words are the answer's content words (four
//    letters or more, compared by their first five letters), leaving out any that already appear in Irving's own
//    paragraph (the student sees those anyway). Any one is a giveaway. Irving's own words, quoted, are fine.
//  - for a written seal, the plain version doesn't hold a word from every one of its key-idea groups (that would be
//    a ready-made answer to copy), outside quoted Irving.
const STOP = new Set("about after again also because been before being both does doesn didn don't each even from have having here into isn't just like make makes many more most much only other over same seem seems should some such than that their them then there these they this those very were what when where which while will with would your".split(" "));
const stem = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "").slice(0, 5);
const contentStems = (t: string) => [...new Set(t.split(/[^A-Za-z']+/).filter((w) => w.length >= 4 && !STOP.has(w.toLowerCase())).map(stem).filter((s) => s.length >= 4))];
export const PLAIN_MARK = /\[\[([^\]]+)\]\]/g;
export function plainShown(text: string) { return text.replace(PLAIN_MARK, "$1"); }
export function plainProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [], plain = world.engagement?.plain_words ?? {};
  const paraText = (p: string) => (passages.find((x) => x.id === p)?.text ?? "").replace(/\s+/g, " ");
  for (const exp of world.expeditions ?? []) for (const c of exp.chunks) {
    const pids = [...new Set(c.segments.map((s) => s.p))].filter((p) => plain[p]);
    if (!pids.length) continue;
    const qs = [c.question, ...(c.bank ?? [])].flatMap((q) => [q, ...(q.versions ? [q.versions.easier, q.versions.harder].filter(Boolean) : [])]) as ExpQuestion[];
    for (const q of qs) for (const p of pids) {
      const original = paraText(p), text = plain[p], at = `${world.id}/${exp.id}/${c.id} plain ${p}`;
      // The tested word, exactly as Irving wrote it, marked.
      if (q.focus) {
        const m = original.match(new RegExp(`\\b${q.focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
        if (m) { const marked = [...text.matchAll(PLAIN_MARK)].map((x) => x[1]); if (!marked.includes(m[0])) out.push(`${at}: keep the tested word "${m[0]}" exactly as Irving wrote it, marked [[${m[0]}]]`); }
      }
      // No correct answer's key words.
      const own = new Set(contentStems(original)), mine = new Set(contentStems(plainShown(text).replace(/"[^"]*"/g, " ")));
      for (const ch of [...(q.choices ?? []), ...(q.choices2?.options ?? [])].filter((o) => o.best)) {
        const keys = contentStems(ch.text).filter((s) => !own.has(s) && (!q.focus || s !== stem(q.focus)));
        const hit = keys.filter((s) => mine.has(s));
        if (hit.length) out.push(`${at}: gives away the answer "${ch.text}" (${hit.join(", ")})`);
      }
      if (q.written) {
        const words = plainShown(text).replace(/"[^"]*"/g, " ").toLowerCase().split(/[^a-z]+/);
        const groups = q.written.key_ideas.map((g) => g.some((k) => words.some((w) => w.startsWith(k.toLowerCase()))));
        if (groups.length && groups.every(Boolean)) out.push(`${at}: holds a ready-made answer to the written seal (${q.prompt.slice(0, 50)}...)`);
      }
    }
  }
  return [...new Set(out)];
}

// ---------- Briefings must not answer the room's questions ----------
// The door's briefing (scenario and both mission lines) sets the scene, never answers, checked the way plain words are
// (plainProblems) against everything in its room:
//  - questions and answer choices (each chunk's question, bank and versions, the Gist check, choose two): the briefing
//    holds none of a correct answer's key words, leaving out words already in Irving's paragraphs for that chunk, the
//    tested word, and words the question or a wrong choice uses too (those can't point to the right one); a written
//    seal's key ideas are never all there;
//  - puzzles (words in a puzzle's own title and prompt are on screen anyway): no code-dial answer word; no key word of a painting's wrong detail (beyond Irving's lines and the right
//    details' own words); no scene object's subject word (the word its label is kept from sharing with its line);
//  - lines: no run of four words from any proof line, quick-recall answer or puzzle line (that would point at the key).
// Words too common in a scene-setting line to point at any one answer.
const FRAME = new Set(["every", "place", "story", "tale", "says", "stand", "knows", "towar", "happe", "becam", "door", "eyes"]);
const words = (t: string) => t.toLowerCase().replace(/[’]/g, "'").split(/[^a-z']+/).filter(Boolean);
const runs = (t: string, n = 4) => { const w = words(t); return new Set(w.slice(0, Math.max(0, w.length - n + 1)).map((_, i) => w.slice(i, i + n).join(" "))); };
export function briefingProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [];
  const paraText = (p: string) => (passages.find((x) => x.id === p)?.text ?? "").replace(/\s+/g, " ");
  for (const room of world.rooms ?? []) {
    const b = room.briefing; if (!b) continue;
    const exp = world.expeditions?.find((e) => e.id === room.expedition); if (!exp) continue;
    const text = [b.scenario, b.mission ?? "", b.mission2 ?? ""].join(" "), at = `${world.id}/${room.expedition} briefing`;
    const mine = new Set(contentStems(text.replace(/"[^"]*"/g, " ")).filter((s) => !FRAME.has(s))), myWords = new Set(words(text)), myRuns = runs(text);
    const quotes = (line: string, what: string) => { for (const r of runs(line)) if (myRuns.has(r)) { out.push(`${at}: quotes ${what} ("${r}")`); return; } };
    for (const c of exp.chunks) {
      const own = new Set(c.segments.flatMap((s) => contentStems(paraText(s.p))));
      const qs = [c.question, ...(c.bank ?? [])].flatMap((q) => [q, ...(q.versions ? [q.versions.easier, q.versions.harder].filter(Boolean) : [])]) as ExpQuestion[];
      type Opt = { text: string; best?: boolean };
      const sets: { prompt: string; focus?: string; options: Opt[] }[] = [...qs.flatMap((q) => [{ prompt: q.prompt, focus: q.focus, options: (q.choices ?? []) as Opt[] }, { prompt: `${q.prompt} ${q.choices2?.prompt ?? ""}`, focus: q.focus, options: (q.choices2?.options ?? []) as Opt[] }]),
        { prompt: "Which is the best summary?", options: (c.gist?.options ?? []) as Opt[] }];
      for (const set of sets) for (const ch of set.options.filter((o) => o.best)) {
        const shared = new Set([set.prompt, ...set.options.filter((o) => !o.best).map((o) => o.text)].flatMap(contentStems));
        const hit = contentStems(ch.text).filter((s) => !own.has(s) && !shared.has(s) && (!set.focus || s !== stem(set.focus)) && mine.has(s));
        if (hit.length) out.push(`${at}: gives away the answer "${ch.text}" (${hit.join(", ")})`);
      }
      for (const q of qs) {
        if (q.written) { const w = [...myWords]; const groups = q.written.key_ideas.map((g) => g.some((k) => w.some((x) => x.startsWith(k.toLowerCase())))); if (groups.length && groups.every(Boolean)) out.push(`${at}: holds a ready-made answer to the written seal (${q.prompt.slice(0, 50)}...)`); }
        for (const l of q.proof?.lines ?? []) quotes(l, `the proof for ${c.id}`);
      }
    }
    for (const l of exp.lightning ?? []) for (const a of l.answer) quotes(a, `the quick-recall answer "${l.question.slice(0, 40)}..."`);
    for (const pz of room.puzzles ?? []) {
      const line = (r: { p: string; s: number }) => lineAt(passages, r) ?? "", shown = `${pz.title} ${pz.prompt}`, shownStems = new Set(contentStems(shown)), shownWords = new Set(words(shown));
      if (pz.type === "code") for (const d of pz.dials) { if (myWords.has(d.word.toLowerCase()) && !shownWords.has(d.word.toLowerCase())) out.push(`${at}: holds the code-dial answer "${d.word}" (${pz.id})`); quotes(line(d.line), `a ${pz.id} dial line`); }
      if (pz.type === "painting") {
        const right = new Set(pz.details.filter((d) => !d.wrong).flatMap((d) => contentStems(d.label)));
        for (const d of pz.details) { for (const r of d.lines) quotes(line(r), `a ${pz.id} line`); if (!d.wrong) continue;
          const own = new Set(d.lines.flatMap((r) => contentStems(paraText(r.p))));
          const hit = contentStems(d.label).filter((s) => !own.has(s) && !right.has(s) && !shownStems.has(s) && mine.has(s));
          if (hit.length) out.push(`${at}: gives away the painting's mistake "${d.label}" (${hit.join(", ")})`); }
      }
      if (pz.type === "scene") for (const o of pz.objects) { quotes(line(o.line), `a ${pz.id} line`);
        const hit = (o.subject ?? []).map(stem).filter((s) => mine.has(s) || [...myWords].some((w) => stem(w) === s));
        if (hit.length) out.push(`${at}: names the scene object's subject (${o.label}: ${hit.join(", ")})`); }
    }
  }
  return [...new Set(out)];
}
