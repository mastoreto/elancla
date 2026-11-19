import { describe, expect, test } from "bun:test";
import type { FileStorage } from "../types";

const EXPIRES_IN_SECONDS = 60;
const PAYLOAD = Uint8Array.from(
  new TextEncoder().encode("contract test payload"),
);

/**
 * Behavior every `FileStorage` must have. It is exported as a function that receives the storage
 * so any future adapter runs the same suite. It needs a real server (no mocks).
 */
export function runFileStorageContract(createStorage: () => FileStorage): void {
  const storage = createStorage();
  const keyPrefix = `contract-${crypto.randomUUID()}`;
  const keys: string[] = [];
  const newKey = (name: string): string => {
    const key = `${keyPrefix}/${name}`;
    keys.push(key);
    return key;
  };

  describe("FileStorage contract", () => {
    test("presigned PUT -> head -> get -> presigned GET -> delete -> head null", async () => {
      const key = newKey("roundtrip.txt");
      const upload = await storage.presignUpload({
        key,
        contentType: "text/plain",
        size: PAYLOAD.byteLength,
        expiresInSeconds: EXPIRES_IN_SECONDS,
      });
      const put = await fetch(upload.url, {
        method: "PUT",
        headers: upload.headers,
        body: PAYLOAD,
      });
      expect(put.status).toBe(200);

      const head = await storage.head(key);
      expect(head?.size).toBe(PAYLOAD.byteLength);
      expect(head?.contentType).toBe("text/plain");
      expect(await storage.get(key)).toEqual(PAYLOAD);

      const download = await storage.presignDownload({
        key,
        expiresInSeconds: EXPIRES_IN_SECONDS,
        fileName: "récord final.txt",
      });
      const response = await fetch(download.url);
      expect(response.status).toBe(200);
      expect(new Uint8Array(await response.arrayBuffer())).toEqual(PAYLOAD);

      await storage.delete(key);
      expect(await storage.head(key)).toBeNull();
    });

    test("put and get round-trip arbitrary bytes", async () => {
      const key = newKey("bytes.bin");
      const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);
      await storage.put({ key, body: bytes, contentType: "image/png" });
      expect(await storage.get(key)).toEqual(bytes);
    });

    test("a PUT with another content type than the signed one is rejected", async () => {
      const key = newKey("wrong-type.txt");
      const upload = await storage.presignUpload({
        key,
        contentType: "image/png",
        size: PAYLOAD.byteLength,
        expiresInSeconds: EXPIRES_IN_SECONDS,
      });
      const put = await fetch(upload.url, {
        method: "PUT",
        headers: { "Content-Type": "text/html" },
        body: PAYLOAD,
      });
      expect(put.ok).toBe(false);
      expect(await storage.head(key)).toBeNull();
    });

    test("a PUT with another length than the signed one is rejected", async () => {
      const key = newKey("wrong-size.txt");
      const upload = await storage.presignUpload({
        key,
        contentType: "text/plain",
        size: PAYLOAD.byteLength + 10,
        expiresInSeconds: EXPIRES_IN_SECONDS,
      });
      const put = await fetch(upload.url, {
        method: "PUT",
        headers: upload.headers,
        body: PAYLOAD,
      });
      expect(put.ok).toBe(false);
      expect(await storage.head(key)).toBeNull();
    });

    test("head of a missing key is null and deleting it is not an error", async () => {
      const key = newKey("missing.txt");
      expect(await storage.head(key)).toBeNull();
      await storage.delete(key);
    });
  });

  // Best effort: the keys are random, so a leftover never collides with anything.
  test("contract cleanup", async () => {
    await Promise.all(keys.map((key) => storage.delete(key)));
  });
}
