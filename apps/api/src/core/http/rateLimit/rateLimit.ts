import { db } from "@ancla/db";
import type { MiddlewareHandler } from "hono";
import { TooManyRequestsError } from "../../errors";
import { clientAddress } from "../clientAddress";

interface RateLimitOptions {
  /** Names the bucket; every public endpoint gets its own. */
  name: string;
  max: number;
  windowSeconds: number;
}

const MILLISECONDS_PER_SECOND = 1000;
const UNKNOWN_CLIENT = "unknown";

/**
 * Fixed-window counter in the `rate_limits` table (the one Better Auth uses), for the API's own
 * public endpoints. The upsert is atomic, so concurrent requests cannot all slip under the limit.
 * Keys carry an `api:` prefix and never collide with Better Auth's.
 */
export function rateLimit({
  name,
  max,
  windowSeconds,
}: RateLimitOptions): MiddlewareHandler {
  return async (c, next) => {
    const key = `api:${name}:${clientAddress(c.req.header("x-forwarded-for")) ?? UNKNOWN_CLIENT}`;
    const now = BigInt(Date.now());
    const windowStart = now - BigInt(windowSeconds * MILLISECONDS_PER_SECOND);
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO rate_limits (id, key, count, "lastRequest")
      VALUES (gen_random_uuid(), ${key}, 1, ${now})
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits."lastRequest" < ${windowStart} THEN 1 ELSE rate_limits.count + 1 END,
        "lastRequest" = CASE WHEN rate_limits."lastRequest" < ${windowStart} THEN ${now} ELSE rate_limits."lastRequest" END
      RETURNING count`;
    if ((rows[0]?.count ?? 0) > max) throw new TooManyRequestsError();
    await next();
  };
}
