// ============================================================
// POSTS API
// GET /api/posts — paginated list
// POST /api/posts — create post
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "12");
  const status = searchParams.get("status") ?? "published";
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("posts")
    .select(
      "id,title,slug,excerpt,featured_image,og_image,author,category_id,tags,reading_time,status,views,seo_score,published_at,created_at,categories(id,name,slug,color)",
      { count: "exact" }
    )
    .eq("status", status)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  if (search) {
    query = query.textSearch("title", search, { type: "websearch" });
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = getServerClient();

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("posts")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
