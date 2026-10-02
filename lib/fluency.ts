// Oral reading fluency scoring. Pure functions only, so the scoring is testable and identical in the browser and in tests.
// Scoring follows common curriculum-based measurement practice: words read correctly in one minute (WCPM).
// Substitutions and omissions count as errors; insertions are not counted; self-corrections count as correct.

export type WordMark = "correct" | "error" | "unread";
export type TranscriptWord = { word: string; start?: number; end?: number };
export type FluencyScore = { attempted: number; errors: number; correct: number; wcpm: number; accuracy: number; seconds: number };
export type ProsodyRatings = { expression: number; phrasing: number; smoothness: number; pace: number };
export type FluencyCheck = {
  id: string; student: string; grade: number; date: string; passageId: string; passageTitle: string; passageLevel: number | null;
  passageSource: "benchmark" | "story" | "custom"; seconds: number; attempted: number; errors: number; wcpm: number; accuracy: number;
  prosody: ProsodyRatings | null; scoredBy: "ai_reviewed" | "teacher"; notes: string;
};
export type FastEntry = { id: string; student: string; window: "PM1" | "PM2" | "PM3"; schoolYear: string; scaleScore: number; level: 1 | 2 | 3 | 4 | 5; date: string };

export function passageWords(text: string): string[] {
  return text.replace(/[—–]/g, " ").split(/\s+/).map((w) => w.trim()).filter((w) => /[A-Za-z0-9]/.test(w));
}

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[‘’]/g, "'").replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "").replace(/'s$/, "s").replace(/'/g, "");
}

const numberWords: Record<string, string> = { "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve", "20": "twenty", "100": "hundred" };
function same(a: string, b: string) {
  if (a === b) return true;
  return (numberWords[a] ?? a) === (numberWords[b] ?? b);
}

// Word-level alignment (Levenshtein). Returns, for each passage word, whether the reader produced it.
// Only passage words up to the last word the reader matched count as attempted; the rest are unread.
export function alignTranscript(passage: string[], spoken: string[]): WordMark[] {
  const p = passage.map(normalizeWord), s = spoken.map(normalizeWord).filter(Boolean);
  const n = p.length, m = s.length;
  if (!n) return [];
  if (!m) return p.map(() => "unread");
  // cost[i][j]: best cost aligning first i passage words with first j spoken words.
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) cost[i][0] = i;
  for (let j = 1; j <= m; j++) cost[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const match = cost[i - 1][j - 1] + (same(p[i - 1], s[j - 1]) ? 0 : 1);
    cost[i][j] = Math.min(match, cost[i - 1][j] + 1, cost[i][j - 1] + 1);
  }
  // The reader usually stops mid-passage, so end the alignment at the passage position with the lowest cost
  // once the unread tail is excused.
  let endI = 0, best = Infinity;
  for (let i = 0; i <= n; i++) if (cost[i][m] < best) { best = cost[i][m]; endI = i; }
  const marks: WordMark[] = p.map(() => "unread");
  let i = endI, j = m;
  while (i > 0 && j > 0) {
    const isSame = same(p[i - 1], s[j - 1]);
    if (cost[i][j] === cost[i - 1][j - 1] + (isSame ? 0 : 1)) { marks[i - 1] = isSame ? "correct" : "error"; i--; j--; }
    else if (cost[i][j] === cost[i - 1][j] + 1) { marks[i - 1] = "error"; i--; }
    else j--;
  }
  while (i > 0) { marks[i - 1] = "error"; i--; }
  // Trailing errors after the last correct word are words the reader never reached.
  let last = marks.lastIndexOf("correct");
  for (let k = last + 1; k < marks.length; k++) marks[k] = "unread";
  return marks;
}

export function scoreMarks(marks: WordMark[], seconds: number): FluencyScore {
  const lastRead = Math.max(marks.lastIndexOf("correct"), marks.lastIndexOf("error"));
  const attempted = lastRead + 1;
  const errors = marks.slice(0, attempted).filter((m) => m !== "correct").length;
  const correct = attempted - errors;
  const safeSeconds = Math.max(1, Math.min(seconds, 600));
  return { attempted, errors, correct, seconds: safeSeconds, wcpm: Math.round((correct * 60) / safeSeconds), accuracy: attempted ? Math.round((correct / attempted) * 1000) / 10 : 0 };
}

// Moving the "last word read" marker: words up to it keep their marks (unread words become correct until the
// teacher marks them); words after it become unread.
export function setLastWord(marks: WordMark[], index: number): WordMark[] {
  return marks.map((mark, i) => (i > index ? "unread" : mark === "unread" ? "correct" : mark));
}

// Tapping a word the student read switches it between correct and error. Unread words do not change;
// the teacher moves the last-word marker instead.
export function toggleWord(marks: WordMark[], index: number): WordMark[] {
  if (marks[index] === "unread") return marks;
  const next = [...marks];
  next[index] = next[index] === "correct" ? "error" : "correct";
  return next;
}

