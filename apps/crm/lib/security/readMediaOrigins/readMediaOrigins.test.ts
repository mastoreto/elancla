import { describe, expect, test } from "bun:test";
import { readMediaOrigins } from "./readMediaOrigins";

describe("readMediaOrigins", () => {
  test("reduces the variables to bare origins", () => {
    expect(
      readMediaOrigins({
        S3_PRESIGN_ENDPOINT: "http://localhost:9000/",
        S3_ENDPOINT: "http://s3:9000",
        MEDIA_PUBLIC_BASE_URL: "http://localhost:9000/ancla-public",
      }),
    ).toEqual({
      uploadOrigin: "http://localhost:9000",
      mediaOrigin: "http://localhost:9000",
    });
  });

  test("the upload origin falls back to the API endpoint", () => {
    expect(readMediaOrigins({ S3_ENDPOINT: "https://s3.example.org/x" }).uploadOrigin).toBe(
      "https://s3.example.org",
    );
  });

  test("missing or malformed values give no origin", () => {
    expect(readMediaOrigins({})).toEqual({ uploadOrigin: undefined, mediaOrigin: undefined });
    expect(readMediaOrigins({ MEDIA_PUBLIC_BASE_URL: "not a url" }).mediaOrigin).toBeUndefined();
  });
});
