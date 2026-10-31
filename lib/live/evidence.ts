// Live rounds in the Teacher Evidence View: for every round a class played, each squad's answer and result, and what each
// student did in their role. Built from the response rows (each one records the player and the role they acted in).
// Flagged writing is shown here, marked, because this view is the teacher's only; it never reaches the host screen.
import type { WorldPack } from "../world-schema.ts";
import { freezeLine } from "../freeze.ts";
import { raceTotals } from "./race.ts";
import { ROLE_INFO, objectionResult, roundLie, scoreLieRound, scoreVerdictRound, storySquadScores, type LivePlayer, type LiveResponse, type LiveSession, type LiveSquad, type Role } from "./engine.ts";

export type LiveMemberEvidence = { nickname: string; studentId: string | null; actions: string[] };
export type LiveSquadEvidence = { name: string; members: LiveMemberEvidence[]; answer: string; explanation: string; flagged: boolean; result: string; points: number };
// freezes: every Freeze in the round (who, whom, when), so a teacher can spot a squad being targeted.
// questions: Proof Race's "Your question" chunks, every student question with its chunk (flagged ones marked).
export type LiveRoundEvidence = { sessionId: string; date: string; number: number; type: string; prompt: string; squads: LiveSquadEvidence[]; freezes?: string[]; questions?: { nickname: string; chunk: number; text: string; flagged: boolean }[] };
export type LiveSessionInput = { session: LiveSession; world: WorldPack; squads: LiveSquad[]; players: LivePlayer[]; responses: LiveResponse[]; absent?: string[] };

const TYPE_NAMES = { lie: "Live Spot the Lie", verdict: "Verdict Vote", objection: "Objection!", story: "Story Mode", race: "Proof Race", bonus: "Bonus Round" } as const;
const text = (r: LiveResponse | undefined, key: string) => (r ? String(r.payload[key] ?? "") : "");

function actionLine(r: LiveResponse, world: WorldPack) {
  const role = r.role && r.role in ROLE_INFO ? `${ROLE_INFO[r.role as Role].name}: ` : "";
  switch (r.kind) {
    case "pin": return `${role}pinned "${text(r, "quote")}"`;
    case "pins": return `${role}pinned ${((r.payload.pins ?? []) as unknown[]).length} lines`;
    case "explain": return `${role}wrote the explanation${r.flagged ? " (flagged)" : ""}`;
    case "argument": return `${role}wrote the argument${r.flagged ? " (flagged)" : ""}`;
    case "approve": return `${role}approved`;
    case "object": return `${role}objected${text(r, "note") ? `: "${text(r, "note")}"` : ""}`;
    case "submit": return `${role}submitted`;
    case "vote": return `Voted: ${world.verdict?.theories.find((t) => t.id === r.payload.theoryId)?.name ?? "a theory"}`;
    case "counter_vote": return `Voted ${r.payload.sustain ? "sustained" : "overruled"}`;
    case "story_pin": return r.payload.remove ? "" : `Round ${Number(r.payload.step) + 1}: pinned "${text(r, "line").replace(/\s+/g, " ")}"`;
    case "story_react": return `Round ${Number(r.payload.step) + 1}: reacted${r.flagged ? " (flagged)" : ""}: ${text(r, "stemText")} ${text(r, "body")}`;
    case "story_freeze": return `Round ${Number(r.payload.step) + 1}: froze ${text(r, "targetName")}`;
    case "story_vote": return `Round ${Number(r.payload.step) + 1}: voted for "${text(r, "line").replace(/\s+/g, " ")}"`;
    case "story": { const rec = r.payload.record as { round?: number; points?: number; detail?: string; proof?: string[] } | undefined; return `Story Mode round ${rec?.round ?? Number(r.payload.step) + 1}: ${rec?.points ?? 0} pts${rec?.detail ? ` (${rec.detail})` : ""}${rec?.proof?.length ? `, proof: ${rec.proof.map((p) => `"${p.replace(/\s+/g, " ")}"`).join(" | ")}` : ""}`; }
    case "race_gist": return `Chunk ${Number(r.payload.step) + 1}: summary ${Number(r.payload.points) > 0 ? "right" : "missed"} (${Number(r.payload.points ?? 0)} pts)`;
    case "race_question": return `Chunk ${Number(r.payload.step) + 1}: asked "${text(r, "text")}"${r.flagged ? " (flagged)" : ""}`;
    case "race_tap": { const p = r.payload as { step: number; correct?: boolean; late?: boolean; answerRight?: boolean; proofRight?: boolean; points?: number };
      return `Chunk ${Number(p.step) + 1}: ${p.correct ? `proved it (${Number(p.points ?? 0)} pts)` : p.late ? "time ran out" : p.answerRight && !p.proofRight ? "right answer, proof missed" : "missed"}`; }
    case "race_refresh": return `Refresher, chunk ${Number(r.payload.index) + 1}: ${r.payload.fixed ? "fixed it" : "not yet"}`;
    case "race_note": return `Case Notes, chunk ${Number(r.payload.index) + 1}: "${text(r, "text")}"`;
    case "bonus_pick": return `Bonus Round, chunk ${Number(r.payload.index) + 1}: defended "${text(r, "stem")} ${text(r, "reason")}"`;
    case "bonus_submit": return "Bonus Round: handed in the Squad Case File";
    case "race_unknown": return `Chunk ${Number(r.payload.step) + 1}: marked words they don't know: ${((r.payload.words as string[] | undefined) ?? []).join(", ")}`;
    default: return "";
  }
}

