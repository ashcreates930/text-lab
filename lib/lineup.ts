// The character-select lineup (world-map phase 6): the Interview, Name the Liar, the live host board and the avatar
// pick all show characters the same way. One stands in the spotlight in the middle; the ones beside it are dimmed.
// Tap a dimmed one, swipe, or use the arrow keys to bring another into the spotlight; the lineup wraps around, so any
// order works. Pure functions shared by app/lineup.tsx and the tests.

export type Slot = "left" | "center" | "right";
export const wrap = (i: number, n: number) => (n > 0 ? ((i % n) + n) % n : 0);

// Who shows where: the spotlight in the middle, its neighbours on each side (wrapping round). Two characters: the
// other one stands on the right; one character: the spotlight alone.
export function lineupWindow(n: number, i: number): { index: number; slot: Slot }[] {
  if (n <= 0) return [];
  const c = wrap(i, n);
  if (n === 1) return [{ index: c, slot: "center" }];
  if (n === 2) return [{ index: c, slot: "center" }, { index: wrap(c + 1, n), slot: "right" }];
  return [{ index: wrap(c - 1, n), slot: "left" }, { index: c, slot: "center" }, { index: wrap(c + 1, n), slot: "right" }];
}

// Keyboard: left and right (or up and down) move the spotlight, Home and End jump to the ends. Anything else: null.
export function lineupKey(key: string, i: number, n: number): number | null {
  if (n <= 0) return null;
  if (key === "ArrowRight" || key === "ArrowDown") return wrap(i + 1, n);
  if (key === "ArrowLeft" || key === "ArrowUp") return wrap(i - 1, n);
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  return null;
}

// A swipe of at least SWIPE_PX: to the left brings in the next character, to the right the one before.
export const SWIPE_PX = 40;
export const swipeStep = (dx: number, dy = 0) => (Math.abs(dx) < SWIPE_PX || Math.abs(dy) > Math.abs(dx) ? 0 : dx < 0 ? 1 : -1);

// The Interview: every witness must be asked before the race; the Asked check shows on each one.
export const askedList = (cards: (number | null | undefined)[], n: number) => Array.from({ length: n }, (_, k) => cards[k] != null);
export const allAsked = (cards: (number | null | undefined)[], n: number) => n > 0 && askedList(cards, n).every(Boolean);
// The next witness still to question, looking right from the spotlight (wrapping); null when all are asked.
export function nextUnasked(cards: (number | null | undefined)[], n: number, from: number): number | null {
  for (let s = 1; s <= n; s++) { const k = wrap(from + s, n); if (cards[k] == null) return k; }
  return null;
}

// What a screen reader hears when the spotlight moves: "Brom Bones, 2 of 3, asked".
export function spotlightLabel(name: string, i: number, n: number, asked?: boolean | null) {
  return `${name}, ${i + 1} of ${n}${asked == null ? "" : asked ? ", asked" : ", not asked yet"}`;
}
