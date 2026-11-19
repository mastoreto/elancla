import { describe, expect, test } from "bun:test";
import type { MePermissionsDto } from "@ancla/contracts";
import type { ProxyRequestFacts } from "../types";
import { decideProxy } from "./decideProxy";

const admin: MePermissionsDto = { isAdmin: true, roles: [], grants: [], ministryIds: [] };
const leader: MePermissionsDto = {
  isAdmin: false,
  roles: [],
  grants: [
    { resource: "requests", action: "view", scope: "ministry" },
    { resource: "ministries.profile", action: "view", scope: "ministry" },
  ],
  ministryIds: [],
};

function facts(pathname: string, overrides: Partial<ProxyRequestFacts> = {}): ProxyRequestFacts {
  return {
    pathname,
    cookie: "better-auth.session_token=x",
    hasSessionCookie: true,
    isDevBypass: false,
    isInternalRewrite: false,
    ...overrides,
  };
}

function loaderOf(access: MePermissionsDto | null) {
  const calls: (string | null)[] = [];
  return {
    calls,
    load: (cookie: string | null) => {
      calls.push(cookie);
      return Promise.resolve(access);
    },
  };
}

describe("decideProxy", () => {
  test("an allowed section is rewritten to its internal route with the access attached", async () => {
    const loader = loaderOf(leader);
    const decision = await decideProxy(facts("/el-ancla/requests/abc"), loader.load);
    expect(decision).toEqual({ type: "rewrite", pathname: "/requests/abc", access: leader });
    expect(loader.calls).toHaveLength(1);
  });

  test("a section the roles do not allow is a not-found", async () => {
    for (const path of [
      "/el-ancla/movements",
      "/el-ancla/vouchers",
      "/el-ancla/settings/roles/new",
    ]) {
      expect(await decideProxy(facts(path), loaderOf(leader).load)).toEqual({ type: "notFound" });
    }
  });

  test("settings stays reachable for a user without settings permissions (Mi cuenta)", async () => {
    const decision = await decideProxy(facts("/el-ancla/settings"), loaderOf(leader).load);
    expect(decision.type).toBe("rewrite");
  });

  test("the role pages are admin-only", async () => {
    const adminDecision = await decideProxy(
      facts("/el-ancla/settings/roles/new"),
      loaderOf(admin).load,
    );
    expect(adminDecision.type).toBe("rewrite");
    const holder: MePermissionsDto = {
      ...leader,
      grants: [{ resource: "roles", action: "create", scope: "all" }],
    };
    const denied = await decideProxy(facts("/el-ancla/settings/roles/new"), loaderOf(holder).load);
    expect(denied).toEqual({ type: "notFound" });
  });

  test("an undeclared route is denied even for an admin (fail closed)", async () => {
    const loader = loaderOf(admin);
    expect(await decideProxy(facts("/el-ancla/nope"), loader.load)).toEqual({ type: "notFound" });
    expect(await decideProxy(facts("/something-else"), loader.load)).toEqual({ type: "notFound" });
    expect(loader.calls).toHaveLength(0);
  });

  test("the internal-rewrite flag does not skip authorization (a client can send it)", async () => {
    const decision = await decideProxy(
      facts("/movements", { isInternalRewrite: true }),
      loaderOf(leader).load,
    );
    expect(decision).toEqual({ type: "notFound" });
  });

  test("public routes and login never load the access", async () => {
    const loader = loaderOf(null);
    for (const path of ["/", "/informe/ABC", "/invitation/tok", "/two-factor", "/reset-password"]) {
      const decision = await decideProxy(
        facts(path, { hasSessionCookie: false, cookie: null }),
        loader.load,
      );
      expect(decision).toEqual({ type: "next", access: undefined });
    }
    expect(loader.calls).toHaveLength(0);
  });

  test("no session cookie redirects to login without touching the API", async () => {
    const loader = loaderOf(admin);
    const decision = await decideProxy(
      facts("/el-ancla/movements", { hasSessionCookie: false, cookie: null }),
      loader.load,
    );
    expect(decision).toEqual({ type: "redirect", pathname: "/", keepSearch: false });
    expect(loader.calls).toHaveLength(0);
  });

  test("a cookie the API rejects redirects to login", async () => {
    const decision = await decideProxy(facts("/el-ancla/movements"), loaderOf(null).load);
    expect(decision).toEqual({ type: "redirect", pathname: "/", keepSearch: false });
  });

  test("church redirects keep the query string", async () => {
    expect(await decideProxy(facts("/el-ancla"), loaderOf(admin).load)).toEqual({
      type: "redirect",
      pathname: "/el-ancla/resume",
      keepSearch: true,
    });
    expect(await decideProxy(facts("/movements/abc"), loaderOf(admin).load)).toEqual({
      type: "redirect",
      pathname: "/el-ancla/movements/abc",
      keepSearch: true,
    });
  });
});
