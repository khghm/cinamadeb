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
 * Search Wikipedia for a title
 */
export async function searchWiki(query: string, lang: 'fa' | 'en' = 'fa'): Promise<string[]> {
  const baseUrl = lang === 'fa'
    ? 'https://fa.wikipedia.org/w/api.php'
    : 'https://en.wikipedia.org/w/api.php';

  try {
    const params = new URLSearchParams({
      action: 'opensearch',
      search: query,
      limit: '5',
      namespace: '0',
      format: 'json',
      origin: '*'
    });

    const res = await fetch(`${baseUrl}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data[1] || [];
  } catch {
    return [];
  }
}

/**
 * Get Wikipedia images for a title
 */
export async function fetchWikiImages(title: string, lang: 'fa' | 'en' = 'en'): Promise<string[]> {
  const baseUrl = lang === 'fa'
    ? 'https://fa.wikipedia.org/w/api.php'
    : 'https://en.wikipedia.org/w/api.php';

  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'images',
      format: 'json',
      origin: '*'
    });

    const res = await fetch(`${baseUrl}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return [];

    const page = Object.values(pages)[0] as any;
    return page?.images?.map((img: any) => img.title) || [];
  } catch {
    return [];
  }
}

/**
 * Get full Wikipedia page content
 */
export async function fetchWikiFullContent(title: string, lang: 'fa' | 'en' = 'fa'): Promise<string | null> {
  const baseUrl = lang === 'fa'
    ? 'https://fa.wikipedia.org/w/api.php'
    : 'https://en.wikipedia.org/w/api.php';

  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'extracts',
      exintro: 'false',
      explaintext: 'true',
      format: 'json',
      origin: '*'
    });

    const res = await fetch(`${baseUrl}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    return page?.extract || null;
  } catch {
    return null;
  }
}
