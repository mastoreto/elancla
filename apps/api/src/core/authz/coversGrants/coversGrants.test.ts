import { describe, expect, test } from "bun:test";
import {
  grant,
  PERMISSIONS,
  type Permission,
  type PermissionScope,
} from "@ancla/contracts";
import { coversGrants } from "./coversGrants";

const held = {
  isAdmin: false,
  grants: new Map<Permission, PermissionScope>([
    [PERMISSIONS.requests.view, "ministry"],
    [PERMISSIONS.movements.view, "all"],
  ]),
};
describe("coversGrants", () => {
  test("an equal or wider scope covers", () => {
    expect(
      coversGrants(held, [grant(PERMISSIONS.requests.view, "ministry")]),
    ).toBe(true);
    expect(coversGrants(held, [grant(PERMISSIONS.requests.view, "own")])).toBe(
      true,
    );
  });

  test("a narrower scope does not cover a wider one", () => {
    expect(coversGrants(held, [grant(PERMISSIONS.requests.view, "all")])).toBe(
      false,
    );
  });

  test("a permission that is not held is not covered", () => {
    expect(
      coversGrants(held, [grant(PERMISSIONS.requests.create, "own")]),
    ).toBe(false);
    expect(
      coversGrants(held, [
        grant(PERMISSIONS.movements.view, "all"),
        grant(PERMISSIONS.budgets.view, "all"),
      ]),
    ).toBe(false);
  });

  test("an empty grid is always covered, and an admin covers everything", () => {
    expect(coversGrants(held, [])).toBe(true);
    expect(
      coversGrants({ isAdmin: true, grants: new Map() }, [
        grant(PERMISSIONS.roles.edit, "all"),
      ]),
    ).toBe(true);
  });
});
