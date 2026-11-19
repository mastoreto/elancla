import { AUDIT_ACTIONS, type CreatePasswordBody } from "@ancla/contracts";
import { auditSourceFrom, writeAuditBestEffort } from "../../../../core/audit";
import { getAuth } from "../../../../core/auth";
import type { AuthenticatedContext } from "../../../../core/context";
import { ConflictError, UnauthenticatedError } from "../../../../core/errors";
import { findAccountSnapshot } from "../../data";

interface CreatePasswordInput {
  ctx: AuthenticatedContext;
  body: CreatePasswordBody;
  headers: Headers;
}

/**
 * Gives a Google-only account its first password. Better Auth's `setPassword` is server-only, so
 * this is the only way in; the route guards it with a fresh session.
 */
export async function createPassword({
  ctx,
  body,
  headers,
}: CreatePasswordInput): Promise<void> {
  const snapshot = await findAccountSnapshot(ctx.user.id);
  if (!snapshot) throw new UnauthenticatedError();
  if (snapshot.accounts.some((account) => account.password)) {
    throw new ConflictError("This account already has a password");
  }
  await getAuth().api.setPassword({
    body: { newPassword: body.newPassword },
    headers,
  });
  // The password is already set (Better Auth owns that write), so this is an auth event.
  await writeAuditBestEffort(auditSourceFrom(ctx, ctx.organizationId), {
    action: AUDIT_ACTIONS.auth.passwordCreated,
    entity: { type: "user", id: ctx.user.id },
  });
}
