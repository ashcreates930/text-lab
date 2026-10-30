// Students in the story: each world gives the student a part to play (world.student_role: a name, a one-line setup,
// the scene they start in, and a second-person intro card), and each choice point can carry a personal frame for that
// part (choice_point.role_frame). Before the game the student picks how they want to play (one tap); after the case
// closes, two quick interest taps ("Unlock your challenge") pick their Your Turn activities. All three are saved with
// their progress only. Characters hear only the student's part and how they play, never the interest answers.
// Teachers can turn roles and angles off for a class. Pure rules, shared by the screens, the chat route, the world
// validator and the tests.
import { z } from "zod";
import type { WorldPack } from "./world-schema.ts";

export const ANGLE_OPTIONS = {
  firedUpBy: { label: "What fires you up?", options: { unfairness: "Unfairness", underestimated: "Being underestimated", loyalty: "Loyalty", winning: "Winning", money: "Money" } },
  lane: { label: "What's your lane?", options: { sports: "Sports", music: "Music", gaming: "Gaming", fashion: "Fashion", "social-media": "Social media" } },
  style: { label: "How do you want to play?", options: { solo: "Solo", rival: "Rival", squad: "Squad", race: "Proof Race" } },
} as const;
export type AngleKey = keyof typeof ANGLE_OPTIONS;
export const ANGLE_STEPS = Object.keys(ANGLE_OPTIONS) as AngleKey[];
// Before the game: how they want to play. After the case closes: the two interest questions ("Unlock your challenge").
export const PLAY_STEP: AngleKey = "style";
export const INTEREST_STEPS: AngleKey[] = ["firedUpBy", "lane"];
export const UNLOCK = { title: "Unlock your challenge", line: "Two quick taps and we'll pick a challenge that fits you." } as const;
const ids = <K extends AngleKey>(k: K) => Object.keys(ANGLE_OPTIONS[k].options) as [string, ...string[]];
// Only these three choices are ever sent to the AI: no free text, nothing personal.
export const AngleSchema = z.object({
  firedUpBy: z.enum(ids("firedUpBy")).optional(),
  lane: z.enum(ids("lane")).optional(),
  style: z.enum(ids("style")).optional(),
}).strict();
export type Angle = z.infer<typeof AngleSchema>;
const label = (k: AngleKey, v: string | undefined) => (v ? (ANGLE_OPTIONS[k].options as Record<string, string>)[v] : undefined);

// The class settings for roles and angles (both on unless the teacher turns them off).
export type StoryPersonalSettings = { rolesOn: boolean; anglesOn: boolean };
export const DEFAULT_PERSONAL: StoryPersonalSettings = { rolesOn: true, anglesOn: true };

// What the character is told about the student: the student's part (from the world file) and how they play. The
// interest answers never reach a character. Characters address the student in that part, but every fact still comes
// from the source passages.
export function personaPrompt(world: Pick<WorldPack, "student_role">, angle: Angle | null | undefined, settings: StoryPersonalSettings = DEFAULT_PERSONAL) {
  const parts: string[] = [];
  const role = settings.rolesOn ? world.student_role : undefined;
  if (role) parts.push(`The student is playing a part in the story: ${role.name}. ${role.setup} Speak to them as that person, using "you". Their part adds no new events: every fact you mention must still come from the source passages, and you know nothing about them beyond that one line.`);
  const a = settings.anglesOn && angle ? AngleSchema.safeParse(angle) : null;
  if (a?.success) {
    const bits = [label("style", a.data.style) && `how they like to play: ${label("style", a.data.style)!.toLowerCase()}`].filter(Boolean);
    if (bits.length) parts.push(`The student picked an angle (${bits.join("; ")}). You may use at most one short, plain comparison to it when it makes your answer clearer. Never change or add story facts for it, and never mention that they picked it.`);
  }
  return parts.join(" ");
}

// Who the student is in the story, for "You are …" lines: their student role when roles are on, otherwise the
// world's first role (lowercased "the" so it reads inside a sentence).
export function partName(world: Pick<WorldPack, "student_role">, fallback: string, settings: StoryPersonalSettings = DEFAULT_PERSONAL) {
  const name = settings.rolesOn && world.student_role ? world.student_role.name : `the ${fallback}`;
  return name.replace(/^The /, "the ");
}

// The personal frame shown above a choice point when roles are on.
export function choiceFrame(world: Pick<WorldPack, "student_role">, choicePoint: { role_frame?: string } | null | undefined, settings: StoryPersonalSettings = DEFAULT_PERSONAL) {
  return settings.rolesOn && world.student_role && choicePoint?.role_frame ? choicePoint.role_frame : "";
}

// validate:worlds: a student role must be playable and stay a bystander, never one of the story's people.
export function studentRoleProblems(world: WorldPack): string[] {
  const role = world.student_role;
  if (!role) return [];
  const where = `${world.id} student_role`;
  const problems: string[] = [];
  if (!world.scenes.some((s) => s.id === role.start_scene)) problems.push(`${where}: start_scene ${role.start_scene} is not a scene`);
  if (/\n/.test(role.setup) || role.setup.length > 160) problems.push(`${where}: setup must be one line of at most 160 characters`);
  if (!/^You\b/.test(role.setup) || !/^You\b/.test(role.intro)) problems.push(`${where}: setup and intro speak to the student in the second person ("You …")`);
  if (role.intro.length > 420) problems.push(`${where}: intro must fit on one card (at most 420 characters)`);
  const lower = role.name.toLowerCase();
  for (const c of world.characters) if (lower.includes(c.name.toLowerCase())) problems.push(`${where}: the student can't play ${c.name}`);
  for (const id of role.never ?? []) if (lower.includes(id.toLowerCase().replace(/-/g, " "))) problems.push(`${where}: the student can't play ${id}`);
  for (const s of world.scenes) if (s.choice_point && !s.choice_point.role_frame?.trim()) problems.push(`${where}: scene ${s.id} has a choice point without a role_frame`);
  return problems;
}
