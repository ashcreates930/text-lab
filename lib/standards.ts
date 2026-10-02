// Florida B.E.S.T. ELA benchmarks used by Inside the Text, with official wording by grade, plus the AP and Cambridge
// (AICE) frameworks that the same tasks support. Spot-check wording against CPALMS (cpalms.org) after any FLDOE revision.

export type Course = "best_ela" | "ap_lit" | "ap_lang" | "aice_lit" | "aice_lang" | "igcse_lit";
export const courseLabels: Record<Course, { short: string; long: string }> = {
  best_ela: { short: "B.E.S.T. ELA", long: "Florida B.E.S.T. English Language Arts" },
  ap_lit: { short: "AP Lit", long: "AP English Literature and Composition" },
  ap_lang: { short: "AP Lang", long: "AP English Language and Composition" },
  aice_lit: { short: "AICE Lit", long: "Cambridge International AS & A Level Literature in English (9695)" },
  aice_lang: { short: "AICE Lang", long: "Cambridge International AS & A Level English Language (9093)" },
  igcse_lit: { short: "Pre-AICE Lit", long: "Cambridge IGCSE Literature in English (0475)" },
};
export const courseFilters: { id: "all" | "best" | "ap" | "aice"; label: string; courses: Course[] }[] = [
  { id: "all", label: "All courses", courses: [] },
  { id: "best", label: "B.E.S.T. ELA", courses: ["best_ela"] },
  { id: "ap", label: "AP English", courses: ["ap_lit", "ap_lang"] },
  { id: "aice", label: "Cambridge AICE", courses: ["aice_lit", "aice_lang", "igcse_lit"] },
];

type Family = "R.1.1" | "R.1.2" | "R.1.3" | "C.1.2";
const best: Record<number, Record<Family, string>> = {
  6: {
    "R.1.1": "Analyze how the interaction between characters contributes to the development of a plot in a literary text.",
    "R.1.2": "Analyze the development of stated or implied theme(s) throughout a literary text.",
    "R.1.3": "Explain the influence of multiple narrators and/or shifts in point of view in a literary text.",
    "C.1.2": "Write personal or fictional narratives using narrative techniques, precise words and phrases, and figurative language.",
  },
  7: {
    "R.1.1": "Analyze the impact of setting on character development and plot in a literary text.",
    "R.1.2": "Compare two or more themes and their development throughout a literary text.",
    "R.1.3": "Explain the influence of narrator(s), including unreliable narrator(s), and/or shifts in point of view in a literary text.",
    "C.1.2": "Write personal or fictional narratives using narrative techniques, a recognizable point of view, precise words and phrases, and figurative language.",
  },
  8: {
    "R.1.1": "Analyze the interaction between character development, setting, and plot in a literary text.",
    "R.1.2": "Analyze two or more themes and their development throughout a literary text.",
    "R.1.3": "Analyze how an author develops and individualizes the perspectives of different characters.",
    "C.1.2": "Write personal or fictional narratives using narrative techniques, varied transitions, and a clearly established point of view.",
  },
  9: {
    "R.1.1": "Explain how key elements enhance or add layers of meaning and/or style in a literary text.",
    "R.1.2": "Analyze universal themes and their development throughout a literary text.",
    "R.1.3": "Analyze the influence of narrator perspective on a text, explaining how the author creates irony or satire.",
    "C.1.2": "Write narratives using narrative techniques, varied transitions, and a clearly established point of view.",
  },
  10: {
    "R.1.1": "Analyze how key elements enhance or add layers of meaning and/or style in a literary text.",
    "R.1.2": "Analyze and compare universal themes and their development throughout a literary text.",
    "R.1.3": "Analyze coming of age experiences reflected in a text and how the author represents conflicting perspectives.",
    "C.1.2": "Write narratives using an appropriate pace to create tension, mood, and/or tone.",
  },
  11: {
    "R.1.1": "Evaluate how key elements enhance or add layers of meaning and/or style in a literary text.",
    "R.1.2": "Track and analyze universal themes in literary texts from different times and places.",
    "R.1.3": "Analyze the author's choices in using juxtaposition to define character perspective.",
    "C.1.2": "Write complex narratives using appropriate techniques to establish multiple perspectives.",
  },
  12: {
    "R.1.1": "Evaluate how key elements enhance or add layers of meaning and/or style in a literary text and explain the functional significance of those elements in interpreting the text.",
    "R.1.2": "Analyze two or more themes and evaluate their development throughout a literary text.",
    "R.1.3": "Evaluate the development of character perspective, including conflicting perspectives.",
    "C.1.2": "Write complex narratives using appropriate techniques to establish multiple perspectives and convey universal themes.",
  },
};
const expectations: Record<string, string> = {
  "ELA.K12.EE.1.1": "Cite evidence to explain and justify reasoning.",
  "ELA.K12.EE.2.1": "Read and comprehend grade-level complex texts proficiently.",
  "ELA.K12.EE.3.1": "Make inferences to support comprehension.",
};

// Accepts a grade-specific code (ELA.8.R.1.3), a grade-free family code (ELA.R.1.3), or a K-12 expectation code,
// and returns the code and official wording for the student's grade.
export function resolveBenchmark(code: string, grade: number): { code: string; description: string } | null {
  if (expectations[code]) return { code, description: expectations[code] };
  const match = code.match(/^ELA\.(?:(\d{1,2})\.)?(R\.1\.[123]|C\.1\.2)$/);
  if (!match) return null;
  const g = Math.max(6, Math.min(12, match[1] ? Number(match[1]) : Math.round(grade)));
  // Grade 10's R.1.3 is specific to coming-of-age texts; perspective work in other texts maps to R.1.1 (key elements).
  const family = (g === 10 && match[2] === "R.1.3" && !match[1] ? "R.1.1" : match[2]) as Family;
  return { code: `ELA.${g}.${family}`, description: best[g][family] };
}

export function benchmarksForBand(families: string[], min: number, max: number) {
  const out: { code: string; description: string }[] = [];
  for (const family of families) {
    if (expectations[family]) { out.push({ code: family, description: expectations[family] }); continue; }
    for (let g = Math.max(6, min); g <= Math.min(12, max); g++) { const r = resolveBenchmark(family, g); if (r && !out.some((x) => x.code === r.code)) out.push(r); }
  }
  return out;
}

// What each course looks for, in the words its framework uses, so teachers can see how one task serves several courses.
export const frameworks: Record<Exclude<Course, "best_ela">, { name: string; items: string[] }> = {
  ap_lit: { name: "AP Literature skill categories", items: ["Character", "Setting", "Structure", "Narration", "Figurative Language", "Literary Argumentation"] },
  ap_lang: { name: "AP Language skill categories", items: ["Rhetorical Situation", "Claims and Evidence", "Reasoning and Organization", "Style"] },
  aice_lit: { name: "Cambridge 9695 assessment objectives", items: ["AO1 Knowledge and understanding", "AO2 Analysis of language, form and structure", "AO3 Personal response", "AO4 Communication"] },
  aice_lang: { name: "Cambridge 9093 focus", items: ["Reading: analysis of writers' choices", "Writing: imaginative and descriptive composition"] },
  igcse_lit: { name: "Cambridge IGCSE 0475 focus", items: ["Close reading of prose and drama", "Personal response supported by textual reference"] },
};
