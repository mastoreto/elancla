import { describe, expect, test } from "bun:test";
import { createUploadBody } from "./mediaDto";
import { MEDIA_PURPOSES } from "./mediaPurposes";

const valid = {
  purpose: "contentImage",
  contentType: "image/jpeg",
  size: 1024,
  fileName: "photo.jpg",
};

describe("createUploadBody", () => {
  test("accepts a file inside its purpose", () => {
    expect(createUploadBody.safeParse(valid).success).toBe(true);
  });

  test("rejects a content type the purpose does not allow", () => {
    const result = createUploadBody.safeParse({
      ...valid,
      contentType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  test("the same type is fine for another purpose", () => {
    const result = createUploadBody.safeParse({
      ...valid,
      purpose: "voucherDocument",
      contentType: "application/pdf",
    });
    expect(result.success).toBe(true);
  });

  test("rejects a size over the purpose maximum", () => {
    const result = createUploadBody.safeParse({
      ...valid,
      size: MEDIA_PURPOSES.contentImage.maxBytes + 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects unknown purposes, empty files and extra fields", () => {
    expect(
      createUploadBody.safeParse({ ...valid, purpose: "avatar" }).success,
    ).toBe(false);
    expect(createUploadBody.safeParse({ ...valid, size: 0 }).success).toBe(
      false,
    );
    expect(createUploadBody.safeParse({ ...valid, bucket: "x" }).success).toBe(
      false,
    );
  });
});
