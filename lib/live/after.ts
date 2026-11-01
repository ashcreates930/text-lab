// After a live Proof Race: each phone's Refresher and Case Notes, and the Bonus Round (squads compare Case Notes and
// agree on the strongest proof). Rules: lib/case-notes.ts. Rows: race_refresh (one try per Refresher item), race_note
// (the student's own notes), bonus_pick (the squad's agreed answer for a flagged question, defended by whoever picked
// it) and bonus_submit (the Reporter hands in the Squad Case File). Bonus points go to a separate squad board.
import type { WorldPack } from "../world-schema.ts";
import type { SourcePassage } from "../source-passages.ts";
import type { LivePlayer, LiveResponse, LiveSquad } from "./engine.ts";
import { TYPE_INFO, chunkTokens, joinedPassages, proofShown, proofTokens, type Answer, type RaceChunk } from "../expedition.ts";
import { BONUS_STEMS, bonusProblems, caseNotes, flaggedQuestions, refresherAward, refresherCorrect, refresherItems, refresherTask, rolesFor, squadCaseFile, type BonusPick, type ChunkResult, type MemberResults } from "../case-notes.ts";
import { liveRaceChunks, playerChunk, type LiveRaceRound } from "./race.ts";
import { evidenceSentences } from "../lies.ts";

export type LiveBonusRound = { type: "bonus"; raceIndex: number; startedAt: string };
const rows = (responses: LiveResponse[], roundIndex: number, kind: string) => responses.filter((r) => r.roundIndex === roundIndex && r.kind === kind);

// One player's race, as Case Notes results.
export function liveResults(chunks: RaceChunk[], responses: LiveResponse[], raceIndex: number, playerId: string): ChunkResult[] {
  return chunks.map((c) => { const m = playerChunk(responses, raceIndex, c.index, playerId); return { index: c.index, answer: m.tap?.answer ?? null, correct: m.correct, late: !!m.tap?.late || !m.tap, gist: m.gist, typed: m.question, unknown: m.unknown }; });
}
// The phone's after-race state: Refresher items (no answers), what's been tried, Case Notes and the award.
export function liveAfter(world: WorldPack, passages: SourcePassage[], race: LiveRaceRound, responses: LiveResponse[], raceIndex: number, playerId: string) {
  const chunks = liveRaceChunks(world, passages, race), results = liveResults(chunks, responses, raceIndex, playerId);
  const items = refresherItems(chunks, results), callAll = joinedPassages(chunks);
  const tries = new Map(rows(responses, raceIndex, "race_refresh").filter((r) => r.playerId === playerId).map((r) => [Number(r.payload.k), r.payload as { k: number; fixed: boolean }]));
  const fixed = items.map((_, k) => !!tries.get(k)?.fixed);
  const notesText: Record<number, string> = {};
  for (const r of rows(responses, raceIndex, "race_note").filter((x) => x.playerId === playerId)) notesText[Number(r.payload.index)] = String(r.payload.text ?? "");
  return {
    refresher: items.map((it, k) => {
      const c = chunks[it.index], q = c.chunk.question, task = refresherTask(it, q), tokens = chunkTokens(c.lines), tried = tries.get(k);
      return { kind: it.kind, chunk: it.index + 1, task, typeName: TYPE_INFO[q.type].name, prompt: task === "meaning" ? `${q.choices2!.prompt} ${q.prompt}` : q.prompt,
        hint: it.kind === "gist" ? "Which choice tells the whole chunk, not just one detail?" : q.hint, chunkView: { lines: c.lines, discovery: c.chunk.discovery }, passages: c.passages,
        options: task === "gist" ? c.chunk.gist.options.map((o) => o.text) : task === "meaning" ? q.choices2!.options.map((o) => o.text) : null, callPassages: task === "pin2" ? callAll : null,
        // Once tried: whether it was fixed, and the proof to light up.
        result: tried ? { fixed: tried.fixed, shown: it.kind === "gist" ? [] : proofTokens(q, tokens, c.lines), lines: q.type === "make_call" ? proofShown(q, tokens).lines : [] } : null };
    }),
    tried: items.map((_, k) => tries.has(k)),
    notes: caseNotes(chunks, results, { items, fixed }, notesText), award: refresherAward(items, fixed),
  };
}
// A Refresher answer: one try per item, checked here.
export function refreshAnswer(world: WorldPack, passages: SourcePassage[], race: LiveRaceRound, responses: LiveResponse[], raceIndex: number, playerId: string, payload: Record<string, unknown>) {
  const chunks = liveRaceChunks(world, passages, race), items = refresherItems(chunks, liveResults(chunks, responses, raceIndex, playerId));
  const k = Number(payload.k); if (!Number.isInteger(k) || k < 0 || k >= items.length) return "That isn't one of your Refresher questions.";
  if (rows(responses, raceIndex, "race_refresh").some((r) => r.playerId === playerId && Number(r.payload.k) === k)) return "You've already tried this one.";
  const a = (payload.answer ?? {}) as Answer, it = items[k];
  const fixed = refresherCorrect(it, chunks[it.index], a, joinedPassages(chunks).flatMap((p) => evidenceSentences(p.text)));
  return { k, index: it.index, kind: it.kind, fixed };
}

