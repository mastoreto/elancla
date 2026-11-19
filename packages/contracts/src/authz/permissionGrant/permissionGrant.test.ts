import { describe, expect, test } from "bun:test";
import {
  permissionGrantSchema,
  permissionGrantsSchema,
} from "./permissionGrant";

describe("permission grant validation", () => {
  test("accepts a catalog-supported grant", () => {
    expect(
      permissionGrantSchema.safeParse({
        resource: "ministries.finance",
        action: "view",
        scope: "ministry",
      }).success,
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
    const grant = { resource: "movements", action: "view", scope: "all" };
    expect(permissionGrantsSchema.safeParse([grant, grant]).success).toBe(
      false,
    );
  });
});