export function accuracyBand(accuracy: number) {
  if (accuracy >= 95) return { label: "Independent", detail: "95% or higher: the passage is at a comfortable level." };
  if (accuracy >= 90) return { label: "Instructional", detail: "90 to 94%: a good level for practice with support." };
  return { label: "Frustration", detail: "Below 90%: the passage is too hard right now. Try a lower level." };
}

// Hasbrouck & Tindal (2017) oral reading fluency norms, 50th percentile WCPM, plus 25th and 10th.
// Used here for grades 2 to 6; the authors advise using grade 6 norms for older students.
type Season = "fall" | "winter" | "spring";
const norms: Record<number, Record<Season, [number, number, number]>> = {
  2: { fall: [50, 36, 23], winter: [84, 59, 35], spring: [100, 72, 43] },
  3: { fall: [83, 59, 40], winter: [97, 79, 62], spring: [112, 91, 63] },
  4: { fall: [94, 75, 60], winter: [120, 95, 71], spring: [133, 105, 83] },
  5: { fall: [121, 87, 64], winter: [133, 109, 84], spring: [146, 119, 102] },
  6: { fall: [132, 112, 89], winter: [145, 116, 91], spring: [146, 122, 91] },
};
export function seasonFor(date: Date): Season {
  const month = date.getMonth();
  if (month >= 7 && month <= 10) return "fall";
  if (month === 11 || month <= 2) return "winter";
  return "spring";
}
export function normFor(grade: number, date: Date) {
  const g = Math.max(2, Math.min(6, Math.round(grade)));
  const season = seasonFor(date);
  const [p50, p25, p10] = norms[g][season];
  return { normGrade: g, season, p50, p25, p10, usesGrade6: grade > 6 };
}

// Ordinary least squares slope, in WCPM per week, for checks sorted by date. Needs three or more checks.
export function weeklyGrowth(points: { date: string; wcpm: number }[]): number | null {
  if (points.length < 3) return null;
  const t0 = new Date(points[0].date).getTime();
  const xs = points.map((p) => (new Date(p.date).getTime() - t0) / (7 * 86_400_000)), ys = points.map((p) => p.wcpm);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  if (den === 0) return null;
  return Math.round((xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / den) * 10) / 10;
}

function syllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}
// Flesch-Kincaid grade level: a rough guide to passage difficulty, not a substitute for a leveled probe.
export function fleschKincaidGrade(text: string) {
  const words = passageWords(text);
  const sentences = Math.max(1, (text.match(/[.!?]+(?=\s|$|["”’)])/g) || []).length);
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  if (!words.length) return 0;
  return Math.round((0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59) * 10) / 10;
}

export const prosodyScale: { key: keyof ProsodyRatings; label: string; levels: [string, string, string, string] }[] = [
  { key: "expression", label: "Expression and volume", levels: ["Flat, quiet voice", "Some expression in places", "Expression fits most of the text", "Voice changes to match meaning throughout"] },
  { key: "phrasing", label: "Phrasing", levels: ["Word by word", "Two- or three-word chunks", "Mostly smooth phrases; some run-ons", "Natural phrases that follow punctuation"] },
  { key: "smoothness", label: "Smoothness", levels: ["Many long pauses and restarts", "Several rough spots", "A few breaks, fixed quickly", "Smooth; fixes slips without stopping"] },
  { key: "pace", label: "Pace", levels: ["Slow and effortful", "Uneven: slow and fast", "Mostly conversational", "Steady, conversational pace"] },
];
export function prosodyTotal(p: ProsodyRatings | null) { return p ? p.expression + p.phrasing + p.smoothness + p.pace : null; }

export function fluencyCsv(checks: FluencyCheck[], fast: FastEntry[]) {
  const q = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const rows = [["Type", "Student", "Date", "Grade", "Passage", "Passage level", "Seconds", "Words attempted", "Errors", "WCPM", "Accuracy %", "Prosody (4-16)", "FAST window", "FAST scale score", "FAST level", "Scored by", "Notes"]];
  for (const c of checks) rows.push(["Fluency check", c.student, c.date, String(c.grade), c.passageTitle, c.passageLevel == null ? "" : String(c.passageLevel), String(c.seconds), String(c.attempted), String(c.errors), String(c.wcpm), String(c.accuracy), String(prosodyTotal(c.prosody) ?? ""), "", "", "", c.scoredBy === "ai_reviewed" ? "AI draft, teacher reviewed" : "Teacher", c.notes]);
  for (const f of fast) rows.push(["FAST PM", f.student, f.date, "", "", "", "", "", "", "", "", "", `${f.window} ${f.schoolYear}`, String(f.scaleScore), String(f.level), "", ""]);
  return rows.map((r) => r.map(q).join(",")).join("\n");
}
