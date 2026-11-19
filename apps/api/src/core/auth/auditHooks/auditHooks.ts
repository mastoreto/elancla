import type { BetterAuthPlugin } from "better-auth";
import {
  createAuthMiddleware,
  getSessionFromCtx,
  isAPIError,
} from "better-auth/api";
import { auditAuthEvent } from "../auditAuthEvent";
import { AUDITED_AUTH_PATHS, classifyAuthEvent } from "../classifyAuthEvent";

// Name fragment of the cookie Better Auth sets while a login waits for its second factor.
const TWO_FACTOR_COOKIE = "two_factor";

/**
 * Audit trail for the Better Auth endpoints (logins, second factor, password changes).
 * Best effort: the endpoint already did its job, so a failing log is reported, never thrown.
 * Keep it LAST in `plugins`: the other plugins' hooks have already adjusted the session.
 */
export function auditHooks(): BetterAuthPlugin {
  return {
    id: "audit-hooks",
    hooks: {
      after: [
        {
          matcher: (context) => AUDITED_AUTH_PATHS.has(context.path ?? ""),
          handler: createAuthMiddleware(async (ctx) => {
            try {
              const returned = ctx.context.returned;
              const newSession = ctx.context.newSession;
              const session = newSession ? null : await getSessionFromCtx(ctx);
              const body = ctx.body as { email?: unknown } | undefined;
              const classified = classifyAuthEvent({
                path: ctx.path,
                errorStatus: isAPIError(returned) ? returned.statusCode : null,
                newSessionUser: newSession?.user ?? null,
                sessionUser: session?.user ?? null,
                pendingTwoFactorLogin:
                  ctx.headers?.get("cookie")?.includes(TWO_FACTOR_COOKIE) ??
                  false,
                typedEmail:
                  typeof body?.email === "string"
                    ? body.email.trim().toLowerCase()
                    : null,
              });
              if (!classified) return;
              await auditAuthEvent(
                ctx.headers,
                classified.actor,
                classified.event,
              );
            } catch (error) {
              console.error(
                JSON.stringify({
                  level: "error",
                  message: "audit hook failed",
                  error: error instanceof Error ? error.message : String(error),
                }),
              );
            }
          }),
        },
      ],
    },
  };
}
