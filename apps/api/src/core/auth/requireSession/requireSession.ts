import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../../context";
import { UnauthenticatedError } from "../../errors";
import { resolveOrganizationId } from "../../tenancy";
import { getAuth } from "../getAuth";

const DEFAULT_ROLE = "viewer";

/**
 * 401 unless the request carries a valid Better Auth session (validated against the database).
 * A login that is still waiting for its second factor has no session (Better Auth deletes it and
 * only sets the `two_factor` cookie), so it is rejected here too.
 * On success it fills `ctx.user` and `ctx.organizationId` for the rest of the chain.
 */
export const requireSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await getAuth().api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) throw new UnauthenticatedError();

  const { id, name, email, role } = session.user;
  const ctx = c.get("ctx");
  // ponytail: `role` is optional in Better Auth's types; a missing one is the least-privileged role.
  ctx.user = { id, name, email, role: role ?? DEFAULT_ROLE };
  ctx.organizationId = await resolveOrganizationId();
  await next();
};
