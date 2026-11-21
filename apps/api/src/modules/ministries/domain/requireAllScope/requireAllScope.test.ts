import { describe, expect, test } from "bun:test";
import { PERMISSIONS } from "@ancla/contracts";
import type { Access } from "../../../../core/context";
import { ForbiddenError } from "../../../../core/errors";
import { requireAllScope } from "./requireAllScope";

const PERMISSION = PERMISSIONS.ministryProfile.edit;
const access = (overrides: Partial<Access>): Access => ({
  isAdmin: false,
  roles: [],
  grants: new Map(),
  ministryIds: [],
  sessionPolicy: { persistent: true, maxSessionSeconds: null },
  ...overrides,
});

describe("requireAllScope", () => {
  test("passes for the admin and for the all scope", () => {
    expect(() =>
      requireAllScope(access({ isAdmin: true }), PERMISSION),
    ).not.toThrow();
    expect(() =>
      requireAllScope(
        access({ grants: new Map([[PERMISSION, "all"]]) }),
        PERMISSION,
      ),
    ).not.toThrow();
  });

  test("refuses the ministry scope, other scopes and no grant", () => {
    for (const grants of [
      new Map([[PERMISSION, "ministry" as const]]),
      new Map([[PERMISSION, "own" as const]]),
      new Map(),
    ]) {
      expect(() => requireAllScope(access({ grants }), PERMISSION)).toThrow(
        ForbiddenError,
      );
    }
  });
});
