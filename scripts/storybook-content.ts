// Drafts storybook reading-assistant content for one world, for human review before it ships:
//   - plain-language restatements for every sentence ("Say it again" card)
//   - characters first met on each page, described only with what the text has said so far ("Who's who" card)
//   - vocabulary with student-friendly definitions and Spanish (Spanish stays marked draft)
// Usage: node --experimental-strip-types scripts/storybook-content.ts --world=tell-tale-heart [--model=gpt-4o]
// Writes into worlds/<id>/world.json (storybook.review_status stays "draft") and a review sheet in docs/storybook-review/.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";
import OpenAI from "openai";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { pagePassages, sentenceKey, splitSentences, quoteInText } from "../lib/storybook.ts";
nextEnv.loadEnvConfig(process.cwd());

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const worldId = arg("world"); if (!worldId) throw new Error("Pass --world=<id>.");
const model = arg("model") || "gpt-4o";
// --review-only rebuilds the review sheet from the current world.json without calling OpenAI.
const reviewOnly = process.argv.includes("--review-only");
const key = process.env.OPENAI_API_KEY?.trim(); if (!key && !reviewOnly) throw new Error("OPENAI_API_KEY is required.");
const client = new OpenAI({ apiKey: key || "unused" });

const worldPath = join(process.cwd(), "worlds", worldId, "world.json");
const raw = JSON.parse(await readFile(worldPath, "utf8"));
const world = WorldPackSchema.parse(raw);
const book = world.storybook; if (!book) throw new Error(`${worldId} has no storybook pages.`);
const passages = parseSourcePassages(await readFile(join(process.cwd(), "worlds", worldId, "source.md"), "utf8"));

const system = `You prepare reading supports for students in grades 6 to 12 reading "${world.title}" by ${world.author}.
Hard rules:
- Use ONLY what the provided text says. Never add events, motives, names, appearances, or outcomes that the text does not state.
- Never mention or hint at anything that happens after the CURRENT PAGE.
- Do not write in dialect. Use plain, standard modern English.
Return JSON only.`;

const met: { id: string; name: string; description: string }[] = [];
const vocab = new Map<string, { term: string; forms: string[]; part_of_speech?: string; definition: string; es_term?: string; es_definition?: string }>();
const existingTerms = world.glossary.map((g) => g.term);
let usage = { input: 0, output: 0 };
const pagesOut: typeof raw.storybook.pages = [];

