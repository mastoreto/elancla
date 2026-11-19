import { describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "../permissionCatalog";
import {
  permissionGrantSchema,
  permissionGrantsSchema,
} from "./permissionGrant";

describe("permission grant validation", () => {
  test("accepts a catalog-supported grant", () => {
    expect(
      permissionGrantSchema.safeParse(
        grant(PERMISSIONS.ministryFinance.view, "ministry"),
      ).success,
    ).toBe(true);
  });

  test("rejects an unsupported scope, action or resource", () => {
    const base = { resource: "users", action: "view", scope: "all" };
    expect(
      permissionGrantSchema.safeParse({ ...base, scope: "own" }).success,
    ).toBe(false);
    expect(
      permissionGrantSchema.safeParse({ ...base, action: "approve" }).success,
    ).toBe(false);
    expect(
      permissionGrantSchema.safeParse({ ...base, resource: "nope" }).success,
    ).toBe(false);
  });

  test("rejects a repeated permission", () => {
    const repeated = grant(PERMISSIONS.movements.view, "all");
    expect(permissionGrantsSchema.safeParse([repeated, repeated]).success).toBe(
      false,
    );
  });
});
