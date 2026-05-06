// ============================================================
// CORE AUTOMATION PIPELINE
// POST /api/automation/generate
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { generateArticle, humanizeContent } from "@/lib/ai/groq";
import { getImageForArticle } from "@/lib/images/pexels";
import { getUnsplashImage } from "@/lib/images/unsplash";
import { generateArticleSchema, generateFAQSchema } from "@/lib/seo/schema";
import { generateSlug, calculateReadingTime } from "@/lib/utils";
import { fetchTrendingTopics } from "@/lib/trending/sources";
import type { Post } from "@/types";

export const maxDuration = 300; // 5 min for Vercel Pro; 60s on free

// ── Fallback evergreen topics used when nothing is in the DB ──
const FALLBACK_TOPICS = [
  "What is Artificial Intelligence? Complete Beginner's Guide 2025",
  "Next.js 15 New Features Every Developer Should Know",
  "How to Build a REST API with Node.js and Express",
  "Python Machine Learning Tutorial for Beginners",
  "Top 10 VS Code Extensions for Productive Developers in 2025",
  "Understanding Docker and Kubernetes for DevOps Beginners",
  "React Server Components Explained with Examples",
  "Best Free AI Tools for Developers in 2025",
  "How to Deploy a Full-Stack App to Vercel for Free",
  "TypeScript Tips and Tricks Every Developer Should Know",
  "ChatGPT API Integration Tutorial with Python",
  "Supabase vs Firebase: Which Backend Should You Choose in 2025?",
  "Web Accessibility Best Practices Every Developer Must Follow",
  "How Large Language Models (LLMs) Actually Work",
  "Getting Started with Tailwind CSS v4",
];

// ── Auto-detect category from keyword ─────────────────────
function detectCategory(keyword: string): string {
  const kw = keyword.toLowerCase();
  if (kw.includes("ai") || kw.includes("artificial intelligence") || kw.includes("gpt") || kw.includes("llm") || kw.includes("machine learning") || kw.includes("deep learning") || kw.includes("chatgpt")) return "Artificial Intelligence";
  if (kw.includes("python")) return "Python";
  if (kw.includes("react") || kw.includes("next.js") || kw.includes("nextjs") || kw.includes("vue") || kw.includes("angular") || kw.includes("svelte")) return "Web Development";
  if (kw.includes("typescript") || kw.includes("javascript") || kw.includes("node") || kw.includes("express")) return "JavaScript";
  if (kw.includes("docker") || kw.includes("kubernetes") || kw.includes("devops") || kw.includes("ci/cd") || kw.includes("deploy")) return "DevOps";
  if (kw.includes("database") || kw.includes("sql") || kw.includes("postgres") || kw.includes("mongodb") || kw.includes("supabase") || kw.includes("firebase")) return "Databases";
  if (kw.includes("security") || kw.includes("hack") || kw.includes("cyber") || kw.includes("auth")) return "Security";
  if (kw.includes("tutorial") || kw.includes("guide") || kw.includes("how to") || kw.includes("beginner")) return "Tutorials";
  if (kw.includes("tool") || kw.includes("extension") || kw.includes("vscode") || kw.includes("editor")) return "Dev Tools";
  if (kw.includes("cloud") || kw.includes("aws") || kw.includes("azure") || kw.includes("vercel") || kw.includes("netlify")) return "Cloud";
  if (kw.includes("open source") || kw.includes("github")) return "Open Source";
  return "Technology";
}

