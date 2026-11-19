import { describe, expect, test } from "bun:test";
import { ACCESS_HEADER } from "@/lib/authz/accessHeader";
import { buildRequestHeaders } from "./buildRequestHeaders";

describe("buildRequestHeaders", () => {
  test("drops an access header sent by the client", () => {
    const incoming = new Headers({ [ACCESS_HEADER]: "eyJpc0FkbWluIjp0cnVlfQ==", cookie: "a=b" });
    const headers = buildRequestHeaders({ incoming, nonce: "n", contentSecurityPolicy: "csp" });
    expect(headers.get(ACCESS_HEADER)).toBeNull();
    expect(headers.get("cookie")).toBe("a=b");
  });

  test("sets the nonce and the CSP the page reads", () => {
    const headers = buildRequestHeaders({
      incoming: new Headers(),
      nonce: "abc",
      contentSecurityPolicy: "script-src 'nonce-abc'",
    });
    expect(headers.get("x-nonce")).toBe("abc");
    expect(headers.get("content-security-policy")).toBe("script-src 'nonce-abc'");
  });
});
