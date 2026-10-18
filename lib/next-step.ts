// The scene screen's "Next step" bar: one line of progress and one button that always points to the next thing to do.
// Open the next clue until every clue is proven, then complete the required frame, then go on (the next scene, the
// scene's choice) and, in the last scene, close the case.
export type StepClue = { id: string; name: string; done: boolean; locked: boolean };
export type NextAction =
  | { kind: "clue"; clueId: string; number: number; label: string }
  | { kind: "frame"; frameKey: string; label: string }
  | { kind: "choice"; label: string }
  | { kind: "next"; label: string }
  | { kind: "close"; label: string };

export function nextStep(s: { clues: StepClue[]; requiredFrame?: { key: string; saved: boolean }; last: boolean; hasChoice: boolean; choicePrompt?: string }) {
  const proven = s.clues.filter((c) => c.done).length;
  const frame = s.requiredFrame;
  const progress = `Clues ${proven} of ${s.clues.length}${frame ? ` · Frame ${frame.saved ? 1 : 0} of 1` : ""}`;
  const index = s.clues.findIndex((c) => !c.done && !c.locked);
  let action: NextAction;
  if (proven < s.clues.length) {
    // A locked clue opens after an earlier one; with every open clue proven, the first unproven one is next.
    const i = index >= 0 ? index : s.clues.findIndex((c) => !c.done);
    action = { kind: "clue", clueId: s.clues[i].id, number: i + 1, label: `Open Clue ${i + 1}: ${s.clues[i].name}` };
  } else if (frame && !frame.saved) action = { kind: "frame", frameKey: frame.key, label: "Complete your frame" };
  else if (s.last) action = { kind: "close", label: "Close the case" };
  else if (s.hasChoice) action = { kind: "choice", label: s.choicePrompt ?? "Choose where to go next" };
  else action = { kind: "next", label: "Next scene" };
  return { progress, action, solved: proven === s.clues.length && (!frame || frame.saved) };
}
