import { describe, expect, test } from "bun:test";
import {
  canGenerateReport,
  countIncludedBlocks,
  describeReportPeriod,
  isReportKind,
} from "./report-builder";

const allBlocks = { summary: true, charts: true, movements: true };

describe("report builder helpers", () => {
  test("describes a date range in Spanish", () => {
    const range = { from: new Date(2026, 10, 1), to: new Date(2026, 10, 30) };
    expect(describeReportPeriod(range, "—")).toBe("1 – 30 nov 2026");
    expect(describeReportPeriod(undefined, "Sin rango")).toBe("Sin rango");
  });

  test("counts blocks and validates the form", () => {
    expect(countIncludedBlocks({ ...allBlocks, charts: false })).toBe(2);
    expect(canGenerateReport("Resumen", allBlocks, "PDF")).toBe(true);
    expect(canGenerateReport("ab", allBlocks, "PDF")).toBe(false);
    expect(
      canGenerateReport("Resumen", { summary: false, charts: false, movements: false }, "PDF"),
    ).toBe(false);
  });

  test("recognises template kinds from the query string", () => {
    expect(isReportKind("COMPARISON")).toBe(true);
    expect(isReportKind("DETAIL")).toBe(false);
    expect(isReportKind(null)).toBe(false);
  });
});
