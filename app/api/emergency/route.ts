import { askGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  const { hours, contracts } = await req.json();

  const taskList = contracts
    .map((c: { title: string; deadline: string; rescheduleCount: number; blocker: string; priority: string }) =>
      `- "${c.title}" | due: ${new Date(c.deadline).toLocaleDateString()} | priority: ${c.priority} | rescheduled: ${c.rescheduleCount}x | blocker: "${c.blocker}"`
    )
    .join("\n");

  const prompt = `
    You are a crisis productivity coach. No fluff, no motivation posters.
    The user has ${hours} hours available RIGHT NOW.
    
    Their pending commitments:
    ${taskList}
    
    Give them a ruthless, time-blocked battle plan for these ${hours} hours.
    Format it as a coach talking directly to them — narrative style, not bullets.
    Be specific about time blocks. Call out the most avoided task by name.
    If something clearly can't fit in ${hours} hours, tell them what to cut.
    Start with the most critical task. Max 250 words.
    Address them as "you". No motivational fluff — just clear direction.
  `;

  try {
    const plan = await askGemini(prompt);
    return Response.json({ plan });
  } catch {
    return Response.json({
      plan: "AXIS couldn't generate a plan right now. But you know what to do — start with the most overdue task, set a 25-minute timer, and don't stop until it rings."
    });
  }
}