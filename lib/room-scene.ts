// Explorable room scenes (docs/scene-plan.md): each chamber opens as a painted scene of its place in the story. Items
// sit where the story puts them, one per lock, in story order; the next one glows and the student taps it to open its
// reading and lock. Witnesses stand at their meeting point; puzzle locks and the doors are places in the scene. Hidden
// bonus items each ask one small reading task (tap the word that answers a question about the item's line) before they
// pay coins, and open only after the lock whose reading holds their line. Every item and bonus item is a literal thing
// in the story, never taken from a simile or metaphor. Pure rules shared by the solo room, the validator and tests.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { expeditionChunks, norm } from "./expedition.ts";
import { isComparison, lineAt, lineTokens, refKey, roomOf, type Room } from "./escape-room.ts";
import { sharedRoots } from "./fair-play.ts";

export type Scene = NonNullable<NonNullable<WorldPack["rooms"]>[number]["scenes"]>[number];
export type SceneItem = Scene["items"][number];
export type SceneBonus = Scene["bonus"][number];
export const BONUS_COINS = 5;

export const sceneOf = (world: WorldPack, expeditionId: string, chamber: number): Scene | null =>
  world.rooms?.find((r) => r.expedition === expeditionId)?.scenes?.find((s) => s.chamber === chamber) ?? null;
// The chamber a lock (0-based) belongs to: 1, or 2 past the inner door.
export const chamberOfLock = (room: Room, k: number) => (room.chambers.length > 1 && k > room.chambers[0].to ? 2 : 1);

