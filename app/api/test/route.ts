import { askGemini } from "@/lib/gemini";

export async function GET() {
  const response = await askGemini("Say hello in one sentence.");
  return Response.json({ message: response });
}