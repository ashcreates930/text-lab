// Freeze: a power-up for rival and squad-vs-squad play. It locks the tap, not the text: a frozen player (or squad) can
// still read, scroll and pin, but can't tap lines to answer or lock in for 5 seconds, and their timer pauses meanwhile,
// so a freeze never costs reading time.
// - Earned only by reading: one Freeze for every 3 correct proofs in a row. Never bought. Hold at most one.
// - One Freeze per player per round. Not the same opponent twice in a row. A frozen player or squad is shielded for the
//   rest of that round. Never against teammates.
// - Rival play (demo and class, outside live rounds): always on; students can freeze the computer rival, which never
//   freezes anyone. Live class: squads only, and only when the host turns Freezes on (off by default). Solo: none.
// Every freeze is logged (who, whom, when) for the teacher Evidence view.
export const FREEZE_MS = 5000;
export const FREEZE_STREAK = 3;

// A correct proof that brings the streak to 3, 6, 9… earns a Freeze, if the player isn't already holding one.
export const earnsFreeze = (streakAfter: number, holding: boolean) => !holding && streakAfter > 0 && streakAfter % FREEZE_STREAK === 0;

export type FreezeCheck = { ok: true } | { ok: false; reason: string };
// Whether a player may freeze a target now. round: this round's number; usedThisRound: they already froze someone this
// round; shielded: the target was frozen this round; last: the player's previous freeze.
export function canFreeze(o: { holding: boolean; usedThisRound: boolean; target: string; teammate: boolean; shielded: boolean; last: { target: string; round: number } | null; round: number }): FreezeCheck {
  if (!o.holding) return { ok: false, reason: "Earn a Freeze with 3 right proofs in a row." };
  if (o.teammate) return { ok: false, reason: "Never your own team." };
  if (o.usedThisRound) return { ok: false, reason: "One Freeze per round." };
  if (o.shielded) return { ok: false, reason: "Shielded this round." };
  if (o.last && o.last.target === o.target && o.last.round === o.round - 1) return { ok: false, reason: "Not twice in a row." };
  return { ok: true };
}

// How long a player or squad has been frozen during a stretch of time (milliseconds), so their timer can pause.
export function frozenMs(freezeStarts: number[], from: number, to: number) {
  return freezeStarts.reduce((n, at) => n + Math.max(0, Math.min(at + FREEZE_MS, to) - Math.max(at, from)), 0);
}
// Seconds left on a freeze that started at `at`, or 0.
export const freezeLeft = (at: number | null, now: number) => (at === null ? 0 : Math.max(0, Math.ceil((at + FREEZE_MS - now) / 1000)));

// The log line the Evidence view shows.
export type FreezeLog = { by: string; target: string; at: string; where: string };
export const freezeLine = (f: FreezeLog) => `${f.by} froze ${f.target} · ${f.where} · ${new Date(f.at).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", second: "2-digit" })}`;
