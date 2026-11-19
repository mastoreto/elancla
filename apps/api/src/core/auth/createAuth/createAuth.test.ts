import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { authPost } from "../../../../test/support/authRequest";
import { createFakeGoogle } from "../../../../test/support/fakeGoogle";
import {
  cookieHeaderFrom,
  createFixtures,
  TEST_PASSWORD,
} from "../../../../test/support/fixtures";
import { createTestAuth } from "../../../../test/support/testEnv";
import { totpFromUri } from "../../../../test/support/totp";
import { getApiEnv } from "../../env";

const fixtures = createFixtures();
const google = createFakeGoogle();
const { auth, mailer } = createTestAuth({ google: google.credentials });
const PICTURE = "https://lh3.googleusercontent.com/a/test-picture";

afterAll(() => fixtures.cleanup());

function googleSignIn(
  email: string,
  overrides: { picture?: string; verified?: boolean } = {},
) {
  const token = google.idTokenFor({
    sub: `sub-${email}`,
    email,
    name: "Google Person",
    picture: overrides.picture,
    emailVerified: overrides.verified,
  });
  return auth.handler(
    authPost("/sign-in/social", { provider: "google", idToken: { token } }),
  );
}

describe("sign-up is invitation only", () => {
  test("a password sign-up without an invitation is rejected and creates nothing", async () => {
    const email = fixtures.uniqueEmail("no-invite");
    // With autoSignIn off Better Auth answers a refused sign-up like a duplicate one (it does not
    // reveal the refusal), so the proof is that no row exists.
    await auth.api.signUpEmail({
      body: { email, password: TEST_PASSWORD, name: "Nobody" },
    });
    expect(await db.user.count({ where: { email } })).toBe(0);
  });

  test("an expired, revoked or used invitation does not open the door either", async () => {
    for (const state of [
      { expiresAt: new Date(Date.now() - 1000) },
      { revokedAt: new Date() },
      { acceptedAt: new Date() },
    ]) {
      const email = fixtures.uniqueEmail("dead-invite");
      await fixtures.invite(email, state);
      await auth.api.signUpEmail({
        body: { email, password: TEST_PASSWORD, name: "Nobody" },
      });
      expect(await db.user.count({ where: { email } })).toBe(0);
    }
  });

  test("a Google sign-in without an invitation is rejected and creates nothing", async () => {
    const email = fixtures.uniqueEmail("google-no-invite");
    const res = await googleSignIn(email);
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("INVITATION_REQUIRED");
    expect(await db.user.count({ where: { email } })).toBe(0);
  });

  test("Google with an invitation but an unverified email is rejected", async () => {
    const email = fixtures.uniqueEmail("google-unverified");
    await fixtures.invite(email);
    const res = await googleSignIn(email, { verified: false });
    expect(res.status).toBe(403);
    expect(await db.user.count({ where: { email } })).toBe(0);
  });

  test("Google with an invited, verified email creates the user with picture and role", async () => {
    const email = fixtures.uniqueEmail("google-ok");
    await fixtures.invite(email, { role: "admin" });
    const res = await googleSignIn(email, { picture: PICTURE });
    expect(res.status).toBe(200);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user).toMatchObject({
      image: PICTURE,
      role: "admin",
      emailVerified: true,
    });
    const invitation = await db.invitation.findFirstOrThrow({
      where: { email },
    });
    expect(invitation.acceptedAt).not.toBeNull();
  });
});

describe("explicit account linking", () => {
  test("a password user cannot sign in with Google until they link it", async () => {
    const email = await fixtures.passwordUser(auth, "unlinked");
    const res = await googleSignIn(email, { picture: PICTURE });
    expect(res.status).toBe(401);
    expect(
      await db.account.count({
        where: { user: { email }, providerId: "google" },
      }),
    ).toBe(0);
    expect(res.headers.getSetCookie().join()).not.toContain("session_token=");
  });

  test("while signed in, linkSocial links Google, saves the picture and then Google works", async () => {
    const email = await fixtures.passwordUser(auth, "link");
    const cookie = await fixtures.signIn(auth, email);
    const token = google.idTokenFor({
      sub: `sub-${email}`,
      email,
      name: "Link",
      picture: PICTURE,
    });
    const linked = await auth.handler(
      authPost(
        "/link-social",
        { provider: "google", idToken: { token } },
        { cookie },
      ),
    );
    expect(linked.status).toBe(200);
    expect(
      await db.account.count({
        where: { user: { email }, providerId: "google" },
      }),
    ).toBe(1);
    expect((await db.user.findUniqueOrThrow({ where: { email } })).image).toBe(
      PICTURE,
    );
    expect((await googleSignIn(email)).status).toBe(200);
  });

  test("linking keeps the picture the user already had", async () => {
    const email = await fixtures.passwordUser(auth, "link-keep");
    await db.user.update({
      where: { email },
      data: { image: "https://example.test/mine.png" },
    });
    const cookie = await fixtures.signIn(auth, email);
    const token = google.idTokenFor({
      sub: `sub-${email}`,
      email,
      name: "Keep",
      picture: PICTURE,
    });
    await auth.handler(
      authPost(
        "/link-social",
        { provider: "google", idToken: { token } },
        { cookie },
      ),
    );
    expect((await db.user.findUniqueOrThrow({ where: { email } })).image).toBe(
      "https://example.test/mine.png",
    );
  });

  test("linking Google with a different email is rejected", async () => {
    const email = await fixtures.passwordUser(auth, "link-other");
    const cookie = await fixtures.signIn(auth, email);
    const token = google.idTokenFor({
      sub: "other",
      email: "someone-else@example.test",
      name: "X",
    });
    const res = await auth.handler(
      authPost(
        "/link-social",
        { provider: "google", idToken: { token } },
        { cookie },
      ),
    );
    expect(res.status).toBe(401);
    expect(
      await db.account.count({
        where: { user: { email }, providerId: "google" },
      }),
    ).toBe(0);
  });

  test("linking needs a fresh session", async () => {
    const email = await fixtures.passwordUser(auth, "link-stale");
    const cookie = await fixtures.signIn(auth, email);
    await db.session.updateMany({
      where: { user: { email } },
      data: { createdAt: new Date(Date.now() - 11 * 60 * 1000) },
    });
    const token = google.idTokenFor({
      sub: `sub-${email}`,
      email,
      name: "Stale",
    });
    const res = await auth.handler(
      authPost(
        "/link-social",
        { provider: "google", idToken: { token } },
        { cookie },
      ),
    );
    expect(res.status).toBe(403);
  });
});

