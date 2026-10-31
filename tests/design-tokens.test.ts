// The game look's colors: app/globals.css matches lib/design-tokens.ts, no old hex colors are left in components, and
// every text and background token pair the app uses meets WCAG contrast (4.5:1, or 3:1 for text 24px and larger).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { COLORS, READING_SCOPE, PRINT_SCOPE, contrast, type ColorToken } from "../lib/design-tokens.ts";

const files: string[] = [];
(function walk(d: string) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== "api") walk(p); } else if (p.endsWith(".tsx")) files.push(p); } })("app");
// The hologram view stays pure black and unchanged.
const styled = files.filter((f) => !/hologram-view/.test(f));
const css = readFileSync("app/globals.css", "utf8");

test("globals.css declares every token with the design-token value", () => {
  for (const [name, hex] of Object.entries(COLORS)) assert.match(css, new RegExp(`--color-${name}:\\s*${hex};`, "i"), `--color-${name}`);
  const scope = css.match(/\.reading-scope\{([^}]*)\}/)![1];
  for (const [name, hex] of Object.entries(READING_SCOPE)) assert.match(scope, new RegExp(`--color-${name}:${hex}`, "i"), `reading --color-${name}`);
});

test("no component keeps a hard-coded color class", () => {
  const left = styled.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|accent|decoration)-\[#[0-9A-Fa-f]{3,8}\]/g)].map((m) => `${f}: ${m[0]}`));
  assert.deepEqual(left, []);
});

// Class groups: the text between quotes, backticks and template braces (so the branches of a ternary stay apart).
const TOKENS = Object.keys(COLORS) as ColorToken[];
const tok = (kind: "bg" | "text", group: string) => {
  const out: ColorToken[] = [];
  for (const m of group.matchAll(new RegExp(`(?<![\\w:/-])${kind}-([a-z0-9-]+)(?![\\w/-])`, "g"))) if ((TOKENS as string[]).includes(m[1])) out.push(m[1] as ColorToken);
  return out;
};
const large = (group: string) => /(?<![\w:-])text-\[(\d+)px\]/.test(group) ? Number(group.match(/(?<![\w:-])text-\[(\d+)px\]/)![1]) >= 24 : /(?<![\w:-])text-([2-9]xl)\b/.test(group) || /text-\[clamp\((\d+)px/.test(group) && Number(group.match(/text-\[clamp\((\d+)px/)![1]) >= 24;
type Pair = { file: string; text: ColorToken; bg: ColorToken; large: boolean };
function pairs(): Pair[] {
  const out: Pair[] = [];
  for (const file of styled) for (const group of readFileSync(file, "utf8").split(/["'`{}]/)) {
    const texts = tok("text", group); if (!texts.length) continue;
    const bgs = tok("bg", group);
    // Text with no fill of its own sits on the stage or a panel; the lightest of those is the panel.
    for (const text of texts) for (const bg of bgs.length ? bgs : (["panel"] as ColorToken[])) out.push({ file, text, bg, large: large(group) });
  }
  return out;
}
const scheme = (over: Partial<Record<ColorToken, string>>) => (t: ColorToken) => over[t] ?? COLORS[t];
const fails = (list: Pair[], color: (t: ColorToken) => string) => list
  .filter((p) => !(p.text === p.bg))
  .map((p) => ({ ...p, ratio: contrast(color(p.text), color(p.bg)) }))
  .filter((p) => p.ratio < (p.large ? 3 : 4.5))
  .map((p) => `${p.file}: text-${p.text} on bg-${p.bg} = ${p.ratio.toFixed(2)}${p.large ? " (large)" : ""}`);

test("every text and background pair in the app meets contrast on the game stage", () => {
  const list = pairs(); assert.ok(list.length > 200, "found the app's pairs");
  assert.deepEqual([...new Set(fails(list, scheme({})))], []);
});

test("pairs inside the reading card meet contrast with the reading card's light tokens", () => {
  const reading = pairs().filter((p) => /reading-panel|passage-panel/.test(p.file));
  assert.deepEqual([...new Set(fails(reading, scheme(READING_SCOPE)))], []);
});

test("printed pages: dark text on white", () => {
  const color = scheme(PRINT_SCOPE);
  for (const t of ["ink", "muted", "faint", "highlight"] as ColorToken[]) for (const b of ["stage", "panel", "panel-2"] as ColorToken[]) assert.ok(contrast(color(t), color(b)) >= 4.5, `${t} on ${b}`);
});

test("the design's fixed pairs: text on each fill, story text on the reading card", () => {
  const fixed: [ColorToken, ColorToken][] = [["on-primary", "primary"], ["on-success", "success"], ["on-notyet", "notyet"], ["on-gold", "gold"], ["on-violet", "violet"], ["reading-ink", "reading"], ["reading-ink", "line-row"], ["reading-ink", "line-picked"], ["reading-ink", "line-right"], ["reading-ink", "line-wrong"], ["muted", "stage"], ["muted", "panel"], ["highlight", "panel"]];
  for (const [t, b] of fixed) assert.ok(contrast(COLORS[t], COLORS[b]) >= 4.5, `${t} on ${b}: ${contrast(COLORS[t], COLORS[b]).toFixed(2)}`);
  assert.ok(contrast(COLORS.faint, COLORS.stage) >= 3, "faint is for large text only");
});
