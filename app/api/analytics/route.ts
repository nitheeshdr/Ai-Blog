import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerClient();

  const [postsRes, viewsRes, subscribersRes, logsRes, topicsRes] =
    await Promise.all([
      supabase.from("posts").select("status,seo_score", { count: "exact" }),
      supabase.from("posts").select("views").eq("status", "published"),
      supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("confirmed", true),
      supabase
        .from("automation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("trending_topics")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const posts = postsRes.data ?? [];
  const published = posts.filter((p) => p.status === "published");
  const totalViews = (viewsRes.data ?? []).reduce(
    (sum, p) => sum + (p.views ?? 0),
    0
  );
  const avgSeoScore =
    published.length > 0
      ? Math.round(
          published.reduce((sum, p) => sum + (p.seo_score ?? 0), 0) /
            published.length
        )
      : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalPosts: postsRes.count ?? 0,
      publishedPosts: published.length,
      draftPosts: posts.filter((p) => p.status === "draft").length,
      totalViews,
      avgSeoScore,
      totalSubscribers: subscribersRes.count ?? 0,
      pendingTopics: topicsRes.count ?? 0,
      recentLogs: logsRes.data ?? [],
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = getServerClient();
  try {
    const body = await req.json();
    const { post_id, referrer, country } = body;
    if (!post_id) {
      return NextResponse.json({ success: false, error: "post_id required" }, { status: 400 });
    }
    await supabase.from("analytics").upsert(
      {
        post_id,
        date: new Date().toISOString().split("T")[0],
        views: 1,
        referrer: referrer ?? null,
        country: country ?? null,
      },
      { onConflict: "post_id,date,referrer" }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
