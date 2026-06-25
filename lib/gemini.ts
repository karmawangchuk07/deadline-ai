import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function askGemini(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}