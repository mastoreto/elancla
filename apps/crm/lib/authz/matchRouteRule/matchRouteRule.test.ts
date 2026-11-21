import { describe, expect, test } from "bun:test";
import { PERMISSIONS } from "@ancla/contracts";
import { churchToDashboardRouteMap } from "@/lib/church";
import { ROUTE_PERMISSIONS } from "../routePermissions";
import { matchRouteRule } from "./matchRouteRule";

describe("matchRouteRule", () => {
  test("a section and its sub-pages share the section rule", () => {
    expect(matchRouteRule("/movements")?.requires).toEqual([PERMISSIONS.movements.view]);
    expect(matchRouteRule("/movements/abc/edit")?.path).toBe("/movements");
  });

  test("the most specific rule wins", () => {
    expect(matchRouteRule("/settings")?.requires).toEqual([]);
    expect(matchRouteRule("/settings/emails/invitation")?.requires).toEqual([
      PERMISSIONS.settings.view,
    ]);
    expect(matchRouteRule("/settings/audit")?.requires).toEqual([PERMISSIONS.audit.view]);
    expect(matchRouteRule("/settings/roles/new")).toMatchObject({ adminOnly: true });
    expect(matchRouteRule("/settings/roles/01900000/edit")).toMatchObject({
      path: "/settings/roles/*/edit",
      adminOnly: true,
    });
  });

  test("people profiles under the website have their own permission", () => {
    expect(matchRouteRule("/website")?.requires).toEqual([PERMISSIONS.site.view]);
    expect(matchRouteRule("/website/people")?.requires).toEqual([PERMISSIONS.people.view]);
    expect(matchRouteRule("/website/people/new")?.requires).toEqual([PERMISSIONS.people.view]);
  });

  test("the visit page has its own permission", () => {
    expect(matchRouteRule("/website/visit")?.requires).toEqual([PERMISSIONS.visit.view]);
  });

  test("the ministry landing and categories need the edit permission, the rest the view one", () => {
    expect(matchRouteRule("/ministries")?.requires).toEqual([PERMISSIONS.ministryProfile.view]);
    expect(matchRouteRule("/ministries/0190-id")?.requires).toEqual([
      PERMISSIONS.ministryProfile.view,
    ]);
    expect(matchRouteRule("/ministries/landing")?.requires).toEqual([
      PERMISSIONS.ministryProfile.edit,
    ]);
    expect(matchRouteRule("/ministries/categories")?.requires).toEqual([
      PERMISSIONS.ministryProfile.edit,
    ]);
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
