// Feature flags. LEGACY_MODES: the student modes from before Proof Race became the only way to play (Story Mode, Rival,
// Squad case play, the clue board and case file, standalone Spot the Lie, the Final Verdict, missions, Your Turn and the
// storybook). Off by default: their code, data, tests and tables stay, but no student or teacher screen links to them.
// Set NEXT_PUBLIC_LEGACY_MODES=true to bring them back.
export const LEGACY_MODES = process.env.NEXT_PUBLIC_LEGACY_MODES === "true";
