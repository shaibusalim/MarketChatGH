import { redis } from '@/lib/ratelimit';

/** How long a "last known good" copy is kept for use when Firestore is unavailable / out of quota. */
const STALE_TTL_SECONDS = 60 * 60 * 24;

function isQuotaError(error: unknown): boolean {
  const msg = (error as Error)?.message || '';
  return msg.includes('RESOURCE_EXHAUSTED') || msg.toLowerCase().includes('quota exceeded');
}

/**
 * Read-through cache backed by Upstash Redis (shared across all serverless instances).
 *
 *  - Serves a fresh copy for `ttlSeconds`.
 *  - On a miss, runs `loader`, stores the result (fresh + long-lived stale copy).
 *  - If `loader` fails (e.g. Firestore RESOURCE_EXHAUSTED), serves the stale copy instead.
 *  - If Redis is not configured or errors, it just calls `loader`.
 *
 * @param bypassFresh skip the fresh copy (still refreshes the cache afterwards)
 */
export async function cachedWithStale<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
  options: { bypassFresh?: boolean } = {},
): Promise<T> {
  if (!redis) return loader();

  const freshKey = `cache:${key}`;
  const staleKey = `stale:${key}`;

  if (!options.bypassFresh) {
    try {
      const hit = await redis.get<T>(freshKey);
      if (hit !== null && hit !== undefined) return hit;
    } catch (error) {
      console.error('[Cache] read error (continuing without cache):', error);
    }
  }

  try {
    const value = await loader();
    try {
      await Promise.all([
        redis.set(freshKey, value, { ex: ttlSeconds }),
        redis.set(staleKey, value, { ex: STALE_TTL_SECONDS }),
      ]);
    } catch (error) {
      console.error('[Cache] write error (ignored):', error);
    }
    return value;
  } catch (error) {
    if (isQuotaError(error)) {
      try {
        const stale = await redis.get<T>(staleKey);
        if (stale !== null && stale !== undefined) {
          console.warn(`[Cache] Firestore quota exceeded - serving stale copy for ${key}`);
          return stale;
        }
      } catch {
        /* fall through to rethrow */
      }
    }
    throw error;
  }
}

