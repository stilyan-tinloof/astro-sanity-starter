interface CloudflareEnv {
  CF_ZONE_ID: string;
  CF_API_TOKEN: string;
}

interface CloudflareResponse {
  success: boolean;
  errors?: Array<{ message: string }>;
}

export interface PurgeResult {
  success: boolean;
  error?: string;
}

/**
 * Purge Cloudflare cache by tags.
 */
export async function purgeByTags(tags: string[], env: CloudflareEnv): Promise<PurgeResult> {
  const response = await fetch(
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

  const result = await response.json() as CloudflareResponse;

  if (!response.ok || !result.success) {
    return {
      success: false,
      error: result.errors?.[0]?.message || 'Purge failed',
    };
  }

  return { success: true };
}
