import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/blog/PostCard";
import type { Post } from "@/types";

export async function generateStaticParams() {
  const supabase = getServerClient();
  const { data } = await supabase.from("categories").select("slug");
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServerClient();
  const { data } = await supabase.from("categories").select("name,description").eq("slug", slug).single();
  if (!data) return { title: "Category Not Found" };
  return {
    title: `${data.name} Articles`,
    description: data.description ?? `Browse all ${data.name} articles on AIScribe.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServerClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug,color)")
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false })
    .limit(24);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{
              background: `${category.color}15`,
              color: category.color,
              border: `1px solid ${category.color}30`,
            }}
          >
            Category
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-zinc-500 max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm text-zinc-400 mt-3">{(posts ?? []).length} articles</p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post as Post & { categories: { name: string; slug: string; color: string } | null }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-6xl mb-4">📂</p>
            <p className="text-xl font-semibold">No articles in this category yet</p>
            <p className="text-sm mt-2">Our AI is working on it. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
