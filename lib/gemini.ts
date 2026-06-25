import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProcrastinationProfile } from "./type";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

async function withRetry(fn: () => Promise<string>, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      const isRetryable = e instanceof Error && 
        (e.message.includes("503") || e.message.includes("529") || e.message.includes("overloaded"));
      if (i < retries && isRetryable) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function askGemini(prompt: string): Promise<string> {
  return withRetry(async () => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

export function buildProfileContext(profile: ProcrastinationProfile | null): string {
  if (!profile || !profile.biggestPostponement) return "";
  return `
IMPORTANT USER CONTEXT — use this to personalize your response:
- What they keep postponing most: "${profile.biggestPostponement}"
- Their ideal productive day: "${profile.idealDay}"
- Their self-sabotage pattern: "${profile.sabotagePattern}"
- Their procrastination profile summary: "${profile.aiSummary}"

Reference this context naturally when relevant. Don't mention it explicitly.
`;
}

export async function askGeminiWithProfile(
  prompt: string,
  profile: ProcrastinationProfile | null
): Promise<string> {
  const profileContext = buildProfileContext(profile);
  const fullPrompt = profileContext ? `${profileContext}\n\n${prompt}` : prompt;
  return withRetry(async () => {
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  });
}