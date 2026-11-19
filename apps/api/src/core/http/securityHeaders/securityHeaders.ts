import type { MiddlewareHandler } from "hono";
import { secureHeaders } from "hono/secure-headers";

const baseSecurityHeaders = secureHeaders();

/**
 * Hardening headers plus `no-store`: API responses are private to the caller. The only exception
 * is a route that states its own `Cache-Control` (the public content API, cacheable by the CDN).
 */
export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await baseSecurityHeaders(c, async () => {
    await next();
    if (!c.res.headers.has("Cache-Control")) {
      c.res.headers.set("Cache-Control", "private, no-store");
    }
  });
};
