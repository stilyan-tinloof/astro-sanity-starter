import { defineMiddleware } from 'astro:middleware';
import { CDN_MAX_AGE, BROWSER_MAX_AGE } from '@/lib/cache';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
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

  const response = await next();

  if (response.status !== 200) {
    return response;
  }

  // Set cache headers for CDN
  response.headers.set('Cache-Control', `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CDN_MAX_AGE}`);

  return response;
});
