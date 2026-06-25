import { askGeminiWithProfile } from "@/lib/gemini";
import { getProfile } from "@/lib/storage";

export async function POST(req: Request) {
  const { title, rescheduleCount, blocker } = await req.json();
  const profile = getProfile();

  const prompt = `
    A user is rescheduling "${title}" for the ${rescheduleCount} time.
    Their original blocker was: "${blocker}"
    
    Write ONE sharp sentence calling this out.
    Not mean, but don't sugarcoat it.
    Make them feel the weight of breaking their own commitment.
  `;

  try {
    const callout = await askGeminiWithProfile(prompt, profile);
    return Response.json({ callout });
  } catch {
    return Response.json({
      callout: `This is the ${rescheduleCount}th time. What's actually different now?`
    });
  }
}