// ============================================================
// UNSPLASH IMAGE API — Fallback
// ============================================================

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    portfolio_url: string | null;
  };
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
  total: number;
}

export async function searchUnsplashImage(
  query: string
): Promise<UnsplashPhoto | null> {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) return null;

    const data: UnsplashResponse = await response.json();
    if (!data.results || data.results.length === 0) return null;

    return data.results[0];
  } catch {
    return null;
  }
}

export async function getUnsplashImage(
  keyword: string
): Promise<{ url: string; alt: string; photographer: string } | null> {
  const photo = await searchUnsplashImage(keyword);
  if (!photo) return null;

  return {
    url: photo.urls.regular,
    alt: photo.alt_description || photo.description || keyword,
    photographer: photo.user.name,
  };
}
