import { describe, expect, test } from "bun:test";
import { describeTimeRemaining, formatProjectPeriod } from "./project-period";

describe("formatProjectPeriod", () => {
  test("spans of whole months use month names", () => {
    expect(formatProjectPeriod("2026-01-01", "2026-12-31")).toBe("ene – dic 2026");
    expect(formatProjectPeriod("2025-07-01", "2026-03-31")).toBe("jul 2025 – mar 2026");
    expect(formatProjectPeriod("2026-07-01", "2026-07-31")).toBe("jul 2026");
  });

  test("partial months keep the days", () => {
    expect(formatProjectPeriod("2026-06-01", "2026-06-15")).toBe("1 – 15 jun 2026");
  });
});

describe("describeTimeRemaining", () => {
  const today = new Date("2026-11-18T12:00:00");

  test("counts weeks to the end date", () => {
    expect(describeTimeRemaining("2026-12-31", today)).toBe("Faltan 6 semanas");
  });

  test("past end dates read as finished", () => {
    expect(describeTimeRemaining("2026-03-31", today)).toBe("Finalizó hace 33 semanas");
  });
});
