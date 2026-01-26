// Cache TTLs
export const CDN_MAX_AGE = 2592000;  // 30 days for CDN (s-maxage)
export const BROWSER_MAX_AGE = 0;    // Always revalidate with CDN

// Tag length - 12 chars of UUID is plenty unique
const TAG_LENGTH = 12;

/**
 * Convert a Sanity document ID to a cache tag.
 * Strips drafts. prefix and truncates to TAG_LENGTH chars.
 */
export function toTag(id: string): string {
  return id.replace(/^drafts\./, '').slice(0, TAG_LENGTH);
}

/**
 * Recursively extract all _id fields from a Sanity response.
 * Returns truncated, unique tags.
 */
export function extractTags(obj: unknown): string[] {
  const ids = new Set<string>();

  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const record = node as Record<string, unknown>;

    // Capture _id if present
    if (typeof record._id === 'string') {
      ids.add(toTag(record._id));
    }

    // Also capture _ref (references to other documents)
    if (typeof record._ref === 'string') {
      ids.add(toTag(record._ref));
    }

    // Recurse into nested objects
    Object.values(record).forEach(walk);
  }

  walk(obj);
  return [...ids];
}

