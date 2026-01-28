import { sanityClient } from '@/sanity';
import type { QueryParams } from '@sanity/client';

interface FetchOptions {
  query: string;
  params?: QueryParams;
}

interface FetchResult<T> {
  data: T;
  syncTags: string[];
}

export async function sanityFetch<T>({ query, params }: FetchOptions): Promise<FetchResult<T>> {
  console.debug('[sanityFetch] query:', query, 'params:', params);

  const { result, syncTags } = await sanityClient.fetch<T>(query, params, {
    filterResponse: false,
  });

  console.debug('[sanityFetch] syncTags:', syncTags);
  console.debug('[sanityFetch] result keys:', result && typeof result === 'object' ? Object.keys(result) : typeof result);

  return { data: result, syncTags: syncTags ?? [] };
}
