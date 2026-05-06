import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, TrendingUp, Clock, Eye } from "lucide-react";
import { getServerClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/blog/PostCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { HeroSlider } from "@/components/home/HeroSlider";
import { RefreshButton } from "@/components/home/RefreshButton";
import type { Post, Category } from "@/types";
import { formatDate } from "@/lib/utils";

// Auto category icons map
const CATEGORY_ICONS: Record<string, string> = {
  "artificial-intelligence": "🤖",
  "ai": "🤖",
  "machine-learning": "🧠",
  "web-development": "🌐",
  "programming": "💻",
  "python": "🐍",
  "javascript": "⚡",
  "typescript": "📘",
  "react": "⚛️",
  "nextjs": "▲",
  "devops": "🚀",
  "cloud": "☁️",
  "security": "🔐",
  "blockchain": "🔗",
  "data-science": "📊",
  "tutorials": "📖",
  "tools": "🛠️",
  "news": "📰",
  "open-source": "🌍",
  "career": "💼",
};

function getCategoryIcon(slug: string, name: string): string {
  // Try slug first
  const slugKey = slug.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (slugKey.includes(key)) return CATEGORY_ICONS[key];
  }
  // Try name
  const nameKey = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (nameKey.includes(key)) return CATEGORY_ICONS[key];
  }
  return "📝";
}

async function getData() {
  const supabase = getServerClient();

  const [{ data: posts }, { data: categories }, { count: totalPosts }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, categories(id,name,slug,color)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(12),
    supabase
      .from("categories")
      .select("*")
      .order("post_count", { ascending: false })
      .limit(8),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  return {
    posts: (posts ?? []) as Post[],
    categories: (categories ?? []) as Category[],
    totalPosts: totalPosts ?? 0,
  };
}

export default async function HomePage() {
  const { posts, categories, totalPosts } = await getData();

  // Slider: top 5 posts with images
  const sliderPosts = posts.filter((p) => p.featured_image).slice(0, 5);
  // All posts for the grid below
  const allPosts = posts;

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-950 pt-16">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-400/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative">
          {/* Top heading */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Autonomous AI-powered articles
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight mb-3">
              Tech Insights <span className="gradient-text">Powered by AI</span>
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Discover the latest in AI, web development, and tech — written in a human voice, optimized for you.
            </p>
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-6">
              {[
                { label: "Articles", value: totalPosts > 0 ? `${totalPosts}+` : "Growing" },
                { label: "Categories", value: categories.length > 0 ? `${categories.length}` : "8+" },
                { label: "Updated", value: "Hourly" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-zinc-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Blog Slider ──────────────────────────────────────── */}
          {sliderPosts.length > 0 ? (
            <HeroSlider posts={sliderPosts} />
          ) : (
            /* Placeholder if no posts yet */
            <div className="relative h-[420px] rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 flex flex-col items-center justify-center text-center bg-indigo-50/50 dark:bg-indigo-950/10">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">AI is generating articles...</h2>
              <p className="text-zinc-500 mb-4">Articles will appear here once published.</p>
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all text-sm"
              >
                Trigger Generation →
              </Link>
            </div>
          )}

          {/* CTA buttons below slider */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              Explore All Articles <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-indigo-300 transition-all"
            >
              Search Topics
            </Link>
          </div>
        </div>
      </section>

      {/* ── Auto Categories ───────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Browse</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Explore Categories</h2>
              </div>
              <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-medium">
                Auto-categorized by AI
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 hover:-translate-y-1"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 text-xl"
                    style={{ background: `${cat.color}18` }}
                  >
                    {getCategoryIcon(cat.slug, cat.name)}
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1">{cat.post_count} posts</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Latest Blogs ──────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Latest</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Recent Articles</h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:gap-2.5 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {allPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as Post & { categories: { name: string; slug: string; color: string } | null }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <div className="text-6xl mb-5">🤖</div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">AI is warming up…</h3>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                Articles are being autonomously generated. Use the admin dashboard to trigger generation right now.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/admin"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  Generate First Article
                </Link>
                <RefreshButton />
              </div>
            </div>
          )}

          {allPosts.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                Load More Articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Trending sidebar-style ────────────────────────────────── */}
      {allPosts.length > 3 && (
        <section className="py-16 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">Popular</p>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Trending This Week</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPosts.slice(0, 6).map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all"
                >
                  <span className="text-3xl font-black text-zinc-100 dark:text-zinc-800 w-8 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {post.featured_image && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image src={post.featured_image} alt={post.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3" /> {post.reading_time} min
                      <Eye className="w-3 h-3 ml-1" /> {(post.views ?? 0).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Stay Ahead of the Curve</h2>
          <p className="text-indigo-200 text-lg mb-8">
            Get the latest AI and tech articles delivered to your inbox every week. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
