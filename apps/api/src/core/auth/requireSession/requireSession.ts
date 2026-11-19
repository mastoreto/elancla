import { db } from "@ancla/db";
import type { MiddlewareHandler } from "hono";
import { declareAccess, loadAccess } from "../../authz";
import type { AppEnv } from "../../context";
import { UnauthenticatedError } from "../../errors";
import { resolveOrganizationId } from "../../tenancy";
import { getAuth } from "../getAuth";
import { MILLISECONDS_PER_SECOND } from "../sessionPolicy";

/**
 * 401 unless the request carries a valid Better Auth session (validated against the database).
 * A login that is still waiting for its second factor has no session (Better Auth deletes it and
 * only sets the `two_factor` cookie), so it is rejected here too.
 * On success it fills `ctx.user`, `ctx.organizationId` and `ctx.access` for the rest of the chain,
 * and enforces the role-based maximum session age (D-16): an older session is revoked.
 * It is also the "any signed-in user" access declaration (`allowAnySession`).
 */
export const requireSession: MiddlewareHandler<AppEnv> = declareAccess(
  async (c, next) => {
    const session = await getAuth().api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) throw new UnauthenticatedError();

    const { id, name, email } = session.user;
    const organizationId = await resolveOrganizationId();
    const access = await loadAccess(id, organizationId);

    const { maxSessionSeconds } = access.sessionPolicy;
    const ageMs = Date.now() - new Date(session.session.createdAt).getTime();
    if (
      maxSessionSeconds !== null &&
      ageMs > maxSessionSeconds * MILLISECONDS_PER_SECOND
    ) {
      await db.session.deleteMany({ where: { id: session.session.id } });
      throw new UnauthenticatedError();
    }

    const ctx = c.get("ctx");
    ctx.user = { id, name, email };
    ctx.organizationId = organizationId;
    ctx.access = access;
    await next();
  },
);

export const allowAnySession = requireSession;
