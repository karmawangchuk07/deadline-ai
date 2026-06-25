import { askGeminiWithProfile } from "@/lib/gemini";
import { getProfile } from "@/lib/storage";

export async function POST(req: Request) {
  const { completionRate, totalContracts, completed, overdue, totalReschedules, mostAvoided, axisScore } = await req.json();
  const profile = getProfile();

  const prompt = `
    You are an honest accountability analyst.
    User stats:
    - AXIS Score: ${axisScore}/100
    - Total contracts: ${totalContracts}
    - Completed: ${completed} (${completionRate}%)
    - Overdue: ${overdue}
    - Total reschedules: ${totalReschedules}
    - Most avoided: "${mostAvoided}"
    
    Write 2-3 sentences. Identify what their behavior actually reveals.
    Be diagnostic, not motivational. Address them as "you".
  `;

  try {
    const insight = await askGeminiWithProfile(prompt, profile);
    return Response.json({ insight });
  } catch {
    return Response.json({ insight: "Add more contracts to see your patterns." });
  }
}