// ---------- The Bonus Round ----------
export function bonusMembers(players: LivePlayer[], squadId: string | null) { return squadId ? players.filter((p) => p.squadId === squadId) : []; }
export function bonusPicks(responses: LiveResponse[], bonusIndex: number, squadId: string): BonusPick[] {
  const latest = new Map<number, BonusPick>();
  for (const r of rows(responses, bonusIndex, "bonus_pick").filter((x) => x.squadId === squadId)) { const p = r.payload as BonusPick; latest.set(p.index, { ...p, defender: r.playerId! }); }
  return [...latest.values()];
}
// One squad's Bonus Round: its members' answers on each flagged question, the picks so far, what's left, and its file.
export function bonusSquad(world: WorldPack, passages: SourcePassage[], race: LiveRaceRound, responses: LiveResponse[], raceIndex: number, bonusIndex: number, squad: LiveSquad, players: LivePlayer[]) {
  const chunks = liveRaceChunks(world, passages, race), members = bonusMembers(players, squad.id);
  const results: MemberResults[] = members.map((m) => ({ id: m.id, name: m.nickname, results: liveResults(chunks, responses, raceIndex, m.id) }));
  const flagged = flaggedQuestions(chunks, results), picks = bonusPicks(responses, bonusIndex, squad.id);
  const notesOf = new Map(results.map((m) => [m.id, caseNotes(chunks, m.results)]));
  return {
    squadId: squad.id, name: squad.name, roles: rolesFor(members), members: members.map((m) => ({ id: m.id, nickname: m.nickname })),
    flagged: flagged.map((i) => ({ index: i, chunk: i + 1, type: TYPE_INFO[chunks[i].chunk.question.type].name, question: chunks[i].chunk.question.prompt,
      answers: results.map((m) => { const n = notesOf.get(m.id)![i]; return { id: m.id, nickname: m.name, answer: n.answer, proof: n.proof, raw: m.results[i]?.answer ?? null }; }) })),
    picks: picks.map((p) => ({ ...p, defenderName: members.find((m) => m.id === p.defender)?.nickname ?? "" })),
    problems: bonusProblems(flagged, members, picks), submitted: rows(responses, bonusIndex, "bonus_submit").some((r) => r.squadId === squad.id),
    file: squadCaseFile(squad.name, chunks, results, picks),
  };
}
// A pick: the squad uses one member's answer for a flagged question; whoever picks it defends it, with a sentence stem.
export function bonusPickAnswer(world: WorldPack, passages: SourcePassage[], race: LiveRaceRound, responses: LiveResponse[], raceIndex: number, bonusIndex: number, squad: LiveSquad, players: LivePlayer[], payload: Record<string, unknown>) {
  const s = bonusSquad(world, passages, race, responses, raceIndex, bonusIndex, squad, players);
  if (s.submitted) return "Your Squad Case File is already handed in.";
  const item = s.flagged.find((f) => f.index === Number(payload.index)); if (!item) return "That question isn't flagged for your squad.";
  const from = item.answers.find((a) => a.id === payload.from); if (!from?.raw) return "Pick a teammate's answer.";
  const stem = BONUS_STEMS.find((x) => x === payload.stem) ?? BONUS_STEMS[0], reason = String(payload.reason ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  if (reason.length < 3) return "Finish the sentence: say why.";
  return { index: item.index, from: from.id, answer: from.raw, stem, reason };
}
export const bonusSquads = (squads: LiveSquad[], players: LivePlayer[]) => squads.filter((q) => players.some((p) => p.squadId === q.id));
