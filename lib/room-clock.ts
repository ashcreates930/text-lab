// The escape timer (teacher decision, 2026-11-20, replacing the generous overtime-only room clock): on by default,
// 35 minutes per chamber, stretched by the class's "More time" question setting and each student's own time setting.
// It starts when the student taps "Start the clock" at the briefing and runs through everything in the chamber,
// reading included, until its door. The teacher can pause it (class play and live); in live play the teacher can also
// add 5 minutes. If it runs out the chamber isn't escaped in time: a short story moment, no "Escaped in time" badge and
// no escape bonus, but the student finishes the locks and keeps all their work and first-try results; a replay can
// escape in time later. Pure rules shared by the solo room, the live board and phones, and the teacher's views.
import { timeScale } from "./expedition.ts";

// "escape": the 35-minute timer (the default). "off": the teacher turned it off. Older saved values ("generous",
// "extra", from the first room clock) read as the timer.
export const ROOM_CLOCKS = ["escape", "off"] as const;
export type RoomClock = (typeof ROOM_CLOCKS)[number];
export const isRoomClock = (x: unknown): x is RoomClock => (ROOM_CLOCKS as readonly unknown[]).includes(x);
export const roomClockOf = (x: unknown): RoomClock => (x === "off" ? "off" : "escape");
export const CLOCK_INFO: Record<RoomClock, { name: string; note: string }> = {
  escape: { name: "Escape timer", note: "35 minutes per chamber (more with More time or a student's own extra time). If it runs out, the chamber isn't escaped in time, but students finish and keep all their work." },
  off: { name: "Off", note: "No timer. Students work at their own pace and every chamber counts as escaped." },
};
export const ESCAPE_MS = 35 * 60_000, ADD_MS = 5 * 60_000, ESCAPE_BONUS = 500;
// The chamber's time: 35 minutes, times 1.5 for the class's More time, times the student's own time setting.
export function escapeBudgetMs(clock: RoomClock, questionTime: string | null | undefined = "standard", timeSetting: string | null | undefined = "1") {
  if (clock === "off") return 0;
  return Math.round(ESCAPE_MS * (questionTime === "more" ? 1.5 : 1) * timeScale(timeSetting));
}
// The clock runs on every beat inside a chamber, reading included; it stops outside one (the briefing at the door,
// the inner door and the recap between chambers, the escape and everything after it).
const OUTSIDE = new Set(["practice", "door", "inner", "recap", "escape", "finish", "refresher", "skills", "notes", "essential", "verdict", "lobby", "brief"]);
export const clockRuns = (beat: string) => !OUTSIDE.has(beat);
export type ClockView = { leftMs: number; overtime: boolean; label: string; warn: "five" | "one" | "zero" | null };
export const mmss = (ms: number) => { const s = Math.ceil(Math.abs(ms) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
export function clockView(budgetMs: number, usedMs: number): ClockView {
  const left = budgetMs - usedMs, overtime = left <= 0;
  return { leftMs: Math.max(0, left), overtime, label: overtime ? "Time's up" : mmss(left), warn: overtime ? "zero" : left <= 60_000 ? "one" : left <= 300_000 ? "five" : null };
}
export const timeUp = (budgetMs: number, usedMs: number) => budgetMs > 0 && usedMs >= budgetMs;
// A chamber's result: escaped in time (true), after time ran out (false), or no timer (null).
export const inTime = (budgetMs: number, usedMs: number): boolean | null => (budgetMs <= 0 ? null : usedMs < budgetMs);
// What the inner door and the escape say about the timer.
export function clockEnding(budgetMs: number, usedMs: number) {
  if (budgetMs <= 0) return null;
  return usedMs < budgetMs ? `Escaped in time, with ${mmss(budgetMs - usedMs)} to spare. +${ESCAPE_BONUS} escape bonus.`
    : "Time ran out, so this chamber isn't escaped in time. Every lock you opened and every first-try proof still counts. Replay it to escape in time.";
}
