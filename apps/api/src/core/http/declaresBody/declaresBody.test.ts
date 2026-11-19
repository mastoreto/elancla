import { describe, expect, test } from "bun:test";
import { declaresBody } from "./declaresBody";

describe("declaresBody", () => {
  test("no length, transfer encoding nor media type means no body (a browser DELETE)", () => {
    expect(declaresBody(new Headers())).toBe(false);
  });

  test("Content-Length: 0 means no body, whatever the media type", () => {
    expect(
      declaresBody(
        new Headers({ "content-length": "0", "content-type": "text/plain" }),
      ),
    ).toBe(false);
  });

  test("a length, a chunked transfer or a media type declares a body", () => {
    expect(declaresBody(new Headers({ "content-length": "3" }))).toBe(true);
    expect(declaresBody(new Headers({ "transfer-encoding": "chunked" }))).toBe(
      true,
    );
    expect(
      declaresBody(
        new Headers({ "content-type": "application/x-www-form-urlencoded" }),
      ),
    ).toBe(true);
  });
});
