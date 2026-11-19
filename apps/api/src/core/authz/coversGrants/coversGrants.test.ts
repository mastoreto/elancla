import { describe, expect, test } from "bun:test";
import type { PermissionGrant } from "@ancla/contracts";
import { coversGrants } from "./coversGrants";

const held = {
  isAdmin: false,
  grants: new Map<`${string}:${string}`, "own" | "ministry" | "all">([
    ["requests:view", "ministry"],
    ["movements:view", "all"],
  ]) as never,
};
const grant = (
  resource: PermissionGrant["resource"],
  action: PermissionGrant["action"],
  scope: PermissionGrant["scope"],
): PermissionGrant => ({ resource, action, scope });

describe("coversGrants", () => {
  test("an equal or wider scope covers", () => {
    expect(coversGrants(held, [grant("requests", "view", "ministry")])).toBe(
      true,
    );
    expect(coversGrants(held, [grant("requests", "view", "own")])).toBe(true);
  });

  test("a narrower scope does not cover a wider one", () => {
    expect(coversGrants(held, [grant("requests", "view", "all")])).toBe(false);
  });

  test("a permission that is not held is not covered", () => {
    expect(coversGrants(held, [grant("requests", "create", "own")])).toBe(
      false,
    );
    expect(
      coversGrants(held, [
        grant("movements", "view", "all"),
        grant("budgets", "view", "all"),
      ]),
    ).toBe(false);
  });

  test("an empty grid is always covered, and an admin covers everything", () => {
    expect(coversGrants(held, [])).toBe(true);
    expect(
      coversGrants({ isAdmin: true, grants: new Map() }, [
        grant("roles", "edit", "all"),
      ]),
    ).toBe(true);
  });
});
