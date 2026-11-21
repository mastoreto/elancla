import { describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { can, canAny, canWithAllScope } from "./can";

const leader = {
  isAdmin: false,
  grants: [
    grant(PERMISSIONS.requests.view, "ministry"),
    grant(PERMISSIONS.ministryFinance.view, "ministry"),
  ],
} as const;

describe("can", () => {
  test("the admin holds every permission, even a resource added later", () => {
    expect(can({ isAdmin: true, grants: [] }, PERMISSIONS.movements.view)).toBe(true);
    expect(can({ isAdmin: true, grants: [] }, PERMISSIONS.roles.delete)).toBe(true);
  });

  test("a grant allows exactly its resource and action", () => {
    expect(can({ ...leader, grants: [...leader.grants] }, PERMISSIONS.requests.view)).toBe(true);
    expect(can({ ...leader, grants: [...leader.grants] }, PERMISSIONS.requests.create)).toBe(false);
    expect(can({ ...leader, grants: [...leader.grants] }, PERMISSIONS.movements.view)).toBe(false);
  });

  test("a fine-grained resource does not leak into its sibling", () => {
    const access = { ...leader, grants: [...leader.grants] };
    expect(can(access, PERMISSIONS.ministryFinance.view)).toBe(true);
    expect(can(access, PERMISSIONS.ministryProfile.view)).toBe(false);
  });

  test("canAny passes with one match and treats an empty list as open", () => {
    const access = { ...leader, grants: [...leader.grants] };
    expect(canAny(access, [PERMISSIONS.movements.view, PERMISSIONS.requests.view])).toBe(true);
    expect(canAny(access, [PERMISSIONS.movements.view, PERMISSIONS.budgets.view])).toBe(false);
    expect(canAny(access, [])).toBe(true);
  });
});

describe("canWithAllScope", () => {
  test("the admin holds every scope", () => {
    expect(canWithAllScope({ isAdmin: true, grants: [] }, PERMISSIONS.ministryProfile.edit)).toBe(
      true,
    );
  });

  test("a ministry scope does not count, an all scope does", () => {
    const ministryScoped = {
      isAdmin: false,
      grants: [grant(PERMISSIONS.ministryProfile.edit, "ministry")],
    };
    const allScoped = { isAdmin: false, grants: [grant(PERMISSIONS.ministryProfile.edit, "all")] };
    expect(canWithAllScope(ministryScoped, PERMISSIONS.ministryProfile.edit)).toBe(false);
    expect(canWithAllScope(allScoped, PERMISSIONS.ministryProfile.edit)).toBe(true);
    expect(canWithAllScope(allScoped, PERMISSIONS.ministryProfile.create)).toBe(false);
  });
});
