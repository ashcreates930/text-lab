import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { consumeDemoAi } from "@/lib/demo-usage";

const Input = z.object({
  sandboxId: z.string().uuid(),
  role: z.string().max(80),
  narrative: z.string().max(12000),
  answers: z.array(z.object({ notice: z.string().max(3000), interpret: z.string().max(3000), craft: z.string().max(3000), technique: z.string().max(80), revisions: z.array(z.string().max(3000)).max(20) })).max(30),
  quotes: z.array(z.object({ paragraphId: z.string().max(8), text: z.string().max(1500) })).max(50),
  characterReplies: z.array(z.string().max(1000)).max(40),
  authorship: z.object({ typed: z.number(), inserted: z.number(), pasted: z.number() }),
});
const Report = z.object({
  centralJudgment: z.string(),
  development: z.string(),
  evidenceUsed: z.string(),
  techniques: z.string(),
  skills: z.array(z.object({ skill: z.string(), suggestedLevel: z.string(), rationale: z.string() })).max(8),
  strength: z.string(),
  nextStep: z.string(),
  authorship: z.string(),
});

export async function POST(request: NextRequest) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The submitted work could not be analyzed." }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI report generation is unavailable." }, { status: 503 });
  const capped = await consumeDemoAi(request, "feedback", parsed.data.sandboxId);
  if (capped) return capped;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: `Create an editable teacher-facing report about the student's submitted work. Never write or revise the student's narrative. Use only supplied student text and saved evidence. Do not infer facts or diagnose. The central judgment field must quote an exact sentence from the student's own INTERPRET answers, or say none was recorded. Evidence must count direct text quotations in the narrative and saved quote list separately from AI-character replies that the student actually cites. Note whether each visible quote supports its linked claim; do not count every reply as evidence. Technique examples must quote or closely identify the student's own CRAFT answer or narrative. Return JSON with keys centralJudgment, development, evidenceUsed, techniques, skills (array of {skill,suggestedLevel,rationale}), strength, nextStep, authorship. Skills levels are suggestions only; use labels like "Suggested: Proficient" and explain briefly. Authorship percentages are supplied and should be repeated without changing them. Keep each value concise and grounded.` },
        { role: "user", content: JSON.stringify(parsed.data) },
      ],
    });
    const text = completion.choices[0]?.message.content;
    if (!text) throw new Error("Empty model response");
    const report = Report.parse(JSON.parse(text));
    return NextResponse.json({ report: { ...report, generatedByAi: true, shares: { centralJudgment: true, development: true, evidenceUsed: true, techniques: true, skills: false, strength: false, nextStep: false, authorship: false } } });
  } catch {
    return NextResponse.json({ error: "AI report generation failed. The narrative remains saved." }, { status: 502 });
  }
}
