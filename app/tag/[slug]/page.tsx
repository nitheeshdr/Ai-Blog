import type { Metadata } from "next";
import { getServerClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/blog/PostCard";
import type { Post } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = slug.replace(/-/g, " ");
  return {
    title: `#${tag} Articles`,
    description: `Browse all articles tagged with ${tag} on AIScribe.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServerClient();
  const tag = slug.replace(/-/g, " ");

  const { data: posts } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug,color)")
    .eq("status", "published")
    .contains("tags", [tag])
    .order("published_at", { ascending: false })
    .limit(24);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-semibold mb-4">Tag</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-3">
            #{tag}
          </h1>
          <p className="text-sm text-zinc-400">{(posts ?? []).length} articles</p>
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
            <p className="text-6xl mb-4">🏷️</p>
            <p className="text-xl font-semibold">No articles with this tag yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
