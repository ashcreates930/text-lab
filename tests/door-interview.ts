// The Interview at the door (worlds without witnesses in the room): the same live state with each room's one question
// and witness locks taken out, so the card vote and the door Interview stay covered now that Sleepy Hollow meets its
// witnesses inside the rooms.
export function doorMode<T extends { world: { expeditions?: { interview?: { question?: string; witnesses: { at?: number }[] } }[] } }>(st: T): T {
  for (const e of st.world.expeditions ?? []) if (e.interview) { delete e.interview.question; for (const w of e.interview.witnesses) delete w.at; }
  return st;
}
