// One form for feedback and the waitlist: choice lists, labels, and the validation shared by the browser and the server.
import { z } from "zod";
import { plans, type PlanId } from "../config/pricing.ts";

type Choice<T extends string> = readonly (readonly [T, string])[];
export const sideChoices: Choice<"student" | "teacher" | "both" | "not_yet"> = [["student", "Student"], ["teacher", "Teacher"], ["both", "Both"], ["not_yet", "Haven't tried it yet"]];
export const oneScreenChoices: Choice<"yes" | "mostly" | "no"> = [["yes", "Yes"], ["mostly", "Mostly"], ["no", "No"]];
export const wouldUseChoices: Choice<"yes" | "maybe" | "no"> = [["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]];
export const deviceChoices: Choice<"ipad" | "iphone" | "chromebook" | "windows" | "mac" | "android" | "other"> = [["ipad", "iPad"], ["iphone", "iPhone"], ["chromebook", "Chromebook"], ["windows", "Windows"], ["mac", "Mac"], ["android", "Android"], ["other", "Other"]];
export const roleChoices: Choice<"teacher" | "instructional coach" | "school administrator" | "district leader" | "parent or homeschool educator" | "microschool leader" | "other"> = [["teacher", "Teacher"], ["instructional coach", "Instructional coach"], ["school administrator", "School administrator"], ["district leader", "District leader"], ["parent or homeschool educator", "Parent or homeschool educator"], ["microschool leader", "Microschool leader"], ["other", "Other"]];
export const intentChoices: Choice<"buy_now" | "likely" | "lower_price" | "exploring"> = [["buy_now", "I'd buy now if checkout were open"], ["likely", "Likely, when it's ready"], ["lower_price", "Only at a lower price"], ["exploring", "Just exploring"]];
export const startChoices: Choice<"this_month" | "this_semester" | "next_school_year" | "not_sure"> = [["this_month", "This month"], ["this_semester", "This semester"], ["next_school_year", "Next school year"], ["not_sure", "Not sure"]];
export const payerChoices: Choice<"myself" | "school" | "district" | "grant" | "not_sure"> = [["myself", "Myself"], ["school", "My school"], ["district", "My district"], ["grant", "A grant or other funding"], ["not_sure", "Not sure"]];
export const approverChoices: Choice<"yes" | "helps_decide" | "no"> = [["yes", "Yes"], ["helps_decide", "I help decide"], ["no", "No"]];
export const yesMaybeNo: Choice<"yes" | "maybe" | "no"> = [["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]];
export const states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","Outside the United States"] as const;
export const label = <T extends string>(list: Choice<T>, v: string | null | undefined) => list.find(([k]) => k === v)?.[1] ?? "";
const keys = <T extends string>(list: Choice<T>) => list.map(([k]) => k) as [T, ...T[]];

// Plans where the form asks who approves purchases and about a letter of intent.
export const approvalPlans: PlanId[] = ["school", "district", "pilot"];
export const planIds = plans.map((p) => p.id) as [PlanId, ...PlanId[]];
export const SOURCE_RE = /^[a-z0-9-]{1,40}$/;

const shortText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);
export const FeedbackSchema = z.object({
  side: z.enum(keys(sideChoices)).optional(),
  ease: z.number().int().min(1).max(5).optional(),
  oneScreen: z.enum(keys(oneScreenChoices)).optional(),
  wouldUse: z.enum(keys(wouldUseChoices)).optional(),
  change: shortText(1000),
  broken: shortText(1000),
  device: z.enum(keys(deviceChoices)).optional(),
});
export const WaitlistSchema = z.object({
  plan: z.enum(planIds),
  intent: z.enum(keys(intentChoices)),
  priceNamed: z.number().min(0).max(1_000_000).optional(),
  pricePeriod: z.enum(["month", "year"]).optional(),
  start: z.enum(keys(startChoices)).optional(),
  payer: z.enum(keys(payerChoices)).optional(),
  approver: z.enum(keys(approverChoices)).optional(),
  loi: z.enum(keys(yesMaybeNo)).optional(),
  pilotCommit: z.enum(keys(yesMaybeNo)).optional(),
  students: z.number().int().min(1).max(1_000_000).optional(),
  lockFoundingPrice: z.boolean(),
  name: z.string().trim().min(1, "Enter your full name.").max(120),
  email: z.string().trim().max(254).email("Enter a valid email address."),
  role: z.enum(keys(roleChoices)).optional(),
  organization: shortText(200),
  state: z.enum(states).optional(),
  wantsUpdates: z.boolean(),
}).superRefine((w, ctx) => {
  const plan = plans.find((p) => p.id === w.plan)!;
  if (plan.studentsRequired && !w.students) ctx.addIssue({ code: "custom", path: ["students"], message: "Enter the approximate number of students." });
  if (w.intent === "lower_price" && w.priceNamed !== undefined && !w.pricePeriod) ctx.addIssue({ code: "custom", path: ["pricePeriod"], message: "Choose per month or per year." });
});
export const SubmissionSchema = z.object({
  feedback: FeedbackSchema.optional(),
  waitlist: WaitlistSchema.optional(),
  source: z.string().regex(SOURCE_RE).optional(),
  website: z.string().max(200).optional(), // honeypot: people never see this field
}).refine((s) => s.waitlist || (s.feedback && Object.values(s.feedback).some((v) => v !== undefined)), { message: "Add some feedback or join the waitlist." });
export type Submission = z.infer<typeof SubmissionSchema>;
export const hasFeedback = (f: z.infer<typeof FeedbackSchema> | undefined) => !!f && Object.values(f).some((v) => v !== undefined);
