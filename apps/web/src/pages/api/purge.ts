import type { APIRoute } from 'astro';
import { toTag } from '@/lib/cache';
import { purgeByTags } from '@/lib/cloudflare';
import { errorResponse, successResponse } from '@/lib/api';

interface PurgeRequest {
  tags?: string[];
  _id?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;

  // Authenticate request
  const authHeader = request.headers.get('Authorization');
  if (!env?.PURGE_SECRET) {
    return errorResponse('PURGE_SECRET not configured', 500);
  }

  if (authHeader !== `Bearer ${env.PURGE_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  // Parse request body
  let body: PurgeRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Build tags array
  let tags: string[] = [];
  if (body._id) {
    tags.push(toTag(body._id));
  } else if (Array.isArray(body.tags)) {
    tags = body.tags;
  }

  if (tags.length === 0) {
    return errorResponse('No tags to purge', 400);
  }

  // Validate Cloudflare credentials
  if (!env.CF_ZONE_ID || !env.CF_API_TOKEN) {
    return errorResponse('Cloudflare credentials not configured', 500);
  }

  // Purge Cloudflare cache
  const result = await purgeByTags(tags, env);

  if (!result.success) {
    console.error('[Purge] Cloudflare API error:', result.error);
    return errorResponse(result.error || 'Purge failed', 502);
  }

  return successResponse({ purgedTags: tags });
};
