import { db } from "@ancla/db";
import type { MiddlewareHandler } from "hono";
import { declareAccess } from "../../../../core/authz";
import type { AppEnv } from "../../../../core/context";
import {
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
} from "../../../../core/errors";
import { hasEditorialPermission } from "../../domain";
import {
  type EditorialPermissionKind,
  findEditorialType,
} from "../../registry";

/**
 * 403 unless the user holds the permission the content type ties to this kind of action (and, for
 * a ministry-scoped type with a `ministry` grant, belongs to that ministry). Reads `:type` and
 * `:entityId` from the route; an unknown type, or an entity the type says does not exist, is a 404. Runs after `requireSession`.
 */
export function requireEditorialPermission(
  kind: EditorialPermissionKind,
): MiddlewareHandler<AppEnv> {
  return declareAccess(async (c, next) => {
    const { access } = c.get("ctx");
    if (!access) throw new UnauthenticatedError();
    const definition = findEditorialType(c.req.param("type") ?? "");
    if (!definition) throw new NotFoundError("Unknown content type");
    const entityId = c.req.param("entityId") ?? "";
    if (!hasEditorialPermission(access, definition, kind, entityId)) {
      throw new ForbiddenError();
    }
    // After the permission check, so a caller without access cannot probe which ids exist.
    const exists = await definition.entityExists?.(
      db,
      c.get("ctx").organizationId as string,
      entityId,
    );
    if (exists === false) throw new NotFoundError("Content not found");
    await next();
  });
}
