import type { APIRoute } from 'astro';
import { toTag } from '@/lib/cache';
import { purgeByTags } from '@/lib/cloudflare';
import { errorResponse, successResponse } from '@/lib/api';

interface SanityWebhookPayload {
  _id: string;
  _type: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;

  // Verify webhook secret
  const signature = request.headers.get('sanity-webhook-signature');
  if (!env?.PURGE_SECRET) {
    console.error('[Webhook] PURGE_SECRET not configured');
    return errorResponse('Webhook secret not configured', 500);
  }

  if (signature !== env.PURGE_SECRET) {
    console.warn('[Webhook] Invalid signature');
    return errorResponse('Unauthorized', 401);
  }

  // Validate Cloudflare credentials
  if (!env.CF_ZONE_ID || !env.CF_API_TOKEN) {
    console.error('[Webhook] Cloudflare credentials not configured');
    return errorResponse('Cloudflare credentials not configured', 500);
  }

  // Parse webhook payload
  let body: SanityWebhookPayload;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  if (!body._id) {
    return errorResponse('Missing _id', 400);
  }

  const tag = toTag(body._id);

  // Purge Cloudflare cache
  const result = await purgeByTags([tag], env);

  if (!result.success) {
    console.error('[Webhook] Cloudflare purge failed:', result.error);
    return errorResponse(result.error || 'Purge failed', 502);
  }

  console.log('[Webhook] Purged:', { _id: body._id, tag, _type: body._type });
  return successResponse({ purgedTags: [tag] });
};
