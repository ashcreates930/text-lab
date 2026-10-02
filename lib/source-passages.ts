export type SourcePassage = { id: string; text: string };

export function parseSourcePassages(markdown: string): SourcePassage[] {
  return markdown
    .replace(/^#.*(?:\r?\n|$)/gm, "")
    .split(/\r?\n\s*\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({ id: `p${String(index + 1).padStart(3, "0")}`, text }));
}

export function paragraphNumber(id: string) {
  const number = Number(id.replace(/^p/, ""));
  return Number.isFinite(number) ? number : 0;
}
