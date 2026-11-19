import { describe, expect, test } from "bun:test";
import { AUDIT_ACTIONS } from "@ancla/contracts";
import { type AuthOutcome, classifyAuthEvent } from "./classifyAuthEvent";

const USER = { id: "01900000-0000-7000-8000-000000000001", email: "a@x.test" };
const base: AuthOutcome = {
  path: "/sign-in/email",
  errorStatus: null,
  newSessionUser: null,
  sessionUser: null,
  typedEmail: "a@x.test",
  pendingTwoFactorLogin: false,
};

describe("classifyAuthEvent", () => {
  test("a completed login is a success with the user as actor", () => {
    const result = classifyAuthEvent({ ...base, newSessionUser: USER });
    expect(result?.event.action).toBe(AUDIT_ACTIONS.auth.loginSucceeded);
    expect(result?.actor).toEqual({ id: USER.id, label: USER.email });
  });

  test("a wrong password is a failure keyed by the typed email, never the password", () => {
    const result = classifyAuthEvent({ ...base, errorStatus: 401 });
    expect(result?.event).toMatchObject({
      action: AUDIT_ACTIONS.auth.loginFailed,
      outcome: "failure",
    });
    expect(result?.actor).toEqual({ id: null, label: "a@x.test" });
    expect(JSON.stringify(result)).not.toContain("password");
  });

  test("right password but no session means the second factor is pending", () => {
    expect(classifyAuthEvent(base)?.event.action).toBe(
      AUDIT_ACTIONS.auth.loginTwoFactorRequired,
    );
  });

  test("rate-limited calls are not recorded", () => {
    expect(classifyAuthEvent({ ...base, errorStatus: 429 })).toBeNull();
  });

  test("a code verified with no login waiting switches 2FA on", () => {
    const result = classifyAuthEvent({
      ...base,
      path: "/two-factor/verify-totp",
      sessionUser: USER,
      newSessionUser: USER,
    });
    expect(result?.event.action).toBe(AUDIT_ACTIONS.auth.twoFactorEnabled);
    expect(result?.actor?.label).toBe(USER.email);
  });

  test("a code verified for a waiting login is the login completing", () => {
    const result = classifyAuthEvent({
      ...base,
      path: "/two-factor/verify-totp",
      pendingTwoFactorLogin: true,
      newSessionUser: USER,
    });
    expect(result?.event.action).toBe(AUDIT_ACTIONS.auth.twoFactorVerified);
  });

  test("a wrong code is a failure", () => {
    const result = classifyAuthEvent({
      ...base,
      path: "/two-factor/verify-totp",
      errorStatus: 401,
    });
    expect(result?.event.action).toBe(AUDIT_ACTIONS.auth.twoFactorFailed);
  });

  test("other paths are ignored", () => {
    expect(classifyAuthEvent({ ...base, path: "/sign-out" })).toBeNull();
  });
});
