// ============================================================
// PEXELS IMAGE API
// ============================================================

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

export async function searchPexelsImage(
  query: string
): Promise<PexelsPhoto | null> {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY ?? "" },
    });

    if (!response.ok) return null;

    const data: PexelsResponse = await response.json();
    if (!data.photos || data.photos.length === 0) return null;

    // Return the first high-quality result
    return data.photos[0];
  } catch {
    return null;
  }
}

export async function getImageForArticle(
  keyword: string,
  title: string
): Promise<{ url: string; alt: string; photographer: string } | null> {
  // Try with keyword first, then title words
  const queries = [
    keyword,
    title.split(" ").slice(0, 3).join(" "),
    "technology computer",
  ];

  for (const q of queries) {
    const photo = await searchPexelsImage(q);
    if (photo) {
      return {
        url: photo.src.large2x,
        alt: photo.alt || `${keyword} - ${photo.photographer}`,
        photographer: photo.photographer,
      };
    }
  }
  return null;
}
