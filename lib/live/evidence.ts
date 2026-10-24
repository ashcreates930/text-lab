// Live rounds in the Teacher Evidence View: for every round a class played, each squad's answer and result, and what each
// student did in their role. Built from the response rows (each one records the player and the role they acted in).
// Flagged writing is shown here, marked, because this view is the teacher's only; it never reaches the host screen.
import type { WorldPack } from "../world-schema.ts";
import { ROLE_INFO, objectionResult, roundLie, scoreLieRound, scoreVerdictRound, storySquadScores, type LivePlayer, type LiveResponse, type LiveSession, type LiveSquad, type Role } from "./engine.ts";

export type LiveMemberEvidence = { nickname: string; studentId: string | null; actions: string[] };
export type LiveSquadEvidence = { name: string; members: LiveMemberEvidence[]; answer: string; explanation: string; flagged: boolean; result: string; points: number };
export type LiveRoundEvidence = { sessionId: string; date: string; number: number; type: string; prompt: string; squads: LiveSquadEvidence[] };
export type LiveSessionInput = { session: LiveSession; world: WorldPack; squads: LiveSquad[]; players: LivePlayer[]; responses: LiveResponse[]; absent?: string[] };

const TYPE_NAMES = { lie: "Live Spot the Lie", verdict: "Verdict Vote", objection: "Objection!", story: "Story Mode" } as const;
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
    case "story_vote": return `Round ${Number(r.payload.step) + 1}: voted for "${text(r, "line").replace(/\s+/g, " ")}"`;
    case "story": { const rec = r.payload.record as { round?: number; points?: number; detail?: string; proof?: string[] } | undefined; return `Story Mode round ${rec?.round ?? Number(r.payload.step) + 1}: ${rec?.points ?? 0} pts${rec?.detail ? ` (${rec.detail})` : ""}${rec?.proof?.length ? `, proof: ${rec.proof.map((p) => `"${p.replace(/\s+/g, " ")}"`).join(" | ")}` : ""}`; }
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
    } else if (round.type === "story") {
      prompt = `Story Mode · ${world.scenes.find((sc) => sc.id === round.sceneId)?.story_mode?.call.question ?? round.sceneId}`;
      for (const s of storySquadScores(squads, responses, i, players, absent)) results.set(s.squadId, { result: `Members' average: ${s.points}`, points: s.points });
    } else {
      const o = objectionResult(round, responses, i);
      const defend = squads.find((s) => s.id === round.defendSquadId)?.name ?? "A squad";
      prompt = `${defend}'s pinned line: "${round.pin.quote}"`;
      results.set(round.objectSquadId, { result: o.countered ? `Objected · ${o.sustained ? "sustained" : "overruled"}${o.overridden ? " by the teacher" : ""} (${o.sustain}–${o.overrule})` : "No counter", points: o.scores[0].points });
      results.set(round.defendSquadId, { result: `Defended · ${o.sustained ? "objection sustained" : "evidence held"}`, points: o.scores[1].points });
    }
    const verdict = round.type === "verdict";
    const squadRows = squads.flatMap((sq): LiveSquadEvidence[] => {
      // Roster order: current members, then anyone who acted for this squad and has since moved.
      const memberIds = new Set(players.filter((p) => p.squadId === sq.id).map((p) => p.id));
      for (const r of rows) if (r.squadId === sq.id && r.playerId) memberIds.add(r.playerId);
      if (!memberIds.size) return [];
      const evidence = verdict ? latest(sq.id, "pins") : latest(sq.id, "pin");
      const words = verdict ? latest(sq.id, "argument") : latest(sq.id, "explain");
      const answer = verdict ? ((evidence?.payload.pins ?? []) as { quote: string }[]).map((p) => p.quote).join(" | ") : text(evidence, "quote");
      const r = results.get(sq.id) ?? { result: "", points: 0 };
      if (round.type === "objection" && sq.id !== round.objectSquadId && sq.id !== round.defendSquadId) r.result = "Voted";
      return [{
        name: sq.name, answer, explanation: text(words, "text"), flagged: !!words?.flagged, ...r,
        members: [...memberIds].map((pid) => {
          const p = players.find((x) => x.id === pid);
          return { nickname: p?.nickname ?? "Player", studentId: p?.studentId ?? null, actions: rows.filter((x) => x.playerId === pid).map((x) => actionLine(x, world)).filter(Boolean) };
        }),
      }];
    });
    out.push({ sessionId: session.id, date, number: i + 1, type: TYPE_NAMES[round.type], prompt, squads: squadRows });
  });
  return out;
}
