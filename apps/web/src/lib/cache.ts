// How long CF CDN caches the response (worst-case staleness if no browser is open)
export const CDN_MAX_AGE = 300; // 5 min
export const BROWSER_MAX_AGE = 0;    // Always revalidate with CDN
