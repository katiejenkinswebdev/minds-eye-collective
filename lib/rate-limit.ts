const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

type Window = { count: number; resetAt: number };

/**
 * Per-instance and lost on cold start, so this deters casual spam rather than a
 * determined attacker. Upstash or Vercel KV is the upgrade when volume warrants
 * a second service.
 */
const windows = new Map<string, Window>();

function sweep(now: number) {
  for (const [key, window] of windows) {
    if (now >= window.resetAt) windows.delete(key);
  }
}

export function rateLimit(key: string, now: number = Date.now()) {
  if (windows.size > 5000) sweep(now);

  const current = windows.get(key);

  if (!current || now >= current.resetAt) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true as const };
  }

  if (current.count >= MAX_HITS) {
    return {
      allowed: false as const,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true as const };
}

/** Vercel puts the real client first in x-forwarded-for. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Exposed for tests: the limiter is module state that would otherwise persist. */
export function resetRateLimits() {
  windows.clear();
}
