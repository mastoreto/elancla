import type { MiddlewareHandler } from "hono";
import { clientAddress } from "../../http/clientAddress";
import type { AppEnv } from "../types";

/** Seeds the per-request context. Authentication fills `user` and `organizationId` later. */
export const contextMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set("ctx", {
    requestId: c.get("requestId"),
    user: null,
    organizationId: null,
    access: null,
    ip: clientAddress(c.req.header("x-forwarded-for")),
    userAgent: c.req.header("user-agent") ?? null,
  });
  await next();
};
