import type { Permission } from "@ancla/contracts";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";
import { ForbiddenError, UnauthenticatedError } from "../../errors";
import { declareAccess } from "../accessDeclaration";
import { scopeOf } from "../scopeOf";

/** 403 unless the signed-in user holds at least one of the permissions. Runs after `requireSession`. */
export function requireAnyPermission(
  ...permissions: readonly Permission[]
): MiddlewareHandler<AppEnv> {
  return declareAccess(async (c, next) => {
    const { access } = c.get("ctx");
    if (!access) throw new UnauthenticatedError();
    if (permissions.every((permission) => scopeOf(access, permission) === null))
      throw new ForbiddenError();
    await next();
  });
}
