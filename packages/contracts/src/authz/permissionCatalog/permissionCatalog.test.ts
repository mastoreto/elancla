import { describe, expect, test } from "bun:test";
import {
  actionsOf,
  isGrantSupported,
  PERMISSION_CATALOG,
  PERMISSION_RESOURCES,
  scopesOf,
  widerScope,
} from "./permissionCatalog";

describe("permission catalog", () => {
  test("every resource supports at least one action and one scope", () => {
    for (const resource of PERMISSION_RESOURCES) {
      expect(actionsOf(resource).length).toBeGreaterThan(0);
      expect(scopesOf(resource).length).toBeGreaterThan(0);
    }
    expect(PERMISSION_RESOURCES).toContain("ministries.finance");
  });

  test("accepts a supported combination and rejects the rest", () => {
    expect(
      isGrantSupported({ resource: "requests", action: "view", scope: "own" }),
    ).toBe(true);
    // Users are global: no ministry scope.
    expect(
      isGrantSupported({ resource: "users", action: "view", scope: "ministry" }),
    ).toBe(false);
    // Settings cannot be approved.
    expect(
      isGrantSupported({ resource: "settings", action: "approve", scope: "all" }),
    ).toBe(false);
  });

  test("the widest scope wins", () => {
    expect(widerScope("own", "ministry")).toBe("ministry");
    expect(widerScope("all", "ministry")).toBe("all");
    expect(widerScope("own", "own")).toBe("own");
  });

  test("the catalog has no unknown scope or action", () => {
    for (const definition of Object.values(PERMISSION_CATALOG)) {
      for (const scope of definition.scopes) {
        expect(["own", "ministry", "all"]).toContain(scope);
      }
    }
  });
});
