// ============================================================
// AUTOMATION TRIGGER
// POST /api/automation/trigger
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { fetchTrendingTopics } from "@/lib/trending/sources";

export async function POST(req: NextRequest) {
  const supabase = getServerClient();

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "full"; // 'full' | 'fetch-topics' | 'generate'

    // ── Fetch & save trending topics ─────────────────────────
    if (action === "full" || action === "fetch-topics") {
      const topics = await fetchTrendingTopics();

      if (topics.length > 0) {
        // Insert only new topics (avoid duplicates by keyword)
        const { error } = await supabase.from("trending_topics").upsert(
          topics.map((t) => ({
            ...t,
            created_at: new Date().toISOString(),
          })),
          { onConflict: "keyword", ignoreDuplicates: true }
        );

        if (error) console.error("Topic upsert error:", error);
      }
    }

    // ── Trigger article generation ──────────────────────────
    if (action === "full" || action === "generate") {
      const keyword = body.keyword;

      const generateRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/automation/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(keyword ? { keyword } : {}),
        }
      );

      const result = await generateRes.json();
      return NextResponse.json({ success: true, generation: result });
    }

    return NextResponse.json({ success: true, message: "Topics fetched" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getServerClient();

  const { data: lastLog } = await supabase
    .from("automation_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingTopics } = await supabase
    .from("trending_topics")
    .select("count")
    .eq("status", "pending");

  return NextResponse.json({
    success: true,
    data: {
      recentLogs: lastLog ?? [],
      pendingTopics: pendingTopics?.[0]?.count ?? 0,
    },
  });
}
