import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, TrendingUp, BookOpen, Search } from "lucide-react";
import { getServerClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/blog/PostCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import type { Post, Category } from "@/types";

async function getPosts(): Promise<Post[]> {
  const supabase = getServerClient();
  const { data } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug,color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(9);
  return (data ?? []) as Post[];
}

async function getCategories(): Promise<Category[]> {
  const supabase = getServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("post_count", { ascending: false })
    .limit(6);
  return data ?? [];
}

export default async function HomePage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);
  const trendingPosts = posts.slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-950 pt-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Powered by Groq & NVIDIA NIM
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white leading-[1.05] tracking-tight mb-6">
                Tech Insights
                <br />
                <span className="gradient-text">Powered by AI</span>
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-lg">
                Discover the latest in AI, web development, and tech — written in a human voice, optimized for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  Explore Articles <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                >
                  <Search className="w-4 h-4" /> Search Topics
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-10 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                {[
                  { label: "Articles", value: "100+" },
                  { label: "Topics Covered", value: "50+" },
                  { label: "Readers", value: "10K+" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</div>
                    <div className="text-sm text-zinc-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured post preview */}
            {featuredPost && (
              <div className="hidden lg:block">
                <PostCard post={featuredPost as Post & { categories: { name: string; slug: string; color: string } | null }} variant="featured" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Latest Articles ──────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">Latest</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">Recent Articles</h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as Post & { categories: { name: string; slug: string; color: string } | null }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Articles are being generated by AI...</p>
              <p className="text-sm mt-2">Check back soon or trigger the automation from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">Browse</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">Explore Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl"
                    style={{ background: `${cat.color}15` }}
                  >
                    🤖
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white text-center leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-xs text-zinc-400 mt-1">{cat.post_count} posts</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trending ──────────────────────────────────────────────── */}
      {trendingPosts.length > 0 && (
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider">Trending Now</p>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Popular This Week</h2>
              </div>
            </div>
            <div className="space-y-3">
              {trendingPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all"
                >
                  <span className="text-2xl font-black text-zinc-200 dark:text-zinc-800 w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {post.featured_image && (
                    <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0">
                      <Image src={post.featured_image} alt={post.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{post.reading_time} min · {(post.views ?? 0).toLocaleString()} views</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay Ahead of the Curve
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Get the latest AI and tech articles delivered to your inbox every week. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
