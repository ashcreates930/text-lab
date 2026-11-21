// The mission briefing's own palette (approved 2026-11-21, app/globals.css .ms): near-black, electric teal and a warning
// red, with plain light text. No glow ever sits on story text; the tests check every pair it uses.
export const MISSION = { bg: "#06080b", panel: "#0c1217", panel2: "#111a20", line: "#1d2b33", teal: "#1df2c4", tealDim: "#0f8c73", red: "#ff4258", ink: "#e9f2ef", muted: "#a3b6b1", onTeal: "#03231b" } as const;
// The pairs the briefing uses: [text, background].
export const MISSION_PAIRS: [keyof typeof MISSION, keyof typeof MISSION][] = [
  ["ink", "bg"], ["ink", "panel"], ["ink", "panel2"], ["muted", "panel"], ["muted", "bg"],
  ["teal", "panel"], ["teal", "bg"], ["red", "panel"], ["red", "bg"], ["onTeal", "teal"],
];
