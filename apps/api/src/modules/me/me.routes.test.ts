import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { authPost } from "../../../test/support/authRequest";
import { createFakeGoogle } from "../../../test/support/fakeGoogle";
import {
  cookieHeaderFrom,
  createFixtures,
} from "../../../test/support/fixtures";
import { createTestAuth } from "../../../test/support/testEnv";
import { app } from "../../app";
import { getAuth } from "../../core/auth";
import { getApiEnv } from "../../core/env";

const fixtures = createFixtures();
const { CRM_ORIGIN } = getApiEnv();
const PICTURE = "https://lh3.googleusercontent.com/a/me-test";
const NEW_PASSWORD = "a-brand-new-passphrase";

afterAll(() => fixtures.cleanup());

const get = (cookie?: string) =>
  app.request("/api/me", { headers: cookie ? { Cookie: cookie } : {} });

const createPassword = (cookie: string, newPassword = NEW_PASSWORD) =>
  app.request("/api/me/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: CRM_ORIGIN,
      Cookie: cookie,
    },
    body: JSON.stringify({ newPassword }),
  });

/** A user who only ever signed in with Google (their session cookie is returned). */
async function googleOnlyUser(
  label: string,
): Promise<{ email: string; cookie: string }> {
  const email = fixtures.uniqueEmail(label);
  await fixtures.invite(email);
  const fake = createFakeGoogle();
  const { auth } = createTestAuth({ google: fake.credentials });
  const token = fake.idTokenFor({
    sub: `sub-${email}`,
    email,
    name: "Google Only",
    picture: PICTURE,
  });
  const res = await auth.handler(
    authPost("/sign-in/social", { provider: "google", idToken: { token } }),
  );
  return { email, cookie: cookieHeaderFrom(res) };
}

describe("GET /api/me", () => {
  test("without a session is a 401 problem", async () => {
    const res = await get();
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );
  });

  test("with an invalid cookie is a 401", async () => {
    expect((await get("better-auth.session_token=garbage")).status).toBe(401);
  });

  test("returns only the MeDto for a password user, private and uncached", async () => {
    const email = await fixtures.passwordUser(getAuth(), "me");
    const res = await get(await fixtures.signIn(getAuth(), email));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual([
      "email",
      "id",
      "image",
      "methods",
      "name",
      "twoFactorEnabled",
    ]);
    expect(body).toMatchObject({
      email,
      image: null,
      methods: ["password"],
      twoFactorEnabled: false,
    });
  });

  test("a Google user shows the picture and the Google method", async () => {
    const { cookie } = await googleOnlyUser("me-google");
    const body = await (await get(cookie)).json();
    expect(body).toMatchObject({ image: PICTURE, methods: ["google"] });
  });
});

describe("POST /api/me/password", () => {
  test("a Google-only user with a fresh session creates a password and can then sign in with it", async () => {
    const { email, cookie } = await googleOnlyUser("me-password");
    expect((await createPassword(cookie)).status).toBe(204);
    expect((await (await get(cookie)).json()).methods).toEqual([
      "password",
      "google",
    ]);
    const session = await getAuth().api.signInEmail({
      body: { email, password: NEW_PASSWORD },
    });
    expect(session.user.email).toBe(email);
  });

  test("an old session is a 403 and no password is created", async () => {
    const { email, cookie } = await googleOnlyUser("me-stale");
    await db.session.updateMany({
      where: { user: { email } },
      data: { createdAt: new Date(Date.now() - 11 * 60 * 1000) },
    });
    expect((await createPassword(cookie)).status).toBe(403);
    expect((await (await get(cookie)).json()).methods).toEqual(["google"]);
  });

  test("a weak password is a 400 and an account that has one is a 409", async () => {
    const { cookie } = await googleOnlyUser("me-weak");
    expect((await createPassword(cookie, "short")).status).toBe(400);
    const email = await fixtures.passwordUser(getAuth(), "me-has-password");
    expect(
      (await createPassword(await fixtures.signIn(getAuth(), email))).status,
    ).toBe(409);
  });

  test("without a session is a 401", async () => {
    const res = await app.request("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: CRM_ORIGIN },
      body: JSON.stringify({ newPassword: NEW_PASSWORD }),
    });
    expect(res.status).toBe(401);
  });
});
