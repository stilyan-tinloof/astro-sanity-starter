import type { APIRoute } from 'astro';
import { purgeByTags } from '@/lib/cloudflare';
import { errorResponse, successResponse } from '@/lib/api';

interface RevalidateRequest {
  tags: string[];
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;

  console.log('[Revalidate] incoming request');

  // Origin check — cache purging is non-destructive, no secret needed
  const origin = request.headers.get('Origin');
  console.debug('[Revalidate] origin:', origin, 'request url:', request.url);
  if (origin && !request.url.startsWith(origin)) {
    console.warn('[Revalidate] origin mismatch, rejecting');
    return errorResponse('Forbidden', 403);
  }

  // Parse request body
  let body: RevalidateRequest;
  try {
    body = await request.json();
  } catch {
    console.error('[Revalidate] invalid JSON body');
    return errorResponse('Invalid JSON', 400);
  }

  console.debug('[Revalidate] body:', JSON.stringify(body));

  if (!Array.isArray(body.tags) || body.tags.length === 0) {
    console.warn('[Revalidate] missing or empty tags');
    return errorResponse('Missing tags', 400);
  }

  // Validate Cloudflare credentials
  if (!env?.CF_ZONE_ID || !env?.CF_API_TOKEN) {
    console.error('[Revalidate] Cloudflare credentials not configured');
    return errorResponse('Cloudflare credentials not configured', 500);
  }

  console.log('[Revalidate] purging tags:', body.tags);

  // Purge Cloudflare cache by sync tags
  const result = await purgeByTags(body.tags, env);

  if (!result.success) {
    console.error('[Revalidate] Cloudflare purge failed:', result.error);
    return errorResponse(result.error || 'Purge failed', 502);
  }

  console.log('[Revalidate] purge successful');
  return successResponse({ purgedTags: body.tags });
};
