import { createHash, timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { declareAccess } from "../../../../core/authz";
import type { AppEnv } from "../../../../core/context";
import { UnauthenticatedError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";

const BEARER_PREFIX = "Bearer ";

const digest = (value: string): Buffer =>
  createHash("sha256").update(value).digest();

/** Compares through a fixed-length digest so neither the length nor the content leaks by timing. */
function matchesSecret(presented: string, secret: string): boolean {
  return timingSafeEqual(digest(presented), digest(secret));
}

/**
 * 401 unless the request carries `Authorization: Bearer <CRON_SECRET>` (what Vercel cron sends).
 * It is the access declaration of the internal routes: they have no session on purpose.
 */
export const requireCronSecret: MiddlewareHandler<AppEnv> = declareAccess(
  async (c, next) => {
    const header = c.req.header("authorization") ?? "";
    const presented = header.startsWith(BEARER_PREFIX)
      ? header.slice(BEARER_PREFIX.length)
      : "";
    if (!matchesSecret(presented, getStorageEnv().CRON_SECRET)) {
      throw new UnauthenticatedError();
    }
    await next();
  },
);
