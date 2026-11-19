import { afterAll, describe, expect, test } from "bun:test";
import { auth } from "@ancla/auth";
import { db } from "@ancla/db";
import { app } from "../../app";

const email = `me-test-${crypto.randomUUID()}@example.test`;
const password = "correct-horse-battery-staple";

async function signUpAndGetCookie(): Promise<string> {
  const { headers } = await auth.api.signUpEmail({
    body: { email, password, name: "Me Test" },
    returnHeaders: true,
  });
  return headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

describe("GET /api/me", () => {
  test("without a session is a 401 problem", async () => {
    const res = await app.request("/api/me");
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );
  });

  test("with an invalid cookie is a 401", async () => {
    const res = await app.request("/api/me", {
      headers: { Cookie: "better-auth.session_token=garbage" },
    });
    expect(res.status).toBe(401);
  });

  test("with a session returns only the MeDto, private and uncached", async () => {
    const cookie = await signUpAndGetCookie();
    const res = await app.request("/api/me", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["email", "id", "name"]);
    expect(body.email).toBe(email);
    expect(body.name).toBe("Me Test");
  });
});
