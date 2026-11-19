import { describe, expect, test } from "bun:test";
import { REDACTED, redact } from "./redact";

describe("redact", () => {
  test("hides secrets at any depth, whatever the key casing", () => {
    expect(
      redact({
        name: "Tesorero",
        Password: "hunter2",
        nested: [{ tokenHash: "abc", keep: 1 }],
        backupCodes: ["1", "2"],
      }),
    ).toEqual({
      name: "Tesorero",
      Password: REDACTED,
      nested: [{ tokenHash: REDACTED, keep: 1 }],
      backupCodes: REDACTED,
    });
  });

  test("keeps codes that are not secrets and serializes dates", () => {
    const at = new Date("2026-11-19T10:00:00.000Z");
    expect(redact({ code: "MOV-2026-000123", currency: "UYU", at })).toEqual({
      code: "MOV-2026-000123",
      currency: "UYU",
      at: "2026-11-19T10:00:00.000Z",
    });
  });
});
