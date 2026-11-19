import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";
import { ForbiddenError, UnauthenticatedError } from "../../errors";

const ADMIN_ROLE = "admin";

/**
 * Admin-only routes. Runs after `requireSession`.
 * ponytail: temporary flat-role check; phase 0.4 replaces it with `requirePermission("users:invite")`.
 */
export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const { user } = c.get("ctx");
  if (!user) throw new UnauthenticatedError();
  if (user.role !== ADMIN_ROLE) throw new ForbiddenError();
  await next();
};
