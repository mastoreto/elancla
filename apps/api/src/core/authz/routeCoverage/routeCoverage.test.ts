import { describe, expect, test } from "bun:test";
import { findUnguardedRoutes } from "./routeCoverage";

const routes = [
  { method: "ALL", path: "/api/*" },
  { method: "GET", path: "/api/roles" },
  { method: "DELETE", path: "/api/roles/:id" },
  { method: "GET", path: "/api/health" },
  { method: "POST", path: "/api/auth/*" },
];

describe("findUnguardedRoutes", () => {
  test("a route with a 403 row is covered, a dynamic segment matches a concrete id", () => {
    const calls = [
      { method: "GET", path: "/api/roles", expected: 401 },
      { method: "DELETE", path: "/api/roles/0190-abc", expected: 403 },
    ];
    expect(
      findUnguardedRoutes(routes, calls, ["/api/health", "/api/auth/*"]),
    ).toEqual([]);
  });

  test("a route without any row is reported", () => {
    const calls = [{ method: "GET", path: "/api/roles", expected: 403 }];
    expect(
      findUnguardedRoutes(routes, calls, ["/api/health", "/api/auth/*"]),
    ).toEqual(["DELETE /api/roles/:id"]);
  });

  test("a route only exercised with a 200 is reported", () => {
    const calls = [
      { method: "GET", path: "/api/roles", expected: 200 },
      { method: "DELETE", path: "/api/roles/1", expected: 404 },
    ];
    expect(
      findUnguardedRoutes(routes, calls, ["/api/health", "/api/auth/*"]),
    ).toEqual(["DELETE /api/roles/:id", "GET /api/roles"]);
  });

  test("the method must match", () => {
    const calls = [{ method: "GET", path: "/api/roles/1", expected: 403 }];
    expect(
      findUnguardedRoutes(routes, calls, ["/api/health", "/api/auth/*"]),
    ).toContain("DELETE /api/roles/:id");
  });

  test("public routes are exempt, by exact path and by wildcard prefix", () => {
    expect(
      findUnguardedRoutes(routes, [], ["/api/health", "/api/auth/*"]),
    ).toEqual(["DELETE /api/roles/:id", "GET /api/roles"]);
  });

  test("middleware entries are ignored", () => {
    expect(
      findUnguardedRoutes([{ method: "ALL", path: "/api/*" }], [], []),
    ).toEqual([]);
  });
});