// ── Ensure category exists and return its ID ──────────────
async function ensureCategoryExists(
  supabase: ReturnType<typeof getServerClient>,
  categoryName: string
): Promise<string | null> {
  const slug = categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const COLORS: Record<string, string> = {
    "artificial-intelligence": "#6366f1",
    "python": "#3b82f6",
    "web-development": "#06b6d4",
    "javascript": "#f59e0b",
    "devops": "#10b981",
    "databases": "#8b5cf6",
    "security": "#ef4444",
    "tutorials": "#f97316",
    "dev-tools": "#84cc16",
    "cloud": "#0ea5e9",
    "open-source": "#14b8a6",
    "technology": "#6366f1",
  };

  const color = COLORS[slug] ?? "#6366f1";

  // Try to find existing
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) return existing.id;

  // Create new category
  const { data: created } = await supabase
    .from("categories")
    .insert({ name: categoryName, slug, color, description: `Articles about ${categoryName}`, post_count: 0 })
    .select("id")
    .single();

  return created?.id ?? null;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const supabase = getServerClient();

  try {
    const body = await req.json().catch(() => ({}));
    const manualKeyword: string | undefined = body.keyword;

    // ── 1. Pick a keyword ───────────────────────────────────
    let keyword: string;
    let topicId: string | null = null;

    if (manualKeyword) {
      // Custom keyword provided directly
      keyword = manualKeyword;
    } else {
      // Try to get a pending topic from DB
      const { data: dbTopics } = await supabase
        .from("trending_topics")
        .select("*")
        .eq("status", "pending")
        .order("trend_score", { ascending: false })
        .limit(1);

      if (dbTopics && dbTopics.length > 0) {
        // Use DB topic
        keyword = dbTopics[0].keyword;
        topicId = dbTopics[0].id;
        await supabase
          .from("trending_topics")
          .update({ status: "processing" })
          .eq("id", topicId);
      } else {
        // ── Try to fetch fresh trending topics first ────────
        console.log("[Automation] No pending topics — fetching live trending topics...");
        try {
          const liveTopics = await fetchTrendingTopics();
          if (liveTopics.length > 0) {
            // Save them
            await supabase.from("trending_topics").upsert(
              liveTopics.map((t) => ({ ...t, created_at: new Date().toISOString() })),
              { onConflict: "keyword", ignoreDuplicates: true }
            );
            // Use the first one
            keyword = liveTopics[0].keyword;
            console.log(`[Automation] Using live trending topic: "${keyword}"`);
          } else {
            throw new Error("Live fetch returned 0 topics");
          }
        } catch (fetchErr) {
          // ── Final fallback: random evergreen topic ──────────
          console.log("[Automation] Falling back to evergreen topics list...");
          const usedKeywords = await getAlreadyUsedKeywords(supabase);
          const available = FALLBACK_TOPICS.filter((t) => !usedKeywords.has(t.toLowerCase().slice(0, 40)));
          keyword = available.length > 0
            ? available[Math.floor(Math.random() * available.length)]
            : FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
          console.log(`[Automation] Using fallback topic: "${keyword}"`);
        }
      }
    }

    // ── Log start ───────────────────────────────────────────
    const { data: log } = await supabase
      .from("automation_logs")
      .insert({
        type: "generate",
        status: "running",
        message: `Generating article for: ${keyword}`,
        api_used: process.env.AI_PROVIDER ?? "groq",
      })
      .select()
      .single();

    // ── 2. Generate article with AI ─────────────────────────
    console.log(`[Automation] Generating article for: "${keyword}"`);
    const generated = await generateArticle(
      keyword,
      process.env.NEXT_PUBLIC_BLOG_NICHE ?? "Technology & AI"
    );

    // ── 3. Humanize content ─────────────────────────────────
    const humanizedContent = await humanizeContent(generated.content);

    // ── 4. Fetch image ──────────────────────────────────────
    const image =
      (await getImageForArticle(keyword, generated.title)) ||
      (await getUnsplashImage(keyword));

    const ogImage =
      image?.url ?? `https://picsum.photos/seed/${encodeURIComponent(keyword.slice(0, 20))}/1200/630`;

    // ── 5. Auto-detect + ensure category exists ─────────────
    const categoryName = generated.category || detectCategory(keyword);
    const categoryId = await ensureCategoryExists(supabase, categoryName);

    // ── 6. Build slug ───────────────────────────────────────
    const slug = generateSlug(generated.slug || generated.title);

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      if (topicId) {
        await supabase.from("trending_topics").update({ status: "skipped" }).eq("id", topicId);
      }
      return NextResponse.json(
        { success: false, error: "Duplicate post — already exists" },
        { status: 409 }
      );
    }

    // ── 7. Generate schema markup ───────────────────────────
    const publishedAt = new Date().toISOString();
    const postForSchema = {
      title: generated.title,
      slug,
      excerpt: generated.excerpt,
      content: humanizedContent,
      featured_image: ogImage,
      og_image: ogImage,
      author: "AIScribe Team",
      author_avatar: null,
      tags: generated.tags,
      reading_time: calculateReadingTime(humanizedContent),
      published_at: publishedAt,
      updated_at: publishedAt,
    } as Partial<Post>;

    const articleSchema = generateArticleSchema(postForSchema as Post);
    const faqSchema = generated.faqs ? generateFAQSchema(generated.faqs) : null;
    const combinedSchema = faqSchema
      ? { "@graph": [articleSchema, faqSchema] }
      : articleSchema;

    // ── 8. Save to database ─────────────────────────────────
    const publishMode = process.env.PUBLISH_MODE ?? "draft";

    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        content: humanizedContent,
        meta_title: generated.meta_title,
        meta_description: generated.meta_description,
        og_image: ogImage,
        featured_image: ogImage,
        author: "AIScribe Team",
        category_id: categoryId,
        tags: generated.tags,
        reading_time: calculateReadingTime(humanizedContent),
        status: publishMode,
        faqs_json: generated.faqs,
        toc_json: generated.toc,
        schema_json: combinedSchema,
        social_caption: generated.social_caption,
        seo_score: generated.seo_score ?? 80,
        ai_model_used: "groq/llama-3.3-70b-versatile",
        published_at: publishMode === "published" ? publishedAt : null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // ── 9. Update topic status ──────────────────────────────
    if (topicId) {
      await supabase
        .from("trending_topics")
        .update({ status: "done", post_id: newPost.id, processed_at: new Date().toISOString() })
        .eq("id", topicId);
    }

    // ── 10. Update automation log ───────────────────────────
    const duration = Date.now() - start;
    if (log?.id) {
      await supabase
        .from("automation_logs")
        .update({
          status: "success",
          message: `Generated "${generated.title}" (${duration}ms)`,
          duration_ms: duration,
          metadata: { post_id: newPost.id, slug, keyword },
        })
        .eq("id", log.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newPost.id,
        title: generated.title,
        slug,
        status: publishMode,
        category: categoryName,
        duration_ms: duration,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Automation] Error:", message);

    await supabase.from("automation_logs").insert({
      type: "generate",
      status: "failed",
      message,
      duration_ms: Date.now() - start,
    });

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Helper: get keywords already written about
async function getAlreadyUsedKeywords(supabase: ReturnType<typeof getServerClient>): Promise<Set<string>> {
  const { data } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(50);

  return new Set((data ?? []).map((p: { title: string }) => p.title.toLowerCase().slice(0, 40)));
}
