import { askGeminiWithProfile } from "@/lib/gemini";
import { getProfile } from "@/lib/storage";

export async function POST(req: Request) {
  const { hours, contracts } = await req.json();
  const profile = getProfile();

  const taskList = contracts
    .map((c: { title: string; deadline: string; rescheduleCount: number; blocker: string; priority: string }) =>
      `- "${c.title}" | due: ${new Date(c.deadline).toLocaleDateString()} | priority: ${c.priority} | rescheduled: ${c.rescheduleCount}x | blocker: "${c.blocker}"`
    )
    .join("\n");

  const prompt = `
    You are a crisis productivity coach. No fluff.
    The user has ${hours} hours available RIGHT NOW.
    
    Their pending commitments:
    ${taskList}
    
    Give them a ruthless time-blocked battle plan for these ${hours} hours.
    Narrative style — a coach talking directly to them.
    Be specific about time blocks. Call out the most avoided task by name.
    Max 250 words. No motivational fluff — just clear direction.
  `;

  try {
    const plan = await askGeminiWithProfile(prompt, profile);
    return Response.json({ plan });
  } catch {
    return Response.json({ plan: "Start with the most overdue task. Set a 25-minute timer. Go." });
  }
}