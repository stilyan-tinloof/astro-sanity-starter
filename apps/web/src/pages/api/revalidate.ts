import type { APIRoute } from 'astro';
import { purgeByTags } from '@/lib/cloudflare';
import { errorResponse, successResponse } from '@/lib/api';

interface RevalidateRequest {
  tags: string[];
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;

  // Origin check — cache purging is non-destructive, no secret needed
  const origin = request.headers.get('Origin');
  if (origin && !request.url.startsWith(origin)) {
    return errorResponse('Forbidden', 403);
  }

  // Parse request body
  let body: RevalidateRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  if (!Array.isArray(body.tags) || body.tags.length === 0) {
    return errorResponse('Missing tags', 400);
  }

  // Validate Cloudflare credentials
  if (!env?.CF_ZONE_ID || !env?.CF_API_TOKEN) {
    return errorResponse('Cloudflare credentials not configured', 500);
  }

  // Purge Cloudflare cache by sync tags
  const result = await purgeByTags(body.tags, env);

  if (!result.success) {
    return errorResponse(result.error || 'Purge failed', 502);
  }

  return successResponse({ purgedTags: body.tags });
};
