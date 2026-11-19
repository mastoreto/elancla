import { describe, expect, test } from "bun:test";
import { auditSourceForCli, auditSourceFromHeaders } from "./auditSource";

const ORGANIZATION_ID = "01900000-0000-7000-8000-000000000001";

describe("auditSource", () => {
  test("reads request id, address and user agent from raw headers", () => {
    const headers = new Headers({
      "x-request-id": "req-1",
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      "user-agent": "test-agent",
    });
    expect(
      auditSourceFromHeaders(headers, ORGANIZATION_ID, {
        id: null,
        label: "a@example.test",
      }),
    ).toEqual({
      organizationId: ORGANIZATION_ID,
      actor: { id: null, label: "a@example.test" },
      requestId: "req-1",
      ip: "203.0.113.7",
      userAgent: "test-agent",
    });
  });

  test("missing headers become nulls, never a placeholder", () => {
    const source = auditSourceFromHeaders(undefined, ORGANIZATION_ID, null);
    expect([source.requestId, source.ip, source.userAgent]).toEqual([
      null,
      null,
      null,
    ]);
  });

  test("the CLI is an actor without a user id", () => {
    expect(auditSourceForCli(ORGANIZATION_ID).actor).toEqual({
      id: null,
      label: "cli",
    });
  });
});
