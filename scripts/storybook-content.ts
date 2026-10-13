// Drafts storybook reading-assistant content for one world, for human review before it ships:
//   - plain-language restatements for every sentence ("Say it again" card)
//   - characters first met on each page, described only with what the text has said so far ("Who's who" card);
//     in a play, people who are only talked about are marked offstage
//   - bridge pages (summaries of skipped paragraphs) get characters but no restatements: they are already plain words
//   - vocabulary with student-friendly definitions and Spanish (Spanish stays marked draft)
// Usage: node --experimental-strip-types scripts/storybook-content.ts --world=tell-tale-heart [--model=gpt-4o]
// Writes into worlds/<id>/world.json (storybook.review_status stays "draft") and a review sheet in docs/storybook-review/.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";
import OpenAI from "openai";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { pagePassages, pageUnits, sentenceKey, quoteInText, type Unit } from "../lib/storybook.ts";
nextEnv.loadEnvConfig(process.cwd());

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const worldId = arg("world"); if (!worldId) throw new Error("Pass --world=<id>.");
const model = arg("model") || "gpt-4o";
// --review-only rebuilds the review sheet from the current world.json without calling OpenAI.
const reviewOnly = process.argv.includes("--review-only");
// --pages=page-01,page-16 redrafts only those pages and keeps every other page (and the vocabulary) as it is.
const only = arg("pages")?.split(",");
const key = process.env.OPENAI_API_KEY?.trim(); if (!key && !reviewOnly) throw new Error("OPENAI_API_KEY is required.");
const client = new OpenAI({ apiKey: key || "unused" });

const worldPath = join(process.cwd(), "worlds", worldId, "world.json");
const raw = JSON.parse(await readFile(worldPath, "utf8"));
const world = WorldPackSchema.parse(raw);
const book = world.storybook; if (!book) throw new Error(`${worldId} has no storybook pages.`);
const passages = parseSourcePassages(await readFile(join(process.cwd(), "worlds", worldId, "source.md"), "utf8"));

const grades = `${world.grade_band.min} to ${world.grade_band.max}`;
const script = book.format === "script";
const system = `You prepare reading supports for students in grades ${grades} reading "${world.title}" by ${world.author}.
Hard rules:
- Use ONLY what the provided text says. Never add events, motives, names, appearances, or outcomes that the text does not state.
- Never mention or hint at anything that happens after the CURRENT PAGE.
- Do not write in dialect. Use plain, standard modern English, even when the original uses dialect.${script ? "\n- This is a play. Lines are labeled with the speaker; [stage directions] describe actions, not speech." : ""}
Return JSON only.`;

const met: { id: string; name: string; description: string; offstage?: boolean }[] = [];
// Units as the reader shows them: one per paragraph, with its speaker in a play. Pieces are keyed by their full text.
const lineOf = (u: Unit, i: Unit["items"][number]) => i.stage ? `[stage direction] ${i.full}` : u.speaker ? `${u.speaker.trim().replace(/\.$/, "")}: ${i.full}` : i.full;
const readable = (units: Unit[]) => units.map((u) => (u.speaker ? `${u.speaker.trim()} ` : "") + u.items.map((i) => i.stage ? `[${i.full}]` : i.full).join(" ")).join("\n\n");
const speaking = world.characters.map((c) => `${c.id} (${c.name})`).join(", ");
const vocab = new Map<string, { term: string; forms: string[]; part_of_speech?: string; definition: string; es_term?: string; es_definition?: string }>();
const existingTerms = world.glossary.map((g) => g.term);
let usage = { input: 0, output: 0 };
const pagesOut: typeof raw.storybook.pages = [];

