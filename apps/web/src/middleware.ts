import { defineMiddleware } from 'astro:middleware';
import { BROWSER_MAX_AGE, CACHE_TIME_HEADER, CACHE_TTL, CDN_MAX_AGE } from '@/lib/cache';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Skip caching for non-GET, API routes, CMS, static assets
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/cms') ||
    url.pathname.startsWith('/_') ||
    url.pathname.match(/\.(js|css|ico|png|jpg|svg|woff2?)$/)
  ) {
    return next();
  }

  // Cache API not available (e.g., dev mode or workers.dev domain)
  if (typeof caches === 'undefined') {
    return next();
  }

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const ctx = context.locals.runtime?.ctx;

  // --- Cache lookup ---
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    // Determine freshness from X-Cache-Time header
    const cacheTimeStr = cachedResponse.headers.get(CACHE_TIME_HEADER);
    const cacheTime = cacheTimeStr ? parseInt(cacheTimeStr, 10) : 0;
    const age = cacheTime ? (Date.now() - cacheTime) / 1000 : Infinity;

    if (age < CDN_MAX_AGE) {
      // FRESH — serve as-is
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cache', 'HIT');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    // STALE — serve stale, delete cache entry so next request renders fresh
    const headers = new Headers(cachedResponse.headers);
    headers.set('X-Cache', 'STALE');

    if (ctx?.waitUntil) {
      ctx.waitUntil(cache.delete(cacheKey));
    }

    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    });
  }

  // --- Cache MISS — render the page ---
  const originalResponse = await next();

  if (originalResponse.status !== 200) {
    return originalResponse;
  }

  const body = await originalResponse.arrayBuffer();
  const headers = new Headers(originalResponse.headers);
  headers.set('Cache-Control', `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CACHE_TTL}`);
  headers.set(CACHE_TIME_HEADER, Date.now().toString());

  const responseToCache = new Response(body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers,
  });

  // Store in cache
  if (ctx?.waitUntil) {
    ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
  } else {
    await cache.put(cacheKey, responseToCache.clone());
  }

  // Return response with MISS header
  headers.set('X-Cache', 'MISS');
  return new Response(body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers,
  });
});
