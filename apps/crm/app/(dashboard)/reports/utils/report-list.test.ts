import { describe, expect, test } from "bun:test";
import { generatedReports } from "../data/report-seeds";
import { countReportsByTab, filterReports } from "./report-list";

describe("report list helpers", () => {
  test("counts reports per tab", () => {
    expect(countReportsByTab(generatedReports, 3)).toEqual({
      generated: 4,
      pending: 1,
      catalog: 3,
    });
  });

  test("filters by tab and search text", () => {
    expect(filterReports(generatedReports, { search: "", tab: "generated" })).toHaveLength(4);
    expect(filterReports(generatedReports, { search: "", tab: "pending" })).toHaveLength(1);
    const found = filterReports(generatedReports, { search: "misiones", tab: "generated" });
    expect(found.map((report) => report.id)).toEqual(["movimientos-misiones"]);
  });
});
