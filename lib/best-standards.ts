// Florida B.E.S.T. ELA benchmarks used by Proof Race question types, verified on 2026-10-31 and again on 2026-11-06 (all 33 codes and texts, from CPALMS LoadBenchmarkDetails) against CPALMS, Florida's
// official standards site (www.cpalms.org/PreviewStandard/Preview/<id>; all "State Board Approved"). Text is verbatim.
// The class grade (6 to 10; 7 in the demo) picks each code; a question is tagged with benchmark families (for example "R.1.3")
// and the class's grade picks the exact code. Never add a code here that hasn't been checked against CPALMS.
export type GradeBand = "6-8" | "9-10";
export type Grade = 6 | 7 | 8 | 9 | 10;
export type BenchmarkFamily = "R.1.1" | "R.1.2" | "R.1.3" | "R.3.1" | "R.3.2" | "V.1.3" | "K12.EE.1.1" | "K12.EE.3.1" | "K12.EE.4.1";

// [CPALMS id, benchmark text]
const GRADE: Record<Exclude<BenchmarkFamily, `K12.${string}`>, Record<Grade, [number, string]>> = {
  "R.1.1": {
    6: [15030, "Analyze how the interaction between characters contributes to the development of a plot in a literary text."],
    7: [15054, "Analyze the impact of setting on character development and plot in a literary text."],
    8: [15078, "Analyze the interaction between character development, setting, and plot in a literary text."],
    9: [15102, "Explain how key elements enhance or add layers of meaning and/or style in a literary text."],
    10: [15126, "Analyze how key elements enhance or add layers of meaning and/or style in a literary text."],
  },
  "R.1.2": {
    6: [15031, "Analyze the development of stated or implied theme(s) throughout a literary text."],
    7: [15055, "Compare two or more themes and their development throughout a literary text."],
    8: [15079, "Analyze two or more themes and their development throughout a literary text."],
    9: [15103, "Analyze universal themes and their development throughout a literary text."],
    10: [15127, "Analyze and compare universal themes and their development throughout a literary text."],
  },
  "R.1.3": {
    6: [15032, "Explain the influence of multiple narrators and/or shifts in point of view in a literary text."],
    7: [15056, "Explain the influence of narrator(s), including unreliable narrator(s), and/or shifts in point of view in a literary text."],
    8: [15080, "Analyze how an author develops and individualizes the perspectives of different characters."],
    9: [15104, "Analyze the influence of narrator perspective on a text, explaining how the author creates irony or satire."],
    10: [15128, "Analyze coming of age experiences reflected in a text and how the author represents conflicting perspectives."],
  },
  "R.3.1": {
    6: [15038, "Explain how figurative language contributes to tone and meaning in text(s)."],
    7: [15062, "Analyze how figurative language contributes to tone and meaning and explain examples of allusions in text(s)."],
    8: [15086, "Analyze how figurative language contributes to meaning and explain examples of symbolism in text(s)."],
    9: [15110, "Explain how figurative language creates mood in text(s)."],
    10: [15133, "Analyze how figurative language creates mood in text(s)."],
  },
  "R.3.2": {
    6: [15039, "Paraphrase content from grade-level texts."],
    7: [15063, "Paraphrase content from grade-level texts."],
    8: [15087, "Paraphrase content from grade-level texts."],
    9: [15111, "Paraphrase content from grade-level texts."],
    10: [15134, "Paraphrase content from grade-level texts."],
  },
  "V.1.3": Object.fromEntries(([[6, 15053], [7, 15077], [8, 15101], [9, 15125], [10, 15148]] as [Grade, number][]).map(([g, id]) => [g, [id, "Apply knowledge of context clues, figurative language, word relationships, reference materials, and/or background knowledge to determine the connotative and denotative meaning of words and phrases, appropriate to grade level."]])) as Record<Grade, [number, string]>,
};
const K12: Record<Extract<BenchmarkFamily, `K12.${string}`>, [number, string]> = {
  "K12.EE.1.1": [15201, "Cite evidence to explain and justify reasoning."],
  "K12.EE.3.1": [15203, "Make inferences to support comprehension."],
  "K12.EE.4.1": [15204, "Use appropriate collaborative techniques and active listening skills when engaging in discussions in a variety of situations."],
};

export const GRADES: Record<GradeBand, Grade[]> = { "6-8": [6, 7, 8], "9-10": [9, 10] };
export const bandOf = (grade: number): GradeBand => (grade >= 9 ? "9-10" : "6-8");
// A class's grade (6 to 10); grade 7 when none is set (the demo).
export const gradeOf = (g: unknown): Grade => ([6, 7, 8, 9, 10].includes(Number(g)) ? Number(g) : 7) as Grade;
// The codes a student or teacher sees for a question's benchmark families, at the class's grade (ELA.7.R.1.1).
export const codesFor = (families: string[], grade: unknown) => families.map((f) => (BENCHMARK_FAMILIES.includes(f as BenchmarkFamily) ? benchmark(f as BenchmarkFamily, gradeOf(grade)).code : f));
export const BENCHMARK_FAMILIES = [...Object.keys(GRADE), ...Object.keys(K12)] as BenchmarkFamily[];

// The exact benchmark for a family at a grade: code, verbatim text and its CPALMS page.
export function benchmark(family: BenchmarkFamily, grade: Grade) {
  if (family.startsWith("K12.")) { const [id, text] = K12[family as keyof typeof K12]; return { code: `ELA.${family}`, text, url: `https://www.cpalms.org/PreviewStandard/Preview/${id}` }; }
  const [id, text] = GRADE[family as keyof typeof GRADE][grade];
  return { code: `ELA.${grade}.${family}`, text, url: `https://www.cpalms.org/PreviewStandard/Preview/${id}` };
}
