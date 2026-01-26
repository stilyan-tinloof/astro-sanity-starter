import { sanityClient } from '@/sanity';
import { extractTags } from './cache';
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
