// Depth of Knowledge for every question (lib/engagement.ts): Webb's levels. 1 recall (find it in the text), 2 skills
// and concepts (meaning, craft, structure, summary), 3 strategic thinking (inference, weighing evidence, theme,
// catching a lie, making a call, a written claim). A question's own `dok` wins over its type.
import type { ExpQuestion } from "./world-schema.ts";
import { TYPE_INFO } from "./expedition.ts";
import { formatOf } from "./formats.ts";

export const DOK_BY_TYPE: Record<ExpQuestion["type"], 1 | 2 | 3> = {
  find_it: 1, word_detective: 2, shades: 2, figure_it_out: 2, character_clue: 2, whose_eyes: 2, story_structure: 2,
  gist: 2, between_lines: 3, weigh_evidence: 3, catch_lie: 3, theme_thread: 3, make_call: 3,
};
export const DOK_NAMES: Record<1 | 2 | 3 | 4, string> = { 1: "DOK 1 · Recall", 2: "DOK 2 · Skills and concepts", 3: "DOK 3 · Strategic thinking", 4: "DOK 4 · Extended thinking" };
export function dokOf(q: Pick<ExpQuestion, "type" | "format" | "dok"> & Partial<ExpQuestion>): 1 | 2 | 3 | 4 {
  if (q.dok) return q.dok as 1 | 2 | 3 | 4;
  if (formatOf(q as ExpQuestion) === "written") return 3;
  return DOK_BY_TYPE[q.type];
}

// An older case note (no dok saved): from its question type's name and format.
export function dokFromNote(n: { dok?: number; type: string; format?: string }): 1 | 2 | 3 | 4 | null {
  if (n.dok) return n.dok as 1 | 2 | 3 | 4;
  if (n.format === "written") return 3;
  const key = (Object.keys(TYPE_INFO) as ExpQuestion["type"][]).find((k) => TYPE_INFO[k].name === n.type);
  return key ? DOK_BY_TYPE[key] : null;
}
