import { describe, expect, test } from "bun:test";
import { resolveInvitationStatus } from "./invitationStatus";

const now = new Date("2026-06-01T00:00:00Z");
const future = new Date("2026-06-08T00:00:00Z");
const past = new Date("2026-05-01T00:00:00Z");

describe("resolveInvitationStatus", () => {
  test("pending until it expires", () => {
    expect(
      resolveInvitationStatus(
        { acceptedAt: null, revokedAt: null, expiresAt: future },
        now,
      ),
    ).toBe("pending");
    expect(
      resolveInvitationStatus(
        { acceptedAt: null, revokedAt: null, expiresAt: past },
        now,
      ),
    ).toBe("expired");
  });

  test("accepted wins over revoked, revoked wins over expired", () => {
    expect(
      resolveInvitationStatus(
        { acceptedAt: past, revokedAt: past, expiresAt: past },
        now,
      ),
    ).toBe("accepted");
    expect(
      resolveInvitationStatus(
        { acceptedAt: null, revokedAt: past, expiresAt: past },
        now,
      ),
    ).toBe("revoked");
  });
});
