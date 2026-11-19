import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Permissions are referenced only through `PERMISSIONS` (`PERMISSIONS.movements.view`), so a
 * rename or a typo is a compile error. This scans the sources for the string form and fails with
 * file:line. Only the catalog (where the strings are built) may spell them.
 */
const REPO_ROOT = path.resolve(import.meta.dir, "../../../../..");
const SCANNED_ROOTS = ["apps/api", "apps/crm", "packages"];
const SKIPPED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  ".turbo",
  ".agents",
  "desing",
  "generated",
  "dist",
]);
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx"]);
const HAND_WRITTEN_PERMISSION =
  /["'][a-zA-Z.]+:(view|create|edit|approve|delete)["']/;
const ALLOWED_FILES = new Set([
  "packages/contracts/src/authz/permissionCatalog/permissionCatalog.ts",
  // Spells the pattern to detect it, and asserts the built strings.
  "packages/contracts/src/authz/noHandWrittenPermissions/noHandWrittenPermissions.test.ts",
  "packages/contracts/src/authz/permissionCatalog/permissionCatalog.test.ts",
]);

function* sourceFiles(directory: string): Generator<string> {
  for (const entry of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(entry)) continue;
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) yield* sourceFiles(fullPath);
    else if (SCANNED_EXTENSIONS.has(path.extname(entry))) yield fullPath;
  }
}

function findOffenses(): string[] {
  const offenses: string[] = [];
  for (const root of SCANNED_ROOTS) {
    for (const file of sourceFiles(path.join(REPO_ROOT, root))) {
      const relative = path.relative(REPO_ROOT, file);
      if (ALLOWED_FILES.has(relative)) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (HAND_WRITTEN_PERMISSION.test(line))
            offenses.push(`${relative}:${index + 1}  ${line.trim()}`);
        });
    }
  }
  return offenses;
}

describe("permission references", () => {
  test("no source writes a permission string by hand (use PERMISSIONS)", () => {
    expect(findOffenses()).toEqual([]);
  });

  test("the pattern catches the forms it is meant to", () => {
    for (const sample of [
      '"movements:view"',
      "'roles:edit'",
      '"ministries.profile:edit"',
    ]) {
      expect(HAND_WRITTEN_PERMISSION.test(sample)).toBe(true);
    }
    expect(HAND_WRITTEN_PERMISSION.test("PERMISSIONS.movements.view")).toBe(
      false,
    );
  });
});
