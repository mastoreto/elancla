import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { authPost } from "../../../../test/support/authRequest";
import {
  cookieHeaderFrom,
  createFixtures,
  TEST_PASSWORD,
} from "../../../../test/support/fixtures";
import { createTestAuth } from "../../../../test/support/testEnv";
import { totpFromUri } from "../../../../test/support/totp";
import { app } from "../../../app";
import { getApiEnv } from "../../env";
import { getAuth } from "..";

const fixtures = createFixtures();
const { auth } = createTestAuth();
const { CRM_ORIGIN } = getApiEnv();
const SESSION_COOKIE = "session_token=";
const DONT_REMEMBER_COOKIE = "dont_remember=";
const TWO_MINUTES_AGO_MS = 2 * 60 * 1000;

afterAll(() => fixtures.cleanup());

/** A user whose roles are throwaway ones with these session settings. */
async function userWithPolicies(
  label: string,
  policies: { persistentSession?: boolean; maxSessionSeconds?: number }[],
): Promise<string> {
  const roleIds = await Promise.all(
    policies.map((policy) => fixtures.createRole(label, policy)),
  );
  const email = fixtures.uniqueEmail(label);
  await fixtures.invite(email, { roleIds });
  await getAuth().api.signUpEmail({
    body: { email, password: TEST_PASSWORD, name: label },
  });
  return email;
}

function signInRequest(email: string) {
  return authPost(
    "/sign-in/email",
    { email, password: TEST_PASSWORD },
    { ip: fixtures.uniqueIp() },
  );
}

/** The `Set-Cookie` lines that deliver a live (non-empty) session token. */
function liveSessionCookies(res: Response): string[] {
  return res.headers
    .getSetCookie()
    .filter(
      (cookie) =>
        cookie.includes(SESSION_COOKIE) &&
        !cookie.includes(`${SESSION_COOKIE};`) &&
        !/Max-Age=0\b/i.test(cookie),
    );
}

const hasLifetime = (cookie: string) => /max-age=|expires=/i.test(cookie);

describe("session cookie (non-persistent roles)", () => {
  test("a persistent user gets a session cookie with a lifetime", async () => {
    const email = await userWithPolicies("persistent", [{}]);
    const res = await auth.handler(signInRequest(email));
    expect(res.status).toBe(200);
    const [cookie, ...others] = liveSessionCookies(res);
    expect(others).toHaveLength(0);
    expect(hasLifetime(cookie as string)).toBe(true);
    expect(res.headers.getSetCookie().join("\n")).not.toContain(
      DONT_REMEMBER_COOKIE,
    );
  });

  test("a role that disallows persistence makes the cookie end with the browser", async () => {
    const email = await userWithPolicies("session-only", [
      { persistentSession: false },
    ]);
    const res = await auth.handler(signInRequest(email));
    expect(res.status).toBe(200);
    const live = liveSessionCookies(res);
    expect(live).toHaveLength(1);
    expect(hasLifetime(live[0] as string)).toBe(false);
    // Better Auth keeps it session-only when it refreshes the session later.
    expect(res.headers.getSetCookie().join("\n")).toContain(
      DONT_REMEMBER_COOKIE,
    );

    const me = await app.request("/api/me", {
      headers: { Cookie: cookieHeaderFrom(res) },
    });
    expect(me.status).toBe(200);
  });

  test("the most restrictive role wins when a user has two", async () => {
    const email = await userWithPolicies("mixed", [
      { persistentSession: true },
      { persistentSession: false },
    ]);
    const res = await auth.handler(signInRequest(email));
    const live = liveSessionCookies(res);
    expect(live).toHaveLength(1);
    expect(hasLifetime(live[0] as string)).toBe(false);
  });

  test("a sign-in finished with a second factor is also session-only", async () => {
    const email = await userWithPolicies("session-only-2fa", [
      { persistentSession: false },
    ]);
    const first = await auth.handler(signInRequest(email));
    const sessionCookie = cookieHeaderFrom(first);
    const enabled = await auth.api.enableTwoFactor({
      body: { password: TEST_PASSWORD },
      headers: new Headers({ cookie: sessionCookie }),
    });
    await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: await totpFromUri(enabled.totpURI) },
        { cookie: sessionCookie },
      ),
    );
    await db.session.deleteMany({ where: { user: { email } } });

    const challenged = await auth.handler(signInRequest(email));
    expect(await challenged.clone().json()).toMatchObject({
      twoFactorRedirect: true,
    });
    expect(liveSessionCookies(challenged)).toHaveLength(0);

    const completed = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: await totpFromUri(enabled.totpURI) },
        { cookie: cookieHeaderFrom(challenged), ip: fixtures.uniqueIp() },
      ),
    );
    expect(completed.status).toBe(200);
    const live = liveSessionCookies(completed);
    expect(live).toHaveLength(1);
    expect(hasLifetime(live[0] as string)).toBe(false);
  });
});

describe("maximum session age (enforced by the API)", () => {
  async function signedInSession(email: string) {
    const res = await auth.handler(signInRequest(email));
    const cookie = cookieHeaderFrom(res);
    const session = await db.session.findFirstOrThrow({
      where: { user: { email } },
      orderBy: { createdAt: "desc" },
    });
    return { cookie, session };
  }

  const getMe = (cookie: string) =>
    app.request("/api/me", { headers: { Cookie: cookie, Origin: CRM_ORIGIN } });

  async function ageSession(id: string, ms: number) {
    await db.session.update({
      where: { id },
      data: { createdAt: new Date(Date.now() - ms) },
    });
  }

  test("a session older than the role maximum is revoked with a 401", async () => {
    const email = await userWithPolicies("max-age", [
      { maxSessionSeconds: 60 },
    ]);
    const { cookie, session } = await signedInSession(email);
    expect((await getMe(cookie)).status).toBe(200);

    await ageSession(session.id, TWO_MINUTES_AGO_MS);
    expect((await getMe(cookie)).status).toBe(401);
    expect(await db.session.count({ where: { id: session.id } })).toBe(0);
  });

  test("the shortest maximum wins when a user has two roles", async () => {
    const email = await userWithPolicies("max-age-two", [
      { maxSessionSeconds: 3600 },
      { maxSessionSeconds: 60 },
    ]);
    const { cookie, session } = await signedInSession(email);
    await ageSession(session.id, TWO_MINUTES_AGO_MS);
    expect((await getMe(cookie)).status).toBe(401);
  });

  test("a role without a maximum keeps the default length", async () => {
    const email = await userWithPolicies("max-age-none", [{}]);
    const { cookie, session } = await signedInSession(email);
    await ageSession(session.id, TWO_MINUTES_AGO_MS);
    expect((await getMe(cookie)).status).toBe(200);
  });
});
