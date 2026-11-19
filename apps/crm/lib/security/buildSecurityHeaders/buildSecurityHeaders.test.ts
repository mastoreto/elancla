import { describe, expect, test } from "bun:test";
import { buildSecurityHeaders } from "./buildSecurityHeaders";

const base = { nonce: "abc123", pathname: "/dashboard", isDevelopment: false };

describe("buildSecurityHeaders", () => {
  test("builds a nonce-based CSP that forbids framing", () => {
    const csp = buildSecurityHeaders(base)["Content-Security-Policy"] as string;
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  test("allows eval and skips upgrade-insecure-requests only in development", () => {
    const csp = buildSecurityHeaders({ ...base, isDevelopment: true })[
      "Content-Security-Policy"
    ] as string;
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  test("enables geolocation only on /informe", () => {
    const policy = (pathname: string) =>
      buildSecurityHeaders({ ...base, pathname })["Permissions-Policy"];
    expect(policy("/informe/abc")).toContain("geolocation=(self)");
    expect(policy("/informe")).toContain("geolocation=(self)");
    expect(policy("/informes-falsos")).toContain("geolocation=()");
    expect(policy("/dashboard")).toContain("geolocation=()");
  });

  test("sets the fixed hardening headers", () => {
    const headers = buildSecurityHeaders(base);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["X-Robots-Tag"]).toBe("noindex");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
  });
});
