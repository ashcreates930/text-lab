export type AuthorshipSource = "typed" | "inserted" | "pasted";
export type AuthorshipRange = { start: number; end: number; source: AuthorshipSource };

export function reconcileAuthorship(
  previousText: string,
  nextText: string,
  ranges: AuthorshipRange[],
  source: AuthorshipSource,
): AuthorshipRange[] {
  let prefix = 0;
  while (prefix < previousText.length && prefix < nextText.length && previousText[prefix] === nextText[prefix]) prefix++;
  let suffix = 0;
  while (suffix < previousText.length - prefix && suffix < nextText.length - prefix && previousText[previousText.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]) suffix++;
  const oldEnd = previousText.length - suffix;
  const nextEnd = nextText.length - suffix;
  const delta = nextEnd - oldEnd;
  const kept: AuthorshipRange[] = [];
  for (const range of ranges) {
    if (range.start < prefix) kept.push({ ...range, end: Math.min(range.end, prefix) });
    if (range.end > oldEnd) kept.push({ ...range, start: Math.max(range.start, oldEnd) + delta, end: range.end + delta });
  }
  if (nextEnd > prefix) kept.push({ start: prefix, end: nextEnd, source });
  return mergeRanges(kept.filter((range) => range.end > range.start));
}

export function mergeRanges(ranges: AuthorshipRange[]) {
  const ordered = [...ranges].sort((a, b) => a.start - b.start);
  const merged: AuthorshipRange[] = [];
  for (const range of ordered) {
    const previous = merged[merged.length - 1];
    if (previous && previous.source === range.source && previous.end === range.start) previous.end = range.end;
    else merged.push({ ...range });
  }
  return merged;
}

export function authorshipShares(ranges: AuthorshipRange[], textLength: number) {
  const counts = { typed: 0, inserted: 0, pasted: 0 };
  for (const range of ranges) counts[range.source] += range.end - range.start;
  const total = textLength || 1;
  return Object.fromEntries(Object.entries(counts).map(([key, count]) => [key, Math.round((count / total) * 100)])) as Record<AuthorshipSource, number>;
}
