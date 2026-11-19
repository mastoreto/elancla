import { describe, expect, test } from "bun:test";
import { churchToDashboardRouteMap } from "@/lib/church";
import { ROUTE_PERMISSIONS } from "../routePermissions";
import { matchRouteRule } from "./matchRouteRule";

describe("matchRouteRule", () => {
  test("a section and its sub-pages share the section rule", () => {
    expect(matchRouteRule("/movements")?.requires).toEqual(["movements:view"]);
    expect(matchRouteRule("/movements/abc/edit")?.path).toBe("/movements");
  });

  test("the most specific rule wins", () => {
    expect(matchRouteRule("/settings")?.requires).toEqual([]);
    expect(matchRouteRule("/settings/emails/invitation")?.requires).toEqual(["settings:view"]);
    expect(matchRouteRule("/settings/roles/new")).toMatchObject({ adminOnly: true });
    expect(matchRouteRule("/settings/roles/01900000/edit")).toMatchObject({
      path: "/settings/roles/*/edit",
      adminOnly: true,
    });
  });

  test("an undeclared route has no rule (the proxy denies it)", () => {
    expect(matchRouteRule("/nope")).toBeUndefined();
    expect(matchRouteRule("/")).toBeUndefined();
    // The prefix is per segment, not per character.
    expect(matchRouteRule("/movementsx")).toBeUndefined();
  });

  test("every section the sidebar can show has a route rule", () => {
    for (const route of Object.keys(ROUTE_PERMISSIONS)) {
      const internal = churchToDashboardRouteMap[route as keyof typeof churchToDashboardRouteMap];
      expect(matchRouteRule(`/${internal}`)).toBeDefined();
    }
  });
});
