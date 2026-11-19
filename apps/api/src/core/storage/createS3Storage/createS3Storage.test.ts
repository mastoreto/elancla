import { describe, expect, test } from "bun:test";
import { runFileStorageContract } from "../fileStorageContract";
import { getStorage } from "../getStorage";
import { createS3Storage } from "./createS3Storage";

runFileStorageContract(() => getStorage("private"));

describe("createS3Storage presigned URLs", () => {
  const storage = createS3Storage({
    endpoint: "http://internal:9000",
    presignEndpoint: "http://browser.example:9000",
    region: "us-east-1",
    bucket: "bucket",
    accessKeyId: "key",
    secretAccessKey: "secret",
  });

  test("point at the host the browser sees and sign type and length", async () => {
    const upload = await storage.presignUpload({
      key: "org/file id",
      contentType: "image/png",
      size: 10,
      expiresInSeconds: 300,
    });
    const url = new URL(upload.url);
    expect(url.origin).toBe("http://browser.example:9000");
    expect(url.pathname).toBe("/bucket/org/file%20id");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe(
      "content-length;content-type;host",
    );
    expect(upload.headers).toEqual({ "Content-Type": "image/png" });
  });

  test("download links expire and force an attachment", async () => {
    const { url } = await storage.presignDownload({
      key: "org/file",
      expiresInSeconds: 60,
      fileName: "a b.pdf",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("X-Amz-Expires")).toBe("60");
    expect(parsed.searchParams.get("response-content-disposition")).toBe(
      "attachment; filename*=UTF-8''a%20b.pdf",
    );
  });
});
