import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { MILLISECONDS_PER_SECOND } from "../sessionPolicy";

const FRESH_SESSION_PATHS: ReadonlySet<string> = new Set([
  "/link-social",
  "/two-factor/enable",
  "/two-factor/disable",
]);

/**
 * Requires a recent sign-in (`session.freshAge`) to link a provider or configure two-factor.
 * In better-auth 1.7.25 those endpoints only require a session: `sensitiveSessionMiddleware`
 * does not check its age. The check below replicates `freshSessionMiddleware`
 * (dist/api/routes/session.mjs).
 */
export function freshSessionGuard(): BetterAuthPlugin {
  return {
    id: "fresh-session-guard",
    hooks: {
      before: [
        {
          matcher: (context) => FRESH_SESSION_PATHS.has(context.path ?? ""),
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session?.session) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized",
                code: "UNAUTHORIZED",
              });
            }
            const { freshAge } = ctx.context.sessionConfig;
            const age =
              Date.now() - new Date(session.session.createdAt).getTime();
            if (freshAge !== 0 && age >= freshAge * MILLISECONDS_PER_SECOND) {
              throw new APIError("FORBIDDEN", {
                message: "Session is not fresh",
                code: "SESSION_NOT_FRESH",
              });
            }
          }),
        },
      ],
    },
  };
}
