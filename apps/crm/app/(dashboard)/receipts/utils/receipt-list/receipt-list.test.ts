import { describe, expect, test } from "bun:test";
import type { Receipt } from "../../types";
import { filterReceipts, formatLongDate, formatShortDate } from "./receipt-list";

const receipts: Receipt[] = [
  {
    id: "1",
    number: "B-1",
    provider: "Papelería",
    amount: 10,
    currency: "UYU",
    date: new Date("2026-03-15T00:00:00"),
    relatedEntity: "x",
  },
  {
    id: "2",
    number: "B-2",
    provider: "Sonido",
    amount: 5,
    currency: "USD",
    date: new Date("2026-03-04T00:00:00"),
    relatedEntity: "y",
  },
];

describe("filterReceipts", () => {
  test("sorts oldest first as the board lists them", () => {
    expect(filterReceipts(receipts, { searchQuery: "", currency: "all" }).map((r) => r.id)).toEqual(
      ["2", "1"],
    );
  });

  test("matches by number or provider and by currency", () => {
    expect(filterReceipts(receipts, { searchQuery: "sonido", currency: "all" })).toHaveLength(1);
    expect(filterReceipts(receipts, { searchQuery: "b-1", currency: "all" })).toHaveLength(1);
    expect(filterReceipts(receipts, { searchQuery: "", currency: "USD" })).toHaveLength(1);
  });
});

describe("date formatting", () => {
  test("writes short and long Spanish dates", () => {
    expect(formatShortDate(receipts[1].date)).toBe("4 mar");
    expect(formatLongDate(receipts[1].date)).toBe("4 mar 2026");
  });
});