// ---------- Literal, not figurative ----------
const bare = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// Is this occurrence of a word inside a comparison clause ("like ...", "as if ...", "as though ...") before the clause
// ends at a comma, semicolon, colon or full stop?
function inComparison(line: string, at: number) {
  const before = line.slice(0, at), cut = Math.max(before.lastIndexOf(","), before.lastIndexOf(";"), before.lastIndexOf(":"), before.lastIndexOf("."));
  return /\b(like|as if|as though)\b/i.test(before.slice(cut + 1));
}
// A subject is literal in its line when the line isn't itself a comparison and at least one occurrence of the subject
// sits outside any comparison clause and outside the chunk's figurative phrase (its discovery, when figurative).
export function literalIn(line: string, subject: string, figurative: string | null | string[] = null) {
  if (isComparison(line)) return false;
  const flat = line.replace(/\s+/g, " "), figs = (Array.isArray(figurative) ? figurative : figurative ? [figurative] : []).map((f) => ({ at: flat.toLowerCase().indexOf(f.toLowerCase()), len: f.length })).filter((f) => f.at >= 0);
  const re = new RegExp(`\\b${subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi");
  for (const m of flat.matchAll(re)) {
    const i = m.index ?? 0;
    if (inComparison(flat, i)) continue;
    if (figs.some((f) => i >= f.at && i < f.at + f.len)) continue;
    return true;
  }
  return false;
}

// ---------- Play state ----------
export type Opened = (k: number) => boolean;
// What glows next in a chamber: the next lock's witness (if due and not yet met), else the next lock's item, else a
// puzzle placed after an opened lock, else the door (the inner door's code lock, or the exit).
export type SceneNext = { kind: "witness"; index: number; lock: number } | { kind: "item"; lock: number } | { kind: "puzzle"; id: string } | { kind: "door" } | null;
// Bonus items open once the lock whose reading holds their line is open.
export function bonusOpen(world: WorldPack, passages: SourcePassage[], expeditionId: string, b: SceneBonus, opened: Opened) {
  const chunks = expeditionChunks(world, passages, expeditionId), k = chunks.findIndex((c) => c.lines.some((l) => l.pid === b.line.p && l.index === b.line.s));
  return k >= 0 && opened(k);
}
// Bonus task: the tapped word answers when it is the answer word (punctuation and case aside).
export const bonusRight = (b: Pick<SceneBonus, "word">, line: string, tapped: number | null | undefined) => {
  const t = lineTokens(line)[tapped ?? -1]; return !!t && bare(t.key) === bare(norm(b.word));
};

// ---------- The validator ----------
// Each chamber's scene: one item per lock in the chamber, in its own lock's reading, literal (never from a simile or
// metaphor), never from a content-noted paragraph; bonus items literal, from the chamber's reading, with a reading task
// whose answer word appears once in the line and whose question shares no word or root with it; witnesses met in this
// chamber; puzzle locks of this chamber; spots inside the picture; no em dashes.
export function sceneProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const out: string[] = [], noted = new Set(world.storybook?.ai_exclude ?? []);
  const names = new Set(world.characters.flatMap((c) => c.name.toLowerCase().split(/\s+/)));
  for (const r of world.rooms ?? []) for (const sc of r.scenes ?? []) {
    const room = roomOf(world, r.expedition), at = `${world.id}/${r.expedition} scene ${sc.chamber}`;
    if (!room) { out.push(`${at}: no room`); continue; }
    const span = room.chambers[sc.chamber - 1]; if (!span) { out.push(`${at}: the room has no chamber ${sc.chamber}`); continue; }
    const chunks = expeditionChunks(world, passages, r.expedition), exp = world.expeditions?.find((e) => e.id === r.expedition);
    const inChunk = (k: number, ref: { p: string; s: number }) => !!chunks[k]?.lines.some((l) => l.pid === ref.p && l.index === ref.s);
    const spot = (what: string, x: number, y: number) => { if (x < 0 || x > 100 || y < 0 || y > 100) out.push(`${at}: ${what} sits outside the picture`); };
    const literal = (what: string, ref: { p: string; s: number }, subject: string[], k: number) => {
      const line = lineAt(passages, ref);
      if (!line) { out.push(`${at}: ${what}'s line ${refKey(ref)} doesn't exist`); return null; }
      if (noted.has(ref.p)) out.push(`${at}: ${what}'s line ${refKey(ref)} is in a content-noted paragraph`);
      // The chunk's figurative discovery, and any metaphor the story's data lists for this sentence.
      const d = exp?.chunks[k]?.discovery, fig = [...(d?.kind === "figurative" ? [d.phrase] : []), ...(world.expedition_rules?.figurative ?? []).filter((f) => f.p === ref.p && f.s === ref.s).map((f) => f.phrase)];
      if (!subject.some((s) => line.toLowerCase().includes(s.toLowerCase()))) out.push(`${at}: ${what}'s subject (${subject.join(", ")}) isn't in its line`);
      else if (!subject.some((s) => literalIn(line, s, fig))) out.push(`${at}: ${what} comes from a simile or metaphor; a scene item must be a literal thing in the story`);
      return line;
    };
    // One item per lock in the chamber.
    const locks = sc.items.map((i) => i.lock - 1);
    for (let k = span.from; k <= span.to; k++) { const n = locks.filter((x) => x === k).length; if (n !== 1) out.push(`${at}: lock ${k + 1} needs exactly one item (has ${n})`); }
    for (const it of sc.items) {
      const k = it.lock - 1; spot(`item ${it.id}`, it.x, it.y);
      if (k < span.from || k > span.to) { out.push(`${at}: item ${it.id} is for lock ${it.lock}, outside chamber ${sc.chamber}`); continue; }
      // A plain marker paints nothing and rests on no line; every other item is a literal thing in its lock's reading.
      if (it.marker) { if (it.line || it.subject) out.push(`${at}: item ${it.id} is a plain marker, so it rests on no line or subject`); }
      else if (!it.line || !it.subject) out.push(`${at}: item ${it.id} needs its line and subject (or is a plain marker)`);
      else { if (!inChunk(k, it.line)) out.push(`${at}: item ${it.id}'s line ${refKey(it.line)} isn't in lock ${it.lock}'s reading`); literal(`item ${it.id}`, it.line, it.subject, k); }
      if ([it.label, it.alt].some((t) => /—/.test(t))) out.push(`${at}: item ${it.id}: no em dashes`);
    }
    for (const b of sc.bonus) {
      spot(`bonus ${b.id}`, b.x, b.y);
      const k = chunks.findIndex((c, i) => i >= span.from && i <= span.to && c.lines.some((l) => l.pid === b.line.p && l.index === b.line.s));
      if (k < 0) { out.push(`${at}: bonus ${b.id}'s line ${refKey(b.line)} isn't in this chamber's reading`); continue; }
      const line = literal(`bonus ${b.id}`, b.line, b.subject, k); if (!line) continue;
      const hits = lineTokens(line).filter((t) => bare(t.key) === bare(norm(b.word))).length;
      if (hits !== 1) out.push(`${at}: bonus ${b.id}'s answer word "${b.word}" must appear once in its line (found ${hits})`);
      const shared = sharedRoots(b.question, [line], names); if (shared.length) out.push(`${at}: bonus ${b.id}'s question repeats words from its line (${shared.join(", ")})`);
      if ([b.label, b.alt, b.question].some((t) => /—/.test(t))) out.push(`${at}: bonus ${b.id}: no em dashes`);
    }
    for (const w of sc.witnesses) {
      spot(`witness ${w.character}`, w.x, w.y);
      const iw = exp?.interview?.witnesses.find((x) => x.character === w.character);
      if (!iw?.at) out.push(`${at}: ${w.character} isn't a witness met in this room`);
      else if (iw.at - 1 < span.from || iw.at - 1 > span.to) out.push(`${at}: ${w.character} is met at lock ${iw.at}, not in chamber ${sc.chamber}`);
    }
    for (const p of sc.puzzles) {
      spot(`puzzle ${p.id}`, p.x, p.y);
      const rp = room.puzzles.find((x) => x.id === p.id);
      if (!rp) out.push(`${at}: puzzle ${p.id} isn't one of this room's puzzle locks`);
      else if (rp.chamber !== sc.chamber) out.push(`${at}: puzzle ${p.id} belongs to the other chamber`);
      else if (rp.innerDoor) out.push(`${at}: puzzle ${p.id} is the inner door's code lock; it opens at the door`);
    }
    spot("the door", sc.door.x, sc.door.y);
    // A code-dial answer never appears in the scene's words (labels, alt text, bonus questions and answers), so the
    // scene can't hand over the code lock before the student finds the word in the text.
    const dialWords = (r.puzzles ?? []).flatMap((p) => (p.type === "code" ? p.dials.map((d) => d.word.toLowerCase()) : []));
    const shownText = [sc.alt, sc.door.label, ...sc.items.flatMap((i) => [i.label, i.alt]), ...sc.bonus.flatMap((b) => [b.label, b.alt, b.question, b.word])];
    for (const t of shownText) for (const w of dialWords) if (t.toLowerCase().split(/[^a-z-]+/).includes(w)) out.push(`${at}: "${w}" is a code-dial answer; keep it out of the scene's labels, alt text and bonus items`);
    if ([sc.alt].some((t) => /—/.test(t))) out.push(`${at}: no em dashes`);
  }
  return out;
}

