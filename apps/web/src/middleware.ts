import { defineMiddleware } from 'astro:middleware';
import { CDN_MAX_AGE, BROWSER_MAX_AGE } from '@/lib/cache';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Skip middleware for non-GET, API routes, and CMS
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/cms')
  ) {
    return next();
  }

  const response = await next();

  // Create new headers with cache control
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CDN_MAX_AGE}`);
  headers.set('CDN-Cache-Control', `public, max-age=${CDN_MAX_AGE}`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
