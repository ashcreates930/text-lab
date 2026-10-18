// The Teacher Evidence View: for every student in a class, which clues they proved, the line from the story they chose,
// their explanation, and whether that line proved a character wrong. Built from each student's saved progress
// (students.progress) and the class story's world pack. Shared by the teacher API, the sample classroom, and tests.
import type { WorldPack } from "../world-schema.ts";

// What a saved answer looks like in students.progress.artifactAnswers (only the fields this view reads).
export type SavedAnswer = { notice?: string; interpret?: string; craft?: string; character?: string };
// A saved storyboard frame in students.progress.storyFrames, keyed "<world>:<page>" (only the fields this view reads).
export type SavedFrameInput = { description?: string; quote?: string; image?: string };
// Spot the Lie results (scene id -> result) and the Final Verdict, as saved in students.progress (fields this view reads).
export type SavedLieInput = { clue_id?: string; caught?: boolean };
export type SavedVerdictInput = { world_id?: string; theory_id?: string; pinned?: { clue_id: string; quote: string }[]; argument?: string; feedback?: { strength?: string } | null };
export type EvidenceStudentInput = { id: string; nickname: string; answers: Record<string, SavedAnswer> | null; frames?: Record<string, SavedFrameInput> | null; lies?: Record<string, SavedLieInput> | null; verdict?: SavedVerdictInput | null };
// The Final Verdict for one student: their theory, the judge's case strength (null when saved without feedback), the three
// pinned quotes and their closing argument.
export type EvidenceVerdict = { theory: string; strength: string | null; pinned: { clue: string; quote: string }[]; argument: string };
// A completed storyboard frame, in story order. picture: the student's own, or for an add-detail frame saved without
// one, the story's picture they added a detail to.
export type StoryboardFrame = { pageId: string; picture?: string; quote: string; description: string };

// "proved-wrong": the student questioned a character and chose a line that contradicts them.
// "backed-up": the line supported what the character said. null: no character was questioned for this clue.
export type Finding = "proved-wrong" | "backed-up" | null;
// character: the name of the character the student questioned, when the save recorded it.
export type EvidenceCell = { proven: boolean; quote: string; explanation: string; finding: Finding; character?: string };
export type EvidenceClue = { id: string; name: string; sceneId: string };
// lie: the scene's Spot the Lie clue and the character who testified, when the scene has one.
export type EvidenceScene = { id: string; title: string; characters: string[]; clues: EvidenceClue[]; lie?: { clueId: string; character: string } };
export type EvidenceStudent = { id: string; nickname: string; started: boolean; proven: number; provedWrong: number; needsHelp: boolean; cells: Record<string, EvidenceCell>; storyboard: StoryboardFrame[]; liesCaught: Record<string, boolean>; verdict: EvidenceVerdict | null };
export type ClassEvidence = {
  story: { id: string; title: string };
  scenes: EvidenceScene[];
  students: EvidenceStudent[];
  // The story's verdict question and the standards it is aligned to, when the story has a Final Verdict.
  verdict?: { question: string; standards: string[] };
  summary: { joined: number; totalClues: number; averageProven: number; provedWrongStudents: number; needsHelp: number; anyProven: boolean };
};

// Same rule as isDone in app/clue-steps.ts: proven when both the quoted line and the explanation have text.
export const isProven = (a: SavedAnswer | undefined) => !!(a?.notice?.trim() && a?.interpret?.trim());
export const findingOf = (a: SavedAnswer | undefined): Finding => (a?.craft === "contradicts" ? "proved-wrong" : a?.craft === "supports" ? "backed-up" : null);

