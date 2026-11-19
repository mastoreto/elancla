import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types";

/** Seeds the per-request context. Authentication fills `user` and `organizationId` later. */
export const contextMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set("ctx", {
    requestId: c.get("requestId"),
    user: null,
    organizationId: null,
  });
  await next();
};
