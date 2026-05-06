"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { Post } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  posts: Post[];
}

export function HeroSlider({ posts }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  };

  const prev = () => goTo((current - 1 + posts.length) % posts.length);
  const next = () => goTo((current + 1) % posts.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current]);

  if (!posts.length) return null;

  const post = posts[current];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl shadow-indigo-200/30 dark:shadow-indigo-900/20">
      {/* Slide */}
      <div
        className={`relative h-[420px] sm:h-[520px] lg:h-[560px] transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/10" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          {/* Category badge */}
          {(post as Post & { categories?: { name: string; color: string; slug: string } | null }).categories && (
            <Link
              href={`/category/${(post as Post & { categories?: { name: string; color: string; slug: string } | null }).categories!.slug}`}
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 transition-opacity hover:opacity-80"
              style={{
                background: `${(post as Post & { categories?: { name: string; color: string; slug: string } | null }).categories!.color}25`,
                color: (post as Post & { categories?: { name: string; color: string; slug: string } | null }).categories!.color,
                border: `1px solid ${(post as Post & { categories?: { name: string; color: string; slug: string } | null }).categories!.color}50`,
              }}
            >
              {(post as Post & { categories?: { name: string; color: string; slug: string } | null }).categories!.name}
            </Link>
          )}

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3 max-w-3xl line-clamp-2">
            <Link href={`/blog/${post.slug}`} className="hover:text-indigo-300 transition-colors">
              {post.title}
            </Link>
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base mb-4 max-w-2xl line-clamp-2 hidden sm:block">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.reading_time} min</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(post.views ?? 0).toLocaleString()}</span>
              <span className="hidden sm:inline">{formatDate(post.published_at ?? post.created_at)}</span>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-indigo-500 backdrop-blur text-white text-sm font-semibold transition-all border border-white/20 hover:border-indigo-400"
            >
              Read Article <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
