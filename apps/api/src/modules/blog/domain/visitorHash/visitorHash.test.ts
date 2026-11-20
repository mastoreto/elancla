import { describe, expect, test } from "bun:test";
import { visitorHash } from "./visitorHash";

const base = {
  secret: "s".repeat(32),
  day: "2026-05-01",
  ip: "203.0.113.7",
  userAgent: "Mozilla/5.0",
};

describe("visitorHash", () => {
  test("is a stable 64-char hex digest", () => {
    expect(visitorHash(base)).toMatch(/^[0-9a-f]{64}$/);
    expect(visitorHash(base)).toBe(visitorHash({ ...base }));
  });

  test("changes with the day, the ip, the user agent and the secret", () => {
    const hash = visitorHash(base);
    expect(visitorHash({ ...base, day: "2026-05-02" })).not.toBe(hash);
    expect(visitorHash({ ...base, ip: "203.0.113.8" })).not.toBe(hash);
    expect(visitorHash({ ...base, userAgent: "Safari" })).not.toBe(hash);
    expect(visitorHash({ ...base, secret: "t".repeat(32) })).not.toBe(hash);
  });

  test("does not contain the ip or the user agent", () => {
    expect(visitorHash(base)).not.toContain("203");
  });
});
