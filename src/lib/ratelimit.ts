import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const hasRedisConfig = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

/**
 * Shared Redis client. `null` when Upstash is not configured (e.g. local dev),
 * in which case rate limiting and caching degrade gracefully (fail-open).
 */
export const redis: Redis | null = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Login limiter (kept for backwards compatibility with the NextAuth route).
export const ratelimit = new Ratelimit({
  redis: redis ?? new Redis({ url: 'http://localhost', token: 'unset' }),
  limiter: Ratelimit.slidingWindow(5, '10 s'), // 5 requests from the same IP in 10 seconds
  analytics: true,
});

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`;

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, requests: number, window: Window): Ratelimit | null {
  if (!redis) return null;
  const key = `${name}:${requests}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `rl:${name}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Enforce a named rate limit for the caller.
 * Returns a ready-made 429 response when the limit is exceeded, otherwise `null`.
 * Fails open if Redis is unavailable so a cache outage never takes the site down.
 *
 * Usage:
 *   const limited = await enforceRateLimit(req, 'reviews', 5, '10 m');
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  req: Request,
  name: string,
  requests: number,
  window: Window,
  identifier?: string,
): Promise<NextResponse | null> {
  try {
    const limiter = getLimiter(name, requests, window);
    if (!limiter) return null;
    const { success, reset } = await limiter.limit(identifier ?? getClientIp(req));
    if (success) return null;
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  } catch (error) {
    console.error(`[RateLimit:${name}] service error (failing open):`, error);
    return null;
  }
}
