import { describe, expect, test } from "bun:test";
import { auditHref, readAuditFilters, toApiQuery } from "./audit-filters";

describe("readAuditFilters", () => {
  test("keeps valid values and drops malformed ones", () => {
    expect(
      readAuditFilters({
        action: "role.created",
        outcome: "maybe",
        from: "2026-11-01",
        to: "yesterday",
        actor: "  ana  ",
      }),
    ).toEqual({
      action: "role.created",
      outcome: undefined,
      actor: "ana",
      from: "2026-11-01",
      to: undefined,
      cursor: undefined,
    });
  });

  test("takes the first of a repeated parameter", () => {
    expect(readAuditFilters({ action: ["a", "b"] }).action).toBe("a");
  });
});

describe("toApiQuery", () => {
  test("turns whole days into a UTC range and omits what is empty", () => {
    expect(toApiQuery({ from: "2026-11-01", to: "2026-11-02", outcome: "denied" }, 25)).toEqual({
      limit: "25",
      outcome: "denied",
      from: "2026-11-01T00:00:00.000Z",
      to: "2026-11-02T23:59:59.999Z",
    });
  });
});

describe("auditHref", () => {
  test("keeps the filters and adds the cursor", () => {
    expect(auditHref("/settings/audit", { actor: "ana", outcome: "denied" }, "abc")).toBe(
      "/settings/audit?actor=ana&outcome=denied&cursor=abc",
    );
  });

  test("is the bare path with no filters", () => {
    expect(auditHref("/settings/audit", {})).toBe("/settings/audit");
  });
});
