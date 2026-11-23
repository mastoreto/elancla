import { describe, expect, test } from "bun:test";
import { readImportArguments } from "./readImportArguments";

describe("readImportArguments", () => {
  test("reads the organization and the playlist in any order", () => {
    const expected = { org: "el-ancla", playlist: "PLabc", dryRun: false };
    expect(
      readImportArguments(["--org", "el-ancla", "--playlist", "PLabc"]),
    ).toEqual(expected);
    expect(
      readImportArguments(["--playlist", "PLabc", "--org", "el-ancla"]),
    ).toEqual(expected);
  });

  test("reads --dry-run as a switch", () => {
    expect(
      readImportArguments(["--org", "a", "--dry-run", "--playlist", "b"]),
    ).toEqual({ org: "a", playlist: "b", dryRun: true });
  });

  test("leaves a value out when it is missing or is another flag", () => {
    expect(readImportArguments([])).toEqual({
      org: undefined,
      playlist: undefined,
      dryRun: false,
    });
    expect(readImportArguments(["--org", "--dry-run"]).org).toBeUndefined();
    expect(readImportArguments(["--playlist"]).playlist).toBeUndefined();
  });
});
