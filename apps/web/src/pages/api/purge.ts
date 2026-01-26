import type { APIRoute } from 'astro';
import { toTag } from '@/lib/cache';

interface PurgeRequest {
  tags?: string[];
  // Sanity webhook payload fields
  _id?: string;
  _type?: string;
}

interface CloudflareResponse {
  success: boolean;
  errors?: Array<{ message: string }>;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Authenticate request
  const authHeader = request.headers.get('Authorization');
  const env = locals.runtime?.env;

  if (!env?.PURGE_SECRET) {
    return new Response(
      JSON.stringify({ success: false, error: 'PURGE_SECRET not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const expectedToken = `Bearer ${env.PURGE_SECRET}`;
  if (authHeader !== expectedToken) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse request body
  let body: PurgeRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Build tags array from either direct tags or Sanity webhook payload
  let tags: string[] = [];

  // Handle Sanity webhook payload: { _id, _type }
  // Only use _id - type-based purging not implemented in current tag system
  if (body._id) {
    tags.push(toTag(body._id));
  }
  // Handle direct tags array: { tags: [...] }
  else if (Array.isArray(body.tags)) {
    tags = body.tags;
  }

  if (tags.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'No tags to purge' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check Cloudflare credentials
  if (!env.CF_ZONE_ID || !env.CF_API_TOKEN) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare credentials not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Call Cloudflare purge API
  try {
    const purgeResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      }
    );

    const result = await purgeResponse.json() as CloudflareResponse;

    if (!purgeResponse.ok || !result.success) {
      console.error('[Purge] Cloudflare API error:', result);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cloudflare purge failed',
          details: result.errors?.[0]?.message
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, purgedTags: tags }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Purge] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
