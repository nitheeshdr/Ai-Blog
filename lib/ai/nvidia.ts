// ============================================================
// NVIDIA NIM API — Fallback AI Provider
// ============================================================

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "meta/llama-3.1-70b-instruct";

interface NvidiaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function nvidiaChat(
  messages: NvidiaMessage[],
  temperature = 0.7
): Promise<string> {
  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      temperature,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function nvidiaGenerateArticle(keyword: string): Promise<string> {
  return await nvidiaChat(
    [
      {
        role: "system",
        content:
          "You are an expert tech blogger. Write humanized, SEO-optimized content.",
      },
      {
        role: "user",
        content: `Write a comprehensive 2000-word article about: "${keyword}". Format as HTML with proper headings.`,
      },
    ],
    0.75
  );
}
