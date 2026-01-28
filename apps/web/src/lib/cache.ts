// Cache TTLs
export const CDN_MAX_AGE = 60;            // 1 min — fresh window
export const SWR_WINDOW = 86400;          // 24h — stale-while-revalidate window
export const BROWSER_MAX_AGE = 0;         // Always revalidate with CDN
export const CACHE_TTL = CDN_MAX_AGE + SWR_WINDOW; // Total CF cache lifetime
export const CACHE_TIME_HEADER = 'X-Cache-Time';
