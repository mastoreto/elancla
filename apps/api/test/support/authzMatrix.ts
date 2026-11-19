import { expect, test } from "bun:test";
import type { PermissionGrant } from "@ancla/contracts";
import type { Auth } from "../../src/core/auth";
import type { createFixtures, TestUserAccess } from "./fixtures";

type Fixtures = ReturnType<typeof createFixtures>;

/** Who calls: nobody, a seeded role by key, or a throwaway role with exactly this grid. */
export type MatrixCaller = "anonymous" | TestUserAccess;

export interface MatrixRow {
  /** Short description of the caller for the test name. */
  who: string;
  caller: MatrixCaller;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** A function when the path needs ids that only exist at run time. */
  path: string | (() => string);
  body?: unknown;
  /** Status that proves the guard let the request through or stopped it. */
  expected: number;
}

export interface MatrixHarness {
  auth: Auth;
  fixtures: Fixtures;
  call(
    method: string,
    path: string,
    options: { cookie?: string; body?: unknown },
  ): Promise<Response>;
}

/** One grant, spelled shortly: `grant("requests", "view", "ministry")`. */
export function grant(
  resource: PermissionGrant["resource"],
  action: PermissionGrant["action"],
  scope: PermissionGrant["scope"] = "all",
): PermissionGrant {
  return { resource, action, scope };
}

/**
 * Registers one test per row: role grants x route -> expected status. Every module adds its own
 * rows; the callers (users with a throwaway role) are created once per distinct grid.
 */
export function defineAuthzMatrix(
  title: string,
  rows: readonly MatrixRow[],
  harness: MatrixHarness,
): void {
  const cookies = new Map<string, Promise<string>>();

  function cookieFor(caller: MatrixCaller): Promise<string> {
    if (caller === "anonymous") return Promise.resolve("");
    const key = JSON.stringify(caller);
    const existing = cookies.get(key);
    if (existing) return existing;
    const created = (async () => {
      const email = await harness.fixtures.passwordUser(
        harness.auth,
        "matrix",
        caller,
      );
      return harness.fixtures.signIn(harness.auth, email);
    })();
    cookies.set(key, created);
    return created;
  }

  for (const row of rows) {
    const label = typeof row.path === "string" ? row.path : "(dynamic path)";
    test(`${title}: ${row.who} ${row.method} ${label} -> ${row.expected}`, async () => {
      const path = typeof row.path === "string" ? row.path : row.path();
      const res = await harness.call(row.method, path, {
        cookie: await cookieFor(row.caller),
        body: row.body,
      });
      expect(res.status).toBe(row.expected);
    });
  }
}
