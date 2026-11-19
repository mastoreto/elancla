import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";

/**
 * One JSON line per request. Only metadata: no query string, headers or bodies, so cookies,
 * tokens and amounts can never reach the logs. The user is identified by id, not email.
 */
export const requestLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  const startedAt = performance.now();
  await next();
  console.info(
    JSON.stringify({
      level: "info",
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - startedAt),
      userId: c.get("ctx")?.user?.id ?? null,
    }),
  );
};
