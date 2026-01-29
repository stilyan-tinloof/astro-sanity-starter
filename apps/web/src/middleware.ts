import { defineMiddleware } from 'astro:middleware';
import { CDN_MAX_AGE, BROWSER_MAX_AGE } from '@/lib/cache';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Skip caching for non-GET, API routes, CMS, static assets, and draft mode
  const isDraftMode = request.headers.get('cookie')?.includes('sanity-draft-mode=true');
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/cms') ||
    url.pathname.startsWith('/_') ||
    url.pathname.match(/\.(js|css|ico|png|jpg|svg|woff2?)$/) ||
    isDraftMode
  ) {
    return next();
  }

  // Cache API not available (e.g., dev mode or workers.dev domain)
  if (typeof caches === 'undefined') {
    return next();
  }

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });

  // Check cache first
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    // Return cached response with HIT header
    const headers = new Headers(cachedResponse.headers);
    headers.set('X-Cache', 'HIT');
    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    });
  }

  // Cache miss - render the page
  const originalResponse = await next();

  // Only cache successful responses
  if (originalResponse.status !== 200) {
    return originalResponse;
  }

  // Build headers for cached response
  const headers = new Headers(originalResponse.headers);
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CDN_MAX_AGE}`);
  }

  // Read body once, use for both cache and response
  const body = await originalResponse.arrayBuffer();

  // Create response to cache (without X-Cache header)
  const responseToCache = new Response(body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers,
  });

  // Store in cache (non-blocking via waitUntil)
  const ctx = context.locals.runtime?.ctx;
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
