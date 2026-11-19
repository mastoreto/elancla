import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@ancla/db";
import { authPost } from "../../../../test/support/authRequest";
import { createFakeGoogle } from "../../../../test/support/fakeGoogle";
import {
  cookieHeaderFrom,
  createFixtures,
} from "../../../../test/support/fixtures";
import { createTestAuth } from "../../../../test/support/testEnv";
import { totpFromUri } from "../../../../test/support/totp";
import { getApiEnv } from "../../env";

const env = getApiEnv();
const fixtures = createFixtures();
const email = fixtures.uniqueEmail("social-2fa");
const google = createFakeGoogle();
const { auth } = createTestAuth({ google: google.credentials });
const idToken = google.idTokenFor({
  sub: `sub-${crypto.randomUUID()}`,
  email,
  name: "Social Two",
});

afterAll(() => fixtures.cleanup());

describe("social two-factor guard (Google sign-in with 2FA enabled)", () => {
  test("a user with 2FA gets twoFactorRedirect and no session, then finishes with a TOTP", async () => {
    await fixtures.invite(email);

    // First sign-in creates the user through the invitation and gives a session.
    const first = await auth.handler(
      authPost("/sign-in/social", {
        provider: "google",
        idToken: { token: idToken },
      }),
    );
    expect(first.status).toBe(200);
    const sessionCookie = cookieHeaderFrom(first);

    // Enable 2FA (Google-only user: no password to confirm) and confirm the first code.
    const enabled = await auth.api.enableTwoFactor({
      body: {},
      headers: new Headers({ cookie: sessionCookie }),
    });
    expect(enabled.totpURI).toStartWith("otpauth://");
    const verified = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: await totpFromUri(enabled.totpURI) },
        { cookie: sessionCookie },
      ),
    );
    expect(verified.status).toBe(200);
    expect(
      (await db.user.findUniqueOrThrow({ where: { email } })).twoFactorEnabled,
    ).toBe(true);
    await db.session.deleteMany({ where: { user: { email } } });

    // Signing in with Google again must not yield a session.
    const sessionsBefore = await db.session.count({
      where: { user: { email } },
    });
    const challenged = await auth.handler(
      authPost("/sign-in/social", {
        provider: "google",
        idToken: { token: idToken },
      }),
    );
    expect(challenged.status).toBe(200);
    expect(await challenged.json()).toEqual({
      twoFactorRedirect: true,
      twoFactorMethods: ["totp"],
    });
    expect(await db.session.count({ where: { user: { email } } })).toBe(
      sessionsBefore,
    );
    const setCookies = challenged.headers.getSetCookie().join("\n");
    expect(setCookies).toContain("two_factor=");
    expect(setCookies).not.toContain("session_token=eyJ");
    const challengeCookie = cookieHeaderFrom(challenged);
    expect(challengeCookie).not.toContain("session_token");

    // The official endpoint completes the login.
    const wrong = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: "000000" },
        { cookie: challengeCookie },
      ),
    );
    expect(wrong.status).toBe(401);
    const completed = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: await totpFromUri(enabled.totpURI) },
        { cookie: challengeCookie },
      ),
    );
    expect(completed.status).toBe(200);
    const loggedIn = cookieHeaderFrom(completed);
    expect(loggedIn).toContain("session_token");
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: loggedIn }),
    });
    expect(session?.user.email).toBe(email);
  });

  test("the redirect flow (/callback/google) sends a user with 2FA to /two-factor without a session", async () => {
    await db.session.deleteMany({ where: { user: { email } } });
    // Start the redirect flow to get a valid state and its cookie.
    const start = await auth.handler(
      authPost("/sign-in/social", { provider: "google" }),
    );
    const { url } = (await start.json()) as { url: string };
    const state = new URL(url).searchParams.get("state") ?? "";
    // Google's token endpoint is the only network call of the callback: answer it locally.
    const realFetch = globalThis.fetch;
    const fetchSpy = spyOn(globalThis, "fetch").mockImplementation(((
      input,
      init,
    ) => {
      if (String(input).startsWith("https://oauth2.googleapis.com/token")) {
        return Promise.resolve(
          Response.json({
            access_token: "fake-access",
            id_token: idToken,
            token_type: "Bearer",
          }),
        );
      }
      return realFetch(input, init);
    }) as typeof fetch);
    try {
      const callback = await auth.handler(
        new Request(
          `${env.BETTER_AUTH_URL}/api/auth/callback/google?code=fake-code&state=${state}`,
          {
            headers: { Cookie: cookieHeaderFrom(start) },
          },
        ),
      );
      expect(callback.status).toBe(302);
      expect(callback.headers.get("location")).toBe(
        `${env.CRM_ORIGIN}/two-factor`,
      );
      const cookies = callback.headers.getSetCookie().join("\n");
      expect(cookies).toContain("two_factor=");
      expect(cookieHeaderFrom(callback)).not.toContain("session_token");
      expect(await db.session.count({ where: { user: { email } } })).toBe(0);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
