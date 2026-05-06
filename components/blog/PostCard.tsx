import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, ArrowRight } from "lucide-react";
import type { Post } from "@/types";
import { formatDate, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post & { categories?: { name: string; slug: string; color: string } | null };
  variant?: "default" | "featured" | "compact";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="flex gap-3 group p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
      >
        {post.featured_image && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {post.title}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{formatDate(post.published_at ?? post.created_at)}</p>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group relative rounded-2xl overflow-hidden bg-zinc-900 text-white shadow-2xl h-[480px]">
        {post.featured_image && (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {post.categories && (
            <span
              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
              style={{ background: `${post.categories.color}30`, color: post.categories.color, border: `1px solid ${post.categories.color}50` }}
            >
              {post.categories.name}
            </span>
          )}
          <h2 className="text-2xl font-bold mb-2 leading-tight group-hover:text-indigo-300 transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time} min</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views?.toLocaleString()}</span>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Read <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
        )}
        {post.categories && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 text-xs font-semibold rounded-full"
              style={{
                background: `${post.categories.color}20`,
                color: post.categories.color,
                border: `1px solid ${post.categories.color}40`,
                backdropFilter: "blur(10px)",
              }}
            >
              {post.categories.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-zinc-900 dark:text-white text-lg leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
          {truncate(post.excerpt ?? "", 130)}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{post.reading_time} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />{(post.views ?? 0).toLocaleString()}
            </span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            )}
          >
            Read <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
