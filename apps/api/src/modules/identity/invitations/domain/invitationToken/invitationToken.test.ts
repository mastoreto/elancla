import { describe, expect, test } from "bun:test";
import {
  generateInvitationToken,
  hashInvitationToken,
  INVITATION_TTL_DAYS,
  invitationExpiry,
} from "./invitationToken";

describe("invitation token", () => {
  test("is 32 random bytes in URL-safe base64 and never repeats", () => {
    const token = generateInvitationToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateInvitationToken()).not.toBe(token);
  });

  test("hashes to a stable SHA-256 hex digest that is not the token", () => {
    const hash = hashInvitationToken("abc");
    expect(hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(hashInvitationToken("abc")).toBe(hash);
  });

  test("expires after the configured number of days", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(invitationExpiry(now).getTime() - now.getTime()).toBe(
      INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
  });
});
