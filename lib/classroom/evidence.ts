// The Teacher Evidence View: for every student in a class, which clues they proved, the line from the story they chose,
// their explanation, and whether that line proved a character wrong. Built from each student's saved progress
// (students.progress) and the class story's world pack. Shared by the teacher API, the sample classroom, and tests.
import type { WorldPack } from "../world-schema.ts";

// What a saved answer looks like in students.progress.artifactAnswers (only the fields this view reads).
export type SavedAnswer = { notice?: string; interpret?: string; craft?: string };
export type EvidenceStudentInput = { id: string; nickname: string; answers: Record<string, SavedAnswer> | null };

// "proved-wrong": the student questioned a character and chose a line that contradicts them.
// "backed-up": the line supported what the character said. null: no character was questioned for this clue.
export type Finding = "proved-wrong" | "backed-up" | null;
export type EvidenceCell = { proven: boolean; quote: string; explanation: string; finding: Finding };
export type EvidenceClue = { id: string; name: string; sceneId: string };
export type EvidenceScene = { id: string; title: string; characters: string[]; clues: EvidenceClue[] };
export type EvidenceStudent = { id: string; nickname: string; started: boolean; proven: number; provedWrong: number; needsHelp: boolean; cells: Record<string, EvidenceCell> };
export type ClassEvidence = {
  story: { id: string; title: string };
  scenes: EvidenceScene[];
  students: EvidenceStudent[];
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
  const words = id.split("-").map((w, i) => { const cap = w.charAt(0).toUpperCase() + w.slice(1); return i === 0 || (proper.has(cap) && !SMALL.has(w)) ? cap : w; });
  return `Scene ${index + 1} · ${words.join(" ")}`;
}

export function buildEvidence(world: WorldPack, students: EvidenceStudentInput[]): ClassEvidence {
  const names = new Map(world.characters.map((c) => [c.id, c.name]));
  const reference = JSON.stringify([world.scenes, world.characters.map((c) => c.name)]);
  const scenes: EvidenceScene[] = world.scenes.filter((s) => s.artifacts.length).map((s, i) => ({
    id: s.id, title: sceneTitle(s.id, i, reference),
    characters: s.available_characters.map((id) => names.get(id)).filter((n): n is string => !!n),
    clues: s.artifacts.map((a) => ({ id: a.id, name: a.name, sceneId: s.id })),
  }));
  const clues = scenes.flatMap((s) => s.clues);
  const rows: EvidenceStudent[] = students.map((s) => {
    const cells: Record<string, EvidenceCell> = {};
    for (const c of clues) {
      const a = s.answers?.[c.id], proven = isProven(a);
      cells[c.id] = { proven, quote: proven ? a!.notice!.trim() : "", explanation: proven ? a!.interpret!.trim() : "", finding: proven ? findingOf(a) : null };
    }
    const proven = clues.filter((c) => cells[c.id].proven).length;
    const provedWrong = clues.filter((c) => cells[c.id].finding === "proved-wrong").length;
    // Needs help: the student has saved progress for this story but has not proven a single clue.
    const started = s.answers !== null;
    return { id: s.id, nickname: s.nickname, started, proven, provedWrong, needsHelp: started && proven === 0, cells };
  });
  const joined = rows.length;
  return {
    story: { id: world.id, title: world.title },
    scenes,
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

// The plain-language line under a quote: "This line proved Brom Bones wrong." The saved answer does not record which
// character was asked, so the name is used only when the scene has exactly one character to question.
export function findingSentence(finding: Finding, scene: EvidenceScene | undefined) {
  if (!finding) return "The student did not question a character for this clue.";
  const who = scene?.characters.length === 1 ? scene.characters[0] : "the character they questioned";
  return finding === "proved-wrong" ? `This line proved ${who} wrong.` : `This line backed up what ${who} said.`;
}

// Spreadsheet export: one row per student and clue.
export function evidenceCsv(e: ClassEvidence) {
  const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [["Student", "Scene", "Clue", "Proven", "Line from the story", "Student explanation", "Character check"].join(",")];
  for (const s of e.students) for (const sc of e.scenes) for (const c of sc.clues) {
    const x = s.cells[c.id];
    lines.push([s.nickname, sc.title, c.name, x.proven ? "Yes" : "No", x.quote, x.explanation, x.proven ? (x.finding === "proved-wrong" ? "Proved the character wrong" : x.finding === "backed-up" ? "Backed up the character" : "No character questioned") : ""].map(cell).join(","));
  }
  return lines.join("\r\n");
}
