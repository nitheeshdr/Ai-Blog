// ============================================================
// TRENDING TOPICS API
// GET /api/trending — list topics
// POST /api/trending — refresh topics
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { fetchTrendingTopics } from "@/lib/trending/sources";

export async function GET(req: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const { data, error } = await supabase
    .from("trending_topics")
    .select("*")
    .eq("status", status)
    .order("trend_score", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST() {
  const supabase = getServerClient();

  try {
    const topics = await fetchTrendingTopics();

    if (topics.length > 0) {
      await supabase.from("trending_topics").upsert(
        topics.map((t) => ({
          ...t,
          created_at: new Date().toISOString(),
        })),
        { onConflict: "keyword", ignoreDuplicates: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: { fetched: topics.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
