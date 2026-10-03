// Whole-class live analysis plans, built from a story's own scenes and clues. Pure functions, shared by server and browser.
import type { WorldPack } from "../world-schema.ts";

export type Stage = "notice" | "interpret" | "craft";
export type QuestionStep = { kind: "question"; artifactId: string; artifactName: string; stage: Stage; prompt: string; evidenceType: string; passageIds: string[] };
export type ChatStep = { kind: "chat"; prompt: string; realWorld: string | null; seconds: number };
export type LiveStep = QuestionStep | ChatStep;
export type LivePlan = { worldId: string; worldTitle: string; sceneId: string; sceneTitle: string; roleId: string; roleName: string; grade: number; steps: LiveStep[] };
export type Phase = "answer" | "reveal" | "chat" | "takeaway";
export type PlanOptions = { sceneId: string; roleId: string; grade: number; stages: Stage[]; chatAfterEachClue: boolean; chatSeconds: number };

export const stageLabels: Record<Stage, string> = { notice: "Notice", interpret: "Interpret", craft: "Craft" };
export const talkStarters = ["I agree with ___ because…", "I want to add to what ___ said…", "I see it differently because…", "The line that convinced me is…", "Can you say more about…?"];

const titleCase = (id: string) => id.split("-").map((w) => (w[0]?.toUpperCase() ?? "") + w.slice(1)).join(" ");

export function buildPlan(world: WorldPack, options: PlanOptions): LivePlan {
  const scene = world.scenes.find((s) => s.id === options.sceneId) ?? world.scenes[0];
  const role = world.roles.find((r) => r.id === options.roleId) ?? world.roles[0];
  const stages = options.stages.length ? options.stages : (["notice", "interpret"] as Stage[]);
  const seconds = Math.min(300, Math.max(30, Math.round(options.chatSeconds)));
  const steps: LiveStep[] = [];
  scene.artifacts.forEach((artifact, index) => {
    for (const stage of (["notice", "interpret", "craft"] as Stage[]).filter((s) => stages.includes(s))) {
      const question = artifact.questions.find((q) => q.id === stage);
      if (!question) continue;
      const plain = question.prompt_by_role_plain?.[role.id];
      const prompt = (options.grade <= 9 && plain) || question.prompt_by_role[role.id] || Object.values(question.prompt_by_role)[0] || "";
      steps.push({ kind: "question", artifactId: artifact.id, artifactName: artifact.name, stage, prompt, evidenceType: artifact.evidence_type, passageIds: artifact.source_anchor });
    }
    const last = index === scene.artifacts.length - 1;
    if (options.chatAfterEachClue || last) {
      steps.push({
        kind: "chat",
        prompt: `Turn to a partner. Share your answers about “${artifact.name}.” Did you use the same evidence? Where do you disagree?`,
        realWorld: last ? world.real_world_connection.prompt : null,
        seconds,
      });
    }
  });
  return { worldId: world.id, worldTitle: world.title, sceneId: scene.id, sceneTitle: titleCase(scene.id), roleId: role.id, roleName: role.name, grade: options.grade, steps };
}

export function firstPhase(step: LiveStep | undefined): Phase {
  return step?.kind === "chat" ? "chat" : "answer";
}

export type Advance = "reveal" | "next" | "back" | "start_timer" | "takeaway" | "end";
export type LiveState = { step: number; phase: Phase; chatStartedAt: string | null; status: "active" | "ended" };

// Moves a live analysis forward or back. Invalid moves leave the state unchanged.
export function advanceState(plan: LivePlan, state: LiveState, action: Advance, now = new Date()): LiveState {
  const step = plan.steps[state.step];
  if (action === "end") return { ...state, status: "ended" };
  if (action === "reveal" && step?.kind === "question" && state.phase === "answer") return { ...state, phase: "reveal" };
  if (action === "start_timer" && step?.kind === "chat" && state.phase === "chat") return { ...state, chatStartedAt: now.toISOString() };
  if (action === "takeaway" && step?.kind === "chat") return { ...state, phase: "takeaway" };
  if (action === "next") {
    if (state.step >= plan.steps.length - 1) return { ...state, status: "ended" };
    const next = state.step + 1;
    return { ...state, step: next, phase: firstPhase(plan.steps[next]), chatStartedAt: null };
  }
  if (action === "back" && state.step > 0) {
    const prev = state.step - 1;
    return { ...state, step: prev, phase: firstPhase(plan.steps[prev]), chatStartedAt: null };
  }
  return state;
}

// Which response a student is being asked for right now, if any.
export function expectedResponse(plan: LivePlan, state: LiveState): "answer" | "takeaway" | null {
  if (state.status !== "active") return null;
  const step = plan.steps[state.step];
  if (step?.kind === "question" && state.phase === "answer") return "answer";
  if (step?.kind === "chat" && state.phase === "takeaway") return "takeaway";
  return null;
}

export function secondsLeft(step: LiveStep | undefined, chatStartedAt: string | null, now = Date.now()) {
  if (step?.kind !== "chat" || !chatStartedAt) return null;
  return Math.max(0, Math.ceil(step.seconds - (now - new Date(chatStartedAt).getTime()) / 1000));
}
