import { askGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  const { biggestPostponement, idealDay, sabotagePattern } = await req.json();

  const prompt = `
    A user just answered 3 onboarding questions for an accountability app.
    
    What they keep postponing: "${biggestPostponement}"
    Their ideal productive day: "${idealDay}"
    Their self-sabotage pattern: "${sabotagePattern}"
    
    Write a 2-3 sentence procrastination profile for this person.
    Be honest and specific — call out the contradiction between their 
    ideal day and their sabotage pattern. Don't be motivational. 
    Be diagnostic. Address them as "you".
  `;

  try {
    const summary = await askGemini(prompt);
    return Response.json({ summary });
  } catch {
    return Response.json({ summary: "Profile saved. AXIS is watching." });
  }
}