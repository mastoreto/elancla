import { afterEach, describe, expect, test } from "bun:test";
import type { MePermissionsDto } from "@ancla/contracts";
import { NextRequest } from "next/server";
import { ACCESS_HEADER, parseAccess, serializeAccess } from "./lib/authz/accessHeader";
import { createProxy } from "./lib/proxy/createProxy";

const ORIGIN = "http://localhost:3000";
const SESSION_COOKIE = "better-auth.session_token=abc";
const REWRITE_HEADER = "x-iekklesia-internal-rewrite";

function request(path: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, { headers });
}

const signedIn = { cookie: SESSION_COOKIE };
const admin: MePermissionsDto = { isAdmin: true, roles: [], grants: [], ministryIds: [] };

let devBypass = false;
const proxy = createProxy({
  loadAccess: () => Promise.resolve(admin),
  isDevBypass: () => devBypass,
  isDevelopment: () => false,
  createNonce: () => Buffer.from(crypto.randomUUID()).toString("base64"),
});

afterEach(() => {
  devBypass = false;
});

describe("proxy: routing", () => {
  test("a signed-in request to the church root redirects to the default section", async () => {
    const response = await proxy(request("/el-ancla", signedIn));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location") as string).pathname).toBe("/el-ancla/resume");
  });

  test("a church-slug URL is rewritten to the internal route and marked as internal", async () => {
    const response = await proxy(request("/el-ancla/movements/abc", signedIn));
    expect(response.headers.get("x-middleware-rewrite")).toBe(`${ORIGIN}/movements/abc`);
    expect(response.headers.get("x-middleware-request-x-iekklesia-internal-rewrite")).toBe("1");
  });

  test("the resume section maps to the dashboard route", async () => {
    const response = await proxy(request("/el-ancla/resume", signedIn));
    expect(response.headers.get("x-middleware-rewrite")).toBe(`${ORIGIN}/dashboard`);
  });

  test("an internal URL redirects to the church URL, keeping the sub-path", async () => {
    const response = await proxy(request("/movements/abc", signedIn));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location") as string).pathname).toBe(
      "/el-ancla/movements/abc",
    );
  });

  test("an internal URL already rewritten by the proxy passes through", async () => {
    const response = await proxy(request("/movements", { ...signedIn, [REWRITE_HEADER]: "1" }));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  test("an unknown section is denied (fail closed): the proxy renders the not-found page", async () => {
    const response = await proxy(request("/el-ancla/nope", signedIn));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/__not-found");
  });
});

describe("proxy: session gate", () => {
  test("without a session cookie everything but login and public pages goes to login", async () => {
    const response = await proxy(request("/el-ancla/movements?x=1"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") as string);
    expect(location.pathname).toBe("/");
    expect(location.search).toBe("");
  });

  test("login and the public pages are reachable without a session", async () => {
    for (const path of ["/", "/informe/ABC", "/invitation/tok", "/two-factor", "/reset-password"]) {
      const response = await proxy(request(path));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
  });

  test("the development bypass skips the cookie check", async () => {
    devBypass = true;
    const response = await proxy(request("/el-ancla/resume"));
    expect(response.headers.get("x-middleware-rewrite")).toBe(`${ORIGIN}/dashboard`);
  });
});

describe("proxy: authorization", () => {
  const leader: MePermissionsDto = { isAdmin: false, roles: [], grants: [], ministryIds: [] };

  function proxyFor(access: MePermissionsDto | null) {
    return createProxy({
      loadAccess: () => Promise.resolve(access),
      isDevBypass: () => false,
      isDevelopment: () => false,
      createNonce: () => "n",
    });
  }

  test("a denied section renders the not-found page instead of redirecting", async () => {
    const response = await proxyFor(leader)(request("/el-ancla/movements", signedIn));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toContain("/__not-found");
  });

  test("the loaded access travels to the page in an internal header", async () => {
    const response = await proxyFor(admin)(request("/el-ancla/movements", signedIn));
    const value = response.headers.get(`x-middleware-request-${ACCESS_HEADER}`) as string;
    expect(parseAccess(value)).toEqual(admin);
  });

  test("an access header sent by the client is replaced, never trusted", async () => {
    const forged = serializeAccess({ ...admin, isAdmin: true });
    const response = await proxyFor(leader)(
      request("/el-ancla/settings", { ...signedIn, [ACCESS_HEADER]: forged }),
    );
    expect(parseAccess(response.headers.get(`x-middleware-request-${ACCESS_HEADER}`))).toEqual(
      leader,
    );
  });

  test("a session the API rejects goes back to login", async () => {
    const response = await proxyFor(null)(request("/el-ancla/movements", signedIn));
    expect(new URL(response.headers.get("location") as string).pathname).toBe("/");
  });
});

describe("proxy: security headers", () => {
  test("every response carries the CSP with a nonce and the other security headers", async () => {
    for (const path of ["/", "/el-ancla", "/el-ancla/movements", "/movements", "/informe/X"]) {
      const response = await proxy(request(path, signedIn));
      const csp = response.headers.get("content-security-policy") as string;
      expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+'/);
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("strict-transport-security")).toContain("max-age=");
    }
  });

  test("the nonce is forwarded to the page in the request headers", async () => {
    const response = await proxy(request("/el-ancla/movements", signedIn));
    const nonce = response.headers.get("x-middleware-request-x-nonce");
    expect(nonce).toBeTruthy();
    expect(response.headers.get("content-security-policy")).toContain(`'nonce-${nonce}'`);
  });

  test("a different nonce is generated per request", async () => {
    const first = await proxy(request("/", signedIn));
    const second = await proxy(request("/", signedIn));
    expect(first.headers.get("x-middleware-request-x-nonce")).not.toBe(
      second.headers.get("x-middleware-request-x-nonce"),
    );
  });
});
