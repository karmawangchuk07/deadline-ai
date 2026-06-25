import { askGeminiWithProfile } from "@/lib/gemini";
import { getProfile } from "@/lib/storage";

export async function POST(req: Request) {
  const { title, deadline, blocker, sacrifice } = await req.json();
  const profile = getProfile();

  const prompt = `
    You are a brutally honest accountability partner.
    A user just signed this commitment contract:
    
    Task: "${title}"
    Due: "${deadline}"
    Why they haven't started: "${blocker}"
    What they'll sacrifice if they fail: "${sacrifice}"
    
    Respond in exactly 2 sentences.
    First: call out whether their blocker sounds like genuine difficulty or avoidance. Be specific.
    Second: give them ONE concrete action they can take in the next 30 minutes.
    Address them as "you". No motivational fluff.
  `;

  try {
    const note = await askGeminiWithProfile(prompt, profile);
    return Response.json({ note });
  } catch {
    return Response.json({ note: "Contract signed. AXIS is watching." });
  }
}