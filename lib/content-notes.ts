// Content notes before flagged paragraphs. A paragraph is flagged when the story keeps it from AI characters
// (storybook.ai_exclude) and it sits on a storybook page that carries a content_note; the note is that page's own text.
// Every view that shows story paragraphs (the reading panel, scene narration, clue and evidence lines, storyboard
// frames) puts the note directly before a flagged paragraph. Consecutive flagged paragraphs under the same note share one.
import type { SourcePassage } from "./source-passages.ts";

type NotedWorld = { storybook?: { ai_exclude?: string[]; pages: { start: string; end: string; content_note?: string }[] } | null };
const num = (id: string) => Number(id.slice(1));

export function contentNotes(world: NotedWorld): Map<string, string> {
  const notes = new Map<string, string>();
  const book = world.storybook;
  if (!book) return notes;
  for (const id of book.ai_exclude ?? []) {
    const page = book.pages.find((p) => p.content_note && num(p.start) <= num(id) && num(id) <= num(p.end));
    if (page?.content_note) notes.set(id, page.content_note);
  }
  return notes;
}

export type ReadingItem = { kind: "note"; id: string; text: string; before: string } | { kind: "passage"; id: string; text: string; passage: SourcePassage };

// The paragraphs as shown, with each needed note placed directly before its paragraph.
export function withContentNotes(passages: SourcePassage[], notes: Map<string, string>): ReadingItem[] {
  const items: ReadingItem[] = [];
  let previous: SourcePassage | undefined;
  for (const p of passages) {
    const note = notes.get(p.id);
    const continues = !!note && !!previous && notes.get(previous.id) === note && num(p.id) === num(previous.id) + 1;
    if (note && !continues) items.push({ kind: "note", id: `note-${p.id}`, text: note, before: p.id });
    items.push({ kind: "passage", id: p.id, text: p.text, passage: p });
    previous = p;
  }
  return items;
}
