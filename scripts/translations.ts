// Bilingual support files.
//   node --experimental-strip-types scripts/translations.ts            writes worlds/<id>/translations/source.json (English, keyed)
//   node --experimental-strip-types scripts/translations.ts --check    lists English lines that still need a translation
// Translations live in worlds/<id>/translations/<lang>.json as { language, status, reviewed_by, strings: { key: text } }.
// status stays "draft" until a fluent reviewer checks the file and sets "reviewed" with their name in reviewed_by.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { WorldPackSchema } from "../lib/world-schema.ts";
import { homeLanguages, textKey, translatableStrings, type TranslationFile } from "../lib/bilingual.ts";

const root = join(process.cwd(), "worlds");
const check = process.argv.includes("--check");
let missingTotal = 0;
for (const folder of await readdir(root, { withFileTypes: true })) {
  if (!folder.isDirectory()) continue;
  const raw = JSON.parse(await readFile(join(root, folder.name, "world.json"), "utf8"));
  if (raw.status === "coming_soon") continue;
  const world = WorldPackSchema.parse(raw);
  const strings = translatableStrings(world);
  const dir = join(root, folder.name, "translations");
  await mkdir(dir, { recursive: true });
  const source = Object.fromEntries(strings.map((s) => [textKey(s), s]));
  if (!check) await writeFile(join(dir, "source.json"), JSON.stringify({ world: world.id, note: "English lines students may see with a home-language support. Keys match each language file.", strings: source }, null, 2) + "\n");
  for (const lang of homeLanguages) {
    let file: TranslationFile | null = null;
    try { file = JSON.parse(await readFile(join(dir, `${lang}.json`), "utf8")); } catch {}
    const missing = strings.filter((s) => !file?.strings[textKey(s)]);
    missingTotal += missing.length;
    console.log(`${world.id} ${lang}: ${strings.length - missing.length}/${strings.length} translated${file ? ` (${file.status})` : " (no file)"}`);
    if (check && missing.length) missing.slice(0, 5).forEach((m) => console.log(`   missing: ${m.slice(0, 90)}`));
  }
}
if (check && missingTotal) process.exitCode = 1;
