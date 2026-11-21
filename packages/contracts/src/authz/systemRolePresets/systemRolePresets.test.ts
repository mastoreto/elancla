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

describe("editorial presets", () => {
  test("the content editor publishes posts and ministry profiles", () => {
    const editor = SYSTEM_ROLE_PRESETS.find((p) => p.key === "content-editor");
    const publishers = editor?.grants
      .filter((g) => g.action === "publish")
      .map((g) => g.resource);
    expect(publishers).toContain("content.posts");
    expect(publishers).toContain("ministries.profile");
  });

  test("the leader cannot publish", () => {
    const leader = SYSTEM_ROLE_PRESETS.find((p) => p.key === "leader");
    expect(leader?.grants.some((g) => g.action === "publish")).toBe(false);
  });
});

describe("institutional site presets", () => {
  test("the content editor manages settings, people, visit and pages", () => {
    const editor = SYSTEM_ROLE_PRESETS.find((p) => p.key === "content-editor");
    const resources = new Set(editor?.grants.map((g) => g.resource));
    for (const resource of [
      "site",
      "content.people",
      "content.visit",
      "content.pages",
    ]) {
      expect(resources).toContain(resource);
    }
  });

  test("only the content editor and the admin reach the site settings", () => {
    const holders = SYSTEM_ROLE_PRESETS.filter((preset) =>
      preset.grants.some((g) => g.resource === "site"),
    ).map((preset) => preset.key);
    expect(holders).toEqual(["content-editor"]);
  });

  test("the leader edits the profile of their ministry but neither creates, deletes nor publishes it", () => {
    const profile = (action: string) =>
      SYSTEM_ROLE_PRESETS.find((p) => p.key === "leader")?.grants.find(
        (g) => g.resource === "ministries.profile" && g.action === action,
      )?.scope;
    expect(profile("view")).toBe("ministry");
    expect(profile("edit")).toBe("ministry");
    for (const action of ["create", "delete", "publish"]) {
      expect(profile(action)).toBeUndefined();
    }
  });

  test("the content editor publishes ministry profiles on every ministry", () => {
    const grants = SYSTEM_ROLE_PRESETS.find(
      (p) => p.key === "content-editor",
    )?.grants.filter((g) => g.resource === "ministries.profile");
    expect(
      Object.fromEntries((grants ?? []).map((g) => [g.action, g.scope])),
    ).toMatchObject({ view: "all", edit: "all", publish: "all" });
  });
});