describe("two-factor with email and password", () => {
  test("enable, sign out, sign in asks for a code; valid, invalid and backup codes", async () => {
    const email = await fixtures.passwordUser(auth, "totp");
    const cookie = await fixtures.signIn(auth, email);
    const enabled = await auth.api.enableTwoFactor({
      body: { password: TEST_PASSWORD },
      headers: new Headers({ cookie }),
    });
    const confirmed = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: await totpFromUri(enabled.totpURI) },
        { cookie },
      ),
    );
    expect(confirmed.status).toBe(200);
    await auth.handler(
      authPost("/sign-out", {}, { cookie: cookieHeaderFrom(confirmed) }),
    );

    const challenge = await auth.handler(
      authPost("/sign-in/email", { email, password: TEST_PASSWORD }),
    );
    expect((await challenge.json()).twoFactorRedirect).toBe(true);
    const challengeCookie = cookieHeaderFrom(challenge);
    expect(challengeCookie).not.toContain("session_token");

    const wrong = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: "000000" },
        { cookie: challengeCookie },
      ),
    );
    expect(wrong.status).toBe(401);

    const ok = await auth.handler(
      authPost(
        "/two-factor/verify-totp",
        { code: await totpFromUri(enabled.totpURI) },
        { cookie: challengeCookie },
      ),
    );
    expect(ok.status).toBe(200);
    expect(cookieHeaderFrom(ok)).toContain("session_token");

    // Backup code on a second challenge; each code works once.
    const again = await auth.handler(
      authPost("/sign-in/email", { email, password: TEST_PASSWORD }),
    );
    const againCookie = cookieHeaderFrom(again);
    const backupCode = enabled.backupCodes[0] as string;
    const viaBackup = await auth.handler(
      authPost(
        "/two-factor/verify-backup-code",
        { code: backupCode },
        { cookie: againCookie },
      ),
    );
    expect(viaBackup.status).toBe(200);
    const third = await auth.handler(
      authPost("/sign-in/email", { email, password: TEST_PASSWORD }),
    );
    const reused = await auth.handler(
      authPost(
        "/two-factor/verify-backup-code",
        { code: backupCode },
        { cookie: cookieHeaderFrom(third) },
      ),
    );
    expect(reused.status).toBe(401);
  });
});

describe("password recovery", () => {
  test("the email arrives and its link sets a new password", async () => {
    const email = await fixtures.passwordUser(auth, "reset");
    const redirectTo = `${getApiEnv().CRM_ORIGIN}/reset-password`;
    await auth.handler(
      authPost("/request-password-reset", { email, redirectTo }),
    );
    const message = mailer.sent.find((sent) => sent.to === email);
    expect(message).toBeDefined();
    const link = (message?.text ?? "").match(
      /https?:\/\/\S+reset-password\/\S+/,
    )?.[0];
    expect(link).toBeString();

    const callback = await auth.handler(
      new Request(link as string, { redirect: "manual" }),
    );
    const token = new URL(
      callback.headers.get("location") as string,
    ).searchParams.get("token");
    expect(token).toBeString();

    const newPassword = "an-entirely-new-passphrase";
    const reset = await auth.handler(
      authPost("/reset-password", { newPassword, token }),
    );
    expect(reset.status).toBe(200);
    const signIn = await auth.handler(
      authPost("/sign-in/email", { email, password: newPassword }),
    );
    expect(signIn.status).toBe(200);
    const oldPassword = await auth.handler(
      authPost("/sign-in/email", { email, password: TEST_PASSWORD }),
    );
    expect(oldPassword.status).toBe(401);
  });
});
