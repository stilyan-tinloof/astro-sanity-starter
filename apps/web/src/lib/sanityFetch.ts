import { sanityClient } from '@/sanity';
import { cachedFetch, type CacheContext } from './cache';
import type { QueryParams } from '@sanity/client';

interface SanityFetchOptions {
  query: string;
  params?: QueryParams;
  maxAge?: number;
  swr?: number;
}

interface SanityFetchResult<T> {
  data: T;
  tags: string[];
}

interface SanityResponse<T> {
  result: T;
  syncTags?: string[];
}

/**
 * Fetch data from Sanity with caching and cache tags.
 * Uses Workers Cache API with stale-while-revalidate.
 */
export async function sanityFetch<T>(
  options: SanityFetchOptions,
  ctx?: CacheContext
): Promise<SanityFetchResult<T>> {
  const { query, params = {}, maxAge, swr } = options;

  // Create stable cache key from query + params
  const cacheKey = `sanity:${hashQuery(query, params)}`;

  const fetcher = async () => {
    const response = (await sanityClient.fetch<T>(query, params, {
      filterResponse: false,
    })) as unknown as SanityResponse<T>;

    const data = 'result' in response ? response.result : (response as T);
    const tags = response.syncTags || [];

    return { data, tags };
  };

  return cachedFetch(cacheKey, fetcher, { maxAge, swr }, ctx);
}

/**
 * Create a stable hash from query and params for cache key.
 */
function hashQuery(query: string, params: QueryParams): string {
  const input = JSON.stringify({ query, params });
  // Simple hash - good enough for cache keys
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
