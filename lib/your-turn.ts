// "Your Turn": a 5 to 7 minute personal activity after the game, picked from the student's "What's your angle?"
// answers, that sends them back into the text. Every activity is authored in world.json (your_turn.activities, one per
// angle option) and every scored answer is an authored line, checked like the off claims. Each one ends with 2 or 3
// sentences citing at least one exact line, saved for the teacher Evidence view. Rules shared by the screens
// (app/your-turn.tsx), the live server, the validator and the tests.
import type { WorldPack } from "./world-schema.ts";
import type { SourcePassage } from "./source-passages.ts";
import { evidenceSentences, lineWords } from "./lies.ts";
import { ANGLE_OPTIONS, ANGLE_STEPS, type Angle } from "./student-role.ts";
import { screenMessage } from "./safety.ts";
import { paragraphLabel } from "./clue-game.ts";

export type YourTurnActivity = NonNullable<WorldPack["your_turn"]>["activities"][string];
export type AcceptLine = { paragraph: string; line: string };
const same = (a: string, b: string) => lineWords(a) === lineWords(b);

// Every option of every angle question, in question order.
export const ANGLE_OPTION_IDS = ANGLE_STEPS.flatMap((k) => Object.keys(ANGLE_OPTIONS[k].options));
// The two activities that match a student's "Unlock your challenge" answers (what fires them up, then their lane). A
// student who skipped them gets the cold case file.
export function yourTurnChoices(world: WorldPack, angle: Angle | null | undefined): string[] {
  const all = world.your_turn?.activities ?? {};
  const picked = [angle?.firedUpBy, angle?.lane].filter((x): x is NonNullable<typeof x> => !!x && x in all);
  const choices = [...new Set(picked)].slice(0, 2);
  if (choices.length) return choices;
  return "solo" in all ? ["solo"] : Object.keys(all).slice(0, 1);
}

// Whether a tapped line answers: it must be one of the authored lines. A miss names a paragraph to look in.
export function checkAnswer(accept: AcceptLine[], line: string): { ok: true } | { ok: false; hint: string } {
  if (accept.some((a) => same(a.line, line))) return { ok: true };
  const where = [...new Set(accept.map((a) => paragraphLabel(a.paragraph)))].join(" or ");
  return { ok: false, hint: where ? `True to the story, maybe, but it doesn't answer that. Look again in ${where}.` : "The story doesn't support this one." };
}

// The closing writing: 2 or 3 sentences, at least one cited line that is an exact line of the story, and screened like
// character questions.
export function checkWriting(passages: SourcePassage[], text: string, cited: string[]): { ok: true; cited: string[] } | { ok: false; error: string } {
  const t = text.trim().replace(/\s+/g, " ");
  const sentences = t.match(/[^.!?]+[.!?]+["”’)]*/g)?.filter((s) => /[A-Za-z]/.test(s)) ?? [];
  const tail = t.replace(/[^.!?]+[.!?]+["”’)]*/g, "").trim();
  const count = sentences.length + (tail ? 1 : 0);
  if (count < 2 || count > 3) return { ok: false, error: "Write 2 or 3 sentences." };
  if (t.length > 900) return { ok: false, error: "Keep it to 2 or 3 sentences." };
  const lines = passages.flatMap((p) => evidenceSentences(p.text));
  const real = cited.map((c) => lines.find((l) => same(l, c))).filter((x): x is string => !!x);
  if (!real.length) return { ok: false, error: "Cite at least one line from the story: tap it in the passage." };
  const safety = screenMessage(t);
  if (safety.action !== "allow") return { ok: false, error: safety.message ?? "Try different words." };
  return { ok: true, cited: [...new Set(real)].slice(0, 5) };
}

// What gets saved with progress and shown in the Evidence view.
export type YourTurnEntry = { activity: string; title: string; results: { label: string; line: string; ok: boolean }[]; writing: string; cited: string[]; at: string };

// ---------- validate:worlds ----------
export function yourTurnProblems(world: WorldPack, passages: SourcePassage[]): string[] {
  const acts = world.your_turn?.activities;
  if (!acts) return [];
  const problems: string[] = [];
  const byId = new Map(passages.map((p) => [p.id, p]));
  const exact = (a: AcceptLine) => { const p = byId.get(a.paragraph); return !!p && evidenceSentences(p.text).includes(a.line); };
  const speaking = new Set(world.characters.map((c) => c.id));
  const theories = new Set(world.verdict?.theories.map((t) => t.id) ?? []);
  const dash = /—/;
  for (const [id, a] of Object.entries(acts)) {
    const where = `${world.id}/your_turn/${id}`;
    if (!ANGLE_OPTION_IDS.includes(id)) problems.push(`${where}: not a "What's your angle?" option`);
    if (a.minutes < 5 || a.minutes > 7) problems.push(`${where}: activities run 5 to 7 minutes`);
    for (const pid of a.paragraphs) if (!byId.has(pid)) problems.push(`${where}: ${pid} is not a paragraph`);
    const texts = [a.title, a.intro, a.write, ...(a.exchanges ?? []).map((e) => e.say), ...Object.values(a.sides ?? {}).flatMap((s) => s.exchanges.map((e) => e.say)), ...(a.items ?? []).map((i) => i.label), ...(a.posts ?? []).map((p) => p.text)];
    if (texts.some((t) => dash.test(t))) problems.push(`${where}: no em dashes`);
    const lines: AcceptLine[] = [...(a.exchanges ?? []).flatMap((e) => e.accept), ...Object.values(a.sides ?? {}).flatMap((s) => s.exchanges.flatMap((e) => e.accept)), ...(a.items ?? []).flatMap((i) => i.accept), ...(a.posts ?? []).flatMap((p) => p.accept ?? [])];
    for (const l of lines) {
      if (!exact(l)) problems.push(`${where}: a line is not copied exactly from ${l.paragraph}`);
      else if (!a.paragraphs.includes(l.paragraph)) problems.push(`${where}: ${l.paragraph} isn't in the activity's reading`);
    }
    if (a.kind === "talk" || a.kind === "debate") {
      const ex = a.kind === "talk" ? [{ character_id: a.character_id ?? null, exchanges: a.exchanges ?? [] }] : Object.values(a.sides ?? {});
      for (const s of ex) {
        if (s.character_id && !speaking.has(s.character_id)) problems.push(`${where}: ${s.character_id} is not a speaking character`);
        if (s.exchanges.length < 3 || s.exchanges.length > 6) problems.push(`${where}: about 5 exchanges (3 to 6 authored claims)`);
        if (s.exchanges.some((e) => !e.accept.length)) problems.push(`${where}: every claim needs at least one line that answers it`);
      }
      if (a.kind === "debate") for (const k of Object.keys(a.sides ?? {})) if (!theories.has(k)) problems.push(`${where}: side ${k} is not a Final Verdict theory`);
    }
    if (a.kind === "pick" || a.kind === "order") {
      const real = (a.items ?? []).filter((i) => i.accept.length).length;
      if (real < (a.need ?? (a.items ?? []).length)) problems.push(`${where}: not enough pieces the story supports`);
      if (a.kind === "order" && (a.items ?? []).some((i) => !i.accept.length)) problems.push(`${where}: every moment needs a line`);
    }
    if (a.kind === "factcheck") {
      const f = (a.posts ?? []).filter((p) => p.false);
      if (f.length !== 1 || !f[0].accept?.length) problems.push(`${where}: exactly one false post, with the line that disproves it`);
    }
  }
  return problems;
}
