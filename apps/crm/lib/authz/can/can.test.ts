import { describe, expect, test } from "bun:test";
import { can, canAny } from "./can";

const leader = {
  isAdmin: false,
  grants: [
    { resource: "requests", action: "view", scope: "ministry" },
    { resource: "ministries.finance", action: "view", scope: "ministry" },
  ],
} as const;

describe("can", () => {
  test("the admin holds every permission, even a resource added later", () => {
    expect(can({ isAdmin: true, grants: [] }, "movements:view")).toBe(true);
    expect(can({ isAdmin: true, grants: [] }, "roles:delete")).toBe(true);
  });

  test("a grant allows exactly its resource and action", () => {
    expect(can({ ...leader, grants: [...leader.grants] }, "requests:view")).toBe(true);
    expect(can({ ...leader, grants: [...leader.grants] }, "requests:create")).toBe(false);
    expect(can({ ...leader, grants: [...leader.grants] }, "movements:view")).toBe(false);
  });

  test("a fine-grained resource does not leak into its sibling", () => {
    const access = { ...leader, grants: [...leader.grants] };
    expect(can(access, "ministries.finance:view")).toBe(true);
    expect(can(access, "ministries.profile:view")).toBe(false);
  });

  test("canAny passes with one match and treats an empty list as open", () => {
    const access = { ...leader, grants: [...leader.grants] };
    expect(canAny(access, ["movements:view", "requests:view"])).toBe(true);
    expect(canAny(access, ["movements:view", "budgets:view"])).toBe(false);
    expect(canAny(access, [])).toBe(true);
  });
});
