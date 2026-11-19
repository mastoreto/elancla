import { AUDIT_ACTIONS } from "@ancla/contracts";
import type { AuditActor, AuditEvent } from "../../audit";

const TOO_MANY_REQUESTS = 429;
const FIRST_ERROR_STATUS = 400;

/** What a Better Auth endpoint just did, reduced to what the audit trail cares about. */
export interface AuthOutcome {
  path: string;
  /** Status of the error the endpoint answered with; `null` when it succeeded. */
  errorStatus: number | null;
  /** The user a new session was just issued to (a login completed). */
  newSessionUser: { id: string; email: string } | null;
  /** The signed-in user who made the call (change password, disable 2FA...). */
  sessionUser: { id: string; email: string } | null;
  /** The email typed in the request, when there is one (a failed login has no user). */
  typedEmail: string | null;
  /** The request carries the cookie of a login waiting for its second factor. */
  pendingTwoFactorLogin: boolean;
}

export interface ClassifiedAuthEvent {
  event: AuditEvent;
  actor: AuditActor | null;
}

const toActor = (user: { id: string; email: string }): AuditActor => ({
  id: user.id,
  label: user.email,
});
const toActorOrNull = (
  user: { id: string; email: string } | null,
): AuditActor | null => (user ? toActor(user) : null);

/**
 * Decides which audit event (if any) an auth endpoint's outcome is. Pure, so the rules are
 * testable without Better Auth. Rate-limited calls (429) are never recorded: an attacker
 * hammering a login must not be able to fill the trail.
 *
 * ponytail: the social callback is not classified (a 302 is both its success and its failure, and
 * the 2FA guard erases the session), and a failed second factor has no actor (the pending user
 * lives in a cookie-keyed verification row). Add them if the trail needs it.
 */
export function classifyAuthEvent(
  outcome: AuthOutcome,
): ClassifiedAuthEvent | null {
  const {
    path,
    errorStatus,
    newSessionUser,
    sessionUser,
    typedEmail,
    pendingTwoFactorLogin,
  } = outcome;
  if (errorStatus === TOO_MANY_REQUESTS) return null;
  const failed = errorStatus !== null && errorStatus >= FIRST_ERROR_STATUS;
  const typedActor = typedEmail ? { id: null, label: typedEmail } : null;
  const eventFor = (
    ok: AuditEvent["action"],
    ko: AuditEvent["action"],
    actor: AuditActor | null,
  ): ClassifiedAuthEvent => ({
    event: failed
      ? { action: ko, outcome: "failure", metadata: { path, errorStatus } }
      : { action: ok, metadata: { path } },
    actor,
  });

  switch (path) {
    case "/sign-in/email":
      if (failed) {
        return {
          event: {
            action: AUDIT_ACTIONS.auth.loginFailed,
            outcome: "failure",
            metadata: { path, errorStatus, email: typedEmail },
          },
          actor: typedActor,
        };
      }
      if (newSessionUser) {
        return {
          event: { action: AUDIT_ACTIONS.auth.loginSucceeded },
          actor: toActor(newSessionUser),
        };
      }
      // Right password, no session: the second factor is still pending.
      return {
        event: { action: AUDIT_ACTIONS.auth.loginTwoFactorRequired },
        actor: typedActor,
      };
    case "/two-factor/verify-totp":
      if (failed || pendingTwoFactorLogin) {
        return eventFor(
          AUDIT_ACTIONS.auth.twoFactorVerified,
          AUDIT_ACTIONS.auth.twoFactorFailed,
          newSessionUser ? toActor(newSessionUser) : null,
        );
      }
      // No login waiting: a signed-in user confirmed the code that switches 2FA on. Better Auth
      // issues a fresh session at that moment, so the actor is whichever of the two we have.
      return {
        event: { action: AUDIT_ACTIONS.auth.twoFactorEnabled },
        actor: toActorOrNull(newSessionUser ?? sessionUser),
      };
    case "/two-factor/verify-backup-code":
      return eventFor(
        AUDIT_ACTIONS.auth.backupCodeUsed,
        AUDIT_ACTIONS.auth.backupCodeFailed,
        newSessionUser ? toActor(newSessionUser) : null,
      );
    case "/two-factor/disable":
      return failed
        ? null
        : {
            event: { action: AUDIT_ACTIONS.auth.twoFactorDisabled },
            actor: sessionUser ? toActor(sessionUser) : null,
          };
    case "/change-password":
      return failed
        ? null
        : {
            event: { action: AUDIT_ACTIONS.auth.passwordChanged },
            actor: sessionUser ? toActor(sessionUser) : null,
          };
    default:
      return null;
  }
}

/** The paths `classifyAuthEvent` understands: the plugin only hooks these. */
export const AUDITED_AUTH_PATHS: ReadonlySet<string> = new Set([
  "/sign-in/email",
  "/two-factor/verify-totp",
  "/two-factor/verify-backup-code",
  "/two-factor/disable",
  "/change-password",
]);
