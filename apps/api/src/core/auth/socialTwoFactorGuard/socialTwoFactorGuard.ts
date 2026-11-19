import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { deleteSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";

// Replicated from better-auth 1.7.25 (dist/plugins/two-factor/constant.mjs and index.mjs, the
// `hooks.after` handler of the official plugin). The official plugin only intercepts credential
// sign-ins, so a Google login would skip two-factor. After a social sign-in this guard does what
// the official hook does, so `twoFactor.verifyTotp` / `verifyBackupCode` finish the login.
// A test covers it end to end: if Better Auth changes this behavior, that test fails.
const TWO_FACTOR_COOKIE_NAME = "two_factor";
const TWO_FACTOR_COOKIE_MAX_AGE_SECONDS = 600;
const TWO_FACTOR_IDENTIFIER_LENGTH = 20;
const SOCIAL_CALLBACK_PATH = "/callback/:id";
const SOCIAL_SIGN_IN_PATH = "/sign-in/social";
const TWO_FACTOR_PAGE_PATH = "/two-factor";

interface SocialTwoFactorGuardOptions {
  /** Where the redirect flow sends the browser to type the code. */
  crmOrigin: string;
}

export function socialTwoFactorGuard({
  crmOrigin,
}: SocialTwoFactorGuardOptions): BetterAuthPlugin {
  return {
    id: "social-two-factor-guard",
    hooks: {
      after: [
        {
          matcher: (context) =>
            context.path === SOCIAL_CALLBACK_PATH ||
            context.path === SOCIAL_SIGN_IN_PATH,
          handler: createAuthMiddleware(async (ctx) => {
            const data = ctx.context.newSession;
            if (!data?.user.twoFactorEnabled) return;

            // The session created by the social sign-in must not survive: 2FA is still pending.
            deleteSessionCookie(ctx, true);
            await ctx.context.internalAdapter.deleteSession(data.session.token);
            ctx.context.setNewSession(null);

            const twoFactorCookie = ctx.context.createAuthCookie(
              TWO_FACTOR_COOKIE_NAME,
              {
                maxAge: TWO_FACTOR_COOKIE_MAX_AGE_SECONDS,
              },
            );
            const identifier = `2fa-${generateRandomString(TWO_FACTOR_IDENTIFIER_LENGTH)}`;
            const expiresAt = new Date(
              Date.now() + TWO_FACTOR_COOKIE_MAX_AGE_SECONDS * 1000,
            );
            await ctx.context.internalAdapter.createVerificationValue({
              value: data.user.id,
              identifier,
              expiresAt,
            });
            await ctx.context.internalAdapter.createVerificationValue({
              value: "0",
              identifier: `2fa-attempts-${identifier}`,
              expiresAt,
            });
            await ctx.setSignedCookie(
              twoFactorCookie.name,
              identifier,
              ctx.context.secret,
              twoFactorCookie.attributes,
            );

            if (ctx.path === SOCIAL_SIGN_IN_PATH) {
              // ponytail: TOTP is the only second factor offered (backup codes use the same cookie).
              return ctx.json({
                twoFactorRedirect: true,
                twoFactorMethods: ["totp"],
              });
            }
            throw ctx.redirect(`${crmOrigin}${TWO_FACTOR_PAGE_PATH}`);
          }),
        },
      ],
    },
  };
}
