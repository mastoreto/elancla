import { describe, expect, test } from "bun:test";
import { MEDIA_PURPOSE_KEYS, MEDIA_PURPOSES } from "./mediaPurposes";

describe("MEDIA_PURPOSES", () => {
  test("only private purposes name a download permission", () => {
    for (const key of MEDIA_PURPOSE_KEYS) {
      const purpose: { visibility: string; downloadPermission?: string } =
        MEDIA_PURPOSES[key];
      expect(purpose.downloadPermission !== undefined).toBe(
        purpose.visibility === "private",
      );
    }
  });
});
