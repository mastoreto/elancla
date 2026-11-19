import type { MiddlewareHandler } from "hono";
import { secureHeaders } from "hono/secure-headers";

const baseSecurityHeaders = secureHeaders();

/** Hardening headers plus `no-store`: every API response is private to the caller. */
export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await baseSecurityHeaders(c, async () => {
    await next();
    c.res.headers.set("Cache-Control", "private, no-store");
  });
};
