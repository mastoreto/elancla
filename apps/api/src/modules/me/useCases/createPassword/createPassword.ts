import type { CreatePasswordBody } from "@ancla/contracts";
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
}
