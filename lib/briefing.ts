// The mission briefing at each room's door (teacher decision, 2026-11-21): the student taps to open the case file, the
// dossier opens (the case line and the big question), then "Your situation" and the mission checklist reveal one line at
// a time, under 45 seconds in all, with Skip briefing always on screen. It ends on the countdown ring and one large
// "Accept the mission" button. Narration is recorded audio only (a room's briefing.audio, one file per line); until it is
// recorded, the typed lines play over the sound bed with no voice. Reduced motion shows everything at once.
// Pure rules shared by the solo door, the live board, the phones and the tests.
import type { WorldPack } from "./world-schema.ts";
import type { Room } from "./escape-room.ts";

export type BriefingLine = { kind: "case" | "question" | "situation" | "check"; text: string; alarm?: boolean };
export const BRIEFING_MAX_MS = 45_000;
// The end of the sequence (the ring settles before the button), counted inside the 45 seconds.
export const RING_HOLD_MS = 1_200;

// "Your situation", one sentence per line.
export const sentences = (text: string) => (text.match(/[^.!?]+[.!?]+["”’]?/g) ?? [text]).map((s) => s.trim()).filter(Boolean);

// The checklist for this room: witnesses when it has them, proof for every lock, the liar at the exit, and the clock.
export function checklistFor(world: WorldPack, room: Room, timerMinutes: number): BriefingLine[] {
  const iv = world.expeditions?.find((e) => e.id === room.expedition)?.interview;
  const out: BriefingLine[] = [];
  if (iv?.witnesses.length) out.push({ kind: "check", text: "Find the witnesses. Each one steps in when you reach their spot." });
  out.push({ kind: "check", text: "Open each lock with a line from the story. Proof is the only key." });
  if (room.exit === "name_liar") out.push({ kind: "check", text: "Name the liar at the exit door, and prove it." });
  out.push(timerMinutes > 0
    ? { kind: "check", text: `Escape before time runs out: ${minutesText(timerMinutes)} for each chamber.`, alarm: true }
    : { kind: "check", text: "Escape the room. This class plays without the escape timer." });
  return out;
}
export const minutesText = (m: number) => `${Number.isInteger(m) ? m : m.toFixed(1)} minutes`;

// Every line of the sequence, in order: the dossier, the situation, the checklist.
export function briefingLines(world: WorldPack, room: Room, scenario: string, timerMinutes: number): BriefingLine[] {
  const dossier: BriefingLine[] = [];
  if (world.hook) dossier.push({ kind: "case", text: world.hook });
  if (world.engagement?.essential_question) dossier.push({ kind: "question", text: world.engagement.essential_question });
  return [...dossier, ...sentences(scenario).map((text) => ({ kind: "situation" as const, text })), ...checklistFor(world, room, timerMinutes)];
}

// How long each line stays before the next: enough to read it (about 15 characters a second), between 1.8 and 5
// seconds, all scaled down if needed so the whole briefing, with the ring's settle, stays under 45 seconds.
export function lineTimes(lines: BriefingLine[]): number[] {
  const raw = lines.map((l) => Math.min(5_000, Math.max(1_800, 700 + l.text.length * 65)));
  const total = raw.reduce((a, b) => a + b, 0), room = BRIEFING_MAX_MS - RING_HOLD_MS - 1_000;
  const k = total > room ? room / total : 1;
  return raw.map((ms) => Math.round(ms * k));
}
export const briefingMs = (lines: BriefingLine[]) => lineTimes(lines).reduce((a, b) => a + b, 0) + RING_HOLD_MS;

// The countdown ring: the chamber's time and lock count (the whole room in a live game that plays both chambers).
export function ringFor(room: Room, chamber: 0 | 1 | 2, budgetMs: number) {
  const span = chamber === 0 ? { from: room.chambers[0].from, to: room.chambers.at(-1)!.to } : room.chambers[chamber - 1] ?? room.chambers[0];
  const minutes = budgetMs > 0 ? budgetMs / 60_000 : 0;
  return { locks: span.to - span.from + 1, time: minutes > 0 ? clockText(budgetMs) : null, label: chamber === 0 ? "Whole room" : `Chamber ${chamber}` };
}
const clockText = (ms: number) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
