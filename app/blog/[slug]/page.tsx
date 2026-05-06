import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerClient } from "@/lib/supabase/server";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { Clock, Eye, Calendar, Tag, ChevronRight, Home } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import type { Post, FAQ, TOCItem } from "@/types";

// Generate static params for ISR
export async function generateStaticParams() {
  const supabase = getServerClient();
  const { data } = await supabase.from("posts").select("slug").eq("status", "published").limit(100);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServerClient();
  const { data: post } = await supabase.from("posts").select("title,meta_description,og_image,slug").eq("slug", slug).single();

  if (!post) return { title: "Post Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiscribe.dev";
  return {
    title: post.title,
    description: post.meta_description,
    openGraph: {
      title: post.title,
      description: post.meta_description ?? "",
      url: `${siteUrl}/blog/${post.slug}`,
      images: post.og_image ? [{ url: post.og_image }] : [],
      type: "article",
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.meta_description ?? "", images: post.og_image ? [post.og_image] : [] },
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiscribe.dev";

  const { data: post } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug,color,icon)")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  // Fetch related posts
  const { data: related } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,featured_image,reading_time,views,published_at,categories(id,name,slug,color)")
    .eq("status", "published")
    .eq("category_id", post.category_id)
    .neq("id", post.id)
    .limit(3);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteUrl },
    { name: "Blog", url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${slug}` },
  ]);

  const faqs = post.faqs_json as FAQ[] | null;
  const toc = post.toc_json as TOCItem[] | null;

  // Increment view count (server-side fire and forget)
  supabase.from("posts").update({ views: (post.views ?? 0) + 1 }).eq("id", post.id).then(() => {});

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {post.schema_json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.schema_json) }}
        />
      )}

      <div className="min-h-screen pt-16">
        {/* Hero image */}
        {post.featured_image && (
          <div className="relative h-72 sm:h-96 lg:h-[480px] w-full">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-black/20" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main content */}
            <article>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-zinc-400 py-6" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">{post.title}</span>
              </nav>

              {/* Category */}
              {post.categories && (
                <Link
                  href={`/category/${post.categories.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-4 transition-all hover:opacity-80"
                  style={{
                    background: `${post.categories.color}15`,
                    color: post.categories.color,
                    border: `1px solid ${post.categories.color}30`,
                  }}
                >
                  {post.categories.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 pb-6 mb-8 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.published_at ?? post.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.reading_time} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {(post.views ?? 0).toLocaleString()} views
                </span>
              </div>

              {/* Table of Contents */}
              {toc && toc.length > 0 && (
                <div className="mb-10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>📑</span> Table of Contents
                  </h2>
                  <ol className="space-y-2">
                    {toc.map((item, i) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors ${item.level > 2 ? "ml-4" : ""}`}
                        >
                          <span className="text-zinc-400 text-xs font-mono w-5 shrink-0">{i + 1}.</span>
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Article content */}
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* FAQs */}
              {faqs && faqs.length > 0 && (
                <div className="mt-12 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                    <span>❓</span> Frequently Asked Questions
                  </h2>
                  <div className="space-y-5">
                    {faqs.map((faq, i) => (
                      <details key={i} className="group">
                        <summary className="cursor-pointer font-semibold text-zinc-900 dark:text-white flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-700">
                          {faq.question}
                          <ChevronRight className="w-4 h-4 text-indigo-500 group-open:rotate-90 transition-transform shrink-0 ml-3" />
                        </summary>
                        <p className="pt-3 pb-1 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-zinc-400 self-center" />
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Related posts */}
                {related && related.length > 0 && (
                  <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Related Articles</h3>
                    <div className="space-y-2">
                      {related.map((p) => (
                        <PostCard
                          key={p.id}
                          post={p as unknown as Post & { categories: { name: string; slug: string; color: string } | null }}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Ad placeholder */}
                <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-center text-zinc-400 text-sm">
                  <p className="font-medium mb-1">Advertisement</p>
                  <p className="text-xs">AdSense Sidebar Slot</p>
                </div>
              </div>
            </aside>
          </div>

          {/* Related posts mobile */}
          {related && related.length > 0 && (
            <div className="lg:hidden mt-12">
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-6">Related Articles</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p as unknown as Post & { categories: { name: string; slug: string; color: string } | null }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
