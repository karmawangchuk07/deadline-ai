import { askGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  const { title, deadline, blocker, sacrifice } = await req.json();

  const prompt = `
    You are a brutally honest accountability partner.
    A user just signed this commitment contract:
    
    Task: "${title}"
    Due: "${deadline}"
    Why they haven't started: "${blocker}"
    What they'll sacrifice if they fail: "${sacrifice}"
    
    Respond in exactly 2 sentences.
    First sentence: call out whether their blocker sounds like 
    genuine difficulty or avoidance. Be specific, not generic.
    Second sentence: give them ONE concrete action they can take 
    in the next 30 minutes toward this task.
    Address them as "you". No motivational fluff.
  `;

  try {
    const note = await askGemini(prompt);
    return Response.json({ note });
  } catch {
    return Response.json({ note: "Contract signed. AXIS is watching." });
  }
}