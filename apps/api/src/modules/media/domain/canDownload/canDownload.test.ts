import { describe, expect, test } from "bun:test";
import { canDownload } from "./canDownload";

const USER = "user-1";

describe("canDownload", () => {
  test("`all` sees every file, even one with no uploader", () => {
    expect(
      canDownload({ scope: "all", uploadedById: "other", userId: USER }),
    ).toBe(true);
    expect(
      canDownload({ scope: "all", uploadedById: null, userId: USER }),
    ).toBe(true);
  });

  test("`own` and `ministry` only see what the user uploaded", () => {
    for (const scope of ["own", "ministry"] as const) {
      expect(canDownload({ scope, uploadedById: USER, userId: USER })).toBe(
        true,
      );
      expect(canDownload({ scope, uploadedById: "other", userId: USER })).toBe(
        false,
      );
      expect(canDownload({ scope, uploadedById: null, userId: USER })).toBe(
        false,
      );
    }
  });
});
