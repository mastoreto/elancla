import { describe, expect, test } from "bun:test";
import { ministries } from "../data/ministries";
import { filterMinistries, summarizeMinistries } from "./ministry-list";

describe("ministry list utils", () => {
  test("summarizes volunteers and budgets per currency", () => {
    const totals = summarizeMinistries(ministries);
    expect(totals.volunteers).toBe(116);
    expect(totals.pesosBudget).toBe(125_000);
    expect(totals.dollarsBudget).toBe(1500);
  });

  test("filters by search text and scope", () => {
    expect(filterMinistries(ministries, { search: "misiones", scope: "all" })).toHaveLength(1);
    expect(filterMinistries(ministries, { search: "", scope: "noBudget" })).toHaveLength(0);
    expect(filterMinistries(ministries, { search: "ana", scope: "withLeader" })[0]?.id).toBe(
      "adoracion",
    );
  });
});
