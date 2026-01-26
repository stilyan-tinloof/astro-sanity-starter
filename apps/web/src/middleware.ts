import { defineMiddleware } from 'astro:middleware';
import { CDN_MAX_AGE, BROWSER_MAX_AGE } from '@/lib/cache';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals } = context;
  const url = new URL(request.url);

  // Skip for non-GET, API routes, CMS, static assets
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/cms') ||
    url.pathname.startsWith('/_') ||
    url.pathname.match(/\.(js|css|ico|png|jpg|svg|woff2?)$/)
  ) {
    return next();
  }

  // Workers Cache API
  const cache = typeof caches !== 'undefined'
    ? (caches as unknown as { default: Cache }).default
    : undefined;

  const cacheKey = new Request(url.toString(), {
    method: 'GET',
    headers: { 'Accept': request.headers.get('Accept') || 'text/html' },
  });

  // Try cache first
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-Cache-Status', 'HIT');
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      });
    }
  }

  // Render the page
  const response = await next();

  // Don't cache errors
  if (response.status !== 200) {
    return response;
  }

  // Set cache headers
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CDN_MAX_AGE}`);
  headers.set('X-Cache-Status', 'MISS');

  const cacheableResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  // Store in Workers Cache
  if (cache) {
    const ctx = locals.runtime?.ctx;
    const toCache = cacheableResponse.clone();

    if (ctx?.waitUntil) {
      ctx.waitUntil(cache.put(cacheKey, toCache));
    } else {
      cache.put(cacheKey, toCache).catch(console.error);
    }
  }

  return cacheableResponse;
});
