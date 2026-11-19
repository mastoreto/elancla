import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { app } from "./app";
import { allowPublic, declaresAccess, requirePermission } from "./core/authz";

/** Registered by `app.doc31` outside production; it is the public OpenAPI document. */
const OPENAPI_DOCUMENT_PATH = "/api/openapi.json";

type RouteList = readonly { method: string; path: string; handler: unknown }[];

/** `METHOD path` of every endpoint none of whose handlers declares access. */
function findUndeclaredRoutes(routes: RouteList): string[] {
  const handlersByRoute = new Map<string, unknown[]>();
  for (const route of routes) {
    // `app.use` middleware (request id, CSRF...) is not an endpoint.
    if (route.method === "ALL") continue;
    const key = `${route.method} ${route.path}`;
    handlersByRoute.set(key, [
      ...(handlersByRoute.get(key) ?? []),
      route.handler,
    ]);
  }
  return [...handlersByRoute]
    .filter(([, handlers]) => !handlers.some(declaresAccess))
    .map(([key]) => key);
}

describe("router introspection", () => {
  test("every route declares who may call it", () => {
    const undeclared = findUndeclaredRoutes(app.routes).filter(
      (key) => !key.endsWith(OPENAPI_DOCUMENT_PATH),
    );
    // A new route must use requirePermission, allowPublic or allowAnySession.
    expect(undeclared).toEqual([]);
    expect(app.routes.length).toBeGreaterThan(30);
  });

  test("a route without a declaration is reported", () => {
    const sample = new Hono()
      .get("/open", allowPublic, (c) => c.text("ok"))
      .get("/guarded", requirePermission("roles:view"), (c) => c.text("ok"))
      .get("/forgotten", (c) => c.text("ok"));
    expect(findUndeclaredRoutes(sample.routes)).toEqual(["GET /forgotten"]);
  });
});
