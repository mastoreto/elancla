import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { TEST_USER_AGENT } from "../../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../../test/support/auditRows";
import {
  cookieHeaderFrom,
  createFixtures,
  TEST_PASSWORD,
} from "../../../../test/support/fixtures";
import { totpFromUri } from "../../../../test/support/totp";
import { app } from "../../../app";
import { getApiEnv } from "../../env";
import { getAuth } from "../getAuth";

const fixtures = createFixtures();
const { CRM_ORIGIN } = getApiEnv();
const WRONG_PASSWORD = "definitely-the-wrong-password";

afterAll(() => fixtures.cleanup());

function post(path: string, body: unknown, cookie?: string) {
  return app.request(`/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: CRM_ORIGIN,
      "User-Agent": TEST_USER_AGENT,
      "X-Forwarded-For": fixtures.uniqueIp(),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("auth events in the audit trail", () => {
  test("a login records success with the user, address and agent", async () => {
    const email = await fixtures.passwordUser(getAuth(), "audit-login");
    const res = await post("/sign-in/email", {
      email,
      password: TEST_PASSWORD,
    });
    expect(res.status).toBe(200);
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row).toMatchObject({
      action: "auth.login.succeeded",
      outcome: "success",
      actorLabel: email,
      userAgent: TEST_USER_AGENT,
    });
    expect(row?.actorId).not.toBeNull();
    expect(row?.ip).toMatch(/^10\./);
  });

  test("a wrong password and an unknown email are failures that never store the password", async () => {
    const email = await fixtures.passwordUser(getAuth(), "audit-fail");
    const unknown = fixtures.uniqueEmail("audit-ghost");
    for (const typed of [email, unknown]) {
      const res = await post("/sign-in/email", {
        email: typed,
        password: WRONG_PASSWORD,
      });
      expect(res.status).toBe(401);
      const rows = await auditRowsOf({ requestId: requestIdOf(res) });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        action: "auth.login.failed",
        outcome: "failure",
        actorId: null,
        actorLabel: typed,
      });
      expect(JSON.stringify(rows)).not.toContain(WRONG_PASSWORD);
    }
  });

  test("two-factor: enabling, a pending login, a wrong code and a right code", async () => {
    const auth = getAuth();
    const email = await fixtures.passwordUser(auth, "audit-2fa");
    const cookie = await fixtures.signIn(auth, email);
    const enabled = await auth.api.enableTwoFactor({
      body: { password: TEST_PASSWORD },
      headers: new Headers({ cookie }),
    });
    const confirm = await post(
      "/two-factor/verify-totp",
      { code: await totpFromUri(enabled.totpURI) },
      cookie,
    );
    const [enabledRow] = await auditRowsOf({ requestId: requestIdOf(confirm) });
    expect(enabledRow).toMatchObject({
      action: "auth.twoFactor.enabled",
      actorLabel: email,
    });

    const challenge = await post("/sign-in/email", {
      email,
      password: TEST_PASSWORD,
    });
    expect((await challenge.json()).twoFactorRedirect).toBe(true);
    const [pendingRow] = await auditRowsOf({
      requestId: requestIdOf(challenge),
    });
    expect(pendingRow?.action).toBe("auth.login.twoFactorRequired");
    const pendingCookie = cookieHeaderFrom(challenge);

    const wrong = await post(
      "/two-factor/verify-totp",
      { code: "000000" },
      pendingCookie,
    );
    expect(wrong.status).toBeGreaterThanOrEqual(400);
    const [failedRow] = await auditRowsOf({ requestId: requestIdOf(wrong) });
    expect(failedRow).toMatchObject({
      action: "auth.twoFactor.failed",
      outcome: "failure",
    });

    const right = await post(
      "/two-factor/verify-totp",
      { code: await totpFromUri(enabled.totpURI) },
      pendingCookie,
    );
    expect(right.status).toBe(200);
    const [verifiedRow] = await auditRowsOf({ requestId: requestIdOf(right) });
    expect(verifiedRow).toMatchObject({
      action: "auth.twoFactor.verified",
      actorLabel: email,
    });
  });

  test("a password reset is recorded when requested and when completed", async () => {
    const email = await fixtures.passwordUser(getAuth(), "audit-reset");
    const requested = await post("/request-password-reset", {
      email,
      redirectTo: `${CRM_ORIGIN}/reset-password`,
    });
    expect(requested.status).toBe(200);
    const [requestedRow] = await auditRowsOf({
      requestId: requestIdOf(requested),
    });
    expect(requestedRow).toMatchObject({
      action: "auth.password.reset.requested",
      actorLabel: email,
    });

    const token = (
      await db.verification.findFirstOrThrow({
        where: { identifier: { startsWith: "reset-password" } },
        orderBy: { createdAt: "desc" },
      })
    ).identifier.replace("reset-password:", "");
    const done = await post("/reset-password", {
      newPassword: `${TEST_PASSWORD}-new`,
      token,
    });
    expect(done.status).toBe(200);
    const [doneRow] = await auditRowsOf({ requestId: requestIdOf(done) });
    expect(doneRow).toMatchObject({
      action: "auth.password.reset.completed",
      actorLabel: email,
    });
    expect(JSON.stringify(doneRow)).not.toContain(`${TEST_PASSWORD}-new`);
  });
});
