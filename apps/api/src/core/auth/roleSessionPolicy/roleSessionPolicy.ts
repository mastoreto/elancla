import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { expireCookie, setSessionCookie } from "better-auth/cookies";
import { loadAccess } from "../../authz";
import { resolveOrganizationId } from "../../tenancy";

// Verified against better-auth 1.7.25 (dist/cookies/index.mjs). `setSessionCookie(ctx, session,
// dontRememberMe = true)` writes the session cookie without `Max-Age`/`Expires` (it dies with the
// browser) and also sets the signed `dont_remember` cookie, which Better Auth reads again whenever
// it refreshes the session, so the cookie never turns persistent later. The cookie written by the
// sign-in endpoint is expired first so the response does not carry two live copies of the token.
// An end-to-end test covers it: if Better Auth changes this, that test fails.
const SESSION_ISSUING_PATHS = new Set([
  "/sign-in/email",
  "/sign-in/social",
  "/callback/:id",
  "/two-factor/verify-totp",
  "/two-factor/verify-backup-code",
  "/two-factor/verify-otp",
]);

/**
 * Role-based session policy (D-16), cookie half: a user whose roles do not all allow persistent
 * sessions gets a session cookie that ends with the browser. The server half (maximum age) lives
 * in `requireSession`.
 */
export function roleSessionPolicy(): BetterAuthPlugin {
  return {
    id: "role-session-policy",
    hooks: {
      after: [
        {
          matcher: (context) => SESSION_ISSUING_PATHS.has(context.path ?? ""),
          handler: createAuthMiddleware(async (ctx) => {
            // Null while a second factor is still pending: there is no session to adjust yet.
            const session = ctx.context.newSession;
            if (!session) return;
            const access = await loadAccess(
              session.user.id,
              await resolveOrganizationId(),
            );
            if (access.sessionPolicy.persistent) return;
            expireCookie(ctx, ctx.context.authCookies.sessionToken);
            await setSessionCookie(ctx, session, true);
          }),
        },
      ],
    },
  };
}
