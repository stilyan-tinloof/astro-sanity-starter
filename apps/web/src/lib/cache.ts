// Cache TTL defaults (in seconds)
export const CACHE_MAX_AGE = 86400; // 1 day - fresh
export const CACHE_SWR = 604800; // 7 days - stale-while-revalidate

// CDN cache headers
export const CDN_MAX_AGE = 2592000; // 30 days
export const BROWSER_MAX_AGE = 31536000; // 1 year (browser respects s-maxage)

export type CacheContext = {
  ctx?: {
    waitUntil: (p: Promise<unknown>) => void;
  };
};

type CacheOptions = {
  maxAge?: number;
  swr?: number;
};

type CachedEntry<T> = {
  data: T;
  timestamp: number;
  tags: string[];
};

type CacheContext = {
  waitUntil?: (p: Promise<unknown>) => void;
};

/**
 * Cached fetch with manual stale-while-revalidate behavior.
 * Uses Cloudflare Workers Cache API under the hood.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<{ data: T; tags: string[] }>,
  options: CacheOptions = {},
  ctx?: CacheContext
): Promise<{ data: T; tags: string[] }> {
  const { maxAge = CACHE_MAX_AGE, swr = CACHE_SWR } = options;

  // Workers Cache API - may not exist in dev
  const cache =
    typeof caches !== 'undefined'
      ? (caches as unknown as { default: Cache }).default
      : undefined;
  if (!cache) {
    // Fallback to direct fetch when cache unavailable
    return fetcher();
  }

  const cacheKey = new Request(`https://cache.internal/${key}`);

  try {
    const cached = await cache.match(cacheKey);

    if (cached) {
      const entry = (await cached.json()) as CachedEntry<T>;
      const age = (Date.now() - entry.timestamp) / 1000;

      if (age < maxAge) {
        // Fresh - return immediately
        return { data: entry.data, tags: entry.tags };
      }

      if (age < maxAge + swr) {
        // Stale but within SWR window - return stale, revalidate in background
        if (ctx?.ctx?.waitUntil) {
          ctx.waitUntil(revalidate(cacheKey, fetcher, cache, maxAge, swr));
        }
        return { data: entry.data, tags: entry.tags };
      }
      // Expired - fall through to fresh fetch
    }
  } catch (e) {
    console.error('[Cache] Read error:', e);
  }

  // Cache miss or expired - fetch fresh
  const result = await fetcher();

  // Store in cache (fire and forget)
  const entry: CachedEntry<T> = {
    data: result.data,
    timestamp: Date.now(),
    tags: result.tags,
  };

  const storePromise = cache
    .put(
      cacheKey,
      new Response(JSON.stringify(entry), {
        headers: {
          'Content-Type': 'application/json',
          // Store for maxAge + swr duration
          'Cache-Control': `max-age=${maxAge + swr}`,
        },
      })
    )
    .catch((e) => console.error('[Cache] Write error:', e));

  if (ctx?.ctx?.waitUntil) {
    ctx.waitUntil(storePromise);
  }

  return result;
}

async function revalidate<T>(
  cacheKey: Request,
  fetcher: () => Promise<{ data: T; tags: string[] }>,
  cache: Cache,
  maxAge: number,
  swr: number
): Promise<void> {
  try {
    const result = await fetcher();
    const entry: CachedEntry<T> = {
      data: result.data,
      timestamp: Date.now(),
      tags: result.tags,
    };
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(entry), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${maxAge + swr}`,
        },
      })
    );
  } catch (err) {
    console.error('[Cache] Revalidate error:', err);
  }
}