if (reviewOnly) { pagesOut.push(...raw.storybook.pages); for (const p of pagesOut) met.push(...p.characters_met); for (const v of raw.storybook.vocabulary) vocab.set(v.term.toLowerCase(), v); }
else {
 if (only) for (const v of raw.storybook.vocabulary) vocab.set(v.term.toLowerCase(), v);
 for (const [i, page] of book.pages.entries()) {
  if (only && !only.includes(page.id)) { pagesOut.push(raw.storybook.pages[i]); met.push(...raw.storybook.pages[i].characters_met); continue; }
  const paras = pagePassages(passages, page);
  const units = pageUnits(passages, page, book.format);
  // A bridge's restatement would be a summary of a summary, so bridges only get characters.
  const numbered = page.bridge ? [] : units.flatMap((u) => u.items.map((it) => ({ key: it.full, text: lineOf(u, it) })));
  const before = book.pages.slice(0, i).map((p) => readable(pageUnits(passages, p, book.format))).join("\n\n");
  const current = page.bridge ? `(A summary page. Our summary: ${page.bridge.summary})\n\nThe original paragraphs it summarizes:\n${readable(units)}` : readable(units);
  const user = `TEXT ALREADY READ (before this page):\n${before || "(none, this is the first page)"}\n\nCURRENT PAGE ${i + 1}:\n${current}

CHARACTERS ALREADY LISTED: ${met.length ? met.map((c) => `${c.id} (${c.name})`).join(", ") : "none"}
VOCABULARY ALREADY CHOSEN: ${[...vocab.keys()].join(", ") || "none"}. Existing glossary words to include if they appear: ${existingTerms.join(", ")}.
CHARACTER IDS TO REUSE: if any of these people appear, use exactly this id: ${speaking}.

${numbered.length ? `NUMBERED LINES ON THIS PAGE:\n${numbered.map((l, n) => `${n + 1}. ${l.text}`).join("\n")}` : "(No numbered lines: return an empty restatements list.)"}

Return JSON with:
"restatements": one item per numbered line, {"n": number, "text": string}. Restate the line in plain modern English at about a 5th grade reading level. Keep the same meaning and add nothing the line does not say. One or two short sentences. ${script ? "For spoken lines, name the speaker in the third person (for example: Mrs. Hale says she would hate to have men snooping in her kitchen.). For stage directions, plainly describe the action." : "Keep the speaker's point of view (first person stays first person)."}
"new_characters": people who first appear or are first mentioned on THIS page and are not already listed, as {"id": kebab-case, "name": a plain label such as "The old man"${script ? `, "offstage": true for someone who is only talked about and never appears on stage, otherwise false` : ""}, "description": one line using only what the text has said up to the end of this page}. The storyteller is "narrator". Do not list abstract things (death, shadows) as characters.
"vocabulary": up to 3 words on this page that a grade ${grades} student may not know (no proper nouns), as {"word_in_text": exactly as it appears, "term": dictionary form, "part_of_speech": string, "definition": student-friendly, matching its meaning in THIS sentence, under 15 words, "es_term": Spanish word, "es_definition": Spanish translation of the definition}.`;
  const res = await client.chat.completions.create({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] });
  usage.input += res.usage?.prompt_tokens ?? 0; usage.output += res.usage?.completion_tokens ?? 0;
  const out = JSON.parse(res.choices[0]?.message.content || "{}");
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  const restatements: Record<string, string> = {};
  for (const r of list(out.restatements)) { const l = numbered[Number(r.n) - 1]; if (l && typeof r.text === "string") restatements[sentenceKey(l.key)] = r.text.trim(); }
  const missing = numbered.filter((l) => !restatements[sentenceKey(l.key)]).length;
  const newChars = list(out.new_characters).filter((c: { id: string }) => c?.id && !met.some((m) => m.id === c.id))
    .map((c: { id: string; name: string; description: string; offstage?: boolean }) => ({ id: c.id, name: c.name, description: c.description, ...(script && c.offstage ? { offstage: true } : {}) }));
  met.push(...newChars);
  // Bridge pages show our own plain summary, so they get no vocabulary.
  for (const v of page.bridge ? [] : list(out.vocabulary)) {
    if (!v?.term || !v?.word_in_text || !quoteInText(v.word_in_text, paras.map((p) => p.text).join(" "), 1)) continue;
    const k = String(v.term).toLowerCase(); const existing = vocab.get(k);
    if (existing) { if (!existing.forms.includes(v.word_in_text)) existing.forms.push(v.word_in_text); continue; }
    vocab.set(k, { term: v.term, forms: [v.word_in_text], part_of_speech: v.part_of_speech, definition: v.definition, es_term: v.es_term, es_definition: v.es_definition });
  }
  pagesOut.push({ ...raw.storybook.pages[i], characters_met: newChars, restatements });
  console.log(`${page.id}: ${Object.keys(restatements).length}/${numbered.length} restatements${missing ? ` (${missing} missing)` : ""}, ${newChars.length} new character(s), vocabulary so far ${vocab.size}`);
}
}

