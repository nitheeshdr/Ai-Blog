// ============================================================
// SINGLE POST API
// GET /api/posts/[slug]
// PATCH /api/posts/[slug]
// DELETE /api/posts/[slug]
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug,color,icon)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
  }

  // Increment views (fire and forget)
  supabase
    .from("posts")
    .update({ views: (data.views ?? 0) + 1 })
    .eq("slug", slug)
    .then(() => {});

  // Log analytics
  supabase
    .from("analytics")
    .upsert(
      { post_id: data.id, date: new Date().toISOString().split("T")[0], views: 1 },
      { onConflict: "post_id,date,referrer", ignoreDuplicates: false }
    )
    .then(() => {});

  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getServerClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("posts")
    .update(body)
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getServerClient();

  const { error } = await supabase.from("posts").delete().eq("slug", slug);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Post deleted" });
}