export function liveRoundEvidence(input: LiveSessionInput): LiveRoundEvidence[] {
  const { session, world, squads, players, responses, absent = [] } = input;
  const date = session.createdAt.slice(0, 10);
  const out: LiveRoundEvidence[] = [];
  session.rounds.forEach((round, i) => {
    if (i > session.roundIndex) return;
    const rows = responses.filter((r) => r.roundIndex === i).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const latest = (squadId: string, kind: LiveResponse["kind"]) => [...rows].reverse().find((r) => r.squadId === squadId && r.kind === kind);
    // Results per squad, from the same rules the host screen uses.
    const results = new Map<string, { result: string; points: number }>();
    let prompt = "";
    if (round.type === "lie") {
      const lie = roundLie(world, round);
      prompt = lie ? `${round.planted ? "Planted by a classmate · " : ""}${world.characters.find((c) => c.id === lie.character_id)?.name ?? "A witness"} said: "${lie.false_claim}"` : "";
      if (lie) for (const s of scoreLieRound(lie, squads, responses, i, round.planted?.writerSquadId ?? null)) results.set(s.squadId, { result: s.detail, points: s.points });
    } else if (round.type === "verdict") {
      prompt = world.verdict?.question ?? "";
      for (const s of scoreVerdictRound(squads, responses, i)) results.set(s.squadId, { result: s.theoryId ? `${world.verdict?.theories.find((t) => t.id === s.theoryId)?.name ?? s.theoryId} · ${s.detail}` : s.detail, points: s.points });
    } else if (round.type === "race") {
      prompt = `Proof Race · ${world.expeditions?.find((e) => e.id === round.settings.expeditionId)?.title ?? "Expedition"} · grades ${round.settings.gradeBand.replace("-", " to ")}`;
    } else if (round.type === "bonus") {
      prompt = "Bonus Round · squads compare Case Notes and agree on the strongest proof";
      for (const sq of squads) { const picks = rows.filter((r) => r.kind === "bonus_pick" && r.squadId === sq.id), agreed = new Set(picks.map((r) => Number(r.payload.index))).size, handed = rows.some((r) => r.kind === "bonus_submit" && r.squadId === sq.id); results.set(sq.id, { result: `${agreed} question${agreed === 1 ? "" : "s"} agreed${handed ? " · Squad Case File handed in" : ""}`, points: 0 }); }
    } else if (round.type === "story") {
      prompt = `Story Mode · ${world.scenes.find((sc) => sc.id === round.sceneId)?.story_mode?.call.bank[0].question ?? round.sceneId}`;
      for (const s of storySquadScores(squads, responses, i, players, absent)) results.set(s.squadId, { result: `Members' average: ${s.points}`, points: s.points });
    } else {
      const o = objectionResult(round, responses, i);
      const defend = squads.find((s) => s.id === round.defendSquadId)?.name ?? "A squad";
      prompt = `${defend}'s pinned line: "${round.pin.quote}"`;
      results.set(round.objectSquadId, { result: o.countered ? `Objected · ${o.sustained ? "sustained" : "overruled"}${o.overridden ? " by the teacher" : ""} (${o.sustain}–${o.overrule})` : "No counter", points: o.scores[0].points });
      results.set(round.defendSquadId, { result: `Defended · ${o.sustained ? "objection sustained" : "evidence held"}`, points: o.scores[1].points });
    }
    const verdict = round.type === "verdict";
    // Proof Race without squads: every player in one group, with their points.
    const groups = round.type === "race" && !players.some((p) => p.squadId) ? [{ id: "__all", name: "Everyone", position: 0 }] : squads;
    const raceTotal = round.type === "race" ? raceTotals(responses, i, players, Number.MAX_SAFE_INTEGER) : null;
    const squadRows = groups.flatMap((sq): LiveSquadEvidence[] => {
      // Roster order: current members, then anyone who acted for this squad and has since moved.
      const memberIds = new Set(players.filter((p) => sq.id === "__all" || p.squadId === sq.id).map((p) => p.id));
      for (const r of rows) if (r.squadId === sq.id && r.playerId) memberIds.add(r.playerId);
      if (!memberIds.size) return [];
      const evidence = verdict ? latest(sq.id, "pins") : latest(sq.id, "pin");
      const words = verdict ? latest(sq.id, "argument") : latest(sq.id, "explain");
      const answer = verdict ? ((evidence?.payload.pins ?? []) as { quote: string }[]).map((p) => p.quote).join(" | ") : text(evidence, "quote");
      const r = results.get(sq.id) ?? { result: "", points: 0 };
      // Proof Race: the group's points are its players' points (squads by average, as on the board).
      if (raceTotal) { const pts = [...memberIds].map((pid) => raceTotal.get(pid) ?? 0); r.points = sq.id === "__all" ? pts.reduce((a, b) => a + b, 0) : Math.round(pts.reduce((a, b) => a + b, 0) / Math.max(1, pts.length)); r.result = sq.id === "__all" ? "Class total" : "Squad average"; }
      if (round.type === "objection" && sq.id !== round.objectSquadId && sq.id !== round.defendSquadId) r.result = "Voted";
      return [{
        name: sq.name, answer, explanation: text(words, "text"), flagged: !!words?.flagged, ...r,
        members: [...memberIds].map((pid) => {
          const p = players.find((x) => x.id === pid);
          const acts = rows.filter((x) => x.playerId === pid).map((x) => actionLine(x, world)).filter(Boolean);
          return { nickname: p?.nickname ?? "Player", studentId: p?.studentId ?? null, actions: raceTotal ? [`${raceTotal.get(pid) ?? 0} pts`, ...acts] : acts };
        }),
      }];
    });
    const freezes = rows.filter((r) => r.kind === "story_freeze").map((r) => freezeLine({ by: `${players.find((p) => p.id === r.playerId)?.nickname ?? "A player"} (${squads.find((q) => q.id === r.squadId)?.name ?? "a squad"})`, target: text(r, "targetName"), at: r.createdAt, where: `Story Mode round ${Number(r.payload.step) + 1}` }));
    const questions = rows.filter((r) => r.kind === "race_question").map((r) => ({ nickname: players.find((p) => p.id === r.playerId)?.nickname ?? "A player", chunk: Number(r.payload.step) + 1, text: text(r, "text"), flagged: r.flagged }));
    out.push({ sessionId: session.id, date, number: i + 1, type: TYPE_NAMES[round.type], prompt, squads: squadRows, ...(freezes.length ? { freezes } : {}), ...(questions.length ? { questions } : {}) });
  });
  return out;
}
