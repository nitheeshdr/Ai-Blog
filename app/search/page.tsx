"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  reading_time: number;
  published_at: string | null;
  tags: string[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.data ?? []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
            Search <span className="gradient-text">Articles</span>
          </h1>
          <p className="text-zinc-500">Find articles on AI, tech, tutorials, and more</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for topics, keywords..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No results found</h2>
            <p className="text-zinc-500">Try different keywords or browse <Link href="/blog" className="text-indigo-600 hover:underline">all articles</Link>.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 mb-6">{results.length} results for &quot;{query}&quot;</p>
            {results.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
              >
                {post.featured_image && (
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                    <Image src={post.featured_image} alt={post.title} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{formatDate(post.published_at ?? "")}</span>
                    <span>{post.reading_time} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
