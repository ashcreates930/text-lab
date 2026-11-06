// Test helper: the right answer (with its proof) for a question in any format (lib/formats.ts), for the tests that play
// expeditions through.
import type { ExpQuestion } from "../lib/world-schema.ts";
import { chunkTokens, phraseRange, type Answer, type RaceChunk } from "../lib/expedition.ts";
import { formatOf } from "../lib/formats.ts";

const best = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => x.best);
export function rightAnswerFor(q: ExpQuestion, rc: RaceChunk): Answer {
  const tokens = chunkTokens(rc.lines), f = formatOf(q);
  if (f === "dnd") return { placed: Object.fromEntries((q.dnd?.items ?? []).map((i) => [i.id, i.slot])) };
  if (f === "multi") return { picks: (q.choices ?? []).map((c, i) => (c.best ? i : -1)).filter((i) => i >= 0) };
  if (f === "written") return { text: q.written!.model, judged: "Strong", lines: q.proof?.lines?.slice(0, 1) ?? [] };
  if (q.type === "make_call") return { theory: q.theories![1].id, lines: q.theories![1].lines.slice(0, 2) };
  if (q.type === "figure_it_out") return { choice: best(q.choices), choice2: best(q.choices2!.options) };
  // Text evidence is a whole sentence: a word proof is the sentence that holds the word.
  if (q.proof?.words?.length) { const r = phraseRange(tokens, q.proof.words[0])!; return { choice: best(q.choices), lines: [rc.lines[tokens[r[0]].line].text] }; }
  return { ...(q.choices ? { choice: best(q.choices) } : {}), lines: [q.proof!.lines![0]] };
}
// A wrong answer: a wrong choice and the first sentence, or pieces all in the first slot, or the wrong picks.
export function wrongAnswerFor(q: ExpQuestion, rc: RaceChunk): Answer {
  const f = formatOf(q), wrong = (o?: { best?: boolean }[]) => (o ?? []).findIndex((x) => !x.best);
  if (f === "dnd") { const first = q.dnd!.slots[0].id; return { placed: Object.fromEntries(q.dnd!.items.map((i) => [i.id, i.slot === first ? q.dnd!.slots[1].id : first])) }; }
  if (f === "multi") return { picks: (q.choices ?? []).map((c, i) => (c.best ? -1 : i)).filter((i) => i >= 0) };
  if (f === "written") return { text: "I do not know.", judged: "Needs more evidence", lines: [rc.lines[0].text] };
  return { choice: wrong(q.choices), lines: [rc.lines[0].text] };
}
