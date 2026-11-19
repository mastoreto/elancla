import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";

/**
 * Every route must state who may call it. The handlers that state it (`requirePermission`,
 * `allowPublic`, `allowAnySession`) register here, and the router introspection test fails for any
 * route that has none of them.
 */
const declaringHandlers = new WeakSet<MiddlewareHandler<AppEnv>>();

export function declareAccess(
  handler: MiddlewareHandler<AppEnv>,
): MiddlewareHandler<AppEnv> {
  declaringHandlers.add(handler);
  return handler;
}

export function declaresAccess(handler: unknown): boolean {
  return (
    typeof handler === "function" &&
    declaringHandlers.has(handler as MiddlewareHandler<AppEnv>)
  );
}

/** Explicitly public route (health, invitation links, Better Auth, which guards itself). */
export const allowPublic: MiddlewareHandler<AppEnv> = declareAccess(
  async (_c, next) => {
    await next();
  },
);
