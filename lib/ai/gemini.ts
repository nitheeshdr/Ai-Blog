// ============================================================
// GOOGLE GEMINI API — Second Fallback AI Provider
// ============================================================
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function geminiChat(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function geminiGenerateArticle(keyword: string): Promise<string> {
  return await geminiChat(
    `Write a comprehensive, humanized, SEO-optimized 2000-word HTML blog post about: "${keyword}". 
Include h2 and h3 headings, bullet points, and engaging conversational content.`,
    "You are an expert tech blogger writing for a human audience. Make the content warm, helpful, and engaging."
  );
}