if (!reviewOnly) {
  raw.storybook = { ...raw.storybook, review_status: "draft", spanish_status: "draft", pages: pagesOut, vocabulary: [...vocab.values()] };
  WorldPackSchema.parse(raw);
  await writeFile(worldPath, JSON.stringify(raw, null, 2) + "\n");
}

// Review sheet: every restatement beside its sentence, who's who by page, and the vocabulary list.
const lines: string[] = [`# ${world.title}: reading-assistant drafts for review`, "", `Status: DRAFT. Spanish: DRAFT (needs a fluent reviewer). Drafted with ${reviewOnly ? "gpt-4o, then corrected by hand" : model}.`, ""];
lines.push("## Who's who (shown cumulatively; a character appears only from the page where the student meets them)", "");
const label = (i: number) => { const p = pagesOut[i]; const n = pagesOut.slice(0, i + 1).filter((x: { bridge?: unknown }) => !x.bridge).length; return p.bridge ? `Bridge after page ${n}` : `Page ${n}`; };
const range = (p: { start: string; end: string }) => `¶ ${Number(p.start.slice(1))}${p.end !== p.start ? `–${Number(p.end.slice(1))}` : ""}`;
for (const [i, p] of pagesOut.entries()) for (const c of p.characters_met) lines.push(`- **${label(i)}: ${c.name}**${c.offstage ? " (talked about, never on stage)" : ""}: ${c.description}`);
if (pagesOut.some((p: { bridge?: unknown }) => p.bridge)) {
  lines.push("", "## Bridges (our summaries of skipped paragraphs; the reader labels them and links to the full text)", "");
  for (const [i, p] of pagesOut.entries()) if (p.bridge) lines.push(`### ${label(i)} (${range(p)})`, "", p.bridge.summary, "");
}
lines.push("", "## Pages and frames", "", "| Page | Paragraphs | Section | Frame |", "|---|---|---|---|");
for (const [i, p] of pagesOut.entries()) lines.push(`| ${label(i)} | ${range(p)} | ${p.section} | ${p.bridge ? "none (bridge)" : p.mode === "illustrated" ? "illustrated (placeholder art)" : p.mode === "add_detail" ? "add a missing detail" : "you illustrate"}${p.frame_required ? ", **required**" : p.bridge || p.mode === "illustrated" ? "" : ", optional"}${p.no_generation ? ", writing only" : ""}${p.frame_prompt ? `: ${p.frame_prompt}` : ""} |`);
lines.push("", "## Vocabulary", "", "| Word | In the text | Definition | Spanish |", "|---|---|---|---|");
for (const v of vocab.values()) lines.push(`| ${v.term} (${v.part_of_speech ?? ""}) | ${v.forms.join(", ")} | ${v.definition} | ${v.es_term ?? ""}: ${v.es_definition ?? ""} |`);
lines.push("", "## Say it again (restatements)", "");
for (const [i, p] of pagesOut.entries()) {
  if (p.bridge) continue;
  lines.push(`### ${label(i)} (${range(p)})`, "");
  for (const u of pageUnits(passages, p, book.format)) for (const it of u.items) lines.push(`- > ${it.stage ? `_[${it.full}]_` : `${u.speaker ? `**${u.speaker.trim().replace(/\.$/, "")}:** ` : ""}${it.full}`}`, `  - ${p.restatements[sentenceKey(it.full)] ?? "(missing)"}`);
  lines.push("");
}
await mkdir(join(process.cwd(), "docs", "storybook-review"), { recursive: true });
// Hand-written review notes live below the marker and survive regenerating the sheet.
const sheet = join(process.cwd(), "docs", "storybook-review", `${worldId}.md`), MARK = "<!-- review notes -->";
const kept = await readFile(sheet, "utf8").then((t) => (t.includes(MARK) ? t.slice(t.indexOf(MARK)) : ""), () => "");
await writeFile(sheet, lines.join("\n") + (kept ? `\n${kept}` : ""));
console.log(`Done. ${vocab.size} words, ${met.length} characters. Tokens: ${usage.input} in, ${usage.output} out.`);
