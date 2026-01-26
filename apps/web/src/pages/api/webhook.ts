import type { APIRoute } from 'astro';
import { toTag } from '@/lib/cache';

interface SanityWebhookPayload {
  _id: string;
  _type: string;
  _rev?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;

  // Verify webhook secret
  const signature = request.headers.get('sanity-webhook-signature');
  const expectedSecret = env?.PURGE_SECRET;

  if (!expectedSecret) {
    console.error('[Webhook] PURGE_SECRET not configured');
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook secret not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (signature !== expectedSecret) {
    console.warn('[Webhook] Invalid signature');
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate Cloudflare credentials
  if (!env?.CF_ZONE_ID || !env?.CF_API_TOKEN) {
    console.error('[Webhook] Cloudflare credentials not configured');
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare credentials not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse webhook payload
  let body: SanityWebhookPayload;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!body._id) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing _id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Truncate to match cache tags
  const tag = toTag(body._id);

  // Purge Cloudflare cache by tag
  try {
    const purgeResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: [tag] }),
      }
    );

    const result = await purgeResponse.json();

    if (!purgeResponse.ok) {
      console.error('[Webhook] Cloudflare purge failed:', result);
      return new Response(
        JSON.stringify({ success: false, error: 'Purge failed', details: result }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Webhook] Purged:', { _id: body._id, tag, _type: body._type });
    return new Response(
      JSON.stringify({ success: true, purgedTag: tag, documentId: body._id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Webhook] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
