import { getServerClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiscribe.dev";

export async function GET() {
  const supabase = getServerClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("slug,updated_at,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("slug,updated_at");

  const staticPages = [
    { url: siteUrl, priority: "1.0", changefreq: "daily" },
    { url: `${siteUrl}/blog`, priority: "0.9", changefreq: "daily" },
    { url: `${siteUrl}/about`, priority: "0.7", changefreq: "monthly" },
    { url: `${siteUrl}/contact`, priority: "0.6", changefreq: "monthly" },
    { url: `${siteUrl}/privacy-policy`, priority: "0.5", changefreq: "yearly" },
    { url: `${siteUrl}/terms`, priority: "0.5", changefreq: "yearly" },
    { url: `${siteUrl}/disclaimer`, priority: "0.5", changefreq: "yearly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
${(categories ?? [])
  .map(
    (cat) => `  <url>
    <loc>${siteUrl}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
${(posts ?? [])
  .map(
    (post) => `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at ?? post.published_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
