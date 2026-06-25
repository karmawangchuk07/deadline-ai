import { askGemini } from "@/lib/gemini";
import { buildProfileContext } from "@/lib/gemini";

export async function POST(req: Request) {
  const { turn, contractTitle, deadline, blocker, rescheduleCount, userMessage, history, profile } = await req.json();

  const profileContext = buildProfileContext(profile);

  let prompt = "";

  if (turn === 0) {
    prompt = `
      ${profileContext}
      
      You are AXIS — a brutally honest accountability partner.
      The user has this urgent/overdue task:
      - Task: "${contractTitle}"
      - Deadline: ${new Date(deadline).toLocaleDateString()}
      - Their stated blocker: "${blocker}"
      - Times rescheduled: ${rescheduleCount}
      
      Turn 1 of 3. Ask ONE sharp specific question about their blocker.
      Don't accept the surface answer. Max 2 sentences. No preamble.
    `;
  } else if (turn === 1) {
    prompt = `
      ${profileContext}
      
      You are AXIS in a 3-turn accountability interrogation.
      Task: "${contractTitle}"
      Original blocker: "${blocker}"
      
      AXIS asked: ${history[0]?.text}
      User replied: ${userMessage}
      
      Turn 2. Follow up — dig one level deeper into what they're NOT saying.
      One sharp question or observation. Max 2 sentences.
    `;
  } else {
    prompt = `
      ${profileContext}
      
      You are AXIS closing a 3-turn interrogation.
      Task: "${contractTitle}"
      
      Full conversation:
      ${history.map((m: { role: string; text: string }) => `${m.role === "axis" ? "AXIS" : "User"}: ${m.text}`).join("\n")}
      User's final answer: ${userMessage}
      
      Turn 3 — give them ONE specific action for the next 30 minutes.
      Be concrete. Name the exact first step. Max 3 sentences.
      End with: "Now go."
    `;
  }

  try {
    const response = await askGemini(prompt);
    return Response.json({ response });
  } catch (e) {
    console.error("Interrogation error:", e);
    return Response.json({ response: "Something went wrong. But you know what to do — just start." });
  }
}