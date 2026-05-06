// ============================================================
// SEARCH API
// GET /api/search?q=keyword
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,featured_image,reading_time,published_at,tags")
    .eq("status", "published")
    .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,tags.cs.{${q}}`)
    .order("published_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
