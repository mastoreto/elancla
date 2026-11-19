import { auth } from "@ancla/auth";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";
import { UnauthenticatedError } from "../../errors";
import { resolveOrganizationId } from "../../tenancy";

/**
 * 401 unless the request carries a valid Better Auth session (validated against the database).
 * On success it fills `ctx.user` and `ctx.organizationId` for the rest of the chain.
 * ponytail: auth moves from @ancla/auth into the API in phase 0.3.
 */
export const requireSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) throw new UnauthenticatedError();

  const { id, name, email } = session.user;
  const ctx = c.get("ctx");
  ctx.user = { id, name, email };
  ctx.organizationId = await resolveOrganizationId();
  await next();
};
