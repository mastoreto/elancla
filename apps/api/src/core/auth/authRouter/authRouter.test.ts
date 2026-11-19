import { afterAll, describe, expect, test } from "bun:test";
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

afterAll(() => fixtures.cleanup());

function post(
  path: string,
  body: unknown,
  options: { cookie?: string; ip?: string } = {},
) {
  return app.request(`/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: CRM_ORIGIN,
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.ip ? { "X-Forwarded-For": options.ip } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("Better Auth mounted in the API", () => {
  test("public sign-up is closed: POST /api/auth/sign-up/email is a 404", async () => {
    const email = fixtures.uniqueEmail("public-signup");
    const res = await post("/sign-up/email", {
      email,
      password: TEST_PASSWORD,
      name: "Public",
    });
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    expect(
      await getAuth()
        .api.signInEmail({ body: { email, password: TEST_PASSWORD } })
        .catch(() => null),
    ).toBeNull();
  });

  test("a failed sign-in over the limit is a 429", async () => {
    const email = await fixtures.passwordUser(getAuth(), "rate-limit");
    const ip = fixtures.uniqueIp();
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = await post(
        "/sign-in/email",
        { email, password: "definitely-wrong-password" },
        { ip },
      );
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 3)).toEqual([401, 401, 401]);
    expect(statuses.slice(3)).toEqual([429, 429]);
  });

  test("a login pending its second factor is not a session", async () => {
    const auth = getAuth();
    const email = await fixtures.passwordUser(auth, "pending-2fa");
    const cookie = await fixtures.signIn(auth, email);
    const enabled = await auth.api.enableTwoFactor({
      body: { password: TEST_PASSWORD },
      headers: new Headers({ cookie }),
    });
    await post(
      "/two-factor/verify-totp",
      { code: await totpFromUri(enabled.totpURI) },
      { cookie, ip: fixtures.uniqueIp() },
    );

    const challenge = await post(
      "/sign-in/email",
      { email, password: TEST_PASSWORD },
      { ip: fixtures.uniqueIp() },
    );
    expect((await challenge.json()).twoFactorRedirect).toBe(true);
    const pendingCookie = cookieHeaderFrom(challenge);
    expect(pendingCookie).toContain("two_factor");

    const me = await app.request("/api/me", {
      headers: { Cookie: pendingCookie },
    });
    expect(me.status).toBe(401);
  });
});
