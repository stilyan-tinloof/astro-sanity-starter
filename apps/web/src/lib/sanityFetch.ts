import { sanityClient } from '@/sanity';
import type { QueryParams, ContentSourceMap } from '@sanity/client';
import type { AstroCookies } from 'astro';

interface FetchOptions {
  query: string;
  params?: QueryParams;
  cookies?: AstroCookies;
  perspective?: 'published' | 'drafts';
  stega?: boolean;
}

interface FetchResult<T> {
  data: T;
  syncTags: string[];
  sourceMap: ContentSourceMap | null;
}

/**
 * Fetch data from Sanity with draft mode and stega support.
 *
 * - In draft mode: uses 'drafts' perspective, enables stega encoding for visual editing
 * - In published mode: uses 'published' perspective, disables stega, uses CDN
 */
export async function sanityFetch<T>({
  query,
  params,
  cookies,
  perspective: _perspective,
  stega: _stega,
}: FetchOptions): Promise<FetchResult<T>> {
  // Resolve perspective from cookie if not explicitly provided
  const isDraftMode = cookies?.get('sanity-draft-mode')?.value === 'true';
  const perspective = _perspective ?? (isDraftMode ? 'drafts' : 'published');

  // Enable stega only in draft mode (for visual editing overlays)
  const stega = _stega ?? isDraftMode;

  const { result, syncTags, resultSourceMap } = await sanityClient
    .withConfig({
      useCdn: false, // Always fetch fresh - page-level caching handled by middleware
      perspective,
      stega: stega ? { enabled: true, studioUrl: '/cms' } : { enabled: false },
    })
    .fetch<T>(query, params, {
      filterResponse: false,
    });

  return {
    data: result,
    syncTags: syncTags ?? [],
    sourceMap: resultSourceMap ?? null,
  };
}