// ---------- Every room opens on a scene ----------
// A chamber without a painted scene still opens on its room (teacher decision, 2026-11-21): a plain scene with no
// picture, listing the chamber's spots in story order (named by each lock's paragraph topic), its puzzle locks and its
// door, so the student always sees the room first and taps the first spot. Witnesses never stand in a scene before
// they are met: one met at a lock steps in after the student taps that lock's spot, before its reading.
export function plainSceneOf(world: WorldPack, room: Room, chamber: 1 | 2): Scene {
  const exp = world.expeditions?.find((e) => e.id === room.expedition), topics = world.engagement?.passage_topics ?? {};
  const span = room.chambers[chamber - 1] ?? room.chambers[0];
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const items = [];
  for (let k = span.from; k <= span.to; k++) {
    const c = exp?.chunks[k], p = c?.segments[0]?.p ?? "", topic = topics[p];
    items.push({ id: `lock-${k + 1}`, lock: k + 1, label: topic ? cap(topic) : `Lock ${k + 1}`, alt: topic ? cap(topic) : `Lock ${k + 1}`, x: 0, y: 0, line: { p, s: c?.segments[0]?.from ?? 0 }, subject: ["lock"] });
  }
  const inner = room.puzzles.find((z) => z.innerDoor);
  const puzzles = room.puzzles.filter((z) => !z.innerDoor && z.chamber === chamber).map((z) => ({ id: z.id, x: 0, y: 0 }));
  const door = { label: chamber === 1 && room.chambers.length > 1 && inner ? (world.rooms?.find((r) => r.expedition === room.expedition)?.puzzles?.find((z) => z.id === inner.id)?.title ?? "The inner door") : "The exit door", x: 0, y: 0 };
  return { chamber, art: "", alt: "", items, bonus: [], witnesses: [], puzzles, door } as Scene;
}
// The chamber's scene: its painting where there is one, otherwise the plain scene.
export const roomSceneOf = (world: WorldPack, room: Room, chamber: 1 | 2): Scene => sceneOf(world, room.expedition, chamber) ?? plainSceneOf(world, room, chamber);
