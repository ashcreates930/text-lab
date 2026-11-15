// Escape rooms, phase 7: live squad escapes. When a live room runs with squads, each squad works as an escape team:
// - Roles rotate every room: the Reader reads each passage aloud, the Evidence Keeper keeps the squad's Case File, the
//   Interviewer asks the witnesses and leads Name the Liar, and the Recorder locks in the squad's answer. A squad
//   smaller than four shares out the extra roles.
// - Every member first commits an answer privately on their own phone (their own first try, the one that counts for
//   mastery and the Evidence view). Once they have, the squad sees everyone's commits, talks, and the Recorder locks in
//   one of them as the squad's answer (the shared lock-in), for squad points on the board.
// - The squad Case File holds the witnesses met and every lock the squad opened with its shared answer.
// Pure rules shared by the server, the phones and the Evidence view.
import type { Answer } from "../expedition.ts";

export const SQUAD_ROLES = ["reader", "keeper", "interviewer", "recorder"] as const;
export type SquadRole = (typeof SQUAD_ROLES)[number];
export const SQUAD_ROLE_INFO: Record<SquadRole, { name: string; job: string }> = {
  reader: { name: "Reader", job: "Read each passage aloud to your squad before anyone answers." },
  keeper: { name: "Evidence Keeper", job: "Keep the squad's Case File open and point to the lines that prove things." },
  interviewer: { name: "Interviewer", job: "Ask each witness the room's question, and lead the talk at Name the Liar." },
  recorder: { name: "Recorder", job: "After everyone commits, lock in the answer the squad agrees on." },
};
// Points for a squad's shared lock-in when it proves the lock (added to the squad's row on the board).
export const SQUAD_LOCK_POINTS = 300;

// Each member's roles in this room (members in join order). Roles move one seat each room, and a squad of 2 or 3
// shares out the roles nobody holds, so every squad has all four.
export function rolesFor(members: string[], room: number): Record<string, SquadRole[]> {
  const out: Record<string, SquadRole[]> = Object.fromEntries(members.map((m) => [m, []]));
  if (!members.length) return out;
  SQUAD_ROLES.forEach((role, r) => { out[members[(r + room - 1) % members.length]].push(role); });
  return out;
}
export const recorderOf = (members: string[], room: number) => members.find((m) => rolesFor(members, room)[m].includes("recorder")) ?? null;

// The shared lock-in: open once every present member of the squad has committed (or the question has closed for the
// rest), and only once per squad and lock.
export function sharedLockOpen(members: string[], committed: Set<string>) {
  return members.length > 0 && members.every((m) => committed.has(m));
}
export type SquadLock = { step: number; from: string; answer: Answer; correct: boolean; points: number; lines: string[] };