// Scenes have ids, not titles: "the-road-home" becomes "Scene 3 · The road home".
// A word keeps a capital when the story's own scene and clue text spells it that way ("Van Tassel party").
const SMALL = new Set(["a", "an", "and", "the", "of", "in", "on", "at", "to", "for", "with"]);
export function sceneTitle(id: string, index: number, reference = "") {
  const proper = new Set(reference.match(/\b[A-Z][a-z]+\b/g) ?? []);
  const possessive = new Set((reference.match(/\b[a-z]+[’']s\b/gi) ?? []).map((w) => w.toLowerCase()));
  const words = id.split("-").map((w, i) => {
    const stem = w.endsWith("s") ? w.slice(0, -1) : "";
    const word = stem && possessive.has(`${stem}’s`) ? `${stem}’s` : stem && possessive.has(`${stem}'s`) ? `${stem}’s` : w;
    const cap = word.charAt(0).toUpperCase() + word.slice(1);
    return i === 0 || (proper.has(cap) && !SMALL.has(w)) ? cap : word;
  });
  return `Scene ${index + 1} · ${words.join(" ")}`;
}

// The Final Verdict's standards: Florida B.E.S.T. ELA.K12.EE.1.1 and the grade's argumentative writing benchmark (C.1.4).
export function verdictStandards(grade?: number) {
  return ["Florida B.E.S.T. ELA.K12.EE.1.1: cite evidence to explain and justify reasoning", `Florida B.E.S.T. ELA.${grade ?? "(grade)"}.C.1.4: argumentative writing`];
}

export function buildEvidence(world: WorldPack, students: EvidenceStudentInput[], grade?: number): ClassEvidence {
  const names = new Map(world.characters.map((c) => [c.id, c.name]));
  const reference = JSON.stringify([world.scenes, world.characters.map((c) => c.name)]);
  const scenes: EvidenceScene[] = world.scenes.filter((s) => s.artifacts.length).map((s, i) => ({
    id: s.id, title: sceneTitle(s.id, i, reference),
    characters: s.available_characters.map((id) => names.get(id)).filter((n): n is string => !!n),
    clues: s.artifacts.map((a) => ({ id: a.id, name: a.name, sceneId: s.id })),
    ...(s.lie ? { lie: { clueId: s.lie.clue_id, character: names.get(s.lie.character_id) ?? s.lie.character_id } } : {}),
  }));
  const clueNames = new Map(world.scenes.flatMap((s) => s.artifacts).map((a) => [a.id, a.name]));
  const clues = scenes.flatMap((s) => s.clues);
  const rows: EvidenceStudent[] = students.map((s) => {
    const cells: Record<string, EvidenceCell> = {};
    for (const c of clues) {
      const a = s.answers?.[c.id], proven = isProven(a);
      const character = proven && a?.character ? names.get(a.character) : undefined;
      cells[c.id] = { proven, quote: proven ? a!.notice!.trim() : "", explanation: proven ? a!.interpret!.trim() : "", finding: proven ? findingOf(a) : null, ...(character ? { character } : {}) };
    }
    const proven = clues.filter((c) => cells[c.id].proven).length;
    const provedWrong = clues.filter((c) => cells[c.id].finding === "proved-wrong").length;
    // Needs help: the student has saved progress for this story but has not proven a single clue.
    const started = s.answers !== null;
    const storyboard = (world.storybook?.pages ?? []).flatMap((p): StoryboardFrame[] => {
      const f = s.frames?.[`${world.id}:${p.id}`];
      if (!f?.description?.trim()) return [];
      const picture = f.image ?? (p.mode === "add_detail" && p.illustration?.status === "generated" ? p.illustration.src : undefined);
      return [{ pageId: p.id, quote: (f.quote ?? "").trim(), description: f.description.trim(), ...(picture ? { picture } : {}) }];
    });
    const liesCaught = Object.fromEntries(scenes.filter((sc) => sc.lie).map((sc) => [sc.id, !!s.lies?.[sc.id]?.caught]));
    const v = s.verdict && s.verdict.world_id === world.id ? s.verdict : null;
    const theory = v && world.verdict?.theories.find((t) => t.id === v.theory_id);
    const verdict: EvidenceVerdict | null = v && theory ? { theory: theory.name, strength: v.feedback?.strength ?? null, pinned: (v.pinned ?? []).map((p) => ({ clue: clueNames.get(p.clue_id) ?? "Evidence", quote: p.quote })), argument: v.argument ?? "" } : null;
    return { id: s.id, nickname: s.nickname, started, proven, provedWrong, needsHelp: started && proven === 0, cells, storyboard, liesCaught, verdict };
  });
  const joined = rows.length;
  return {
    story: { id: world.id, title: world.title },
    scenes,
    ...(world.verdict ? { verdict: { question: world.verdict.question, standards: verdictStandards(grade) } } : {}),
    students: rows,
    summary: {
      joined, totalClues: clues.length,
      averageProven: joined ? Math.round((rows.reduce((n, r) => n + r.proven, 0) / joined) * 10) / 10 : 0,
      provedWrongStudents: rows.filter((r) => r.provedWrong > 0).length,
      needsHelp: rows.filter((r) => r.needsHelp).length,
      anyProven: rows.some((r) => r.proven > 0),
    },
  };
}

// The plain-language line under a quote: "This line proved Hans Van Ripper wrong." Uses the character saved with the
// answer; older saves without one fall back to the scene's only character, or "the character they questioned".
export function findingSentence(finding: Finding, scene: EvidenceScene | undefined, character?: string) {
  if (!finding) return "The student did not question a character for this clue.";
  const who = character ?? (scene?.characters.length === 1 ? scene.characters[0] : "the character they questioned");
  return finding === "proved-wrong" ? `This line proved ${who} wrong.` : `This line backed up what ${who} said.`;
}

// What the detail panel shows for one student and clue.
export function evidenceDetail(e: ClassEvidence, studentId: string, clueId: string) {
  const student = e.students.find((s) => s.id === studentId), clue = e.scenes.flatMap((s) => s.clues).find((c) => c.id === clueId);
  if (!student || !clue) return null;
  const cell = student.cells[clue.id], scene = e.scenes.find((s) => s.id === clue.sceneId);
  return { title: `${student.nickname} · ${clue.name}`, sceneTitle: scene?.title ?? "", proven: cell.proven, quote: cell.quote, explanation: cell.explanation, finding: cell.finding, findingLine: cell.proven ? findingSentence(cell.finding, scene, cell.character) : "", notProvenLine: `${student.nickname} has not proven this clue yet.` };
}

// Spreadsheet export: one row per student and clue.
export function evidenceCsv(e: ClassEvidence) {
  const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [["Student", "Scene", "Clue", "Proven", "Line from the story", "Student explanation", "Character check", "Lie caught"].join(",")];
  for (const s of e.students) {
   for (const sc of e.scenes) for (const c of sc.clues) {
    const x = s.cells[c.id];
    const lie = sc.lie?.clueId === c.id ? (s.liesCaught[sc.id] ? "Yes" : "No") : "";
    lines.push([s.nickname, sc.title, c.name, x.proven ? "Yes" : "No", x.quote, x.explanation, x.proven ? (x.finding === "proved-wrong" ? `Proved ${x.character ?? "the character"} wrong` : x.finding === "backed-up" ? `Backed up ${x.character ?? "the character"}` : "No character questioned") : "", lie].map(cell).join(","));
   }
   // One row for the Final Verdict: theory, case strength, the pinned quotes and the closing argument.
   if (e.verdict) lines.push([s.nickname, "Final verdict", s.verdict?.theory ?? "Not yet", s.verdict ? (s.verdict.strength ?? "Saved without feedback") : "", (s.verdict?.pinned ?? []).map((p) => `${p.clue}: ${p.quote}`).join(" | "), s.verdict?.argument ?? "", "", ""].map(cell).join(","));
  }
  return lines.join("\r\n");
}
