import { describe, expect, test } from "bun:test";
import { permissionGrantsSchema } from "../permissionGrant";
import { SYSTEM_ROLE_PRESETS } from "./systemRolePresets";

describe("system role presets", () => {
  test("ships the eight non-admin roles with unique keys", () => {
    const keys = SYSTEM_ROLE_PRESETS.map((preset) => preset.key);
    expect(keys).toHaveLength(8);
    expect(new Set(keys).size).toBe(8);
    expect(keys).not.toContain("admin");
  });

  test("every preset grid is valid against the catalog", () => {
    for (const preset of SYSTEM_ROLE_PRESETS) {
      const parsed = permissionGrantsSchema.safeParse(preset.grants);
      expect({ key: preset.key, ok: parsed.success }).toEqual({
        key: preset.key,
        ok: true,
      });
    }
  });

  test("the leader acts on the ministry, never on everything", () => {
    const leader = SYSTEM_ROLE_PRESETS.find((p) => p.key === "leader");
    expect(leader?.grants.every((grant) => grant.scope === "ministry")).toBe(
      true,
    );
  });
});
