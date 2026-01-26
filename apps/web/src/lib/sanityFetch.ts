import { sanityClient } from '@/sanity';
import { extractTags } from './cache';
import { cachedFetch } from './cache/swr';
import type { QueryParams } from '@sanity/client';

interface FetchOptions {
  query: string;
  params?: QueryParams;
}

interface FetchResult<T> {
  data: T;
  tags: string[];
}

export async function sanityFetch<T>({ query, params }: FetchOptions): Promise<FetchResult<T>> {
  const data = await sanityClient.fetch<T>(query, params);

  // Extract all document IDs as cache tags
  const tags = extractTags(data);

  return { data, tags };
}

interface CachedFetchOptions extends FetchOptions {
  ctx?: ExecutionContext;
  sMaxAge?: number;              // Seconds until stale (default: 60)
  staleWhileRevalidate?: number; // Seconds to serve stale (default: 3600)
}

/**
 * Cached variant of sanityFetch with stale-while-revalidate semantics.
 * Uses Workers Cache API per-datacenter.
 */
export async function cachedSanityFetch<T>(options: CachedFetchOptions): Promise<FetchResult<T>> {
  // URL-encode query and params to create unique cache key
  const cacheKey = `sanity:${encodeURIComponent(options.query)}:${encodeURIComponent(JSON.stringify(options.params || {}))}`;

  const result = await cachedFetch(
    cacheKey,
    () => sanityFetch<T>({ query: options.query, params: options.params }),
    {
      sMaxAge: options.sMaxAge ?? 60,
      staleWhileRevalidate: options.staleWhileRevalidate ?? 3600,
      ctx: options.ctx,
    }
  );

  return result;
}
