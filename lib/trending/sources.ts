// ============================================================
// TRENDING TOPICS AGGREGATOR
// ============================================================

import type { TrendingTopic } from "@/types";

interface RawTopic {
  keyword: string;
  source: string;
  score: number;
}

// ── Hacker News Top Stories ────────────────────────────────
async function fetchHackerNews(): Promise<RawTopic[]> {
  try {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 3600 } }
    );
    const ids: number[] = await res.json();

    // Fetch top 10 stories
    const stories = await Promise.all(
      ids.slice(0, 10).map(async (id) => {
        const r = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return r.json();
      })
    );

    return stories
      .filter(
        (s) =>
          s?.title &&
          s.type === "story" &&
          (s.score || 0) > 50 &&
          !s.title.toLowerCase().includes("ask hn") &&
          !s.title.toLowerCase().includes("show hn")
      )
      .slice(0, 5)
      .map((s) => ({
        keyword: s.title.slice(0, 120),
        source: "hacker-news",
        score: Math.min(100, Math.floor((s.score / 500) * 100)),
      }));
  } catch {
    return [];
  }
}

// ── Dev.to RSS Feed ────────────────────────────────────────
async function fetchDevTo(): Promise<RawTopic[]> {
  try {
    const res = await fetch("https://dev.to/api/articles?top=7&per_page=8", {
      next: { revalidate: 3600 },
    });
    const articles = await res.json();

    return articles
      .filter((a: { title: string; positive_reactions_count: number }) => a?.title)
      .slice(0, 5)
      .map((a: { title: string; positive_reactions_count: number }) => ({
        keyword: a.title.slice(0, 120),
        source: "dev.to",
        score: Math.min(100, Math.floor((a.positive_reactions_count / 200) * 100)),
      }));
  } catch {
    return [];
  }
}

// ── GitHub Trending Topics ─────────────────────────────────
async function fetchGitHubTrending(): Promise<RawTopic[]> {
  try {
    const res = await fetch(
      "https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=10",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.items || []).slice(0, 5).map(
      (repo: { name: string; description: string; stargazers_count: number }) => ({
        keyword: `${repo.name}: ${repo.description || ""}`.slice(0, 120),
        source: "github-trending",
        score: Math.min(100, Math.floor((repo.stargazers_count / 10000) * 100)),
      })
    );
  } catch {
    return [];
  }
}

// ── Reddit Tech Posts ──────────────────────────────────────
async function fetchReddit(): Promise<RawTopic[]> {
  try {
    const subreddits = ["technology", "artificial", "programming"];
    const results: RawTopic[] = [];

    for (const sub of subreddits) {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=5`,
        {
          headers: { "User-Agent": "AIScribe/1.0" },
          next: { revalidate: 3600 },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();

      const posts = data?.data?.children || [];
      for (const post of posts.slice(0, 3)) {
        const d = post?.data;
        if (d?.title && !d.stickied && d.score > 100) {
          results.push({
            keyword: d.title.slice(0, 120),
            source: `reddit/${sub}`,
            score: Math.min(100, Math.floor((d.score / 5000) * 100)),
          });
        }
      }
    }
    return results.slice(0, 5);
  } catch {
    return [];
  }
}

// ── Aggregate & deduplicate ────────────────────────────────
export async function fetchTrendingTopics(): Promise<
  Omit<TrendingTopic, "id" | "created_at" | "processed_at" | "post_id">[]
> {
  const [hn, devto, gh, reddit] = await Promise.allSettled([
    fetchHackerNews(),
    fetchDevTo(),
    fetchGitHubTrending(),
    fetchReddit(),
  ]);

  const all: RawTopic[] = [
    ...(hn.status === "fulfilled" ? hn.value : []),
    ...(devto.status === "fulfilled" ? devto.value : []),
    ...(gh.status === "fulfilled" ? gh.value : []),
    ...(reddit.status === "fulfilled" ? reddit.value : []),
  ];

  // Deduplicate by similar keywords
  const seen = new Set<string>();
  const unique = all.filter((t) => {
    const key = t.keyword.toLowerCase().slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by score descending
  return unique
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((t) => ({
      keyword: t.keyword,
      trend_score: t.score,
      source: t.source,
      difficulty: t.score > 70 ? "high" : t.score > 40 ? "medium" : "low",
      cpc_estimate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      search_volume: Math.floor(t.score * 150),
      status: "pending" as const,
    }));
}