if (reviewOnly) { pagesOut.push(...raw.storybook.pages); for (const p of pagesOut) met.push(...p.characters_met); for (const v of raw.storybook.vocabulary) vocab.set(v.term.toLowerCase(), v); }
else for (const [i, page] of book.pages.entries()) {
  const paras = pagePassages(passages, page);
  const sentences = paras.flatMap((p) => splitSentences(p.text));
  const before = book.pages.slice(0, i).flatMap((p) => pagePassages(passages, p)).map((p) => p.text).join("\n\n");
  const user = `TEXT ALREADY READ (before this page):\n${before || "(none, this is the first page)"}\n\nCURRENT PAGE ${i + 1}:\n${paras.map((p) => p.text).join("\n\n")}

CHARACTERS ALREADY LISTED: ${met.length ? met.map((c) => `${c.id} (${c.name})`).join(", ") : "none"}
VOCABULARY ALREADY CHOSEN: ${[...vocab.keys()].join(", ") || "none"}. Existing glossary words to include if they appear: ${existingTerms.join(", ")}.

NUMBERED SENTENCES ON THIS PAGE:
${sentences.map((s, n) => `${n + 1}. ${s}`).join("\n")}

Return JSON with:
"restatements": one item per numbered sentence, {"n": number, "text": string}. Restate the sentence in plain modern English at about a 5th grade reading level, keeping the speaker's point of view (first person stays first person). Keep the same meaning. Add nothing the sentence does not say. One or two short sentences.
"new_characters": people who first appear or are first mentioned on THIS page and are not already listed, as {"id": kebab-case, "name": a plain label such as "The old man", "description": one line using only what the text has said up to the end of this page}. The storyteller is "narrator". Do not list abstract things (death, shadows) as characters.
"vocabulary": up to 3 words on this page that a grade 6 to 8 student may not know (no proper nouns), as {"word_in_text": exactly as it appears, "term": dictionary form, "part_of_speech": string, "definition": student-friendly, matching its meaning in THIS sentence, under 15 words, "es_term": Spanish word, "es_definition": Spanish translation of the definition}.`;
  const res = await client.chat.completions.create({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] });
  usage.input += res.usage?.prompt_tokens ?? 0; usage.output += res.usage?.completion_tokens ?? 0;
  const out = JSON.parse(res.choices[0]?.message.content || "{}");
  const restatements: Record<string, string> = {};
  for (const r of out.restatements ?? []) { const s = sentences[Number(r.n) - 1]; if (s && typeof r.text === "string") restatements[sentenceKey(s)] = r.text.trim(); }
  const missing = sentences.filter((s) => !restatements[sentenceKey(s)]).length;
  const newChars = (out.new_characters ?? []).filter((c: { id: string }) => c?.id && !met.some((m) => m.id === c.id));
  met.push(...newChars);
  for (const v of out.vocabulary ?? []) {
    if (!v?.term || !v?.word_in_text || !quoteInText(v.word_in_text, paras.map((p) => p.text).join(" "), 1)) continue;
    const k = String(v.term).toLowerCase(); const existing = vocab.get(k);
    if (existing) { if (!existing.forms.includes(v.word_in_text)) existing.forms.push(v.word_in_text); continue; }
    vocab.set(k, { term: v.term, forms: [v.word_in_text], part_of_speech: v.part_of_speech, definition: v.definition, es_term: v.es_term, es_definition: v.es_definition });
  }
  pagesOut.push({ ...raw.storybook.pages[i], characters_met: newChars, restatements });
  console.log(`${page.id}: ${Object.keys(restatements).length}/${sentences.length} restatements${missing ? ` (${missing} missing)` : ""}, ${newChars.length} new character(s), vocabulary so far ${vocab.size}`);
}

if (!reviewOnly) {
  raw.storybook = { ...raw.storybook, review_status: "draft", spanish_status: "draft", pages: pagesOut, vocabulary: [...vocab.values()] };
  WorldPackSchema.parse(raw);
  await writeFile(worldPath, JSON.stringify(raw, null, 2) + "\n");
}

// Review sheet: every restatement beside its sentence, who's who by page, and the vocabulary list.
const lines: string[] = [`# ${world.title}: reading-assistant drafts for review`, "", `Status: DRAFT. Spanish: DRAFT (needs a fluent reviewer). Drafted with ${reviewOnly ? "gpt-4o, then corrected by hand" : model}.`, ""];
lines.push("## Who's who (shown cumulatively; a character appears only from the page where the student meets them)", "");
for (const [i, p] of pagesOut.entries()) for (const c of p.characters_met) lines.push(`- **Page ${i + 1}: ${c.name}**: ${c.description}`);
lines.push("", "## Vocabulary", "", "| Word | In the text | Definition | Spanish |", "|---|---|---|---|");
for (const v of vocab.values()) lines.push(`| ${v.term} (${v.part_of_speech ?? ""}) | ${v.forms.join(", ")} | ${v.definition} | ${v.es_term ?? ""}: ${v.es_definition ?? ""} |`);
lines.push("", "## Say it again (restatements)", "");
for (const [i, p] of pagesOut.entries()) {
  lines.push(`### Page ${i + 1} (¶ ${Number(p.start.slice(1))}${p.end !== p.start ? `–${Number(p.end.slice(1))}` : ""})`, "");
  for (const s of pagePassages(passages, p).flatMap((x) => splitSentences(x.text))) lines.push(`- > ${s}`, `  - ${p.restatements[sentenceKey(s)] ?? "(missing)"}`);
  lines.push("");
}
await mkdir(join(process.cwd(), "docs", "storybook-review"), { recursive: true });
await writeFile(join(process.cwd(), "docs", "storybook-review", `${worldId}.md`), lines.join("\n"));
console.log(`Done. ${vocab.size} words, ${met.length} characters. Tokens: ${usage.input} in, ${usage.output} out.`);
