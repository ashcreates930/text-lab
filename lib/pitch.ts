// The owner's Pitch tab: what the waitlist says about paid demand. Pure functions so the math is testable by hand.
import { plans, type PlanId } from "../config/pricing.ts";

export type WaitlistRow = {
  id: string; created_at: string; name: string; email: string; role: string | null; organization: string | null; state: string | null;
  plan: PlanId | null; intent: "buy_now" | "likely" | "lower_price" | "exploring" | null; price_named: number | string | null; price_period: "month" | "year" | null;
  students: number | null; lock_founding_price: boolean; loi: string | null; pilot_commit: string | null; source: string | null;
};
export const intents = ["buy_now", "likely", "lower_price", "exploring"] as const;

// Stated annual value of one entry at list price: yearly prices; School $1,500; Pilot $500; District $5 per student.
// Professional development is one-time training, not an annual subscription, so it is not counted here.
export function statedAnnualValue(row: Pick<WaitlistRow, "plan" | "students">): number {
  const plan = plans.find((p) => p.id === row.plan);
  if (!plan || plan.id === "pd") return 0;
  if (plan.perStudentYearly) return plan.perStudentYearly * (row.students ?? 0);
  return plan.yearly ?? 0;
}
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export function computePitch(rows: WaitlistRow[]) {
  const count = (key: (r: WaitlistRow) => string) => rows.reduce<Record<string, number>>((acc, r) => { const k = key(r); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {});
  const intentByPlan = Object.fromEntries(plans.map((p) => [p.id, Object.fromEntries(intents.map((i) => [i, rows.filter((r) => r.plan === p.id && r.intent === i).length]))])) as Record<PlanId, Record<(typeof intents)[number], number>>;
  const names = (pred: (r: WaitlistRow) => boolean) => rows.filter(pred).map((r) => r.organization ? `${r.name} (${r.organization})` : r.name);
  const orgs = new Set(rows.filter((r) => r.organization && (["school", "district", "pilot"].includes(r.plan ?? "") || ["school administrator", "district leader"].includes(r.role ?? ""))).map((r) => r.organization!.trim().toLowerCase()));
  const sum = (intent: "buy_now" | "likely") => rows.filter((r) => r.intent === intent).reduce((t, r) => t + statedAnnualValue(r), 0);
  const lowerPrice = plans.map((p) => {
    const yearly = rows.filter((r) => r.plan === p.id && r.intent === "lower_price" && r.price_named !== null && r.price_named !== "").map((r) => Number(r.price_named) * (r.price_period === "month" ? 12 : 1)).filter((n) => Number.isFinite(n));
    return { plan: p.id, name: p.name, count: yearly.length, median: yearly.length ? median(yearly) : null, min: yearly.length ? Math.min(...yearly) : null, max: yearly.length ? Math.max(...yearly) : null };
  }).filter((x) => x.count);
  const buyNow = sum("buy_now"), likely = sum("likely");
  return {
    total: rows.length,
    byPlan: count((r) => r.plan ?? "none"),
    bySource: count((r) => r.source ?? "direct"),
    intentByPlan,
    locks: names((r) => r.lock_founding_price),
    lettersOfIntent: names((r) => r.loi === "yes"),
    pilotCommitments: names((r) => r.pilot_commit === "yes"),
    students: rows.reduce((t, r) => t + (r.students ?? 0), 0),
    schoolsAndDistricts: orgs.size,
    revenue: { buyNow, likely, total: buyNow + likely },
    trainingInterest: rows.filter((r) => r.plan === "pd" && (r.intent === "buy_now" || r.intent === "likely")).length,
    lowerPrice,
  };
}
export type Pitch = ReturnType<typeof computePitch>;

export function pitchCsv(p: Pitch): string {
  const planName = (id: string) => plans.find((x) => x.id === id)?.name ?? id;
  const rows: (string | number)[][] = [["section", "item", "value"], ["Totals", "Waitlist entries", p.total]];
  for (const [k, v] of Object.entries(p.byPlan)) rows.push(["By plan", planName(k), v]);
  for (const [k, v] of Object.entries(p.bySource)) rows.push(["By source", k, v]);
  for (const [plan, byIntent] of Object.entries(p.intentByPlan)) for (const [i, v] of Object.entries(byIntent)) if (v) rows.push(["Intent", `${planName(plan)}: ${i}`, v]);
  rows.push(["Commitments", "Founding price locks", p.locks.length], ["Commitments", "Founding price lock names", p.locks.join("; ")], ["Commitments", "Letters of intent (yes)", p.lettersOfIntent.length], ["Commitments", "Letter of intent names", p.lettersOfIntent.join("; ")], ["Commitments", "Pilot commitments (yes)", p.pilotCommitments.length], ["Commitments", "Pilot commitment names", p.pilotCommitments.join("; ")]);
  rows.push(["Reach", "Students represented", p.students], ["Reach", "Schools and districts represented", p.schoolsAndDistricts]);
  rows.push(["Stated purchase intent, not committed revenue", "Buy now (annual list price)", p.revenue.buyNow], ["Stated purchase intent, not committed revenue", "Likely (annual list price)", p.revenue.likely], ["Stated purchase intent, not committed revenue", "Total", p.revenue.total], ["Stated purchase intent, not committed revenue", "Professional development interest (not in total)", p.trainingInterest]);
  for (const l of p.lowerPrice) rows.push(["Lower-price answers (per year)", `${l.name}: median`, l.median ?? ""], ["Lower-price answers (per year)", `${l.name}: range`, `${l.min}–${l.max} (${l.count})`]);
  return rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
}
