import { askGeminiWithProfile } from "@/lib/gemini";
import { getProfile } from "@/lib/storage";

export async function POST(req: Request) {
  const { contracts, score } = await req.json();
  const profile = getProfile();

  const completed = contracts.filter((c: { status: string }) => c.status === "completed");
  const pending = contracts.filter((c: { status: string }) => c.status === "pending");
  const totalReschedules = contracts.reduce((sum: number, c: { rescheduleCount: number }) => sum + c.rescheduleCount, 0);
  const mostAvoided = [...contracts]
    .filter((c: { status: string }) => c.status !== "completed")
    .sort((a: { rescheduleCount: number }, b: { rescheduleCount: number }) => b.rescheduleCount - a.rescheduleCount)[0];

  const prompt = `
    You are AXIS — a brutally honest accountability companion.
    Write a personal weekly debrief letter based on this data:
    
    - AXIS Score: ${score}/100
    - Commitments made: ${contracts.length}
    - Completed: ${completed.length}
    - Pending: ${pending.length}
    - Total reschedules: ${totalReschedules}
    - Most avoided: "${mostAvoided?.title || "none"}" (rescheduled ${mostAvoided?.rescheduleCount || 0} times)
    - Completed tasks: ${completed.map((c: { title: string }) => c.title).join(", ") || "none"}
    
    Write 3-4 paragraphs as a letter. Flowing prose, no bullets.
    Paragraph 1: what they did this week — specific.
    Paragraph 2: what their pattern reveals — honest, diagnostic.
    Paragraph 3: one thing to fix next week.
    Sign off as "— AXIS"
    
    Do NOT be harsh for the sake of it. Be honest because you care.
  `;

  try {
    const letter = await askGeminiWithProfile(prompt, profile);
    return Response.json({ letter });
  } catch {
    return Response.json({ letter: "AXIS couldn't generate your letter right now.\n\n— AXIS" });
  }
}