import Groq from "groq-sdk";
import type { GeneratedArticle, FAQ, TOCItem } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

// ── Core generation helper ─────────────────────────────────
async function chat(
  system: string,
  user: string,
  temperature = 0.8
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

// ── Generate full SEO article ──────────────────────────────
export async function generateArticle(
  keyword: string,
  niche: string = "Technology & AI"
): Promise<GeneratedArticle> {
  const system = `You are an expert ${niche} blogger and SEO content strategist.
Write in a warm, conversational, humanized tone — like a knowledgeable friend, not a robot.
Always format output as valid JSON.`;

  const user = `Write a comprehensive, humanized, 2000-word SEO blog post about: "${keyword}"

Return ONLY valid JSON with this exact structure:
{
  "title": "SEO-optimized H1 title (60 chars max)",
  "slug": "url-friendly-slug",
  "excerpt": "150-160 char engaging excerpt",
  "meta_title": "SEO meta title (55 chars max)",
  "meta_description": "Compelling meta description (155 chars max)",
  "category": "One of: Artificial Intelligence, Web Development, Machine Learning, Developer Tools, Tech News, Tutorials",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "social_caption": "Engaging Twitter/LinkedIn caption with emojis and hashtags",
  "reading_time": 8,
  "seo_score": 85,
  "toc": [
    {"id":"intro","title":"Introduction","level":2},
    {"id":"what-is","title":"What Is ${keyword}","level":2},
    {"id":"benefits","title":"Key Benefits","level":2},
    {"id":"how-to","title":"How To Get Started","level":2},
    {"id":"mistakes","title":"Common Mistakes to Avoid","level":2},
    {"id":"faq","title":"Frequently Asked Questions","level":2},
    {"id":"conclusion","title":"Conclusion","level":2}
  ],
  "faqs": [
    {"question":"FAQ question 1?","answer":"Detailed answer 1"},
    {"question":"FAQ question 2?","answer":"Detailed answer 2"},
    {"question":"FAQ question 3?","answer":"Detailed answer 3"},
    {"question":"FAQ question 4?","answer":"Detailed answer 4"},
    {"question":"FAQ question 5?","answer":"Detailed answer 5"}
  ],
  "content": "Full HTML article content with proper h2/h3 headings, paragraphs, lists, bold text. Include 2000+ words. Write in friendly conversational tone. Include real examples. Make it beginner-friendly but insightful. Add internal narrative."
}`;

  const raw = await chat(system, user, 0.75);

  // Extract JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in AI response");

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedArticle;

  // Calculate reading time from content
  const wordCount = parsed.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  parsed.reading_time = Math.ceil(wordCount / 200);

  return parsed;
}

// ── Humanize existing content ──────────────────────────────
export async function humanizeContent(content: string): Promise<string> {
  const system = `You are a humanization expert. Rewrite AI-generated content to sound like it was written by a real human blogger.
Rules:
- Use contractions (don't, it's, you'll)
- Add personal anecdotes ("In my experience...")
- Vary sentence length dramatically
- Use rhetorical questions
- Add humor where appropriate
- Remove corporate/robotic language
- Keep the HTML structure intact
- Do NOT add new sections`;

  const user = `Humanize this blog post content. Return ONLY the improved HTML content:\n\n${content.slice(0, 8000)}`;

  return await chat(system, user, 0.85);
}

// ── Generate FAQ section ───────────────────────────────────
export async function generateFAQ(
  keyword: string,
  content: string
): Promise<FAQ[]> {
  const system = `You are an SEO expert specializing in FAQ schema for Google. Return only valid JSON array.`;

  const user = `Based on this article about "${keyword}", generate 6 natural FAQ questions and answers.
Return ONLY a JSON array:
[{"question":"Q?","answer":"Detailed A."},...]

Article excerpt: ${content.slice(0, 2000)}`;

  const raw = await chat(system, user, 0.7);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]) as FAQ[];
}

// ── Generate SEO metadata ──────────────────────────────────
export async function generateMetadata(
  title: string,
  content: string
): Promise<{ meta_title: string; meta_description: string }> {
  const system = `You are an SEO metadata expert. Return only valid JSON.`;
  const user = `Generate meta title (max 60 chars) and meta description (max 160 chars) for:
Title: "${title}"
Content excerpt: ${content.slice(0, 500)}

Return JSON: {"meta_title":"...","meta_description":"..."}`;

  const raw = await chat(system, user, 0.6);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match)
    return { meta_title: title.slice(0, 60), meta_description: content.slice(0, 160) };
  return JSON.parse(match[0]);
}

// ── Generate social media caption ─────────────────────────
export async function generateSocialCaption(
  title: string,
  excerpt: string
): Promise<string> {
  const system = `You are a viral social media content creator. Write engaging captions.`;
  const user = `Write a viral Twitter/LinkedIn caption for this article:
Title: "${title}"
Excerpt: "${excerpt}"

Include: hook, value proposition, 3 hashtags, emoji. Max 280 chars.`;

  return await chat(system, user, 0.9);
}

// ── Generate internal linking suggestions ─────────────────
export async function generateInternalLinks(
  content: string,
  availablePosts: Array<{ title: string; slug: string }>
): Promise<string[]> {
  if (availablePosts.length === 0) return [];

  const system = `You are an SEO internal linking expert.`;
  const user = `Given this blog post content and available posts, suggest 3-5 relevant internal links.
Return only a JSON array of slugs: ["slug1","slug2"]

Available posts: ${JSON.stringify(availablePosts.slice(0, 20))}
Content excerpt: ${content.slice(0, 1000)}`;

  const raw = await chat(system, user, 0.5);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]) as string[];
}

export { groq, MODEL };
