// Escape rooms, phase 5: the room clock. Off by default. When a teacher turns it on it is generous (or extra generous),
// runs per chamber (one chamber per class period), and pauses whenever the student is reading, meeting a witness, at a
// door, a recap or a result. It only counts the time spent working a lock or a puzzle. Reaching zero ends nothing:
// the clock turns to overtime and the student keeps going, and nothing is scored on it.
// Pure rules shared by the solo room, the live board and phones, and the teacher's class settings.
export const ROOM_CLOCKS = ["off", "generous", "extra"] as const;
export type RoomClock = (typeof ROOM_CLOCKS)[number];
export const isRoomClock = (x: unknown): x is RoomClock => (ROOM_CLOCKS as readonly unknown[]).includes(x);
export const CLOCK_INFO: Record<RoomClock, { name: string; note: string }> = {
  off: { name: "Off", note: "No clock. Students work at their own pace (the default)." },
  generous: { name: "Generous", note: "A chamber clock with plenty of time. It pauses while students read and never ends the game." },
  extra: { name: "Extra time", note: "Half as much time again. For classes that need it, or students with extra time." },
};
// Time per lock and per puzzle lock while working (reading is never counted), before the setting's factor.
export const CLOCK_PER_LOCK_MS = 120_000, CLOCK_PER_PUZZLE_MS = 240_000;
const FACTOR: Record<RoomClock, number> = { off: 0, generous: 1, extra: 1.5 };
// The chamber's budget: its locks and puzzle locks, times the setting; 0 when the clock is off.
export const chamberBudgetMs = (locks: number, puzzles: number, clock: RoomClock) => Math.round((locks * CLOCK_PER_LOCK_MS + puzzles * CLOCK_PER_PUZZLE_MS) * FACTOR[clock]);
// The beats the clock runs on (solo and live names): working a lock, a puzzle, the gist, a quick latch, opening a
// missed lock, and naming the liar. Everything else (reading, witnesses, doors, recaps, results, boards) pauses it.
const RUNS = new Set(["gist", "process", "question", "race", "puzzle", "recover", "lightning", "liar"]);
export const clockRuns = (beat: string) => RUNS.has(beat);
export type ClockView = { leftMs: number; overtime: boolean; label: string; warn: "five" | "one" | "zero" | null };
const mmss = (ms: number) => { const s = Math.ceil(Math.abs(ms) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
export function clockView(budgetMs: number, usedMs: number): ClockView {
  const left = budgetMs - usedMs, overtime = left <= 0;
  return { leftMs: Math.max(0, left), overtime, label: overtime ? `Overtime ${mmss(left)}` : mmss(left), warn: overtime ? "zero" : left <= 60_000 ? "one" : left <= 300_000 ? "five" : null };
}
// How the escape moment describes the chamber's clock (never a penalty).
export const clockEnding = (budgetMs: number, usedMs: number) => (budgetMs <= 0 ? null : usedMs <= budgetMs ? `Escaped with ${mmss(budgetMs - usedMs)} to spare.` : "Escaped in overtime. The clock never stops a room.");
