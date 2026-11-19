import { describe, expect, test } from "bun:test";
import type { Access } from "../../context";
import { scopeWhere } from "./scopeWhere";

const user = { id: "user-1", name: "U", email: "u@example.test" };

function ctxWith(grants: Access["grants"], isAdmin = false) {
  const access: Access = {
    isAdmin,
    roles: [],
    grants,
    ministryIds: ["ministry-a"],
    sessionPolicy: { persistent: true, maxSessionSeconds: null },
  };
  return { user, access };
}

describe("scopeWhere", () => {
  test("all scope adds no filter", () => {
    const ctx = ctxWith(new Map([["requests:view", "all"]]));
    expect(scopeWhere(ctx, "requests:view")).toEqual({});
  });

  test("an admin is never filtered", () => {
    expect(scopeWhere(ctxWith(new Map(), true), "requests:view")).toEqual({});
  });

  test("ministry scope limits to the user's ministries", () => {
    const ctx = ctxWith(new Map([["requests:view", "ministry"]]));
    expect(
      scopeWhere(ctx, "requests:view", { ministryField: "ministryId" }),
    ).toEqual({ ministryId: { in: ["ministry-a"] } });
  });

  test("own scope limits to the user's rows", () => {
    const ctx = ctxWith(new Map([["requests:view", "own"]]));
    expect(
      scopeWhere(ctx, "requests:view", { ownerField: "createdById" }),
    ).toEqual({ createdById: "user-1" });
  });

  test("fails closed when the resource lacks the column the scope needs", () => {
    const ctx = ctxWith(new Map([["requests:view", "ministry"]]));
    expect(scopeWhere(ctx, "requests:view")).toEqual({ id: { in: [] } });
  });

  test("fails closed without a grant", () => {
    expect(scopeWhere(ctxWith(new Map()), "requests:view")).toEqual({
      id: { in: [] },
    });
  });
});
