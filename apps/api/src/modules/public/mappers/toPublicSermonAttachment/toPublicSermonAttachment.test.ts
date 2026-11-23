import { describe, expect, test } from "bun:test";
import { toPublicSermonAttachment } from "./toPublicSermonAttachment";

const media = {
  id: "file-1",
  status: "ready",
  originalName: "guia.pdf",
  size: 1234,
};

describe("toPublicSermonAttachment", () => {
  test("builds the public URL from the document key", () => {
    expect(
      toPublicSermonAttachment("org-1", media, "https://cdn.test"),
    ).toEqual({
      url: "https://cdn.test/org-1/file-1/document.pdf",
      name: "guia.pdf",
      sizeBytes: 1234,
    });
  });

  test("a PDF that is not ready is not shown", () => {
    expect(
      toPublicSermonAttachment(
        "org-1",
        { ...media, status: "pending" },
        "https://cdn.test",
      ),
    ).toBeNull();
  });
});
