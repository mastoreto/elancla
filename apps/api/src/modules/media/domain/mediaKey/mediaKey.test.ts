import { describe, expect, test } from "bun:test";
import { originalKey, variantKey } from "./mediaKey";

describe("mediaKey", () => {
  test("the original lives under <organizationId>/<fileId>", () => {
    expect(originalKey("org", "file")).toBe("org/file");
  });

  test("a variant adds its width and format", () => {
    expect(variantKey("org", "file", 480, "webp")).toBe("org/file/480.webp");
    expect(variantKey("org", "file", 1600, "avif")).toBe("org/file/1600.avif");
  });
});
