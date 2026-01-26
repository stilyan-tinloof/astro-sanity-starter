interface CacheEntry<T> {
  data: T;
  staleAt: number;    // Unix timestamp when entry becomes stale
  expiresAt: number;  // Unix timestamp when entry should be evicted
}

interface SWROptions {
  sMaxAge?: number;              // Seconds until stale (default: 60 = 1 min)
  staleWhileRevalidate?: number; // Seconds to serve stale while revalidating (default: 3600 = 1 hour)
  ctx?: ExecutionContext;        // For waitUntil()
}

// Workers Cache API accessor
function getCache(): Cache | undefined {
  return typeof caches !== 'undefined'
    ? (caches as unknown as { default: Cache }).default
    : undefined;
}

// Convert cache key to Request object (Workers Cache requires URL-like keys)
function keyToRequest(key: string): Request {
  return new Request(`https://cache/${encodeURIComponent(key)}`);
}

/**
 * Stale-while-revalidate cache wrapper for Workers Cache API.
 *
 * - If cache HIT and fresh: return cached data immediately
 * - If cache HIT and stale: return stale data, revalidate in background
 * - If cache MISS or expired: fetch fresh data, cache it, return
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: SWROptions
): Promise<T> {
  const sMaxAge = options?.sMaxAge ?? 60;
  const staleWhileRevalidate = options?.staleWhileRevalidate ?? 3600;
  const ctx = options?.ctx;

  const cache = getCache();
  const cacheRequest = keyToRequest(key);
  const now = Date.now();

  // Try to get from cache
  if (cache) {
    const cached = await cache.match(cacheRequest);

    if (cached) {
      try {
        const entry = await cached.json() as CacheEntry<T>;

        // Fresh: return immediately
        if (now < entry.staleAt) {
          return entry.data;
        }

        // Stale but not expired: return stale data, revalidate in background
        if (now < entry.expiresAt) {
          const revalidate = async () => {
            try {
              const freshData = await fetcher();
              await cacheData(cache, cacheRequest, freshData, sMaxAge, staleWhileRevalidate);
            } catch (err) {
              console.error('[SWR] Background revalidation failed:', err);
            }
          };

          if (ctx?.waitUntil) {
            ctx.waitUntil(revalidate());
          } else {
            // Fire and forget if no waitUntil available
            revalidate().catch(console.error);
          }

          return entry.data;
        }
        // Expired: fall through to fetch fresh
      } catch {
        // Invalid cache entry, fetch fresh
      }
    }
  }

  // Cache miss or expired: fetch fresh data
  const data = await fetcher();

  // Store in cache
  if (cache) {
    const cachePromise = cacheData(cache, cacheRequest, data, sMaxAge, staleWhileRevalidate);

    if (ctx?.waitUntil) {
      ctx.waitUntil(cachePromise);
    } else {
      cachePromise.catch(console.error);
    }
  }

  return data;
}

async function cacheData<T>(
  cache: Cache,
  request: Request,
  data: T,
  sMaxAge: number,
  staleWhileRevalidate: number
): Promise<void> {
  const now = Date.now();
  const totalTTL = sMaxAge + staleWhileRevalidate;

  const entry: CacheEntry<T> = {
    data,
    staleAt: now + sMaxAge * 1000,
    expiresAt: now + totalTTL * 1000,
  };

  const response = new Response(JSON.stringify(entry), {
    headers: {
      'Content-Type': 'application/json',
      // Set Cache-Control to total TTL to prevent Workers Cache from evicting early
      'Cache-Control': `public, max-age=${totalTTL}`,
    },
  });

  await cache.put(request, response);
}
