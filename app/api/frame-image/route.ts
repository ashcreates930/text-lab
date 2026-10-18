import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { consumeDemoAi } from "@/lib/demo-usage";
import { verifyStudentToken } from "@/lib/classroom/auth";
import { loadFramePage, makeFramePicture, openAiModerator, pictureForFrame } from "@/lib/frames-server";

// Turns a checked storyboard description into a picture in the story's art style. Answers { image } (a URL, or null
// when no picture can be made: writing-only page, daily cap, storage not set up, or any error) or { blocked, message }
// when moderation flags the description. The student can always save the frame without a picture.
const Input = z.object({
  sandboxId: z.string().uuid(), worldId: z.string().regex(/^[a-z0-9-]+$/), pageId: z.string().regex(/^[a-z0-9-]+$/),
  quote: z.string().min(1).max(400), description: z.string().min(1).max(600), classToken: z.string().max(400).optional(),
});

export async function POST(request: NextRequest) {
  const input = Input.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ image: null });
  const found = await loadFramePage(input.data.worldId, input.data.pageId);
  if (!found) return NextResponse.json({ image: null });
  const studentId = verifyStudentToken(input.data.classToken);
  const owner = studentId ? `students/${studentId}` : `sandboxes/${input.data.sandboxId}`;
  return NextResponse.json(await pictureForFrame(found.page, input.data.description, {
    moderate: openAiModerator,
    allow: async () => !(await consumeDemoAi(request, "frame_image", input.data.sandboxId, `${input.data.worldId}:${input.data.pageId}`)),
    paint: () => makeFramePicture(found.pack, found.page, input.data.quote, input.data.description, owner),
  }));
}
