import { describe, expect, test } from "bun:test";
import { filterByPermission } from "./filterByPermission";

const actions = [
  { id: "movement", requires: ["movements:create"] },
  { id: "request", requires: ["requests:create"] },
  { id: "open" },
] as const;

const leader = {
  isAdmin: false,
  grants: [{ resource: "requests", action: "create", scope: "ministry" }],
} as const;

describe("filterByPermission", () => {
  test("keeps only what the grants allow, plus items that need nothing", () => {
    const ids = filterByPermission(actions, { ...leader, grants: [...leader.grants] }).map(
      (a) => a.id,
    );
    expect(ids).toEqual(["request", "open"]);
  });

  test("an admin keeps everything", () => {
    expect(filterByPermission(actions, { isAdmin: true, grants: [] })).toHaveLength(3);
  });

  test("nothing allowed yields an empty list", () => {
    expect(filterByPermission(actions.slice(0, 2), { isAdmin: false, grants: [] })).toEqual([]);
  });
});
