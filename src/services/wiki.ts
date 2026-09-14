// Wikipedia API Service
// Uses Wikipedia REST API to fetch summaries and images

export interface WikiSummary {
  title: string;
  displaytitle: string;
  extract: string;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop: { page: string };
    mobile: { page: string };
  };
}

const FA_WIKI = 'https://fa.wikipedia.org/api/rest_v1/page/summary';
const EN_WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary';

// Cache for wiki data
const wikiCache = new Map<string, WikiSummary | null>();

/**
 * Fetch summary from Persian Wikipedia
 */
export async function fetchFaWikiSummary(title: string): Promise<WikiSummary | null> {
  const cacheKey = `fa:${title}`;
  if (wikiCache.has(cacheKey)) return wikiCache.get(cacheKey)!;

  try {
    const url = `${FA_WIKI}/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      wikiCache.set(cacheKey, null);
      return null;
    }
    const data: WikiSummary = await res.json();
    wikiCache.set(cacheKey, data);
    return data;
  } catch {
    wikiCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Fetch summary from English Wikipedia
 */
export async function fetchEnWikiSummary(title: string): Promise<WikiSummary | null> {
  const cacheKey = `en:${title}`;
  if (wikiCache.has(cacheKey)) return wikiCache.get(cacheKey)!;

  try {
    const url = `${EN_WIKI}/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      wikiCache.set(cacheKey, null);
      return null;
    }
    const data: WikiSummary = await res.json();
    wikiCache.set(cacheKey, data);
    return data;
  } catch {
    wikiCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Try to fetch from Persian Wikipedia first, then English
 */
export async function fetchWikiSummary(faTitle: string, enTitle: string): Promise<WikiSummary | null> {
  const cacheKey = `combined:${faTitle}:${enTitle}`;
  if (wikiCache.has(cacheKey)) return wikiCache.get(cacheKey)!;

  // Try Persian first
  let result = await fetchFaWikiSummary(faTitle);
  if (result) {
    wikiCache.set(cacheKey, result);
    return result;
  }

  // Fallback to English
  result = await fetchEnWikiSummary(enTitle);
  wikiCache.set(cacheKey, result);
  return result;
}

/**
 * Get image URL from Wikipedia
 */
export function getWikiImageUrl(wikiData: WikiSummary | null, size: 'thumb' | 'original' = 'thumb'): string | null {
  if (!wikiData) return null;
  
  if (size === 'thumb' && wikiData.thumbnail?.source) {
    return wikiData.thumbnail.source;
  }
  
  if (wikiData.originalimage?.source) {
    return wikiData.originalimage.source;
  }
  
  return null;
}

/**
 * Fetch all media images from Wikipedia in bulk
 */
export async function fetchAllMediaImages(items: { id: number; title: string; originalTitle: string }[]): Promise<Map<number, WikiSummary>> {
  const results = new Map<number, WikiSummary>();
  
  // Fetch in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const promises = batch.map(async (item) => {
      const wikiData = await fetchWikiSummary(item.title, item.originalTitle);
      if (wikiData) {
        results.set(item.id, wikiData);
      }
    });
    await Promise.all(promises);
    // Small delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}
