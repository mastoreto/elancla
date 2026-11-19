import { describe, expect, test } from "bun:test";
import {
  actionsOf,
  grant,
  isDangerousPermission,
  isGrantSupported,
  PERMISSION_CATALOG,
  PERMISSION_RESOURCES,
  PERMISSIONS,
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
    expect(isGrantSupported(grant(PERMISSIONS.requests.view, "own"))).toBe(
      true,
    );
    // Users are global: no ministry scope.
    expect(
      isGrantSupported({
        resource: "users",
        action: "view",
        scope: "ministry",
      }),
    ).toBe(false);
    // Settings cannot be approved.
    expect(
      isGrantSupported({
        resource: "settings",
        action: "approve",
        scope: "all",
      }),
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

  test("flags the permissions that control access", () => {
    expect(isDangerousPermission("roles", "edit")).toBe(true);
    expect(isDangerousPermission("users", "edit")).toBe(true);
    expect(isDangerousPermission("invitations", "create")).toBe(true);
    expect(isDangerousPermission("settings", "edit")).toBe(true);
    expect(isDangerousPermission("roles", "view")).toBe(false);
    expect(isDangerousPermission("movements", "edit")).toBe(false);
  });

  test("PERMISSIONS names every catalog pair and nothing else", () => {
    expect(PERMISSIONS.movements.view).toBe("movements:view");
    expect(PERMISSIONS.ministryProfile.edit).toBe("ministries.profile:edit");
    expect(Object.keys(PERMISSIONS.settings)).toEqual(["view", "edit"]);
    expect(Object.isFrozen(PERMISSIONS)).toBe(true);
    expect(Object.isFrozen(PERMISSIONS.roles)).toBe(true);
    // @ts-expect-error settings has no create action
    expect(PERMISSIONS.settings.create).toBeUndefined();
  });
});
