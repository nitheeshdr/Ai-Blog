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
import type { Post } from "@/types";

export const maxDuration = 300; // 5 min for Vercel Pro; 60s for free tier

export async function POST(req: NextRequest) {
  const start = Date.now();
  const supabase = getServerClient();

  try {
    const body = await req.json().catch(() => ({}));
    const manualKeyword: string | undefined = body.keyword;

    // ── 1. Pick a trending topic ────────────────────────────
    let keyword: string;
    let topicId: string | null = null;

    if (manualKeyword) {
      keyword = manualKeyword;
    } else {
      const { data: topics } = await supabase
        .from("trending_topics")
        .select("*")
        .eq("status", "pending")
        .order("trend_score", { ascending: false })
        .limit(1);

      if (!topics || topics.length === 0) {
        return NextResponse.json(
          { success: false, error: "No pending topics available" },
          { status: 404 }
        );
      }
      keyword = topics[0].keyword;
      topicId = topics[0].id;

      // Mark as processing
      await supabase
        .from("trending_topics")
        .update({ status: "processing" })
        .eq("id", topicId);
    }

    // Log start
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
      image?.url ?? `https://via.placeholder.com/1200x630?text=${encodeURIComponent(keyword)}`;

    // ── 5. Find or create category ──────────────────────────
    const categorySlug = generated.category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    const categoryId = categoryData?.id ?? null;

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
        await supabase
          .from("trending_topics")
          .update({ status: "skipped" })
          .eq("id", topicId);
      }
      return NextResponse.json(
        { success: false, error: "Duplicate slug — post already exists" },
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
        .update({
          status: "done",
          post_id: newPost.id,
          processed_at: new Date().toISOString(),
        })
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
