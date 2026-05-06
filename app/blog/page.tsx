import { Suspense } from "react";
import { getServerClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/blog/PostCard";
import type { Post } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore AI-generated, SEO-optimized articles on technology, AI, machine learning, and web development.",
};

async function getPosts(page = 1) {
  const supabase = getServerClient();
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const { data, count } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug,color)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, from + pageSize - 1);
  return { posts: (data ?? []) as Post[], total: count ?? 0, pageSize };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const { posts, total, pageSize } = await getPosts(page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            All <span className="gradient-text">Articles</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            {total} AI-powered articles on technology, AI, and software development
          </p>
        </div>

        {/* Posts grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as Post & { categories: { name: string; slug: string; color: string } | null }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <a
                    href={`/blog?page=${page - 1}`}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 transition-colors"
                  >
                    ← Previous
                  </a>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <a
                      key={p}
                      href={`/blog?page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300"
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                {page < totalPages && (
                  <a
                    href={`/blog?page=${page + 1}`}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              AI is warming up...
            </h2>
            <p className="text-zinc-500">
              Articles are being auto-generated. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
