// Escape rooms, phase 8: the investigator avatar and gear. Each student picks an investigator (an original painted
// portrait) and earns gear, which comes from proof only: a lock proved with a line on the first try (no clue past tier
// 1), a written seal backed by its line, a puzzle lock with every part right on the first try, a liar caught with the
// disproving line. Points, clues, replays of a lock already proved, and coins never earn gear. The same rules for every
// story (no story-specific gear). Pure rules shared by the map's investigator card, the student API and the teacher view.
import type { ExpeditionAttempt } from "./expedition-progress.ts";
import { provedFirstTry } from "./case-notes.ts";
import { cluesAllowMastery, type ClueTier } from "./clues.ts";

// The art waits for the teacher's approval (scripts/investigator-art.mjs); until then the screens use plain icons. The
// gear art was approved 2026-11-15; the revised avatars are awaiting approval.
export const INVESTIGATOR_ART_APPROVED = false;
export const GEAR_ART_APPROVED = true;

export const AVATARS = [
  { id: "investigator-1", alt: "An investigator with short curly hair and a mustard-yellow scarf" },
  { id: "investigator-2", alt: "An investigator with freckles, red hair and a green scarf" },
  { id: "investigator-3", alt: "An investigator with a long black braid and a red scarf" },
  { id: "investigator-4", alt: "An investigator with rectangular glasses, a camel coat and a grey scarf" },
  { id: "investigator-5", alt: "An investigator in a grey cap with a rust-orange scarf" },
  { id: "investigator-6", alt: "An investigator in a knitted hat with a plum scarf" },
] as const;
export type AvatarId = (typeof AVATARS)[number]["id"];
export const isAvatar = (x: unknown): x is AvatarId => AVATARS.some((a) => a.id === x);
export const avatarSrc = (id: AvatarId) => (INVESTIGATOR_ART_APPROVED ? `/investigator/avatars/${id}.webp` : null);

export type GearId = "lantern" | "quill" | "magnifier" | "compass" | "ledger" | "key";
export type Proofs = { locks: number; seals: number; puzzles: number; liars: number };
export const GEAR: { id: GearId; name: string; earn: string; need: (p: Proofs) => { have: number; need: number } }[] = [
  { id: "lantern", name: "Lantern", earn: "Prove 5 locks with a line on the first try.", need: (p) => ({ have: p.locks, need: 5 }) },
  { id: "quill", name: "Quill", earn: "Back a written seal with the line that proves it.", need: (p) => ({ have: p.seals, need: 1 }) },
  { id: "magnifier", name: "Magnifying glass", earn: "Solve a puzzle lock with every part right on the first try.", need: (p) => ({ have: p.puzzles, need: 1 }) },
  { id: "key", name: "Brass key", earn: "Catch a liar with the line that disproves the lie.", need: (p) => ({ have: p.liars, need: 1 }) },
  { id: "compass", name: "Pocket compass", earn: "Prove 15 locks with a line on the first try.", need: (p) => ({ have: p.locks, need: 15 }) },
  { id: "ledger", name: "Casebook", earn: "Prove 40 locks with a line on the first try.", need: (p) => ({ have: p.locks, need: 40 }) },
];
export const gearSrc = (id: GearId) => (GEAR_ART_APPROVED ? `/investigator/gear/${id}.png` : null);

// What a student has proved, across every attempt: each lock, puzzle and liar counts once (a replay that proves a lock
// already proved adds nothing), and only proofs with no clue past tier 1.
export function proofsFrom(attempts: Pick<ExpeditionAttempt, "worldId" | "expeditionId" | "notes" | "puzzles" | "interview">[]): Proofs {
  const locks = new Set<string>(), seals = new Set<string>(), puzzles = new Set<string>(), liars = new Set<string>();
  for (const a of attempts) {
    const at = `${a.worldId}/${a.expeditionId}`;
    for (const n of a.notes ?? []) if (provedFirstTry(n) && cluesAllowMastery(n.clue as ClueTier | undefined)) { locks.add(`${at}#${n.chunk}`); if (n.format === "written") seals.add(`${at}#${n.chunk}`); }
    for (const p of a.puzzles ?? []) if (p.firstTry.length && p.firstTry.every(Boolean)) puzzles.add(`${at}#${p.id}`);
    if (a.interview?.solved) liars.add(at);
  }
  return { locks: locks.size, seals: seals.size, puzzles: puzzles.size, liars: liars.size };
}
export type GearState = { id: GearId; name: string; earn: string; earned: boolean; have: number; need: number };
export function gearFrom(attempts: Parameters<typeof proofsFrom>[0]): GearState[] {
  const p = proofsFrom(attempts);
  return GEAR.map((g) => { const n = g.need(p); return { id: g.id, name: g.name, earn: g.earn, earned: n.have >= n.need, have: Math.min(n.have, n.need), need: n.need }; });
}
// The saved profile (investigator_profiles: avatar jsonb, gear jsonb).
export type InvestigatorProfile = { avatar: { id: AvatarId } | null; gear: GearId[] };
export const parseAvatar = (x: unknown): { id: AvatarId } | null => (x && typeof x === "object" && isAvatar((x as { id?: unknown }).id) ? { id: (x as { id: AvatarId }).id } : null);
