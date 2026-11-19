import type { Permission } from "@ancla/contracts";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";
import { ForbiddenError, UnauthenticatedError } from "../../errors";
import { declareAccess } from "../accessDeclaration";
import { scopeOf } from "../scopeOf";

/** 403 unless the signed-in user holds the permission. Runs after `requireSession`. */
export function requirePermission(
  permission: Permission,
): MiddlewareHandler<AppEnv> {
  return declareAccess(async (c, next) => {
    const { access } = c.get("ctx");
    if (!access) throw new UnauthenticatedError();
    if (scopeOf(access, permission) === null) throw new ForbiddenError();
    await next();
  });
}
