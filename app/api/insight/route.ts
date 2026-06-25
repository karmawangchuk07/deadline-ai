import { askGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  const { completionRate, totalContracts, completed, overdue, totalReschedules, mostAvoided, axisScore } = await req.json();

  const prompt = `
    You are an honest accountability analyst.
    Here are a user's productivity stats:
    
    - AXIS Score: ${axisScore}/100
    - Total contracts made: ${totalContracts}
    - Completed: ${completed}
    - Completion rate: ${completionRate}%
    - Currently overdue: ${overdue}
    - Total times rescheduled across all tasks: ${totalReschedules}
    - Most avoided task: "${mostAvoided}"
    
    Write a 2-3 sentence honest pattern analysis.
    Identify what their behavior actually reveals about them.
    Don't be motivational. Be diagnostic and specific.
    Address them as "you".
  `;

  try {
    const insight = await askGemini(prompt);
    return Response.json({ insight });
  } catch {
    return Response.json({ insight: "Add more contracts and complete them to see your patterns." });
  }
}